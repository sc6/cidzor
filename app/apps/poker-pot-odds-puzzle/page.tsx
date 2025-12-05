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

// Get all 5-card combinations from an array of cards
const getCombinations = (cards: Card[], size: number): Card[][] => {
  if (size > cards.length) return [];
  if (size === cards.length) return [cards];
  if (size === 1) return cards.map(c => [c]);

  const result: Card[][] = [];
  for (let i = 0; i < cards.length - size + 1; i++) {
    const head = cards[i];
    const tailCombos = getCombinations(cards.slice(i + 1), size - 1);
    for (const combo of tailCombos) {
      result.push([head, ...combo]);
    }
  }
  return result;
};

// Evaluate a 5-card poker hand and return a score
const evaluate5CardHand = (fiveCards: Card[], debug = false): number => {
  if (fiveCards.length !== 5) return 0;

  const values = fiveCards.map(c => getCardValue(c.rank)).sort((a, b) => b - a);
  const suits = fiveCards.map(c => c.suit);

  // Count value occurrences
  const valueCounts = new Map<number, number>();
  values.forEach(v => valueCounts.set(v, (valueCounts.get(v) || 0) + 1));

  const counts = Array.from(valueCounts.entries())
    .sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  if (debug) {
    console.log("  5-card hand:", fiveCards.map(c => `${c.rank}${c.suit}`).join(" "));
    console.log("  Counts:", counts.map(([val, cnt]) => `${val}x${cnt}`).join(", "));
  }

  const isFlush = suits.every(s => s === suits[0]);

  // Check for straight (including A-2-3-4-5)
  let isStraight = false;
  const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
  if (uniqueValues.length === 5) {
    if (uniqueValues[0] - uniqueValues[4] === 4) {
      isStraight = true;
    } else if (uniqueValues[0] === 14 && uniqueValues[1] === 5) {
      // A-2-3-4-5 straight (wheel)
      isStraight = true;
    }
  }

  // Hand rankings with proper scoring
  // Format: [hand rank] * 1000000 + [tiebreakers]

  // Straight flush
  if (isStraight && isFlush) {
    const highCard = uniqueValues[0] === 14 && uniqueValues[1] === 5 ? 5 : uniqueValues[0];
    return 8000000 + highCard;
  }

  // Four of a kind
  if (counts[0][1] === 4) {
    return 7000000 + counts[0][0] * 100 + counts[1][0];
  }

  // Full house
  if (counts[0][1] === 3 && counts[1][1] === 2) {
    return 6000000 + counts[0][0] * 100 + counts[1][0];
  }

  // Flush
  if (isFlush) {
    return 5000000 + values[0] * 10000 + values[1] * 1000 + values[2] * 100 + values[3] * 10 + values[4];
  }

  // Straight
  if (isStraight) {
    const highCard = uniqueValues[0] === 14 && uniqueValues[1] === 5 ? 5 : uniqueValues[0];
    return 4000000 + highCard;
  }

  // Three of a kind
  if (counts[0][1] === 3) {
    return 3000000 + counts[0][0] * 10000 + counts[1][0] * 100 + counts[2][0];
  }

  // Two pair
  if (counts[0][1] === 2 && counts[1][1] === 2) {
    return 2000000 + counts[0][0] * 10000 + counts[1][0] * 1000 + counts[2][0];
  }

  // One pair
  if (counts[0][1] === 2) {
    return 1000000 + counts[0][0] * 10000 + counts[1][0] * 1000 + counts[2][0] * 100 + counts[3][0];
  }

  // High card
  return values[0] * 10000 + values[1] * 1000 + values[2] * 100 + values[3] * 10 + values[4];
};

