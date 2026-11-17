/*
 * ИИ-Консультант: виджет для сайта.
 * Подключение: <script src="https://ВАШ-ДОМЕН/widget.js" data-id="ID-КОНСУЛЬТАНТА" async></script>
 * Работает на Tilda (блок T123), обычных HTML-сайтах и в любых конструкторах с вставкой кода.
 */
(function () {
  "use strict";

  var ICONS = {
    chat: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6A.5.5 0 0 1 5 19.2V16h1.5H6.5A2.5 2.5 0 0 1 4 13.5z"/>',
    bot: '<path d="M12 2a1 1 0 0 1 1 1v1.1A7 7 0 0 1 19 11v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5a7 7 0 0 1 6-6.9V3a1 1 0 0 1 1-1zm-3 9.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>',
    sparkle: '<path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/>',
    help: '<path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 13.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM12 6a3.5 3.5 0 0 0-3.5 3.5 1 1 0 1 0 2 0A1.5 1.5 0 1 1 12 11a1 1 0 0 0-1 1v1.5a1 1 0 1 0 2 0v-.65A3.5 3.5 0 0 0 12 6z"/>',
  };
  var FONTS = {
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
    rounded: "ui-rounded, 'SF Pro Rounded', 'Nunito', 'Segoe UI', Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  };

  function svg(name, size) {
    return (
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      (ICONS[name] || ICONS.chat) +
      "</svg>"
    );
  }

  function textOn(hex) {
    var m = /^#([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return "#ffffff";
    var n = parseInt(m[1], 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#111827" : "#ffffff";
  }

  // Безопасный вывод текста: только textContent, ссылки — отдельными <a> с http(s)
  function renderText(el, text) {
    var re = /(https?:\/\/[^\s<>"']+|t\.me\/[A-Za-z0-9_]+|@[A-Za-z0-9_]{5,})/g;
    var last = 0, match;
    while ((match = re.exec(text))) {
      if (match.index > last) el.appendChild(document.createTextNode(text.slice(last, match.index)));
      var raw = match[0].replace(/[.,!?)]+$/, "");
      var href = raw.charAt(0) === "@" ? "https://t.me/" + raw.slice(1) : /^https?:/.test(raw) ? raw : "https://" + raw;
      var a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = raw;
      el.appendChild(a);
      last = match.index + raw.length;
      re.lastIndex = last;
    }
    if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
  }

  function storage(key, value) {
    try {
      if (value === undefined) return JSON.parse(sessionStorage.getItem(key) || "null");
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      return null;
    }
  }

  function css(c) {
    var fg = textOn(c.color);
    var side = c.position === "left" ? "left" : "right";
    return (
      ":host{all:initial}" +
      "*{box-sizing:border-box}" +
      ".root{position:fixed;bottom:20px;" + side + ":20px;z-index:2147483000;font-family:" + (FONTS[c.font] || FONTS.system) + ";font-size:15px;line-height:1.45;color:#111827}" +
      ".root.inline{position:absolute}" +
      ".btn{width:60px;height:60px;border-radius:50%;border:0;cursor:pointer;background:" + c.color + ";color:" + fg + ";display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.18);transition:transform .15s}" +
      ".btn:hover{transform:scale(1.06)}" +
      ".btn:focus-visible,.send:focus-visible,.close:focus-visible{outline:3px solid " + c.color + "55;outline-offset:2px}" +
      ".panel{position:absolute;bottom:76px;" + side + ":0;width:360px;max-width:calc(100vw - 40px);height:520px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.2);display:none;flex-direction:column;overflow:hidden}" +
      ".open .panel{display:flex}" +
      ".head{background:" + c.color + ";color:" + fg + ";padding:14px 16px;display:flex;align-items:center;gap:10px}" +
      ".head .title{flex:1;font-weight:600;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".close{background:transparent;border:0;color:inherit;font-size:22px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:6px}" +
      ".list{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:#f9fafb}" +
      ".msg{max-width:85%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}" +
      ".msg a{color:inherit;text-decoration:underline}" +
      ".bot{align-self:flex-start;background:#fff;border:1px solid #e5e7eb;border-bottom-left-radius:4px}" +
      ".me{align-self:flex-end;background:" + c.color + ";color:" + fg + ";border-bottom-right-radius:4px}" +
      ".typing{align-self:flex-start;color:#6b7280;font-size:13px;padding:4px 6px}" +
      ".form{display:flex;gap:8px;padding:10px;border-top:1px solid #e5e7eb;background:#fff}" +
      ".input{flex:1;border:1px solid #d1d5db;border-radius:10px;padding:9px 12px;font:inherit;color:#111827;outline:none;resize:none;max-height:96px}" +
      ".input:focus{border-color:" + c.color + "}" +
      ".send{border:0;border-radius:10px;padding:0 14px;background:" + c.color + ";color:" + fg + ";font:inherit;font-weight:600;cursor:pointer}" +
      ".send:disabled{opacity:.5;cursor:default}" +
      ".foot{font-size:11px;color:#9ca3af;text-align:center;padding:0 0 8px;background:#fff}" +
      "@media (max-width:480px){.root.open:not(.inline){bottom:0;" + side + ":0;right:0;left:0;top:0}.root.open:not(.inline) .btn{display:none}.root.open:not(.inline) .panel{position:fixed;inset:0;width:100%;max-width:none;height:100%;max-height:none;border-radius:0}}"
    );
  }

  function mount(config, options) {
    options = options || {};
    var apiBase = options.apiBase || "";
    var host = document.createElement("div");
    host.setAttribute("data-ai-consultant", config.id || "preview");
    (options.container || document.body).appendChild(host);
    var shadow = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

    var storeKey = "aic:" + (config.id || "preview");
    var history = (!options.preview && storage(storeKey)) || [];
    var busy = false;

    var style = document.createElement("style");
    var root = document.createElement("div");
    root.className = "root" + (options.inline ? " inline" : "");
    root.innerHTML =
      '<div class="panel" role="dialog" aria-label="Чат">' +
      '<div class="head"><div class="title"></div><button class="close" type="button" aria-label="Закрыть">×</button></div>' +
      '<div class="list" aria-live="polite"></div>' +
      '<form class="form"><textarea class="input" rows="1" maxlength="1000" placeholder="Напишите сообщение…" aria-label="Сообщение"></textarea>' +
      '<button class="send" type="submit">➤</button></form>' +
      "</div>" +
      '<button class="btn" type="button" aria-label="Открыть чат"></button>';
    shadow.appendChild(style);
    shadow.appendChild(root);

    var $ = function (s) { return root.querySelector(s); };
    var list = $(".list"), input = $(".input"), send = $(".send"), btn = $(".btn");

    function addBubble(role, text) {
      var b = document.createElement("div");
      b.className = "msg " + (role === "user" ? "me" : "bot");
      renderText(b, text);
      list.appendChild(b);
      list.scrollTop = list.scrollHeight;
    }

    function redraw() {
      list.textContent = "";
      if (config.welcome) addBubble("assistant", config.welcome);
      history.forEach(function (m) { addBubble(m.role, m.content); });
    }

    function apply(next) {
      config = next;
      style.textContent = css(config);
      $(".title").textContent = config.name || "Консультант";
      btn.innerHTML = svg(config.icon, 28);
      redraw();
    }

    function setOpen(open) {
      root.classList.toggle("open", open);
      btn.setAttribute("aria-label", open ? "Закрыть чат" : "Открыть чат");
      if (open) setTimeout(function () { input.focus(); }, 50);
    }

    btn.addEventListener("click", function () { setOpen(!root.classList.contains("open")); });
    $(".close").addEventListener("click", function () { setOpen(false); });
    root.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $(".form").requestSubmit ? $(".form").requestSubmit() : submit(e); }
    });

    function submit(e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text || busy) return;
      input.value = "";
      history.push({ role: "user", content: text });
      addBubble("user", text);
      busy = true;
      send.disabled = true;
      var typing = document.createElement("div");
      typing.className = "typing";
      typing.textContent = "печатает…";
      list.appendChild(typing);
      list.scrollTop = list.scrollHeight;

      var done = function (answer) {
        typing.remove();
        history.push({ role: "assistant", content: answer });
        history = history.slice(-20);
        addBubble("assistant", answer);
        if (!options.preview) storage(storeKey, history);
        busy = false;
        send.disabled = false;
      };

      if (options.preview && !config.id) {
        setTimeout(function () { done("Это предпросмотр. Сохраните консультанта, и здесь появятся настоящие ответы ИИ."); }, 600);
        return;
      }

      fetch(apiBase + "/api/widget/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: config.id, messages: history.slice(-12) }),
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (data) { done((data && data.reply) || "Не получилось ответить. Попробуйте ещё раз."); })
        .catch(function () { done("Нет связи с сервером. Попробуйте ещё раз."); });
    }
    $(".form").addEventListener("submit", submit);

    apply(config);
    if (options.open) setOpen(true);

    return {
      update: apply,
      open: function () { setOpen(true); },
      destroy: function () { host.remove(); },
    };
  }

  window.AIConsultantWidget = { mount: mount };

  // Автозапуск со страницы клиента
  var script = document.currentScript;
  var id = script && script.getAttribute("data-id");
  if (!id) return;
  if (document.querySelector('[data-ai-consultant="' + id + '"]')) return;
  var apiBase = new URL(script.src, location.href).origin;

  function start() {
    fetch(apiBase + "/api/widget/config?id=" + encodeURIComponent(id))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.active || !data.config) return;
        mount(data.config, { apiBase: apiBase });
      })
      .catch(function () {});
  }
  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
