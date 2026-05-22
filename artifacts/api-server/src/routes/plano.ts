import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

const ensureTable = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS plano_vm (id TEXT PRIMARY KEY, pages JSONB DEFAULT '[]', updated_at TIMESTAMP DEFAULT NOW())`);
  await pool.query(`INSERT INTO plano_vm (id, pages) VALUES ('default', '[]') ON CONFLICT (id) DO NOTHING`);
};

router.get("/plano", async (req, res) => {
  try {
    await ensureTable();
    const result = await pool.query(`SELECT pages FROM plano_vm WHERE id = 'default'`);
    res.json({ success: true, data: result.rows[0]?.pages ?? [] });
  } catch (error) {
    req.log.error({ error }, "GET /plano failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/plano", async (req, res) => {
  try {
    await ensureTable();
    const { pages } = req.body;
    if (!Array.isArray(pages)) return res.status(400).json({ success: false, error: "pages array diperlukan" });
    await pool.query(`UPDATE plano_vm SET pages=$1, updated_at=NOW() WHERE id='default'`, [JSON.stringify(pages)]);
    res.json({ success: true });
  } catch (error) {
    req.log.error({ error }, "POST /plano failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
