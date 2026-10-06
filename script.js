'use strict';

/* ============================================================
   EAH DIVING PRO CLUB
   SCRIPT.JS CLEAN V7
   06/10/2026
============================================================ */


/* ============================================================
   CONFIGURATION
============================================================ */

const CONFIG =
  window.EAH_CONFIG ||
  {};


const SUPABASE_URL =
  String(
    CONFIG.SUPABASE_URL ||
    ''
  ).trim();


const SUPABASE_KEY =
  String(
    CONFIG.SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();


const APPS_SCRIPT_URL =
  String(
    CONFIG.APPS_SCRIPT_URL ||
    ''
  ).trim();


if (
  !SUPABASE_URL ||
  !SUPABASE_KEY
) {

  console.error(
    'EAH Diving : configuration Supabase manquante.'
  );

}


const supabaseClient =
  (
    window.supabase &&
    SUPABASE_URL &&
    SUPABASE_KEY
  )
  ?
  window.supabase.createClient(

    SUPABASE_URL,

    SUPABASE_KEY,

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

  )
  :
  null;


/* ============================================================
   URL
============================================================ */

const urlParams =
  new URLSearchParams(
    window.location.search
  );


let CLUB_SLUG =
  String(
    urlParams.get(
      'club'
    ) ||
    ''
  )
  .trim();


let CARD_EAH_ID =
  String(
    urlParams.get(
      'id'
    ) ||
    ''
  )
  .trim()
  .toUpperCase();


let CARD_TOKEN =
  String(
    urlParams.get(
      'token'
    ) ||
    ''
  )
  .trim();


let LEGACY_COACH_TOKEN =
  String(
    urlParams.get(
      'coachToken'
    ) ||
    ''
  )
  .trim();



/* ============================================================
   ETAT
============================================================ */

const state = {

  publicLoaded:
    false,

  club:
    null,

  user:
    null,

  membership:
    null,

  coach:
    null,

  divers:
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
    null,

  evaluationBusy:
    false,

  diverPinHash:
    ''

};



/* ============================================================
   CRITERES EAH
============================================================ */

const CRITERIA = {

  D: [

    'Coordination / élan (si applicable)',

    'Impulsion / détente / élévation',

    'Trajectoire verticale',

    'Temps de fixation',

    'Amplitude des bras'

  ],


  T: [

    'Vitesse des rotations',

    'Saltos et/ou vrilles contrôlés',

    'Ligne / tenue / position du corps',

    'Ouverture (si applicable)',

    'Continuité / rythme'

  ],


  E: [

    'Angle vertical (si applicable)',

    'Éclaboussures / tolérance discipline',

    'Position des bras',

    'Jambes tendues et serrées',

    "Axe d'entrée"

  ]

};



/* ============================================================
   PLONGEONS
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
   IMAGES BLAZONS
============================================================ */

const BLAZON_IMAGES = {

  BLANC:
    'blazon-blanc.png',

  ORANGE:
    'blazon-orange.png',

  VERT:
    'blazon-vert.png',

  BLEU:
    'blazon-bleu.png',

  ROUGE:
    'blazon-rouge.png',

  BRONZE:
    'blazon-bronze.png',

  ARGENT:
    'blazon-argent.png',

  OR:
    'blazon-or.png',

  NOIR:
    'blazon-noir.png',

  LEGEND:
    'blazon-legend.png',

  LEGENDE:
    'blazon-legend.png',

  TITAN:
    'blazon-titan.png'

};



/* ============================================================
   TARIFS FALLBACK
============================================================ */

const PRICING_FALLBACK = [

  {

    id:
      'START',

    name:
      'Club Start',

    price:
      '590 €',

    renewal:
      '190 €',

    description:
      '25 profils + 25 cartes NFC/QR + espace club + Grade Reports.',

    card_quota:
      25,

    coach_quota:
      2,

    sort_order:
      1

  },


  {

    id:
      'CLUB50',

    name:
      'Club 50',

    price:
      '790 €',

    renewal:
      '290 €',

    description:
      '50 profils + 50 cartes NFC/QR + dashboard club.',

    card_quota:
      50,

    coach_quota:
      5,

    sort_order:
      2

  },


  {

    id:
      'CLUB100',

    name:
      'Club 100',

    price:
      '990 €',

    renewal:
      '390 €',

    description:
      '100 profils + 100 cartes NFC/QR + dashboard club.',

    card_quota:
      100,

    coach_quota:
      10,

    sort_order:
      3

  },


  {

    id:
      'VERIFIED',

    name:
      'EAH Verified',

    price:
      '9 €/vidéo',

    renewal:
      '—',

    description:
      "Vérification d'une vidéo directement par EAH Diving.",

    sort_order:
      4

  },


  {

    id:
      'INDIVIDUAL',

    name:
      'Particulier',

    price:
      '50 €',

    renewal:
      '—',

    description:
      'Profil EAH + carte NFC/QR + 3 gradings.',

    sort_order:
      5

  }

];



/* ============================================================
   BLAZONS FALLBACK
============================================================ */

function seriesRule(
  height,
  codes,
  minWa,
  minEah,
  extra = {}
) {

  return {

    height,

    codes,

    minWa,

    minEah,

    ...extra

  };

}


const BLAZON_FALLBACK = [

  {

    sort_order:
      1,

    key:
      'BLANC',

    name:
      'Blazon Blanc',

    image_url:
      'blazon-blanc.png',

    rules: {

      allowFixedAlternatives:
        true,

      summary:
        "5/10 World Aquatics ou 6/10 EAH. Si la plateforme 5 m n'est pas disponible, la série 5 m peut être réalisée à 3 m avec 6/10 WA ou 7/10 EAH.",

      series: [

        seriesRule(
          1,
          ['101C','002A'],
          5,
          6
        ),

        seriesRule(
          3,
          ['001C','001B','001A'],
          5,
          6
        ),

        seriesRule(
          5,
          ['100A'],
          5,
          6,
          {
            alternativeHeights:
              [3],
            alternativeMinWa:
              6,
            alternativeMinEah:
              7
          }
        )

      ]

    }

  },


  {

    sort_order:
      2,

    key:
      'ORANGE',

    name:
      'Blazon Orange',

    image_url:
      'blazon-orange.png',

    rules: {

      allowFixedAlternatives:
        true,

      summary:
        "5/10 World Aquatics ou 6/10 EAH. Les plongeons 5 m peuvent être réalisés à 3 m si la plateforme n'est pas disponible, avec 6/10 WA ou 7/10 EAH.",

      series: [

        seriesRule(
          3,
          ['101C','002A'],
          5,
          6
        ),

        seriesRule(
          1,
          ['002AS','401C','102C'],
          5,
          6
        ),

        seriesRule(
          5,
          ['001C','001B','001A'],
          5,
          6,
          {
            alternativeHeights:
              [3],
            alternativeMinWa:
              6,
            alternativeMinEah:
              7
          }
        )

      ]

    }

  },


  {

    sort_order:
      3,

    key:
      'VERT',

    name:
      'Blazon Vert',

    image_url:
      'blazon-vert.png',

    rules: {

      summary:
        'Chaque plongeon : 6/10 World Aquatics ou 7/10 EAH.',

      series: [

        seriesRule(
          1,
          [
            '401C',
            '201C',
            '301C',
            '101C',
            '5211A'
          ],
          6,
          7
        )

      ]

    }

  },


  {

    sort_order:
      4,

    key:
      'BLEU',

    name:
      'Blazon Bleu',

    image_url:
      'blazon-bleu.png',

    rules: {

      summary:
        'Chaque plongeon : 6/10 WA ou 7/10 EAH. Une série 1 m ou 3 m peut être déplacée à 5 m, 7,5 m ou 10 m.',

      allowOnePlatformSubstitution:
        true,

      series: [

        seriesRule(
          1,
          [
            '401C',
            '201C',
            '301C',
            '101C',
            '5211A'
          ],
          6,
          7,
          {
            alternativeHeights:
              [5,7.5,10]
          }
        ),

        seriesRule(
          3,
          [
            '401C',
            '201C',
            '301C',
            '101C',
            '5211A'
          ],
          6,
          7,
          {
            alternativeHeights:
              [5,7.5,10]
          }
        )

      ]

    }

  },


  {

    sort_order:
      5,

    key:
      'ROUGE',

    name:
      'Blazon Rouge',

    image_url:
      'blazon-rouge.png',

    rules: {

      summary:
        'Chaque plongeon : 6/10 WA ou 7/10 EAH. Une des séries 1 m / 3 m peut être réalisée à 5 m, 7,5 m ou 10 m.',

      allowOnePlatformSubstitution:
        true,

      series: [

        seriesRule(
          1,
          ['103C','201B','301B','403C','TWIST'],
          6,
          7,
          {
            alternativeHeights:
              [5,7.5,10],

            choiceGroups: {

              TWIST:
                ['5122A','5221A','5321A']

            }

          }
        ),

        seriesRule(
          3,
          ['103C','201B','301B','403C','TWIST'],
          6,
          7,
          {
            alternativeHeights:
              [5,7.5,10],

            choiceGroups: {

              TWIST:
                ['5132D','5231D','5331D']

            }

          }
        )

      ]

    }

  },


  {

    sort_order:
      6,

    key:
      'BRONZE',

    name:
      'Blazon Bronze',

    image_url:
      'blazon-bronze.png',

    rules: {

      summary:
        'Chaque plongeon : 6/10 WA ou 7/10 EAH. Une des séries 1 m / 3 m peut être réalisée à 5 m, 7,5 m ou 10 m.',

      allowOnePlatformSubstitution:
        true,

      series: [

        seriesRule(
          1,
          ['203C','303C','403C','104C','TWIST'],
          6,
          7,
          {
            alternativeHeights:
              [5,7.5,10],

            choiceGroups: {
              TWIST:
                ['5132D','5231D','5331D']
            }

          }
        ),

        seriesRule(
          3,
          ['203C','303C','403C','105C','TWIST'],
          6,
          7,
          {
            alternativeHeights:
              [5,7.5,10],

            choiceGroups: {
              TWIST:
                ['5132D','5231D','5331D']
            }

          }
        )

      ]

    }

  },


  {

    sort_order:
      7,

    key:
      'ARGENT',

    name:
      'Blazon Argent',

    image_url:
      'blazon-argent.png',

    rules: {

      summary:
        'Chaque plongeon : 6/10 WA ou 7/10 EAH. Bord/plot + séries 1 m et 3 m.',

      allowOnePlatformSubstitution:
        true,

      series: [

        seriesRule(
          0,
          ['102C','202C','302C','402C'],
          6,
          7,
          {
            substitutable:
              false,
            label:
              'Bord / plot'
          }
        ),

        seriesRule(
          1,
          ['105C','204C','304C','404C','TWIST'],
          6,
          7,
          {
            alternativeHeights:
              [5,7.5,10],

            choiceGroups: {
              TWIST:
                ['5124D','5223D','5323D']
            }
          }
        ),

        seriesRule(
          3,
          ['105B','405C','303B','203B','TWIST'],
          6,
          7,
          {
            alternativeHeights:
              [5,7.5,10],

            choiceGroups: {
              TWIST:
                ['5134D','5233D','5333D']
            }
          }
        )

      ]

    }

  },


  {

    sort_order:
      8,

    key:
      'OR',

    name:
      'Blazon Or',

    image_url:
      'blazon-or.png',

    rules: {

      summary:
        '3 m : 6/10 WA ou 7/10 EAH. Série 1 m : 7/10 WA ou 8/10 EAH.',

      allowOnePlatformSubstitution:
        true,

      series: [

        seriesRule(
          3,
          ['105B','405C','205C','305C','TWIST'],
          6,
          7,
          {
            alternativeHeights:
              [5,7.5,10],

            choiceGroups: {
              TWIST:
                ['5134D','5235D','5335D']
            }
          }
        ),

        seriesRule(
          1,
          ['105B','403B','203B','303B','TWIST'],
          7,
          8,
          {
            alternativeHeights:
              [5,7.5,10],

            choiceGroups: {
              TWIST:
                ['5132D','5233D','5333D']
            }
          }
        )

      ]

    }

  },


  {

    sort_order:
      9,

    key:
      'NOIR',

    name:
      'Blazon Noir',

    image_url:
      'blazon-noir.png',

    rules: {

      summary:
        'Chaque plongeon : 6/10 WA ou 7/10 EAH.',

      allowOnePlatformSubstitution:
        true,

      series: [

        seriesRule(
          3,
          ['107C','405B','5152B','205B','305B'],
          6,
          7,
          {
            alternativeHeights:
              [5,7.5,10]
          }
        ),

        seriesRule(
          1,
          ['305C','405C','203B','105B','TWIST'],
          6,
          7,
          {
            alternativeHeights:
              [5,7.5,10],

            choiceGroups: {
              TWIST:
                ['5134D','5335D']
            }
          }
        )

      ]

    }

  },


  {

    sort_order:
      10,

    key:
      'LEGEND',

    name:
      'Blazon Legend',

    image_url:
      'blazon-legend.png',

    rules: {

      mode:
        'ANY_SERIES',

      summary:
        'Choisir et réussir une série Legend adaptée.',

      series: [

        seriesRule(
          3,
          ['109C','TWIST','207C','307C','407C'],
          6,
          7,
          {
            label:
              'Homme 3 m',

            choiceGroups: {
              TWIST:
                ['5154B','5337D']
            }
          }
        ),

        seriesRule(
          10,
          ['109C','TWIST','207C','307C','407C','ARM'],
          6,
          7,
          {
            label:
              'Homme 10 m',

            choiceGroups: {
              TWIST:
                ['5255B','5154B'],

              ARM:
                ['626C','616C']
            }
          }
        ),

        seriesRule(
          3,
          ['205B','405B','107B','5153B','305B'],
          6,
          7,
          {
            label:
              'Femme 3 m'
          }
        ),

        seriesRule(
          10,
          ['207C','407C','107B','5253B','305B','ARM'],
          6,
          7,
          {
            label:
              'Femme 10 m',

            choiceGroups: {
              ARM:
                ['626C','616C','6243D']
            }
          }
        )

      ]

    }

  },


  {

    sort_order:
      11,

    key:
      'TITAN',

    name:
      'Blazon Titan',

    image_url:
      'blazon-titan.png',

    rules: {

      mode:
        'ANY_ONE',

      summary:
        'Au moins un plongeon Titan à 6/10 WA ou 7/10 EAH, ou une série 1 m complète.',

      options: [

        seriesRule(
          10,
          ['ONE'],
          6,
          7,
          {
            label:
              'Homme 10 m',

            choiceGroups: {
              ONE: [
                '207B',
                '209C',
                '407B',
                '409C',
                '307B',
                '309C',
                '5162B',
                '5263B',
                '5257B',
                '628C',
                '109B',
                '1011C'
              ]
            }
          }
        ),

        seriesRule(
          3,
          ['ONE'],
          6,
          7,
          {
            label:
              'Homme 3 m',

            choiceGroups: {
              ONE: [
                '307B',
                '309C',
                '407B',
                '409C',
                '207B',
                '5163B',
                '5339D',
                '109B',
                '1011C'
              ]
            }
          }
        ),

        seriesRule(
          10,
          ['ONE'],
          6,
          7,
          {
            label:
              'Femme 10 m',

            choiceGroups: {
              ONE: [
                '307C',
                '207B',
                '407B',
                '409C',
                '109C',
                '5255B',
                '5154B'
              ]
            }
          }
        ),

        seriesRule(
          3,
          ['ONE'],
          6,
          7,
          {
            label:
              'Femme 3 m',

            choiceGroups: {
              ONE: [
                '307C',
                '407C',
                '109C',
                '5154B',
                '5253B',
                '5353B',
                '207C'
              ]
            }
          }
        )

      ],

      fullSeriesOptions: [

        seriesRule(
          1,
          ['205B','305B','405B','107B','TWIST'],
          6,
          7,
          {
            label:
              'Série 1 m Homme',

            choiceGroups: {
              TWIST:
                ['5154B','5337D']
            }
          }
        ),

        seriesRule(
          1,
          ['107C','405C','305C','205C','5152B'],
          6,
          7,
          {
            label:
              'Série 1 m Femme'
          }
        )

      ]

    }

  }

];



/* ============================================================
   DOM
============================================================ */

const pages =
  document.querySelectorAll(
    '.page'
  );


const navigation =
  document.getElementById(
    'navigation'
  );


const mobileMenu =
  document.getElementById(
    'mobileMenu'
  );


const siteModal =
  document.getElementById(
    'siteModal'
  );


const modalContent =
  document.getElementById(
    'modalContent'
  );



/* ============================================================
   OUTILS
============================================================ */

function esc(
  value
) {

  return String(
    value ??
    ''
  )
  .replace(
    /[&<>"']/g,
    char => ({

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

    }[char])
  );

}



function val(
  id
) {

  const element =
    document.getElementById(
      id
    );


  return element
    ?
    String(
      element.value ||
      ''
    )
    :
    '';

}



function bool(
  value
) {

  return (
    value ===
      true
    ||
    String(
      value
    )
    .toLowerCase() ===
      'true'
    ||
    String(
      value
    ) ===
      '1'
  );

}



function asNumber(
  value,
  fallback = null
) {

  if (
    value ===
      ''
    ||
    value ===
      null
    ||
    typeof value ===
      'undefined'
  ) {

    return fallback;

  }


  const n =
    Number(
      value
    );


  return Number.isFinite(
    n
  )
    ?
    n
    :
    fallback;

}



function fmtNumber(
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

    return '—';

  }


  const n =
    Number(
      value
    );


  if (
    !Number.isFinite(
      n
    )
  ) {

    return esc(
      value
    );

  }


  return String(
    Math.round(
      n * 10
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
  value,
  withTime = false
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

    return String(
      value
    );

  }


  return date.toLocaleDateString(

    'fr-FR',

    withTime
      ?
      {

        day:
          '2-digit',

        month:
          '2-digit',

        year:
          'numeric',

        hour:
          '2-digit',

        minute:
          '2-digit'

      }
      :
      undefined

  );

}



function normalizeBlazonName(
  name
) {

  return String(
    name ||
    ''
  )
  .normalize(
    'NFD'
  )
  .replace(
    /[\u0300-\u036f]/g,
    ''
  )
  .toUpperCase()
  .trim()
  .replace(
    /^BLAZON\s+/,
    ''
  )
  .replace(
    /^LE\s+BLAZON\s+/,
    ''
  );

}



function normalizeCode(
  code
) {

  return String(
    code ||
    ''
  )
  .trim()
  .toUpperCase()
  .replace(
    /\s+/g,
    ''
  );

}



function setLoadingButton(
  button,
  loading,
  loadingText,
  normalText
) {

  if (!button) {

    return;

  }


  button.disabled =
    Boolean(
      loading
    );


  button.textContent =
    loading
      ?
      loadingText
      :
      normalText;

}



function showToast(
  message,
  type = 'info',
  timeout = 3500
) {

  const container =
    document.getElementById(
      'toastContainer'
    );


  if (!container) {

    return;

  }


  const toast =
    document.createElement(
      'div'
    );


  toast.className =
    `toast ${type}`;


  toast.textContent =
    message;


  container.appendChild(
    toast
  );


  window.setTimeout(
    () => toast.remove(),
    timeout
  );

}



function setMessage(
  id,
  html = ''
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.innerHTML =
      html;

  }

}



function imagePath(
  value,
  fallback = ''
) {

  const raw =
    String(
      value ||
      ''
    )
    .trim();


  if (!raw) {

    return fallback;

  }


  return raw.replace(
    /^assets\/img\//,
    ''
  );

}



function clubColor(
  value,
  fallback
) {

  const color =
    String(
      value ||
      ''
    )
    .trim();


  return /^#[0-9a-f]{6}$/i
    .test(
      color
    )
    ?
    color
    :
    fallback;

}



function handleSupabaseError(
  error,
  fallback =
    'Une erreur est survenue.'
) {

  if (!error) {

    return fallback;

  }


  console.error(
    error
  );


  return (
    error.message
    ||
    fallback
  );

}



function requireSupabase() {

  if (!supabaseClient) {

    throw new Error(
      'Connexion Supabase non configurée.'
    );

  }


  return supabaseClient;

}



async function eahFastSha256(
  value
) {

  const bytes =
    new TextEncoder()
      .encode(
        String(
          value ||
          ''
        )
      );


  const digest =
    await crypto.subtle.digest(
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
      value =>
        value
          .toString(16)
          .padStart(
            2,
            '0'
          )
    )
    .join('');

}



function eahFastPhotoUrl(
  url,
  size = 'w1800'
) {

  const raw =
    String(
      url ||
      ''
    )
    .trim();


  if (!raw) {

    return '';

  }


  /*
    FICHIER LOCAL GITHUB
  */

  if (
    !/^https?:\/\//i.test(
      raw
    )
    &&
    !raw.startsWith(
      '//'
    )
  ) {

    return raw;

  }


  /*
    SUPABASE STORAGE PUBLIC
  */

  if (
    raw.includes(
      '/storage/v1/object/public/'
    )
  ) {

    return raw;

  }


  /*
    GOOGLE USER CONTENT
  */

  if (
    raw.includes(
      'googleusercontent.com'
    )
  ) {

    return raw;

  }


  try {

    const decoded =
      decodeURIComponent(
        raw
      );


    /*
      DRIVE :
      /file/d/FILE_ID/view
    */

    let match =
      decoded.match(
        /\/file\/d\/([^/?#]+)/
      );


    if (
      match &&
      match[1]
    ) {

      return (
        'https://drive.google.com/thumbnail?id='
        +
        encodeURIComponent(
          match[1]
        )
        +
        '&sz='
        +
        encodeURIComponent(
          size
        )
      );

    }


    /*
      DRIVE :
      /d/FILE_ID/
    */

    match =
      decoded.match(
        /\/d\/([^/?#]+)/
      );


    if (
      match &&
      match[1]
    ) {

      return (
        'https://drive.google.com/thumbnail?id='
        +
        encodeURIComponent(
          match[1]
        )
        +
        '&sz='
        +
        encodeURIComponent(
          size
        )
      );

    }


    /*
      DRIVE :
      ?id=FILE_ID
    */

    const parsed =
      new URL(
        raw,
        window.location.href
      );


    const id =
      parsed.searchParams.get(
        'id'
      );


    if (
      id &&
      (
        parsed.hostname.includes(
          'drive.google.com'
        )
        ||
        parsed.hostname.includes(
          'docs.google.com'
        )
      )
    ) {

      return (
        'https://drive.google.com/thumbnail?id='
        +
        encodeURIComponent(
          id
        )
        +
        '&sz='
        +
        encodeURIComponent(
          size
        )
      );

    }


  } catch (_) {}


  return raw;

}


/*
  FONCTION GLOBALE UTILISEE
  PAR SITE-FINAL ET PHOTOS-FINAL
*/

window.EAHMediaUrl =
  function(
    url,
    size = 'w1800'
  ) {

    return eahFastPhotoUrl(
      url,
      size
    );

  };



/* ============================================================
   NAVIGATION
============================================================ */

function showPage(
  pageName,
  updateHash = true
) {

  pages.forEach(
    page => {

      page.classList.toggle(
        'active',
        page.id ===
        pageName
      );

    }
  );


  document.documentElement
    .classList
    .toggle(
      'eah-page-club',
      pageName ===
      'club'
    );


  if (
    updateHash &&
    window.location.hash !==
      `#${pageName}`
  ) {

    history.replaceState(

      null,

      '',

      (
        window.location.pathname
        +
        window.location.search
        +
        '#'
        +
        pageName
      )

    );

  }


  navigation
    ?.classList
    .remove(
      'open'
    );


  window.scrollTo({

    top:
      0,

    behavior:
      'auto'

  });


  if (
    pageName ===
      'profil'
  ) {

    restoreOrLoadProfile()
      .catch(
        console.warn
      );

  }


  if (
    pageName ===
      'club'
  ) {

    restoreCoachSession()
      .catch(
        console.warn
      );

  }


  if (
    pageName ===
      'evaluation'
  ) {

    updateEvaluationAccess();

  }

}



document
  .querySelectorAll(
    '[data-page]'
  )
  .forEach(
    link => {

      link.addEventListener(

        'click',

        event => {

          event.preventDefault();

          showPage(
            link.dataset.page
          );

        }

      );

    }
  );


document
  .querySelectorAll(
    '[data-page-button]'
  )
  .forEach(
    button => {

      button.addEventListener(

        'click',

        () => {

          showPage(
            button.dataset.pageButton
          );

        }

      );

    }
  );


document
  .querySelectorAll(
    '[data-open]'
  )
  .forEach(
    card => {

      card.addEventListener(

        'click',

        () => {

          showPage(
            card.dataset.open
          );

        }

      );

    }
  );


mobileMenu
  ?.addEventListener(

    'click',

    () => {

      navigation
        ?.classList
        .toggle(
          'open'
        );

    }

  );



/* ============================================================
   MODAL
============================================================ */

function openModal(
  html
) {

  if (
    !siteModal ||
    !modalContent
  ) {

    return;

  }


  modalContent.innerHTML =
    html;


  siteModal.classList.add(
    'show'
  );


  siteModal.setAttribute(
    'aria-hidden',
    'false'
  );


  document.body.classList.add(
    'modal-open'
  );

}



function closeModal() {

  if (!siteModal) {

    return;

  }


  siteModal.classList.remove(
    'show'
  );


  siteModal.setAttribute(
    'aria-hidden',
    'true'
  );


  document.body.classList.remove(
    'modal-open'
  );

}



document.addEventListener(

  'click',

  event => {

    if (
      event.target.matches(
        '[data-close-modal]'
      )
    ) {

      closeModal();

    }

  }

);



document.addEventListener(

  'keydown',

  event => {

    if (
      event.key ===
        'Escape'
    ) {

      closeModal();

    }

  }

);



/* ============================================================
   DONNEES PUBLIQUES
============================================================ */

async function loadPublicData() {

  state.blazons =
    BLAZON_FALLBACK.slice();


  state.pricing =
    PRICING_FALLBACK.slice();


  renderBlazons();

  renderPricing();

  renderSpots();

  renderNews();

  renderSpotSelect();


  if (!supabaseClient) {

    return;

  }


  const [

    blazonsRes,

    pricingRes,

    spotsRes,

    newsRes

  ] =
    await Promise.all([


      supabaseClient
        .from(
          'blazon_definitions'
        )
        .select(
          'sort_order,key,name,image_url,rules,active'
        )
        .eq(
          'active',
          true
        )
        .order(
          'sort_order'
        ),


      supabaseClient
        .from(
          'pricing'
        )
        .select(
          'id,name,price,renewal,description,card_quota,coach_quota,active,sort_order'
        )
        .eq(
          'active',
          true
        )
        .order(
          'sort_order'
        ),


      supabaseClient
        .from(
          'spots'
        )
        .select(
          'id,name,city,address,heights,photo_url,description,active'
        )
        .eq(
          'active',
          true
        )
        .order(
          'name'
        ),


      supabaseClient
        .from(
          'news'
        )
        .select(
          'id,sort_order,category,title,summary,content,image_url,video_url,link_url,featured,published_at,active'
        )
        .eq(
          'active',
          true
        )
        .order(
          'sort_order'
        )
        .order(
          'published_at',
          {
            ascending:
              false
          }
        )

    ]);


  if (
    !blazonsRes.error &&
    Array.isArray(
      blazonsRes.data
    ) &&
    blazonsRes.data.length
  ) {

    state.blazons =
      blazonsRes.data;

  }


  if (
    !pricingRes.error &&
    Array.isArray(
      pricingRes.data
    ) &&
    pricingRes.data.length
  ) {

    state.pricing =
      pricingRes.data;

  }


  if (
    !spotsRes.error &&
    Array.isArray(
      spotsRes.data
    )
  ) {

    state.spots =
      spotsRes.data;

  }


  if (
    !newsRes.error &&
    Array.isArray(
      newsRes.data
    )
  ) {

    state.news =
      newsRes.data;

  }


  state.publicLoaded =
    true;


  renderBlazons();

  renderPricing();

  renderSpots();

  renderNews();

  renderSpotSelect();

}



/* ============================================================
   CLUB
============================================================ */

async function loadClubBranding() {

  if (
    !CLUB_SLUG ||
    !supabaseClient
  ) {

    return null;

  }


  const {
    data,
    error
  } =
    await supabaseClient

      .from(
        'clubs'
      )

      .select(
        'id,slug,name,city,logo_url,primary_color,secondary_color,season,welcome_text,offer,card_quota,active'
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
    error ||
    !data
  ) {

    if (error) {

      console.warn(
        error
      );

    }


    return null;

  }


  state.club =
    data;


  applyClubBranding(
    data
  );


  return data;

}



function applyClubBranding(
  club
) {

  if (!club) {

    return;

  }


  document.documentElement
    .style
    .setProperty(

      '--blue',

      clubColor(
        club.primary_color,
        '#0b6bff'
      )

    );


  document.documentElement
    .style
    .setProperty(

      '--background',

      clubColor(
        club.secondary_color,
        '#03131f'
      )

    );


  const dashboardClubName =
    document.getElementById(
      'dashboardClubName'
    );


  if (dashboardClubName) {

    dashboardClubName.textContent =
      club.name ||
      'EAH Diving Club';

  }


  document.title =
    (
      club.name ||
      'EAH Diving Club'
    )
    +
    ' — EAH Diving Pro';

}



/* ============================================================
   BLAZONS
============================================================ */

function getBlazonImage(
  blazon
) {

  const key =
    normalizeBlazonName(
      blazon.key ||
      blazon.name
    );


  return (
    BLAZON_IMAGES[
      key
    ]
    ||
    imagePath(
      blazon.image_url ||
      blazon.imageUrl,
      ''
    )
  );

}



function getBlazonRules(
  blazon
) {

  const raw =
    blazon
      ?.rules;


  if (!raw) {

    return {};

  }


  if (
    typeof raw ===
      'object'
  ) {

    return raw;

  }


  try {

    return JSON.parse(
      raw
    );

  } catch (_) {

    return {};

  }

}



function renderBlazons() {

  const grid =
    document.getElementById(
      'blazonGrid'
    );


  if (!grid) {

    return;

  }


  const list =
    (
      state.blazons ||
      []
    )
    .slice()
    .sort(
      (a,b) =>
        Number(
          a.sort_order ??
          a.order ??
          999
        )
        -
        Number(
          b.sort_order ??
          b.order ??
          999
        )
    );


  grid.innerHTML =
    list.length
      ?
      list
        .map(
          (
            blazon,
            index
          ) => {

            const image =
              getBlazonImage(
                blazon
              );


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
                      src="${esc(image)}"
                      alt="${esc(blazon.name)}"
                      loading="eager"
                    >
                  `
                  :
                  ''
                }

                <h3>
                  ${esc(blazon.name)}
                </h3>

                <span>
                  Voir les critères →
                </span>

              </article>

            `;

          }
        )
        .join('')
      :
      `
        <div class="loading-panel">
          Aucun blazon disponible.
        </div>
      `;


  grid
    .querySelectorAll(
      '[data-blazon-index]'
    )
    .forEach(
      card => {

        card.addEventListener(

          'click',

          () => {

            openBlazon(
              Number(
                card.dataset.blazonIndex
              ),
              list
            );

          }

        );

      }
    );

}



function openBlazon(
  index,
  list =
    state.blazons
) {

  const blazon =
    list[
      index
    ];


  if (!blazon) {

    return;

  }


  const rules =
    getBlazonRules(
      blazon
    );


  const sections = [

    ...(
      rules.series ||
      []
    ),

    ...(
      rules.options ||
      []
    ),

    ...(
      rules.fullSeriesOptions ||
      []
    )

  ];


  let html = `

    <div class="modal-inner">

      <span class="overline">
        PROGRESSION EAH
      </span>

      <h2>
        ${esc(blazon.name)}
      </h2>

      ${
        rules.summary
        ?
        `
          <div class="modal-note">
            ${esc(rules.summary)}
          </div>
        `
        :
        ''
      }

  `;


  sections.forEach(
    serie => {

      const label =
        serie.label
        ||
        (
          Number(
            serie.height
          ) ===
          0
          ?
          'Bord / plot'
          :
          `${serie.height} m`
        );


      html += `

        <div class="blazon-series">

          <h3>
            ${esc(label)}
          </h3>

          <p>

            <strong>
              Validation :
            </strong>

            ${esc(
              serie.minWa ??
              '—'
            )}/10 WA

            ou

            ${esc(
              serie.minEah ??
              '—'
            )}/10 EAH

          </p>

      `;


      (
        serie.codes ||
        []
      )
      .forEach(
        code => {

          const choices =
            serie
              .choiceGroups
              ?.[code];


          if (
            Array.isArray(
              choices
            )
          ) {

            html += `

              <p>

                <strong>
                  Au choix :
                </strong>

                ${
                  choices
                    .map(
                      choice =>
                        esc(choice)
                        +
                        (
                          DIVE_NAMES[
                            choice
                          ]
                          ?
                          ' — '
                          +
                          esc(
                            DIVE_NAMES[
                              choice
                            ]
                          )
                          :
                          ''
                        )
                    )
                    .join('<br>')
                }

              </p>

            `;

          } else {

            html += `

              <p>

                <strong>
                  ${esc(code)}
                </strong>

                ${
                  DIVE_NAMES[
                    code
                  ]
                  ?
                  ' — '
                  +
                  esc(
                    DIVE_NAMES[
                      code
                    ]
                  )
                  :
                  ''
                }

              </p>

            `;

          }

        }
      );


      html += `
        </div>
      `;

    }
  );


  html += `
    </div>
  `;


  openModal(
    html
  );

}



/* ============================================================
   TARIFS
============================================================ */

function renderPricing() {

  const grid =
    document.getElementById(
      'pricingGrid'
    );


  if (!grid) {

    return;

  }


  const list =
    (
      state.pricing ||
      PRICING_FALLBACK
    )
    .slice()
    .sort(
      (a,b) =>
        Number(
          a.sort_order ??
          999
        )
        -
        Number(
          b.sort_order ??
          999
        )
    );


  grid.innerHTML =
    list
      .map(
        item => `

          <article class="price-card">

            <small>
              ${esc(
                item.id ||
                'EAH'
              )}
            </small>

            <h3>
              ${esc(
                item.name ||
                ''
              )}
            </h3>

            <div class="price">
              ${esc(
                item.price ??
                '—'
              )}
            </div>

            <p>
              ${esc(
                item.description ||
                ''
              )}
            </p>

            ${
              item.renewal &&
              item.renewal !==
                '—'
              ?
              `
                <div class="price-renewal">
                  Renouvellement :
                  ${esc(item.renewal)}
                </div>
              `
              :
              ''
            }

          </article>

        `
      )
      .join('');

}



/* ============================================================
   SPOTS
============================================================ */

function renderSpots() {

  const grid =
    document.getElementById(
      'spotsGrid'
    );


  if (!grid) {

    return;

  }


  if (
    !state.spots.length
  ) {

    grid.innerHTML = `

      <div class="loading-panel">
        Aucun spot EAH publié actuellement.
      </div>

    `;


    return;

  }


  grid.innerHTML =
    state.spots
      .map(
        spot => {

          const heights =
            String(
              spot.heights ||
              ''
            )
            .split(
              /[,;]+/
            )
            .map(
              value =>
                value.trim()
            )
            .filter(
              Boolean
            );


          const originalImage =
            String(
              spot.photo_url ||
              ''
            )
            .trim();


          const image =
            eahFastPhotoUrl(
              originalImage,
              'w1800'
            );


          return `

            <article
              class="spot"
              data-eah-spot
              aria-expanded="false"
            >

              <div class="spot-picture">

                ${
                  image
                  ?
                  `

                    <img
                      class="eah-cms-image"
                      src="${esc(image)}"
                      data-eah-original-image="${esc(originalImage)}"
                      alt="${esc(
                        spot.name ||
                        'Spot EAH'
                      )}"
                      loading="eager"
                      decoding="async"
                    >

                  `
                  :
                  `

                    <div
                      class="eah-cms-image-fallback"
                    >
                      EAH DIVING
                    </div>

                  `
                }

              </div>


              <div class="spot-content">

                <span class="overline">

                  ${esc(
                    spot.city ||
                    'SPOT EAH'
                  )}

                </span>


                <h2>
                  ${esc(
                    spot.name ||
                    ''
                  )}
                </h2>


                <div class="tags">

                  ${
                    heights
                      .map(
                        height => `

                          <span>
                            ${esc(height)}
                          </span>

                        `
                      )
                      .join('')
                  }

                </div>


                <div
                  class="spot-details"
                  hidden
                >

                  ${
                    spot.address
                    ?
                    `

                      <div class="spot-detail-block">

                        <strong>
                          Adresse
                        </strong>

                        <p>
                          ${esc(spot.address)}
                        </p>

                      </div>

                    `
                    :
                    ''
                  }


                  ${
                    spot.description
                    ?
                    `

                      <div class="spot-detail-block">

                        <strong>
                          Description
                        </strong>

                        <p>
                          ${esc(spot.description)}
                        </p>

                      </div>

                    `
                    :
                    ''
                  }

                </div>


                <div class="spot-open-label">
                  Voir les informations
                </div>

              </div>

            </article>

          `;

        }
      )
      .join('');


  grid
    .querySelectorAll(
      '.eah-cms-image'
    )
    .forEach(
      img => {

        img.addEventListener(

          'error',

          function() {

            console.warn(

              'Image spot inaccessible :',

              this.dataset.eahOriginalImage
              ||
              this.src

            );


            this.style.display =
              'none';


            const parent =
              this.parentElement;


            if (
              parent &&
              !parent.querySelector(
                '.eah-cms-image-fallback'
              )
            ) {

              const fallback =
                document.createElement(
                  'div'
                );


              fallback.className =
                'eah-cms-image-fallback';


              fallback.textContent =
                'EAH DIVING';


              parent.appendChild(
                fallback
              );

            }

          },

          {
            once:
              true
          }

        );

      }
    );


  grid
    .querySelectorAll(
      '[data-eah-spot]'
    )
    .forEach(
      card => {

        card.addEventListener(

          'click',

          () => {

            const details =
              card.querySelector(
                '.spot-details'
              );


            const expanded =
              card.getAttribute(
                'aria-expanded'
              ) ===
              'true';


            card.setAttribute(

              'aria-expanded',

              expanded
                ?
                'false'
                :
                'true'

            );


            if (details) {

              details.hidden =
                expanded;

            }


            const label =
              card.querySelector(
                '.spot-open-label'
              );


            if (label) {

              label.textContent =
                expanded
                  ?
                  'Voir les informations'
                  :
                  'Masquer les informations';

            }

          }

        );

      }
    );

}



function renderSpotSelect() {

  const select =
    document.getElementById(
      'spotId'
    );


  if (!select) {

    return;

  }


  select.innerHTML = `

    <option value="">
      Autre / non répertorié
    </option>

    ${
      state.spots
        .map(
          spot => `

            <option
              value="${esc(spot.id)}"
              data-name="${esc(spot.name)}"
            >

              ${esc(spot.name)}

              ${
                spot.city
                ?
                ' — '
                +
                esc(
                  spot.city
                )
                :
                ''
              }

            </option>

          `
        )
        .join('')
    }

  `;

}



/* ============================================================
   ACTUALITES
============================================================ */

function renderNews() {

  const grid =
    document.getElementById(
      'newsGrid'
    );


  if (!grid) {

    return;

  }


  if (
    !state.news.length
  ) {

    grid.innerHTML = `

      <div class="loading-panel">
        Aucune actualité publiée actuellement.
      </div>

    `;


    return;

  }


  grid.innerHTML =
    state.news
      .map(
        news => {

          const originalImage =
            String(
              news.image_url ||
              ''
            )
            .trim();


          const image =
            eahFastPhotoUrl(
              originalImage,
              'w1800'
            );


          return `

            <article
              class="news-card"
              data-eah-news-id="${esc(
                news.id ||
                ''
              )}"
            >

              ${
                image
                ?
                `

                  <img
                    class="news-image eah-cms-image"
                    src="${esc(image)}"
                    data-eah-original-image="${esc(originalImage)}"
                    alt="${esc(
                      news.title ||
                      'Actualité EAH Diving'
                    )}"
                    loading="eager"
                    decoding="async"
                  >

                `
                :
                `

                  <div
                    class="news-image eah-cms-image-fallback"
                  >
                    EAH DIVING
                  </div>

                `
              }


              <div class="news-body">

                <span class="overline">

                  ${esc(
                    news.category ||
                    'EAH DIVING'
                  )}

                </span>


                <h3>
                  ${esc(
                    news.title ||
                    ''
                  )}
                </h3>


                ${
                  news.published_at
                  ?
                  `

                    <small class="muted">

                      ${esc(
                        fmtDate(
                          news.published_at
                        )
                      )}

                    </small>

                  `
                  :
                  ''
                }


                ${
                  news.summary
                  ?
                  `

                    <p>
                      ${esc(news.summary)}
                    </p>

                  `
                  :
                  ''
                }

              </div>

            </article>

          `;

        }
      )
      .join('');


  grid
    .querySelectorAll(
      '.eah-cms-image'
    )
    .forEach(
      img => {

        img.addEventListener(

          'error',

          function() {

            console.warn(

              'Image actualité inaccessible :',

              this.dataset.eahOriginalImage
              ||
              this.src

            );


            this.style.display =
              'none';


            const parent =
              this.parentElement;


            if (
              parent &&
              !parent.querySelector(
                '.eah-cms-image-fallback'
              )
            ) {

              const fallback =
                document.createElement(
                  'div'
                );


              fallback.className =
                'news-image eah-cms-image-fallback';


              fallback.textContent =
                'EAH DIVING';


              parent.insertBefore(

                fallback,

                parent.firstChild

              );

            }

          },

          {
            once:
              true
          }

        );

      }
    );

}



