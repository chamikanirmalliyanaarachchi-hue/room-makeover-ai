import { NextResponse } from "next/server";

export const maxDuration = 60;

async function uploadTempImage(buffer, mimeType) {
  const blob = new Blob([buffer], { type: mimeType || "image/jpeg" });

  // 1. Catbox.moe (Direct permanent CDN link that Pollinations servers can always fetch)
  try {
    const fd1 = new FormData();
    fd1.append("reqtype", "fileupload");
    fd1.append("fileToUpload", blob, "room.jpg");
    const res1 = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      headers: { "User-Agent": "Mozilla/5.0" },
      body: fd1
    });
    if (res1.ok) {
      const url1 = (await res1.text()).trim();
      if (url1.startsWith("https://files.catbox.moe/")) return url1;
    }
  } catch (_) {}

  // 2. Uguu.se fallback
  try {
    const fd2 = new FormData();
    fd2.append("files[]", blob, "room.jpg");
    const res2 = await fetch("https://uguu.se/upload", {
      method: "POST",
      headers: { "User-Agent": "Mozilla/5.0" },
      body: fd2
    });
    if (res2.ok) {
      const json2 = await res2.json();
      const url2 = json2?.files?.[0]?.url;
      if (url2) return url2;
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

    // Strict Image-to-Image editing prompt
    const prompt = `Edit this exact room photo into a ${style}. Strictly preserve the exact same camera angle, room geometry, left computer desk position, PC monitor and tower placement, barred window on the left, wall structure, and open doorway on the right. Upgrade the old desk, chair, curtains, wall paint, floor, and lighting into a photorealistic luxury interior design.`;

    const origin = req.headers.get("origin") || "https://room-makeover-ai-nu.vercel.app";

    // Only use true Image-to-Image models (never text-only fallback!)
    const endpoints = [
      `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=kontext&image=${encodeURIComponent(tempImageUrl)}&width=1024&height=768&nologo=true&seed=${seed}`,
      `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=seedream&image=${encodeURIComponent(tempImageUrl)}&width=1024&height=768&nologo=true&seed=${seed}`
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
      { error: `Image-to-Image (${lastStatus}): ${lastMsg}` },
      { status: 500 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}import { NextResponse } from "next/server";

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
