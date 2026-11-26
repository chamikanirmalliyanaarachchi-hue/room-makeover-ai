import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { imageBase64, mimeType, style } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing in Vercel" }, { status: 500 });
    }

    const prompt = `Redesign this room into a stunning ${style} aesthetic. Keep the exact room layout, walls, windows, and perspective, but upgrade the furniture, lighting, wall decor, plants, and textures to look like an ultra-realistic professional interior design photo.`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"]
      }
    };

    const endpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`
    ];

    let lastError = "Design could not be generated.";

    for (const url of endpoints) {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data?.error) {
        lastError = data.error.message || JSON.stringify(data.error);
        continue;
      }

      const parts = data?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p) => p.inlineData || p.inline_data);
      const imgData = imagePart?.inlineData?.data || imagePart?.inline_data?.data;

      if (imgData) {
        return NextResponse.json({ resultImage: `data:image/png;base64,${imgData}` });
      }
    }

    return NextResponse.json({ error: lastError }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
