(() => {

  'use strict';


  /* ============================================================
     EAH DIVING PRO CLUB
     FRONTEND STABLE V8
     06/10/2026

     OBJECTIFS
     ------------------------------------------------------------
     - navigation indépendante de Supabase
     - un seul routeur
     - profils public / privé / NFC
     - connexion plongeur
     - connexion coach
     - carte coach
     - dashboard coach
     - évaluations
     - actualités
     - spots
     - tarifs
     - blazons
     - population
  ============================================================ */


  const CONFIG =
    window.EAH_CONFIG
    ||
    {};


  const URL_PARAMS =
    new URLSearchParams(
      window.location.search
    );


  let CLUB_SLUG =
    String(
      URL_PARAMS.get(
        'club'
      )
      ||
      ''
    )
    .trim();


  let supabaseClient =
    null;


  const state = {

    club:
      null,

    membership:
      null,

    coach:
      null,

    divers:
      [],

    evaluations:
      [],

    groups:
      [],

    spots:
      [],

    pricing:
      [],

    news:
      [],

    blazons:
      [],

    profile:
      null,

    profileHistory:
      [],

    profileBlazons:
      [],

    cardContext:
      null,

    evaluationBusy:
      false

  };


  /* ============================================================
     PAGES
  ============================================================ */


  const PAGE_IDS =
    new Set([

      'accueil',

      'grading',

      'blazons',

      'population',

      'spots',

      'actualites',

      'tarifs',

      'faire-grader',

      'club',

      'profil',

      'evaluation',

      'olympique',

      'freestyle',

      'highdiving',

      'ange'

    ]);


  /* ============================================================
     CRITERES EAH
  ============================================================ */


  const CRITERIA = {

    D: [

      [
        'D1',
        'Coordination / élan'
      ],

      [
        'D2',
        'Impulsion / détente / élévation'
      ],

      [
        'D3',
        'Trajectoire verticale'
      ],

      [
        'D4',
        'Temps de fixation'
      ],

      [
        'D5',
        'Amplitude des bras'
      ]

    ],


    T: [

      [
        'T1',
        'Vitesse des rotations'
      ],

      [
        'T2',
        'Saltos et/ou vrilles contrôlés'
      ],

      [
        'T3',
        'Ligne / tenue / position du corps'
      ],

      [
        'T4',
        'Ouverture'
      ],

      [
        'T5',
        'Continuité / rythme'
      ]

    ],


    E: [

      [
        'E1',
        'Angle vertical'
      ],

      [
        'E2',
        'Éclaboussures / tolérance discipline'
      ],

      [
        'E3',
        'Position des bras'
      ],

      [
        'E4',
        'Jambes tendues et serrées'
      ],

      [
        'E5',
        "Axe d'entrée"
      ]

    ]

  };


  /* ============================================================
     NOMS DES PLONGEONS
  ============================================================ */


  const DIVE_NAMES = {

    '001A':
      'Chute avant droite',

    '001B':
      'Chute avant carpée',

    '001C':
      'Chute avant groupée',

    '002A':
      'Chute arrière droite',

    '002AS':
      'Plongeon arrière droit en sautant',

    '100A':
      'Chandelle avant droite',

    '101C':
      'Plongeon avant groupé',

    '102C':
      '1 salto avant groupé',

    '103C':
      '1½ salto avant groupé',

    '104C':
      '2 saltos avant groupés',

    '105C':
      '2½ saltos avant groupés',

    '105B':
      '2½ saltos avant carpés',

    '107C':
      '3½ saltos avant groupés',

    '107B':
      '3½ saltos avant carpés',

    '109C':
      '4½ saltos avant groupés',

    '109B':
      '4½ saltos avant carpés',

    '1011C':
      '5½ saltos avant groupés',

    '201C':
      'Plongeon arrière groupé',

    '201B':
      'Plongeon arrière carpé',

    '202C':
      '1 salto arrière groupé',

    '203C':
      '1½ salto arrière groupé',

    '203B':
      '1½ salto arrière carpé',

    '204C':
      '2 saltos arrière groupés',

    '205C':
      '2½ saltos arrière groupés',

    '205B':
      '2½ saltos arrière carpés',

    '207C':
      '3½ saltos arrière groupés',

    '207B':
      '3½ saltos arrière carpés',

    '209C':
      '4½ saltos arrière groupés',

    '301C':
      'Plongeon renversé groupé',

    '301B':
      'Plongeon renversé carpé',

    '302C':
      '1 salto renversé groupé',

    '303C':
      '1½ salto renversé groupé',

    '303B':
      '1½ salto renversé carpé',

    '304C':
      '2 saltos renversés groupés',

    '305C':
      '2½ saltos renversés groupés',

    '305B':
      '2½ saltos renversés carpés',

    '307C':
      '3½ saltos renversés groupés',

    '307B':
      '3½ saltos renversés carpés',

    '309C':
      '4½ saltos renversés groupés',

    '401C':
      'Plongeon retourné groupé',

    '402C':
      '1 salto retourné groupé',

    '403C':
      '1½ salto retourné groupé',

    '403B':
      '1½ salto retourné carpé',

    '404C':
      '2 saltos retournés groupés',

    '405C':
      '2½ saltos retournés groupés',

    '405B':
      '2½ saltos retournés carpés',

    '407C':
      '3½ saltos retournés groupés',

    '407B':
      '3½ saltos retournés carpés',

    '409C':
      '4½ saltos retournés groupés',

    '5122A':
      '1 salto avant + 1 vrille',

    '5124D':
      '1 salto avant + 2 vrilles',

    '5132D':
      '1½ salto avant + 1 vrille',

    '5134D':
      '1½ salto avant + 2 vrilles',

    '5152B':
      '2½ saltos avant + 1 vrille',

    '5153B':
      '2½ saltos avant + 1½ vrille',

    '5154B':
      '2½ saltos avant + 2 vrilles',

    '5162B':
      '3 saltos avant + 1 vrille',

    '5163B':
      '3 saltos avant + 1½ vrille',

    '5211A':
      'Plongeon arrière + ½ vrille',

    '5221A':
      '1 salto arrière + ½ vrille',

    '5223D':
      '1 salto arrière + 1½ vrille',

    '5231D':
      '1½ salto arrière + ½ vrille',

    '5233D':
      '1½ salto arrière + 1½ vrille',

    '5235D':
      '1½ salto arrière + 2½ vrilles',

    '5253B':
      '2½ saltos arrière + 1½ vrille',

    '5255B':
      '2½ saltos arrière + 2½ vrilles',

    '5257B':
      '2½ saltos arrière + 3½ vrilles',

    '5263B':
      '3 saltos arrière + 1½ vrille',

    '5321A':
      '1 salto renversé + ½ vrille',

    '5323D':
      '1 salto renversé + 1½ vrille',

    '5331D':
      '1½ salto renversé + ½ vrille',

    '5333D':
      '1½ salto renversé + 1½ vrille',

    '5335D':
      '1½ salto renversé + 2½ vrilles',

    '5337D':
      '1½ salto renversé + 3½ vrilles',

    '5339D':
      '1½ salto renversé + 4½ vrilles',

    '5353B':
      '2½ saltos renversés + 1½ vrille',

    '616C':
      'Équilibre avant + 3 saltos groupés',

    '6243D':
      'Équilibre arrière + 2 saltos + 1½ vrille',

    '626C':
      'Équilibre arrière + 3 saltos groupés',

    '628C':
      'Équilibre arrière + 4 saltos groupés'

  };


  /* ============================================================
     OUTILS DOM
  ============================================================ */


  function qs(
    selector,
    root = document
  ) {

    return root.querySelector(
      selector
    );

  }


  function qsa(
    selector,
    root = document
  ) {

    return Array.from(

      root.querySelectorAll(
        selector
      )

    );

  }


  function byId(
    id
  ) {

    return document.getElementById(
      id
    );

  }


  function val(
    id
  ) {

    const element =
      byId(
        id
      );


    return element
      ?
      element.value
      :
      '';

  }


  function setText(
    id,
    text
  ) {

    const element =
      byId(
        id
      );


    if (!element) {

      return;

    }


    element.textContent =
      text == null
      ?
      ''
      :
      String(
        text
      );

  }


  /* ============================================================
     SECURITE HTML
  ============================================================ */


  function escapeHtml(
    value
  ) {

    return String(
      value ?? ''
    )

    .replace(
      /&/g,
      '&amp;'
    )

    .replace(
      /</g,
      '&lt;'
    )

    .replace(
      />/g,
      '&gt;'
    )

    .replace(
      /"/g,
      '&quot;'
    )

    .replace(
      /'/g,
      '&#039;'
    );

  }


  function escapeAttr(
    value
  ) {

    return escapeHtml(
      value
    );

  }


  /* ============================================================
     OUTILS
  ============================================================ */


  function firstObject(
    value
  ) {

    if (
      Array.isArray(
        value
      )
    ) {

      return value[0]
      ||
      null;

    }


    return (
      value
      &&
      typeof value ===
        'object'
    )
      ?
      value
      :
      null;

  }


  function safeJson(
    value,
    fallback = {}
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

      return fallback;

    }


    try {

      return JSON.parse(
        value
      );

    } catch (_) {

      return fallback;

    }

  }


  function numberOrNull(
    value
  ) {

    if (
      value ===
        null
      ||
      value ===
        ''
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


  function fmtNumber(
    value
  ) {

    const number =
      numberOrNull(
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


  function fmtDate(
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


    return new Intl.DateTimeFormat(

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

  }


  function normalizeVisibility(
    value
  ) {

    const visibility =
      String(
        value || ''
      )

      .normalize(
        'NFD'
      )

      .replace(
        /[\u0300-\u036f]/g,
        ''
      )

      .trim()

      .toUpperCase();


    return (
      visibility ===
        'PUBLIC'
    )
      ?
      'PUBLIC'
      :
      'PRIVATE';

  }


  function normalizeEahId(
    value
  ) {

    let id =
      String(
        value || ''
      )

      .trim()

      .toUpperCase()

      .replace(
        /\s+/g,
        ''
      );


    if (
      id
      &&
      !id.startsWith(
        'EAH-'
      )
    ) {

      id =
        'EAH-'
        +
        id;

    }


    return id;

  }


  function normalizeDiveCode(
    value
  ) {

    return String(
      value || ''
    )

    .trim()

    .toUpperCase()

    .replace(
      /\s+/g,
      ''
    );

  }


  /* ============================================================
     MESSAGES
  ============================================================ */


  function showMessage(
    id,
    text,
    type = ''
  ) {

    const element =
      byId(
        id
      );


    if (!element) {

      return;

    }


    element.textContent =
      text || '';


    element.classList.remove(

      'success',

      'error',

      'warning'

    );


    if (type) {

      element.classList.add(
        type
      );

    }

  }


  function toast(
    message,
    type = 'info'
  ) {

    const container =
      byId(
        'toastContainer'
      );


    if (!container) {

      return;

    }


    const element =
      document.createElement(
        'div'
      );


    element.className =
      'toast '
      +
      type;


    element.textContent =
      String(
        message || ''
      );


    container.appendChild(
      element
    );


    window.setTimeout(
      () => {

        element.remove();

      },
      4000
    );

  }


  /* ============================================================
     SUPABASE

     IMPORTANT :
     Cette fonction est aussi exposée dans window
     pour supprimer définitivement l'erreur :
     requireSupabase is not defined
  ============================================================ */


  function requireSupabase() {

    if (
      supabaseClient
    ) {

      return supabaseClient;

    }


    if (
      !CONFIG.SUPABASE_URL
      ||
      !CONFIG.SUPABASE_PUBLISHABLE_KEY
    ) {

      throw new Error(
        'Configuration Supabase absente.'
      );

    }


    if (
      !window.supabase
      ||
      typeof window.supabase.createClient !==
        'function'
    ) {

      throw new Error(
        "Supabase JS n'est pas chargé."
      );

    }


    supabaseClient =
      window.supabase.createClient(

        CONFIG.SUPABASE_URL,

        CONFIG.SUPABASE_PUBLISHABLE_KEY,

        {

          auth: {

            persistSession:
              true,

            autoRefreshToken:
              true,

            detectSessionInUrl:
              true

          }

        }

      );


    window.EAH_SUPABASE_CLIENT =
      supabaseClient;


    return supabaseClient;

  }


  window.requireSupabase =
    requireSupabase;


  /* ============================================================
     NAVIGATION

     CE MODULE NE DEPEND PAS DE SUPABASE.

     Même si Supabase plante,
     les catégories du site continuent
     de fonctionner.
  ============================================================ */


  function closeMobileMenu() {

    const navigation =
      byId(
        'navigation'
      );


    const button =
      byId(
        'mobileMenu'
      );


    navigation
      ?.classList
      .remove(
        'open'
      );


    navigation
      ?.classList
      .remove(
        'active'
      );


    button
      ?.classList
      .remove(
        'open'
      );


    button
      ?.classList
      .remove(
        'active'
      );

  }


  function showPage(
    pageName,
    options = {}
  ) {

    const page =
      PAGE_IDS.has(
        pageName
      )
      ?
      pageName
      :
      'accueil';


    qsa(
      '.page'
    )
    .forEach(
      function(section) {

        section.classList.toggle(

          'active',

          section.id ===
          page

        );

      }
    );


    document
      .documentElement
      .classList
      .toggle(

        'eah-page-club',

        page ===
          'club'
        ||
        page ===
          'evaluation'

      );


    qsa(
      '[data-page]'
    )
    .forEach(
      function(link) {

        link.classList.toggle(

          'active',

          link.dataset.page ===
          page

        );

      }
    );


    closeMobileMenu();


    if (
      options.updateHash !==
      false
    ) {

      const nextHash =
        '#'
        +
        page;


      if (
        window.location.hash !==
        nextHash
      ) {

        history.pushState(

          null,

          '',

          nextHash

        );

      }

    }


    if (
      options.scroll !==
      false
    ) {

      window.scrollTo({

        top:
          0,

        behavior:
          'auto'

      });

    }


    if (
      page ===
      'evaluation'
    ) {

      updateEvaluationAccess();

    }


    return page;

  }


  window.EAHRouter = {

    showPage

  };


  window.showPage =
    showPage;


  function pageFromHash() {

    const raw =
      String(
        window.location.hash ||
        ''
      )

      .replace(
        /^#/,
        ''
      )

      .trim();


    return PAGE_IDS.has(
      raw
    )
      ?
      raw
      :
      'accueil';

  }


  function initRouter() {


    /*
      Navigation centrale.
    */


    document.addEventListener(

      'click',

      function(event) {


        const pageLink =
          event.target.closest(
            '[data-page]'
          );


        if (
          pageLink
        ) {

          const page =
            pageLink.dataset.page;


          if (
            PAGE_IDS.has(
              page
            )
          ) {

            event.preventDefault();


            showPage(
              page
            );


            return;

          }

        }


        const pageButton =
          event.target.closest(
            '[data-page-button]'
          );


        if (
          pageButton
        ) {

          const page =
            pageButton
              .dataset
              .pageButton;


          if (
            PAGE_IDS.has(
              page
            )
          ) {

            event.preventDefault();


            showPage(
              page
            );


            return;

          }

        }


        const openCard =
          event.target.closest(
            '[data-open]'
          );


        if (
          openCard
        ) {

          const page =
            openCard
              .dataset
              .open;


          if (
            PAGE_IDS.has(
              page
            )
          ) {

            event.preventDefault();


            showPage(
              page
            );

          }

        }

      }

    );


    /*
      Navigation bouton précédent
      / modification du hash.
    */


    window.addEventListener(

      'hashchange',

      function() {

        showPage(

          pageFromHash(),

          {

            updateHash:
              false

          }

        );

      }

    );


    /*
      Menu mobile.
    */


    byId(
      'mobileMenu'
    )
    ?.addEventListener(

      'click',

      function() {

        const navigation =
          byId(
            'navigation'
          );


        const button =
          byId(
            'mobileMenu'
          );


        navigation
          ?.classList
          .toggle(
            'open'
          );


        navigation
          ?.classList
          .toggle(
            'active'
          );


        button
          ?.classList
          .toggle(
            'open'
          );


        button
          ?.classList
          .toggle(
            'active'
          );

      }

    );


    /*
      Dropdown disciplines.
    */


    qsa(
      '.nav-dropdown-button'
    )
    .forEach(
      function(button) {

        button.addEventListener(

          'click',

          function(event) {

            event.preventDefault();

            event.stopPropagation();


            button
              .closest(
                '.nav-dropdown'
              )
              ?.classList
              .toggle(
                'open'
              );

          }

        );

      }
    );


    /*
      Fermer dropdown
      en cliquant ailleurs.
    */


    document.addEventListener(

      'click',

      function(event) {

        if (
          !event.target.closest(
            '.nav-dropdown'
          )
        ) {

          qsa(
            '.nav-dropdown.open'
          )
          .forEach(
            function(element) {

              element.classList.remove(
                'open'
              );

            }
          );

        }

      }

    );


    /*
      Première page.
    */


    showPage(

      pageFromHash(),

      {

        updateHash:
          false,

        scroll:
          false

      }

    );

  }


  /* ============================================================
     MODAL
  ============================================================ */


  function openModal(
    html
  ) {

    const modal =
      byId(
        'siteModal'
      );


    const content =
      byId(
        'modalContent'
      );


    if (
      !modal
      ||
      !content
    ) {

      return;

    }


    content.innerHTML =
      html;


    modal.classList.add(

      'open',

      'active'

    );


    modal.setAttribute(

      'aria-hidden',

      'false'

    );


    document
      .body
      .classList
      .add(
        'modal-open'
      );

  }


  function closeModal() {

    const modal =
      byId(
        'siteModal'
      );


    if (!modal) {

      return;

    }


    modal.classList.remove(

      'open',

      'active'

    );


    modal.setAttribute(

      'aria-hidden',

      'true'

    );


    document
      .body
      .classList
      .remove(
        'modal-open'
      );

  }


  function initModal() {


    document.addEventListener(

      'click',

      function(event) {

        if (
          event.target.closest(
            '[data-close-modal]'
          )
        ) {

          event.preventDefault();


          closeModal();

        }

      }

    );


    document.addEventListener(

      'keydown',

      function(event) {

        if (
          event.key ===
          'Escape'
        ) {

          closeModal();

        }

      }

    );

  }


  /* ============================================================
     CHARGER UNE TABLE PUBLIQUE
  ============================================================ */


  async function loadTableSafe(
    table,
    filterActive = true
  ) {

    try {


      let query =
        requireSupabase()
          .from(
            table
          )
          .select(
            '*'
          );


      if (
        filterActive
      ) {

        query =
          query.eq(
            'active',
            true
          );

      }


      const {

        data,

        error

      } =
        await query;


      if (
        error
      ) {

        throw error;

      }


      return data || [];


    } catch (
      error
    ) {

      console.warn(

        'EAH '
        +
        table
        +
        ':',

        error

      );


      return [];

    }

  }


  /* ============================================================
     DONNEES PUBLIQUES
  ============================================================ */


  async function loadPublicData() {


    const [

      blazons,

      spots,

      news,

      pricing

    ] =
      await Promise.all([

        loadTableSafe(
          'blazon_definitions',
          true
        ),

        loadTableSafe(
          'spots',
          true
        ),

        loadTableSafe(
          'news',
          true
        ),

        loadTableSafe(
          'pricing',
          true
        )

      ]);


    state.blazons =
      blazons.sort(
        function(a,b) {

          return (

            Number(
              a.sort_order
              ||
              a.order
              ||
              0
            )

            -

            Number(
              b.sort_order
              ||
              b.order
              ||
              0
            )

          );

        }
      );


    state.spots =
      spots.sort(
        function(a,b) {

          return String(
            a.city ||
            ''
          )
          .localeCompare(

            String(
              b.city ||
              ''
            ),

            'fr'

          );

        }
      );


    state.news =
      news.sort(
        function(a,b) {

          return (

            new Date(
              b.published_at
              ||
              b.date
              ||
              0
            )

            -

            new Date(
              a.published_at
              ||
              a.date
              ||
              0
            )

          );

        }
      );


    state.pricing =
      pricing.sort(
        function(a,b) {

          return (

            Number(
              a.sort_order
              ||
              a.order
              ||
              0
            )

            -

            Number(
              b.sort_order
              ||
              b.order
              ||
              0
            )

          );

        }
      );


    renderBlazons();

    renderSpots();

    renderNews();

    renderPricing();

    renderSpotSelect();

  }


  /* ============================================================
     BLAZONS
  ============================================================ */


  function renderBlazons() {

    const root =
      byId(
        'blazonGrid'
      );


    if (!root) {

      return;

    }


    if (
      !state.blazons.length
    ) {

      root.innerHTML =

        '<div class="loading-panel">'
        +
        'Les blazons ne sont pas disponibles pour le moment.'
        +
        '</div>';


      return;

    }


    root.innerHTML =
      state.blazons
      .map(
        function(
          item,
          index
        ) {


          const name =

            item.name

            ||

            item.blazon_name

            ||

            item.key

            ||

            'Blazon EAH';


          const image =

            item.image_url

            ||

            item.photo_url

            ||

            '';


          return `

            <article

              class="blazon-card"

              data-blazon-index="${index}"

            >


              ${

                image

                ?

                `

                <img

                  src="${escapeAttr(image)}"

                  alt="${escapeAttr(name)}"

                  loading="eager"

                >

                `

                :

                ''

              }


              <div class="blazon-card-content">


                <span class="overline">

                  PROGRESSION

                </span>


                <h3>

                  ${escapeHtml(name)}

                </h3>


                <p>

                  ${escapeHtml(
                    item.summary
                    ||
                    item.description
                    ||
                    'Voir les conditions du blazon.'
                  )}

                </p>


              </div>


            </article>

          `;

        }
      )
      .join(
        ''
      );

  }


  /* ============================================================
     SPOTS
  ============================================================ */


  function renderSpots() {

    const root =
      byId(
        'spotsGrid'
      );


    if (!root) {

      return;

    }


    if (
      !state.spots.length
    ) {

      root.innerHTML =

        '<div class="loading-panel">'
        +
        'Aucun spot disponible.'
        +
        '</div>';


      return;

    }


    root.innerHTML =
      state.spots
      .map(
        function(
          spot,
          index
        ) {

          return `

            <article

              class="spot-card"

              data-spot-index="${index}"

            >


              ${

                spot.photo_url

                ?

                `

                <img

                  src="${escapeAttr(
                    spot.photo_url
                  )}"

                  alt="${escapeAttr(
                    spot.name ||
                    'Spot EAH'
                  )}"

                  loading="eager"

                >

                `

                :

                ''

              }


              <div>


                <span class="overline">

                  ${escapeHtml(
                    spot.city ||
                    'SPOT EAH'
                  )}

                </span>


                <h3>

                  ${escapeHtml(
                    spot.name ||
                    'Spot'
                  )}

                </h3>


                <p>

                  ${escapeHtml(
                    spot.heights ||
                    ''
                  )}

                </p>


              </div>


            </article>

          `;

        }
      )
      .join(
        ''
      );

  }


  /* ============================================================
     ACTUALITES
  ============================================================ */


  function renderNews() {

    const root =
      byId(
        'newsGrid'
      );


    if (!root) {

      return;

    }


    if (
      !state.news.length
    ) {

      root.innerHTML =

        '<div class="loading-panel">'
        +
        'Aucune actualité disponible.'
        +
        '</div>';


      return;

    }


    root.innerHTML =
      state.news
      .map(
        function(
          item,
          index
        ) {

          return `

            <article

              class="news-card"

              data-news-index="${index}"

            >


              ${

                item.image_url

                ?

                `

                <img

                  src="${escapeAttr(
                    item.image_url
                  )}"

                  alt="${escapeAttr(
                    item.title ||
                    'Actualité'
                  )}"

                  loading="eager"

                >

                `

                :

                ''

              }


              <div>


                <span class="overline">

                  ${escapeHtml(
                    item.category
                    ||
                    fmtDate(
                      item.published_at
                      ||
                      item.date
                    )
                  )}

                </span>


                <h3>

                  ${escapeHtml(
                    item.title ||
                    'Actualité'
                  )}

                </h3>


                <p>

                  ${escapeHtml(
                    item.summary ||
                    ''
                  )}

                </p>


              </div>


            </article>

          `;

        }
      )
      .join(
        ''
      );

  }


  /* ============================================================
     TARIFS
  ============================================================ */


  function renderPricing() {

    const root =
      byId(
        'pricingGrid'
      );


    if (!root) {

      return;

    }


    if (
      !state.pricing.length
    ) {

      root.innerHTML =

        '<div class="loading-panel">'
        +
        'Les offres ne sont pas disponibles pour le moment.'
        +
        '</div>';


      return;

    }


    root.innerHTML =
      state.pricing
      .map(
        function(item) {


          const price =

            item.price ==
            null

            ?

            ''

            :

            fmtNumber(
              item.price
            )
            +
            ' €';


          return `

            <article

              class="pricing-card ${item.featured ? 'featured' : ''}"

            >


              <span class="overline">

                EAH DIVING PRO

              </span>


              <h3>

                ${escapeHtml(
                  item.name
                  ||
                  item.offer_name
                  ||
                  'Offre'
                )}

              </h3>


              ${

                price

                ?

                `

                <strong class="price">

                  ${escapeHtml(price)}

                </strong>

                `

                :

                ''

              }


              <p>

                ${escapeHtml(
                  item.description ||
                  ''
                )}

              </p>


              ${

                item.renewal

                ?

                `

                <small>

                  ${escapeHtml(
                    item.renewal
                  )}

                </small>

                `

                :

                ''

              }


            </article>

          `;

        }
      )
      .join(
        ''
      );

  }


  /* ============================================================
     SELECT SPOTS EVALUATION
  ============================================================ */


  function renderSpotSelect() {

    const select =
      byId(
        'spotId'
      );


    if (!select) {

      return;

    }


    const current =
      select.value;


    select.innerHTML =

      '<option value="">'
      +
      'Autre / non répertorié'
      +
      '</option>'

      +

      state.spots
      .map(
        function(spot) {

          return `

            <option

              value="${escapeAttr(
                spot.id ||
                ''
              )}"

            >

              ${escapeHtml(

                (
                  spot.name ||
                  'Spot'
                )

                +

                (
                  spot.city
                  ?
                  ' — ' +
                  spot.city
                  :
                  ''
                )

              )}

            </option>

          `;

        }
      )
      .join(
        ''
      );


    if (
      current
    ) {

      select.value =
        current;

    }

  }


  /* ============================================================
     CLIC BLAZONS / SPOTS / ACTUALITES
  ============================================================ */


  function bindPublicCards() {


    document.addEventListener(

      'click',

      function(event) {


        /*
          BLAZON
        */


        const blazonCard =
          event.target.closest(
            '[data-blazon-index]'
          );


        if (
          blazonCard
        ) {


          const item =
            state.blazons[

              Number(
                blazonCard
                  .dataset
                  .blazonIndex
              )

            ];


          if (!item) {

            return;

          }


          const rules =
            safeJson(

              item.rules_json

              ||

              item.rules

              ||

              {},

              {}

            );


          const rulesText =
            typeof rules ===
              'string'
            ?
            rules
            :
            JSON.stringify(
              rules,
              null,
              2
            );


          openModal(`

            <span class="overline">

              BLAZON EAH

            </span>


            <h2>

              ${escapeHtml(
                item.name
                ||
                item.blazon_name
                ||
                item.key
                ||
                'Blazon'
              )}

            </h2>


            ${

              item.image_url

              ?

              `

              <img

                class="modal-image"

                src="${escapeAttr(
                  item.image_url
                )}"

                alt=""

              >

              `

              :

              ''

            }


            <p>

              ${escapeHtml(
                item.description
                ||
                item.summary
                ||
                ''
              )}

            </p>


            ${

              rulesText
              &&
              rulesText !==
                '{}'

              ?

              `

              <pre class="modal-rules">

${escapeHtml(rulesText)}

              </pre>

              `

              :

              ''

            }

          `);


          return;

        }


        /*
          SPOT
        */


        const spotCard =
          event.target.closest(
            '[data-spot-index]'
          );


        if (
          spotCard
        ) {


          const spot =
            state.spots[

              Number(
                spotCard
                  .dataset
                  .spotIndex
              )

            ];


          if (!spot) {

            return;

          }


          openModal(`

            <span class="overline">

              SPOT EAH

            </span>


            <h2>

              ${escapeHtml(
                spot.name ||
                'Spot'
              )}

            </h2>


            ${

              spot.photo_url

              ?

              `

              <img

                class="modal-image"

                src="${escapeAttr(
                  spot.photo_url
                )}"

                alt=""

              >

              `

              :

              ''

            }


            <p>

              <strong>

                ${escapeHtml(
                  spot.city ||
                  ''
                )}

              </strong>

            </p>


            ${

              spot.heights

              ?

              `

              <p>

                Hauteurs :
                ${escapeHtml(
                  spot.heights
                )}

              </p>

              `

              :

              ''

            }


            ${

              spot.address

              ?

              `

              <p>

                ${escapeHtml(
                  spot.address
                )}

              </p>

              `

              :

              ''

            }


            ${

              spot.description

              ?

              `

              <p>

                ${escapeHtml(
                  spot.description
                )}

              </p>

              `

              :

              ''

            }

          `);


          return;

        }


        /*
          ACTUALITE
        */


        const newsCard =
          event.target.closest(
            '[data-news-index]'
          );


        if (
          newsCard
        ) {


          const item =
            state.news[

              Number(
                newsCard
                  .dataset
                  .newsIndex
              )

            ];


          if (!item) {

            return;

          }


          openModal(`

            <span class="overline">

              ${escapeHtml(
                item.category ||
                'EAH DIVING'
              )}

            </span>


            <h2>

              ${escapeHtml(
                item.title ||
                'Actualité'
              )}

            </h2>


            <p class="muted">

              ${escapeHtml(
                fmtDate(
                  item.published_at
                  ||
                  item.date
                )
              )}

            </p>


            ${

              item.image_url

              ?

              `

              <img

                class="modal-image"

                src="${escapeAttr(
                  item.image_url
                )}"

                alt=""

              >

              `

              :

              ''

            }


            ${

              item.video_url

              ?

              `

              <p>

                <a

                  class="button small"

                  href="${escapeAttr(
                    item.video_url
                  )}"

                  target="_blank"

                  rel="noopener"

                >

                  Voir la vidéo

                </a>

              </p>

              `

              :

              ''

            }


            <div class="article-content">

              ${escapeHtml(
                item.content
                ||
                item.summary
                ||
                ''
              )
              .replace(
                /\n/g,
                '<br>'
              )}

            </div>


            ${

              item.link_url

              ?

              `

              <p>

                <a

                  class="button secondary small"

                  href="${escapeAttr(
                    item.link_url
                  )}"

                  target="_blank"

                  rel="noopener"

                >

                  En savoir plus

                </a>

              </p>

              `

              :

              ''

            }

          `);

        }

      }

    );

  }


  /* ============================================================
     RPC AVEC PLUSIEURS SIGNATURES POSSIBLES
  ============================================================ */


  async function rpcAttempt(
    name,
    payloads
  ) {

    let lastError =
      null;


    for (
      const payload
      of payloads
    ) {


      try {


        const {

          data,

          error

        } =
          await requireSupabase()
            .rpc(
              name,
              payload
            );


        if (
          !error
        ) {

          return data;

        }


        lastError =
          error;


      } catch (
        error
      ) {

        lastError =
          error;

      }

    }


    throw (

      lastError

      ||

      new Error(
        'RPC '
        +
        name
        +
        ' indisponible.'
      )

    );

  }


  /* ============================================================
     SHA256
  ============================================================ */


  async function sha256Hex(
    text
  ) {

    const bytes =
      new TextEncoder()
        .encode(
          String(
            text || ''
          )
        );


    const digest =
      await crypto
        .subtle
        .digest(

          'SHA-256',

          bytes

        );


    return Array
      .from(
        new Uint8Array(
          digest
        )
      )
      .map(
        function(byte) {

          return byte
            .toString(
              16
            )
            .padStart(
              2,
              '0'
            );

        }
      )
      .join(
        ''
      );

  }


  /* ============================================================
     POPULATION
  ============================================================ */


  async function searchPopulation() {


    const code =
      normalizeDiveCode(
        val(
          'populationCode'
        )
      );


    const name =
      String(
        val(
          'populationName'
        )
        ||
        ''
      )
      .trim();


    const root =
      byId(
        'populationResults'
      );


    if (!root) {

      return;

    }


    if (
      !code
      &&
      !name
    ) {

      root.innerHTML =

        '<div class="loading-panel">'
        +
        'Entre un code, un nom ou un prénom.'
        +
        '</div>';


      return;

    }


    root.innerHTML =

      '<div class="loading-panel">'
      +
      'Recherche…'
      +
      '</div>';


    let rows =
      [];


    let rpcError =
      null;


    try {


      const data =
        await rpcAttempt(

          'eah_population_search_v3',

          [

            {

              p_dive_code:
                code ||
                null,

              p_search:
                name ||
                null

            },

            {

              p_dive_code:
                code ||
                null,

              p_name:
                name ||
                null

            },

            {

              p_code:
                code ||
                null,

              p_query:
                name ||
                null

            },

            {

              p_club_slug:
                CLUB_SLUG ||
                null,

              p_dive_code:
                code ||
                null,

              p_search:
                name ||
                null

            }

          ]

        );


      rows =
        Array.isArray(
          data
        )
        ?
        data
        :
        (
          data?.results
          ||
          data?.items
          ||
          []
        );


    } catch (
      error
    ) {

      rpcError =
        error;

    }


    /*
      Fallback direct pour une recherche nom/prénom.
    */


    if (
      !rows.length
      &&
      name
    ) {


      try {


        const clean =
          name

          .replace(
            /[,%()]/g,
            ' '
          )

          .trim();


        const {

          data,

          error

        } =
          await requireSupabase()

          .from(
            'divers'
          )

          .select(

            'eah_id,first_name,last_name,sex,current_blazon,profile_visibility,club_slug,photo_url,public_name,public_photo,active'

          )

          .eq(
            'active',
            true
          )

          .or(

            'first_name.ilike.%'
            +
            clean
            +
            '%,last_name.ilike.%'
            +
            clean
            +
            '%'

          )

          .limit(
            50
          );


        if (
          !error
        ) {

          rows =
            data || [];

        }


      } catch (_) {}

    }


    if (
      !rows.length
      &&
      rpcError
    ) {

      console.warn(
        'Population RPC:',
        rpcError
      );

    }


    renderPopulationResults(
      rows
    );

  }


  function renderPopulationResults(
    rows
  ) {

    const root =
      byId(
        'populationResults'
      );


    if (!root) {

      return;

    }


    if (
      !rows
      ||
      !rows.length
    ) {

      root.innerHTML =

        '<div class="loading-panel">'
        +
        'Aucun résultat.'
        +
        '</div>';


      return;

    }


    root.innerHTML =
      rows
      .map(
        function(
          row,
          index
        ) {


          const eahId =

            row.eah_id

            ||

            row.EAH_ID

            ||

            '';


          const visibility =
            normalizeVisibility(

              row.profile_visibility

              ||

              row.visibility

            );


          const isPublic =
            visibility ===
            'PUBLIC';


          const first =
            row.first_name
            ||
            row.firstName
            ||
            '';


          const last =
            row.last_name
            ||
            row.lastName
            ||
            '';


          const display =

            row.diver_display

            ||

            row.public_name_display

            ||

            [
              first,
              last
            ]
            .filter(
              Boolean
            )
            .join(
              ' '
            )

            ||

            eahId

            ||

            'Plongeur EAH';


          const score =

            row.eah_score

            ??

            row.EAH_SCORE

            ??

            row.score;


          const diveCode =

            row.dive_code

            ||

            row.DIVE_CODE

            ||

            '';


          const clubSlug =

            row.club_slug

            ||

            row.CLUB_SLUG

            ||

            CLUB_SLUG

            ||

            '';


          return `

            <article

              class="population-card"

              data-pop-index="${index}"

            >


              <div>


                <span class="overline">

                  ${escapeHtml(
                    isPublic
                    ?
                    'PROFIL PUBLIC'
                    :
                    'PROFIL PRIVÉ'
                  )}

                </span>


                <h3>

                  ${escapeHtml(
                    display
                  )}

                </h3>


                <p>

                  ${escapeHtml(
                    eahId
                  )}

                </p>


                ${

                  diveCode

                  ?

                  `

                  <p>

                    <strong>

                      ${escapeHtml(
                        diveCode
                      )}

                    </strong>

                    ${

                      score != null

                      ?

                      ' — EAH '
                      +
                      escapeHtml(
                        fmtNumber(
                          score
                        )
                      )
                      +
                      '/10'

                      :

                      ''

                    }

                  </p>

                  `

                  :

                  ''

                }


                ${

                  row.current_blazon

                  ?

                  `

                  <p>

                    ${escapeHtml(
                      row.current_blazon
                    )}

                  </p>

                  `

                  :

                  ''

                }


              </div>


              ${

                isPublic

                ?

                `

                <button

                  type="button"

                  class="button small"

                  data-public-profile="${escapeAttr(
                    eahId
                  )}"

                  data-club-slug="${escapeAttr(
                    clubSlug
                  )}"

                >

                  Voir le profil

                </button>

                `

                :

                `

                <span class="badge">

                  Détails privés

                </span>

                `

              }


            </article>

          `;

        }
      )
      .join(
        ''
      );

  }


  function bindPopulation() {


    byId(
      'populationSearchButton'
    )
    ?.addEventListener(

      'click',

      searchPopulation

    );


    [
      'populationCode',
      'populationName'
    ]
    .forEach(
      function(id) {

        byId(
          id
        )
        ?.addEventListener(

          'keydown',

          function(event) {

            if (
              event.key ===
              'Enter'
            ) {

              event.preventDefault();


              searchPopulation();

            }

          }

        );

      }
    );


    document.addEventListener(

      'click',

      function(event) {


        const button =
          event.target.closest(
            '[data-public-profile]'
          );


        if (!button) {

          return;

        }


        const eahId =
          button
            .dataset
            .publicProfile;


        const clubSlug =
          button
            .dataset
            .clubSlug

          ||

          CLUB_SLUG;


        if (!eahId) {

          return;

        }


        loadPublicProfile(

          eahId,

          clubSlug

        );

      }

    );

  }


  /* ============================================================
     ETATS PROFIL
  ============================================================ */


  function showProfileState(
    mode
  ) {


    const loading =
      byId(
        'profileLoading'
      );


    const noAuth =
      byId(
        'profileNoAuth'
      );


    const setup =
      byId(
        'profileSetup'
      );


    const view =
      byId(
        'profileView'
      );


    [
      loading,
      noAuth,
      setup,
      view
    ]
    .forEach(
      function(element) {

        element
          ?.classList
          .add(
            'hidden'
          );

      }
    );


    if (
      mode ===
      'loading'
    ) {

      loading
        ?.classList
        .remove(
          'hidden'
        );

    }


    if (
      mode ===
      'noauth'
    ) {

      noAuth
        ?.classList
        .remove(
          'hidden'
        );

    }


    if (
      mode ===
      'setup'
    ) {

      setup
        ?.classList
        .remove(
          'hidden'
        );

    }


    if (
      mode ===
      'view'
    ) {

      view
        ?.classList
        .remove(
          'hidden'
        );

    }

  }


  /* ============================================================
     NORMALISATION PROFIL
  ============================================================ */


  function normalizeProfilePayload(
    data
  ) {


    const root =
      firstObject(
        data
      )
      ||
      {};


    const profile =

      root.profile

      ||

      root.diver

      ||

      root.athlete

      ||

      root;


    const evaluations =

      root.evaluations

      ||

      root.history

      ||

      root.profile_history

      ||

      profile?.evaluations

      ||

      [];


    const blazons =

      root.blazons

      ||

      root.progress

      ||

      root.blazon_progress

      ||

      profile?.blazons

      ||

      [];


    return {

      raw:
        root,

      profile:
        profile || {},

      evaluations:
        Array.isArray(
          evaluations
        )
        ?
        evaluations
        :
        [],

      blazons:
        Array.isArray(
          blazons
        )
        ?
        blazons
        :
        []

    };

  }


  /* ============================================================
     CRITERES D'UNE EVALUATION EXISTANTE
  ============================================================ */


  function evaluationCriteriaData(
    evaluation = {}
  ) {

    return safeJson(

      evaluation.criteria

      ??

      evaluation.criteria_json

      ??

      evaluation.CRITERIA_JSON

      ??

      {},

      {}

    );

  }


  /* ============================================================
     NOTE PRINCIPALE D'UNE EVALUATION
  ============================================================ */


  function evaluationScoreData(
    evaluation = {}
  ) {


    const criteria =
      evaluationCriteriaData(
        evaluation
      );


    const eah =
      numberOrNull(

        evaluation.eah_score

        ??

        evaluation.eahScore

        ??

        evaluation.EAH_SCORE

        ??

        evaluation.score_eah

        ??

        evaluation.final_eah_score

      );


    const wa =
      numberOrNull(

        evaluation.wa_score

        ??

        evaluation.waScore

        ??

        evaluation.WA_SCORE

        ??

        evaluation.score_wa

      );


    let type =
      String(

        evaluation.primary_score_type

        ??

        evaluation.primaryScoreType

        ??

        evaluation.PRIMARY_SCORE_TYPE

        ??

        evaluation.scoring_mode

        ??

        evaluation.SCORING_MODE

        ??

        evaluation.score_type

        ??

        evaluation.SCORE_TYPE

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
        eah !==
        null

        ?

        'EAH'

        :

        (
          wa !==
          null
          ?
          'WA'
          :
          'EAH'
        );

    }


    if (
      type ===
        'WA'
      &&
      wa ===
        null
      &&
      eah !==
        null
    ) {

      type =
        'EAH';

    }


    if (
      type ===
        'EAH'
      &&
      eah ===
        null
      &&
      wa !==
        null
    ) {

      type =
        'WA';

    }


    return {

      type,

      eah,

      wa,

      main:
        type ===
          'WA'
        ?
        wa
        :
        eah

    };

  }


  /* ============================================================
     SCORE TAKEOFF / TRICK / ENTRY EXISTANT
  ============================================================ */


  function phaseScore(
    evaluation,
    phase
  ) {


    const criteria =
      evaluationCriteriaData(
        evaluation
      );


    const directMap = {

      D:

        evaluation.takeoff

        ??

        evaluation.TAKEOFF,


      T:

        evaluation.trick

        ??

        evaluation.TRICK,


      E:

        evaluation.entry_score

        ??

        evaluation.entry

        ??

        evaluation.ENTRY

    };


    const direct =
      numberOrNull(
        directMap[
          phase
        ]
      );


    if (
      direct !==
      null
    ) {

      return direct;

    }


    const keys =
      CRITERIA[
        phase
      ]
      .map(
        function(item) {

          return item[0];

        }
      );


    const values =
      keys

      .map(
        function(key) {

          return criteria[
            key
          ];

        }
      )

      .filter(
        function(value) {

          return (

            value !==
              null

            &&

            value !==
              'NA'

            &&

            value !==
              'N/A'

            &&

            value !==
              ''

            &&

            typeof value !==
              'undefined'

          );

        }
      )

      .map(
        Number
      )

      .filter(
        Number.isFinite
      );


    if (
      !values.length
    ) {

      return null;

    }


    return (

      Math.round(

        (
          values.reduce(
            function(a,b) {

              return a + b;

            },
            0
          )

          /

          (
            values.length
            *
            2
          )

        )

        *

        100

      )

      /

      10

    );

  }


  /* ============================================================
     LIENS REPORT / VIDEO
  ============================================================ */


  function evaluationReportUrl(
    evaluation
  ) {

    return (

      evaluation.report_url

      ||

      evaluation.REPORT_URL

      ||

      evaluation.grade_report_url

      ||

      ''

    );

  }


  function evaluationVideoUrl(
    evaluation
  ) {

    return (

      evaluation.video_url

      ||

      evaluation.VIDEO_URL

      ||

      evaluation.videoUrl

      ||

      ''

    );

  }


  /* ============================================================
     CARTE HISTORIQUE
  ============================================================ */


  function evaluationCardHtml(
    evaluation,
    detailed = true
  ) {


    const score =
      evaluationScoreData(
        evaluation
      );


    const code =
      normalizeDiveCode(

        evaluation.dive_code

        ||

        evaluation.DIVE_CODE

        ||

        ''

      );


    const diveName =

      evaluation.dive_name

      ||

      evaluation.DIVE_NAME

      ||

      DIVE_NAMES[
        code
      ]

      ||

      code

      ||

      'Plongeon';


    const date =

      evaluation.evaluated_at

      ||

      evaluation.EVALUATED_AT

      ||

      evaluation.date

      ||

      evaluation.DATE

      ||

      evaluation.created_at;


    const height =

      evaluation.height

      ??

      evaluation.HEIGHT;


    const reportUrl =
      evaluationReportUrl(
        evaluation
      );


    const videoUrl =
      evaluationVideoUrl(
        evaluation
      );


    const takeoff =
      phaseScore(
        evaluation,
        'D'
      );


    const trick =
      phaseScore(
        evaluation,
        'T'
      );


    const entry =
      phaseScore(
        evaluation,
        'E'
      );


    return `

      <article class="history-card evaluation-history-card">


        <div class="history-card-head">


          <div>


            <span class="overline">

              ${escapeHtml(
                code ||
                'EAH DIVING'
              )}

            </span>


            <h3>

              ${escapeHtml(
                diveName
              )}

            </h3>


            <p>

              ${escapeHtml(
                fmtDate(
                  date
                )
              )}

              ${

                height !==
                  null
                &&
                height !==
                  ''
                &&
                typeof height !==
                  'undefined'

                ?

                ' • '
                +
                escapeHtml(
                  fmtNumber(
                    height
                  )
                )
                +
                ' m'

                :

                ''

              }

            </p>


          </div>


          <strong class="history-main-score">

            ${escapeHtml(
              score.type
            )}

            ${escapeHtml(
              fmtNumber(
                score.main
              )
            )}/10

          </strong>


        </div>


        ${

          detailed

          ?

          `

          <div class="history-phase-scores">


            <span>

              Takeoff

              <strong>

                ${escapeHtml(
                  fmtNumber(
                    takeoff
                  )
                )}/10

              </strong>

            </span>


            <span>

              Trick

              <strong>

                ${escapeHtml(
                  fmtNumber(
                    trick
                  )
                )}/10

              </strong>

            </span>


            <span>

              Entry

              <strong>

                ${escapeHtml(
                  fmtNumber(
                    entry
                  )
                )}/10

              </strong>

            </span>


          </div>

          `

          :

          ''

        }


        <div class="history-actions">


          ${

            reportUrl

            ?

            `

            <a

              class="button small"

              href="${escapeAttr(
                reportUrl
              )}"

              target="_blank"

              rel="noopener"

            >

              Grade Report

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

              class="button secondary small"

              href="${escapeAttr(
                videoUrl
              )}"

              target="_blank"

              rel="noopener"

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


  /* ============================================================
     AFFICHER PROFIL
  ============================================================ */


  function renderProfile(
    profileData
  ) {


    const profile =
      profileData.profile
      ||
      {};


    const evaluations =
      profileData.evaluations
      ||
      [];


    const blazons =
      profileData.blazons
      ||
      [];


    state.profile =
      profile;


    state.profileHistory =
      evaluations;


    state.profileBlazons =
      blazons;


    const eahId =

      profile.eah_id

      ||

      profile.EAH_ID

      ||

      state.cardContext?.eahId

      ||

      '';


    const first =

      profile.first_name

      ||

      profile.firstName

      ||

      '';


    const last =

      profile.last_name

      ||

      profile.lastName

      ||

      '';


    const name =

      [
        first,
        last
      ]
      .filter(
        Boolean
      )
      .join(
        ' '
      )

      ||

      profile.public_name

      ||

      profile.display_name

      ||

      eahId

      ||

      'Profil EAH';


    const photo =

      profile.photo_url

      ||

      profile.photoUrl

      ||

      '';


    const currentBlazon =

      profile.manual_blazon

      ||

      profile.current_blazon

      ||

      profile.currentBlazon

      ||

      'En progression';


    const sex =
      profile.sex
      ||
      '—';


    const group =
      profile.group_name
      ||
      profile.group
      ||
      '—';


    const visibility =
      normalizeVisibility(

        profile.profile_visibility

        ||

        profile.visibility

      );


    const root =
      byId(
        'profileView'
      );


    if (!root) {

      return;

    }


    root.innerHTML = `


      <article class="profile-hero-card">


        ${

          photo

          ?

          `

          <img

            class="profile-avatar"

            src="${escapeAttr(
              photo
            )}"

            alt="${escapeAttr(
              name
            )}"

          >

          `

          :

          `

          <div class="profile-avatar profile-avatar-fallback">

            EAH

          </div>

          `

        }


        <div class="profile-main-info">


          <span class="overline">

            PROFIL EAH

          </span>


          <h1>

            ${escapeHtml(
              name
            )}

          </h1>


          <p>

            ${escapeHtml(
              eahId
            )}

          </p>


          <div class="profile-tags">


            <span>

              ${escapeHtml(
                sex
              )}

            </span>


            <span>

              ${escapeHtml(
                group
              )}

            </span>


            <span>

              ${escapeHtml(
                visibility ===
                  'PUBLIC'
                ?
                'PUBLIC'
                :
                'PRIVÉ'
              )}

            </span>


          </div>


        </div>


        <div class="profile-blazon-box">


          <span>

            Blazon actuel

          </span>


          <strong>

            ${escapeHtml(
              currentBlazon
            )}

          </strong>


        </div>


      </article>


      <section class="profile-history-block">


        <div class="section-title left">


          <span class="overline">

            HISTORIQUE

          </span>


          <h2>

            Évaluations

          </h2>


        </div>


        <div class="profile-history-list">


          ${

            evaluations.length

            ?

            evaluations
            .map(
              function(item) {

                return evaluationCardHtml(
                  item,
                  true
                );

              }
            )
            .join(
              ''
            )

            :

            `

            <div class="loading-panel">

              Aucune évaluation.

            </div>

            `

          }


        </div>


      </section>

    `;


    showProfileState(
      'view'
    );


    showPage(
      'profil'
    );

  }


  /* ============================================================
     PROFIL PUBLIC
  ============================================================ */


  async function loadPublicProfile(
    eahId,
    clubSlug
  ) {


    showPage(
      'profil'
    );


    showProfileState(
      'loading'
    );


    try {


      const data =
        await rpcAttempt(

          'eah_public_profile_v2',

          [

            {

              p_eah_id:
                normalizeEahId(
                  eahId
                ),

              p_club_slug:
                clubSlug ||
                null

            },

            {

              p_eah_id:
                normalizeEahId(
                  eahId
                )

            }

          ]

        );


      const normalized =
        normalizeProfilePayload(
          data
        );


      const raw =
        normalized.raw
        ||
        {};


      if (
        raw.profile_visibility
        &&
        normalizeVisibility(
          raw.profile_visibility
        )
        !==
        'PUBLIC'
      ) {

        throw new Error(
          'Ce profil est privé.'
        );

      }


      renderProfile(
        normalized
      );


    } catch (
      error
    ) {


      console.error(
        'Public profile:',
        error
      );


      showProfileState(
        'noauth'
      );


      const panel =
        byId(
          'profileNoAuth'
        );


      if (
        panel
      ) {


        const title =
          panel.querySelector(
            'h2'
          );


        const paragraph =
          panel.querySelector(
            'p'
          );


        if (
          title
        ) {

          title.textContent =
            'Profil non disponible';

        }


        if (
          paragraph
        ) {

          paragraph.textContent =

            error?.message

            ||

            'Impossible d’ouvrir ce profil.';

        }

      }

    }

  }


  /* ============================================================
     CARTE NFC PLONGEUR
  ============================================================ */


  async function loadPrivateProfileByCard(
    clubSlug,
    eahId,
    token
  ) {


    state.cardContext = {

      clubSlug:
        String(
          clubSlug || ''
        )
        .trim(),

      eahId:
        normalizeEahId(
          eahId
        ),

      token:
        String(
          token || ''
        )
        .trim()

    };


    if (
      state.cardContext.clubSlug
    ) {

      CLUB_SLUG =
        state.cardContext.clubSlug;

    }


    showPage(
      'profil'
    );


    showProfileState(
      'loading'
    );


    try {


      const data =
        await rpcAttempt(

          'eah_open_profile_fast',

          [

            {

              p_club_slug:
                state.cardContext.clubSlug,

              p_eah_id:
                state.cardContext.eahId,

              p_token:
                state.cardContext.token

            }

          ]

        );


      const root =
        firstObject(
          data
        )
        ||
        {};


      if (
        root.assigned ===
          false

        ||

        root.needs_setup ===
          true

        ||

        root.status ===
          'UNASSIGNED'
      ) {


        prepareProfileSetup(
          root
        );


        return;

      }


      renderProfile(

        normalizeProfilePayload(
          data
        )

      );


    } catch (
      error
    ) {


      console.error(
        'Private profile:',
        error
      );


      showProfileState(
        'noauth'
      );


      const panel =
        byId(
          'profileNoAuth'
        );


      if (
        panel
      ) {


        const title =
          panel.querySelector(
            'h2'
          );


        const paragraph =
          panel.querySelector(
            'p'
          );


        if (
          title
        ) {

          title.textContent =
            'Impossible d’ouvrir la carte';

        }


        if (
          paragraph
        ) {

          paragraph.textContent =

            error?.message

            ||

            'Carte ou accès invalide.';

        }

      }

    }

  }


  /* ============================================================
     PREPARER ACTIVATION PROFIL
  ============================================================ */


  function prepareProfileSetup(
    data = {}
  ) {


    showProfileState(
      'setup'
    );


    if (
      data.first_name
      &&
      byId(
        'setupFirstName'
      )
    ) {

      byId(
        'setupFirstName'
      ).value =
        data.first_name;

    }


    if (
      data.last_name
      &&
      byId(
        'setupLastName'
      )
    ) {

      byId(
        'setupLastName'
      ).value =
        data.last_name;

    }


    if (
      data.birth_date
      &&
      byId(
        'setupBirthDate'
      )
    ) {

      byId(
        'setupBirthDate'
      ).value =
        String(
          data.birth_date
        )
        .slice(
          0,
          10
        );

    }


    if (
      data.sex
      &&
      byId(
        'setupSex'
      )
    ) {

      byId(
        'setupSex'
      ).value =
        data.sex;

    }


    if (
      data.group_name
      &&
      byId(
        'setupGroup'
      )
    ) {

      byId(
        'setupGroup'
      ).value =
        data.group_name;

    }


    if (
      data.profile_visibility
      &&
      byId(
        'setupProfileVisibility'
      )
    ) {

      byId(
        'setupProfileVisibility'
      ).value =

        normalizeVisibility(
          data.profile_visibility
        )
        ===
        'PUBLIC'

        ?

        'PUBLIC'

        :

        'PRIVÉ';

    }

  }


  /* ============================================================
     ACTIVER PROFIL
  ============================================================ */


  async function setupProfile() {


    const context =
      state.cardContext;


    if (
      !context?.eahId
      ||
      !context?.token
    ) {

      showMessage(

        'setupProfileMsg',

        'Carte EAH introuvable.',

        'error'

      );


      return;

    }


    const firstName =
      String(
        val(
          'setupFirstName'
        )
        ||
        ''
      )
      .trim();


    const lastName =
      String(
        val(
          'setupLastName'
        )
        ||
        ''
      )
      .trim();


    const pin =
      String(
        val(
          'setupAccessPin'
        )
        ||
        ''
      )
      .trim();


    const visibility =

      val(
        'setupProfileVisibility'
      )
      ===
      'PUBLIC'

      ?

      'PUBLIC'

      :

      'PRIVATE';


    if (
      !firstName
      ||
      !lastName
      ||
      !/^\d{4,8}$/.test(
        pin
      )
    ) {

      showMessage(

        'setupProfileMsg',

        'Renseigne le prénom, le nom et un code personnel de 4 à 8 chiffres.',

        'error'

      );


      return;

    }


    showMessage(

      'setupProfileMsg',

      'Activation…'

    );


    try {


      const {

        error

      } =
        await requireSupabase()
        .rpc(

          'activate_diver_profile',

          {

            p_eah_id:
              context.eahId,

            p_token:
              context.token,

            p_first_name:
              firstName,

            p_last_name:
              lastName,

            p_photo_url:
              String(
                val(
                  'setupPhotoUrl'
                )
                ||
                ''
              )
              .trim()
              ||
              null,

            p_birth_date:
              val(
                'setupBirthDate'
              )
              ||
              null,

            p_sex:
              val(
                'setupSex'
              )
              ||
              null,

            p_group_name:
              String(
                val(
                  'setupGroup'
                )
                ||
                ''
              )
              .trim()
              ||
              null,

            p_pin:
              pin

          }

        );


      if (
        error
      ) {

        throw error;

      }


      /*
        Visibilité.
      */


      try {


        const {

          error:
            visibilityError

        } =
          await requireSupabase()
          .rpc(

            'eah_set_diver_visibility',

            {

              p_eah_id:
                context.eahId,

              p_token:
                context.token,

              p_visibility:
                visibility

            }

          );


        if (
          visibilityError
        ) {

          console.warn(
            'Visibility:',
            visibilityError
          );

        }


      } catch (
        visibilityError
      ) {

        console.warn(
          'Visibility:',
          visibilityError
        );

      }


      showMessage(

        'setupProfileMsg',

        'Profil activé.',

        'success'

      );


      await loadPrivateProfileByCard(

        context.clubSlug,

        context.eahId,

        context.token

      );


    } catch (
      error
    ) {


      console.error(
        'Setup profile:',
        error
      );


      showMessage(

        'setupProfileMsg',

        error?.message

        ||

        'Activation impossible.',

        'error'

      );

    }

  }


  /* ============================================================
     CONNEXION PLONGEUR
  ============================================================ */


  async function diverLogin(
    event
  ) {


    event
      ?.preventDefault();


    const eahId =
      normalizeEahId(
        val(
          'diverEahId'
        )
      );


    const pin =
      String(
        val(
          'diverPin'
        )
        ||
        ''
      )
      .trim();


    if (
      !eahId
      ||
      !pin
    ) {

      showMessage(

        'diverLoginMsg',

        'Numéro EAH et code personnel obligatoires.',

        'error'

      );


      return;

    }


    showMessage(

      'diverLoginMsg',

      'Connexion…'

    );


    try {


      const pinHash =
        await sha256Hex(
          pin
        );


      let data =
        null;


      let globalError =
        null;


      /*
        Connexion globale.
      */


      try {


        const result =
          await requireSupabase()
          .rpc(

            'eah_diver_login_global_fast',

            {

              p_eah_id:
                eahId,

              p_pin_hash:
                pinHash

            }

          );


        if (
          result.error
        ) {

          throw result.error;

        }


        data =
          result.data;


      } catch (
        error
      ) {

        globalError =
          error;

      }


      /*
        Fallback club.
      */


      if (
        !data
        &&
        CLUB_SLUG
      ) {


        const {

          data:
            localData,

          error

        } =
          await requireSupabase()
          .rpc(

            'eah_diver_login_fast',

            {

              p_club_slug:
                CLUB_SLUG,

              p_eah_id:
                eahId,

              p_pin_hash:
                pinHash

            }

          );


        if (
          error
        ) {

          throw error;

        }


        data =
          localData;

      }


      if (
        !data
      ) {

        throw (

          globalError

          ||

          new Error(
            'Connexion plongeur impossible.'
          )

        );

      }


      const normalized =
        normalizeProfilePayload(
          data
        );


      const raw =
        normalized.raw
        ||
        {};


      CLUB_SLUG =

        raw.club_slug

        ||

        raw.club?.slug

        ||

        normalized.profile?.club_slug

        ||

        CLUB_SLUG;


      showMessage(

        'diverLoginMsg',

        'Connexion réussie.',

        'success'

      );


      renderProfile(
        normalized
      );


    } catch (
      error
    ) {


      console.error(
        'Diver login:',
        error
      );


      showMessage(

        'diverLoginMsg',

        error?.message

        ||

        'Numéro EAH ou code personnel incorrect.',

        'error'

      );

    }

  }


  /* ============================================================
     TROUVER L'ADHESION COACH
  ============================================================ */


  async function loadCoachMembership(
    userId
  ) {


    const {

      data:
        members,

      error:
        memberError

    } =
      await requireSupabase()

      .from(
        'club_members'
      )

      .select(

        'id,club_id,user_id,display_name,email,role,active,photo_url'

      )

      .eq(
        'user_id',
        userId
      )

      .eq(
        'active',
        true
      );


    if (
      memberError
    ) {

      throw memberError;

    }


    if (
      !members?.length
    ) {

      throw new Error(
        'Aucun espace coach actif trouvé pour ce compte.'
      );

    }


    let membership =
      members[0];


    let club =
      null;


    /*
      Si une URL contient ?club=
      on privilégie ce club.
    */


    if (
      CLUB_SLUG
    ) {


      const {

        data:
          requestedClub,

        error

      } =
        await requireSupabase()

        .from(
          'clubs'
        )

        .select(
          '*'
        )

        .eq(
          'slug',
          CLUB_SLUG
        )

        .eq(
          'active',
          true
        )

        .maybeSingle();


      if (
        !error
        &&
        requestedClub
      ) {


        const matching =
          members.find(
            function(item) {

              return (
                item.club_id ===
                requestedClub.id
              );

            }
          );


        if (
          matching
        ) {

          membership =
            matching;


          club =
            requestedClub;

        }

      }

    }


    /*
      Sinon club de l'adhésion.
    */


    if (
      !club
    ) {


      const {

        data:
          clubData,

        error:
          clubError

      } =
        await requireSupabase()

        .from(
          'clubs'
        )

        .select(
          '*'
        )

        .eq(
          'id',
          membership.club_id
        )

        .eq(
          'active',
          true
        )

        .single();


      if (
        clubError
      ) {

        throw clubError;

      }


      club =
        clubData;

    }


    state.membership =
      membership;


    state.coach =
      membership;


    state.club =
      club;


    CLUB_SLUG =
      club.slug
      ||
      CLUB_SLUG;


    return {

      membership,

      club

    };

  }


  /* ============================================================
     LOGIN COACH
  ============================================================ */


  async function coachLogin(
    event
  ) {


    event
      ?.preventDefault();


    const email =
      String(
        val(
          'coachEmail'
        )
        ||
        ''
      )
      .trim();


    const password =
      String(
        val(
          'coachPassword'
        )
        ||
        ''
      );


    if (
      !email
      ||
      !password
    ) {

      showMessage(

        'loginMsg',

        'E-mail et mot de passe obligatoires.',

        'error'

      );


      return;

    }


    const button =
      byId(
        'coachLoginButton'
      );


    if (
      button
    ) {

      button.disabled =
        true;

    }


    showMessage(

      'loginMsg',

      'Connexion…'

    );


    try {


      const {

        data,

        error

      } =
        await requireSupabase()
        .auth
        .signInWithPassword({

          email,

          password

        });


      if (
        error
      ) {

        throw error;

      }


      if (
        !data?.user
      ) {

        throw new Error(
          'Connexion impossible.'
        );

      }


      await loadCoachMembership(
        data.user.id
      );


      await enterCoachWorkspace();


      showMessage(

        'loginMsg',

        'Connexion réussie.',

        'success'

      );


    } catch (
      error
    ) {


      console.error(
        'Coach login:',
        error
      );


      showMessage(

        'loginMsg',

        error?.message

        ||

        'Connexion coach impossible.',

        'error'

      );


    } finally {


      if (
        button
      ) {

        button.disabled =
          false;

      }

    }

  }


  /* ============================================================
     RESTAURER SESSION COACH
  ============================================================ */


  async function restoreCoachSession() {


    try {


      const {

        data,

        error

      } =
        await requireSupabase()
        .auth
        .getSession();


      if (
        error
        ||
        !data?.session?.user
      ) {

        return;

      }


      await loadCoachMembership(

        data.session.user.id

      );


      await enterCoachWorkspace(
        false
      );


    } catch (
      error
    ) {

      console.warn(
        'Restore coach:',
        error
      );

    }

  }


  /* ============================================================
     CARTE NFC COACH

     Remplace coach-card.js.
  ============================================================ */


  async function openCoachCard(
    coachToken
  ) {


    if (
      !coachToken
    ) {

      return false;

    }


    try {


      const {

        data,

        error

      } =
        await requireSupabase()
        .rpc(

          'eah_coach_card_workspace',

          {

            p_token:
              coachToken

          }

        );


      if (
        error
      ) {

        throw error;

      }


      const payload =
        firstObject(
          data
        )
        ||
        {};


      const club =

        payload.club

        ||

        payload.club_data

        ||

        payload.workspace?.club

        ||

        null;


      const member =

        payload.member

        ||

        payload.coach

        ||

        payload.membership

        ||

        payload.workspace?.member

        ||

        null;


      if (
        !club
        ||
        !member
      ) {

        throw new Error(
          'Carte coach non attribuée ou invalide.'
        );

      }


      state.club =
        club;


      state.membership =
        member;


      state.coach =
        member;


      CLUB_SLUG =
        club.slug
        ||
        CLUB_SLUG;


      await enterCoachWorkspace();


      return true;


    } catch (
      error
    ) {


      console.error(
        'Coach card:',
        error
      );


      showPage(
        'club'
      );


      showMessage(

        'loginMsg',

        error?.message

        ||

        "Impossible d'ouvrir cette carte coach.",

        'error'

      );


      return false;

    }

  }


  /* ============================================================
     ENTRER DANS L'ESPACE COACH
  ============================================================ */


  async function enterCoachWorkspace(
    navigate = true
  ) {


    if (
      !state.club
      ||
      !state.membership
    ) {

      return;

    }


    byId(
      'clubAccess'
    )
    ?.classList
    .add(
      'hidden'
    );


    byId(
      'coachPrivate'
    )
    ?.classList
    .remove(
      'hidden'
    );


    setText(

      'dashboardClubName',

      state.club.name

      ||

      'EAH Diving Club'

    );


    setText(

      'dashboardCoachBadge',

      state.membership.display_name

      ||

      state.membership.email

      ||

      state.membership.role

      ||

      'Coach'

    );


    setText(

      'coachBadge',

      state.membership.display_name

      ||

      state.membership.role

      ||

      'Coach'

    );


    if (
      navigate
    ) {

      showPage(
        'club'
      );

    }


    await loadCoachData();


    updateEvaluationAccess();

  }


  /* ============================================================
     DECONNEXION COACH
  ============================================================ */


  async function logoutCoach() {


    try {

      await requireSupabase()
        .auth
        .signOut();

    } catch (_) {}


    state.club =
      null;


    state.membership =
      null;


    state.coach =
      null;


    state.divers =
      [];


    state.evaluations =
      [];


    byId(
      'coachPrivate'
    )
    ?.classList
    .add(
      'hidden'
    );


    byId(
      'clubAccess'
    )
    ?.classList
    .remove(
      'hidden'
    );


    updateEvaluationAccess();


    showPage(
      'club'
    );


    toast(

      'Déconnexion effectuée.',

      'success'

    );

  }


  /* ============================================================
     CHARGER DASHBOARD COACH
  ============================================================ */


  async function loadCoachData() {


    if (
      !state.club?.id
    ) {

      return;

    }


    const supabase =
      requireSupabase();


    const [

      diversResult,

      evalResult

    ] =
      await Promise.all([


        supabase

        .from(
          'divers'
        )

        .select(
          '*'
        )

        .eq(
          'club_id',
          state.club.id
        )

        .eq(
          'active',
          true
        )

        .order(

          'last_name',

          {

            ascending:
              true

          }

        ),


        supabase

        .from(
          'evaluations'
        )

        .select(
          '*'
        )

        .eq(
          'club_id',
          state.club.id
        )

        .order(

          'evaluated_at',

          {

            ascending:
              false

          }

        )

        .limit(
          100
        )


      ]);


    if (
      diversResult.error
    ) {

      throw diversResult.error;

    }


    if (
      evalResult.error
    ) {

      console.warn(
        'Evaluations:',
        evalResult.error
      );

    }


    state.divers =
      diversResult.data
      ||
      [];


    state.evaluations =
      evalResult.data
      ||
      [];


    renderDashboard();


    renderDiversSelect();


    renderCoachDivers(
      state.divers
    );

  }


  /* ============================================================
     DASHBOARD
  ============================================================ */


  function renderDashboard() {


    const divers =
      state.divers
      ||
      [];


    const evaluations =
      state.evaluations
      ||
      [];


    const groups =
      [
        ...
        new Set(

          divers
          .map(
            function(diver) {

              return diver.group_name;

            }
          )
          .filter(
            Boolean
          )

        )
      ];


    const verified =
      evaluations
      .filter(
        function(evaluation) {

          return (
            evaluation.eah_verified ===
            true
          );

        }
      )
      .length;


    const scores =
      evaluations
      .map(
        function(evaluation) {

          return numberOrNull(
            evaluation.eah_score
          );

        }
      )
      .filter(
        function(value) {

          return value !==
          null;

        }
      );


    const average =
      scores.length

      ?

      scores.reduce(
        function(a,b) {

          return a + b;

        },
        0
      )
      /
      scores.length

      :

      null;


    /*
      STATS
    */


    const stats =
      byId(
        'dashboardStats'
      );


    if (
      stats
    ) {

      stats.innerHTML = `


        <article class="stat-card">

          <span>
            Plongeurs
          </span>

          <strong>
            ${divers.length}
          </strong>

        </article>


        <article class="stat-card">

          <span>
            Évaluations
          </span>

          <strong>
            ${evaluations.length}
          </strong>

        </article>


        <article class="stat-card">

          <span>
            EAH Verified
          </span>

          <strong>
            ${verified}
          </strong>

        </article>


        <article class="stat-card">

          <span>
            Moyenne EAH
          </span>

          <strong>

            ${escapeHtml(
              fmtNumber(
                average
              )
            )}

          </strong>

        </article>

      `;

    }


    /*
      DERNIERES EVALUATIONS
    */


    const recent =
      byId(
        'recentDashboard'
      );


    if (
      recent
    ) {

      recent.innerHTML =

        evaluations.length

        ?

        evaluations
        .slice(
          0,
          6
        )
        .map(
          function(item) {

            return evaluationCardHtml(
              item,
              false
            );

          }
        )
        .join(
          ''
        )

        :

        '<div class="mini-loading">Aucune évaluation.</div>';

    }


    /*
      GROUPES
    */


    const groupsRoot =
      byId(
        'groupsDashboard'
      );


    if (
      groupsRoot
    ) {

      groupsRoot.innerHTML =

        groups.length

        ?

        groups
        .map(
          function(group) {


            const count =
              divers
              .filter(
                function(diver) {

                  return (
                    diver.group_name ===
                    group
                  );

                }
              )
              .length;


            return `

              <div class="dashboard-group-row">


                <span>

                  ${escapeHtml(
                    group
                  )}

                </span>


                <strong>

                  ${count}

                </strong>


              </div>

            `;

          }
        )
        .join(
          ''
        )

        :

        '<div class="mini-loading">Aucun groupe.</div>';

    }

  }


  /* ============================================================
     SELECT PLONGEUR EVALUATION
  ============================================================ */


  function renderDiversSelect() {

    const select =
      byId(
        'eahId'
      );


    if (!select) {

      return;

    }


    select.innerHTML =

      '<option value="">'
      +
      'Choisir un plongeur'
      +
      '</option>'

      +

      state.divers
      .map(
        function(diver) {


          const name =

            [
              diver.first_name,
              diver.last_name
            ]
            .filter(
              Boolean
            )
            .join(
              ' '
            )

            ||

            diver.eah_id;


          return `

            <option

              value="${escapeAttr(
                diver.eah_id
              )}"

            >

              ${escapeHtml(
                name
              )}

              —

              ${escapeHtml(
                diver.eah_id
              )}

            </option>

          `;

        }
      )
      .join(
        ''
      );

  }


  /* ============================================================
     LISTE DES PLONGEURS COACH
  ============================================================ */


  function renderCoachDivers(
    divers
  ) {

    const root =
      byId(
        'coachDiversList'
      );


    if (!root) {

      return;

    }


    if (
      !divers?.length
    ) {

      root.innerHTML =

        '<div class="mini-loading">'
        +
        'Aucun plongeur.'
        +
        '</div>';


      return;

    }


    root.innerHTML =
      divers
      .map(
        function(diver) {


          const name =

            [
              diver.first_name,
              diver.last_name
            ]
            .filter(
              Boolean
            )
            .join(
              ' '
            )

            ||

            diver.eah_id;


          return `

            <article class="coach-diver-row">


              <div class="coach-diver-identity">


                ${

                  diver.photo_url

                  ?

                  `

                  <img

                    src="${escapeAttr(
                      diver.photo_url
                    )}"

                    alt=""

                  >

                  `

                  :

                  `

                  <span class="coach-diver-avatar">

                    EAH

                  </span>

                  `

                }


                <div>


                  <strong>

                    ${escapeHtml(
                      name
                    )}

                  </strong>


                  <small>

                    ${escapeHtml(
                      diver.eah_id ||
                      ''
                    )}

                    ${

                      diver.group_name

                      ?

                      ' • '
                      +
                      escapeHtml(
                        diver.group_name
                      )

                      :

                      ''

                    }

                  </small>


                </div>


              </div>


              <button

                type="button"

                class="button small"

                data-coach-diver-detail="${escapeAttr(
                  diver.eah_id
                )}"

              >

                Voir le profil

              </button>


            </article>

          `;

        }
      )
      .join(
        ''
      );

  }


  /* ============================================================
     DETAIL PLONGEUR DEPUIS LE COACH
  ============================================================ */


  async function openCoachDiverDetail(
    eahId
  ) {


    if (
      !state.club?.id
    ) {

      return;

    }


    const diver =
      state.divers
      .find(
        function(item) {

          return (
            item.eah_id ===
            eahId
          );

        }
      );


    if (!diver) {

      return;

    }


    openModal(

      '<div class="loading-panel">'
      +
      'Chargement du profil…'
      +
      '</div>'

    );


    try {


      const {

        data,

        error

      } =
        await requireSupabase()

        .from(
          'evaluations'
        )

        .select(
          '*'
        )

        .eq(
          'club_id',
          state.club.id
        )

        .eq(
          'eah_id',
          eahId
        )

        .order(

          'evaluated_at',

          {

            ascending:
              false

          }

        );


      if (
        error
      ) {

        throw error;

      }


      const name =

        [
          diver.first_name,
          diver.last_name
        ]
        .filter(
          Boolean
        )
        .join(
          ' '
        )

        ||

        diver.eah_id;


      openModal(`


        <div class="coach-profile-modal">


          <span class="overline">

            PLONGEUR DU CLUB

          </span>


          <h2>

            ${escapeHtml(
              name
            )}

          </h2>


          <p>

            ${escapeHtml(
              diver.eah_id ||
              ''
            )}

          </p>


          <p>

            ${escapeHtml(
              diver.sex ||
              '—'
            )}

            •

            ${escapeHtml(
              diver.group_name ||
              'Sans groupe'
            )}

          </p>


          <p>

            <strong>

              Blazon :

              ${escapeHtml(

                diver.manual_blazon

                ||

                diver.current_blazon

                ||

                'En progression'

              )}

            </strong>

          </p>


          <div class="profile-history-list">


            ${

              (
                data ||
                []
              )
              .length

              ?

              data
              .map(
                function(item) {

                  return evaluationCardHtml(
                    item,
                    true
                  );

                }
              )
              .join(
                ''
              )

              :

              `

              <div class="loading-panel">

                Aucune évaluation.

              </div>

              `

            }


          </div>


        </div>

      `);


    } catch (
      error
    ) {


      openModal(`

        <div class="content-panel">

          <h2>
            Erreur
          </h2>

          <p>

            ${escapeHtml(
              error?.message
              ||
              'Profil impossible à charger.'
            )}

          </p>

        </div>

      `);

    }

  }


  /* ============================================================
     CRITERES DU FORMULAIRE
  ============================================================ */


  function renderCriteria() {


    const targets = {

      D:
        byId(
          'criteriaD'
        ),

      T:
        byId(
          'criteriaT'
        ),

      E:
        byId(
          'criteriaE'
        )

    };


    Object
      .entries(
        CRITERIA
      )
      .forEach(
        function(entry) {


          const phase =
            entry[0];


          const items =
            entry[1];


          const root =
            targets[
              phase
            ];


          if (!root) {

            return;

          }


          root.innerHTML =
            items
            .map(
              function(item) {


                const code =
                  item[0];


                const label =
                  item[1];


                return `

                  <label class="criterion-row">


                    <span>

                      <strong>

                        ${escapeHtml(
                          code
                        )}

                      </strong>

                      —

                      ${escapeHtml(
                        label
                      )}

                    </span>


                    <select

                      data-criterion="${escapeAttr(
                        code
                      )}"

                    >

                      <option value="0">

                        0 — Non validé

                      </option>

                      <option value="1">

                        1 — Partiel

                      </option>

                      <option value="2">

                        2 — Validé

                      </option>

                      <option value="NA">

                        N/A

                      </option>

                    </select>


                  </label>

                `;

              }
            )
            .join(
              ''
            );

        }
      );

  }


  /* ============================================================
     RECUPERER CRITERES
  ============================================================ */


  function collectCriteria() {


    const result =
      {};


    qsa(
      '[data-criterion]'
    )
    .forEach(
      function(select) {


        const raw =
          select.value;


        result[
          select.dataset.criterion
        ] =
          raw ===
            'NA'
          ?
          null
          :
          Number(
            raw
          );

      }
    );


    const scoreType =
      String(
        val(
          'scoreType'
        )
        ||
        'EAH'
      )
      .toUpperCase();


    result._scoreType =
      scoreType;


    result._primaryScoreType =
      scoreType;


    return result;

  }


  /* ============================================================
     CALCUL PHASE
  ============================================================ */


  function calculatePhaseScore(
    criteria,
    phase
  ) {


    const values =
      CRITERIA[
        phase
      ]

      .map(
        function(item) {

          return criteria[
            item[0]
          ];

        }
      )

      .filter(
        function(value) {

          return (

            value !==
              null

            &&

            Number.isFinite(
              Number(
                value
              )
            )

          );

        }
      )

      .map(
        Number
      );


    if (
      !values.length
    ) {

      return 0;

    }


    return (

      Math.round(

        (
          values.reduce(
            function(a,b) {

              return a + b;

            },
            0
          )

          /

          (
            values.length
            *
            2
          )

        )

        *

        100

      )

      /

      10

    );

  }


  /* ============================================================
     CALCUL NOTE EAH
  ============================================================ */


  function calculateEahScore(
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
      values
      .filter(
        function(value) {

          return (
            value ===
            minimum
          );

        }
      )
      .length;


    return Math.min(

      10,

      Math.round(

        (
          count ===
            1

          ?

          minimum + 0.5

          :

          minimum
        )

        *

        10

      )

      /

      10

    );

  }


  /* ============================================================
     NOM AUTOMATIQUE PLONGEON
  ============================================================ */


  function updateDiveName() {


    const code =
      normalizeDiveCode(
        val(
          'diveCode'
        )
      );


    const input =
      byId(
        'diveName'
      );


    if (!input) {

      return;

    }


    if (
      DIVE_NAMES[
        code
      ]
    ) {

      input.value =
        DIVE_NAMES[
          code
        ];

    }

  }


  function fillDiveCodes() {


    const list =
      byId(
        'diveCodes'
      );


    if (!list) {

      return;

    }


    list.innerHTML =
      Object
      .keys(
        DIVE_NAMES
      )
      .map(
        function(code) {

          return `

            <option value="${escapeAttr(code)}">

              ${escapeHtml(
                DIVE_NAMES[
                  code
                ]
              )}

            </option>

          `;

        }
      )
      .join(
        ''
      );

  }


  /* ============================================================
     AUTORISATION FORMULAIRE COACH
  ============================================================ */


  function updateEvaluationAccess() {


    const form =
      byId(
        'evaluationForm'
      );


    const locked =
      byId(
        'evaluationLocked'
      );


    const connected =
      Boolean(

        state.club?.id

        &&

        state.membership

      );


    form
      ?.classList
      .toggle(

        'hidden',

        !connected

      );


    locked
      ?.classList
      .toggle(

        'hidden',

        connected

      );

  }


  /* ============================================================
     PAYLOAD EVALUATION
  ============================================================ */


  function evaluationPayload() {


    const diver =
      state.divers
      .find(
        function(item) {

          return (
            item.eah_id ===
            val(
              'eahId'
            )
          );

        }
      );


    if (!diver) {

      throw new Error(
        'Choisis un plongeur.'
      );

    }


    const criteria =
      collectCriteria();


    const takeoff =
      calculatePhaseScore(
        criteria,
        'D'
      );


    const trick =
      calculatePhaseScore(
        criteria,
        'T'
      );


    const entry =
      calculatePhaseScore(
        criteria,
        'E'
      );


    const eahScore =
      calculateEahScore(

        takeoff,

        trick,

        entry

      );


    const scoreType =
      String(
        val(
          'scoreType'
        )
        ||
        'EAH'
      )
      .toUpperCase();


    const waScore =
      numberOrNull(
        val(
          'waScore'
        )
      );


    if (
      scoreType ===
        'WA'
      &&
      waScore ===
        null
    ) {

      throw new Error(
        'Renseigne la note World Aquatics si elle est choisie comme note principale.'
      );

    }


    const code =
      normalizeDiveCode(
        val(
          'diveCode'
        )
      );


    const diveName =
      String(

        val(
          'diveName'
        )

        ||

        DIVE_NAMES[
          code
        ]

        ||

        code

      )
      .trim();


    const videoUrl =
      String(
        val(
          'videoUrl'
        )
        ||
        ''
      )
      .trim();


    const payload = {


      clubSlug:
        state.club.slug,


      club_id:
        state.club.id,


      clubId:
        state.club.id,


      eahId:
        diver.eah_id,


      eah_id:
        diver.eah_id,


      diverId:
        diver.id,


      diver_id:
        diver.id,


      coachName:

        state.membership.display_name

        ||

        state.membership.email

        ||

        'Coach',


      coach_name:

        state.membership.display_name

        ||

        state.membership.email

        ||

        'Coach',


      primaryScoreType:
        scoreType,


      primary_score_type:
        scoreType,


      scoreType:
        scoreType,


      score_type:
        scoreType,


      scoringMode:
        scoreType,


      scoring_mode:
        scoreType,


      discipline:
        val(
          'discipline'
        )
        ||
        'Plongeon',


      diveCode:
        code,


      dive_code:
        code,


      diveName:
        diveName,


      dive_name:
        diveName,


      height:
        numberOrNull(
          val(
            'height'
          )
        ),


      heightType:
        val(
          'heightType'
        )
        ||
        'KNOWN',


      height_type:
        val(
          'heightType'
        )
        ||
        'KNOWN',


      spotId:
        val(
          'spotId'
        )
        ||
        null,


      spot_id:
        val(
          'spotId'
        )
        ||
        null,


      spotName:
        String(
          val(
            'spotName'
          )
          ||
          ''
        )
        .trim()
        ||
        null,


      spot_name:
        String(
          val(
            'spotName'
          )
          ||
          ''
        )
        .trim()
        ||
        null,


      dd:
        numberOrNull(
          val(
            'dd'
          )
        ),


      eahDifficulty:
        numberOrNull(
          val(
            'eahDifficulty'
          )
        ),


      eah_difficulty:
        numberOrNull(
          val(
            'eahDifficulty'
          )
        ),


      waScore:
        waScore,


      wa_score:
        waScore,


      takeoff:
        takeoff,


      trick:
        trick,


      entry:
        entry,


      entry_score:
        entry,


      eahScore:
        eahScore,


      eah_score:
        eahScore,


      criteria:
        criteria,


      positive:
        String(
          val(
            'positive'
          )
          ||
          ''
        )
        .trim(),


      improve:
        String(
          val(
            'improve'
          )
          ||
          ''
        )
        .trim(),


      comment:
        String(
          val(
            'comment'
          )
          ||
          ''
        )
        .trim(),


      videoUrl:
        videoUrl,


      video_url:
        videoUrl,


      videoQrAccessible:
        Boolean(
          byId(
            'videoQrAccessible'
          )
          ?.checked
        ),


      video_qr_accessible:
        Boolean(
          byId(
            'videoQrAccessible'
          )
          ?.checked
        )


    };


    return payload;

  }


  /* ============================================================
     ENVOYER EVALUATION
  ============================================================ */


  async function submitEvaluation(
    event
  ) {


    event
      ?.preventDefault();


    if (
      state.evaluationBusy
    ) {

      return;

    }


    const button =
      byId(
        'submitEvalBtn'
      );


    state.evaluationBusy =
      true;


    if (
      button
    ) {

      button.disabled =
        true;

    }


    showMessage(

      'evaluationMsg',

      'Enregistrement de l’évaluation…'

    );


    try {


      const payload =
        evaluationPayload();


      let result =
        null;


      let rpcError =
        null;


      /*
        RPC principale.
      */


      try {


        result =
          await rpcAttempt(

            'eah_submit_evaluation_fast',

            [

              {

                p_payload:
                  payload

              },

              {

                payload:
                  payload

              },

              {

                p_club_slug:
                  state.club.slug,

                p_payload:
                  payload

              }

            ]

          );


      } catch (
        error
      ) {

        rpcError =
          error;

      }


      /*
        Fallback direct si la RPC
        n'est pas disponible.
      */


      if (
        !result
      ) {


        const record = {


          club_id:
            state.club.id,


          club_slug:
            state.club.slug,


          diver_id:
            payload.diver_id,


          eah_id:
            payload.eah_id,


          coach_name:
            payload.coach_name,


          discipline:
            payload.discipline,


          dive_code:
            payload.dive_code,


          dive_name:
            payload.dive_name,


          height:
            payload.height,


          height_type:
            payload.height_type,


          wa_score:
            payload.wa_score,


          takeoff:
            payload.takeoff,


          trick:
            payload.trick,


          entry_score:
            payload.entry_score,


          eah_score:
            payload.eah_score,


          criteria:
            payload.criteria,


          positive:
            payload.positive,


          improve:
            payload.improve,


          comment:
            payload.comment,


          video_url:
            payload.video_url,


          video_public:
            Boolean(
              payload.video_url
            ),


          eah_verified:
            false,


          evaluated_at:
            new Date()
            .toISOString()


        };


        const {

          data,

          error

        } =
          await requireSupabase()

          .from(
            'evaluations'
          )

          .insert(
            record
          )

          .select(
            '*'
          )

          .single();


        if (
          error
        ) {

          console.warn(
            'RPC originale:',
            rpcError
          );


          throw error;

        }


        result =
          data;

      }


      const normalizedResult =
        firstObject(
          result
        )
        ||
        result
        ||
        {};


      const reportUrl =

        normalizedResult.report_url

        ||

        normalizedResult.grade_report_url

        ||

        '';


      showMessage(

        'evaluationMsg',

        reportUrl

        ?

        'Évaluation enregistrée. Le Grade Report est disponible.'

        :

        'Évaluation enregistrée. Le Grade Report sera ajouté dès sa génération.',

        'success'

      );


      await loadCoachData();


      toast(

        'Évaluation enregistrée.',

        'success'

      );


    } catch (
      error
    ) {


      console.error(
        'Submit evaluation:',
        error
      );


      showMessage(

        'evaluationMsg',

        error?.message

        ||

        'Impossible d’enregistrer l’évaluation.',

        'error'

      );


    } finally {


      state.evaluationBusy =
        false;


      if (
        button
      ) {

        button.disabled =
          false;

      }

    }

  }


  /* ============================================================
     DEMANDE PUBLIQUE DE GRADING
  ============================================================ */


  async function submitPublicGrading(
    event
  ) {


    event
      ?.preventDefault();


    const button =
      byId(
        'publicSubmitButton'
      );


    if (
      button
    ) {

      button.disabled =
        true;

    }


    showMessage(

      'publicFormMessage',

      'Envoi…'

    );


    const payload = {


      first_name:
        String(
          val(
            'publicFirstName'
          )
          ||
          ''
        )
        .trim(),


      last_name:
        String(
          val(
            'publicLastName'
          )
          ||
          ''
        )
        .trim(),


      email:
        String(
          val(
            'publicEmail'
          )
          ||
          ''
        )
        .trim(),


      discipline:
        val(
          'publicDiscipline'
        )
        ||
        'Plongeon',


      dive_code:
        normalizeDiveCode(
          val(
            'publicDive'
          )
        ),


      height:
        numberOrNull(
          val(
            'publicHeight'
          )
        ),


      height_type:
        val(
          'publicHeightType'
        )
        ||
        'KNOWN',


      video_url:
        String(
          val(
            'publicVideo'
          )
          ||
          ''
        )
        .trim(),


      message:
        String(
          val(
            'publicMessage'
          )
          ||
          ''
        )
        .trim(),


      club_slug:
        CLUB_SLUG
        ||
        null


    };


    try {


      let sent =
        false;


      /*
        RPC existante.
      */


      try {


        await rpcAttempt(

          'submit_public_grading_request',

          [

            {

              p_payload:
                payload

            },

            {

              payload:
                payload

            },

            payload

          ]

        );


        sent =
          true;


      } catch (
        rpcError
      ) {

        console.warn(
          'Public grading RPC:',
          rpcError
        );

      }


      /*
        Fallback table.
      */


      if (
        !sent
      ) {


        const {

          error

        } =
          await requireSupabase()

          .from(
            'public_grading_requests'
          )

          .insert(
            payload
          );


        if (
          error
        ) {

          throw error;

        }

      }


      byId(
        'publicGradingForm'
      )
      ?.reset();


      showMessage(

        'publicFormMessage',

        'Demande envoyée à EAH Diving.',

        'success'

      );


      toast(

        'Demande envoyée.',

        'success'

      );


    } catch (
      error
    ) {


      console.error(
        'Public grading:',
        error
      );


      showMessage(

        'publicFormMessage',

        error?.message

        ||

        'Impossible d’envoyer la demande.',

        'error'

      );


    } finally {


      if (
        button
      ) {

        button.disabled =
          false;

      }

    }

  }


  /* ============================================================
     URL NFC / QR
  ============================================================ */


  async function handleDeepLink() {


    /*
      CARTE COACH
    */


    const coachToken =
      String(
        URL_PARAMS.get(
          'coachToken'
        )
        ||
        ''
      )
      .trim();


    if (
      coachToken
    ) {


      showPage(

        'club',

        {

          updateHash:
            false

        }

      );


      await openCoachCard(
        coachToken
      );


      return true;

    }


    /*
      CARTE PLONGEUR
    */


    const eahId =

      URL_PARAMS.get(
        'eahId'
      )

      ||

      URL_PARAMS.get(
        'eah_id'
      )

      ||

      URL_PARAMS.get(
        'eah'
      )

      ||

      URL_PARAMS.get(
        'id'
      )

      ||

      '';


    const token =

      URL_PARAMS.get(
        'token'
      )

      ||

      URL_PARAMS.get(
        'accessToken'
      )

      ||

      URL_PARAMS.get(
        'access_token'
      )

      ||

      '';


    if (
      eahId
      &&
      token
    ) {


      showPage(

        'profil',

        {

          updateHash:
            false

        }

      );


      await loadPrivateProfileByCard(

        CLUB_SLUG,

        eahId,

        token

      );


      return true;

    }


    return false;

  }


  /* ============================================================
     EVENEMENTS FORMULAIRES
  ============================================================ */


  function bindForms() {


    byId(
      'coachLoginForm'
    )
    ?.addEventListener(

      'submit',

      coachLogin

    );


    byId(
      'diverLoginForm'
    )
    ?.addEventListener(

      'submit',

      diverLogin

    );


    byId(
      'publicGradingForm'
    )
    ?.addEventListener(

      'submit',

      submitPublicGrading

    );


    byId(
      'evaluationForm'
    )
    ?.addEventListener(

      'submit',

      submitEvaluation

    );


    byId(
      'setupProfileButton'
    )
    ?.addEventListener(

      'click',

      setupProfile

    );


    byId(
      'logoutCoachButton'
    )
    ?.addEventListener(

      'click',

      logoutCoach

    );


    byId(
      'openEvaluationButton'
    )
    ?.addEventListener(

      'click',

      function() {

        showPage(
          'evaluation'
        );

      }

    );


    byId(
      'diveCode'
    )
    ?.addEventListener(

      'input',

      updateDiveName

    );


    /*
      SPOT -> NOM DU LIEU
    */


    byId(
      'spotId'
    )
    ?.addEventListener(

      'change',

      function() {


        const id =
          val(
            'spotId'
          );


        const spot =
          state.spots
          .find(
            function(item) {

              return (
                String(
                  item.id
                )
                ===
                String(
                  id
                )
              );

            }
          );


        if (
          spot
          &&
          byId(
            'spotName'
          )
        ) {

          byId(
            'spotName'
          ).value =
            spot.name
            ||
            '';

        }

      }

    );


    /*
      PROFIL PLONGEUR COACH
    */


    document.addEventListener(

      'click',

      function(event) {


        const detail =
          event.target.closest(
            '[data-coach-diver-detail]'
          );


        if (
          detail
        ) {


          event.preventDefault();


          openCoachDiverDetail(

            detail
              .dataset
              .coachDiverDetail

          );

        }

      }

    );

  }


  /* ============================================================
     FIN DU CHARGEMENT DES IMAGES
  ============================================================ */


  function removeImageLoadingGuard() {


    const done =
      function() {

        document
          .documentElement
          .classList
          .remove(
            'eah-images-loading'
          );

      };


    if (
      document.readyState ===
      'complete'
    ) {

      done();

    } else {


      window.addEventListener(

        'load',

        done,

        {

          once:
            true

        }

      );


      /*
        Sécurité :
        le site n'attend jamais indéfiniment
        une image absente.
      */


      window.setTimeout(

        done,

        2500

      );

    }

  }


  /* ============================================================
     CHARGEMENT ASYNCHRONE
  ============================================================ */


  async function initAsync() {


    /*
      Données publiques.

      Une erreur ici
      NE bloque pas la navigation.
    */


    try {

      await loadPublicData();

    } catch (
      error
    ) {

      console.warn(
        'Public data init:',
        error
      );

    }


    /*
      NFC ou session coach.
    */


    try {


      const deepLinkHandled =
        await handleDeepLink();


      if (
        !deepLinkHandled
      ) {

        await restoreCoachSession();

      }


    } catch (
      error
    ) {

      console.warn(
        'Session/deeplink init:',
        error
      );

    }

  }


  /* ============================================================
     INITIALISATION PRINCIPALE
  ============================================================ */


  function init() {


    /*
      LE ROUTEUR EST LANCE EN PREMIER.

      C'est ce qui évite désormais
      le site bloqué sur l'accueil.
    */


    initRouter();


    initModal();


    bindPublicCards();


    bindPopulation();


    renderCriteria();


    fillDiveCodes();


    bindForms();


    updateEvaluationAccess();


    removeImageLoadingGuard();


    /*
      Supabase est lancé ensuite.

      Donc même si une RPC Supabase
      rencontre une erreur,
      Grading / Blazons / Population /
      Spots / Actualités / Tarifs /
      Disciplines continuent à s'ouvrir.
    */


    initAsync();

  }


  /* ============================================================
     DEMARRAGE
  ============================================================ */


  if (
    document.readyState ===
    'loading'
  ) {


    document.addEventListener(

      'DOMContentLoaded',

      init,

      {

        once:
          true

      }

    );


  } else {


    init();


  }


})();
