import { NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * ============================================================================
 * AI ROOM & DESK MAKEOVER - CLOUDFLARE VISION + FLUX.1-SCHNELL (100% FREE TIER)
 * ============================================================================
 * - Uses 100% allowed Free Tier models on Cloudflare Workers AI:
 *   1. @cf/meta/llama-3.2-11b-vision-instruct (Spatial Room Layout Scanner)
 *   2. @cf/black-forest-labs/flux-1-schnell (HD Photorealistic Renderer)
 *   3. @cf/stabilityai/stable-diffusion-xl-base-1.0 (Automatic Fallback)
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

/**
 * Step 1: Analyze exact room layout using Cloudflare Vision AI
 */
async function scanRoomGeometry(accountId, apiToken, imageBase64, mimeType) {
  const defaultLayout =
    "Medium-wide interior view of a cozy bedroom desk corner with a computer desk against the wall, monitor and PC tower on the desk, chair in front, window and doorway in their original positions.";

  try {
    const visionEndpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct`;
    const res = await fetch(visionEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "Describe the exact spatial layout and camera angle of this room in 45 words or less (positions of desk, PC, chair, window, doorway, bed, wall objects) so an interior designer can recreate the exact same room perspective."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe the exact layout and camera angle of this room:"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 100
      })
    });

    if (res.ok) {
      const json = await res.json();
      const responseText = json?.result?.response || json?.choices?.[0]?.message?.content;
      if (responseText && responseText.trim().length > 15) {
        return responseText.trim().replace(/\n+/g, " ");
      }
    }
  } catch (_) {}

  return defaultLayout;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, style } = body || {};

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

    // 1. Scan exact room structure & camera perspective
    const roomStructure = await scanRoomGeometry(accountId, apiToken, imageBase64, mimeType);

    const styleDescription =
      STYLE_PROMPTS[style] ||
      `Luxury interior room renovation in ${style} style, high-end designer furniture, modern wall panels, warm architectural LED lighting, hardwood flooring, indoor plants, 8k photorealistic interior photography`;

    const finalPrompt = `Interior design makeover of this exact room layout (${roomStructure}). Transformed into: ${styleDescription}`;

    // 2. Try FLUX.1-schnell (JSON base64 image response), then SDXL Base (binary PNG response)
    const fluxEndpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
    const fluxRes = await fetch(fluxEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        num_steps: 6
      })
    });

    if (fluxRes.ok) {
      const fluxJson = await fluxRes.json();
      const base64Img = fluxJson?.result?.image;
      if (base64Img) {
        return NextResponse.json({
          resultImage: `data:image/jpeg;base64,${base64Img}`,
          detectedLayout: roomStructure
        });
      }
    }

    // Fallback: Stable Diffusion XL Base 1.0
    const sdxlEndpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;
    const sdxlRes = await fetch(sdxlEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        num_steps: 20
      })
    });

    if (!sdxlRes.ok) {
      const errText = (await sdxlRes.text()).slice(0, 220);
      return NextResponse.json(
        { error: `Cloudflare AI (${sdxlRes.status}): ${errText}` },
        { status: 500 }
      );
    }

    const outBuffer = await sdxlRes.arrayBuffer();
    const outBase64 = Buffer.from(outBuffer).toString("base64");

    return NextResponse.json({
      resultImage: `data:image/png;base64,${outBase64}`,
      detectedLayout: roomStructure
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unexpected error during Cloudflare room makeover." },
      { status: 500 }
    );
  }
}
