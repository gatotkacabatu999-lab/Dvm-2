import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

const ensureTables = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS rooster_resources (
    id TEXT PRIMARY KEY, name VARCHAR(200) NOT NULL, role VARCHAR(100) DEFAULT '',
    color VARCHAR(20) DEFAULT '#3B82F6', created_at TIMESTAMP DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS rooster_shifts (
    id TEXT PRIMARY KEY, resource_id TEXT NOT NULL REFERENCES rooster_resources(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL, shift_date DATE NOT NULL, start_hour INTEGER NOT NULL DEFAULT 8,
    end_hour INTEGER NOT NULL DEFAULT 16, color VARCHAR(20) NOT NULL DEFAULT '#3B82F6', created_at TIMESTAMP DEFAULT NOW()
  )`);
};

router.get("/rooster", async (req, res) => {
  try {
    await ensureTables();
    const resources = await pool.query(`SELECT id, name, role, color FROM rooster_resources ORDER BY created_at ASC`);
    const shifts = await pool.query(`SELECT id, resource_id, title, shift_date, start_hour, end_hour, color FROM rooster_shifts ORDER BY shift_date ASC, start_hour ASC`);
    res.json({ success: true, resources: resources.rows, shifts: shifts.rows });
  } catch (error) {
    req.log.error({ error }, "GET /rooster failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/rooster", async (req, res) => {
  try {
    await ensureTables();
    const { type } = req.body;
    if (type === "resource") {
      const { id, name, role, color } = req.body;
      if (!id || !name) return res.status(400).json({ success: false, error: "id and name required" });
      await pool.query(
        `INSERT INTO rooster_resources (id, name, role, color) VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role, color=EXCLUDED.color`,
        [id, name, role ?? "", color ?? "#3B82F6"]
      );
      return res.json({ success: true });
    }
    if (type === "shift") {
      const { id, resource_id, title, shift_date, start_hour, end_hour, color } = req.body;
      if (!id || !resource_id || !title || !shift_date) return res.status(400).json({ success: false, error: "id, resource_id, title, shift_date required" });
      await pool.query(
        `INSERT INTO rooster_shifts (id, resource_id, title, shift_date, start_hour, end_hour, color)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET resource_id=EXCLUDED.resource_id, title=EXCLUDED.title,
           shift_date=EXCLUDED.shift_date, start_hour=EXCLUDED.start_hour, end_hour=EXCLUDED.end_hour, color=EXCLUDED.color`,
        [id, resource_id, title, shift_date, start_hour ?? 8, end_hour ?? 16, color ?? "#3B82F6"]
      );
      return res.json({ success: true });
    }
    res.status(400).json({ success: false, error: 'type must be "resource" or "shift"' });
  } catch (error) {
    req.log.error({ error }, "POST /rooster failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.delete("/rooster", async (req, res) => {
  try {
    await ensureTables();
    const { type, id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: "id required" });
    if (type === "resource") {
      await pool.query(`DELETE FROM rooster_resources WHERE id = $1`, [String(id)]);
      return res.json({ success: true });
    }
    if (type === "shift") {
      await pool.query(`DELETE FROM rooster_shifts WHERE id = $1`, [String(id)]);
      return res.json({ success: true });
    }
    res.status(400).json({ success: false, error: 'type must be "resource" or "shift"' });
  } catch (error) {
    req.log.error({ error }, "DELETE /rooster failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