/* ============================================================
   GRADING
============================================================ */

const gradingSheets = {

  D: {

    title:
      'Takeoff — Départ',

    image:
      'grading-takeoff.png',

    text:
      'Coordination, impulsion, trajectoire, fixation et amplitude des bras.'

  },


  T: {

    title:
      'Trick — Phase aérienne',

    image:
      'grading-trick.png',

    text:
      'Rotations, contrôle des saltos et vrilles, ligne, ouverture et rythme.'

  },


  E: {

    title:
      'Entry — Entrée',

    image:
      'grading-entry.png',

    text:
      "Angle, éclaboussures, position des bras, jambes et axe d'entrée."

  }

};



document
  .querySelectorAll(
    '.grading-card[data-sheet]'
  )
  .forEach(
    card => {

      card.addEventListener(

        'click',

        () => {

          const data =
            gradingSheets[
              card.dataset.sheet
            ];


          if (!data) {

            return;

          }


          openModal(`

            <div class="modal-inner">

              <span class="overline">
                GRILLE EAH
              </span>

              <h2>
                ${esc(data.title)}
              </h2>

              <p>
                ${esc(data.text)}
              </p>

              <img
                class="modal-image"
                src="${esc(data.image)}"
                alt="${esc(data.title)}"
              >

            </div>

          `);

        }

      );

    }
  );



