
/* ============================================================
   EAH DIVING CLUB PRO — SECURITE ET RECUPERATION V2.2
   Remplacement complet de eah-auth-securite.js

   - Consultation NFC / URL sans code supplémentaire
   - Modification du PIN : code actuel obligatoire
   - Récupération du PIN : lien validé par l'administrateur
   - Mot de passe coach : nouveau + confirmation si session Auth
   - Carte NFC coach : vérification du compte Auth associé
   - Bouton d'association de l'e-mail masqué

   Ne change pas les cartes, évaluations ou Grade Reports.
============================================================ */

(() => {
  'use strict';

  const ROOT = location.origin + location.pathname;

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const safe = value =>
    String(value ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const params = () =>
    new URLSearchParams(location.search);

  const validPin = value =>
    /^[0-9]{6,8}$/.test(String(value || ''));

  const coachClient = () =>
    typeof requireSupabase === 'function'
      ? requireSupabase()
      : null;

  const loggedCoach = () =>
    typeof state !== 'undefined' &&
    !!state.user &&
    !!state.membership;


  /* ============================================================
     CLUB ET IDENTIFICATION
  ============================================================ */

  function clubSlug() {

    const slug = (
      (
        typeof CLUB_SLUG !== 'undefined'
          ? CLUB_SLUG
          : ''
      ) ||
      params().get('club') ||
      (
        typeof state !== 'undefined'
          ? state.club?.slug
          : ''
      ) ||
      $('#eahClubChoice')?.value ||
      ''
    ).trim().toLowerCase();

    if (!slug) {
      throw new Error(
        'Sélectionne ton club avant de continuer.'
      );
    }

    return slug;
  }


  function diverId() {

    const profile =
      typeof state !== 'undefined'
        ? state.profile
        : null;

    const id =
      profile?.eahId ||
      profile?.eah_id ||
      (
        typeof CARD_EAH_ID !== 'undefined'
          ? CARD_EAH_ID
          : ''
      ) ||
      params().get('id') ||
      $('#diverEahId')?.value ||
      '';

    if (!String(id).trim()) {
      throw new Error(
        'Numéro EAH manquant.'
      );
    }

    return String(id)
      .trim()
      .toUpperCase();
  }


  /* ============================================================
     FENÊTRE DE SÉCURITÉ

     Compatible avec l'espace coach NFC.
     Le CSS de coach-card.js masque certains éléments
     directement ajoutés au body.
  ============================================================ */

  function openDialog(
    title,
    fields,
    onSubmit,
    buttonLabel = 'Confirmer'
  ) {

    $('.eah-security-overlay')?.remove();

    const overlay =
      document.createElement('div');

    overlay.className =
      'eah-security-overlay';

    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:2147483647',
      'background:rgba(1,9,18,.96)',
      'overflow:auto',
      'padding:20px',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'box-sizing:border-box',
      'visibility:visible',
      'pointer-events:auto'
    ].join(';');

    overlay.innerHTML = `
      <div
        class="access-card"
        style="
          width:min(100%,520px);
          max-height:90vh;
          overflow:auto;
          position:relative
        "
      >

        <button
          type="button"
          data-close
          aria-label="Fermer"
          style="
            position:absolute;
            right:12px;
            top:12px;
            background:transparent;
            border:0;
            color:white;
            font-size:28px;
            cursor:pointer
          "
        >×</button>

        <span class="overline">
          EAH DIVING
        </span>

        <h2 style="margin:15px 0">
          ${safe(title)}
        </h2>

        <form
          class="premium-form compact-form"
          data-security-form
        >

          ${fields.map(f => `
            <label>

              <span>
                ${safe(f.label)}
              </span>

              <input
                name="${safe(f.name)}"
                type="${safe(f.type || 'text')}"

                ${f.required === false
                  ? ''
                  : 'required'
                }

                ${f.readonly
                  ? 'readonly'
                  : ''
                }

                ${f.inputmode
                  ? 'inputmode="' +
                    safe(f.inputmode) + '"'
                  : ''
                }

                autocomplete="${
                  safe(f.autocomplete || 'off')
                }"

                value="${safe(f.value)}"
              >

            </label>
          `).join('')}

          <button
            type="submit"
            class="button"
          >
            ${safe(buttonLabel)}
          </button>

          <div
            data-status
            class="form-message"
            role="status"
            aria-live="polite"
          ></div>

        </form>
      </div>
    `;

    // Important pour l'espace coach NFC.
    const host =
      document.getElementById(
        'eahCoachCardApp'
      ) ||
      document.body;

    host.appendChild(overlay);

    const form =
      $('[data-security-form]', overlay);

    const status =
      $('[data-status]', overlay);

    $('[data-close]', overlay).onclick =
      () => overlay.remove();

    overlay.onclick = event => {
      if (event.target === overlay) {
        overlay.remove();
      }
    };

    form.onsubmit = async event => {

      event.preventDefault();

      const button =
        $('button[type="submit"]', form);

      button.disabled = true;

      status.textContent =
        'Vérification…';

      try {

        const values =
          Object.fromEntries(
            new FormData(form).entries()
          );

        await onSubmit(values, {

          close: () =>
            overlay.remove(),

          message: text => {
            status.textContent = text;
          }

        });

      } catch (error) {

        status.textContent =
          error?.message ||
          'Erreur, réessaie.';

      } finally {

        button.disabled = false;

      }
    };

    return overlay;
  }


  /* ============================================================
     APPELS SUPABASE
  ============================================================ */

  async function rpc(name, args) {

    const sb = coachClient();

    if (!sb) {
      throw new Error(
        'Supabase indisponible.'
      );
    }

    const { data, error } =
      await sb.rpc(name, args);

    if (error) {
      throw error;
    }

    if (!data?.ok) {
      throw new Error(
        data?.error ||
        'Opération refusée.'
      );
    }

    return data;
  }


  /* ============================================================
     COACH - MOT DE PASSE OUBLIÉ

     Crée une demande.
     Aucun nouveau mot de passe sans validation.
  ============================================================ */

  function coachForgot(prefill = '') {

    const email =
      typeof prefill === 'string'
        ? prefill
        : '';

    openDialog(
      'Demande de récupération Coach',

      [
        {
          name: 'email',
          label: 'Adresse e-mail du Coach',
          type: 'email',
          value:
            email ||
            $('#coachEmail')?.value ||
            '',
          autocomplete: 'email'
        }
      ],

      async (values, { close }) => {

        const address =
          String(values.email || '')
            .trim()
            .toLowerCase();

        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(address)
        ) {
          throw new Error(
            'Saisis une adresse e-mail valide.'
          );
        }

        await rpc(
          'eah_request_recovery_v1',
          {
            p_club_slug: clubSlug(),
            p_account_type: 'COACH',
            p_identifier: address
          }
        );

        close();

        alert(
          'Demande transmise.\n\n' +
          'Si le compte existe, elle sera examinée ' +
          'par l’administrateur EAH Diving ' +
          'avant tout envoi de lien.'
        );

      },

      'Envoyer ma demande'
    );
  }


  /* ============================================================
     PLONGEUR - CODE PERSONNEL OUBLIÉ
  ============================================================ */

  function diverForgot() {

    openDialog(
      'Demande de récupération plongeur',

      [
        {
          name: 'id',
          label: 'Numéro EAH du plongeur',
          value:
            $('#diverEahId')?.value ||
            (
              typeof state !== 'undefined'
                ? state.profile?.eahId
                : ''
            ) ||
            '',
          autocomplete: 'off'
        }
      ],

      async (values, { close }) => {

        const id =
          String(values.id || '')
            .trim()
            .toUpperCase();

        if (!id) {
          throw new Error(
            'Saisis ton numéro EAH.'
          );
        }

        await rpc(
          'eah_request_recovery_v1',
          {
            p_club_slug: clubSlug(),
            p_account_type: 'DIVER',
            p_identifier: id
          }
        );

        close();

        alert(
          'Demande transmise.\n\n' +
          'Si le profil existe, ' +
          'l’administrateur examinera la demande.\n\n' +
          'Ton code personnel reste inchangé.'
        );

      },

      'Envoyer ma demande'
    );
  }


  /* ============================================================
     PLONGEUR - MODIFIER LE CODE PERSONNEL

     Scan NFC : aucun code demandé.
     Consultation URL : aucun code demandé.

     Modification du code :
     - Code actuel
     - Nouveau code
     - Confirmation

     Si oublié, utiliser le lien de récupération.
  ============================================================ */

  function diverChange() {

    openDialog(
      'Modifier mon code personnel',

      [
        {
          name: 'old',
          label: 'Code personnel actuel',
          type: 'password',
          inputmode: 'numeric',
          autocomplete: 'current-password'
        },
        {
          name: 'pin',
          label:
            'Nouveau code (6 à 8 chiffres)',
          type: 'password',
          inputmode: 'numeric',
          autocomplete: 'new-password'
        },
        {
          name: 'confirm',
          label: 'Confirmer le nouveau code',
          type: 'password',
          inputmode: 'numeric',
          autocomplete: 'new-password'
        }
      ],

      async (values, { close }) => {

        if (!validPin(values.old)) {
          throw new Error(
            'Saisis ton code personnel actuel.'
          );
        }

        if (!validPin(values.pin)) {
          throw new Error(
            'Le nouveau code doit contenir ' +
            '6 à 8 chiffres.'
          );
        }

        if (
          values.pin !== values.confirm
        ) {
          throw new Error(
            'Les nouveaux codes ' +
            'ne correspondent pas.'
          );
        }

        if (
          values.old === values.pin
        ) {
          throw new Error(
            'Choisis un nouveau code différent.'
          );
        }

        await rpc(
          'eah_diver_change_pin_v1',
          {
            p_club_slug: clubSlug(),
            p_eah_id: diverId(),
            p_old_pin: values.old,
            p_new_pin: values.pin
          }
        );

        try {

          sessionStorage.removeItem(
            'EAH_DIVER_PIN_SESSION'
          );

        } catch (_) {}

        if (
          typeof state !== 'undefined'
        ) {
          state.diverPinHash = '';
        }

        close();

        alert(
          'Code personnel modifié.\n\n' +
          'Utilise ton nouveau code lors de ' +
          'ta prochaine connexion par identifiant.'
        );

      },

      'Enregistrer mon nouveau code'
    );
  }


  /* ============================================================
     ASSOCIATION E-MAIL

     Le bouton est retiré du profil plongeur.
     Les adresses déjà vérifiées sont conservées.

     Les nouveaux profils doivent continuer à disposer
     d'une adresse de référence vérifiée pour la récupération.
  ============================================================ */


  /* ============================================================
     VÉRIFIER LA SESSION AUTH COACH

     La carte NFC ne peut pas modifier le mot de passe
     d'un autre compte Supabase Auth.
  ============================================================ */

  async function ensureCoachSession(
    sb,
    options = {}
  ) {

    const {
      data: who,
      error
    } = await sb.auth.getUser();

    if (error || !who?.user) {
      throw new Error(
        'Connecte-toi à ton compte coach ' +
        'ou utilise un lien de récupération.'
      );
    }

    const {
      data: members,
      error: memberError
    } = await sb
      .from('club_members')
      .select('id,role,active')
      .eq('user_id', who.user.id)
      .eq('active', true);

    if (memberError) {
      throw memberError;
    }

    const allowed =
      (members || []).filter(m =>
        [
          'COACH',
          'RESPONSABLE',
          'ASSISTANT'
        ].includes(
          String(m.role || '')
            .toUpperCase()
        )
      );

    if (!allowed.length) {
      throw new Error(
        'Ce compte Auth ne correspond pas ' +
        'à un coach actif.'
      );
    }

    const token =
      options.cardToken || '';

    if (token) {

      const {
        data: status,
        error: statusError
      } = await sb.rpc(
        'eah_coach_auth_status_v1',
        {
          p_token: token
        }
      );

      if (statusError) {
        throw statusError;
      }

      if (
        !status?.linked ||
        status?.platformAdminAccount
      ) {
        throw new Error(
          'La session connectée ne correspond pas ' +
          'au coach de cette carte NFC.'
        );
      }
    }

    if (options.requestId) {

      const {
        data: permission,
        error: permissionError
      } = await sb.rpc(
        'eah_coach_recovery_permitted_v1',
        {
          p_request_id: options.requestId
        }
      );

      if (permissionError) {
        throw permissionError;
      }

      if (!permission?.allowed) {
        throw new Error(
          'Lien de récupération expiré ' +
          'ou non autorisé pour ce compte.'
        );
      }
    }

    return who.user;
  }


  /* ============================================================
     COACH - MODIFIER LE MOT DE PASSE

     Session Auth valide obligatoire.

     Pas de champ ancien mot de passe.
     Nouveau mot de passe + confirmation.

     Une carte NFC seule ne constitue pas
     une session Supabase Auth.
  ============================================================ */

  function coachNewPassword(
    fromRecovery = false
  ) {

    openDialog(

      fromRecovery
        ? 'Créer mon nouveau mot de passe Coach'
        : 'Modifier mon mot de passe Coach',

      [
        {
          name: 'password',
          label:
            'Nouveau mot de passe ' +
            '(12 caractères minimum)',
          type: 'password',
          autocomplete: 'new-password'
        },
        {
          name: 'confirm',
          label:
            'Confirmer mon nouveau mot de passe',
          type: 'password',
          autocomplete: 'new-password'
        }
      ],

      async (values, { close }) => {

        if (
          String(values.password || '')
            .length < 12
        ) {
          throw new Error(
            'Le mot de passe doit contenir ' +
            'au moins 12 caractères.'
          );
        }

        if (
          values.password !== values.confirm
        ) {
          throw new Error(
            'Les mots de passe sont différents.'
          );
        }

        const sb = coachClient();

        if (!sb) {
          throw new Error(
            'Supabase indisponible.'
          );
        }

        const token =
          params().get('coachToken') ||
          '';

        const requestId =
          params().get('eahCoachRecovery') ||
          '';

        await ensureCoachSession(
          sb,
          {
            cardToken: token,
            requestId:
              fromRecovery && requestId
                ? requestId
                : ''
          }
        );

        const { error } =
          await sb.auth.updateUser({
            password: values.password
          });

        if (error) {
          throw error;
        }

        // En cas de récupération, marquer la demande
        // terminée après le changement de mot de passe.
        if (
          fromRecovery &&
          requestId
        ) {

          try {

            const {
              data: done,
              error: doneError
            } = await sb.rpc(
              'eah_complete_coach_recovery_v2',
              {
                p_request_id: requestId
              }
            );

            if (
              doneError ||
              !done?.ok
            ) {
              console.warn(
                'Mot de passe changé ; ' +
                'demande à vérifier.',
                doneError
              );
            }

          } catch (e) {

            console.warn(
              'Suivi récupération coach :',
              e
            );

          }
        }

        close();

        alert(
          'Mot de passe Coach modifié ' +
          'avec succès.'
        );

        if (fromRecovery) {

          history.replaceState(
            null,
            '',
            ROOT + '#club'
          );

        }

      },

      'Enregistrer mon nouveau mot de passe'
    );
  }


  /* ============================================================
     BOUTON MOT DE PASSE DE LA CARTE NFC COACH

     - Coach Auth connecté : modification directe.
     - Coach sans session Auth : récupération proposée.
     - Autre compte Auth : changement refusé.

     Ne touche pas aux données NFC.
  ============================================================ */

  async function nfcPasswordButton() {

    try {

      const token =
        params().get('coachToken') ||
        '';

      if (!token) {
        throw new Error(
          'Carte coach introuvable.'
        );
      }

      const sb = coachClient();

      if (!sb) {
        throw new Error(
          'Supabase indisponible.'
        );
      }

      const {
        data: card,
        error: cardError
      } = await sb.rpc(
        'eah_coach_card_workspace',
        {
          p_token: token
        }
      );

      if (
        cardError ||
        !card?.assigned
      ) {
        throw new Error(
          'Carte coach non reconnue.'
        );
      }

      const {
        data: status,
        error: statusError
      } = await sb.rpc(
        'eah_coach_auth_status_v1',
        {
          p_token: token
        }
      );

      if (
        statusError ||
        !status?.ok
      ) {
        throw new Error(
          'Identité coach non vérifiée.'
        );
      }

      if (!status.hasAuthAccount) {

        alert(
          'Aucun compte Auth personnel ' +
          'n’est associé à cette carte.\n\n' +
          'Contacte l’administrateur du club.'
        );

        return;
      }

      if (
        status.linked &&
        !status.platformAdminAccount
      ) {

        coachNewPassword(false);

        return;
      }

      // Le NFC ouvre l'espace coach sans mot de passe.
      // Mais le changement de mot de passe nécessite
      // la session Auth du coach concerné.

      alert(
        'Pour modifier le mot de passe, ' +
        'connecte-toi avec ton compte coach.\n\n' +
        'Si tu l’as oublié, effectue une demande ' +
        'de récupération dans la fenêtre suivante.'
      );

      coachForgot(
        card.coach?.email ||
        ''
      );

    } catch (error) {

      alert(
        'Sécurité Coach : ' +
        (
          error?.message ||
          'Opération impossible.'
        )
      );

    }
  }


  /* ============================================================
     SÉLECTION DU CLUB

     Utilisé lorsqu'aucun club n'est défini
     dans la page ou son URL.
  ============================================================ */

  async function installClubChoice() {

    if (
      typeof CLUB_SLUG !== 'undefined' &&
      CLUB_SLUG
    ) {
      return;
    }

    if (params().get('club')) {
      return;
    }

    const sb = coachClient();

    if (!sb) return;

    const {
      data,
      error
    } = await sb
      .from('clubs')
      .select('slug,name')
      .eq('active', true)
      .order('name')
      .limit(100);

    if (
      error ||
      !data?.length
    ) {
      return;
    }

    if (data.length === 1) {

      if (
        typeof CLUB_SLUG !== 'undefined'
      ) {
        CLUB_SLUG = data[0].slug;
      }

      return;
    }

    const form =
      $('#diverLoginForm');

    if (
      !form ||
      $('#eahClubChoice')
    ) {
      return;
    }

    const label =
      document.createElement('label');

    label.innerHTML = `
      <span>Choisir mon club</span>
      <select id="eahClubChoice" required>
        <option value="">
          Sélectionner mon club
        </option>
      </select>
    `;

    const select =
      $('select', label);

    for (const club of data) {

      const option =
        document.createElement('option');

      option.value =
        club.slug;

      option.textContent =
        club.name;

      select.appendChild(option);
    }

    select.onchange = () => {

      if (
        typeof CLUB_SLUG !== 'undefined'
      ) {
        CLUB_SLUG = select.value;
      }
    };

    form.insertBefore(
      label,
      form.firstElementChild
    );
  }


  /* ============================================================
     INSTALLATION DES BOUTONS
  ============================================================ */

  function installButtons() {

    /* ========================================================
       MOT DE PASSE OUBLIÉ COACH
    ======================================================== */

    const coachForm =
      $('#coachLoginForm');

    if (
      coachForm &&
      !$('#eahCoachForgot')
    ) {

      const b =
        document.createElement('button');

      b.type = 'button';
      b.className = 'button secondary';
      b.id = 'eahCoachForgot';

      b.textContent =
        'Mot de passe oublié ?';

      b.onclick = () =>
        coachForgot();

      coachForm.appendChild(b);
    }


    /* ========================================================
       CODE PERSONNEL OUBLIÉ PLONGEUR
    ======================================================== */

    const diverForm =
      $('#diverLoginForm');

    if (
      diverForm &&
      !$('#eahDiverForgot')
    ) {

      const b =
        document.createElement('button');

      b.type = 'button';
      b.className = 'button secondary';
      b.id = 'eahDiverForgot';

      b.textContent =
        'Code personnel oublié ?';

      b.onclick =
        diverForgot;

      diverForm.appendChild(b);
    }


    /* ========================================================
       ESPACE COACH PAR CONNEXION AUTH
    ======================================================== */

    const coachArea =
      $('#coachPrivate');

    if (
      coachArea &&
      loggedCoach() &&
      !$('#eahCoachChange')
    ) {

      const b =
        document.createElement('button');

      b.type = 'button';
      b.className = 'button secondary';

      b.id =
        'eahCoachChange';

      b.textContent =
        'Modifier mon mot de passe';

      b.onclick = () =>
        coachNewPassword(false);

      $('.dashboard-actions', coachArea)
        ?.appendChild(b);
    }


    /* ========================================================
       ESPACE COACH NFC
    ======================================================== */

    const nfcPanel =
      $('#eahCoachCardApp .coach-card-panel');

    if (
      nfcPanel &&
      !$('#eahNfcPassword')
    ) {

      const b =
        document.createElement('button');

      b.type = 'button';
      b.className = 'button secondary';

      b.id =
        'eahNfcPassword';

      b.textContent =
        'Gérer mon mot de passe Coach';

      b.style.marginTop =
        '14px';

      b.onclick = () =>
        nfcPasswordButton();

      nfcPanel.appendChild(b);
    }


    /* ========================================================
       ESPACE PERSONNEL PLONGEUR

       Le bouton doit apparaître uniquement
       dans l'espace personnel, pas sur le profil public.
    ======================================================== */

    const profile =
      $('#profileView');

    const privateLabel =
      profile?.querySelector(
        '.eah-fast-profile .overline'
      );

    if (
      profile &&
      profile.children.length &&
      privateLabel?.textContent?.includes(
        'ESPACE PERSONNEL EAH'
      ) &&
      typeof state !== 'undefined' &&
      state.profile &&
      !$('#eahDiverSecurity')
    ) {

      const area =
        document.createElement('div');

      area.id =
        'eahDiverSecurity';

      area.className =
        'dashboard-card';

      area.style.cssText =
        'margin-top:24px;padding:22px';

      const heading =
        document.createElement('h3');

      heading.textContent =
        'Sécurité de mon profil';

      area.appendChild(heading);

      // Seul bouton demandé.
      const b =
        document.createElement('button');

      b.type =
        'button';

      b.className =
        'button secondary';

      b.style.margin =
        '8px 8px 0 0';

      b.textContent =
        'Modifier mon code personnel';

      b.onclick =
        diverChange;

      area.appendChild(b);

      // Pas de bouton "Associer mon e-mail".
      profile.appendChild(area);

    }
  }


  /* ============================================================
     LIENS DE RÉCUPÉRATION COACH

     Supabase Auth confirme l'identité du compte.
     Les demandes approuvées sont vérifiées côté serveur.
  ============================================================ */

  let coachRecoveryDialogShown = false;

  function handleAuthEvent(event) {

    const sb =
      coachClient();

    if (!sb) return;

    const query =
      params();

    const hasRecoveryParam =
      query.has('eahCoachRecovery');

    const hasInviteParam =
      query.has('eahCoachInvite');

    const canOpen =
      event === 'PASSWORD_RECOVERY' ||
      (
        (
          event === 'SIGNED_IN' ||
          event === 'INITIAL_SESSION'
        ) &&
        (
          hasRecoveryParam ||
          hasInviteParam
        )
      );

    if (
      !canOpen ||
      coachRecoveryDialogShown
    ) {
      return;
    }

    coachRecoveryDialogShown = true;

    setTimeout(async () => {

      try {

        await ensureCoachSession(
          sb,
          {}
        );

        if (
          !$('.eah-security-overlay')
        ) {
          coachNewPassword(true);
        }

      } catch (err) {

        coachRecoveryDialogShown = false;

        console.warn(
          'Récupération Coach :',
          err?.message || err
        );

      }

    }, 350);
  }


  /* ============================================================
     DÉMARRAGE
  ============================================================ */

  function init() {

    installClubChoice()
      .catch(console.warn);

    installButtons();

    const observer =
      new MutationObserver(
        () => installButtons()
      );

    for (const id of [
      'coachPrivate',
      'profileView'
    ]) {

      const el =
        document.getElementById(id);

      if (el) {

        observer.observe(el, {
          childList: true,
          subtree: false,
          attributes: true,
          attributeFilter: ['class']
        });
      }
    }

    let tries = 0;

    const timer =
      setInterval(() => {

        installButtons();

        if (++tries >= 120) {
          clearInterval(timer);
        }

      }, 500);

    const sb =
      coachClient();

    if (sb) {

      sb.auth.onAuthStateChange(
        event => {

          handleAuthEvent(event);

          setTimeout(
            installButtons,
            0
          );

        }
      );

      if (
        params().has('eahCoachRecovery') ||
        params().has('eahCoachInvite')
      ) {

        setTimeout(
          () =>
            handleAuthEvent(
              'INITIAL_SESSION'
            ),
          900
        );

      }
    }
  }


  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      init,
      {
        once: true
      }
    );

  } else {

    init();

  }

})();
