import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

const ensureTable = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY, type VARCHAR(20) NOT NULL DEFAULT 'note', title VARCHAR(500) NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '', version VARCHAR(50) DEFAULT NULL, author VARCHAR(255) DEFAULT 'Admin',
    pinned BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
  )`);
};

router.get("/notes", async (req, res) => {
  try {
    await ensureTable();
    const { type } = req.query;
    let result;
    if (type === "note") result = await pool.query(`SELECT * FROM notes WHERE type='note' ORDER BY pinned DESC, created_at DESC`);
    else if (type === "changelog") result = await pool.query(`SELECT * FROM notes WHERE type='changelog' ORDER BY created_at DESC`);
    else result = await pool.query(`SELECT * FROM notes ORDER BY type ASC, pinned DESC, created_at DESC`);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    req.log.error({ error }, "GET /notes failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/notes", async (req, res) => {
  try {
    await ensureTable();
    const { id, type, title, content, version, author, pinned } = req.body;
    if (!id || !type || !content) return res.status(400).json({ success: false, error: "id, type dan content diperlukan" });
    await pool.query(
      `INSERT INTO notes (id, type, title, content, version, author, pinned, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (id) DO UPDATE
         SET title=EXCLUDED.title, content=EXCLUDED.content, version=EXCLUDED.version,
             author=EXCLUDED.author, pinned=EXCLUDED.pinned, updated_at=NOW()`,
      [id, type, title ?? "", content, version ?? null, author ?? "Admin", pinned ?? false]
    );
    res.json({ success: true });
  } catch (error) {
    req.log.error({ error }, "POST /notes failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.delete("/notes", async (req, res) => {
  try {
    await ensureTable();
    const { id } = req.query;
    if (!id || typeof id !== "string") return res.status(400).json({ success: false, error: "id diperlukan" });
    await pool.query(`DELETE FROM notes WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (error) {
    req.log.error({ error }, "DELETE /notes failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
