import localFont from "next/font/local";
import "./globals.css";
import { Web3Provider } from "@/provider/web3-provider";
import { ChainBalanceProvider } from "@/provider/balance-provider";
import SoundProvider from "@/components/sound-provider";

const P2PFont = localFont({
  src: "../../public/fonts/PressStart2P-Regular.ttf",
  variable: "--font-pixel",
  display: "swap",
});

const secondaryPixelFont = localFont({
  src: "../../public/fonts/VT323-Regular.ttf",
  variable: "--font-pixel-secondary",
  display: "swap",
});

export const metadata = {
  title: "Millionaire's Dilemma: Yacht Edition",
  description: "Compare wealth privately and securely using Inco Lightning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${P2PFont.variable} ${secondaryPixelFont.variable} font-pixel antialiased`}
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="fixed inset-0 bg-black/30 pointer-events-none" aria-hidden="true"></div>
        <div className="relative z-10">
          <Web3Provider>
            <ChainBalanceProvider>
              <SoundProvider>
                <div className="min-h-screen flex flex-col">{children}</div>
              </SoundProvider>
            </ChainBalanceProvider>
          </Web3Provider>
        </div>
      </body>
    </html>
  );
}
