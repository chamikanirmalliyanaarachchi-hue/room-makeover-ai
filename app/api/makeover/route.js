import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { imageBase64, mimeType, style } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const prompt = `Redesign this room into a stunning ${style} aesthetic. Keep the exact room layout, walls, windows, and perspective, but upgrade the furniture, lighting, wall decor, plants, and textures to look like an ultra-realistic professional interior design photo.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: imageBase64 } }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"]
          }
        })
      }
    );

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData || p.inline_data);
    const imgData = imagePart?.inlineData?.data || imagePart?.inline_data?.data;

    if (!imgData) {
      return NextResponse.json({ error: "Design could not be generated. Try another photo.", details: data }, { status: 500 });
    }

    return NextResponse.json({ resultImage: `data:image/png;base64,${imgData}` });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
