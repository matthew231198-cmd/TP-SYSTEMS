import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  try {
    const botRes = await fetch("http://localhost:3000/");
    const botData = await botRes.json() as Record<string, unknown>;
    res.status(botRes.status).json({
      status: botData.status ?? "unknown",
      bot: botData.bot,
      uptime_seconds: botData.uptime_seconds,
      guilds: botData.guilds,
      timestamp: botData.timestamp,
    });
  } catch {
    res.status(503).json({ status: "down", reason: "Bot unreachable" });
  }
});

export default router;
