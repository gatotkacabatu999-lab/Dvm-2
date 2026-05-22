import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

const ensureTable = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS route_notes (
    id TEXT PRIMARY KEY, route_id TEXT NOT NULL, type VARCHAR(20) NOT NULL DEFAULT 'note',
    text TEXT NOT NULL DEFAULT '', created_at TIMESTAMP DEFAULT NOW()
  )`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_route_notes_route_id ON route_notes(route_id)`);
};

router.get("/route-notes", async (req, res) => {
  try {
    await ensureTable();
    const { routeId } = req.query;
    if (!routeId || typeof routeId !== "string") return res.status(400).json({ success: false, error: "routeId diperlukan" });
    const notes = await pool.query(`SELECT * FROM route_notes WHERE route_id=$1 AND type='note' ORDER BY created_at DESC`, [routeId]);
    const changelog = await pool.query(`SELECT * FROM route_notes WHERE route_id=$1 AND type='changelog' ORDER BY created_at DESC LIMIT 200`, [routeId]);
    res.json({ success: true, notes: notes.rows, changelog: changelog.rows });
  } catch (error) {
    req.log.error({ error }, "GET /route-notes failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/route-notes", async (req, res) => {
  try {
    await ensureTable();
    const { id, routeId, type, text } = req.body;
    if (!id || !routeId || !type || !text) return res.status(400).json({ success: false, error: "id, routeId, type, text diperlukan" });
    await pool.query(
      `INSERT INTO route_notes (id, route_id, type, text) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
      [id, routeId, type, text]
    );
    res.json({ success: true });
  } catch (error) {
    req.log.error({ error }, "POST /route-notes failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.delete("/route-notes", async (req, res) => {
  try {
    await ensureTable();
    const { id, routeId, type } = req.query;
    if (routeId && type === "changelog") {
      if (typeof routeId !== "string") return res.status(400).json({ success: false, error: "routeId diperlukan" });
      await pool.query(`DELETE FROM route_notes WHERE route_id=$1 AND type='changelog'`, [routeId]);
      return res.json({ success: true });
    }
    if (!id || typeof id !== "string") return res.status(400).json({ success: false, error: "id diperlukan" });
    await pool.query(`DELETE FROM route_notes WHERE id=$1 AND type='note'`, [id]);
    res.json({ success: true });
  } catch (error) {
    req.log.error({ error }, "DELETE /route-notes failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
