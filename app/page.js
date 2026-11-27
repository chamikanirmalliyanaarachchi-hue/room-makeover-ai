"use client";

import React, { useState, useEffect, useRef } from "react";

// Replace with your real Amazon Associates Tracking ID when ready
const AMAZON_TAG = "roommakeover-20";

/**
 * ============================================================================
 * CUSTOM BESPOKE VECTOR SVG ICON SYSTEM (ZERO STANDARD EMOJIS)
 * ============================================================================
 */
const Icons = {
  LogoMark: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  UploadCloud: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Gamepad: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <line x1="18" y1="11" x2="18.01" y2="11" />
      <rect x="2" y="6" width="20" height="12" rx="4" />
    </svg>
  ),
  CrownLuxury: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  NordicLeaf: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
  CyberBolt: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  JapandiArch: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21V10a8 8 0 0 1 16 0v11" />
      <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
      <line x1="2" y1="21" x2="22" y2="21" />
    </svg>
  ),
  WandSpark: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4V2" />
      <path d="M15 16v-2" />
      <path d="M8 9h2" />
      <path d="M20 9h2" />
      <path d="M17.8 11.8 19 13" />
      <path d="M15 9h.01" />
      <path d="M17.8 6.2 19 5" />
      <path d="m3 21 9-9" />
      <path d="M12.2 6.2 11 5" />
    </svg>
  ),
  Download: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  PinCollage: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  ),
  SplitView: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  ),
  GridView: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="18" rx="1.5" />
      <rect x="14" y="3" width="7" height="18" rx="1.5" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Palette: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  Copy: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Share: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  ArrowUpRight: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  ArrowsHorizontal: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 8 22 12 18 16" />
      <polyline points="6 8 2 12 6 16" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  ),
  History: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
};

const STYLES = [
  {
    id: "Cozy Gaming & RGB Desk Setup",
    label: "Cozy RGB Gaming",
    subtitle: "Acoustic slats & dual-tone neon",
    Icon: Icons.Gamepad,
    badge: "POPULAR",
    accentColor: "#38bdf8"
  },
  {
    id: "Modern Luxury Aesthetic",
    label: "Modern Luxury",
    subtitle: "Fluted walnut & brass cove",
    Icon: Icons.CrownLuxury,
    badge: "EXECUTIVE",
    accentColor: "#fbbf24"
  },
  {
    id: "Minimalist Scandinavian",
    label: "Scandinavian",
    subtitle: "Pale ash wood & daylight",
    Icon: Icons.NordicLeaf,
    badge: "NORDIC",
    accentColor: "#34d399"
  },
  {
    id: "Cyberpunk Neon Studio",
    label: "Cyberpunk Studio",
    subtitle: "3D geometric tiles & tubes",
    Icon: Icons.CyberBolt,
    badge: "CREATOR",
    accentColor: "#e879f9"
  },
  {
    id: "Warm Japandi & Wood Aesthetic",
    label: "Warm Japandi",
    subtitle: "Limewash plaster & cedar",
    Icon: Icons.JapandiArch,
    badge: "ZEN",
    accentColor: "#fb923c"
  }
];

const ROOM_TYPES = ["Gaming & Desk Setup", "Bedroom", "Home Office", "Living Room"];
const BUDGET_TIERS = ["Budget ($100-$300)", "Mid-Range ($300-$800)", "Luxury ($1000+)"];

const LOADING_PHASES = [
  { step: "01", title: "Spatial Geometry Lock", desc: "Mapping existing walls, window frames, doorways & desk bounds..." },
  { step: "02", title: "Architectural Material Synthesis", desc: "Applying high-density wood slats, plaster & surface textures..." },
  { step: "03", title: "Photometric Lighting Pass", desc: "Calculating ray-traced indirect LED & natural daylight reflections..." },
  { step: "04", title: "AI Product & Color Sourcing", desc: "Extracting paint HEX codes & matching global furniture listings..." }
];

