/* ============================================================
   EAH DIVING PRO
   FRONTEND CONNECTOR
   VERSION 1.0

   GitHub Pages
   ↕
   Google Apps Script
   ↕
   Supabase

   Ce fichier complète l'ancien script.js.
   NE PAS SUPPRIMER script.js.
============================================================ */


/* ============================================================
   CONFIGURATION
============================================================ */

const EAH_PRO_FRONT = {

  /*
    IMPORTANT :
    colle ici l'URL de ton déploiement Apps Script
    qui se termine par /exec

    Exemple :
    https://script.google.com/macros/s/XXXXXXXXXXXX/exec
  */

  API_URL:
    "https://script.google.com/macros/s/AKfycbxUEodF5UQr774_QPn6E4xbifBr0f7nRov3-FtywhsDuPSXNMbJC3z_kKKjxKVqddgqBQ/exec",

  REQUEST_TIMEOUT:
    25000,

  DEBUG:
    true

};



/* ============================================================
   ETAT GLOBAL
============================================================ */

const EAH_STATE = {

  clubSlug:
    "",

  club:
    null,

  workspace:
    null,

  divers:
    [],

  groups:
    [],

  spots:
    [],

  evaluations:
    [],

  news:
    [],

  pricing:
    [],

  blazons:
    [],

  profile:
    null

};



/* ============================================================
   DEMARRAGE
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    logEAH(
      "EAH Diving Pro frontend démarré."
    );


    /* --------------------------------------------------------
       CLUB DEPUIS L'URL
    -------------------------------------------------------- */

    EAH_STATE.clubSlug =
      getClubSlugEAH();


    /* --------------------------------------------------------
       EVENEMENTS UI
    -------------------------------------------------------- */

    initNavigationEAH();

    initEvaluationFormEAH();

    initClubSelectorEAH();

    initRefreshButtonsEAH();


    /* --------------------------------------------------------
       CONTENU PUBLIC
    -------------------------------------------------------- */

    await loadPublicContentEAH();


    /* --------------------------------------------------------
       CLUB
    -------------------------------------------------------- */

    if (
      EAH_STATE.clubSlug
    ) {

      await loadClubWorkspaceEAH(
        EAH_STATE.clubSlug
      );

    }


    /* --------------------------------------------------------
       PROFIL NFC
    -------------------------------------------------------- */

    await loadProfileFromUrlEAH();


    document.documentElement
      .classList.add(
        "eah-loaded"
      );

  }
);



/* ============================================================
   LOG
============================================================ */

function logEAH(...args) {

  if (
    EAH_PRO_FRONT.DEBUG
  ) {

    console.log(
      "[EAH DIVING]",
      ...args
    );

  }

}



/* ============================================================
   DOM
============================================================ */

function eahEl(id) {

  return document.getElementById(
    id
  );

}


function eahAll(selector) {

  return Array.from(
    document.querySelectorAll(
      selector
    )
  );

}



/* ============================================================
   CLUB DEPUIS URL
============================================================ */

function getClubSlugEAH() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const fromUrl =
    String(
      params.get("club") ||
      ""
    )
    .trim()
    .toLowerCase();


  if (
    fromUrl
  ) {

    localStorage.setItem(
      "EAH_CLUB",
      fromUrl
    );


    return fromUrl;

  }


  const fromBody =
    document.body
      .dataset
      .club;


  if (
    fromBody
  ) {

    return String(
      fromBody
    )
    .trim()
    .toLowerCase();

  }


  return String(
    localStorage.getItem(
      "EAH_CLUB"
    ) ||
    ""
  )
  .trim()
  .toLowerCase();

}



/* ============================================================
   API GET VIA JSONP

   Evite les problèmes CORS entre
   GitHub Pages et Apps Script.
============================================================ */

function apiGetEAH(
  action,
  params = {}
) {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      checkApiUrlEAH();


      const callbackName =
        "__EAH_JSONP_"
        +
        Date.now()
        +
        "_"
        +
        Math.random()
          .toString(36)
          .substring(2);


      const query =
        new URLSearchParams();


      query.set(
        "action",
        action
      );


      Object.keys(
        params
      )
      .forEach(
        function (key) {

          const value =
            params[key];


          if (
            value !== null
            &&
            typeof value !==
              "undefined"
            &&
            value !== ""
          ) {

            query.set(
              key,
              value
            );

          }

        }
      );


      query.set(
        "callback",
        callbackName
      );


      const script =
        document.createElement(
          "script"
        );


      let finished =
        false;


      const cleanup =
        function () {

          try {

            delete window[
              callbackName
            ];

          } catch (_) {}


          try {

            script.remove();

          } catch (_) {}

      };


      const timer =
        setTimeout(
          function () {

            if (
              finished
            ) {

              return;

            }


            finished =
              true;


            cleanup();


            reject(
              new Error(
                "Délai API dépassé."
              )
            );

          },

          EAH_PRO_FRONT
            .REQUEST_TIMEOUT
        );


      window[
        callbackName
      ] =
        function (response) {

          if (
            finished
          ) {

            return;

          }


          finished =
            true;


          clearTimeout(
            timer
          );


          cleanup();


          if (
            !response
          ) {

            reject(
              new Error(
                "Réponse API vide."
              )
            );

            return;

          }


          if (
            response.ok === false
          ) {

            reject(
              new Error(
                response.error ||
                "Erreur API."
              )
            );

            return;

          }


          resolve(
            response
          );

        };


      script.onerror =
        function () {

          if (
            finished
          ) {

            return;

          }


          finished =
            true;


          clearTimeout(
            timer
          );


          cleanup();


          reject(
            new Error(
              "Impossible de contacter EAH Diving."
            )
          );

        };


      script.src =
        EAH_PRO_FRONT.API_URL
        +
        "?"
        +
        query.toString();


      document.head.appendChild(
        script
      );

    }
  );

}



/* ============================================================
   API POST VIA IFRAME

   Compatible GitHub Pages ↔ Apps Script
============================================================ */

function apiPostEAH(
  action,
  payload = {}
) {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      checkApiUrlEAH();


      const requestId =
        createRequestIdEAH();


      const iframeName =
        "eah_iframe_"
        +
        requestId;


      const iframe =
        document.createElement(
          "iframe"
        );


      iframe.name =
        iframeName;


      iframe.style.display =
        "none";


      const form =
        document.createElement(
          "form"
        );


      form.method =
        "POST";


      form.action =
        EAH_PRO_FRONT.API_URL;


      form.target =
        iframeName;


      form.style.display =
        "none";


      const values =
        Object.assign(
          {},
          payload,
          {

            action:
              action,

            transport:
              "iframe",

            requestId:
              requestId

          }
        );


      Object.keys(
        values
      )
      .forEach(
        function (key) {

          const input =
            document.createElement(
              "input"
            );


          input.type =
            "hidden";


          input.name =
            key;


          const value =
            values[key];


          if (
            value !== null
            &&
            typeof value ===
              "object"
          ) {

            input.value =
              JSON.stringify(
                value
              );

          } else {

            input.value =
              value === null
              ||
              typeof value ===
                "undefined"
              ?
              ""
              :
              String(
                value
              );

          }


          form.appendChild(
            input
          );

        }
      );


      document.body.appendChild(
        iframe
      );


      document.body.appendChild(
        form
      );


      let finished =
        false;


      const cleanup =
        function () {

          window.removeEventListener(
            "message",
            listener
          );


          try {

            form.remove();

          } catch (_) {}


          try {

            iframe.remove();

          } catch (_) {}

      };


      const listener =
        function (event) {

          const data =
            event.data;


          if (
            !data
            ||
            data.type !==
              "EAH_API_RESPONSE"
            ||
            data.requestId !==
              requestId
          ) {

            return;

          }


          if (
            finished
          ) {

            return;

          }


          finished =
            true;


          clearTimeout(
            timer
          );


          cleanup();


          const result =
            data.result;


          if (
            !result
          ) {

            reject(
              new Error(
                "Réponse serveur vide."
              )
            );

            return;

          }


          if (
            result.ok === false
          ) {

            reject(
              new Error(
                result.error ||
                "Erreur serveur."
              )
            );

            return;

          }


          resolve(
            result
          );

        };


      window.addEventListener(
        "message",
        listener
      );


      const timer =
        setTimeout(
          function () {

            if (
              finished
            ) {

              return;

            }


            finished =
              true;


            cleanup();


            reject(
              new Error(
                "L'enregistrement prend trop de temps."
              )
            );

          },

          60000
        );


      form.submit();

    }
  );

}



/* ============================================================
   VERIFICATION URL
============================================================ */

function checkApiUrlEAH() {

  if (
    !EAH_PRO_FRONT.API_URL
    ||
    EAH_PRO_FRONT.API_URL
      .indexOf(
        "COLLE_ICI"
      )
    >= 0
  ) {

    throw new Error(
      "L'URL Apps Script n'est pas encore renseignée dans eah-pro.js."
    );

  }

}