// Evaluate best hand from any number of cards (finds best 5-card combination)
const evaluateHand = (cards: Card[], debug = false): number => {
  if (cards.length < 5) return 0;
  if (cards.length === 5) return evaluate5CardHand(cards, debug);

  // Find all 5-card combinations and return the best score
  const combinations = getCombinations(cards, 5);
  let bestScore = 0;
  let bestCombo: Card[] = [];
  for (const combo of combinations) {
    const score = evaluate5CardHand(combo, false);
    if (score > bestScore) {
      bestScore = score;
      bestCombo = combo;
    }
  }

  if (debug && bestCombo.length > 0) {
    console.log(`  Best 5-card combo from ${cards.length} cards:`);
    evaluate5CardHand(bestCombo, true);
  }

  return bestScore;
};

// Helper to describe hand type
const getHandDescription = (score: number): string => {
  if (score >= 8000000) return "Straight Flush";
  if (score >= 7000000) return "Four of a Kind";
  if (score >= 6000000) return "Full House";
  if (score >= 5000000) return "Flush";
  if (score >= 4000000) return "Straight";
  if (score >= 3000000) return "Three of a Kind";
  if (score >= 2000000) return "Two Pair";
  if (score >= 1000000) return "One Pair";
  return "High Card";
};

// Check if player has outs and return both count and list of out cards
const getOuts = (playerCards: Card[], opponentCards: Card[], board: Card[]): { count: number; cards: Card[] } => {
  console.log("=== CALCULATING OUTS ===");
  console.log("Player cards:", playerCards.map(c => `${c.rank}${c.suit}`).join(", "));
  console.log("Board cards:", board.map(c => `${c.rank}${c.suit}`).join(", "));
  console.log("Opponent cards:", opponentCards.map(c => `${c.rank}${c.suit}`).join(", "));

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

  console.log(`Remaining cards in deck: ${remainingDeck.length}`);

  // Opponent's best hand with current board (before river)
  const opponentCurrentScore = evaluateHand([...opponentCards, ...board]);
  console.log(`Opponent's current hand score: ${opponentCurrentScore} (${getHandDescription(opponentCurrentScore)})`);

  // Player's current best hand (before river)
  const playerCurrentScore = evaluateHand([...playerCards, ...board]);
  console.log(`Player's current hand score: ${playerCurrentScore} (${getHandDescription(playerCurrentScore)})`);

  const outCards: Card[] = [];
  let checkedCount = 0;

  for (const riverCard of remainingDeck) {
    checkedCount++;
    // IMPORTANT: Evaluate BOTH hands with the river card
    const playerScore = evaluateHand([...playerCards, ...board, riverCard]);
    const opponentScore = evaluateHand([...opponentCards, ...board, riverCard]);
    const isOut = playerScore > opponentScore;

    if (checkedCount <= 10 || isOut) {
      console.log(
        `River: ${riverCard.rank}${riverCard.suit} -> Player: ${playerScore} (${getHandDescription(playerScore)}) vs Opponent: ${opponentScore} (${getHandDescription(opponentScore)}) ${
          isOut ? "✓ OUT" : "✗ Not an out"
        }`
      );
    }

    if (isOut) {
      outCards.push(riverCard);
    }
  }

  console.log(`Total outs found: ${outCards.length}`);
  console.log("Out cards:", outCards.map(c => `${c.rank}${c.suit}`).join(", "));
  console.log("=== END OUTS CALCULATION ===\n");

  return { count: outCards.length, cards: outCards };
};

// Check if player has outs and count them
const countOuts = (playerCards: Card[], opponentCards: Card[], board: Card[]): number => {
  return getOuts(playerCards, opponentCards, board).count;
};

// Check if player has outs
const hasOuts = (playerCards: Card[], opponentCards: Card[], board: Card[], usedCards: Card[]): boolean => {
  return countOuts(playerCards, opponentCards, board) > 0;
};

