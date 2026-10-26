/* =========================================================
   EAH DIVING CLUB PRO
   PERSONNALISATION MULTICLUB V1

   Lecture des configurations publiques Supabase.
   Ne modifie pas les fonctions EAH existantes.
========================================================= */

(function () {
  "use strict";

  const EAH_CUSTOM = {

    club: null,
    config: null,
    pages: [],
    badges: [],
    initialized: false,

    getSupabaseConfig() {

      const config = window.EAH_CONFIG || {};

      return {
        url: String(
          config.SUPABASE_URL || ""
        ).replace(/\/$/, ""),

        key: String(
          config.SUPABASE_PUBLISHABLE_KEY || ""
        )
      };

    },

    async request(table, filters = "") {

      const { url, key } =
        this.getSupabaseConfig();

      if (!url || !key) {
        throw new Error(
          "Configuration Supabase absente"
        );
      }

      const response = await fetch(
        `${url}/rest/v1/${table}?${filters}`,
        {
          method: "GET",

          headers: {
            apikey: key,
            Accept: "application/json"
          },

          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erreur Supabase ${response.status}`
        );
      }

      return response.json();

    },

    async loadClub(slug) {

      if (!slug) {
        throw new Error(
          "Identifiant du club manquant"
        );
      }

      const clubs = await this.request(
        "clubs",
        `select=id,slug,name,logo_url,primary_color,secondary_color` +
        `&slug=eq.${encodeURIComponent(slug)}` +
        `&active=eq.true&limit=1`
      );

      if (!clubs.length) {
        throw new Error(
          "Club introuvable ou inactif"
        );
      }

      this.club = clubs[0];

      return this.club;

    },

    async loadConfiguration() {

      if (!this.club) {
        throw new Error(
          "Aucun club sélectionné"
        );
      }

      const clubId =
        encodeURIComponent(this.club.id);

      const results = await Promise.all([

        this.request(
          "eah_club_site_config",
          `select=*&club_id=eq.${clubId}`
        ),

        this.request(
          "eah_club_pages",
          `select=*&club_id=eq.${clubId}` +
          `&active=eq.true&order=sort_order.asc`
        ),

        this.request(
          "eah_club_badges",
          `select=*&club_id=eq.${clubId}` +
          `&active=eq.true&order=sort_order.asc`
        )

      ]);

      this.config = results[0][0] || {};
      this.pages = results[1] || [];
      this.badges = results[2] || [];

      return this.config;

    },

    applyIdentity() {

      if (!this.club) return;

      const config = this.config || {};

      const title =
        config.site_title ||
        this.club.name ||
        "EAH Diving";

      document.title = title;

      const primary =
        config.primary_color ||
        this.club.primary_color ||
        "#0b6bff";

      const secondary =
        config.secondary_color ||
        this.club.secondary_color ||
        "#03131f";

      document.documentElement.style.setProperty(
        "--eah-club-primary",
        primary
      );

      document.documentElement.style.setProperty(
        "--eah-club-secondary",
        secondary
      );

      const titleElements =
        document.querySelectorAll(
          "[data-eah-club-title]"
        );

      titleElements.forEach(element => {
        element.textContent = title;
      });

      const logo =
        config.logo_url ||
        this.club.logo_url;

      if (logo) {

        document.querySelectorAll(
          "[data-eah-club-logo]"
        ).forEach(element => {

          if (element.tagName === "IMG") {
            element.src = logo;
            element.alt = title;
          }

        });

      }

      const hero = config.hero_url;

      if (hero) {

        document.querySelectorAll(
          "[data-eah-club-hero]"
        ).forEach(element => {

          element.style.backgroundImage =
            `url("${hero.replace(/"/g, "%22")}")`;

        });

      }

    },

    renderPages() {

      const container =
        document.querySelector(
          "[data-eah-club-pages]"
        );

      if (!container) return;

      container.replaceChildren();

      this.pages.forEach(page => {

        const article =
          document.createElement("article");

        article.className =
          "eah-custom-page";

        const title =
          document.createElement("h2");

        title.textContent =
          page.title || "";

        article.appendChild(title);

        if (page.image_url) {

          const image =
            document.createElement("img");

          image.src = page.image_url;
          image.alt = page.title || "";
          image.loading = "lazy";

          article.appendChild(image);

        }

        if (page.description) {

          const description =
            document.createElement("p");

          description.textContent =
            page.description;

          article.appendChild(description);

        }

        if (page.video_url) {

          const link =
            document.createElement("a");

          link.href = page.video_url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "Voir la vidéo";

          article.appendChild(link);

        }

        container.appendChild(article);

      });

    },

    renderBadges() {

      const container =
        document.querySelector(
          "[data-eah-club-badges]"
        );

      if (!container) return;

      container.replaceChildren();

      this.badges.forEach(badge => {

        const article =
          document.createElement("article");

        article.className =
          "eah-custom-badge";

        if (badge.image_url) {

          const image =
            document.createElement("img");

          image.src = badge.image_url;
          image.alt = badge.name || "";
          image.loading = "lazy";

          article.appendChild(image);

        }

        const title =
          document.createElement("h3");

        title.textContent =
          badge.name || "";

        article.appendChild(title);

        container.appendChild(article);

      });

    },

    async init(slug) {

      try {

        await this.loadClub(slug);

        await this.loadConfiguration();

        this.applyIdentity();

        this.renderPages();

        this.renderBadges();

        this.initialized = true;

        console.log(
          "EAH personnalisation chargée :",
          this.club.name
        );

        document.dispatchEvent(
          new CustomEvent(
            "eah:club-customization-ready",
            {
              detail: {
                club: this.club,
                config: this.config,
                pages: this.pages,
                badges: this.badges
              }
            }
          )
        );

        return true;

      } catch (error) {

        console.error(
          "EAH personnalisation :",
          error
        );

        return false;

      }

    }

  };

  window.EAH_CUSTOM = EAH_CUSTOM;

})();