/* ============================================================
   REQUEST ID
============================================================ */

function createRequestIdEAH() {

  if (
    window.crypto
    &&
    crypto.randomUUID
  ) {

    return crypto
      .randomUUID();

  }


  return (
    Date.now()
    +
    "-"
    +
    Math.random()
      .toString(36)
      .substring(2)
  );

}



/* ============================================================
   CONTENU PUBLIC
============================================================ */

async function loadPublicContentEAH() {

  /*
    On essaie d'abord bootstrap.
    Si une fonction de ton ancien backend
    n'est pas encore présente, le site continue.
  */

  try {

    const data =
      await apiGetEAH(
        "bootstrap"
      );


    if (
      data.news
      ||
      data.actualites
    ) {

      EAH_STATE.news =
        data.news ||
        data.actualites ||
        [];

    }


    if (
      data.spots
    ) {

      EAH_STATE.spots =
        data.spots;

    }


    if (
      data.pricing
      ||
      data.tarifs
    ) {

      EAH_STATE.pricing =
        data.pricing ||
        data.tarifs ||
        [];

    }


    if (
      data.blazons
    ) {

      EAH_STATE.blazons =
        data.blazons;

    }

  } catch (error) {

    logEAH(
      "Bootstrap non disponible :",
      error.message
    );

  }


  /* --------------------------------------------------------
     ACTUALITES
  -------------------------------------------------------- */

  if (
    !EAH_STATE.news.length
  ) {

    try {

      const news =
        await apiGetEAH(
          "actualites"
        );


      EAH_STATE.news =
        normalizeArrayEAH(
          news,
          [
            "actualites",
            "news",
            "items"
          ]
        );

    } catch (error) {

      logEAH(
        "Actualités :",
        error.message
      );

    }

  }


  /* --------------------------------------------------------
     SPOTS
  -------------------------------------------------------- */

  if (
    !EAH_STATE.spots.length
  ) {

    try {

      const result =
        await apiGetEAH(
          "spots"
        );


      EAH_STATE.spots =
        normalizeArrayEAH(
          result,
          [
            "spots",
            "items"
          ]
        );

    } catch (error) {

      logEAH(
        "Spots :",
        error.message
      );

    }

  }


  /* --------------------------------------------------------
     TARIFS
  -------------------------------------------------------- */

  if (
    !EAH_STATE.pricing.length
  ) {

    try {

      const result =
        await apiGetEAH(
          "pricing"
        );


      EAH_STATE.pricing =
        normalizeArrayEAH(
          result,
          [
            "pricing",
            "tarifs",
            "items"
          ]
        );

    } catch (error) {

      logEAH(
        "Tarifs :",
        error.message
      );

    }

  }


  /* --------------------------------------------------------
     BLAZONS
  -------------------------------------------------------- */

  if (
    !EAH_STATE.blazons.length
  ) {

    try {

      const result =
        await apiGetEAH(
          "blazons"
        );


      EAH_STATE.blazons =
        normalizeArrayEAH(
          result,
          [
            "blazons",
            "items"
          ]
        );

    } catch (error) {

      logEAH(
        "Blazons :",
        error.message
      );

    }

  }


  renderNewsEAH();

  renderSpotsEAH();

  renderPricingEAH();

  renderBlazonsEAH();

}



/* ============================================================
   ESPACE CLUB
============================================================ */

async function loadClubWorkspaceEAH(
  slug
) {

  if (!slug) {

    return;

  }


  setGlobalLoadingEAH(
    true
  );


  try {

    const data =
      await apiGetEAH(

        "clubWorkspaceSimple",

        {

          club:
            slug

        }

      );


    EAH_STATE.workspace =
      data;


    EAH_STATE.club =
      data.club ||
      null;


    EAH_STATE.divers =
      data.divers ||
      [];


    EAH_STATE.groups =
      data.groups ||
      [];


    /*
      Les spots du workspace sont prioritaires
      pour le formulaire coach.
    */

    if (
      Array.isArray(
        data.spots
      )
      &&
      data.spots.length
    ) {

      EAH_STATE.spots =
        data.spots;

    }


    EAH_STATE.evaluations =
      data.recentEvaluations
      ||
      data.recent
      ||
      [];


    localStorage.setItem(
      "EAH_CLUB",
      slug
    );


    applyClubBrandEAH();

    renderClubEAH();

    renderDiversEAH();

    renderGroupsEAH();

    renderRecentEvaluationsEAH();

    populateEvaluationSelectorsEAH();


    document.dispatchEvent(

      new CustomEvent(
        "eah:club-loaded",
        {
          detail:
            data
        }
      )

    );


    logEAH(
      "Club chargé :",
      data.club &&
      data.club.name
    );


  } catch (error) {

    console.error(
      error
    );


    showToastEAH(

      "Impossible de charger le club : "
      +
      error.message,

      "error"

    );


  } finally {

    setGlobalLoadingEAH(
      false
    );

  }

}



/* ============================================================
   BRANDING DU CLUB
============================================================ */

function applyClubBrandEAH() {

  const club =
    EAH_STATE.club;


  if (!club) {

    return;

  }


  if (
    club.primaryColor
  ) {

    document.documentElement
      .style
      .setProperty(
        "--club-primary",
        club.primaryColor
      );

  }


  if (
    club.secondaryColor
  ) {

    document.documentElement
      .style
      .setProperty(
        "--club-secondary",
        club.secondaryColor
      );

  }


  eahAll(
    "[data-club-name]"
  )
  .forEach(
    function (element) {

      element.textContent =
        club.name ||
        "";

    }
  );


  eahAll(
    "[data-club-city]"
  )
  .forEach(
    function (element) {

      element.textContent =
        club.city ||
        "";

    }
  );


  eahAll(
    "[data-club-season]"
  )
  .forEach(
    function (element) {

      element.textContent =
        club.season ||
        "";

    }
  );


  eahAll(
    "[data-club-logo]"
  )
  .forEach(
    function (image) {

      if (
        club.logoUrl
      ) {

        image.src =
          club.logoUrl;


        image.hidden =
          false;

      }

    }
  );

}



/* ============================================================
   CLUB / STATS
============================================================ */

function renderClubEAH() {

  const workspace =
    EAH_STATE.workspace;


  if (!workspace) {

    return;

  }


  const club =
    workspace.club ||
    {};


  const stats =
    workspace.stats ||
    {};


  setTextEAH(
    "eah-club-name",
    club.name
  );


  setTextEAH(
    "eah-club-city",
    club.city
  );


  setTextEAH(
    "eah-club-season",
    club.season
  );


  setTextEAH(
    "eah-stat-divers",
    stats.divers || 0
  );


  setTextEAH(
    "eah-stat-cards",
    stats.cards || 0
  );


  setTextEAH(
    "eah-stat-cards-available",
    stats.cardsAvailable || 0
  );


  setTextEAH(
    "eah-stat-groups",
    stats.groups || 0
  );


  setTextEAH(
    "eah-stat-evaluations",
    stats.evaluations || 0
  );


  setTextEAH(
    "eah-stat-verified",
    stats.verified || 0
  );


  setTextEAH(

    "eah-stat-average",

    stats.averageEAH !== null
    &&
    typeof stats.averageEAH !==
      "undefined"
    ?
    stats.averageEAH
    +
    "/10"
    :
    "—"

  );


  const logo =
    eahEl(
      "eah-club-logo"
    );


  if (
    logo &&
    club.logoUrl
  ) {

    logo.src =
      club.logoUrl;


    logo.hidden =
      false;

  }

}



/* ============================================================
   PLONGEURS
============================================================ */

function renderDiversEAH() {

  const container =
    eahEl(
      "eah-divers-list"
    );


  if (!container) {

    return;

  }


  const divers =
    EAH_STATE.divers.filter(
      function (diver) {

        return Boolean(
          diver.firstName ||
          diver.lastName
        );

      }
    );


  if (!divers.length) {

    container.innerHTML =
      emptyStateEAH(

        "Aucun plongeur attribué",

        "Les cartes NFC sont prêtes. Elles apparaîtront ici lorsqu'elles seront attribuées."

      );


    return;

  }


  container.innerHTML =
    divers.map(
      function (diver) {

        const photo =
          diver.photoUrl
          ?
          `
            <img
              class="eah-diver-photo"
              src="${escapeAttrEAH(
                diver.photoUrl
              )}"
              alt=""
            >
          `
          :
          `
            <div class="eah-diver-photo eah-diver-photo-empty">
              ${escapeHtmlEAH(
                initialsEAH(
                  diver.name
                )
              )}
            </div>
          `;


        return `
          <article
            class="eah-runtime-card eah-diver-card"
            data-eah-id="${escapeAttrEAH(
              diver.eahId
            )}"
          >

            ${photo}

            <div class="eah-runtime-card-content">

              <span class="eah-runtime-kicker">
                ${escapeHtmlEAH(
                  diver.eahId
                )}
              </span>

              <h3>
                ${escapeHtmlEAH(
                  diver.name
                )}
              </h3>

              <p>
                ${
                  diver.group
                  ?
                  escapeHtmlEAH(
                    diver.group
                  )
                  :
                  "Sans groupe"
                }
              </p>

              <div class="eah-runtime-tags">

                ${
                  diver.currentBlazon
                  ?
                  `
                  <span class="eah-runtime-tag">
                    ${escapeHtmlEAH(
                      diver.currentBlazon
                    )}
                  </span>
                  `
                  :
                  ""
                }

                <span class="eah-runtime-tag">
                  ${
                    Number(
                      diver.evaluations ||
                      0
                    )
                  }
                  évaluation(s)
                </span>

              </div>

            </div>

            <button
              type="button"
              class="eah-runtime-button"
              onclick="selectDiverForEvaluationEAH('${escapeJsEAH(
                diver.eahId
              )}')"
            >
              Évaluer
            </button>

          </article>
        `;

      }
    )
    .join("");

}



