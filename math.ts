/**
 * HELIXEDU offline mathematics engine.
 *
 * A small, dependency-free recursive-descent parser that turns an expression
 * into a polynomial (map of exponent -> coefficient). This lets the assistant
 * genuinely solve linear equations, quadratics and arithmetic step by step
 * without any external API.
 */

export type Poly = Map<number, number>;

const VARIABLES = ["x"];

export class MathError extends Error {}

/* ----------------------------- tokenizer ---------------------------- */

type Tok =
  | { t: "num"; v: number }
  | { t: "var"; v: string }
  | { t: "op"; v: string }
  | { t: "fn"; v: string }
  | { t: "("; }
  | { t: ")" };

function tokenize(src: string): Tok[] {
  const s = src
    .replace(/[×✕]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/[–—]/g, "-")
    .replace(/π/g, "pi")
    .replace(/\s+/g, "");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const v = Number(s.slice(i, j));
      if (!Number.isFinite(v)) throw new MathError(`I could not read the number "${s.slice(i, j)}".`);
      out.push({ t: "num", v });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z0-9]/.test(s[j])) j++;
      const word = s.slice(i, j).toLowerCase();
      if (word === "sqrt") out.push({ t: "fn", v: "sqrt" });
      else if (word === "pi") out.push({ t: "num", v: Math.PI });
      else if (VARIABLES.includes(word)) out.push({ t: "var", v: word });
      else throw new MathError(`Unknown symbol "${word}". This solver currently supports x as its variable.`);
      i = j;
      continue;
    }
    if ("+-*/^".includes(c)) {
      out.push({ t: "op", v: c });
      i++;
      continue;
    }
    if (c === "(" || c === "[" || c === "{") {
      out.push({ t: "(" });
      i++;
      continue;
    }
    if (c === ")" || c === "]" || c === "}") {
      out.push({ t: ")" });
      i++;
      continue;
    }
    if (c === "=" || c === "," || c === ";") {
      throw new MathError("Please send one equation at a time, for example: 2x + 3 = 11");
    }
    throw new MathError(`Unexpected character "${c}".`);
  }
  return out;
}

/* --------------------------- polynomial ops -------------------------- */

function polyFromNumber(n: number): Poly {
  const p: Poly = new Map();
  if (n !== 0) p.set(0, n);
  return p;
}

function polyFromVar(_v: string): Poly {
  const p: Poly = new Map();
  p.set(1, 1);
  return p;
}

function trim(p: Poly): Poly {
  for (const [k, v] of [...p]) if (Math.abs(v) < 1e-12) p.delete(k);
  return p;
}

function add(a: Poly, b: Poly): Poly {
  const r: Poly = new Map(a);
  for (const [k, v] of b) r.set(k, (r.get(k) ?? 0) + v);
  return trim(r);
}

function sub(a: Poly, b: Poly): Poly {
  const r: Poly = new Map(a);
  for (const [k, v] of b) r.set(k, (r.get(k) ?? 0) - v);
  return trim(r);
}

function mul(a: Poly, b: Poly): Poly {
  const r: Poly = new Map();
  for (const [ka, va] of a)
    for (const [kb, vb] of b) r.set(ka + kb, (r.get(ka + kb) ?? 0) + va * vb);
  return trim(r);
}

function div(a: Poly, b: Poly): Poly {
  const keys = [...b.keys()];
  if (keys.length !== 1 || keys[0] !== 0) throw new MathError("I can only divide by a plain number here.");
  const d = b.get(0)!;
  if (d === 0) throw new MathError("Division by zero is undefined.");
  const r: Poly = new Map();
  for (const [k, v] of a) r.set(k, v / d);
  return trim(r);
}

function pow(a: Poly, n: number): Poly {
  if (!Number.isInteger(n) || n < 0) throw new MathError("Only non-negative whole-number powers are supported.");
  if (n > 12) throw new MathError("Powers above 12 are not supported by the offline solver yet.");
  let r: Poly = polyFromNumber(1);
  for (let i = 0; i < n; i++) r = mul(r, a);
  return r;
}

/* ------------------------------ parser ------------------------------ */

class Parser {
  private toks: Tok[];
  private pos = 0;
  constructor(src: string) {
    this.toks = tokenize(src);
  }
  private peek(): Tok | undefined {
    return this.toks[this.pos];
  }
  private eat(): Tok {
    const t = this.toks[this.pos++];
    if (!t) throw new MathError("The expression looks incomplete.");
    return t;
  }

