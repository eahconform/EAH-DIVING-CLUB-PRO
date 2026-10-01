/* ============================================================
   EAH DIVING PRO
   SITE FINAL V1

   CORRECTIONS :
   - Hero accueil sans voile sombre
   - Heroes disciplines sans doublon
   - Images desktop / mobile immédiatement au changement de page
   - Suppression des overlays noirs
   - Espace Club masqué hors de sa page
   - Actualités Supabase en cartes cliquables
   - Spots Supabase en cartes cliquables
   - Fenêtre détail Actualité / Spot
============================================================ */

(() => {

  "use strict";


  /* ============================================================
     CONFIGURATION IMAGES
  ============================================================ */

  const IMAGES = {

    accueil: {
      desktop: "hero-divers-group.png",
      mobile: "hero-divers-group.png"
    },

    olympique: {
      desktop: "olympique-desktop.jpg",
      mobile: "olympique-mobile.jpg"
    },

    freestyle: {
      desktop: "freestyle-desktop.jpg",
      mobile: "freestyle-mobile.jpg"
    },

    highdiving: {
      desktop: "high-diving-desktop.png",
      mobile: "high-diving-mobile.jpg"
    },

    ange: {
      desktop: "saut-ange-desktop.jpg",
      mobile: "saut-ange-mobile.jpg"
    }

  };


  /* ============================================================
     CSS INJECTE
  ============================================================ */

  function installStyles() {

    if (
      document.getElementById(
        "eah-final-style"
      )
    ) {
      return;
    }


    const style =
      document.createElement("style");


    style.id =
      "eah-final-style";


    style.textContent = `

      /* ======================================================
         HERO : AUCUN VOILE NOIR
      ====================================================== */

      .eah-final-hero {
        position: relative !important;

        background-size: cover !important;
        background-position: center center !important;
        background-repeat: no-repeat !important;
        background-blend-mode: normal !important;

        isolation: isolate;
      }


      .eah-final-hero::before,
      .eah-final-hero::after {
        content: none !important;

        display: none !important;

        background: none !important;

        background-image: none !important;

        opacity: 0 !important;
      }


      .eah-final-hero img.eah-hidden-hero-image {
        display: none !important;
      }


      .eah-final-hero h1,
      .eah-final-hero h2,
      .eah-final-hero p,
      .eah-final-hero span {
        position: relative;

        z-index: 3;

        text-shadow:
          0 2px 12px rgba(0,0,0,.45);
      }


      /* ======================================================
         FOND WATER PREMIUM
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

        filter:
          brightness(1.16)
          saturate(1.05)
          !important;
      }


      .site-background::before,
      .site-background::after {
        display:
          none !important;

        background:
          none !important;

        opacity:
          0 !important;
      }


      /* ======================================================
         ACTUALITES / SPOTS
      ====================================================== */

      .eah-public-grid {
        display: grid;

        grid-template-columns:
          repeat(
            auto-fit,
            minmax(280px,1fr)
          );

        gap: 24px;

        width: 100%;

        max-width: 1240px;

        margin:
          40px auto 80px;

        padding:
          0 24px;
      }


      .eah-public-card {
        overflow: hidden;

        border:
          1px solid
          rgba(90,190,255,.24);

        border-radius:
          28px;

        background:
          rgba(3,20,35,.88);

        box-shadow:
          0 24px 70px
          rgba(0,0,0,.28);

        cursor: pointer;

        transition:
          transform .18s ease,
          border-color .18s ease;
      }


      .eah-public-card:hover {
        transform:
          translateY(-4px);

        border-color:
          rgba(48,207,255,.62);
      }


      .eah-public-card-image {
        width:
          100%;

        aspect-ratio:
          16 / 9;

        object-fit:
          cover;

        display:
          block;
      }


      .eah-public-card-body {
        padding:
          24px;
      }


      .eah-public-kicker {
        color:
          #30cfff;

        font-size:
          13px;

        font-weight:
          800;

        letter-spacing:
          .14em;

        text-transform:
          uppercase;

        margin-bottom:
          10px;
      }


      .eah-public-card h3 {
        margin:
          0 0 10px;

        color:
          #f5f9ff;

        font-size:
          clamp(
            24px,
            3vw,
            32px
          );
      }


      .eah-public-card p {
        color:
          #b9cede;

        line-height:
          1.65;

        margin:
          0;
      }


      .eah-public-button {
        display:
          inline-flex;

        align-items:
          center;

        justify-content:
          center;

        margin-top:
          20px;

        min-height:
          48px;

        padding:
          0 20px;

        border:
          0;

        border-radius:
          14px;

        background:
          linear-gradient(
            135deg,
            #0b6bff,
            #30cfff
          );

        color:
          white;

        font-weight:
          800;

        font-size:
          15px;

        cursor:
          pointer;
      }


      /* ======================================================
         MODALE ACTUALITE / SPOT
      ====================================================== */

      .eah-detail-overlay {
        position:
          fixed;

        inset:
          0;

        z-index:
          999999;

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        padding:
          20px;

        background:
          rgba(0,7,14,.82);

        backdrop-filter:
          blur(12px);
      }


      .eah-detail-modal {
        position:
          relative;

        width:
          min(900px,100%);

        max-height:
          90vh;

        overflow-y:
          auto;

        border:
          1px solid
          rgba(48,207,255,.32);

        border-radius:
          30px;

        background:
          #061b2d;

        box-shadow:
          0 40px 120px
          rgba(0,0,0,.65);
      }


      .eah-detail-image {
        width:
          100%;

        max-height:
          460px;

        object-fit:
          cover;

        display:
          block;
      }


      .eah-detail-content {
        padding:
          clamp(
            24px,
            5vw,
            48px
          );
      }


      .eah-detail-content h2 {
        margin:
          0 0 18px;

        color:
          white;

        font-size:
          clamp(
            34px,
            6vw,
            58px
          );

        line-height:
          1.02;
      }


      .eah-detail-text {
        color:
          #c3d8e8;

        font-size:
          18px;

        line-height:
          1.75;

        white-space:
          pre-line;
      }


      .eah-detail-info {
        display:
          grid;

        grid-template-columns:
          repeat(
            auto-fit,
            minmax(180px,1fr)
          );

        gap:
          12px;

        margin:
          24px 0;
      }


      .eah-detail-info > div {
        padding:
          16px;

        border:
          1px solid
          rgba(48,207,255,.18);

        border-radius:
          16px;

        background:
          rgba(255,255,255,.035);
      }


      .eah-detail-close {
        position:
          sticky;

        float:
          right;

        top:
          16px;

        right:
          16px;

        z-index:
          10;

        width:
          48px;

        height:
          48px;

        margin:
          16px;

        border:
          1px solid
          rgba(255,255,255,.18);

        border-radius:
          50%;

        background:
          rgba(3,19,31,.82);

        color:
          white;

        font-size:
          28px;

        cursor:
          pointer;
      }


      .eah-detail-video {
        width:
          100%;

        aspect-ratio:
          16 / 9;

        margin-top:
          26px;

        border:
          0;

        border-radius:
          18px;

        background:
          #000;
      }


      @media (max-width:700px) {

        .eah-public-grid {
          grid-template-columns:
            1fr;

          gap:
            18px;

          padding:
            0 18px;

          margin-top:
            28px;
        }


        .eah-detail-overlay {
          padding:
            0;
        }


        .eah-detail-modal {
          width:
            100%;

          max-height:
            100vh;

          min-height:
            100vh;

          border-radius:
            0;
        }

      }

    `;


    document.head.appendChild(
      style
    );

  }



  /* ============================================================
     OUTILS
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


  function currentHash() {

    return normalize(
      window.location.hash ||
      "#accueil"
    );

  }


  function imageFor(
    discipline
  ) {

    const data =
      IMAGES[
        discipline
      ];


    if (!data) {
      return "";
    }


    return mobile()
      ? data.mobile
      : data.desktop;

  }



  /* ============================================================
     DISCIPLINE ACTUELLE
  ============================================================ */

  function disciplineFromHash() {

    const hash =
      currentHash();


    if (
      hash.includes(
        "olympique"
      )
    ) {
      return "olympique";
    }


    if (
      hash.includes(
        "freestyle"
      )
      ||
      hash.includes(
        "dods"
      )
    ) {
      return "freestyle";
    }


    if (
      hash.includes(
        "high"
      )
    ) {
      return "highdiving";
    }


    if (
      hash.includes(
        "ange"
      )
    ) {
      return "ange";
    }


    return null;

  }



  /* ============================================================
     TROUVER LE HERO A PARTIR DU TITRE
  ============================================================ */

  function visibleHeading(
    text
  ) {

    const expected =
      normalize(
        text
      );


    return Array
      .from(
        document.querySelectorAll(
          "h1,h2"
        )
      )
      .find(
        heading => {

          const rect =
            heading
              .getBoundingClientRect();


          return (
            normalize(
              heading.textContent
            )
            .includes(
              expected
            )

            &&

            rect.width > 0

            &&

            rect.height > 0
          );

        }
      );

  }


  function heroFromHeading(
    heading
  ) {

    if (!heading) {
      return null;
    }


    let node =
      heading.parentElement;


    let candidate =
      null;


    for (
      let i = 0;
      i < 7 && node;
      i++
    ) {

      const rect =
        node
          .getBoundingClientRect();


      if (
        rect.width >=
          window.innerWidth * .75

        &&

        rect.height >= 280

        &&

        rect.height <= 900
      ) {

        candidate =
          node;

      }


      node =
        node.parentElement;

    }


    return candidate;

  }



  /* ============================================================
     HERO UNIQUE
  ============================================================ */

  function applyHero(
    hero,
    file
  ) {

    if (
      !hero ||
      !file
    ) {
      return;
    }


    hero.classList.add(
      "eah-final-hero"
    );


    hero.style.setProperty(
      "background-image",
      `url("${file}")`,
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


    /*
      Les anciennes images <img> qui provoquent
      le doublon sont masquées dans le hero.
    */

    hero
      .querySelectorAll(
        "img"
      )
      .forEach(
        img => {

          const src =
            normalize(
              img.getAttribute(
                "src"
              )
            );


          /*
            Ne jamais masquer logo / profil / blazons.
          */

          if (
            src.includes("logo")
            ||
            src.includes("blazon")
          ) {
            return;
          }


          img.classList.add(
            "eah-hidden-hero-image"
          );

        }
      );

  }



  /* ============================================================
     ACCUEIL SANS VOILE SOMBRE
  ============================================================ */

  function fixAccueil() {

    const heading =
      visibleHeading(
        "Le plongeon"
      );


    const hero =
      heroFromHeading(
        heading
      );


    if (!hero) {
      return;
    }


    applyHero(
      hero,
      IMAGES.accueil.desktop
    );

  }



  /* ============================================================
     DISCIPLINES
  ============================================================ */

  function fixDiscipline() {

    const discipline =
      disciplineFromHash();


    if (!discipline) {
      return;
    }


    const names = {

      olympique:
        "Plongeon olympique",

      freestyle:
        "Freestyle",

      highdiving:
        "High Diving",

      ange:
        "Saut de l'ange"

    };


    const heading =
      visibleHeading(
        names[
          discipline
        ]
      );


    const hero =
      heroFromHeading(
        heading
      );


    if (!hero) {
      return;
    }


    applyHero(
      hero,
      imageFor(
        discipline
      )
    );

  }



  /* ============================================================
     MASQUER ESPACE CLUB HORS DE SA PAGE
  ============================================================ */

  function fixClubVisibility() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const cardMode =
      params.has(
        "coachToken"
      )
      ||
      params.has(
        "token"
      )
      ||
      params.has(
        "id"
      );


    const hash =
      currentHash();


    const shouldShow =
      hash.includes(
        "club"
      )
      ||
      cardMode;


    const selectors = [

      "#club",

      "#espace-club",

      ".club-page",

      ".club-space",

      "[data-page='club']",

      "[data-view='club']"

    ];


    selectors
      .forEach(
        selector => {

          document
            .querySelectorAll(
              selector
            )
            .forEach(
              element => {

                element.style
                  .setProperty(

                    "display",

                    shouldShow
                      ? ""
                      : "none",

                    "important"

                  );

              }
            );

        }
      );


    /*
      Recherche supplémentaire par titre
    */

    document
      .querySelectorAll(
        "h1,h2"
      )
      .forEach(
        heading => {

          if (
            normalize(
              heading.textContent
            )
            !==
            "espace club"
          ) {

            return;

          }


          const section =
            heading.closest(
              "section"
            )
            ||
            heading.parentElement
              ?.parentElement;


          if (!section) {
            return;
          }


          section.style
            .setProperty(

              "display",

              shouldShow
                ? ""
                : "none",

              "important"

            );

        }
      );

  }



  /* ============================================================
     ECHAPPEMENT HTML
  ============================================================ */

  function esc(value) {

    return String(
      value || ""
    )

      .replace(
        /&/g,
        "&amp;"
      )

      .replace(
        /</g,
        "&lt;"
      )

      .replace(
        />/g,
        "&gt;"
      )

      .replace(
        /"/g,
        "&quot;"
      )

      .replace(
        /'/g,
        "&#039;"
      );

  }



  /* ============================================================
     TROUVER SECTION ACTUALITES / SPOTS
  ============================================================ */

  function pageSectionFromTitle(
    titleText
  ) {

    const heading =
      visibleHeading(
        titleText
      );


    if (!heading) {
      return null;
    }


    return (
      heading.closest(
        "section"
      )
      ||
      heading.parentElement
        ?.parentElement
      ||
      heading.parentElement
    );

  }



  /* ============================================================
     SUPPRIMER MESSAGE "AUCUN..."
  ============================================================ */

  function hideEmptyMessages(
    root,
    words
  ) {

    if (!root) {
      return;
    }


    root
      .querySelectorAll(
        "div,p"
      )
      .forEach(
        element => {

          const text =
            normalize(
              element.textContent
            );


          if (
            words.some(
              word =>
                text.includes(
                  normalize(
                    word
                  )
                )
            )
          ) {

            if (
              text.length < 150
            ) {

              element.style
                .setProperty(
                  "display",
                  "none",
                  "important"
                );

            }

          }

        }
      );

  }



  /* ============================================================
     MODALE
  ============================================================ */

  function closeModal() {

    document
      .getElementById(
        "eahDetailOverlay"
      )
      ?.remove();


    document.body
      .style
      .removeProperty(
        "overflow"
      );

  }


  window.eahCloseDetail =
    closeModal;


  function videoHtml(
    url
  ) {

    const value =
      String(
        url || ""
      ).trim();


    if (!value) {
      return "";
    }


    const youtube =
      value.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/
      );


    if (youtube) {

      return `

        <iframe
          class="eah-detail-video"
          src="https://www.youtube.com/embed/${esc(
            youtube[1]
          )}"
          allowfullscreen
        ></iframe>

      `;

    }


    if (
      /\.(mp4|webm|ogg)(\?.*)?$/i
      .test(
        value
      )
    ) {

      return `

        <video
          class="eah-detail-video"
          controls
          src="${esc(value)}"
        ></video>

      `;

    }


    return `

      <a
        class="eah-public-button"
        href="${esc(value)}"
        target="_blank"
        rel="noopener"
      >
        Voir la vidéo
      </a>

    `;

  }



  /* ============================================================
     MODALE ACTUALITE
  ============================================================ */

  function openNews(
    item
  ) {

    closeModal();


    const overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "eahDetailOverlay";


    overlay.className =
      "eah-detail-overlay";


    overlay.innerHTML = `

      <article
        class="eah-detail-modal"
      >

        <button
          class="eah-detail-close"
          type="button"
          onclick="eahCloseDetail()"
        >
          ×
        </button>


        <img
          class="eah-detail-image"
          src="${esc(
            item.image_url
            ||
            "news-default.jpg"
          )}"
          alt="${esc(
            item.title
          )}"
          onerror="
            this.onerror=null;
            this.src='news-default.jpg';
          "
        >


        <div
          class="eah-detail-content"
        >

          <div
            class="eah-public-kicker"
          >
            ${esc(
              item.category
              ||
              "Actualité EAH"
            )}
          </div>


          <h2>
            ${esc(
              item.title
            )}
          </h2>


          ${
            item.summary
              ? `
                <p
                  class="eah-detail-text"
                >
                  <strong>
                    ${esc(
                      item.summary
                    )}
                  </strong>
                </p>
              `
              : ""
          }


          ${
            item.content
              ? `
                <div
                  class="eah-detail-text"
                >
                  ${esc(
                    item.content
                  )}
                </div>
              `
              : ""
          }


          ${videoHtml(
            item.video_url
          )}


          ${
            item.link_url
              ? `

                <a
                  class="eah-public-button"
                  href="${esc(
                    item.link_url
                  )}"
                  target="_blank"
                  rel="noopener"
                >
                  En savoir plus
                </a>

              `
              : ""
          }

        </div>

      </article>

    `;


    overlay.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          overlay
        ) {

          closeModal();

        }

      }
    );


    document.body.appendChild(
      overlay
    );


    document.body.style
      .setProperty(
        "overflow",
        "hidden"
      );

  }



  /* ============================================================
     MODALE SPOT
  ============================================================ */

  function openSpot(
    spot
  ) {

    closeModal();


    const overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "eahDetailOverlay";


    overlay.className =
      "eah-detail-overlay";


    overlay.innerHTML = `

      <article
        class="eah-detail-modal"
      >

        <button
          class="eah-detail-close"
          type="button"
          onclick="eahCloseDetail()"
        >
          ×
        </button>


        <img
          class="eah-detail-image"
          src="${esc(
            spot.photo_url
            ||
            "spot-default.jpg"
          )}"
          alt="${esc(
            spot.name
          )}"
          onerror="
            this.onerror=null;
            this.src='spot-default.jpg';
          "
        >


        <div
          class="eah-detail-content"
        >

          <div
            class="eah-public-kicker"
          >
            SPOT EAH
          </div>


          <h2>
            ${esc(
              spot.name
            )}
          </h2>


          <div
            class="eah-detail-info"
          >

            ${
              spot.city
                ? `
                  <div>
                    <strong>
                      Ville
                    </strong>
                    <br>
                    ${esc(
                      spot.city
                    )}
                  </div>
                `
                : ""
            }


            ${
              spot.heights
                ? `
                  <div>
                    <strong>
                      Hauteurs
                    </strong>
                    <br>
                    ${esc(
                      spot.heights
                    )}
                  </div>
                `
                : ""
            }


            ${
              spot.address
                ? `
                  <div>
                    <strong>
                      Adresse
                    </strong>
                    <br>
                    ${esc(
                      spot.address
                    )}
                  </div>
                `
                : ""
            }

          </div>


          ${
            spot.description
              ? `
                <div
                  class="eah-detail-text"
                >
                  ${esc(
                    spot.description
                  )}
                </div>
              `
              : ""
          }

        </div>

      </article>

    `;


    overlay.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          overlay
        ) {

          closeModal();

        }

      }
    );


    document.body.appendChild(
      overlay
    );


    document.body.style
      .setProperty(
        "overflow",
        "hidden"
      );

  }



  /* ============================================================
     ACTUALITES
  ============================================================ */

  let newsLoading =
    false;


  async function renderNews() {

    if (
      newsLoading
    ) {
      return;
    }


    const hash =
      currentHash();


    if (
      !hash.includes(
        "actualit"
      )
    ) {
      return;
    }


    const section =
      pageSectionFromTitle(
        "Actualités"
      );


    if (!section) {
      return;
    }


    hideEmptyMessages(

      section,

      [
        "Aucune actualité"
      ]

    );


    let grid =
      section.querySelector(
        "#eahNewsGrid"
      );


    if (!grid) {

      grid =
        document.createElement(
          "div"
        );


      grid.id =
        "eahNewsGrid";


      grid.className =
        "eah-public-grid";


      section.appendChild(
        grid
      );

    }


    grid.innerHTML =
      "<p>Chargement des actualités…</p>";


    newsLoading =
      true;


    try {

      const sb =
        requireSupabase();


      const {
        data,
        error
      } =
        await sb
          .from(
            "news"
          )
          .select(
            "id,title,summary,content,image_url,video_url,link_url,category,featured,published_at,sort_order,active"
          )
          .eq(
            "active",
            true
          )
          .order(
            "sort_order",
            {
              ascending:
                true
            }
          );


      if (error) {
        throw error;
      }


      const items =
        Array.isArray(data)
          ? data
          : [];


      if (
        !items.length
      ) {

        grid.innerHTML = `

          <div
            class="eah-public-card"
          >
            <div
              class="eah-public-card-body"
            >
              <p>
                Aucune actualité publiée actuellement.
              </p>
            </div>
          </div>

        `;


        return;

      }


      grid.innerHTML =
        "";


      items.forEach(
        item => {

          const card =
            document.createElement(
              "article"
            );


          card.className =
            "eah-public-card";


          card.innerHTML = `

            <img
              class="eah-public-card-image"
              src="${esc(
                item.image_url
                ||
                "news-default.jpg"
              )}"
              alt="${esc(
                item.title
              )}"
              onerror="
                this.onerror=null;
                this.src='news-default.jpg';
              "
            >


            <div
              class="eah-public-card-body"
            >

              <div
                class="eah-public-kicker"
              >
                ${esc(
                  item.category
                  ||
                  "Actualité"
                )}
              </div>


              <h3>
                ${esc(
                  item.title
                )}
              </h3>


              <p>
                ${esc(
                  item.summary
                  ||
                  ""
                )}
              </p>


              <button
                class="eah-public-button"
                type="button"
              >
                Voir l'actualité
              </button>

            </div>

          `;


          card.addEventListener(
            "click",
            () =>
              openNews(
                item
              )
          );


          grid.appendChild(
            card
          );

        }
      );


    } catch(error) {

      console.error(
        "EAH Actualités :",
        error
      );


      grid.innerHTML = `

        <div
          class="eah-public-card"
        >
          <div
            class="eah-public-card-body"
          >
            <p>
              Impossible de charger les actualités.
            </p>
          </div>
        </div>

      `;

    } finally {

      newsLoading =
        false;

    }

  }



  /* ============================================================
     SPOTS
  ============================================================ */

  let spotsLoading =
    false;


  async function renderSpots() {

    if (
      spotsLoading
    ) {
      return;
    }


    const hash =
      currentHash();


    if (
      !hash.includes(
        "spots"
      )
    ) {
      return;
    }


    const section =
      pageSectionFromTitle(
        "Où plonger"
      )
      ||
      pageSectionFromTitle(
        "Spots"
      );


    if (!section) {
      return;
    }


    hideEmptyMessages(

      section,

      [
        "Aucun spot"
      ]

    );


    let grid =
      section.querySelector(
        "#eahSpotsGrid"
      );


    if (!grid) {

      grid =
        document.createElement(
          "div"
        );


      grid.id =
        "eahSpotsGrid";


      grid.className =
        "eah-public-grid";


      section.appendChild(
        grid
      );

    }


    grid.innerHTML =
      "<p>Chargement des spots…</p>";


    spotsLoading =
      true;


    try {

      const sb =
        requireSupabase();


      const {
        data,
        error
      } =
        await sb
          .from(
            "spots"
          )
          .select(
            "id,name,city,address,heights,photo_url,description,active"
          )
          .eq(
            "active",
            true
          )
          .order(
            "name",
            {
              ascending:
                true
            }
          );


      if (error) {
        throw error;
      }


      const items =
        Array.isArray(data)
          ? data
          : [];


      if (
        !items.length
      ) {

        grid.innerHTML = `

          <div
            class="eah-public-card"
          >
            <div
              class="eah-public-card-body"
            >
              <p>
                Aucun spot EAH publié actuellement.
              </p>
            </div>
          </div>

        `;


        return;

      }


      grid.innerHTML =
        "";


      items.forEach(
        spot => {

          const card =
            document.createElement(
              "article"
            );


          card.className =
            "eah-public-card";


          card.innerHTML = `

            <img
              class="eah-public-card-image"
              src="${esc(
                spot.photo_url
                ||
                "spot-default.jpg"
              )}"
              alt="${esc(
                spot.name
              )}"
              onerror="
                this.onerror=null;
                this.src='spot-default.jpg';
              "
            >


            <div
              class="eah-public-card-body"
            >

              <div
                class="eah-public-kicker"
              >
                ${esc(
                  spot.city
                  ||
                  "SPOT EAH"
                )}
              </div>


              <h3>
                ${esc(
                  spot.name
                )}
              </h3>


              ${
                spot.heights
                  ? `
                    <p>
                      Hauteurs :
                      ${esc(
                        spot.heights
                      )}
                    </p>
                  `
                  : ""
              }


              <button
                class="eah-public-button"
                type="button"
              >
                Voir le spot
              </button>

            </div>

          `;


          card.addEventListener(
            "click",
            () =>
              openSpot(
                spot
              )
          );


          grid.appendChild(
            card
          );

        }
      );


    } catch(error) {

      console.error(
        "EAH Spots :",
        error
      );


      grid.innerHTML = `

        <div
          class="eah-public-card"
        >
          <div
            class="eah-public-card-body"
          >
            <p>
              Impossible de charger les spots.
            </p>
          </div>
        </div>

      `;

    } finally {

      spotsLoading =
        false;

    }

  }



  /* ============================================================
     APPLICATION COMPLETE
  ============================================================ */

  function applyImmediately() {

    installStyles();

    fixClubVisibility();


    const hash =
      currentHash();


    if (
      hash ===
      "#accueil"
      ||
      !hash
    ) {

      fixAccueil();

    }


    fixDiscipline();

  }


  async function applyAsync() {

    await renderNews();

    await renderSpots();

  }



  /* ============================================================
     ROUTAGE
     IMPORTANT :
     CORRIGE LES PHOTOS SANS ACTUALISER
  ============================================================ */

  function routeChanged() {

    /*
      Première passe immédiatement.
    */

    applyImmediately();


    /*
      Ensuite on laisse script.js afficher
      la nouvelle page et on recommence.
    */

    requestAnimationFrame(
      () => {

        applyImmediately();


        requestAnimationFrame(
          () => {

            applyImmediately();

            applyAsync();

          }
        );

      }
    );


    setTimeout(
      () => {

        applyImmediately();

        applyAsync();

      },
      80
    );


    setTimeout(
      () => {

        applyImmediately();

        applyAsync();

      },
      250
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

      routeChanged,

      {
        once:
          true
      }

    );

  } else {

    routeChanged();

  }


  window.addEventListener(
    "hashchange",
    routeChanged
  );


  /*
    MutationObserver :
    uniquement pour les changements importants du routeur.
  */

  let mutationTimer;


  const observer =
    new MutationObserver(
      () => {

        clearTimeout(
          mutationTimer
        );


        mutationTimer =
          setTimeout(
            () => {

              applyImmediately();

            },
            60
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
    changement orientation / écran
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
          routeChanged,
          150
        );

    }
  );

})();
