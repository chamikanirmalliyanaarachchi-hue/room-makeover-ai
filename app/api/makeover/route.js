import { NextResponse } from "next/server";

async function uploadTempImage(buffer, mimeType) {
  const blob = new Blob([buffer], { type: mimeType || "image/jpeg" });

  // Option 1: tmpfiles.org
  try {
    const fd1 = new FormData();
    fd1.append("file", blob, "room.jpg");
    const res1 = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      headers: { "User-Agent": "Mozilla/5.0" },
      body: fd1
    });
    if (res1.ok) {
      const json1 = await res1.json();
      const url = json1?.data?.url;
      if (url) return url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
    }
  } catch (_) {}

  // Option 2: 0x0.st fallback
  try {
    const fd2 = new FormData();
    fd2.append("file", blob, "room.jpg");
    const res2 = await fetch("https://0x0.st", {
      method: "POST",
      headers: { "User-Agent": "curl/8.0" },
      body: fd2
    });
    if (res2.ok) {
      const txt2 = (await res2.text()).trim();
      if (txt2.startsWith("http")) return txt2;
    }
  } catch (_) {}

  return null;
}

export async function POST(req) {
  try {
    const { imageBase64, mimeType, style } = await req.json();
    const buffer = Buffer.from(imageBase64, "base64");

    const tempImageUrl = await uploadTempImage(buffer, mimeType);
    if (!tempImageUrl) {
      return NextResponse.json({ error: "Image upload host busy. Please try again." }, { status: 500 });
    }

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
