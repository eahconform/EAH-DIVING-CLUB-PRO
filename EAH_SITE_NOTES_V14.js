
/*
 EAH DIVING V14
 Notes EAH et WA sur le profil.
 Bouton Grade Report depuis Supabase.
 Affichage public sans commentaires du coach.
 Compatible GitHub Pages.
*/

(() => {
  'use strict';

  let client = null;
  let lastId = '';
  let lastTime = 0;
  let cached = [];
  let working = false;
  let timer = 0;

  const getNumber = x =>
    x === null ||
    x === undefined ||
    x === ''
      ? null
      : Number.isFinite(Number(x))
      ? Number(x)
      : null;

  const fmt = x =>
    String(x).replace('.', ',');

  function scores(e) {
    return {
      wa: getNumber(e.wa_score),
      eah: getNumber(e.eah_score)
    };
  }

  function css() {
    if (
      document.getElementById(
        'eah14-history-style'
      )
    ) {
      return;
    }

    const style =
      document.createElement('style');

    style.id =
      'eah14-history-style';

    style.textContent = `
      #profileView .history-card,
      #profileView .eah-v6-evaluation-card {
        min-width: 0;
        overflow-wrap: anywhere;
      }

      #profileView .history-card-head {
        display: grid;
        grid-template-columns: minmax(0,1fr) auto;
        gap: 12px;
        align-items: start;
      }

      #profileView .history-card-head > * {
        min-width: 0;
      }

      #profileView .history-main-score,
      #profileView .eah-v6-main-score strong {
        text-align: right;
        white-space: normal;
      }

      #profileView .eah14-score-list {
        display: grid;
        justify-items: end;
        gap: 5px;
      }

      #profileView .eah14-score {
        display: block;
        white-space: nowrap;
        font-weight: 800;
        line-height: 1.3;
      }

      #profileView .eah14-score-wa {
        color: #30cfff;
      }

      #profileView .history-phase-scores {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 14px;
        line-height: 1.4;
      }

      #profileView .history-phase-scores span {
        white-space: nowrap;
      }

      #profileView .history-actions a,
      #profileView .eah-v6-evaluation-links a {
        white-space: nowrap;
      }

      #profileView.eah14-is-public
      .eah-v6-feedbacks,

      #profileView.eah14-is-public
      .eah-v6-feedback,

      #profileView.eah14-is-public
      .coach-feedback,

      #profileView.eah14-is-public
      .grading-comments,

      #population .eah-v6-feedbacks,
      #population .grading-comments {
        display: none !important;
      }

      @media(max-width:540px) {
        #profileView .history-card-head {
          gap: 9px;
        }

        #profileView .history-main-score {
          font-size: 1rem;
        }

        #profileView .history-phase-scores {
          gap: 6px 10px;
          font-size: .9rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function getId() {
    const root =
      document.getElementById(
        'profileView'
      );

    if (
      !root ||
      !root.querySelector(
        '.profile-history-list,.eah-v6-history-list'
      )
    ) {
      return '';
    }

    const text =
      root.querySelector(
        '.profile-main-info p,.eah-v6-detail-head p'
      )?.textContent || '';

    return (
      text.match(
        /EAH-[A-Z0-9-]{5,}/i
      ) || []
    )[0]?.toUpperCase() || '';
  }

  function getClient() {
    if (client) {
      return client;
    }

    const cfg =
      window.EAH_CONFIG;

    if (
      !cfg?.SUPABASE_URL ||
      !cfg.SUPABASE_PUBLISHABLE_KEY ||
      !window.supabase?.createClient
    ) {
      return null;
    }

    client =
      window.supabase.createClient(
        cfg.SUPABASE_URL,
        cfg.SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          }
        }
      );

    return client;
  }

  function validPdf(url) {
    try {
      const u = new URL(
        String(url || '')
      );

      return (
        u.protocol === 'https:' &&
        u.hostname === 'drive.google.com'
      )
        ? u.href
        : '';

    } catch (_) {
      return '';
    }
  }

  function renderScores(card, e) {
    const {
      eah,
      wa
    } = scores(e);

    const arr = [];

    if (eah !== null) {
      arr.push({
        label: 'EAH',
        value: eah
      });
    }

    if (wa !== null) {
      arr.push({
        label: 'WA',
        value: wa
      });
    }

    if (!arr.length) {
      return;
    }

    const html = arr.map(s => `
      <span class="eah14-score ${
        s.label === 'WA'
          ? 'eah14-score-wa'
          : ''
      }">
        ${s.label} ${fmt(s.value)}/10
      </span>
    `).join('');

    const normal =
      card.querySelector(
        '.history-main-score'
      );

    if (
      normal &&
      normal.innerHTML !== html
    ) {
      normal.innerHTML = html;
    }

    const v6 =
      card.querySelector(
        '.eah-v6-main-score'
      );

    if (v6) {
      const small =
        v6.querySelector('small');

      if (small) {
        small.textContent =
          arr.length === 2
            ? 'NOTES EAH + WA'
            : 'NOTE ' + arr[0].label;
      }

      const strong =
        v6.querySelector('strong');

      if (
        strong &&
        strong.innerHTML !== html
      ) {
        strong.innerHTML = html;
      }

      const em =
        v6.querySelector('em');

      if (em) {
        em.remove();
      }
    }

    const phases =
      card.querySelector(
        '.history-phase-scores,.eah-v6-phase-grid'
      );

    if (phases) {
      phases.hidden =
        eah === null;

      phases.style.display =
        eah === null
          ? 'none'
          : '';
    }
  }

  function renderReport(card, e) {
    const url = validPdf(
      e.report_url ||
      e.grade_report_url
    );

    if (!url) {
      return;
    }

    let actions =
      card.querySelector(
        '.history-actions,.eah-v6-evaluation-links'
      );

    if (!actions) {
      actions =
        document.createElement('div');

      actions.className =
        'history-actions';

      card.appendChild(actions);
    }

    let link = [
      ...actions.querySelectorAll('a')
    ].find(a =>
      /grade report/i.test(
        a.textContent || ''
      )
    );

    if (!link) {
      [
        ...actions.querySelectorAll('span')
      ]
        .filter(s =>
          /grade report indisponible/i.test(
            s.textContent || ''
          )
        )
        .forEach(s =>
          s.remove()
        );

      link =
        document.createElement('a');

      link.className =
        'button small';

      link.textContent =
        'Grade Report';

      actions.prepend(link);
    }

    if (link.href !== url) {
      link.href = url;
    }

    link.target = '_blank';

    link.rel =
      'noopener noreferrer';
  }

  function cardCode(card) {
    const head =
      card.querySelector(
        '.overline,.eah-v6-code'
      )?.textContent ||
      card.textContent;

    return (
      head.match(
        /\b[1-9][0-9]{2,4}[ABCDE]\b/i
      ) || []
    )[0]?.toUpperCase() || '';
  }

  function render(rows) {
    const root =
      document.getElementById(
        'profileView'
      );

    if (!root) {
      return;
    }

    const publicFlag = (
      root.querySelector(
        '.profile-tags,.eah-v6-detail-tags'
      )?.textContent || ''
    )
      .toUpperCase()
      .includes('PUBLIC');

    root.classList.toggle(
      'eah14-is-public',
      publicFlag
    );

    const byCode =
      new Map();

    rows.forEach(e => {
      const code = String(
        e.dive_code || ''
      )
        .trim()
        .toUpperCase();

      if (!byCode.has(code)) {
        byCode.set(
          code,
          []
        );
      }

      byCode.get(code).push(e);
    });

    root.querySelectorAll(
      'article.history-card,article.eah-v6-evaluation-card'
    ).forEach(card => {
      const list =
        byCode.get(
          cardCode(card)
        );

      if (!list?.length) {
        return;
      }

      const e = list.shift();

      renderScores(
        card,
        e
      );

      renderReport(
        card,
        e
      );
    });
  }

  async function refresh() {
    timer = 0;
    css();

    const label =
      document.getElementById(
        'scoreType'
      )?.closest('label')
        ?.querySelector('span');

    const caption =
      'TYPE DE NOTATION (EAH ET WA AFFICHÉES SI DISPONIBLES)';

    if (
      label &&
      label.textContent !== caption
    ) {
      label.textContent =
        caption;
    }

    const id = getId();

    if (!id) {
      return;
    }

    if (
      id === lastId &&
      Date.now() - lastTime < 20000
    ) {
      render(cached);
      return;
    }

    if (working) {
      return;
    }

    const db =
      getClient();

    if (!db) {
      return;
    }

    working = true;

    try {
      const {
        data,
        error
      } = await db.rpc(
        'eah_evaluations_json_v6',
        {
          p_eah_id: id,
          p_private_access: false
        }
      );

      if (error) {
        throw error;
      }

      lastId = id;

      lastTime =
        Date.now();

      cached =
        Array.isArray(data)
          ? data
          : [];

      render(cached);

    } catch (e) {
      console.warn(
        'EAH V14 — chargement des rapports :',
        e
      );

    } finally {
      working = false;
    }
  }

  function schedule() {
    if (timer) {
      return;
    }

    timer = setTimeout(
      refresh,
      250
    );
  }

  function start() {
    css();
    schedule();

    const root =
      document.getElementById(
        'profileView'
      );

    if (root) {
      new MutationObserver(
        schedule
      ).observe(
        root,
        {
          childList: true,
          subtree: true
        }
      );
    }

    window.addEventListener(
      'hashchange',
      schedule
    );

    document.addEventListener(
      'visibilitychange',
      () => {
        if (!document.hidden) {
          lastTime = 0;
          schedule();
        }
      }
    );
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      start,
      {
        once: true
      }
    );
  } else {
    start();
  }
})();
