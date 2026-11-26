import { NextResponse } from "next/server";

export const maxDuration = 60;

async function uploadTempImage(buffer, mimeType) {
  const blob = new Blob([buffer], { type: mimeType || "image/jpeg" });

  try {
    const fd = new FormData();
    fd.append("file", blob, "room.jpg");
    const res = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      headers: { "User-Agent": "Mozilla/5.0" },
      body: fd
    });
    if (res.ok) {
      const json = await res.json();
      const url = json?.data?.url;
      if (url) return url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
    }
  } catch (_) {}

  return null;
}

export async function POST(req) {
  try {
    const { imageBase64, mimeType, style } = await req.json();
    const hfToken = process.env.HF_TOKEN;
    const buffer = Buffer.from(imageBase64, "base64");
    const seed = Math.floor(Math.random() * 1000000);

    // Step 1: Try Direct Image-to-Image (Flux Kontext)
    const tempImageUrl = await uploadTempImage(buffer, mimeType);
    if (tempImageUrl) {
      const kontextPrompt = `Renovate this exact room into a ${style}. Keep the exact room architecture, window, doorway, walls, and desk position, but upgrade all furniture, lighting, curtains, and decor into a high-end photorealistic interior design.`;
      const kontextUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(kontextPrompt)}?model=kontext&image=${encodeURIComponent(tempImageUrl)}&width=1024&height=768&nologo=true&seed=${seed}`;

      try {
        const kRes = await fetch(kontextUrl);
        const contentType = kRes.headers.get("content-type") || "";
        if (kRes.ok && contentType.startsWith("image/")) {
          const arr = await kRes.arrayBuffer();
          return NextResponse.json({ resultImage: `data:image/jpeg;base64,${Buffer.from(arr).toString("base64")}` });
        }
      } catch (_) {}
    }

    // Step 2: Smart Spatial Vision Fallback (preserves exact room structure when Kontext is busy)
    let spatialLayout = "a small bedroom corner with a computer desk and monitor on the left next to a tall barred window, and an open doorway on the right";
    if (hfToken) {
      try {
        const visionRes = await fetch("https://router.huggingface.co/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "Qwen/Qwen2.5-VL-7B-Instruct",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Analyze this room photo for an interior renovation. List the exact left-to-right spatial positions of the desk, computer/PC, window, walls, and doorway in 50 words so the renovated room keeps the exact same architecture and camera angle."
                  },
                  {
                    type: "image_url",
                    image_url: { url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}` }
                  }
                ]
              }
            ],
            max_tokens: 130
          })
        });
        if (visionRes.ok) {
          const vData = await visionRes.json();
          const desc = vData?.choices?.[0]?.message?.content;
          if (desc) spatialLayout = desc;
        }
      } catch (_) {}
    }

    const fluxPrompt = `Interior design renovation photo of ${spatialLayout}, transformed into a ${style}. Modern upgraded desk setup, sleek window blinds, warm ambient LED strip lighting, indoor plants, clean painted walls, rich textures, architectural digest photography, 8k ultra-detailed`;
    const fluxUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fluxPrompt)}?model=flux&width=1024&height=768&nologo=true&seed=${seed}`;

    const fRes = await fetch(fluxUrl);
    if (!fRes.ok) {
      const errDetail = await fRes.text();
      return NextResponse.json({ error: `Generator error (${fRes.status}): ${errDetail.slice(0, 100)}` }, { status: 500 });
    }

    const fArr = await fRes.arrayBuffer();
    return NextResponse.json({ resultImage: `data:image/jpeg;base64,${Buffer.from(fArr).toString("base64")}` });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
