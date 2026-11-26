import { NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * ============================================================================
 * AI ROOM & DESK MAKEOVER - ENTERPRISE SPATIAL ARCHITECTURE & DESIGN ENGINE
 * ============================================================================
 * Pipeline:
 * 1. Multi-Host Resilient CDN Uploader (Catbox -> Uguu -> Tmpfiles)
 * 2. AI Spatial Vision Analyzer (Extracts exact walls, windows, doors & layout)
 * 3. Architectural Style & Lighting Compiler (Maps 8 interior layers per style)
 * 4. Strict Geometry-Locked Image-to-Image Renderer (enhance=false to prevent drift)
 * ============================================================================
 */

const DESIGN_STYLES_DB = {
  "Cozy Gaming & RGB Desk Setup": {
    category: "Gaming & Creator Studio",
    lightingMood: "Vibrant dual-tone cyan (#00F5D4) and warm magenta (#FF007F) neon rim lighting balanced with warm 3000K indirect ambient glow",
    wallTreatment: "Dark matte charcoal vertical acoustic wood-slat panels on solid wall sections, accented with modular glowing hexagonal RGB light panels and floating dark walnut shelves holding mini potted plants",
    deskUpgrade: "Sleek matte-black carbon-fiber gaming desk in the exact same position, fitted with concealed under-desk neon LED strips, an extended RGB micro-weave desk mat, custom mechanical RGB keyboard, wireless gaming mouse, and compact studio monitor speakers",
    pcAndTech: "Upgraded tempered-glass RGB gaming PC tower with glowing fans in the exact PC spot, paired with a sleek ultra-thin bezel curved gaming monitor displaying vibrant dark-mode gaming aesthetics",
    seatingUpgrade: "Plush black-and-accent high-back ergonomic racing gaming chair replacing the original chair",
    windowTreatment: "Sleek matte-black horizontal slatted Venetian blinds replacing old curtains, keeping the exact window frame and bars intact",
    doorwayTreatment: "Clean dark-trimmed doorway opening preserved in the exact same spot with subtle ambient LED accent lighting inside the adjacent room",
    flooringUpgrade: "Rich dark walnut wide-plank hardwood flooring with a modern dark geometric woven gaming rug",
    cameraSpec: "Shot on Sony A7R V, 24mm f/1.4 GM wide-angle architectural lens, crisp HDR exposure, natural ray-traced reflections, 8k photorealistic interior photography"
  },

  "Modern Luxury Aesthetic": {
    category: "High-End Contemporary Luxury",
    lightingMood: "Warm 3000K architectural cove lighting, soft natural daylight diffusion, and warm brass accent lamp glow",
    wallTreatment: "Smooth warm greige Venetian plaster walls with subtle vertical architectural trim molding and framed minimalist abstract gallery artwork",
    deskUpgrade: "Bespoke fluted walnut and brushed-brass executive desk in the exact original desk position with concealed warm under-desk LED strip lighting and clutter-free leather desk pad",
    pcAndTech: "Sleek minimalist aluminum workstation display in the exact monitor position, wireless low-profile aluminum keyboard, and minimalist brass desk lamp",
    seatingUpgrade: "Sculpted cognac-leather and matte-black designer ergonomic lounge office chair replacing the original chair",
    windowTreatment: "Floor-to-ceiling sheer cream linen drapes layered over motorized warm-gray blackout shades inside the exact window frame",
    doorwayTreatment: "Refined dark-wood architectural door frame preserved in its exact position leading into a warmly lit minimalist hallway",
    flooringUpgrade: "Wide-plank European natural oak herringbone hardwood flooring with a plush cream boucle textured area rug and a tall ceramic planter with a fiddle-leaf fig",
    cameraSpec: "Shot on Sony A7R V, 24mm f/1.4 GM lens, Architectural Digest editorial lighting, balanced highlights and shadows, 8k photorealistic"
  },

  "Minimalist Scandinavian": {
    category: "Nordic Minimalist Sanctuary",
    lightingMood: "Bright, airy, soft diffused natural Nordic daylight with gentle warm 3200K task lighting",
    wallTreatment: "Warm matte alabaster-white painted walls accented with natural pale-oak vertical wood slats and floating light-birch shelves displaying white ceramic vases, art books, and trailing green pothos plants",
    deskUpgrade: "Solid light-ash wood minimalist Scandinavian desk in the exact original position with clean slim legs and tidy wooden desk organizer",
    pcAndTech: "Clean white-and-silver minimal computer monitor setup in the exact monitor location, wireless keyboard, and warm minimalist Nordic desk lamp",
    seatingUpgrade: "Molded matte-white ergonomic Scandinavian desk chair with light oak legs and a soft cream sheepskin throw",
    windowTreatment: "Crisp white linen Roman blinds inside the exact window frame filtering bright soft daylight",
    doorwayTreatment: "Clean white-painted wooden doorway trim preserved in its exact original spot opening into a bright clean room",
    flooringUpgrade: "Pale Scandinavian ash wood plank flooring with a handwoven natural beige jute rug and a lush snake plant in a woven seagrass basket",
    cameraSpec: "Shot on Sony A7R V, 24mm f/1.4 GM lens, Kinfolk magazine natural lighting aesthetic, clean organic textures, 8k photorealistic"
  },

  "Cyberpunk Neon Studio": {
    category: "Futuristic Sci-Fi Creator Setup",
    lightingMood: "High-contrast cinematic electric-blue (#00BBF9) and hot-pink (#F15BB5) neon tube lighting with moody dark reflections",
    wallTreatment: "Matte-black 3D geometric acoustic foam wall tiles paired with vertical glowing cyan and magenta LED light tubes and dark metal grid wall shelves",
    deskUpgrade: "Heavy matte-black industrial tech desk in the exact original spot featuring glowing neon edge trim, dual-tier monitor riser, and extended futuristic desk mat",
    pcAndTech: "Liquid-cooled RGB gaming PC tower with glowing neon coolant tubes in the exact PC position, ultra-wide curved monitor, studio boom-arm microphone, and stream deck",
    seatingUpgrade: "Futuristic matte-black and neon-accented ergonomic mesh gaming throne replacing the original chair",
    windowTreatment: "Dark anodized aluminum Venetian blinds inside the exact window frame bathed in dramatic cyan and magenta rim light",
    doorwayTreatment: "Dark industrial doorway frame preserved in its exact position with futuristic neon accent strips visible inside",
    flooringUpgrade: "Dark matte slate stone tile flooring with a dark geometric neon-bordered studio rug",
    cameraSpec: "Shot on Sony A7R V, 24mm f/1.4 GM lens, cinematic cyberpunk color grading, sharp specular reflections, 8k photorealistic"
  },

  "Warm Japandi & Wood Aesthetic": {
    category: "Japanese-Scandinavian Zen Workspace",
    lightingMood: "Tranquil golden-hour warm sunlight (2700K) filtered through natural shades with soft hidden cove lighting",
    wallTreatment: "Textured warm beige limewash plaster walls with handcrafted vertical cedar wood slats and a minimalist framed Japanese sumi-e ink artwork",
    deskUpgrade: "Handcrafted dark-stained oak slatted desk in the exact original position with concealed warm cove lighting and solid walnut wrist rest",
    pcAndTech: "Clean dark-bezel monitor in the exact original spot, minimalist matte-black architect lamp, and ceramic stoneware cup",
    seatingUpgrade: "Curved solid-wood and woven-cane ergonomic Japanese designer chair with a natural linen seat cushion",
    windowTreatment: "Natural woven bamboo wood roll-up shades inside the exact window frame casting warm organic light patterns",
    doorwayTreatment: "Natural dark-stained timber doorway frame preserved in its exact position opening into a serene warm-toned room",
    flooringUpgrade: "Warm natural oak plank flooring with a textured oatmeal wool rug and an indoor olive tree in a handmade terracotta planter",
    cameraSpec: "Shot on Sony A7R V, 24mm f/1.4 GM lens, tranquil organic shadows, Architectural Digest Japan aesthetic, 8k photorealistic"
  }
};

/**
 * Uploads the user's original room photo to a reliable public CDN
 * so the Image-to-Image model can directly inspect every pixel.
 */
async function uploadImageToTempCDN(buffer, mimeType) {
  const blob = new Blob([buffer], { type: mimeType || "image/jpeg" });

  // Primary CDN: Catbox.moe
  try {
    const fd1 = new FormData();
    fd1.append("reqtype", "fileupload");
    fd1.append("fileToUpload", blob, "room_input.jpg");

    const res1 = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      headers: { "User-Agent": "Mozilla/5.0" },
      body: fd1
    });

    if (res1.ok) {
      const url1 = (await res1.text()).trim();
      if (url1.startsWith("https://files.catbox.moe/")) {
        return url1;
      }
    }
  } catch (err) {
    console.warn("Catbox upload skipped:", err.message);
  }

  // Secondary CDN: Uguu.se
  try {
    const fd2 = new FormData();
    fd2.append("files[]", blob, "room_input.jpg");

    const res2 = await fetch("https://uguu.se/upload", {
      method: "POST",
      headers: { "User-Agent": "Mozilla/5.0" },
      body: fd2
    });

    if (res2.ok) {
      const json2 = await res2.json();
      const url2 = json2?.files?.[0]?.url;
      if (url2 && url2.startsWith("http")) {
        return url2;
      }
    }
  } catch (err) {
    console.warn("Uguu upload skipped:", err.message);
  }

  // Tertiary CDN: Tmpfiles.org
  try {
    const fd3 = new FormData();
    fd3.append("file", blob, "room_input.jpg");

    const res3 = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      headers: { "User-Agent": "Mozilla/5.0" },
      body: fd3
    });

    if (res3.ok) {
      const json3 = await res3.json();
      const rawUrl = json3?.data?.url;
      if (rawUrl) {
        return rawUrl.replace("tmpfiles.org/", "tmpfiles.org/dl/");
      }
    }
  } catch (err) {
    console.warn("Tmpfiles upload skipped:", err.message);
  }

  return null;
}

