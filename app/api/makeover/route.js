import { NextResponse } from "next/server";

export const maxDuration = 60;

async function uploadTempImage(buffer, mimeType) {
  const blob = new Blob([buffer], { type: mimeType || "image/jpeg" });

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
    const rawKey = process.env.POLLINATIONS_API_KEY || "";
    const apiKey = rawKey.replace(/['"\s]/g, "");

    if (!apiKey) {
      return NextResponse.json({ error: "POLLINATIONS_API_KEY missing in Vercel" }, { status: 500 });
    }

    const buffer = Buffer.from(imageBase64, "base64");
    const seed = Math.floor(Math.random() * 1000000);

    const tempImageUrl = await uploadTempImage(buffer, mimeType);
    if (!tempImageUrl) {
      return NextResponse.json({ error: "Image upload host busy. Please try again." }, { status: 500 });
    }

    const prompt = `Keep the exact same room layout, camera angle, window position, doorway position, and computer desk placement from this photo, but completely renovate and upgrade it into an ultra-realistic ${style}. Replace old curtains with modern designer blinds, upgrade the desk, chair, PC setup, wall finishes, floor, and add warm architectural LED lighting, indoor plants, and luxury decor. Photorealistic 8k interior design photography.`;

    const origin = req.headers.get("origin") || "https://room-makeover-ai-nu.vercel.app";

    const endpoints = [
      `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=kontext&image=${encodeURIComponent(tempImageUrl)}&width=1024&height=768&nologo=true&seed=${seed}`,
      `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=flux&width=1024&height=768&nologo=true&seed=${seed}`
    ];

    let lastStatus = 500;
    let lastMsg = "Busy";

    for (const url of endpoints) {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Origin: origin,
          Referer: `${origin}/`,
          "User-Agent": "Mozilla/5.0"
        }
      });
      const contentType = res.headers.get("content-type") || "";

      if (res.ok && contentType.startsWith("image/")) {
        const arr = await res.arrayBuffer();
        return NextResponse.json({ resultImage: `data:image/jpeg;base64,${Buffer.from(arr).toString("base64")}` });
      }

      lastStatus = res.status;
      lastMsg = (await res.text()).slice(0, 140);
    }

    return NextResponse.json(
      { error: `Key(${apiKey.slice(0, 5)}...) -> Server (${lastStatus}): ${lastMsg}` },
      { status: 500 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