/* ============================================================
   GROUPES
============================================================ */

function renderGroupsEAH() {

  const container =
    eahEl(
      "eah-groups-list"
    );


  if (!container) {

    return;

  }


  const groups =
    Array.isArray(
      EAH_STATE.groups
    )
    ?
    EAH_STATE.groups
    :
    Object.keys(
      EAH_STATE.groups ||
      {}
    )
    .map(
      function (name) {

        return {

          name:
            name,

          divers:
            EAH_STATE
              .groups[
                name
              ]
              .divers ||
            0

        };

      }
    );


  if (!groups.length) {

    container.innerHTML =
      emptyStateEAH(

        "Aucun groupe",

        "Les groupes apparaîtront automatiquement ici."

      );


    return;

  }


  container.innerHTML =
    groups.map(
      function (group) {

        return `
          <article class="eah-runtime-card">

            <span class="eah-runtime-kicker">
              GROUPE
            </span>

            <h3>
              ${escapeHtmlEAH(
                group.name
              )}
            </h3>

            <strong>
              ${Number(
                group.divers ||
                0
              )}
              plongeur(s)
            </strong>

          </article>
        `;

      }
    )
    .join("");

}



/* ============================================================
   EVALUATIONS RECENTES
============================================================ */

function renderRecentEvaluationsEAH() {

  const container =
    eahEl(
      "eah-recent-evaluations"
    );


  if (!container) {

    return;

  }


  const evaluations =
    EAH_STATE.evaluations ||
    [];


  if (!evaluations.length) {

    container.innerHTML =
      emptyStateEAH(

        "Aucune évaluation",

        "Les Grade Reports créés par les coachs apparaîtront ici."

      );


    return;

  }


  container.innerHTML =
    evaluations.map(
      function (evaluation) {

        const score =
          evaluation.eahScore ??
          evaluation.eah ??
          "—";


        return `
          <article class="eah-runtime-card eah-evaluation-card">

            <div>

              <span class="eah-runtime-kicker">
                ${escapeHtmlEAH(
                  evaluation.eahId ||
                  ""
                )}
              </span>

              <h3>
                ${escapeHtmlEAH(
                  evaluation.diveCode ||
                  evaluation.code ||
                  "Plongeon"
                )}
              </h3>

              <p>
                ${
                  Number(
                    evaluation.height ||
                    0
                  )
                }
                m
                ${
                  evaluation.spot
                  ?
                  " • "
                  +
                  escapeHtmlEAH(
                    evaluation.spot
                  )
                  :
                  ""
                }
              </p>

            </div>

            <div class="eah-runtime-score">
              ${escapeHtmlEAH(
                String(
                  score
                )
              )}
              <small>/10</small>
            </div>

            ${
              evaluation.reportUrl
              ?
              `
                <a
                  class="eah-runtime-link"
                  href="${escapeAttrEAH(
                    evaluation.reportUrl
                  )}"
                  target="_blank"
                  rel="noopener"
                >
                  Grade Report
                </a>
              `
              :
              ""
            }

          </article>
        `;

      }
    )
    .join("");

}



/* ============================================================
   ACTUALITES
============================================================ */

function renderNewsEAH() {

  const container =
    eahEl(
      "eah-news-list"
    );


  if (!container) {

    return;

  }


  const news =
    EAH_STATE.news ||
    [];


  if (!news.length) {

    container.innerHTML =
      emptyStateEAH(
        "Aucune actualité",
        ""
      );


    return;

  }


  container.innerHTML =
    news.map(
      function (item) {

        const image =
          item.imageUrl ||
          item.image_url ||
          "";


        return `
          <article class="eah-runtime-card eah-news-card">

            ${
              image
              ?
              `
                <img
                  class="eah-news-image"
                  src="${escapeAttrEAH(
                    resolveMediaEAH(
                      image
                    )
                  )}"
                  alt=""
                >
              `
              :
              ""
            }

            <div class="eah-runtime-card-content">

              <span class="eah-runtime-kicker">
                ${escapeHtmlEAH(
                  item.category ||
                  "EAH DIVING"
                )}
              </span>

              <h3>
                ${escapeHtmlEAH(
                  item.title ||
                  ""
                )}
              </h3>

              <p>
                ${escapeHtmlEAH(
                  item.summary ||
                  item.content ||
                  ""
                )}
              </p>

            </div>

          </article>
        `;

      }
    )
    .join("");

}



/* ============================================================
   SPOTS
============================================================ */

function renderSpotsEAH() {

  const container =
    eahEl(
      "eah-spots-list"
    );


  if (!container) {

    return;

  }


  const spots =
    EAH_STATE.spots ||
    [];


  if (!spots.length) {

    container.innerHTML =
      emptyStateEAH(
        "Aucun spot publié",
        ""
      );


    return;

  }


  container.innerHTML =
    spots.map(
      function (spot) {

        const photo =
          spot.photoUrl ||
          spot.photo_url ||
          "";


        return `
          <article class="eah-runtime-card eah-spot-card">

            ${
              photo
              ?
              `
                <img
                  class="eah-news-image"
                  src="${escapeAttrEAH(
                    resolveMediaEAH(
                      photo
                    )
                  )}"
                  alt=""
                >
              `
              :
              ""
            }

            <div class="eah-runtime-card-content">

              <span class="eah-runtime-kicker">
                ${escapeHtmlEAH(
                  spot.city ||
                  ""
                )}
              </span>

              <h3>
                ${escapeHtmlEAH(
                  spot.name ||
                  ""
                )}
              </h3>

              <p>
                ${escapeHtmlEAH(
                  spot.description ||
                  ""
                )}
              </p>

              ${
                spot.heights
                ?
                `
                  <span class="eah-runtime-tag">
                    ${escapeHtmlEAH(
                      String(
                        spot.heights
                      )
                    )}
                  </span>
                `
                :
                ""
              }

            </div>

          </article>
        `;

      }
    )
    .join("");

}



/* ============================================================
   TARIFS
============================================================ */

function renderPricingEAH() {

  const container =
    eahEl(
      "eah-pricing-list"
    );


  if (!container) {

    return;

  }


  const pricing =
    EAH_STATE.pricing ||
    [];


  if (!pricing.length) {

    return;

  }


  container.innerHTML =
    pricing.map(
      function (offer) {

        return `
          <article class="eah-runtime-card eah-pricing-card">

            <span class="eah-runtime-kicker">
              EAH DIVING PRO
            </span>

            <h3>
              ${escapeHtmlEAH(
                offer.name ||
                ""
              )}
            </h3>

            <div class="eah-runtime-price">
              ${escapeHtmlEAH(
                String(
                  offer.price ||
                  ""
                )
              )}
            </div>

            <p>
              ${escapeHtmlEAH(
                offer.description ||
                ""
              )}
            </p>

          </article>
        `;

      }
    )
    .join("");

}



/* ============================================================
   BLAZONS
============================================================ */

function renderBlazonsEAH() {

  const container =
    eahEl(
      "eah-blazons-list"
    );


  if (!container) {

    return;

  }


  const blazons =
    EAH_STATE.blazons ||
    [];


  if (!blazons.length) {

    return;

  }


  container.innerHTML =
    blazons.map(
      function (blazon) {

        const image =
          blazon.imageUrl ||
          blazon.image_url ||
          "";


        return `
          <article class="eah-runtime-card eah-blazon-card">

            ${
              image
              ?
              `
              <img
                src="${escapeAttrEAH(
                  resolveMediaEAH(
                    image
                  )
                )}"
                alt="${escapeAttrEAH(
                  blazon.name ||
                  ""
                )}"
              >
              `
              :
              ""
            }

            <h3>
              ${escapeHtmlEAH(
                blazon.name ||
                ""
              )}
            </h3>

          </article>
        `;

      }
    )
    .join("");

}



/* ============================================================
   FORMULAIRE EVALUATION
============================================================ */

