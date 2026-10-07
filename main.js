// Videos: cada <div class="video" data-src="..."> acepta un link de YouTube, Vimeo o Google Drive.
// Sin link, muestra un marco "pendiente" para saber qué espacio falta completar.
function embedFor(src) {
  let url;
  try { url = new URL(src); } catch { return null; }
  const host = url.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtu.be") return youtube(url.pathname.slice(1));
  if (host === "youtube.com") {
    const short = url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/);
    return youtube(short ? short[1] : url.searchParams.get("v"));
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.match(/(\d+)/);
    return id && { iframe: `https://player.vimeo.com/video/${id[1]}?dnt=1` };
  }
  if (host === "drive.google.com") {
    const id = url.pathname.match(/\/file\/d\/([\w-]+)/) || [null, url.searchParams.get("id")];
    return id[1] && {
      iframe: `https://drive.google.com/file/d/${id[1]}/preview`,
      thumb: `https://drive.google.com/thumbnail?id=${id[1]}&sz=w1000`,
      open: `https://drive.google.com/file/d/${id[1]}/view`,
      clickToLoad: true,
    };
  }
  return null;
}

function youtube(id) {
  if (!id) return null;
  return {
    iframe: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
    thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    clickToLoad: true,
  };
}

function iframe(src, title) {
  const f = document.createElement("iframe");
  f.src = src;
  f.title = title;
  f.loading = "lazy";
  f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  f.allowFullscreen = true;
  return f;
}

function openLink(href, title) {
  const a = document.createElement("a");
  a.className = "open";
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = "Abrir ↗";
  a.setAttribute("aria-label", `Abrir en Drive: ${title}`);
  return a;
}

document.querySelectorAll(".video").forEach((el) => {
  const title = el.dataset.title || "Video";
  const embed = el.dataset.src && embedFor(el.dataset.src.trim());

  if (!embed) {
    el.innerHTML = `<div class="slot"><span class="icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span><span class="label"></span><span class="state">Pieza pendiente</span></div>`;
    el.querySelector(".label").textContent = title;
    return;
  }

  if (embed.clickToLoad) {
    // Carga el reproductor recién al hacer clic: la página queda liviana.
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = embed.thumb;
    img.alt = "";
    img.loading = "lazy";
    img.onerror = () => img.remove();
    const btn = document.createElement("button");
    btn.className = "play";
    btn.type = "button";
    btn.setAttribute("aria-label", `Reproducir: ${title}`);
    btn.innerHTML = `<span><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span><em></em>`;
    btn.querySelector("em").textContent = title;
    btn.addEventListener("click", () => {
      el.replaceChildren(iframe(embed.iframe, title));
      if (link) el.append(link);
    }, { once: true });
    // Respaldo: si el reproductor embebido no carga, el video se abre en Drive
    const link = embed.open && openLink(embed.open, title);
    el.append(img, btn, ...(link ? [link] : []));
  } else {
    el.append(iframe(embed.iframe, title));
  }
});

// "Ver más": cada fila con data-limit muestra solo los primeros videos
document.querySelectorAll("[data-limit]").forEach((row) => {
  const extra = [...row.children].slice(Number(row.dataset.limit));
  if (!extra.length) return;
  extra.forEach((el) => el.setAttribute("data-extra", ""));
  const btn = document.createElement("button");
  btn.className = "more";
  btn.type = "button";
  btn.textContent = `Ver ${extra.length} más`;
  btn.addEventListener("click", () => {
    extra.forEach((el) => el.removeAttribute("data-extra"));
    btn.remove();
  });
  row.after(btn);
});

// Pestañas de nichos (con flechas del teclado)
const tabs = [...document.querySelectorAll('[role="tab"]')];
function select(tab) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => select(tab));
  tab.addEventListener("keydown", (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    const next = tabs[(i + step + tabs.length) % tabs.length];
    select(next);
    next.focus();
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
