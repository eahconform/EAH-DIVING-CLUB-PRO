'use strict';


/* ============================================================
   EAH DIVING PRO
   EAH-V3.JS
   VERSION 05/10/2026

   Correctifs sans modifier le gros script.js :
   - Population optimisée
   - Pagination plongeurs
   - Pagination gradings
   - Profil public Supabase
   - Conservation connexion PIN plongeur
   - Nombre total réel Grade Reports dashboard
============================================================ */

(() => {

  const PAGE_SIZE =
    25;


  const populationState = {

    code:
      '',

    diversPage:
      0,

    gradingsPage:
      0,

    stats:
      null

  };


  /* ==========================================================
     OUTILS
  ========================================================== */

  function safeUrl(
    value
  ) {

    const raw =
      String(
        value ||
        ''
      )
      .trim();


    if (!raw) {

      return '';

    }


    try {

      const url =
        new URL(
          raw,
          window.location.href
        );


      if (
        url.protocol !==
          'https:'
        &&
        url.protocol !==
          'http:'
      ) {

        return '';

      }


      return url.href;


    } catch (_) {

      return '';

    }

  }



  function profileUrl(
    item
  ) {

    if (
      !item ||
      !item.eah_id
    ) {

      return '';

    }


    const url =
      new URL(
        window.location.href
      );


    url.search = '';


    if (
      item.club_slug
    ) {

      url.searchParams.set(

        'club',

        item.club_slug

      );

    }


    url.searchParams.set(

      'id',

      item.eah_id

    );


    url.hash =
      'profil';


    return url.toString();

  }



  function formatPopulationDate(
    value
  ) {

    if (!value) {

      return '';

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

      return '';

    }


    return date.toLocaleDateString(

      'fr-FR',

      {

        day:
          '2-digit',

        month:
          '2-digit',

        year:
          'numeric'

      }

    );

  }



  /* ==========================================================
     SESSION PIN PLONGEUR
  ========================================================== */

  function installDiverPinCapture() {

    const form =
      document.getElementById(
        'diverLoginForm'
      );


    if (
      !form ||
      form.dataset.eahV3PinCapture ===
        '1'
    ) {

      return;

    }


    form.dataset.eahV3PinCapture =
      '1';


    form.addEventListener(

      'submit',

      async () => {

        const eahId =
          String(
            document
              .getElementById(
                'diverEahId'
              )
              ?.value
            ||
            ''
          )
          .trim()
          .toUpperCase();


        const pin =
          String(
            document
              .getElementById(
                'diverPin'
              )
              ?.value
            ||
            ''
          )
          .trim();


        if (
          !eahId ||
          !pin
        ) {

          return;

        }


        try {

          sessionStorage.setItem(

            'EAH_DIVER_PIN_PENDING',

            eahId

          );

        } catch (_) {}


        try {

          let hash =
            '';


          if (
            typeof eahFastSha256 ===
            'function'
          ) {

            hash =
              await eahFastSha256(
                pin
              );

          } else {

            const bytes =
              new TextEncoder()
                .encode(
                  pin
                );


            const digest =
              await crypto.subtle
                .digest(
                  'SHA-256',
                  bytes
                );


            hash =
              Array
                .from(
                  new Uint8Array(
                    digest
                  )
                )
                .map(
                  byte =>
                    byte
                      .toString(16)
                      .padStart(
                        2,
                        '0'
                      )
                )
                .join('');

          }


          try {

            if (
              typeof state !==
              'undefined'
            ) {

              state.diverPinHash =
                hash;

            }

          } catch (_) {}


          try {

            sessionStorage.setItem(

              'EAH_DIVER_PIN_SESSION',

              JSON.stringify({

                eahId:
                  eahId,

                clubSlug:

                  typeof CLUB_SLUG !==
                    'undefined'

                  ?

                  CLUB_SLUG

                  :

                  '',

                pinHash:
                  hash

              })

            );

          } catch (_) {}


        } catch (
          error
        ) {

          console.warn(
            'EAH PIN HASH:',
            error
          );


        } finally {

          try {

            sessionStorage.removeItem(
              'EAH_DIVER_PIN_PENDING'
            );

          } catch (_) {}


          window.dispatchEvent(

            new CustomEvent(
              'eah-diver-pin-ready'
            )

          );

        }

      },

      true

    );

  }



  /* ==========================================================
     PROFIL PUBLIC
  ========================================================== */

  async function loadPublicProfileV3(
    eahId
  ) {

    if (
      !eahId
    ) {

      return;

    }


    try {

      if (
        typeof setProfileLoading ===
        'function'
      ) {

        setProfileLoading();

      }


      const sb =
        requireSupabase();


      const {
        data,
        error
      } =
        await sb.rpc(

          'eah_public_profile_v3',

          {

            p_eah_id:
              String(
                eahId
              )
              .trim()
              .toUpperCase(),

            p_club_slug:

              typeof CLUB_SLUG !==
                'undefined'

              ?

              (
                CLUB_SLUG ||
                null
              )

              :

              null

          }

        );


      if (error) {

        throw error;

      }


      if (
        !data ||
        data.ok ===
          false
      ) {

        throw new Error(

          data?.error ||
          'Profil public introuvable ou privé.'

        );

      }


      const p =
        data.profile ||
        {};


      try {

        state.profile = {

          eahId:
            p.eahId ||
            eahId,

          firstName:
            p.firstName ||
            '',

          lastName:
            p.lastName ||
            '',

          photoUrl:
            p.photoUrl ||
            '',

          group:
            p.group ||
            '',

          sex:
            p.sex ||
            '',

          currentBlazon:
            p.currentBlazon ||
            '',

          club:
            p.clubName ||
            'EAH Diving',

          clubSlug:
            p.clubSlug ||
            '',

          cardStatus:
            '',

          publicAccess:
            true

        };


        state.profileHistory = {

          evaluations:
            data.evaluations ||
            [],

          blazons:
            data.blazons ||
            []

        };


        renderProfileSummary(

          state.profile,

          false

        );


        renderProfileHistory(

          state.profileHistory

        );


      } catch (
        error
      ) {

        throw error;

      }


    } catch (
      error
    ) {

      console.error(
        'EAH PUBLIC PROFILE V3:',
        error
      );


      if (
        typeof renderProfileError ===
        'function'
      ) {

        renderProfileError(

          error?.message ||
          'Profil public introuvable ou privé.'

        );

      }

    }

  }



  /* ==========================================================
     POPULATION — STATS
  ========================================================== */

  function renderPopulationStatsV3(
    box,
    result
  ) {

    const people =
      Number(
        result?.people ??
        0
      );


    const count =
      Number(
        result?.count ??
        0
      );


    const avgEah =
      result?.avg_eah ??
      null;


    const avgWa =
      result?.avg_wa ??
      null;


    populationState.stats = {

      people,

      count,

      avg_eah:
        avgEah,

      avg_wa:
        avgWa

    };


    box.innerHTML = `

      <div class="population-stats">


        <div
          class="stat-card eah-v3-population-clickable"
          id="eahV3DiversCard"
          role="button"
          tabindex="0"
        >

          <strong>
            ${esc(people)}
          </strong>

          <span>
            Plongeurs EAH
          </span>

          <small
            style="
              display:block;
              margin-top:8px;
              opacity:.65;
            "
          >
            Voir les profils publics
          </small>

        </div>


        <div
          class="stat-card eah-v3-population-clickable"
          id="eahV3GradingsCard"
          role="button"
          tabindex="0"
        >

          <strong>
            ${esc(count)}
          </strong>

          <span>
            Gradings
          </span>

          <small
            style="
              display:block;
              margin-top:8px;
              opacity:.65;
            "
          >
            Voir les gradings publics
          </small>

        </div>


        <div class="stat-card">

          <strong>

            ${esc(
              fmtNumber(
                avgEah
              )
            )}

          </strong>

          <span>
            Moyenne EAH
          </span>

        </div>


        <div class="stat-card">

          <strong>

            ${esc(
              fmtNumber(
                avgWa
              )
            )}

          </strong>

          <span>
            Moyenne WA
          </span>

        </div>


      </div>

    `;


    const diversCard =
      document.getElementById(
        'eahV3DiversCard'
      );


    const gradingsCard =
      document.getElementById(
        'eahV3GradingsCard'
      );


    diversCard
      ?.addEventListener(

        'click',

        () => {

          loadPopulationDiversV3(
            0
          );

        }

      );


    gradingsCard
      ?.addEventListener(

        'click',

        () => {

          loadPopulationGradingsV3(
            0
          );

        }

      );


    [
      diversCard,
      gradingsCard
    ]
    .filter(
      Boolean
    )
    .forEach(
      card => {

        card.addEventListener(

          'keydown',

          event => {

            if (
              event.key ===
                'Enter'
              ||
              event.key ===
                ' '
            ) {

              event.preventDefault();

              card.click();

            }

          }

        );

      }
    );

  }



  /* ==========================================================
     POPULATION — RECHERCHE
  ========================================================== */

  async function loadPopulationV3() {

    const code =
      normalizeCode(
        val(
          'populationCode'
        )
      );


    const box =
      document.getElementById(
        'populationResults'
      );


    const button =
      document.getElementById(
        'populationSearchButton'
      );


    if (!box) {

      return;

    }


    populationState.code =
      code;


    populationState.diversPage =
      0;


    populationState.gradingsPage =
      0;


    box.innerHTML = `

      <div class="loading-panel">
        Recherche…
      </div>

    `;


    setLoadingButton(

      button,

      true,

      'Recherche…',

      'Rechercher'

    );


    try {

      const {
        data,
        error
      } =
        await requireSupabase()
          .rpc(

            'eah_population_stats_v3',

            {

              p_code:
                code ||
                null,

              p_club_slug:

                typeof CLUB_SLUG !==
                  'undefined'

                ?

                (
                  CLUB_SLUG ||
                  null
                )

                :

                null

            }

          );


      if (error) {

        throw error;

      }


      renderPopulationStatsV3(

        box,

        data ||
        {}

      );


    } catch (
      error
    ) {

      console.error(
        'EAH POPULATION V3:',
        error
      );


      box.innerHTML = `

        <div class="notice error">

          ${esc(
            error?.message ||
            'Impossible de charger Population.'
          )}

        </div>

      `;


    } finally {

      setLoadingButton(

        button,

        false,

        '',

        'Rechercher'

      );

    }

  }



  /* ==========================================================
     POPULATION — PLONGEURS
  ========================================================== */

  async function loadPopulationDiversV3(
    page = 0
  ) {

    page =
      Math.max(
        0,
        Number(
          page
        )
        ||
        0
      );


    populationState.diversPage =
      page;


    const offset =
      page *
      PAGE_SIZE;


    openModal(`

      <div class="modal-inner">

        <span class="overline">
          POPULATION EAH
        </span>

        <h2>
          Plongeurs EAH
        </h2>

        <div class="loading-panel">
          Chargement…
        </div>

      </div>

    `);


    try {

      const {
        data,
        error
      } =
        await requireSupabase()
          .rpc(

            'eah_population_divers_v3',

            {

              p_code:
                populationState.code ||
                null,

              p_club_slug:

                typeof CLUB_SLUG !==
                  'undefined'

                ?

                (
                  CLUB_SLUG ||
                  null
                )

                :

                null,

              p_limit:
                PAGE_SIZE,

              p_offset:
                offset

            }

          );


      if (error) {

        throw error;

      }


      renderPopulationDiversPageV3(

        data ||
        {

          total:
            0,

          items:
            []

        },

        page

      );


    } catch (
      error
    ) {

      openModal(`

        <div class="modal-inner">

          <div class="notice error">

            ${esc(
              error?.message ||
              'Impossible de charger les plongeurs.'
            )}

          </div>

        </div>

      `);

    }

  }



  function renderPopulationDiversPageV3(
    data,
    page
  ) {

    const total =
      Number(
        data?.total ||
        0
      );


    const items =
      Array.isArray(
        data?.items
      )
      ?
      data.items
      :
      [];


    const start =
      total
      ?
      (
        page *
        PAGE_SIZE
      )
      +
      1
      :
      0;


    const end =
      Math.min(

        total,

        (
          page *
          PAGE_SIZE
        )
        +
        items.length

      );


    const hasPrevious =
      page >
      0;


    const hasNext =
      end <
      total;


    let html = `

      <div class="modal-inner">

        <span class="overline">
          POPULATION EAH
        </span>

        <h2>
          Plongeurs EAH
        </h2>

        <p class="muted">

          ${
            total
            ?
            `${esc(start)}–${esc(end)} sur ${esc(total)} profil(s) public(s)`
            :
            'Aucun profil public'
          }

        </p>

    `;


    if (
      populationState.stats?.people >
      total
    ) {

      html += `

        <div class="notice">

          Population totale :

          <strong>
            ${esc(
              populationState.stats.people
            )}
          </strong>

          plongeur(s).

          <br>

          Les profils privés ne sont pas
          affichés nominativement.

        </div>

      `;

    }


    if (
      !items.length
    ) {

      html += `

        <div class="notice">

          Aucun profil public disponible
          pour cette recherche.

        </div>

      `;

    }


    items.forEach(
      diver => {

        const name =
          String(
            diver.display_name
            ||
            diver.eah_id
            ||
            'Plongeur EAH'
          );


        const publicProfileUrl =
          profileUrl(
            diver
          );


        const videoUrl =
          safeUrl(
            diver.video_url
          );


        html += `

          <article
            class="history-item"
            style="
              margin-top:14px;
              align-items:center;
            "
          >

            <div>

              <strong>
                ${esc(name)}
              </strong>

              <br>

              <small class="muted">

                ${esc(
                  diver.eah_id ||
                  ''
                )}

                •

                ${esc(
                  diver.grading_count ||
                  0
                )}

                grading(s)

              </small>

            </div>


            <div
              style="
                display:flex;
                gap:8px;
                flex-wrap:wrap;
                justify-content:flex-end;
              "
            >

              ${
                publicProfileUrl
                ?
                `

                  <a
                    class="button small"
                    href="${esc(publicProfileUrl)}"
                  >
                    Profil
                  </a>

                `
                :
                ''
              }


              ${
                videoUrl
                ?
                `

                  <a
                    class="button small secondary"
                    href="${esc(videoUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vidéo
                  </a>

                `
                :
                ''
              }

            </div>

          </article>

        `;

      }
    );


    html += `

        <div
          style="
            display:flex;
            gap:10px;
            justify-content:space-between;
            margin-top:24px;
          "
        >

          <button
            type="button"
            class="button secondary"
            id="eahV3DiversPrevious"
            ${hasPrevious ? '' : 'disabled'}
          >
            ← Précédent
          </button>


          <button
            type="button"
            class="button"
            id="eahV3DiversNext"
            ${hasNext ? '' : 'disabled'}
          >
            Suivant →
          </button>

        </div>

      </div>

    `;


    openModal(
      html
    );


    document
      .getElementById(
        'eahV3DiversPrevious'
      )
      ?.addEventListener(

        'click',

        () => {

          loadPopulationDiversV3(
            page - 1
          );

        }

      );


    document
      .getElementById(
        'eahV3DiversNext'
      )
      ?.addEventListener(

        'click',

        () => {

          loadPopulationDiversV3(
            page + 1
          );

        }

      );

  }



  /* ==========================================================
     POPULATION — GRADINGS
  ========================================================== */

  async function loadPopulationGradingsV3(
    page = 0
  ) {

    page =
      Math.max(
        0,
        Number(
          page
        )
        ||
        0
      );


    populationState.gradingsPage =
      page;


    const offset =
      page *
      PAGE_SIZE;


    openModal(`

      <div class="modal-inner">

        <span class="overline">
          POPULATION EAH
        </span>

        <h2>
          Gradings
        </h2>

        <div class="loading-panel">
          Chargement…
        </div>

      </div>

    `);


    try {

      const {
        data,
        error
      } =
        await requireSupabase()
          .rpc(

            'eah_population_gradings_v3',

            {

              p_code:
                populationState.code ||
                null,

              p_club_slug:

                typeof CLUB_SLUG !==
                  'undefined'

                ?

                (
                  CLUB_SLUG ||
                  null
                )

                :

                null,

              p_limit:
                PAGE_SIZE,

              p_offset:
                offset

            }

          );


      if (error) {

        throw error;

      }


      renderPopulationGradingsPageV3(

        data ||
        {

          total:
            0,

          items:
            []

        },

        page

      );


    } catch (
      error
    ) {

      openModal(`

        <div class="modal-inner">

          <div class="notice error">

            ${esc(
              error?.message ||
              'Impossible de charger les gradings.'
            )}

          </div>

        </div>

      `);

    }

  }



  function renderPopulationGradingsPageV3(
    data,
    page
  ) {

    const total =
      Number(
        data?.total ||
        0
      );


    const items =
      Array.isArray(
        data?.items
      )
      ?
      data.items
      :
      [];


    const start =
      total
      ?
      (
        page *
        PAGE_SIZE
      )
      +
      1
      :
      0;


    const end =
      Math.min(

        total,

        (
          page *
          PAGE_SIZE
        )
        +
        items.length

      );


    const hasPrevious =
      page >
      0;


    const hasNext =
      end <
      total;


    let html = `

      <div class="modal-inner">

        <span class="overline">
          POPULATION EAH
        </span>

        <h2>
          Gradings
        </h2>

        <p class="muted">

          ${
            total
            ?
            `${esc(start)}–${esc(end)} sur ${esc(total)} grading(s) public(s)`
            :
            'Aucun grading public'
          }

        </p>

    `;


    if (
      populationState.stats?.count >
      total
    ) {

      html += `

        <div class="notice">

          Nombre total de gradings :

          <strong>
            ${esc(
              populationState.stats.count
            )}
          </strong>.

          <br>

          Seuls les gradings associés
          à des profils publics sont
          affichés ici nominativement.

        </div>

      `;

    }


    if (
      !items.length
    ) {

      html += `

        <div class="notice">
          Aucun grading public disponible.
        </div>

      `;

    }


    items.forEach(
      grading => {

        const name =
          grading.display_name
          ||
          grading.eah_id
          ||
          'Plongeur EAH';


        const publicProfileUrl =
          profileUrl(
            grading
          );


        const videoUrl =
          safeUrl(
            grading.video_url
          );


        html += `

          <article
            class="history-item"
            style="
              margin-top:14px;
              align-items:center;
            "
          >

            <div>

              <strong>
                ${esc(name)}
              </strong>

              <br>

              <span>

                ${esc(
                  grading.dive_code ||
                  '—'
                )}

                ${
                  grading.height !==
                    null
                  &&
                  typeof grading.height !==
                    'undefined'
                  ?
                  (
                    ' • '
                    +
                    esc(
                      fmtNumber(
                        grading.height
                      )
                    )
                    +
                    ' m'
                  )
                  :
                  ''
                }

              </span>

              <br>

              <small class="muted">

                ${esc(
                  formatPopulationDate(
                    grading.evaluated_at
                  )
                )}

              </small>

            </div>


            <div
              style="
                text-align:right;
              "
            >

              <strong>

                EAH

                ${esc(
                  fmtNumber(
                    grading.eah_score
                  )
                )}/10

              </strong>

              <br>

              <span>

                WA

                ${esc(
                  fmtNumber(
                    grading.wa_score
                  )
                )}/10

              </span>


              <div
                style="
                  margin-top:9px;
                  display:flex;
                  gap:7px;
                  flex-wrap:wrap;
                  justify-content:flex-end;
                "
              >

                ${
                  publicProfileUrl
                  ?
                  `

                    <a
                      class="button small"
                      href="${esc(publicProfileUrl)}"
                    >
                      Profil
                    </a>

                  `
                  :
                  ''
                }


                ${
                  videoUrl
                  ?
                  `

                    <a
                      class="button small secondary"
                      href="${esc(videoUrl)}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Vidéo
                    </a>

                  `
                  :
                  ''
                }

              </div>

            </div>

          </article>

        `;

      }
    );


    html += `

        <div
          style="
            display:flex;
            gap:10px;
            justify-content:space-between;
            margin-top:24px;
          "
        >

          <button
            type="button"
            class="button secondary"
            id="eahV3GradingsPrevious"
            ${hasPrevious ? '' : 'disabled'}
          >
            ← Précédent
          </button>


          <button
            type="button"
            class="button"
            id="eahV3GradingsNext"
            ${hasNext ? '' : 'disabled'}
          >
            Suivant →
          </button>

        </div>

      </div>

    `;


    openModal(
      html
    );


    document
      .getElementById(
        'eahV3GradingsPrevious'
      )
      ?.addEventListener(

        'click',

        () => {

          loadPopulationGradingsV3(
            page - 1
          );

        }

      );


    document
      .getElementById(
        'eahV3GradingsNext'
      )
      ?.addEventListener(

        'click',

        () => {

          loadPopulationGradingsV3(
            page + 1
          );

        }

      );

  }



  /* ==========================================================
     INTERCEPTER ANCIEN BOUTON POPULATION
  ========================================================== */

  function installPopulationEvents() {

    const button =
      document.getElementById(
        'populationSearchButton'
      );


    const input =
      document.getElementById(
        'populationCode'
      );


    if (
      button &&
      button.dataset.eahV3Installed !==
        '1'
    ) {

      button.dataset.eahV3Installed =
        '1';


      button.addEventListener(

        'click',

        event => {

          event.preventDefault();

          event.stopImmediatePropagation();

          loadPopulationV3();

        },

        true

      );

    }


    if (
      input &&
      input.dataset.eahV3Installed !==
        '1'
    ) {

      input.dataset.eahV3Installed =
        '1';


      input.addEventListener(

        'keydown',

        event => {

          if (
            event.key !==
            'Enter'
          ) {

            return;

          }


          event.preventDefault();

          event.stopImmediatePropagation();

          loadPopulationV3();

        },

        true

      );

    }


    /*
      Compatibilité avec un éventuel onclick HTML.
    */

    window.loadPopulation =
      loadPopulationV3;

  }



  /* ==========================================================
     DASHBOARD : NOMBRE TOTAL DES GRADE REPORTS
  ========================================================== */

  async function refreshDashboardEvaluationCount() {

    try {

      if (
        typeof state ===
          'undefined'
        ||
        !state.club?.id
      ) {

        return;

      }


      const {
        count,
        error
      } =
        await requireSupabase()

          .from(
            'evaluations'
          )

          .select(
            'id',
            {

              count:
                'exact',

              head:
                true

            }
          )

          .eq(
            'club_id',
            state.club.id
          );


      if (error) {

        throw error;

      }


      if (
        typeof count !==
        'number'
      ) {

        return;

      }


      state.dashboardEvaluationTotal =
        count;


      const cards =
        document.querySelectorAll(
          '#dashboardStats .stat-card'
        );


      cards.forEach(
        card => {

          const label =
            String(
              card
                .querySelector(
                  'span'
                )
                ?.textContent
              ||
              ''
            )
            .trim();


          if (
            label ===
            'Grade Reports'
          ) {

            const strong =
              card.querySelector(
                'strong'
              );


            if (strong) {

              strong.textContent =
                String(
                  count
                );

            }

          }

        }
      );


    } catch (
      error
    ) {

      console.warn(
        'EAH DASHBOARD COUNT:',
        error
      );

    }

  }



  function patchDashboard() {

    try {

      if (
        typeof window.renderDashboard !==
          'function'
      ) {

        return;

      }


      if (
        window
          .renderDashboard
          .__eahV3Patched
      ) {

        return;

      }


      const original =
        window.renderDashboard;


      const patched =
        function(...args) {

          const result =
            original.apply(
              this,
              args
            );


          refreshDashboardEvaluationCount()
            .catch(
              console.warn
            );


          return result;

        };


      patched.__eahV3Patched =
        true;


      window.renderDashboard =
        patched;


    } catch (
      error
    ) {

      console.warn(
        'EAH DASHBOARD PATCH:',
        error
      );

    }

  }



  /* ==========================================================
     PROFIL PUBLIC INITIAL
  ========================================================== */

  function refreshInitialPublicProfile() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const eahId =
      String(
        params.get(
          'id'
        )
        ||
        ''
      )
      .trim()
      .toUpperCase();


    const token =
      String(
        params.get(
          'token'
        )
        ||
        ''
      )
      .trim();


    if (
      !eahId ||
      token
    ) {

      return;

    }


    if (
      window.location.hash !==
      '#profil'
    ) {

      return;

    }


    loadPublicProfileV3(
      eahId
    )
    .catch(
      console.warn
    );

  }



  /* ==========================================================
     CSS
  ========================================================== */

  function installCSS() {

    if (
      document.getElementById(
        'eahV3Css'
      )
    ) {

      return;

    }


    const style =
      document.createElement(
        'style'
      );


    style.id =
      'eahV3Css';


    style.textContent = `

      .eah-v3-population-clickable {

        cursor:
          pointer;

        transition:
          transform .2s ease,
          border-color .2s ease,
          box-shadow .2s ease;

      }


      .eah-v3-population-clickable:hover {

        transform:
          translateY(-4px);

        border-color:
          rgba(
            48,
            207,
            255,
            .48
          ) !important;

        box-shadow:
          0 20px 50px
          rgba(
            0,
            0,
            0,
            .26
          );

      }


      .eah-v3-population-clickable:focus {

        outline:
          2px solid
          #30cfff;

        outline-offset:
          4px;

      }


      #siteModal
      .history-item {

        gap:
          16px;

      }


      @media(
        max-width:
        600px
      ) {

        #siteModal
        .history-item {

          align-items:
            flex-start !important;

          flex-direction:
            column;

        }


        #siteModal
        .history-item
        > div:last-child {

          width:
            100%;

          text-align:
            left !important;

        }

      }

    `;


    document.head
      .appendChild(
        style
      );

  }



  /* ==========================================================
     INSTALLATION
  ========================================================== */

  function install() {

    installCSS();

    installPopulationEvents();

    installDiverPinCapture();

    patchDashboard();


    window.setTimeout(

      refreshInitialPublicProfile,

      250

    );


    window.setTimeout(

      refreshInitialPublicProfile,

      900

    );

  }


  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(

      'DOMContentLoaded',

      install,

      {
        once:
          true
      }

    );

  } else {

    install();

  }


  /*
    Certaines zones du site peuvent être
    injectées après le premier chargement.
  */

  window.setTimeout(
    installPopulationEvents,
    1000
  );


  window.setTimeout(
    installDiverPinCapture,
    1000
  );


})();
