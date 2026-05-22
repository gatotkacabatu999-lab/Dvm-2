import { Router } from "express";

const router = Router();

router.post("/shorten", async (req, res) => {
  const { url } = req.body as { url?: string };
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing url" });
    return;
  }

  try {
    const apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: { "User-Agent": "Dbrutals/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      res.status(502).json({ error: "Shortener service error", shortUrl: url });
      return;
    }

    const text = await response.text();
    const trimmed = text.trim();

    if (trimmed.startsWith("{") && trimmed.includes("shorturl")) {
      const json = JSON.parse(trimmed) as { shorturl?: string; errormessage?: string };
      if (json.shorturl) {
        res.json({ shortUrl: json.shorturl });
        return;
      }
      if (json.errormessage) {
        res.status(422).json({ error: json.errormessage, shortUrl: url });
        return;
      }
    }

    res.status(502).json({ error: "Unexpected response", shortUrl: url });
  } catch {
    res.status(502).json({ error: "Failed to reach shortener", shortUrl: url });
  }
});

export default router;
