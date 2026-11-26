import { NextResponse } from "next/server";

export const maxDuration = 60;

const STYLE_PROMPTS = {
  "Cozy Gaming & RGB Desk Setup":
    "Shot on Sony A7R V 24mm f/1.4 GM, Architectural Digest & Pinterest viral pro-gamer studio makeover. Keep the exact camera angle, room walls, window frame, and doorway geometry from this photo, but completely renovate every surface into a high-end luxury RGB gaming room: Upgrade the left plain wall with dark walnut vertical acoustic wood-slat panels and a sleek warm-purple recessed LED light bar. Replace the desk with a thick matte-black carbon-fiber gaming desk with vibrant under-desk cyan and magenta neon glow, an ultra-wide curved OLED gaming monitor with crisp neon wallpaper, a tempered-glass RGB PC tower with glowing liquid-cooled fans, custom mechanical RGB keyboard, wireless mouse on an oversized glowing desk mat, studio monitor speakers, and a luxury black ergonomic gaming chair. Install floating walnut shelves with mini potted plants and hexagonal Nanoleaf RGB light panels around the window area with dark sleek blinds. Upgrade the floor to rich dark herringbone hardwood with a plush geometric rug, warm ambient lighting, and indoor monstera plants near the doorway. Ultra-detailed textures, natural ray-traced reflections, HDR studio lighting, 8k photorealistic.",

  "Modern Luxury Aesthetic":
    "Shot on Sony A7R V 24mm f/1.4 GM, Architectural Digest 5-star modern luxury room renovation. Preserve the exact room structure, camera perspective, window position, and doorway layout from this photo, while transforming every surface into an ultra-luxurious designer workspace: Cladding the left wall in warm textured Venetian plaster with subtle brushed-brass trim molding and minimalist framed gallery art. Replace the desk with a bespoke fluted walnut and marble-top executive desk featuring concealed warm 3000K golden LED cove lighting, a sleek aluminum workstation monitor, wireless keyboard, and a cognac-leather designer lounge office chair. Replace curtains with floor-to-ceiling sheer linen drapes over motorized blackout shades. Upgrade the floor to wide-plank European oak hardwood with a plush cream boucle area rug and a tall sculptural fiddle-leaf fig plant in a ceramic planter by the doorway. Soft golden-hour sunlight mixed with warm ambient lamps, ultra-realistic shadows, 8k interior design photography.",

  "Minimalist Scandinavian":
    "Shot on Sony A7R V 24mm f/1.4 GM, Kinfolk & Nordic interior design magazine renovation. Keep the exact room geometry, camera angle, window frame, and doorway from this photo, transforming all surfaces into a serene, bright Scandinavian workspace: Paint walls in warm matte alabaster white with light natural oak vertical slats on the left wall and floating birch shelves holding white ceramic vases, art books, and trailing pothos plants. Install a solid light-ash wood minimalist desk with a clean white-and-silver monitor setup, warm minimalist task lamp, and a molded white Nordic ergonomic chair with light oak legs and sheepskin throw. Replace curtains with crisp white linen Roman blinds diffusing soft natural daylight across the room. Upgrade the floor to pale Scandinavian ash planks with a woven natural jute rug and a lush snake plant in a woven basket near the doorway. Soft diffused daylight, clean organic textures, 8k photorealistic.",

  "Cyberpunk Neon Studio":
    "Shot on Sony A7R V 24mm f/1.4 GM, futuristic Cyberpunk Neon Creator Studio transformation. Keep the exact room layout, camera perspective, window frame, and doorway from this photo, overhauling every surface into a high-tech sci-fi streaming studio: Install dark geometric acoustic wall panels on the left wall with vertical electric-cyan and hot-pink neon light tubes. Upgrade the desk to a heavy matte-black industrial tech desk with dual-tier monitor riser, dual curved monitors, studio boom-arm microphone, stream deck, liquid-cooled RGB PC tower, and a futuristic ergonomic mesh gaming throne. Install dark metallic Venetian blinds on the window bathed in dramatic magenta and cyan rim lighting, and upgrade the floor to dark slate tiles with a neon-trimmed studio rug. Cinematic reflections, rich contrast, razor-sharp 8k photorealistic render.",

  "Warm Japandi & Wood Aesthetic":
    "Shot on Sony A7R V 24mm f/1.4 GM, tranquil Japandi (Japanese-Scandinavian) interior renovation. Preserve the exact camera angle, window position, and doorway layout from this photo, rebuilding every detail with warm organic craftsmanship: Finish the walls in textured warm beige limewash plaster with vertical cedar wood slats on the left wall and a minimalist framed Japanese sumi-e artwork. Install a handcrafted dark-stained oak desk with warm hidden LED cove lighting, a curved solid-wood and woven-cane ergonomic chair with linen cushion, clean dark-bezel monitor, walnut wrist rest, and matte-black minimalist lamp. Replace curtains with natural woven bamboo shades filtering soft golden sunlight. Upgrade the floor to warm natural oak planks with a textured neutral wool rug and an indoor olive tree in a terracotta pot near the doorway. Peaceful organic shadows, 8k Architectural Digest photography."
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
      `Shot on Sony A7R V 24mm f/1.4 GM, complete dramatic interior renovation of this room into a ${style}. Keep the exact camera angle, window frame, and doorway layout from the original photo, but completely replace the desk, chair, curtains, wall finishes, floor, and lighting with high-end designer furniture, rich textures, plants, and warm architectural LED lighting, 8k photorealistic interior design photography.`;

    const origin = req.headers.get("origin") || "https://room-makeover-ai-nu.vercel.app";

    // Priority chain: Flagship GPT-Image / Seedream first for ultra-realism, Flux Kontext as reliable backup
    const endpoints = [
      `https://gen.pollinations.ai/image/${encodeURIComponent(detailedPrompt)}?model=gptimage&image=${encodeURIComponent(tempImageUrl)}&width=1024&height=768&nologo=true&seed=${seed}`,
      `https://gen.pollinations.ai/image/${encodeURIComponent(detailedPrompt)}?model=seedream&image=${encodeURIComponent(tempImageUrl)}&width=1024&height=768&nologo=true&seed=${seed}`,
      `https://gen.pollinations.ai/image/${encodeURIComponent(detailedPrompt)}?model=kontext&image=${encodeURIComponent(tempImageUrl)}&width=1024&height=768&nologo=true&seed=${seed}`
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
