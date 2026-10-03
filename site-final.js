/* ============================================================
   EAH DIVING PRO
   SITE-FINAL.JS
   VERSION CORRIGEE
   03/10/2026

   - Corrige les images heroes
   - Corrige les disciplines
   - Corrige le hero Blazons
   - Protège les 11 blazons
   - Protège les photos Actualités
   - Protège les photos Spots
   - Gestion desktop / tablette / mobile
   - Spots dépliables
   - Gestion affichage Espace Club
   - Aucun ancien code Actualités cassé
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
     CSS MEDIA
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
         HEROES
      ====================================================== */

      .eah-v2-hero {

        position:
          relative !important;

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


      /*
        Pas de voile sombre ajouté
        par site-final.js
      */

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


      .eah-v2-hero img {

        opacity:
          1 !important;

        visibility:
          visible !important;

      }


      /* Texte lisible */

      .eah-v2-hero h1,
      .eah-v2-hero h2,
      .eah-v2-hero p,
      .eah-v2-hero span {

        position:
          relative;

        z-index:
          3;

        text-shadow:
          0 3px 14px
          rgba(
            0,
            0,
            0,
            .42
          );

      }


      /* ======================================================
         IMAGES DISCIPLINES
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
          brightness(1.16)
          contrast(1.01)
          saturate(1.06)
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


      /* ======================================================
         FOND GENERAL
      ====================================================== */

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

  function normaliser(
    value
  ) {

    return String(
      value || ""
    )
      .toLowerCase()
      .normalize(
        "NFD"
      )
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

    if (
      !FILES[
        key
      ]
    ) {

      return "";

    }


    return mobile()
      ?
      FILES[
        key
      ].mobile
      :
      FILES[
        key
      ].desktop;

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
      ?
      textes
      :
      [
        textes
      ];


    return (
      Array
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
      null
    );

  }



  /* ============================================================
     TROUVER HERO DEPUIS TITRE
  ============================================================ */

  function trouverHeroDepuisTitre(
    titre
  ) {

    if (!titre) {

      return null;

    }


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
     IMAGE HERO
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


    return (
      images.find(
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
      null
    );

  }



  /* ============================================================
     APPLIQUER PHOTO HERO
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


    if (img) {

      /*
        Ne réattribuer src
        que si nécessaire.
      */

      const srcActuel =
        img.getAttribute(
          "src"
        )
        ||
        "";


      if (
        !srcActuel.endsWith(
          fichier
        )
      ) {

        img.src =
          fichier;

      }


      img.loading =
        "eager";


      img.decoding =
        "async";


      img.classList.add(
        "eah-discipline-photo"
      );


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


    if (!hero) {

      return;

    }


    const img =
      hero.querySelector(
        ".page-hero-image"
      );


    if (!img) {

      return;

    }


    if (
      !String(
        img.getAttribute(
          "src"
        )
        ||
        ""
      )
      .endsWith(
        "hero-blazons.png"
      )
    ) {

      img.src =
        "hero-blazons.png";

    }


    img.loading =
      "eager";


    img.decoding =
      "async";


    img.style.display =
      "block";


    img.style.opacity =
      "1";


    img.style.visibility =
      "visible";


    hero.style
      .removeProperty(
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


          if (
            !String(
              img.getAttribute(
                "src"
              )
              ||
              ""
            )
            .endsWith(
              fichier
            )
          ) {

            img.src =
              fichier;

          }


          img.loading =
            "eager";


          img.decoding =
            "async";


          img.classList.add(
            "eah-blazon-image"
          );

        }
      );

  }



  /* ============================================================
     ACTUALITES
     UNIQUEMENT CORRECTION DES IMAGES
     PAS DE GESTION DE PAGE DETAIL ICI
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
        "#actualites article img, #actualites .eah-public-card img"
      )
      .forEach(
        img => {

          img.classList.add(
            "eah-cms-image"
          );


          img.loading =
            "eager";


          img.decoding =
            "async";


          if (
            img.dataset
              .eahFallbackNews
          ) {

            return;

          }


          img.dataset
            .eahFallbackNews =
              "1";


          img.addEventListener(

            "error",

            function fallbackNews() {

              this.removeEventListener(
                "error",
                fallbackNews
              );


              /*
                Evite boucle infinie
                si news-default.jpg n'existe pas.
              */

              if (
                !String(
                  this.src
                )
                .includes(
                  "news-default.jpg"
                )
              ) {

                this.src =
                  "news-default.jpg";

              }

            }

          );

        }
      );

  }



  /* ============================================================
     SPOTS
     UNIQUEMENT CORRECTION DES IMAGES
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
        "#spots article img, #spots .eah-public-card img"
      )
      .forEach(
        img => {

          img.classList.add(
            "eah-cms-image"
          );


          img.loading =
            "eager";


          img.decoding =
            "async";


          if (
            img.dataset
              .eahFallbackSpot
          ) {

            return;

          }


          img.dataset
            .eahFallbackSpot =
              "1";


          img.addEventListener(

            "error",

            function fallbackSpot() {

              this.removeEventListener(
                "error",
                fallbackSpot
              );


              if (
                !String(
                  this.src
                )
                .includes(
                  "spot-default.jpg"
                )
              ) {

                this.src =
                  "spot-default.jpg";

              }

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
     NAVIGATION
  ============================================================ */

  function routeChange() {

    appliquer();


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
    IMPORTANT :
    history.replaceState() ne déclenche pas hashchange.
    On relance donc les corrections lorsqu'un bouton
    de navigation du site est utilisé.
  */

  document.addEventListener(

    "click",

    event => {

      const navigation =
        event.target.closest(
          "[data-page], [data-page-button], [data-open]"
        );


      if (!navigation) {

        return;

      }


      setTimeout(
        routeChange,
        0
      );


      setTimeout(
        routeChange,
        100
      );

    }

  );


  /* ============================================================
     OBSERVER LES ELEMENTS CREES PAR SUPABASE
  ============================================================ */

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


  if (
    document.body
  ) {

    observer.observe(

      document.body,

      {

        childList:
          true,

        subtree:
          true

      }

    );

  }


  /* ============================================================
     MOBILE / TABLETTE / DESKTOP
  ============================================================ */

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
    (
      window.location.hash
      ||
      "#accueil"
    )
    .toLowerCase();


  const estPageClub =

    hash ===
      "#club"

    ||

    hash ===
      "#espace-club"

    ||

    hash ===
      "#espaceclub"

    ||

    hash.startsWith(
      "#club-"
    );


  document
    .documentElement
    .classList
    .toggle(

      "eah-page-club",

      estPageClub

    );

}



