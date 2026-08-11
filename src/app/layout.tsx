import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "greek"],
  weight: ["400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Physio ΙΑΣΙΣ | Φυσικοθεραπεία στη Θεσσαλονίκη",
  description:
    "Physio ΙΑΣΙΣ — σύγχρονη κλινική φυσικοθεραπείας στη Θεσσαλονίκη. Κλείστε ραντεβού online, γνωρίστε τις υπηρεσίες μας και μιλήστε με τον βοηθό μας.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="el"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
