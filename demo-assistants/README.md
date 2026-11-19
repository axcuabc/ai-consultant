# Демо-помощники для сайтов-портфолио

Отдельный проект Vercel (корневая папка `demo-assistants`), не связан с кабинетом и подпиской ИИ Консультанта.
Три помощника для демо-сайтов психологов на Tilda: `lebedeva`, `sokolovy`, `vetrova`. Тексты — в `api/_lib.js`.

Код для блока T123 на Tilda:

    <script src="https://АДРЕС-ПРОЕКТА/widget.js" data-id="lebedeva" async></script>

Кнопка на странице открывает чат, если ведёт на `#ask-assistant` или имеет атрибут `data-ask-assistant`.

Переменные окружения:
- `OPENROUTER_API_KEY` — отдельный ключ OpenRouter (обязательно);
- `OPENROUTER_MODEL` — модели через запятую (по умолчанию бесплатные);
- `ALLOWED_HOSTS` — сайты, где помощник отвечает (по умолчанию write-silent-endive.tilda.ws, tilda.cc, localhost).

Ограничения: 15 сообщений в минуту и 60 в сутки с одного адреса, 400 ответов в сутки на помощника.
