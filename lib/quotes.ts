export const STOCK_QUOTES = [
  "The stock market is filled with individuals who know the price of everything, but the value of nothing.",
  "In investing, what is comfortable is rarely profitable.",
  "The four most dangerous words in investing are: 'this time it's different.'",
  "Time in the market beats timing the market.",
  "Be fearful when others are greedy, and greedy when others are fearful.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Risk comes from not knowing what you're doing.",
  "Price is what you pay. Value is what you get.",
  "The individual investor should act consistently as an investor and not as a speculator.",
  "Know what you own, and know why you own it.",
  "It's not whether you're right or wrong that's important, but how much money you make when you're right.",
  "The goal of a successful trader is to make the best trades. Money is secondary.",
  "Markets can remain irrational longer than you can remain solvent.",
  "Wide diversification is only required when investors do not understand what they are doing.",
  "The trend is your friend until the end when it bends.",
];

export function getRandomQuote(): string {
  return STOCK_QUOTES[Math.floor(Math.random() * STOCK_QUOTES.length)];
}