  parse(): Poly {
    const p = this.expr();
    if (this.pos < this.toks.length) throw new MathError("I could not read the whole expression.");
    return p;
  }

  private expr(): Poly {
    let left = this.term();
    for (;;) {
      const t = this.peek();
      if (t && t.t === "op" && (t.v === "+" || t.v === "-")) {
        this.eat();
        const right = this.term();
        left = t.v === "+" ? add(left, right) : sub(left, right);
      } else break;
    }
    return left;
  }

  private term(): Poly {
    let left = this.unary();
    for (;;) {
      const t = this.peek();
      if (t && t.t === "op" && (t.v === "*" || t.v === "/")) {
        this.eat();
        const right = this.unary();
        left = t.v === "*" ? mul(left, right) : div(left, right);
      } else if (t && (t.t === "num" || t.t === "var" || t.t === "(" || t.t === "fn")) {
        // implicit multiplication: 2x, 3(x+1), 2sqrt(9)
        const right = this.unary();
        left = mul(left, right);
      } else break;
    }
    return left;
  }

  private unary(): Poly {
    const t = this.peek();
    if (t && t.t === "op" && (t.v === "-" || t.v === "+")) {
      this.eat();
      const inner = this.unary();
      return t.v === "-" ? mul(polyFromNumber(-1), inner) : inner;
    }
    return this.power();
  }

  private power(): Poly {
    const base = this.primary();
    const t = this.peek();
    if (t && t.t === "op" && t.v === "^") {
      this.eat();
      const exp = this.unary();
      const keys = [...exp.keys()];
      if (keys.length !== 1 || keys[0] !== 0)
        throw new MathError("Powers with variables in the exponent are not supported yet.");
      return pow(base, exp.get(0)!);
    }
    return base;
  }

  private primary(): Poly {
    const t = this.eat();
    if (t.t === "num") return polyFromNumber(t.v);
    if (t.t === "var") return polyFromVar(t.v);
    if (t.t === "(") {
      const inner = this.expr();
      const close = this.eat();
      if (close.t !== ")") throw new MathError("Missing a closing bracket.");
      return inner;
    }
    if (t.t === "fn") {
      const open = this.eat();
      if (open.t !== "(") throw new MathError("sqrt needs brackets, like sqrt(16).");
      const inner = this.expr();
      const close = this.eat();
      if (close.t !== ")") throw new MathError("Missing a closing bracket.");
      const keys = [...inner.keys()];
      if (keys.length !== 1 || keys[0] !== 0)
        throw new MathError("sqrt of a variable expression is not supported yet.");
      const v = inner.get(0)!;
      if (v < 0) throw new MathError("Square root of a negative number is not a real number.");
      return polyFromNumber(Math.sqrt(v));
    }
    throw new MathError("The expression is incomplete.");
  }
}

/* ------------------------------ helpers ------------------------------ */

export function polyDegree(p: Poly): number {
  return p.size ? Math.max(...p.keys()) : -Infinity;
}

export function polyToString(p: Poly): string {
  const keys = [...p.keys()].sort((a, b) => b - a);
  if (!keys.length) return "0";
  return keys
    .map((k) => {
      const v = p.get(k)!;
      const sign = v < 0 ? "-" : "+";
      const abs = Math.abs(v);
      const coef = k === 0 ? String(abs) : `${abs === 1 ? "" : abs}x${k === 1 ? "" : `^${k}`}`;
      return `${sign} ${coef}`;
    })
    .join(" ")
    .replace(/^\+ /, "");
}

export function polyValue(p: Poly, x: number): number {
  let total = 0;
  for (const [k, v] of p) total += v * x ** k;
  return total;
}

export function parsePoly(src: string): Poly {
  return new Parser(src).parse();
}

/* ------------------------------ solvers ------------------------------ */

export type Solution = {
  kind: string;
  steps: string[];
  answer: string;
  detail?: string;
};

function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 1e6) / 1e6);
}

