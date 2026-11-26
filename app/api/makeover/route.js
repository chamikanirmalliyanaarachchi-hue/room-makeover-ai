import { NextResponse } from "next/server";

export const maxDuration = 60;

const STYLE_PROMPTS = {
  "Cozy Gaming & RGB Desk Setup":
    "Interior renovation of this exact room photo, keeping every wall, window, doorway, ceiling beam, and furniture position in the exact same place and camera angle. Transform the existing setup into a viral luxury cozy RGB gaming room: replace the desk with a sleek matte-black carbon-fiber gaming desk with glowing cyan and magenta under-desk neon LED strips, upgrade the computer setup with a tempered-glass RGB gaming PC tower, wide curved gaming monitor, mechanical RGB keyboard, oversized glowing desk mat, studio speakers, and a plush black ergonomic racing gaming chair. Upgrade the plain walls with dark walnut vertical acoustic wood-slat panels, glowing hexagonal Nanoleaf RGB wall light panels, and floating wooden shelves with mini plants. Replace old curtains with dark sleek blinds, upgrade the floor to rich dark walnut hardwood with a soft geometric rug, and add warm ambient lighting and indoor plants. Shot on Sony A7R V, crisp HDR studio lighting, 8k photorealistic interior design.",

  "Modern Luxury Aesthetic":
    "Interior renovation of this exact room photo, keeping every wall, window, doorway, and furniture position in the exact same place and camera perspective. Transform the space into a 5-star Architectural Digest modern luxury workspace: replace the desk with a bespoke fluted walnut and brushed-brass executive desk with concealed warm 3000K golden LED cove lighting, a sleek aluminum workstation monitor, wireless keyboard, and a cognac-leather designer ergonomic office chair. Refinish the walls in warm greige Venetian plaster with subtle vertical wood trim molding and framed minimalist gallery art. Replace old curtains with sheer linen drapes over sleek blackout shades, and upgrade the floor to wide-plank European oak hardwood with a plush cream boucle rug and a sculptural fiddle-leaf fig plant. Shot on Sony A7R V, soft golden-hour daylight and warm accent lamps, 8k photorealistic.",

  "Minimalist Scandinavian":
    "Interior renovation of this exact room photo, keeping every wall, window, doorway, and furniture position in the exact same place and camera perspective. Transform the room into a bright, serene Scandinavian Nordic workspace: replace the desk with a solid light-ash wood minimalist desk, clean white-and-silver monitor setup, warm minimalist desk lamp, and a white molded Nordic ergonomic chair with light oak legs. Paint walls in warm matte off-white with natural light-oak vertical slats and floating birch shelves holding white ceramic vases, books, and trailing pothos plants. Replace curtains with crisp white linen Roman blinds diffusing soft natural daylight, and upgrade the floor to pale Scandinavian ash planks with a woven natural jute rug and indoor snake plant. Shot on Sony A7R V, soft diffused daylight, 8k photorealistic.",

  "Cyberpunk Neon Studio":
    "Interior renovation of this exact room photo, keeping every wall, window, doorway, and furniture position in the exact same place and camera perspective. Overhaul the space into a futuristic Cyberpunk Neon Creator Studio: install a heavy matte-black industrial tech desk with dual-tier monitor riser, glowing electric-blue and hot-pink neon edge lighting, dual curved monitors, studio boom-arm microphone, stream deck, liquid-cooled RGB PC tower, and a futuristic ergonomic mesh gaming chair. Cladding the walls in dark geometric acoustic tiles, vertical cyan and magenta neon light tubes, and floating tech shelves. Replace curtains with dark metallic Venetian blinds bathed in neon rim light, and upgrade the floor to dark slate tiles with a neon-trimmed studio mat. Shot on Sony A7R V, cinematic reflections, 8k photorealistic.",

  "Warm Japandi & Wood Aesthetic":
    "Interior renovation of this exact room photo, keeping every wall, window, doorway, and furniture position in the exact same place and camera perspective. Rebuild the space with tranquil Japandi craftsmanship: replace the desk with a handcrafted dark-stained oak desk with warm hidden LED cove lighting, a curved solid-wood and woven-cane ergonomic chair with linen cushion, clean dark-bezel monitor, walnut wrist rest, and matte-black minimalist lamp. Refinish walls in textured warm beige limewash plaster with vertical cedar wood slats and framed Japanese sumi-e artwork. Replace curtains with natural woven bamboo shades filtering warm golden sunlight, and upgrade the floor to warm natural oak planks with a neutral wool rug and an indoor olive tree in a terracotta pot. Shot on Sony A7R V, peaceful organic shadows, 8k photorealistic."
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
      `Interior renovation of this exact room photo, keeping every wall, window, doorway, and furniture position in the exact same place and camera angle. Transform the space into a ${style} with high-end designer furniture, rich wall textures, plants, and warm architectural LED lighting, shot on Sony A7R V, 8k photorealistic.`;

    const origin = req.headers.get("origin") || "https://room-makeover-ai-nu.vercel.app";

    // Kontext first for 100% strict spatial/architecture preservation, Seedream/GPT-Image as backup
    const endpoints = [
      `https://gen.pollinations.ai/image/${encodeURIComponent(detailedPrompt)}?model=kontext&image=${encodeURIComponent(tempImageUrl)}&width=1024&height=768&nologo=true&seed=${seed}`,
      `https://gen.pollinations.ai/image/${encodeURIComponent(detailedPrompt)}?model=seedream&image=${encodeURIComponent(tempImageUrl)}&width=1024&height=768&nologo=true&seed=${seed}`
    ];

    let lastStatus = 500;
    let lastMsg = "Busy";

    for (const url of endpoints) {
      const res = await fetch(url, {
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

      lastStatus = res.status;
      lastMsg = (await res.text()).slice(0, 140);
    }

    return NextResponse.json(
      { error: `Image-to-Image (${lastStatus}): ${lastMsg}` },
      { status: 500 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
