import Script from "next/script";

export const metadata = {
  title: "RoomCraft AI Architect — Free AI Room & Desk Setup Makeover",
  description:
    "Transform your bedroom, gaming desk setup, or home office in 10 seconds with AI. Preserves exact room geometry, generates paint HEX codes, and sources matching furniture.",
  keywords: [
    "AI room makeover",
    "free AI interior design",
    "gaming desk setup generator",
    "room redesign AI",
    "before and after room AI"
  ],
  verification: {
    google: "weFk2Vahk3mQ8fswgukIraKWnB",
    other: {
      "p:domain_verify": "d0596eb081057332bf1a6e1a66078b23",
      "monetag": "4a3eb29afdf471c77e7b9e13a07bad05"
    }
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#05070D", margin: 0 }}>
        {children}
        <Script id="monetag-inpage-push" strategy="afterInteractive">
          {`(function(s){s.dataset.zone='12365892',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
        </Script>
      </body>
    </html>
  );
}
