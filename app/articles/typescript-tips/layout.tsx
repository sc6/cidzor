import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TypeScript Best Practices",
};

export default function TypeScriptTipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
