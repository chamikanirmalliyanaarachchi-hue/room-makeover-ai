import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { imageBase64, mimeType, style } = await req.json();
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return NextResponse.json({ error: "HF_TOKEN missing in Vercel Settings" }, { status: 500 });
    }

    // 1. Analyze uploaded room layout
    let roomDetails = "a cozy bedroom and computer desk setup next to a window";
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
                  text: "Describe the exact layout, desk, window, door, and camera angle of this room in 35 words so an interior designer can recreate the exact same room."
                },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}` }
                }
              ]
            }
          ],
          max_tokens: 100
        })
      });

      if (visionRes.ok) {
        const visionData = await visionRes.json();
        const desc = visionData?.choices?.[0]?.message?.content;
        if (desc) roomDetails = desc;
      }
    } catch (_) {}

    // 2. Generate redesigned room using active free HF image models (with auto-fallback)
    const prompt = `Ultra-realistic interior design photography of ${roomDetails}, completely redesigned in a ${style} aesthetic, upgraded modern furniture, warm ambient LED lighting, indoor plants, cozy textures, architectural digest style, 8k photorealistic`;

    const models = [
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      "https://router.huggingface.co/nscale/v1/images/generations"
    ];

    let lastError = "Failed to generate image";

    for (const url of models) {
      const isOpenAIFormat = url.includes("/v1/images/generations");
      const imgRes = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          isOpenAIFormat
            ? { model: "black-forest-labs/FLUX.1-schnell", prompt, response_format: "b64_json" }
            : { inputs: prompt }
        )
      });

      if (!imgRes.ok) {
        const errText = await imgRes.text();
        lastError = errText.slice(0, 150);
        continue;
      }

      if (isOpenAIFormat) {
        const json = await imgRes.json();
        const b64 = json?.data?.[0]?.b64_json;
        if (b64) {
          return NextResponse.json({ resultImage: `data:image/png;base64,${b64}` });
        }
      } else {
        const arrayBuffer = await imgRes.arrayBuffer();
        const base64Out = Buffer.from(arrayBuffer).toString("base64");
        return NextResponse.json({ resultImage: `data:image/jpeg;base64,${base64Out}` });
      }
    }

    return NextResponse.json({ error: `AI Server: ${lastError}` }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
