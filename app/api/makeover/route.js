import { NextResponse } from "next/server";

export const maxDuration = 60;

const STYLE_PROMPTS = {
  "Cozy Gaming & RGB Desk Setup":
    "Renovate this exact room into a luxury cozy RGB gaming setup while keeping the exact room walls, window frame, doorway, ceiling, and furniture positions unchanged. Replace the desk with a sleek matte-black carbon-fiber gaming desk with glowing cyan and magenta under-desk neon strips, a curved gaming monitor, tempered-glass RGB PC tower, mechanical RGB keyboard, studio speakers, and a black ergonomic racing gaming chair. Add dark walnut acoustic wood-slat wall panels, glowing hexagonal RGB wall lights, floating shelves with mini plants, dark sleek window blinds, rich walnut hardwood floor, and warm ambient lighting. Razor-sharp architectural interior photography, 8k UHD.",

  "Modern Luxury Aesthetic":
    "Renovate this exact room into a 5-star modern luxury designer workspace while keeping the exact room walls, window frame, doorway, and furniture positions unchanged. Replace the desk with a bespoke fluted walnut and brushed-brass executive desk with warm golden under-desk LED cove lighting, sleek aluminum monitor, and cognac-leather designer ergonomic chair. Upgrade walls with warm greige plaster, subtle brass trim molding, framed minimalist gallery art, sheer linen curtains over blackout shades, wide-plank European oak hardwood floor, cream boucle rug, and a fiddle-leaf fig plant. Razor-sharp Architectural Digest photography, 8k UHD.",

  "Minimalist Scandinavian":
    "Renovate this exact room into a bright, serene Scandinavian Nordic workspace while keeping the exact room walls, window frame, doorway, and furniture positions unchanged. Replace the desk with a solid light-ash wood minimalist desk, clean white-and-silver monitor setup, warm minimalist task lamp, and a white molded ergonomic Nordic chair with oak legs. Paint walls warm matte off-white with light-oak vertical slats, floating birch shelves with ceramic vases and trailing pothos plants, white linen Roman blinds, pale ash hardwood floor, woven jute rug, and a snake plant. Soft diffused daylight, razor-sharp 8k UHD.",

  "Cyberpunk Neon Studio":
    "Renovate this exact room into a futuristic Cyberpunk Neon Creator Studio while keeping the exact room walls, window frame, doorway, and furniture positions unchanged. Install a heavy matte-black industrial tech desk with electric-blue and hot-pink neon edge lighting, dual curved monitors, boom-arm microphone, liquid-cooled RGB PC tower, and futuristic ergonomic gaming chair. Add dark geometric acoustic wall tiles, vertical cyan and magenta neon light tubes, dark metallic window blinds with neon rim glow, and dark slate tile flooring with a neon-accented rug. Razor-sharp cinematic lighting, 8k UHD.",

  "Warm Japandi & Wood Aesthetic":
    "Renovate this exact room into a tranquil Japandi interior workspace while keeping the exact room walls, window frame, doorway, and furniture positions unchanged. Replace the desk with a handcrafted dark-stained oak desk with warm hidden LED lighting, curved solid-wood and woven-cane ergonomic chair with linen cushion, clean dark-bezel monitor, and matte-black minimalist lamp. Finish walls in textured warm beige limewash plaster with vertical cedar wood slats, framed Japanese art, natural woven bamboo window shades, warm oak plank flooring, neutral wool rug, and an indoor olive tree. Razor-sharp 8k UHD."
};

async function uploadTempImage(buffer, mimeType) {
  const blob = new Blob([buffer], { type: mimeType || "image/jpeg" });

  try {
    const fd1 = new FormData();
    fd1.append("reqtype", "fileupload");
    fd1.append("fileToUpload", blob, "room.jpg");
    const res1 = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      headers: { "User-Agent": "Mozilla/5.0" },
      body: fd1
    });
    if (res1.ok) {
      const url1 = (await res1.text()).trim();
      if (url1.startsWith("https://files.catbox.moe/")) return url1;
    }
  } catch (_) {}

  try {
    const fd2 = new FormData();
    fd2.append("files[]", blob, "room.jpg");
    const res2 = await fetch("https://uguu.se/upload", {
      method: "POST",
      headers: { "User-Agent": "Mozilla/5.0" },
      body: fd2
    });
    if (res2.ok) {
      const json2 = await res2.json();
      const url2 = json2?.files?.[0]?.url;
      if (url2) return url2;
    }
  } catch (_) {}

  return null;
}

export async function POST(req) {
  try {
    const { imageBase64, mimeType, style } = await req.json();
    const rawKey = process.env.POLLINATIONS_API_KEY || "";
    const apiKey = rawKey.replace(/['"\s]/g, "");

    if (!apiKey) {
      return NextResponse.json({ error: "POLLINATIONS_API_KEY missing in Vercel" }, { status: 500 });
    }

    const buffer = Buffer.from(imageBase64, "base64");
    const seed = Math.floor(Math.random() * 1000000);

    const tempImageUrl = await uploadTempImage(buffer, mimeType);
    if (!tempImageUrl) {
      return NextResponse.json({ error: "Image upload host busy. Please try again." }, { status: 500 });
    }

    const detailedPrompt =
      STYLE_PROMPTS[style] ||
      `Renovate this exact room into a ${style} while keeping the exact room walls, window frame, doorway, and furniture positions unchanged. Upgrade the desk, chair, curtains, wall finishes, floor, and lighting with high-end designer furniture, plants, and warm architectural LED lighting. Razor-sharp 8k UHD interior photography.`;

    const origin = req.headers.get("origin") || "https://room-makeover-ai-nu.vercel.app";

    // Strict Kontext Image-to-Image at HD 1536x1152 resolution (never switches room layout)
    const apiUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(detailedPrompt)}?model=kontext&image=${encodeURIComponent(tempImageUrl)}&width=1536&height=1152&nologo=true&enhance=true&seed=${seed}`;

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Origin: origin,
        Referer: `${origin}/`,
        "User-Agent": "Mozilla/5.0"
      }
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.startsWith("image/")) {
      const arr = await res.arrayBuffer();
      return NextResponse.json({ resultImage: `data:image/jpeg;base64,${Buffer.from(arr).toString("base64")}` });
    }

    const errText = (await res.text()).slice(0, 160);
    return NextResponse.json({ error: `Kontext (${res.status}): ${errText}` }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
