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
    accent: "from-cyan-500 to-fuchsia-500"
  },
  {
    id: "Modern Luxury Aesthetic",
    label: "Modern Luxury",
    icon: "✨",
    tag: "5-Star Hotel",
    accent: "from-amber-400 to-orange-600"
  },
  {
    id: "Minimalist Scandinavian",
    label: "Scandinavian",
    icon: "🌿",
    tag: "Clean & Airy",
    accent: "from-emerald-400 to-teal-600"
  },
  {
    id: "Cyberpunk Neon Studio",
    label: "Cyberpunk Studio",
    icon: "⚡",
    tag: "Creator Pro",
    accent: "from-blue-500 to-pink-500"
  },
  {
    id: "Warm Japandi & Wood Aesthetic",
    label: "Warm Japandi",
    icon: "🎋",
    tag: "Zen Wood",
    accent: "from-orange-400 to-stone-500"
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

  // Interactive Compare Slider state (0 to 100%)
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
    <div className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Custom CSS Keyframes for Laser Scanner & Floating Glow */}
      <style jsx global>{`
        @keyframes scanLaser {
          0% { top: 0%; opacity: 0.2; }
          50% { top: 96%; opacity: 1; }
          100% { top: 0%; opacity: 0.2; }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.08); opacity: 0.6; }
        }
        .animate-scan {
          animation: scanLaser 2.6s ease-in-out infinite;
        }
        .animate-orb {
          animation: pulseGlow 6s ease-in-out infinite;
        }
      `}</style>

      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-orb" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl animate-orb" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Glass Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#070B14]/75 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/30">
              ✨
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                RoomCraft AI
              </span>
              <span className="ml-2 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Studio Pro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${creditsLeft > 0 ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
              <span className="text-slate-300">Free Designs Today:</span>
              <span className="font-bold text-white">{creditsLeft}/2</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-indigo-300 text-xs font-medium mb-4">
            <span>⚡ Exact Room Geometry Lock</span>
            <span>•</span>
            <span>🛍️ AI Smart Product Finder</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Transform Your Room in{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              10 Seconds with AI
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Upload your bedroom, gaming desk, or office photo. Our AI keeps your exact walls, windows, and layout intact while redesigning your space and finding every item to shop.
          </p>
        </div>

        {/* Interactive Studio Control Card */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Upload Dropzone */}
            <div className="lg:col-span-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                1. Upload Your Room Photo
              </label>

              <label className="group relative flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed border-white/15 hover:border-indigo-400/70 bg-slate-900/60 hover:bg-indigo-950/20 transition-all duration-300 cursor-pointer overflow-hidden">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Uploaded room"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 rounded-xl bg-white/15 backdrop-blur-md text-xs font-semibold border border-white/25">
                        📸 Click to Change Photo
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      📷
                    </div>
                    <p className="text-sm font-semibold text-slate-200 mb-1">
                      Drop your room photo here or click to browse
                    </p>
                    <p className="text-xs text-slate-500">
                      Supports JPG, PNG, WEBP • Auto-HD Enhanced
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {selectedFile && (
                <p className="mt-2 text-xs text-slate-400 truncate">
                  ✅ Loaded: <span className="text-slate-200">{selectedFile.name}</span>
                </p>
              )}
            </div>

            {/* Right Column: Animated Style Selector + Custom Prompt */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                  2. Choose Interior Aesthetic
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
                  {STYLES.map((style) => {
                    const active = selectedStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedStyle(style.id)}
                        className={`relative text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          active
                            ? "bg-indigo-600/20 border-indigo-400 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                            : "bg-slate-900/60 border-white/10 hover:border-white/25 hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xl">{style.icon}</span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${style.accent} text-white`}
                          >
                            {style.tag}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-white">{style.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Optional Custom AI Request Input */}
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  3. Custom AI Touch (Optional)
                </label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g., Add dual monitors, warm LED strip under bed, indoor monstera plant..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 focus:border-indigo-400 focus:outline-none text-sm text-white placeholder-slate-500 mb-5 transition-colors"
                />
              </div>

              {/* Generate Action Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Designing Your Dream Room...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Generate Free HD Makeover</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Animated Laser Scanning Preview while Loading */}
        {loading && previewUrl && (
          <div className="max-w-3xl mx-auto mb-12 bg-white/[0.04] border border-indigo-400/30 rounded-3xl p-6 text-center shadow-2xl">
            <div className="relative rounded-2xl overflow-hidden max-h-[420px] mx-auto mb-4 border border-white/10">
              <img
                src={previewUrl}
                alt="Scanning room"
                className="w-full h-full object-cover opacity-65"
              />
              {/* Animated Laser Scan Beam */}
              <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_25px_#22d3ee] animate-scan" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-cyan-300 animate-pulse">
              {LOADING_STEPS[loadingStepIdx]}
            </p>
          </div>
        )}

        {/* Interactive Before / After Comparison Studio */}
        {resultImage && previewUrl && !loading && (
          <div className="mb-12 bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>🎉 Your AI Room Makeover</span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {selectedStyle}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Drag the center slider left & right to compare your original room with the AI makeover
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="bg-slate-900/90 p-1 rounded-xl border border-white/10 flex text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setViewMode("slider")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === "slider" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ↔️ Split Slider
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("side")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === "side" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🖼️ Side-by-Side
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>⬇️ Download HD</span>
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
                className="relative w-full max-w-4xl mx-auto aspect-[4/3] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-white/15 shadow-2xl"
              >
                {/* After Image (Full Background) */}
                <img
                  src={resultImage}
                  alt="After Makeover"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Before Image (Clipped by Slider Position) */}
                <div
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={previewUrl}
                    alt="Before Original"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Labels */}
                <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/65 backdrop-blur-md text-xs font-bold text-white border border-white/15">
                  BEFORE
                </span>
                <span className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-indigo-600/85 backdrop-blur-md text-xs font-bold text-white border border-indigo-300/30">
                  AFTER AI ✨
                </span>

                {/* Vertical Divider Handle */}
                <div
                  style={{ left: `${sliderPos}%` }}
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)] -translate-x-1/2 pointer-events-none"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-slate-900 font-extrabold text-xs flex items-center justify-center shadow-xl border-2 border-indigo-500">
                    ↔
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/70 p-3 rounded-2xl border border-white/10">
                  <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Before (Original)</div>
                  <img src={previewUrl} alt="Before" className="w-full rounded-xl object-cover" />
                </div>
                <div className="bg-slate-900/70 p-3 rounded-2xl border border-indigo-400/30">
                  <div className="text-xs font-bold text-indigo-300 mb-2 uppercase">After ({selectedStyle})</div>
                  <img src={resultImage} alt="After" className="w-full rounded-xl object-cover" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Smart Shopping & Site Finder Section */}
        {products.length > 0 && !loading && (
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  🛍️ AI-Curated Room Shopping List
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  Get Every Item From This Design
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Our AI analyzed your makeover and found the exact furniture, lighting & decor across top global stores:
                </p>
              </div>

              {totalEstimatedBudget > 0 && (
                <div className="px-4 py-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 text-right">
                  <div className="text-[11px] uppercase tracking-wider text-indigo-300">
                    Est. Full Makeover Budget
                  </div>
                  <div className="text-xl font-extrabold text-white">~${totalEstimatedBudget}</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((item, idx) => {
                const encodedQuery = encodeURIComponent(item.query || item.name);
                const amazonUrl = `https://www.amazon.com/s?k=${encodedQuery}&tag=${AMAZON_TAG}`;
                const aliUrl = `https://www.aliexpress.com/wholesale?SearchText=${encodedQuery}`;
                const temuUrl = `https://www.temu.com/search_result.html?search_key=${encodedQuery}`;
                const ikeaUrl = `https://www.ikea.com/us/en/search/?q=${encodedQuery}`;

                return (
                  <div
                    key={idx}
                    className="group bg-slate-900/75 hover:bg-slate-900 border border-white/10 hover:border-indigo-400/40 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                          {item.category}
                        </span>
                        <span className="text-sm font-extrabold text-emerald-400">{item.price}</span>
                      </div>
                      <h4 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors mb-1.5">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">{item.reason}</p>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                        Compare & Buy On:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-xs font-bold text-center transition"
                        >
                          🛒 Amazon
                        </a>
                        <a
                          href={aliUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-rose-300 text-xs font-bold text-center transition"
                        >
                          🌏 AliExpress
                        </a>
                        <a
                          href={temuUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-400/30 text-orange-300 text-xs font-bold text-center transition"
                        >
                          🧡 Temu
                        </a>
                        <a
                          href={ikeaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 text-xs font-bold text-center transition"
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
