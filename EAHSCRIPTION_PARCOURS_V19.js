
/*
 * EAH DIVING — INSCRIPTION V19
 * Branche recuperation-eah-20261009
 *
 * - Bouton création de profil à l'accueil
 * - Bouton création dans Faire grader
 * - Vérification du profil avant soumission
 * - Redirection si aucun profil associé
 */

(() => {
  'use strict';

  const PAGE = 'eah-inscription.html';

  const $ = id =>
    document.getElementById(id);

  let approved = false;
  let busy = false;

  function getClient() {
    if (
      typeof supabaseClient !== 'undefined' &&
      supabaseClient
    ) {
      return supabaseClient;
    }

    const config = window.EAH_CONFIG;

    if (
      !window.supabase?.createClient ||
      !config?.SUPABASE_URL ||
      !config?.SUPABASE_PUBLISHABLE_KEY
    ) {
      throw new Error(
        'Supabase n’est pas disponible.'
      );
    }

    return window.supabase.createClient(
      config.SUPABASE_URL,
      config.SUPABASE_PUBLISHABLE_KEY
    );
  }

  function addButton(container) {
    if (!container || container.querySelector(
      '.eah-v19-register'
    )) {
      return;
    }

    const link = document.createElement('a');

    link.className =
      'button secondary eah-v19-register';

    link.href = PAGE;
    link.textContent = 'Créer un profil';

    container.appendChild(link);
  }

  function buttons() {
    // Bouton sur la page d'accueil.

    addButton(
      document.querySelector(
        '#accueil .hero-actions'
      )
    );

    // Bouton juste au-dessus du formulaire public.

    const form = $('publicGradingForm');

    if (
      form &&
      !$('eah-v19-public-register')
    ) {
      const box = document.createElement('div');
      box.id = 'eah-v19-public-register';

      box.style.margin = '0 0 24px';

      const title = document.createElement('h3');
      title.textContent =
        'Vous n’avez pas encore de profil EAH ?';

      const text = document.createElement('p');
      text.textContent =
        'Créez votre profil pour faire grader vos plongeons.';

      const link = document.createElement('a');
      link.href = PAGE;
      link.className = 'button secondary';
      link.textContent = 'Créer mon profil EAH';

      box.append(title, text, link);

      form.parentNode.insertBefore(
        box, form
      );
    }
  }

  function showMessage(message, redirect) {
    let box = $('eah-v19-check-message');

    if (!box) {
      box = document.createElement('div');
      box.id = 'eah-v19-check-message';
      box.setAttribute('role', 'alert');

      box.style.cssText = [
        'margin-top:15px',
        'padding:18px',
        'border-radius:12px',
        'background:#42212b',
        'color:#fff',
        'border:1px solid #ad5764'
      ].join(';');

      $('publicGradingForm')?.appendChild(box);
    }

    box.replaceChildren();

    const p = document.createElement('p');
    p.textContent = message;
    box.appendChild(p);

    if (redirect) {
      const link = document.createElement('a');
      link.href = PAGE + '?source=grading';
      link.className = 'button';
      link.textContent = 'Créer mon profil';

      box.appendChild(link);
    }

    box.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  async function verifiedEmail(db, email) {
    const { data, error } =
      await db.auth.getUser();

    if (
      error ||
      !data?.user?.email_confirmed_at ||
      data.user.email.toLowerCase() !==
        email.toLowerCase()
    ) {
      return false;
    }

    return true;
  }

  async function checkProfile(event) {
    if (approved) {
      return;
    }

    // Empêche la fonction originale
    // de créer une demande sans vérification.
    event.preventDefault();
    event.stopImmediatePropagation();

    if (busy) return;

    const first = $('publicFirstName')?.value.trim();
    const last = $('publicLastName')?.value.trim();
    const email = $('publicEmail')?.value.trim();

    if (!first || !last || !email) {
      showMessage(
        'Renseignez votre prénom, nom et adresse e-mail.',
        false
      );
      return;
    }

    busy = true;

    try {
      const db = getClient();

      if (!(await verifiedEmail(db, email))) {
        const { error } =
          await db.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: true,
              emailRedirectTo:
                location.origin +
                location.pathname +
                location.search
            }
          });

        if (error) throw error;

        showMessage(
          'Un lien de vérification vient d’être ' +
          'demandé pour cet e-mail. ' +
          'Ouvrez le lien reçu, revenez au formulaire ' +
          'et renvoyez votre demande.',
          false
        );

        return;
      }

      const { data, error } = await db.rpc(
        'eah_v19_profile_status',
        {
          p_first_name: first,
          p_last_name: last
        }
      );

      if (error) throw error;

      if (data?.status !== 'EXISTS') {
        showMessage(
          'Compte EAH non trouvé pour cet e-mail vérifié. ' +
          'Si vous possédez déjà une carte EAH, ' +
          'faites associer votre e-mail au profil existant. ' +
          'Sinon, créez votre profil.',
          true
        );

        return;
      }

      // L'utilisateur dispose d'un profil reconnu.
      // Reprise du formulaire existant.
      approved = true;

      try {
        $('publicGradingForm').requestSubmit();
      } finally {
        approved = false;
      }

    } catch (error) {
      showMessage(
        error.message || 'Vérification impossible.',
        false
      );

    } finally {
      busy = false;
    }
  }

  function start() {
    buttons();

    const form = $('publicGradingForm');

    if (!form) return;

    // Capture l'envoi avant le code existant.
    form.addEventListener(
      'submit',
      checkProfile,
      true
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      start,
      { once: true }
    );
  } else {
    start();
  }
})();