function initEvaluationFormEAH() {

  const form =
    eahEl(
      "eah-evaluation-form"
    );


  if (!form) {

    return;

  }


  form.addEventListener(
    "change",
    updateLiveScoresEAH
  );


  form.addEventListener(
    "input",
    updateLiveScoresEAH
  );


  form.addEventListener(
    "submit",
    submitEvaluationEAH
  );

}



/* ============================================================
   REMPLIR SELECTS DU FORMULAIRE
============================================================ */

function populateEvaluationSelectorsEAH() {

  const diverSelect =
    eahEl(
      "eah-evaluation-diver"
    );


  if (
    diverSelect
  ) {

    const assigned =
      EAH_STATE.divers
        .filter(
          function (diver) {

            return Boolean(
              diver.firstName ||
              diver.lastName
            );

          }
        );


    diverSelect.innerHTML =
      `
        <option value="">
          Choisir un plongeur
        </option>
      `
      +
      assigned.map(
        function (diver) {

          return `
            <option
              value="${escapeAttrEAH(
                diver.eahId
              )}"
            >
              ${escapeHtmlEAH(
                diver.name
              )}
              — ${escapeHtmlEAH(
                diver.eahId
              )}
            </option>
          `;

        }
      )
      .join("");

  }


  const spotSelect =
    eahEl(
      "eah-evaluation-spot"
    );


  if (
    spotSelect
  ) {

    spotSelect.innerHTML =
      `
        <option value="">
          Aucun spot
        </option>
      `
      +
      EAH_STATE.spots.map(
        function (spot) {

          return `
            <option
              value="${escapeAttrEAH(
                spot.id
              )}"
              data-name="${escapeAttrEAH(
                spot.name
              )}"
            >
              ${escapeHtmlEAH(
                spot.name
              )}
              ${
                spot.city
                ?
                " — "
                +
                escapeHtmlEAH(
                  spot.city
                )
                :
                ""
              }
            </option>
          `;

        }
      )
      .join("");

  }

}



/* ============================================================
   SELECTIONNER PLONGEUR POUR EVALUATION
============================================================ */

function selectDiverForEvaluationEAH(
  eahId
) {

  const select =
    eahEl(
      "eah-evaluation-diver"
    );


  if (
    select
  ) {

    select.value =
      eahId;

  }


  const section =
    eahEl(
      "eah-coach-evaluation"
    );


  if (
    section
  ) {

    section.scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

  }

}



/* ============================================================
   CALCUL LIVE CRITERE
============================================================ */

function calculateCriterionScoreEAH(
  prefix
) {

  let total =
    0;


  let maximum =
    0;


  for (
    let i = 1;
    i <= 5;
    i++
  ) {

    const input =
      document.querySelector(
        `[name="${prefix}${i}"]`
      );


    if (!input) {

      continue;

    }


    const value =
      String(
        input.value ||
        ""
      )
      .toUpperCase();


    if (
      value === ""
      ||
      value === "NA"
      ||
      value === "N/A"
    ) {

      continue;

    }


    const number =
      Number(
        value
      );


    if (
      !Number.isFinite(
        number
      )
    ) {

      continue;

    }


    total +=
      Math.max(
        0,
        Math.min(
          2,
          number
        )
      );


    maximum +=
      2;

  }


  if (!maximum) {

    return 0;

  }


  return Math.round(
    (
      total /
      maximum
    )
    *
    10
  );

}



/* ============================================================
   NOTE FINALE EAH
============================================================ */

function calculateFinalEAHScore(
  takeoff,
  trick,
  entry
) {

  const values = [

    takeoff,
    trick,
    entry

  ];


  const minimum =
    Math.min(
      ...values
    );


  const count =
    values.filter(
      function (value) {

        return value ===
          minimum;

      }
    )
    .length;


  return Math.min(

    10,

    count === 1
    ?
    minimum + 0.5
    :
    minimum

  );

}



/* ============================================================
   SCORES LIVE
============================================================ */

function updateLiveScoresEAH() {

  const takeoff =
    calculateCriterionScoreEAH(
      "D"
    );


  const trick =
    calculateCriterionScoreEAH(
      "T"
    );


  const entry =
    calculateCriterionScoreEAH(
      "E"
    );


  const finalScore =
    calculateFinalEAHScore(

      takeoff,

      trick,

      entry

    );


  setTextEAH(
    "eah-live-takeoff",
    takeoff +
    "/10"
  );


  setTextEAH(
    "eah-live-trick",
    trick +
    "/10"
  );


  setTextEAH(
    "eah-live-entry",
    entry +
    "/10"
  );


  setTextEAH(
    "eah-live-final",
    finalScore +
    "/10"
  );

}



/* ============================================================
   ENVOYER EVALUATION
============================================================ */

async function submitEvaluationEAH(
  event
) {

  event.preventDefault();


  const form =
    event.currentTarget;


  const button =
    form.querySelector(
      '[type="submit"]'
    );


  const data =
    formDataObjectEAH(
      form
    );


  const eahId =
    data.eahId ||
    data.diver ||
    "";


  if (
    !EAH_STATE.clubSlug
  ) {

    showToastEAH(
      "Aucun club sélectionné.",
      "error"
    );

    return;

  }


  if (
    !eahId
  ) {

    showToastEAH(
      "Choisis un plongeur.",
      "error"
    );

    return;

  }


  if (
    !data.diveCode
  ) {

    showToastEAH(
      "Indique le code du plongeon.",
      "error"
    );

    return;

  }


  /* --------------------------------------------------------
     SPOT
  -------------------------------------------------------- */

  const spotSelect =
    eahEl(
      "eah-evaluation-spot"
    );


  let spotName =
    "";


  if (
    spotSelect &&
    spotSelect.selectedIndex >=
      0
  ) {

    spotName =
      spotSelect
        .options[
          spotSelect
            .selectedIndex
        ]
        ?.dataset
        ?.name
      ||
      "";

  }


  const payload =
    Object.assign(
      {},
      data,
      {

        clubSlug:
          EAH_STATE.clubSlug,

        club:
          EAH_STATE.clubSlug,

        eahId:
          eahId,

        spotId:
          data.spotId ||
          data.spot ||
          "",

        spotName:
          spotName,

        clientRequestId:
          createRequestIdEAH()

      }
    );


  setButtonLoadingEAH(
    button,
    true,
    "Création du Grade Report…"
  );


  try {

    const result =
      await apiPostEAH(

        "submitEvaluationPro",

        payload

      );


    showToastEAH(

      "Évaluation enregistrée — EAH "
      +
      result.eahScore
      +
      "/10",

      "success"

    );


    form.reset();


    updateLiveScoresEAH();


    await loadClubWorkspaceEAH(
      EAH_STATE.clubSlug
    );


    if (
      result.reportUrl
    ) {

      const report =
        eahEl(
          "eah-last-grade-report"
        );


      if (
        report
      ) {

        report.href =
          result.reportUrl;


        report.hidden =
          false;

      }

    }


    document.dispatchEvent(

      new CustomEvent(
        "eah:evaluation-created",
        {
          detail:
            result
        }
      )

    );


  } catch (error) {

    console.error(
      error
    );


    showToastEAH(

      "Évaluation non enregistrée : "
      +
      error.message,

      "error"

    );


  } finally {

    setButtonLoadingEAH(
      button,
      false
    );

  }

}



/* ============================================================
   PROFIL NFC DEPUIS URL
============================================================ */

async function loadProfileFromUrlEAH() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const id =
    params.get(
      "id"
    );


  const token =
    params.get(
      "token"
    );


  const club =
    params.get(
      "club"
    )
    ||
    EAH_STATE.clubSlug;


  if (
    !id ||
    !token ||
    !club
  ) {

    return;

  }


  try {

    const result =
      await apiGetEAH(

        "profile",

        {

          club:
            club,

          id:
            id,

          token:
            token

        }

      );


    EAH_STATE.profile =
      result;


    renderProfileEAH(
      result
    );


  } catch (error) {

    showToastEAH(

      "Impossible d'ouvrir le profil : "
      +
      error.message,

      "error"

    );

  }

}



/* ============================================================
   RENDER PROFIL
============================================================ */

function renderProfileEAH(
  result
) {

  const container =
    eahEl(
      "eah-profile-runtime"
    );


  if (!container) {

    return;

  }


  const profile =
    result.profile ||
    result.diver ||
    result;


  const name =
    profile.name
    ||
    (
      (
        profile.first_name ||
        profile.firstName ||
        ""
      )
      +
      " "
      +
      (
        profile.last_name ||
        profile.lastName ||
        ""
      )
    )
    .trim()
    ||
    profile.eah_id
    ||
    profile.eahId
    ||
    "Profil EAH";


  const eahId =
    profile.eah_id ||
    profile.eahId ||
    "";


  const blazon =
    profile.current_blazon ||
    profile.currentBlazon ||
    "";


  container.innerHTML = `

    <article class="eah-profile-runtime-card">

      ${
        profile.photo_url ||
        profile.photoUrl
        ?
        `
          <img
            class="eah-profile-runtime-photo"
            src="${escapeAttrEAH(
              profile.photo_url ||
              profile.photoUrl
            )}"
            alt=""
          >
        `
        :
        ""
      }

      <span class="eah-runtime-kicker">
        ${escapeHtmlEAH(
          eahId
        )}
      </span>

      <h2>
        ${escapeHtmlEAH(
          name
        )}
      </h2>

      ${
        profile.group_name ||
        profile.group
        ?
        `
          <p>
            ${escapeHtmlEAH(
              profile.group_name ||
              profile.group
            )}
          </p>
        `
        :
        ""
      }

      ${
        blazon
        ?
        `
          <div class="eah-runtime-tag">
            ${escapeHtmlEAH(
              blazon
            )}
          </div>
        `
        :
        ""
      }

    </article>

  `;


  container.hidden =
    false;

}



