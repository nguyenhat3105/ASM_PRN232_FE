import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Shell } from "@/components/shell";
import "./globals.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./atlas.css";
export const metadata: Metadata = {
  title: { default: "TaskTrack — Team workspace", template: "%s | TaskTrack" },
  description: "A clearer view of your projects, people and priorities.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#page-content">
          Skip to content
        </a>
        <Shell>{children}</Shell>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