/* ============================================================
   CRITERES
============================================================ */

function renderCriteria() {

  Object.entries(
    CRITERIA
  )
  .forEach(
    (
      [
        prefix,
        items
      ]
    ) => {

      const container =
        document.getElementById(
          `criteria${prefix}`
        );


      if (!container) {

        return;

      }


      container.innerHTML =
        items
          .map(
            (
              item,
              index
            ) => `

              <div>

                <strong>
                  ${prefix}${index + 1}
                </strong>

                &nbsp;—&nbsp;

                ${esc(item)}

              </div>


              <select
                id="${prefix}${index + 1}"
              >

                <option value="2">
                  2 — Validé
                </option>

                <option value="1">
                  1 — Partiel
                </option>

                <option value="0">
                  0 — Non validé
                </option>

                <option value="NA">
                  N/A
                </option>

              </select>

            `
          )
          .join('');

    }
  );

}



function criterionScore(
  prefix
) {

  let sum =
    0;


  let max =
    0;


  for (
    let i = 1;
    i <= 5;
    i++
  ) {

    const raw =
      val(
        `${prefix}${i}`
      );


    if (
      raw ===
        'NA'
      ||
      raw ===
        ''
    ) {

      continue;

    }


    const n =
      Number(
        raw
      );


    if (
      !Number.isFinite(
        n
      )
    ) {

      continue;

    }


    sum +=
      Math.max(
        0,
        Math.min(
          2,
          n
        )
      );


    max +=
      2;

  }


  if (!max) {

    return 0;

  }


  return Math.round(
    (
      sum /
      max
    )
    *
    10
  );

}



