/* ============================================================
   EAH DIVING PRO
   HERO DES PAGES - VERSION FINALE

   - Photo spéciale pour la page Blazons
   - Enlève les voiles sombres des hauts de pages
   - Conserve l'accueil actuel
   - Fonctionne avec le système de navigation #...
============================================================ */

(() => {

  const BLAZON_HERO =
    "hero-blazons.png";


  /* ============================================================
     STYLE ANTI-VOILE
  ============================================================ */

  const style =
    document.createElement(
      "style"
    );


  style.textContent = `

    .eah-clear-page-hero::before,
    .eah-clear-page-hero::after {
      background: none !important;
      background-image: none !important;
      opacity: 0 !important;
      box-shadow: none !important;
    }

    .eah-clear-page-hero {
      background-blend-mode: normal !important;
    }

  `;


  document.head.appendChild(
    style
  );



  /* ============================================================
     TEXTE NORMALISE
  ============================================================ */

  function normalize(value) {

    return String(
      value || ""
    )
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .trim();

  }



  /* ============================================================
     TROUVER LE GRAND BANDEAU DE LA PAGE
  ============================================================ */

  function trouverHeroPage() {

    const titles =
      Array.from(
        document.querySelectorAll(
          "h1"
        )
      );


    const visibleTitle =
      titles.find(
        title => {

          const rect =
            title.getBoundingClientRect();


          return (
            rect.width > 0
            &&
            rect.height > 0
            &&
            rect.bottom > 0
          );

        }
      );


    if (!visibleTitle) {
      return null;
    }


    let element =
      visibleTitle.parentElement;


    let best =
      null;


    /*
      On remonte autour du H1
      jusqu'au grand bandeau.
    */

    for (
      let i = 0;
      i < 7 && element;
      i++
    ) {

      const rect =
        element.getBoundingClientRect();


      if (
        rect.width >=
          window.innerWidth * 0.70
        &&
        rect.height >= 220
        &&
        rect.height <= 850
      ) {

        best =
          element;

      }


      if (
        element.tagName ===
        "BODY"
      ) {
        break;
      }


      element =
        element.parentElement;

    }


    return best;

  }



  /* ============================================================
     RETIRER LES GRADIENTS SOMBRES
  ============================================================ */

  function retirerGradientSombre(
    hero
  ) {

    if (!hero) {
      return;
    }


    hero.classList.add(
      "eah-clear-page-hero"
    );


    const computed =
      window.getComputedStyle(
        hero
      );


    const currentBackground =
      computed.backgroundImage;


    /*
      Si le fond contient :
      linear-gradient(...) + url(...)

      on garde uniquement l'image.
    */

    if (
      currentBackground
      &&
      currentBackground.includes(
        "url("
      )
    ) {

      const urls =
        currentBackground.match(
          /url\((["']?)(.*?)\1\)/g
        );


      if (
        urls
        &&
        urls.length
      ) {

        const lastUrl =
          urls[
            urls.length - 1
          ];


        hero.style.setProperty(
          "background-image",
          lastUrl,
          "important"
        );

      }

    }


    hero.style.setProperty(
      "background-color",
      "transparent",
      "important"
    );


    hero.style.setProperty(
      "background-blend-mode",
      "normal",
      "important"
    );


    hero.style.setProperty(
      "background-size",
      "cover",
      "important"
    );


    hero.style.setProperty(
      "background-position",
      "center",
      "important"
    );


    hero.style.setProperty(
      "background-repeat",
      "no-repeat",
      "important"
    );

  }



  /* ============================================================
     PAGE BLAZONS
  ============================================================ */

  function appliquerHeroBlazons(
    hero
  ) {

    if (!hero) {
      return;
    }


    hero.classList.add(
      "eah-clear-page-hero"
    );


    hero.style.setProperty(
      "background-image",
      `url("${BLAZON_HERO}")`,
      "important"
    );


    hero.style.setProperty(
      "background-size",
      "cover",
      "important"
    );


    /*
      La rangée de blazons doit rester
      bien centrée dans le bandeau.
    */

    hero.style.setProperty(
      "background-position",
      "center center",
      "important"
    );


    hero.style.setProperty(
      "background-repeat",
      "no-repeat",
      "important"
    );


    hero.style.setProperty(
      "background-color",
      "transparent",
      "important"
    );


    hero.style.setProperty(
      "background-blend-mode",
      "normal",
      "important"
    );

  }



  /* ============================================================
     APPLICATION
  ============================================================ */

  function appliquerFixHero() {

    const hash =
      normalize(
        window.location.hash
      );


    /*
      L'accueil est déjà comme tu le souhaites :
      on n'y touche pas.
    */

    if (
      !hash
      ||
      hash === "#accueil"
    ) {

      return;

    }


    const hero =
      trouverHeroPage();


    if (!hero) {
      return;
    }


    /*
      PAGE BLAZONS
    */

    if (
      hash.includes(
        "blazon"
      )
    ) {

      appliquerHeroBlazons(
        hero
      );


      return;

    }


    /*
      TOUTES LES AUTRES PAGES :
      enlever le voile sombre.
    */

    retirerGradientSombre(
      hero
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

      () => {

        setTimeout(
          appliquerFixHero,
          100
        );

      },

      {
        once: true
      }

    );

  } else {

    setTimeout(
      appliquerFixHero,
      100
    );

  }



  /* Navigation du site */

  window.addEventListener(
    "hashchange",
    () => {

      setTimeout(
        appliquerFixHero,
        100
      );


      setTimeout(
        appliquerFixHero,
        500
      );

    }
  );



  /*
    Certaines pages sont créées ensuite
    par script.js.
  */

  const observer =
    new MutationObserver(
      () => {

        clearTimeout(
          window.__eahHeroTimer
        );


        window.__eahHeroTimer =
          setTimeout(
            appliquerFixHero,
            120
          );

      }
    );


  observer.observe(

    document.body,

    {
      childList: true,
      subtree: true
    }

  );


  setTimeout(
    appliquerFixHero,
    500
  );


  setTimeout(
    appliquerFixHero,
    1500
  );

})();