export function solveEquation(equation: string): Solution {
  const sides = equation.split("=");
  if (sides.length !== 2) throw new MathError("Send an equation with exactly one '=' sign.");
  const [lhsSrc, rhsSrc] = sides.map((s) => s.trim()).filter((s) => s.length > 0) as [string, string];
  if (!lhsSrc || !rhsSrc) throw new MathError("Both sides of the equation need an expression.");

  const steps: string[] = [];
  const left = parsePoly(lhsSrc);
  const right = parsePoly(rhsSrc);
  steps.push(`Left side: ${polyToString(left)}`);
  steps.push(`Right side: ${polyToString(right)}`);

  const combined = sub(left, right);
  steps.push(`Move everything to the left: ${polyToString(combined)} = 0`);

  const degree = polyDegree(combined);
  if (degree === -Infinity) {
    return {
      kind: "identity",
      steps: [...steps, "Both sides are identical, so every value of x works."],
      answer: "Any value of x is a solution.",
    };
  }
  if (degree === 0) {
    return {
      kind: "contradiction",
      steps: [...steps, "There is no variable left and the statement is false."],
      answer: "No solution — the equation is impossible.",
    };
  }
  if (degree === 1) {
    const a = combined.get(1)!;
    const b = combined.get(0) ?? 0;
    steps.push(`a = ${fmt(a)}, b = ${fmt(b)}`);
    steps.push(`x = -b / a = ${fmt(-b)} / ${fmt(a)}`);
    const x = -b / a;
    steps.push(`Check: ${polyToString(combined).replace(/x/g, `(${fmt(x)})`)} = ${fmt(polyValue(combined, x))}`);
    return { kind: "linear", steps, answer: `x = ${fmt(x)}`, detail: fmt(x) };
  }
  if (degree === 2) {
    const a = combined.get(2)!;
    const b = combined.get(1) ?? 0;
    const c = combined.get(0) ?? 0;
    steps.push(`Standard form: ${fmt(a)}x² + ${fmt(b)}x + ${fmt(c)} = 0`);
    const d = b * b - 4 * a * c;
    steps.push(`Discriminant D = b² - 4ac = ${fmt(b * b)} - ${fmt(4 * a * c)} = ${fmt(d)}`);
    if (d < 0) {
      return {
        kind: "quadratic",
        steps: [...steps, "D < 0, so there are no real roots."],
        answer: "No real solutions (the roots are complex).",
      };
    }
    const r1 = (-b + Math.sqrt(d)) / (2 * a);
    const r2 = (-b - Math.sqrt(d)) / (2 * a);
    steps.push(`x = (-b ± √D) / 2a = (${fmt(-b)} ± ${fmt(Math.sqrt(d))}) / ${fmt(2 * a)}`);
    const answer = d === 0 ? `x = ${fmt(r1)} (double root)` : `x = ${fmt(r1)} or x = ${fmt(r2)}`;
    return { kind: "quadratic", steps, answer };
  }
  return {
    kind: "higher-degree",
    steps,
    answer: "This is a higher-degree equation. Try isolating x step by step, or ask me for a hint.",
  };
}

export function evaluateExpression(src: string): Solution {
  const p = parsePoly(src);
  const degree = polyDegree(p);
  if (degree !== 0) {
    return {
      kind: "simplify",
      steps: [`This expression simplifies to ${polyToString(p)}`],
      answer: polyToString(p),
    };
  }
  const v = p.get(0)!;
  const steps = ["Following the order of operations (BODMAS / PEMDAS):"];
  const tokens = tokenize(src);
  steps.push(`Expression: ${tokens.map((t) => ("v" in t ? t.v : t.t === "(" ? "(" : ")")).join(" ")}`);
  steps.push(`Result: ${fmt(v)}`);
  return { kind: "arithmetic", steps, answer: fmt(v) };
}

/* ------------------------- word-problem helpers ---------------------- */

