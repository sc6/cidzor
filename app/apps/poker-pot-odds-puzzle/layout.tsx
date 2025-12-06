import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Texas Hold 'Em Poker Pot Odds Puzzle",
};

export default function PokerPotOddsPuzzleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
