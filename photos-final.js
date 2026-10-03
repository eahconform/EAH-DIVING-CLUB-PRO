/* ============================================================
   EAH DIVING PRO
   PHOTOS-FINAL.JS
   VERSION FINAL
   03/10/2026

   - Précharge uniquement les images importantes
   - Heroes prioritaires
   - Pas de blocage de 7 secondes
   - Images Supabase prises en charge
   - Navigation SPA prise en charge
============================================================ */

(() => {

  "use strict";


  const HTML =
    document.documentElement;


  /* ============================================================
     HEROES A PRECHARGER
  ============================================================ */

  const PRELOAD_IMAGES = [

    /* FOND */

    "site-water-premium-bg.jpg",


    /* ACCUEIL */

    "hero-divers-group.png",


    /* CATEGORIES */

    "grading-hero.jpg",

    "hero-blazons.png",

    "population-hero.jpg",

    "spots-hero.jpg",

    "actualites-hero.jpg",

    "pricing-hero.jpg",

    "grading-request-hero.jpg",

    "club-dashboard-hero.jpg",

    "evaluation-hero.jpg",


    /* OLYMPIQUE */

    "olympique-desktop.jpg",

    "olympique-mobile.jpg",

    "portrait-water-diver.jpg",


    /* FREESTYLE */

    "freestyle-desktop.jpg",

    "freestyle-mobile.jpg",


    /* HIGH DIVING */

    "high-diving-desktop.png",

    "high-diving-mobile.jpg",


    /* SAUT DE L'ANGE */

    "saut-ange-desktop.jpg",

    "saut-ange-mobile.jpg"

  ];


  /* ============================================================
     URL ABSOLUE
  ============================================================ */

  function absoluteUrl(
    url
  ) {

    if (!url) {

      return "";

    }


    try {

      return new URL(

        url,

        document.baseURI

      ).href;

    } catch (_) {

      return url;

    }

  }



  /* ============================================================
     PRELOAD IMAGE
  ============================================================ */

  function preloadUrl(
    url
  ) {

    return new Promise(
      resolve => {

        if (!url) {

          resolve();

          return;

        }


        const image =
          new Image();


        image.decoding =
          "async";


        try {

          image.fetchPriority =
            "high";

        } catch (_) {}


        image.onload =
          resolve;


        image.onerror =
          resolve;


        image.src =
          absoluteUrl(
            url
          );


        if (
          image.complete
        ) {

          resolve();

        }

      }
    );

  }



  /* ============================================================
     LINK PRELOAD
  ============================================================ */

  function ajouterPreloadLink(
    url
  ) {

    if (!url) {

      return;

    }


    const absolute =
      absoluteUrl(
        url
      );


    const existe =
      Array
        .from(
          document.querySelectorAll(
            'link[rel="preload"][as="image"]'
          )
        )
        .some(
          link =>
            link.href ===
            absolute
        );


    if (
      existe
    ) {

      return;

    }


    const link =
      document.createElement(
        "link"
      );


    link.rel =
      "preload";


    link.as =
      "image";


    link.href =
      url;


    document.head
      .appendChild(
        link
      );

  }



  /* ============================================================
     PRIORISER UNE IMAGE
  ============================================================ */

  function prioriserImage(
    img,
    hautePriorite =
      false
  ) {

    if (
      !img
      ||
      img.tagName !==
      "IMG"
    ) {

      return;

    }


    img.loading =
      "eager";


    img.decoding =
      "async";


    if (
      hautePriorite
    ) {

      try {

        img.fetchPriority =
          "high";

      } catch (_) {}

    }


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
     HERO ACTUEL
  ============================================================ */

  function prioriserPageActuelle() {

    const hash =
      String(
        window.location.hash ||
        "#accueil"
      )
      .replace(
        "#",
        ""
      )
      ||
      "accueil";


    const page =
      document.getElementById(
        hash
      );


    if (!page) {

      return;

    }


    page
      .querySelectorAll(
        ".hero img, .page-hero img"
      )
      .forEach(
        img => {

          prioriserImage(
            img,
            true
          );


          const src =
            img.currentSrc
            ||
            img.getAttribute(
              "src"
            );


          if (
            src
          ) {

            preloadUrl(
              src
            );

          }

        }
      );

  }



  /* ============================================================
     CARTES DISCIPLINES ACCUEIL
  ============================================================ */

  function prioriserAccueil() {

    document
      .querySelectorAll(
        "#accueil .discipline-card img"
      )
      .forEach(
        img =>
          prioriserImage(
            img,
            true
          )
      );

  }



  /* ============================================================
     IMAGE AJOUTEE APRES SUPABASE
  ============================================================ */

  function preparerNouvelleImage(
    img
  ) {

    if (
      !img
      ||
      img.tagName !==
      "IMG"
    ) {

      return;

    }


    const importante =
      Boolean(

        img.closest(
          ".hero, .page-hero, .discipline-card"
        )

      );


    prioriserImage(

      img,

      importante

    );


    if (
      importante
    ) {

      const src =
        img.currentSrc
        ||
        img.getAttribute(
          "src"
        );


      if (
        src
      ) {

        preloadUrl(
          src
        );

      }

    }

  }



  /* ============================================================
     PRECHARGEMENT PRINCIPAL
  ============================================================ */

  function lancerPrechargement() {

    PRELOAD_IMAGES
      .forEach(
        url => {

          ajouterPreloadLink(
            url
          );


          preloadUrl(
            url
          );

        }
      );

  }



  /* ============================================================
     OBSERVER SUPABASE / DOM DYNAMIQUE
  ============================================================ */

  const observer =
    new MutationObserver(
      mutations => {

        mutations
          .forEach(
            mutation => {

              mutation
                .addedNodes
                .forEach(
                  node => {

                    if (
                      !(
                        node instanceof
                        HTMLElement
                      )
                    ) {

                      return;

                    }


                    if (
                      node.tagName ===
                      "IMG"
                    ) {

                      preparerNouvelleImage(
                        node
                      );

                    }


                    node
                      .querySelectorAll
                      ?.(
                        "img"
                      )
                      .forEach(
                        preparerNouvelleImage
                      );

                  }
                );

            }
          );

      }
    );


  /* ============================================================
     BOOT
  ============================================================ */

  function bootPhotos() {

    /*
       On n'attend plus le téléchargement
       de toutes les images avant d'afficher le site.
    */

    HTML.classList.remove(
      "eah-images-loading"
    );


    HTML.classList.add(
      "eah-images-ready"
    );


    lancerPrechargement();


    document
      .querySelectorAll(
        ".hero img, .page-hero img"
      )
      .forEach(
        img =>
          prioriserImage(
            img,
            true
          )
      );


    prioriserAccueil();

    prioriserPageActuelle();


    observer.observe(

      document.documentElement,

      {

        childList:
          true,

        subtree:
          true

      }

    );

  }



  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(

      "DOMContentLoaded",

      bootPhotos,

      {
        once:
          true
      }

    );

  } else {

    bootPhotos();

  }



  /* ============================================================
     NAVIGATION
  ============================================================ */

  window.addEventListener(

    "hashchange",

    () => {

      prioriserPageActuelle();

    }

  );


  document.addEventListener(

    "click",

    event => {

      if (
        !event.target.closest(
          "[data-page], [data-page-button], [data-open]"
        )
      ) {

        return;

      }


      setTimeout(
        prioriserPageActuelle,
        0
      );


      setTimeout(
        prioriserPageActuelle,
        100
      );

    }

  );


  window.addEventListener(

    "pageshow",

    prioriserPageActuelle

  );


  /* ============================================================
     API PUBLIQUE
  ============================================================ */

  window.EAHPhotos = {

    refresh(
      root =
        document
    ) {

      root
        .querySelectorAll(
          "img"
        )
        .forEach(
          preparerNouvelleImage
        );

    },


    preload(
      url
    ) {

      return preloadUrl(
        url
      );

    }

  };

})();
