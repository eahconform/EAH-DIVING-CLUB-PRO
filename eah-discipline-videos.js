
/* ============================================================
   EAH DIVING PRO CLUB
   MEDIAS PAR DISCIPLINE — VERSION 2

   Images : JPG, PNG, WebP, GIF, AVIF
   Vidéos : YouTube, Vimeo, Drive, MP4, WebM

   Affichage sous chaque discipline.
   Source : Supabase / eah_discipline_videos
============================================================ */

(() => {
  "use strict";

  const cfg = window.EAH_CONFIG || {};

  const URL = cfg.SUPABASE_URL ||
    "https://limyeqpdzjjwsdximehp.supabase.co";

  const KEY = cfg.SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_K9iUm_0Qhea65P1Zt6rbXQ_BXQCzJ9w";

  const DISCIPLINES = [
    "olympique",
    "freestyle",
    "highdiving",
    "ange"
  ];

  const HEADINGS = {
    fr: "Photos et vidéos de la discipline",
    en: "Discipline photos and videos",
    es: "Fotos y vídeos de la disciplina",
    de: "Fotos und Videos der Disziplin"
  };

  const sections = new Map();

  function languageHeading() {
    const lang = (
      document.documentElement.lang || "fr"
    ).toLowerCase().slice(0, 2);

    return HEADINGS[lang] || HEADINGS.fr;
  }

  /* ==========================================================
     DETECTION ET SECURISATION DES LIENS
  ========================================================== */

  function resolveMedia(raw, type) {
    let url;

    try {
      
url = new window.URL(String(raw || "").trim());

    } catch (_) {
      return null;
    }

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password
    ) {
      return null;
    }

    const host = url.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    const path = url.pathname;
    const chosen = String(type || "AUTO").toUpperCase();

    const google = host === "drive.google.com";

    const driveId = google
      ? (
          path.match(
            /^\/file\/d\/([a-zA-Z0-9_-]{20,})/
          )?.[1] ||
          url.searchParams.get("id") ||
          ""
        )
      : "";

    const driveOk =
      /^[a-zA-Z0-9_-]{20,}$/.test(driveId);

    const imageExt =
      /\.(?:png|jpe?g|webp|gif|avif)$/i.test(path);

    const videoExt =
      /\.(?:mp4|webm|ogg|mov)$/i.test(path);

    let imageSrc = url.href;

    // Conversion des liens GitHub /blob/
    // vers l'image brute.
    if (host === "github.com") {
      const match = path.match(
        /^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/
      );

      if (match) {
        imageSrc =
          "https://raw.githubusercontent.com/" +
          match.slice(1).join("/");
      }
    }

    /* ========================================================
       IMAGES
    ======================================================== */

    if (
      chosen === "IMAGE" ||
      (chosen === "AUTO" && imageExt)
    ) {
      if (google && driveOk) {
        return {
          kind: "image",
          src:
            "https://drive.google.com/thumbnail?id=" +
            driveId +
            "&sz=w1600",
          fallback:
            "https://drive.google.com/uc?export=view&id=" +
            driveId,
          link: url.href
        };
      }

      return {
        kind: "image",
        src: imageSrc,
        link: url.href
      };
    }

    if (chosen !== "AUTO" && chosen !== "VIDEO") {
      return null;
    }

    /* ========================================================
       YOUTUBE
    ======================================================== */

    let youtubeId = "";

    if ([
      "youtube.com",
      "m.youtube.com",
      "youtube-nocookie.com"
    ].includes(host)) {
      youtubeId =
        url.searchParams.get("v") ||
        path.match(
          /^\/(?:embed|shorts|live)\/([\w-]+)/
        )?.[1] ||
        "";
    } else if (host === "youtu.be") {
      youtubeId = path.split("/")[1] || "";
    }

    if (/^[\w-]{11}$/.test(youtubeId)) {
      return {
        kind: "embed",
        src:
          "https://www.youtube-nocookie.com/embed/" +
          youtubeId
      };
    }

    /* ========================================================
       VIMEO
    ======================================================== */

    if (
      host === "vimeo.com" ||
      host === "player.vimeo.com"
    ) {
      const vimeoId = path.match(
        /(?:^\/|\/video\/)(\d+)(?:\/|$)/
      )?.[1];

      if (vimeoId) {
        return {
          kind: "embed",
          src:
            "https://player.vimeo.com/video/" +
            vimeoId +
            "?dnt=1"
        };
      }
    }

    /* ========================================================
       GOOGLE DRIVE VIDEO
    ======================================================== */

    if (google && driveOk) {
      return {
        kind: "embed",
        src:
          "https://drive.google.com/file/d/" +
          driveId +
          "/preview"
      };
    }

    /* ========================================================
       FICHIERS VIDEOS DIRECTS
    ======================================================== */

    if (chosen === "VIDEO" || videoExt) {
      return {
        kind: "video",
        src: url.href
      };
    }

    return null;
  }

  /* ==========================================================
     DESIGN
  ========================================================== */

  function addStyles() {
    if (document.getElementById("eah-media-style")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "eah-media-style";

    style.textContent = `
      .eah-media-section[hidden] {
        display: none !important;
      }

      .eah-media-section {
        padding-top: 0 !important;
      }

      .eah-media-panel {
        background: rgba(3,20,38,.88);
        border: 1px solid rgba(48,207,255,.25);
        border-radius: 24px;
        padding: clamp(18px,3vw,32px);
      }

      .eah-media-title {
        color: #f5f9ff;
        font-size: clamp(23px,3vw,32px);
        margin: 0 0 23px;
        font-weight: 800;
      }

      .eah-media-grid {
        display: grid;
        grid-template-columns:
          repeat(auto-fit,minmax(min(100%,310px),1fr));
        gap: 22px;
      }

      .eah-media-card {
        min-width: 0;
      }

      .eah-media-card h3 {
        color: #f5f9ff;
        font-size: 18px;
        margin: 0 0 12px;
        font-weight: 700;
      }

      .eah-media-frame {
        aspect-ratio: 16/9;
        overflow: hidden;
        border-radius: 16px;
        background: #020c17;
        border: 1px solid rgba(48,207,255,.28);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .eah-media-frame img,
      .eah-media-frame video,
      .eah-media-frame iframe {
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
        background: #020c17;
      }

      .eah-media-frame img {
        object-fit: contain;
      }

      .eah-media-frame a {
        color: #30cfff;
        text-align: center;
        padding: 18px;
      }

      @media(max-width:600px) {
        .eah-media-panel {
          border-radius: 18px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* ==========================================================
     EMPLACEMENTS
  ========================================================== */

  function createSlots() {
    for (const id of DISCIPLINES) {
      const page = document.getElementById(id);

      if (!page || sections.has(id)) {
        continue;
      }

      const section = document.createElement("section");
      section.className =
        "section eah-media-section";
      section.hidden = true;

      const container = document.createElement("div");
      container.className = "container";

      const panel = document.createElement("div");
      panel.className = "eah-media-panel";

      const heading = document.createElement("h2");
      heading.className = "eah-media-title";
      heading.textContent = languageHeading();

      const grid = document.createElement("div");
      grid.className = "eah-media-grid";

      panel.append(heading, grid);
      container.append(panel);
      section.append(container);

      // Ajout sous le texte explicatif.
      page.append(section);

      sections.set(id, {
        page,
        section,
        grid,
        heading
      });

      new MutationObserver(() => {
        updatePlayback(id);
      }).observe(page, {
        attributes: true,
        attributeFilter: ["class"]
      });
    }
  }

  /* ==========================================================
     LECTURE ET ARRET DES VIDEOS
  ========================================================== */

  function updatePlayback(discipline) {
    const slot = sections.get(discipline);

    if (!slot) return;

    const shown =
      slot.page.classList.contains("active");

    slot.grid.querySelectorAll(
      "iframe[data-eah-src]"
    ).forEach(frame => {
      if (shown && !frame.hasAttribute("src")) {
        frame.src = frame.dataset.eahSrc;
      }

      if (!shown && frame.hasAttribute("src")) {
        frame.removeAttribute("src");
      }
    });

    if (!shown) {
      slot.grid.querySelectorAll("video")
        .forEach(video => video.pause());
    }
  }

  /* ==========================================================
     CONSTRUCTION IMAGE OU VIDEO
  ========================================================== */

  function buildCard(row, media) {
    const card = document.createElement("article");
    card.className = "eah-media-card";

    const title = document.createElement("h3");
    title.textContent =
      String(row.title || "EAH Diving");

    const frame = document.createElement("div");
    frame.className = "eah-media-frame";

    if (media.kind === "image") {
      const img = document.createElement("img");

      img.src = media.src;
      img.alt = title.textContent;
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";

      img.onerror = () => {
        if (
          media.fallback &&
          img.src !== media.fallback
        ) {
          img.src = media.fallback;
          return;
        }

        const link = document.createElement("a");
        link.href = media.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Ouvrir l'image";

        frame.replaceChildren(link);
      };

      frame.append(img);

    } else if (media.kind === "embed") {
      const iframe = document.createElement("iframe");

      iframe.dataset.eahSrc = media.src;
      iframe.title = title.textContent;
      iframe.loading = "lazy";
      iframe.allowFullscreen = true;
      iframe.allow =
        "encrypted-media; picture-in-picture; fullscreen";
      iframe.referrerPolicy =
        "strict-origin-when-cross-origin";

      frame.append(iframe);

    } else {
      const video = document.createElement("video");

      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = media.src;

      frame.append(video);
    }

    card.append(title, frame);

    return card;
  }

  /* ==========================================================
     AFFICHAGE
  ========================================================== */

  function render(rows) {
    for (const id of DISCIPLINES) {
      const slot = sections.get(id);

      if (!slot) continue;

      const cards = rows
        .filter(row => row.discipline === id)
        .map(row => ({
          row,
          media: resolveMedia(
            row.video_url,
            row.media_type
          )
        }))
        .filter(item => item.media)
        .map(item => buildCard(
          item.row,
          item.media
        ));

      slot.grid.replaceChildren(...cards);

      slot.section.hidden =
        cards.length === 0;

      updatePlayback(id);
    }
  }

  /* ==========================================================
     CHARGEMENT SUPABASE
  ========================================================== */

  let activeRequest = null;

  async function refresh() {
    if (activeRequest) {
      return activeRequest;
    }

    activeRequest = (async () => {
      const endpoint =
        URL +
        "/rest/v1/eah_discipline_videos" +
        "?select=video_id,discipline,title,video_url,media_type,sort_order" +
        "&active=eq.true" +
        "&order=sort_order.asc" +
        "&limit=200";

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          apikey: KEY,
          Accept: "application/json"
        },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(
          "Médias Supabase HTTP " +
          response.status
        );
      }

      const rows = await response.json();

      if (!Array.isArray(rows)) {
        throw new Error(
          "Réponse médias invalide"
        );
      }

      render(rows);
    })();

    try {
      await activeRequest;
    } catch (error) {
      console.warn("EAH Médias :", error);
    } finally {
      activeRequest = null;
    }
  }

  /* ==========================================================
     INITIALISATION
  ========================================================== */

  function init() {
    addStyles();
    createSlots();

    if (!sections.size) return;

    refresh();

    // Adaptation du titre à la langue choisie.
    new MutationObserver(() => {
      for (const slot of sections.values()) {
        const title = languageHeading();

        if (slot.heading.textContent !== title) {
          slot.heading.textContent = title;
        }
      }
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });

    window.addEventListener("pageshow", event => {
      if (event.persisted) {
        refresh();
      }
    });

    window.EAHRefreshDisciplineMedia = refresh;
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

})();
