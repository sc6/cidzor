import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Getting Started with Next.js",
};

export default function NextJsIntroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
