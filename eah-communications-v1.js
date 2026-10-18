
/* ==========================================================
   EAH DIVING - COMMUNICATIONS V1
   FORMULAIRE COACH + PROFIL PRIVE
========================================================== */

(() => {
  'use strict';

  const config = window.EAH_CONFIG || {};
  if (!window.supabase ||
      !config.SUPABASE_URL ||
      !config.SUPABASE_PUBLISHABLE_KEY) return;

  const db = window.supabase.createClient(
    config.SUPABASE_URL,
    config.SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        storageKey: 'eah-communications-v1',
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );

  const params = new URLSearchParams(location.search);
  const coachToken = params.get('coachToken') || '';

  let coach = null;
  let profileCredentials = null;

  const $ = (s,root = document) =>
    root.querySelector(s);

  const $$ = (s,root = document) =>
    [...root.querySelectorAll(s)];

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function url(value) {
    try {
      const u = new URL(String(value || '').trim());
      return ['https:','http:'].includes(u.protocol)
        ? u.href : '';
    } catch (_) {
      return '';
    }
  }

  function styleControl(element) {
    element.style.cssText = [
      'width:100%',
      'box-sizing:border-box',
      'min-height:48px',
      'padding:11px',
      'margin:5px 0 15px',
      'border:1px solid rgba(48,207,255,.3)',
      'border-radius:12px',
      'background:#10273a',
      'color:white',
      'font:inherit'
    ].join(';');
  }

  function field(form,labelText,type,id,required=false) {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.textContent = labelText;

    const input = type === 'textarea'
      ? document.createElement('textarea')
      : document.createElement('input');

    if (type !== 'textarea') input.type = type;
    input.id = id;
    input.required = required;
    styleControl(input);

    if (type === 'textarea') input.rows = 4;
    if (type === 'url') input.placeholder = 'https://...';

    label.appendChild(input);
    form.appendChild(label);
    return input;
  }

  function closeOverlay() {
    $('#eahCommunicationOverlay')?.remove();
  }

  async function getCoach() {
    if (coach) return coach;

    const {data,error} = await db.rpc(
      'eah_coach_card_workspace',
      {p_token: coachToken}
    );

    if (error) throw error;
    if (!data?.ok || !data?.assigned) {
      throw new Error('Carte coach non autorisée.');
    }

    coach = data;
    return data;
  }

  function targetsPanel(root,kind) {
    const panel = document.createElement('div');
    panel.id = 'eahCommTargetPanel';

    const members = (coach?.divers || [])
      .filter(d => d.eahId);

    const groups = [...new Set(
      members.map(d => String(d.group || '').trim())
        .filter(Boolean)
    )].sort((a,b)=>a.localeCompare(b));

    panel.innerHTML = `
      <div id="eahCommGroupOptions" hidden>
        <p>Choisir les groupes :</p>
        ${groups.map(g=>`
          <label style="display:block;margin:10px 0">
            <input type="checkbox" data-eah-group
              value="${esc(g)}">
            ${esc(g)}
          </label>
        `).join('') || '<p>Aucun groupe renseigné.</p>'}
      </div>

      <div id="eahCommDiverOptions" hidden>
        <p>Choisir les plongeurs :</p>
        ${members.map(d=>`
          <label style="display:block;margin:10px 0">
            <input type="checkbox" data-eah-diver
              value="${esc(d.eahId)}">
            ${esc(
              (d.firstName || '') + ' ' +
              (d.lastName || '') + ' — ' + d.eahId
            )}
          </label>
        `).join('')}
      </div>
    `;

    root.appendChild(panel);
    return panel;
  }

  async function openCoachForm(kind) {
    try {
      await getCoach();
    } catch (e) {
      alert(e.message);
      return;
    }

    closeOverlay();

    const overlay = document.createElement('div');
    overlay.id = 'eahCommunicationOverlay';
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:2147483647',
      'background:rgba(1,9,18,.96)',
      'overflow:auto',
      'padding:15px',
      'color:white'
    ].join(';');

    const box = document.createElement('div');
    box.style.cssText = [
      'max-width:650px',
      'margin:15px auto 60px',
      'padding:25px',
      'border-radius:22px',
      'background:#061e33',
      'border:1px solid rgba(48,207,255,.25)'
    ].join(';');

    const heading = document.createElement('h2');
    heading.textContent = kind === 'CONSEIL'
      ? 'Ajouter un conseil'
      : 'Communiquer une information';
    box.appendChild(heading);

    const explanation = document.createElement('p');
    explanation.textContent =
      'La publication apparaîtra sur les profils privés des destinataires sélectionnés.';
    box.appendChild(explanation);

    const form = document.createElement('form');
    box.appendChild(form);

    const title = field(
      form,'Titre','text','eahCommTitle',true
    );

    const body = field(
      form,
      kind === 'CONSEIL' ? 'Conseil / message' : 'Information / message',
      'textarea','eahCommBody'
    );

    const link = field(
      form,'Lien à ouvrir','url','eahCommLink'
    );

    const photo = field(
      form,'Lien de la photo','url','eahCommPhoto'
    );

    const video = field(
      form,'Lien de la vidéo','url','eahCommVideo'
    );

    const targetLabel = document.createElement('label');
    targetLabel.textContent = 'Destinataires';
    targetLabel.style.display = 'block';

    const target = document.createElement('select');
    target.innerHTML = `
      <option value="TOUS">Tous les plongeurs du club</option>
      <option value="GROUPES">Un ou plusieurs groupes</option>
      <option value="PLONGEURS">Plongeurs sélectionnés</option>
    `;
    styleControl(target);
    targetLabel.appendChild(target);
    form.appendChild(targetLabel);

    const panel = targetsPanel(form,kind);
    const groupOptions = $('#eahCommGroupOptions',panel);
    const diverOptions = $('#eahCommDiverOptions',panel);

    target.addEventListener('change',()=>{
      groupOptions.hidden = target.value !== 'GROUPES';
      diverOptions.hidden = target.value !== 'PLONGEURS';
    });

    const activeLabel = document.createElement('label');
    activeLabel.style.cssText =
      'display:block;margin:15px 0';
    activeLabel.innerHTML =
      '<input type="checkbox" id="eahCommActive" checked> Publication active';
    form.appendChild(activeLabel);

    if (kind === 'INFORMATIONS') {
      const urgentLabel = document.createElement('label');
      urgentLabel.innerHTML =
        '<input type="checkbox" id="eahCommUrgent"> Information urgente';
      urgentLabel.style.cssText =
        'display:block;margin:15px 0';
      form.appendChild(urgentLabel);
    }

    const save = document.createElement('button');
    save.type = 'submit';
    save.textContent = 'Publier';
    save.style.cssText = [
      'width:100%',
      'padding:16px',
      'border:0',
      'border-radius:14px',
      'background:#0b6bff',
      'color:white',
      'font-weight:900'
    ].join(';');
    form.appendChild(save);

    const feedback = document.createElement('p');
    feedback.setAttribute('role','status');
    form.appendChild(feedback);

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Fermer';
    close.style.cssText =
      'margin-top:15px;padding:12px;border-radius:12px';
    close.onclick = closeOverlay;
    box.appendChild(close);

    
overlay.appendChild(box);

// Ajouter le formulaire dans l'espace coach NFC
// afin qu'il ne soit pas masqué par coach-card.js.
const coachApp = document.getElementById(
  'eahCoachCardApp'
);

if (!coachApp) {
  throw new Error(
    "L'espace coach est introuvable."
  );
}

coachApp.appendChild(overlay);


    form.addEventListener('submit',async e=>{
      e.preventDefault();

      const groups = $$('[data-eah-group]:checked',panel)
        .map(el=>el.value);

      const divers = $$('[data-eah-diver]:checked',panel)
        .map(el=>el.value);

      if (!body.value.trim() &&
          !link.value.trim() &&
          !photo.value.trim() &&
          !video.value.trim()) {
        feedback.textContent =
          'Ajoute un message, un lien, une photo ou une vidéo.';
        return;
      }

      if (target.value === 'GROUPES' && !groups.length ||
          target.value === 'PLONGEURS' && !divers.length) {
        feedback.textContent =
          'Choisis au moins un destinataire.';
        return;
      }

      save.disabled = true;
      feedback.textContent = 'Publication en cours...';

      try {
        const record = {
          title: title.value.trim(),
          body: body.value.trim(),
          link_url: link.value.trim(),
          photo_url: photo.value.trim(),
          video_url: video.value.trim(),
          target_type: target.value,
          groups,
          divers,
          active: $('#eahCommActive',form).checked,
          urgent: !!$('#eahCommUrgent',form)?.checked
        };

        const {data,error} = await db.rpc(
          'eah_comm_coach_add_v1',
          {
            p_token:coachToken,
            p_kind:kind,
            p_record:record
          }
        );

        if (error) throw error;
        if (!data?.ok) {
          throw new Error(data?.error || 'Publication refusée.');
        }

        feedback.textContent =
          'Publication enregistrée dans Supabase. Elle sera synchronisée dans Google Sheets.';

        save.textContent = 'Publié';

      } catch(err) {
        feedback.textContent =
          'Erreur : ' + (err.message || 'Impossible de publier.');
        save.disabled = false;
      }
    });
  }

  async function addCoachButtons() {
    if (!coachToken) return;

    const button = $('#eahEvaluateDive');
    if (!button || $('#eahCommunicationButtons')) return;

    try {
      await getCoach();
    } catch (_) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'eahCommunicationButtons';
    wrapper.style.cssText =
      'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:12px 0 25px';

    function make(text,kind) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.style.cssText = [
        'min-height:58px',
        'border:1px solid rgba(48,207,255,.35)',
        'border-radius:16px',
        'background:#073254',
        'color:#30cfff',
        'font-weight:900',
        'padding:12px'
      ].join(';');

      
b.onclick = (event) => {

  event.preventDefault();
  event.stopPropagation();

  Promise.resolve(
    openCoachForm(kind)
  ).catch(err => {

    console.error(
      'EAH formulaire coach :',
      err
    );

    alert(
      "Impossible d'ouvrir le formulaire : " +
      (err?.message || 'Erreur inconnue')
    );

  });

};

      wrapper.appendChild(b);
    }

    make('Communiquer une information','INFORMATIONS');
    make('Ajouter un conseil','CONSEIL');

    button.insertAdjacentElement('afterend',wrapper);
  }

  function publicationCard(item) {
    const picture = url(item.photoUrl);
    const video = url(item.videoUrl);
    const link = url(item.linkUrl);

    const date = item.updatedAt || item.date;
    const dateText = date
      ? new Date(date).toLocaleDateString('fr-FR')
      : '';

    return `
      <article style="
        padding:18px;
        background:rgba(5,23,42,.85);
        border:1px solid rgba(48,207,255,.22);
        border-radius:18px;
        margin:12px 0
      ">
        ${item.urgent
          ? '<strong style="color:#ffbb66">Information importante</strong>'
          : ''}
        <h3 style="margin:8px 0">${esc(item.title)}</h3>
        <small style="color:#91aec4">${esc(dateText)}</small>
        <p style="white-space:pre-wrap">${esc(item.body || '')}</p>

        ${picture
          ? `<img src="${esc(picture)}" alt=""
              loading="lazy"
              style="max-width:100%;max-height:350px;object-fit:contain;border-radius:12px">`
          : ''}

        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:12px">
          ${link
            ? `<a href="${esc(link)}" target="_blank" rel="noopener noreferrer" style="color:#30cfff">Ouvrir le lien</a>`
            : ''}
          ${video
            ? `<a href="${esc(video)}" target="_blank" rel="noopener noreferrer" style="color:#30cfff">Voir la vidéo</a>`
            : ''}
        </div>

        ${item.author
          ? `<small style="display:block;margin-top:10px;color:#91aec4">${esc(item.author)}</small>`
          : ''}
      </article>
    `;
  }

  function showProfileItems(
  items,
  isIndividual = false,
  discipline = ""
) {
    const profile =
  $('#eahDiverProfileHost') ||
  $('#profileView');
    if (!profile) return;

    $('#eahPrivateCommunications')?.remove();

    const container = document.createElement('div');
    container.id = 'eahPrivateCommunications';
    container.style.cssText = 'max-width:1050px;margin:25px auto;padding:5px';

    const info = items.filter(x=>x.kind==='INFORMATIONS');
    const advice = items.filter(x=>x.kind==='CONSEIL');

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px">

        <section>
          <h2>${isIndividual ? 'Informations EAH' : 'Informations de mon club'}</h2>
          ${info.length
            ? info.map(publicationCard).join('')
            : '<p>Aucune information pour le moment.</p>'}
        </section>

        <section>
          <h2>${isIndividual ? 'Conseils / Tutos EAH' : 'Conseils de mon coach'}</h2>
          ${advice.length
            ? advice.map(publicationCard).join('')
            : '<p>Aucun conseil pour le moment.</p>'}
        </section>

      </div>

      <button type="button" id="eahRefreshCommunications"
        style="margin:20px 0;padding:12px 18px;background:#0b6bff;color:white;border:0;border-radius:12px">
        Actualiser les messages
      </button>
    `;

    profile.appendChild(container);

    $('#eahRefreshCommunications',container)
      .onclick = () => {
        if (profileCredentials) {
          window.EAH_COMM_LOAD(profileCredentials);
        }
      };
  }

  
/* ============================================================
   EAH DIVING - ACTUALISATION COMMUNICATIONS V1.2

   - Affiche les erreurs dans le profil
   - Rafraîchit toutes les 20 secondes
   - Évite les chargements simultanés
   - Ne modifie aucune donnée
============================================================ */

let eahCommLoading = false;
let eahCommAutoRefresh = null;

window.EAH_COMM_LOAD = async function(credentials) {

  if (!credentials?.club || !credentials?.eahId) {
    return;
  }

  profileCredentials = credentials;

  if (eahCommLoading) return;

  eahCommLoading = true;

  try {

    const { data, error } = await db.rpc(
      'eah_comm_private_feed_v1',
      {
        p_club_slug: credentials.club,
        p_eah_id: credentials.eahId,
        p_token: credentials.token || '',
        p_pin_hash: credentials.pinHash || ''
      }
    );

    if (error) {
      throw error;
    }

    if (!data?.ok) {
      throw new Error(
        data?.error || 'Accès privé requis.'
      );
    }

    // Retire une éventuelle ancienne erreur.
    $('#eahCommLoadError')?.remove();

    // Affiche les publications réellement reçues.
    showProfileItems(data.items || []);

  } catch (err) {

    console.warn(
      'Communications EAH :',
      err
    );

    const host =
      $('#eahDiverProfileHost') ||
      $('#profileView');

    if (host) {

      let notice = $('#eahCommLoadError');

      if (!notice) {

        notice = document.createElement('div');
        notice.id = 'eahCommLoadError';

        notice.style.cssText = [
          'margin:15px 0',
          'padding:12px',
          'border-radius:12px',
          'background:rgba(224,82,94,.15)',
          'color:#fff'
        ].join(';');

        host.appendChild(notice);
      }

      notice.textContent =
        'Informations et conseils : ' +
        'chargement impossible. ' +
        (err?.message || 'Erreur inconnue') +
        ' — Réessaie dans 20 secondes.';
    }

  } finally {

    eahCommLoading = false;
  }

  // Un seul intervalle, même après plusieurs clics.
  if (!eahCommAutoRefresh) {

    eahCommAutoRefresh = setInterval(() => {

      const view = $('#profileView');

      if (
        !document.hidden &&
        profileCredentials &&
        view &&
        !view.classList.contains('hidden')
      ) {

        window.EAH_COMM_LOAD(
          profileCredentials
        );

      }

    }, 20000);

  }

};


  if (coachToken) {
    let attempts = 0;
    const timer = setInterval(()=>{
      attempts++;
      addCoachButtons().catch(console.warn);
      if ($('#eahCommunicationButtons') || attempts > 90) {
        clearInterval(timer);
      }
    },1000);
  }

})();
