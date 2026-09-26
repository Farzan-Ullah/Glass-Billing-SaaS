// Glass industry calculation utilities

export const calculateGlassArea = (width, height, unit = "inch", minArea = 1.0, roundInch = false) => {
  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;

  if (w <= 0 || h <= 0) return { rawSqFt: 0, billableSqFt: 0 };

  let rawSqFt = 0;
  if (unit === "mm") {
    rawSqFt = (w * h) / 92903.04;
  } else {
    // inches
    const effectiveW = roundInch ? Math.ceil(w) : w;
    const effectiveH = roundInch ? Math.ceil(h) : h;
    rawSqFt = (effectiveW * effectiveH) / 144;
  }

  const billableSqFt = Math.max(rawSqFt, minArea);

  return {
    rawSqFt: Math.round(rawSqFt * 100) / 100,
    billableSqFt: Math.round(billableSqFt * 100) / 100,
  };
};

export const calculatePerimeterRft = (width, height, unit = "inch", sides = 4) => {
  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;
  if (w <= 0 || h <= 0) return 0;

  let rft = 0;
  if (unit === "mm") {
    if (sides === 4) rft = (2 * (w + h)) / 304.8;
    else if (sides === 2) rft = (2 * h) / 304.8; // height sides
    else rft = (w + h) / 304.8;
  } else {
    // inches
    if (sides === 4) rft = (2 * (w + h)) / 12;
    else if (sides === 2) rft = (2 * h) / 12;
    else rft = (w + h) / 12;
  }

  return Math.round(rft * 100) / 100;
};

export const formatINR = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
};

export const numberToWordsINR = (num) => {
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return "Zero Rupees Only";

  const inWords = (n) => {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : " ");
    if (n < 1000) return a[Math.floor(n / 100)] + "Hundred " + (n % 100 === 0 ? "" : "and " + inWords(n % 100));
    if (n < 100000) return inWords(Math.floor(n / 1000)) + "Thousand " + (n % 1000 !== 0 ? inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + "Lakh " + (n % 100000 !== 0 ? inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + "Crore " + (n % 10000000 !== 0 ? inWords(n % 10000000) : "");
  };

  return ("Rupees " + inWords(n) + "Only").replace(/\s+/g, " ").trim();
};
