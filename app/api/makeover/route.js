import { NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * ============================================================================
 * AI ROOM & DESK MAKEOVER - CLOUDFLARE FLUX IMAGE-TO-IMAGE EDITOR (100% FREE)
 * ============================================================================
 * - Passes the ACTUAL uploaded room pixels directly into Cloudflare's
 *   Image-to-Image editing models so the exact room geometry, walls, windows,
 *   doorways, and desk layout are 100% preserved in-place.
 * ============================================================================
 */

const STYLE_PROMPTS = {
  "Cozy Gaming & RGB Desk Setup":
    "Edit this exact room photo in-place into a luxury cozy RGB gaming room while keeping the exact room geometry, walls, window, doorway, and desk placement unchanged. Upgrade walls with dark matte charcoal acoustic wood-slat panels and glowing hexagonal RGB wall lights. Upgrade the desk into a sleek matte-black gaming desk with cyan and magenta under-desk neon LED strips, curved gaming monitor, tempered-glass RGB PC tower, mechanical RGB keyboard, and black racing gaming chair. Add dark window blinds, walnut hardwood floor, and warm ambient lighting. 8k photorealistic interior photography.",

  "Modern Luxury Aesthetic":
    "Edit this exact room photo in-place into a 5-star modern luxury designer workspace while keeping the exact room geometry, walls, window, doorway, and desk placement unchanged. Upgrade walls with warm greige Venetian plaster and brushed-brass trim molding. Upgrade the desk into a fluted walnut executive desk with warm 3000K golden LED cove lighting, sleek aluminum workstation monitor, and cognac-leather designer ergonomic chair. Add sheer linen drapes, European oak herringbone wood floor, cream boucle rug, and indoor fiddle-leaf fig plant. Architectural Digest 8k photorealistic.",

  "Minimalist Scandinavian":
    "Edit this exact room photo in-place into a bright serene Scandinavian Nordic workspace while keeping the exact room geometry, walls, window, doorway, and desk placement unchanged. Upgrade walls with warm matte alabaster-white paint, light-oak vertical wood slats, and floating birch shelves with ceramic vases and trailing pothos plants. Upgrade the desk into a solid light-ash wood minimalist desk with white-and-silver computer setup and white molded ergonomic Nordic chair with oak legs. Add white linen Roman blinds, pale ash hardwood floor, woven jute rug, and snake plant. 8k photorealistic.",

  "Cyberpunk Neon Studio":
    "Edit this exact room photo in-place into a futuristic Cyberpunk Neon Creator Studio while keeping the exact room geometry, walls, window, doorway, and desk placement unchanged. Upgrade walls with matte-black 3D geometric acoustic tiles and vertical glowing electric-blue and hot-pink neon light tubes. Upgrade the desk into a heavy matte-black industrial tech desk with neon edge trim, curved gaming monitor, boom-arm microphone, liquid-cooled RGB PC tower, and futuristic ergonomic gaming chair. Add dark metallic blinds with neon rim glow and dark slate tile floor. 8k photorealistic.",

  "Warm Japandi & Wood Aesthetic":
    "Edit this exact room photo in-place into a tranquil Japandi Japanese-Scandinavian workspace while keeping the exact room geometry, walls, window, doorway, and desk placement unchanged. Upgrade walls with textured warm beige limewash plaster, vertical cedar wood slats, and framed minimalist Japanese ink art. Upgrade the desk into a handcrafted dark-stained oak desk with warm hidden LED cove lighting, curved solid-wood and woven-cane chair with linen cushion, and clean dark-bezel monitor. Add woven bamboo window shades, warm oak plank floor, neutral wool rug, and indoor olive tree. 8k photorealistic."
};

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

    const prompt =
      STYLE_PROMPTS[style] ||
      `Edit this exact room photo in-place into a ${style} while keeping the exact room geometry, walls, window, doorway, and desk placement unchanged. Upgrade furniture, wall panels, lighting, and flooring into high-end 8k photorealistic interior design.`;

    const errorsLog = [];

    // 1. Primary: FLUX.2 Klein 4B (Cloudflare 2026 Native Image-to-Image Editor via multipart/form-data)
    try {
      const imageBuffer = Buffer.from(imageBase64, "base64");
      const imageBlob = new Blob([imageBuffer], { type: mimeType || "image/jpeg" });

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("input_image_0", imageBlob, "room.jpg");
      formData.append("steps", "4");

      const kleinRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-2-klein-4b`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`
          },
          body: formData
        }
      );

      if (kleinRes.ok) {
        const cType = kleinRes.headers.get("content-type") || "";
        if (cType.includes("application/json")) {
          const json = await kleinRes.json();
          const b64 = json?.result?.image;
          if (b64) {
            return NextResponse.json({
              resultImage: `data:image/jpeg;base64,${b64}`,
              model: "flux-2-klein-4b"
            });
          }
        } else {
          const buf = await kleinRes.arrayBuffer();
          return NextResponse.json({
            resultImage: `data:image/png;base64,${Buffer.from(buf).toString("base64")}`,
            model: "flux-2-klein-4b"
          });
        }
      } else {
        errorsLog.push(`FLUX2-Klein (${kleinRes.status}): ${(await kleinRes.text()).slice(0, 140)}`);
      }
    } catch (e) {
      errorsLog.push(`FLUX2-Klein err: ${e.message}`);
    }

    // 2. Secondary: FLUX.1 Kontext Dev on Cloudflare (Direct Image-to-Image Context Editing)
    try {
      const kontextRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-kontext-dev`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: prompt,
            image: imageBase64,
            steps: 20
          })
        }
      );

      if (kontextRes.ok) {
        const cType = kontextRes.headers.get("content-type") || "";
        if (cType.includes("application/json")) {
          const json = await kontextRes.json();
          const b64 = json?.result?.image;
          if (b64) {
            return NextResponse.json({
              resultImage: `data:image/jpeg;base64,${b64}`,
              model: "flux-1-kontext-dev"
            });
          }
        } else {
          const buf = await kontextRes.arrayBuffer();
          return NextResponse.json({
            resultImage: `data:image/png;base64,${Buffer.from(buf).toString("base64")}`,
            model: "flux-1-kontext-dev"
          });
        }
      } else {
        errorsLog.push(`Kontext-CF (${kontextRes.status}): ${(await kontextRes.text()).slice(0, 140)}`);
      }
    } catch (e) {
      errorsLog.push(`Kontext-CF err: ${e.message}`);
    }

    return NextResponse.json(
      { error: `Cloudflare Img2Img Error: ${errorsLog.join(" | ")}` },
      { status: 500 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unexpected error during Cloudflare image editing." },
      { status: 500 }
    );
  }
}
