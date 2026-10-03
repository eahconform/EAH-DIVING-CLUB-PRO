/* ============================================================
   EAH DIVING PRO
   MEDIA FIX FINAL V2
   02/10/2026

   - Ne cache plus les images
   - Corrige les heroes des disciplines
   - Corrige le hero Blazons
   - Protège les 11 blazons
   - Protège les photos Actualités
   - Protège les photos Spots
   - Desktop / tablette / téléphone
   - Pas besoin d'actualiser après navigation
============================================================ */

(() => {

  "use strict";


  /* ============================================================
     FICHIERS
  ============================================================ */

  const FILES = {

    accueil:
      "hero-divers-group.png",

    blazons:
      "hero-blazons.png",

    olympique: {
      desktop:
        "olympique-desktop.jpg",

      mobile:
        "olympique-mobile.jpg"
    },

    freestyle: {
      desktop:
        "freestyle-desktop.jpg",

      mobile:
        "freestyle-mobile.jpg"
    },

    highdiving: {
      desktop:
        "high-diving-desktop.png",

      mobile:
        "high-diving-mobile.jpg"
    },

    ange: {
      desktop:
        "saut-ange-desktop.jpg",

      mobile:
        "saut-ange-mobile.jpg"
    }

  };


  const BLAZONS = {

    "blazon blanc":
      "blazon-blanc.png",

    "blazon orange":
      "blazon-orange.png",

    "blazon vert":
      "blazon-vert.png",

    "blazon bleu":
      "blazon-bleu.png",

    "blazon rouge":
      "blazon-rouge.png",

    "blazon bronze":
      "blazon-bronze.png",

    "blazon argent":
      "blazon-argent.png",

    "blazon silver":
      "blazon-argent.png",

    "blazon or":
      "blazon-or.png",

    "blazon gold":
      "blazon-or.png",

    "blazon noir":
      "blazon-noir.png",

    "blazon legend":
      "blazon-legend.png",

    "blazon legende":
      "blazon-legend.png",

    "blazon titan":
      "blazon-titan.png"

  };


  /* ============================================================
     CSS
  ============================================================ */

  function installerCSS() {

    if (
      document.getElementById(
        "eah-media-v2-css"
      )
    ) {
      return;
    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "eah-media-v2-css";


    style.textContent = `

      /* ======================================================
         AUCUN VOILE SOMBRE SUR LES HEROES
      ====================================================== */

      .eah-v2-hero {
        position: relative !important;

        background-size:
          cover !important;

        background-position:
          center center !important;

        background-repeat:
          no-repeat !important;

        background-blend-mode:
          normal !important;

        background-color:
          transparent !important;
      }


      .eah-v2-hero::before,
      .eah-v2-hero::after {
        display:
          none !important;

        content:
          none !important;

        opacity:
          0 !important;

        background:
          none !important;

        background-image:
          none !important;
      }


      /* IMPORTANT :
         on ne cache plus les images */

      .eah-v2-hero img {
        opacity:
          1 !important;

        visibility:
          visible !important;
      }


      /* Texte lisible sans voile noir */

      .eah-v2-hero h1,
      .eah-v2-hero h2,
      .eah-v2-hero p,
      .eah-v2-hero span {
        position:
          relative;

        z-index:
          3;

        text-shadow:
          0 3px 16px rgba(0,0,0,.55);
      }


      /* ======================================================
         IMAGES DE DISCIPLINE
      ====================================================== */

      .eah-discipline-photo {
        display:
          block !important;

        width:
          100% !important;

        height:
          100% !important;

        object-fit:
          cover !important;

        object-position:
          center !important;

        opacity:
          1 !important;

        visibility:
          visible !important;

        filter:
          brightness(1.12)
          contrast(1.02)
          saturate(1.07)
          !important;
      }


      /* ======================================================
         BLAZONS
      ====================================================== */

      .eah-blazon-image {
        display:
          block !important;

        opacity:
          1 !important;

        visibility:
          visible !important;

        object-fit:
          contain !important;

        filter:
          none !important;
      }


      /* ======================================================
         ACTUALITES / SPOTS
      ====================================================== */

      .eah-cms-image {
        display:
          block !important;

        width:
          100% !important;

        object-fit:
          cover !important;

        opacity:
          1 !important;

        visibility:
          visible !important;
      }


      /* Fond premium général */

      .site-background {
        background-image:
          url("site-water-premium-bg.jpg")
          !important;

        background-size:
          cover !important;

        background-position:
          center !important;

        background-repeat:
          no-repeat !important;

        opacity:
          1 !important;
      }


      .site-background::before,
      .site-background::after {
        display:
          none !important;

        content:
          none !important;

        opacity:
          0 !important;
      }

    `;


    document.head
      .appendChild(
        style
      );

  }



  /* ============================================================
     OUTILS
  ============================================================ */

  function normaliser(value) {

    return String(
      value || ""
    )
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /ø/g,
        "o"
      )
      .trim();

  }


  function mobile() {

    return (
      window.innerWidth <= 700
    );

  }


  function fichierDiscipline(
    key
  ) {

    if (!FILES[key]) {
      return "";
    }


    return mobile()
      ? FILES[key].mobile
      : FILES[key].desktop;

  }


  function hashActuel() {

    return normaliser(
      window.location.hash
      ||
      "#accueil"
    );

  }



  /* ============================================================
     TROUVER UN TITRE VISIBLE
  ============================================================ */

  function trouverTitre(
    textes
  ) {

    const recherches =
      Array.isArray(
        textes
      )
        ? textes
        : [
            textes
          ];


    return Array
      .from(
        document.querySelectorAll(
          "h1,h2,h3"
        )
      )
      .find(
        element => {

          const texte =
            normaliser(
              element.textContent
            );


          const rect =
            element
              .getBoundingClientRect();


          return (
            rect.width > 0
            &&
            rect.height > 0
            &&
            recherches.some(
              recherche =>
                texte.includes(
                  normaliser(
                    recherche
                  )
                )
            )
          );

        }
      )
      ||
      null;

  }



  /* ============================================================
     TROUVER LE CONTENEUR HERO
  ============================================================ */

  function trouverHeroDepuisTitre(
    titre
  ) {

    if (!titre) {
      return null;
    }


    /*
      Priorité à la section contenant le titre.
    */

    const section =
      titre.closest(
        "section"
      );


    if (section) {

      const rect =
        section
          .getBoundingClientRect();


      if (
        rect.width >
          window.innerWidth * .60
        &&
        rect.height > 180
      ) {

        return section;

      }

    }


    /*
      Sinon remontée progressive.
    */

    let parent =
      titre.parentElement;


    let meilleur =
      null;


    for (
      let i = 0;
      i < 6 && parent;
      i++
    ) {

      const rect =
        parent
          .getBoundingClientRect();


      if (
        rect.width >
          window.innerWidth * .70
        &&
        rect.height >= 180
        &&
        rect.height < 900
      ) {

        meilleur =
          parent;

      }


      parent =
        parent.parentElement;

    }


    return meilleur;

  }



  /* ============================================================
     RECHERCHER UNE IMAGE DANS LE HERO
  ============================================================ */

  function imageHero(
    hero
  ) {

    if (!hero) {
      return null;
    }


    const images =
      Array.from(
        hero.querySelectorAll(
          "img"
        )
      );


    /*
      Ne jamais sélectionner logo / blazon.
    */

    return images.find(
      img => {

        const src =
          normaliser(
            img.getAttribute(
              "src"
            )
          );


        return (
          !src.includes(
            "logo"
          )
          &&
          !src.includes(
            "blazon"
          )
        );

      }
    )
    ||
    null;

  }



  /* ============================================================
     APPLIQUER UNE PHOTO HERO
  ============================================================ */

  function appliquerPhotoHero(
    hero,
    fichier
  ) {

    if (
      !hero
      ||
      !fichier
    ) {
      return;
    }


    hero.classList.add(
      "eah-v2-hero"
    );


    const img =
      imageHero(
        hero
      );


    /*
      Si le HTML possède déjà une balise IMG,
      on la corrige directement.
    */

    if (img) {

      img.src =
        fichier;


      img.classList.add(
        "eah-discipline-photo"
      );


      /*
        En cas d'erreur navigateur :
        fallback via background.
      */

      img.onerror =
        function () {

          this.style
            .setProperty(
              "display",
              "none",
              "important"
            );


          hero.style
            .setProperty(
              "background-image",
              `url("${fichier}")`,
              "important"
            );

        };


      return;

    }


    /*
      Sinon utiliser directement le background.
    */

    hero.style
      .setProperty(
        "background-image",
        `url("${fichier}")`,
        "important"
      );

  }



  /* ============================================================
     ACCUEIL
  ============================================================ */

  function corrigerAccueil() {

    const hash =
      hashActuel();


    if (
      hash !==
      "#accueil"
      &&
      hash !==
      ""
    ) {
      return;
    }


    const titre =
      trouverTitre(
        "Le plongeon"
      );


    const hero =
      trouverHeroDepuisTitre(
        titre
      );


    appliquerPhotoHero(
      hero,
      FILES.accueil
    );

  }



  /* ============================================================
     DISCIPLINES
  ============================================================ */

  function corrigerDisciplines() {

    const hash =
      hashActuel();


    let config =
      null;


    if (
      hash.includes(
        "olympique"
      )
    ) {

      config = {

        titre: [
          "Plongeon olympique"
        ],

        key:
          "olympique"

      };

    }


    else if (
      hash.includes(
        "freestyle"
      )
      ||
      hash.includes(
        "dods"
      )
    ) {

      config = {

        titre: [
          "Freestyle",
          "Døds",
          "Dods"
        ],

        key:
          "freestyle"

      };

    }


    else if (
      hash.includes(
        "high"
      )
    ) {

      config = {

        titre: [
          "High Diving"
        ],

        key:
          "highdiving"

      };

    }


    else if (
      hash.includes(
        "ange"
      )
    ) {

      config = {

        titre: [
          "Saut de l'ange",
          "Saut de lange"
        ],

        key:
          "ange"

      };

    }


    if (!config) {
      return;
    }


    const titre =
      trouverTitre(
        config.titre
      );


    const hero =
      trouverHeroDepuisTitre(
        titre
      );


    appliquerPhotoHero(

      hero,

      fichierDiscipline(
        config.key
      )

    );

  }



  /* ============================================================
     HERO BLAZONS
  ============================================================ */

  function corrigerHeroBlazons() {

  const hero =
    document.querySelector(
      "#blazons .page-hero"
    );

  if (!hero) return;

  const img =
    hero.querySelector(
      ".page-hero-image"
    );

  if (!img) return;

  img.src =
    "hero-blazons.png";

  img.loading =
    "eager";

  img.decoding =
    "async";

  img.style.display =
    "block";

  img.style.opacity =
    "1";

  hero.style.removeProperty(
    "background-image"
  );

}



  /* ============================================================
     11 BLAZONS INDIVIDUELS
  ============================================================ */

  function corrigerBlazons() {

    Object
      .entries(
        BLAZONS
      )
      .forEach(
        ([
          nom,
          fichier
        ]) => {

          const titre =
            Array
              .from(
                document.querySelectorAll(
                  "h2,h3,h4"
                )
              )
              .find(
                element => {

                  return (
                    normaliser(
                      element.textContent
                    )
                    ===
                    normaliser(
                      nom
                    )
                  );

                }
              );


          if (!titre) {
            return;
          }


          const card =
            titre.closest(
              "article"
            )
            ||
            titre.closest(
              "[class*='blazon']"
            )
            ||
            titre.parentElement
              ?.parentElement;


          if (!card) {
            return;
          }


          const img =
            card.querySelector(
              "img"
            );


          if (!img) {
            return;
          }


          img.src =
            fichier;


          img.classList.add(
            "eah-blazon-image"
          );

        }
      );

  }



  /* ============================================================
     ACTUALITES
  ============================================================ */

  function corrigerActualites() {

    const hash =
      hashActuel();


    if (
      !hash.includes(
        "actualit"
      )
    ) {
      return;
    }


    document
      .querySelectorAll(
        "article img, .eah-public-card img"
      )
      .forEach(
        img => {

          /*
            Ne remplace jamais une photo valide.
          */

          img.classList.add(
            "eah-cms-image"
          );


          img.addEventListener(

            "error",

            function fallbackNews() {

              this.removeEventListener(
                "error",
                fallbackNews
              );


              this.src =
                "news-default.jpg";

            }

          );

        }
      );

  }



  /* ============================================================
     SPOTS
  ============================================================ */

  function corrigerSpots() {

    const hash =
      hashActuel();


    if (
      !hash.includes(
        "spots"
      )
    ) {
      return;
    }


    document
      .querySelectorAll(
        "article img, .eah-public-card img"
      )
      .forEach(
        img => {

          img.classList.add(
            "eah-cms-image"
          );


          img.addEventListener(

            "error",

            function fallbackSpot() {

              this.removeEventListener(
                "error",
                fallbackSpot
              );


              this.src =
                "spot-default.jpg";

            }

          );

        }
      );

  }



  /* ============================================================
     APPLICATION
  ============================================================ */

  function appliquer() {

    installerCSS();

    corrigerAccueil();

    corrigerDisciplines();

    corrigerHeroBlazons();

    corrigerBlazons();

    corrigerActualites();

    corrigerSpots();

  }



  /* ============================================================
     NAVIGATION SANS ACTUALISATION MANUELLE
  ============================================================ */

  function routeChange() {

    /*
      Dès le clic.
    */

    appliquer();


    /*
      Après reconstruction de la page
      par ton script principal.
    */

    requestAnimationFrame(
      () => {

        appliquer();


        requestAnimationFrame(
          appliquer
        );

      }
    );


    setTimeout(
      appliquer,
      50
    );


    setTimeout(
      appliquer,
      150
    );


    setTimeout(
      appliquer,
      400
    );


    setTimeout(
      appliquer,
      1000
    );

  }



  /* ============================================================
     DEMARRAGE
  ============================================================ */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(

      "DOMContentLoaded",

      routeChange,

      {
        once:
          true
      }

    );

  } else {

    routeChange();

  }


  window.addEventListener(
    "hashchange",
    routeChange
  );


  /*
    Observer les pages créées dynamiquement.
  */

  let timer;


  const observer =
    new MutationObserver(
      () => {

        clearTimeout(
          timer
        );


        timer =
          setTimeout(
            appliquer,
            70
          );

      }
    );


  observer.observe(

    document.body,

    {
      childList:
        true,

      subtree:
        true
    }

  );


  /*
    Mobile <-> tablette.
  */

  let resizeTimer;


  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        setTimeout(
          routeChange,
          160
        );

    }
  );

})();
/* ============================================================
   EAH DIVING
   ESPACE CLUB UNIQUEMENT SUR LA PAGE CLUB
============================================================ */

