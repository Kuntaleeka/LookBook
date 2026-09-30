export function toRoman(n: number) {
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  for (const [value, numeral] of map) {
    while (n >= value) {
      out += numeral;
      n -= value;
    }
  }
  return out || "0";
}

export const pad3 = (n: number) => String(n).padStart(3, "0");

/** Small deterministic "random" in [-1, 1] so layouts don't shift between renders. */
export function jitter(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/** Splits a name so the last word can be styled differently ("Office *Siren*"). */
export function splitLastWord(name: string) {
  const i = name.trim().lastIndexOf(" ");
  return i === -1 ? ["", name.trim()] : [name.slice(0, i + 1), name.slice(i + 1)];
}

export function lookTitle(title: string | null, n: number, fallback: string) {
  return title?.trim() || `${fallback} ${n}`;
}
