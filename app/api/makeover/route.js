import { NextResponse } from "next/server";

export const maxDuration = 60;

// In-memory Server-Side IP Rate Limiter (2 generations per IP per day)
const ipUsageMap = new Map();
const DAILY_LIMIT = 2;

function checkAndIncrementIpLimit(ip) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const record = ipUsageMap.get(ip);

  if (!record || record.date !== today) {
    ipUsageMap.set(ip, { date: today, count: 1 });
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }

  if (record.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  ipUsageMap.set(ip, record);
  return { allowed: true, remaining: DAILY_LIMIT - record.count };
}

const STYLE_PROMPTS = {
  "Cozy Gaming & RGB Desk Setup":
    "Edit this exact room photo in-place into a luxury cozy RGB gaming room while keeping the exact room geometry, walls, window, doorway, and furniture placement unchanged. Upgrade walls with dark matte charcoal acoustic wood-slat panels and glowing hexagonal RGB wall lights. Upgrade the desk and workspace with sleek matte-black finishes, cyan and magenta under-desk neon LED strips, curved gaming display, tempered-glass RGB PC tower, mechanical RGB keyboard, and ergonomic racing gaming chair. Add dark window blinds, walnut hardwood floor, and warm ambient lighting. 8k photorealistic interior photography.",

  "Modern Luxury Aesthetic":
    "Edit this exact room photo in-place into a 5-star modern luxury designer space while keeping the exact room geometry, walls, window, doorway, and furniture placement unchanged. Upgrade walls with warm greige Venetian plaster and brushed-brass trim molding. Upgrade furniture with fluted walnut finishes, warm 3000K golden LED cove lighting, sleek aluminum workstation hardware, and cognac-leather designer seating. Add sheer linen drapes, European oak herringbone wood floor, cream boucle rug, and indoor fiddle-leaf fig plant. Architectural Digest 8k photorealistic.",

  "Minimalist Scandinavian":
    "Edit this exact room photo in-place into a bright serene Scandinavian Nordic space while keeping the exact room geometry, walls, window, doorway, and furniture placement unchanged. Upgrade walls with warm matte alabaster-white paint, light-oak vertical wood slats, and floating birch shelves with ceramic vases and trailing pothos plants. Upgrade furniture into solid light-ash wood minimalist pieces with white-and-silver accents and molded ergonomic Nordic seating with oak legs. Add white linen Roman blinds, pale ash hardwood floor, woven jute rug, and snake plant. 8k photorealistic.",

  "Cyberpunk Neon Studio":
    "Edit this exact room photo in-place into a futuristic Cyberpunk Neon Creator Studio while keeping the exact room geometry, walls, window, doorway, and furniture placement unchanged. Upgrade walls with matte-black 3D geometric acoustic tiles and vertical glowing electric-blue and hot-pink neon light tubes. Upgrade the setup with heavy matte-black industrial tech furniture with neon edge trim, curved displays, studio boom-arm microphone, liquid-cooled RGB PC tower, and futuristic ergonomic seating. Add dark metallic blinds with neon rim glow and dark slate tile floor. 8k photorealistic.",

  "Warm Japandi & Wood Aesthetic":
    "Edit this exact room photo in-place into a tranquil Japandi Japanese-Scandinavian space while keeping the exact room geometry, walls, window, doorway, and furniture placement unchanged. Upgrade walls with textured warm beige limewash plaster, vertical cedar wood slats, and framed minimalist Japanese ink art. Upgrade furniture into handcrafted dark-stained oak pieces with warm hidden LED cove lighting, curved solid-wood and woven-cane seating with linen cushions, and minimalist fixtures. Add woven bamboo window shades, warm oak plank floor, neutral wool rug, and indoor olive tree. 8k photorealistic."
};

