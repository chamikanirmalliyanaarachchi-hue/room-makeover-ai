import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { imageBase64, mimeType, style } = await req.json();

    // 1. Host the temporary input image briefly so Kontext Image-to-Image model can read exact room geometry
    const formData = new FormData();
    const buffer = Buffer.from(imageBase64, "base64");
    const blob = new Blob([buffer], { type: mimeType || "image/jpeg" });
    formData.append("reqtype", "fileupload");
    formData.append("time", "1h");
    formData.append("fileToUpload", blob, "room.jpg");

    const uploadRes = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
      method: "POST",
      body: formData
    });

    const tempImageUrl = (await uploadRes.text()).trim();
    if (!tempImageUrl.startsWith("http")) {
      return NextResponse.json({ error: "Could not process uploaded image. Try again." }, { status: 500 });
    }

    // 2. Real Image-to-Image Makeover using FLUX Kontext (keeps exact walls, desk, window, door & PC position)
    const prompt = `Keep the exact same room layout, camera angle, window position, doorway position, and computer desk placement from this photo, but completely renovate and upgrade it into an ultra-realistic ${style}. Replace old curtains with modern designer blinds, upgrade the desk, chair, PC setup, wall finishes, floor, and add warm architectural LED lighting, indoor plants, and luxury decor. Photorealistic 8k interior design photography.`;

    const seed = Math.floor(Math.random() * 1000000);
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=kontext&image=${encodeURIComponent(tempImageUrl)}&width=1024&height=768&nologo=true&seed=${seed}`;

    const imgRes = await fetch(apiUrl);
    if (!imgRes.ok) {
      return NextResponse.json({ error: "AI designer is busy right now. Please click Generate again." }, { status: 500 });
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const base64Out = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({ resultImage: `data:image/jpeg;base64,${base64Out}` });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
