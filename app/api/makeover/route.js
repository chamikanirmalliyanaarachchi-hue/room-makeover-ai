import { NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * ============================================================================
 * AI ROOM & DESK MAKEOVER - CLOUDFLARE WORKERS AI (2026 ACTIVE MODELS)
 * ============================================================================
 * 1. @cf/meta/llama-3.2-11b-vision-instruct (Spatial Layout Scanner)
 * 2. @cf/black-forest-labs/flux-1-schnell (Primary HD Renderer)
 * 3. @cf/leonardo/lucid-origin (2026 High-Res Backup Renderer)
 * 4. @cf/bytedance/stable-diffusion-xl-lightning (Fast Fallback)
 * ============================================================================
 */

const STYLE_PROMPTS = {
  "Cozy Gaming & RGB Desk Setup":
    "Luxury cozy RGB gaming bedroom desk setup, dark charcoal acoustic wood-slat wall panels, glowing hexagonal RGB wall lights, sleek black gaming desk with cyan and magenta under-desk neon LED strips, curved gaming monitor, tempered-glass RGB PC tower, mechanical RGB keyboard, black racing gaming chair, dark window blinds, walnut wood floor, warm ambient lighting, Architectural Digest 8k photorealistic",

  "Modern Luxury Aesthetic":
    "5-star modern luxury designer workspace, warm greige Venetian plaster walls with brushed-brass trim molding, fluted walnut executive desk with warm 3000K golden LED cove lighting, sleek aluminum monitor, cognac-leather designer ergonomic chair, sheer linen drapes, European oak herringbone wood floor, cream boucle rug, indoor fiddle-leaf fig plant, Architectural Digest 8k photorealistic",

  "Minimalist Scandinavian":
    "Bright serene Scandinavian Nordic workspace, warm matte alabaster-white walls with light-oak vertical wood slats, floating birch shelves with ceramic vases and pothos plants, solid light-ash wood minimalist desk, clean white-and-silver computer setup, white ergonomic Nordic chair with oak legs, white linen Roman blinds, pale ash hardwood floor, woven jute rug, indoor snake plant, Kinfolk 8k photorealistic",

  "Cyberpunk Neon Studio":
    "Futuristic Cyberpunk Neon Creator Studio, matte-black 3D geometric acoustic wall tiles, vertical glowing electric-blue and hot-pink neon light tubes, heavy matte-black industrial tech desk with neon edge trim, dual curved gaming monitors, studio boom-arm microphone, liquid-cooled RGB PC tower, futuristic ergonomic gaming chair, dark metallic blinds with neon rim glow, dark slate tile floor, 8k photorealistic",

  "Warm Japandi & Wood Aesthetic":
    "Tranquil Japandi Japanese-Scandinavian workspace, textured warm beige limewash plaster walls with vertical cedar wood slats, framed minimalist Japanese art, handcrafted dark-stained oak desk with warm hidden LED cove lighting, curved solid-wood and woven-cane chair with linen cushion, clean dark-bezel monitor, woven bamboo window shades, warm oak plank floor, neutral wool rug, indoor olive tree, 8k photorealistic"
};

async function scanRoomGeometry(accountId, apiToken, imageBase64, mimeType) {
  const defaultLayout =
    "Medium-wide interior view of a cozy bedroom desk corner with a computer desk against the wall, monitor and PC tower on the desk, chair in front, window and doorway in their original positions";

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct`,
      {
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
                "Describe the exact spatial layout and camera angle of this room in 35 words or less (positions of desk, PC, chair, window, doorway, bed, wall objects) so an interior designer recreates the exact same room perspective."
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Describe exact room layout and camera angle:" },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}` }
                }
              ]
            }
          ],
          max_tokens: 80
        })
      }
    );

    if (res.ok) {
      const json = await res.json();
      const text = json?.result?.response || json?.choices?.[0]?.message?.content;
      if (text && text.trim().length > 15) {
        return text.trim().replace(/\n+/g, " ").slice(0, 220);
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

    const roomStructure = await scanRoomGeometry(accountId, apiToken, imageBase64, mimeType);

    const styleDescription =
      STYLE_PROMPTS[style] ||
      `Luxury interior room renovation in ${style} style, designer furniture, modern wall panels, warm LED lighting, hardwood flooring, indoor plants, 8k photorealistic interior photography`;

    const finalPrompt = `Interior design makeover of this exact room layout (${roomStructure}). Transformed into: ${styleDescription}`;

    const errorsLog = [];

    // 1. Primary: Black Forest Labs FLUX.1-schnell (num_steps max 8, 4 is optimal)
    try {
      const fluxRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            steps: 4
          })
        }
      );

      if (fluxRes.ok) {
        const fluxJson = await fluxRes.json();
        const base64Img = fluxJson?.result?.image;
        if (base64Img) {
          return NextResponse.json({
            resultImage: `data:image/jpeg;base64,${base64Img}`,
            detectedLayout: roomStructure
          });
        }
      } else {
        errorsLog.push(`FLUX (${fluxRes.status}): ${(await fluxRes.text()).slice(0, 120)}`);
      }
    } catch (e) {
      errorsLog.push(`FLUX err: ${e.message}`);
    }

    // 2. Backup: Leonardo Lucid Origin (2026 active Cloudflare model)
    try {
      const lucidRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/leonardo/lucid-origin`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: finalPrompt
          })
        }
      );

      if (lucidRes.ok) {
        const cType = lucidRes.headers.get("content-type") || "";
        if (cType.includes("application/json")) {
          const lucidJson = await lucidRes.json();
          const b64 = lucidJson?.result?.image;
          if (b64) {
            return NextResponse.json({
              resultImage: `data:image/jpeg;base64,${b64}`,
              detectedLayout: roomStructure
            });
          }
        } else {
          const buf = await lucidRes.arrayBuffer();
          return NextResponse.json({
            resultImage: `data:image/png;base64,${Buffer.from(buf).toString("base64")}`,
            detectedLayout: roomStructure
          });
        }
      } else {
        errorsLog.push(`Lucid (${lucidRes.status}): ${(await lucidRes.text()).slice(0, 120)}`);
      }
    } catch (e) {
      errorsLog.push(`Lucid err: ${e.message}`);
    }

    // 3. Fallback: ByteDance SDXL Lightning (2026 active fast model)
    try {
      const sdxlRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: finalPrompt
          })
        }
      );

      if (sdxlRes.ok) {
        const outBuffer = await sdxlRes.arrayBuffer();
        return NextResponse.json({
          resultImage: `data:image/png;base64,${Buffer.from(outBuffer).toString("base64")}`,
          detectedLayout: roomStructure
        });
      } else {
        errorsLog.push(`Lightning (${sdxlRes.status}): ${(await sdxlRes.text()).slice(0, 120)}`);
      }
    } catch (e) {
      errorsLog.push(`Lightning err: ${e.message}`);
    }

    return NextResponse.json(
      { error: `Cloudflare AI Error: ${errorsLog.join(" | ")}` },
      { status: 500 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unexpected error during Cloudflare room makeover." },
      { status: 500 }
    );
  }
}
