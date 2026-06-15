export const schema = `
CREATE TABLE IF NOT EXISTS currencies (
  ticker TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
`;