function finalEahScore(
  takeoff,
  trick,
  entry
) {

  const values = [

    Number(
      takeoff
    ),

    Number(
      trick
    ),

    Number(
      entry
    )

  ];


  const min =
    Math.min(
      ...values
    );


  const count =
    values
      .filter(
        value =>
          value ===
          min
      )
      .length;


  return Math.min(

    10,

    count ===
      1
      ?
      min + 0.5
      :
      min

  );

}



function collectCriteria() {

  const result =
    {};


  [
    'D',
    'T',
    'E'
  ]
  .forEach(
    prefix => {

      for (
        let i = 1;
        i <= 5;
        i++
      ) {

        result[
          `${prefix}${i}`
        ] =
          val(
            `${prefix}${i}`
          );

      }

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
   CODES PLONGEONS
============================================================ */

function renderDiveCodes() {

  const datalist =
    document.getElementById(
      'diveCodes'
    );


  if (!datalist) {

    return;

  }


  datalist.innerHTML =
    Object.entries(
      DIVE_NAMES
    )
    .map(
      (
        [
          code,
          name
        ]
      ) => `

        <option value="${esc(code)}">
          ${esc(name)}
        </option>

      `
    )
    .join('');

}



/* ============================================================
   COACH
============================================================ */

async function eahFastCoachMembership(
  userId
) {

  const sb =
    requireSupabase();


  const {
    data:
      memberships,
    error
  } =
    await sb
      .from(
        'club_members'
      )
      .select(
        'id,club_id,user_id,display_name,email,role,active'
      )
      .eq(
        'user_id',
        userId
      )
      .eq(
        'active',
        true
      );


  if (error) {

    throw error;

  }


  if (
    !memberships
      ?.length
  ) {

    throw new Error(
      'Ce compte n’est rattaché à aucun club actif.'
    );

  }


  let membership =
    null;


  let club =
    null;


  if (CLUB_SLUG) {

    const {
      data
    } =
      await sb
        .from(
          'clubs'
        )
        .select(
          'id,slug,name,city,logo_url,primary_color,secondary_color,season,welcome_text,offer,card_quota,active'
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


    if (data) {

      club =
        data;


      membership =
        memberships.find(
          item =>
            item.club_id ===
            data.id
        )
        ||
        null;

    }

  }


  if (!membership) {

    membership =
      memberships[
        0
      ];


    const {
      data,
      error:
        clubError
    } =
      await sb
        .from(
          'clubs'
        )
        .select(
          'id,slug,name,city,logo_url,primary_color,secondary_color,season,welcome_text,offer,card_quota,active'
        )
        .eq(
          'id',
          membership.club_id
        )
        .single();


    if (
      clubError
    ) {

      throw clubError;

    }


    club =
      data;

  }


  state.membership =
    membership;


  state.club =
    club;


  CLUB_SLUG =
    club.slug;


  state.coach = {

    id:
      membership.id,

    userId:
      userId,

    name:
      membership.display_name
      ||
      state.user?.email
      ||
      'Coach',

    role:
      membership.role
      ||
      'COACH',

    email:
      membership.email
      ||
      state.user?.email
      ||
      ''

  };


  applyClubBranding(
    club
  );


  return membership;

}



async function coachLogin(
  event
) {

  event
    ?.preventDefault();


  const email =
    val(
      'coachEmail'
    )
    .trim()
    .toLowerCase();


  const password =
    val(
      'coachPassword'
    );


  const button =
    document.getElementById(
      'coachLoginButton'
    );


  if (
    !email ||
    !password
  ) {

    setMessage(

      'loginMsg',

      `
        <div class="notice error">
          E-mail et mot de passe obligatoires.
        </div>
      `

    );


    return;

  }


  setLoadingButton(

    button,

    true,

    'Connexion…',

    "Accéder à l'espace coach"

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
      error ||
      !data?.user
    ) {

      throw (
        error ||
        new Error(
          'Connexion impossible.'
        )
      );

    }


    state.user =
      data.user;


    await eahFastCoachMembership(
      data.user.id
    );


    showCoachPrivate();


    setMessage(
      'loginMsg',
      ''
    );


    showToast(
      'Connexion réussie.',
      'success'
    );


    loadCoachData()
      .catch(
        console.warn
      );


  } catch (
    error
  ) {

    setMessage(

      'loginMsg',

      `
        <div class="notice error">

          ${esc(
            handleSupabaseError(
              error,
              'Connexion refusée.'
            )
          )}

        </div>
      `

    );


  } finally {

    setLoadingButton(

      button,

      false,

      '',

      "Accéder à l'espace coach"

    );

  }

}



async function restoreCoachSession() {

  if (!supabaseClient) {

    return false;

  }


  if (
    state.user &&
    state.membership
  ) {

    showCoachPrivate();

    return true;

  }


  const {
    data
  } =
    await supabaseClient
      .auth
      .getSession();


  const user =
    data
      ?.session
      ?.user;


  if (!user) {

    showCoachLoggedOut();

    return false;

  }


  try {

    state.user =
      user;


    await eahFastCoachMembership(
      user.id
    );


    showCoachPrivate();


    loadCoachData()
      .catch(
        console.warn
      );


    return true;


  } catch (
    error
  ) {

    console.warn(
      error
    );


    showCoachLoggedOut();


    return false;

  }

}



function showCoachPrivate() {

  document
    .getElementById(
      'clubAccess'
    )
    ?.classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'coachPrivate'
    )
    ?.classList
    .remove(
      'hidden'
    );


  const label =
    (
      state.coach
        ?.name
      ||
      'Coach'
    )
    +
    ' • '
    +
    (
      state.coach
        ?.role
      ||
      'COACH'
    );


  const badge =
    document.getElementById(
      'dashboardCoachBadge'
    );


  const evalBadge =
    document.getElementById(
      'coachBadge'
    );


  if (badge) {

    badge.textContent =
      label;

  }


  if (evalBadge) {

    evalBadge.textContent =
      label;

  }


  updateEvaluationAccess();

}



function showCoachLoggedOut() {

  document
    .getElementById(
      'coachPrivate'
    )
    ?.classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'clubAccess'
    )
    ?.classList
    .remove(
      'hidden'
    );


  updateEvaluationAccess();

}



async function logoutCoach() {

  try {

    await supabaseClient
      ?.auth
      .signOut();

  } catch (_) {}


  state.user =
    null;


  state.membership =
    null;


  state.coach =
    null;


  state.divers =
    [];


  state.groups =
    [];


  showCoachLoggedOut();


  showPage(
    'club'
  );

}



/* ============================================================
   EVALUATION ACCESS
============================================================ */

function updateEvaluationAccess() {

  const locked =
    document.getElementById(
      'evaluationLocked'
    );


  const form =
    document.getElementById(
      'evaluationForm'
    );


  const allowed =
    Boolean(

      state.user &&

      state.membership &&

      state.club

    );


  locked
    ?.classList
    .toggle(
      'hidden',
      allowed
    );


  form
    ?.classList
    .toggle(
      'hidden',
      !allowed
    );

}



/* ============================================================
   DASHBOARD
============================================================ */

async function loadCoachData() {

  if (
    !state.club?.id ||
    !state.user
  ) {

    return;

  }


  const sb =
    requireSupabase();


  const clubId =
    state.club.id;


  const [

    diversRes,

    evalsRes,

    progressRes,

    groupsRes,

    totalRes

  ] =
    await Promise.all([


      sb
        .from(
          'divers'
        )
        .select(
          'id,eah_id,first_name,last_name,photo_url,group_id,group_name,current_blazon,profile_visibility,sex,active,created_at'
        )
        .eq(
          'club_id',
          clubId
        )
        .eq(
          'active',
          true
        )
        .order(
          'last_name'
        ),


      sb
        .from(
          'evaluations'
        )
        .select(
          'id,evaluation_code,eah_id,coach_name,dive_code,dive_name,height,wa_score,eah_score,eah_verified,report_url,evaluated_at'
        )
        .eq(
          'club_id',
          clubId
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
        ),


      sb
        .from(
          'blazon_progress'
        )
        .select(
          'id,eah_id,blazon_key,blazon_name,status,progress,earned_at'
        )
        .eq(
          'club_id',
          clubId
        ),


      sb
        .from(
          'groups'
        )
        .select(
          'id,name,description,active'
        )
        .eq(
          'club_id',
          clubId
        )
        .eq(
          'active',
          true
        )
        .order(
          'name'
        ),


      sb
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
          clubId
        )

    ]);


  if (
    diversRes.error
  ) {

    throw diversRes.error;

  }


  if (
    evalsRes.error
  ) {

    throw evalsRes.error;

  }


  state.divers =
    diversRes.data ||
    [];


  state.groups =
    groupsRes.data ||
    [];


  renderDiversSelect();


  renderDashboard({

    divers:
      state.divers,

    evaluations:
      evalsRes.data ||
      [],

    evaluationTotal:
      totalRes.count
      ??
      (
        evalsRes.data ||
        []
      ).length,

    progress:
      progressRes.data ||
      [],

    groups:
      state.groups

  });

}



