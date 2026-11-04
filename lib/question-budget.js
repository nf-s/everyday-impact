// Reserve one inference atomically across all visitors and concurrent requests.
export const reservationSQL = `
  UPDATE question_budget
  SET day = ?1, daily_count = CASE WHEN day = ?1 THEN daily_count + 1 ELSE 1 END,
      minute = ?2, minute_count = CASE WHEN minute = ?2 THEN minute_count + 1 ELSE 1 END
  WHERE id = 1 AND minute <= ?2
    AND (day < ?1 OR daily_count < 200)
    AND (minute < ?2 OR minute_count < 12)
`;

export async function reserveInference(database, now = Date.now()) {
  const result = await database.prepare(reservationSQL)
    .bind(Math.floor(now / 86400000), Math.floor(now / 60000)).run();
  return result.meta.changes === 1;
}