function gererAffichageEspaceClub() {

  const hash =
    (window.location.hash || "#accueil")
      .toLowerCase();

  const estPageClub =
    hash === "#club" ||
    hash === "#espace-club" ||
    hash === "#espaceclub" ||
    hash.startsWith("#club-");

  document.documentElement.classList.toggle(
    "eah-page-club",
    estPageClub
  );

}


/* premier affichage */
gererAffichageEspaceClub();


/* changement de page */
window.addEventListener(
  "hashchange",
  gererAffichageEspaceClub
);
/* ============================================================
   SPOTS — OUVERTURE DES DETAILS AU CLIC
============================================================ */

document.addEventListener(
  "click",
  function (event) {

    const card =
      event.target.closest(
        "#spots .spot-card"
      );

    if (!card) return;

    const details =
      card.querySelector(
        ".spot-details"
      );

    if (!details) return;

    const ouvert =
      card.getAttribute(
        "aria-expanded"
      ) === "true";

    card.setAttribute(
      "aria-expanded",
      String(!ouvert)
    );

    details.hidden = ouvert;

  }
);
/* ============================================================
   SPOTS — OUVERTURE DES INFORMATIONS AU CLIC
============================================================ */

document.addEventListener("click", function (event) {

  const card = event.target.closest(
    "#spots .eah-public-card, #spots article"
  );

  if (!card) return;

  const details = card.querySelector(
    ".spot-details"
  );

  if (!details) return;

  const label = card.querySelector(
    ".spot-open-label"
  );

  const estOuvert = !details.hidden;

  details.hidden = estOuvert;

  card.classList.toggle(
    "spot-is-open",
    !estOuvert
  );

  if (label) {
    label.textContent = estOuvert
      ? "Voir les informations"
      : "Masquer les informations";
  }

});
/* ============================================================
   EAH DIVING
   PAGE DETAIL ACTUALITE
============================================================ */

