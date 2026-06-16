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
`;
