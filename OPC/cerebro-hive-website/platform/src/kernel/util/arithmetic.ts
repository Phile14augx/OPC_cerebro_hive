/** Safe recursive-descent arithmetic evaluator (no eval / Function). */
export function evaluateExpression(src: string): number | undefined {
  let i = 0;
  const s = src.replace(/\s+/g, "");
  function parseNumber(): number | undefined {
    const m = /^-?\d+(\.\d+)?/.exec(s.slice(i));
    if (!m) return undefined;
    i += m[0].length;
    return Number(m[0]);
  }
  function parseFactor(): number | undefined {
    if (s[i] === "(") { i++; const v = parseExpr(); if (s[i] === ")") i++; return v; }
    return parseNumber();
  }
  function parsePower(): number | undefined {
    let base = parseFactor();
    while (base !== undefined && s.startsWith("**", i)) { i += 2; const exp = parseFactor(); if (exp === undefined) return undefined; base = base ** exp; }
    return base;
  }
  function parseTerm(): number | undefined {
    let left = parsePower();
    while (left !== undefined && (s[i] === "*" || s[i] === "/")) {
      const op = s[i]; i++;
      const right = parsePower();
      if (right === undefined) return undefined;
      left = op === "*" ? left * right : right === 0 ? NaN : left / right;
    }
    return left;
  }
  function parseExpr(): number | undefined {
    let left = parseTerm();
    while (left !== undefined && (s[i] === "+" || s[i] === "-")) {
      const op = s[i]; i++;
      const right = parseTerm();
      if (right === undefined) return undefined;
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }
  const v = parseExpr();
  return v !== undefined && Number.isFinite(v) ? v : undefined;
}

/** Extract the most substantial computable expression from free text. */
export function extractExpression(text: string): string | undefined {
  const candidates = (text.match(/[-+*/^().\d\s]+/g) ?? [])
    .map(c => c.trim())
    .filter(c => /\d/.test(c) && /[-+*/^]/.test(c))
    .sort((a, b) => b.length - a.length);
  return candidates[0];
}
