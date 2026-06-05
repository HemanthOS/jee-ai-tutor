import "./globals.css";

export const metadata = {
  title: "JEE AI Tutor",
  description: "AI-powered JEE learning prototype",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}