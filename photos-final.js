/* ============================================================
   EAH DIVING PRO
   PHOTOS-FINAL.JS
   VERSION FINALE
   03/10/2026

   - Préchargement des images importantes
   - Heroes
   - Disciplines
   - Actualités
   - Spots
   - Offres
   - Faire grader
   - Espace Club
   - Aucun lazy loading
============================================================ */

(() => {

  "use strict";


  const HTML =
    document.documentElement;


  /* ============================================================
     IMAGES A PRECHARGER
  ============================================================ */

  const PRELOAD_IMAGES = [

    /* FOND */

    "site-water-premium-bg.jpg",


    /* ACCUEIL */

    "hero-divers-group.png",


    /* PAGES PRINCIPALES */

    "grading-hero.jpg",

    "hero-blazons.png",

    "population-hero.jpg",

    "spots-hero.jpg",

    "actualites-hero.jpg",

    "pricing-hero.jpg",

    "grading-request-hero.jpg",

    "club-dashboard-hero.jpg",


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
     PRELOAD URL
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
     EAGER
  ============================================================ */

  function forceEager(
    root = document
  ) {

    root
      .querySelectorAll(
        "img"
      )
      .forEach(
        img => {

          img.loading =
            "eager";


          img.decoding =
            "async";


          try {

            img.fetchPriority =
              "high";

          } catch (_) {}

        }
      );

  }



  /* ============================================================
     RECUPERER LES URL
  ============================================================ */

  function collectImages(
    root = document
  ) {

    const urls =
      new Set();


    PRELOAD_IMAGES
      .forEach(
        url => {

          urls.add(
            absoluteUrl(
              url
            )
          );

        }
      );


    root
      .querySelectorAll(
        "img"
      )
      .forEach(
        img => {

          const url =

            img.currentSrc

            ||

            img.getAttribute(
              "src"
            );


          if (url) {

            urls.add(
              absoluteUrl(
                url
              )
            );

          }

        }
      );


    root
      .querySelectorAll(
        "source[srcset]"
      )
      .forEach(
        source => {

          const srcset =
            source.getAttribute(
              "srcset"
            );


          if (!srcset) {

            return;

          }


          srcset
            .split(
              ","
            )
            .forEach(
              item => {

                const url =
                  item
                    .trim()
                    .split(
                      /\s+/
                    )[
                      0
                    ];


                if (url) {

                  urls.add(
                    absoluteUrl(
                      url
                    )
                  );

                }

              }
            );

        }
      );


    return Array.from(
      urls
    );

  }



  /* ============================================================
     PREPARATION
  ============================================================ */

  async function prepare(
    root = document
  ) {

    forceEager(
      root
    );


    const urls =
      collectImages(
        root
      );


    await Promise.race([

      Promise.allSettled(

        urls.map(
          preloadUrl
        )

      ),

      new Promise(
        resolve => {

          setTimeout(
            resolve,
            5000
          );

        }
      )

    ]);


    root
      .querySelectorAll(
        "img"
      )
      .forEach(
        img => {

          img.classList.remove(
            "eah-image-wait"
          );


          img.classList.add(
            "eah-image-ready"
          );

        }
      );

  }



  /* ============================================================
     NOUVELLE IMAGE
  ============================================================ */

  function prepareNewImage(
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


    img.loading =
      "eager";


    img.decoding =
      "async";


    try {

      img.fetchPriority =
        "high";

    } catch (_) {}


    const src =

      img.currentSrc

      ||

      img.getAttribute(
        "src"
      );


    if (!src) {

      return;

    }


    preloadUrl(
      src
    )
    .then(
      () => {

        img.classList.remove(
          "eah-image-wait"
        );


        img.classList.add(
          "eah-image-ready"
        );

      }
    );

  }



  /* ============================================================
     MUTATION OBSERVER
  ============================================================ */

  const observer =
    new MutationObserver(
      mutations => {

        mutations.forEach(
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

                    prepareNewImage(
                      node
                    );

                  }


                  node
                    .querySelectorAll?.(
                      "img"
                    )
                    .forEach(
                      prepareNewImage
                    );

                }
              );


            if (
              mutation.type ===
                "attributes"
              &&
              mutation.target instanceof
                HTMLImageElement
            ) {

              prepareNewImage(
                mutation.target
              );

            }

          }
        );

      }
    );


  observer.observe(

    document.documentElement,

    {

      childList:
        true,

      subtree:
        true,

      attributes:
        true,

      attributeFilter: [

        "src",

        "srcset"

      ]

    }

  );



  /* ============================================================
     DEMARRAGE
  ============================================================ */

  async function bootPhotos() {

    await prepare(
      document
    );


    HTML.classList.remove(
      "eah-images-loading"
    );


    HTML.classList.add(
      "eah-images-ready"
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

    "pageshow",

    () => {

      forceEager(
        document
      );

    }

  );


  window.addEventListener(

    "hashchange",

    () => {

      forceEager(
        document
      );

    }

  );



  /* ============================================================
     API
  ============================================================ */

  window.EAHPhotos = {

    refresh(
      root = document
    ) {

      return prepare(
        root
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