const STYLE_PALETTES = {
  "Cozy Gaming & RGB Desk Setup": [
    { name: "Matte Charcoal Wall", hex: "#1E222D", role: "Primary Wall" },
    { name: "Walnut Wood Slat", hex: "#4A3525", role: "Acoustic Panel" },
    { name: "Cyber Cyan Rim", hex: "#00F5D4", role: "Desk LED" },
    { name: "Neon Magenta Glow", hex: "#FF007F", role: "Accent Light" }
  ],
  "Modern Luxury Aesthetic": [
    { name: "Warm Greige Plaster", hex: "#D6CFC7", role: "Primary Wall" },
    { name: "Fluted American Walnut", hex: "#5C4033", role: "Millwork" },
    { name: "Brushed Champagne Brass", hex: "#C5A059", role: "Hardware" },
    { name: "Warm 3000K Cove", hex: "#FFD28E", role: "Ambient LED" }
  ],
  "Minimalist Scandinavian": [
    { name: "Nordic Alabaster", hex: "#F4F3EF", role: "Primary Wall" },
    { name: "Pale Natural Ash", hex: "#D9C3A9", role: "Timber Slat" },
    { name: "Sage Botanical", hex: "#7C9082", role: "Greenery" },
    { name: "Soft Daylight 4000K", hex: "#FFFDF7", role: "Task Light" }
  ],
  "Cyberpunk Neon Studio": [
    { name: "Obsidian Acoustic", hex: "#11131A", role: "3D Wall Tile" },
    { name: "Electric Cobalt", hex: "#00BBF9", role: "Neon Tube" },
    { name: "Hyper Pink", hex: "#F15BB5", role: "Rim Light" },
    { name: "Anodized Gunmetal", hex: "#2D3342", role: "Desk Frame" }
  ],
  "Warm Japandi & Wood Aesthetic": [
    { name: "Oatmeal Limewash", hex: "#E5DDD0", role: "Plaster Wall" },
    { name: "Smoked Cedar", hex: "#6F4E37", role: "Wood Slats" },
    { name: "Woven Tatami Cane", hex: "#C8B598", role: "Seating" },
    { name: "Golden Hour 2700K", hex: "#FFBE76", role: "Cove Glow" }
  ]
};

const FALLBACK_PRODUCTS = {
  "Cozy Gaming & RGB Desk Setup": [
    { name: "Govee Glide Hexa RGB Wall Light Panels", category: "Wall Lighting", price: "$89", reason: "Creates the signature neon hexagon wall glow", query: "Govee Hexagon RGB LED Wall Panels" },
    { name: "Acoustic Walnut Wood Slat Wall Panels (4-Pack)", category: "Wall Decor", price: "$119", reason: "Adds studio acoustics & luxury dark wood texture", query: "Acoustic Walnut Wood Slat Wall Panels" },
    { name: "55-Inch Carbon Fiber Gaming Desk with LED", category: "Furniture", price: "$149", reason: "Sleek matte-black surface with built-in edge lighting", query: "Carbon Fiber Gaming Desk with LED Lights" },
    { name: "Ergonomic High-Back Racing Gaming Chair", category: "Seating", price: "$169", reason: "All-day lumbar support matching the dark setup", query: "Ergonomic Black Racing Gaming Chair" },
    { name: "Smart Wi-Fi Under-Desk Neon LED Light Strip", category: "Ambient Light", price: "$24", reason: "Produces clean cyan & magenta under-desk rim glow", query: "Govee Neon Rope LED Strip Lights" },
    { name: "Minimalist Dual Studio Monitor Riser Shelf", category: "Desk Gear", price: "$42", reason: "Elevates screens cleanly with hidden cable routing", query: "Black Wood Desk Monitor Stand Riser" }
  ],
  "Modern Luxury Aesthetic": [
    { name: "Fluted Walnut & Brass Executive Office Desk", category: "Furniture", price: "$320", reason: "Warm designer focal point with hidden cable management", query: "Fluted Walnut Modern Executive Desk" },
    { name: "Cognac Vegan Leather Ergonomic Lounge Chair", category: "Seating", price: "$245", reason: "Rich warm leather contrast against greige walls", query: "Cognac Leather Modern Office Chair" },
    { name: "Warm 3000K Architectural LED Cove Light Strip", category: "Lighting", price: "$29", reason: "Soft hotel-grade warm indirect glow", query: "3000K Warm White COB LED Strip Light" },
    { name: "Cream Boucle Textured Modern Area Rug (5x7)", category: "Flooring", price: "$135", reason: "Softens hardwood floors with designer texture", query: "Cream Boucle Modern Area Rug" },
    { name: "Artificial Fiddle Leaf Fig Tree in Ceramic Pot", category: "Decor", price: "$68", reason: "Brings natural organic height to the room corner", query: "Fiddle Leaf Fig Tree in White Ceramic Planter" },
    { name: "Brushed Brass Minimalist Architect Desk Lamp", category: "Task Light", price: "$54", reason: "Adds warm metallic luxury accent on the desk", query: "Brushed Brass Modern Desk Lamp" }
  ]
};

