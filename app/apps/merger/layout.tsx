import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merger",
};

export default function MergerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