export function percentProblem(text: string): Solution | null {
  const t = text.toLowerCase().replace(/,/g, "");
  let m = t.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s*of\s*(\d+(?:\.\d+)?)/);
  if (m) {
    const pct = Number(m[1]);
    const base = Number(m[2]);
    const value = (pct / 100) * base;
    return {
      kind: "percentage",
      steps: [
        `Percentage = ${fmt(pct)}%, Base = ${fmt(base)}`,
        `Convert: ${fmt(pct)}/100 = ${fmt(pct / 100)}`,
        `Multiply: ${fmt(pct / 100)} × ${fmt(base)} = ${fmt(value)}`,
      ],
      answer: `${fmt(pct)}% of ${fmt(base)} is ${fmt(value)}`,
    };
  }
  m = t.match(/what\s*(?:is\s*)?(\d+(?:\.\d+)?)\s*(?:%|percent)\s*of\s*(\d+(?:\.\d+)?)/);
  if (m) return percentProblem(`${m[1]}% of ${m[2]}`);
  m = t.match(/(?:increase|raise)\s*(\d+(?:\.\d+)?)\s*by\s*(\d+(?:\.\d+)?)\s*(?:%|percent)/);
  if (m) {
    const base = Number(m[1]);
    const pct = Number(m[2]);
    const delta = (pct / 100) * base;
    return {
      kind: "percentage",
      steps: [
        `Base = ${fmt(base)}, Increase = ${fmt(pct)}%`,
        `Increase amount = ${fmt(pct)}/100 × ${fmt(base)} = ${fmt(delta)}`,
        `New value = ${fmt(base)} + ${fmt(delta)} = ${fmt(base + delta)}`,
      ],
      answer: `${fmt(base)} increased by ${fmt(pct)}% is ${fmt(base + delta)}`,
    };
  }
  m = t.match(/(?:decrease|reduce|discount\s*of)\s*(\d+(?:\.\d+)?)\s*by\s*(\d+(?:\.\d+)?)\s*(?:%|percent)/);
  if (m) {
    const base = Number(m[1]);
    const pct = Number(m[2]);
    const delta = (pct / 100) * base;
    return {
      kind: "percentage",
      steps: [
        `Base = ${fmt(base)}, Decrease = ${fmt(pct)}%`,
        `Decrease amount = ${fmt(pct)}/100 × ${fmt(base)} = ${fmt(delta)}`,
        `New value = ${fmt(base)} - ${fmt(delta)} = ${fmt(base - delta)}`,
      ],
      answer: `${fmt(base)} decreased by ${fmt(pct)}% is ${fmt(base - delta)}`,
    };
  }
  m = t.match(/(\d+(?:\.\d+)?)\s*(?:is\s*)?what\s*(?:%|percent)\s*of\s*(\d+(?:\.\d+)?)/);
  if (m) {
    const part = Number(m[1]);
    const whole = Number(m[2]);
    if (whole === 0) return null;
    return {
      kind: "percentage",
      steps: [
        `Part = ${fmt(part)}, Whole = ${fmt(whole)}`,
        `Percentage = Part ÷ Whole × 100`,
        `= ${fmt(part)} ÷ ${fmt(whole)} × 100 = ${fmt((part / whole) * 100)}%`,
      ],
      answer: `${fmt(part)} is ${fmt((part / whole) * 100)}% of ${fmt(whole)}`,
    };
  }
  return null;
}

export function numberTheoryProblem(text: string): Solution | null {
  const t = text.toLowerCase();
  const m = t.match(/(\d+)\s*(?:,|\s|and)\s*(\d+)/);
  if (/\b(gcd|hcf|greatest common)\b/.test(t) && m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const steps: string[] = [`Finding GCD (HCF) of ${a} and ${b} using Euclid's algorithm:`];
    let x = a;
    let y = b;
    while (y) {
      steps.push(`${x} = ${y} × ${Math.floor(x / y)} + ${x % y}`);
      [x, y] = [y, x % y];
    }
    steps.push(`When the remainder becomes 0, the divisor (${x}) is the GCD.`);
    return { kind: "gcd", steps, answer: `GCD(${a}, ${b}) = ${x}` };
  }
  if (/\b(lcm|least common multiple)\b/.test(t) && m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const gcd = gcdOf(a, b);
    if (gcd === 0) return null;
    const lcm = Math.abs(a * b) / gcd;
    return {
      kind: "lcm",
      steps: [
        `GCD(${a}, ${b}) = ${gcd}`,
        `LCM = (a × b) ÷ GCD = (${a} × ${b}) ÷ ${gcd}`,
        `= ${a * b} ÷ ${gcd} = ${lcm}`,
      ],
      answer: `LCM(${a}, ${b}) = ${lcm}`,
    };
  }
  const pm = t.match(/prime\s*(?:factors?|factorization)\s*(?:of)?\s*(\d+)/);
  if (pm) {
    const n = Number(pm[1]);
    if (n < 2) return null;
    const factors: number[] = [];
    let d = 2;
    let cur = n;
    while (d * d <= cur) {
      while (cur % d === 0) {
        factors.push(d);
        cur /= d;
      }
      d++;
    }
    if (cur > 1) factors.push(cur);
    const counts = new Map<number, number>();
    for (const f of factors) counts.set(f, (counts.get(f) ?? 0) + 1);
    const pretty = [...counts].map(([f, c]) => (c > 1 ? `${f}^${c}` : `${f}`)).join(" × ");
    return {
      kind: "prime-factorisation",
      steps: [
        `Divide ${n} by the smallest prime again and again:`,
        factors.map((f, i) => `step ${i + 1}: ÷ ${f}`).join(" · "),
        `Remaining value: 1 → done.`,
      ],
      answer: `${n} = ${pretty}`,
    };
  }
  return null;
}