/* ============================================================
   SELECTEUR CLUB
============================================================ */

function initClubSelectorEAH() {

  eahAll(
    "[data-eah-club]"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        async function () {

          const slug =
            String(
              button.dataset
                .eahClub ||
              ""
            )
            .trim()
            .toLowerCase();


          if (!slug) {

            return;

          }


          EAH_STATE.clubSlug =
            slug;


          localStorage.setItem(
            "EAH_CLUB",
            slug
          );


          const url =
            new URL(
              window.location.href
            );


          url.searchParams.set(
            "club",
            slug
          );


          history.replaceState(
            {},
            "",
            url
          );


          await loadClubWorkspaceEAH(
            slug
          );

        }
      );

    }
  );

}



/* ============================================================
   REFRESH
============================================================ */

function initRefreshButtonsEAH() {

  eahAll(
    "[data-eah-refresh]"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        async function () {

          if (
            EAH_STATE.clubSlug
          ) {

            await loadClubWorkspaceEAH(
              EAH_STATE.clubSlug
            );

          }


          await loadPublicContentEAH();

        }
      );

    }
  );

}



/* ============================================================
   NAVIGATION
============================================================ */

function initNavigationEAH() {

  eahAll(
    "[data-eah-target]"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          const target =
            document.querySelector(

              button.dataset
                .eahTarget

            );


          if (
            target
          ) {

            target.scrollIntoView({

              behavior:
                "smooth",

              block:
                "start"

            });

          }

        }
      );

    }
  );

}



/* ============================================================
   FORM -> OBJECT
============================================================ */

function formDataObjectEAH(
  form
) {

  const data =
    {};


  const formData =
    new FormData(
      form
    );


  formData.forEach(
    function (
      value,
      key
    ) {

      data[key] =
        value;

    }
  );


  return data;

}



/* ============================================================
   ARRAY API
============================================================ */

function normalizeArrayEAH(
  data,
  keys = []
) {

  if (
    Array.isArray(
      data
    )
  ) {

    return data;

  }


  for (
    const key of keys
  ) {

    if (
      data &&
      Array.isArray(
        data[key]
      )
    ) {

      return data[key];

    }

  }


  return [];

}



/* ============================================================
   MEDIAS

   Si IMAGE_URL contient simplement :
   blazon-blanc.png

   GitHub chargera :
   ./blazon-blanc.png
============================================================ */

function resolveMediaEAH(
  value
) {

  const url =
    String(
      value ||
      ""
    )
    .trim();


  if (!url) {

    return "";

  }


  if (
    /^https?:\/\//i.test(
      url
    )
    ||
    url.startsWith(
      "data:"
    )
    ||
    url.startsWith(
      "/"
    )
    ||
    url.startsWith(
      "./"
    )
  ) {

    return url;

  }


  return "./" +
    url;

}



/* ============================================================
   UI HELPERS
============================================================ */

function setTextEAH(
  id,
  value
) {

  const element =
    eahEl(
      id
    );


  if (
    element
  ) {

    element.textContent =
      value === null
      ||
      typeof value ===
        "undefined"
      ?
      ""
      :
      String(
        value
      );

  }

}



/* ============================================================
   LOADING
============================================================ */

function setGlobalLoadingEAH(
  loading
) {

  document.documentElement
    .classList.toggle(
      "eah-loading",
      Boolean(
        loading
      )
    );

}



/* ============================================================
   BUTTON LOADING
============================================================ */

function setButtonLoadingEAH(
  button,
  loading,
  text
) {

  if (!button) {

    return;

  }


  if (
    loading
  ) {

    button.dataset
      .originalText =
        button.textContent;


    button.disabled =
      true;


    if (
      text
    ) {

      button.textContent =
        text;

    }

  } else {

    button.disabled =
      false;


    if (
      button.dataset
        .originalText
    ) {

      button.textContent =
        button.dataset
          .originalText;


      delete button.dataset
        .originalText;

    }

  }

}



/* ============================================================
   TOAST
============================================================ */

function showToastEAH(
  message,
  type = "info"
) {

  let container =
    eahEl(
      "eah-toast-container"
    );


  if (!container) {

    container =
      document.createElement(
        "div"
      );


    container.id =
      "eah-toast-container";


    container.className =
      "eah-toast-container";


    document.body.appendChild(
      container
    );

  }


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    "eah-toast eah-toast-"
    +
    type;


  toast.textContent =
    message;


  container.appendChild(
    toast
  );


  requestAnimationFrame(
    function () {

      toast.classList.add(
        "show"
      );

    }
  );


  setTimeout(
    function () {

      toast.classList.remove(
        "show"
      );


      setTimeout(
        function () {

          toast.remove();

        },
        300
      );

    },
    4500
  );

}



/* ============================================================
   EMPTY STATE
============================================================ */

function emptyStateEAH(
  title,
  text
) {

  return `
    <div class="eah-runtime-empty">

      <strong>
        ${escapeHtmlEAH(
          title
        )}
      </strong>

      ${
        text
        ?
        `
          <p>
            ${escapeHtmlEAH(
              text
            )}
          </p>
        `
        :
        ""
      }

    </div>
  `;

}



/* ============================================================
   INITIALS
============================================================ */

function initialsEAH(
  value
) {

  return String(
    value ||
    ""
  )
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(
    function (word) {

      return word[0];

    }
  )
  .join("")
  .toUpperCase();

}



/* ============================================================
   SECURITE AFFICHAGE HTML
============================================================ */