async function generateAIShoppingAndPalette(accountId, apiToken, style, roomType, budgetTier, customNotes) {
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
                "You are an interior design sourcing AI. Return ONLY valid JSON with two keys: 'products' (an array of 6 specific real-world products tailored to the room type, aesthetic style, and budget tier; each having name, category, price like '$45', reason max 10 words, query for search) and 'palette' (an array of 4 color swatches with name, hex like '#1E293B', role like 'Primary Wall' or 'Accent LED'). No markdown, no extra text."
            },
            {
              role: "user",
              content: `Room Type: "${roomType || "Gaming & Desk Setup"}". Style: "${style}". Target Budget Tier: "${budgetTier || "Mid-Range ($300-$800)"}". Custom preferences: "${customNotes || "None"}".`
            }
          ],
          max_tokens: 650,
          temperature: 0.4
        })
      }
    );

    if (res.ok) {
      const data = await res.json();
      const rawText = data?.result?.response || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.products) && parsed.products.length >= 3) {
          return {
            products: parsed.products.slice(0, 6),
            palette:
              Array.isArray(parsed.palette) && parsed.palette.length >= 3
                ? parsed.palette.slice(0, 4)
                : STYLE_PALETTES[style] || STYLE_PALETTES["Cozy Gaming & RGB Desk Setup"]
          };
        }
      }
    }
  } catch (_) {}

  return {
    products: FALLBACK_PRODUCTS[style] || FALLBACK_PRODUCTS["Cozy Gaming & RGB Desk Setup"],
    palette: STYLE_PALETTES[style] || STYLE_PALETTES["Cozy Gaming & RGB Desk Setup"]
  };
}

export async function POST(req) {
  try {
    // Extract client IP for strict server-side rate limiting (blocks Incognito bypass)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown-client";

    const limitCheck = checkAndIncrementIpLimit(clientIp);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Daily free limit reached (2/2 renders per day). Please come back tomorrow for 2 more free makeovers.",
          remaining: 0
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { imageBase64, mimeType, style, roomType, budgetTier, customNotes } = body || {};

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
      `Edit this exact room photo in-place into a ${style} while keeping the exact room geometry, walls, window, doorway, and furniture placement unchanged. Upgrade furniture, wall panels, lighting, and flooring into high-end 8k photorealistic interior design.`;

    const roomContext = roomType ? ` Room function: ${roomType}.` : "";
    const budgetContext = budgetTier ? ` Material & finish grade: ${budgetTier}.` : "";
    const customAddition =
      customNotes && customNotes.trim().length > 2
        ? ` Also incorporate these specific user details seamlessly: ${customNotes.trim()}.`
        : "";

    const finalPrompt = `${basePrompt}${roomContext}${budgetContext}${customAddition}`;

    const imageBuffer = Buffer.from(imageBase64, "base64");
    const imageBlob = new Blob([imageBuffer], { type: mimeType || "image/jpeg" });

    const formData = new FormData();
    formData.append("prompt", finalPrompt);
    formData.append("input_image_0", imageBlob, "room.jpg");
    formData.append("steps", "4");

    const [kleinRes, curatedData] = await Promise.all([
      fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-2-klein-4b`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${apiToken}` },
          body: formData
        }
      ),
      generateAIShoppingAndPalette(accountId, apiToken, style, roomType, budgetTier, customNotes)
    ]);

    if (kleinRes.ok) {
      const cType = kleinRes.headers.get("content-type") || "";
      if (cType.includes("application/json")) {
        const json = await kleinRes.json();
        const b64 = json?.result?.image;
        if (b64) {
          return NextResponse.json({
            resultImage: `data:image/jpeg;base64,${b64}`,
            products: curatedData.products,
            palette: curatedData.palette,
            remaining: limitCheck.remaining
          });
        }
      } else {
        const buf = await kleinRes.arrayBuffer();
        return NextResponse.json({
          resultImage: `data:image/png;base64,${Buffer.from(buf).toString("base64")}`,
          products: curatedData.products,
          palette: curatedData.palette,
          remaining: limitCheck.remaining
        });
      }
    }

    // Fallback: FLUX.1 Kontext Dev
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
            products: curatedData.products,
            palette: curatedData.palette,
            remaining: limitCheck.remaining
          });
        }
      } else {
        const buf = await kontextRes.arrayBuffer();
        return NextResponse.json({
          resultImage: `data:image/png;base64,${Buffer.from(buf).toString("base64")}`,
          products: curatedData.products,
          palette: curatedData.palette,
          remaining: limitCheck.remaining
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
