
/*
 EAH DIVING V15
 HISTORIQUE + VILLE + SPOT

 - EAH + WA si les deux notes existent.
 - Une seule note si une seule existe.
 - Grade Report récupéré depuis Supabase.
 - Présentation adaptée au mobile.
 - Champ Ville dans le formulaire coach.
*/

(() => {

  'use strict';

  const fmt = n =>
    String(n).replace('.', ',');

  const num = v =>
    v === null ||
    v === undefined ||
    String(v).trim() === ''

      ? null

      : Number.isFinite(Number(v))
        ? Number(v)
        : null;

  let db;

  let timer;

  let busy = false;

  let lastId = '';

  let lastFetch = 0;

  let cached = [];

  function style() {

    if (
      document.getElementById(
        'eah15-style'
      )
    ) {
      return;
    }

    const e =
      document.createElement('style');

    e.id = 'eah15-style';

    e.textContent = `

      #profileView .history-card-head {
        display: grid;
        grid-template-columns:
          minmax(0,1fr) auto;
        align-items: start;
        gap: 12px;
      }

      #profileView .history-card-head > * {
        min-width: 0;
      }

      #profileView .eah15-notes {
        display: grid;
        justify-items: end;
        gap: 5px;
        color: #f4f9ff;
        font-size: 1.05rem;
        line-height: 1.3;
      }

      #profileView .eah15-notes span {
        white-space: nowrap;
        font-weight: 800;
      }

      #profileView .eah15-notes .wa {
        color: #30cfff;
      }

      #profileView .history-phase-scores {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 12px;
      }

      #profileView .history-phase-scores span {
        white-space: nowrap;
      }

      #profileView .eah-v6-main-score {
        min-width: 0;
        text-align: right;
      }

      #profileView .eah-v6-main-score strong {
        display: block;
      }

      #profileView .history-card {
        min-width: 0;
      }

      #profileView.eah15-public
      .eah-v6-feedbacks,

      #profileView.eah15-public
      .eah-v6-feedback,

      #population .eah-v6-feedbacks {
        display: none !important;
      }

      @media (max-width: 550px) {

        #profileView .eah15-notes {
          font-size: .95rem;
        }

        #profileView .history-card-head {
          gap: 7px;
        }

      }

    `;

    document.head.appendChild(e);
  }

  // Le formulaire possède déjà
  // le sélecteur Spot et Nom du lieu.

  function locationForm() {

    const form =
      document.getElementById(
        'evaluationForm'
      );

    if (!form) {
      return;
    }

    const spot =
      document.getElementById(
        'spotId'
      );

    const name =
      document.getElementById(
        'spotName'
      );

    if (
      !document.getElementById(
        'eahDiveCity'
      )
    ) {

      const label =
        document.createElement(
          'label'
        );

      label.innerHTML = `
        <span>
          Ville où le plongeon est effectué
        </span>

        <input
          id="eahDiveCity"
          type="text"
          maxlength="100"
          placeholder="Ex. : Lyon"
        >
      `;

      const anchor =
        name?.closest('label') ||
        spot?.closest('label');

      if (anchor) {
        anchor.after(label);
      }
    }

    if (
      spot &&
      name &&
      !spot.dataset.eah15Bound
    ) {

      spot.dataset.eah15Bound =
        '1';

      spot.addEventListener(
        'change',
        () => {

          const chosen =
            spot.options[
              spot.selectedIndex
            ];

          if (
            !chosen ||
            !spot.value
          ) {
            return;
          }

          const label =
            String(
              chosen.textContent || ''
            ).trim();

          const auto =
            name.dataset.eah15Auto ||
            '';

          if (
            !name.value.trim() ||
            name.value.trim() === auto
          ) {

            name.value = label;

            name.dataset.eah15Auto =
              label;
          }

          const city =
            document.getElementById(
              'eahDiveCity'
            );

          if (
            city &&
            !city.value.trim() &&
            chosen.dataset.city
          ) {

            city.value =
              chosen.dataset.city;
          }
        }
      );
    }
  }

  function profileId() {

    const root =
      document.getElementById(
        'profileView'
      );

    if (
      !root ||
      !root.querySelector(
        '.history-card,.eah-v6-evaluation-card'
      )
    ) {
      return '';
    }

    const label =
      root.querySelector(
        '.profile-main-info p,.eah-v6-detail-head p'
      )?.textContent ||
      '';

    const fromView =
      (
        label.match(
          /EAH-[A-Z0-9-]{5,}/i
        ) ||
        []
      )[0];

    const urlId =
      new URLSearchParams(
        location.search
      ).get('id') ||
      '';

    const fromUrl =
      (
        urlId.match(
          /^EAH-[A-Z0-9-]{5,}$/i
        ) ||
        []
      )[0];

    return String(
      fromView ||
      fromUrl ||
      ''
    ).toUpperCase();
  }

  function client() {

    if (db) {
      return db;
    }

    const config =
      window.EAH_CONFIG;

    if (
      !config?.SUPABASE_URL ||
      !config?.SUPABASE_PUBLISHABLE_KEY ||
      !window.supabase?.createClient
    ) {
      return null;
    }

    db =
      window.supabase.createClient(
        config.SUPABASE_URL,
        config.SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          }
        }
      );

    return db;
  }

  function diveCode(card) {

    const label =
      card.querySelector(
        '.overline,.eah-v6-code'
      )?.textContent ||
      '';

    return (
      label.match(
        /\b[1-9][0-9]{2,4}[ABCDE]\b/i
      ) ||
      []
    )[0]?.toUpperCase() ||
    '';
  }

  function pdfUrl(value) {

    try {

      const u =
        new URL(
          String(value || '')
        );

      return (
        u.protocol === 'https:' &&
        u.hostname ===
          'drive.google.com'
      )

        ? u.href

        : '';

    } catch (_) {
      return '';
    }
  }

  function setNotes(card, ev) {

    const ea = num(
      ev.eah_score
    );

    const wa = num(
      ev.wa_score
    );

    const values = [

      ea === null
        ? null
        : `
          <span>
            EAH ${fmt(ea)}/10
          </span>
        `,

      wa === null
        ? null
        : `
          <span class="wa">
            WA ${fmt(wa)}/10
          </span>
        `

    ].filter(Boolean);

    if (!values.length) {
      return;
    }

    const markup =
      `<span class="eah15-notes">` +
      values.join('') +
      `</span>`;

    const standard =
      card.querySelector(
        '.history-main-score'
      );

    if (
      standard &&
      standard.innerHTML !== markup
    ) {
      standard.innerHTML =
        markup;
    }

    const v6 =
      card.querySelector(
        '.eah-v6-main-score'
      );

    if (v6) {

      const label =
        v6.querySelector('small');

      const title =
        ea !== null &&
        wa !== null

          ? 'NOTES EAH + WA'

          : ea !== null
            ? 'NOTE EAH'
            : 'NOTE WA';

      if (
        label &&
        label.textContent !== title
      ) {

        label.textContent =
          title;
      }

      const strong =
        v6.querySelector('strong');

      if (
        strong &&
        strong.innerHTML !== markup
      ) {

        strong.innerHTML =
          markup;
      }

      v6.querySelector('em')
        ?.remove();
    }

    if (ea === null) {

      const phases =
        card.querySelector(
          '.history-phase-scores,.eah-v6-phase-grid'
        );

      if (
        phases &&
        phases.style.display !== 'none'
      ) {

        phases.style.display =
          'none';
      }
    }
  }

  function setReport(card, ev) {

    const url =
      pdfUrl(
        ev.report_url
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
        document.createElement(
          'div'
        );

      actions.className =
        'history-actions';

      card.appendChild(actions);
    }

    let link =
      Array.from(
        actions.querySelectorAll(
          'a'
        )
      ).find(a =>
        /grade report/i.test(
          a.textContent || ''
        )
      );

    if (!link) {

      link =
        document.createElement(
          'a'
        );

      link.className =
        'button small';

      link.textContent =
        'Grade Report';

      actions.prepend(link);
    }

    if (
      link.href !== url
    ) {
      link.href = url;
    }

    link.target =
      '_blank';

    link.rel =
      'noopener noreferrer';

    actions.querySelectorAll(
      'span.is-disabled'
    ).forEach(s => {

      if (
        /grade report/i.test(
          s.textContent || ''
        )
      ) {

        s.remove();
      }
    });
  }

  function paint(rows) {

    const root =
      document.getElementById(
        'profileView'
      );

    if (!root) {
      return;
    }

    const visibility =
      root.querySelector(
        '.profile-tags,.eah-v6-detail-tags'
      )?.textContent ||
      '';

    root.classList.toggle(
      'eah15-public',
      visibility
        .toUpperCase()
        .includes('PUBLIC')
    );

    const list =
      new Map();

    rows.forEach(ev => {

      const code =
        String(
          ev.dive_code || ''
        ).toUpperCase();

      if (
        !list.has(code)
      ) {

        list.set(
          code,
          []
        );
      }

      list.get(code)
        .push(ev);
    });

    root.querySelectorAll(
      '.history-card,.eah-v6-evaluation-card'
    ).forEach(card => {

      const matches =
        list.get(
          diveCode(card)
        );

      if (
        !matches?.length
      ) {
        return;
      }

      // Une même figure peut
      // apparaître plusieurs fois.
      // On prend l'évaluation suivante.

      const ev =
        matches.shift();

      setNotes(
        card,
        ev
      );

      setReport(
        card,
        ev
      );
    });
  }

  async function refresh() {

    timer = null;

    style();

    locationForm();

    const id =
      profileId();

    if (!id) {
      return;
    }

    if (
      id === lastId &&
      Date.now() - lastFetch < 20000
    ) {

      paint(cached);

      return;
    }

    if (busy) {
      return;
    }

    const supabase =
      client();

    if (!supabase) {
      return;
    }

    busy = true;

    try {

      const {
        data,
        error
      } =
        await supabase.rpc(
          'eah_evaluations_json_v6',
          {
            p_eah_id: id,
            p_private_access: false
          }
        );

      if (error) {
        throw error;
      }

      cached =
        Array.isArray(data)
          ? data
          : [];

      lastId = id;

      lastFetch =
        Date.now();

      paint(cached);

    } catch (err) {

      console.warn(
        'EAH V15 :',
        err
      );

    } finally {

      busy = false;
    }
  }

  function schedule() {

    if (timer) {
      return;
    }

    timer =
      setTimeout(
        refresh,
        200
      );
  }

  function start() {

    style();

    locationForm();

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
          subtree: true,
          childList: true
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

          lastFetch = 0;

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