/**
 * Stage 1: AI Spatial Vision Analyzer
 * Inspects the uploaded photo to lock down exact positions of walls, windows,
 * doorways, and desks so the image generator never hallucinates a different room.
 */
async function analyzeRoomSpatialLayout(imageBase64, mimeType, apiKey, origin) {
  const fallbackBlueprint =
    "Keep the exact room layout, camera angle, walls, window frame, doorway opening, and desk placement exactly where they appear in the input image.";

  try {
    const visionPayload = {
      model: "openai-fast",
      messages: [
        {
          role: "system",
          content:
            "You are an architectural spatial analyzer. Describe the EXACT physical layout of the room in the image in 45 words or less so an interior image editor preserves every structural element. Explicitly state left-to-right positions of walls, windows, doorways, and desks. Do not suggest new windows or L-shaped desks if not present."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Map the exact structural positions (left wall, center, right side, window, doorway, desk orientation) of this room:"
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
      max_tokens: 90,
      temperature: 0.2
    };

    const res = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Origin: origin,
        Referer: `${origin}/`
      },
      body: JSON.stringify(visionPayload)
    });

    if (res.ok) {
      const data = await res.json();
      const spatialText = data?.choices?.[0]?.message?.content?.trim();
      if (spatialText && spatialText.length > 15) {
        return spatialText.replace(/\n+/g, " ");
      }
    }
  } catch (err) {
    console.warn("Spatial vision analyzer fallback triggered:", err.message);
  }

  return fallbackBlueprint;
}

