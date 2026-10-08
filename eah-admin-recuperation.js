
/* =====================================================
   EAH DIVING CLUB PRO
   ADMINISTRATION DES RECUPERATIONS
   Version 1.0
   Aucun changement de design ou de carte NFC.
===================================================== */

(() => {
  'use strict';

  let loading = false;

  function client() {
    if (
      typeof supabaseClient !== 'undefined' &&
      supabaseClient
    ) {
      return supabaseClient;
    }

    if (typeof requireSupabase === 'function') {
      return requireSupabase();
    }

    return null;
  }

  function element(tag, text, className) {
    const node = document.createElement(tag);

    if (text !== undefined) {
      node.textContent = String(text);
    }

    if (className) {
      node.className = className;
    }

    return node;
  }

  function removePanel() {
    document.getElementById(
      'eahAdminRecoveryPanel'
    )?.remove();
  }

  function getPanel() {
    const parent = document.getElementById(
      'coachPrivate'
    );

    if (!parent) return null;

    let panel = document.getElementById(
      'eahAdminRecoveryPanel'
    );

    if (!panel) {
      panel = element('article');
      panel.id = 'eahAdminRecoveryPanel';
      panel.className = 'dashboard-card';
      panel.style.marginTop = '24px';
      parent.appendChild(panel);
    }

    return panel;
  }

  async function decide(id, approve) {
    const sb = client();

    if (!sb) return;

    const action = approve ? 'autoriser' : 'refuser';

    if (!window.confirm(
      'Voulez-vous ' + action + ' cette demande ?'
    )) {
      return;
    }

    try {
      const { data, error } = await sb.rpc(
        'eah_admin_recovery_decide_v1',
        {
          p_request_id: id,
          p_approve: approve
        }
      );

      if (error) throw error;

      if (!data?.ok) {
        throw new Error(
          data?.error || 'Décision refusée.'
        );
      }

      alert(
        'Décision enregistrée.\n' +
        'Aucun mot de passe n’a été modifié.\n' +
        'Les e-mails seront activés ultérieurement.'
      );

      await refresh();

    } catch (error) {
      alert(
        'Erreur : ' + (
          error.message || 'Opération impossible'
        )
      );
    }
  }

  function render(items) {
    const panel = getPanel();

    if (!panel) return;

    panel.replaceChildren();

    const heading = element(
      'h3',
      'Demandes de récupération'
    );

    panel.appendChild(heading);

    const description = element(
      'p',
      'Administration EAH Diving — ' +
      'demandes de mot de passe et de code personnel.'
    );

    panel.appendChild(description);

    const refreshButton = element(
      'button',
      'Actualiser',
      'button secondary'
    );

    refreshButton.type = 'button';
    refreshButton.onclick = refresh;

    panel.appendChild(refreshButton);

    const pending = items.filter(
      item => item.status === 'PENDING'
    );

    const summary = element(
      'p',
      pending.length + ' demande(s) en attente.'
    );

    summary.style.margin = '18px 0';

    panel.appendChild(summary);

    if (!items.length) {
      panel.appendChild(
        element(
          'p',
          'Aucune demande enregistrée.'
        )
      );
      return;
    }

    for (const item of items) {
      const card = element('div');

      card.style.cssText = [
        'border:1px solid rgba(143,205,255,.22)',
        'border-radius:14px',
        'padding:16px',
        'margin:12px 0'
      ].join(';');

      const name = element(
        'h4',
        item.person || 'Profil EAH'
      );

      card.appendChild(name);

      const type = item.account_type === 'COACH'
        ? 'Coach'
        : 'Plongeur';

      card.appendChild(
        element(
          'p',
          type + ' — ' + (item.club || '')
        )
      );

      card.appendChild(
        element(
          'p',
          'Statut : ' + (
            item.status || 'PENDING'
          )
        )
      );

      if (item.created_at) {
        card.appendChild(
          element(
            'p',
            'Demande du ' +
            new Date(item.created_at)
              .toLocaleString('fr-FR')
          )
        );
      }

      const verified = item.delivery_ready === true;

      card.appendChild(
        element(
          'p',
          verified
            ? 'Adresse de référence vérifiée'
            : 'Adresse non vérifiée ou compte incomplet'
        )
      );

      if (item.status === 'PENDING') {
        const approve = element(
          'button',
          'Autoriser',
          'button'
        );

        approve.type = 'button';
        approve.disabled = !verified;
        approve.style.marginRight = '10px';

        approve.onclick = () =>
          decide(item.request_id, true);

        card.appendChild(approve);

        const reject = element(
          'button',
          'Refuser',
          'button secondary'
        );

        reject.type = 'button';
        reject.onclick = () =>
          decide(item.request_id, false);

        card.appendChild(reject);
      }

      panel.appendChild(card);
    }
  }

  async function refresh() {
    if (loading) return;

    const sb = client();

    if (!sb) return;

    loading = true;

    try {
      const { data: auth, error: authError } =
        await sb.auth.getUser();

      if (authError || !auth?.user) {
        removePanel();
        return;
      }

      const { data, error } = await sb.rpc(
        'eah_admin_recovery_list_v1'
      );

      if (error || !data?.ok) {
        removePanel();
        return;
      }

      render(
        Array.isArray(data.items)
          ? data.items
          : []
      );

    } catch (error) {
      console.warn(
        'EAH administration :',
        error.message
      );
    } finally {
      loading = false;
    }
  }

  function start() {
    const sb = client();

    if (!sb) return;

    sb.auth.onAuthStateChange(() => {
      window.setTimeout(refresh, 0);
    });

    window.setTimeout(refresh, 500);

    window.addEventListener(
      'hashchange',
      refresh
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
