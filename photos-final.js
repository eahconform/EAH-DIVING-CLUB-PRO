/* ============================================================
   EAH DIVING PRO
   PHOTOS FINAL V3
   03/10/2026

   CORRECTIONS :
   - plus de Blazon Or sur Plongeon olympique
   - photos disciplines forcées correctement
   - heroes visibles dès l'ouverture
   - navigation SPA sans rafraîchissement
   - Blazons corrigés uniquement sur leurs vraies cartes
   - ne touche pas aux photos Coach / Plongeur / Actualités / Spots
============================================================ */

(() => {

  "use strict";


  /* ==========================================================
     CONFIGURATION DES PHOTOS
  ========================================================== */

  const EAH_PHOTOS = {

    /* Accueil */
    accueil: "hero-divers-group.png",

    /* Cartes disciplines de l'accueil */
    cardOlympique: "olympique-desktop.jpg",
    cardFreestyle: "hero-divers-group.png",
    cardHighDiving: "hero-high-diving.png",
    cardSautAnge: "portrait-water-diver.jpg",

    /* Haut des pages disciplines */
    heroOlympique: "olympique-desktop.jpg",
    heroFreestyle: "hero-divers-group.png",
    heroHighDiving: "high-diving-desktop.png",
    heroSautAnge: "portrait-water-diver.jpg",

    /* Haut de la page Blazons */
    heroBlazons: "hero-blazons.png",

    /* Secours uniquement */
    fallback: "site-water-premium-bg.jpg"

  };


  const BLAZON_FILES = {

    "blazon blanc": "blazon-blanc.png",
    "blazon orange": "blazon-orange.png",
    "blazon vert": "blazon-vert.png",
    "blazon bleu": "blazon-bleu.png",
    "blazon rouge": "blazon-rouge.png",
    "blazon bronze": "blazon-bronze.png",
    "blazon argent": "blazon-argent.png",
    "blazon silver": "blazon-argent.png",
    "blazon or": "blazon-or.png",
    "blazon noir": "blazon-noir.png",
    "blazon legend": "blazon-legend.png",
    "blazon légende": "blazon-legend.png",
    "blazon titan": "blazon-titan.png"

  };


  /* ==========================================================
     OUTILS
  ========================================================== */

  function normalize(value) {

    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ø/g, "o")
      .trim();

  }


  function currentHash() {

    return normalize(
      window.location.hash || "#accueil"
    );

  }


  function preload(src) {

    if (!src) return;

    const image = new Image();

    image.decoding = "async";

    try {
      image.fetchPriority = "high";
    } catch (e) {}

    image.src = src;

  }


  function preloadCriticalImages() {

    Object.values(EAH_PHOTOS)
      .forEach(preload);

    Object.values(BLAZON_FILES)
      .forEach(preload);

  }


  /* ==========================================================
     CSS DE SECURITE
  ========================================================== */

  function installPhotoCSS() {

    if (
      document.getElementById("eah-photo-final-v3")
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "eah-photo-final-v3";

    style.textContent = `

      /* HERO : pas de voile noir */

      .eah-photo-hero {
        background-size: cover !important;
        background-position: center center !important;
        background-repeat: no-repeat !important;
        background-blend-mode: normal !important;
      }

      .eah-photo-hero::before,
      .eah-photo-hero::after {
        content: none !important;
        display: none !important;
        opacity: 0 !important;
        background: transparent !important;
      }


      /* Images forcées */

      .eah-photo-forced {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;

        width: 100% !important;
        height: 100% !important;

        object-fit: cover !important;
        object-position: center center !important;
      }


      /* Blazons individuels */

      .eah-blazon-forced {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;

        object-fit: contain !important;

        filter: none !important;
      }


      /* Texte sur les images */

      .eah-photo-hero h1,
      .eah-photo-hero h2,
      .eah-photo-hero h3,
      .eah-photo-hero p,
      .eah-photo-hero span {
        position: relative;
        z-index: 3;
      }

    `;

    document.head.appendChild(style);

  }


  /* ==========================================================
     RECHERCHE D'UN TITRE
  ========================================================== */

  function findHeading(names) {

    const wanted =
      Array.isArray(names)
        ? names.map(normalize)
        : [normalize(names)];

    return Array
      .from(
        document.querySelectorAll(
          "h1,h2,h3,h4"
        )
      )
      .find(el => {

        const text =
          normalize(el.textContent);

        return wanted.some(
          wantedText =>
            text === wantedText ||
            text.includes(wantedText)
        );

      }) || null;

  }


  /* ==========================================================
     TROUVER UNE CARTE
  ========================================================== */

  function findCardFromHeading(heading) {

    if (!heading) return null;

    const direct =
      heading.closest(
        ".discipline-card, .disciplines-card, article"
      );

    if (direct) return direct;


    let node =
      heading.parentElement;


    for (
      let i = 0;
      i < 6 && node;
      i++
    ) {

      const rect =
        node.getBoundingClientRect();

      if (
        rect.width > 250 &&
        rect.height > 220 &&
        rect.height < 1000
      ) {

        return node;

      }

      node =
        node.parentElement;

    }


    return heading.parentElement;

  }


  /* ==========================================================
     TROUVER LE HERO
  ========================================================== */

  function findHeroFromHeading(heading) {

    if (!heading) return null;


    const section =
      heading.closest("section");


    if (section) {

      const rect =
        section.getBoundingClientRect();

      if (
        rect.width >
          window.innerWidth * 0.6 &&
        rect.height > 180
      ) {

        return section;

      }

    }


    let node =
      heading.parentElement;

    let best =
      null;


    for (
      let i = 0;
      i < 7 && node;
      i++
    ) {

      const rect =
        node.getBoundingClientRect();

      if (
        rect.width >
          window.innerWidth * 0.65 &&
        rect.height > 180 &&
        rect.height < 950
      ) {

        best =
          node;

      }

      node =
        node.parentElement;

    }


    return best;

  }


  /* ==========================================================
     APPLIQUER UNE PHOTO
  ========================================================== */

  function forcePhoto(element, src) {

    if (!element || !src) {
      return false;
    }


    element.classList.add(
      "eah-photo-hero"
    );


    /*
      Toujours mettre également le background :
      l'image est donc visible même si le HTML
      contient une ancienne balise IMG cassée.
    */

    element.style.setProperty(
      "background-image",
      `url("${src}")`,
      "important"
    );

    element.style.setProperty(
      "background-size",
      "cover",
      "important"
    );

    element.style.setProperty(
      "background-position",
      "center center",
      "important"
    );

    element.style.setProperty(
      "background-repeat",
      "no-repeat",
      "important"
    );


    /*
      Si une balise IMG existe dans la zone,
      on lui donne directement la bonne photo.
    */

    const imgs =
      Array.from(
        element.querySelectorAll("img")
      );


    const img =
      imgs.find(image => {

        const source =
          normalize(
            image.getAttribute("src")
          );

        const classes =
          normalize(
            image.className
          );

        return (
          !source.includes("logo") &&
          !source.includes("blazon") &&
          !classes.includes("profile") &&
          !classes.includes("coach") &&
          !classes.includes("avatar")
        );

      });


    if (img) {

      if (
        img.getAttribute("src") !== src
      ) {

        img.src =
          src;

      }


      img.loading =
        "eager";

      img.decoding =
        "async";


      try {

        img.fetchPriority =
          "high";

      } catch (e) {}


      img.classList.add(
        "eah-photo-forced"
      );


      img.onerror =
        function () {

          if (
            this.dataset.eahFallback === "1"
          ) {
            return;
          }

          this.dataset.eahFallback =
            "1";

          this.src =
            EAH_PHOTOS.fallback;

        };

    }


    return true;

  }


  /* ==========================================================
     ACCUEIL
  ========================================================== */

  function fixHomeHero() {

    const hash =
      currentHash();


    if (
      hash !== "#accueil" &&
      hash !== "#"
    ) {
      return;
    }


    const heading =
      findHeading([
        "Le plongeon"
      ]);


    const hero =
      findHeroFromHeading(
        heading
      );


    forcePhoto(
      hero,
      EAH_PHOTOS.accueil
    );

  }


  /* ==========================================================
     CARTES DISCIPLINES ACCUEIL
  ========================================================== */

  function fixHomeDisciplineCards() {

    const cards = [

      {
        titles: [
          "Plongeon olympique"
        ],
        photo:
          EAH_PHOTOS.cardOlympique
      },

      {
        titles: [
          "Freestyle / Døds",
          "Freestyle / Dods",
          "Freestyle"
        ],
        photo:
          EAH_PHOTOS.cardFreestyle
      },

      {
        titles: [
          "High Diving"
        ],
        photo:
          EAH_PHOTOS.cardHighDiving
      },

      {
        titles: [
          "Saut de l'ange",
          "Saut de lange"
        ],
        photo:
          EAH_PHOTOS.cardSautAnge
      }

    ];


    cards.forEach(config => {

      const heading =
        findHeading(
          config.titles
        );


      if (!heading) {
        return;
      }


      const card =
        findCardFromHeading(
          heading
        );


      forcePhoto(
        card,
        config.photo
      );

    });

  }


  /* ==========================================================
     HAUT DES PAGES
  ========================================================== */

  function fixCurrentPageHero() {

    const hash =
      currentHash();


    let config =
      null;


    if (
      hash.includes("olympique")
    ) {

      config = {
        titles: [
          "Plongeon olympique"
        ],
        photo:
          EAH_PHOTOS.heroOlympique
      };

    }


    else if (
      hash.includes("freestyle") ||
      hash.includes("dods")
    ) {

      config = {
        titles: [
          "Freestyle / Døds",
          "Freestyle / Dods",
          "Freestyle"
        ],
        photo:
          EAH_PHOTOS.heroFreestyle
      };

    }


    else if (
      hash.includes("highdiving") ||
      hash.includes("high-diving")
    ) {

      config = {
        titles: [
          "High Diving"
        ],
        photo:
          EAH_PHOTOS.heroHighDiving
      };

    }


    else if (
      hash.includes("ange")
    ) {

      config = {
        titles: [
          "Saut de l'ange",
          "Saut de lange"
        ],
        photo:
          EAH_PHOTOS.heroSautAnge
      };

    }


    else if (
      hash.includes("blazon")
    ) {

      config = {
        titles: [
          "Les blazons"
        ],
        photo:
          EAH_PHOTOS.heroBlazons
      };

    }


    if (!config) {
      return;
    }


    const heading =
      findHeading(
        config.titles
      );


    const hero =
      findHeroFromHeading(
        heading
      );


    forcePhoto(
      hero,
      config.photo
    );

  }


  /* ==========================================================
     BLAZONS INDIVIDUELS
     IMPORTANT :
     comparaison du TITRE EXACT.
     On ne cherche plus "or" dans tout le texte.
  ========================================================== */

  function fixIndividualBlazons() {

    document
      .querySelectorAll(
        "h2,h3,h4"
      )
      .forEach(heading => {

        const title =
          normalize(
            heading.textContent
          );


        const file =
          BLAZON_FILES[
            title
          ];


        if (!file) {
          return;
        }


        const card =
          heading.closest(
            ".blazon-card, article"
          )
          ||
          heading.parentElement?.parentElement;


        if (!card) {
          return;
        }


        const img =
          card.querySelector("img");


        if (!img) {
          return;
        }


        img.src =
          file;


        img.loading =
          "eager";


        img.classList.add(
          "eah-blazon-forced"
        );

      });

  }


  /* ==========================================================
     EXECUTION
  ========================================================== */

  function applyAll() {

    installPhotoCSS();

    fixHomeHero();

    fixHomeDisciplineCards();

    fixCurrentPageHero();

    fixIndividualBlazons();

  }


  /*
    Exécution immédiate.
  */

  preloadCriticalImages();

  applyAll();


  /*
    DOM terminé.
  */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      applyAll,
      {
        once: true
      }
    );

  }


  /*
    Navigation interne.
  */

  function refreshRoute() {

    /*
      Le premier passage permet d'avoir
      immédiatement quelque chose.

      Les suivants interceptent la fin du
      rendu de script.js.
    */

    applyAll();

    requestAnimationFrame(
      applyAll
    );

    setTimeout(
      applyAll,
      20
    );

    setTimeout(
      applyAll,
      60
    );

    setTimeout(
      applyAll,
      120
    );

    setTimeout(
      applyAll,
      250
    );

    setTimeout(
      applyAll,
      500
    );

  }


  window.addEventListener(
    "hashchange",
    refreshRoute
  );


  window.addEventListener(
    "load",
    refreshRoute
  );


  /*
    Le routeur EAH remplace certaines parties
    du DOM après le changement de hash.

    Dès qu'une nouvelle section est créée,
    on réapplique les photos.
  */

  let mutationTimer = null;


  const observer =
    new MutationObserver(() => {

      clearTimeout(
        mutationTimer
      );


      mutationTimer =
        setTimeout(
          applyAll,
          15
        );

    });


  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true
    }
  );

})();
