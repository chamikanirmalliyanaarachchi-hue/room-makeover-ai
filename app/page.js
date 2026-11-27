"use client";

import React, { useState, useEffect, useRef } from "react";

// Replace with your real Amazon Associates Tracking ID when ready
const AMAZON_TAG = "roommakeover-20";

const STYLES = [
  {
    id: "Cozy Gaming & RGB Desk Setup",
    label: "Cozy RGB Gaming",
    icon: "🎮",
    tag: "Most Popular",
    gradient: "linear-gradient(135deg, #06b6d4, #d946ef)"
  },
  {
    id: "Modern Luxury Aesthetic",
    label: "Modern Luxury",
    icon: "✨",
    tag: "5-Star Hotel",
    gradient: "linear-gradient(135deg, #f59e0b, #ea580c)"
  },
  {
    id: "Minimalist Scandinavian",
    label: "Scandinavian",
    icon: "🌿",
    tag: "Clean & Airy",
    gradient: "linear-gradient(135deg, #10b981, #0d9488)"
  },
  {
    id: "Cyberpunk Neon Studio",
    label: "Cyberpunk Studio",
    icon: "⚡",
    tag: "Creator Pro",
    gradient: "linear-gradient(135deg, #3b82f6, #ec4899)"
  },
  {
    id: "Warm Japandi & Wood Aesthetic",
    label: "Warm Japandi",
    icon: "🎋",
    tag: "Zen Wood",
    gradient: "linear-gradient(135deg, #fb923c, #78716c)"
  }
];

