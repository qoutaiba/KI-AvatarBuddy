import express from "express";
import { spawn } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cors());

const PORT = Number(process.env.PORT ?? 5179);

// Use absolute-ish paths that don't depend on __dirname.
// process.cwd() is the folder you start Node from (WORKDIR /app in Docker).
const PIPER_DIR = process.env.PIPER_DIR ?? path.join(process.cwd(), "piper");
const OUT_DIR = process.env.OUT_DIR ?? path.join(process.cwd(), "tts-out");

// Voice basename (without ".onnx")
const VOICE = process.env.PIPER_VOICE ?? "de_DE-kerstin-low";

// Full model path
const MODEL = path.join(PIPER_DIR, `${VOICE}.onnx`);

await fsp.mkdir(OUT_DIR, { recursive: true });

app.post("/api/tts", (req, res) => {
  const text = String(req.body?.text ?? "").trim();
  if (!text) return res.status(400).json({ error: "missing text" });

  const outWav = path.join(
      OUT_DIR,
      `${Date.now()}-${Math.random().toString(36).slice(2)}.wav`
  );

  const p = spawn(
      "python3",
      ["-m", "piper", "--model", MODEL, "--output_file", outWav],
      { stdio: ["pipe", "pipe", "pipe"] }
  );

  p.stdin.write(text);
  p.stdin.end();

  let err = "";
  p.stderr.on("data", (d) => (err += d.toString()));

  p.on("close", (code) => {
    if (code !== 0) {
      console.error("piper failed:", err);
      return res.status(500).json({
        error: "piper failed",
        code,
        details: err.slice(0, 800)
      });
    }

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Cache-Control", "no-store");

    const stream = fs.createReadStream(outWav);
    stream.pipe(res);

    const cleanup = () => fs.unlink(outWav, () => {});
    stream.on("end", cleanup);
    stream.on("error", cleanup);
    res.on("close", cleanup);
    res.on("error", cleanup);
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`TTS server on http://localhost:${PORT}`);
  console.log(`PIPER_DIR=${PIPER_DIR}`);
  console.log(`OUT_DIR=${OUT_DIR}`);
  console.log(`VOICE=${VOICE}`);
});
