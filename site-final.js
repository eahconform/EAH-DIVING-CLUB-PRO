/* ============================================================
   EAH DIVING PRO
   SITE-FINAL.JS
   VERSION FINAL VISUEL
   03/10/2026

   - Heroes catégories
   - Photos entières sur ordinateur / tablette
   - Photos légèrement moins lumineuses
   - Accueil plus lumineux
   - Uniquement le nom de la catégorie sur les heroes
   - Offres / Faire grader / Espace Club prêts pour leurs photos
   - Disciplines desktop / mobile
   - Blazons sécurisés
   - Actualités / Spots sécurisés
   - Spots dépliables
   - Espace Club rangé uniquement dans #club
   - Profil dynamique rangé uniquement dans #profil
============================================================ */

(() => {

  "use strict";


  /* ============================================================
     FICHIERS
  ============================================================ */

  const FILES = {

    accueil:
      "hero-divers-group.png",

    pages: {

      grading:
        "grading-hero.jpg",

      blazons:
        "hero-blazons.png",

      population:
        "population-hero.jpg",

      spots:
        "spots-hero.jpg",

      actualites:
        "actualites-hero.jpg",

      tarifs:
        "pricing-hero.jpg",

      "faire-grader":
        "grading-request-hero.jpg",

      club:
        "club-dashboard-hero.jpg",

      evaluation:
        "evaluation-hero.jpg"

    },

    disciplines: {

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

    },

    fallback:
      "site-water-premium-bg.jpg"

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


  const CLUB_SECTIONS = [

    "eah-club-pro",

    "eah-club-divers",

    "eah-club-groups",

    "eah-coach-evaluation",

    "eah-evaluations",

    "eah-actualites",

    "eah-spots",

    "eah-blazons",

    "eah-tarifs"

  ];


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


  function estMobile() {

    return (
      window.innerWidth <= 700
    );

  }


  function pageActuelle() {

    return String(
      window.location.hash ||
      "#accueil"
    )
      .replace(
        "#",
        ""
      )
      .toLowerCase()
      .trim()
      ||
      "accueil";

  }


  /* ============================================================
     CSS FINAL
     AJOUTÉ EN DERNIER POUR ÉCRASER LES ANCIENS CORRECTIFS
  ============================================================ */

  function installerCSSFinal() {

    if (
      document.getElementById(
        "eah-site-final-css"
      )
    ) {

      return;

    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "eah-site-final-css";


    style.textContent = `

      /* ======================================================
         FOND GENERAL
      ====================================================== */

      .site-background {

        opacity:
          .50 !important;

        filter:
          brightness(.86)
          contrast(1.02)
          saturate(1.04)
          !important;

      }


      /* ======================================================
         ACCUEIL
         PLUS LUMINEUX QUE LA VERSION ACTUELLE
      ====================================================== */

      #accueil .hero-background-image {

        display:
          block !important;

        visibility:
          visible !important;

        opacity:
          1 !important;

        filter:
          brightness(1.20)
          contrast(1.01)
          saturate(1.05)
          !important;

      }


      #accueil .hero-overlay {

        display:
          block !important;

        opacity:
          1 !important;

        background:

          linear-gradient(
            90deg,

            rgba(
              2,
              12,
              23,
              .61
            )
            0%,

            rgba(
              3,
              19,
              31,
              .32
            )
            42%,

            rgba(
              3,
              19,
              31,
              .10
            )
            72%,

            rgba(
              3,
              19,
              31,
              .12
            )
            100%

          ),

          linear-gradient(
            180deg,

            rgba(
              3,
              19,
              31,
              .04
            ),

            rgba(
              3,
              19,
              31,
              .30
            )
          )

          !important;

      }


      /* ======================================================
         HEROES DES CATEGORIES
      ====================================================== */

      .eah-category-hero {

        position:
          relative !important;

        overflow:
          hidden !important;

        background:
          #03131f !important;

      }


      /*
         On privilégie l'image entière
         sur ordinateur / tablette.
      */

      .eah-category-hero
      .page-hero-image {

        position:
          absolute !important;

        inset:
          0 !important;

        display:
          block !important;

        width:
          100% !important;

        height:
          100% !important;

        object-fit:
          contain !important;

        object-position:
          center center !important;

        visibility:
          visible !important;

        opacity:
          1 !important;

        filter:
          brightness(1.07)
          contrast(1.015)
          saturate(1.04)
          !important;

        background:
          #03131f !important;

      }


      /*
         Petit voile uniquement pour
         conserver le titre lisible.
      */

      .eah-category-hero
      .page-hero-overlay {

        display:
          block !important;

        opacity:
          1 !important;

        background:

          linear-gradient(
            90deg,

            rgba(
              2,
              13,
              25,
              .28
            )
            0%,

            rgba(
              2,
              13,
              25,
              .12
            )
            42%,

            rgba(
              2,
              13,
              25,
              .02
            )
            100%

          )

          !important;

      }


      /*
         On retire les pseudo-voiles
         ajoutés par les anciens CSS.
      */

      .eah-category-hero::before,
      .eah-category-hero::after {

        content:
          none !important;

        display:
          none !important;

        background:
          none !important;

        opacity:
          0 !important;

      }


      /* ======================================================
         UNIQUEMENT LE NOM DE LA CATEGORIE
      ====================================================== */

      .eah-category-hero
      .overline,

      .eah-category-hero
      .container > p {

        display:
          none !important;

      }


      .eah-category-hero
      .container {

        position:
          relative !important;

        z-index:
          5 !important;

        padding-bottom:
          48px !important;

      }


      .eah-category-hero
      h1 {

        margin:
          0 !important;

        text-shadow:
          0
          4px
          20px
          rgba(
            0,
            0,
            0,
            .52
          )
          !important;

      }


      /* ======================================================
         DISCIPLINES
      ====================================================== */

      .eah-discipline-photo {

        display:
          block !important;

        width:
          100% !important;

        height:
          100% !important;

        visibility:
          visible !important;

        opacity:
          1 !important;

      }


      /* ======================================================
         BLAZONS INDIVIDUELS
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

        opacity:
          1 !important;

        visibility:
          visible !important;

        object-fit:
          cover !important;

      }


      /* ======================================================
         ESPACE CLUB
      ====================================================== */

      html:not(.eah-page-club)
      #eah-club-pro,

      html:not(.eah-page-club)
      #eah-club-divers,

      html:not(.eah-page-club)
      #eah-club-groups,

      html:not(.eah-page-club)
      #eah-coach-evaluation,

      html:not(.eah-page-club)
      #eah-evaluations,

      html:not(.eah-page-club)
      #eah-actualites,

      html:not(.eah-page-club)
      #eah-spots,

      html:not(.eah-page-club)
      #eah-blazons,

      html:not(.eah-page-club)
      #eah-tarifs {

        display:
          none !important;

      }


      html:not(.eah-page-profil)
      #eah-profile-section {

        display:
          none !important;

      }


      /* ======================================================
         SPOTS
      ====================================================== */

      #spots .spot,
      #spots .eah-public-card,
      #spots article {

        cursor:
          pointer;

      }


      #spots
      .spot-details[hidden] {

        display:
          none !important;

      }


      #spots
      .spot-details {

        margin-top:
          18px;

        padding-top:
          18px;

        border-top:
          1px solid
          rgba(
            255,
            255,
            255,
            .14
          );

        animation:
          eahSpotOpen
          .22s
          ease;

      }


      #spots
      .spot-detail-block {

        margin-bottom:
          16px;

      }


      #spots
      .spot-detail-block
      strong {

        display:
          block;

        margin-bottom:
          6px;

        color:
          #ffffff;

      }


      #spots
      .spot-detail-block
      p {

        display:
          block !important;

        margin:
          0;

        color:
          var(--text);

        line-height:
          1.6;

      }


      #spots
      .spot-open-label {

        margin-top:
          15px;

        color:
          var(--cyan);

        font-size:
          .92rem;

        font-weight:
          800;

      }


      @keyframes
      eahSpotOpen {

        from {

          opacity:
            0;

          transform:
            translateY(
              -6px
            );

        }

        to {

          opacity:
            1;

          transform:
            translateY(
              0
            );

        }

      }


      /* ======================================================
         MOBILE
      ====================================================== */

      @media (
        max-width:
        700px
      ) {

        /*
           Sur téléphone le ratio est très différent.
           Les photos mobiles sont prévues pour remplir
           correctement le hero.
        */

        .eah-category-hero
        .page-hero-image {

          object-fit:
            cover !important;

          object-position:
            center center !important;

        }


        .eah-category-hero
        .container {

          padding-bottom:
            38px !important;

        }


        .eah-category-hero
        h1 {

          font-size:
            clamp(
              2.4rem,
              12vw,
              4rem
            )
            !important;

        }

      }

    `;


    /*
      IMPORTANT :
      placé en dernier dans le BODY,
      après les anciens styles,
      afin que ce CSS soit prioritaire.
    */

    document.body
      .appendChild(
        style
      );

  }



  /* ============================================================
     RANGER LES SECTIONS DYNAMIQUES

     Elles sont actuellement après le footer dans index.html.
     On les replace à l'intérieur de leur vraie page.
  ============================================================ */

  function rangerSectionsDynamiques() {

    const clubPage =
      document.getElementById(
        "club"
      );


    if (
      clubPage
    ) {

      CLUB_SECTIONS
        .forEach(
          id => {

            const section =
              document.getElementById(
                id
              );


            if (
              section
              &&
              !clubPage.contains(
                section
              )
            ) {

              clubPage
                .appendChild(
                  section
                );

            }

          }
        );

    }


    const profilPage =
      document.getElementById(
        "profil"
      );


    const profilRuntime =
      document.getElementById(
        "eah-profile-section"
      );


    if (
      profilPage
      &&
      profilRuntime
      &&
      !profilPage.contains(
        profilRuntime
      )
    ) {

      profilPage
        .appendChild(
          profilRuntime
        );

    }

  }



  /* ============================================================
     CLASSES DE PAGE
  ============================================================ */

  function gererClassesPage() {

    const page =
      pageActuelle();


    document
      .documentElement
      .classList
      .toggle(

        "eah-page-club",

        page ===
          "club"

      );


    document
      .documentElement
      .classList
      .toggle(

        "eah-page-profil",

        page ===
          "profil"

      );

  }



  /* ============================================================
     PREPARER UNE IMAGE
  ============================================================ */

  function preparerImage(
    img
  ) {

    if (!img) {

      return;

    }


    img.loading =
      "eager";


    img.decoding =
      "async";


    try {

      img.fetchPriority =
        "high";

    } catch (_) {}


    img.style
      .setProperty(
        "display",
        "block",
        "important"
      );


    img.style
      .setProperty(
        "visibility",
        "visible",
        "important"
      );


    img.style
      .setProperty(
        "opacity",
        "1",
        "important"
      );

  }



  /* ============================================================
     ATTRIBUER UNE IMAGE
  ============================================================ */

  function attribuerImage(
    img,
    fichier,
    fallback =
      FILES.fallback
  ) {

    if (
      !img ||
      !fichier
    ) {

      return;

    }


    preparerImage(
      img
    );


    /*
       Si ce fichier a déjà échoué pendant cette page,
       on ne déclenche pas une nouvelle requête 404.
    */

    if (
      img.dataset.eahFailed ===
      fichier
    ) {

      return;

    }


    const actuel =
      String(
        img.getAttribute(
          "src"
        )
        ||
        ""
      );


    if (
      !actuel.endsWith(
        fichier
      )
    ) {

      img.src =
        fichier;

    }


    img.onerror =
      function () {

        const failed =
          fichier;


        this.dataset.eahFailed =
          failed;


        this.onerror =
          null;


        if (
          fallback
          &&
          !String(
            this.getAttribute(
              "src"
            )
            ||
            ""
          )
          .endsWith(
            fallback
          )
        ) {

          this.src =
            fallback;

        }

      };

  }



  /* ============================================================
     ACCUEIL
  ============================================================ */

  function corrigerAccueil() {

    const hero =
      document.querySelector(
        "#accueil .hero-home"
      );


    const img =
      hero
        ?.querySelector(
          ".hero-background-image"
        );


    if (!img) {

      return;

    }


    attribuerImage(

      img,

      FILES.accueil

    );

  }



  /* ============================================================
     HEROES DES PAGES
  ============================================================ */

  function corrigerHeroesPages() {

    Object
      .entries(
        FILES.pages
      )
      .forEach(
        ([
          id,
          fichier
        ]) => {

          const page =
            document.getElementById(
              id
            );


          if (!page) {

            return;

          }


          const hero =
            page.querySelector(
              ":scope > .page-hero"
            )
            ||
            page.querySelector(
              ".page-hero"
            );


          if (!hero) {

            return;

          }


          hero.classList.add(
            "eah-category-hero"
          );


          const img =
            hero.querySelector(
              ".page-hero-image"
            );


          if (!img) {

            return;

          }


          attribuerImage(

            img,

            fichier

          );

        }
      );

  }



  /* ============================================================
     DISCIPLINES
  ============================================================ */

  function corrigerDisciplines() {

    Object
      .entries(
        FILES.disciplines
      )
      .forEach(
        ([
          id,
          fichiers
        ]) => {

          const page =
            document.getElementById(
              id
            );


          if (!page) {

            return;

          }


          const hero =
            page.querySelector(
              ".page-hero"
            );


          if (!hero) {

            return;

          }


          hero.classList.add(
            "eah-category-hero"
          );


          const picture =
            hero.querySelector(
              "picture"
            );


          const source =
            picture
              ?.querySelector(
                "source"
              );


          const img =
            hero.querySelector(
              ".page-hero-image"
            );


          if (!img) {

            return;

          }


          img.classList.add(
            "eah-discipline-photo"
          );


          /*
             Si un <picture> existe :
             source mobile + img desktop.
          */

          if (
            picture
          ) {

            if (
              source
              &&
              fichiers.mobile
            ) {

              source.srcset =
                fichiers.mobile;

            }


            attribuerImage(

              img,

              fichiers.desktop

            );


            return;

          }


          /*
             Sinon changement direct selon l'écran.
          */

          attribuerImage(

            img,

            estMobile()
              ?
              fichiers.mobile
              :
              fichiers.desktop

          );

        }
      );

  }



  /* ============================================================
     BLAZONS INDIVIDUELS
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
                  "#blazons h2, #blazons h3, #blazons h4"
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

            titre.parentElement;


          const img =
            card
              ?.querySelector(
                "img"
              );


          if (!img) {

            return;

          }


          attribuerImage(

            img,

            fichier,

            ""

          );


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

    document
      .querySelectorAll(
        "#actualites article img, #actualites .news-card img, #actualites .eah-public-card img"
      )
      .forEach(
        img => {

          preparerImage(
            img
          );


          img.classList.add(
            "eah-cms-image"
          );


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
  ============================================================ */

  function corrigerSpots() {

    document
      .querySelectorAll(
        "#spots article img, #spots .spot img, #spots .eah-public-card img"
      )
      .forEach(
        img => {

          preparerImage(
            img
          );


          img.classList.add(
            "eah-cms-image"
          );


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

    rangerSectionsDynamiques();

    gererClassesPage();

    corrigerAccueil();

    corrigerHeroesPages();

    corrigerDisciplines();

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
      appliquer
    );


    setTimeout(
      appliquer,
      60
    );


    setTimeout(
      appliquer,
      180
    );


    setTimeout(
      appliquer,
      450
    );

  }



  /* ============================================================
     DEMARRAGE
  ============================================================ */

  function demarrer() {

    installerCSSFinal();

    routeChange();

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(

      "DOMContentLoaded",

      demarrer,

      {
        once:
          true
      }

    );

  } else {

    demarrer();

  }



  window.addEventListener(

    "hashchange",

    routeChange

  );



  /*
     script.js utilise history.replaceState().
     replaceState ne déclenche pas hashchange.
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
     ELEMENTS AJOUTES PAR SUPABASE
  ============================================================ */

  let mutationTimer;


  const observer =
    new MutationObserver(
      mutations => {

        const utile =
          mutations.some(
            mutation =>
              mutation.addedNodes
                ?.length
          );


        if (!utile) {

          return;

        }


        clearTimeout(
          mutationTimer
        );


        mutationTimer =
          setTimeout(
            appliquer,
            80
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
     CHANGEMENT ORIENTATION / TAILLE
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
          180
        );

    }

  );



  /* ============================================================
     SPOTS — OUVERTURE / FERMETURE
  ============================================================ */

  document.addEventListener(

    "click",

    event => {

      const card =
        event.target.closest(

          "#spots .spot, #spots .eah-public-card, #spots article"

        );


      if (!card) {

        return;

      }


      if (
        event.target.closest(
          "a, button, input, select, textarea"
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


      const ouvert =
        !details.hidden;


      details.hidden =
        ouvert;


      card.classList.toggle(

        "spot-is-open",

        !ouvert

      );


      card.setAttribute(

        "aria-expanded",

        String(
          !ouvert
        )

      );


      if (
        label
      ) {

        label.textContent =
          ouvert
          ?
          "Voir les informations"
          :
          "Masquer les informations";

      }

    }

  );

})();
