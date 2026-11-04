CREATE TABLE question_budget (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  day INTEGER NOT NULL,
  daily_count INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  minute_count INTEGER NOT NULL
);

INSERT INTO question_budget VALUES (1, 0, 0, 0, 0);
