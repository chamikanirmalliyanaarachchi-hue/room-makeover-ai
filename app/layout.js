export const metadata = {
  title: "AI Room & Desk Makeover",
  description: "Redesign your room in 10 seconds using AI"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#0f172a", color: "#f8fafc", margin: 0, padding: "20px" }}>
        {children}
      </body>
    </html>
  );
}