/**
 * Stage 2: Compiles the Spatial Blueprint + 8-Layer Style Specification
 * into a precision Image-to-Image editing prompt.
 */
function buildMasterArchitecturalPrompt(styleName, spatialLayout) {
  const spec = DESIGN_STYLES_DB[styleName] || DESIGN_STYLES_DB["Cozy Gaming & RGB Desk Setup"];

  const promptParts = [
    `Exact in-place interior renovation of this uploaded room photo.`,
    `STRICT STRUCTURAL LOCK: ${spatialLayout} Do NOT add extra windows, do NOT close or move doorways, do NOT change desk shape or camera perspective.`,
    `WALLS: ${spec.wallTreatment}.`,
    `DESK & TECH: ${spec.deskUpgrade}. ${spec.pcAndTech}.`,
    `SEATING: ${spec.seatingUpgrade}.`,
    `WINDOW & DOORWAY: ${spec.windowTreatment}. ${spec.doorwayTreatment}.`,
    `FLOOR & LIGHTING: ${spec.flooringUpgrade}. ${spec.lightingMood}.`,
    `QUALITY: ${spec.cameraSpec}.`
  ];

  // Keep prompt within optimal token window (~650 chars) so Kontext processes 100% of instructions
  return promptParts.join(" ").slice(0, 780);
}