function renderDashboard({

  divers,

  evaluations,

  evaluationTotal,

  progress

}) {

  const statsBox =
    document.getElementById(
      'dashboardStats'
    );


  if (!statsBox) {

    return;

  }


  const verified =
    evaluations
      .filter(
        item =>
          bool(
            item.eah_verified
          )
      )
      .length;


  const obtained =
    progress
      .filter(
        item =>
          item.status ===
          'OBTENU'
      )
      .length;


  const stats = [

    [
      divers.length,
      'Plongeurs'
    ],

    [
      evaluationTotal,
      'Grade Reports'
    ],

    [
      verified,
      'EAH Verified'
    ],

    [
      obtained,
      'Blazons obtenus'
    ]

  ];


  statsBox.innerHTML =
    stats
      .map(
        (
          [
            value,
            label
          ]
        ) => `

          <div class="stat-card">

            <strong>
              ${esc(value)}
            </strong>

            <span>
              ${esc(label)}
            </span>

          </div>

        `
      )
      .join('');


  const recent =
    document.getElementById(
      'recentDashboard'
    );


  if (recent) {

    recent.innerHTML =
      evaluations
        .slice(
          0,
          10
        )
        .map(
          item => `

            <div class="history-item">

              <span>

                <strong>
                  ${esc(
                    item.dive_code ||
                    '—'
                  )}
                </strong>

                <br>

                <small>
                  ${esc(
                    fmtDate(
                      item.evaluated_at
                    )
                  )}
                  •
                  ${esc(
                    item.eah_id ||
                    ''
                  )}
                </small>

              </span>


              <span class="history-score">

                <strong>
                  EAH
                  ${esc(
                    fmtNumber(
                      item.eah_score
                    )
                  )}
                </strong>

                ${
                  item.report_url
                  ?
                  `
                    <a
                      href="${esc(item.report_url)}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Grade Report
                    </a>
                  `
                  :
                  ''
                }

              </span>

            </div>

          `
        )
        .join('')
      ||
      'Aucune évaluation.';

  }


  const groupBox =
    document.getElementById(
      'groupsDashboard'
    );


  if (groupBox) {

    const counts =
      {};


    divers.forEach(
      diver => {

        const name =
          diver.group_name
          ||
          'Sans groupe';


        counts[
          name
        ] =
          (
            counts[
              name
            ]
            ||
            0
          )
          +
          1;

      }
    );


    groupBox.innerHTML =
      Object.entries(
        counts
      )
      .map(
        (
          [
            name,
            count
          ]
        ) => `

          <div class="history-item">

            <strong>
              ${esc(name)}
            </strong>

            <span>
              ${esc(count)}
              plongeur(s)
            </span>

          </div>

        `
      )
      .join('')
      ||
      'Aucun groupe.';

  }

}



function renderDiversSelect() {

  const select =
    document.getElementById(
      'eahId'
    );


  if (!select) {

    return;

  }


  if (
    !state.divers.length
  ) {

    select.innerHTML = `

      <option value="">
        Aucun plongeur
      </option>

    `;


    return;

  }


  select.innerHTML =
    state.divers
      .map(
        diver => {

          const name =
            (
              (
                diver.first_name ||
                ''
              )
              +
              ' '
              +
              (
                diver.last_name ||
                ''
              )
            )
            .trim()
            ||
            diver.eah_id;


          return `

            <option
              value="${esc(diver.eah_id)}"
            >

              ${esc(name)}

              —

              ${esc(
                diver.group_name ||
                'Sans groupe'
              )}

            </option>

          `;

        }
      )
      .join('');

}



/* ============================================================
   POPULATION
============================================================ */

function normalizePopulationResult(
  data
) {

  const result =
    Array.isArray(
      data
    )
    ?
    (
      data[0] ||
      {}
    )
    :
    (
      data ||
      {}
    );


  return {

    ok:
      result.ok !==
      false,

    people:
      Number(
        result.people ??
        0
      ),

    count:
      Number(
        result.count ??
        0
      ),

    avg_eah:
      result.avg_eah ??
      null,

    avg_wa:
      result.avg_wa ??
      null,

    divers:
      Array.isArray(
        result.divers
      )
      ?
      result.divers
      :
      [],

    gradings:
      Array.isArray(
        result.gradings
      )
      ?
      result.gradings
      :
      []

  };

}



function publicProfileUrl(
  diver
) {

  const url =
    new URL(
      window.location.href
    );


  url.search =
    '';


  const clubSlug =
    diver.club_slug
    ||
    diver.clubSlug
    ||
    CLUB_SLUG;


  if (clubSlug) {

    url.searchParams.set(
      'club',
      clubSlug
    );

  }


  url.searchParams.set(

    'id',

    diver.eah_id
    ||
    diver.eahId

  );


  url.hash =
    'profil';


  return url.toString();

}



function renderPopulationResults(
  box,
  result,
  code,
  name
) {

  const divers =
    result.divers ||
    [];


  const gradings =
    result.gradings ||
    [];


  box.innerHTML = `

    <div class="population-stats">

      <div class="stat-card">

        <strong>
          ${esc(result.people)}
        </strong>

        <span>
          Plongeurs EAH
        </span>

      </div>


      <div class="stat-card">

        <strong>
          ${esc(result.count)}
        </strong>

        <span>
          Gradings
        </span>

      </div>


      <div class="stat-card">

        <strong>
          ${esc(
            fmtNumber(
              result.avg_eah
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
              result.avg_wa
            )
          )}
        </strong>

        <span>
          Moyenne WA
        </span>

      </div>

    </div>


    <div
      class="dashboard-card"
      style="margin-top:25px"
    >

      <span class="overline">
        PROFILS PUBLICS
      </span>

      <h2>

        ${
          name
          ?
          'Résultats pour '
          +
          esc(name)
          :
          code
          ?
          'Plongeurs ayant un grading '
          +
          esc(code)
          :
          'Population EAH'
        }

      </h2>


      ${
        divers.length
        ?
        divers
          .map(
            diver => {

              const firstName =
                diver.first_name
                ||
                diver.firstName
                ||
                '';


              const lastName =
                diver.last_name
                ||
                diver.lastName
                ||
                '';


              const displayName =
                diver.display_name
                ||
                (
                  firstName
                  +
                  ' '
                  +
                  lastName
                )
                .trim()
                ||
                diver.eah_id;


              const photo =
                eahFastPhotoUrl(

                  diver.photo_url
                  ||
                  diver.photoUrl
                  ||
                  ''

                );


              return `

                <article
                  class="history-item"
                  style="
                    margin-top:14px;
                    align-items:center;
                  "
                >

                  <div
                    style="
                      display:flex;
                      align-items:center;
                      gap:14px;
                    "
                  >

                    ${
                      photo
                      ?
                      `
                        <img
                          src="${esc(photo)}"
                          alt="${esc(displayName)}"
                          style="
                            width:70px;
                            height:70px;
                            object-fit:cover;
                            border-radius:18px;
                          "
                        >
                      `
                      :
                      ''
                    }


                    <div>

                      <span class="badge verified">
                        PROFIL PUBLIC
                      </span>

                      <h3>
                        ${esc(displayName)}
                      </h3>

                      <small class="muted">

                        ${esc(
                          diver.sex ||
                          ''
                        )}

                        ${
                          diver.group_name
                          ?
                          ' • '
                          +
                          esc(
                            diver.group_name
                          )
                          :
                          ''
                        }

                        ${
                          diver.current_blazon
                          ?
                          ' • '
                          +
                          esc(
                            diver.current_blazon
                          )
                          :
                          ''
                        }

                      </small>

                    </div>

                  </div>


                  <a
                    class="button small"
                    href="${esc(
                      publicProfileUrl(
                        diver
                      )
                    )}"
                  >
                    Voir le profil
                  </a>

                </article>

              `;

            }
          )
          .join('')
        :
        `
          <div class="notice">
            Aucun profil PUBLIC disponible pour cette recherche.
          </div>
        `
      }

    </div>


    ${
      gradings.length
      ?
      `

        <div
          class="dashboard-card"
          style="margin-top:25px"
        >

          <span class="overline">
            GRADINGS
          </span>

          <h2>
            Résultats
          </h2>


          ${
            gradings
              .map(
                grading => `

                  <div class="history-item">

                    <span>

                      <strong>
                        ${esc(
                          grading.dive_code ||
                          '—'
                        )}
                      </strong>

                      <br>

                      <small class="muted">

                        ${esc(
                          grading.display_name ||
                          grading.eah_id ||
                          ''
                        )}

                      </small>

                    </span>


                    <span class="history-score">

                      <strong>

                        EAH

                        ${esc(
                          fmtNumber(
                            grading.eah_score
                          )
                        )}/10

                      </strong>

                      ${
                        grading.wa_score !==
                        null
                        &&
                        typeof grading.wa_score !==
                        'undefined'
                        ?
                        `
                          <small>
                            WA
                            ${esc(
                              fmtNumber(
                                grading.wa_score
                              )
                            )}/10
                          </small>
                        `
                        :
                        ''
                      }

                    </span>

                  </div>

                `
              )
              .join('')
          }

        </div>

      `
      :
      ''
    }

  `;

}



