/* ============================================================
   EAH DIVING PRO CLUB
   PROFILS + HISTORIQUE + ESPACE COACH
   FINAL V6 — 06/10/2026

   À charger APRES script.js et les autres modules.

   Ce fichier :
   - redirige les anciens RPC vers les RPC V6 ;
   - affiche les vraies notes EAH / WA ;
   - affiche Takeoff / Trick / Entry ;
   - affiche Grade Report + vidéo ;
   - conserve les profils privés non ouvrables depuis Population ;
   - ajoute "Mes plongeurs" dans l'espace coach ;
   - permet au coach d'ouvrir l'historique détaillé de ses plongeurs.
============================================================ */

(function () {
  'use strict';

  const RPC_REDIRECTS = {
    eah_population_search_v3: 'eah_population_search_v6',
    eah_population_search_v5: 'eah_population_search_v6',

    eah_public_profile_v2: 'eah_public_profile_v6',
    eah_public_profile_v5: 'eah_public_profile_v6',

    eah_open_profile_fast: 'eah_open_profile_full_v6',

    eah_diver_login_fast: 'eah_diver_login_full_v6'
  };


  /* ============================================================
     ETAT GLOBAL
  ============================================================ */

  function appState() {

    try {

      return (
        typeof state !== 'undefined'
        ?
        state
        :
        null
      );

    } catch (_) {

      return null;

    }

  }


  /* ============================================================
     HTML SAFE
  ============================================================ */

  function html(value) {

    try {

      if (
        typeof esc ===
        'function'
      ) {

        return esc(
          value
        );

      }

    } catch (_) {}


    return String(
      value == null
      ?
      ''
      :
      value
    )
    .replace(
      /[&<>"']/g,
      function (char) {

        return {

          '&':
            '&amp;',

          '<':
            '&lt;',

          '>':
            '&gt;',

          '"':
            '&quot;',

          "'":
            '&#39;'

        }[
          char
        ];

      }
    );

  }


  /* ============================================================
     JSON
  ============================================================ */

  function parseObject(
    value
  ) {

    if (
      value
      &&
      typeof value ===
      'object'
    ) {

      return value;

    }


    if (!value) {

      return {};

    }


    try {

      return JSON.parse(
        value
      );

    } catch (_) {

      return {};

    }

  }


  /* ============================================================
     NUMBER
  ============================================================ */

  function numberValue(
    value
  ) {

    if (
      value === null
      ||
      value === ''
      ||
      typeof value ===
      'undefined'
    ) {

      return null;

    }


    const number =
      Number(
        value
      );


    return Number.isFinite(
      number
    )
    ?
    number
    :
    null;

  }


  function numberText(
    value
  ) {

    const number =
      numberValue(
        value
      );


    if (
      number ===
      null
    ) {

      return '—';

    }


    return String(

      Math.round(
        number * 10
      )
      /
      10

    )
    .replace(
      '.',
      ','
    );

  }


  /* ============================================================
     DATE
  ============================================================ */

  function dateText(
    value
  ) {

    if (!value) {

      return '—';

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


    try {

      return new Intl
        .DateTimeFormat(
          'fr-FR',
          {
            day:
              '2-digit',

            month:
              '2-digit',

            year:
              'numeric'
          }
        )
        .format(
          date
        );

    } catch (_) {

      return date
        .toLocaleDateString(
          'fr-FR'
        );

    }

  }


  /* ============================================================
     URL
  ============================================================ */

  function normalizeUrl(
    value
  ) {

    const url =
      String(
        value || ''
      )
      .trim();


    return (
      /^https?:\/\//i
      .test(
        url
      )
      ?
      url
      :
      ''
    );

  }


  /* ============================================================
     SUPABASE
  ============================================================ */

  function getSupabaseClient() {

    try {

      if (
        typeof requireSupabase ===
        'function'
      ) {

        return requireSupabase();

      }

    } catch (_) {}


    try {

      if (
        typeof supabaseClient !==
          'undefined'
        &&
        supabaseClient
      ) {

        return supabaseClient;

      }

    } catch (_) {}


    return null;

  }


  /* ============================================================
     REMPLACEMENT DES RPC
  ============================================================ */

  function patchClientRpc(
    client
  ) {

    if (
      !client
      ||
      typeof client.rpc !==
      'function'
    ) {

      return false;

    }


    if (
      client.__eahV6RpcPatched
    ) {

      return true;

    }


    const originalRpc =
      client.rpc.bind(
        client
      );


    client.rpc =
      function (
        name,
        args,
        options
      ) {

        const redirected =
          RPC_REDIRECTS[
            name
          ]
          ||
          name;


        return originalRpc(

          redirected,

          args,

          options

        );

      };


    try {

      Object.defineProperty(

        client,

        '__eahV6RpcPatched',

        {

          value:
            true,

          configurable:
            false,

          enumerable:
            false,

          writable:
            false

        }

      );

    } catch (_) {

      client.__eahV6RpcPatched =
        true;

    }


    return true;

  }


  function installRpcRedirect() {

    try {

      if (
        typeof requireSupabase ===
          'function'
        &&
        !requireSupabase
          .__eahV6Wrapped
      ) {

        const originalRequireSupabase =
          requireSupabase;


        const wrappedRequireSupabase =
          function () {

            const client =
              originalRequireSupabase
                .apply(
                  this,
                  arguments
                );


            patchClientRpc(
              client
            );


            return client;

          };


        wrappedRequireSupabase
          .__eahV6Wrapped =
          true;


        try {

          requireSupabase =
            wrappedRequireSupabase;

        } catch (_) {

          try {

            window.requireSupabase =
              wrappedRequireSupabase;

          } catch (_) {}

        }

      }

    } catch (_) {}


    const client =
      getSupabaseClient();


    return patchClientRpc(
      client
    );

  }


  /* ============================================================
     CRITERIA
  ============================================================ */

  function evaluationCriteria(
    evaluation
  ) {

    return Object.assign(

      {},

      parseObject(
        evaluation
        &&
        evaluation.criteria
      ),

      parseObject(
        evaluation
        &&
        evaluation.criteria_json
      ),

      parseObject(
        evaluation
        &&
        evaluation.CRITERIA_JSON
      )

    );

  }


  /* ============================================================
     NOTE PRINCIPALE
  ============================================================ */

  function evaluationScoreData(
    evaluation
  ) {

    const e =
      evaluation || {};


    const criteria =
      evaluationCriteria(
        e
      );


    const eahScore =
      numberValue(

        e.eah_score

        ??

        e.eahScore

        ??

        e.EAH_SCORE

        ??

        e.score_eah

        ??

        e.final_eah_score

      );


    const waScore =
      numberValue(

        e.wa_score

        ??

        e.waScore

        ??

        e.WA_SCORE

        ??

        e.score_wa

      );


    let type =
      String(

        e.primary_score_type

        ??

        e.primaryScoreType

        ??

        e.PRIMARY_SCORE_TYPE

        ??

        e.scoring_mode

        ??

        e.SCORING_MODE

        ??

        e.score_type

        ??

        e.SCORE_TYPE

        ??

        criteria._primaryScoreType

        ??

        criteria._scoreType

        ??

        ''

      )
      .trim()
      .toUpperCase();


    if (
      type !==
        'WA'
      &&
      type !==
        'EAH'
    ) {

      type =
        (
          waScore !==
            null
          &&
          eahScore ===
            null
        )
        ?
        'WA'
        :
        'EAH';

    }


    if (
      type ===
        'WA'
      &&
      waScore ===
        null
      &&
      eahScore !==
        null
    ) {

      type =
        'EAH';

    }


    if (
      type ===
        'EAH'
      &&
      eahScore ===
        null
      &&
      waScore !==
        null
    ) {

      type =
        'WA';

    }


    return {

      type:
        type,

      eahScore:
        eahScore,

      waScore:
        waScore,

      mainScore:
        type ===
          'WA'
        ?
        waScore
        :
        eahScore

    };

  }


  /* ============================================================
     TAKEOFF / TRICK / ENTRY
  ============================================================ */

  function phaseScore(
    evaluation,
    phase
  ) {

    const e =
      evaluation || {};


    if (
      phase ===
      'takeoff'
    ) {

      return numberValue(

        e.takeoff

        ??

        e.TAKEOFF

        ??

        e.takeoff_score

        ??

        e.D_SCORE

      );

    }


    if (
      phase ===
      'trick'
    ) {

      return numberValue(

        e.trick

        ??

        e.TRICK

        ??

        e.trick_score

        ??

        e.T_SCORE

      );

    }


    return numberValue(

      e.entry_score

      ??

      e.entry

      ??

      e.ENTRY_SCORE

      ??

      e.ENTRY

      ??

      e.E_SCORE

    );

  }


  /* ============================================================
     REPORT / VIDEO
  ============================================================ */

  function reportUrl(
    evaluation
  ) {

    const e =
      evaluation || {};


    return normalizeUrl(

      e.report_url

      ??

      e.reportUrl

      ??

      e.REPORT_URL

    );

  }


  function videoUrl(
    evaluation
  ) {

    const e =
      evaluation || {};


    return normalizeUrl(

      e.video_url

      ??

      e.videoUrl

      ??

      e.VIDEO_URL

    );

  }


  /* ============================================================
     NOM PLONGEON
  ============================================================ */

  function diveName(
    evaluation
  ) {

    const e =
      evaluation || {};


    const code =
      String(

        e.dive_code

        ??

        e.diveCode

        ??

        e.DIVE_CODE

        ??

        ''

      )
      .trim()
      .toUpperCase();


    const explicit =
      String(

        e.dive_name

        ??

        e.diveName

        ??

        e.DIVE_NAME

        ??

        ''

      )
      .trim();


    if (
      explicit
      &&
      explicit.toUpperCase()
      !==
      code
    ) {

      return explicit;

    }


    try {

      if (
        typeof DIVE_NAMES !==
          'undefined'
        &&
        DIVE_NAMES
        &&
        DIVE_NAMES[
          code
        ]
      ) {

        return DIVE_NAMES[
          code
        ];

      }

    } catch (_) {}


    return (
      explicit
      ||
      code
      ||
      'Plongeon'
    );

  }


  /* ============================================================
     COMMENTAIRE
  ============================================================ */

  function feedbackBlock(

    title,
    text,
    className

  ) {

    const value =
      String(
        text || ''
      )
      .trim();


    if (!value) {

      return '';

    }


    return `

      <div class="eah-v6-feedback ${className}">

        <strong>
          ${html(title)}
        </strong>

        <p>
          ${html(value)}
        </p>

      </div>

    `;

  }


  /* ============================================================
     CARTE EVALUATION
  ============================================================ */

  function evaluationCardHtml(

    evaluation,
    detailed

  ) {

    const e =
      evaluation || {};


    const score =
      evaluationScoreData(
        e
      );


    const takeoff =
      phaseScore(
        e,
        'takeoff'
      );


    const trick =
      phaseScore(
        e,
        'trick'
      );


    const entry =
      phaseScore(
        e,
        'entry'
      );


    const code =
      String(

        e.dive_code

        ??

        e.diveCode

        ??

        e.DIVE_CODE

        ??

        ''

      )
      .trim()
      .toUpperCase();


    const height =
      numberValue(

        e.height

        ??

        e.HEIGHT

      );


    const date =

      e.evaluated_at

      ??

      e.evaluatedAt

      ??

      e.created_at

      ??

      e.DATE

      ??

      '';


    const report =
      reportUrl(
        e
      );


    const video =
      videoUrl(
        e
      );


    const secondary =
      score.type ===
        'WA'
      ?
      (
        score.eahScore !==
          null
        ?
        `EAH ${numberText(score.eahScore)}/10`
        :
        ''
      )
      :
      (
        score.waScore !==
          null
        ?
        `WA ${numberText(score.waScore)}/10`
        :
        ''
      );


    const verified =
      Boolean(

        e.eah_verified ===
          true

        ||

        e.EAH_VERIFIED ===
          true

        ||

        String(
          e.eah_verified ||
          ''
        )
        .toLowerCase()
        ===
        'true'

      );


    return `

      <article class="eah-v6-evaluation-card">

        <div class="eah-v6-evaluation-top">

          <div>

            <span class="eah-v6-code">
              ${html(code || '—')}
            </span>

            <h4>
              ${html(diveName(e))}
            </h4>

            <p>

              ${html(dateText(date))}

              ${
                height !==
                  null
                ?
                ` • ${html(numberText(height))} m`
                :
                ''
              }

            </p>

          </div>


          <div class="eah-v6-main-score">

            <small>
              NOTE ${html(score.type)}
            </small>

            <strong>

              ${html(numberText(score.mainScore))}

              <span>
                /10
              </span>

            </strong>

            ${
              secondary
              ?
              `<em>${html(secondary)}</em>`
              :
              ''
            }

            ${
              verified
              ?
              '<b>EAH VERIFIED</b>'
              :
              ''
            }

          </div>

        </div>


        <div class="eah-v6-phase-grid">

          <div>

            <span>
              Takeoff
            </span>

            <strong>
              ${html(numberText(takeoff))}/10
            </strong>

          </div>


          <div>

            <span>
              Trick
            </span>

            <strong>
              ${html(numberText(trick))}/10
            </strong>

          </div>


          <div>

            <span>
              Entry
            </span>

            <strong>
              ${html(numberText(entry))}/10
            </strong>

          </div>

        </div>


        ${
          detailed
          ?
          `

            <div class="eah-v6-feedbacks">

              ${feedbackBlock(
                'Points réussis',
                e.positive ?? e.POSITIVE,
                'success'
              )}

              ${feedbackBlock(
                'À améliorer',
                e.improve ?? e.IMPROVE,
                'improve'
              )}

              ${feedbackBlock(
                'Commentaire du coach',
                e.comment ?? e.COMMENT,
                'comment'
              )}

            </div>

          `
          :
          ''
        }


        <div class="eah-v6-evaluation-links">

          ${
            report
            ?
            `

              <a
                href="${html(report)}"
                target="_blank"
                rel="noopener"
              >
                Grade Report
              </a>

            `
            :
            `

              <span class="is-disabled">
                Grade Report indisponible
              </span>

            `
          }


          ${
            video
            ?
            `

              <a
                href="${html(video)}"
                target="_blank"
                rel="noopener"
              >
                Vidéo
              </a>

            `
            :
            `

              <span class="is-disabled">
                Vidéo indisponible
              </span>

            `
          }

        </div>

      </article>

    `;

  }


  /* ============================================================
     HISTORIQUE PROFIL
  ============================================================ */

  function renderProfileHistoryV6(
    data
  ) {

    const profileView =
      document.getElementById(
        'profileView'
      );


    if (!profileView) {

      return;

    }


    const payload =
      data || {};


    const evaluations =
      Array.isArray(
        payload
      )
      ?
      payload
      :
      (
        Array.isArray(
          payload.evaluations
        )
        ?
        payload.evaluations
        :
        []
      );


    let section =
      document.getElementById(
        'eahV6ProfileHistory'
      );


    if (!section) {

      section =
        document.createElement(
          'section'
        );


      section.id =
        'eahV6ProfileHistory';


      section.className =
        'eah-v6-profile-history';


      profileView.appendChild(
        section
      );

    }


    section.innerHTML = `

      <div class="eah-v6-history-heading">

        <div>

          <span class="overline">
            HISTORIQUE
          </span>

          <h3>
            Grade Reports & évaluations
          </h3>

        </div>

        <span class="eah-v6-history-count">
          ${evaluations.length}
        </span>

      </div>


      <div class="eah-v6-history-list">

        ${
          evaluations.length
          ?
          evaluations
            .map(
              function (
                evaluation
              ) {

                return evaluationCardHtml(
                  evaluation,
                  true
                );

              }
            )
            .join('')
          :
          `

            <div class="notice">
              Aucune évaluation enregistrée pour le moment.
            </div>

          `
        }

      </div>

    `;

  }


  /* ============================================================
     REMPLACER L'ANCIEN AFFICHAGE HISTORIQUE
  ============================================================ */

  function installRenderProfileOverride() {

    try {

      renderProfileHistory =
        renderProfileHistoryV6;

    } catch (_) {

      try {

        window.renderProfileHistory =
          renderProfileHistoryV6;

      } catch (_) {}

    }

  }


  /* ============================================================
     PLONGEURS CLUB
  ============================================================ */

  function coachDivers() {

    const currentState =
      appState();


    return (
      currentState
      &&
      Array.isArray(
        currentState.divers
      )
      ?
      currentState.divers
      :
      []
    );

  }


  function renderCoachDiversV6() {

    const box =
      document.getElementById(
        'coachDiversList'
      );


    if (!box) {

      return;

    }


    const divers =
      coachDivers();


    if (!divers.length) {

      box.innerHTML =
        '<div class="notice">Aucun plongeur chargé.</div>';


      return;

    }


    const ordered =
      divers
        .slice()
        .sort(
          function (
            a,
            b
          ) {

            const aa =
              `${a.last_name || ''} ${a.first_name || ''}`
                .trim()
                .toLowerCase();


            const bb =
              `${b.last_name || ''} ${b.first_name || ''}`
                .trim()
                .toLowerCase();


            return aa.localeCompare(
              bb,
              'fr'
            );

          }
        );


    box.innerHTML = `

      <div class="eah-v6-coach-divers-grid">

        ${
          ordered
            .map(
              function (
                diver
              ) {

                const eahId =
                  String(
                    diver.eah_id ||
                    ''
                  )
                  .trim();


                const fullName =
                  `${diver.first_name || ''} ${diver.last_name || ''}`
                    .trim()
                  ||
                  eahId;


                const photo =
                  normalizeUrl(
                    diver.photo_url
                  );


                const visibility =
                  String(
                    diver.profile_visibility ||
                    'PRIVÉ'
                  )
                  .toUpperCase();


                return `

                  <button
                    type="button"
                    class="eah-v6-coach-diver-card"
                    data-eah-v6-diver="${html(eahId)}"
                  >

                    <span class="eah-v6-coach-diver-photo">

                      ${
                        photo
                        ?
                        `

                          <img
                            src="${html(photo)}"
                            alt="${html(fullName)}"
                          >

                        `
                        :
                        `

                          <span>
                            ${html(
                              (
                                diver.first_name ||
                                'E'
                              )
                              .charAt(0)
                              .toUpperCase()
                            )}
                          </span>

                        `
                      }

                    </span>


                    <span class="eah-v6-coach-diver-text">

                      <strong>
                        ${html(fullName)}
                      </strong>

                      <small>
                        ${html(eahId)}
                      </small>

                      <em>

                        ${html(
                          diver.group_name ||
                          'Sans groupe'
                        )}

                        •

                        ${html(
                          diver.sex ||
                          '—'
                        )}

                        •

                        ${html(
                          visibility ===
                            'PUBLIC'
                          ?
                          'PUBLIC'
                          :
                          'PRIVÉ'
                        )}

                      </em>

                      <b>
                        ${html(
                          diver.current_blazon ||
                          'En progression'
                        )}
                      </b>

                    </span>


                    <span class="eah-v6-open-label">
                      Ouvrir →
                    </span>

                  </button>

                `;

              }
            )
            .join('')
        }

      </div>

    `;

  }


  /* ============================================================
     MODAL
  ============================================================ */

  function openSiteModal(
    content
  ) {

    const modal =
      document.getElementById(
        'siteModal'
      );


    const modalContent =
      document.getElementById(
        'modalContent'
      );


    if (
      !modal
      ||
      !modalContent
    ) {

      return;

    }


    modalContent.innerHTML =
      content;


    modal.setAttribute(
      'aria-hidden',
      'false'
    );


    modal.classList.add(
      'eah-v6-open'
    );


    document.body
      .classList.add(
        'eah-v6-modal-open'
      );

  }


  function closeSiteModal() {

    const modal =
      document.getElementById(
        'siteModal'
      );


    if (!modal) {

      return;

    }


    modal.setAttribute(
      'aria-hidden',
      'true'
    );


    modal.classList.remove(
      'eah-v6-open'
    );


    document.body
      .classList.remove(
        'eah-v6-modal-open'
      );

  }


  /* ============================================================
     PROFIL DETAILLE COACH
  ============================================================ */

  async function openCoachDiverDetailV6(
    eahId
  ) {

    const currentState =
      appState();


    if (
      !currentState
      ||
      !currentState.club
      ||
      !currentState.club.id
    ) {

      return;

    }


    const diver =
      coachDivers()
        .find(
          function (
            item
          ) {

            return (
              String(
                item.eah_id ||
                ''
              )
              .toUpperCase()
              ===
              String(
                eahId ||
                ''
              )
              .toUpperCase()
            );

          }
        );


    if (!diver) {

      return;

    }


    const fullName =
      `${diver.first_name || ''} ${diver.last_name || ''}`
        .trim()
      ||
      diver.eah_id;


    const photo =
      normalizeUrl(
        diver.photo_url
      );


    openSiteModal(`

      <div class="eah-v6-coach-detail">

        <div class="eah-v6-coach-detail-head">

          ${
            photo
            ?
            `

              <img
                src="${html(photo)}"
                alt="${html(fullName)}"
              >

            `
            :
            `

              <div class="eah-v6-detail-avatar">
                EAH
              </div>

            `
          }

          <div>

            <span class="overline">
              PROFIL CLUB
            </span>

            <h2>
              ${html(fullName)}
            </h2>

            <p>
              ${html(diver.eah_id || '')}
            </p>

            <div class="eah-v6-detail-tags">

              <span>
                ${html(diver.sex || '—')}
              </span>

              <span>
                ${html(
                  diver.group_name ||
                  'Sans groupe'
                )}
              </span>

              <span>
                ${html(
                  diver.current_blazon ||
                  'En progression'
                )}
              </span>

              <span>
                ${html(
                  String(
                    diver.profile_visibility ||
                    'PRIVÉ'
                  )
                  .toUpperCase()
                )}
              </span>

            </div>

          </div>

        </div>

        <div class="loading-panel">
          Chargement de l'historique…
        </div>

      </div>

    `);


    const client =
      getSupabaseClient();


    if (!client) {

      return;

    }


    let evaluations =
      [];


    try {

      const response =
        await client

          .from(
            'evaluations'
          )

          .select(
            '*'
          )

          .eq(
            'club_id',
            currentState.club.id
          )

          .eq(
            'eah_id',
            diver.eah_id
          )

          .order(
            'evaluated_at',
            {
              ascending:
                false
            }
          );


      if (
        response.error
      ) {

        throw response.error;

      }


      evaluations =
        Array.isArray(
          response.data
        )
        ?
        response.data
        :
        [];


    } catch (
      error
    ) {

      console.error(
        'EAH V6 COACH PROFILE',
        error
      );


      if (
        Array.isArray(
          currentState.evaluations
        )
      ) {

        evaluations =
          currentState.evaluations
            .filter(
              function (
                evaluation
              ) {

                return (
                  String(
                    evaluation.eah_id ||
                    ''
                  )
                  .toUpperCase()
                  ===
                  String(
                    diver.eah_id ||
                    ''
                  )
                  .toUpperCase()
                );

              }
            );

      }

    }


    const modalContent =
      document.getElementById(
        'modalContent'
      );


    if (!modalContent) {

      return;

    }


    modalContent.innerHTML = `

      <div class="eah-v6-coach-detail">

        <div class="eah-v6-coach-detail-head">

          ${
            photo
            ?
            `

              <img
                src="${html(photo)}"
                alt="${html(fullName)}"
              >

            `
            :
            `

              <div class="eah-v6-detail-avatar">
                EAH
              </div>

            `
          }

          <div>

            <span class="overline">
              PROFIL CLUB
            </span>

            <h2>
              ${html(fullName)}
            </h2>

            <p>
              ${html(diver.eah_id || '')}
            </p>


            <div class="eah-v6-detail-tags">

              <span>
                ${html(diver.sex || '—')}
              </span>

              <span>
                ${html(
                  diver.group_name ||
                  'Sans groupe'
                )}
              </span>

              <span>
                ${html(
                  diver.current_blazon ||
                  'En progression'
                )}
              </span>

              <span>
                ${html(
                  String(
                    diver.profile_visibility ||
                    'PRIVÉ'
                  )
                  .toUpperCase()
                )}
              </span>

            </div>

          </div>

        </div>


        <div class="eah-v6-history-heading">

          <div>

            <span class="overline">
              HISTORIQUE
            </span>

            <h3>
              Évaluations du plongeur
            </h3>

          </div>

          <span class="eah-v6-history-count">
            ${evaluations.length}
          </span>

        </div>


        <div class="eah-v6-history-list">

          ${
            evaluations.length
            ?
            evaluations
              .map(
                function (
                  evaluation
                ) {

                  return evaluationCardHtml(
                    evaluation,
                    true
                  );

                }
              )
              .join('')
            :
            `

              <div class="notice">
                Aucune évaluation enregistrée.
              </div>

            `
          }

        </div>

      </div>

    `;

  }


  /* ============================================================
     RENDER DASHBOARD
  ============================================================ */

  function installCoachDashboardHook() {

    try {

      if (
        typeof renderDashboard ===
          'function'
        &&
        !renderDashboard
          .__eahV6Wrapped
      ) {

        const original =
          renderDashboard;


        const wrapped =
          function () {

            const result =
              original.apply(
                this,
                arguments
              );


            window.setTimeout(

              renderCoachDiversV6,

              0

            );


            return result;

          };


        wrapped
          .__eahV6Wrapped =
          true;


        renderDashboard =
          wrapped;

      }

    } catch (_) {}


    const privateSection =
      document.getElementById(
        'coachPrivate'
      );


    if (
      privateSection
      &&
      typeof MutationObserver !==
      'undefined'
    ) {

      const observer =
        new MutationObserver(
          function () {

            window.setTimeout(

              renderCoachDiversV6,

              0

            );

          }
        );


      observer.observe(

        privateSection,

        {

          attributes:
            true,

          childList:
            true,

          subtree:
            true

        }

      );

    }


    window.setTimeout(
      renderCoachDiversV6,
      300
    );


    window.setTimeout(
      renderCoachDiversV6,
      1000
    );


    window.setTimeout(
      renderCoachDiversV6,
      2500
    );

  }


  /* ============================================================
     EVENTS
  ============================================================ */

  function installEvents() {

    document.addEventListener(

      'click',

      function (
        event
      ) {

        const diverButton =
          event.target.closest(
            '[data-eah-v6-diver]'
          );


        if (
          diverButton
        ) {

          event.preventDefault();


          openCoachDiverDetailV6(

            diverButton
              .getAttribute(
                'data-eah-v6-diver'
              )

          );


          return;

        }


        if (
          event.target.closest(
            '[data-close-modal]'
          )
        ) {

          closeSiteModal();

        }

      },

      true

    );


    document.addEventListener(

      'keydown',

      function (
        event
      ) {

        if (
          event.key ===
          'Escape'
        ) {

          closeSiteModal();

        }

      }

    );

  }


  /* ============================================================
     STYLE
  ============================================================ */

  function installStyles() {

    if (
      document.getElementById(
        'eahProfileFinalV6Css'
      )
    ) {

      return;

    }


    const style =
      document.createElement(
        'style'
      );


    style.id =
      'eahProfileFinalV6Css';


    style.textContent = `

      .eah-v6-profile-history {
        margin-top: 28px;
      }


      .eah-v6-history-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        margin: 20px 0 16px;
      }


      .eah-v6-history-heading h3 {
        margin: 4px 0 0;
      }


      .eah-v6-history-count {
        display: grid;
        place-items: center;
        min-width: 42px;
        height: 42px;
        padding: 0 12px;
        border: 1px solid rgba(48,207,255,.30);
        border-radius: 999px;
        color: var(--cyan,#30cfff);
        background: rgba(48,207,255,.08);
        font-weight: 900;
      }


      .eah-v6-history-list {
        display: grid;
        gap: 16px;
      }


      .eah-v6-evaluation-card {
        padding: 20px;
        border: 1px solid rgba(143,205,255,.18);
        border-radius: 22px;
        background: rgba(5,23,42,.76);
        box-shadow: 0 18px 45px rgba(0,0,0,.16);
      }


      .eah-v6-evaluation-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 18px;
      }


      .eah-v6-code {
        display: inline-flex;
        margin-bottom: 7px;
        padding: 5px 9px;
        border-radius: 999px;
        color: var(--cyan,#30cfff);
        background: rgba(48,207,255,.08);
        font-size: .75rem;
        font-weight: 900;
      }


      .eah-v6-evaluation-card h4 {
        margin: 0;
        font-size: 1.05rem;
      }


      .eah-v6-evaluation-card p {
        margin: 6px 0 0;
        opacity: .72;
      }


      .eah-v6-main-score {
        min-width: 130px;
        text-align: right;
      }


      .eah-v6-main-score small,
      .eah-v6-main-score em,
      .eah-v6-main-score b {
        display: block;
      }


      .eah-v6-main-score small {
        color: var(--cyan,#30cfff);
        font-size: .7rem;
        font-weight: 900;
        letter-spacing: .08em;
      }


      .eah-v6-main-score strong {
        display: block;
        margin-top: 4px;
        color: var(--cyan,#30cfff);
        font-size: 2rem;
        line-height: 1;
      }


      .eah-v6-main-score strong span {
        font-size: .82rem;
        opacity: .72;
      }


      .eah-v6-main-score em {
        margin-top: 5px;
        font-size: .76rem;
        font-style: normal;
        opacity: .72;
      }


      .eah-v6-main-score b {
        margin-top: 6px;
        color: #49d99b;
        font-size: .7rem;
      }


      .eah-v6-phase-grid {
        display: grid;
        grid-template-columns: repeat(3,minmax(0,1fr));
        gap: 10px;
        margin-top: 16px;
      }


      .eah-v6-phase-grid > div {
        padding: 12px;
        border-radius: 14px;
        background: rgba(255,255,255,.035);
        text-align: center;
      }


      .eah-v6-phase-grid span,
      .eah-v6-phase-grid strong {
        display: block;
      }


      .eah-v6-phase-grid span {
        margin-bottom: 5px;
        font-size: .72rem;
        opacity: .68;
      }


      .eah-v6-phase-grid strong {
        color: #f5f9ff;
      }


      .eah-v6-feedbacks {
        display: grid;
        gap: 9px;
        margin-top: 14px;
      }


      .eah-v6-feedback {
        padding: 11px 13px;
        border-radius: 13px;
      }


      .eah-v6-feedback strong {
        display: block;
        margin-bottom: 4px;
        font-size: .76rem;
      }


      .eah-v6-feedback p {
        margin: 0;
        opacity: 1;
      }


      .eah-v6-feedback.success {
        color: #86e9ba;
        background: rgba(22,138,87,.12);
      }


      .eah-v6-feedback.improve {
        color: #ff9c9c;
        background: rgba(214,69,69,.12);
      }


      .eah-v6-feedback.comment {
        color: #9bd6ff;
        background: rgba(11,107,255,.12);
      }


      .eah-v6-evaluation-links {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 15px;
      }


      .eah-v6-evaluation-links a,
      .eah-v6-evaluation-links span {
        display: inline-flex;
        align-items: center;
        min-height: 38px;
        padding: 0 13px;
        border-radius: 12px;
        font-size: .8rem;
        font-weight: 800;
      }


      .eah-v6-evaluation-links a {
        border: 1px solid rgba(48,207,255,.26);
        color: #f5f9ff;
        background: rgba(48,207,255,.08);
        text-decoration: none;
      }


      .eah-v6-evaluation-links .is-disabled {
        border: 1px solid rgba(255,255,255,.08);
        opacity: .45;
      }


      .eah-v6-coach-divers-grid {
        display: grid;
        grid-template-columns: repeat(2,minmax(0,1fr));
        gap: 12px;
        margin-top: 16px;
      }


      .eah-v6-coach-diver-card {
        display: grid;
        grid-template-columns: 62px minmax(0,1fr) auto;
        align-items: center;
        gap: 13px;
        width: 100%;
        padding: 14px;
        border: 1px solid rgba(143,205,255,.18);
        border-radius: 18px;
        background: rgba(3,19,31,.62);
        color: inherit;
        text-align: left;
        cursor: pointer;
      }


      .eah-v6-coach-diver-card:hover {
        border-color: rgba(48,207,255,.42);
        transform: translateY(-1px);
      }


      .eah-v6-coach-diver-photo,
      .eah-v6-detail-avatar {
        display: grid;
        place-items: center;
        width: 62px;
        height: 62px;
        overflow: hidden;
        border-radius: 50%;
        background: rgba(48,207,255,.10);
        color: var(--cyan,#30cfff);
        font-weight: 900;
      }


      .eah-v6-coach-diver-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }


      .eah-v6-coach-diver-text strong,
      .eah-v6-coach-diver-text small,
      .eah-v6-coach-diver-text em,
      .eah-v6-coach-diver-text b {
        display: block;
      }


      .eah-v6-coach-diver-text small {
        margin-top: 2px;
        opacity: .62;
      }


      .eah-v6-coach-diver-text em {
        margin-top: 6px;
        font-size: .72rem;
        font-style: normal;
        opacity: .72;
      }


      .eah-v6-coach-diver-text b {
        margin-top: 5px;
        color: var(--cyan,#30cfff);
        font-size: .76rem;
      }


      .eah-v6-open-label {
        color: var(--cyan,#30cfff);
        font-size: .76rem;
        font-weight: 900;
      }


      #siteModal.eah-v6-open {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }


      #siteModal.eah-v6-open .modal-box {
        transform: translateY(0) scale(1) !important;
      }


      body.eah-v6-modal-open {
        overflow: hidden;
      }


      .eah-v6-coach-detail-head {
        display: flex;
        align-items: center;
        gap: 18px;
        margin-bottom: 24px;
      }


      .eah-v6-coach-detail-head > img {
        width: 92px;
        height: 92px;
        border-radius: 50%;
        object-fit: cover;
      }


      .eah-v6-detail-avatar {
        width: 92px;
        height: 92px;
      }


      .eah-v6-coach-detail-head h2 {
        margin: 4px 0;
      }


      .eah-v6-coach-detail-head p {
        margin: 0;
        opacity: .66;
      }


      .eah-v6-detail-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }


      .eah-v6-detail-tags span {
        padding: 5px 8px;
        border-radius: 999px;
        background: rgba(48,207,255,.08);
        color: #b9eaff;
        font-size: .7rem;
        font-weight: 800;
      }


      @media (max-width:760px) {

        .eah-v6-coach-divers-grid {
          grid-template-columns: 1fr;
        }


        .eah-v6-evaluation-top,
        .eah-v6-coach-detail-head {
          align-items: flex-start;
        }


        .eah-v6-main-score {
          min-width: 105px;
        }


        .eah-v6-phase-grid {
          grid-template-columns: 1fr;
        }


        .eah-v6-coach-diver-card {
          grid-template-columns: 54px minmax(0,1fr);
        }


        .eah-v6-open-label {
          display: none;
        }


        .eah-v6-coach-diver-photo {
          width: 54px;
          height: 54px;
        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  /* ============================================================
     INSTALLATION
  ============================================================ */

  function installAll() {

    installRpcRedirect();

    installRenderProfileOverride();

    installStyles();

    installEvents();

    installCoachDashboardHook();

  }


  /*
    IMPORTANT :
    ces deux corrections sont appliquées
    immédiatement avant DOMContentLoaded.
  */

  installRpcRedirect();

  installRenderProfileOverride();


  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(

      'DOMContentLoaded',

      installAll,

      {
        once:
          true
      }

    );

  } else {

    installAll();

  }

})();
