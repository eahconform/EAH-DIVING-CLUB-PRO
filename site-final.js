/* ============================================================
   EAH DIVING PRO
   SITE-FINAL.JS
   VERSION 06/10/2026
============================================================ */

(() => {

  "use strict";


  const FILES = {

    accueil:
      "hero-divers-group.png",

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

    tarifs: {

      desktop:
        "pricing-hero.jpg",

      mobile:
        "tarifs-mobile.png"

    },

    faireGrader:
      "grading-request-hero.jpg",

    club:
      "club-dashboard-hero.jpg",

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


  const HERO_TITLES = {

    grading:
      "Le grading",

    blazons:
      "Blazons",

    population:
      "Population",

    spots:
      "Spots",

    actualites:
      "Actualités",

    tarifs:
      "Offres",

    "faire-grader":
      "Faire grader",

    club:
      "Espace Club",

    evaluation:
      "Nouveau Grade Report",

    olympique:
      "Plongeon olympique",

    freestyle:
      "Freestyle / Døds",

    highdiving:
      "High Diving",

    ange:
      "Saut de l'ange"

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



  function installerCSS() {

    document
      .getElementById(
        "eah-site-final-css"
      )
      ?.remove();


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "eah-site-final-css";


    style.textContent = `

.page .page-hero {

  position: relative !important;
  width: 100% !important;
  max-width: none !important;

  min-height:
    clamp(
      390px,
      36vw,
      540px
    )
    !important;

  margin: 0 !important;
  padding: 0 !important;

  overflow: hidden !important;

  display: flex !important;
  align-items: flex-end !important;

  background: #03131f !important;

}


.page .page-hero > img.page-hero-image {

  position: absolute !important;
  inset: 0 !important;

  width: 100% !important;
  max-width: none !important;

  height: 100% !important;
  min-height: 100% !important;

  display: block !important;

  object-fit: cover !important;
  object-position: center center !important;

  opacity: 1 !important;
  visibility: visible !important;

  filter:
    brightness(1.06)
    contrast(1.02)
    saturate(1.05)
    !important;

}


.page .page-hero > picture {

  position: absolute !important;
  inset: 0 !important;

  width: 100% !important;
  height: 100% !important;

  display: block !important;

}


.page .page-hero > picture > img {

  position: absolute !important;
  inset: 0 !important;

  width: 100% !important;
  height: 100% !important;

  object-fit: cover !important;
  object-position: center center !important;

  opacity: 1 !important;
  visibility: visible !important;

  filter:
    brightness(1.06)
    contrast(1.02)
    saturate(1.05)
    !important;

}


.page .page-hero .page-hero-overlay {

  position: absolute !important;
  inset: 0 !important;

  display: block !important;

  z-index: 1 !important;

  background:
    linear-gradient(
      180deg,
      rgba(2,12,23,.02) 0%,
      rgba(2,12,23,.02) 46%,
      rgba(2,12,23,.22) 72%,
      rgba(2,12,23,.42) 100%
    )
    !important;

}


.page .page-hero::before,
.page .page-hero::after {

  content: none !important;
  display: none !important;

}


.page .page-hero > .container {

  position: relative !important;

  z-index: 4 !important;

  width:
    min(
      calc(100% - 48px),
      1240px
    )
    !important;

  max-width: 1240px !important;

  margin: 0 auto !important;

  padding:
    0 0 46px 0
    !important;

}


.page .page-hero .overline {

  display: none !important;

}


.page .page-hero .container > p {

  display: none !important;

}


.page .page-hero h1 {

  position: relative !important;

  z-index: 5 !important;

  max-width: 1050px !important;

  margin: 0 !important;

  color: #ffffff !important;

  font-size:
    clamp(
      3rem,
      6vw,
      6rem
    )
    !important;

  font-weight: 900 !important;

  line-height: .96 !important;

  letter-spacing: -.055em !important;

  text-shadow:
    0 5px 24px
    rgba(0,0,0,.42)
    !important;

}


#accueil .hero-background-image {

  filter:
    brightness(1.09)
    contrast(1.02)
    saturate(1.05)
    !important;

  opacity: 1 !important;
  visibility: visible !important;

}


#accueil .hero-overlay {

  background:

    linear-gradient(
      90deg,
      rgba(2,12,23,.54) 0%,
      rgba(2,12,23,.32) 36%,
      rgba(2,12,23,.13) 64%,
      rgba(2,12,23,.08) 100%
    ),

    linear-gradient(
      180deg,
      rgba(2,12,23,.01) 45%,
      rgba(2,12,23,.24) 100%
    )

    !important;

}


.eah-discipline-photo {

  display: block !important;

  width: 100% !important;
  height: 100% !important;

  object-fit: cover !important;

  opacity: 1 !important;
  visibility: visible !important;

}


.eah-blazon-image {

  display: block !important;

  visibility: visible !important;
  opacity: 1 !important;

  object-fit: contain !important;

  filter: none !important;

}


/* ============================================================
   IMAGES CMS : ACTUALITES + SPOTS
============================================================ */

.eah-cms-image {

  display: block !important;

  width: 100% !important;

  opacity: 1 !important;

  visibility: visible !important;

  object-fit: cover !important;

}


.eah-cms-image-fallback {

  width: 100%;

  min-height: 260px;

  display: grid;

  place-items: center;

  background:
    linear-gradient(
      145deg,
      rgba(6,30,51,.96),
      rgba(4,18,31,.96)
    );

  color:
    rgba(255,255,255,.45);

  font-weight: 900;

  letter-spacing: .12em;

}


.spot-picture {

  overflow: hidden;

}


.spot-picture .eah-cms-image,
.spot-picture .eah-cms-image-fallback {

  width: 100%;

  height: 350px;

  object-fit: cover;

}


#newsGrid .news-card {

  overflow: hidden;

  cursor: pointer !important;

  transition:
    transform .22s ease,
    border-color .22s ease,
    box-shadow .22s ease;

}


#newsGrid .news-card:hover {

  transform: translateY(-5px);

  border-color:
    rgba(48,207,255,.40)
    !important;

  box-shadow:
    0 26px 65px
    rgba(0,0,0,.30);

}


#newsGrid .news-image,
#newsGrid .eah-cms-image-fallback {

  width: 100%;

  height: 330px;

  object-fit: cover;

}


/* ============================================================
   ACTUALITE DETAIL
============================================================ */

#actualite-detail {

  min-height:
    calc(
      100vh - 86px
    );

}


.actualite-detail-section {

  padding:
    55px 0 95px
    !important;

}


.actualite-detail-wrap {

  width:
    min(
      calc(100% - 40px),
      1050px
    );

  margin: 0 auto;

}


.actualite-back {

  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-height: 46px;

  margin-bottom: 26px;

  padding:
    0 18px;

  border:
    1px solid
    rgba(143,205,255,.22);

  border-radius: 13px;

  background:
    rgba(5,23,42,.78);

  color: #ffffff;

  font-weight: 800;

  cursor: pointer;

}


.actualite-detail-card {

  overflow: hidden;

  border:
    1px solid
    rgba(143,205,255,.20);

  border-radius: 30px;

  background:
    linear-gradient(
      145deg,
      rgba(7,38,66,.94),
      rgba(4,18,31,.94)
    );

  box-shadow:
    0 30px 90px
    rgba(0,0,0,.30);

}


.actualite-detail-image {

  display: block;

  width: 100%;

  max-height: 600px;

  object-fit: cover;

}


.actualite-detail-body {

  padding:
    clamp(
      24px,
      5vw,
      54px
    );

}


.actualite-detail-category {

  display: inline-block;

  margin-bottom: 13px;

  color: #30cfff;

  font-size: .78rem;

  font-weight: 900;

  letter-spacing: .14em;

  text-transform: uppercase;

}


.actualite-detail-title {

  margin: 0 0 14px;

  color: #ffffff;

  font-size:
    clamp(
      2.3rem,
      6vw,
      5.2rem
    );

  line-height: 1.02;

}


.actualite-detail-date {

  margin-bottom: 28px;

  color: #8fa8bc;

}


.actualite-detail-summary {

  margin-bottom: 30px;

  color: #dceafa;

  font-size: 1.15rem;

  font-weight: 600;

  line-height: 1.65;

}


.actualite-detail-text {

  margin-top: 25px;

  padding-top: 25px;

  border-top:
    1px solid
    rgba(143,205,255,.14);

  color: #c3d8e8;

  font-size: 1.03rem;

  line-height: 1.85;

}


.actualite-video {

  width: 100%;

  margin-top: 35px;

  overflow: hidden;

  aspect-ratio: 16 / 9;

  border-radius: 22px;

  background: #000;

}


.actualite-video iframe,
.actualite-video video {

  width: 100%;

  height: 100%;

  border: 0;

}


.actualite-detail-link {

  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-height: 48px;

  margin-top: 30px;

  padding:
    0 20px;

  border-radius: 13px;

  background:
    linear-gradient(
      135deg,
      #0b6bff,
      #1687ff
    );

  color: #ffffff;

  font-weight: 800;

}


/* ============================================================
   SPOTS
============================================================ */

#spots .spot {

  cursor: pointer;

}


#spots .spot-details[hidden] {

  display: none !important;

}


#spots .spot-details {

  margin-top: 18px;

  padding-top: 18px;

  border-top:
    1px solid
    rgba(255,255,255,.14);

}


#spots .spot-open-label {

  margin-top: 15px;

  color: #30cfff;

  font-size: .92rem;

  font-weight: 800;

}


/* ============================================================
   ESPACE CLUB
============================================================ */

html:not(.eah-page-club) #eah-club-pro,
html:not(.eah-page-club) #eah-club-divers,
html:not(.eah-page-club) #eah-club-groups,
html:not(.eah-page-club) #eah-coach-evaluation,
html:not(.eah-page-club) #eah-evaluations,
html:not(.eah-page-club) #eah-actualites,
html:not(.eah-page-club) #eah-spots,
html:not(.eah-page-club) #eah-blazons,
html:not(.eah-page-club) #eah-tarifs {

  display: none !important;

}


@media (max-width:700px) {

  .page .page-hero {

    min-height:
      340px !important;

  }


  .page .page-hero > .container {

    width:
      calc(
        100% - 28px
      )
      !important;

    padding-bottom:
      32px !important;

  }


  .page .page-hero h1 {

    font-size:
      clamp(
        2.5rem,
        12vw,
        4rem
      )
      !important;

  }


  .spot-picture .eah-cms-image,
  .spot-picture .eah-cms-image-fallback,
  #newsGrid .news-image,
  #newsGrid .eah-cms-image-fallback {

    height: 260px;

  }

}


@media (max-width:600px) {

  #tarifs .page-hero {

    width: 100% !important;

    height: auto !important;

    min-height: 0 !important;

    aspect-ratio:
      9 / 16
      !important;

  }


  #tarifs .page-hero > picture.tarifs-hero-picture {

    position: absolute !important;

    inset: 0 !important;

    width: 100% !important;

    height: 100% !important;

  }


  #tarifs .page-hero > picture.tarifs-hero-picture > img {

    position: absolute !important;

    inset: 0 !important;

    width: 100% !important;

    height: 100% !important;

    object-fit: contain !important;

    filter: none !important;

    background: #03131f !important;

  }


  #tarifs .page-hero > .container {

    display: none !important;

  }


  #tarifs .page-hero .page-hero-overlay {

    display: none !important;

  }

}

    `;


    document.head
      .appendChild(
        style
      );

  }



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
      window.innerWidth <=
      700
    );

  }



  function fichierTarifs() {

    return (
      window.innerWidth <=
      600
    )
      ?
      FILES.tarifs.mobile
      :
      FILES.tarifs.desktop;

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



  function escapeHtml(
    value
  ) {

    return String(
      value ??
      ""
    )
    .replace(

      /[&<>"']/g,

      char => ({

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        '"':
          "&quot;",

        "'":
          "&#39;"

      }[
        char
      ])

    );

  }



  /* ============================================================
     CONVERSION IMAGE CMS
  ============================================================ */

  function mediaUrl(
    value,
    size = "w1800"
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
          window.location.href
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



  function formatDate(
    value
  ) {

    if (!value) {

      return "";

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(
        value
      );

    }


    return date.toLocaleDateString(

      "fr-FR",

      {

        day:
          "2-digit",

        month:
          "long",

        year:
          "numeric"

      }

    );

  }



  function corrigerHeroPage(
    pageId,
    fichier,
    titre
  ) {

    const page =
      document.getElementById(
        pageId
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


    const h1 =
      hero.querySelector(
        "h1"
      );


    if (
      h1 &&
      titre
    ) {

      h1.textContent =
        titre;

    }


    if (!fichier) {

      return;

    }


    let img =
      hero.querySelector(
        ".page-hero-image"
      );


    if (!img) {

      img =
        hero.querySelector(
          "img"
        );

    }


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


    try {

      img.fetchPriority =
        "high";

    } catch (_) {}


    img.classList.add(
      "page-hero-image"
    );

  }



  function corrigerHeroesPrincipaux() {

    corrigerHeroPage(
      "grading",
      FILES.grading,
      HERO_TITLES.grading
    );


    corrigerHeroPage(
      "blazons",
      FILES.blazons,
      HERO_TITLES.blazons
    );


    corrigerHeroPage(
      "population",
      FILES.population,
      HERO_TITLES.population
    );


    corrigerHeroPage(
      "spots",
      FILES.spots,
      HERO_TITLES.spots
    );


    corrigerHeroPage(
      "actualites",
      FILES.actualites,
      HERO_TITLES.actualites
    );


    corrigerHeroPage(
      "tarifs",
      fichierTarifs(),
      HERO_TITLES.tarifs
    );


    corrigerHeroPage(
      "faire-grader",
      FILES.faireGrader,
      HERO_TITLES[
        "faire-grader"
      ]
    );


    corrigerHeroPage(
      "club",
      FILES.club,
      HERO_TITLES.club
    );

  }



  function corrigerDisciplines() {

    [
      "olympique",
      "freestyle",
      "highdiving",
      "ange"
    ]
    .forEach(
      key => {

        corrigerHeroPage(

          key,

          fichierDiscipline(
            key
          ),

          HERO_TITLES[
            key
          ]

        );

      }
    );


    document
      .querySelectorAll(
        "#olympique .page-hero-image, #freestyle .page-hero-image, #highdiving .page-hero-image, #ange .page-hero-image"
      )
      .forEach(
        img => {

          img.classList.add(
            "eah-discipline-photo"
          );

        }
      );

  }



  function corrigerAccueil() {

    const img =
      document.querySelector(
        "#accueil .hero-background-image"
      );


    if (!img) {

      return;

    }


    img.src =
      FILES.accueil;


    img.loading =
      "eager";

  }



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
                element =>
                  normaliser(
                    element.textContent
                  )
                  ===
                  normaliser(
                    nom
                  )
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
            );


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



  function corrigerActualites() {

    document
      .querySelectorAll(
        "#actualites .news-card img, #actualites article img"
      )
      .forEach(
        img => {

          const current =
            String(
              img.getAttribute(
                "src"
              )
              ||
              ""
            )
            .trim();


          const corrected =
            mediaUrl(
              current,
              "w1800"
            );


          if (
            corrected &&
            corrected !==
              current
          ) {

            img.src =
              corrected;

          }


          img.classList.add(
            "eah-cms-image"
          );


          img.loading =
            "eager";


          img.decoding =
            "async";

        }
      );


    document
      .querySelectorAll(
        "#newsGrid .news-card"
      )
      .forEach(
        card => {

          card.setAttribute(
            "role",
            "button"
          );


          card.setAttribute(
            "tabindex",
            "0"
          );

        }
      );

  }



  function corrigerSpots() {

    document
      .querySelectorAll(
        "#spots .spot img, #spots article img"
      )
      .forEach(
        img => {

          const current =
            String(
              img.getAttribute(
                "src"
              )
              ||
              ""
            )
            .trim();


          const corrected =
            mediaUrl(
              current,
              "w1800"
            );


          if (
            corrected &&
            corrected !==
              current
          ) {

            img.src =
              corrected;

          }


          img.classList.add(
            "eah-cms-image"
          );


          img.loading =
            "eager";


          img.decoding =
            "async";

        }
      );

  }



  function assurerPageActualiteDetail() {

    let page =
      document.getElementById(
        "actualite-detail"
      );


    if (page) {

      return page;

    }


    const main =
      document.querySelector(
        "main"
      );


    if (!main) {

      return null;

    }


    page =
      document.createElement(
        "section"
      );


    page.id =
      "actualite-detail";


    page.className =
      "page actualite-detail-page";


    page.innerHTML = `

      <section class="section actualite-detail-section">

        <div class="actualite-detail-wrap">

          <button
            type="button"
            id="actualite-back"
            class="actualite-back"
          >
            ← Retour aux actualités
          </button>

          <div
            id="actualite-detail-content"
          ></div>

        </div>

      </section>

    `;


    main.appendChild(
      page
    );


    return page;

  }



  function youtubeEmbed(
    url
  ) {

    if (!url) {

      return "";

    }


    try {

      const u =
        new URL(
          url,
          window.location.href
        );


      let id =
        "";


      if (
        u.hostname.includes(
          "youtu.be"
        )
      ) {

        id =
          u.pathname
            .replace(
              "/",
              ""
            )
            .split(
              "/"
            )[0];

      }


      if (
        u.hostname.includes(
          "youtube.com"
        )
      ) {

        if (
          u.pathname ===
          "/watch"
        ) {

          id =
            u.searchParams.get(
              "v"
            )
            ||
            "";

        }


        if (
          u.pathname.includes(
            "/shorts/"
          )
        ) {

          id =
            u.pathname
              .split(
                "/shorts/"
              )[1]
              ?.split(
                "/"
              )[0]
            ||
            "";

        }

      }


      return id
        ?
        "https://www.youtube.com/embed/"
        +
        encodeURIComponent(
          id
        )
        +
        "?rel=0"
        :
        "";


    } catch (_) {

      return "";

    }

  }



  function creerVideoActualite(
    url
  ) {

    if (!url) {

      return "";

    }


    const youtube =
      youtubeEmbed(
        url
      );


    if (youtube) {

      return `

        <div class="actualite-video">

          <iframe
            src="${escapeHtml(youtube)}"
            title="Vidéo"
            allowfullscreen
          ></iframe>

        </div>

      `;

    }


    if (
      /\.(mp4|webm|ogg)(\?.*)?$/i
      .test(
        url
      )
    ) {

      return `

        <div class="actualite-video">

          <video
            src="${escapeHtml(url)}"
            controls
            playsinline
          ></video>

        </div>

      `;

    }


    return `

      <a
        class="actualite-detail-link"
        href="${escapeHtml(url)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Voir la vidéo
      </a>

    `;

  }



  function actualiteDepuisCarte(
    card
  ) {

    const cards =
      Array.from(
        document.querySelectorAll(
          "#newsGrid .news-card"
        )
      );


    const index =
      cards.indexOf(
        card
      );


    if (
      index < 0
    ) {

      return null;

    }


    try {

      return (
        state.news[
          index
        ]
        ||
        null
      );

    } catch (_) {

      return null;

    }

  }



  function ouvrirActualite(
    news
  ) {

    if (!news) {

      return;

    }


    const page =
      assurerPageActualiteDetail();


    if (!page) {

      return;

    }


    const content =
      page.querySelector(
        "#actualite-detail-content"
      );


    if (!content) {

      return;

    }


    const image =
      mediaUrl(

        news.image_url
        ||
        news.imageUrl
        ||
        news.IMAGE_URL
        ||
        "",

        "w2000"

      );


    const title =
      news.title
      ||
      news.TITLE
      ||
      "Actualité";


    const category =
      news.category
      ||
      news.CATEGORY
      ||
      "EAH DIVING";


    const date =
      news.published_at
      ||
      news.date
      ||
      news.DATE
      ||
      "";


    const summary =
      news.summary
      ||
      news.SUMMARY
      ||
      "";


    const texte =
      news.content
      ||
      news.CONTENT
      ||
      news.description
      ||
      news.DESCRIPTION
      ||
      "";


    const video =
      news.video_url
      ||
      news.videoUrl
      ||
      news.VIDEO_URL
      ||
      "";


    const link =
      news.link_url
      ||
      news.linkUrl
      ||
      news.LINK_URL
      ||
      "";


    const texteHtml =
      escapeHtml(
        texte
      )
      .replace(
        /\r?\n/g,
        "<br>"
      );


    content.innerHTML = `

      <article class="actualite-detail-card">

        ${
          image
          ?
          `

            <img
              class="actualite-detail-image eah-cms-image"
              src="${escapeHtml(image)}"
              alt="${escapeHtml(title)}"
              loading="eager"
              decoding="async"
            >

          `
          :
          ""
        }


        <div class="actualite-detail-body">

          <span class="actualite-detail-category">
            ${escapeHtml(category)}
          </span>


          <h1 class="actualite-detail-title">
            ${escapeHtml(title)}
          </h1>


          ${
            date
            ?
            `

              <div class="actualite-detail-date">

                ${escapeHtml(
                  formatDate(
                    date
                  )
                )}

              </div>

            `
            :
            ""
          }


          ${
            summary
            ?
            `

              <div class="actualite-detail-summary">
                ${escapeHtml(summary)}
              </div>

            `
            :
            ""
          }


          ${
            texte
            ?
            `

              <div class="actualite-detail-text">
                ${texteHtml}
              </div>

            `
            :
            ""
          }


          ${creerVideoActualite(
            video
          )}


          ${
            link
            ?
            `

              <a
                class="actualite-detail-link"
                href="${escapeHtml(link)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                En savoir plus
              </a>

            `
            :
            ""
          }

        </div>

      </article>

    `;


    document
      .querySelectorAll(
        "main > .page"
      )
      .forEach(
        section => {

          section.classList.remove(
            "active"
          );

        }
      );


    page.classList.add(
      "active"
    );


    window.scrollTo({

      top:
        0,

      behavior:
        "auto"

    });

  }



  function retourActualites() {

    document
      .getElementById(
        "actualite-detail"
      )
      ?.classList
      .remove(
        "active"
      );


    document
      .querySelectorAll(
        "main > .page"
      )
      .forEach(
        page => {

          page.classList.remove(
            "active"
          );

        }
      );


    document
      .getElementById(
        "actualites"
      )
      ?.classList
      .add(
        "active"
      );


    history.replaceState(

      null,

      "",

      window.location.pathname
      +
      window.location.search
      +
      "#actualites"

    );

  }



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


    document.documentElement
      .classList
      .toggle(
        "eah-page-club",
        estPageClub
      );

  }



  function appliquer() {

    installerCSS();

    assurerPageActualiteDetail();

    corrigerAccueil();

    corrigerHeroesPrincipaux();

    corrigerDisciplines();

    corrigerBlazons();

    corrigerActualites();

    corrigerSpots();

    gererAffichageEspaceClub();

  }



  function routeChange() {

    appliquer();


    requestAnimationFrame(
      appliquer
    );


    setTimeout(
      appliquer,
      100
    );


    setTimeout(
      appliquer,
      500
    );

  }



  document.addEventListener(

    "click",

    event => {


      if (
        event.target.closest(
          "#actualite-back"
        )
      ) {

        event.preventDefault();

        retourActualites();

        return;

      }


      const newsCard =
        event.target.closest(
          "#newsGrid .news-card"
        );


      if (newsCard) {

        if (
          event.target.closest(
            "a"
          )
        ) {

          return;

        }


        const news =
          actualiteDepuisCarte(
            newsCard
          );


        if (news) {

          ouvrirActualite(
            news
          );

        }


        return;

      }


      const navigation =
        event.target.closest(
          "[data-page], [data-page-button], [data-open]"
        );


      if (navigation) {

        document
          .getElementById(
            "actualite-detail"
          )
          ?.classList
          .remove(
            "active"
          );


        setTimeout(
          routeChange,
          0
        );

      }

    }

  );



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
            100
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

})();
