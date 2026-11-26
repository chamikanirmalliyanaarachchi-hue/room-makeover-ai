import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { imageBase64, mimeType, style } = await req.json();
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return NextResponse.json({ error: "HF_TOKEN missing in Vercel" }, { status: 500 });
    }

    const prompt = `Transform this exact room into a ${style}. Keep the exact same room layout, walls, window, doorway, camera angle, and computer desk placement, but upgrade the furniture, lighting, curtains, wall finish, and decor into an ultra-realistic professional interior design photo.`;

    // 1. Official Hugging Face Router -> Fal-AI FLUX Kontext (Real Image-to-Image Editing!)
    const hfRes = await fetch("https://router.huggingface.co/fal-ai/fal-ai/flux-kontext/dev", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        image_url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`
      })
    });

    if (hfRes.ok) {
      const data = await hfRes.json();
      const outUrl = data?.images?.[0]?.url || data?.image?.url;
      if (outUrl) {
        const imgFetch = await fetch(outUrl);
        const arr = await imgFetch.arrayBuffer();
        return NextResponse.json({ resultImage: `data:image/jpeg;base64,${Buffer.from(arr).toString("base64")}` });
      }
    }

    const errText = await hfRes.text();
    return NextResponse.json({ error: `Status ${hfRes.status}: ${errText.slice(0, 180)}` }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
