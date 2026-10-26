/* ============================================================
   EAH DIVING CLUB PRO
   PREVISUALISATION CLUB V1

   - Charge les données Supabase
   - Affiche les pages personnalisées
   - Affiche les blazons personnalisés
   - Ne modifie pas la navigation existante
   - Ne modifie pas les profils NFC

   Activation :
   ?eah_club_preview=SLUG_DU_CLUB
============================================================ */

(function () {

  "use strict";

  const PREVIEW_PARAMETER =
    "eah_club_preview";

  const SUPABASE_URL =
    "https://limyeqpdzjjwsdximehp.supabase.co";

  const STYLE_ID =
    "eah-club-preview-styles-v1";

  const ROOT_ID =
    "eah-club-preview-root-v1";


  /* ========================================================
     OUTILS
  ======================================================== */

  function getSlug() {

    const params =
      new URLSearchParams(
        window.location.search
      );

    return String(
      params.get(PREVIEW_PARAMETER) || ""
    ).trim();

  }


  function getPublicKey() {

    const config =
      window.EAH_CONFIG || {};

    return (
      config.SUPABASE_PUBLISHABLE_KEY ||
      config.SUPABASE_ANON_KEY ||
      ""
    );

  }


  async function query(table, parameters) {

    const key = getPublicKey();

    if (!key) {

      throw new Error(
        "Clé publique Supabase introuvable."
      );

    }

    const url =
      SUPABASE_URL +
      "/rest/v1/" +
      table +
      "?" +
      parameters;

    const response = await fetch(
      url,
      {
        method: "GET",

        headers: {
          apikey: key,
          Authorization: "Bearer " + key,
          Accept: "application/json"
        },

        cache: "no-store"
      }
    );

    if (!response.ok) {

      throw new Error(
        "Erreur Supabase : HTTP " +
        response.status
      );

    }

    return response.json();

  }


  /* ========================================================
     LECTURE DU CLUB
  ======================================================== */

  async function loadClub(slug) {

    if (
      !/^[a-z0-9-]{2,80}$/.test(slug)
    ) {

      throw new Error(
        "Identifiant du club invalide."
      );

    }

    const clubs = await query(
      "clubs",

      "select=id,slug,name" +
      "&slug=eq." +
      encodeURIComponent(slug) +
      "&active=eq.true" +
      "&limit=1"
    );

    if (!clubs.length) {

      throw new Error(
        "Club introuvable."
      );

    }

    const club = clubs[0];

    const clubId =
      encodeURIComponent(club.id);

    const [
      configurations,
      pages,
      badges
    ] = await Promise.all([

      query(
        "eah_club_site_config",

        "select=*" +
        "&club_id=eq." + clubId
      ),

      query(
        "eah_club_pages",

        "select=*" +
        "&club_id=eq." + clubId +
        "&active=eq.true" +
        "&order=sort_order.asc"
      ),

      query(
        "eah_club_badges",

        "select=*" +
        "&club_id=eq." + clubId +
        "&active=eq.true" +
        "&order=sort_order.asc"
      )

    ]);

    return {

      club,

      config:
        configurations[0] || {},

      pages,

      badges

    };

  }


  /* ========================================================
     STYLES
  ======================================================== */

  function installStyles() {

    if (
      document.getElementById(STYLE_ID)
    ) {

      return;

    }

    const style =
      document.createElement("style");

    style.id = STYLE_ID;

    style.textContent = `

      #${ROOT_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        overflow-y: auto;
        background: #03131f;
        color: white;
        font-family: Arial, sans-serif;
      }

      #${ROOT_ID} * {
        box-sizing: border-box;
      }

      #${ROOT_ID} .eah-preview-header {
        padding: 24px;
        background:
          linear-gradient(
            135deg,
            #063b73,
            #03131f
          );
        border-bottom:
          1px solid rgba(255,255,255,.15);
      }

      #${ROOT_ID} .eah-preview-label {
        font-size: 12px;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: #9ecbff;
      }

      #${ROOT_ID} h1 {
        font-size: 32px;
        margin: 14px 0;
      }

      #${ROOT_ID} .eah-preview-nav {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 20px;
      }

      #${ROOT_ID} button {
        border: 1px solid
          rgba(255,255,255,.25);
        background: rgba(255,255,255,.08);
        color: white;
        padding: 12px 18px;
        border-radius: 10px;
        cursor: pointer;
      }

      #${ROOT_ID} button:hover {
        background: rgba(255,255,255,.18);
      }

      #${ROOT_ID} button.active {
        background: var(
          --eah-preview-primary,
          #0b6bff
        );
      }

      #${ROOT_ID} .eah-preview-main {
        max-width: 1100px;
        margin: auto;
        padding: 30px 20px;
      }

      #${ROOT_ID} .eah-preview-card {
        background: #0b2033;
        border: 1px solid
          rgba(255,255,255,.12);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
      }

      #${ROOT_ID} .eah-preview-card img {
        display: block;
        width: 100%;
        max-height: 360px;
        object-fit: contain;
        border-radius: 12px;
        margin-top: 20px;
      }

      #${ROOT_ID} .eah-preview-badges {
        display: grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(180px, 1fr)
          );
        gap: 20px;
      }

      #${ROOT_ID} .eah-preview-badge {
        background: #0b2033;
        padding: 20px;
        text-align: center;
        border-radius: 14px;
      }

      #${ROOT_ID} .eah-preview-badge img {
        width: 120px;
        height: 120px;
        object-fit: contain;
      }

      #${ROOT_ID} .eah-preview-error {
        padding: 30px;
        color: #ffb6b6;
      }

    `;

    document.head.appendChild(style);

  }


  /* ========================================================
     AFFICHAGE
  ======================================================== */

  function createElement(
    tag,
    text,
    className
  ) {

    const element =
      document.createElement(tag);

    if (text !== undefined) {

      element.textContent =
        String(text);

    }

    if (className) {

      element.className =
        className;

    }

    return element;

  }


  function render(data) {

    installStyles();

    let root =
      document.getElementById(ROOT_ID);

    if (!root) {

      root =
        document.createElement("div");

      root.id = ROOT_ID;

      document.body.appendChild(root);

    }

    root.replaceChildren();

    const config =
      data.config || {};

    const primary =
      config.primary_color ||
      "#0b6bff";

    root.style.setProperty(
      "--eah-preview-primary",
      primary
    );

    const header =
      createElement(
        "header",
        undefined,
        "eah-preview-header"
      );

    header.appendChild(
      createElement(
        "div",
        "EAH DIVING — PRÉVISUALISATION CLUB",
        "eah-preview-label"
      )
    );

    header.appendChild(
      createElement(
        "h1",
        config.site_title ||
        data.club.name
      )
    );

    if (config.tagline) {

      header.appendChild(
        createElement(
          "p",
          config.tagline
        )
      );

    }

    const navigation =
      createElement(
        "nav",
        undefined,
        "eah-preview-nav"
      );

    const main =
      createElement(
        "main",
        undefined,
        "eah-preview-main"
      );

    const buttons = [];

    function showPage(page) {

      main.replaceChildren();

      buttons.forEach(button => {

        button.classList.toggle(
          "active",
          button.dataset.slug === page.slug
        );

      });

      const card =
        createElement(
          "article",
          undefined,
          "eah-preview-card"
        );

      card.appendChild(
        createElement(
          "h2",
          page.title
        )
      );

      if (page.description) {

        card.appendChild(
          createElement(
            "p",
            page.description
          )
        );

      }

      if (page.image_url) {

        const image =
          document.createElement("img");

        image.src =
          page.image_url;

        image.alt =
          page.title;

        image.loading =
          "lazy";

        card.appendChild(image);

      }

      if (page.video_url) {

        const link =
          document.createElement("a");

        link.href =
          page.video_url;

        link.target =
          "_blank";

        link.rel =
          "noopener noreferrer";

        link.textContent =
          "Voir la vidéo";

        card.appendChild(link);

      }

      main.appendChild(card);

    }


    data.pages.forEach(page => {

      const button =
        createElement(
          "button",
          page.title
        );

      button.type = "button";

      button.dataset.slug =
        page.slug;

      button.addEventListener(
        "click",
        () => showPage(page)
      );

      buttons.push(button);

      navigation.appendChild(button);

    });


    const badgeButton =
      createElement(
        "button",
        "Blazons"
      );

    badgeButton.type =
      "button";

    badgeButton.addEventListener(
      "click",
      () => {

        main.replaceChildren();

        buttons.forEach(
          button =>
            button.classList.remove(
              "active"
            )
        );

        const grid =
          createElement(
            "div",
            undefined,
            "eah-preview-badges"
          );

        data.badges.forEach(badge => {

          const card =
            createElement(
              "article",
              undefined,
              "eah-preview-badge"
            );

          if (badge.image_url) {

            const image =
              document.createElement("img");

            image.src =
              badge.image_url;

            image.alt =
              badge.name;

            card.appendChild(image);

          }

          card.appendChild(
            createElement(
              "h3",
              badge.name
            )
          );

          grid.appendChild(card);

        });

        main.appendChild(grid);

      }
    );

    navigation.appendChild(
      badgeButton
    );


    const exitButton =
      createElement(
        "button",
        "Retour au site"
      );

    exitButton.type =
      "button";

    exitButton.addEventListener(
      "click",
      () => {

        const url =
          new URL(
            window.location.href
          );

        url.searchParams.delete(
          PREVIEW_PARAMETER
        );

        window.location.href =
          url.toString();

      }
    );

    navigation.appendChild(
      exitButton
    );

    header.appendChild(
      navigation
    );

    root.appendChild(header);

    root.appendChild(main);

    if (data.pages.length) {

      showPage(data.pages[0]);

    } else {

      main.appendChild(
        createElement(
          "p",
          "Aucune page active."
        )
      );

    }

  }


  /* ========================================================
     INITIALISATION
  ======================================================== */

  async function init() {

    const slug = getSlug();

    if (!slug) {

      return;

    }

    try {

      const data =
        await loadClub(slug);

      render(data);

      console.log(
        "EAH CLUB PREVIEW OK",
        data.club.slug
      );

    } catch (error) {

      console.error(
        "EAH CLUB PREVIEW ERROR",
        error
      );

      installStyles();

      let root =
        document.getElementById(
          ROOT_ID
        );

      if (!root) {

        root =
          document.createElement("div");

        root.id = ROOT_ID;

        document.body.appendChild(root);

      }

      root.replaceChildren();

      root.appendChild(
        createElement(
          "p",
          error.message,
          "eah-preview-error"
        )
      );

    }

  }


  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );

  } else {

    init();

  }

})();
