import { ASSISTANTS, cors } from "../_lib.js"

export default function handler(req, res) {
  cors(req, res)
  if (req.method === "OPTIONS") return res.status(204).end()
  const a = ASSISTANTS[String(req.query.id || "")]
  if (!a) return res.status(404).json({ error: "not_found" })
  res.setHeader("Cache-Control", "public, max-age=300")
  return res.status(200).json({ active: true, config: a.config })
}
