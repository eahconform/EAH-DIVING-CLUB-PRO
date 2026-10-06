'use strict';

/* ============================================================
   EAH DIVING PRO CLUB
   EAH FINAL FIX V7
   06/10/2026

   DOIT ETRE LE DERNIER FICHIER JS CHARGE.

   Objectifs :
   - empêcher le retour d'une ancienne logique public_profiles
   - forcer eah_public_profile_v2
   - vérifier directement les URLs profil PUBLIC
   - sécuriser le bouton Population
   - empêcher un ancien bloc "profil privé" de reprendre la main
============================================================ */


(function EAH_FINAL_FIX_V7() {


/* ============================================================
   GARDE
============================================================ */

if (
  window.EAH_FINAL_FIX_V7_LOADED
) {

  return;

}


window.EAH_FINAL_FIX_V7_LOADED =
  true;



/* ============================================================
   OUTILS
============================================================ */

function finalSb() {

  if (
    typeof requireSupabase ===
    'function'
  ) {

    return requireSupabase();

  }


  if (
    typeof supabaseClient !==
      'undefined'
    &&
    supabaseClient
  ) {

    return supabaseClient;

  }


  throw new Error(
    'Connexion Supabase indisponible.'
  );

}



function finalEsc(
  value
) {

  if (
    typeof esc ===
      'function'
  ) {

    return esc(
      value
    );

  }


  return String(
    value ??
    ''
  )
  .replace(
    /[&<>"']/g,
    function(char) {

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



function finalUnwrap(
  data
) {

  if (
    Array.isArray(
      data
    )
  ) {

    return (
      data[0] ||
      {}
    );

  }


  return (
    data ||
    {}
  );

}



/* ============================================================
   PROFIL PUBLIC RPC OFFICIELLE
============================================================ */

async function EAH_FINAL_PUBLIC_PROFILE(
  eahId,
  clubSlug
) {

  const id =
    String(
      eahId ||
      ''
    )
    .trim()
    .toUpperCase();


  const club =
    String(
      clubSlug ||
      (
        typeof CLUB_SLUG !==
        'undefined'
        ?
        CLUB_SLUG
        :
        ''
      )
      ||
      ''
    )
    .trim();


  if (!id) {

    throw new Error(
      'Numéro EAH manquant.'
    );

  }


  const {
    data,
    error
  } =
    await finalSb().rpc(

      'eah_public_profile_v2',

      {

        p_eah_id:
          id,

        p_club_slug:
          club ||
          null

      }

    );


  if (error) {

    throw error;

  }


  const result =
    finalUnwrap(
      data
    );


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


  return result;

}



/* ============================================================
   REMPLACEMENT FINAL DE loadPublicProfile
============================================================ */

async function EAH_FINAL_LOAD_PUBLIC_PROFILE(
  eahId
) {

  if (
    typeof setProfileLoading ===
    'function'
  ) {

    setProfileLoading();

  }


  try {

    const result =
      await EAH_FINAL_PUBLIC_PROFILE(

        eahId,

        (
          typeof CLUB_SLUG !==
          'undefined'
          ?
          CLUB_SLUG
          :
          ''
        )

      );


    const profileData =
      result.profile
      ||
      result.diver
      ||
      {};


    const club =
      result.club
      ||
      {};


    if (
      club.slug
      &&
      typeof CLUB_SLUG !==
      'undefined'
    ) {

      CLUB_SLUG =
        club.slug;

    }


    let normalized;


    if (
      typeof normalizeRpcProfile ===
      'function'
    ) {

      normalized =
        normalizeRpcProfile(

          profileData,

          club

        );

    } else {

      normalized = {

        eahId:
          profileData.eah_id
          ||
          profileData.eahId
          ||
          eahId,

        firstName:
          profileData.first_name
          ||
          profileData.firstName
          ||
          '',

        lastName:
          profileData.last_name
          ||
          profileData.lastName
          ||
          '',

        photoUrl:
          profileData.photo_url
          ||
          profileData.photoUrl
          ||
          '',

        group:
          profileData.group_name
          ||
          profileData.groupName
          ||
          profileData.group
          ||
          '',

        sex:
          profileData.sex
          ||
          '',

        currentBlazon:
          profileData.current_blazon
          ||
          profileData.currentBlazon
          ||
          '',

        club:
          club.name
          ||
          profileData.club_name
          ||
          'EAH Diving',

        cardStatus:
          ''

      };

    }


    if (
      typeof state !==
      'undefined'
    ) {

      state.profile =
        normalized;


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

    }


    if (
      typeof renderProfileSummary ===
      'function'
    ) {

      renderProfileSummary(

        normalized,

        false

      );

    }


    if (
      typeof renderProfileHistory ===
      'function'
    ) {

      renderProfileHistory({

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

      });

    }


    return result;


  } catch (
    error
  ) {

    console.error(
      'EAH FINAL PUBLIC PROFILE:',
      error
    );


    if (
      typeof renderProfileError ===
      'function'
    ) {

      renderProfileError(

        error.message
        ||
        'Profil public inaccessible.'

      );

    } else {

      const view =
        document.getElementById(
          'profileView'
        );


      if (view) {

        view.classList.remove(
          'hidden'
        );


        view.innerHTML = `

          <div class="notice error">
            ${finalEsc(
              error.message ||
              'Profil public inaccessible.'
            )}
          </div>

        `;

      }

    }


    return null;

  }

}



/* ============================================================
   FORCE LA FONCTION GLOBALE
============================================================ */

try {

  window.loadPublicProfile =
    EAH_FINAL_LOAD_PUBLIC_PROFILE;


  loadPublicProfile =
    EAH_FINAL_LOAD_PUBLIC_PROFILE;

} catch (_) {}



/* ============================================================
   OUVERTURE DIRECTE PROFIL PUBLIC
============================================================ */

async function EAH_FINAL_OPEN_PUBLIC_URL() {

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


  const clubSlug =
    String(
      params.get(
        'club'
      )
      ||
      ''
    )
    .trim();


  /*
    Avec token :
    profil NFC privé.
    On ne touche surtout pas.
  */

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


  if (
    clubSlug
    &&
    typeof CLUB_SLUG !==
      'undefined'
  ) {

    CLUB_SLUG =
      clubSlug;

  }


  if (
    typeof CARD_EAH_ID !==
      'undefined'
  ) {

    CARD_EAH_ID =
      eahId;

  }


  if (
    typeof CARD_TOKEN !==
      'undefined'
  ) {

    CARD_TOKEN =
      '';

  }


  if (
    typeof showPage ===
      'function'
  ) {

    document
      .querySelectorAll(
        '.page'
      )
      .forEach(
        page => {

          page.classList.toggle(
            'active',
            page.id ===
            'profil'
          );

        }
      );

  }


  await EAH_FINAL_LOAD_PUBLIC_PROFILE(
    eahId
  );

}



/* ============================================================
   POPULATION
============================================================ */

async function EAH_FINAL_LOAD_POPULATION() {

  const code =
    typeof normalizeCode ===
      'function'
    ?
    normalizeCode(

      document
        .getElementById(
          'populationCode'
        )
        ?.value
      ||
      ''

    )
    :
    String(
      document
        .getElementById(
          'populationCode'
        )
        ?.value
      ||
      ''
    )
    .trim()
    .toUpperCase();


  const name =
    String(
      document
        .getElementById(
          'populationName'
        )
        ?.value
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


  if (button) {

    button.disabled =
      true;

    button.textContent =
      'Recherche…';

  }


  try {

    const {
      data,
      error
    } =
      await finalSb().rpc(

        'eah_population_search_v3',

        {

          p_code:
            code ||
            null,

          p_name:
            name ||
            null,

          p_club_slug:
            (
              typeof CLUB_SLUG !==
              'undefined'
              ?
              CLUB_SLUG
              :
              ''
            )
            ||
            null

        }

      );


    if (error) {

      throw error;

    }


    const result =
      typeof normalizePopulationResult ===
      'function'
      ?
      normalizePopulationResult(
        data
      )
      :
      finalUnwrap(
        data
      );


    if (
      result.ok ===
      false
    ) {

      throw new Error(
        result.error
        ||
        'Recherche Population impossible.'
      );

    }


    if (
      typeof renderPopulationResults ===
      'function'
    ) {

      renderPopulationResults(

        box,

        result,

        code,

        name

      );

    }


  } catch (
    error
  ) {

    console.error(
      'EAH FINAL POPULATION:',
      error
    );


    box.innerHTML = `

      <div class="notice error">

        ${finalEsc(
          error.message ||
          'Recherche impossible.'
        )}

      </div>

    `;


  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        'Rechercher';

    }

  }

}



/* ============================================================
   REINSTALLATION DU BOUTON POPULATION

   Clonage = supprime d'anciens listeners
   éventuellement ajoutés par un cache précédent.
============================================================ */

function EAH_FINAL_INSTALL_POPULATION_BUTTON() {

  const oldButton =
    document.getElementById(
      'populationSearchButton'
    );


  if (
    !oldButton ||
    oldButton.dataset.eahFinal ===
      '1'
  ) {

    return;

  }


  const button =
    oldButton.cloneNode(
      true
    );


  button.dataset.eahFinal =
    '1';


  oldButton.replaceWith(
    button
  );


  button.addEventListener(

    'click',

    EAH_FINAL_LOAD_POPULATION

  );


  [
    'populationCode',
    'populationName'
  ]
  .forEach(
    id => {

      const oldInput =
        document.getElementById(
          id
        );


      if (
        !oldInput ||
        oldInput.dataset.eahFinal ===
          '1'
      ) {

        return;

      }


      const input =
        oldInput.cloneNode(
          true
        );


      input.value =
        oldInput.value;


      input.dataset.eahFinal =
        '1';


      oldInput.replaceWith(
        input
      );


      input.addEventListener(

        'keydown',

        event => {

          if (
            event.key ===
              'Enter'
          ) {

            event.preventDefault();

            EAH_FINAL_LOAD_POPULATION();

          }

        }

      );

    }
  );

}



/* ============================================================
   SUPPRESSION DES ANCIENS BLOCS POPULATION V3/V6
============================================================ */

function EAH_FINAL_REMOVE_OLD_POPULATION_BLOCKS() {

  [
    'eahPopulationPeopleSearch',
    'eahV62PublicSearch',
    'eahV61PublicResults'
  ]
  .forEach(
    id => {

      document
        .getElementById(
          id
        )
        ?.remove();

    }
  );

}



/* ============================================================
   GARDE SUR LE SCORE PRINCIPAL
============================================================ */

function EAH_FINAL_VERIFY_SCORE_FIELD() {

  if (
    document.getElementById(
      'scoreType'
    )
  ) {

    return;

  }


  const wa =
    document.getElementById(
      'waScore'
    );


  const label =
    wa?.closest(
      'label'
    );


  if (
    !wa ||
    !label ||
    !label.parentElement
  ) {

    return;

  }


  const wrapper =
    document.createElement(
      'label'
    );


  wrapper.innerHTML = `

    <span>
      Note principale du Grade Report
    </span>

    <select id="scoreType">

      <option value="EAH">
        EAH Diving
      </option>

      <option value="WA">
        World Aquatics
      </option>

    </select>

  `;


  label.parentElement.insertBefore(

    wrapper,

    label.nextSibling

  );

}



/* ============================================================
   GARDE VISIBILITE ACTIVATION
============================================================ */

function EAH_FINAL_VERIFY_VISIBILITY_FIELD() {

  if (
    document.getElementById(
      'setupProfileVisibility'
    )
  ) {

    return;

  }


  const button =
    document.getElementById(
      'setupProfileButton'
    );


  if (
    !button ||
    !button.parentElement
  ) {

    return;

  }


  const label =
    document.createElement(
      'label'
    );


  label.innerHTML = `

    <span>
      Visibilité du profil
    </span>

    <select id="setupProfileVisibility">

      <option
        value="PRIVÉ"
        selected
      >
        PRIVÉ
      </option>

      <option value="PUBLIC">
        PUBLIC
      </option>

    </select>

  `;


  button.parentElement.insertBefore(

    label,

    button

  );

}



/* ============================================================
   INSTALL
============================================================ */

function EAH_FINAL_INSTALL() {

  EAH_FINAL_REMOVE_OLD_POPULATION_BLOCKS();

  EAH_FINAL_INSTALL_POPULATION_BUTTON();

  EAH_FINAL_VERIFY_SCORE_FIELD();

  EAH_FINAL_VERIFY_VISIBILITY_FIELD();


  /*
    Force à nouveau la bonne fonction
    APRÈS tous les autres scripts.
  */

  try {

    window.loadPublicProfile =
      EAH_FINAL_LOAD_PUBLIC_PROFILE;


    loadPublicProfile =
      EAH_FINAL_LOAD_PUBLIC_PROFILE;


    window.loadPopulation =
      EAH_FINAL_LOAD_POPULATION;

  } catch (_) {}


  EAH_FINAL_OPEN_PUBLIC_URL()
    .catch(
      console.warn
    );

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

    () => {

      window.setTimeout(
        EAH_FINAL_INSTALL,
        100
      );

    }

  );

} else {

  window.setTimeout(
    EAH_FINAL_INSTALL,
    100
  );

}



/* ============================================================
   NAVIGATION
============================================================ */

window.addEventListener(

  'popstate',

  () => {

    EAH_FINAL_OPEN_PUBLIC_URL()
      .catch(
        console.warn
      );

  }

);


window.addEventListener(

  'hashchange',

  () => {

    if (
      window.location.hash ===
        '#profil'
    ) {

      EAH_FINAL_OPEN_PUBLIC_URL()
        .catch(
          console.warn
        );

    }


    if (
      window.location.hash ===
        '#population'
    ) {

      window.setTimeout(

        () => {

          EAH_FINAL_REMOVE_OLD_POPULATION_BLOCKS();

          EAH_FINAL_INSTALL_POPULATION_BUTTON();

        },

        100

      );

    }

  }

);


})();
