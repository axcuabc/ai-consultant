// Какие модели OpenRouter использовать для ответов.
//
// По умолчанию — платная DeepSeek V4.1 Flash (~$0.0005 за ответ), а бесплатные
// модели (с «:free» в конце) — запасные: на случай сбоя или если кончился баланс
// OpenRouter. Если первая модель не ответила, OpenRouter сам пробует следующую,
// а при пустом ответе мы делаем вторую попытку со следующей моделью.
//
// Чтобы сменить модели без правки кода, задайте в Vercel переменную OPENROUTER_MODEL:
// одну модель или несколько через запятую, например
//   OPENROUTER_MODEL=google/gemma-4-31b-it:free,nvidia/nemotron-3.5-lightning:free
// Список бесплатных моделей меняется, актуальный: https://openrouter.ai/models?q=free

const DEFAULT_MODELS = [
  "deepseek/deepseek-v4.1-flash",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3.5-lightning:free",
]

export function modelList(): string[] {
  const fromEnv = (process.env.OPENROUTER_MODEL || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)
  return fromEnv.length > 0 ? fromEnv : DEFAULT_MODELS
}

/** Поля запроса к OpenRouter: одна модель или список запасных. */
export function modelFields(): { model: string } | { models: string[] } {
  const list = modelList()
  return list.length === 1 ? { model: list[0] } : { models: list.slice(0, 3) }
}
