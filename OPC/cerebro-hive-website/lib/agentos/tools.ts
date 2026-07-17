// Cerebro Tool Registry — a small set of tools that genuinely execute.
// The calculator is a real recursive-descent parser/evaluator (no eval()).
// The knowledge search genuinely scores and ranks the real product catalog
// already shipping in lib/data/products — it is not canned copy.

import { allProductsData } from "@/lib/data/products";

export interface Tool {
  name: string;
  description: string;
  run: (input: string) => string;
}

// ---------- Calculator: real recursive-descent parser for + - * / ^ ( ) ----------

class ExprParser {
  private pos = 0;
  constructor(private src: string) {}

  private peek(): string {
    return this.src[this.pos] ?? "";
  }
  private skipWs() {
    while (/\s/.test(this.peek())) this.pos++;
  }
  parse(): number {
    this.skipWs();
    const value = this.parseExpr();
    this.skipWs();
    if (this.pos < this.src.length) {
      throw new Error(`Unexpected character '${this.peek()}' at position ${this.pos}`);
    }
    return value;
  }
  private parseExpr(): number {
    let value = this.parseTerm();
    this.skipWs();
    while (this.peek() === "+" || this.peek() === "-") {
      const op = this.peek();
      this.pos++;
      const rhs = this.parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
      this.skipWs();
    }
    return value;
  }
  private parseTerm(): number {
    let value = this.parsePow();
    this.skipWs();
    while (this.peek() === "*" || this.peek() === "/") {
      const op = this.peek();
      this.pos++;
      const rhs = this.parsePow();
      if (op === "/" && rhs === 0) throw new Error("Division by zero");
      value = op === "*" ? value * rhs : value / rhs;
      this.skipWs();
    }
    return value;
  }
  private parsePow(): number {
    const base = this.parseUnary();
    this.skipWs();
    if (this.peek() === "^") {
      this.pos++;
      const exp = this.parsePow(); // right-associative
      return Math.pow(base, exp);
    }
    return base;
  }
  private parseUnary(): number {
    this.skipWs();
    if (this.peek() === "-") {
      this.pos++;
      return -this.parseUnary();
    }
    if (this.peek() === "+") {
      this.pos++;
      return this.parseUnary();
    }
    return this.parseAtom();
  }
  private parseAtom(): number {
    this.skipWs();
    if (this.peek() === "(") {
      this.pos++;
      const value = this.parseExpr();
      this.skipWs();
      if (this.peek() !== ")") throw new Error("Expected closing ')'");
      this.pos++;
      return value;
    }
    const start = this.pos;
    while (/[0-9.]/.test(this.peek())) this.pos++;
    if (this.pos === start) throw new Error(`Expected number at position ${this.pos}`);
    const numStr = this.src.slice(start, this.pos);
    const value = Number(numStr);
    if (Number.isNaN(value)) throw new Error(`Invalid number '${numStr}'`);
    return value;
  }
}

/** Extract the first plausible arithmetic expression from free text. */
export function extractExpression(input: string): string | null {
  const match = input.match(/-?\d+(\.\d+)?(\s*[\^\+\-\*\/]\s*\(?\s*-?\d+(\.\d+)?\)?)+/);
  return match ? match[0] : null;
}

function calculatorTool(input: string): string {
  const expr = extractExpression(input) ?? input;
  try {
    const result = new ExprParser(expr).parse();
    return `${expr.trim()} = ${result}`;
  } catch (e) {
    return `Could not evaluate '${expr}': ${(e as Error).message}`;
  }
}

// ---------- Knowledge search: real keyword scoring over the real catalog ----------

function knowledgeSearchTool(input: string): string {
  const terms = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const scored = allProductsData.map((p) => {
    const haystack = `${p.name} ${p.tagline} ${p.description}`.toLowerCase();
    const score = terms.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0);
    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score > 0).slice(0, 3);

  if (top.length === 0) {
    return "No matching product found in the catalog for that query.";
  }

  return top
    .map((t) => `${t.product.name} (match score ${t.score}): ${t.product.tagline}`)
    .join(" | ");
}

// ---------- Date/time: real system clock, real date math ----------

function dateTimeTool(input: string): string {
  const now = new Date();
  const daysMatch = input.match(/(\d+)\s*days?/i);
  if (daysMatch) {
    const n = parseInt(daysMatch[1], 10);
    const future = new Date(now.getTime() + n * 86400000);
    return `Today is ${now.toISOString().slice(0, 10)}. ${n} days from now is ${future.toISOString().slice(0, 10)}.`;
  }
  return `Current server time: ${now.toISOString()}`;
}

// ---------- Text stats: real computation on the given text ----------

function textStatsTool(input: string): string {
  const words = input.trim().split(/\s+/).filter(Boolean);
  const chars = input.length;
  const readingTimeSec = Math.max(1, Math.round((words.length / 200) * 60));
  return `${words.length} words, ${chars} characters, ~${readingTimeSec}s reading time.`;
}

export const toolRegistry: Record<string, Tool> = {
  calculator: {
    name: "calculator",
    description: "Evaluates arithmetic expressions with a real parser (+ - * / ^ parentheses).",
    run: calculatorTool,
  },
  knowledgeSearch: {
    name: "knowledgeSearch",
    description: "Keyword-ranked search over the live CerebroHive product catalog.",
    run: knowledgeSearchTool,
  },
  dateTime: {
    name: "dateTime",
    description: "Returns the real server date/time and does simple date arithmetic.",
    run: dateTimeTool,
  },
  textStats: {
    name: "textStats",
    description: "Computes word count, character count, and reading time for input text.",
    run: textStatsTool,
  },
};

export function runTool(name: string, input: string): string {
  const tool = toolRegistry[name];
  if (!tool) return `Unknown tool '${name}'.`;
  return tool.run(input);
}
