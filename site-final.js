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

    const hash =
      hashActuel();


    if (
      !hash.includes(
        "blazon"
      )
    ) {
      return;
    }


    const titre =
      trouverTitre(
        "Les blazons"
      );


    const hero =
      trouverHeroDepuisTitre(
        titre
      );


    if (!hero) {
      return;
    }


    hero.classList.add(
      "eah-v2-hero"
    );


    /*
      Pour cette page :
      utilisation explicite de hero-blazons.png
    */

    hero.style
      .setProperty(
        "background-image",
        `url("${FILES.blazons}")`,
        "important"
      );


    hero.style
      .setProperty(
        "background-size",
        "cover",
        "important"
      );


    hero.style
      .setProperty(
        "background-position",
        "center center",
        "important"
      );


    /*
      Si le hero contient une ancienne image,
      elle ne doit pas masquer le background.
    */

    const img =
      imageHero(
        hero
      );


    if (img) {

      img.style
        .setProperty(
          "display",
          "none",
          "important"
        );

    }

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
