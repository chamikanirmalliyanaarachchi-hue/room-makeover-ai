import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { imageBase64, mimeType, style } = await req.json();
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return NextResponse.json({ error: "HF_TOKEN missing in Vercel Settings" }, { status: 500 });
    }

    // 1. Analyze the uploaded room layout using free vision model
    let roomDetails = "a bedroom desk setup with a window and wall";
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
                  text: "Describe the exact layout, furniture positions, window, door, and camera angle of this room in 35 words so an interior designer can recreate the exact same room layout."
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
    } catch (_) {
      // Fallback to default room layout description if vision step times out
    }

    // 2. Generate the redesigned room image using FLUX.1-schnell
    const prompt = `Ultra-realistic interior design photography of ${roomDetails}, completely redesigned in a ${style} aesthetic, upgraded modern furniture, ambient lighting, indoor plants, cozy textures, architectural digest style, 8k resolution`;

    const imgRes = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    if (!imgRes.ok) {
      const errText = await imgRes.text();
      return NextResponse.json({ error: `AI Server: ${errText.slice(0, 150)}` }, { status: 500 });
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const base64Out = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({ resultImage: `data:image/jpeg;base64,${base64Out}` });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
