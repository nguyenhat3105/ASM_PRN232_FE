import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Shell } from "@/components/shell";
import "./globals.css";
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
        <Shell>
          <div id="page-content">{children}</div>
        </Shell>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