function escapeHtmlEAH(
  value
) {

  return String(
    value === null ||
    typeof value ===
      "undefined"
    ?
    ""
    :
    value
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


function escapeAttrEAH(
  value
) {

  return escapeHtmlEAH(
    value
  );

}


function escapeJsEAH(
  value
) {

  return String(
    value ||
    ""
  )
  .replace(
    /\\/g,
    "\\\\"
  )
  .replace(
    /'/g,
    "\\'"
  )
  .replace(
    /\r/g,
    ""
  )
  .replace(
    /\n/g,
    "\\n"
  );

}



/* ============================================================
   FORMAT DATE
============================================================ */

function formatDateEAH(
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

    return "";

  }


  return new Intl
    .DateTimeFormat(
      "fr-FR",
      {

        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "numeric"

      }
    )
    .format(
      date
    );

}



/* ============================================================
   PETITE COUCHE VISUELLE AUTOMATIQUE

   Elle complète ton style.css sans modifier
   ton design principal.
============================================================ */

(function injectRuntimeStylesEAH() {

  if (
    document.getElementById(
      "eah-runtime-styles"
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "eah-runtime-styles";


  style.textContent = `

    :root {
      --club-primary: #0b6bff;
      --club-secondary: #03131f;
    }


    .eah-runtime-card {
      position: relative;
      display: flex;
      gap: 18px;
      align-items: center;
      padding: 20px;
      border: 1px solid rgba(143,205,255,.18);
      border-radius: 22px;
      background: rgba(5,23,42,.72);
      backdrop-filter: blur(18px);
      box-shadow: 0 20px 60px rgba(0,0,0,.16);
    }


    .eah-runtime-card-content {
      flex: 1;
      min-width: 0;
    }


    .eah-runtime-card h3 {
      margin: 5px 0 7px;
    }


    .eah-runtime-card p {
      margin: 0;
      opacity: .78;
    }


    .eah-runtime-kicker {
      display: block;
      font-size: .72rem;
      font-weight: 800;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--cyan, #30cfff);
    }


    .eah-runtime-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: 12px;
    }


    .eah-runtime-tag {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 5px 10px;
      border: 1px solid rgba(48,207,255,.22);
      border-radius: 999px;
      background: rgba(48,207,255,.08);
      font-size: .78rem;
    }


    .eah-runtime-button,
    .eah-runtime-link {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      min-height: 42px;
      padding: 10px 16px;
      border: 0;
      border-radius: 14px;
      background: var(--club-primary);
      color: #fff;
      font: inherit;
      font-weight: 800;
      text-decoration: none;
      cursor: pointer;
    }


    .eah-runtime-button:disabled {
      opacity: .5;
      cursor: wait;
    }


    .eah-diver-photo {
      width: 58px;
      height: 58px;
      flex: 0 0 58px;
      object-fit: cover;
      border-radius: 18px;
    }


    .eah-diver-photo-empty {
      display: grid;
      place-items: center;
      background: linear-gradient(
        145deg,
        var(--club-primary),
        var(--club-secondary)
      );
      color: #fff;
      font-weight: 900;
    }


    .eah-runtime-score {
      min-width: 72px;
      font-size: 1.75rem;
      font-weight: 900;
      text-align: center;
      color: var(--cyan, #30cfff);
    }


    .eah-runtime-score small {
      display: block;
      font-size: .65rem;
      opacity: .65;
    }


    .eah-runtime-price {
      margin: 15px 0;
      font-size: 2rem;
      font-weight: 900;
    }


    .eah-news-image {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      border-radius: 16px;
    }


    .eah-news-card,
    .eah-spot-card,
    .eah-pricing-card,
    .eah-blazon-card {
      flex-direction: column;
      align-items: stretch;
    }


    .eah-blazon-card img {
      width: 140px;
      height: 140px;
      margin: auto;
      object-fit: contain;
    }


    .eah-blazon-card h3 {
      text-align: center;
    }


    .eah-runtime-empty {
      padding: 28px;
      border: 1px dashed rgba(143,205,255,.25);
      border-radius: 20px;
      text-align: center;
      opacity: .72;
    }


    .eah-runtime-empty p {
      margin: 8px 0 0;
    }


    .eah-profile-runtime-card {
      padding: 30px;
      border: 1px solid rgba(143,205,255,.2);
      border-radius: 28px;
      background: rgba(5,23,42,.8);
      text-align: center;
    }


    .eah-profile-runtime-photo {
      width: 110px;
      height: 110px;
      margin-bottom: 18px;
      border-radius: 30px;
      object-fit: cover;
    }


    .eah-toast-container {
      position: fixed;
      z-index: 99999;
      right: 18px;
      bottom: 18px;
      display: grid;
      gap: 10px;
      max-width: min(390px, calc(100vw - 36px));
    }


    .eah-toast {
      transform: translateY(15px);
      opacity: 0;
      padding: 14px 18px;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 16px;
      background: #061e33;
      color: #fff;
      box-shadow: 0 20px 60px rgba(0,0,0,.35);
      transition: .25s ease;
    }


    .eah-toast.show {
      transform: translateY(0);
      opacity: 1;
    }


    .eah-toast-success {
      border-color: rgba(24,185,120,.55);
    }


    .eah-toast-error {
      border-color: rgba(224,82,94,.65);
    }


    @media (max-width: 720px) {

      .eah-runtime-card {
        align-items: flex-start;
      }


      .eah-diver-card,
      .eah-evaluation-card {
        flex-wrap: wrap;
      }


      .eah-runtime-button,
      .eah-runtime-link {
        width: 100%;
      }

    }

  `;


  document.head.appendChild(
    style
  );

})();
/* ============================================================
   EAH DIVING PRO
   ACTIVATION NFC / PROFIL
   FRONTEND
============================================================ */


/* ============================================================
   REMPLACE LA GESTION PROFIL PRECEDENTE
============================================================ */

async function loadProfileFromUrlEAH() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const club =
    String(
      params.get("club") ||
      EAH_STATE.clubSlug ||
      ""
    )
    .trim()
    .toLowerCase();


  const eahId =
    String(
      params.get("id") ||
      ""
    )
    .trim()
    .toUpperCase();


  const token =
    String(
      params.get("token") ||
      ""
    )
    .trim();


  if (
    !club ||
    !eahId ||
    !token
  ) {

    return;

  }


  try {

    const result =
      await apiGetEAH(

        "profile",

        {

          club:
            club,

          id:
            eahId,

          token:
            token

        }

      );


    EAH_STATE.profile =
      result;


    /* ======================================================
       CARTE VIERGE
    ====================================================== */

    if (
      result.assigned ===
      false
    ) {

      afficherActivationCarteEAH(

        club,

        eahId,

        token,

        result

      );


      return;

    }


    /* ======================================================
       PROFIL EXISTANT
    ====================================================== */

    cacherActivationCarteEAH();


    renderProfileEAH(
      result
    );


    renderProfileHistoryEAH(
      result
    );


  } catch(error) {

    console.error(
      error
    );


    showToastEAH(

      "Impossible d'ouvrir la carte : "
      +
      error.message,

      "error"

    );

  }

}



/* ============================================================
   AFFICHER LE FORMULAIRE D'ACTIVATION
============================================================ */

function afficherActivationCarteEAH(
  club,
  eahId,
  token,
  result
) {

  const block =
    eahEl(
      "eah-card-activation"
    );


  if (!block) {

    return;

  }


  block.hidden =
    false;


  setTextEAH(
    "eah-activation-id",
    eahId
  );


  const clubInput =
    eahEl(
      "eah-activation-club"
    );


  const idInput =
    eahEl(
      "eah-activation-eah-id"
    );


  const tokenInput =
    eahEl(
      "eah-activation-token"
    );


  if (
    clubInput
  ) {

    clubInput.value =
      club;

  }


  if (
    idInput
  ) {

    idInput.value =
      eahId;

  }


  if (
    tokenInput
  ) {

    tokenInput.value =
      token;

  }


  remplirGroupesActivationEAH();


  block.scrollIntoView({

    behavior:
      "smooth",

    block:
      "start"

  });


  if (
    result &&
    result.club
  ) {

    EAH_STATE.club =
      result.club;


    applyClubBrandEAH();

  }

}



/* ============================================================
   CACHER ACTIVATION
============================================================ */

function cacherActivationCarteEAH() {

  const block =
    eahEl(
      "eah-card-activation"
    );


  if (
    block
  ) {

    block.hidden =
      true;

  }

}



/* ============================================================
   GROUPES DU CLUB
============================================================ */

function remplirGroupesActivationEAH() {

  const select =
    eahEl(
      "eah-activation-group"
    );


  if (!select) {

    return;

  }


  const groups =
    Array.isArray(
      EAH_STATE.groups
    )
    ?
    EAH_STATE.groups
    :
    [];


  select.innerHTML =
    `
      <option value="">
        Sans groupe
      </option>
    `
    +
    groups.map(
      function(group) {

        const name =
          String(
            group.name || ""
          );


        return `
          <option
            value="${escapeAttrEAH(
              name
            )}"
          >
            ${escapeHtmlEAH(
              name
            )}
          </option>
        `;

      }
    )
    .join("");

}



/* ============================================================
   INITIALISER ACTIVATION
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    const form =
      eahEl(
        "eah-card-activation-form"
      );


    if (
      form
    ) {

      form.addEventListener(
        "submit",
        submitActivationCarteEAH
      );

    }


    const photo =
      eahEl(
        "eah-activation-photo"
      );


    if (
      photo
    ) {

      photo.addEventListener(
        "change",
        previewPhotoActivationEAH
      );

    }

  }
);



/* ============================================================
   PREVIEW PHOTO
============================================================ */

async function previewPhotoActivationEAH(
  event
) {

  const file =
    event.target.files &&
    event.target.files[0];


  const preview =
    eahEl(
      "eah-activation-photo-preview"
    );


  if (
    !file ||
    !preview
  ) {

    return;

  }


  try {

    const dataUrl =
      await compresserPhotoEAH(
        file
      );


    preview.innerHTML =
      `
        <img
          src="${dataUrl}"
          alt=""
          style="
            width:120px;
            height:120px;
            object-fit:cover;
            border-radius:24px;
          "
        >
      `;


    preview.style.display =
      "block";


  } catch(error) {

    showToastEAH(

      "Impossible de lire la photo.",

      "error"

    );

  }

}



/* ============================================================
   COMPRESSER PHOTO
============================================================ */

function compresserPhotoEAH(
  file
) {

  return new Promise(
    function(
      resolve,
      reject
    ) {

      if (!file) {

        resolve(
          ""
        );

        return;

      }


      const reader =
        new FileReader();


      reader.onerror =
        function() {

          reject(
            new Error(
              "Lecture photo impossible."
            )
          );

        };


      reader.onload =
        function() {

          const image =
            new Image();


          image.onerror =
            function() {

              reject(
                new Error(
                  "Image invalide."
                )
              );

          };


          image.onload =
            function() {

              const max =
                800;


              let width =
                image.width;


              let height =
                image.height;


              if (
                width > height
                &&
                width > max
              ) {

                height =
                  Math.round(
                    height
                    *
                    max
                    /
                    width
                  );


                width =
                  max;

              }


              if (
                height >= width
                &&
                height > max
              ) {

                width =
                  Math.round(
                    width
                    *
                    max
                    /
                    height
                  );


                height =
                  max;

              }


              const canvas =
                document.createElement(
                  "canvas"
                );


              canvas.width =
                width;


              canvas.height =
                height;


              const ctx =
                canvas.getContext(
                  "2d"
                );


              ctx.drawImage(

                image,

                0,
                0,
                width,
                height

              );


              resolve(

                canvas.toDataURL(
                  "image/jpeg",
                  0.76
                )

              );

            };


          image.src =
            reader.result;

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}



/* ============================================================
   ACTIVER CARTE
============================================================ */

async function submitActivationCarteEAH(
  event
) {

  event.preventDefault();


  const form =
    event.currentTarget;


  const button =
    form.querySelector(
      '[type="submit"]'
    );


  const data =
    formDataObjectEAH(
      form
    );


  if (
    data.pin !==
    data.pinConfirm
  ) {

    showToastEAH(

      "Les deux PIN ne correspondent pas.",

      "error"

    );


    return;

  }


  if (
    !/^[0-9]{4,8}$/.test(
      String(
        data.pin || ""
      )
    )
  ) {

    showToastEAH(

      "Le PIN doit contenir entre 4 et 8 chiffres.",

      "error"

    );


    return;

  }


  const photoInput =
    eahEl(
      "eah-activation-photo"
    );


  let photoDataUrl =
    "";


  if (
    photoInput &&
    photoInput.files &&
    photoInput.files[0]
  ) {

    setButtonLoadingEAH(

      button,

      true,

      "Préparation de la photo…"

    );


    try {

      photoDataUrl =
        await compresserPhotoEAH(

          photoInput.files[0]

        );

    } catch(error) {

      setButtonLoadingEAH(
        button,
        false
      );


      showToastEAH(

        "Impossible de préparer la photo.",

        "error"

      );


      return;

    }

  }


  delete data.pinConfirm;


  data.photoDataUrl =
    photoDataUrl;


  setButtonLoadingEAH(

    button,

    true,

    "Activation du profil…"

  );


  try {

    const result =
      await apiPostEAH(

        "setupProfile",

        data

      );


    EAH_STATE.profile =
      result;


    cacherActivationCarteEAH();


    renderProfileEAH(
      result
    );


    renderProfileHistoryEAH(
      result
    );


    showToastEAH(

      "Profil EAH activé avec succès.",

      "success"

    );


    if (
      EAH_STATE.clubSlug
    ) {

      try {

        await loadClubWorkspaceEAH(

          EAH_STATE.clubSlug

        );

      } catch (_) {}

    }


  } catch(error) {

    console.error(
      error
    );


    showToastEAH(

      "Activation impossible : "
      +
      error.message,

      "error"

    );


  } finally {

    setButtonLoadingEAH(
      button,
      false
    );

  }

}



/* ============================================================
   HISTORIQUE DU PROFIL
============================================================ */

function renderProfileHistoryEAH(
  result
) {

  const container =
    eahEl(
      "eah-profile-history"
    );


  if (!container) {

    return;

  }


  const evaluations =
    result.evaluations ||
    [];


  const blazons =
    result.blazons ||
    [];


  let html = "";


  /* ========================================================
     BLAZONS
  ======================================================== */

  if (
    blazons.length
  ) {

    html += `

      <article class="eah-runtime-card">

        <div class="eah-runtime-card-content">

          <span class="eah-runtime-kicker">
            PROGRESSION
          </span>

          <h3>
            Blazons
          </h3>

          <div class="eah-runtime-tags">

            ${

              blazons.map(
                function(blazon) {

                  return `

                    <span class="eah-runtime-tag">

                      ${escapeHtmlEAH(
                        blazon.name ||
                        blazon.key
                      )}

                      —

                      ${Number(
                        blazon.progress ||
                        0
                      )}%

                    </span>

                  `;

                }
              )
              .join("")

            }

          </div>

        </div>

      </article>

    `;

  }


  /* ========================================================
     EVALUATIONS
  ======================================================== */

  if (
    evaluations.length
  ) {

    evaluations.forEach(
      function(evaluation) {

        html += `

          <article class="eah-runtime-card">

            <div class="eah-runtime-card-content">

              <span class="eah-runtime-kicker">

                ${escapeHtmlEAH(
                  formatDateEAH(
                    evaluation.date
                  )
                )}

              </span>

              <h3>

                ${escapeHtmlEAH(
                  evaluation.code ||
                  "Plongeon"
                )}

              </h3>

              <p>

                ${Number(
                  evaluation.height ||
                  0
                )} m

                •

                EAH

                ${escapeHtmlEAH(
                  String(
                    evaluation.eahScore ??
                    "—"
                  )
                )}/10

              </p>

              <div class="eah-runtime-tags">

                <span class="eah-runtime-tag">
                  Takeoff
                  ${escapeHtmlEAH(
                    String(
                      evaluation.takeoff ??
                      "—"
                    )
                  )}
                </span>

                <span class="eah-runtime-tag">
                  Trick
                  ${escapeHtmlEAH(
                    String(
                      evaluation.trick ??
                      "—"
                    )
                  )}
                </span>

                <span class="eah-runtime-tag">
                  Entry
                  ${escapeHtmlEAH(
                    String(
                      evaluation.entry ??
                      "—"
                    )
                  )}
                </span>

              </div>

            </div>

            ${
              evaluation.reportUrl
              ?
              `

                <a
                  href="${escapeAttrEAH(
                    evaluation.reportUrl
                  )}"
                  target="_blank"
                  rel="noopener"
                  class="eah-runtime-link"
                >
                  Grade Report
                </a>

              `
              :
              ""
            }

          </article>

        `;

      }
    );

  }


  if (!html) {

    html =
      emptyStateEAH(

        "Profil activé",

        "Aucune évaluation enregistrée pour le moment."

      );

  }


  container.innerHTML =
    html;

}
/* ============================================================
   EAH DIVING PRO
   PROFIL PERSONNEL PREMIUM
   + INTERCEPTION CONNEXION PIN
============================================================ */


/* ============================================================
   NORMALISER PHOTO GOOGLE DRIVE
============================================================ */

function photoProfilEAH(url) {

  url =
    String(
      url || ""
    )
    .trim();


  if (!url) {

    return "";

  }


  let match =
    url.match(
      /[?&]id=([^&]+)/
    );


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
      "&sz=w1000"
    );

  }


  match =
    url.match(
      /\/d\/([^\/]+)/
    );


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
      "&sz=w1000"
    );

  }


  return url;

}



