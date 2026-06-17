export const schema = `
CREATE TABLE IF NOT EXISTS currencies (
  ticker TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prices (
  currency_ticker TEXT NOT NULL,
  symbol TEXT NOT NULL,
  price TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (currency_ticker, symbol),
  FOREIGN KEY (currency_ticker) REFERENCES currencies(ticker) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  currency_ticker TEXT NOT NULL,
  symbol TEXT NOT NULL,
  price TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  FOREIGN KEY (currency_ticker) REFERENCES currencies(ticker) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chain TEXT NOT NULL,
  address TEXT NOT NULL,
  UNIQUE (chain, address)
);
`;
