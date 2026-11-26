import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { imageBase64, mimeType, style } = await req.json();
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return NextResponse.json({ error: "HF_TOKEN missing in Vercel Settings" }, { status: 500 });
    }

    const prompt = `Redesign this room into a stunning ${style} aesthetic. Keep the exact room layout, walls, windows, and perspective, but upgrade the furniture, lighting, wall decor, plants, and textures to look like an ultra-realistic professional interior design photo.`;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-Kontext-dev",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
          parameters: { prompt }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `AI Server: ${errText.slice(0, 150)}` }, { status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Out = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({ resultImage: `data:image/png;base64,${base64Out}` });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
