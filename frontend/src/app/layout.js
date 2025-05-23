import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/provider/web3-provider";
import { ChainBalanceProvider } from "@/provider/balance-provider";
import SoundProvider from "@/components/sound-provider";

// Pixel fonts from Google Fonts
const pixelFont = Press_Start_2P({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixel",
});

const secondaryPixelFont = VT323({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixel-secondary",
});

export const metadata = {
  title: "Millionaire's Dilemma: Yacht Edition",
  description: "Compare wealth privately and securely using Inco Lightning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${pixelFont.variable} ${secondaryPixelFont.variable} font-pixel antialiased`}
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
