
/* =====================================================
   EAH DIVING CLUB PRO
   AUTHENTIFICATION ET RECUPERATION V1

   Compatible avec restauration-17h et correctif.
   Ne change ni le design ni les cartes NFC.
===================================================== */

(() => {
  'use strict';

  const cfg = window.EAH_CONFIG || {};
  const ROOT =
    window.location.origin + window.location.pathname;

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const escapeAttr = value =>
    String(value ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const validPin = pin =>
    /^[0-9]{6,8}$/.test(pin);

  const coachClient = () =>
    typeof requireSupabase === 'function'
      ? requireSupabase()
      : null;

  const loggedCoach = () =>
    typeof state !== 'undefined' &&
    !!state.user &&
    !!state.membership;

  // Session differente de la session Coach.
  const diverClient = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        storageKey: 'eah-diver-recovery-v1',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    }
  );

  /* ===================================================
     FENETRE INTEGREE AU DESIGN EXISTANT
  =================================================== */

  function openDialog(
    title,
    fields,
    onSubmit,
    buttonLabel = 'Confirmer'
  ) {
    $('.eah-security-overlay')?.remove();

    const overlay = document.createElement('div');

    overlay.className = 'eah-security-overlay';

    overlay.style.cssText = `
      position:fixed;
      inset:0;
      z-index:2147483647;
      background:rgba(1,9,18,.96);
      overflow:auto;
      padding:20px;
      display:flex;
      align-items:center;
      justify-content:center;
      box-sizing:border-box;
    `;

    overlay.innerHTML = `
      <div class="access-card"
        style="
          width:min(100%,520px);
          max-height:90vh;
          overflow:auto;
          position:relative;
        ">

        <button type="button"
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
            cursor:pointer;
          ">×</button>

        <span class="overline">EAH DIVING</span>
        <h2 style="margin:15px 0">${title}</h2>

        <form class="premium-form compact-form"
          data-security-form>

          ${fields.map(f => `
            <label>
              <span>${f.label}</span>
              <input
                name="${f.name}"
                type="${f.type || 'text'}"
                ${f.required === false ? '' : 'required'}
                ${f.readonly ? 'readonly' : ''}
                ${f.inputmode
                  ? 'inputmode="' + f.inputmode + '"'
                  : ''}
                autocomplete="${f.autocomplete || 'off'}"
                value="${escapeAttr(f.value)}"
              >
            </label>
          `).join('')}

          <button type="submit" class="button">
            ${buttonLabel}
          </button>

          <div data-status
            class="form-message"
            role="status"
            aria-live="polite"></div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const form = $('[data-security-form]', overlay);
    const status = $('[data-status]', overlay);

    $('[data-close]', overlay).onclick =
      () => overlay.remove();

    overlay.onclick = event => {
      if (event.target === overlay) overlay.remove();
    };

    form.onsubmit = async event => {
      event.preventDefault();

      const button = $('button[type=submit]', form);
      button.disabled = true;
      status.textContent = 'Vérification…';

      try {
        const values = Object.fromEntries(
          new FormData(form).entries()
        );

        await onSubmit(values, {
          close: () => overlay.remove(),
          message: text => {
            status.textContent = text;
          }
        });
      } catch (error) {
        status.textContent =
          error.message || 'Erreur, réessaie.';
      } finally {
        button.disabled = false;
      }
    };

    return overlay;
  }

  /* ===================================================
     CLUB ET PROFIL
  =================================================== */

  function clubSlug() {
    const slug =
      typeof CLUB_SLUG === 'string'
        ? CLUB_SLUG
        : '';

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
      $('#diverEahId')?.value;

    if (!id) {
      throw new Error('Numéro EAH manquant.');
    }

    return String(id).trim().toUpperCase();
  }

  async function diverRpc(
    functionName,
    args
  ) {
    const { data, error } =
      await diverClient.rpc(functionName, args);

    if (error) throw error;

    if (!data?.ok) {
      throw new Error(
        data?.error || 'Opération refusée.'
      );
    }

    return data;
  }

  /* ===================================================
     CODES E-MAIL SUPABASE
  =================================================== */

  async function sendEmailCode(
    email,
    createUser
  ) {
    const { error } =
      await diverClient.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: createUser
        }
      });

    if (error) throw error;
  }

  async function verifyEmailCode(email, token) {
    if (!/^\d{6,8}$/.test(token.trim())) {
      throw new Error(
        'Saisis le code reçu par e-mail.'
      );
    }

    const { error } =
      await diverClient.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: 'email'
      });

    if (error) throw error;
  }

  /* ===================================================
     COACH — MOT DE PASSE OUBLIE
  =================================================== */

  function coachForgot() {
    openDialog(
      'Mot de passe Coach oublié',
      [
        {
          name: 'email',
          label: 'Adresse e-mail du Coach',
          type: 'email',
          value: $('#coachEmail')?.value || '',
          autocomplete: 'email'
        }
      ],
      async ({ email }, { close }) => {
        const sb = coachClient();

        if (!sb) {
          throw new Error('Supabase indisponible.');
        }

        const { error } =
          await sb.auth.resetPasswordForEmail(
            email.trim(),
            {
              redirectTo:
                ROOT + '?eahCoachRecovery=1'
            }
          );

        if (error) throw error;

        close();

        alert(
          'Si ce compte existe, un e-mail de ' +
          'réinitialisation sera envoyé.'
        );
      },
      'Recevoir le lien sécurisé'
    );
  }

  /* ===================================================
     COACH — MODIFIER / REINITIALISER
  =================================================== */

  function coachNewPassword(
    fromRecovery = false
  ) {
    const fields = fromRecovery
      ? []
      : [
          {
            name: 'old',
            label: 'Mot de passe actuel',
            type: 'password',
            autocomplete: 'current-password'
          }
        ];

    fields.push(
      {
        name: 'password',
        label: 'Nouveau mot de passe (12 caractères minimum)',
        type: 'password',
        autocomplete: 'new-password'
      },
      {
        name: 'confirm',
        label: 'Confirmer le nouveau mot de passe',
        type: 'password',
        autocomplete: 'new-password'
      }
    );

    openDialog(
      fromRecovery
        ? 'Créer un nouveau mot de passe Coach'
        : 'Modifier mon mot de passe Coach',
      fields,
      async (values, { close }) => {
        if (values.password.length < 12) {
          throw new Error(
            'Utilise au moins 12 caractères.'
          );
        }

        if (values.password !== values.confirm) {
          throw new Error(
            'Les mots de passe ne correspondent pas.'
          );
        }

        const sb = coachClient();

        if (!sb) {
          throw new Error('Supabase indisponible.');
        }

        const {
          data: who,
          error: whoError
        } = await sb.auth.getUser();

        if (whoError || !who?.user) {
          throw new Error(
            'Ouvre ton lien de récupération ' +
            'ou connecte-toi.'
          );
        }

        if (!fromRecovery) {
          const { error } =
            await sb.auth.signInWithPassword({
              email: who.user.email,
              password: values.old
            });

          if (error) {
            throw new Error(
              'Le mot de passe actuel est incorrect.'
            );
          }
        }

        const { error } =
          await sb.auth.updateUser({
            password: values.password
          });

        if (error) throw error;

        close();
        alert('Mot de passe Coach modifié.');

        if (fromRecovery) {
          history.replaceState(
            null, '', ROOT + '#club'
          );
        }
      },
      'Enregistrer le mot de passe'
    );
  }

  /* ===================================================
     PLONGEUR — MODIFIER SON CODE
  =================================================== */

  function diverChange() {
    openDialog(
      'Modifier mon code personnel',
      [
        {
          name: 'old',
          label: 'Ancien code personnel',
          type: 'password',
          inputmode: 'numeric'
        },
        {
          name: 'pin',
          label: 'Nouveau code (6 à 8 chiffres)',
          type: 'password',
          inputmode: 'numeric'
        },
        {
          name: 'confirm',
          label: 'Confirmer le nouveau code',
          type: 'password',
          inputmode: 'numeric'
        }
      ],
      async (values, { close }) => {
        if (
          !validPin(values.pin) ||
          values.pin !== values.confirm
        ) {
          throw new Error(
            'Codes différents ou nouveau code invalide.'
          );
        }

        await diverRpc(
          'eah_diver_change_pin_v1',
          {
            p_club_slug: clubSlug(),
            p_eah_id: diverId(),
            p_old_pin: values.old,
            p_new_pin: values.pin
          }
        );

        close();

        alert(
          'Code personnel changé. ' +
          'Reconnecte-toi avec le nouveau code.'
        );
      },
      'Modifier mon code'
    );
  }

  /* ===================================================
     PLONGEUR — ASSOCIER SON E-MAIL
  =================================================== */

  
/* ===================================================
   PLONGEUR — ENREGISTRER SON E-MAIL
   Compatible avec les profils existants
=================================================== */

function diverRegisterEmail() {

  openDialog(
    'Enregistrer mon e-mail de récupération',
    [
      {
        name: 'email',
        label: 'Adresse e-mail du plongeur ou responsable légal',
        type: 'email',
        autocomplete: 'email'
      },
      {
        name: 'pin',
        label: 'Code personnel actuel',
        type: 'password',
        inputmode: 'numeric'
      }
    ],

    async (values, { close }) => {

      const email = String(
        values.email || ''
      ).trim().toLowerCase();

      const pin = String(
        values.pin || ''
      ).trim();

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        throw new Error(
          'Adresse e-mail invalide.'
        );
      }

      if (!/^[0-9]{4,8}$/.test(pin)) {
        throw new Error(
          'Saisis ton code personnel actuel.'
        );
      }

      const sb = coachClient();

      if (!sb) {
        throw new Error(
          'Connexion Supabase indisponible.'
        );
      }

      const currentState =
        typeof state !== 'undefined'
          ? state
          : {};

      const slug = String(
        (
          typeof CLUB_SLUG !== 'undefined'
            ? CLUB_SLUG
            : ''
        ) ||
        currentState.profile?.club_slug ||
        currentState.profile?.clubSlug ||
        currentState.club?.slug ||
        new URLSearchParams(
          window.location.search
        ).get('club') ||
        ''
      ).trim();

      if (!slug) {
        throw new Error(
          'Sélectionne ton club avant de continuer.'
        );
      }

      const { data, error } =
        await sb.rpc(
          'eah_diver_set_pending_email_v1',
          {
            p_club_slug: slug,
            p_eah_id: diverId(),
            p_pin: pin,
            p_email: email
          }
        );

      if (error) {
        throw error;
      }

      if (!data?.ok) {
        throw new Error(
          data?.error ||
          'Enregistrement impossible.'
        );
      }

      close();

      alert(
        'Adresse e-mail enregistrée avec succès.\n\n' +
        'Elle est en attente de vérification.\n' +
        'Aucun mot de passe ni carte NFC ' +
        'n’a été modifié.'
      );
    },

    'Enregistrer mon e-mail'
  );
}


  /* ===================================================
     PLONGEUR — CODE OUBLIE
  =================================================== */

  function diverForgot() {
    openDialog(
      'Code personnel oublié',
      [
        {
          name: 'id',
          label: 'Numéro EAH',
          value: $('#diverEahId')?.value || ''
        },
        {
          name: 'email',
          label: 'E-mail de récupération déjà vérifié',
          type: 'email',
          autocomplete: 'email'
        }
      ],
      async (values, { close }) => {
        const id =
          values.id.trim().toUpperCase();

        const slug = clubSlug();

        const email =
          values.email.trim().toLowerCase();

        if (!id) {
          throw new Error(
            'Numéro EAH obligatoire.'
          );
        }

        await sendEmailCode(email, false);

        close();

        openDialog(
          'Réinitialiser mon code personnel',
          [
            {
              name: 'otp',
              label: 'Code reçu par e-mail',
              inputmode: 'numeric',
              autocomplete: 'one-time-code'
            },
            {
              name: 'pin',
              label: 'Nouveau code (6 à 8 chiffres)',
              type: 'password',
              inputmode: 'numeric'
            },
            {
              name: 'confirm',
              label: 'Confirmer le nouveau code',
              type: 'password',
              inputmode: 'numeric'
            }
          ],
          async (step, { close: done }) => {
            if (
              !validPin(step.pin) ||
              step.pin !== step.confirm
            ) {
              throw new Error(
                'Nouveau code invalide ou confirmation différente.'
              );
            }

            await verifyEmailCode(
              email, step.otp
            );

            await diverRpc(
              'eah_diver_reset_pin_v1',
              {
                p_club_slug: slug,
                p_eah_id: id,
                p_new_pin: step.pin
              }
            );

            done();

            alert(
              'Code réinitialisé. ' +
              'Tu peux maintenant te connecter.'
            );
          },
          'Valider et réinitialiser'
        );
      },
      'Recevoir un code e-mail'
    );
  }

  /* ===================================================
     SELECTION AUTOMATIQUE DU CLUB
  =================================================== */

  async function installClubChoice() {
    if (
      typeof CLUB_SLUG !== 'undefined' &&
      CLUB_SLUG
    ) {
      return;
    }

    const sb = coachClient();
    if (!sb) return;

    const { data, error } =
      await sb
        .from('clubs')
        .select('slug,name')
        .eq('active', true)
        .order('name')
        .limit(100);

    if (error || !data?.length) return;

    if (data.length === 1) {
      CLUB_SLUG = data[0].slug;
      return;
    }

    const form = $('#diverLoginForm');

    if (!form || $('#eahClubChoice')) {
      return;
    }

    const label = document.createElement('label');

    label.innerHTML = `
      <span>Choisir mon club</span>
      <select id="eahClubChoice" required>
        <option value="">Sélectionner mon club</option>
      </select>
    `;

    const select = $('select', label);

    for (const club of data) {
      const option = document.createElement('option');
      option.value = club.slug;
      option.textContent = club.name;
      select.appendChild(option);
    }

    select.onchange = () => {
      CLUB_SLUG = select.value;
    };

    form.insertBefore(label, form.firstElementChild);
  }

  /* ===================================================
     AJOUT DES BOUTONS SANS MODIFIER LE DESIGN
  =================================================== */

  function installButtons() {
    const coachForm = $('#coachLoginForm');

    if (coachForm && !$('#eahCoachForgot')) {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'button secondary';
      button.id = 'eahCoachForgot';
      button.textContent = 'Mot de passe oublié ?';
      button.onclick = coachForgot;

      coachForm.appendChild(button);
    }

    const diverForm = $('#diverLoginForm');

    if (diverForm && !$('#eahDiverForgot')) {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'button secondary';
      button.id = 'eahDiverForgot';
      button.textContent = 'Code personnel oublié ?';
      button.onclick = diverForgot;

      diverForm.appendChild(button);
    }

    const coachArea = $('#coachPrivate');

    if (
      coachArea &&
      loggedCoach() &&
      !$('#eahCoachChange')
    ) {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'button secondary';
      button.id = 'eahCoachChange';
      button.textContent =
        'Modifier mon mot de passe';

      button.onclick = () =>
        coachNewPassword(false);

      $('.dashboard-actions', coachArea)
        ?.appendChild(button);
    }

    // Bouton dans le parcours Coach NFC.
    const nfcPanel =
      $('#eahCoachCardApp .coach-card-panel');

    if (nfcPanel && !$('#eahNfcPassword')) {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'button secondary';
      button.id = 'eahNfcPassword';

      button.textContent =
        'Gérer mon mot de passe Coach';

      button.style.marginTop = '14px';

      button.onclick = async () => {
        const sb = coachClient();

        if (!sb) {
          alert('Supabase indisponible.');
          return;
        }

        const { data } = await sb.auth.getUser();

        if (data?.user) {
          coachNewPassword(false);
        } else {
          coachForgot();
        }
      };

      nfcPanel.appendChild(button);
    }

    // Options dans le profil plongeur.
    const profile = $('#profileView');

    if (
      profile &&
      profile.children.length &&
      typeof state !== 'undefined' &&
      state.profile &&
      !$('#eahDiverSecurity')
    ) {
      const area = document.createElement('div');

      area.id = 'eahDiverSecurity';
      area.className = 'dashboard-card';

      area.style.cssText =
        'margin-top:24px;padding:22px';

      const heading = document.createElement('h3');
      heading.textContent = 'Sécurité de mon profil';

      area.appendChild(heading);

      const actions = [
        [
          'Modifier mon code personnel',
          diverChange
        ],
        [
          'Associer mon e-mail de récupération',
          diverRegisterEmail
        ]
      ];

      for (const [label, handler] of actions) {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'button secondary';
        button.style.margin = '8px 8px 0 0';
        button.textContent = label;
        button.onclick = handler;

        area.appendChild(button);
      }

      profile.appendChild(area);
    }
  }

  /* ===================================================
     DEMARRAGE
  =================================================== */

  function init() {
    installClubChoice().catch(console.warn);
    installButtons();

    const observer = new MutationObserver(
      installButtons
    );

    for (const id of [
      'coachPrivate',
      'profileView'
    ]) {
      const element = document.getElementById(id);

      if (element) {
        observer.observe(element, {
          childList: true,
          subtree: false,
          attributes: true,
          attributeFilter: ['class']
        });
      }
    }

    let attempts = 0;

    const scan = setInterval(() => {
      installButtons();

      if (++attempts >= 30) {
        clearInterval(scan);
      }
    }, 500);

    const sb = coachClient();

    if (sb) {
      sb.auth.onAuthStateChange(event => {
        if (event === 'PASSWORD_RECOVERY') {
          setTimeout(
            () => coachNewPassword(true),
            0
          );
        }

        setTimeout(installButtons, 0);
      });

      if (
        new URLSearchParams(
          location.search
        ).has('eahCoachRecovery')
      ) {
        setTimeout(async () => {
          const { data } = await sb.auth.getUser();

          if (
            data?.user &&
            !$('.eah-security-overlay')
          ) {
            coachNewPassword(true);
          }
        }, 700);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