(function () {

  function escNews(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  /* ==========================================================
     VIDEO
  ========================================================== */

  function youtubeEmbed(url) {

    if (!url) return "";

    try {

      const u = new URL(url);

      let id = "";

      if (
        u.hostname.includes("youtu.be")
      ) {

        id =
          u.pathname
            .replace("/", "")
            .trim();

      } else if (
        u.hostname.includes("youtube.com")
      ) {

        id =
          u.searchParams.get("v") || "";

        if (
          !id &&
          u.pathname.includes("/shorts/")
        ) {

          id =
            u.pathname
              .split("/shorts/")[1]
              ?.split("/")[0];

        }

      }

      if (!id) return "";

      return (
        "https://www.youtube.com/embed/" +
        encodeURIComponent(id) +
        "?autoplay=1&rel=0"
      );

    } catch (e) {

      return "";

    }

  }


  function creerVideoActualite(url) {

    if (!url) return "";

    const youtube =
      youtubeEmbed(url);

    /* YouTube */

    if (youtube) {

      return `
        <div class="actualite-video">

          <iframe
            src="${youtube}"
            title="Vidéo de l'actualité"
            allow="
              autoplay;
              encrypted-media;
              picture-in-picture
            "
            allowfullscreen
          ></iframe>

        </div>
      `;

    }


    /* Fichier vidéo direct */

    if (
      /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
    ) {

      return `
        <div class="actualite-video">

          <video
            src="${escNews(url)}"
            controls
            autoplay
            playsinline
          ></video>

        </div>
      `;

    }


    /* Autre type de lien vidéo */

    return `
      <a
        class="actualite-external-link"
        href="${escNews(url)}"
        target="_blank"
        rel="noopener"
      >
        Voir la vidéo
      </a>
    `;

  }


  /* ==========================================================
     AFFICHAGE ACTUALITE
  ========================================================== */

  function ouvrirActualite(id) {

    const data =
      window.EAH_ACTUALITES?.[
        String(id)
      ];

    if (!data) return;


    const detail =
      document.getElementById(
        "actualite-detail"
      );

    const content =
      document.getElementById(
        "actualite-detail-content"
      );

    if (!detail || !content) return;


    const image =
      data.image_url ||
      data.imageUrl ||
      data.IMAGE_URL ||
      "";

    const title =
      data.title ||
      data.TITLE ||
      "Actualité";

    const date =
      data.date ||
      data.DATE ||
      "";

    const category =
      data.category ||
      data.CATEGORY ||
      "";

    const summary =
      data.summary ||
      data.SUMMARY ||
      "";

    const texte =
      data.content ||
      data.CONTENT ||
      data.description ||
      data.DESCRIPTION ||
      "";

    const video =
      data.video_url ||
      data.videoUrl ||
      data.VIDEO_URL ||
      "";

    const link =
      data.link_url ||
      data.linkUrl ||
      data.LINK_URL ||
      "";


    content.innerHTML = `

      ${
        image
          ? `
            <img
              class="actualite-detail-image"
              src="${escNews(image)}"
              alt="${escNews(title)}"
              loading="eager"
              decoding="async"
            >
          `
          : ""
      }


      <div class="actualite-detail-head">

        ${
          category
            ? `
              <span class="actualite-detail-category">
                ${escNews(category)}
              </span>
            `
            : ""
        }

        <h1>
          ${escNews(title)}
        </h1>

        ${
          date
            ? `
              <div class="actualite-detail-date">
                ${escNews(date)}
              </div>
            `
            : ""
        }

        ${
          summary
            ? `
              <p class="actualite-detail-summary">
                ${escNews(summary)}
              </p>
            `
            : ""
        }

      </div>


      ${creerVideoActualite(video)}


      ${
        texte
          ? `
            <div class="actualite-detail-text">
              ${escNews(texte)
                .replace(/\n/g, "<br>")}
            </div>
          `
          : ""
      }


      ${
        link
          ? `
            <a
              class="actualite-external-link"
              href="${escNews(link)}"
              target="_blank"
              rel="noopener"
            >
              En savoir plus
            </a>
          `
          : ""
      }

    `;


    /*
      Cache toutes les pages principales
    */

    document
      .querySelectorAll(
        "main > section, body > section"
      )
      .forEach(section => {

        if (
          section.id !==
          "actualite-detail"
        ) {

          section.hidden = true;

        }

      });


    detail.hidden = false;

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });


    history.pushState(
      {
        actualite: String(id)
      },
      "",
      "#actualite-" +
        encodeURIComponent(id)
    );

  }


  /* ==========================================================
     CLIC SUR UNE CARTE
  ========================================================== */

  document.addEventListener(
    "click",
    function (event) {

      const card =
        event.target.closest(
          "#actualites [data-actualite-id]"
        );

      if (!card) return;


      /*
        On laisse fonctionner les vrais liens
        présents dans la carte
      */

      if (
        event.target.closest("a")
      ) {

        return;

      }


      const id =
        card.dataset.actualiteId;

      if (!id) return;

      ouvrirActualite(id);

    }
  );


  /* ==========================================================
     RETOUR
  ========================================================== */

  document.addEventListener(
    "click",
    function (event) {

      if (
        !event.target.closest(
          "#actualite-back"
        )
      ) {

        return;

      }

      window.location.hash =
        "#actualites";

      window.location.reload();

    }
  );


  /*
    API éventuellement réutilisable
  */

  window.EAHActualites = {
    ouvrir: ouvrirActualite
  };

})();
