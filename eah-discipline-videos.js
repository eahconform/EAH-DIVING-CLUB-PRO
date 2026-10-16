
/* ============================================================
   EAH DIVING PRO CLUB
   VIDEOS DES DISCIPLINES
   VERSION 1.0

   Source : Supabase / eah_discipline_videos

   Disciplines :
   - olympique
   - freestyle
   - highdiving
   - ange

   Les vidéos apparaissent sous le texte explicatif.
   Aucune vidéo inactive n'est affichée.
============================================================ */

(() => {
  "use strict";

  const CONFIG = window.EAH_CONFIG || {};

  const API_URL =
    CONFIG.SUPABASE_URL ||
    "https://limyeqpdzjjwsdximehp.supabase.co";

  const API_KEY =
    CONFIG.SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_K9iUm_0Qhea65P1Zt6rbXQ_BXQCzJ9w";

  const DISCIPLINES = [
    "olympique",
    "freestyle",
    "highdiving",
    "ange"
  ];

  const TITLES = {
    fr: "Vidéos de la discipline",
    en: "Discipline videos",
    es: "Vídeos de la disciplina",
    de: "Videos der Disziplin"
  };

  const containers = new Map();

  function getLanguage() {
    const lang = (
      document.documentElement.lang || "fr"
    ).toLowerCase().slice(0, 2);

    return TITLES[lang] || TITLES.fr;
  }

  /* ==========================================================
     LIENS VIDEOS ACCEPTES
  ========================================================== */

  function getPlayer(value) {
    try {
      const url = new URL(String(value || "").trim());

      if (url.protocol !== "https:") return null;

      const host = url.hostname
        .toLowerCase()
        .replace(/^www\./, "");

      const path = url.pathname;

      let id = "";

      // YOUTUBE
      if (
        host === "youtube.com" ||
        host === "m.youtube.com" ||
        host === "youtube-nocookie.com"
      ) {
        id =
          url.searchParams.get("v") ||
          path.match(
            /^\/(?:shorts|embed|live)\/([^/?]+)/
          )?.[1] ||
          "";

        if (/^[\w-]{11}$/.test(id)) {
          return {
            type: "iframe",
            url:
              "https://www.youtube-nocookie.com/embed/" +
              id
          };
        }
      }

      // YOUTUBE COURT
      if (host === "youtu.be") {
        id = path.split("/")[1] || "";

        if (/^[\w-]{11}$/.test(id)) {
          return {
            type: "iframe",
            url:
              "https://www.youtube-nocookie.com/embed/" +
              id
          };
        }
      }

      // VIMEO
      if (
        host === "vimeo.com" ||
        host === "player.vimeo.com"
      ) {
        id = path.match(
          /(?:^\/|\/video\/)(\d+)(?:\/|$)/
        )?.[1] || "";

        if (id) {
          return {
            type: "iframe",
            url:
              "https://player.vimeo.com/video/" +
              id
          };
        }
      }

      // GOOGLE DRIVE
      if (host === "drive.google.com") {
        id =
          path.match(
            /^\/file\/d\/([a-zA-Z0-9_-]{20,})/
          )?.[1] ||
          url.searchParams.get("id") ||
          "";

        if (/^[a-zA-Z0-9_-]{20,}$/.test(id)) {
          return {
            type: "iframe",
            url:
              "https://drive.google.com/file/d/" +
              id +
              "/preview"
          };
        }
      }

      // FICHIER VIDEO DIRECT
      if (/\.(mp4|webm)$/i.test(path)) {
        return {
          type: "video",
          url: url.href
        };
      }

    } catch (error) {
      console.warn("Lien vidéo incorrect :", error);
    }

    return null;
  }

  /* ==========================================================
     DESIGN
  ========================================================== */

  function addStyles() {
    const style = document.createElement("style");

    style.textContent = `
      .eah-videos-section {
        padding-top: 0 !important;
      }

      .eah-videos-panel {
        padding: clamp(18px, 3vw, 32px);
        border-radius: 24px;
        background: rgba(3,20,38,.88);
        border: 1px solid rgba(48,207,255,.25);
      }

      .eah-videos-heading {
        font-size: clamp(23px,3vw,32px);
        font-weight: 800;
        color: #f5f9ff;
        margin: 0 0 24px;
      }

      .eah-videos-grid {
        display: grid;
        grid-template-columns:
          repeat(auto-fit,minmax(280px,1fr));
        gap: 22px;
      }

      .eah-video-card {
        min-width: 0;
      }

      .eah-video-name {
        color: #fff;
        font-size: 18px;
        margin: 0 0 12px;
      }

      .eah-video-frame {
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        background: #020c17;
        border-radius: 17px;
        border: 1px solid rgba(48,207,255,.3);
      }

      .eah-video-frame iframe,
      .eah-video-frame video {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
        background: #000;
      }

      @media(max-width:600px) {
        .eah-videos-grid {
          grid-template-columns: 1fr;
        }

        .eah-videos-panel {
          border-radius: 18px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* ==========================================================
     CONSTRUIRE LES EMPLACEMENTS
  ========================================================== */

  function createSections() {
    DISCIPLINES.forEach(discipline => {
      const page = document.getElementById(discipline);

      if (!page) return;

      const section = document.createElement("section");
      section.className =
        "section eah-videos-section";
      section.hidden = true;

      const container = document.createElement("div");
      container.className = "container";

      const panel = document.createElement("div");
      panel.className = "eah-videos-panel";

      const heading = document.createElement("h2");
      heading.className = "eah-videos-heading";
      heading.textContent = getLanguage();

      const grid = document.createElement("div");
      grid.className = "eah-videos-grid";

      panel.append(heading, grid);
      container.appendChild(panel);
      section.appendChild(container);

      // Place le lecteur sous le contenu explicatif.
      page.appendChild(section);

      containers.set(discipline, {
        page,
        section,
        heading,
        grid
      });

      // Arrête les vidéos lorsqu'on quitte la page.
      new MutationObserver(() => {
        updatePlayback(discipline);
      }).observe(page, {
        attributes: true,
        attributeFilter: ["class"]
      });
    });
  }

  /* ==========================================================
     ACTIVER / ARRETER LA LECTURE
  ========================================================== */

  function updatePlayback(discipline) {
    const item = containers.get(discipline);

    if (!item) return;

    const active =
      item.page.classList.contains("active");

    item.grid.querySelectorAll(
      "iframe[data-video-url]"
    ).forEach(frame => {
      if (active) {
        if (!frame.hasAttribute("src")) {
          frame.src = frame.dataset.videoUrl;
        }
      } else {
        frame.removeAttribute("src");
      }
    });

    if (!active) {
      item.grid.querySelectorAll("video")
        .forEach(video => video.pause());
    }
  }

  /* ==========================================================
     AFFICHAGE DES VIDEOS
  ========================================================== */

  function renderVideos(rows) {
    DISCIPLINES.forEach(discipline => {
      const item = containers.get(discipline);

      if (!item) return;

      const videos = rows
        .filter(row => row.discipline === discipline)
        .map(row => ({
          row,
          player: getPlayer(row.video_url)
        }))
        .filter(value => value.player);

      item.grid.replaceChildren();

      item.section.hidden = videos.length === 0;

      videos.forEach(({ row, player }) => {
        const card = document.createElement("article");
        card.className = "eah-video-card";

        const name = document.createElement("h3");
        name.className = "eah-video-name";
        name.textContent =
          row.title || "Vidéo EAH Diving";

        const frameBox = document.createElement("div");
        frameBox.className = "eah-video-frame";

        if (player.type === "iframe") {
          const iframe = document.createElement("iframe");

          iframe.title =
            row.title || "Vidéo EAH Diving";

          iframe.loading = "lazy";
          iframe.allowFullscreen = true;
          iframe.allow =
            "encrypted-media; fullscreen; picture-in-picture";
          iframe.referrerPolicy =
            "strict-origin-when-cross-origin";

          iframe.dataset.videoUrl = player.url;

          frameBox.appendChild(iframe);
        } else {
          const video = document.createElement("video");

          video.src = player.url;
          video.controls = true;
          video.playsInline = true;
          video.preload = "none";

          frameBox.appendChild(video);
        }

        card.append(name, frameBox);
        item.grid.appendChild(card);
      });

      updatePlayback(discipline);
    });
  }

  /* ==========================================================
     CHARGER LES VIDEOS DEPUIS SUPABASE
  ========================================================== */

  async function loadVideos() {
    const endpoint =
      API_URL +
      "/rest/v1/eah_discipline_videos" +
      "?select=video_id,discipline,title,video_url,sort_order" +
      "&active=eq.true" +
      "&order=sort_order.asc";

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          apikey: API_KEY,
          Accept: "application/json"
        },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(
          "HTTP " + response.status
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Réponse Supabase invalide");
      }

      renderVideos(data);

    } catch (error) {
      console.warn(
        "EAH — Chargement des vidéos :",
        error
      );
    }
  }

  /* ==========================================================
     INITIALISATION
  ========================================================== */

  function init() {
    addStyles();
    createSections();
    loadVideos();

    // Traduction du titre des vidéos.
    new MutationObserver(() => {
      containers.forEach(item => {
        const title = getLanguage();

        if (item.heading.textContent !== title) {
          item.heading.textContent = title;
        }
      });
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });

    // Actualiser au retour depuis une autre page.
    window.addEventListener("pageshow", event => {
      if (event.persisted) {
        loadVideos();
      }
    });
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
