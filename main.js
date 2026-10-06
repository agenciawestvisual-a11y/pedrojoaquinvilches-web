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
    return id[1] && { iframe: `https://drive.google.com/file/d/${id[1]}/preview` };
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

document.querySelectorAll(".video").forEach((el) => {
  const title = el.dataset.title || "Video";
  const embed = el.dataset.src && embedFor(el.dataset.src.trim());

  if (!embed) {
    el.innerHTML = `<div class="slot"><span class="label"></span><span class="rec">PIEZA PENDIENTE</span></div>`;
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
    const btn = document.createElement("button");
    btn.className = "play";
    btn.type = "button";
    btn.setAttribute("aria-label", `Reproducir: ${title}`);
    btn.innerHTML = `<span><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>`;
    btn.addEventListener("click", () => el.replaceChildren(iframe(embed.iframe, title)), { once: true });
    el.append(img, btn);
  } else {
    el.append(iframe(embed.iframe, title));
  }
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
