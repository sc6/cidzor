"use client";

import { useState } from "react";
import Header from "../../components/Header";

export default function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return a / b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay("0.");
      setNewNumber(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const Button = ({ value, onClick, className = "" }: { value: string; onClick: () => void; className?: string }) => (
    <button
      onClick={onClick}
      className={`p-6 text-xl font-semibold rounded-lg transition-colors ${className}`}
    >
      {value}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Calculator
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          A modern calculator with basic operations
        </p>

        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="mb-6 p-6 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="text-right text-4xl font-bold text-slate-900 dark:text-slate-100 break-all">
              {display}
            </div>
            {operation && (
              <div className="text-right text-sm text-slate-500 dark:text-slate-400 mt-2">
                {previousValue} {operation}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Button
              value="C"
              onClick={handleClear}
              className="col-span-2 bg-red-500 hover:bg-red-600 text-white"
            />
            <Button
              value="÷"
              onClick={() => handleOperation("÷")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            />
            <Button
              value="×"
              onClick={() => handleOperation("×")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            />

            {[7, 8, 9].map(num => (
              <Button
                key={num}
                value={String(num)}
                onClick={() => handleNumber(String(num))}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100"
              />
            ))}
            <Button
              value="-"
              onClick={() => handleOperation("-")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            />

            {[4, 5, 6].map(num => (
              <Button
                key={num}
                value={String(num)}
                onClick={() => handleNumber(String(num))}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100"
              />
            ))}
            <Button
              value="+"
              onClick={() => handleOperation("+")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            />

            {[1, 2, 3].map(num => (
              <Button
                key={num}
                value={String(num)}
                onClick={() => handleNumber(String(num))}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100"
              />
            ))}
            <Button
              value="="
              onClick={handleEquals}
              className="row-span-2 bg-green-500 hover:bg-green-600 text-white"
            />

            <Button
              value="0"
              onClick={() => handleNumber("0")}
              className="col-span-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100"
            />
            <Button
              value="."
              onClick={handleDecimal}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
