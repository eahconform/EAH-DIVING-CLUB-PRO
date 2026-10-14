
/*
 * EAH DIVING V16
 * Historique public :
 * - Affichage EAH + WA lorsque disponibles
 * - Une note seule si l'autre est absente
 * - Lien Grade Report actuel
 * - Plusieurs évaluations du même plongeon
 * - Aucun commentaire privé récupéré
 */

(() => {
  'use strict';

  const ROOT = 'profileView';

  const state = {
    id: '',
    club: '',
    rows: [],
    stamp: 0,
    running: false,
    timer: 0
  };

  let sb = null;

  const number = value =>
    value === null ||
    value === undefined ||
    value === ''
      ? null
      : Number.isFinite(Number(value))
        ? Number(value)
        : null;

  const fmt = n =>
    String(n).replace('.', ',');

  const code = el =>
    String(
      el.querySelector(
        '.overline,.eah-v6-code'
      )?.textContent || ''
    ).trim().toUpperCase();

  const date = s => {
    if (!s) return '';

    const d = new Date(s);

    return Number.isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString(
          'fr-FR',
          { timeZone: 'Europe/Paris' }
        );
  };

  function current() {
    const root = document.getElementById(ROOT);

    if (
      !root ||
      !root.querySelector(
        '.history-card,.eah-v6-evaluation-card'
      )
    ) {
      return null;
    }

    const qp = new URLSearchParams(location.search);

    const value =
      root.querySelector(
        '.profile-main-info p,.eah-v6-detail-head p'
      )?.textContent ||
      qp.get('id') ||
      '';

    const match = value.match(
      /EAH-[A-Z0-9-]{5,}/i
    );

    const club = qp.get('club') || '';

    return match && club
      ? {
          root,
          id: match[0].toUpperCase(),
          club
        }
      : null;
  }

  function client() {
    if (sb) return sb;

    const cfg = window.EAH_CONFIG;

    if (
      !window.supabase?.createClient ||
      !cfg?.SUPABASE_URL ||
      !cfg?.SUPABASE_PUBLISHABLE_KEY
    ) {
      return null;
    }

    sb = window.supabase.createClient(
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

    return sb;
  }

  function scoreHtml(row) {
    const eah = number(row.eah_score);
    const wa = number(row.wa_score);

    return [
      eah === null
        ? ''
        : `<span>EAH ${fmt(eah)}/10</span>`,

      wa === null
        ? ''
        : `<span class="wa">WA ${fmt(wa)}/10</span>`
    ].filter(Boolean).join('');
  }

  function validDrive(value) {
    try {
      const u = new URL(value);

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

  function patch(card, row) {
    const html = scoreHtml(row);

    if (html) {
      const score = card.querySelector(
        '.history-main-score,.eah-v6-main-score strong'
      );

      if (score && score.innerHTML !== html) {
        score.innerHTML = html;
        score.classList.add('eah16-notes');
      }
    }

    const url = validDrive(row.report_url);

    if (url) {
      let actions = card.querySelector(
        '.history-actions,.eah-v6-evaluation-links'
      );

      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'history-actions';
        card.append(actions);
      }

      let anchor = [
        ...actions.querySelectorAll('a')
      ].find(a =>
        /grade report/i.test(a.textContent)
      );

      if (!anchor) {
        anchor = document.createElement('a');
        anchor.textContent = 'Grade Report';
        anchor.className = 'button small';
        actions.prepend(anchor);
      }

      if (anchor.href !== url) {
        anchor.href = url;
      }

      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }

    if (number(row.eah_score) === null) {
      const phases = card.querySelector(
        '.history-phase-scores,.eah-v6-phase-grid'
      );

      if (
        phases &&
        phases.style.display !== 'none'
      ) {
        phases.style.display = 'none';
      }
    }
  }

  function render(root, rows) {
    const available = new Map();

    for (const r of rows) {
      const key = String(
        r.dive_code || ''
      ).toUpperCase();

      if (!available.has(key)) {
        available.set(key, []);
      }

      available.get(key).push(r);
    }

    root.querySelectorAll(
      '.history-card,.eah-v6-evaluation-card'
    ).forEach(card => {
      const key = code(card);
      const arr = available.get(key);

      if (!arr?.length) return;

      const text = card.textContent || '';

      const found = arr.findIndex(r =>
        text.includes(
          date(r.evaluated_at || r.created_at)
        ) &&
        (
          !r.height ||
          text.includes(String(r.height))
        )
      );

      const item = arr.splice(
        found >= 0 ? found : 0,
        1
      )[0];

      patch(card, item);
    });
  }

  async function refresh() {
    state.timer = 0;

    const context = current();
    if (!context) return;

    const { id, club, root } = context;

    if (state.running) return;

    if (
      id === state.id &&
      club === state.club &&
      Date.now() - state.stamp < 20000
    ) {
      render(root, state.rows);
      return;
    }

    const api = client();
    if (!api) return;

    state.running = true;

    try {
      const { data, error } = await api.rpc(
        'eah_public_evaluation_scores_v16',
        {
          p_club_slug: club,
          p_eah_id: id
        }
      );

      if (error) throw error;

      state.id = id;
      state.club = club;
      state.rows = Array.isArray(data)
        ? data
        : [];
      state.stamp = Date.now();

      render(root, state.rows);

    } catch (e) {
      console.warn(
        'EAH V16 historique :',
        e.message || e
      );

    } finally {
      state.running = false;
    }
  }

  function schedule() {
    if (!state.timer) {
      state.timer = setTimeout(refresh, 200);
    }
  }

  function boot() {
    schedule();

    const root = document.getElementById(ROOT);

    if (root) {
      new MutationObserver(schedule).observe(
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
          state.stamp = 0;
          schedule();
        }
      }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      boot,
      { once: true }
    );
  } else {
    boot();
  }
})();
