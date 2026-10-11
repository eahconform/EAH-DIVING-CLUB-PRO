
/* =====================================================
   EAH DIVING - RECOVERY LINKS V2
   Vérification e-mail et réinitialisation PIN
   Aucun secret dans GitHub
===================================================== */

(() => {
  'use strict';

  const cfg = window.EAH_CONFIG || {};
  const params = new URLSearchParams(
    window.location.search
  );

  const emailToken = params.get('eahVerifyEmail');
  const pinToken = params.get('eahResetPin');

  if (!emailToken && !pinToken) return;

  if (!window.supabase || !cfg.SUPABASE_URL ||
      !cfg.SUPABASE_PUBLISHABLE_KEY) {
    console.error('Supabase indisponible.');
    return;
  }

  // Retire le jeton de l'URL visible.
  params.delete('eahVerifyEmail');
  params.delete('eahResetPin');

  history.replaceState(
    null,
    '',
    location.pathname +
    (params.toString() ? '?' + params : '') +
    location.hash
  );

  const sb = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        storageKey: 'eah-recovery-link-v2',
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );

  function make(tag, value, parent) {
    const el = document.createElement(tag);

    if (value != null) {
      el.textContent = value;
    }

    if (parent) parent.appendChild(el);

    return el;
  }

  function showDialog() {
    const overlay = make('div');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:2147483647',
      'background:rgba(1,9,18,.96)',
      'display:flex',
      'justify-content:center',
      'align-items:center',
      'overflow:auto',
      'padding:18px'
    ].join(';');

    const box = make('div', null, overlay);
    box.style.cssText = [
      'width:100%',
      'max-width:480px',
      'background:#061e33',
      'color:white',
      'padding:28px',
      'border-radius:20px',
      'box-sizing:border-box',
      'border:1px solid #0b6bff'
    ].join(';');

    make('h2',
      emailToken
        ? 'Vérifier mon adresse e-mail'
        : 'Créer un nouveau code personnel',
      box
    );

    make('p',
      emailToken
        ? 'Confirme la vérification de ton adresse.'
        : 'Choisis un nouveau code de 6 à 8 chiffres.',
      box
    );

    const form = make('form', null, box);

    let pin;
    let confirm;

    if (pinToken) {
      pin = make('input', null, form);
      pin.type = 'password';
      pin.inputMode = 'numeric';
      pin.autocomplete = 'new-password';
      pin.placeholder = 'Nouveau code personnel';
      pin.required = true;
      pin.pattern = '[0-9]{6,8}';

      confirm = make('input', null, form);
      confirm.type = 'password';
      confirm.inputMode = 'numeric';
      confirm.autocomplete = 'new-password';
      confirm.placeholder = 'Confirmer le code';
      confirm.required = true;
      confirm.pattern = '[0-9]{6,8}';

      [pin, confirm].forEach(el => {
        el.style.cssText = [
          'width:100%',
          'padding:14px',
          'margin:10px 0',
          'box-sizing:border-box'
        ].join(';');
      });
    }

    const button = make(
      'button',
      emailToken ? 'Vérifier mon e-mail' :
        'Enregistrer mon nouveau code',
      form
    );

    button.type = 'submit';
    button.className = 'button';

    const status = make('p', '', box);
    status.setAttribute('role', 'status');

    const close = make('button', 'Fermer', box);
    close.type = 'button';
    close.className = 'button secondary';
    close.style.marginTop = '10px';
    close.onclick = () => overlay.remove();

    form.onsubmit = async event => {
      event.preventDefault();

      button.disabled = true;
      status.textContent = 'Vérification en cours...';

      try {
        let fn;
        let payload;

        if (emailToken) {
          fn = 'eah_verify_diver_email_v2';
          payload = { p_token: emailToken };
        } else {
          if (!/^[0-9]{6,8}$/.test(pin.value)) {
            throw new Error(
              'Code de 6 à 8 chiffres obligatoire.'
            );
          }

          if (pin.value !== confirm.value) {
            throw new Error(
              'Les deux codes sont différents.'
            );
          }

          fn = 'eah_complete_pin_recovery_v2';
          payload = {
            p_token: pinToken,
            p_new_pin: pin.value
          };
        }

        const { data, error } =
          await sb.rpc(fn, payload);

        if (error) throw error;

        if (!data?.ok) {
          throw new Error(
            data?.error || 'Opération refusée.'
          );
        }

        status.textContent =
          data.message || 'Opération réussie.';

        form.remove();

      } catch (error) {
        status.textContent =
          error.message || 'Erreur de validation.';
      } finally {
        button.disabled = false;
      }
    };

    document.body.appendChild(overlay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      showDialog,
      { once: true }
    );
  } else {
    showDialog();
  }
})();