async function loadPopulation() {

  const code =
    normalizeCode(
      val(
        'populationCode'
      )
    );


  const name =
    val(
      'populationName'
    )
    .trim();


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

          'eah_population_search_v3',

          {

            p_code:
              code ||
              null,

            p_name:
              name ||
              null,

            p_club_slug:
              CLUB_SLUG ||
              null

          }

        );


    if (error) {

      throw error;

    }


    const result =
      normalizePopulationResult(
        data
      );


    if (
      result.ok ===
      false
    ) {

      throw new Error(
        'Recherche Population impossible.'
      );

    }


    renderPopulationResults(

      box,

      result,

      code,

      name

    );


  } catch (
    error
  ) {

    console.error(
      'EAH POPULATION:',
      error
    );


    box.innerHTML = `

      <div class="notice error">
        ${esc(
          error.message ||
          'Recherche impossible.'
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



/* ============================================================
   PROFIL
============================================================ */

function setProfileLoading() {

  document
    .getElementById(
      'profileLoading'
    )
    ?.classList
    .remove(
      'hidden'
    );


  document
    .getElementById(
      'profileNoAuth'
    )
    ?.classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'profileSetup'
    )
    ?.classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'profileView'
    )
    ?.classList
    .add(
      'hidden'
    );

}

function renderProfileError(
  message
) {

  document
    .getElementById(
      'profileLoading'
    )
    ?.classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'profileSetup'
    )
    ?.classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'profileNoAuth'
    )
    ?.classList
    .add(
      'hidden'
    );


  const view =
    document.getElementById(
      'profileView'
    );


  if (!view) {

    return;

  }


  view.classList.remove(
    'hidden'
  );


  view.innerHTML = `

    <div class="notice error">

      ${esc(
        message ||
        'Profil inaccessible.'
      )}

    </div>

  `;

}

function renderPopulationResults(
  box,
  result,
  code,
  name
) {

  const divers =
    Array.isArray(
      result.divers
    )
    ?
    result.divers
    :
    [];


  const gradings =
    Array.isArray(
      result.gradings
    )
    ?
    result.gradings
    :
    [];


  box.innerHTML = `

    <div class="population-stats">

      <div class="stat-card">

        <strong>
          ${esc(result.people)}
        </strong>

        <span>
          Plongeurs EAH
        </span>

      </div>


      <div class="stat-card">

        <strong>
          ${esc(result.count)}
        </strong>

        <span>
          Gradings
        </span>

      </div>


      <div class="stat-card">

        <strong>
          ${esc(
            fmtNumber(
              result.avg_eah
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
              result.avg_wa
            )
          )}
        </strong>

        <span>
          Moyenne WA
        </span>

      </div>

    </div>


    <div
      class="dashboard-card eah-population-directory"
      style="margin-top:25px"
    >

      <span class="overline">
        POPULATION EAH
      </span>


      <h2>

        ${
          name
          ?
          'Résultats pour '
          +
          esc(name)
          :
          code
          ?
          'Plongeurs ayant réalisé '
          +
          esc(code)
          :
          'Plongeurs EAH'
        }

      </h2>


      ${
        divers.length
        ?
        divers
          .map(
            diver => {

              const firstName =
                String(
                  diver.first_name ||
                  ''
                )
                .trim();


              const lastName =
                String(
                  diver.last_name ||
                  ''
                )
                .trim();


              const displayName =
                String(
                  diver.display_name ||
                  ''
                )
                .trim()

                ||

                (
                  firstName
                  +
                  ' '
                  +
                  lastName
                )
                .trim()

                ||

                'Plongeur EAH';


              const sex =
                String(
                  diver.sex ||
                  ''
                )
                .trim();


              const isPublic =
                diver.profile_public ===
                  true
                ||
                String(
                  diver.profile_public
                )
                .toLowerCase() ===
                  'true';


              const photo =
                (
                  isPublic &&
                  diver.photo_url
                )
                ?
                eahFastPhotoUrl(
                  diver.photo_url
                )
                :
                '';


              const eahScore =
                diver.latest_eah_score;


              const waScore =
                diver.latest_wa_score;


              const latestCode =
                diver.latest_dive_code
                ||
                code
                ||
                '';


              const latestName =
                diver.latest_dive_name
                ||
                (
                  latestCode
                  ?
                  DIVE_NAMES[
                    normalizeCode(
                      latestCode
                    )
                  ]
                  :
                  ''
                )
                ||
                '';


              const profileUrl =
                (
                  isPublic &&
                  diver.eah_id
                )
                ?
                publicProfileUrl(
                  diver
                )
                :
                '';


              return `

                <article
                  class="
                    eah-population-person-card
                    ${
                      isPublic
                      ?
                      'is-public'
                      :
                      'is-private'
                    }
                  "
                >


                  <div
                    class="eah-population-person-main"
                  >


                    <div
                      class="eah-population-person-photo"
                    >

                      ${
                        photo
                        ?
                        `

                          <img
                            src="${esc(photo)}"
                            alt="${esc(displayName)}"
                          >

                        `
                        :
                        `

                          <div
                            class="eah-population-person-placeholder"
                          >
                            ${
                              esc(
                                (
                                  (
                                    firstName[0] ||
                                    ''
                                  )
                                  +
                                  (
                                    lastName[0] ||
                                    ''
                                  )
                                )
                                .toUpperCase()
                                ||
                                'EAH'
                              )
                            }
                          </div>

                        `
                      }

                    </div>


                    <div
                      class="eah-population-person-info"
                    >


                      <div
                        class="eah-population-profile-state"
                      >

                        ${
                          isPublic
                          ?
                          `

                            <span
                              class="eah-population-public-badge"
                            >
                              PROFIL PUBLIC
                            </span>

                          `
                          :
                          `

                            <span
                              class="eah-population-private-badge"
                            >
                              PROFIL PRIVÉ
                            </span>

                          `
                        }

                      </div>


                      <h3>
                        ${esc(displayName)}
                      </h3>


                      <div
                        class="eah-population-meta"
                      >

                        ${
                          sex
                          ?
                          `

                            <span>
                              ${esc(sex)}
                            </span>

                          `
                          :
                          ''
                        }


                        ${
                          isPublic &&
                          diver.group_name
                          ?
                          `

                            <span>
                              ${esc(
                                diver.group_name
                              )}
                            </span>

                          `
                          :
                          ''
                        }


                        ${
                          isPublic &&
                          diver.current_blazon
                          ?
                          `

                            <span>
                              ${esc(
                                diver.current_blazon
                              )}
                            </span>

                          `
                          :
                          ''
                        }


                        <span>

                          ${esc(
                            diver.grading_count
                            ??
                            0
                          )}

                          grading(s)

                        </span>

                      </div>


                      ${
                        latestCode
                        ?
                        `

                          <div
                            class="eah-population-last-dive"
                          >

                            <small>
                              ${
                                code
                                ?
                                'NOTE SUR CE PLONGEON'
                                :
                                'DERNIER GRADING'
                              }
                            </small>


                            <strong>

                              ${esc(
                                latestCode
                              )}

                              ${
                                latestName
                                ?
                                `
                                  —
                                  ${esc(latestName)}
                                `
                                :
                                ''
                              }

                            </strong>

                          </div>

                        `
                        :
                        ''
                      }

                    </div>

                  </div>


                  <div
                    class="eah-population-person-score"
                  >


                    ${
                      eahScore !==
                        null
                      &&
                      typeof eahScore !==
                        'undefined'
                      ?
                      `

                        <div
                          class="eah-population-score-main"
                        >

                          <small>
                            EAH
                          </small>

                          <strong>

                            ${esc(
                              fmtNumber(
                                eahScore
                              )
                            )}

                            <span>
                              /10
                            </span>

                          </strong>

                        </div>

                      `
                      :
                      `

                        <div
                          class="eah-population-score-empty"
                        >
                          Aucune note EAH
                        </div>

                      `
                    }


                    ${
                      waScore !==
                        null
                      &&
                      typeof waScore !==
                        'undefined'
                      ?
                      `

                        <div
                          class="eah-population-wa-score"
                        >

                          WA

                          <strong>
                            ${esc(
                              fmtNumber(
                                waScore
                              )
                            )}/10
                          </strong>

                        </div>

                      `
                      :
                      ''
                    }


                    ${
                      isPublic &&
                      profileUrl
                      ?
                      `

                        <a
                          class="button"
                          href="${esc(profileUrl)}"
                        >
                          Voir le profil
                        </a>

                      `
                      :
                      `

                        <div
                          class="eah-population-private-info"
                        >

                          Profil complet privé

                        </div>

                      `
                    }

                  </div>


                </article>

              `;

            }
          )
          .join('')

        :

        `

          <div class="notice">

            Aucun plongeur trouvé
            pour cette recherche.

          </div>

        `
      }

    </div>


    ${
      code &&
      gradings.length
      ?
      `

        <div
          class="dashboard-card"
          style="margin-top:25px"
        >

          <span class="overline">
            GRADINGS
          </span>

          <h2>
            Tous les gradings ${esc(code)}
          </h2>


          ${
            gradings
              .map(
                grading => {

                  const gradingName =
                    String(
                      grading.display_name ||
                      ''
                    )
                    .trim()

                    ||

                    (
                      (
                        grading.first_name ||
                        ''
                      )
                      +
                      ' '
                      +
                      (
                        grading.last_name ||
                        ''
                      )
                    )
                    .trim()

                    ||

                    'Plongeur EAH';


                  const gradingPublic =
                    grading.profile_public ===
                      true
                    ||
                    String(
                      grading.profile_public
                    )
                    .toLowerCase() ===
                      'true';


                  return `

                    <div
                      class="history-item"
                    >

                      <span>

                        <strong>
                          ${esc(gradingName)}
                        </strong>

                        <br>

                        <small class="muted">

                          ${
                            grading.sex
                            ?
                            esc(
                              grading.sex
                            )
                            +
                            ' • '
                            :
                            ''
                          }

                          ${esc(
                            grading.dive_code ||
                            ''
                          )}

                          ${
                            grading.height !==
                              null
                            &&
                            typeof grading.height !==
                              'undefined'
                            ?
                            ' • '
                            +
                            esc(
                              fmtNumber(
                                grading.height
                              )
                            )
                            +
                            ' m'
                            :
                            ''
                          }

                          ${
                            !gradingPublic
                            ?
                            ' • Profil privé'
                            :
                            ''
                          }

                        </small>

                      </span>


                      <span
                        class="history-score"
                      >

                        ${
                          grading.eah_score !==
                            null
                          &&
                          typeof grading.eah_score !==
                            'undefined'
                          ?
                          `

                            <strong>

                              EAH

                              ${esc(
                                fmtNumber(
                                  grading.eah_score
                                )
                              )}/10

                            </strong>

                          `
                          :
                          ''
                        }


                        ${
                          grading.wa_score !==
                            null
                          &&
                          typeof grading.wa_score !==
                            'undefined'
                          ?
                          `

                            <small>

                              WA

                              ${esc(
                                fmtNumber(
                                  grading.wa_score
                                )
                              )}/10

                            </small>

                          `
                          :
                          ''
                        }

                      </span>

                    </div>

                  `;

                }
              )
              .join('')
          }

        </div>

      `
      :
      ''
    }

  `;

}



function normalizeRpcProfile(
  profile,
  club =
    {}
) {

  return {

    eahId:
      profile.eah_id
      ||
      profile.eahId
      ||
      CARD_EAH_ID,

    firstName:
      profile.first_name
      ||
      profile.firstName
      ||
      '',

    lastName:
      profile.last_name
      ||
      profile.lastName
      ||
      '',

    photoUrl:
      profile.photo_url
      ||
      profile.photoUrl
      ||
      '',

    group:
      profile.group_name
      ||
      profile.groupName
      ||
      profile.group
      ||
      '',

    sex:
      profile.sex
      ||
      '',

    currentBlazon:
      profile.current_blazon
      ||
      profile.currentBlazon
      ||
      '',

    profileVisibility:
      profile.profile_visibility
      ||
      profile.profileVisibility
      ||
      '',

    club:
      club.name
      ||
      profile.club_name
      ||
      profile.clubName
      ||
      'EAH Diving',

    cardStatus:
      profile.card_status
      ||
      profile.cardStatus
      ||
      ''

  };

}



function getProfileBlazonImage(
  currentBlazon
) {

  const key =
    normalizeBlazonName(
      currentBlazon
    );


  return (
    BLAZON_IMAGES[
      key
    ]
    ||
    ''
  );

}



function renderProfileSummary(
  profile,
  privateAccess =
    false
) {

  const view =
    document.getElementById(
      'profileView'
    );


  if (!view) {

    return;

  }


  document
    .getElementById(
      'profileLoading'
    )
    ?.classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'profileSetup'
    )
    ?.classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'profileNoAuth'
    )
    ?.classList
    .add(
      'hidden'
    );


  view.classList.remove(
    'hidden'
  );


  const displayName =
    (
      (
        profile.firstName ||
        ''
      )
      +
      ' '
      +
      (
        profile.lastName ||
        ''
      )
    )
    .trim()
    ||
    profile.eahId;


  const photo =
    eahFastPhotoUrl(
      profile.photoUrl
    );


  const blazonImage =
    getProfileBlazonImage(
      profile.currentBlazon
    );


  view.innerHTML = `

    <div class="eah-fast-profile">

      <div class="eah-fast-profile-top">

        ${
          photo
          ?
          `
            <img
              src="${esc(photo)}"
              alt="${esc(displayName)}"
              style="
                width:180px;
                height:180px;
                object-fit:cover;
                border-radius:30px;
                border:3px solid rgba(48,207,255,.45);
              "
            >
          `
          :
          ''
        }


        <div class="eah-fast-profile-text">

          <span class="overline">

            ${
              privateAccess
              ?
              'ESPACE PERSONNEL EAH'
              :
              'PROFIL PUBLIC EAH'
            }

          </span>


          <h1>
            ${esc(displayName)}
          </h1>


          <p class="muted">

            ${esc(
              profile.club ||
              'EAH Diving'
            )}

          </p>


          <div class="eah-fast-profile-tags">

            <span>
              ${esc(
                profile.eahId ||
                ''
              )}
            </span>


            ${
              profile.sex
              ?
              `
                <span>
                  ${esc(profile.sex)}
                </span>
              `
              :
              ''
            }


            ${
              profile.group
              ?
              `
                <span>
                  ${esc(profile.group)}
                </span>
              `
              :
              ''
            }

          </div>


          <div
            style="
              margin-top:22px;
              display:flex;
              align-items:center;
              gap:15px;
            "
          >

            ${
              blazonImage
              ?
              `
                <img
                  src="${esc(blazonImage)}"
                  alt="${esc(
                    profile.currentBlazon
                  )}"
                  style="
                    width:75px;
                    height:75px;
                    object-fit:contain;
                  "
                >
              `
              :
              ''
            }


            <div>

              <small class="muted">
                BLAZON ACTUEL
              </small>

              <strong
                style="
                  display:block;
                  margin-top:4px;
                "
              >

                ${esc(
                  profile.currentBlazon ||
                  'En progression'
                )}

              </strong>

            </div>

          </div>

        </div>

      </div>


      <div
        class="profile-content-grid"
        style="margin-top:30px"
      >

        <article class="dashboard-card">

          <h3>
            Progression des blazons
          </h3>

          <div id="profileBlazons"></div>

        </article>


        <article class="dashboard-card">

          <h3>
            Historique
          </h3>

          <div id="profileHistory"></div>

        </article>

      </div>

    </div>

  `;

}



function renderProfileHistory(
  data
) {

  const blazons =
    document.getElementById(
      'profileBlazons'
    );


  const history =
    document.getElementById(
      'profileHistory'
    );


  const blazonRows =
    data?.blazons
    ||
    data?.progress
    ||
    [];


  const evaluations =
    data?.evaluations
    ||
    [];


  if (blazons) {

    blazons.innerHTML =
      blazonRows.length
      ?
      blazonRows
        .map(
          item => {

            const status =
              item.status ||
              '';


            const progress =
              item.progress ??
              0;


            return `

              <div class="history-item">

                <span>

                  ${esc(
                    item.blazon_name
                    ||
                    item.name
                    ||
                    item.blazon
                    ||
                    item.blazon_key
                    ||
                    ''
                  )}

                </span>


                <span>

                  ${
                    status ===
                    'OBTENU'
                    ?
                    `
                      <span class="badge">
                        OBTENU
                      </span>
                    `
                    :
                    esc(progress)
                    +
                    ' %'
                  }

                </span>

              </div>

            `;

          }
        )
        .join('')
      :
      'Aucune progression enregistrée.';

  }


  if (history) {

    history.innerHTML =
      evaluations.length
      ?
      evaluations
        .map(
          evaluation => {

            const scoreType =
              String(
                evaluation.primary_score_type
                ||
                evaluation.primaryScoreType
                ||
                'EAH'
              )
              .toUpperCase();


            const eahScore =
              evaluation.eah_score
              ??
              evaluation.eah;


            const waScore =
              evaluation.wa_score;


            const mainScore =
              scoreType ===
              'WA'
              ?
              waScore
              :
              eahScore;


            return `

              <div
                class="history-item profile-history-item"
              >

                <span>

                  <strong>

                    ${esc(
                      evaluation.dive_code
                      ||
                      evaluation.code
                      ||
                      '—'
                    )}

                  </strong>


                  ${
                    evaluation.dive_name
                    ?
                    `
                      <br>
                      <small>
                        ${esc(
                          evaluation.dive_name
                        )}
                      </small>
                    `
                    :
                    ''
                  }


                  <br>

                  <small>

                    ${esc(
                      fmtDate(
                        evaluation.evaluated_at
                        ||
                        evaluation.date
                      )
                    )}

                    ${
                      evaluation.height !==
                      null
                      &&
                      typeof evaluation.height !==
                      'undefined'
                      ?
                      ' • '
                      +
                      esc(
                        fmtNumber(
                          evaluation.height
                        )
                      )
                      +
                      ' m'
                      :
                      ''
                    }

                  </small>

                </span>


                <span class="history-score">

                  <strong>

                    ${esc(scoreType)}

                    ${esc(
                      fmtNumber(
                        mainScore
                      )
                    )}/10

                  </strong>


                  ${
                    evaluation.report_url
                    ?
                    `
                      <a
                        href="${esc(
                          evaluation.report_url
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Grade Report
                      </a>
                    `
                    :
                    ''
                  }


                  ${
                    evaluation.video_url
                    ?
                    `
                      <a
                        href="${esc(
                          evaluation.video_url
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Vidéo
                      </a>
                    `
                    :
                    ''
                  }

                </span>

              </div>

            `;

          }
        )
        .join('')
      :
      'Aucune évaluation.';

  }

}



/* ============================================================
   PROFIL PUBLIC
============================================================ */

async function loadPublicProfile(
  eahId
) {

  setProfileLoading();


  try {

    const id =
      normalizeCode(
        eahId
      );


    const {
      data,
      error
    } =
      await requireSupabase()
        .rpc(

          'eah_public_profile_v2',

          {

            p_eah_id:
              id,

            p_club_slug:
              CLUB_SLUG ||
              null

          }

        );


    if (error) {

      throw error;

    }


    const result =
      Array.isArray(
        data
      )
      ?
      data[0]
      :
      data;


    if (
      !result ||
      result.ok !==
      true
    ) {

      throw new Error(
        result?.error
        ||
        'Profil public introuvable ou privé.'
      );

    }


    const club =
      result.club ||
      {};


    const profile =
      normalizeRpcProfile(

        result.profile ||
        result.diver ||
        {},

        club

      );


    if (
      club.slug
    ) {

      CLUB_SLUG =
        club.slug;

    }


    state.club =
      club
      ||
      state.club;


    state.profile =
      profile;


    state.profileHistory = {

      evaluations:
        result.evaluations
        ||
        [],

      blazons:
        result.blazons
        ||
        result.progress
        ||
        []

    };


    renderProfileSummary(

      profile,

      false

    );


    renderProfileHistory(
      state.profileHistory
    );


  } catch (
    error
  ) {

    console.error(
      'PUBLIC PROFILE:',
      error
    );


    renderProfileError(

      error.message
      ||
      'Profil public inaccessible.'

    );

  }

}



/* ============================================================
   PROFIL PRIVE NFC
============================================================ */

async function loadPrivateProfileByCard(
  eahId,
  token
) {

  setProfileLoading();


  try {

    const {
      data,
      error
    } =
      await requireSupabase()
        .rpc(

          'eah_open_profile_fast',

          {

            p_club_slug:
              CLUB_SLUG,

            p_eah_id:
              eahId,

            p_token:
              token

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
        'Profil introuvable.'
      );

    }


    if (
      data.assigned ===
      false
    ) {

      state.profile =
        data;


      document
        .getElementById(
          'profileLoading'
        )
        ?.classList
        .add(
          'hidden'
        );


      document
        .getElementById(
          'profileView'
        )
        ?.classList
        .add(
          'hidden'
        );


      document
        .getElementById(
          'profileSetup'
        )
        ?.classList
        .remove(
          'hidden'
        );


      return;

    }


    state.profile =
      normalizeRpcProfile(

        data.profile ||
        {},

        data.club ||
        {}

      );


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

      true

    );


    renderProfileHistory(
      state.profileHistory
    );


  } catch (
    error
  ) {

    console.error(
      'PRIVATE PROFILE:',
      error
    );


    renderProfileError(

      error.message ||
      'Impossible d’ouvrir le profil.'

    );

  }

}



/* ============================================================
   RESTORE PROFILE
============================================================ */

async function restoreOrLoadProfile() {

  if (
    CARD_EAH_ID &&
    CARD_TOKEN
  ) {

    await loadPrivateProfileByCard(

      CARD_EAH_ID,

      CARD_TOKEN

    );


    return;

  }


  if (
    CARD_EAH_ID
  ) {

    await loadPublicProfile(
      CARD_EAH_ID
    );


    return;

  }


  document
    .getElementById(
      'profileLoading'
    )
    ?.classList
    .add(
      'hidden'
    );


  document
    .getElementById(
      'profileNoAuth'
    )
    ?.classList
    .remove(
      'hidden'
    );

}



/* ============================================================
   ACTIVATION PROFIL
============================================================ */

async function setupProfile() {

  const firstName =
    val(
      'setupFirstName'
    )
    .trim();


  const lastName =
    val(
      'setupLastName'
    )
    .trim();


  const pin =
    val(
      'setupAccessPin'
    )
    .trim();


  const visibility =
    val(
      'setupProfileVisibility'
    ) ===
      'PUBLIC'
      ?
      'PUBLIC'
      :
      'PRIVÉ';


  if (
    !firstName ||
    !lastName
  ) {

    setMessage(

      'setupProfileMsg',

      `
        <div class="notice error">
          Prénom et nom obligatoires.
        </div>
      `

    );


    return;

  }


  if (
    !/^\d{4,8}$/.test(
      pin
    )
  ) {

    setMessage(

      'setupProfileMsg',

      `
        <div class="notice error">
          Le code personnel doit contenir 4 à 8 chiffres.
        </div>
      `

    );


    return;

  }


  if (
    !CARD_EAH_ID ||
    !CARD_TOKEN
  ) {

    setMessage(

      'setupProfileMsg',

      `
        <div class="notice error">
          Carte NFC invalide.
        </div>
      `

    );


    return;

  }


  const button =
    document.getElementById(
      'setupProfileButton'
    );


  setLoadingButton(

    button,

    true,

    'Activation…',

    'Activer mon profil'

  );


  try {

    const sb =
      requireSupabase();


    const activation =
      await sb.rpc(

        'activate_diver_profile',

        {

          p_eah_id:
            CARD_EAH_ID,

          p_token:
            CARD_TOKEN,

          p_first_name:
            firstName,

          p_last_name:
            lastName,

          p_photo_url:
            val(
              'setupPhotoUrl'
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
            val(
              'setupGroup'
            )
            .trim()
            ||
            null,

          p_pin:
            pin

        }

      );


    if (
      activation.error
    ) {

      throw activation.error;

    }


    const visibilityResult =
      await sb.rpc(

        'eah_set_diver_visibility',

        {

          p_eah_id:
            CARD_EAH_ID,

          p_token:
            CARD_TOKEN,

          p_visibility:
            visibility

        }

      );


    if (
      visibilityResult.error
    ) {

      throw visibilityResult.error;

    }


    setMessage(

      'setupProfileMsg',

      `
        <div class="notice success">

          Profil activé.

          <br>

          Visibilité :
          <strong>
            ${esc(visibility)}
          </strong>

        </div>
      `

    );


    await loadPrivateProfileByCard(

      CARD_EAH_ID,

      CARD_TOKEN

    );


  } catch (
    error
  ) {

    setMessage(

      'setupProfileMsg',

      `
        <div class="notice error">
          ${esc(
            error.message ||
            'Activation impossible.'
          )}
        </div>
      `

    );


  } finally {

    setLoadingButton(

      button,

      false,

      '',

      'Activer mon profil'

    );

  }

}



/* ============================================================
   LOGIN PLONGEUR
============================================================ */

async function diverLogin(
  event
) {

  event
    ?.preventDefault();


  const eahId =
    normalizeCode(
      val(
        'diverEahId'
      )
    );


  const pin =
    val(
      'diverPin'
    )
    .trim();


  const button =
    document.getElementById(
      'diverLoginButton'
    );


  if (
    !eahId ||
    !pin
  ) {

    setMessage(

      'diverLoginMsg',

      `
        <div class="notice error">
          Numéro EAH et code personnel obligatoires.
        </div>
      `

    );


    return;

  }


  if (!CLUB_SLUG) {

    setMessage(

      'diverLoginMsg',

      `
        <div class="notice error">
          Aucun club sélectionné.
        </div>
      `

    );


    return;

  }


  setLoadingButton(

    button,

    true,

    'Ouverture…',

    'Ouvrir mon profil'

  );


  try {

    const pinHash =
      await eahFastSha256(
        pin
      );


    state.diverPinHash =
      pinHash;


    const {
      data,
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
        'Connexion impossible.'
      );

    }


    state.profile =
      normalizeRpcProfile(

        data.profile ||
        {},

        data.club ||
        {}

      );


    state.profileHistory = {

      evaluations:
        data.evaluations ||
        [],

      blazons:
        data.blazons ||
        []

    };


    CARD_EAH_ID =
      eahId;


    CARD_TOKEN =
      '';


    showPage(
      'profil'
    );


    renderProfileSummary(

      state.profile,

      true

    );


    renderProfileHistory(
      state.profileHistory
    );


  } catch (
    error
  ) {

    setMessage(

      'diverLoginMsg',

      `
        <div class="notice error">

          ${esc(
            error.message ||
            'Connexion impossible.'
          )}

        </div>
      `

    );


  } finally {

    setLoadingButton(

      button,

      false,

      '',

      'Ouvrir mon profil'

    );

  }

}



/* ============================================================
   SUBMIT EVALUATION
============================================================ */

async function submitEvaluation(
  event
) {

  event
    .preventDefault();


  if (
    state.evaluationBusy
  ) {

    return;

  }


  if (
    !state.user ||
    !state.membership ||
    !state.club?.id
  ) {

    showPage(
      'club'
    );


    return;

  }


  const eahId =
    normalizeCode(
      val(
        'eahId'
      )
    );


  const diver =
    state.divers.find(
      item =>
        String(
          item.eah_id
        ) ===
        eahId
    );


  const diveCode =
    normalizeCode(
      val(
        'diveCode'
      )
    );


  const height =
    asNumber(
      val(
        'height'
      )
    );


  if (!diver) {

    setMessage(

      'evaluationMsg',

      `
        <div class="notice error">
          Sélectionne un plongeur.
        </div>
      `

    );


    return;

  }


  if (
    !diveCode ||
    height ===
      null
  ) {

    setMessage(

      'evaluationMsg',

      `
        <div class="notice error">
          Code et hauteur obligatoires.
        </div>
      `

    );


    return;

  }


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
    asNumber(
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

    setMessage(

      'evaluationMsg',

      `
        <div class="notice error">

          La note principale sélectionnée est World Aquatics.

          <br><br>

          Renseigne d'abord la note WA.

        </div>
      `

    );


    return;

  }


  const takeoff =
    criterionScore(
      'D'
    );


  const trick =
    criterionScore(
      'T'
    );


  const entry =
    criterionScore(
      'E'
    );


  const eahScore =
    finalEahScore(

      takeoff,

      trick,

      entry

    );


  const criteria =
    collectCriteria();


  const button =
    document.getElementById(
      'submitEvalBtn'
    );


  state.evaluationBusy =
    true;


  setLoadingButton(

    button,

    true,

    'Enregistrement…',

    'Générer le Grade Report'

  );


  try {

    const payload = {

  clubSlug:
    state.club.slug,

  eahId:
    diver.eah_id,

  primaryScoreType:
    scoreType,

  scoreType:
    scoreType,

  scoringMode:
    scoreType,

      discipline:
        val(
          'discipline'
        )
        ||
        'Plongeon',

      diveCode:
        diveCode,

      diveName:
        val(
          'diveName'
        )
        .trim()
        ||
        DIVE_NAMES[
          diveCode
        ]
        ||
        diveCode,

      height:
        height,

      heightType:
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
        '',

      spotName:
        val(
          'spotName'
        )
        .trim(),

      dd:
        val(
          'dd'
        ),

      eahDifficulty:
        val(
          'eahDifficulty'
        ),

      waScore:
        waScore,

      takeoff:
        takeoff,

      trick:
        trick,

      entry:
        entry,

      eahScore:
        eahScore,

      criteria:
        criteria,

      positive:
        val(
          'positive'
        )
        .trim(),

      improve:
        val(
          'improve'
        )
        .trim(),

      comment:
        val(
          'comment'
        )
        .trim(),

      videoUrl:
        val(
          'videoUrl'
        )
        .trim()

    };


    const {
      data,
      error
    } =
      await requireSupabase()
        .rpc(

          'eah_submit_evaluation_fast',

          {

            p_payload:
              payload

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
        'Évaluation impossible.'
      );

    }


    setMessage(

      'evaluationMsg',

      `
        <div class="notice success">

          <strong>
            Évaluation enregistrée.
          </strong>

          <br><br>

          Takeoff :
          ${esc(takeoff)}/10

          •

          Trick :
          ${esc(trick)}/10

          •

          Entry :
          ${esc(entry)}/10

          <br>

          <strong>

            EAH :
            ${esc(
              fmtNumber(
                eahScore
              )
            )}/10

          </strong>

          ${
            scoreType ===
              'WA'
            ?
            `
              <br>

              Note principale :
              <strong>
                WA
                ${esc(
                  fmtNumber(
                    waScore
                  )
                )}/10
              </strong>
            `
            :
            ''
          }

          <br><br>

          <small>
            Le Grade Report est généré en arrière-plan.
          </small>

        </div>
      `

    );


    showToast(
      'Évaluation enregistrée.',
      'success'
    );


    loadCoachData()
      .catch(
        console.warn
      );


  } catch (
    error
  ) {

    setMessage(

      'evaluationMsg',

      `
        <div class="notice error">

          ${esc(
            handleSupabaseError(
              error,
              "Erreur lors de l'enregistrement."
            )
          )}

        </div>
      `

    );


  } finally {

    state.evaluationBusy =
      false;


    setLoadingButton(

      button,

      false,

      '',

      'Générer le Grade Report'

    );

  }

}



/* ============================================================
   DEMANDE PUBLIQUE
============================================================ */

async function submitPublicGrading(
  event
) {

  event
    ?.preventDefault();


  const button =
    document.getElementById(
      'publicSubmitButton'
    );


  const firstName =
    val(
      'publicFirstName'
    )
    .trim();


  const lastName =
    val(
      'publicLastName'
    )
    .trim();


  const email =
    val(
      'publicEmail'
    )
    .trim()
    .toLowerCase();


  const videoUrl =
    val(
      'publicVideo'
    )
    .trim();


  if (
    !firstName ||
    !lastName ||
    !email ||
    !videoUrl
  ) {

    setMessage(

      'publicFormMessage',

      `
        <div class="notice error">
          Prénom, nom, e-mail et vidéo sont obligatoires.
        </div>
      `

    );


    return;

  }


  setLoadingButton(

    button,

    true,

    'Envoi…',

    'Envoyer la demande'

  );


  try {

    const payload = {

      club_slug:
        CLUB_SLUG ||
        null,

      clubSlug:
        CLUB_SLUG ||
        null,

      first_name:
        firstName,

      firstName:
        firstName,

      last_name:
        lastName,

      lastName:
        lastName,

      email:
        email,

      discipline:
        val(
          'publicDiscipline'
        ),

      dive_code:
        normalizeCode(
          val(
            'publicDive'
          )
        ),

      diveCode:
        normalizeCode(
          val(
            'publicDive'
          )
        ),

      height:
        asNumber(
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

      heightType:
        val(
          'publicHeightType'
        )
        ||
        'KNOWN',

      video_url:
        videoUrl,

      videoUrl:
        videoUrl,

      message:
        val(
          'publicMessage'
        )
        .trim(),

      source:
        'PUBLIC',

      status:
        'PENDING'

    };


    const {
      data,
      error
    } =
      await requireSupabase()
        .rpc(

          'submit_public_grading_request',

          {

            p_payload:
              payload

          }

        );


    if (error) {

      throw error;

    }


    setMessage(

      'publicFormMessage',

      `
        <div class="notice success">

          <strong>
            Demande enregistrée.
          </strong>

          ${
            data?.request_code
            ?
            `
              <br><br>
              Référence :
              <strong>
                ${esc(
                  data.request_code
                )}
              </strong>
            `
            :
            ''
          }

        </div>
      `

    );


    document
      .getElementById(
        'publicGradingForm'
      )
      ?.reset();


  } catch (
    error
  ) {

    setMessage(

      'publicFormMessage',

      `
        <div class="notice error">

          ${esc(
            error.message ||
            'Envoi impossible.'
          )}

        </div>
      `

    );


  } finally {

    setLoadingButton(

      button,

      false,

      '',

      'Envoyer la demande'

    );

  }

}



/* ============================================================
   EVENTS
============================================================ */

document
  .getElementById(
    'spotId'
  )
  ?.addEventListener(

    'change',

    event => {

      const option =
        event.target
          .options[
            event.target.selectedIndex
          ];


      if (
        option?.dataset?.name
      ) {

        document
          .getElementById(
            'spotName'
          )
          .value =
            option.dataset.name;

      }

    }

  );


document
  .getElementById(
    'diveCode'
  )
  ?.addEventListener(

    'input',

    event => {

      const code =
        normalizeCode(
          event.target.value
        );


      event.target.value =
        code;


      if (
        DIVE_NAMES[
          code
        ]
      ) {

        const field =
          document.getElementById(
            'diveName'
          );


        if (field) {

          field.value =
            DIVE_NAMES[
              code
            ];

        }

      }

    }

  );


document
  .getElementById(
    'coachLoginForm'
  )
  ?.addEventListener(
    'submit',
    coachLogin
  );


document
  .getElementById(
    'diverLoginForm'
  )
  ?.addEventListener(
    'submit',
    diverLogin
  );


document
  .getElementById(
    'setupProfileButton'
  )
  ?.addEventListener(
    'click',
    setupProfile
  );


document
  .getElementById(
    'logoutCoachButton'
  )
  ?.addEventListener(
    'click',
    logoutCoach
  );


document
  .getElementById(
    'openEvaluationButton'
  )
  ?.addEventListener(

    'click',

    () => {

      showPage(
        'evaluation'
      );

    }

  );


document
  .getElementById(
    'evaluationForm'
  )
  ?.addEventListener(
    'submit',
    submitEvaluation
  );


document
  .getElementById(
    'publicGradingForm'
  )
  ?.addEventListener(
    'submit',
    submitPublicGrading
  );


document
  .getElementById(
    'populationSearchButton'
  )
  ?.addEventListener(
    'click',
    loadPopulation
  );


[
  'populationCode',
  'populationName'
]
.forEach(
  id => {

    document
      .getElementById(
        id
      )
      ?.addEventListener(

        'keydown',

        event => {

          if (
            event.key ===
              'Enter'
          ) {

            event.preventDefault();

            loadPopulation();

          }

        }

      );

  }
);



/* ============================================================
   AUTH STATE
============================================================ */

if (
  supabaseClient
) {

  supabaseClient.auth
    .onAuthStateChange(

      (
        event,
        session
      ) => {

        if (
          event ===
          'SIGNED_OUT'
        ) {

          state.user =
            null;


          state.membership =
            null;


          state.coach =
            null;


          showCoachLoggedOut();


          return;

        }


        if (
          session?.user
        ) {

          state.user =
            session.user;

        }

      }

    );

}



/* ============================================================
   ROUTE
============================================================ */

function initialRoute() {

  if (
    CARD_EAH_ID &&
    CARD_TOKEN
  ) {

    showPage(
      'profil',
      false
    );


    return;

  }


  if (
    LEGACY_COACH_TOKEN
  ) {

    showPage(
      'club',
      false
    );


    return;

  }


  const hash =
    window.location.hash
      .replace(
        '#',
        ''
      );


  if (
    hash &&
    document.getElementById(
      hash
    )
  ) {

    showPage(
      hash,
      false
    );

  } else {

    showPage(
      'accueil',
      false
    );

  }

}



/* ============================================================
   INIT
============================================================ */

async function init() {

  renderCriteria();

  renderDiveCodes();

  renderBlazons();

  renderPricing();


  initialRoute();


  /*
    Carte coach externe :
    coach-card.js prend la main.
  */

  if (
    LEGACY_COACH_TOKEN
  ) {

    return;

  }


  if (
    CARD_EAH_ID &&
    CARD_TOKEN
  ) {

    await loadPrivateProfileByCard(

      CARD_EAH_ID,

      CARD_TOKEN

    );


    return;

  }


  await Promise.allSettled([

    loadPublicData(),

    CLUB_SLUG
      ?
      loadClubBranding()
      :
      Promise.resolve()

  ]);


  /*
    Profil public direct :
    ?club=...&id=EAH-...#profil
  */

  if (
    CARD_EAH_ID &&
    !CARD_TOKEN
    &&
    window.location.hash ===
      '#profil'
  ) {

    await loadPublicProfile(
      CARD_EAH_ID
    );


    return;

  }


  if (
    window.location.hash ===
      '#club'
    ||
    window.location.hash ===
      '#evaluation'
  ) {

    restoreCoachSession()
      .catch(
        console.warn
      );

  }

}



init()
  .catch(
    error => {

      console.error(
        'EAH Diving init:',
        error
      );


      showToast(

        'Une partie du site n’a pas pu être chargée.',

        'error',

        6000

      );

    }
  );
