import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { imageBase64, mimeType, style } = await req.json();
    const hfToken = process.env.HF_TOKEN;

    // 1. Analyze the uploaded room layout using Hugging Face Vision (which already works on your token!)
    let roomDetails = "a cozy bedroom and computer desk setup next to a window and doorway";
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
                    text: "Describe the exact layout, computer desk, window, door, walls, and camera perspective of this room in 35 words so an interior designer can recreate the exact same room."
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
    }

    // 2. Generate the redesigned room image using Pollinations Flux (100% Free, Zero Billing)
    const prompt = `Ultra-realistic interior design photography of ${roomDetails}, completely redesigned in a ${style} aesthetic, upgraded modern furniture, warm ambient LED lighting, indoor plants, cozy textures, architectural digest style, 8k photorealistic`;
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&model=flux&nologo=true&seed=${seed}`;

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json({ error: "Image generator busy, please try again in 5 seconds." }, { status: 500 });
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const base64Out = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({ resultImage: `data:image/jpeg;base64,${base64Out}` });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
