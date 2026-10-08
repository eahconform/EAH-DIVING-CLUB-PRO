
/* ==========================================================
   EAH DIVING CLUB PRO
   CORRECTIF FONCTIONNEL ADDITIF
   Base : restauration-17h

   Conservation du design existant.
   Aucune modification des jetons NFC.
   Aucun changement des donnees Supabase.
========================================================== */

(() => {
  'use strict';

  const html = value => String(value ?? '')
    .replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const val = (...values) =>
    values.find(x =>
      x !== null &&
      x !== undefined &&
      x !== ''
    ) ?? null;

  const number = x => {
    if (x === null || x === undefined || x === '') {
      return null;
    }
    const n = Number(String(x).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const fmt = x => {
    const n = number(x);
    return n === null ? '—' : String(n).replace('.', ',');
  };

  const safeLink = raw => {
    if (!raw || typeof raw !== 'string') return '';
    try {
      const url = new URL(raw, window.location.href);
      return ['https:', 'http:'].includes(url.protocol)
        ? url.href
        : '';
    } catch (_) {
      return '';
    }
  };

  const link = (url, label) => {
    const safe = safeLink(url);
    return safe
      ? `<a href="${html(safe)}"
           target="_blank"
           rel="noopener noreferrer"
           style="color:#30cfff;
                  text-decoration:underline;
                  margin-right:16px;
                  display:inline-block;
                  padding:7px 0">
           ${html(label)}
         </a>`
      : '';
  };

  /* ========================================================
     COMPATIBILITE DES DONNEES
  ======================================================== */

  const normalizeEvaluation = e => {
    const v = e && typeof e === 'object' ? e : {};

    return {
      ...v,
      eah_score: val(
        v.eah_score, v.eahScore, v.EAH_SCORE, v.eah
      ),
      wa_score: val(
        v.wa_score, v.waScore, v.WA_SCORE
      ),
      primary_score_type: val(
        v.primary_score_type,
        v.primaryScoreType,
        v.score_type,
        'EAH'
      ),
      dive_code: val(
        v.dive_code, v.diveCode, v.code
      ),
      dive_name: val(
        v.dive_name, v.diveName
      ),
      evaluated_at: val(
        v.evaluated_at,
        v.evaluatedAt,
        v.date,
        v.created_at
      ),
      entry_score: val(
        v.entry_score, v.entryScore, v.entry
      ),
      report_url: val(
        v.report_url, v.reportUrl
      ),
      video_url: val(
        v.video_url, v.videoUrl
      ),
      takeoff: val(
        v.takeoff, v.takeoffScore
      ),
      trick: val(
        v.trick, v.trickScore
      )
    };
  };

  /* ========================================================
     DETAILS DU GRADING
  ======================================================== */

  const detailsHtml = raw => {
    const e = normalizeEvaluation(raw);

    const fields = [
      ['Takeoff', e.takeoff],
      ['Trick', e.trick],
      ['Entry', e.entry_score]
    ].filter(([, value]) => value !== null);

    const parts = fields.map(([name, score]) =>
      `<span style="margin-right:15px">
         ${html(name)} :
         <strong>${html(fmt(score))}/10</strong>
       </span>`
    ).join('');

    const feedback = [
      ['Points positifs', val(
        e.positive, e.positive_feedback
      )],
      ['À améliorer', val(
        e.improve, e.improvement
      )],
      ['Commentaire', val(
        e.comment, e.global_feedback
      )]
    ]
      .filter(([, value]) => value !== null)
      .map(([name, value]) =>
        `<p style="margin:10px 0">
           <strong>${html(name)} :</strong>
           ${html(value)}
         </p>`
      )
      .join('');

    const resources =
      link(e.report_url, 'Grade Report PDF') +
      link(e.video_url, 'Voir la vidéo');

    if (!parts && !feedback && !resources) {
      return '';
    }

    return `
      <details data-eah-extra
        style="
          margin-top:12px;
          padding:12px;
          border-top:1px solid rgba(143,205,255,.22)
        ">
        <summary style="
          cursor:pointer;
          color:#30cfff;
          font-weight:700">
          Détails du grading
        </summary>

        <div style="margin-top:12px;line-height:1.65">
          ${parts}
          ${feedback}
          <div>${resources}</div>
        </div>
      </details>
    `;
  };

  /* ========================================================
     HISTORIQUE DES PROFILS PLONGEURS
  ======================================================== */

  const installHistory = () => {
    if (
      typeof window.renderProfileHistory !== 'function' ||
      window.renderProfileHistory.__eahFixed
    ) {
      return;
    }

    const original = window.renderProfileHistory;

    const wrapped = function (payload) {
      const fixed = {
        ...(payload || {}),
        evaluations: Array.isArray(payload?.evaluations)
          ? payload.evaluations.map(normalizeEvaluation)
          : []
      };

      const returned = original.call(this, fixed);
      const root = document.getElementById('profileHistory');

      if (root) {
        const rows = root.querySelectorAll(
          '.profile-history-item'
        );

        fixed.evaluations.forEach((e, i) => {
          if (
            rows[i] &&
            !rows[i].querySelector(
              'details[data-eah-extra]'
            )
          ) {
            const extra = detailsHtml(e);
            const slot = rows[i].querySelector(
              '.history-score'
            );

            if (extra && slot) {
              slot.insertAdjacentHTML(
                'beforeend',
                extra
              );
            }
          }
        });
      }

      return returned;
    };

    wrapped.__eahFixed = true;
    window.renderProfileHistory = wrapped;
  };

  /* ========================================================
     PROFIL DETAILLE DANS L'ESPACE COACH NFC
  ======================================================== */

  const augmentCoachProfile = async eahId => {
    const coachToken = new URLSearchParams(
      window.location.search
    ).get('coachToken');

    if (
      !coachToken ||
      !eahId ||
      typeof window.requireSupabase !== 'function'
    ) {
      return;
    }

    const app = document.getElementById(
      'eahCoachCardApp'
    );

    const closeButton = app?.querySelector(
      '#closeDiverCoach'
    );

    const panel = closeButton?.parentElement;

    if (
      !panel ||
      panel.querySelector('[data-eah-coach-history]')
    ) {
      return;
    }

    const host = document.createElement('section');
    host.setAttribute('data-eah-coach-history', '');

    host.style.cssText =
      'text-align:left;' +
      'margin-top:25px;' +
      'border-top:1px solid rgba(143,205,255,.22);' +
      'padding-top:20px';

    host.textContent =
      'Chargement de l’historique détaillé…';

    panel.appendChild(host);

    try {
      const { data, error } =
        await window.requireSupabase().rpc(
          'eah_coach_open_diver',
          {
            p_token: coachToken,
            p_eah_id: eahId
          }
        );

      if (error) throw error;

      if (!data || data.ok === false) {
        throw new Error(
          data?.error || 'Profil indisponible'
        );
      }

      if (!host.isConnected) return;

      const evaluations = Array.isArray(data.evaluations)
        ? data.evaluations.map(normalizeEvaluation)
        : [];

      const items = evaluations.map(e => {
        const type =
          String(e.primary_score_type || 'EAH')
            .toUpperCase() === 'WA'
            ? 'WA'
            : 'EAH';

        const score = type === 'WA'
          ? val(e.wa_score, e.eah_score)
          : e.eah_score;

        const date = String(
          e.evaluated_at || ''
        ).substring(0, 10);

        return `
          <article style="
            padding:16px;
            margin:12px 0;
            border:1px solid rgba(143,205,255,.22);
            border-radius:16px;
            background:rgba(5,23,42,.88)">

            <div style="
              display:flex;
              gap:10px;
              justify-content:space-between;
              flex-wrap:wrap">

              <div>
                <strong>
                  ${html(e.dive_code || 'Plongeon')}
                </strong>

                <div style="
                  color:#8fa8bc;
                  font-size:.9em">
                  ${html(date)}
                  ${e.height != null
                    ? ' · ' + html(String(e.height)) + ' m'
                    : ''}
                </div>
              </div>

              <strong>
                ${html(type)} ${html(fmt(score))}/10
              </strong>
            </div>

            ${detailsHtml(e)}
          </article>
        `;
      }).join('');

      host.innerHTML = `
        <h3 style="margin:0 0 15px">
          Historique des évaluations
          (${evaluations.length})
        </h3>
        ${items || '<p>Aucune évaluation enregistrée.</p>'}
      `;

    } catch (error) {
      if (host.isConnected) {
        host.innerHTML = `
          <p style="color:#ffb3b3">
            Historique indisponible :
            ${html(error.message || 'Erreur')}
          </p>
        `;
      }
    }
  };

  /* ========================================================
     BOUTON OUVRIR PROFIL COACH
  ======================================================== */

  document.addEventListener(
    'click',
    event => {
      const target = event.target.closest?.(
        '#eahCoachCardApp .eah-open-diver'
      );

      if (!target) return;

      const card = target.closest(
        '.coach-list-card'
      );

      const match = card?.textContent?.match(
        /EAH-[A-Z0-9-]+/i
      );

      if (!match) return;

      window.setTimeout(
        () => augmentCoachProfile(match[0].trim()),
        0
      );
    },
    true
  );

  /* ========================================================
     RECHERCHE DES PLONGEURS DU COACH
  ======================================================== */

  const installCoachSearch = () => {
    const app = document.getElementById(
      'eahCoachCardApp'
    );

    const sections = app?.querySelectorAll(
      '.coach-section'
    );

    const section = sections?.[1];

    if (
      !section ||
      section.querySelector(
        '[data-eah-search-divers]'
      )
    ) {
      return;
    }

    const input = document.createElement('input');
    input.setAttribute(
      'data-eah-search-divers',
      ''
    );

    input.setAttribute(
      'aria-label',
      'Rechercher un plongeur du club'
    );

    input.type = 'search';
    input.placeholder =
      'Rechercher un plongeur (nom ou EAH ID)';

    input.style.cssText =
      'width:100%;' +
      'box-sizing:border-box;' +
      'margin:12px 0 16px;' +
      'padding:14px;' +
      'border-radius:12px;' +
      'border:1px solid rgba(143,205,255,.3);' +
      'background:#102c43;' +
      'color:white;' +
      'font-size:16px';

    input.addEventListener('input', () => {
      const term = input.value
        .toLocaleLowerCase('fr')
        .trim();

      section.querySelectorAll(
        '.coach-list-card'
      ).forEach(card => {
        card.style.display = card.textContent
          .toLocaleLowerCase('fr')
          .includes(term)
          ? ''
          : 'none';
      });
    });

    section.querySelector('h2')
      ?.insertAdjacentElement(
        'afterend',
        input
      );
  };

  /* ========================================================
     INITIALISATION
  ======================================================== */

  const start = () => {
    installHistory();
    installCoachSearch();

    const root = document.getElementById(
      'eahCoachCardApp'
    );

    if (
      root &&
      typeof MutationObserver !== 'undefined'
    ) {
      const obs = new MutationObserver(
        () => installCoachSearch()
      );

      obs.observe(root, {
        childList: true,
        subtree: true
      });

    } else if (
      new URLSearchParams(location.search)
        .has('coachToken')
    ) {
      const obs = new MutationObserver(() => {
        const app = document.getElementById(
          'eahCoachCardApp'
        );

        if (app) {
          obs.disconnect();
          installCoachSearch();

          new MutationObserver(
            () => installCoachSearch()
          ).observe(app, {
            childList: true,
            subtree: true
          });
        }
      });

      obs.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      start,
      { once: true }
    );
  } else {
    start();
  }
})();
