"use client";
import { useState, useEffect } from "react";

const STYLES = [
  "Cozy Gaming & RGB Desk Setup",
  "Minimalist Japandi Bedroom",
  "Modern Luxury Aesthetic",
  "Budget Renter-Friendly Boho",
  "Dark Academia Study Room"
];

export default function Home() {
  const [image, setImage] = useState(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [style, setStyle] = useState(STYLES[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usesLeft, setUsesLeft] = useState(2);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem("room_ai_limit") || "{}");
    if (saved.date === today) {
      setUsesLeft(Math.max(0, 2 - saved.count));
    } else {
      localStorage.setItem("room_ai_limit", JSON.stringify({ date: today, count: 0 }));
      setUsesLeft(2);
    }
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const generateMakeover = async () => {
    if (!image) return setError("Please upload a room photo first.");
    if (usesLeft <= 0) return setError("Daily free limit (2 designs) reached! Come back tomorrow.");

    setLoading(true);
    setError("");
    try {
      const base64 = image.split(",")[1];
      const res = await fetch("/api/makeover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType, style })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setResult(data.resultImage);
      const today = new Date().toDateString();
      const saved = JSON.parse(localStorage.getItem("room_ai_limit") || "{}");
      const newCount = (saved.date === today ? saved.count : 0) + 1;
      localStorage.setItem("room_ai_limit", JSON.stringify({ date: today, count: newCount }));
      setUsesLeft(Math.max(0, 2 - newCount));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#0f172a", color: "#f8fafc", margin: 0, padding: "20px" }}>
        <div style={{ maxWidth: "850px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.3rem", marginBottom: "8px" }}>✨ AI Room & Desk Makeover</h1>
          <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
            Upload your room photo & transform it in 10 seconds. Free designs left today: <b>{usesLeft}/2</b>
          </p>

          <div style={{ background: "#1e293b", padding: "24px", borderRadius: "16px", border: "1px solid #334155" }}>
            <input type="file" accept="image/*" onChange={handleUpload} style={{ marginBottom: "16px", color: "#cbd5e1" }} />

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Choose Aesthetic Style:</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: "8px", width: "100%", maxWidth: "360px", fontSize: "1rem" }}
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              onClick={generateMakeover}
              disabled={loading || usesLeft <= 0}
              style={{
                background: loading ? "#475569" : "#6366f1",
                color: "white",
                border: "none",
                padding: "12px 28px",
                borderRadius: "10px",
                fontSize: "1.05rem",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              {loading ? "Designing Your Room..." : "Generate Makeover Free"}
            </button>

            {error && <p style={{ color: "#f87171", marginTop: "12px" }}>{error}</p>}
          </div>

          {(image || result) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "28px" }}>
              {image && (
                <div style={{ background: "#1e293b", padding: "12px", borderRadius: "12px" }}>
                  <h3>Before</h3>
                  <img src={image} alt="Before" style={{ width: "100%", borderRadius: "8px" }} />
                </div>
              )}
              {result && (
                <div style={{ background: "#1e293b", padding: "12px", borderRadius: "12px" }}>
                  <h3>After ({style})</h3>
                  <img src={result} alt="After" style={{ width: "100%", borderRadius: "8px" }} />
                  <a
                    href={result}
                    download="ai-room-makeover.png"
                    style={{ display: "inline-block", marginTop: "12px", background: "#10b981", color: "white", padding: "8px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "600" }}
                  >
                    Download HD Design
                  </a>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: "40px", padding: "20px", background: "#1e293b", borderRadius: "14px", textAlign: "left" }}>
            <h3 style={{ marginTop: 0 }}>🛍️ Shop This Aesthetic Look</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Upgrade your room with popular items used in these designs:</p>
            <ul style={{ lineHeight: "1.9", color: "#38bdf8" }}>
              <li><a href="https://www.amazon.com/s?k=smart+rgb+led+light+bars" target="_blank" rel="noreferrer" style={{ color: "inherit" }}>Smart RGB Ambient LED Light Bars</a></li>
              <li><a href="https://www.amazon.com/s?k=minimalist+felt+desk+mat" target="_blank" rel="noreferrer" style={{ color: "inherit" }}>Minimalist Felt Desk Mat & Organizer</a></li>
              <li><a href="https://www.amazon.com/s?k=warm+aesthetic+sunset+lamp" target="_blank" rel="noreferrer" style={{ color: "inherit" }}>Warm Aesthetic Sunset Projection Lamp</a></li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  );
}
