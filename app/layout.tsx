import type { Metadata } from "next";
import "./globals.css";
import { TaskProvider } from "./context/TaskContext";

export const metadata: Metadata = {
  title: "Moorepay",
  description: "Document review prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <TaskProvider>{children}</TaskProvider>
      </body>
    </html>
  );
}
