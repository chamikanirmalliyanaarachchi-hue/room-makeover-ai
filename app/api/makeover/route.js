import { NextResponse } from "next/server";

export const maxDuration = 60;

const STYLE_PROMPTS = {
  "Cozy Gaming & RGB Desk Setup":
    "Complete luxury pro-gamer bedroom studio transformation. Keep the exact camera perspective, left computer corner, barred window frame, and right doorway architecture from the original photo, but dramatically renovate every single surface and object into a viral Pinterest-worthy cozy RGB gaming setup: Replace the desk with a wide matte-black carbon-fiber gaming desk featuring vibrant under-desk neon cyan and warm magenta LED light strips. Upgrade the PC setup with a sleek tempered-glass RGB gaming PC tower with glowing fans, an ultra-wide curved gaming monitor with vibrant wallpaper, a custom mechanical RGB keyboard, wireless gaming mouse on an oversized glowing desk mat, studio speakers, and a headset stand. Replace the plastic chair with a plush black-and-accent ergonomic racing gaming chair. Transform the plain left and center walls with dark charcoal vertical wood-slat acoustic panels, glowing hexagonal Nanoleaf RGB wall light panels, and floating wooden wall shelves holding small potted plants, LED light bars, and minimalist gaming collectibles. Replace the old orange curtain and wall calendar with sleek dark charcoal pleated window blinds with warm backlight glow. Upgrade the flooring to rich dark walnut hardwood planks with a soft geometric gaming rug, and add a lush potted monstera plant and warm ambient floor lamp near the doorway. Crisp architectural photography, vibrant HDR neon-and-warm cozy lighting, 8k photorealistic interior design.",

  "Modern Luxury Aesthetic":
    "Complete high-end Architectural Digest modern luxury room makeover. Keep the exact camera perspective, left desk placement, window frame, and right doorway layout from the original photo, but renovate all surfaces into a 5-star boutique designer workspace: Replace the old desk with a bespoke fluted walnut and brushed-brass executive desk with concealed warm 3000K architectural LED strip lighting. Upgrade the chair to a cognac-leather and matte-black designer ergonomic lounge office chair. Upgrade the computer setup with a sleek minimalist aluminum workstation monitor, wireless low-profile keyboard, designer brass desk lamp, and clean cable-free aesthetic. Replace the orange curtain and calendar with floor-to-ceiling sheer linen drapes layered over motorized blackout shades. Refinish the walls in warm greige Venetian plaster with subtle vertical wood trim molding and framed minimalist abstract gallery art. Upgrade the floor to wide-plank light oak herringbone hardwood with a plush cream textured wool area rug, and place a tall sculptural fiddle-leaf fig plant in a ceramic planter by the doorway. Soft natural daylight mixed with warm golden accent lighting, 8k ultra-photorealistic interior photography.",

  "Minimalist Scandinavian":
    "Complete bright and airy Scandinavian Nordic room renovation. Keep the exact camera angle, left desk corner, window position, and right doorway structure from the original photo, but transform every element into a clean, serene Nordic workspace: Replace the desk with a solid light birch-wood minimalist desk with clean white legs and warm under-shelf task lighting. Replace the plastic chairs with a white molded ergonomic Nordic desk chair with light oak legs and a soft sheepskin throw. Upgrade the computer area with a clean white-and-silver minimal monitor setup, tidy wooden desk organizer, ceramic mug, and warm minimalist desk lamp. Remove the orange curtain and calendar, installing crisp white linen Roman blinds that let soft diffused daylight fill the room. Repaint the walls in soft warm off-white matte finish with light natural pine floating shelves holding white ceramic vases, books, and trailing pothos plants. Upgrade the floor to pale Scandinavian ash wood planks with a woven beige jute rug and a lush indoor snake plant in a woven basket near the doorway. Bright, peaceful, natural soft shadows, 8k photorealistic interior design.",

  "Cyberpunk Neon Studio":
    "Complete futuristic Cyberpunk Neon Creator Studio transformation. Keep the exact camera angle, left PC corner, barred window frame, and right doorway geometry from the original photo, but overhaul the entire room into a high-tech sci-fi streaming and gaming studio: Install a heavy matte-black industrial tech desk with dual-tier monitor riser, glowing electric-blue and hot-pink neon edge lighting, dual monitors, studio boom-arm microphone, stream deck, and liquid-cooled RGB PC tower. Replace the chair with a futuristic black-and-neon ergonomic mesh gaming throne. Cladding the walls in dark metallic acoustic foam tiles, vertical cyberpunk neon light tubes, custom glowing LED wall signage, and dark metal grid shelves with tech gadgets. Replace the curtain with dark metallic Venetian blinds bathed in dramatic magenta and cyan rim light. Upgrade the floor to dark slate tiles with a geometric neon-accented studio mat. Moody cinematic reflections, rich contrast, razor-sharp 8k photorealistic render.",

  "Warm Japandi & Wood Aesthetic":
    "Complete tranquil Japandi (Japanese-Scandinavian) room transformation. Keep the exact room layout, left desk position, window frame, and right doorway architecture from the original photo, but rebuild every detail with natural organic craftsmanship: Replace the desk with a handcrafted dark-stained oak slatted desk with warm hidden LED cove lighting. Replace the chair with a curved Japanese-style solid wood and woven-cane ergonomic chair with a linen cushion. Upgrade the computer setup to a clean, clutter-free dark-bezel monitor, walnut wrist rest, matte-black minimalist lamp, and stoneware incense holder. Replace the orange curtain and calendar with natural bamboo woven wood shades filtering soft golden-hour sunlight. Refinish the walls in textured warm beige limewash plaster with vertical cedar wood accent slats and a minimalist Japanese sumi-e framed art piece. Upgrade the floor to warm natural tatami-inspired oak planks with a textured neutral wool rug and a sculptural olive tree in a terracotta pot near the doorway. Peaceful, warm organic shadows, 8k Architectural Digest photography."
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
      `Complete dramatic interior renovation of this room into a ${style}. Keep the exact camera angle, window frame, and doorway layout from the original photo, but completely replace the desk, chair, curtains, wall finishes, floor, and lighting with high-end designer furniture, rich textures, plants, and warm architectural LED lighting, 8k photorealistic interior design photography.`;

    const origin = req.headers.get("origin") || "https://room-makeover-ai-nu.vercel.app";

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
