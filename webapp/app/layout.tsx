import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthStatus from "../components/AuthStatus";

export const metadata: Metadata = {
  title: "DOW Protocol",
  description: "On-Chain Monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex justify-end p-4">
            <AuthStatus />
          </div>
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}