/* ============================================================
   NOUVEAU RENDER PROFIL
============================================================ */

function renderProfileWelcomeEAH(
  result
) {

  const container =
    eahEl(
      "eah-profile-runtime"
    );


  if (!container) {

    return;

  }


  const profile =
    result.profile ||
    result.diver ||
    result;


  const firstName =
    String(
      profile.firstName ||
      profile.first_name ||
      ""
    )
    .trim();


  const lastName =
    String(
      profile.lastName ||
      profile.last_name ||
      ""
    )
    .trim();


  const fullName =
    (
      firstName
      +
      " "
      +
      lastName
    )
    .trim()
    ||
    profile.eahId
    ||
    profile.eah_id
    ||
    "Plongeur";


  const eahId =
    profile.eahId ||
    profile.eah_id ||
    "";


  const group =
    profile.group ||
    profile.group_name ||
    "";


  const blazon =
    profile.currentBlazon ||
    profile.current_blazon ||
    "";


  const rawPhoto =
    profile.photoUrl ||
    profile.photo_url ||
    "";


  const photo =
    photoProfilEAH(
      rawPhoto
    );


  const initials =
    initialsEAH(
      fullName
    );


  const evaluations =
    result.evaluations ||
    [];


  container.innerHTML = `

    <article class="eah-personal-profile">

      <div class="eah-personal-profile-glow"></div>

      <div class="eah-personal-profile-main">

        <div class="eah-personal-photo-wrap">

          ${
            photo
            ?
            `
              <img
                class="eah-personal-photo"
                src="${escapeAttrEAH(
                  photo
                )}"
                alt="${escapeAttrEAH(
                  fullName
                )}"
                onerror="
                  this.style.display='none';
                  this.nextElementSibling.style.display='grid';
                "
              >
            `
            :
            ""
          }

          <div
            class="eah-personal-photo-fallback"
            style="${
              photo
              ?
              "display:none"
              :
              "display:grid"
            }"
          >
            ${escapeHtmlEAH(
              initials
            )}
          </div>

        </div>


        <div class="eah-personal-identity">

          <span class="eah-personal-kicker">
            ESPACE PERSONNEL EAH
          </span>

          <h1>

            Bienvenue
            ${escapeHtmlEAH(
              firstName ||
              fullName
            )}
            sur ton espace personnel

          </h1>

          <p class="eah-personal-name">
            ${escapeHtmlEAH(
              fullName
            )}
          </p>


          <div class="eah-personal-meta">

            <span>
              ${escapeHtmlEAH(
                eahId
              )}
            </span>

            ${
              group
              ?
              `
                <span>
                  ${escapeHtmlEAH(
                    group
                  )}
                </span>
              `
              :
              ""
            }

            ${
              blazon
              ?
              `
                <span>
                  ${escapeHtmlEAH(
                    blazon
                  )}
                </span>
              `
              :
              ""
            }

          </div>

        </div>

      </div>


      <div class="eah-personal-stats">

        <div>

          <span>
            ÉVALUATIONS
          </span>

          <strong>
            ${evaluations.length}
          </strong>

        </div>


        <div>

          <span>
            BLAZON ACTUEL
          </span>

          <strong>
            ${escapeHtmlEAH(
              blazon ||
              "—"
            )}
          </strong>

        </div>


        <div>

          <span>
            NUMÉRO EAH
          </span>

          <strong class="eah-personal-id">
            ${escapeHtmlEAH(
              eahId
            )}
          </strong>

        </div>

      </div>

    </article>

  `;


  container.hidden =
    false;


  /*
    Lorsqu'une carte est scannée,
    le profil remonte en haut de la page.
  */

  const profileSection =
    eahEl(
      "eah-profile-section"
    );


  if (
    profileSection
  ) {

    const header =
      document.querySelector(
        "header"
      );


    if (
      header &&
      header.nextSibling !==
        profileSection
    ) {

      header.parentNode
        .insertBefore(

          profileSection,

          header.nextSibling

        );

    }


    profileSection.scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

  }

}



