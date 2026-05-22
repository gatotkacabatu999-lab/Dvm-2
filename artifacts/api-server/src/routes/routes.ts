import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

// ── /api/routes ───────────────────────────────────────────────────────────────
router.get("/routes", async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY, name VARCHAR(255) NOT NULL, code VARCHAR(100) NOT NULL,
      shift VARCHAR(50) DEFAULT 'AM', delivery_points JSONB DEFAULT '[]',
      color VARCHAR(20) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query(`ALTER TABLE routes ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT NULL`);
    const result = await pool.query(`SELECT * FROM routes ORDER BY created_at ASC`);
    const routes = result.rows.map((row: Record<string, unknown>) => ({
      id: row.id, name: row.name, code: row.code, shift: row.shift,
      color: row.color ?? null,
      deliveryPoints: row.delivery_points, updatedAt: row.updated_at,
    }));
    res.json({ success: true, data: routes });
  } catch (error) {
    req.log.error({ error }, "GET /routes failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/routes", async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY, name VARCHAR(255) NOT NULL, code VARCHAR(100) NOT NULL,
      shift VARCHAR(50) DEFAULT 'AM', delivery_points JSONB DEFAULT '[]',
      color VARCHAR(20) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query(`ALTER TABLE routes ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT NULL`);
    const { routes, changedRouteIds } = req.body;
    if (!Array.isArray(routes)) return res.status(400).json({ success: false, error: "routes array diperlukan" });
    const changedIds: string[] = Array.isArray(changedRouteIds) ? changedRouteIds : [];
    const ids = routes.map((r: { id: string }) => r.id);
    if (ids.length > 0) {
      await pool.query(`DELETE FROM routes WHERE id != ALL($1::text[])`, [ids]);
    } else {
      await pool.query(`DELETE FROM routes`);
    }
    for (const route of routes) {
      const isChanged = changedIds.includes(route.id);
      await pool.query(
        `INSERT INTO routes (id, name, code, shift, delivery_points, color, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, code=EXCLUDED.code, shift=EXCLUDED.shift,
           delivery_points=EXCLUDED.delivery_points, color=EXCLUDED.color,
           updated_at=CASE WHEN $7 THEN NOW() ELSE routes.updated_at END`,
        [route.id, route.name, route.code, route.shift, JSON.stringify(route.deliveryPoints), route.color ?? null, isChanged]
      );
    }
    res.json({ success: true });
  } catch (error) {
    req.log.error({ error }, "POST /routes failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.patch("/routes", async (req, res) => {
  try {
    const { id, color } = req.body;
    if (!id || !color) return res.status(400).json({ success: false, error: "id dan color diperlukan" });
    await pool.query(`UPDATE routes SET color=$1, updated_at=NOW() WHERE id=$2`, [color, id]);
    res.json({ success: true });
  } catch (error) {
    req.log.error({ error }, "PATCH /routes failed");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
