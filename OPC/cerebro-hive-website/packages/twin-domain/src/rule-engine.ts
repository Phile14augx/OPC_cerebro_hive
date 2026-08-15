export type TwinRule = { key: string; expression: string };

export type RuleEvaluation = {
  key: string;
  expression: string;
  fired: boolean;
  parseError?: string;
};

type Literal = number | string | boolean;
type Operator = '&&' | '||' | '>=' | '<=' | '==' | '!=' | '>' | '<';
type Token =
  | { kind: 'ident'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'string'; value: string }
  | { kind: 'bool'; value: boolean }
  | { kind: 'op'; value: Operator }
  | { kind: 'lparen' }
  | { kind: 'rparen' };

type Ast =
  | { kind: 'ident'; name: string }
  | { kind: 'literal'; value: Literal }
  | { kind: 'binary'; op: Operator; left: Ast; right: Ast };

function isOp(token: Token | undefined, value: Operator): token is { kind: 'op'; value: Operator } {
  return token?.kind === 'op' && token.value === value;
}

function kebabToCamel(value: string) {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function camelToKebab(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function lookupStateValue(state: Record<string, unknown>, key: string) {
  if (Object.prototype.hasOwnProperty.call(state, key)) return state[key];
  const camel = kebabToCamel(key);
  if (camel !== key && Object.prototype.hasOwnProperty.call(state, camel)) return state[camel];
  const kebab = camelToKebab(key);
  if (kebab !== key && Object.prototype.hasOwnProperty.call(state, kebab)) return state[kebab];
  return undefined;
}

function tokenize(expression: string): Token[] | { error: string } {
  const tokens: Token[] = [];
  let index = 0;
  const peek = (offset = 0) => expression[index + offset] ?? '';
  while (index < expression.length) {
    const char = peek();
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    const two = expression.slice(index, index + 2);
    if (two === '&&' || two === '||' || two === '>=' || two === '<=' || two === '==' || two === '!=') {
      tokens.push({ kind: 'op', value: two });
      index += 2;
      continue;
    }
    if (char === '>' || char === '<') {
      tokens.push({ kind: 'op', value: char });
      index += 1;
      continue;
    }
    if (char === '(') {
      tokens.push({ kind: 'lparen' });
      index += 1;
      continue;
    }
    if (char === ')') {
      tokens.push({ kind: 'rparen' });
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      const quote = char;
      index += 1;
      let value = '';
      while (index < expression.length && peek() !== quote) {
        if (peek() === '\\' && peek(1)) {
          value += peek(1);
          index += 2;
          continue;
        }
        value += peek();
        index += 1;
      }
      if (peek() !== quote) return { error: 'Unterminated string.' };
      index += 1;
      tokens.push({ kind: 'string', value });
      continue;
    }
    if (char === '-' || (char >= '0' && char <= '9')) {
      const match = expression.slice(index).match(/^-?\d+(\.\d+)?/);
      if (!match) return { error: `Unexpected character: ${char}` };
      tokens.push({ kind: 'number', value: Number(match[0]) });
      index += match[0].length;
      continue;
    }
    if (/[a-zA-Z_]/.test(char)) {
      const match = expression.slice(index).match(/^[a-zA-Z_][a-zA-Z0-9_-]*/);
      if (!match) return { error: `Unexpected character: ${char}` };
      if (match[0] === 'true' || match[0] === 'false') {
        tokens.push({ kind: 'bool', value: match[0] === 'true' });
      } else {
        tokens.push({ kind: 'ident', value: match[0] });
      }
      index += match[0].length;
      continue;
    }
    return { error: `Unexpected character: ${char}` };
  }
  return tokens;
}

function parseExpression(tokens: Token[]): Ast | { error: string } {
  let index = 0;
  const peek = () => tokens[index];
  const take = () => tokens[index++];

  function parseOr(): Ast | { error: string } {
    let left = parseAnd();
    if ('error' in left) return left;
    while (isOp(peek(), '||')) {
      take();
      const right = parseAnd();
      if ('error' in right) return right;
      left = { kind: 'binary', op: '||', left, right };
    }
    return left;
  }

  function parseAnd(): Ast | { error: string } {
    let left = parseComparison();
    if ('error' in left) return left;
    while (isOp(peek(), '&&')) {
      take();
      const right = parseComparison();
      if ('error' in right) return right;
      left = { kind: 'binary', op: '&&', left, right };
    }
    return left;
  }

  function parseComparison(): Ast | { error: string } {
    const left = parsePrimary();
    if ('error' in left) return left;
    const operator = peek();
    if (operator?.kind !== 'op' || operator.value === '&&' || operator.value === '||') return left;
    take();
    const right = parsePrimary();
    if ('error' in right) return right;
    return { kind: 'binary', op: operator.value, left, right };
  }

  function parsePrimary(): Ast | { error: string } {
    const token = take();
    if (!token) return { error: 'Unexpected end of expression.' };
    if (token.kind === 'ident') return { kind: 'ident', name: token.value };
    if (token.kind === 'number') return { kind: 'literal', value: token.value };
    if (token.kind === 'string') return { kind: 'literal', value: token.value };
    if (token.kind === 'bool') return { kind: 'literal', value: token.value };
    if (token.kind === 'lparen') {
      const inner = parseOr();
      if ('error' in inner) return inner;
      if (peek()?.kind !== 'rparen') return { error: 'Missing closing parenthesis.' };
      take();
      return inner;
    }
    return { error: 'Unexpected token in expression.' };
  }

  const ast = parseOr();
  if ('error' in ast) return ast;
  if (index !== tokens.length) return { error: 'Unexpected trailing tokens.' };
  return ast;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function compare(op: string, left: unknown, right: unknown): boolean {
  if (typeof left === 'number' && typeof right === 'number') {
    if (op === '>') return left > right;
    if (op === '<') return left < right;
    if (op === '>=') return left >= right;
    if (op === '<=') return left <= right;
    if (op === '==') return left === right;
    if (op === '!=') return left !== right;
  }
  if (typeof left === 'string' && typeof right === 'string') {
    if (op === '==') return left === right;
    if (op === '!=') return left !== right;
  }
  if (typeof left === 'boolean' && typeof right === 'boolean') {
    if (op === '==') return left === right;
    if (op === '!=') return left !== right;
  }
  return false;
}

function evaluateAst(ast: Ast, state: Record<string, unknown>): unknown {
  if (ast.kind === 'literal') return ast.value;
  if (ast.kind === 'ident') return lookupStateValue(state, ast.name);
  const left = evaluateAst(ast.left, state);
  const right = evaluateAst(ast.right, state);
  if (ast.op === '&&') {
    const leftBool = asBoolean(left);
    const rightBool = asBoolean(right);
    if (leftBool === undefined || rightBool === undefined) return false;
    return leftBool && rightBool;
  }
  if (ast.op === '||') {
    const leftBool = asBoolean(left);
    const rightBool = asBoolean(right);
    if (leftBool === undefined || rightBool === undefined) return false;
    return leftBool || rightBool;
  }
  return compare(ast.op, left, right);
}

export function evaluateTwinRule(rule: TwinRule, state: Record<string, unknown>): RuleEvaluation {
  const tokens = tokenize(rule.expression);
  if ('error' in tokens) {
    return { key: rule.key, expression: rule.expression, fired: false, parseError: tokens.error };
  }
  const ast = parseExpression(tokens);
  if ('error' in ast) {
    return { key: rule.key, expression: rule.expression, fired: false, parseError: ast.error };
  }
  return {
    key: rule.key,
    expression: rule.expression,
    fired: evaluateAst(ast, state) === true,
  };
}

export function evaluateTwinRules(rules: TwinRule[], state: Record<string, unknown>): RuleEvaluation[] {
  return rules.map((rule) => evaluateTwinRule(rule, state));
}