const FAQ_ITEMS = [
  {
    q: "Does RoomCraft AI keep my exact room dimensions, windows, and doors?",
    a: "Yes. Unlike generic text-to-image tools, our spatial image-to-image engine preserves your exact wall angles, window placement, doorway openings, and furniture footprint while upgrading finishes in-place."
  },
  {
    q: "How does the AI Bill of Materials & Retailer Finder work?",
    a: "Every generated room design is analyzed in parallel to identify matching furniture, acoustic panels, and LED lighting fixtures, complete with estimated pricing and direct links to Amazon, AliExpress, Temu, and IKEA."
  },
  {
    q: "Can I export Before & After images for Pinterest or TikTok?",
    a: "Yes. Alongside full-resolution single image exports, you can generate a 1000x1500 vertical Before & After comparison collage ready for Pinterest pins, Instagram Reels, or client moodboards."
  }
];

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [compressedBase64, setCompressedBase64] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [roomType, setRoomType] = useState(ROOM_TYPES[0]);
  const [budgetTier, setBudgetTier] = useState(BUDGET_TIERS[1]);
  const [customNotes, setCustomNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [resultImage, setResultImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [palette, setPalette] = useState([]);
  const [copiedHex, setCopiedHex] = useState(null);
  const [error, setError] = useState(null);

  // Credits & Bonus Share Unlock
  const [creditsLeft, setCreditsLeft] = useState(2);
  const [bonusClaimed, setBonusClaimed] = useState(false);

  // Local Studio History (last 3 renders)
  const [history, setHistory] = useState([]);

  // Interactive Compare Slider state
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState("slider");
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("rm_date");
    const savedCount = parseInt(localStorage.getItem("rm_count") || "0", 10);
    const savedBonus = localStorage.getItem("rm_bonus") === "true";

    if (savedDate !== today) {
      localStorage.setItem("rm_date", today);
      localStorage.setItem("rm_count", "0");
      localStorage.setItem("rm_bonus", "false");
      setCreditsLeft(2);
      setBonusClaimed(false);
    } else {
      const maxDaily = savedBonus ? 3 : 2;
      setBonusClaimed(savedBonus);
      setCreditsLeft(Math.max(0, maxDaily - savedCount));
    }

    try {
      const savedHistory = JSON.parse(localStorage.getItem("rm_history") || "[]");
      if (Array.isArray(savedHistory)) setHistory(savedHistory);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!loading) return;
    setPhaseIdx(0);
    const interval = setInterval(() => {
      setPhaseIdx((prev) => (prev + 1) % LOADING_PHASES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setResultImage(null);
    setProducts([]);
    setPalette([]);
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

        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        setPreviewUrl(dataUrl);
        setCompressedBase64(dataUrl.split(",")[1]);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUnlockBonusCredit = () => {
    if (bonusClaimed) return;
    const shareText = encodeURIComponent(
      "Transform your bedroom or desk setup in 10 seconds with RoomCraft AI Architect:"
    );
    const shareUrl = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, "_blank");

    localStorage.setItem("rm_bonus", "true");
    setBonusClaimed(true);
    const used = parseInt(localStorage.getItem("rm_count") || "0", 10);
    setCreditsLeft(Math.max(0, 3 - used));
    setError(null);
  };

  const handleGenerate = async () => {
    if (!compressedBase64) {
      setError("Please upload a photograph of your room or workspace first.");
      return;
    }

    if (creditsLeft <= 0) {
      setError("Daily free quota reached. Share RoomCraft AI below to unlock +1 bonus render today.");
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
          roomType,
          budgetTier,
          customNotes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to render room makeover.");
      }

      setResultImage(data.resultImage);
      setProducts(data.products || []);
      setPalette(data.palette || []);
      setSliderPos(50);

      const used = parseInt(localStorage.getItem("rm_count") || "0", 10) + 1;
      localStorage.setItem("rm_count", used.toString());
      const maxDaily = bonusClaimed ? 3 : 2;
      setCreditsLeft(Math.max(0, maxDaily - used));

      // Save to Recent Studio Renders (max 3 items)
      const newEntry = {
        id: Date.now(),
        style: selectedStyle,
        roomType,
        before: previewUrl,
        after: data.resultImage,
        products: data.products || [],
        palette: data.palette || []
      };
      const updatedHistory = [newEntry, ...history].slice(0, 3);
      setHistory(updatedHistory);
      try {
        localStorage.setItem("rm_history", JSON.stringify(updatedHistory));
      } catch (_) {}
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (entry) => {
    setSelectedStyle(entry.style);
    if (entry.roomType) setRoomType(entry.roomType);
    setPreviewUrl(entry.before);
    setResultImage(entry.after);
    setProducts(entry.products || []);
    setPalette(entry.palette || []);
    setSliderPos(50);
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  const updateSliderFromClientX = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos(Math.round((x / rect.width) * 100));
  };

  const handleDownloadHD = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `roomcraft-ai-${selectedStyle.toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Generates a 1000x1500 Vertical Pinterest Before & After Collage on Client Canvas
   */
  const handleDownloadPinterestCollage = () => {
    if (!previewUrl || !resultImage) return;

    const imgBefore = new Image();
    const imgAfter = new Image();
    imgBefore.crossOrigin = "anonymous";
    imgAfter.crossOrigin = "anonymous";

    imgBefore.onload = () => {
      imgAfter.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 1500;
        const ctx = canvas.getContext("2d");

        // Dark architectural frame
        ctx.fillStyle = "#05070D";
        ctx.fillRect(0, 0, 1000, 1500);

        const drawCover = (img, x, y, w, h) => {
          const scale = Math.max(w / img.width, h / img.height);
          const nw = img.width * scale;
          const nh = img.height * scale;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, 24);
          ctx.clip();
          ctx.drawImage(img, x + (w - nw) / 2, y + (h - nh) / 2, nw, nh);
          ctx.restore();
        };

        // Top: Before
        drawCover(imgBefore, 40, 40, 920, 640);
        // Bottom: After
        drawCover(imgAfter, 40, 720, 920, 640);

        // Badges
        ctx.fillStyle = "rgba(5, 7, 13, 0.85)";
        ctx.beginPath();
        ctx.roundRect(65, 65, 160, 44, 10);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("BEFORE", 102, 94);

        ctx.fillStyle = "#4F46E5";
        ctx.beginPath();
        ctx.roundRect(65, 745, 210, 44, 10);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("AFTER AI", 108, 774);

        // Bottom Branding Bar
        ctx.fillStyle = "#F8FAFC";
        ctx.font = "bold 26px sans-serif";
        ctx.fillText(`RoomCraft AI Architect — ${selectedStyle}`, 44, 1425);
        ctx.fillStyle = "#94A3B8";
        ctx.font = "20px sans-serif";
        ctx.fillText("Redesign your room in 10 seconds • room-makeover-ai-nu.vercel.app", 44, 1462);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `pinterest-room-makeover-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      imgAfter.src = resultImage;
    };
    imgBefore.src = previewUrl;
  };

  const handleCopyHex = (hex) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const totalEstimatedBudget = products.reduce((sum, item) => {
    const num = parseInt(String(item.price || "0").replace(/[^0-9]/g, ""), 10);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#05070D",
        color: "#F8FAFC",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        position: "relative",
        overflowX: "hidden"
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scanBeam {
          0% { top: 0%; opacity: 0.25; }
          50% { top: 96%; opacity: 1; }
          100% { top: 0%; opacity: 0.25; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes revealSlide {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .workspace-grid {
          display: grid;
          grid-template-columns: 1fr 1.45fr;
          gap: 32px;
        }
        .aesthetic-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        .palette-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .dual-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }
        .history-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .aesthetic-card {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .aesthetic-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.28) !important;
          background-color: rgba(30, 41, 59, 0.55) !important;
        }
        .upload-zone {
          transition: all 0.25s ease;
        }
        .upload-zone:hover {
          border-color: rgba(99, 102, 241, 0.7) !important;
          background-color: rgba(15, 23, 42, 0.9) !important;
        }
        .primary-cta {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .primary-cta:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 36px rgba(99, 102, 241, 0.45) !important;
          filter: brightness(1.06);
        }
        .retailer-pill {
          transition: all 0.18s ease;
          text-decoration: none;
        }
        .retailer-pill:hover {
          transform: translateY(-1px);
          background-color: rgba(255, 255, 255, 0.12) !important;
          border-color: rgba(255, 255, 255, 0.32) !important;
          color: #ffffff !important;
        }
        .reveal-block {
          animation: revealSlide 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (max-width: 900px) {
          .workspace-grid { grid-template-columns: 1fr; }
          .aesthetic-grid { grid-template-columns: repeat(2, 1fr); }
          .palette-grid { grid-template-columns: repeat(2, 1fr); }
          .dual-grid { grid-template-columns: 1fr; }
          .history-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Architectural Grid + Radial Spotlight */}
      <div
        className="bg-grid-pattern"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          maskImage: "radial-gradient(ellipse at top, black 25%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at top, black 25%, transparent 80%)"
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "-220px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "460px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />

      {/* Precision Top Navigation Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(20px)",
          backgroundColor: "rgba(5, 7, 13, 0.84)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #4f46e5, #0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 18px rgba(79, 70, 229, 0.45)"
              }}
            >
              <Icons.LogoMark />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.02em", color: "#ffffff" }}>
                RoomCraft
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(255, 255, 255, 0.07)",
                  color: "#94a3b8",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                AI ARCHITECT
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {!bonusClaimed && (
              <button
                type="button"
                onClick={handleUnlockBonusCredit}
                style={{
                  padding: "6px 12px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(99, 102, 241, 0.14)",
                  border: "1px solid rgba(129, 140, 248, 0.35)",
                  color: "#a5b4fc",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Icons.Share />
                <span>+1 Free Render</span>
              </button>
            )}

            <div
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: creditsLeft > 0 ? "#10b981" : "#f43f5e",
                  boxShadow: creditsLeft > 0 ? "0 0 8px #10b981" : "none"
                }}
              />
              <span style={{ color: "#94a3b8" }}>Daily Renders:</span>
              <strong style={{ color: "#f8fafc", fontWeight: 700 }}>
                {creditsLeft} / {bonusClaimed ? 3 : 2}
              </strong>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "46px 24px 80px",
          position: "relative",
          zIndex: 10
        }}
      >
        {/* Minimalist Editorial Hero */}
        <div style={{ textAlign: "center", maxWidth: "740px", margin: "0 auto 42px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 14px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#cbd5e1",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              marginBottom: "18px"
            }}
          >
            <span style={{ color: "#38bdf8" }}>SPATIAL GEOMETRY PRESERVATION</span>
            <span style={{ color: "#475569" }}>|</span>
            <span>PAINT HEX & PRODUCT SOURCING</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.035em",
              marginBottom: "16px",
              color: "#ffffff"
            }}
          >
            Architectural Interior Redesign{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              in 10 Seconds
            </span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "16px", lineHeight: 1.65 }}>
            Upload a photograph of your room or workstation. Our vision engine locks your exact
            structural layout while rendering photorealistic upgrades, paint color codes, and shoppable furniture.
          </p>
        </div>

        {/* Studio Control Console */}
        <div
          style={{
            backgroundColor: "rgba(13, 18, 30, 0.85)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.09)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 30px 70px rgba(0, 0, 0, 0.65)",
            marginBottom: "42px"
          }}
        >
          <div className="workspace-grid">
            {/* Left Column: Image Input */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px"
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#94a3b8"
                  }}
                >
                  01. Source Photograph
                </span>
                {selectedFile && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#34d399" }}>
                    <Icons.CheckCircle /> Ready
                  </span>
                )}
              </div>

              <label
                className="upload-zone"
                style={{
                  position: "relative",
                  flex: 1,
                  minHeight: "340px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "16px",
                  border: "1.5px dashed rgba(255, 255, 255, 0.16)",
                  backgroundColor: "rgba(7, 10, 19, 0.8)",
                  cursor: "pointer",
                  overflow: "hidden"
                }}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Room source"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        right: "12px",
                        padding: "7px 14px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(5, 7, 13, 0.82)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.16)",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#f8fafc"
                      }}
                    >
                      Replace Image
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "28px" }}>
                    <div
                      style={{
                        width: "54px",
                        height: "54px",
                        margin: "0 auto 14px",
                        borderRadius: "14px",
                        backgroundColor: "rgba(99, 102, 241, 0.12)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        color: "#818cf8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Icons.UploadCloud />
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: "6px" }}>
                      Upload room or desk photograph
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      JPG, PNG or WEBP • High-resolution spatial mapping
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
              </label>
            </div>

            {/* Right Column: Aesthetic Selector, Room & Budget Tiers, Prompt */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                    marginBottom: "10px"
                  }}
                >
                  02. Architectural Direction
                </div>

                <div className="aesthetic-grid" style={{ marginBottom: "18px" }}>
                  {STYLES.map((style) => {
                    const active = selectedStyle === style.id;
                    const IconComp = style.Icon;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        className="aesthetic-card"
                        onClick={() => setSelectedStyle(style.id)}
                        style={{
                          textAlign: "left",
                          padding: "13px",
                          borderRadius: "14px",
                          border: active
                            ? `1.5px solid ${style.accentColor}`
                            : "1px solid rgba(255, 255, 255, 0.08)",
                          backgroundColor: active
                            ? "rgba(30, 41, 59, 0.72)"
                            : "rgba(7, 10, 19, 0.75)",
                          boxShadow: active ? `0 8px 24px -6px ${style.accentColor}40` : "none",
                          cursor: "pointer",
                          color: "#ffffff"
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "8px"
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              backgroundColor: active ? `${style.accentColor}22` : "rgba(255,255,255,0.05)",
                              color: active ? style.accentColor : "#94a3b8",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <IconComp />
                          </div>
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              padding: "3px 7px",
                              borderRadius: "5px",
                              backgroundColor: "rgba(255,255,255,0.06)",
                              color: active ? style.accentColor : "#64748b"
                            }}
                          >
                            {style.badge}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "2px" }}>
                          {style.label}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.3 }}>
                          {style.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Room Function & Target Budget Tier Pills */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#94a3b8",
                        marginBottom: "7px"
                      }}
                    >
                      03. Space Function
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {ROOM_TYPES.map((rt) => {
                        const active = roomType === rt;
                        return (
                          <button
                            key={rt}
                            type="button"
                            onClick={() => setRoomType(rt)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              border: active ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.09)",
                              backgroundColor: active ? "rgba(79, 70, 229, 0.25)" : "rgba(7, 10, 19, 0.8)",
                              color: active ? "#ffffff" : "#94a3b8",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            {rt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#94a3b8",
                        marginBottom: "7px"
                      }}
                    >
                      04. Target Sourcing Budget
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {BUDGET_TIERS.map((bt) => {
                        const active = budgetTier === bt;
                        return (
                          <button
                            key={bt}
                            type="button"
                            onClick={() => setBudgetTier(bt)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              border: active ? "1px solid #34d399" : "1px solid rgba(255,255,255,0.09)",
                              backgroundColor: active ? "rgba(16, 185, 129, 0.18)" : "rgba(7, 10, 19, 0.8)",
                              color: active ? "#6ee7b7" : "#94a3b8",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            {bt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                    marginBottom: "7px"
                  }}
                >
                  05. Custom Specification (Optional)
                </div>

                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Specify custom details (e.g., dual curved monitors, warm oak shelving, indoor monstera)..."
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(7, 10, 19, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#f8fafc",
                    fontSize: "13px",
                    outline: "none",
                    marginBottom: "18px"
                  }}
                />
              </div>

              <button
                type="button"
                className="primary-cta"
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  fontWeight: 700,
                  fontSize: "15px",
                  letterSpacing: "-0.01em",
                  color: "#ffffff",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0284c7 100%)",
                  boxShadow: "0 10px 30px rgba(79, 70, 229, 0.35)",
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
                        width: "17px",
                        height: "17px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#ffffff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.75s linear infinite"
                      }}
                    />
                    <span>Rendering Architectural Design...</span>
                  </>
                ) : (
                  <>
                    <Icons.WandSpark />
                    <span>Generate HD Makeover</span>
                  </>
                )}
              </button>

              {error && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "12px 15px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(225, 29, 72, 0.12)",
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                    color: "#fda4af",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap"
                  }}
                >
                  <span>{error}</span>
                  {!bonusClaimed && creditsLeft <= 0 && (
                    <button
                      type="button"
                      onClick={handleUnlockBonusCredit}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#4f46e5",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      Share to Unlock +1
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Precision Laser Scanning Progress State */}
        {loading && previewUrl && (
          <div
            className="reveal-block"
            style={{
              maxWidth: "760px",
              margin: "0 auto 42px",
              backgroundColor: "rgba(13, 18, 30, 0.9)",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.65)"
            }}
          >
            <div
              style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                maxHeight: "420px",
                marginBottom: "20px",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              <img
                src={previewUrl}
                alt="Analyzing geometry"
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55, filter: "contrast(1.1)" }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: "linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)",
                  boxShadow: "0 0 22px #38bdf8",
                  animation: "scanBeam 2.5s ease-in-out infinite"
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#38bdf8", letterSpacing: "0.08em" }}>
                  STAGE {LOADING_PHASES[phaseIdx].step} / 04
                </div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>
                  {LOADING_PHASES[phaseIdx].title}
                </div>
                <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>
                  {LOADING_PHASES[phaseIdx].desc}
                </div>
              </div>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  border: "2.5px solid rgba(56, 189, 248, 0.25)",
                  borderTopColor: "#38bdf8",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  flexShrink: 0
                }}
              />
            </div>
          </div>
        )}

        {/* Interactive Before / After Studio Viewport + Paint HEX Swatches */}
        {resultImage && previewUrl && !loading && (
          <div
            className="reveal-block"
            style={{
              backgroundColor: "rgba(13, 18, 30, 0.88)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.09)",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 30px 70px rgba(0, 0, 0, 0.65)",
              marginBottom: "42px"
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                marginBottom: "24px"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>
                    Rendered Makeover
                  </h2>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(16, 185, 129, 0.14)",
                      color: "#34d399",
                      border: "1px solid rgba(52, 211, 153, 0.3)"
                    }}
                  >
                    {selectedStyle}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  Drag the comparison handle horizontally or export a vertical Pinterest Before & After pin
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div
                  style={{
                    backgroundColor: "rgba(7, 10, 19, 0.95)",
                    padding: "4px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.09)",
                    display: "flex",
                    gap: "4px"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setViewMode("slider")}
                    style={{
                      padding: "7px 12px",
                      borderRadius: "7px",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: viewMode === "slider" ? "rgba(255,255,255,0.12)" : "transparent",
                      color: viewMode === "slider" ? "#ffffff" : "#94a3b8"
                    }}
                  >
                    <Icons.SplitView />
                    <span>Split Slider</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("side")}
                    style={{
                      padding: "7px 12px",
                      borderRadius: "7px",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: viewMode === "side" ? "rgba(255,255,255,0.12)" : "transparent",
                      color: viewMode === "side" ? "#ffffff" : "#94a3b8"
                    }}
                  >
                    <Icons.GridView />
                    <span>Side-by-Side</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPinterestCollage}
                  style={{
                    padding: "9px 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(244, 63, 94, 0.4)",
                    backgroundColor: "rgba(225, 29, 72, 0.16)",
                    color: "#fda4af",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px"
                  }}
                >
                  <Icons.PinCollage />
                  <span>Pinterest Pin (Before+After)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadHD}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: "#ffffff",
                    color: "#05070D",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px"
                  }}
                >
                  <Icons.Download />
                  <span>Export HD</span>
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
                  maxWidth: "880px",
                  margin: "0 auto",
                  aspectRatio: "4 / 3",
                  borderRadius: "16px",
                  overflow: "hidden",
                  userSelect: "none",
                  cursor: "ew-resize",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.65)"
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
                    alt="Original Room"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                <span
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    padding: "5px 11px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(5, 7, 13, 0.78)",
                    backdropFilter: "blur(8px)",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    border: "1px solid rgba(255,255,255,0.14)"
                  }}
                >
                  ORIGINAL
                </span>

                <span
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    padding: "5px 11px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(79, 70, 229, 0.9)",
                    backdropFilter: "blur(8px)",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    border: "1px solid rgba(165, 180, 252, 0.35)"
                  }}
                >
                  AI REDESIGN
                </span>

                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${sliderPos}%`,
                    width: "2px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 14px rgba(255,255,255,0.9)",
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
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      color: "#05070D",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 6px 22px rgba(0,0,0,0.55)"
                    }}
                  >
                    <Icons.ArrowsHorizontal />
                  </div>
                </div>
              </div>
            ) : (
              <div className="dual-grid">
                <div
                  style={{
                    backgroundColor: "rgba(7, 10, 19, 0.8)",
                    padding: "14px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8", marginBottom: "8px" }}>
                    ORIGINAL PHOTOGRAPH
                  </div>
                  <img src={previewUrl} alt="Before" style={{ width: "100%", borderRadius: "10px" }} />
                </div>
                <div
                  style={{
                    backgroundColor: "rgba(7, 10, 19, 0.8)",
                    padding: "14px",
                    borderRadius: "14px",
                    border: "1px solid rgba(99, 102, 241, 0.35)"
                  }}
                >
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", color: "#818cf8", marginBottom: "8px" }}>
                    AI REDESIGN ({selectedStyle.toUpperCase()})
                  </div>
                  <img src={resultImage} alt="After" style={{ width: "100%", borderRadius: "10px" }} />
                </div>
              </div>
            )}

            {/* Architectural Paint & LED HEX Palette Strip */}
            {palette.length > 0 && (
              <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                    marginBottom: "12px"
                  }}
                >
                  <Icons.Palette />
                  <span>Architectural Paint & Lighting Color Codes (Click to Copy HEX)</span>
                </div>

                <div className="palette-grid">
                  {palette.map((swatch, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleCopyHex(swatch.hex)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(7, 10, 19, 0.85)",
                        border: "1px solid rgba(255, 255, 255, 0.09)",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "#ffffff"
                      }}
                    >
                      <span
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "8px",
                          backgroundColor: swatch.hex,
                          border: "1px solid rgba(255,255,255,0.25)",
                          flexShrink: 0
                        }}
                      />
                      <div style={{ overflow: "hidden", flex: 1 }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {swatch.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                          <span>{copiedHex === swatch.hex ? "Copied!" : swatch.hex}</span>
                          <Icons.Copy />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Curated Product Sourcing & Global Retailers */}
        {products.length > 0 && !loading && (
          <div
            className="reveal-block"
            style={{
              backgroundColor: "rgba(13, 18, 30, 0.88)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.09)",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 30px 70px rgba(0, 0, 0, 0.65)",
              marginBottom: "42px"
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                marginBottom: "26px"
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#38bdf8",
                    marginBottom: "6px"
                  }}
                >
                  <Icons.ShoppingBag />
                  <span>AI Bill of Materials & Sourcing ({budgetTier})</span>
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Shop This Exact Aesthetic
                </h3>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "3px" }}>
                  Matched furniture, architectural lighting & decor items available across verified global stores:
                </p>
              </div>

              {totalEstimatedBudget > 0 && (
                <div
                  style={{
                    padding: "12px 20px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    textAlign: "right"
                  }}
                >
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8" }}>
                    ESTIMATED BUILD COST
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>
                    ~${totalEstimatedBudget}
                  </div>
                </div>
              )}
            </div>

            <div className="catalog-grid">
              {products.map((item, idx) => {
                const encodedQuery = encodeURIComponent(item.query || item.name);
                const retailers = [
                  { label: "Amazon", url: `https://www.amazon.com/s?k=${encodedQuery}&tag=${AMAZON_TAG}` },
                  { label: "AliExpress", url: `https://www.aliexpress.com/wholesale?SearchText=${encodedQuery}` },
                  { label: "Temu", url: `https://www.temu.com/search_result.html?search_key=${encodedQuery}` },
                  { label: "IKEA", url: `https://www.ikea.com/us/en/search/?q=${encodedQuery}` }
                ];

                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: "rgba(7, 10, 19, 0.85)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "16px",
                      padding: "22px",
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
                          gap: "10px",
                          marginBottom: "12px"
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            padding: "4px 9px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(255, 255, 255, 0.06)",
                            color: "#94a3b8"
                          }}
                        >
                          {item.category}
                        </span>
                        <span style={{ fontSize: "15px", fontWeight: 800, color: "#34d399" }}>
                          {item.price}
                        </span>
                      </div>

                      <h4 style={{ fontWeight: 700, fontSize: "16px", color: "#f8fafc", marginBottom: "6px", lineHeight: 1.35 }}>
                        {item.name}
                      </h4>
                      <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.55, marginBottom: "18px" }}>
                        {item.reason}
                      </p>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#64748b",
                          fontWeight: 700,
                          marginBottom: "8px"
                        }}
                      >
                        Available Retailers
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        {retailers.map((store) => (
                          <a
                            key={store.label}
                            href={store.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="retailer-pill"
                            style={{
                              padding: "8px 12px",
                              borderRadius: "9px",
                              backgroundColor: "rgba(255, 255, 255, 0.04)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: "#cbd5e1",
                              fontSize: "12px",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between"
                            }}
                          >
                            <span>{store.label}</span>
                            <Icons.ArrowUpRight />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Studio Renders History Strip */}
        {history.length > 0 && (
          <div
            style={{
              backgroundColor: "rgba(13, 18, 30, 0.72)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "24px",
              padding: "28px",
              marginBottom: "42px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ color: "#818cf8" }}>
                <Icons.History />
              </span>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc" }}>
                Recent Studio Renders (Click to Reload)
              </h3>
            </div>

            <div className="history-grid">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => loadFromHistory(entry)}
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(7, 10, 19, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    cursor: "pointer",
                    color: "#ffffff"
                  }}
                >
                  <img
                    src={entry.after}
                    alt={entry.style}
                    style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px" }}
                  />
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>{entry.style}</div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                    {entry.roomType || "Workspace"} • {entry.products?.length || 0} sourced items
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editorial SEO & Architectural FAQ Section */}
        <section
          style={{
            backgroundColor: "rgba(13, 18, 30, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "24px",
            padding: "32px"
          }}
        >
          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#818cf8", marginBottom: "6px" }}>
              ARCHITECTURAL STUDIO FAQ
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>
              How RoomCraft AI Works
            </h3>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {FAQ_ITEMS.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  padding: "18px 20px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(7, 10, 19, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.07)"
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: "6px" }}>
                  {faq.q}
                </div>
                <div style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
