import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

const ensureTable = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY, title VARCHAR(500) NOT NULL, event_date DATE NOT NULL,
    type VARCHAR(50) DEFAULT 'event', created_at TIMESTAMP DEFAULT NOW()
  )`);
  await pool.query(`DELETE FROM calendar_events WHERE event_date < CURRENT_DATE - INTERVAL '1 year'`);
};

router.get("/calendar", async (req, res) => {
  try {
    await ensureTable();
    const events = await pool.query(`SELECT id, title, event_date, type FROM calendar_events ORDER BY event_date ASC`);
    res.json({ success: true, data: events.rows });
  } catch (error) {
    req.log.error({ error }, "GET /calendar failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/calendar", async (req, res) => {
  try {
    await ensureTable();
    const { id, title, event_date, type } = req.body;
    if (!title || !event_date) return res.status(400).json({ success: false, error: "title dan event_date diperlukan" });
    let result;
    if (id) {
      result = await pool.query(
        `UPDATE calendar_events SET title=$1, event_date=$2, type=$3 WHERE id=$4 RETURNING id, title, event_date, type`,
        [title, event_date, type ?? "event", Number(id)]
      );
    } else {
      result = await pool.query(
        `INSERT INTO calendar_events (title, event_date, type) VALUES ($1, $2, $3) RETURNING id, title, event_date, type`,
        [title, event_date, type ?? "event"]
      );
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    req.log.error({ error }, "POST /calendar failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.delete("/calendar", async (req, res) => {
  try {
    await ensureTable();
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: "id diperlukan" });
    await pool.query(`DELETE FROM calendar_events WHERE id = $1`, [Number(id)]);
    res.json({ success: true });
  } catch (error) {
    req.log.error({ error }, "DELETE /calendar failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