const LOADING_STEPS = [
  "📐 Scanning exact room walls, windows & furniture geometry...",
  "🪵 Mapping architectural wall panels & flooring textures...",
  "💡 Simulating ray-traced ambient & LED lighting physics...",
  "🛍️ Curating matching furniture & decor shopping list..."
];

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [compressedBase64, setCompressedBase64] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [customNotes, setCustomNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [resultImage, setResultImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [creditsLeft, setCreditsLeft] = useState(2);

  // Interactive Compare Slider state
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState("slider"); // "slider" | "side"
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("rm_date");
    const savedCount = parseInt(localStorage.getItem("rm_count") || "0", 10);

    if (savedDate !== today) {
      localStorage.setItem("rm_date", today);
      localStorage.setItem("rm_count", "0");
      setCreditsLeft(2);
    } else {
      setCreditsLeft(Math.max(0, 2 - savedCount));
    }
  }, []);

  useEffect(() => {
    if (!loading) return;
    setLoadingStepIdx(0);
    const timer = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [loading]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setResultImage(null);
    setProducts([]);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setPreviewUrl(dataUrl);
        setCompressedBase64(dataUrl.split(",")[1]);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!compressedBase64) {
      setError("Please upload a photo of your room or desk first!");
      return;
    }

    if (creditsLeft <= 0) {
      setError("You've used your 2 free AI designs for today. Come back tomorrow for 2 more free makeovers!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/makeover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: compressedBase64,
          mimeType: "image/jpeg",
          style: selectedStyle,
          customNotes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate makeover");
      }

      setResultImage(data.resultImage);
      setProducts(data.products || []);
      setSliderPos(50);

      const used = parseInt(localStorage.getItem("rm_count") || "0", 10) + 1;
      localStorage.setItem("rm_count", used.toString());
      setCreditsLeft(Math.max(0, 2 - used));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSliderFromClientX = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos(Math.round((x / rect.width) * 100));
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `ai-room-makeover-${selectedStyle.toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalEstimatedBudget = products.reduce((sum, item) => {
    const num = parseInt(String(item.price || "0").replace(/[^0-9]/g, ""), 10);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#070B14",
        color: "#F8FAFC",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        position: "relative",
        overflowX: "hidden"
      }}
    >
      {/* Pure CSS Animations & Responsive Grid Helpers */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scanLaser {
          0% { top: 2%; opacity: 0.3; }
          50% { top: 94%; opacity: 1; }
          100% { top: 2%; opacity: 0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-18px) scale(1.06); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .studio-grid {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 28px;
        }
        .style-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }
        .side-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .style-btn {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .style-btn:hover {
          transform: translateY(-2px);
          border-color: rgba(129, 140, 248, 0.6) !important;
        }
        .gen-btn {
          transition: all 0.25s ease;
        }
        .gen-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 35px rgba(99, 102, 241, 0.5) !important;
        }
        .shop-btn {
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .shop-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.18);
        }
        .fade-in-up {
          animation: fadeUp 0.55s ease forwards;
        }
        @media (max-width: 860px) {
          .studio-grid { grid-template-columns: 1fr; }
          .style-cards-grid { grid-template-columns: repeat(2, 1fr); }
          .side-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Glowing Ambient Orbs */}
      <div
        style={{
          position: "fixed",
          top: "-120px",
          left: "-120px",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
          animation: "floatOrb 7s ease-in-out infinite",
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "25%",
          right: "-140px",
          width: "440px",
          height: "440px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217,70,239,0.16) 0%, transparent 70%)",
          animation: "floatOrb 9s ease-in-out infinite",
          pointerEvents: "none"
        }}
      />

      {/* Sticky Glass Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(18px)",
          backgroundColor: "rgba(7, 11, 20, 0.8)",
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <div
          style={{
            maxWidth: "1120px",
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1, #a855f7, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)"
              }}
            >
              ✨
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "19px",
                letterSpacing: "-0.02em",
                background: "linear-gradient(90deg, #ffffff, #c7d2fe)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              RoomCraft AI
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "3px 9px",
                borderRadius: "999px",
                backgroundColor: "rgba(99, 102, 241, 0.18)",
                color: "#a5b4fc",
                border: "1px solid rgba(129, 140, 248, 0.35)"
              }}
            >
              Studio Pro
            </span>
          </div>

          <div
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: creditsLeft > 0 ? "#34d399" : "#fb7185",
                boxShadow: creditsLeft > 0 ? "0 0 10px #34d399" : "none"
              }}
            />
            <span style={{ color: "#cbd5e1" }}>Free Designs Today:</span>
            <strong style={{ color: "#ffffff" }}>{creditsLeft}/2</strong>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "38px 20px 70px",
          position: "relative",
          zIndex: 10
        }}
      >
        {/* Hero Section */}
        <div style={{ textAlign: "center", maxWidth: "740px", margin: "0 auto 38px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 14px",
              borderRadius: "999px",
              backgroundColor: "rgba(99, 102, 241, 0.12)",
              border: "1px solid rgba(129, 140, 248, 0.25)",
              color: "#a5b4fc",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "16px"
            }}
          >
            <span>⚡ Exact Room Geometry Lock</span>
            <span>•</span>
            <span>🛍️ AI Smart Product Finder</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(30px, 5vw, 48px)",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: "14px"
            }}
          >
            Transform Your Room in{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #22d3ee, #818cf8, #e879f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              10 Seconds with AI
            </span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "16px", lineHeight: 1.6 }}>
            Upload your bedroom, gaming desk, or office photo. Our AI keeps your exact walls,
            windows, and layout intact while redesigning your space and finding every item to shop.
          </p>
        </div>

        {/* Studio Control Glass Card */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.72)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
            padding: "28px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
            marginBottom: "38px"
          }}
        >
          <div className="studio-grid">
            {/* Left: Upload Dropzone */}
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#94a3b8",
                  marginBottom: "10px"
                }}
              >
                1. Upload Your Room Photo
              </div>

              <label
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "260px",
                  borderRadius: "18px",
                  border: "2px dashed rgba(148, 163, 184, 0.3)",
                  backgroundColor: "rgba(9, 13, 24, 0.75)",
                  cursor: "pointer",
                  overflow: "hidden",
                  transition: "border-color 0.25s ease"
                }}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Uploaded room"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        right: "12px",
                        padding: "6px 12px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(0,0,0,0.72)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        fontSize: "12px",
                        fontWeight: 600
                      }}
                    >
                      📸 Change Photo
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "24px" }}>
                    <div
                      style={{
                        width: "54px",
                        height: "54px",
                        margin: "0 auto 12px",
                        borderRadius: "16px",
                        backgroundColor: "rgba(99, 102, 241, 0.16)",
                        border: "1px solid rgba(129, 140, 248, 0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px"
                      }}
                    >
                      📷
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0", marginBottom: "4px" }}>
                      Click here to upload your room photo
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      Supports JPG, PNG, WEBP • Auto-HD Enhanced
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>

              {selectedFile && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#94a3b8" }}>
                  ✅ Ready: <span style={{ color: "#e2e8f0" }}>{selectedFile.name}</span>
                </div>
              )}
            </div>

            {/* Right: Animated Style Cards + Custom Touch + Generate */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#94a3b8",
                    marginBottom: "10px"
                  }}
                >
                  2. Choose Interior Aesthetic
                </div>

                <div className="style-cards-grid" style={{ marginBottom: "18px" }}>
                  {STYLES.map((style) => {
                    const active = selectedStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        className="style-btn"
                        onClick={() => setSelectedStyle(style.id)}
                        style={{
                          textAlign: "left",
                          padding: "13px",
                          borderRadius: "16px",
                          border: active
                            ? "1.5px solid #818cf8"
                            : "1px solid rgba(255,255,255,0.1)",
                          backgroundColor: active
                            ? "rgba(79, 70, 229, 0.24)"
                            : "rgba(9, 13, 24, 0.7)",
                          boxShadow: active ? "0 8px 24px rgba(99, 102, 241, 0.25)" : "none",
                          cursor: "pointer",
                          color: "#ffffff"
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "6px"
                          }}
                        >
                          <span style={{ fontSize: "20px" }}>{style.icon}</span>
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: "999px",
                              background: style.gradient,
                              color: "#ffffff"
                            }}
                          >
                            {style.tag}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "13px" }}>{style.label}</div>
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#94a3b8",
                    marginBottom: "8px"
                  }}
                >
                  3. Custom AI Touch (Optional)
                </div>

                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g., Add dual monitors, warm LED strip under desk, indoor monstera plant..."
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(9, 13, 24, 0.85)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    fontSize: "13px",
                    outline: "none",
                    marginBottom: "18px"
                  }}
                />
              </div>

              <button
                type="button"
                className="gen-btn"
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  borderRadius: "16px",
                  border: "none",
                  fontWeight: 800,
                  fontSize: "16px",
                  color: "#ffffff",
                  background: "linear-gradient(90deg, #4f46e5, #9333ea, #06b6d4)",
                  boxShadow: "0 10px 28px rgba(99, 102, 241, 0.35)",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.65 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px"
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "2.5px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#ffffff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.8s linear infinite"
                      }}
                    />
                    <span>Designing Your Dream Room...</span>
                  </>
                ) : (
                  <span>✨ Generate Free HD Makeover</span>
                )}
              </button>

              {error && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(244, 63, 94, 0.14)",
                    border: "1px solid rgba(244, 63, 94, 0.35)",
                    color: "#fda4af",
                    fontSize: "13px"
                  }}
                >
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Laser Scanning Animation While Loading */}
        {loading && previewUrl && (
          <div
            className="fade-in-up"
            style={{
              maxWidth: "720px",
              margin: "0 auto 40px",
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              borderRadius: "24px",
              padding: "22px",
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}
          >
            <div
              style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                maxHeight: "400px",
                marginBottom: "16px",
                border: "1px solid rgba(255,255,255,0.12)"
              }}
            >
              <img
                src={previewUrl}
                alt="Scanning room"
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.65 }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: "5px",
                  background: "linear-gradient(90deg, transparent, #22d3ee, #a855f7, transparent)",
                  boxShadow: "0 0 24px #22d3ee",
                  animation: "scanLaser 2.4s ease-in-out infinite"
                }}
              />
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#67e8f9" }}>
              {LOADING_STEPS[loadingStepIdx]}
            </div>
          </div>
        )}

        {/* Interactive Before / After Comparison Studio */}
        {resultImage && previewUrl && !loading && (
          <div
            className="fade-in-up"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.78)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
              marginBottom: "38px"
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                marginBottom: "22px"
              }}
            >
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span>🎉 Your AI Room Makeover</span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "4px 12px",
                      borderRadius: "999px",
                      backgroundColor: "rgba(16, 185, 129, 0.16)",
                      color: "#6ee7b7",
                      border: "1px solid rgba(52, 211, 153, 0.35)"
                    }}
                  >
                    {selectedStyle}
                  </span>
                </h2>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                  Drag the center slider left & right to compare your original room with the AI makeover
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div
                  style={{
                    backgroundColor: "rgba(9, 13, 24, 0.9)",
                    padding: "4px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    gap: "4px"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setViewMode("slider")}
                    style={{
                      padding: "7px 12px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      backgroundColor: viewMode === "slider" ? "#4f46e5" : "transparent",
                      color: viewMode === "slider" ? "#ffffff" : "#94a3b8"
                    }}
                  >
                    ↔️ Split Slider
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("side")}
                    style={{
                      padding: "7px 12px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      backgroundColor: viewMode === "side" ? "#4f46e5" : "transparent",
                      color: viewMode === "side" ? "#ffffff" : "#94a3b8"
                    }}
                  >
                    🖼️ Side-by-Side
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "#059669",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(5, 150, 105, 0.35)"
                  }}
                >
                  ⬇️ Download HD
                </button>
              </div>
            </div>

            {viewMode === "slider" ? (
              <div
                ref={sliderRef}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={(e) => isDragging && updateSliderFromClientX(e.clientX)}
                onTouchMove={(e) => updateSliderFromClientX(e.touches[0].clientX)}
                onClick={(e) => updateSliderFromClientX(e.clientX)}
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "860px",
                  margin: "0 auto",
                  aspectRatio: "4 / 3",
                  borderRadius: "18px",
                  overflow: "hidden",
                  userSelect: "none",
                  cursor: "ew-resize",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
                }}
              >
                <img
                  src={resultImage}
                  alt="After Makeover"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
                  }}
                >
                  <img
                    src={previewUrl}
                    alt="Before Original"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                <span
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    padding: "5px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    backdropFilter: "blur(6px)",
                    fontSize: "11px",
                    fontWeight: 800,
                    border: "1px solid rgba(255,255,255,0.18)"
                  }}
                >
                  BEFORE
                </span>

                <span
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    padding: "5px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(79, 70, 229, 0.88)",
                    backdropFilter: "blur(6px)",
                    fontSize: "11px",
                    fontWeight: 800,
                    border: "1px solid rgba(165, 180, 252, 0.4)"
                  }}
                >
                  AFTER AI ✨
                </span>

                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${sliderPos}%`,
                    width: "3px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 15px rgba(255,255,255,0.9)",
                    transform: "translateX(-50%)",
                    pointerEvents: "none"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      color: "#0f172a",
                      fontWeight: 900,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
                      border: "2.5px solid #6366f1"
                    }}
                  >
                    ↔
                  </div>
                </div>
              </div>
            ) : (
              <div className="side-grid">
                <div
                  style={{
                    backgroundColor: "rgba(9, 13, 24, 0.75)",
                    padding: "14px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", marginBottom: "8px" }}>
                    BEFORE (ORIGINAL)
                  </div>
                  <img src={previewUrl} alt="Before" style={{ width: "100%", borderRadius: "12px" }} />
                </div>
                <div
                  style={{
                    backgroundColor: "rgba(9, 13, 24, 0.75)",
                    padding: "14px",
                    borderRadius: "16px",
                    border: "1px solid rgba(129, 140, 248, 0.35)"
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#a5b4fc", marginBottom: "8px" }}>
                    AFTER ({selectedStyle.toUpperCase()})
                  </div>
                  <img src={resultImage} alt="After" style={{ width: "100%", borderRadius: "12px" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Smart Shopping & Site Finder Section */}
        {products.length > 0 && !loading && (
          <div
            className="fade-in-up"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.78)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.55)"
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                marginBottom: "22px"
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#22d3ee"
                  }}
                >
                  🛍️ AI-Curated Room Shopping List
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px" }}>
                  Get Every Item From This Design
                </h3>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "3px" }}>
                  Our AI analyzed your makeover and found the exact furniture, lighting & decor across top global stores:
                </p>
              </div>

              {totalEstimatedBudget > 0 && (
                <div
                  style={{
                    padding: "10px 18px",
                    borderRadius: "16px",
                    backgroundColor: "rgba(99, 102, 241, 0.16)",
                    border: "1px solid rgba(129, 140, 248, 0.35)",
                    textAlign: "right"
                  }}
                >
                  <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#a5b4fc" }}>
                    Est. Full Makeover Budget
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff" }}>
                    ~${totalEstimatedBudget}
                  </div>
                </div>
              )}
            </div>

            <div className="products-grid">
              {products.map((item, idx) => {
                const encodedQuery = encodeURIComponent(item.query || item.name);
                const amazonUrl = `https://www.amazon.com/s?k=${encodedQuery}&tag=${AMAZON_TAG}`;
                const aliUrl = `https://www.aliexpress.com/wholesale?SearchText=${encodedQuery}`;
                const temuUrl = `https://www.temu.com/search_result.html?search_key=${encodedQuery}`;
                const ikeaUrl = `https://www.ikea.com/us/en/search/?q=${encodedQuery}`;

                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: "rgba(9, 13, 24, 0.85)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "18px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          marginBottom: "10px"
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: "999px",
                            backgroundColor: "rgba(255,255,255,0.08)",
                            color: "#cbd5e1"
                          }}
                        >
                          {item.category}
                        </span>
                        <span style={{ fontSize: "15px", fontWeight: 900, color: "#34d399" }}>
                          {item.price}
                        </span>
                      </div>

                      <h4 style={{ fontWeight: 800, fontSize: "16px", color: "#ffffff", marginBottom: "6px" }}>
                        {item.name}
                      </h4>
                      <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5, marginBottom: "16px" }}>
                        {item.reason}
                      </p>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#64748b",
                          fontWeight: 700,
                          marginBottom: "8px"
                        }}
                      >
                        Compare & Buy On:
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <a
                          href={amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-btn"
                          style={{
                            padding: "8px 10px",
                            borderRadius: "10px",
                            backgroundColor: "rgba(245, 158, 11, 0.16)",
                            border: "1px solid rgba(251, 191, 36, 0.35)",
                            color: "#fcd34d",
                            fontSize: "12px",
                            fontWeight: 700,
                            textAlign: "center"
                          }}
                        >
                          🛒 Amazon
                        </a>
                        <a
                          href={aliUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-btn"
                          style={{
                            padding: "8px 10px",
                            borderRadius: "10px",
                            backgroundColor: "rgba(244, 63, 94, 0.16)",
                            border: "1px solid rgba(251, 113, 133, 0.35)",
                            color: "#fda4af",
                            fontSize: "12px",
                            fontWeight: 700,
                            textAlign: "center"
                          }}
                        >
                          🌏 AliExpress
                        </a>
                        <a
                          href={temuUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-btn"
                          style={{
                            padding: "8px 10px",
                            borderRadius: "10px",
                            backgroundColor: "rgba(249, 115, 22, 0.16)",
                            border: "1px solid rgba(251, 146, 60, 0.35)",
                            color: "#fdba74",
                            fontSize: "12px",
                            fontWeight: 700,
                            textAlign: "center"
                          }}
                        >
                          🧡 Temu
                        </a>
                        <a
                          href={ikeaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-btn"
                          style={{
                            padding: "8px 10px",
                            borderRadius: "10px",
                            backgroundColor: "rgba(14, 165, 233, 0.16)",
                            border: "1px solid rgba(56, 189, 248, 0.35)",
                            color: "#7dd3fc",
                            fontSize: "12px",
                            fontWeight: 700,
                            textAlign: "center"
                          }}
                        >
                          🇸🇪 IKEA
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
