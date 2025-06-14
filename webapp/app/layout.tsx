// ... import ...
import Header from "../components/Header";
import Footer from "../components/Footer";

// ...
export default function RootLayout({ children }: ...) {
  return (
    <html lang="en">
      <body className="bg-black">
        <div className="flex flex-col min-h-screen">
          <Header /> {/* Header di sini */}
          {children} {/* Ini adalah isi dari page.tsx */}
          <Footer /> {/* Footer di sini */}
        </div>
      </body>
    </html>
  );
}