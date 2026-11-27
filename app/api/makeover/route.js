import { NextResponse } from "next/server";

export const maxDuration = 60;

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

const FALLBACK_PRODUCTS = {
  "Cozy Gaming & RGB Desk Setup": [
    { name: "Govee Glide Hexa RGB Wall Light Panels", category: "Wall Lighting", price: "$89", reason: "Creates the signature neon hexagon wall glow", query: "Govee Hexagon RGB LED Wall Panels" },
    { name: "Acoustic Walnut Wood Slat Wall Panels (4-Pack)", category: "Wall Decor", price: "$119", reason: "Adds studio acoustics & luxury dark wood texture", query: "Acoustic Walnut Wood Slat Wall Panels" },
    { name: "55-Inch Carbon Fiber Gaming Desk with LED", category: "Furniture", price: "$149", reason: "Sleek matte-black surface with built-in edge lighting", query: "Carbon Fiber Gaming Desk with LED Lights" },
    { name: "Ergonomic High-Back Racing Gaming Chair", category: "Seating", price: "$169", reason: "All-day lumbar support matching the dark setup", query: "Ergonomic Black Racing Gaming Chair" },
    { name: "Smart Wi-Fi Under-Desk Neon LED Light Strip", category: "Ambient Light", price: "$24", reason: "Produces clean cyan & magenta under-desk rim glow", query: "Govee Neon Rope LED Strip Lights" }
  ],
  "Modern Luxury Aesthetic": [
    { name: "Fluted Walnut & Brass Executive Office Desk", category: "Furniture", price: "$320", reason: "Warm designer focal point with hidden cable management", query: "Fluted Walnut Modern Executive Desk" },
    { name: "Cognac Vegan Leather Ergonomic Lounge Chair", category: "Seating", price: "$245", reason: "Rich warm leather contrast against greige walls", query: "Cognac Leather Modern Office Chair" },
    { name: "Warm 3000K Architectural LED Cove Light Strip", category: "Lighting", price: "$29", reason: "Soft hotel-grade warm indirect glow", query: "3000K Warm White COB LED Strip Light" },
    { name: "Cream Boucle Textured Modern Area Rug (5x7)", category: "Flooring", price: "$135", reason: "Softens hardwood floors with designer texture", query: "Cream Boucle Modern Area Rug" },
    { name: "Artificial Fiddle Leaf Fig Tree in Ceramic Pot", category: "Decor", price: "$68", reason: "Brings natural organic height to the room corner", query: "Fiddle Leaf Fig Tree in White Ceramic Planter" }
  ]
};

/**
 * AI Shopping Concierge: Generates custom product recommendations & search queries
 */
async function generateAIShoppingList(accountId, apiToken, style, customNotes) {
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
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
                "You are an interior design shopping assistant. Return ONLY a valid JSON array of 5 specific real-world products needed to achieve the requested room makeover. Each object must have keys: name, category, price (e.g. '$45'), reason (max 10 words), query (clean Amazon/AliExpress search keywords). No markdown, no extra text."
            },
            {
              role: "user",
              content: `Style: "${style}". Extra user preferences: "${customNotes || "None"}". Recommend 5 key furniture, lighting, and decor items.`
            }
          ],
          max_tokens: 450,
          temperature: 0.4
        })
      }
    );

    if (res.ok) {
      const data = await res.json();
      const rawText = data?.result?.response || "";
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed.slice(0, 6);
        }
      }
    }
  } catch (_) {}

  return FALLBACK_PRODUCTS[style] || FALLBACK_PRODUCTS["Cozy Gaming & RGB Desk Setup"];
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, style, customNotes } = body || {};

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

    const basePrompt =
      STYLE_PROMPTS[style] ||
      `Edit this exact room photo in-place into a ${style} while keeping the exact room geometry, walls, window, doorway, and desk placement unchanged. Upgrade furniture, wall panels, lighting, and flooring into high-end 8k photorealistic interior design.`;

    const customAddition =
      customNotes && customNotes.trim().length > 2
        ? ` Also incorporate these specific user requests seamlessly: ${customNotes.trim()}.`
        : "";

    const finalPrompt = `${basePrompt}${customAddition}`;

    // Run Image Editing & AI Shopping List generation in parallel for ultra-fast speed!
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const imageBlob = new Blob([imageBuffer], { type: mimeType || "image/jpeg" });

    const formData = new FormData();
    formData.append("prompt", finalPrompt);
    formData.append("input_image_0", imageBlob, "room.jpg");
    formData.append("steps", "4");

    const [kleinRes, shoppingItems] = await Promise.all([
      fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-2-klein-4b`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${apiToken}` },
          body: formData
        }
      ),
      generateAIShoppingList(accountId, apiToken, style, customNotes)
    ]);

    if (kleinRes.ok) {
      const cType = kleinRes.headers.get("content-type") || "";
      if (cType.includes("application/json")) {
        const json = await kleinRes.json();
        const b64 = json?.result?.image;
        if (b64) {
          return NextResponse.json({
            resultImage: `data:image/jpeg;base64,${b64}`,
            products: shoppingItems
          });
        }
      } else {
        const buf = await kleinRes.arrayBuffer();
        return NextResponse.json({
          resultImage: `data:image/png;base64,${Buffer.from(buf).toString("base64")}`,
          products: shoppingItems
        });
      }
    }

    // Fallback to FLUX.1 Kontext Dev if Klein is busy
    const kontextRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-kontext-dev`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: finalPrompt,
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
            products: shoppingItems
          });
        }
      } else {
        const buf = await kontextRes.arrayBuffer();
        return NextResponse.json({
          resultImage: `data:image/png;base64,${Buffer.from(buf).toString("base64")}`,
          products: shoppingItems
        });
      }
    }

    const errText = (await kleinRes.text()).slice(0, 180);
    return NextResponse.json({ error: `Cloudflare AI Error: ${errText}` }, { status: 500 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unexpected error during room makeover." },
      { status: 500 }
    );
  }
}
