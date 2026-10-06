/* ============================================================
   EAH DIVING PRO
   PHOTOS-FINAL.JS
   VERSION 06/10/2026
============================================================ */

(() => {

  "use strict";


  const HTML =
    document.documentElement;


  const PRELOAD_IMAGES = [

    "site-water-premium-bg.jpg",

    "hero-divers-group.png",

    "grading-hero.jpg",

    "hero-blazons.png",

    "population-hero.jpg",

    "spots-hero.jpg",

    "actualites-hero.jpg",

    "pricing-hero.jpg",

    "tarifs-mobile.png",

    "grading-request-hero.jpg",

    "club-dashboard-hero.jpg",

    "olympique-desktop.jpg",

    "olympique-mobile.jpg",

    "portrait-water-diver.jpg",

    "freestyle-desktop.jpg",

    "freestyle-mobile.jpg",

    "high-diving-desktop.png",

    "high-diving-mobile.jpg",

    "saut-ange-desktop.jpg",

    "saut-ange-mobile.jpg"

  ];



  function mediaUrl(
    value,
    size =
      "w1800"
  ) {

    const raw =
      String(
        value ||
        ""
      )
      .trim();


    if (!raw) {

      return "";

    }


    if (
      typeof window.EAHMediaUrl ===
        "function"
    ) {

      return window.EAHMediaUrl(
        raw,
        size
      );

    }


    try {

      const decoded =
        decodeURIComponent(
          raw
        );


      let match =
        decoded.match(
          /\/file\/d\/([^/?#]+)/
        );


      if (!match) {

        match =
          decoded.match(
            /\/d\/([^/?#]+)/
        );

      }


      if (
        match &&
        match[1]
      ) {

        return (
          "https://drive.google.com/thumbnail?id="
          +
          encodeURIComponent(
            match[1]
          )
          +
          "&sz="
          +
          encodeURIComponent(
            size
          )
        );

      }


      const parsed =
        new URL(
          raw,
          document.baseURI
        );


      const id =
        parsed.searchParams.get(
          "id"
        );


      if (
        id &&
        (
          parsed.hostname.includes(
            "drive.google.com"
          )
          ||
          parsed.hostname.includes(
            "docs.google.com"
          )
        )
      ) {

        return (
          "https://drive.google.com/thumbnail?id="
          +
          encodeURIComponent(
            id
          )
          +
          "&sz="
          +
          encodeURIComponent(
            size
          )
        );

      }


    } catch (_) {}


    return raw;

  }



  function absoluteUrl(
    url
  ) {

    const converted =
      mediaUrl(
        url
      );


    if (!converted) {

      return "";

    }


    try {

      return new URL(

        converted,

        document.baseURI

      ).href;


    } catch (_) {

      return converted;

    }

  }



  function normalizeImage(
    img
  ) {

    if (
      !img ||
      img.tagName !==
        "IMG"
    ) {

      return;

    }


    const original =
      String(
        img.getAttribute(
          "src"
        )
        ||
        ""
      )
      .trim();


    if (!original) {

      return;

    }


    const corrected =
      mediaUrl(
        original
      );


    if (
      corrected &&
      corrected !==
        original &&
      img.dataset.eahNormalizedSrc !==
        corrected
    ) {

      img.dataset.eahNormalizedSrc =
        corrected;


      img.setAttribute(
        "src",
        corrected
      );

    }


    img.loading =
      "eager";


    img.decoding =
      "async";


    try {

      img.fetchPriority =
        "high";

    } catch (_) {}

  }



  function normalizeSource(
    source
  ) {

    if (
      !source ||
      source.tagName !==
        "SOURCE"
    ) {

      return;

    }


    const srcset =
      String(
        source.getAttribute(
          "srcset"
        )
        ||
        ""
      );


    if (!srcset) {

      return;

    }


    const corrected =
      srcset
        .split(
          ","
        )
        .map(
          item => {

            const parts =
              item
                .trim()
                .split(
                  /\s+/
                );


            const sourceUrl =
              parts.shift();


            const descriptor =
              parts.join(
                " "
              );


            const converted =
              mediaUrl(
                sourceUrl
              );


            return (
              converted
              +
              (
                descriptor
                ?
                " " +
                descriptor
                :
                ""
              )
            );

          }
        )
        .join(
          ", "
        );


    if (
      corrected !==
        srcset
    ) {

      source.setAttribute(
        "srcset",
        corrected
      );

    }

  }



  function preloadUrl(
    url
  ) {

    return new Promise(
      resolve => {

        const src =
          absoluteUrl(
            url
          );


        if (!src) {

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
          src;


        if (
          image.complete
        ) {

          resolve();

        }

      }
    );

  }



  function normalizeDOM(
    root =
      document
  ) {

    root
      .querySelectorAll(
        "img"
      )
      .forEach(
        normalizeImage
      );


    root
      .querySelectorAll(
        "source[srcset]"
      )
      .forEach(
        normalizeSource
      );

  }



  function collectImages(
    root =
      document
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

          const src =
            img.currentSrc
            ||
            img.getAttribute(
              "src"
            );


          if (src) {

            urls.add(
              absoluteUrl(
                src
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

                const src =
                  item
                    .trim()
                    .split(
                      /\s+/
                    )[0];


                if (src) {

                  urls.add(
                    absoluteUrl(
                      src
                    )
                  );

                }

              }
            );

        }
      );


    return Array
      .from(
        urls
      )
      .filter(
        Boolean
      );

  }



  async function prepare(
    root =
      document
  ) {

    normalizeDOM(
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



  function prepareNode(
    node
  ) {

    if (
      !node ||
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

      normalizeImage(
        node
      );


      preloadUrl(
        node.getAttribute(
          "src"
        )
      );

    }


    if (
      node.tagName ===
        "SOURCE"
    ) {

      normalizeSource(
        node
      );

    }


    node
      .querySelectorAll?.(
        "img"
      )
      .forEach(
        img => {

          normalizeImage(
            img
          );


          preloadUrl(
            img.getAttribute(
              "src"
            )
          );

        }
      );


    node
      .querySelectorAll?.(
        "source[srcset]"
      )
      .forEach(
        normalizeSource
      );

  }



  let observerBusy =
    false;


  const observer =
    new MutationObserver(
      mutations => {

        if (
          observerBusy
        ) {

          return;

        }


        observerBusy =
          true;


        try {

          mutations
            .forEach(
              mutation => {

                mutation
                  .addedNodes
                  .forEach(
                    prepareNode
                  );


                if (
                  mutation.type ===
                    "attributes"
                  &&
                  mutation.target instanceof
                    HTMLImageElement
                ) {

                  normalizeImage(
                    mutation.target
                  );

                }

              }
            );


        } finally {

          observerBusy =
            false;

        }

      }
    );



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



  function startObserver() {

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

  }



  if (
    document.readyState ===
      "loading"
  ) {

    document.addEventListener(

      "DOMContentLoaded",

      () => {

        startObserver();

        bootPhotos();

      },

      {
        once:
          true
      }

    );


  } else {

    startObserver();

    bootPhotos();

  }



  window.addEventListener(

    "pageshow",

    () => {

      normalizeDOM(
        document
      );

    }

  );


  window.addEventListener(

    "hashchange",

    () => {

      normalizeDOM(
        document
      );

    }

  );



  window.EAHPhotos = {

    refresh(
      root =
        document
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

    },


    normalize(
      url
    ) {

      return mediaUrl(
        url
      );

    }

  };

})();
