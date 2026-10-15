
/*
 * EAH DIVING — INSCRIPTION V19
 * Branche : recuperation-eah-20261009
 *
 * Boutons Créer un profil
 * Vérification d'un profil existant
 * E-mail vérifié via Supabase
 * Contrôle avant l'envoi du grading
 */

(() => {
  'use strict';

  const INSCRIPTION = 'eah-inscription.html';

  const $ = id => document.getElementById(id);

  let validated = false;
  let checking = false;

  function database() {
    if (
      typeof supabaseClient !== 'undefined' &&
      supabaseClient
    ) {
      return supabaseClient;
    }

    const cfg = window.EAH_CONFIG;

    if (
      !window.supabase?.createClient ||
      !cfg?.SUPABASE_URL ||
      !cfg?.SUPABASE_PUBLISHABLE_KEY
    ) {
      throw new Error(
        'Connexion Supabase indisponible.'
      );
    }

    return window.supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_PUBLISHABLE_KEY
    );
  }

  function registerLink() {
    return INSCRIPTION + '?source=grading';
  }

  function addHomeButton() {
    const actions = document.querySelector(
      '#accueil .hero-actions'
    );

    if (
      !actions ||
      document.getElementById('eahV19Home')
    ) {
      return;
    }

    const link = document.createElement('a');

    link.id = 'eahV19Home';
    link.href = INSCRIPTION;
    link.className = 'button secondary';
    link.textContent = 'Créer un profil';

    actions.appendChild(link);
  }

  function addGradingButton() {
    const form = $('publicGradingForm');

    if (
      !form ||
      $('eahV19GradingRegister')
    ) {
      return;
    }

    const panel = document.createElement('div');
    panel.id = 'eahV19GradingRegister';

    panel.style.cssText = [
      'padding:20px',
      'margin-bottom:22px',
      'background:rgba(6,30,51,.92)',
      'border:1px solid rgba(48,207,255,.3)',
      'border-radius:16px'
    ].join(';');

    const title = document.createElement('h3');
    title.textContent =
      'Vous n’avez pas encore de profil EAH ?';

    const description = document.createElement('p');
    description.textContent =
      'Créez votre profil et choisissez ' +
      'votre offre avec paiement fictif.';

    const link = document.createElement('a');
    link.href = registerLink();
    link.className = 'button secondary';
    link.textContent = 'Créer mon profil EAH';

    panel.append(title, description, link);

    form.before(panel);
  }

  function showMessage(text, register) {
    const form = $('publicGradingForm');
    if (!form) return;

    let box = $('eahV19Message');

    if (!box) {
      box = document.createElement('div');
      box.id = 'eahV19Message';

      box.style.cssText = [
        'padding:16px',
        'margin:16px 0',
        'border:1px solid #52799a',
        'background:#12344d',
        'border-radius:12px',
        'color:white'
      ].join(';');

      const emailLabel =
        $('publicEmail')?.closest('label');

      if (emailLabel) {
        emailLabel.after(box);
      } else {
        form.prepend(box);
      }
    }

    box.replaceChildren();

    const p = document.createElement('p');
    p.textContent = text;
    box.appendChild(p);

    if (register) {
      const link = document.createElement('a');
      link.href = registerLink();
      link.className = 'button';
      link.textContent = 'Créer mon compte EAH';

      box.appendChild(link);
    }
  }

  async function checkAccount() {
    if (checking) return false;

    checking = true;

    try {
      const first =
        $('publicFirstName')?.value.trim() || '';

      const last =
        $('publicLastName')?.value.trim() || '';

      const email =
        $('publicEmail')?.value.trim().toLowerCase()
        || '';

      if (!first || !last || !email) {
        showMessage(
          'Renseignez votre prénom, ' +
          'votre nom et votre adresse e-mail.',
          false
        );

        return false;
      }

      const db = database();

      const { data: auth, error: authError } =
        await db.auth.getUser();

      const user = authError ? null : auth?.user;

      if (
        !user ||
        !user.email_confirmed_at ||
        user.email?.toLowerCase() !== email
      ) {
        showMessage(
          'Vérification de l’adresse e-mail ' +
          'nécessaire. Envoi du lien de connexion…',
          false
        );

        const { error } =
          await db.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: true,
              emailRedirectTo:
                location.origin +
                location.pathname +
                '#faire-grader'
            }
          });

        if (error) throw error;

        showMessage(
          'Consultez votre boîte e-mail, ouvrez ' +
          'le lien reçu puis revenez vérifier ' +
          'votre profil.',
          false
        );

        return false;
      }

      const { data, error } = await db.rpc(
        'eah_v19_profile_status',
        {
          p_first_name: first,
          p_last_name: last
        }
      );

      if (error) throw error;

      if (
        !data?.ok ||
        data.status !== 'EXISTS'
      ) {
        showMessage(
          'Aucun profil EAH associé à ' +
          'cette adresse e-mail vérifiée. ' +
          'Si vous avez déjà une carte EAH, ' +
          'demandez le rattachement de votre ' +
          'e-mail avant de créer un doublon.',
          true
        );

        return false;
      }

      showMessage(
        'Profil EAH reconnu : ' +
        data.eah_id +
        '. Vous pouvez envoyer votre demande.',
        false
      );

      return true;

    } catch (error) {
      showMessage(
        error.message ||
        'Vérification du profil impossible.',
        false
      );

      return false;

    } finally {
      checking = false;
    }
  }

  function addCheckButton() {
    const emailLabel =
      $('publicEmail')?.closest('label');

    if (
      !emailLabel ||
      $('eahV19CheckProfile')
    ) {
      return;
    }

    const button = document.createElement('button');

    button.type = 'button';
    button.id = 'eahV19CheckProfile';
    button.className = 'button secondary';
    button.textContent = 'Vérifier mon profil EAH';

    button.style.marginTop = '12px';

    button.addEventListener(
      'click',
      async () => {
        await checkAccount();
      }
    );

    emailLabel.after(button);
  }

  async function onFormSubmit(event) {
    if (validated) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const form = $('publicGradingForm');

    if (!form) return;

    const ok = await checkAccount();

    if (!ok) return;

    validated = true;

    try {
      // Redonne la main au formulaire d'origine.
      // Supabase vérifie également le profil
      // avec eah_v19_submit_verified.
      form.requestSubmit();
    } finally {
      validated = false;
    }
  }

  function init() {
    addHomeButton();
    addGradingButton();
    addCheckButton();

    const form = $('publicGradingForm');

    if (form) {
      form.addEventListener(
        'submit',
        onFormSubmit,
        true
      );
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
