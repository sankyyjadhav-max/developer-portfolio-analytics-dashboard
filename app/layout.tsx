import "./globals.css";

export const metadata = {
  title: "DevPulse Portfolio",
  description: "Developer Portfolio Analytics Dashboard",
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