'use strict';

/* ============================================================
   EAH DIVING PRO CLUB
   SCRIPT.JS
   VERSION 1.0.0

   Front-end GitHub Pages + Supabase
   - Données publiques Supabase
   - Auth coach Supabase Auth
   - Dashboard club
   - Evaluations EAH
   - Progression blazons
   - Hooks pour Apps Script (PDF / profils privés / demandes)
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
   ETAT APPLICATION
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
    false

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
   CREATION REGLE BLAZON
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



/* ============================================================
   BLAZONS FALLBACK
   BLANC -> TITAN
============================================================ */

const BLAZON_FALLBACK = [

  /* ==========================================================
     BLANC
  ========================================================== */

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

          [
            '101C',
            '002A'
          ],

          5,

          6

        ),


        seriesRule(

          3,

          [
            '001C',
            '001B',
            '001A'
          ],

          5,

          6

        ),


        seriesRule(

          5,

          [
            '100A'
          ],

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


  /* ==========================================================
     ORANGE
  ========================================================== */

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

          [
            '101C',
            '002A'
          ],

          5,

          6

        ),


        seriesRule(

          1,

          [
            '002AS',
            '401C',
            '102C'
          ],

          5,

          6

        ),


        seriesRule(

          5,

          [
            '001C',
            '001B',
            '001A'
          ],

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


  /* ==========================================================
     VERT
  ========================================================== */

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


  /* ==========================================================
     BLEU
  ========================================================== */

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
              [
                5,
                7.5,
                10
              ]

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
              [
                5,
                7.5,
                10
              ]

          }

        )

      ]

    }

  },


  /* ==========================================================
     ROUGE
  ========================================================== */

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

          [
            '103C',
            '201B',
            '301B',
            '403C',
            'TWIST'
          ],

          6,

          7,

          {

            alternativeHeights:
              [
                5,
                7.5,
                10
              ],

            choiceGroups: {

              TWIST: [
                '5122A',
                '5221A',
                '5321A'
              ]

            }

          }

        ),


        seriesRule(

          3,

          [
            '103C',
            '201B',
            '301B',
            '403C',
            'TWIST'
          ],

          6,

          7,

          {

            alternativeHeights:
              [
                5,
                7.5,
                10
              ],

            choiceGroups: {

              TWIST: [
                '5132D',
                '5231D',
                '5331D'
              ]

            }

          }

        )

      ]

    }

  },


  /* ==========================================================
     BRONZE
  ========================================================== */

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

          [
            '203C',
            '303C',
            '403C',
            '104C',
            'TWIST'
          ],

          6,

          7,

          {

            alternativeHeights:
              [
                5,
                7.5,
                10
              ],

            choiceGroups: {

              TWIST: [
                '5132D',
                '5231D',
                '5331D'
              ]

            }

          }

        ),


        seriesRule(

          3,

          [
            '203C',
            '303C',
            '403C',
            '105C',
            'TWIST'
          ],

          6,

          7,

          {

            alternativeHeights:
              [
                5,
                7.5,
                10
              ],

            choiceGroups: {

              TWIST: [
                '5132D',
                '5231D',
                '5331D'
              ]

            }

          }

        )

      ]

    }

  },


  /* ==========================================================
     ARGENT
  ========================================================== */

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
        'Chaque plongeon : 6/10 WA ou 7/10 EAH. Bord/plot + séries 1 m et 3 m. Une des séries 1 m / 3 m peut être déplacée sur plateforme.',

      allowOnePlatformSubstitution:
        true,

      series: [

        seriesRule(

          0,

          [
            '102C',
            '202C',
            '302C',
            '402C'
          ],

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

          [
            '105C',
            '204C',
            '304C',
            '404C',
            'TWIST'
          ],

          6,

          7,

          {

            alternativeHeights:
              [
                5,
                7.5,
                10
              ],

            choiceGroups: {

              TWIST: [
                '5124D',
                '5223D',
                '5323D'
              ]

            }

          }

        ),


        seriesRule(

          3,

          [
            '105B',
            '405C',
            '303B',
            '203B',
            'TWIST'
          ],

          6,

          7,

          {

            alternativeHeights:
              [
                5,
                7.5,
                10
              ],

            choiceGroups: {

              TWIST: [
                '5134D',
                '5233D',
                '5333D'
              ]

            }

          }

        )

      ]

    }

  },


  /* ==========================================================
     OR
  ========================================================== */

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
        '3 m : 6/10 WA ou 7/10 EAH. Série 1 m : 7/10 WA ou 8/10 EAH. Une série peut être déplacée à 5 m, 7,5 m ou 10 m.',

      allowOnePlatformSubstitution:
        true,

      series: [

        seriesRule(

          3,

          [
            '105B',
            '405C',
            '205C',
            '305C',
            'TWIST'
          ],

          6,

          7,

          {

            alternativeHeights:
              [
                5,
                7.5,
                10
              ],

            choiceGroups: {

              TWIST: [
                '5134D',
                '5235D',
                '5335D'
              ]

            }

          }

        ),


        seriesRule(

          1,

          [
            '105B',
            '403B',
            '203B',
            '303B',
            'TWIST'
          ],

          7,

          8,

          {

            alternativeHeights:
              [
                5,
                7.5,
                10
              ],

            choiceGroups: {

              TWIST: [
                '5132D',
                '5233D',
                '5333D'
              ]

            }

          }

        )

      ]

    }

  },


  /* ==========================================================
     NOIR
  ========================================================== */

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
        'Chaque plongeon : 6/10 WA ou 7/10 EAH. Une des séries 1 m / 3 m peut être déplacée sur plateforme.',

      allowOnePlatformSubstitution:
        true,

      series: [

        seriesRule(

          3,

          [
            '107C',
            '405B',
            '5152B',
            '205B',
            '305B'
          ],

          6,

          7,

          {

            alternativeHeights:
              [
                5,
                7.5,
                10
              ]

          }

        ),


        seriesRule(

          1,

          [
            '305C',
            '405C',
            '203B',
            '105B',
            'TWIST'
          ],

          6,

          7,

          {

            alternativeHeights:
              [
                5,
                7.5,
                10
              ],

            choiceGroups: {

              TWIST: [
                '5134D',
                '5335D'
              ]

            }

          }

        )

      ]

    }

  },


  /* ==========================================================
     LEGEND
  ========================================================== */

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
        'Choisir et réussir une série Legend adaptée, avec au minimum 6/10 WA ou 7/10 EAH sur chaque plongeon.',

      series: [

        seriesRule(

          3,

          [
            '109C',
            'TWIST',
            '207C',
            '307C',
            '407C'
          ],

          6,

          7,

          {

            label:
              'Homme 3 m',

            choiceGroups: {

              TWIST: [
                '5154B',
                '5337D'
              ]

            }

          }

        ),


        seriesRule(

          10,

          [
            '109C',
            'TWIST',
            '207C',
            '307C',
            '407C',
            'ARM'
          ],

          6,

          7,

          {

            label:
              'Homme 10 m',

            choiceGroups: {

              TWIST: [
                '5255B',
                '5154B'
              ],

              ARM: [
                '626C',
                '616C'
              ]

            }

          }

        ),


        seriesRule(

          3,

          [
            '205B',
            '405B',
            '107B',
            '5153B',
            '305B'
          ],

          6,

          7,

          {

            label:
              'Femme 3 m'

          }

        ),


        seriesRule(

          10,

          [
            '207C',
            '407C',
            '107B',
            '5253B',
            '305B',
            'ARM'
          ],

          6,

          7,

          {

            label:
              'Femme 10 m',

            choiceGroups: {

              ARM: [
                '626C',
                '616C',
                '6243D'
              ]

            }

          }

        )

      ]

    }

  },


  /* ==========================================================
     TITAN
  ========================================================== */

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
        'Au moins un plongeon Titan à 6/10 WA ou 7/10 EAH, ou une série 1 m complète au même seuil.',

      options: [

        seriesRule(

          10,

          [
            'ONE'
          ],

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

          [
            'ONE'
          ],

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

          [
            'ONE'
          ],

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

          [
            'ONE'
          ],

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

          [
            '205B',
            '305B',
            '405B',
            '107B',
            'TWIST'
          ],

          6,

          7,

          {

            label:
              'Série 1 m Homme',

            choiceGroups: {

              TWIST: [
                '5154B',
                '5337D'
              ]

            }

          }

        ),


        seriesRule(

          1,

          [
            '107C',
            '405C',
            '305C',
            '205C',
            '5152B'
          ],

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

function esc(value) {

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



function val(id) {

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



function bool(value) {

  return (
    value === true
    ||
    String(value)
      .toLowerCase() ===
      'true'
    ||
    String(value) ===
      '1'
  );

}



function asNumber(
  value,
  fallback = null
) {

  if (
    value === ''
    ||
    value === null
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
    value === null
    ||
    value === ''
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


  return date
    .toLocaleDateString(

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



function randomCode(
  prefix = 'ID'
) {

  if (
    window.crypto &&
    typeof window.crypto.randomUUID ===
      'function'
  ) {

    return (
      prefix
      +
      '-'
      +
      window.crypto
        .randomUUID()
        .replace(
          /-/g,
          ''
        )
        .slice(
          0,
          12
        )
        .toUpperCase()
    );

  }


  return (
    prefix
    +
    '-'
    +
    Date.now()
      .toString(36)
      .toUpperCase()
    +
    Math.random()
      .toString(36)
      .slice(2,8)
      .toUpperCase()
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
    () => {

      toast.remove();

    },
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
   DONNEES PUBLIQUES SUPABASE
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
          'sort_order',
          {
            ascending:
              true
          }
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
          'sort_order',
          {
            ascending:
              true
          }
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
          'name',
          {
            ascending:
              true
          }
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
          'sort_order',
          {
            ascending:
              true
          }
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


  if (
    blazonsRes.error
  ) {

    console.warn(
      'Blazons:',
      blazonsRes.error.message
    );

  }


  if (
    pricingRes.error
  ) {

    console.warn(
      'Pricing:',
      pricingRes.error.message
    );

  }


  if (
    spotsRes.error
  ) {

    console.warn(
      'Spots:',
      spotsRes.error.message
    );

  }


  if (
    newsRes.error
  ) {

    console.warn(
      'News:',
      newsRes.error.message
    );

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
   CLUB / IDENTITE VISUELLE
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


  if (error) {

    console.warn(
      'Club:',
      error.message
    );

    return null;

  }


  if (!data) {

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


  const primary =
    clubColor(

      club.primary_color,

      '#0b6bff'

    );


  const secondary =
    clubColor(

      club.secondary_color,

      '#03131f'

    );


  document.documentElement
    .style
    .setProperty(
      '--blue',
      primary
    );


  document.documentElement
    .style
    .setProperty(
      '--background',
      secondary
    );


  const dashboardClubName =
    document.getElementById(
      'dashboardClubName'
    );


  if (
    dashboardClubName
  ) {

    dashboardClubName.textContent =
      club.name ||
      'EAH Diving Club';

  }


  document.title =
    CLUB_SLUG
      ?
      (
        (
          club.name ||
          'EAH Diving Club'
        )
        +
        ' — EAH Diving Pro'
      )
      :
      'EAH Diving Pro Club';

}



/* ============================================================
   BLAZONS PUBLICS
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
      (
        a,
        b
      ) => {

        return (
          Number(
            a.sort_order
            ??
            a.order
            ??
            999
          )
          -
          Number(
            b.sort_order
            ??
            b.order
            ??
            999
          )
        );

      }
    );


  if (!list.length) {

    grid.innerHTML = `
      <div class="loading-panel">
        Aucun blazon disponible.
      </div>
    `;

    return;

  }


  grid.innerHTML =
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
                    loading="lazy"
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
      .join('');


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
    ),

    ...(
      rules.fullSeriesOption
      ?
      [
        rules.fullSeriesOption
      ]
      :
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
              serie.minWa
              ??
              '—'
            )}/10 World Aquatics

            ou

            ${esc(
              serie.minEah
              ??
              '—'
            )}/10 EAH Diving

          </p>

      `;


      if (
        Array.isArray(
          serie.alternativeHeights
        )
        &&
        serie.alternativeHeights.length
      ) {

        html += `

          <p>

            <strong>
              Hauteur alternative :
            </strong>

            ${
              serie
                .alternativeHeights
                .map(
                  h =>
                    `${esc(h)} m`
                )
                .join(
                  ' • '
                )
            }

          </p>

        `;

      }


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
            &&
            choices.length
          ) {

            html += `

              <div class="choice-group">

                <strong>
                  Au choix :
                </strong>

                ${
                  choices
                    .map(
                      choice => `

                        <div>

                          <b>
                            ${esc(choice)}
                          </b>

                          ${
                            DIVE_NAMES[
                              choice
                            ]
                            ?
                            (
                              ' — '
                              +
                              esc(
                                DIVE_NAMES[
                                  choice
                                ]
                              )
                            )
                            :
                            ''
                          }

                        </div>

                      `
                    )
                    .join('')
                }

              </div>

            `;

          } else {

            html += `

              <p class="dive-rule">

                <strong>
                  ${esc(code)}
                </strong>

                ${
                  DIVE_NAMES[
                    code
                  ]
                  ?
                  (
                    ' — '
                    +
                    esc(
                      DIVE_NAMES[
                        code
                      ]
                    )
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
      (
        a,
        b
      ) => {

        return (
          Number(
            a.sort_order
            ??
            999
          )
          -
          Number(
            b.sort_order
            ??
            999
          )
        );

      }
    );


  grid.innerHTML =
    list
      .map(
        item => {

          const featured =
            item.id ===
            'CLUB50';


          const renewal =
            String(
              item.renewal
              ??
              '—'
            );


          return `

            <article
              class="price-card ${
                featured
                ?
                'featured'
                :
                ''
              }"
            >

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
                  item.price
                  ??
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
                renewal &&
                renewal !==
                '—'
                ?
                `
                  <div class="price-renewal">
                    Renouvellement :
                    ${esc(renewal)}
                  </div>
                `
                :
                ''
              }

            </article>

          `;

        }
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


          return `

            <article class="spot">

              <div class="spot-picture">

                ${
                  spot.photo_url
                  ?
                  `
                    <img
                      src="${esc(spot.photo_url)}"
                      alt="${esc(spot.name)}"
                      loading="lazy"
                    >
                  `
                  :
                  ''
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
                    spot.name
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

                <div class="spot-details" hidden>

  ${
    spot.address
      ? `
        <div class="spot-detail-block">
          <strong>Adresse</strong>
          <p>${esc(spot.address)}</p>
        </div>
      `
      : ''
  }

  ${
    spot.description
      ? `
        <div class="spot-detail-block">
          <strong>Description</strong>
          <p>${esc(spot.description)}</p>
        </div>
      `
      : ''
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
      (
        state.spots ||
        []
      )
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
              (
                ' — '
                +
                esc(
                  spot.city
                )
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
            event.target
              .selectedIndex
          ];


      const field =
        document.getElementById(
          'spotName'
        );


      if (
        field &&
        option
          ?.dataset
          ?.name
      ) {

        field.value =
          option.dataset.name;

      }

    }

  );



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
        news => `

          <article
            class="news-card ${
            
              bool(
                news.featured
              )
              ?
              'news-featured'
              :
              ''
            }"
          >

            ${
              news.image_url
               
              ?
              `
                <img
                  class="news-image"
           
                  src="${esc(news.image_url)}"
                  alt="${esc(news.title)}"
                  loading="lazy"
                >
              `
              :
              ''
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
                  news.title
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

              <p>
                ${esc(
                  news.summary ||
                  news.content ||
                  ''
                )}
              </p>

              ${
                news.link_url
                ?
                `
                  <a
                    class="button small secondary"
                    href="${esc(news.link_url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    En savoir plus
                  </a>
                `
                :
                ''
              }

            </div>

          </article>

        `
      )
      .join('');

}



/* ============================================================
   GRADING MODALS
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
                aria-label="${esc(
                  prefix
                  +
                  (index + 1)
                  +
                  ' '
                  +
                  item
                )}"
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
        'N/A'
      ||
      raw ===
        ''
    ) {

      continue;

    }


    const n =
      Math.max(

        0,

        Math.min(

          2,

          Number(
            raw
          )

        )

      );


    if (
      !Number.isFinite(
        n
      )
    ) {

      continue;

    }


    sum +=
      n;


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
    values.filter(
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


      const diveNameField =
        document.getElementById(
          'diveName'
        );


      if (
        diveNameField &&
        DIVE_NAMES[
          code
        ]
      ) {

        diveNameField.value =
          DIVE_NAMES[
            code
          ];

      }

    }

  );



/* ============================================================
   AUTHENTIFICATION COACH
============================================================ */

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


  setMessage(

    'loginMsg',

    `
      <div class="notice">
        Connexion sécurisée…
      </div>
    `

  );


  try {

    const sb =
      requireSupabase();


    const {
      data,
      error
    } =
      await sb.auth
        .signInWithPassword({

          email,

          password

        });


    if (error) {

      throw error;

    }


    if (
      !data
        ?.user
    ) {

      throw new Error(
        'Connexion impossible.'
      );

    }


    state.user =
      data.user;


    await loadCoachMembership(
      data.user.id
    );


    showCoachPrivate();


    await loadCoachData();


    setMessage(
      'loginMsg',
      ''
    );


    showToast(
      'Connexion réussie.',
      'success'
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



/* ============================================================
   TROUVER LE CLUB DU COACH
============================================================ */

async function loadCoachMembership(
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
        'id,club_id,user_id,display_name,email,role,active,created_at'
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

    await sb.auth
      .signOut();


    throw new Error(
      "Ce compte n'est rattaché à aucun club actif."
    );

  }


  let membership =
    null;


  if (
    CLUB_SLUG
  ) {

    for (
      const item of
      memberships
    ) {

      const {
        data:
          club
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
            item.club_id
          )

          .eq(
            'slug',
            CLUB_SLUG
          )

          .maybeSingle();


      if (
        club
      ) {

        membership =
          item;


        state.club =
          club;


        break;

      }

    }

  }


  if (
    !membership
  ) {

    membership =
      memberships[
        0
      ];


    const {
      data:
        club,
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


    state.club =
      club;


    CLUB_SLUG =
      club.slug;


    updateClubUrl();

  }


  state.membership =
    membership;


  state.coach = {

    id:
      membership.id,

    userId:
      userId,

    name:
      membership.display_name
      ||
      state.user
        ?.email
      ||
      'Coach',

    role:
      membership.role
      ||
      'COACH',

    email:
      membership.email
      ||
      state.user
        ?.email
      ||
      ''

  };


  applyClubBranding(
    state.club
  );


  return membership;

}



/* ============================================================
   RESTAURER SESSION COACH
============================================================ */

async function restoreCoachSession() {

  if (
    !supabaseClient
  ) {

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
    data,
    error
  } =
    await supabaseClient.auth
      .getUser();


  if (
    error ||
    !data
      ?.user
  ) {

    showCoachLoggedOut();

    return false;

  }


  try {

    state.user =
      data.user;


    await loadCoachMembership(
      data.user.id
    );


    showCoachPrivate();


    await loadCoachData();


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



/* ============================================================
   AFFICHAGE COACH CONNECTE
============================================================ */

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


  const badge =
    document.getElementById(
      'dashboardCoachBadge'
    );


  const evalBadge =
    document.getElementById(
      'coachBadge'
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


  if (
    badge
  ) {

    badge.textContent =
      label;

  }


  if (
    evalBadge
  ) {

    evalBadge.textContent =
      label;

  }


  const clubName =
    document.getElementById(
      'dashboardClubName'
    );


  if (
    clubName
  ) {

    clubName.textContent =
      state.club
        ?.name
      ||
      'EAH Diving Club';

  }


  updateEvaluationAccess();

}



/* ============================================================
   AFFICHAGE COACH DECONNECTE
============================================================ */

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



/* ============================================================
   DECONNEXION
============================================================ */

async function logoutCoach() {

  try {

    if (
      supabaseClient
    ) {

      await supabaseClient.auth
        .signOut();

    }

  } catch (
    error
  ) {

    console.warn(
      error
    );

  }


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


  showToast(
    'Déconnecté.'
  );

}



/* ============================================================
   ACCES FORMULAIRE EVALUATION
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
   DASHBOARD CLUB
============================================================ */

async function loadCoachData() {

  if (
    !state.club
      ?.id
    ||
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

    groupsRes

  ] =
    await Promise.all([


      sb
        .from(
          'divers'
        )
        .select(
          'id,eah_id,first_name,last_name,photo_url,group_id,group_name,current_blazon,active,created_at'
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
          'last_name',
          {
            ascending:
              true
          }
        )
        .order(
          'first_name',
          {
            ascending:
              true
          }
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
          2000
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
          'name',
          {
            ascending:
              true
          }
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


  if (
    progressRes.error
  ) {

    throw progressRes.error;

  }


  if (
    groupsRes.error
  ) {

    throw groupsRes.error;

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

    progress:
      progressRes.data ||
      [],

    groups:
      state.groups

  });

}



/* ============================================================
   RENDU DASHBOARD
============================================================ */

function renderDashboard({

  divers,

  evaluations,

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
      evaluations.length,
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


  if (
    recent
  ) {

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
                  EAH ${esc(
                    fmtNumber(
                      item.eah_score
                    )
                  )}
                </strong>

                ${
                  item.eah_verified
                  ?
                  `
                    <span class="badge verified">
                      EAH VERIFIED
                    </span>
                  `
                  :
                  ''
                }

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


  if (
    groupBox
  ) {

    const counts =
      {};


    divers.forEach(
      diver => {

        const name =
          diver.group_name
          ||
          'Sans groupe';


        if (
          !counts[
            name
          ]
        ) {

          counts[
            name
          ] = {

            divers:
              0,

            evaluations:
              0

          };

        }


        counts[
          name
        ].divers++;

      }
    );


    const diverGroupById =
      Object.fromEntries(

        divers.map(
          diver => [

            String(
              diver.eah_id
            ),

            diver.group_name
            ||
            'Sans groupe'

          ]
        )

      );


    evaluations.forEach(
      evaluation => {

        const group =
          diverGroupById[
            String(
              evaluation.eah_id
            )
          ]
          ||
          'Sans groupe';


        if (
          !counts[
            group
          ]
        ) {

          counts[
            group
          ] = {

            divers:
              0,

            evaluations:
              0

          };

        }


        counts[
          group
        ].evaluations++;

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
            data
          ]
        ) => `

          <div class="history-item">

            <strong>
              ${esc(name)}
            </strong>

            <span>

              ${esc(
                data.divers
              )}
              plongeur(s)

              •

              ${esc(
                data.evaluations
              )}
              évaluation(s)

            </span>

          </div>

        `
      )
      .join('')
      ||
      'Aucun groupe.';

  }

}



/* ============================================================
   SELECT PLONGEURS
============================================================ */

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

            <option value="${esc(diver.eah_id)}">

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

async function loadPopulation() {

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


  if (!box) {
    return;
  }


  box.innerHTML = `

    <div class="loading-panel">
      Recherche…
    </div>

  `;


  try {

    const sb =
      requireSupabase();


    const {
      data,
      error
    } =
      await sb.rpc(

        'get_population_stats',

        {

          p_dive_code:
            code ||
            null,

          p_club_slug:
            CLUB_SLUG ||
            null

        }

      );


    if (
      !error &&
      data
    ) {

      const result =
        Array.isArray(
          data
        )
        ?
        data[
          0
        ]
        :
        data;


      renderPopulationStats(
        box,
        result
      );


      return;

    }


    /*
      FALLBACK :
      si un coach est connecté,
      on calcule les stats du club.
    */

    if (
      state.club
        ?.id
      &&
      state.user
    ) {

      let query =
        sb
          .from(
            'evaluations'
          )
          .select(
            'eah_id,eah_score,wa_score,dive_code'
          )
          .eq(
            'club_id',
            state.club.id
          );


      if (
        code
      ) {

        query =
          query.eq(
            'dive_code',
            code
          );

      }


      const {
        data:
          rows,
        error:
          clubError
      } =
        await query;


      if (
        clubError
      ) {

        throw clubError;

      }


      const result =
        statsFromEvaluations(
          rows ||
          []
        );


      renderPopulationStats(

        box,

        result,

        'Statistiques de votre club'

      );


      return;

    }


    throw new Error(
      'Le module Population public doit encore être activé dans la base Supabase.'
    );

  } catch (
    error
  ) {

    box.innerHTML = `

      <div class="notice error">
        ${esc(
          error.message ||
          error
        )}
      </div>

    `;

  }

}



function statsFromEvaluations(
  rows
) {

  const unique =
    new Set(

      rows
        .map(
          row =>
            String(
              row.eah_id ||
              ''
            )
        )
        .filter(
          Boolean
        )

    );


  const eah =
    rows
      .map(
        row =>
          Number(
            row.eah_score
          )
      )
      .filter(
        Number.isFinite
      );


  const wa =
    rows
      .filter(
        row =>
          row.wa_score !==
          null
          &&
          row.wa_score !==
          ''
      )
      .map(
        row =>
          Number(
            row.wa_score
          )
      )
      .filter(
        Number.isFinite
      );


  const avg =
    list =>
      list.length
      ?
      Math.round(
        (
          list.reduce(
            (
              a,
              b
            ) =>
              a + b,
            0
          )
          /
          list.length
        )
        *
        10
      )
      /
      10
      :
      null;


  return {

    people:
      unique.size,

    count:
      rows.length,

    avg_eah:
      avg(
        eah
      ),

    avg_wa:
      avg(
        wa
      )

  };

}



function renderPopulationStats(
  box,
  result,
  title = ''
) {

  const people =
    result.people
    ??
    result.global_people
    ??
    0;


  const count =
    result.count
    ??
    result.global_count
    ??
    0;


  const avgEah =
    result.avg_eah
    ??
    result.avgEah
    ??
    result.global_avg_eah
    ??
    null;


  const avgWa =
    result.avg_wa
    ??
    result.avgWa
    ??
    result.global_avg_wa
    ??
    null;


  box.innerHTML = `

    ${
      title
      ?
      `
        <p class="muted">
          ${esc(title)}
        </p>
      `
      :
      ''
    }

    <div class="population-stats">

      <div class="stat-card">

        <strong>
          ${esc(people)}
        </strong>

        <span>
          Plongeurs EAH
        </span>

      </div>


      <div class="stat-card">

        <strong>
          ${esc(count)}
        </strong>

        <span>
          Gradings
        </span>

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

}



/* ============================================================
   PROFIL PLONGEUR
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



/* ============================================================
   PROFIL PUBLIC
============================================================ */

async function loadPublicProfile(
  eahId
) {

  const sb =
    requireSupabase();


  setProfileLoading();


  const {
    data,
    error
  } =
    await sb

      .from(
        'public_profiles'
      )

      .select(
        'eah_id,club_id,display_name,photo_url,group_name,current_blazon,visible,updated_at'
      )

      .eq(
        'eah_id',
        eahId
      )

      .eq(
        'visible',
        true
      )

      .maybeSingle();


  if (
    error
  ) {

    renderProfileError(
      error.message
    );

    return;

  }


  if (
    !data
  ) {

    renderProfileError(
      'Profil public introuvable ou privé.'
    );

    return;

  }


  const club =
    await getClubById(
      data.club_id
    );


  state.profile = {

    eahId:
      data.eah_id,

    firstName:
      data.display_name ||
      data.eah_id,

    lastName:
      '',

    photoUrl:
      data.photo_url ||
      '',

    group:
      data.group_name ||
      '',

    currentBlazon:
      data.current_blazon ||
      '',

    club:
      club
        ?.name
      ||
      'EAH Diving',

    cardStatus:
      ''

  };


  renderProfileSummary(
    state.profile,
    false
  );


  renderProfileHistory({

    evaluations:
      [],

    blazons:
      []

  });

}



/* ============================================================
   PROFIL PRIVE NFC
============================================================ */

async function loadPrivateProfileByCard(
  eahId,
  token
) {

  setProfileLoading();


  if (
    !supabaseClient
  ) {

    renderProfileError(
      'Connexion au service indisponible.'
    );

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient.rpc(

      'open_diver_profile',

      {

        p_eah_id:
          eahId,

        p_token:
          token

      }

    );


  if (
    error
  ) {

    const message =
      String(
        error.message ||
        ''
      );


    if (
      message.includes(
        'function'
      )
      ||
      message.includes(
        'schema cache'
      )
    ) {

      renderProfileError(
        'Le module sécurisé des cartes NFC doit encore être installé dans Supabase.'
      );

    } else {

      renderProfileError(
        message ||
        'Carte ou profil invalide.'
      );

    }


    return;

  }


  const result =
    Array.isArray(
      data
    )
    ?
    data[
      0
    ]
    :
    data;


  if (
    !result
  ) {

    renderProfileError(
      'Profil introuvable.'
    );

    return;

  }


  if (
    result.needs_setup
  ) {

    state.profile =
      result;


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


  const profile =
    result.profile ||
    result;


  state.profile =
    normalizeRpcProfile(
      profile
    );


  renderProfileSummary(
    state.profile,
    true
  );


  await loadPrivateProfileHistory(

    eahId,

    token

  );

}



/* ============================================================
   NORMALISATION PROFIL RPC
============================================================ */

function normalizeRpcProfile(
  profile
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

    club:
      profile.club_name
      ||
      profile.club
      ||
      state.club
        ?.name
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



/* ============================================================
   HISTORIQUE PROFIL PRIVE
============================================================ */

async function loadPrivateProfileHistory(
  eahId,
  token
) {

  const {
    data,
    error
  } =
    await supabaseClient.rpc(

      'open_diver_history',

      {

        p_eah_id:
          eahId,

        p_token:
          token

      }

    );


  if (
    error
  ) {

    console.warn(
      'Historique privé:',
      error.message
    );


    renderProfileHistory({

      evaluations:
        [],

      blazons:
        []

    });


    return;

  }


  const result =
    Array.isArray(
      data
    )
    ?
    data[
      0
    ]
    :
    data;


  state.profileHistory =
    result
    ||
    {

      evaluations:
        [],

      blazons:
        []

    };


  renderProfileHistory(
    state.profileHistory
  );

}



/* ============================================================
   ETAT CHARGEMENT PROFIL
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



/* ============================================================
   ERREUR PROFIL
============================================================ */

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


  if (
    view
  ) {

    view.classList.remove(
      'hidden'
    );


    view.innerHTML = `

      <div class="notice error">
        ${esc(message)}
      </div>

    `;

  }

}



/* ============================================================
   RENDU PROFIL
============================================================ */

function renderProfileSummary(
  profile,
  privateAccess = false
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


  view.innerHTML = `

    <div class="profile-card">

      <div class="profile-head">

        ${
          profile.photoUrl
          ?
          `
            <img
              class="profile-avatar"
              src="${esc(profile.photoUrl)}"
              alt="${esc(displayName)}"
            >
          `
          :
          `
            <div class="profile-avatar profile-avatar-empty">
              EAH
            </div>
          `
        }


        <div>

          <span class="badge">
            ${esc(
              profile.eahId ||
              ''
            )}
          </span>

          <h2>
            ${esc(displayName)}
          </h2>

          <p class="muted">

            ${esc(
              profile.club ||
              'EAH Diving'
            )}

            ${
              profile.group
              ?
              (
                ' • '
                +
                esc(
                  profile.group
                )
              )
              :
              ''
            }

          </p>

          <p>

            <strong>
              Blazon actuel :
            </strong>

            ${esc(
              profile.currentBlazon ||
              'En progression'
            )}

          </p>

          ${
            profile.cardStatus
            ?
            `
              <span
                class="card-status ${cardStatusClass(
                  profile.cardStatus
                )}"
              >
                ${esc(
                  profile.cardStatus
                )}
              </span>
            `
            :
            ''
          }

          ${
            !privateAccess
            ?
            `
              <p class="muted">
                <small>
                  Vue publique du profil.
                </small>
              </p>
            `
            :
            ''
          }

        </div>

      </div>

    </div>


    <div class="profile-content-grid">

      <article class="dashboard-card">

        <h3>
          Progression des blazons
        </h3>

        <div id="profileBlazons">

          <div class="mini-loading">
            Chargement…
          </div>

        </div>

      </article>


      <article class="dashboard-card">

        <h3>
          Historique
        </h3>

        <div id="profileHistory">

          <div class="mini-loading">
            Chargement…
          </div>

        </div>

      </article>

    </div>

  `;

}



/* ============================================================
   CLASSE STATUT CARTE
============================================================ */

function cardStatusClass(
  status
) {

  const value =
    String(
      status ||
      ''
    )
    .toUpperCase();


  if (
    value ===
      'ATTRIBUÉE'
    ||
    value ===
      'ATTRIBUEE'
  ) {

    return 'status-assigned';

  }


  if (
    value ===
    'PERDUE'
  ) {

    return 'status-lost';

  }


  return 'status-free';

}



/* ============================================================
   RENDU HISTORIQUE PROFIL
============================================================ */

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
    data
      ?.blazons
    ||
    data
      ?.progress
    ||
    [];


  const evaluations =
    data
      ?.evaluations
    ||
    [];


  if (
    blazons
  ) {

    blazons.innerHTML =
      blazonRows
        .map(
          item => {

            const status =
              item.status ||
              '';


            const progress =
              item.progress
              ??
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
                    (
                      esc(
                        progress
                      )
                      +
                      ' %'
                    )
                  }

                </span>

              </div>

            `;

          }
        )
        .join('')
      ||
      'Aucune progression enregistrée.';

  }


  if (
    history
  ) {

    history.innerHTML =
      evaluations
        .map(
          evaluation => `

            <div class="history-item profile-history-item">

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
                  evaluation.height !==
                    null
                  &&
                  typeof evaluation.height !==
                    'undefined'
                  ?
                  (
                    ' — '
                    +
                    esc(
                      fmtNumber(
                        evaluation.height
                      )
                    )
                    +
                    ' m'
                  )
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
                    (
                      evaluation.spot_name
                      ||
                      evaluation.spot
                    )
                    ?
                    (
                      ' • '
                      +
                      esc(
                        evaluation.spot_name
                        ||
                        evaluation.spot
                      )
                    )
                    :
                    ''
                  }

                </small>

              </span>


              <span class="history-score">

                <strong>

                  EAH

                  ${esc(
                    fmtNumber(
                      evaluation.eah_score
                      ??
                      evaluation.eah
                    )
                  )}/10

                </strong>

                ${
                  (
                    evaluation.eah_verified
                    ||
                    evaluation.verified
                  )
                  ?
                  `
                    <span class="badge verified">
                      EAH VERIFIED
                    </span>
                  `
                  :
                  ''
                }

                ${
                  (
                    evaluation.report_url
                    ||
                    evaluation.reportUrl
                  )
                  ?
                  `
                    <a
                      href="${esc(
                        evaluation.report_url
                        ||
                        evaluation.reportUrl
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

              </span>

            </div>

          `
        )
        .join('')
      ||
      'Aucune évaluation.';

  }

}



/* ============================================================
   CLUB PAR ID
============================================================ */

async function getClubById(
  id
) {

  if (
    !id ||
    !supabaseClient
  ) {

    return null;

  }


  const {
    data
  } =
    await supabaseClient

      .from(
        'clubs'
      )

      .select(
        'id,slug,name,city,logo_url,primary_color,secondary_color,season'
      )

      .eq(
        'id',
        id
      )

      .maybeSingle();


  return (
    data ||
    null
  );

}



/* ============================================================
   ACTIVATION PROFIL NFC
============================================================ */

async function setupProfile() {

  const button =
    document.getElementById(
      'setupProfileButton'
    );


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


  setLoadingButton(

    button,

    true,

    'Activation…',

    'Activer mon profil'

  );


  try {

    const sb =
      requireSupabase();


    const {
      error
    } =
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
      error
    ) {

      throw error;

    }


    setMessage(

      'setupProfileMsg',

      `
        <div class="notice success">
          Profil activé.
        </div>
      `

    );


    showToast(
      'Profil EAH activé.',
      'success'
    );


    await loadPrivateProfileByCard(

      CARD_EAH_ID,

      CARD_TOKEN

    );

  } catch (
    error
  ) {

    const message =
      String(
        error.message ||
        'Activation impossible.'
      );


    setMessage(

      'setupProfileMsg',

      `
        <div class="notice error">

          ${esc(
            message.includes(
              'function'
            )
            ?
            'Le module sécurisé d’activation doit encore être installé dans Supabase.'
            :
            message
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
   CONNEXION PLONGEUR SANS CARTE
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


  setLoadingButton(

    button,

    true,

    'Ouverture…',

    'Ouvrir mon profil'

  );


  try {

    const sb =
      requireSupabase();


    const {
      data,
      error
    } =
      await sb.rpc(

        'diver_login',

        {

          p_eah_id:
            eahId,

          p_pin:
            pin

        }

      );


    if (
      error
    ) {

      throw error;

    }


    const result =
      Array.isArray(
        data
      )
      ?
      data[
        0
      ]
      :
      data;


    if (
      !result
        ?.token
    ) {

      throw new Error(
        'Profil non accessible.'
      );

    }


    const clubSlug =
      result.club_slug
      ||
      result.club
      ||
      '';


    openProfile(

      clubSlug,

      eahId,

      result.token

    );


    setMessage(
      'diverLoginMsg',
      ''
    );

  } catch (
    error
  ) {

    const message =
      String(
        error.message ||
        'Connexion impossible.'
      );


    setMessage(

      'diverLoginMsg',

      `
        <div class="notice error">

          ${esc(
            message.includes(
              'function'
            )
            ?
            'Le module sécurisé de connexion plongeur doit encore être installé dans Supabase.'
            :
            message
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
   OUVERTURE PROFIL
============================================================ */

function openProfile(
  club,
  eahId,
  token
) {

  CLUB_SLUG =
    String(
      club ||
      CLUB_SLUG ||
      ''
    )
    .trim();


  CARD_EAH_ID =
    String(
      eahId ||
      ''
    )
    .trim()
    .toUpperCase();


  CARD_TOKEN =
    String(
      token ||
      ''
    )
    .trim();


  const params =
    new URLSearchParams();


  if (
    CLUB_SLUG
  ) {

    params.set(
      'club',
      CLUB_SLUG
    );

  }


  params.set(
    'id',
    CARD_EAH_ID
  );


  params.set(
    'token',
    CARD_TOKEN
  );


  history.replaceState(

    null,

    '',

    (
      window.location.pathname
      +
      '?'
      +
      params.toString()
      +
      '#profil'
    )

  );


  showPage(
    'profil',
    false
  );


  loadPrivateProfileByCard(

    CARD_EAH_ID,

    CARD_TOKEN

  )
  .catch(
    console.warn
  );

}



/* ============================================================
   ENREGISTRER EVALUATION
============================================================ */

async function submitEvaluation(
  event
) {

  event.preventDefault();


  if (
    state.evaluationBusy
  ) {

    return;

  }


  if (
    !state.user ||
    !state.membership ||
    !state.club
      ?.id
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
    state.divers
      .find(
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


  if (
    !diver
  ) {

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


  setMessage(

    'evaluationMsg',

    `
      <div class="notice">
        Enregistrement de l’évaluation…
      </div>
    `

  );


  try {

    const sb =
      requireSupabase();


    const evaluationCode =
      randomCode(
        'EV'
      );


    const spotId =
      val(
        'spotId'
      )
      ||
      null;


    const spotName =
      val(
        'spotName'
      )
      .trim()
      ||
      null;


    const row = {

      evaluation_code:
        evaluationCode,

      club_id:
        state.club.id,

      diver_id:
        diver.id,

      eah_id:
        diver.eah_id,

      coach_user_id:
        state.user.id,

      coach_name:
        state.coach
          ?.name
        ||
        state.user.email
        ||
        'Coach',

      discipline:
        val(
          'discipline'
        )
        ||
        'Plongeon',

      dive_code:
        diveCode,

      dive_name:
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

      height_type:
        val(
          'heightType'
        )
        ||
        'KNOWN',

      spot_id:
        spotId,

      spot_name:
        spotName,

      dd:
        asNumber(
          val(
            'dd'
          )
        ),

      eah_difficulty:
        asNumber(
          val(
            'eahDifficulty'
          )
        ),

      wa_score:
        asNumber(
          val(
            'waScore'
          )
        ),

      takeoff:
        takeoff,

      trick:
        trick,

      entry_score:
        entry,

      eah_score:
        eahScore,

      criteria:
        criteria,

      positive:
        val(
          'positive'
        )
        .trim()
        ||
        null,

      improve:
        val(
          'improve'
        )
        .trim()
        ||
        null,

      comment:
        val(
          'comment'
        )
        .trim()
        ||
        null,

      video_url:
        val(
          'videoUrl'
        )
        .trim()
        ||
        null,

      video_public:
        Boolean(
          document
            .getElementById(
              'videoQrAccessible'
            )
            ?.checked
        ),

      eah_verified:
        false,

      report_url:
        null

    };


    const {
      data:
        inserted,
      error
    } =
      await sb

        .from(
          'evaluations'
        )

        .insert(
          row
        )

        .select(
          '*'
        )

        .single();


    if (
      error
    ) {

      throw error;

    }


    const progress =
      await recalculateBlazonsForDiver(
        diver
      );


    let reportUrl =
      null;


    if (
      APPS_SCRIPT_URL
    ) {

      try {

        reportUrl =
          await requestGradeReportFromAppsScript(

            inserted,

            diver

          );


        if (
          reportUrl
        ) {

          await sb

            .from(
              'evaluations'
            )

            .update({

              report_url:
                reportUrl

            })

            .eq(
              'id',
              inserted.id
            );

        }

      } catch (
        reportError
      ) {

        console.warn(
          'Grade Report PDF:',
          reportError
        );

      }

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
            reportUrl
            ?
            `
              <br><br>

              <a
                class="button small"
                href="${esc(reportUrl)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir le Grade Report
              </a>
            `
            :
            `
              <br><br>

              <small>
                Le PDF sera activé lorsque le module Apps Script Grade Report sera connecté.
              </small>
            `
          }

        </div>
      `

    );


    if (
      progress
        ?.newlyEarned
        ?.length
    ) {

      showToast(

        (
          'Blazon obtenu : '
          +
          progress
            .newlyEarned
            .join(
              ', '
            )
        ),

        'success',

        6000

      );

    } else {

      showToast(
        'Évaluation enregistrée.',
        'success'
      );

    }


    await loadCoachData();

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
   APPS SCRIPT OPTIONNEL
   GENERATION PDF
============================================================ */

async function requestGradeReportFromAppsScript(
  evaluation,
  diver
) {

  if (
    !APPS_SCRIPT_URL
  ) {

    return null;

  }


  const payload = {

    action:
      'createGradeReportVPro',

    clubSlug:
      state.club
        ?.slug
      ||
      CLUB_SLUG,

    clubName:
      state.club
        ?.name
      ||
      '',

    evaluation:
      evaluation,

    diver: {

      id:
        diver.id,

      eahId:
        diver.eah_id,

      firstName:
        diver.first_name,

      lastName:
        diver.last_name,

      groupName:
        diver.group_name

    }

  };


  const response =
    await fetch(

      APPS_SCRIPT_URL,

      {

        method:
          'POST',

        headers: {

          'Content-Type':
            'text/plain;charset=utf-8'

        },

        body:
          JSON.stringify(
            payload
          )

      }

    );


  if (
    !response.ok
  ) {

    throw new Error(
      `Apps Script HTTP ${response.status}`
    );

  }


  const result =
    await response.json();


  if (
    !result
      ?.ok
  ) {

    throw new Error(
      result
        ?.error
      ||
      'Grade Report impossible.'
    );

  }


  return (
    result.reportUrl
    ||
    null
  );

}



/* ============================================================
   MOTEUR BLAZONS
============================================================ */

async function recalculateBlazonsForDiver(
  diver
) {

  if (
    !diver
      ?.id
    ||
    !state.club
      ?.id
  ) {

    return null;

  }


  const sb =
    requireSupabase();


  const {
    data:
      evaluations,
    error
  } =
    await sb

      .from(
        'evaluations'
      )

      .select(
        'id,dive_code,height,eah_score,wa_score,evaluated_at'
      )

      .eq(
        'club_id',
        state.club.id
      )

      .eq(
        'diver_id',
        diver.id
      );


  if (
    error
  ) {

    throw error;

  }


  const blazons =
    (
      state.blazons
        ?.length
      ?
      state.blazons
      :
      BLAZON_FALLBACK
    )
    .slice()
    .sort(
      (
        a,
        b
      ) =>
        Number(
          a.sort_order
          ??
          999
        )
        -
        Number(
          b.sort_order
          ??
          999
        )
    );


  const oldProgressRes =
    await sb

      .from(
        'blazon_progress'
      )

      .select(
        'blazon_key,status,earned_at'
      )

      .eq(
        'diver_id',
        diver.id
      );


  const oldByKey =
    new Map(

      (
        oldProgressRes.data ||
        []
      )
      .map(
        row => [

          row.blazon_key,

          row

        ]
      )

    );


  const rows =
    [];


  const newlyEarned =
    [];


  blazons.forEach(
    blazon => {

      const result =
        evaluateBlazon(

          blazon,

          evaluations ||
          []

        );


      const key =
        blazon.key;


      const old =
        oldByKey.get(
          key
        );


      if (
        result.status ===
          'OBTENU'
        &&
        old
          ?.status !==
          'OBTENU'
      ) {

        newlyEarned.push(
          blazon.name
        );

      }


      rows.push({

        club_id:
          state.club.id,

        diver_id:
          diver.id,

        eah_id:
          diver.eah_id,

        blazon_key:
          key,

        blazon_name:
          blazon.name,

        status:
          result.status,

        progress:
          result.progress,

        details:
          result.details,

        earned_at:
          result.status ===
            'OBTENU'
          ?
          (
            old
              ?.earned_at
            ||
            new Date()
              .toISOString()
          )
          :
          null,

        updated_at:
          new Date()
            .toISOString()

      });

    }
  );


  if (
    rows.length
  ) {

    const {
      error:
        upsertError
    } =
      await sb

        .from(
          'blazon_progress'
        )

        .upsert(

          rows,

          {

            onConflict:
              'diver_id,blazon_key'

          }

        );


    if (
      upsertError
    ) {

      throw upsertError;

    }

  }


  const highest =
    rows
      .filter(
        row =>
          row.status ===
          'OBTENU'
      )
      .map(
        row => ({

          row,

          order:
            Number(

              blazons
                .find(
                  b =>
                    b.key ===
                    row.blazon_key
                )
                ?.sort_order
              ??
              0

            )

        })
      )
      .sort(
        (
          a,
          b
        ) =>
          b.order -
          a.order
      )[
        0
      ];


  const currentBlazon =
    highest
      ?.row
      ?.blazon_name
    ||
    null;


  const {
    error:
      diverUpdateError
  } =
    await sb

      .from(
        'divers'
      )

      .update({

        current_blazon:
          currentBlazon

      })

      .eq(
        'id',
        diver.id
      );


  if (
    diverUpdateError
  ) {

    throw diverUpdateError;

  }


  diver.current_blazon =
    currentBlazon;


  return {

    rows,

    currentBlazon,

    newlyEarned

  };

}



/* ============================================================
   EVALUER BLAZON
============================================================ */

function evaluateBlazon(
  blazon,
  evaluations
) {

  const rules =
    getBlazonRules(
      blazon
    );


  /* ==========================================================
     TITAN / ANY ONE
  ========================================================== */

  if (
    rules.mode ===
    'ANY_ONE'
  ) {

    const choices = [

      ...(
        rules.options ||
        []
      ),

      ...(
        rules.fullSeriesOptions ||
        []
      ),

      ...(
        rules.fullSeriesOption
        ?
        [
          rules.fullSeriesOption
        ]
        :
        []
      )

    ];


    const results =
      choices.map(
        series =>
          evaluateSeries(

            series,

            evaluations,

            false

          )
      );


    const best =
      results
        .slice()
        .sort(
          (
            a,
            b
          ) =>
            b.progress -
            a.progress
        )[
          0
        ]
      ||
      {

        progress:
          0,

        done:
          0,

        total:
          1

      };


    const obtained =
      results.some(
        result =>
          result.complete
      );


    return {

      status:
        obtained
        ?
        'OBTENU'
        :
        'EN COURS',

      progress:
        obtained
        ?
        100
        :
        best.progress,

      details: {

        mode:
          'ANY_ONE',

        paths:
          results

      }

    };

  }


  /* ==========================================================
     LEGEND / ANY SERIES
  ========================================================== */

  if (
    rules.mode ===
    'ANY_SERIES'
  ) {

    const results =
      (
        rules.series ||
        []
      )
      .map(
        series =>
          evaluateSeries(

            series,

            evaluations,

            false

          )
      );


    const best =
      results
        .slice()
        .sort(
          (
            a,
            b
          ) =>
            b.progress -
            a.progress
        )[
          0
        ]
      ||
      {

        progress:
          0

      };


    const obtained =
      results.some(
        result =>
          result.complete
      );


    return {

      status:
        obtained
        ?
        'OBTENU'
        :
        'EN COURS',

      progress:
        obtained
        ?
        100
        :
        best.progress,

      details: {

        mode:
          'ANY_SERIES',

        paths:
          results

      }

    };

  }


  /* ==========================================================
     BLAZONS CLASSIQUES
  ========================================================== */

  const series =
    rules.series ||
    [];


  if (
    !series.length
  ) {

    return {

      status:
        'EN COURS',

      progress:
        0,

      details: {

        mode:
          'EMPTY'

      }

    };

  }


  const scenarios =
    [];


  /*
    SCENARIO NORMAL
  */

  scenarios.push(

    evaluateBlazonScenario(

      series,

      evaluations,

      null,

      false

    )

  );


  /*
    BLANC / ORANGE :
    alternative fixe
  */

  if (
    rules.allowFixedAlternatives
  ) {

    scenarios.push(

      evaluateBlazonScenario(

        series,

        evaluations,

        'FIXED',

        true

      )

    );

  }


  /*
    BLEU ET +
    UNE SEULE SERIE DEPLACEE
    SUR PLATEFORME
  */

  if (
    rules.allowOnePlatformSubstitution
  ) {

    series.forEach(
      (
        serie,
        index
      ) => {

        if (
          ![
            1,
            3
          ]
          .includes(
            Number(
              serie.height
            )
          )
        ) {

          return;

        }


        if (
          serie.substitutable ===
          false
        ) {

          return;

        }


        if (
          !Array.isArray(
            serie.alternativeHeights
          )
          ||
          !serie.alternativeHeights.length
        ) {

          return;

        }


        scenarios.push(

          evaluateBlazonScenario(

            series,

            evaluations,

            index,

            false

          )

        );

      }
    );

  }


  const best =
    scenarios
      .slice()
      .sort(
        (
          a,
          b
        ) => {

          if (
            a.complete !==
            b.complete
          ) {

            return a.complete
              ?
              -1
              :
              1;

          }


          return (
            b.progress -
            a.progress
          );

        }
      )[
        0
      ];


  return {

    status:
      best
        ?.complete
      ?
      'OBTENU'
      :
      'EN COURS',

    progress:
      best
        ?.complete
      ?
      100
      :
      (
        best
          ?.progress
        ||
        0
      ),

    details: {

      mode:
        'ALL',

      bestScenario:
        best,

      scenarios:
        scenarios

    }

  };

}



/* ============================================================
   SCENARIO BLAZON
============================================================ */

function evaluateBlazonScenario(
  series,
  evaluations,
  alternativeTarget,
  fixedAlternatives
) {

  let total =
    0;


  let done =
    0;


  const details =
    [];


  series.forEach(
    (
      serie,
      index
    ) => {

      let useAlternative =
        false;


      if (
        fixedAlternatives
      ) {

        useAlternative =
          Boolean(

            Array.isArray(
              serie.alternativeHeights
            )
            &&
            serie.alternativeHeights.length

          );

      } else if (
        typeof alternativeTarget ===
        'number'
      ) {

        useAlternative =
          index ===
          alternativeTarget;

      }


      const result =
        evaluateSeries(

          serie,

          evaluations,

          useAlternative

        );


      total +=
        result.total;


      done +=
        result.done;


      details.push(
        result
      );

    }
  );


  const progress =
    total
    ?
    Math.round(
      (
        done /
        total
      )
      *
      100
    )
    :
    0;


  return {

    alternativeTarget,

    fixedAlternatives,

    total,

    done,

    progress,

    complete:
      total > 0
      &&
      done ===
      total,

    series:
      details

  };

}



/* ============================================================
   EVALUER UNE SERIE
============================================================ */

function evaluateSeries(
  series,
  evaluations,
  useAlternative
) {

  const codes =
    series.codes ||
    [];


  const items =
    [];


  codes.forEach(
    code => {

      const choices =
        series
          .choiceGroups
          ?.[code];


      let satisfied =
        false;


      let matchedCode =
        null;


      if (
        Array.isArray(
          choices
        )
        &&
        choices.length
      ) {

        for (
          const choice of
          choices
        ) {

          if (
            hasPassingEvaluation(

              evaluations,

              choice,

              series,

              useAlternative

            )
          ) {

            satisfied =
              true;


            matchedCode =
              choice;


            break;

          }

        }

      } else {

        satisfied =
          hasPassingEvaluation(

            evaluations,

            code,

            series,

            useAlternative

          );


        if (
          satisfied
        ) {

          matchedCode =
            code;

        }

      }


      items.push({

        requirement:
          code,

        choices:
          choices ||
          null,

        satisfied,

        matchedCode

      });

    }
  );


  const done =
    items
      .filter(
        item =>
          item.satisfied
      )
      .length;


  const total =
    items.length;


  const progress =
    total
    ?
    Math.round(
      (
        done /
        total
      )
      *
      100
    )
    :
    0;


  return {

    label:
      series.label
      ||
      (
        Number(
          series.height
        ) ===
        0
        ?
        'Bord / plot'
        :
        `${series.height} m`
      ),

    height:
      series.height,

    alternative:
      useAlternative,

    done,

    total,

    progress,

    complete:
      total > 0
      &&
      done ===
      total,

    items

  };

}



/* ============================================================
   VERIFIER UNE EVALUATION
============================================================ */

function hasPassingEvaluation(
  evaluations,
  code,
  series,
  useAlternative
) {

  const allowedHeights =
    useAlternative
    ?
    (
      series.alternativeHeights
      ||
      [
        5,
        7.5,
        10
      ]
    )
    .map(
      Number
    )
    :
    [
      Number(
        series.height
      )
    ];


  const minWa =
    (
      useAlternative
      &&
      series.alternativeMinWa !==
      undefined
    )
    ?
    Number(
      series.alternativeMinWa
    )
    :
    Number(
      series.minWa
    );


  const minEah =
    (
      useAlternative
      &&
      series.alternativeMinEah !==
      undefined
    )
    ?
    Number(
      series.alternativeMinEah
    )
    :
    Number(
      series.minEah
    );


  return evaluations.some(
    evaluation => {

      if (
        normalizeCode(
          evaluation.dive_code
        )
        !==
        normalizeCode(
          code
        )
      ) {

        return false;

      }


      const height =
        Number(
          evaluation.height
        );


      if (
        !allowedHeights.some(
          allowed =>
            Math.abs(
              height -
              allowed
            )
            <
            0.01
        )
      ) {

        return false;

      }


      const eah =
        Number(
          evaluation.eah_score
        );


      const wa =
        (
          evaluation.wa_score ===
            null
          ||
          evaluation.wa_score ===
            ''
        )
        ?
        null
        :
        Number(
          evaluation.wa_score
        );


      const eahPass =
        Number.isFinite(
          eah
        )
        &&
        Number.isFinite(
          minEah
        )
        &&
        eah >=
        minEah;


      const waPass =
        Number.isFinite(
          wa
        )
        &&
        Number.isFinite(
          minWa
        )
        &&
        wa >=
        minWa;


      return (
        eahPass
        ||
        waPass
      );

    }
  );

}



/* ============================================================
   FORMULAIRE PUBLIC GRADING
============================================================ */

async function submitPublicGrading(
  event
) {

  event.preventDefault();


  const button =
    document.getElementById(
      'publicSubmitButton'
    );


  setLoadingButton(

    button,

    true,

    'Envoi…',

    'Envoyer la demande'

  );


  try {

    const sb =
      requireSupabase();


    const payload = {

      first_name:
        val(
          'publicFirstName'
        )
        .trim(),

      last_name:
        val(
          'publicLastName'
        )
        .trim(),

      email:
        val(
          'publicEmail'
        )
        .trim()
        .toLowerCase(),

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

      video_url:
        val(
          'publicVideo'
        )
        .trim(),

      message:
        val(
          'publicMessage'
        )
        .trim()

    };


    const {
      error
    } =
      await sb.rpc(

        'submit_public_grading_request',

        {

          p_request:
            payload

        }

      );


    if (
      error
    ) {

      throw error;

    }


    setMessage(

      'publicFormMessage',

      `
        <div class="notice success">
          Demande enregistrée.
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

    const message =
      String(
        error.message ||
        'Envoi impossible.'
      );


    setMessage(

      'publicFormMessage',

      `
        <div class="notice error">

          ${esc(
            message.includes(
              'function'
            )
            ?
            'Le module de demandes publiques doit encore être installé dans Supabase.'
            :
            message
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
   URL CLUB
============================================================ */

function updateClubUrl() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  if (
    CLUB_SLUG
  ) {

    params.set(
      'club',
      CLUB_SLUG
    );

  } else {

    params.delete(
      'club'
    );

  }


  params.delete(
    'coachToken'
  );


  const query =
    params.toString()
    ?
    (
      '?'
      +
      params.toString()
    )
    :
    '';


  history.replaceState(

    null,

    '',

    (
      window.location.pathname
      +
      query
      +
      (
        window.location.hash
        ||
        '#club'
      )
    )

  );

}



/* ============================================================
   EVENTS
============================================================ */

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


document
  .getElementById(
    'populationCode'
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
          session
            ?.user
        ) {

          state.user =
            session.user;

        }

      }
    );

}



/* ============================================================
   NFC COACH ANCIEN FORMAT
============================================================ */

function handleLegacyCoachNfc() {

  if (
    !LEGACY_COACH_TOKEN
  ) {

    return;

  }


  showPage(
    'club',
    false
  );


  setMessage(

    'loginMsg',

    `
      <div class="notice">

        Carte Coach détectée

        ${
          CLUB_SLUG
          ?
          (
            ' pour <strong>'
            +
            esc(
              CLUB_SLUG
            )
            +
            '</strong>'
          )
          :
          ''
        }.

        Connectez-vous une première fois sur cet appareil ;
        la session restera ensuite mémorisée.

      </div>
    `

  );

}



/* ============================================================
   ROUTE INITIALE
============================================================ */

function initialRoute() {

  /*
    PRIORITE 1 :
    CARTE PLONGEUR
  */

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


  /*
    PRIORITE 2 :
    ANCIENNE CARTE COACH
  */

  if (
    LEGACY_COACH_TOKEN
  ) {

    handleLegacyCoachNfc();


    return;

  }


  /*
    ROUTE CLASSIQUE
  */

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
   INITIALISATION
============================================================ */

async function init() {

  /*
    ELEMENTS LOCAUX
  */

  renderCriteria();

  renderDiveCodes();

  renderBlazons();

  renderPricing();


  /*
    ROUTE IMMÉDIATE
  */

  initialRoute();


  /*
    CHARGEMENT SUPABASE
  */

  await Promise.allSettled([

    loadPublicData(),

    loadClubBranding()

  ]);


  /*
    RESTAURATION COACH
  */

  await restoreCoachSession();


  /*
    NFC PLONGEUR
  */

  if (
    CARD_EAH_ID &&
    CARD_TOKEN
  ) {

    await loadPrivateProfileByCard(

      CARD_EAH_ID,

      CARD_TOKEN

    )
    .catch(
      console.warn
    );

  }

}


/* ============================================================
   EAH DIVING PRO CLUB
   FAST CORE PATCH V2
   01/10/2026

   IMPORTANT :
   CE BLOC DOIT ETRE PLACE JUSTE AVANT :
   init().catch(...)

   Il remplace automatiquement les anciennes fonctions :
   - profil NFC
   - login plongeur
   - login coach
   - restauration coach
   - dashboard coach
   - rendu profil
   - évaluation
   - initialisation du site

   eah-pro.js NE DOIT PLUS ETRE CHARGE.
============================================================ */


/* ============================================================
   OUTILS FAST
============================================================ */

async function eahFastSha256(
  value
) {

  const bytes =
    new TextEncoder()
      .encode(
        String(
          value || ''
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



/* ============================================================
   PHOTO
============================================================ */

function eahFastPhotoUrl(
  url
) {

  url =
    String(
      url || ''
    )
    .trim();


  if (!url) {

    return '';

  }


  /*
    SUPABASE STORAGE
  */

  if (
    url.includes(
      '/storage/v1/object/public/'
    )
  ) {

    return url;

  }


  /*
    GOOGLE DRIVE
  */

  let match =
    url.match(
      /[?&]id=([^&]+)/
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
      '&sz=w1000'
    );

  }


  match =
    url.match(
      /\/d\/([^/]+)/
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
      '&sz=w1000'
    );

  }


  return url;

}



/* ============================================================
   PROFIL PREMIUM
============================================================ */

function renderProfileSummary(
  profile,
  privateAccess = false
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


  const firstName =
    String(
      profile.firstName ||
      ''
    )
    .trim();


  const lastName =
    String(
      profile.lastName ||
      ''
    )
    .trim();


  const displayName =
    (
      firstName
      +
      ' '
      +
      lastName
    )
    .trim()
    ||
    profile.eahId
    ||
    'Plongeur EAH';


  const photo =
    eahFastPhotoUrl(
      profile.photoUrl
    );


  const initials =
    (
      (
        firstName
          ? firstName[0]
          : ''
      )
      +
      (
        lastName
          ? lastName[0]
          : ''
      )
    )
    .toUpperCase()
    ||
    'EAH';


  view.innerHTML = `

    <div class="eah-fast-profile">

      <div class="eah-fast-profile-top">

        <div class="eah-fast-photo-shell">

          ${
            photo
            ?
            `
              <img
                class="eah-fast-photo"
                src="${esc(photo)}"
                alt="${esc(displayName)}"

                onerror="
                  this.style.display='none';
                  this.nextElementSibling.style.display='grid';
                "
              >
            `
            :
            ''
          }

          <div
            class="eah-fast-photo-fallback"
            style="${
              photo
                ? 'display:none'
                : 'display:grid'
            }"
          >
            ${esc(initials)}
          </div>

        </div>


        <div class="eah-fast-profile-text">

          <span class="overline">
            ESPACE PERSONNEL EAH
          </span>


          <h1>

            Bienvenue
            ${esc(
              firstName ||
              displayName
            )}
            sur ton espace personnel

          </h1>


          <h2>
            ${esc(displayName)}
          </h2>


          <div class="eah-fast-profile-tags">

            <span>
              ${esc(
                profile.eahId ||
                ''
              )}
            </span>

            ${
              profile.group
              ?
              `
                <span>
                  ${esc(
                    profile.group
                  )}
                </span>
              `
              :
              ''
            }

            <span>
              ${
                esc(
                  profile.currentBlazon ||
                  'En progression'
                )
              }
            </span>

          </div>

        </div>

      </div>


      <div class="profile-content-grid">

        <article class="dashboard-card">

          <h3>
            Progression des blazons
          </h3>

          <div id="profileBlazons">
          </div>

        </article>


        <article class="dashboard-card">

          <h3>
            Historique
          </h3>

          <div id="profileHistory">
          </div>

        </article>

      </div>

    </div>

  `;


  if (
    !document.getElementById(
      'eah-fast-profile-css'
    )
  ) {

    const style =
      document.createElement(
        'style'
      );


    style.id =
      'eah-fast-profile-css';


    style.textContent = `

      .eah-fast-profile {
        padding:
          clamp(
            24px,
            5vw,
            52px
          );
        border:
          1px solid
          rgba(
            143,
            205,
            255,
            .22
          );
        border-radius:
          34px;
        background:
          linear-gradient(
            135deg,
            rgba(
              4,
              22,
              47,
              .97
            ),
            rgba(
              5,
              42,
              80,
              .88
            )
          );
        box-shadow:
          0
          30px
          90px
          rgba(
            0,
            0,
            0,
            .32
          );
      }


      .eah-fast-profile-top {
        display:
          flex;
        align-items:
          center;
        gap:
          clamp(
            25px,
            5vw,
            55px
          );
        margin-bottom:
          35px;
      }


      .eah-fast-photo-shell {
        width:
          clamp(
            160px,
            21vw,
            250px
          );
        height:
          clamp(
            160px,
            21vw,
            250px
          );
        flex:
          0 0 auto;
        padding:
          5px;
        border-radius:
          36px;
        background:
          linear-gradient(
            145deg,
            #30cfff,
            #0b6bff
          );
      }


      .eah-fast-photo,
      .eah-fast-photo-fallback {
        width:
          100%;
        height:
          100%;
        border-radius:
          31px;
      }


      .eah-fast-photo {
        object-fit:
          cover;
        background:
          #03131f;
      }


      .eah-fast-photo-fallback {
        place-items:
          center;
        background:
          #061e33;
        color:
          white;
        font-size:
          3rem;
        font-weight:
          900;
      }


      .eah-fast-profile-text h1 {
        max-width:
          850px;
        margin:
          9px
          0
          15px;
        font-size:
          clamp(
            2rem,
            5vw,
            4.2rem
          );
        line-height:
          1.02;
      }


      .eah-fast-profile-text h2 {
        margin:
          0;
        color:
          #c3d8e8;
      }


      .eah-fast-profile-tags {
        display:
          flex;
        flex-wrap:
          wrap;
        gap:
          8px;
        margin-top:
          20px;
      }


      .eah-fast-profile-tags span {
        padding:
          8px
          13px;
        border:
          1px solid
          rgba(
            48,
            207,
            255,
            .22
          );
        border-radius:
          999px;
        background:
          rgba(
            48,
            207,
            255,
            .07
          );
      }


      @media (
        max-width:
        700px
      ) {

        .eah-fast-profile-top {
          display:
            grid;
          text-align:
            center;
        }


        .eah-fast-photo-shell {
          margin:
            auto;
        }


        .eah-fast-profile-tags {
          justify-content:
            center;
        }

      }

    `;


    document.head
      .appendChild(
        style
      );

  }

}



/* ============================================================
   SCAN NFC
   1 SEUL APPEL SUPABASE
============================================================ */

async function loadPrivateProfileByCard(
  eahId,
  token
) {

  setProfileLoading();


  try {

    const sb =
      requireSupabase();


    const {
      data,
      error
    } =
      await sb.rpc(

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
      data.ok === false
    ) {

      throw new Error(
        data?.error ||
        'Profil introuvable.'
      );

    }


    /*
      CARTE NON ENCORE ATTRIBUEE
    */

    if (
      data.assigned === false
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
          'profileNoAuth'
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


    const profile =
      data.profile ||
      {};


    state.profile = {

      eahId:
        profile.eahId,

      firstName:
        profile.firstName ||
        '',

      lastName:
        profile.lastName ||
        '',

      photoUrl:
        profile.photoUrl ||
        '',

      group:
        profile.group ||
        '',

      sex:
        profile.sex ||
        '',

      currentBlazon:
        profile.currentBlazon ||
        '',

      club:
        data.club?.name ||
        'EAH Diving',

      cardStatus:
        profile.cardStatus ||
        ''

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
      true
    );


    renderProfileHistory(
      state.profileHistory
    );


  } catch (
    error
  ) {

    console.error(
      'EAH FAST NFC:',
      error
    );


    renderProfileError(

      error.message ||
      'Impossible d’ouvrir le profil.'

    );

  }

}



/* ============================================================
   LOGIN PLONGEUR
   1 SEUL APPEL SUPABASE
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
      data.ok === false
    ) {

      throw new Error(
        data?.error ||
        'Connexion impossible.'
      );

    }


    const profile =
      data.profile ||
      {};


    state.profile = {

      eahId:
        profile.eahId,

      firstName:
        profile.firstName ||
        '',

      lastName:
        profile.lastName ||
        '',

      photoUrl:
        profile.photoUrl ||
        '',

      group:
        profile.group ||
        '',

      sex:
        profile.sex ||
        '',

      currentBlazon:
        profile.currentBlazon ||
        '',

      club:
        data.club?.name ||
        'EAH Diving',

      cardStatus:
        profile.cardStatus ||
        ''

    };


    state.profileHistory = {

      evaluations:
        data.evaluations ||
        [],

      blazons:
        data.blazons ||
        []

    };


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


    setMessage(
      'diverLoginMsg',
      ''
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
   MEMBERSHIP COACH RAPIDE
============================================================ */

async function eahFastCoachMembership(
  userId
) {

  const sb =
    requireSupabase();


  const membershipPromise =
    sb
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


  const slugPromise =
    CLUB_SLUG
    ?
    sb
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
      .maybeSingle()
    :
    Promise.resolve({
      data: null,
      error: null
    });


  const [
    membershipResult,
    slugResult
  ] =
    await Promise.all([
      membershipPromise,
      slugPromise
    ]);


  if (
    membershipResult.error
  ) {

    throw membershipResult.error;

  }


  const memberships =
    membershipResult.data ||
    [];


  if (!memberships.length) {

    throw new Error(
      'Ce compte n’est rattaché à aucun club actif.'
    );

  }


  let club =
    slugResult.data ||
    null;


  let membership =
    club
    ?
    memberships.find(
      item =>
        item.club_id ===
        club.id
    )
    :
    null;


  if (!membership) {

    membership =
      memberships[0];

  }


  if (
    !club ||
    club.id !==
      membership.club_id
  ) {

    const {
      data,
      error
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


    if (error) {

      throw error;

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



/* ============================================================
   LOGIN COACH

   AUTHENTIFICATION TERMINEE =
   ESPACE AFFICHE IMMEDIATEMENT.

   LES STATS CHARGENT ENSUITE EN PARALLELE.
============================================================ */

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


    /*
      ON AFFICHE TOUT DE SUITE.
    */

    showCoachPrivate();


    setMessage(
      'loginMsg',
      ''
    );


    showToast(
      'Connexion réussie.',
      'success'
    );


    /*
      DASHBOARD EN ARRIERE-PLAN.
      ON NE BLOQUE PLUS LE BOUTON.
    */

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



/* ============================================================
   RESTAURATION COACH RAPIDE

   getSession() =
   lecture locale lorsque la session existe.
============================================================ */

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
    data?.session?.user;


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


    /*
      NE PAS ATTENDRE.
    */

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



/* ============================================================
   DASHBOARD RAPIDE

   100 DERNIERES EVALUATIONS
   AU LIEU DE 2000.
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
    groupsRes
  ] =
    await Promise.all([

      sb
        .from(
          'divers'
        )
        .select(
          'id,eah_id,first_name,last_name,photo_url,group_id,group_name,current_blazon,active,created_at'
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
        )

    ]);


  if (
    diversRes.error
  ) {

    throw diversRes.error;

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

    progress:
      progressRes.data ||
      [],

    groups:
      state.groups

  });

}



/* ============================================================
   EVALUATION RAPIDE

   1 RPC SUPABASE.
   AUCUNE ATTENTE DU PDF.
   AUCUN RECALCUL BLAZON COTE NAVIGATEUR.
============================================================ */

async function submitEvaluation(
  event
) {

  event.preventDefault();


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
    height === null
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
        val(
          'waScore'
        ),

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
      data.ok === false
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


    /*
      LE DASHBOARD SE RAFRAICHIT
      SANS BLOQUER L'UTILISATEUR.
    */

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
   INITIALISATION V2

   POINT ESSENTIEL :
   LE SCAN NFC EST PRIORITAIRE.

   ON NE CHARGE PLUS :
   - actualités
   - tarifs
   - coach
   - branding
   AVANT LE PROFIL.
============================================================ */

/* ============================================================
   EAH DIVING PRO
   INIT FINAL - PRIORITE CARTES NFC
============================================================ */

async function init() {

  renderCriteria();
  renderDiveCodes();
  renderBlazons();
  renderPricing();

  initialRoute();


  const params =
    new URLSearchParams(
      window.location.search
    );


  const coachToken =
    String(
      params.get("coachToken") || ""
    ).trim();


  const diverId =
    String(
      params.get("id") || ""
    ).trim();


  const diverToken =
    String(
      params.get("token") || ""
    ).trim();


  /* ========================================================
     1. PRIORITE ABSOLUE CARTE COACH
  ======================================================== */

  if (coachToken) {

  /*
    coach-card.js prend entièrement
    en charge les cartes Coach.
  */

  return;
}


  /* ========================================================
     2. CARTE PLONGEUR
  ======================================================== */

  if (
    diverId &&
    diverToken
  ) {

    await loadPrivateProfileByCard(
      diverId,
      diverToken
    );

    return;
  }


  /* ========================================================
     3. SITE NORMAL
  ======================================================== */

  loadPublicData()
    .catch(
      console.warn
    );


  if (CLUB_SLUG) {

    loadClubBranding()
      .catch(
        console.warn
      );

  }


  const page =
    window.location.hash
      .replace("#", "");


  if (
    page === "club"
    ||
    page === "evaluation"
  ) {

    restoreCoachSession()
      .catch(
        console.warn
      );

  }

}



/* ============================================================
   OUVERTURE DIRECTE D'UNE CARTE COACH
============================================================ */

async function ouvrirCarteCoachDirectementEAH(
  coachToken
) {

  try {

    const sb =
      requireSupabase();


    const {
      data,
      error
    } =
      await sb.rpc(

        "eah_coach_card_workspace",

        {

          p_token:
            coachToken

        }

      );


    if (error) {

      throw error;

    }


    if (
      !data ||
      data.ok === false
    ) {

      throw new Error(

        data?.error
        ||
        "Carte Coach invalide."

      );

    }


    /* ======================================================
       CLUB
    ====================================================== */

    state.club =
      data.club;


    CLUB_SLUG =
      data.club.slug;


    try {

      localStorage.setItem(

        "EAH_CLUB",

        data.club.slug

      );

    } catch (_) {}


    try {

      applyClubBranding(
        data.club
      );

    } catch (_) {}


    showPage(
      "club"
    );


    const page =
      document.getElementById(
        "page-club"
      )

      ||

      document.querySelector(
        '[data-page="club"]'
      );


    if (!page) {

      throw new Error(
        "Page Espace Club introuvable."
      );

    }


    /* ======================================================
       CACHER ANCIEN LOGIN COACH
    ====================================================== */

    page
      .querySelectorAll(
        "form"
      )
      .forEach(
        function(form) {

          const text =
            String(
              form.textContent ||
              ""
            );


          if (
            text.includes(
              "Accéder à l'espace coach"
            )
            ||
            text.includes(
              "Mot de passe"
            )
          ) {

            form.style.display =
              "none";

          }

        }
      );


    let workspace =
      document.getElementById(
        "eahCoachDirectWorkspace"
      );


    if (!workspace) {

      workspace =
        document.createElement(
          "section"
        );


      workspace.id =
        "eahCoachDirectWorkspace";


      workspace.className =
        "section";


      page.prepend(
        workspace
      );

    }


    /* ======================================================
       PREMIER SCAN
       CARTE NON ATTRIBUEE
    ====================================================== */

    if (
      data.assigned === false
    ) {

      const slot =
        data.card?.slot ||
        "—";


      workspace.innerHTML = `

        <div class="container">

          <div class="dashboard-card">

            <span class="overline">
              CARTE COACH EAH
            </span>


            <h1>
              Activer la carte Coach n°${esc(slot)}
            </h1>


            <p class="muted">

              ${esc(
                data.club?.name ||
                ""
              )}

            </p>


            <div class="notice">

              Cette carte n'est pas encore attribuée.

              <br>

              Renseigne ton profil une seule fois.

            </div>


            <form
              id="activateCoachCardForm"
              style="margin-top:25px"
            >

              <label>

                Nom et prénom

                <input
                  id="activateCoachName"
                  type="text"
                  placeholder="Ex : Emeric Goin"
                  required
                >

              </label>


              <label>

                Adresse e-mail

                <input
                  id="activateCoachEmail"
                  type="email"
                  placeholder="coach@email.fr"
                  required
                >

              </label>


              <button
                id="activateCoachCardButton"
                type="submit"
                class="primary-button"
              >
                Activer mon espace Coach
              </button>


              <div
                id="activateCoachCardMessage"
                style="margin-top:15px"
              ></div>

            </form>

          </div>

        </div>

      `;


      document
        .getElementById(
          "activateCoachCardForm"
        )
        ?.addEventListener(

          "submit",

          async function(event) {

            event.preventDefault();


            const name =
              document
                .getElementById(
                  "activateCoachName"
                )
                ?.value
                ?.trim()
              ||
              "";


            const email =
              document
                .getElementById(
                  "activateCoachEmail"
                )
                ?.value
                ?.trim()
                .toLowerCase()
              ||
              "";


            const button =
              document.getElementById(
                "activateCoachCardButton"
              );


            if (
              !name ||
              !email
            ) {

              setMessage(

                "activateCoachCardMessage",

                `
                  <div class="notice error">
                    Nom et e-mail obligatoires.
                  </div>
                `

              );


              return;

            }


            setLoadingButton(

              button,

              true,

              "Activation…",

              "Activer mon espace Coach"

            );


            try {

              const {
                data: activation,
                error: activationError
              } =
                await sb.rpc(

                  "eah_activate_coach_card",

                  {

                    p_token:
                      coachToken,

                    p_name:
                      name,

                    p_email:
                      email

                  }

                );


              if (
                activationError
              ) {

                throw activationError;

              }


              if (
                !activation ||
                activation.ok === false
              ) {

                throw new Error(

                  activation?.error
                  ||
                  "Activation impossible."

                );

              }


              setMessage(

                "activateCoachCardMessage",

                `
                  <div class="notice success">

                    <strong>
                      Carte Coach activée.
                    </strong>

                    <br>

                    Bienvenue ${esc(name)}.

                  </div>
                `

              );


              /*
                OUVRIR IMMEDIATEMENT
                L'ESPACE COACH
              */

              await ouvrirCarteCoachDirectementEAH(
                coachToken
              );


            } catch(error) {

              setMessage(

                "activateCoachCardMessage",

                `
                  <div class="notice error">

                    ${esc(
                      error.message ||
                      "Activation impossible."
                    )}

                  </div>
                `

              );


            } finally {

              setLoadingButton(

                button,

                false,

                "",

                "Activer mon espace Coach"

              );

            }

          }

        );


      return;

    }


    /* ======================================================
       CARTE DEJA ATTRIBUEE
    ====================================================== */

    state.coach =
      data.coach;


    state.coachCardToken =
      coachToken;


    state.divers =
      (
        data.divers ||
        []
      )
      .map(
        function(diver) {

          return {

            id:
              diver.id,

            eah_id:
              diver.eahId,

            first_name:
              diver.firstName,

            last_name:
              diver.lastName,

            photo_url:
              diver.photoUrl,

            group_name:
              diver.group,

            current_blazon:
              diver.currentBlazon,

            active:
              true

          };

        }
      );


    state.coachAvailableCards =
      data.availableCards ||
      [];


    state.coachGradingRequests =
      data.gradingRequests ||
      [];


    const requests =
      data.gradingRequests ||
      [];


    const coachName =
      data.coach?.name ||
      "Coach";


    workspace.innerHTML = `

      <div class="container">

        <div class="dashboard-card">

          <span class="overline">
            ESPACE COACH EAH
          </span>


          <h1>
            Bienvenue ${esc(coachName)}
          </h1>


          <p class="muted">

            ${esc(
              data.club?.name ||
              ""
            )}

            ${
              data.coach?.role
              ?
              " • "
              +
              esc(
                data.coach.role
              )
              :
              ""
            }

          </p>

        </div>


        <div
          class="dashboard-grid"
          style="margin-top:20px"
        >

          <article class="dashboard-card">

            <span class="overline">
              PLONGEURS
            </span>

            <strong
              style="font-size:2rem"
            >
              ${state.divers.length}
            </strong>

          </article>


          <article class="dashboard-card">

            <span class="overline">
              CARTES PLONGEUR DISPONIBLES
            </span>

            <strong
              style="font-size:2rem"
            >
              ${
                (
                  data.availableCards ||
                  []
                ).length
              }
            </strong>

          </article>


          <article class="dashboard-card">

            <span class="overline">
              DEMANDES DE GRADING
            </span>

            <strong
              style="font-size:2rem"
            >

              ${
                requests.filter(
                  function(request) {

                    return (
                      String(
                        request.status ||
                        ""
                      )
                      .toUpperCase()
                      ===
                      "PENDING"
                    );

                  }
                ).length
              }

            </strong>

          </article>

        </div>


        <div
          class="dashboard-card"
          style="margin-top:20px"
        >

          <span class="overline">
            GRADING
          </span>

          <h2>
            Demandes reçues
          </h2>


          ${
            requests.length
            ?
            requests.map(
              function(request) {

                return `

                  <article
                    class="dashboard-card"
                    style="margin-top:14px"
                  >

                    <span class="overline">

                      ${esc(
                        request.requestCode ||
                        ""
                      )}

                    </span>


                    <h3>

                      ${esc(
                        (
                          request.firstName ||
                          ""
                        )
                        +
                        " "
                        +
                        (
                          request.lastName ||
                          ""
                        )
                      )}

                    </h3>


                    <p>

                      ${esc(
                        request.diveCode ||
                        ""
                      )}

                      ${
                        request.height
                        ?
                        " • "
                        +
                        esc(
                          request.height
                        )
                        +
                        " m"
                        :
                        ""
                      }

                    </p>


                    ${
                      request.message
                      ?
                      `

                        <p class="muted">
                          ${esc(
                            request.message
                          )}
                        </p>

                      `
                      :
                      ""
                    }


                    ${
                      request.videoUrl
                      ?
                      `

                        <a
                          href="${esc(
                            request.videoUrl
                          )}"
                          target="_blank"
                          rel="noopener"
                          class="primary-button"
                        >
                          Voir la vidéo
                        </a>

                      `
                      :
                      ""
                    }

                  </article>

                `;

              }
            )
            .join("")

            :

            `

              <div class="notice">
                Aucune demande de grading.
              </div>

            `
          }

        </div>

      </div>

    `;


    try {

      renderDiversSelect();

    } catch (_) {}


  } catch(error) {

    console.error(
      "COACH CARD",
      error
    );


    showToast(

      error.message ||
      "Impossible d'ouvrir la carte Coach.",

      "error"

    );

  }

}/* ============================================================
   EAH DIVING PRO
   CORRECTION FINALE
   POPULATION + DEMANDE PUBLIQUE
   04/10/2026

   SUPABASE EXISTANT :
   - eah_fast_population(p_code, p_club_slug)
   - submit_public_grading_request(p_payload)
============================================================ */


/* ============================================================
   NORMALISATION REPONSE POPULATION
============================================================ */

function eahNormalizePopulationResult(
  data
) {

  let result =
    Array.isArray(
      data
    )
    ?
    data[0]
    :
    data;


  if (
    !result
    ||
    typeof result !==
      'object'
  ) {

    return {

      people:
        0,

      count:
        0,

      avg_eah:
        null,

      avg_wa:
        null

    };

  }


  /*
    Certaines versions RPC
    peuvent encapsuler les statistiques.
  */

  if (
    result.stats
    &&
    typeof result.stats ===
      'object'
  ) {

    result =
      result.stats;

  }


  if (
    result.population
    &&
    typeof result.population ===
      'object'
  ) {

    result =
      result.population;

  }


  if (
    result.result
    &&
    typeof result.result ===
      'object'
  ) {

    result =
      result.result;

  }


  if (
    result.data
    &&
    typeof result.data ===
      'object'
    &&
    !Array.isArray(
      result.data
    )
  ) {

    result =
      result.data;

  }


  return {

    people:

      result.people

      ??

      result.global_people

      ??

      result.divers

      ??

      result.diver_count

      ??

      result.diverCount

      ??

      result.people_count

      ??

      result.peopleCount

      ??

      result.total_divers

      ??

      result.totalDivers

      ??

      0,


    count:

      result.count

      ??

      result.global_count

      ??

      result.gradings

      ??

      result.evaluations

      ??

      result.evaluation_count

      ??

      result.evaluationCount

      ??

      result.total_gradings

      ??

      result.totalGradings

      ??

      0,


    avg_eah:

      result.avg_eah

      ??

      result.avgEah

      ??

      result.global_avg_eah

      ??

      result.eah_average

      ??

      result.eahAverage

      ??

      result.average_eah

      ??

      null,


    avg_wa:

      result.avg_wa

      ??

      result.avgWa

      ??

      result.global_avg_wa

      ??

      result.wa_average

      ??

      result.waAverage

      ??

      result.average_wa

      ??

      null

  };

}



/* ============================================================
   POPULATION
   UTILISE LA FONCTION SUPABASE DEJA EXISTANTE :

   eah_fast_population(
     p_code text,
     p_club_slug text
   )
============================================================ */

async function loadPopulation() {

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

    const sb =
      requireSupabase();


    /*
      IMPORTANT :

      Ancien script :
      get_population_stats
      p_dive_code

      Fonction réellement présente :
      eah_fast_population
      p_code
    */

    const {
      data,
      error
    } =
      await sb.rpc(

        'eah_fast_population',

        {

          p_code:
            code ||
            null,

          p_club_slug:
            CLUB_SLUG ||
            null

        }

      );


    if (
      error
    ) {

      throw error;

    }


    /*
      Certaines RPC retournent :
      {
        ok: false,
        error: "..."
      }
    */

    if (
      data
      &&
      typeof data ===
        'object'
      &&
      data.ok ===
        false
    ) {

      throw new Error(

        data.error
        ||
        'Recherche Population impossible.'

      );

    }


    const result =
      eahNormalizePopulationResult(
        data
      );


    renderPopulationStats(

      box,

      result

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
          error?.message
          ||
          'Impossible de charger les statistiques Population.'
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
   DEMANDE PUBLIQUE DE GRADING

   SUPABASE EXISTANT :

   submit_public_grading_request(
     p_payload jsonb
   )
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


  const discipline =
    val(
      'publicDiscipline'
    )
    .trim();


  const diveCode =
    normalizeCode(
      val(
        'publicDive'
      )
    );


  const height =
    asNumber(
      val(
        'publicHeight'
      )
    );


  const heightType =
    val(
      'publicHeightType'
    )
    ||
    'KNOWN';


  const videoUrl =
    val(
      'publicVideo'
    )
    .trim();


  const message =
    val(
      'publicMessage'
    )
    .trim();


  /* ==========================================================
     VERIFICATIONS
  ========================================================== */

  if (
    !firstName
    ||
    !lastName
  ) {

    setMessage(

      'publicFormMessage',

      `
        <div class="notice error">
          Prénom et nom obligatoires.
        </div>
      `

    );


    return;

  }


  if (
    !email
  ) {

    setMessage(

      'publicFormMessage',

      `
        <div class="notice error">
          Adresse e-mail obligatoire.
        </div>
      `

    );


    return;

  }


  if (
    !videoUrl
  ) {

    setMessage(

      'publicFormMessage',

      `
        <div class="notice error">
          Le lien de la vidéo est obligatoire.
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


  setMessage(

    'publicFormMessage',

    `
      <div class="notice">
        Envoi de la demande…
      </div>
    `

  );


  try {

    const sb =
      requireSupabase();


    /* ========================================================
       PAYLOAD COMPATIBLE ANCIENNE + NOUVELLE VERSION

       On envoie les deux écritures :
       first_name + firstName
       dive_code + diveCode
       etc.

       Ainsi ton ancienne fonction Supabase peut continuer
       à fonctionner quelle que soit la version utilisée.
    ======================================================== */

    const payload = {

      /* CLUB */

      club_slug:
        CLUB_SLUG ||
        null,

      clubSlug:
        CLUB_SLUG ||
        null,


      /* IDENTITE */

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


      /* DISCIPLINE */

      discipline:
        discipline,


      /* PLONGEON */

      dive_code:
        diveCode,

      diveCode:
        diveCode,


      /* HAUTEUR */

      height:
        height,


      height_type:
        heightType,

      heightType:
        heightType,


      /* VIDEO */

      video_url:
        videoUrl,

      videoUrl:
        videoUrl,


      /* MESSAGE */

      message:
        message,


      /* SOURCE */

      source:
        'PUBLIC',

      status:
        'PENDING'

    };


    /*
      IMPORTANT :

      Ton ancienne fonction Supabase attend :

      p_payload

      et NON :

      p_request
    */

    const {
      data,
      error
    } =
      await sb.rpc(

        'submit_public_grading_request',

        {

          p_payload:
            payload

        }

      );


    if (
      error
    ) {

      throw error;

    }


    if (
      data
      &&
      typeof data ===
        'object'
      &&
      data.ok ===
        false
    ) {

      throw new Error(

        data.error
        ||
        'La demande n’a pas pu être enregistrée.'

      );

    }


    /*
      Récupération éventuelle
      du numéro de demande.
    */

    const requestCode =

      data?.request_code

      ??

      data?.requestCode

      ??

      data?.code

      ??

      '';


    setMessage(

      'publicFormMessage',

      `
        <div class="notice success">

          <strong>
            Demande enregistrée.
          </strong>

          ${
            requestCode
            ?
            `

              <br><br>

              Référence :
              <strong>
                ${esc(requestCode)}
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


    showToast(

      'Demande de grading envoyée.',

      'success'

    );


  } catch (
    error
  ) {

    console.error(
      'EAH PUBLIC GRADING:',
      error
    );


    const message =
      String(
        error?.message
        ||
        'Envoi impossible.'
      );


    setMessage(

      'publicFormMessage',

      `
        <div class="notice error">

          ${esc(message)}

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

}/* ============================================================
   EAH DIVING
   POPULATION DETAILLEE
   04/10/2026

   - statistiques
   - moyenne EAH
   - moyenne WA
   - fenêtre plongeurs
   - fenêtre gradings
   - profil cliquable
   - vidéo publique cliquable
============================================================ */


/* ============================================================
   URL HTTP SECURISEE
============================================================ */

function eahPopulationSafeUrl(
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



/* ============================================================
   LIEN PROFIL PUBLIC EAH
============================================================ */

function eahPopulationProfileUrl(
  item
) {

  if (
    !item
    ||
    !item.eah_id
  ) {

    return '';

  }


  const url =
    new URL(
      window.location.href
    );


  /*
    On enlève les anciens paramètres sensibles
    éventuels.
  */

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



/* ============================================================
   DATE POPULATION
============================================================ */

function eahPopulationDate(
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



/* ============================================================
   NORMALISER RESULTAT
============================================================ */

function eahPopulationNormalize(
  data
) {

  let result =
    Array.isArray(
      data
    )
    ?
    data[0]
    :
    data;


  if (
    !result
    ||
    typeof result !==
      'object'
  ) {

    result = {};

  }


  return {

    people:

      Number(
        result.people
        ??
        0
      ),


    public_people:

      Number(
        result.public_people
        ??
        0
      ),


    count:

      Number(
        result.count
        ??
        0
      ),


    avg_eah:

      result.avg_eah
      ??
      null,


    avg_wa:

      result.avg_wa
      ??
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



/* ============================================================
   OUVRIR LES PLONGEURS
============================================================ */

function eahOpenPopulationDivers(
  result
) {

  const divers =
    result.divers ||
    [];


  let html = `

    <div class="modal-inner">

      <span class="overline">
        POPULATION EAH
      </span>

      <h2>
        Plongeurs EAH
      </h2>

      <p class="muted">

        ${esc(
          result.people
        )}
        plongeur(s) concerné(s).

      </p>

  `;


  if (
    result.people >
    divers.length
  ) {

    html += `

      <div class="notice">

        Certains profils sont privés.

        Seuls les profils publics
        sont affichés ci-dessous.

      </div>

    `;

  }


  if (
    !divers.length
  ) {

    html += `

      <div class="notice">

        Aucun profil public disponible
        pour cette recherche.

      </div>

    `;

  }


  divers.forEach(
    diver => {

      const name =

        String(
          diver.display_name
          ||
          ''
        )
        .trim()

        ||

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


      const profileUrl =
        eahPopulationProfileUrl(
          diver
        );


      const videoUrl =
        eahPopulationSafeUrl(
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
                diver.grading_count
                ??
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
              profileUrl
              ?
              `

                <a
                  class="button small"
                  href="${esc(profileUrl)}"
                >
                  Voir le profil
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
                  Voir la vidéo
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
    </div>
  `;


  openModal(
    html
  );

}



/* ============================================================
   OUVRIR LES GRADINGS
============================================================ */

function eahOpenPopulationGradings(
  result
) {

  const gradings =
    result.gradings ||
    [];


  let html = `

    <div class="modal-inner">

      <span class="overline">
        POPULATION EAH
      </span>

      <h2>
        Gradings
      </h2>

      <p class="muted">

        ${esc(
          result.count
        )}
        grading(s) au total.

      </p>

  `;


  if (
    result.count >
    gradings.length
  ) {

    html += `

      <div class="notice">

        Les gradings associés à des profils privés
        ne sont pas affichés nominativement.

      </div>

    `;

  }


  if (
    !gradings.length
  ) {

    html += `

      <div class="notice">

        Aucun grading public disponible
        pour cette recherche.

      </div>

    `;

  }


  gradings.forEach(
    grading => {

      const name =

        String(
          grading.display_name
          ||
          ''
        )
        .trim()

        ||

        grading.eah_id

        ||

        'Plongeur EAH';


      const profileUrl =
        eahPopulationProfileUrl(
          grading
        );


      const videoUrl =
        eahPopulationSafeUrl(
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
                grading.dive_code
                ||
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
                eahPopulationDate(
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
                profileUrl
                ?
                `

                  <a
                    class="button small"
                    href="${esc(profileUrl)}"
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
    </div>
  `;


  openModal(
    html
  );

}



/* ============================================================
   RENDU STATISTIQUES POPULATION
============================================================ */

function renderPopulationStats(
  box,
  result
) {

  result =
    eahPopulationNormalize(
      result
    );


  box.innerHTML = `

    <div class="population-stats">


      <!-- PLONGEURS -->

      <div
        class="stat-card eah-population-clickable"
        data-population-action="divers"
        role="button"
        tabindex="0"
      >

        <strong>
          ${esc(
            result.people
          )}
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
          Cliquer pour voir
        </small>

      </div>



      <!-- GRADINGS -->

      <div
        class="stat-card eah-population-clickable"
        data-population-action="gradings"
        role="button"
        tabindex="0"
      >

        <strong>
          ${esc(
            result.count
          )}
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
          Cliquer pour voir
        </small>

      </div>



      <!-- MOYENNE EAH -->

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



      <!-- MOYENNE WA -->

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

  `;


  /*
    CLIC PLONGEURS
  */

  box
    .querySelector(
      '[data-population-action="divers"]'
    )
    ?.addEventListener(

      'click',

      () => {

        eahOpenPopulationDivers(
          result
        );

      }

    );


  /*
    CLIC GRADINGS
  */

  box
    .querySelector(
      '[data-population-action="gradings"]'
    )
    ?.addEventListener(

      'click',

      () => {

        eahOpenPopulationGradings(
          result
        );

      }

    );


  /*
    CLAVIER
  */

  box
    .querySelectorAll(
      '.eah-population-clickable'
    )
    .forEach(
      card => {

        card.addEventListener(

          'keydown',

          event => {

            if (
              event.key !==
                'Enter'
              &&
              event.key !==
                ' '
            ) {

              return;

            }


            event.preventDefault();


            card.click();

          }

        );

      }
    );

}



/* ============================================================
   CHARGEMENT POPULATION DETAILLEE
============================================================ */

async function loadPopulation() {

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

    const sb =
      requireSupabase();


    const {
      data,
      error
    } =
      await sb.rpc(

        'eah_population_details',

        {

          p_code:
            code ||
            null,

          p_club_slug:
            CLUB_SLUG ||
            null

        }

      );


    if (
      error
    ) {

      throw error;

    }


    const result =
      eahPopulationNormalize(
        data
      );


    renderPopulationStats(

      box,

      result

    );


  } catch (
    error
  ) {

    console.error(
      'EAH POPULATION DETAIL:',
      error
    );


    box.innerHTML = `

      <div class="notice error">

        ${esc(
          error?.message
          ||
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



/* ============================================================
   STYLE POPULATION CLIQUABLE
============================================================ */

(function eahInstallPopulationStyle() {

  if (
    document.getElementById(
      'eah-population-detail-css'
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      'style'
    );


  style.id =
    'eah-population-detail-css';


  style.textContent = `

    .eah-population-clickable {

      cursor:
        pointer;

      transition:
        transform .2s ease,
        border-color .2s ease,
        box-shadow .2s ease;

    }


    .eah-population-clickable:hover {

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


    .eah-population-clickable:focus {

      outline:
        2px solid
        #30cfff;

      outline-offset:
        4px;

    }

  `;


  document.head
    .appendChild(
      style
    );

})(); /* ============================================================
   EAH DIVING PRO
   POPULATION V3

   - recherche indépendante Nom / Prénom
   - noms visibles même profil privé
   - profil ouvrable uniquement si PUBLIC_NAME = true
   - fiche publique sécurisée
   - aucun token NFC exposé
============================================================ */


/* ============================================================
   CSS POPULATION
============================================================ */

function installPopulationV3CSS() {

  if (
    document.getElementById(
      "eahPopulationV3Css"
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "eahPopulationV3Css";


  style.textContent = `

    #eahPopulationPeopleSearch {

      margin-top: 28px;

      padding: 26px;

      border:
        1px solid
        rgba(143,205,255,.22);

      border-radius: 24px;

      background:
        rgba(4,24,43,.82);

      backdrop-filter:
        blur(14px);

    }


    #eahPopulationPeopleSearch h2 {

      margin:
        0 0 8px;

      color: white;

    }


    #eahPopulationPeopleSearch p {

      margin:
        0 0 18px;

      color: #8fa8bc;

    }


    .eah-population-name-search-row {

      display: grid;

      grid-template-columns:
        minmax(0,1fr)
        auto;

      gap: 14px;

    }


    .eah-population-name-search-row input {

      width: 100%;

      min-height: 58px;

      box-sizing: border-box;

      padding:
        0 18px;

      border:
        1px solid
        rgba(143,205,255,.22);

      border-radius: 15px;

      background:
        rgba(13,41,63,.9);

      color: white;

      font-size: 16px;

    }


    .eah-population-name-search-row button {

      min-width: 150px;

      min-height: 58px;

      padding:
        0 24px;

      border: 0;

      border-radius: 15px;

      background:
        linear-gradient(
          135deg,
          #0b6bff,
          #168dff
        );

      color: white;

      font-weight: 900;

      cursor: pointer;

    }


    #eahPopulationPeopleResults {

      display: grid;

      gap: 12px;

      margin-top: 20px;

    }


    .eah-population-person {

      display: grid;

      grid-template-columns:
        minmax(0,1fr)
        auto;

      align-items: center;

      gap: 16px;

      padding: 18px;

      border:
        1px solid
        rgba(143,205,255,.18);

      border-radius: 17px;

      background:
        rgba(5,23,42,.72);

    }


    .eah-population-person-name {

      font-size: 17px;

      font-weight: 900;

      color: white;

    }


    .eah-population-person-meta {

      margin-top: 6px;

      color: #8fa8bc;

      font-size: 13px;

    }


    .eah-population-public-button {

      min-height: 44px;

      padding:
        0 17px;

      border: 0;

      border-radius: 12px;

      background: #0b6bff;

      color: white;

      font-weight: 900;

      cursor: pointer;

    }


    .eah-population-private-badge {

      display: inline-flex;

      min-height: 42px;

      align-items: center;

      justify-content: center;

      padding:
        0 15px;

      border:
        1px solid
        rgba(143,205,255,.18);

      border-radius: 12px;

      background:
        rgba(255,255,255,.05);

      color: #8fa8bc;

      font-size: 13px;

      font-weight: 800;

    }


    #eahPopulationModal {

      position: fixed;

      inset: 0;

      z-index: 2147483600;

      overflow-y: auto;

      padding: 16px;

      background:
        rgba(1,9,18,.95);

    }


    .eah-population-modal-panel {

      width:
        min(
          850px,
          100%
        );

      box-sizing: border-box;

      margin:
        20px auto 80px;

      padding: 26px;

      border:
        1px solid
        rgba(143,205,255,.22);

      border-radius: 26px;

      background:
        #061e33;

      color: white;

    }


    .eah-population-modal-top {

      display: flex;

      justify-content:
        space-between;

      align-items:
        flex-start;

      gap: 20px;

    }


    .eah-population-modal-close {

      width: 46px;

      height: 46px;

      flex:
        0 0 46px;

      border: 0;

      border-radius: 50%;

      background: white;

      color: #03131f;

      font-size: 25px;

      cursor: pointer;

    }


    .eah-population-profile-header {

      display: grid;

      grid-template-columns:
        95px
        minmax(0,1fr);

      gap: 18px;

      align-items: center;

      margin-top: 20px;

    }


    .eah-population-profile-photo {

      width: 95px;

      height: 95px;

      object-fit: cover;

      border-radius: 50%;

      background:
        #10273a;

    }


    .eah-population-profile-placeholder {

      width: 95px;

      height: 95px;

      display: grid;

      place-items: center;

      border-radius: 50%;

      background:
        #10273a;

      color: #30cfff;

      font-size: 30px;

      font-weight: 900;

    }


    .eah-population-profile-section {

      margin-top: 24px;

      padding: 20px;

      border:
        1px solid
        rgba(143,205,255,.16);

      border-radius: 18px;

      background:
        rgba(5,23,42,.65);

    }


    .eah-population-grading {

      padding:
        14px 0;

      border-bottom:
        1px solid
        rgba(143,205,255,.12);

    }


    .eah-population-grading:last-child {

      border-bottom: 0;

    }


    @media(max-width:650px) {

      .eah-population-name-search-row {

        grid-template-columns: 1fr;

      }


      .eah-population-name-search-row button {

        width: 100%;

      }


      .eah-population-person {

        grid-template-columns: 1fr;

      }


      .eah-population-public-button,
      .eah-population-private-badge {

        width: 100%;

      }


      .eah-population-modal-panel {

        padding:
          20px 14px;

      }

    }

  `;


  document.head.appendChild(
    style
  );

}



/* ============================================================
   ECHAPPER HTML
============================================================ */

function escapePopulationHTML(
  value
) {

  return String(
    value ?? ""
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
   TROUVER LA PAGE POPULATION
============================================================ */

function getPopulationPageV3() {

  return document.getElementById(
    "population"
  );

}



/* ============================================================
   INSTALLER LA RECHERCHE NOM / PRENOM
============================================================ */

function installPopulationPeopleSearchV3() {

  installPopulationV3CSS();


  const page =
    getPopulationPageV3();


  if (!page) {

    return;

  }


  if (
    document.getElementById(
      "eahPopulationPeopleSearch"
    )
  ) {

    return;

  }


  const box =
    document.createElement(
      "section"
    );


  box.id =
    "eahPopulationPeopleSearch";


  box.innerHTML = `

    <h2>
      Rechercher un plongeur EAH
    </h2>

    <p>
      Recherche indépendante par nom ou prénom.
    </p>


    <div
      class="eah-population-name-search-row"
    >

      <input
        id="eahPopulationNameInput"
        type="search"
        autocomplete="off"
        placeholder="Nom ou prénom..."
      >


      <button
        id="eahPopulationNameButton"
        type="button"
      >
        Rechercher
      </button>

    </div>


    <div
      id="eahPopulationPeopleResults"
    ></div>

  `;


  /*
    On cherche le formulaire existant
    de recherche du code 5152B.
  */

  const codeInput =
    Array.from(
      page.querySelectorAll(
        "input"
      )
    )
    .find(
      input =>

        String(
          input.placeholder || ""
        )
        .toUpperCase()
        .includes(
          "5152B"
        )

    );


  let target =
    null;


  if (codeInput) {

    target =
      codeInput.closest(
        "form, .card, .panel, .glass, .search-box, section, div"
      );

  }


  if (
    target &&
    target.parentElement
  ) {

    target.insertAdjacentElement(
      "afterend",
      box
    );

  } else {

    page.appendChild(
      box
    );

  }


  document
    .getElementById(
      "eahPopulationNameButton"
    )
    ?.addEventListener(
      "click",
      searchPopulationPeopleV3
    );


  document
    .getElementById(
      "eahPopulationNameInput"
    )
    ?.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();

          searchPopulationPeopleV3();

        }

      }
    );

}



/* ============================================================
   RECHERCHER NOM / PRENOM
============================================================ */

async function searchPopulationPeopleV3() {

  const input =
    document.getElementById(
      "eahPopulationNameInput"
    );


  const resultBox =
    document.getElementById(
      "eahPopulationPeopleResults"
    );


  if (
    !input ||
    !resultBox
  ) {

    return;

  }


  const search =
    input.value
      .trim();


  if (
    search.length < 2
  ) {

    resultBox.innerHTML = `

      <div
        style="
          padding:14px;
          color:#8fa8bc;
        "
      >
        Entre au moins 2 caractères.
      </div>

    `;


    return;

  }


  resultBox.innerHTML = `

    <div
      style="
        padding:16px;
        color:#8fa8bc;
      "
    >
      Recherche…
    </div>

  `;


  try {

    const {
      data,
      error
    } =
      await requireSupabase()
        .rpc(

          "eah_population_people_search",

          {

            p_search:
              search,

            p_limit:
              50,

            p_offset:
              0

          }

        );


    if (error) {

      throw error;

    }


    const items =
      Array.isArray(
        data?.items
      )
      ?
      data.items
      :
      [];


    if (
      !items.length
    ) {

      resultBox.innerHTML = `

        <div
          style="
            padding:16px;
            color:#8fa8bc;
          "
        >
          Aucun plongeur trouvé.
        </div>

      `;


      return;

    }


    resultBox.innerHTML =
      items.map(
        function(item) {

          const fullName =
            item.display_name
            ||
            (
              (
                item.first_name
                ||
                ""
              )
              +
              " "
              +
              (
                item.last_name
                ||
                ""
              )
            )
            .trim()
            ||
            item.eah_id;


          const publicButton =
            item.profile_public
            ?
            `

              <button
                type="button"
                class="eah-population-public-button"
                data-population-profile-club="${escapePopulationHTML(
                  item.club_slug
                )}"
                data-population-profile-id="${escapePopulationHTML(
                  item.eah_id
                )}"
              >
                Voir le profil
              </button>

            `
            :
            `

              <span
                class="eah-population-private-badge"
              >
                Profil privé
              </span>

            `;


          return `

            <article
              class="eah-population-person"
            >

              <div>

                <div
                  class="eah-population-person-name"
                >
                  ${escapePopulationHTML(
                    fullName
                  )}
                </div>


                <div
                  class="eah-population-person-meta"
                >

                  ${escapePopulationHTML(
                    item.club_name
                    ||
                    ""
                  )}

                  ${
                    item.current_blazon
                    ?
                    " • "
                    +
                    escapePopulationHTML(
                      item.current_blazon
                    )
                    :
                    ""
                  }

                  ${
                    typeof item.grading_count
                    !==
                    "undefined"
                    ?
                    " • "
                    +
                    escapePopulationHTML(
                      item.grading_count
                    )
                    +
                    " grading(s)"
                    :
                    ""
                  }

                </div>

              </div>


              <div>

                ${publicButton}

              </div>

            </article>

          `;

        }
      )
      .join(
        ""
      );


    resultBox
      .querySelectorAll(
        "[data-population-profile-id]"
      )
      .forEach(
        button => {

          button.addEventListener(

            "click",

            () => {

              openPopulationPublicProfileV3(

                button.dataset
                  .populationProfileClub,

                button.dataset
                  .populationProfileId

              );

            }

          );

        }
      );


  } catch(error) {

    resultBox.innerHTML = `

      <div
        style="
          padding:16px;
          border-radius:14px;
          background:rgba(224,82,94,.15);
          color:white;
        "
      >
        ${escapePopulationHTML(
          error.message
          ||
          "Erreur de recherche."
        )}
      </div>

    `;

  }

}



/* ============================================================
   OUVRIR PROFIL PUBLIC
============================================================ */

async function openPopulationPublicProfileV3(
  clubSlug,
  eahId
) {

  document
    .getElementById(
      "eahPopulationModal"
    )
    ?.remove();


  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "eahPopulationModal";


  modal.innerHTML = `

    <div
      class="eah-population-modal-panel"
    >

      <div
        class="eah-population-modal-top"
      >

        <div>

          <span
            style="
              color:#30cfff;
              font-weight:900;
            "
          >
            EAH DIVING
          </span>

          <h2>
            Profil public
          </h2>

        </div>


        <button
          type="button"
          class="eah-population-modal-close"
        >
          ×
        </button>

      </div>


      <div
        id="eahPopulationModalContent"
        style="
          padding:30px 0;
          color:#8fa8bc;
        "
      >
        Chargement…
      </div>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  modal
    .querySelector(
      ".eah-population-modal-close"
    )
    .onclick =
      () =>
        modal.remove();


  modal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        modal
      ) {

        modal.remove();

      }

    }
  );


  const content =
    document.getElementById(
      "eahPopulationModalContent"
    );


  try {

    const {
      data,
      error
    } =
      await requireSupabase()
        .rpc(

          "eah_population_public_profile",

          {

            p_club_slug:
              clubSlug,

            p_eah_id:
              eahId

          }

        );


    if (error) {

      throw error;

    }


    if (
      !data ||
      data.ok !== true
    ) {

      if (
        data?.private
      ) {

        content.innerHTML = `

          <div
            style="
              padding:20px;
              border-radius:16px;
              background:rgba(255,255,255,.05);
              color:#c3d8e8;
            "
          >
            Ce profil est privé.
          </div>

        `;

        return;

      }


      throw new Error(
        "Profil introuvable."
      );

    }


    const profile =
      data.profile
      ||
      {};


    const evaluations =
      Array.isArray(
        data.evaluations
      )
      ?
      data.evaluations
      :
      [];


    const blazons =
      Array.isArray(
        data.blazons
      )
      ?
      data.blazons
      :
      [];


    const fullName =
      profile.display_name
      ||
      (
        (
          profile.first_name
          ||
          ""
        )
        +
        " "
        +
        (
          profile.last_name
          ||
          ""
        )
      )
      .trim()
      ||
      profile.eah_id;


    const photo =
      profile.photo_url
      ?
      `

        <img
          class="eah-population-profile-photo"
          src="${escapePopulationHTML(
            profile.photo_url
          )}"
          alt=""
        >

      `
      :
      `

        <div
          class="eah-population-profile-placeholder"
        >
          EAH
        </div>

      `;


    content.innerHTML = `

      <div
        class="eah-population-profile-header"
      >

        ${photo}


        <div>

          <h2
            style="
              margin:0 0 7px;
              color:white;
            "
          >
            ${escapePopulationHTML(
              fullName
            )}
          </h2>


          <div
            style="
              color:#8fa8bc;
            "
          >

            ${escapePopulationHTML(
              profile.eah_id
              ||
              ""
            )}

            ${
              profile.club_name
              ?
              " • "
              +
              escapePopulationHTML(
                profile.club_name
              )
              :
              ""
            }

          </div>


          ${
            profile.current_blazon
            ?
            `

              <div
                style="
                  margin-top:9px;
                  color:#30cfff;
                  font-weight:900;
                "
              >
                ${escapePopulationHTML(
                  profile.current_blazon
                )}
              </div>

            `
            :
            ""
          }

        </div>

      </div>


      <section
        class="eah-population-profile-section"
      >

        <h3>
          Progression
        </h3>


        ${
          blazons.length
          ?
          blazons.map(
            item => `

              <div
                style="
                  padding:10px 0;
                  border-bottom:
                    1px solid
                    rgba(143,205,255,.10);
                "
              >

                <strong>
                  ${escapePopulationHTML(
                    item.name
                    ||
                    item.key
                  )}
                </strong>

                <span
                  style="
                    color:#8fa8bc;
                  "
                >
                  •
                  ${escapePopulationHTML(
                    item.progress
                    ??
                    0
                  )}%
                </span>

              </div>

            `
          )
          .join(
            ""
          )
          :
          `

            <div
              style="
                color:#8fa8bc;
              "
            >
              Aucune progression enregistrée.
            </div>

          `
        }

      </section>


      <section
        class="eah-population-profile-section"
      >

        <h3>
          Historique des gradings
        </h3>


        ${
          evaluations.length
          ?
          evaluations.map(
            evaluation => `

              <div
                class="eah-population-grading"
              >

                <strong>
                  ${escapePopulationHTML(
                    evaluation.dive_code
                    ||
                    "Plongeon"
                  )}
                </strong>


                ${
                  evaluation.height
                  !==
                  null
                  &&
                  typeof evaluation.height
                  !==
                  "undefined"
                  ?
                  `

                    •
                    ${escapePopulationHTML(
                      evaluation.height
                    )} m

                  `
                  :
                  ""
                }


                <br>


                <span
                  style="
                    color:#8fa8bc;
                  "
                >

                  EAH :
                  ${
                    evaluation.eah_score
                    ??
                    "—"
                  }/10

                  ${
                    evaluation.wa_score
                    !==
                    null
                    &&
                    typeof evaluation.wa_score
                    !==
                    "undefined"
                    ?
                    " • WA : "
                    +
                    escapePopulationHTML(
                      evaluation.wa_score
                    )
                    +
                    "/10"
                    :
                    ""
                  }

                </span>


                ${
                  evaluation.video_url
                  ?
                  `

                    <div
                      style="
                        margin-top:8px;
                      "
                    >

                      <a
                        href="${escapePopulationHTML(
                          evaluation.video_url
                        )}"
                        target="_blank"
                        rel="noopener"
                        style="
                          color:#30cfff;
                          font-weight:800;
                        "
                      >
                        Voir la vidéo
                      </a>

                    </div>

                  `
                  :
                  ""
                }

              </div>

            `
          )
          .join(
            ""
          )
          :
          `

            <div
              style="
                color:#8fa8bc;
              "
            >
              Aucun grading enregistré.
            </div>

          `
        }

      </section>

    `;


  } catch(error) {

    content.innerHTML = `

      <div
        style="
          padding:16px;
          border-radius:14px;
          background:rgba(224,82,94,.15);
          color:white;
        "
      >
        ${escapePopulationHTML(
          error.message
          ||
          "Impossible d'ouvrir le profil."
        )}
      </div>

    `;

  }

}



/* ============================================================
   REINSTALLATION LORS NAVIGATION
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setTimeout(
      installPopulationPeopleSearchV3,
      300
    );

  }
);


window.addEventListener(
  "hashchange",
  () => {

    if (
      window.location.hash ===
      "#population"
    ) {

      setTimeout(
        installPopulationPeopleSearchV3,
        100
      );

      setTimeout(
        installPopulationPeopleSearchV3,
        500
      );

    }

  }
);


/* ============================================================
   SECURITE SI LA PAGE EST RENDUE APRES LE CHARGEMENT
============================================================ */

const populationV3Observer =
  new MutationObserver(
    () => {

      if (
        window.location.hash ===
        "#population"
      ) {

        installPopulationPeopleSearchV3();

      }

    }
  );


populationV3Observer.observe(

  document.body,

  {

    childList:
      true,

    subtree:
      true

  }

);
/* ============================================================
   EAH DIVING PRO
   PROFIL / BLAZON / NOTE PRINCIPALE
   PATCH V3
============================================================ */


/* ============================================================
   NOTE PRINCIPALE EAH / WA
============================================================ */

function eahV3InstallScoreTypeSelector() {

  if (
    document.getElementById(
      'scoreType'
    )
  ) {

    return;

  }


  const waScore =
    document.getElementById(
      'waScore'
    );


  if (!waScore) {

    return;

  }


  const wrapper =
    document.createElement(
      'label'
    );


  wrapper.className =
    'eah-main-score-selector';


  wrapper.innerHTML = `

    Note principale affichée sur le Grade Report

    <select id="scoreType">

      <option value="EAH">
        EAH Diving
      </option>

      <option value="WA">
        World Aquatics
      </option>

    </select>

  `;


  const waLabel =
    waScore.closest(
      'label'
    );


  if (
    waLabel &&
    waLabel.parentNode
  ) {

    waLabel.parentNode.insertBefore(

      wrapper,

      waLabel

    );

  } else {

    waScore.parentNode?.insertBefore(

      wrapper,

      waScore

    );

  }

}


/* ============================================================
   COLLECT CRITERIA
   AJOUTE LE TYPE DE NOTE AU JSON

   Aucun changement de RPC nécessaire.
============================================================ */

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


  result._scoreType =
    String(
      val(
        'scoreType'
      )
      ||
      'EAH'
    )
    .toUpperCase();


  return result;

}


/* ============================================================
   VERIFICATION WA
============================================================ */

function eahV3InstallScoreValidation() {

  const form =
    document.getElementById(
      'evaluationForm'
    );


  if (
    !form ||
    form.dataset.eahScoreValidation ===
      '1'
  ) {

    return;

  }


  form.dataset.eahScoreValidation =
    '1';


  /*
    Capture = validation exécutée
    avant le submitEvaluation existant.
  */

  form.addEventListener(

    'submit',

    event => {

      const type =
        String(
          val(
            'scoreType'
          )
          ||
          'EAH'
        )
        .toUpperCase();


      if (
        type !==
        'WA'
      ) {

        return;

      }


      const wa =
        asNumber(
          val(
            'waScore'
          )
        );


      if (
        wa !==
        null
      ) {

        return;

      }


      event.preventDefault();

      event.stopImmediatePropagation();


      setMessage(

        'evaluationMsg',

        `
          <div class="notice error">

            Tu as choisi World Aquatics
            comme note principale.

            <br><br>

            Renseigne d'abord la note WA.

          </div>
        `

      );

    },

    true

  );

}


/* ============================================================
   IMAGE DU BLAZON ACTUEL
============================================================ */

function eahV3BlazonImage(
  value
) {

  const key =
    normalizeBlazonName(
      value
    );


  return (
    BLAZON_IMAGES[
      key
    ]
    ||
    ''
  );

}


function eahV3InjectBlazon(
  profile
) {

  const container =
    document.querySelector(
      '.eah-fast-profile-text'
    );


  if (!container) {

    return;

  }


  container
    .querySelector(
      '.eah-current-blazon-visual'
    )
    ?.remove();


  const blazon =
    String(
      profile?.currentBlazon ||
      ''
    )
    .trim();


  if (!blazon) {

    return;

  }


  const image =
    eahV3BlazonImage(
      blazon
    );


  const block =
    document.createElement(
      'div'
    );


  block.className =
    'eah-current-blazon-visual';


  block.innerHTML = `

    ${
      image
      ?
      `
        <img
          src="${esc(image)}"
          alt="${esc(blazon)}"
        >
      `
      :
      ''
    }

    <div>

      <small>
        BLAZON ACTUEL
      </small>

      <strong>
        ${esc(blazon)}
      </strong>

    </div>

  `;


  container.appendChild(
    block
  );

}


/* ============================================================
   ON CONSERVE TON RENDU PREMIUM ACTUEL
   ET ON AJOUTE LE BLAZON DESSUS
============================================================ */

const eahV3OriginalRenderProfileSummary =
  renderProfileSummary;


renderProfileSummary =
  function(
    profile,
    privateAccess = false
  ) {

    eahV3OriginalRenderProfileSummary(

      profile,

      privateAccess

    );


    eahV3InjectBlazon(
      profile
    );

  };


/* ============================================================
   PROFIL PUBLIC

   On ne dépend plus de la table public_profiles.

   La visibilité est contrôlée directement
   depuis divers.profile_visibility.
============================================================ */

async function loadPublicProfile(
  eahId
) {

  setProfileLoading();


  try {

    const sb =
      requireSupabase();


    const {
      data,
      error
    } =
      await sb.rpc(

        'eah_public_profile',

        {

          p_eah_id:
            eahId,

          p_club_slug:
            CLUB_SLUG ||
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

        data?.error
        ||
        'Profil public introuvable.'

      );

    }


    const profile =
      data.profile ||
      {};


    state.profile = {

      eahId:
        profile.eahId,

      firstName:
        profile.firstName ||
        '',

      lastName:
        profile.lastName ||
        '',

      photoUrl:
        profile.photoUrl ||
        '',

      group:
        profile.group ||
        '',

      sex:
        profile.sex ||
        '',

      currentBlazon:
        profile.currentBlazon ||
        '',

      club:
        data.club?.name ||
        'EAH Diving',

      cardStatus:
        ''

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


  } catch(error) {

    console.error(
      'EAH PUBLIC PROFILE:',
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
   CSS BLAZON PROFIL
============================================================ */

(function eahV3InstallBlazonCss() {

  if (
    document.getElementById(
      'eah-v3-blazon-css'
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      'style'
    );


  style.id =
    'eah-v3-blazon-css';


  style.textContent = `

    .eah-current-blazon-visual {

      display:
        flex;

      align-items:
        center;

      gap:
        16px;

      margin-top:
        22px;

      padding:
        14px 18px;

      width:
        fit-content;

      max-width:
        100%;

      border:
        1px solid
        rgba(
          48,
          207,
          255,
          .25
        );

      border-radius:
        20px;

      background:
        rgba(
          48,
          207,
          255,
          .06
        );

    }


    .eah-current-blazon-visual img {

      width:
        72px;

      height:
        72px;

      object-fit:
        contain;

    }


    .eah-current-blazon-visual small {

      display:
        block;

      margin-bottom:
        3px;

      color:
        #8fa8bc;

      font-size:
        .72rem;

      font-weight:
        800;

      letter-spacing:
        .08em;

    }


    .eah-current-blazon-visual strong {

      display:
        block;

      color:
        white;

      font-size:
        1.05rem;

    }


    @media (
      max-width:
      700px
    ) {

      .eah-current-blazon-visual {

        margin-left:
          auto;

        margin-right:
          auto;

      }

    }

  `;


  document.head.appendChild(
    style
  );

})();


/* ============================================================
   INSTALLATION CHAMPS EVALUATION
============================================================ */

function eahV3InstallEvaluationFields() {

  eahV3InstallScoreTypeSelector();

  eahV3InstallScoreValidation();

}


if (
  document.readyState ===
  'loading'
) {

  document.addEventListener(

    'DOMContentLoaded',

    eahV3InstallEvaluationFields

  );

} else {

  eahV3InstallEvaluationFields();

}/* ============================================================
   EAH DIVING PRO
   PUBLIC PROFILE + POPULATION V6
   06/10/2026

   A COLLER JUSTE AVANT :
   init().catch(...)
============================================================ */


/* ============================================================
   AJOUT RECHERCHE NOM / PRENOM
============================================================ */

function EAH_V6_INSTALLER_RECHERCHE_POPULATION() {

  if (
    document.getElementById(
      'populationName'
    )
  ) {

    return;

  }


  const codeField =
    document.getElementById(
      'populationCode'
    );


  if (!codeField) {

    return;

  }


  const wrapper =
    document.createElement(
      'label'
    );


  wrapper.id =
    'eahPopulationNameWrapper';


  wrapper.innerHTML = `

    Nom ou prénom

    <input
      id="populationName"
      type="search"
      autocomplete="off"
      placeholder="Ex : Emeric, Goin..."
    >

  `;


  const codeLabel =
    codeField.closest(
      'label'
    );


  if (codeLabel) {

    codeLabel.insertAdjacentElement(
      'afterend',
      wrapper
    );

  } else {

    codeField.insertAdjacentElement(
      'afterend',
      wrapper
    );

  }


  document
    .getElementById(
      'populationName'
    )
    ?.addEventListener(

      'keydown',

      function(event) {

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



/* ============================================================
   PROFIL PUBLIC SECURISE
============================================================ */

async function loadPublicProfile(
  eahId
) {

  setProfileLoading();


  try {

    const sb =
      requireSupabase();


    const {
      data,
      error
    } =
      await sb.rpc(

        'eah_public_profile_v2',

        {

          p_eah_id:
            String(
              eahId ||
              ''
            )
            .trim()
            .toUpperCase(),

          p_club_slug:
            CLUB_SLUG ||
            null

        }

      );


    if (error) {

      throw error;

    }


    if (
      !data
      ||
      data.ok === false
    ) {

      throw new Error(

        data?.error
        ||
        'Profil public introuvable ou privé.'

      );

    }


    const profile =
      data.profile ||
      {};


    if (
      data.club?.slug
    ) {

      CLUB_SLUG =
        data.club.slug;

    }


    state.club =
      data.club ||
      state.club;


    state.profile = {

      eahId:
        profile.eahId ||
        eahId,

      firstName:
        profile.firstName ||
        '',

      lastName:
        profile.lastName ||
        '',

      photoUrl:
        profile.photoUrl ||
        '',

      sex:
        profile.sex ||
        '',

      group:
        profile.group ||
        '',

      currentBlazon:
        profile.currentBlazon ||
        '',

      profileVisibility:
        profile.profileVisibility ||
        'PUBLIC',

      club:
        data.club?.name ||
        'EAH Diving',

      cardStatus:
        ''

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

    console.error(
      'EAH PUBLIC PROFILE:',
      error
    );


    renderProfileError(

      error.message ||
      'Profil public introuvable ou privé.'

    );

  }

}



/* ============================================================
   IMAGE DU BLAZON ACTUEL
============================================================ */

function eahV6CurrentBlazonImage(
  profile
) {

  const key =
    normalizeBlazonName(
      profile?.currentBlazon ||
      ''
    );


  return (
    BLAZON_IMAGES[
      key
    ]
    ||
    ''
  );

}



/* ============================================================
   AJOUT BLAZON + SEXE SUR LE PROFIL
============================================================ */

function eahV6EnhanceProfile(
  profile
) {

  const view =
    document.getElementById(
      'profileView'
    );


  if (
    !view ||
    !profile
  ) {

    return;

  }


  /*
    SEXE
  */

  const tags =
    view.querySelector(
      '.eah-fast-profile-tags'
    );


  if (
    tags &&
    profile.sex &&
    !tags.querySelector(
      '[data-eah-sex]'
    )
  ) {

    const sex =
      document.createElement(
        'span'
      );


    sex.dataset.eahSex =
      '1';


    sex.textContent =
      profile.sex;


    tags.appendChild(
      sex
    );

  }


  /*
    BLAZON
  */

  const image =
    eahV6CurrentBlazonImage(
      profile
    );


  const textBox =
    view.querySelector(
      '.eah-fast-profile-text'
    );


  if (
    !textBox ||
    document.getElementById(
      'eahCurrentBlazonVisual'
    )
  ) {

    return;

  }


  const card =
    document.createElement(
      'div'
    );


  card.id =
    'eahCurrentBlazonVisual';


  card.innerHTML = `

    <div class="eah-v6-blazon-current">

      ${
        image
        ?
        `

          <img
            src="${esc(image)}"
            alt="${esc(
              profile.currentBlazon ||
              'Blazon EAH'
            )}"
          >

        `
        :
        ''
      }

      <div>

        <small>
          BLAZON ACTUEL
        </small>

        <strong>

          ${esc(
            profile.currentBlazon ||
            'En progression'
          )}

        </strong>

      </div>

    </div>

  `;


  textBox.appendChild(
    card
  );

}



/* ============================================================
   ON CONSERVE TON RENDU PREMIUM ACTUEL
   ET ON AJOUTE LE BLAZON APRES
============================================================ */

const EAH_V6_RENDER_PROFILE_ORIGINAL =
  renderProfileSummary;


renderProfileSummary =
  function(
    profile,
    privateAccess = false
  ) {

    EAH_V6_RENDER_PROFILE_ORIGINAL(

      profile,

      privateAccess

    );


    window.requestAnimationFrame(

      function() {

        eahV6EnhanceProfile(
          profile
        );

      }

    );

  };



/* ============================================================
   POPULATION
   CODE + NOM + PRENOM
============================================================ */

async function loadPopulation() {

  const code =
    normalizeCode(
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

    const sb =
      requireSupabase();


    const {
      data,
      error
    } =
      await sb.rpc(

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


    if (
      data?.ok === false
    ) {

      throw new Error(

        data.error ||
        'Recherche impossible.'

      );

    }


    const result =
      eahPopulationNormalize(
        data
      );


    renderPopulationStats(

      box,

      result

    );


  } catch (
    error
  ) {

    console.error(
      'EAH POPULATION V6:',
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



/* ============================================================
   STYLE PROFIL
============================================================ */

(function EAH_V6_STYLE() {

  if (
    document.getElementById(
      'eah-v6-style'
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      'style'
    );


  style.id =
    'eah-v6-style';


  style.textContent = `

    #eahPopulationNameWrapper {
      display: block;
      margin-top: 14px;
    }


    .eah-v6-blazon-current {
      margin-top: 24px;
      display: inline-flex;
      align-items: center;
      gap: 15px;
      padding: 13px 18px;
      border-radius: 20px;
      border: 1px solid rgba(48,207,255,.25);
      background: rgba(48,207,255,.06);
    }


    .eah-v6-blazon-current img {
      width: 72px;
      height: 72px;
      object-fit: contain;
    }


    .eah-v6-blazon-current div {
      display: grid;
      gap: 3px;
    }


    .eah-v6-blazon-current small {
      color: #30cfff;
      font-weight: 800;
      letter-spacing: .08em;
    }


    .eah-v6-blazon-current strong {
      font-size: 1.1rem;
      color: white;
    }


    @media (max-width:700px) {

      .eah-v6-blazon-current {
        display: flex;
        margin-left: auto;
        margin-right: auto;
      }

    }

  `;


  document.head.appendChild(
    style
  );

})();



/* ============================================================
   INSTALLATION
============================================================ */

EAH_V6_INSTALLER_RECHERCHE_POPULATION();/* ============================================================
   EAH DIVING PRO
   POPULATION PUBLIC FIX V6.1
   06/10/2026

   A COLLER JUSTE AVANT :
   init().catch(...)
============================================================ */


/* ============================================================
   URL PROFIL PUBLIC
============================================================ */

function EAH_V61_PROFILE_URL(
  diver
) {

  if (
    !diver ||
    !diver.eah_id
  ) {

    return '#';

  }


  const url =
    new URL(
      window.location.href
    );


  url.search =
    '';


  if (
    diver.club_slug
  ) {

    url.searchParams.set(
      'club',
      diver.club_slug
    );

  }


  url.searchParams.set(
    'id',
    diver.eah_id
  );


  url.hash =
    'profil';


  return url.toString();

}



/* ============================================================
   SUPPRIMER ANCIENNE RECHERCHE
   "RECHERCHER UN PLONGEUR EAH"

   Cet ancien module utilisait encore l'ancienne logique
   PUBLIC_NAME / privé.
============================================================ */

function EAH_V61_SUPPRIMER_ANCIENNE_RECHERCHE() {

  const titles =
    document.querySelectorAll(
      'h1, h2, h3'
    );


  titles.forEach(
    function(title) {

      const text =
        String(
          title.textContent ||
          ''
        )
        .trim()
        .toLowerCase();


      if (
        text !==
        'rechercher un plongeur eah'
      ) {

        return;

      }


      const card =
        title.closest(
          '.dashboard-card'
        );


      if (
        card
      ) {

        card.style.display =
          'none';


        card.dataset.eahOldPopulation =
          'hidden';

        return;

      }


      /*
        Fallback si le bloc n'utilise pas dashboard-card
      */

      let parent =
        title.parentElement;


      for (
        let i = 0;
        i < 3 && parent;
        i++
      ) {

        if (
          parent.querySelector(
            'input'
          )
          &&
          parent.querySelector(
            'button'
          )
        ) {

          parent.style.display =
            'none';

          break;

        }


        parent =
          parent.parentElement;

      }

    }

  );

}



/* ============================================================
   RENDU DES RESULTATS NOM / PRENOM
============================================================ */

function EAH_V61_RENDER_PUBLIC_DIVERS(
  box,
  result,
  searchedName
) {

  const divers =
    Array.isArray(
      result?.divers
    )
    ?
    result.divers
    :
    [];


  /*
    Si aucun nom n'est recherché,
    on garde simplement les statistiques.
  */

  if (
    !searchedName
  ) {

    return;

  }


  const container =
    document.createElement(
      'div'
    );


  container.id =
    'eahV61PublicResults';


  container.className =
    'eah-v61-public-results';


  if (
    !divers.length
  ) {

    container.innerHTML = `

      <div class="notice">

        Aucun profil PUBLIC trouvé
        pour

        <strong>
          ${esc(searchedName)}
        </strong>.

      </div>

    `;


    box.appendChild(
      container
    );


    return;

  }


  container.innerHTML = `

    <div class="eah-v61-result-header">

      <span class="overline">
        PROFILS PUBLICS
      </span>

      <h2>
        Résultat de la recherche
      </h2>

    </div>


    ${

      divers
        .map(
          function(diver) {

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

              diver.eah_id;


            const profileUrl =
              EAH_V61_PROFILE_URL(
                diver
              );


            const photo =
              typeof eahFastPhotoUrl ===
              'function'
              ?
              eahFastPhotoUrl(
                diver.photo_url
              )
              :
              (
                diver.photo_url ||
                ''
              );


            const sex =
              String(
                diver.sex ||
                ''
              );


            const group =
              String(
                diver.group_name ||
                ''
              );


            const blazon =
              String(
                diver.current_blazon ||
                'En progression'
              );


            const gradingCount =
              Number(
                diver.grading_count ||
                0
              );


            return `

              <article
                class="eah-v61-diver-card"
              >

                <div
                  class="eah-v61-diver-identity"
                >

                  ${
                    photo
                    ?
                    `

                      <img
                        class="eah-v61-diver-photo"
                        src="${esc(photo)}"
                        alt="${esc(displayName)}"
                      >

                    `
                    :
                    `

                      <div
                        class="eah-v61-diver-photo eah-v61-empty-photo"
                      >
                        EAH
                      </div>

                    `
                  }


                  <div>

                    <span
                      class="eah-v61-public-badge"
                    >
                      PROFIL PUBLIC
                    </span>


                    <h3>
                      ${esc(displayName)}
                    </h3>


                    <p class="muted">

                      ${esc(
                        diver.club_name ||
                        'EAH Diving'
                      )}

                    </p>


                    <div
                      class="eah-v61-tags"
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
                        group
                        ?
                        `
                          <span>
                            ${esc(group)}
                          </span>
                        `
                        :
                        ''
                      }


                      <span>
                        ${esc(blazon)}
                      </span>


                      <span>

                        ${esc(
                          gradingCount
                        )}

                        grading(s)

                      </span>

                    </div>

                  </div>

                </div>


                <div>

                  <a
                    class="button"
                    href="${esc(profileUrl)}"
                  >
                    Voir le profil public
                  </a>

                </div>

              </article>

            `;

          }
        )
        .join('')

    }

  `;


  box.appendChild(
    container
  );

}



/* ============================================================
   POPULATION OFFICIELLE
   PROFILE_VISIBILITY = PUBLIC

   Recherche :
   - code
   - prénom
   - nom
   - prénom + nom
   - EAH_ID
============================================================ */

async function loadPopulation() {

  const code =
    normalizeCode(
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


  const box =
    document.getElementById(
      'populationResults'
    );


  const button =
    document.getElementById(
      'populationSearchButton'
    );


  if (
    !box
  ) {

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

    const sb =
      requireSupabase();


    const {
      data,
      error
    } =
      await sb.rpc(

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


    if (
      error
    ) {

      throw error;

    }


    if (
      !data
      ||
      data.ok === false
    ) {

      throw new Error(

        data?.error ||
        'Recherche Population impossible.'

      );

    }


    const result =
      eahPopulationNormalize(
        data
      );


    /*
      Statistiques
    */

    renderPopulationStats(

      box,

      result

    );


    /*
      Résultat nominatif direct
    */

    EAH_V61_RENDER_PUBLIC_DIVERS(

      box,

      result,

      name

    );


  } catch (
    error
  ) {

    console.error(
      'EAH POPULATION V6.1:',
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



/* ============================================================
   STYLE
============================================================ */

(function EAH_V61_STYLE() {

  if (
    document.getElementById(
      'eah-v61-style'
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      'style'
    );


  style.id =
    'eah-v61-style';


  style.textContent = `

    .eah-v61-public-results {
      margin-top: 28px;
    }


    .eah-v61-result-header {
      margin-bottom: 16px;
    }


    .eah-v61-result-header h2 {
      margin-top: 5px;
    }


    .eah-v61-diver-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;

      margin-top: 14px;
      padding: 20px;

      border:
        1px solid
        rgba(
          143,
          205,
          255,
          .22
        );

      border-radius:
        22px;

      background:
        rgba(
          4,
          27,
          48,
          .78
        );
    }


    .eah-v61-diver-identity {
      display: flex;
      align-items: center;
      gap: 18px;
    }


    .eah-v61-diver-photo {
      width: 82px;
      height: 82px;

      flex:
        0 0 82px;

      object-fit: cover;

      border-radius:
        20px;

      border:
        2px solid
        rgba(
          48,
          207,
          255,
          .55
        );
    }


    .eah-v61-empty-photo {
      display: grid;
      place-items: center;

      background:
        #061e33;

      color:
        white;

      font-weight:
        900;
    }


    .eah-v61-diver-card h3 {
      margin:
        7px
        0
        4px;
    }


    .eah-v61-public-badge {
      display: inline-block;

      padding:
        5px
        9px;

      border-radius:
        999px;

      background:
        rgba(
          24,
          185,
          120,
          .15
        );

      color:
        #58e5a8;

      font-size:
        .72rem;

      font-weight:
        900;

      letter-spacing:
        .06em;
    }


    .eah-v61-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;

      margin-top: 10px;
    }


    .eah-v61-tags span {
      padding:
        6px
        10px;

      border-radius:
        999px;

      background:
        rgba(
          48,
          207,
          255,
          .07
        );

      border:
        1px solid
        rgba(
          48,
          207,
          255,
          .15
        );

      font-size:
        .82rem;
    }


    @media (
      max-width:
      700px
    ) {

      .eah-v61-diver-card {
        display: grid;
      }


      .eah-v61-diver-identity {
        align-items: flex-start;
      }


      .eah-v61-diver-photo {
        width: 65px;
        height: 65px;
        flex-basis: 65px;
      }


      .eah-v61-diver-card .button {
        width: 100%;
        text-align: center;
      }

    }

  `;


  document.head
    .appendChild(
      style
    );

})();



/* ============================================================
   MASQUER L'ANCIEN MODULE
============================================================ */

EAH_V61_SUPPRIMER_ANCIENNE_RECHERCHE();


window.addEventListener(

  'load',

  function() {

    EAH_V61_SUPPRIMER_ANCIENNE_RECHERCHE();

  }

);/* ============================================================
   EAH DIVING PRO CLUB
   FIX PROFILS PUBLICS V6.2
   06/10/2026

   A COLLER JUSTE AVANT :
   init().catch(...)
============================================================ */


/* ============================================================
   NORMALISER REPONSE RPC
============================================================ */

function EAH_V62_RPC_OBJECT(data) {

  if (
    Array.isArray(data)
  ) {

    return data[0] || {};

  }

  return data || {};

}



/* ============================================================
   URL PROFIL PUBLIC
============================================================ */

function EAH_V62_PROFILE_URL(
  eahId,
  clubSlug
) {

  const url =
    new URL(
      window.location.href
    );


  url.search = '';


  if (
    clubSlug
  ) {

    url.searchParams.set(
      'club',
      clubSlug
    );

  }


  url.searchParams.set(
    'id',
    eahId
  );


  url.hash =
    'profil';


  return url.toString();

}



/* ============================================================
   CACHE RESULTATS PROFILS PUBLICS
============================================================ */

const EAH_V62_PUBLIC_CACHE =
  new Map();



/* ============================================================
   VERIFIER UN PROFIL DIRECTEMENT AVEC LA RPC QUI FONCTIONNE

   eah_public_profile_v2
============================================================ */

async function EAH_V62_GET_PUBLIC_PROFILE(
  eahId,
  clubSlug
) {

  const cleanId =
    String(
      eahId || ''
    )
    .trim()
    .toUpperCase();


  const cleanClub =
    String(
      clubSlug ||
      CLUB_SLUG ||
      ''
    )
    .trim();


  if (!cleanId) {

    return null;

  }


  const cacheKey =
    cleanClub
    +
    '|'
    +
    cleanId;


  if (
    EAH_V62_PUBLIC_CACHE.has(
      cacheKey
    )
  ) {

    return EAH_V62_PUBLIC_CACHE.get(
      cacheKey
    );

  }


  try {

    const {
      data,
      error
    } =
      await requireSupabase()
        .rpc(

          'eah_public_profile_v2',

          {

            p_eah_id:
              cleanId,

            p_club_slug:
              cleanClub ||
              null

          }

        );


    if (error) {

      console.warn(
        'EAH PUBLIC PROFILE CHECK',
        cleanId,
        error
      );


      EAH_V62_PUBLIC_CACHE.set(
        cacheKey,
        null
      );


      return null;

    }


    const result =
      EAH_V62_RPC_OBJECT(
        data
      );


    /*
      IMPORTANT :

      Le profil n'est considéré PUBLIC
      QUE si la RPC publique le confirme.
    */

    if (
      !result ||
      result.ok !== true
    ) {

      EAH_V62_PUBLIC_CACHE.set(
        cacheKey,
        null
      );


      return null;

    }


    EAH_V62_PUBLIC_CACHE.set(
      cacheKey,
      result
    );


    return result;


  } catch (
    error
  ) {

    console.error(
      'EAH PUBLIC PROFILE CHECK',
      error
    );


    return null;

  }

}



/* ============================================================
   RETROUVER L'ANCIEN MODULE

   "Rechercher un plongeur EAH"
============================================================ */

function EAH_V62_FIND_OLD_SEARCH() {

  const populationPage =
    document.getElementById(
      'population'
    );


  if (!populationPage) {

    return null;

  }


  const titles =
    populationPage.querySelectorAll(
      'h1,h2,h3,h4'
    );


  for (
    const title of titles
  ) {

    const text =
      String(
        title.textContent || ''
      )
      .trim()
      .toLowerCase();


    if (
      text ===
      'rechercher un plongeur eah'
    ) {

      /*
        On remonte jusqu'à trouver
        un gros bloc contenant
        input + bouton.
      */

      let parent =
        title.parentElement;


      for (
        let i = 0;
        i < 6 && parent;
        i++
      ) {

        if (
          parent.querySelector('input')
          &&
          parent.querySelector('button')
        ) {

          return parent;

        }


        parent =
          parent.parentElement;

      }

    }

  }


  return null;

}



/* ============================================================
   MASQUER DEFINITIVEMENT L'ANCIEN MODULE
============================================================ */

function EAH_V62_HIDE_OLD_SEARCH() {

  const old =
    EAH_V62_FIND_OLD_SEARCH();


  if (
    old &&
    old.id !==
      'eahV62PublicSearch'
  ) {

    old.style.display =
      'none';


    old.setAttribute(
      'data-eah-old-search',
      'hidden'
    );

  }

}



/* ============================================================
   CREER LE NOUVEAU MODULE
============================================================ */

function EAH_V62_INSTALL_SEARCH() {

  const populationPage =
    document.getElementById(
      'population'
    );


  if (!populationPage) {

    return;

  }


  /*
    Toujours masquer l'ancien.
  */

  EAH_V62_HIDE_OLD_SEARCH();


  /*
    Déjà installé.
  */

  if (
    document.getElementById(
      'eahV62PublicSearch'
    )
  ) {

    return;

  }


  const wrapper =
    document.createElement(
      'section'
    );


  wrapper.id =
    'eahV62PublicSearch';


  wrapper.className =
    'dashboard-card eah-v62-search';


  wrapper.innerHTML = `

    <span class="overline">
      POPULATION EAH
    </span>


    <h2>
      Rechercher un profil public
    </h2>


    <p class="muted">

      Recherche par prénom,
      nom ou numéro EAH.

      Seuls les profils définis
      PUBLIC sont affichés.

    </p>


    <div class="eah-v62-search-line">

      <input
        id="eahV62SearchInput"
        type="text"
        placeholder="Ex : Emeric, Goin, EAH-4D25603F03"
        autocomplete="off"
      >


      <button
        id="eahV62SearchButton"
        type="button"
        class="button"
      >
        Rechercher
      </button>

    </div>


    <div
      id="eahV62SearchResults"
      class="eah-v62-results"
    ></div>

  `;


  /*
    On essaye de le placer
    après les statistiques Population.
  */

  const results =
    document.getElementById(
      'populationResults'
    );


  if (
    results &&
    results.parentElement
  ) {

    results.parentElement.insertBefore(

      wrapper,

      results.nextSibling

    );

  } else {

    populationPage.appendChild(
      wrapper
    );

  }


  document
    .getElementById(
      'eahV62SearchButton'
    )
    ?.addEventListener(

      'click',

      EAH_V62_SEARCH

    );


  document
    .getElementById(
      'eahV62SearchInput'
    )
    ?.addEventListener(

      'keydown',

      function(event) {

        if (
          event.key ===
          'Enter'
        ) {

          event.preventDefault();


          EAH_V62_SEARCH();

        }

      }

    );

}



/* ============================================================
   EXTRAIRE LES PLONGEURS D'UNE REPONSE POPULATION
============================================================ */

function EAH_V62_EXTRACT_DIVERS(
  data
) {

  const result =
    EAH_V62_RPC_OBJECT(
      data
    );


  if (
    Array.isArray(
      result.divers
    )
  ) {

    return result.divers;

  }


  if (
    Array.isArray(
      result.profiles
    )
  ) {

    return result.profiles;

  }


  if (
    Array.isArray(
      result.results
    )
  ) {

    return result.results;

  }


  if (
    Array.isArray(
      result.data
    )
  ) {

    return result.data;

  }


  return [];

}



/* ============================================================
   RECHERCHE NOM / PRENOM

   La première RPC sert seulement
   à trouver les candidats.

   Ensuite CHAQUE candidat est vérifié
   avec eah_public_profile_v2.

   Donc l'ancien calcul "profil privé"
   ne peut plus intervenir.
============================================================ */

async function EAH_V62_SEARCH() {

  const input =
    document.getElementById(
      'eahV62SearchInput'
    );


  const button =
    document.getElementById(
      'eahV62SearchButton'
    );


  const resultsBox =
    document.getElementById(
      'eahV62SearchResults'
    );


  if (
    !input ||
    !resultsBox
  ) {

    return;

  }


  const search =
    String(
      input.value || ''
    )
    .trim();


  if (
    search.length < 2
  ) {

    resultsBox.innerHTML = `

      <div class="notice">
        Saisis au moins 2 caractères.
      </div>

    `;


    return;

  }


  button.disabled =
    true;


  button.textContent =
    'Recherche…';


  resultsBox.innerHTML = `

    <div class="loading-panel">
      Recherche des profils publics…
    </div>

  `;


  try {

    const sb =
      requireSupabase();


    /*
      Recherche des candidats.

      Cette fonction existe déjà
      dans ta configuration actuelle.
    */

    const {
      data,
      error
    } =
      await sb.rpc(

        'eah_population_search_v3',

        {

          p_code:
            null,

          p_name:
            search,

          p_club_slug:
            CLUB_SLUG ||
            null

        }

      );


    if (error) {

      throw error;

    }


    const candidates =
      EAH_V62_EXTRACT_DIVERS(
        data
      );


    if (
      !candidates.length
    ) {

      resultsBox.innerHTML = `

        <div class="notice">

          Aucun plongeur trouvé pour

          <strong>
            ${esc(search)}
          </strong>.

        </div>

      `;


      return;

    }


    /*
      Vérification réelle PUBLIC / PRIVE
      profil par profil.
    */

    const checks =
      await Promise.all(

        candidates.map(

          async function(diver) {

            const eahId =
              diver.eah_id ||
              diver.eahId ||
              '';


            const clubSlug =
              diver.club_slug ||
              diver.clubSlug ||
              CLUB_SLUG ||
              '';


            const publicData =
              await EAH_V62_GET_PUBLIC_PROFILE(

                eahId,

                clubSlug

              );


            return {

              original:
                diver,

              publicData:
                publicData

            };

          }

        )

      );


    /*
      On garde UNIQUEMENT
      ceux confirmés PUBLIC.
    */

    const publicDivers =
      checks.filter(
        function(item) {

          return Boolean(
            item.publicData
          );

        }
      );


    if (
      !publicDivers.length
    ) {

      resultsBox.innerHTML = `

        <div class="notice">

          Aucun profil PUBLIC trouvé pour

          <strong>
            ${esc(search)}
          </strong>.

        </div>

      `;


      return;

    }


    resultsBox.innerHTML =
      publicDivers
        .map(

          function(item) {

            const original =
              item.original || {};


            const response =
              item.publicData || {};


            const profile =
              response.profile ||
              response.diver ||
              response;


            const club =
              response.club ||
              {};


            const eahId =
              profile.eah_id ||
              profile.eahId ||
              original.eah_id ||
              original.eahId ||
              '';


            const firstName =
              profile.first_name ||
              profile.firstName ||
              original.first_name ||
              original.firstName ||
              '';


            const lastName =
              profile.last_name ||
              profile.lastName ||
              original.last_name ||
              original.lastName ||
              '';


            const name =
              (
                String(firstName)
                +
                ' '
                +
                String(lastName)
              )
              .trim()
              ||
              eahId;


            const clubSlug =
              club.slug ||
              original.club_slug ||
              original.clubSlug ||
              CLUB_SLUG ||
              '';


            const clubName =
              club.name ||
              original.club_name ||
              original.clubName ||
              state.club?.name ||
              'EAH Diving';


            const sex =
              profile.sex ||
              original.sex ||
              '';


            const group =
              profile.group_name ||
              profile.groupName ||
              profile.group ||
              original.group_name ||
              original.groupName ||
              '';


            const blazon =
              profile.current_blazon ||
              profile.currentBlazon ||
              original.current_blazon ||
              original.currentBlazon ||
              'En progression';


            const photoRaw =
              profile.photo_url ||
              profile.photoUrl ||
              original.photo_url ||
              original.photoUrl ||
              '';


            const photo =
              typeof eahFastPhotoUrl ===
              'function'
              ?
              eahFastPhotoUrl(
                photoRaw
              )
              :
              photoRaw;


            const gradingCount =
              Number(

                response.grading_count

                ??

                response.gradingCount

                ??

                original.grading_count

                ??

                original.gradingCount

                ??

                (
                  Array.isArray(
                    response.evaluations
                  )
                  ?
                  response.evaluations.length
                  :
                  0
                )

              );


            const profileUrl =
              EAH_V62_PROFILE_URL(

                eahId,

                clubSlug

              );


            return `

              <article
                class="eah-v62-diver"
              >

                <div
                  class="eah-v62-left"
                >

                  ${
                    photo
                    ?
                    `

                      <img
                        class="eah-v62-photo"
                        src="${esc(photo)}"
                        alt="${esc(name)}"
                      >

                    `
                    :
                    `

                      <div
                        class="eah-v62-photo eah-v62-photo-empty"
                      >
                        EAH
                      </div>

                    `
                  }


                  <div>

                    <span
                      class="eah-v62-public-badge"
                    >
                      PROFIL PUBLIC
                    </span>


                    <h3>
                      ${esc(name)}
                    </h3>


                    <p class="muted">

                      ${esc(clubName)}

                    </p>


                    <div
                      class="eah-v62-tags"
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
                        group
                        ?
                        `
                          <span>
                            ${esc(group)}
                          </span>
                        `
                        :
                        ''
                      }


                      <span>
                        ${esc(blazon)}
                      </span>


                      <span>
                        ${esc(gradingCount)}
                        grading(s)
                      </span>

                    </div>

                  </div>

                </div>


                <a
                  href="${esc(profileUrl)}"
                  class="button eah-v62-open-profile"
                >
                  Voir le profil
                </a>

              </article>

            `;

          }

        )
        .join('');


  } catch (
    error
  ) {

    console.error(
      'EAH SEARCH PUBLIC V6.2',
      error
    );


    resultsBox.innerHTML = `

      <div class="notice error">

        ${esc(
          error.message ||
          'Recherche impossible.'
        )}

      </div>

    `;


  } finally {

    button.disabled =
      false;


    button.textContent =
      'Rechercher';

  }

}



/* ============================================================
   PROFIL PUBLIC
   REMPLACE L'ANCIEN public_profiles
============================================================ */

async function loadPublicProfile(
  eahId
) {

  setProfileLoading();


  try {

    const result =
      await EAH_V62_GET_PUBLIC_PROFILE(

        eahId,

        CLUB_SLUG

      );


    if (!result) {

      throw new Error(
        'Profil public introuvable ou privé.'
      );

    }


    const profile =
      result.profile ||
      result.diver ||
      result;


    const club =
      result.club ||
      {};


    state.profile = {

      eahId:

        profile.eah_id
        ||
        profile.eahId
        ||
        eahId,


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


      club:

        club.name
        ||
        profile.club_name
        ||
        'EAH Diving',


      cardStatus:
        ''

    };


    state.profileHistory = {

      evaluations:

        result.evaluations
        ||
        profile.evaluations
        ||
        [],


      blazons:

        result.blazons
        ||
        result.progress
        ||
        profile.blazons
        ||
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

    console.error(
      'EAH PUBLIC PROFILE V6.2',
      error
    );


    renderProfileError(

      error.message ||
      'Profil public introuvable.'

    );

  }

}



/* ============================================================
   OUVERTURE DIRECTE URL PUBLIQUE

   ?club=xxx&id=EAH-XXXX#profil
============================================================ */

async function EAH_V62_OPEN_PUBLIC_FROM_URL() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const eahId =
    String(
      params.get('id') ||
      ''
    )
    .trim()
    .toUpperCase();


  const token =
    String(
      params.get('token') ||
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


  CARD_EAH_ID =
    eahId;


  showPage(
    'profil',
    false
  );


  await loadPublicProfile(
    eahId
  );

}



/* ============================================================
   STYLE
============================================================ */

(function EAH_V62_STYLE() {

  if (
    document.getElementById(
      'eah-v62-style'
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      'style'
    );


  style.id =
    'eah-v62-style';


  style.textContent = `

    .eah-v62-search {
      margin-top: 28px;
      padding: 28px;
    }


    .eah-v62-search-line {
      display: grid;
      grid-template-columns:
        minmax(0, 1fr)
        auto;
      gap: 14px;
      margin-top: 20px;
    }


    .eah-v62-search-line input {
      min-height: 58px;
    }


    .eah-v62-results {
      margin-top: 20px;
    }


    .eah-v62-diver {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 25px;

      margin-top: 14px;
      padding: 20px;

      border:
        1px solid
        rgba(143,205,255,.22);

      border-radius: 22px;

      background:
        rgba(4,27,48,.80);
    }


    .eah-v62-left {
      display: flex;
      align-items: center;
      gap: 18px;
    }


    .eah-v62-photo {
      width: 84px;
      height: 84px;

      flex:
        0 0 84px;

      object-fit: cover;

      border-radius: 20px;

      border:
        2px solid
        rgba(48,207,255,.45);
    }


    .eah-v62-photo-empty {
      display: grid;
      place-items: center;

      background: #061e33;

      color: white;

      font-weight: 900;
    }


    .eah-v62-diver h3 {
      margin:
        7px
        0
        3px;
    }


    .eah-v62-public-badge {
      display: inline-block;

      padding:
        5px
        10px;

      border-radius:
        999px;

      background:
        rgba(24,185,120,.16);

      border:
        1px solid
        rgba(24,185,120,.30);

      color:
        #67e8ae;

      font-size:
        .72rem;

      font-weight:
        900;

      letter-spacing:
        .05em;
    }


    .eah-v62-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;

      margin-top: 10px;
    }


    .eah-v62-tags span {
      padding:
        6px
        10px;

      border-radius:
        999px;

      background:
        rgba(48,207,255,.07);

      border:
        1px solid
        rgba(48,207,255,.15);

      font-size:
        .82rem;
    }


    @media (
      max-width: 700px
    ) {

      .eah-v62-search-line {
        grid-template-columns: 1fr;
      }


      .eah-v62-diver {
        display: grid;
      }


      .eah-v62-left {
        align-items: flex-start;
      }


      .eah-v62-photo {
        width: 64px;
        height: 64px;
        flex-basis: 64px;
      }


      .eah-v62-open-profile {
        width: 100%;
        text-align: center;
      }

    }

  `;


  document.head.appendChild(
    style
  );

})();



/* ============================================================
   OBSERVATEUR

   Si un ancien fichier JS recrée
   "Rechercher un plongeur EAH",
   on le masque automatiquement.
============================================================ */

(function EAH_V62_OBSERVER() {

  function install() {

    EAH_V62_HIDE_OLD_SEARCH();

    EAH_V62_INSTALL_SEARCH();

  }


  install();


  const observer =
    new MutationObserver(
      function() {

        install();

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
    OUVERTURE PROFIL PUBLIC
  */

  setTimeout(
    function() {

      EAH_V62_OPEN_PUBLIC_FROM_URL()
        .catch(
          console.warn
        );

    },

    500

  );

})();
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