export default function PokerPotOddsPuzzle() {
  const [yourCards, setYourCards] = useState<Card[]>([]);
  const [boardCards, setBoardCards] = useState<Card[]>([]);
  const [opponentCards, setOpponentCards] = useState<Card[]>([]);
  const [potAmount, setPotAmount] = useState<number>(0);
  const [opponentBet, setOpponentBet] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [outs, setOuts] = useState<number>(0);
  const [outCards, setOutCards] = useState<Card[]>([]);
  const [userDecision, setUserDecision] = useState<string>("");

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
      const opponentWinning = opponentScore > playerScore;
      const playerHasOuts = hasOuts(player, opponent, board, deck.slice(0, 8));

      if (attempts % 100 === 0) {
        console.log(`Attempt ${attempts}: Player ${playerScore} (${getHandDescription(playerScore)}) vs Opponent ${opponentScore} (${getHandDescription(opponentScore)}) - Opponent winning: ${opponentWinning}, Player has outs: ${playerHasOuts}`);
      }

      if (opponentWinning && playerHasOuts) {
        console.log(`✓ Valid puzzle found on attempt ${attempts}`);
        console.log(`Player: ${player.map(c => `${c.rank}${c.suit}`).join(", ")} - Score: ${playerScore} (${getHandDescription(playerScore)})`);
        console.log(`Opponent: ${opponent.map(c => `${c.rank}${c.suit}`).join(", ")} - Score: ${opponentScore} (${getHandDescription(opponentScore)})`);
        console.log(`Board: ${board.map(c => `${c.rank}${c.suit}`).join(", ")}`);
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
      const outsData = getOuts(result.player, result.opponent, result.board);
      setOuts(outsData.count);
      setOutCards(outsData.cards);

      // Generate random pot and bet amounts (multiples of 10, from $10 to $700)
      const randomAmount = () => (Math.floor(Math.random() * 70) + 1) * 10;
      const pot = randomAmount();
      const bet = randomAmount();
      setPotAmount(pot);
      setOpponentBet(bet);

      // Log the puzzle in readable format
      console.log("\n🎰 NEW POKER PUZZLE GENERATED:");
      console.log(`In Texas Hold'em, if I have ${result.player.map(c => `${c.rank}${c.suit}`).join(", ")}, opponent has ${result.opponent.map(c => `${c.rank}${c.suit}`).join(", ")}, and board is ${result.board.map(c => `${c.rank}${c.suit}`).join(", ")}, and pot is $${pot} with opponent going all in for $${bet}, what are the pot odds, what are the odds against (outs)?\n`);

      return; // Exit early since we've set everything
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
      const player = deck.slice(0, 2);
      const board = deck.slice(2, 6);
      const opponent = deck.slice(6, 8);
      setYourCards(player);
      setBoardCards(board);
      setOpponentCards(opponent);
      const outsData = getOuts(player, opponent, board);
      setOuts(outsData.count);
      setOutCards(outsData.cards);

      // Generate random pot and bet amounts
      const randomAmount = () => (Math.floor(Math.random() * 70) + 1) * 10;
      const pot = randomAmount();
      const bet = randomAmount();
      setPotAmount(pot);
      setOpponentBet(bet);

      console.log("\n🎰 NEW POKER PUZZLE GENERATED (Fallback):");
      console.log(`In Texas Hold'em, if I have ${player.map(c => `${c.rank}${c.suit}`).join(", ")}, opponent has ${opponent.map(c => `${c.rank}${c.suit}`).join(", ")}, and board is ${board.map(c => `${c.rank}${c.suit}`).join(", ")}, and pot is $${pot} with opponent going all in for $${bet}, what are the pot odds, what are the odds against (outs)?\n`);
    }
  }, []);

  const handleDecision = (decision: string) => {
    setUserDecision(decision);

    console.log("\n📊 CALCULATING POT ODDS:");
    console.log(`Pot: $${potAmount}`);
    console.log(`Opponent all-in bet: $${opponentBet}`);

    const totalPotBeforeCall = potAmount + opponentBet;
    const totalPotAfterCall = potAmount + opponentBet + opponentBet;

    console.log(`Total pot before your call: $${totalPotBeforeCall}`);
    console.log(`Amount you need to call: $${opponentBet}`);
    console.log(`Total pot after your call: $${totalPotAfterCall}`);

    // Pot odds ratio: (pot + opponent bet) / opponent bet
    const potOddsRatio = ((potAmount + opponentBet) / opponentBet).toFixed(2);

    // Pot odds percentage: what you need to call / total pot after call
    const potOddsPercentage = ((opponentBet / totalPotAfterCall) * 100).toFixed(1);

    console.log(`Pot odds ratio: (${potAmount} + ${opponentBet}) / ${opponentBet} = ${totalPotBeforeCall} / ${opponentBet} = ${potOddsRatio}:1`);
    console.log(`Pot odds percentage: ${opponentBet} / ${totalPotAfterCall} = ${potOddsPercentage}%`);
    console.log(`\nOuts: ${outs} cards out of ${52 - 8} remaining cards`);

    const remainingCards = 52 - 8;
    const oddsAgainstPercentage = ((outs / remainingCards) * 100).toFixed(1);

    console.log(`Odds against (outs): ${outs} / ${remainingCards} = ${oddsAgainstPercentage}%`);
    console.log(`Out cards: ${outCards.map(c => `${c.rank}${c.suit}`).join(", ")}`);

    const shouldCall = parseFloat(oddsAgainstPercentage) > parseFloat(potOddsPercentage);
    console.log(`\n✅ Correct decision: ${shouldCall ? "CALL" : "FOLD"}`);
    console.log(`Your decision: ${decision.toUpperCase()}`);
    console.log(`Reasoning: Odds against (${oddsAgainstPercentage}%) ${shouldCall ? ">" : "<"} Pot odds (${potOddsPercentage}%)\n`);

    setShowResults(true);
  };

  // Calculate pot odds ratio: (pot + opponent bet) / opponent bet
  const potOddsRatio = ((potAmount + opponentBet) / opponentBet).toFixed(2);

  // Calculate pot odds percentage: opponent bet / (pot + opponent bet + opponent bet)
  const potOddsPercentage = ((opponentBet / (potAmount + 2 * opponentBet)) * 100).toFixed(1);

  // Calculate odds against: outs / remaining cards (52 - 8 = 44) * 100
  const remainingCards = 52 - 8; // 8 cards are known (2 yours, 4 board, 2 opponent)
  const oddsAgainstPercentage = ((outs / remainingCards) * 100).toFixed(1);

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
                  <button
                    onClick={() => handleDecision("Call")}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                  >
                    Call
                  </button>
                  <button
                    onClick={() => handleDecision("Fold")}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                  >
                    Fold
                  </button>
                </div>
              </div>

              {/* Results */}
              {showResults && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
                    Results
                  </h3>
                  <div className="space-y-2 text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="font-semibold">Pot Odds:</span> {potOddsPercentage}% ({potOddsRatio}:1)
                    </div>
                    <div>
                      <span className="font-semibold">Odds Against (Outs):</span> {oddsAgainstPercentage}% ({outs} outs)
                      <div className="mt-2 flex flex-wrap gap-1">
                        {outCards.map((card, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-sm font-semibold rounded ${
                              card.suit === "♥" || card.suit === "♦"
                                ? "text-red-600 dark:text-red-400"
                                : "text-slate-900 dark:text-slate-100"
                            } bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600`}
                          >
                            {card.rank}{card.suit}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                      <div className="mb-2">
                        <span className="font-semibold">Your Decision:</span>{' '}
                        <span className={`font-bold ${userDecision === "Call" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {userDecision}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Correct Decision:</span>{' '}
                        {parseFloat(oddsAgainstPercentage) > parseFloat(potOddsPercentage) ? (
                          <>
                            <span className="text-green-600 dark:text-green-400 font-bold">Call</span>
                            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                              Your Odds Against ({oddsAgainstPercentage}%) is higher than the Pot Odds ({potOddsPercentage}%), so calling is profitable.
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-red-600 dark:text-red-400 font-bold">Fold</span>
                            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                              Your Odds Against ({oddsAgainstPercentage}%) should be higher than the Pot Odds ({potOddsPercentage}%) to call profitably.
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