/* ============================================================
   UTILISER CE NOUVEAU RENDER
============================================================ */

renderProfileEAH =
  renderProfileWelcomeEAH;



/* ============================================================
   CACHER L'ANCIEN BLOC CONNEXION
   LORS D'UN SCAN NFC
============================================================ */

function modeScanCarteEAH() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const hasCard =
    Boolean(
      params.get("id")
      &&
      params.get("token")
    );


  if (!hasCard) {

    return;

  }


  /*
    Cherche l'ancien bloc qui contient
    "Connexion coach" + "Ouvrir mon profil"
    et le masque uniquement lors d'un scan.
  */

  const sections =
    Array.from(
      document.querySelectorAll(
        "section"
      )
    );


  sections.forEach(
    function(section) {

      const text =
        String(
          section.textContent ||
          ""
        );


      if (
        text.indexOf(
          "Connexion coach"
        )
        >= 0
        &&
        text.indexOf(
          "Ouvrir mon profil"
        )
        >= 0
      ) {

        section.style.display =
          "none";

      }

    }
  );

}



/* ============================================================
   CONNEXION PAR EAH ID + PIN
   INTERCEPTE L'ANCIEN FORMULAIRE
============================================================ */

document.addEventListener(

  "submit",

  async function(event) {

    const form =
      event.target;


    if (
      !(form instanceof HTMLFormElement)
    ) {

      return;

    }


    const section =
      form.closest(
        "section"
      )
      ||
      form.parentElement;


    const text =
      String(
        section
        ?
        section.textContent ||
        ""
        :
        ""
      );


    /*
      Ne prendre que le formulaire
      "Ouvrir mon profil".
    */

    if (
      text.indexOf(
        "Ouvrir mon profil"
      )
      <
      0
    ) {

      return;

    }


    const passwordInput =
      form.querySelector(
        'input[type="password"]'
      );


    if (!passwordInput) {

      return;

    }


    const inputs =
      Array.from(
        form.querySelectorAll(
          "input"
        )
      );


    const eahInput =
      inputs.find(
        function(input) {

          const value =
            String(
              input.value ||
              ""
            )
            .toUpperCase();


          return (
            value.indexOf(
              "EAH-"
            )
            ===
            0
          );

        }
      )
      ||
      form.querySelector(
        'input[type="text"]'
      );


    if (!eahInput) {

      return;

    }


    /*
      Capture du formulaire avant l'ancien script.
    */

    event.preventDefault();

    event.stopImmediatePropagation();


    const eahId =
      String(
        eahInput.value ||
        ""
      )
      .trim()
      .toUpperCase();


    const pin =
      String(
        passwordInput.value ||
        ""
      )
      .trim();


    const params =
      new URLSearchParams(
        window.location.search
      );


    const club =
      String(
        params.get("club")
        ||
        EAH_STATE.clubSlug
        ||
        localStorage.getItem(
          "EAH_CLUB"
        )
        ||
        ""
      )
      .trim()
      .toLowerCase();


    const submitButton =
      form.querySelector(
        '[type="submit"]'
      );


    setButtonLoadingEAH(

      submitButton,

      true,

      "Ouverture du profil…"

    );


    try {

      const result =
        await apiPostEAH(

          "diverQuickLogin",

          {

            club:
              club,

            eahId:
              eahId,

            pin:
              pin

          }

        );


      EAH_STATE.profile =
        result;


      renderProfileWelcomeEAH(
        result
      );


      renderProfileHistoryEAH(
        result
      );


      showToastEAH(

        "Profil ouvert.",

        "success"

      );


    } catch(error) {

      showToastEAH(

        error.message,

        "error"

      );


    } finally {

      setButtonLoadingEAH(

        submitButton,

        false

      );

    }

  },

  true

);



/* ============================================================
   DEMARRAGE MODE SCAN
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  modeScanCarteEAH
);



/* ============================================================
   STYLE PROFIL PREMIUM
============================================================ */

(function styleProfilPersonnelEAH() {

  if (
    document.getElementById(
      "eah-personal-profile-style"
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "eah-personal-profile-style";


  style.textContent = `

    .eah-personal-profile {
      position: relative;
      overflow: hidden;
      padding: clamp(28px, 5vw, 58px);
      border: 1px solid rgba(143,205,255,.23);
      border-radius: 34px;
      background:
        linear-gradient(
          135deg,
          rgba(4,22,47,.96),
          rgba(4,40,76,.88)
        );
      box-shadow:
        0 35px 110px rgba(0,0,0,.38);
    }


    .eah-personal-profile-glow {
      position: absolute;
      width: 420px;
      height: 420px;
      right: -180px;
      top: -220px;
      border-radius: 50%;
      background: rgba(48,207,255,.12);
      filter: blur(25px);
      pointer-events: none;
    }


    .eah-personal-profile-main {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: clamp(24px, 5vw, 55px);
    }


    .eah-personal-photo-wrap {
      width: clamp(150px, 20vw, 230px);
      height: clamp(150px, 20vw, 230px);
      flex: 0 0 auto;
      padding: 6px;
      border-radius: 34px;
      background:
        linear-gradient(
          145deg,
          #30cfff,
          #0b6bff,
          rgba(255,255,255,.9)
        );
      box-shadow:
        0 24px 70px rgba(11,107,255,.22);
    }


    .eah-personal-photo,
    .eah-personal-photo-fallback {
      width: 100%;
      height: 100%;
      border-radius: 28px;
    }


    .eah-personal-photo {
      object-fit: cover;
      background: #061e33;
    }


    .eah-personal-photo-fallback {
      place-items: center;
      background:
        linear-gradient(
          145deg,
          #0b6bff,
          #061e33
        );
      color: #fff;
      font-size: 3rem;
      font-weight: 900;
    }


    .eah-personal-identity {
      position: relative;
      z-index: 1;
      flex: 1;
      min-width: 0;
    }


    .eah-personal-kicker {
      color: #30cfff;
      font-size: .78rem;
      font-weight: 900;
      letter-spacing: .16em;
    }


    .eah-personal-identity h1 {
      max-width: 800px;
      margin: 10px 0 12px;
      color: #f5f9ff;
      font-size:
        clamp(
          2rem,
          5vw,
          4.2rem
        );
      line-height: 1.03;
    }


    .eah-personal-name {
      margin: 0;
      color: rgba(245,249,255,.74);
      font-size: 1.2rem;
    }


    .eah-personal-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      margin-top: 22px;
    }


    .eah-personal-meta span {
      padding: 8px 13px;
      border: 1px solid rgba(48,207,255,.22);
      border-radius: 999px;
      background: rgba(48,207,255,.07);
    }


    .eah-personal-stats {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns:
        repeat(
          3,
          minmax(0,1fr)
        );
      gap: 12px;
      margin-top: 35px;
    }


    .eah-personal-stats > div {
      padding: 18px;
      border: 1px solid rgba(143,205,255,.15);
      border-radius: 20px;
      background: rgba(3,19,31,.45);
    }


    .eah-personal-stats span {
      display: block;
      margin-bottom: 8px;
      color: #8fa8bc;
      font-size: .72rem;
      font-weight: 800;
      letter-spacing: .08em;
    }


    .eah-personal-stats strong {
      color: #fff;
      font-size: 1.3rem;
    }


    .eah-personal-id {
      font-size: .95rem !important;
    }


    @media (max-width: 720px) {

      .eah-personal-profile-main {
        display: grid;
        text-align: center;
      }


      .eah-personal-photo-wrap {
        margin: auto;
      }


      .eah-personal-meta {
        justify-content: center;
      }


      .eah-personal-stats {
        grid-template-columns: 1fr;
      }

    }

  `;


  document.head.appendChild(
    style
  );

})();