export function gcdOf(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

export function averageProblem(text: string): Solution | null {
  const t = text.toLowerCase();
  if (!/\b(average|mean|arithmetic mean)\b/.test(t)) return null;
  const nums = [...t.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  if (nums.length < 2) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return {
    kind: "average",
    steps: [
      `Numbers: ${nums.join(", ")}`,
      `Sum = ${nums.join(" + ")} = ${fmt(sum)}`,
      `Count = ${nums.length}`,
      `Mean = ${fmt(sum)} ÷ ${nums.length} = ${fmt(sum / nums.length)}`,
    ],
    answer: `The average is ${fmt(sum / nums.length)}`,
  };
}

const UNITS: Record<string, { factor: number; dimension: "length" | "mass" | "volume" }> = {
  km: { factor: 1000, dimension: "length" },
  m: { factor: 1, dimension: "length" },
  cm: { factor: 0.01, dimension: "length" },
  mm: { factor: 0.001, dimension: "length" },
  kg: { factor: 1000, dimension: "mass" },
  g: { factor: 1, dimension: "mass" },
  mg: { factor: 0.001, dimension: "mass" },
  l: { factor: 1, dimension: "volume" },
  ml: { factor: 0.001, dimension: "volume" },
};

export function unitProblem(text: string): Solution | null {
  const m = text
    .toLowerCase()
    .match(/(\d+(?:\.\d+)?)\s*(km|m|cm|mm|kg|g|mg|l|ml)\s*(?:to|in|into)\s*(km|m|cm|mm|kg|g|mg|l|ml)/);
  if (!m) return null;
  const value = Number(m[1]);
  const from = m[2];
  const to = m[3];
  if (UNITS[from].dimension !== UNITS[to].dimension) {
    throw new MathError("Those units measure different quantities. Convert length to length, mass to mass, or volume to volume.");
  }
  const fromBase = value * UNITS[from].factor;
  const result = fromBase / UNITS[to].factor;
  return {
    kind: "unit-conversion",
    steps: [
      \`${value} ${from} → base unit: ${value} × ${UNITS[from].factor} = ${fromBase}\`,
      \`Base unit → ${to}: ${fromBase} ÷ ${UNITS[to].factor} = ${fmt(result)}\`,
    ],
    answer: \`${value} ${from} = ${fmt(result)} ${to}\`,
  };
}

/* ------------------------------ dispatcher --------------------------- */

export function trySolveMath(raw: string): Solution | null {
  const text = raw.trim();
  if (!text) return null;

  const cleaned = text
    .replace(/^(please\s+)?(solve|calculate|compute|evaluate|find|what is|whats|what's|how much is)\s+/i, "")
    .replace(/[?！]+$/g, "")
    .replace(/^(for me|it)\s+/i, "")
    .trim();

  for (const attempt of [text, cleaned]) {
    if (attempt.includes("=")) {
      try {
        return solveEquation(attempt);
      } catch (err) {
        if (err instanceof MathError && attempt === cleaned) throw err;
      }
    }
  }

  const wordProblem = percentProblem(cleaned) ?? averageProblem(cleaned) ?? unitProblem(cleaned) ?? numberTheoryProblem(cleaned);
  if (wordProblem) return wordProblem;

  try {
    return evaluateExpression(cleaned);
  } catch {
    return null;
  }
}

export function looksLikeMath(raw: string): boolean {
  const t = raw.toLowerCase();
  if (/\d\s*[+\-*/^]\s*\d/.test(t)) return true;
  if (t.includes("=")) return true;
  if (/%|percent/.test(t) && /\d/.test(t)) return true;
  if (/\b(solve|calculate|evaluate|simplify|gcd|lcm|hcf|average|mean|factorise|factorize|sqrt)\b/.test(t)) return true;
  if (/[\d.]\s*(km|kg|cm|mm|ml|litre|liter|gram|meter|metre)\b/.test(t)) return true;
  return false;
}