/* Premier affichage */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(

    "DOMContentLoaded",

    gererAffichageEspaceClub,

    {
      once:
        true
    }

  );

} else {

  gererAffichageEspaceClub();

}



/* Changement manuel du hash */

window.addEventListener(

  "hashchange",

  gererAffichageEspaceClub

);



/*
  Le script principal utilise history.replaceState().
  replaceState ne déclenche PAS l'événement hashchange.
  Il faut donc également surveiller les clics de navigation.
*/

document.addEventListener(

  "click",

  event => {

    const navigation =
      event.target.closest(
        "[data-page], [data-page-button], [data-open]"
      );


    if (!navigation) {

      return;

    }


    setTimeout(
      gererAffichageEspaceClub,
      0
    );


    setTimeout(
      gererAffichageEspaceClub,
      100
    );

  }

);



/* ============================================================
   SPOTS
   OUVERTURE / FERMETURE DES INFORMATIONS
============================================================ */

document.addEventListener(

  "click",

  function (
    event
  ) {

    const card =
      event.target.closest(
        "#spots .spot, #spots .eah-public-card, #spots article"
      );


    if (!card) {

      return;

    }


    /*
      Si l'utilisateur clique sur un vrai lien
      dans la carte, on laisse le lien fonctionner.
    */

    if (
      event.target.closest(
        "a"
      )
    ) {

      return;

    }


    const details =
      card.querySelector(
        ".spot-details"
      );


    if (!details) {

      return;

    }


    const label =
      card.querySelector(
        ".spot-open-label"
      );


    const estOuvert =
      !details.hidden;


    details.hidden =
      estOuvert;


    card.classList.toggle(

      "spot-is-open",

      !estOuvert

    );


    card.setAttribute(

      "aria-expanded",

      String(
        !estOuvert
      )

    );


    if (label) {

      label.textContent =
        estOuvert
        ?
        "Voir les informations"
        :
        "Masquer les informations";

    }

  }

);
