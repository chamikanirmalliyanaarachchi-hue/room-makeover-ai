import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#05070D",
        color: "#cbd5e1",
        fontFamily: "'Inter', sans-serif",
        padding: "60px 24px"
      }}
    >
      <div style={{ maxWidth: "780px", margin: "0 auto", lineHeight: 1.75 }}>
        <Link href="/" style={{ color: "#818cf8", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
          ← Back to RoomCraft AI Studio
        </Link>

        <h1 style={{ color: "#ffffff", fontSize: "32px", fontWeight: 800, marginTop: "20px", marginBottom: "16px" }}>
          Privacy Policy & Affiliate Disclosure
        </h1>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "28px" }}>
          Last Updated: November 2026
        </p>

        <h2 style={{ color: "#f8fafc", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>
          1. Image Processing & Data Privacy
        </h2>
        <p>
          RoomCraft AI processes uploaded room photographs solely to generate architectural interior redesign previews.
          Uploaded images are compressed locally in your browser and transmitted securely for AI rendering without being
          permanently stored on public galleries.
        </p>

        <h2 style={{ color: "#f8fafc", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>
          2. Advertising & Cookies
        </h2>
        <p>
          We may use third-party advertising networks (including Google AdSense) to serve ads when you visit our
          website. These companies may use cookies or web beacons to display relevant advertisements based on your
          visits to this and other websites.
        </p>

        <h2 style={{ color: "#f8fafc", fontSize: "18px", marginTop: "24px", marginBottom: "8px" }}>
          3. Affiliate Disclosure
        </h2>
        <p>
          RoomCraft AI participates in affiliate marketing programs including the Amazon Services LLC Associates
          Program. When you click on recommended furniture or lighting links and make a purchase, we may earn a small
          commission at no extra cost to you.
        </p>
      </div>
    </div>
  );
}
