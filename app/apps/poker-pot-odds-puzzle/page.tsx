"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  suit: Suit;
  rank: Rank;
}

const Card = ({ card }: { card: Card }) => {
  const isRed = card.suit === "♥" || card.suit === "♦";

  return (
    <div className="relative w-14 h-20 bg-white dark:bg-slate-100 rounded border-2 border-slate-300 shadow flex flex-col items-center justify-center">
      <div className={`text-xl font-bold ${isRed ? "text-red-600" : "text-slate-900"}`}>
        {card.rank}
      </div>
      <div className={`text-3xl ${isRed ? "text-red-600" : "text-slate-900"}`}>
        {card.suit}
      </div>
    </div>
  );
};

// Helper function to get card value for comparison
const getCardValue = (rank: Rank): number => {
  const values: { [key in Rank]: number } = {
    "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
    "J": 11, "Q": 12, "K": 13, "A": 14
  };
  return values[rank];
};

// Simplified hand evaluation - returns a score for comparison
const evaluateHand = (cards: Card[]): number => {
  const values = cards.map(c => getCardValue(c.rank)).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);

  // Check for pairs, trips, etc.
  const valueCounts = new Map<number, number>();
  values.forEach(v => valueCounts.set(v, (valueCounts.get(v) || 0) + 1));

  const counts = Array.from(valueCounts.values()).sort((a, b) => b - a);
  const maxCount = counts[0];

  const isFlush = suits.every(s => s === suits[0]);

  // Simple scoring: higher is better
  let score = Math.max(...values); // High card base
  if (maxCount === 2) score += 1000; // Pair
  if (maxCount === 3) score += 3000; // Three of a kind
  if (maxCount === 4) score += 7000; // Four of a kind
  if (counts[0] === 3 && counts[1] === 2) score += 6000; // Full house
  if (counts[0] === 2 && counts[1] === 2) score += 2000; // Two pair
  if (isFlush) score += 5000; // Flush

  return score;
};

// Check if player has outs
const hasOuts = (playerCards: Card[], opponentCards: Card[], board: Card[], usedCards: Card[]): boolean => {
  const allUsed = [...playerCards, ...opponentCards, ...board];
  const usedSet = new Set(allUsed.map(c => `${c.rank}${c.suit}`));

  // Get remaining deck
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const remainingDeck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      const cardKey = `${rank}${suit}`;
      if (!usedSet.has(cardKey)) {
        remainingDeck.push({ suit, rank });
      }
    }
  }

  // Check if any river card makes player win
  const opponentScore = evaluateHand([...opponentCards, ...board]);

  for (const riverCard of remainingDeck) {
    const playerScore = evaluateHand([...playerCards, ...board, riverCard]);
    if (playerScore > opponentScore) {
      return true;
    }
  }

  return false;
};

export default function PokerPotOddsPuzzle() {
  const [yourCards, setYourCards] = useState<Card[]>([]);
  const [boardCards, setBoardCards] = useState<Card[]>([]);
  const [opponentCards, setOpponentCards] = useState<Card[]>([]);
  const [potAmount, setPotAmount] = useState<number>(0);
  const [opponentBet, setOpponentBet] = useState<number>(0);

  useEffect(() => {
    const generateValidHand = () => {
      // Create a full deck
      const suits: Suit[] = ["♠", "♥", "♦", "♣"];
      const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
      const deck: Card[] = [];

      for (const suit of suits) {
        for (const rank of ranks) {
          deck.push({ suit, rank });
        }
      }

      // Shuffle deck
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      // Deal cards
      const player = deck.slice(0, 2);
      const board = deck.slice(2, 6);
      const opponent = deck.slice(6, 8);

      // Evaluate hands
      const playerScore = evaluateHand([...player, ...board]);
      const opponentScore = evaluateHand([...opponent, ...board]);

      // Check if opponent is winning and player has outs
      if (opponentScore > playerScore && hasOuts(player, opponent, board, deck.slice(0, 8))) {
        return { player, board, opponent };
      }

      // Try again
      return null;
    };

    // Keep trying until we get a valid hand
    let result = null;
    let attempts = 0;
    while (!result && attempts < 1000) {
      result = generateValidHand();
      attempts++;
    }

    if (result) {
      setYourCards(result.player);
      setBoardCards(result.board);
      setOpponentCards(result.opponent);
    } else {
      // Fallback to random if we can't find a valid hand
      const suits: Suit[] = ["♠", "♥", "♦", "♣"];
      const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
      const deck: Card[] = [];
      for (const suit of suits) {
        for (const rank of ranks) {
          deck.push({ suit, rank });
        }
      }
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      setYourCards(deck.slice(0, 2));
      setBoardCards(deck.slice(2, 6));
      setOpponentCards(deck.slice(6, 8));
    }

    // Generate random pot and bet amounts (multiples of 10, from $10 to $700)
    const randomAmount = () => (Math.floor(Math.random() * 70) + 1) * 10;
    setPotAmount(randomAmount());
    setOpponentBet(randomAmount());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Poker Pot Odds Puzzle
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Test your poker pot odds calculation skills
        </p>

        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Cards Section */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="space-y-6">
              {/* You have */}
              <div>
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  You have
                </h2>
                <div className="flex gap-2">
                  {yourCards.map((card, index) => (
                    <Card key={index} card={card} />
                  ))}
                </div>
              </div>

              {/* Board is */}
              <div>
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Board is
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {boardCards.map((card, index) => (
                    <Card key={index} card={card} />
                  ))}
                </div>
              </div>

              {/* Pot and Bet Info */}
              <div className="text-slate-700 dark:text-slate-300">
                The pot is <span className="font-bold">${potAmount}</span> and your opponent went all in for <span className="font-bold">${opponentBet}</span>.
              </div>

              {/* Opponent accidentally shows */}
              <div>
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Opponent accidentally shows
                </h2>
                <div className="flex gap-2">
                  {opponentCards.map((card, index) => (
                    <Card key={index} card={card} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Answer Section */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="space-y-4">
              {/* Pot Odds */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pot Odds
                </label>
                <input
                  type="text"
                  placeholder="e.g., 3:1"
                  className="w-32 px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>

              {/* Odds Against (Outs) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Odds Against (Outs)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 9"
                  className="w-32 px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>

              {/* Final Decision */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Final Decision
                </label>
                <div className="flex gap-4">
                  <button className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors">
                    Call
                  </button>
                  <button className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors">
                    Fold
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-center text-slate-600 dark:text-slate-400">
            Built with Next.js, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
