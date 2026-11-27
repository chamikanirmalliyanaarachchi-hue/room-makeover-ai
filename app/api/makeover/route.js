import { NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * ============================================================================
 * AI ROOM & DESK MAKEOVER - CLOUDFLARE WORKERS AI ENGINE (100% FREE TIER)
 * ============================================================================
 */

const STYLE_PROMPTS = {
  "Cozy Gaming & RGB Desk Setup":
    "Luxury cozy RGB gaming bedroom studio interior design, dark matte charcoal acoustic wood-slat wall panels, glowing hexagonal RGB wall lights, sleek black carbon-fiber gaming desk with cyan and magenta under-desk neon LED strips, curved gaming monitor, tempered-glass RGB PC tower, mechanical RGB keyboard, black ergonomic racing gaming chair, dark sleek window blinds, walnut hardwood floor, warm ambient lighting, Architectural Digest photography, 8k ultra-detailed, photorealistic",

  "Modern Luxury Aesthetic":
    "5-star modern luxury designer workspace interior renovation, warm greige Venetian plaster walls with brushed-brass trim molding, fluted walnut executive desk with concealed warm 3000K golden LED cove lighting, sleek aluminum workstation monitor, cognac-leather designer ergonomic office chair, sheer linen drapes over blackout shades, European oak herringbone hardwood floor, cream boucle rug, indoor fiddle-leaf fig plant, Architectural Digest 8k photorealistic",

  "Minimalist Scandinavian":
    "Bright serene Scandinavian Nordic workspace interior design, warm matte alabaster-white walls with light-oak vertical wood slats, floating birch shelves with white ceramic vases and trailing pothos plants, solid light-ash wood minimalist desk, clean white-and-silver computer setup, white molded ergonomic Nordic chair with oak legs, white linen Roman blinds, pale ash hardwood floor, woven jute rug, indoor snake plant, Kinfolk magazine 8k photorealistic",

  "Cyberpunk Neon Studio":
    "Futuristic Cyberpunk Neon Creator Studio interior design, matte-black 3D geometric acoustic wall tiles, vertical glowing electric-blue and hot-pink neon light tubes, heavy matte-black industrial tech desk with neon edge trim, dual curved gaming monitors, studio boom-arm microphone, liquid-cooled RGB PC tower, futuristic ergonomic gaming chair, dark metallic Venetian blinds with neon rim glow, dark slate tile floor, cinematic reflections, 8k photorealistic",

  "Warm Japandi & Wood Aesthetic":
    "Tranquil Japandi Japanese-Scandinavian interior workspace, textured warm beige limewash plaster walls with handcrafted vertical cedar wood slats, framed Japanese sumi-e ink artwork, handcrafted dark-stained oak desk with warm hidden LED cove lighting, curved solid-wood and woven-cane ergonomic chair with linen cushion, clean dark-bezel monitor, natural woven bamboo window shades, warm oak plank floor, neutral wool rug, indoor olive tree in terracotta pot, 8k photorealistic"
};

const NEGATIVE_PROMPT =
  "blurry, low quality, distorted perspective, deformed furniture, cartoon, illustration, anime, watermark, text, logo, extra windows, closed doorway, messy cables, cluttered, dark muddy shadows";

export async function POST(req) {
  try {
    const body = await req.json();
    const { imageBase64, style } = body || {};

    if (!imageBase64) {
      return NextResponse.json({ error: "No room image provided." }, { status: 400 });
    }

    const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || "").replace(/['"\s]/g, "");
    const apiToken = (process.env.CLOUDFLARE_API_TOKEN || "").replace(/['"\s]/g, "");

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN missing in Vercel." },
        { status: 500 }
      );
    }

    const imageBuffer = Buffer.from(imageBase64, "base64");
    const imageBytes = Array.from(new Uint8Array(imageBuffer));

    const styleDescription =
      STYLE_PROMPTS[style] ||
      `Luxury interior room renovation in ${style} style, high-end designer furniture, modern wall panels, warm architectural LED lighting, hardwood flooring, indoor plants, 8k photorealistic interior photography`;

    const masterPrompt = `Exact room layout makeover preserving original walls, window position, doorway opening, and desk placement: ${styleDescription}`;

    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/runwayml/stable-diffusion-v1-5-img2img`;

    const cfRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: masterPrompt,
        negative_prompt: NEGATIVE_PROMPT,
        image: imageBytes,
        strength: 0.62,
        guidance: 8.5,
        num_steps: 20
      })
    });

    if (!cfRes.ok) {
      const errText = (await cfRes.text()).slice(0, 220);
      return NextResponse.json(
        { error: `Cloudflare AI (${cfRes.status}): ${errText}` },
        { status: 500 }
      );
    }

    const outBuffer = await cfRes.arrayBuffer();
    const outBase64 = Buffer.from(outBuffer).toString("base64");

    return NextResponse.json({
      resultImage: `data:image/png;base64,${outBase64}`
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unexpected error during Cloudflare room makeover." },
      { status: 500 }
    );
  }
}
