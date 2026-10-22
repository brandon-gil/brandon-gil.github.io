// Portfolio dynamique : tout le contenu vient de data/profil.json (modifier ce fichier suffit, aucun HTML à toucher).
// Trois pages partagent ce script : accueil (présentation + carte du projet), projet (détail) et parcours.
// Les textes sont toujours insérés avec textContent (jamais innerHTML) : le contenu du JSON ne peut pas injecter de code.
(() => {
  const $ = (id) => document.getElementById(id);
  const page = document.body.dataset.page;

  /** Crée un élément avec classe et texte. */
  function el(balise, classe, texte) {
    const e = document.createElement(balise);
    if (classe) e.className = classe;
    if (texte !== undefined && texte !== null) e.textContent = texte;
    return e;
  }

  // Logos des réseaux (Simple Icons, licence CC0), enveloppe et flèche de téléchargement ; ils héritent de la couleur du texte (thème clair/sombre).
  const ICONES = {
    github: { d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
    linkedin: { d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    email: { d: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 2.2V18h18V7.2l-8.4 6.3a1 1 0 0 1-1.2 0L3 7.2zM4.3 6l7.7 5.8L19.7 6H4.3z' },
    telecharger: { d: 'M12 3v12m0 0 5-5m-5 5-5-5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2', trait: true },
  };

  /** Icône SVG décorative (le texte du bouton porte le sens). */
  function icone(nom, taille = 20) {
    const i = ICONES[String(nom).toLowerCase()];
    if (!i) return null;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', String(taille));
    svg.setAttribute('height', String(taille));
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', i.d);
    if (i.trait) {
      svg.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '2.2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
    } else {
      svg.setAttribute('fill', 'currentColor');
      path.setAttribute('fill-rule', 'evenodd');
    }
    svg.appendChild(path);
    return svg;
  }

  /** N'accepte que des liens http(s) ou mailto : un lien « javascript: » dans le JSON est ignoré. */
  function lienSur(url) {
    if (!url || !String(url).trim()) return ''; // une chaîne vide se résoudrait en lien vers la page elle-même
    try {
      const u = new URL(url, location.href);
      return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? u.href : '';
    } catch (_) { return ''; }
  }

  /** Adresse d'une image locale uniquement (pas d'image distante ni de schéma exotique). */
  function imageSure(src) {
    return typeof src === 'string' && /^assets\/[\w./-]+\.(jpe?g|png|webp|svg)$/i.test(src) ? src : '';
  }

  // ---- Éléments communs : en-tête (CV en surbrillance), menu, contacts, pied de page ------------------------------
  function commun(p) {
    $('marque').textContent = p.nom;
    $('pied-nom').textContent = p.nom;
    $('annee').textContent = new Date().getFullYear();
    document.querySelectorAll('[data-nav]').forEach((a) => { if (a.dataset.nav === page) a.setAttribute('aria-current', 'page'); });

    // Bouton « Télécharger mon CV » en haut à droite, avec une animation de brillance pour attirer l'œil.
    const cv = lienSur(p.cv || '');
    if (cv) {
      const a = $('cv-bouton');
      a.href = cv;
      a.setAttribute('download', '');
      const logo = icone('telecharger', 18);
      if (logo) a.appendChild(logo);
      a.appendChild(el('span', 'cv-long', 'Télécharger mon CV'));
      a.appendChild(el('span', 'cv-court', 'CV'));
      a.setAttribute('aria-label', 'Télécharger mon CV (PDF)');
      a.hidden = false;
    }

    // Contacts : seuls ceux qui sont renseignés apparaissent ; pas de contact = pas de section vide.
    const contacts = (p.contacts || []).map((c) => {
      const brut = c.lien || (/^email$/i.test(c.libelle) && c.valeur ? `mailto:${c.valeur}` : '');
      return { ...c, href: lienSur(brut) };
    }).filter((c) => c.href);
    if (contacts.length && $('liste-contacts')) {
      contacts.forEach((c) => {
        const li = el('li');
        // Email : menu qui ouvre directement un nouveau message (Gmail, Outlook ou application par défaut) avec le destinataire déjà rempli.
        if (/^email$/i.test(c.libelle) && c.valeur) { li.className = 'contact-email'; li.appendChild(menuEmail(c)); $('liste-contacts').appendChild(li); return; }
        const a = el('a', 'bouton bouton-secondaire bouton-icone');
        const logo = icone(c.libelle);
        if (logo) a.appendChild(logo);
        a.appendChild(el('span', '', c.libelle + (c.valeur ? ' · ' + c.valeur : '')));
        a.href = c.href;
        if (c.href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
        li.appendChild(a);
        $('liste-contacts').appendChild(li);
      });
      $('contact').hidden = false;
      $('menu-contact').hidden = false;
      if ($('cta-contact')) $('cta-contact').hidden = false;
    }
  }

  /** Menu « Email » : un lien mailto: seul ne marche que si une application de messagerie est configurée ; beaucoup de visiteurs utilisent Gmail ou Outlook dans le navigateur. */
  function menuEmail(c) {
    const adresse = c.valeur;
    const sujet = 'Contact depuis votre portfolio';
    const enc = encodeURIComponent;
    const choix = [
      { texte: 'Ouvrir dans Gmail', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(adresse)}&su=${enc(sujet)}`, externe: true },
      { texte: 'Ouvrir dans Outlook', href: `https://outlook.live.com/mail/0/deeplink/compose?to=${enc(adresse)}&subject=${enc(sujet)}`, externe: true },
      { texte: 'Application de messagerie', href: `mailto:${adresse}?subject=${enc(sujet)}`, externe: false },
    ];
    const racine = el('div', 'menu-email');
    const bouton = el('button', 'bouton bouton-secondaire bouton-icone');
    bouton.type = 'button';
    bouton.setAttribute('aria-expanded', 'false');
    bouton.setAttribute('aria-controls', 'menu-email-liste');
    const logo = icone('email');
    if (logo) bouton.appendChild(logo);
    bouton.appendChild(el('span', '', `Email · ${adresse}`));
    racine.appendChild(bouton);

    const liste = el('ul', 'menu-email-liste');
    liste.id = 'menu-email-liste';
    liste.hidden = true;
    choix.forEach((o) => {
      const li = el('li');
      const a = el('a', '', o.texte);
      a.href = o.href;
      if (o.externe) { a.target = '_blank'; a.rel = 'noopener'; }
      a.addEventListener('click', fermer);
      li.appendChild(a);
      liste.appendChild(li);
    });
    const liCopie = el('li');
    const copier = el('button', '', "Copier l'adresse");
    copier.type = 'button';
    copier.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(adresse); copier.textContent = 'Adresse copiée ✓'; }
      catch (_) { copier.textContent = adresse; } // presse-papiers indisponible : on affiche l'adresse pour qu'elle soit sélectionnable
      setTimeout(() => { copier.textContent = "Copier l'adresse"; }, 2500);
    });
    liCopie.appendChild(copier);
    liste.appendChild(liCopie);
    racine.appendChild(liste);

    function ouvrir(v) { liste.hidden = !v; bouton.setAttribute('aria-expanded', String(v)); }
    function fermer() { ouvrir(false); }
    bouton.addEventListener('click', () => { const ouvert = liste.hidden; ouvrir(ouvert); if (ouvert) liste.querySelector('a').focus(); });
    document.addEventListener('click', (ev) => { if (!racine.contains(ev.target)) fermer(); });
    racine.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { fermer(); bouton.focus(); } });
    return racine;
  }

  // ---- Accueil : présentation + carte du projet -------------------------------------------------------------------
  function accueil(p) {
    document.title = `${p.nom} — ${p.titre}`;
    $('titre-nom').textContent = p.nom;
    $('titre-metier').textContent = p.titre;
    $('accroche').textContent = p.accroche;
    if (p.disponibilite) { $('dispo').textContent = p.disponibilite; $('dispo').hidden = false; }
    if (p.localisation) { $('lieu').textContent = '📍 ' + p.localisation; $('lieu').hidden = false; }

    const photo = $('photo');
    if (p.photo) { photo.src = p.photo; photo.alt = p.photoAlt || `Portrait de ${p.nom}`; } else { photo.closest('figure').hidden = true; }
    activerMots(p.motsCles, p.nom);

    p.projets.forEach((pr) => $('liste-projets').appendChild(carteProjet(pr)));
  }

  /** Trois mots qui décrivent la personne : la photo se retourne au clic (ou à la touche Entrée / Espace). */
  function activerMots(mots, nom) {
    const bouton = $('portrait-bouton');
    const voile = $('mots-voile');
    const valides = (mots || []).filter((m) => m && m.mot).slice(0, 3);
    if (!valides.length) { bouton.disabled = true; bouton.classList.add('sans-mots'); return; }

    valides.forEach((m, i) => {
      const bloc = el('span', 'mot');
      bloc.style.setProperty('--i', String(i));
      bloc.appendChild(el('strong', 'mot-titre', m.mot));
      if (m.preuve) bloc.appendChild(el('span', 'mot-preuve', m.preuve));
      voile.appendChild(bloc);
    });
    $('pastille').hidden = false;
    $('pastille').textContent = `✨ ${valides.length} mot${valides.length > 1 ? 's' : ''}`;
    $('portrait-aide').hidden = false;

    const texteFerme = `Découvrir ${valides.length} mots qui décrivent ${nom}`;
    bouton.setAttribute('aria-label', texteFerme);
    const basculer = (ouvert) => {
      bouton.classList.toggle('ouvert', ouvert);
      bouton.setAttribute('aria-expanded', String(ouvert));
      voile.setAttribute('aria-hidden', String(!ouvert));
      bouton.setAttribute('aria-label', ouvert ? `Mots qui décrivent ${nom} : ${valides.map((m) => m.mot).join(', ')}. Cliquer pour revenir à la photo` : texteFerme);
      $('pastille').hidden = ouvert;
      $('portrait-aide').textContent = ouvert ? 'Cliquez pour revenir à la photo' : 'Cliquez sur ma photo';
    };
    bouton.addEventListener('click', () => basculer(!bouton.classList.contains('ouvert')));
    bouton.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') basculer(false); });
    document.addEventListener('click', (ev) => { if (!bouton.contains(ev.target)) basculer(false); });
  }

  /** Groupes « Langages / Technologies / Outils » d'un projet. */
  function groupesStack(stack) {
    const bloc = el('div', 'stack');
    Object.entries(stack || {}).forEach(([groupe, items]) => {
      if (!Array.isArray(items) || !items.length) return;
      const g = el('div', 'stack-groupe');
      g.appendChild(el('span', 'stack-titre', groupe));
      const ul = el('ul', 'etiquettes');
      items.forEach((i) => ul.appendChild(el('li', '', i)));
      g.appendChild(ul);
      bloc.appendChild(g);
    });
    return bloc;
  }

  /** Carte du projet sur l'accueil : miniature + langages / technologies / outils ; un clic ouvre la page de détail. */
  function carteProjet(pr) {
    const carte = el('a', 'projet-carte');
    carte.href = `projet.html?id=${encodeURIComponent(pr.id)}`;
    carte.setAttribute('aria-label', `${pr.nom} : voir le détail du projet`);
    const miniature = imageSure(pr.miniature);
    if (miniature) {
      const vignette = el('span', 'projet-vignette');
      const img = el('img');
      img.src = miniature;
      img.alt = pr.miniatureAlt || `Aperçu de ${pr.nom}`;
      img.width = 1280; img.height = 600; img.loading = 'lazy';
      vignette.appendChild(img);
      vignette.appendChild(el('span', 'projet-voir', 'Voir le détail →'));
      carte.appendChild(vignette);
    }
    const corps = el('span', 'projet-corps');
    const entete = el('span', 'projet-entete');
    const titres = el('span', 'projet-titres');
    titres.appendChild(el('strong', 'projet-nom', pr.nom));
    titres.appendChild(el('span', 'projet-sous', pr.soustitre));
    entete.appendChild(titres);
    if (pr.periode) entete.appendChild(el('span', 'badge', pr.periode));
    corps.appendChild(entete);
    corps.appendChild(groupesStack(pr.stack));
    carte.appendChild(corps);
    return carte;
  }

  // ---- Page de détail du projet ----------------------------------------------------------------------------------
  function projet(p) {
    const id = new URLSearchParams(location.search).get('id');
    const pr = p.projets.find((x) => x.id === id) || (p.projets.length === 1 && !id ? p.projets[0] : null);
    const zone = $('detail-projet');
    zone.textContent = '';
    const conteneur = el('div', 'conteneur');
    zone.appendChild(conteneur);
    if (!pr) {
      conteneur.appendChild(el('h1', 'titre-page', 'Projet introuvable'));
      const retour = el('a', 'bouton', "Retour à l'accueil");
      retour.href = 'index.html#projets';
      conteneur.appendChild(retour);
      document.title = `Projet introuvable — ${p.nom}`;
      return;
    }
    document.title = `${pr.nom} — ${p.nom}`;

    const entete = el('header', 'detail-entete');
    const titres = el('div');
    titres.appendChild(el('h1', 'titre-page', pr.nom));
    titres.appendChild(el('p', 'projet-sous', pr.soustitre));
    entete.appendChild(titres);
    if (pr.periode) entete.appendChild(el('span', 'badge', pr.periode));
    conteneur.appendChild(entete);

    conteneur.appendChild(el('p', 'projet-resume', pr.resume));
    const liens = el('div', 'actions');
    const site = lienSur(pr.lien || '');
    if (site) { const a = el('a', 'bouton', pr.libelleLien || 'Voir le projet'); a.href = site; a.target = '_blank'; a.rel = 'noopener'; liens.appendChild(a); }
    const depot = lienSur(pr.depot || '');
    if (depot) { const a = el('a', 'bouton bouton-secondaire', 'Code source'); a.href = depot; a.target = '_blank'; a.rel = 'noopener'; liens.appendChild(a); }
    if (liens.children.length) conteneur.appendChild(liens);

    const images = (pr.images || []).filter((i) => imageSure(i.src));
    if (images.length) {
      const galerie = el('div', 'galerie');
      images.forEach((i) => {
        const fig = el('figure', 'galerie-vignette');
        const lien = el('a');
        lien.href = i.src; lien.target = '_blank'; lien.rel = 'noopener';
        lien.setAttribute('aria-label', `Agrandir : ${i.legende || i.alt || ''}`);
        const img = el('img');
        img.src = i.src; img.alt = i.alt || ''; img.loading = 'lazy'; img.width = 1280; img.height = 600;
        lien.appendChild(img);
        fig.appendChild(lien);
        if (i.legende) fig.appendChild(el('figcaption', '', i.legende));
        galerie.appendChild(fig);
      });
      conteneur.appendChild(galerie);
    }

    if (pr.chiffres && pr.chiffres.length) {
      const ul = el('ul', 'chiffres');
      pr.chiffres.forEach((c) => {
        const li = el('li', 'chiffre');
        li.appendChild(el('strong', '', c.valeur));
        li.appendChild(el('span', '', c.libelle));
        ul.appendChild(li);
      });
      conteneur.appendChild(ul);
    }
    if (pr.points && pr.points.length) {
      conteneur.appendChild(el('h2', 'sous-titre', 'Ce que contient le projet'));
      const grille = el('ul', 'points');
      pr.points.forEach((pt) => {
        const li = el('li', 'point');
        li.appendChild(el('strong', '', pt.titre));
        li.appendChild(el('span', '', pt.texte));
        grille.appendChild(li);
      });
      conteneur.appendChild(grille);
    }
    if (pr.defis && pr.defis.length) {
      conteneur.appendChild(el('h2', 'sous-titre', 'Défis relevés'));
      const ul = el('ul', 'defis');
      pr.defis.forEach((d) => ul.appendChild(el('li', '', d)));
      conteneur.appendChild(ul);
    }
    conteneur.appendChild(el('h2', 'sous-titre', 'Langages, technologies et outils'));
    conteneur.appendChild(groupesStack(pr.stack));
  }

  // ---- Page parcours : à propos, compétences, formation, expérience --------------------------------------------------
  function parcours(p) {
    document.title = `Parcours — ${p.nom}`;
    if (p.apropos && p.apropos.length) {
      p.apropos.forEach((t) => $('apropos-texte').appendChild(el('p', '', t)));
      $('apropos').hidden = false;
    }
    p.competences.forEach((g) => {
      const bloc = el('div', 'carte');
      bloc.appendChild(el('h3', '', g.groupe));
      const ul = el('ul', 'etiquettes');
      g.items.forEach((i) => ul.appendChild(el('li', '', i)));
      bloc.appendChild(ul);
      $('liste-competences').appendChild(bloc);
    });
    const etapes = (idListe, idSection, liste) => {
      if (!liste || !liste.length) return;
      liste.forEach((e) => {
        const li = el('li', 'etape');
        li.appendChild(el('span', 'etape-date', e.periode || ''));
        const corps = el('div');
        corps.appendChild(el('strong', '', e.titre || ''));
        if (e.lieu) corps.appendChild(el('span', 'etape-lieu', ' · ' + e.lieu));
        if (e.texte) corps.appendChild(el('p', '', e.texte));
        li.appendChild(corps);
        $(idListe).appendChild(li);
      });
      $(idSection).hidden = false;
    };
    etapes('liste-formations', 'formations', p.formations);
    etapes('liste-parcours', 'parcours', p.parcours);
  }

  fetch('data/profil.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then((p) => {
      commun(p);
      if (page === 'accueil') accueil(p);
      else if (page === 'projet') projet(p);
      else if (page === 'parcours') parcours(p);
    })
    .catch(() => {
      const cible = $('liste-projets') || $('detail-projet') || $('contenu');
      cible.appendChild(el('p', 'erreur', "Le contenu n'a pas pu être chargé. Rechargez la page ou revenez dans un instant."));
    });
})();