/**
 * Stage 3: Executes Geometry-Locked Image-to-Image Generation
 */
async function renderMakeoverImage({ prompt, imageUrl, apiKey, origin, seed }) {
  // Note: enhance=false is CRITICAL so Pollinations does NOT rewrite our spatial-locked prompt!
  const candidateUrls = [
    `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=kontext&image=${encodeURIComponent(imageUrl)}&width=1280&height=960&nologo=true&enhance=false&seed=${seed}`,
    `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=kontext&image=${encodeURIComponent(imageUrl)}&width=1024&height=768&nologo=true&enhance=false&seed=${seed + 1}`
  ];

  let lastErrorStatus = 500;
  let lastErrorMessage = "Image generation failed";

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Origin: origin,
          Referer: `${origin}/`,
          "User-Agent": "Mozilla/5.0"
        }
      });

      const contentType = response.headers.get("content-type") || "";

      if (response.ok && contentType.startsWith("image/")) {
        const arrayBuffer = await response.arrayBuffer();
        const base64Output = Buffer.from(arrayBuffer).toString("base64");
        return {
          ok: true,
          base64: base64Output,
          mime: contentType
        };
      }

      lastErrorStatus = response.status;
      lastErrorMessage = (await response.text()).slice(0, 160);
    } catch (err) {
      lastErrorMessage = err.message;
    }
  }

  return {
    ok: false,
    status: lastErrorStatus,
    error: lastErrorMessage
  };
}

/**
 * Main POST Handler for /api/makeover
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, style } = body || {};

    if (!imageBase64) {
      return NextResponse.json({ error: "No room image provided." }, { status: 400 });
    }

    const rawKey = process.env.POLLINATIONS_API_KEY || "";
    const apiKey = rawKey.replace(/['"\s]/g, "");

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: POLLINATIONS_API_KEY missing." },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") || "https://room-makeover-ai-nu.vercel.app";
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const seed = Math.floor(Math.random() * 900000) + 100000;

    // Step 1: Upload original room photo to public CDN
    const tempImageUrl = await uploadImageToTempCDN(imageBuffer, mimeType);
    if (!tempImageUrl) {
      return NextResponse.json(
        { error: "Temporary image host is busy. Please try again in a moment." },
        { status: 502 }
      );
    }

    // Step 2: Analyze exact physical room layout via AI Vision
    const spatialLayout = await analyzeRoomSpatialLayout(
      imageBase64,
      mimeType,
      apiKey,
      origin
    );

    // Step 3: Compile precision 8-layer architectural renovation prompt
    const masterPrompt = buildMasterArchitecturalPrompt(style, spatialLayout);

    // Step 4: Render geometry-locked HD makeover image
    const renderResult = await renderMakeoverImage({
      prompt: masterPrompt,
      imageUrl: tempImageUrl,
      apiKey,
      origin,
      seed
    });

    if (!renderResult.ok) {
      return NextResponse.json(
        { error: `AI Studio (${renderResult.status}): ${renderResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      resultImage: `data:${renderResult.mime};base64,${renderResult.base64}`,
      detectedLayout: spatialLayout
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unexpected server error during room makeover." },
      { status: 500 }
    );
  }
}
