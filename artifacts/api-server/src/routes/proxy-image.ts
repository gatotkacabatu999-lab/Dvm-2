import { Router } from "express";

const router = Router();

router.get("/proxy-image", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") return res.status(400).json({ error: "URL parameter required" });
    if (!url.match(/^https?:\/\//)) return res.status(400).json({ error: "Only HTTP/HTTPS URLs allowed" });
    if (url.length > 2000) return res.status(400).json({ error: "URL too long" });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "QR-Scanner-Bot/1.0" } });
    clearTimeout(timeout);
    if (!response.ok) return res.status(response.status).json({ error: "Failed to fetch image" });
    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("image/")) return res.status(415).json({ error: "Not an image" });
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) return res.status(413).json({ error: "Image too large" });
    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    req.log.error({ error }, "GET /proxy-image failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
