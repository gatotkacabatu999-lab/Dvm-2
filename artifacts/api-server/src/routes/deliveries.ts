import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

const ensureTable = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY, tracking_no VARCHAR(100) UNIQUE NOT NULL,
    recipient_name VARCHAR(255), address TEXT, status VARCHAR(50) DEFAULT 'pending',
    delivery_date DATE, notes TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
  )`);
};

router.get("/deliveries", async (req, res) => {
  try {
    await ensureTable();
    const result = await pool.query(`SELECT * FROM deliveries ORDER BY created_at DESC`);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    req.log.error({ error }, "GET /deliveries failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/deliveries", async (req, res) => {
  try {
    await ensureTable();
    const { tracking_no, recipient_name, address, status, delivery_date, notes } = req.body;
    if (!tracking_no) return res.status(400).json({ success: false, error: "tracking_no diperlukan" });
    const result = await pool.query(
      `INSERT INTO deliveries (tracking_no, recipient_name, address, status, delivery_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (tracking_no) DO UPDATE
         SET recipient_name=EXCLUDED.recipient_name, address=EXCLUDED.address, status=EXCLUDED.status,
             delivery_date=EXCLUDED.delivery_date, notes=EXCLUDED.notes, updated_at=NOW()
       RETURNING *`,
      [tracking_no, recipient_name, address, status ?? "pending", delivery_date, notes]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    req.log.error({ error }, "POST /deliveries failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.delete("/deliveries", async (req, res) => {
  try {
    await ensureTable();
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: "id diperlukan" });
    await pool.query(`DELETE FROM deliveries WHERE id = $1`, [Number(id)]);
    res.json({ success: true });
  } catch (error) {
    req.log.error({ error }, "DELETE /deliveries failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
