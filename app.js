// Portfolio dynamique — module ES. Tout le contenu vient de data/profil.json (modifier ce fichier suffit).
// Trois pages partagent ce module : accueil, projet (détail) et parcours.
// Les textes sont toujours insérés avec textContent (jamais innerHTML) : le JSON ne peut pas injecter de code,
// ce qui permet aussi une politique de sécurité (CSP) stricte sans script ni style en ligne.

const $ = (id) => document.getElementById(id);
const page = document.body.dataset.page;
const reduireMouvement = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pointeurFin = matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Crée un élément avec classe(s) et texte. */
function el(balise, classe, texte) {
  const e = document.createElement(balise);
  if (classe) e.className = classe;
  if (texte != null) e.textContent = texte;
  return e;
}

// ---- Icônes : logos (Simple Icons, CC0) et pictogrammes à trait ; elles héritent de la couleur du texte ------------
const ICONES = {
  github: { d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
  linkedin: { d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  email: { d: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 2.2V18h18V7.2l-8.4 6.3a1 1 0 0 1-1.2 0L3 7.2zM4.3 6l7.7 5.8L19.7 6H4.3z' },
  telecharger: { d: 'M12 3v12m0 0 5-5m-5 5-5-5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2', trait: true },
  soleil: { d: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41', trait: true },
  lune: { d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z', trait: true },
  precedent: { d: 'm15 18-6-6 6-6', trait: true },
  suivant: { d: 'm9 18 6-6-6-6', trait: true },
  fermer: { d: 'M18 6 6 18M6 6l12 12', trait: true },
  retour: { d: 'm12 19-7-7 7-7M19 12H5', trait: true },
  epingle: { d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', trait: true },
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
    for (const [k, v] of Object.entries({ stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) path.setAttribute(k, v);
  } else {
    svg.setAttribute('fill', 'currentColor');
    path.setAttribute('fill-rule', 'evenodd');
  }
  svg.append(path);
  return svg;
}

/** N'accepte que des liens http(s) ou mailto : un lien « javascript: » dans le JSON est ignoré. */
function lienSur(url) {
  if (!url || !String(url).trim()) return ''; // une chaîne vide se résoudrait en lien vers la page elle-même
  try {
    const u = new URL(url, location.href);
    return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? u.href : '';
  } catch { return ''; }
}

/** Adresse d'une image locale uniquement (pas d'image distante ni de schéma exotique). */
const imageSure = (src) => (typeof src === 'string' && /^assets\/[\w./-]+\.(jpe?g|png|webp|avif|svg)$/i.test(src) ? src : '');

// ---- Thème clair / sombre (suit le système tant que l'utilisateur n'a pas choisi) ---------------------------------
function initialiserTheme() {
  const bouton = $('theme-bouton');
  if (!bouton) return;
  const racine = document.documentElement;
  const sombre = () => (racine.dataset.theme ? racine.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);
  const rafraichir = () => {
    bouton.replaceChildren(icone(sombre() ? 'soleil' : 'lune', 20));
    bouton.setAttribute('aria-label', sombre() ? 'Passer au thème clair' : 'Passer au thème sombre');
  };
  bouton.addEventListener('click', () => {
    const suivant = sombre() ? 'light' : 'dark';
    const appliquer = () => { racine.dataset.theme = suivant; rafraichir(); };
    try { localStorage.setItem('theme', suivant); } catch { /* stockage indisponible : le choix vaut pour cette visite */ }
    // Transition de vue native si disponible (fondu fluide entre les deux thèmes)
    if (document.startViewTransition && !reduireMouvement) document.startViewTransition(appliquer); else appliquer();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', rafraichir);
  rafraichir();
}

// ---- Éléments communs : en-tête (CV en surbrillance), menu, contacts, pied de page ------------------------------------
function commun(p) {
  $('marque').textContent = p.nom;
  $('pied-nom').textContent = p.nom;
  $('annee').textContent = new Date().getFullYear();
  document.querySelectorAll('[data-nav]').forEach((a) => { if (a.dataset.nav === page) a.setAttribute('aria-current', 'page'); });

  const cv = lienSur(p.cv || '');
  if (cv) {
    const a = $('cv-bouton');
    a.href = cv;
    a.setAttribute('download', '');
    a.append(icone('telecharger', 18), el('span', 'cv-long', 'Télécharger mon CV'), el('span', 'cv-court', 'CV'));
    a.setAttribute('aria-label', 'Télécharger mon CV (PDF)');
    a.hidden = false;
  }

  groupeEcole(p.groupe);

  // Contacts : seuls ceux qui sont renseignés apparaissent ; pas de contact = pas de section vide.
  const contacts = (p.contacts || [])
    .map((c) => ({ ...c, href: lienSur(c.lien || (/^email$/i.test(c.libelle) && c.valeur ? `mailto:${c.valeur}` : '')) }))
    .filter((c) => c.href);
  const liste = $('liste-contacts');
  if (contacts.length && liste) {
    for (const c of contacts) {
      const li = el('li');
      if (/^email$/i.test(c.libelle) && c.valeur) { li.className = 'contact-email'; li.append(menuEmail(c)); liste.append(li); continue; }
      const a = el('a', 'bouton bouton-secondaire bouton-icone');
      a.href = c.href;
      if (c.href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
      a.append(icone(c.libelle) ?? '', el('span', '', c.libelle + (c.valeur ? ' · ' + c.valeur : '')));
      li.append(a);
      liste.append(li);
    }
    $('contact').hidden = false;
    $('menu-contact').hidden = false;
    if ($('cta-contact')) $('cta-contact').hidden = false;
  }
}

/** Bloc « groupe d'appartenance » (logo de Skolae) tout en bas de chaque page. Le logo est un SVG utilisé comme masque : il prend la couleur du thème. */
function groupeEcole(g) {
  const zone = $('groupe');
  const logo = imageSure(g?.logo);
  if (!zone || !g || !logo) return;
  const lien = lienSur(g.lien || '');
  const carte = el(lien ? 'a' : 'div', 'groupe-carte');
  if (lien) {
    carte.href = lien; carte.target = '_blank'; carte.rel = 'noopener';
    carte.setAttribute('aria-label', `${g.nom}, ${g.description || 'groupe d\'appartenance'} (nouvel onglet)`);
  }
  const marque = el('span', 'groupe-logo');
  marque.setAttribute('role', 'img');
  marque.setAttribute('aria-label', g.nom);
  marque.style.setProperty('--logo', `url("${new URL(logo, location.href).href}")`);
  carte.append(el('span', 'groupe-intro', g.intro || ''), marque);
  if (g.description) carte.append(el('span', 'groupe-description', g.description));
  if (lien) carte.append(el('span', 'groupe-lien', `Découvrir ${g.nom} ↗`));
  zone.querySelector('.conteneur').replaceChildren(carte);
  zone.hidden = false;
}

/** Menu « Email » : élément natif [popover] (fermeture par Échap / clic extérieur, focus géré par le navigateur).
 *  Un lien mailto: seul ne marche que si une application de messagerie est configurée : on propose aussi Gmail et Outlook. */
function menuEmail(c) {
  const adresse = c.valeur;
  const sujet = 'Contact depuis votre portfolio';
  const enc = encodeURIComponent;
  const choix = [
    { texte: 'Ouvrir dans Gmail', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(adresse)}&su=${enc(sujet)}`, externe: true },
    { texte: 'Ouvrir dans Outlook', href: `https://outlook.live.com/mail/0/deeplink/compose?to=${enc(adresse)}&subject=${enc(sujet)}`, externe: true },
    { texte: 'Application de messagerie', href: `mailto:${adresse}?subject=${enc(sujet)}`, externe: false },
  ];
  const aPopover = 'popover' in HTMLElement.prototype;
  const racine = el('div', 'menu-email');
  const bouton = el('button', 'bouton bouton-secondaire bouton-icone');
  bouton.type = 'button';
  bouton.append(icone('email'), el('span', '', `Email · ${adresse}`));

  const menu = el('div', 'menu-email-liste');
  menu.id = 'menu-email-liste';
  menu.setAttribute('role', 'menu');
  const fermer = () => (aPopover ? menu.hidePopover?.() : ((menu.hidden = true), bouton.setAttribute('aria-expanded', 'false')));
  for (const o of choix) {
    const a = el('a', '', o.texte);
    a.href = o.href;
    a.setAttribute('role', 'menuitem');
    if (o.externe) { a.target = '_blank'; a.rel = 'noopener'; }
    a.addEventListener('click', fermer);
    menu.append(a);
  }
  const copier = el('button', '', "Copier l'adresse");
  copier.type = 'button';
  copier.setAttribute('role', 'menuitem');
  copier.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(adresse); copier.textContent = 'Adresse copiée ✓'; }
    catch { copier.textContent = adresse; } // presse-papiers indisponible : on affiche l'adresse pour qu'elle soit sélectionnable
    setTimeout(() => { copier.textContent = "Copier l'adresse"; }, 2500);
  });
  menu.append(copier);

  if (aPopover) {
    menu.popover = 'auto';
    bouton.setAttribute('popovertarget', menu.id);
    menu.addEventListener('toggle', (ev) => { if (ev.newState === 'open') menu.querySelector('a')?.focus(); });
  } else {
    // Repli : bascule manuelle
    menu.hidden = true;
    bouton.setAttribute('aria-expanded', 'false');
    bouton.addEventListener('click', () => { const ouvrir = menu.hidden; menu.hidden = !ouvrir; bouton.setAttribute('aria-expanded', String(ouvrir)); if (ouvrir) menu.querySelector('a')?.focus(); });
    document.addEventListener('click', (ev) => { if (!racine.contains(ev.target)) fermer(); });
    racine.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { fermer(); bouton.focus(); } });
  }
  racine.append(bouton, menu);
  return racine;
}

// ---- Effets : halo qui suit le curseur, inclinaison 3D de la photo, compteurs animés ------------------------------
function effets() {
  // Halo des cartes en verre : une seule écoute déléguée, mise à jour à chaque image (requestAnimationFrame).
  if (pointeurFin) {
    let attente = false;
    document.addEventListener('pointermove', (ev) => {
      if (attente) return;
      attente = true;
      requestAnimationFrame(() => {
        attente = false;
        const carte = ev.target instanceof Element ? ev.target.closest('.verre') : null;
        if (!carte) return;
        const r = carte.getBoundingClientRect();
        carte.style.setProperty('--mx', `${ev.clientX - r.left}px`);
        carte.style.setProperty('--my', `${ev.clientY - r.top}px`);
      });
    }, { passive: true });

    // Inclinaison 3D de la photo
    const portrait = document.querySelector('.portrait');
    if (portrait && !reduireMouvement) {
      portrait.addEventListener('pointermove', (ev) => {
        const r = portrait.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width - .5;
        const y = (ev.clientY - r.top) / r.height - .5;
        portrait.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`);
        portrait.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`);
      }, { passive: true });
      portrait.addEventListener('pointerleave', () => { portrait.style.setProperty('--rx', '0deg'); portrait.style.setProperty('--ry', '0deg'); });
    }
  }

  // Apparition au défilement : les éléments marqués reçoivent la classe (le CSS gère l'animation si elle est prise en charge).
  document.querySelectorAll('.projet-carte, .carte, .etape, .point, .chiffre, .galerie-vignette, .defis li, .section h2, .intro-section').forEach((e) => e.classList.add('revele'));

  // Compteurs : « ≈ 170 000 », « 900+ »… comptent de 0 à la valeur quand ils deviennent visibles.
  if (!reduireMouvement && 'IntersectionObserver' in window) {
    const format = new Intl.NumberFormat('fr-FR');
    const observateur = new IntersectionObserver((entrees) => {
      for (const e of entrees) {
        if (!e.isIntersecting) continue;
        observateur.unobserve(e.target);
        const m = /^(\D*?)(\d[\d\s\u00a0\u202f]*)(\D*)$/.exec(e.target.dataset.final);
        if (!m) continue;
        const cible = Number(m[2].replace(/[\s\u00a0\u202f]/g, ''));
        const debut = performance.now();
        const duree = 1400;
        const image = (t) => {
          const k = Math.min(1, (t - debut) / duree);
          e.target.textContent = m[1] + format.format(Math.round(cible * (1 - (1 - k) ** 3))) + m[3];
          if (k < 1) requestAnimationFrame(image); else e.target.textContent = e.target.dataset.final;
        };
        requestAnimationFrame(image);
      }
    }, { threshold: .6 });
    document.querySelectorAll('.chiffre strong').forEach((s) => { s.dataset.final = s.textContent; s.setAttribute('aria-label', s.textContent); observateur.observe(s); });
  }
}

// ---- Accueil : présentation + carte du projet -------------------------------------------------------------------------
function accueil(p) {
  document.title = `${p.nom} — ${p.titre}`;
  $('titre-nom').textContent = p.nom;
  $('titre-metier').textContent = p.titre;
  $('accroche').textContent = p.accroche;
  if (p.disponibilite) { $('dispo').textContent = p.disponibilite; $('dispo').hidden = false; }
  if (p.localisation) {
    const pastille = el('span', 'lieu-icone');
    pastille.append(icone('epingle', 16));
    $('lieu').replaceChildren(pastille, el('span', 'lieu-texte', p.localisation));
    $('lieu').hidden = false;
  }

  const photo = $('photo');
  if (p.photo) { photo.src = p.photo; photo.alt = p.photoAlt || `Portrait de ${p.nom}`; } else { photo.closest('figure').hidden = true; }
  activerMots(p.motsCles, p.nom);
  $('liste-projets').append(...p.projets.map(carteProjet));
}

/** Trois mots qui décrivent la personne : la photo se retourne au clic (ou à la touche Entrée / Espace). */
function activerMots(mots, nom) {
  const bouton = $('portrait-bouton');
  const voile = $('mots-voile');
  const valides = (mots || []).filter((m) => m?.mot).slice(0, 3);
  if (!valides.length) { bouton.disabled = true; bouton.classList.add('sans-mots'); return; }

  valides.forEach((m, i) => {
    const bloc = el('span', 'mot');
    bloc.style.setProperty('--i', String(i));
    bloc.append(el('strong', 'mot-titre', m.mot));
    if (m.preuve) bloc.append(el('span', 'mot-preuve', m.preuve));
    voile.append(bloc);
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
  for (const [groupe, items] of Object.entries(stack ?? {})) {
    if (!Array.isArray(items) || !items.length) continue;
    const ul = el('ul', 'etiquettes');
    ul.append(...items.map((i) => el('li', '', i)));
    const g = el('div', 'stack-groupe');
    g.append(el('span', 'stack-titre', groupe), ul);
    bloc.append(g);
  }
  return bloc;
}

/** Carte du projet sur l'accueil : miniature + langages / technologies / outils ; un clic ouvre la page de détail. */
function carteProjet(pr) {
  const carte = el('a', 'projet-carte verre');
  carte.href = `projet.html?id=${encodeURIComponent(pr.id)}`;
  carte.setAttribute('aria-label', `${pr.nom} : voir le détail du projet`);
  const miniature = imageSure(pr.miniature);
  if (miniature) {
    const img = el('img');
    Object.assign(img, { src: miniature, alt: pr.miniatureAlt || `Aperçu de ${pr.nom}`, width: 1280, height: 600, loading: 'lazy', decoding: 'async' });
    const vignette = el('span', 'projet-vignette');
    vignette.append(img, el('span', 'projet-voir', 'Voir le détail →'));
    carte.append(vignette);
  }
  const titres = el('span', 'projet-titres');
  titres.append(el('strong', 'projet-nom', pr.nom), el('span', 'projet-sous', pr.soustitre));
  const entete = el('span', 'projet-entete');
  entete.append(titres);
  if (pr.periode) entete.append(el('span', 'badge', pr.periode));
  const corps = el('span', 'projet-corps');
  corps.append(entete, groupesStack(pr.stack));
  carte.append(corps);
  return carte;
}

// ---- Page de détail du projet ----------------------------------------------------------------------------------------
function projet(p) {
  const id = new URLSearchParams(location.search).get('id');
  const pr = p.projets.find((x) => x.id === id) ?? (p.projets.length === 1 && !id ? p.projets[0] : null);
  const zone = $('detail-projet');
  const conteneur = el('div', 'conteneur');
  zone.replaceChildren(conteneur);
  if (!pr) {
    const retour = el('a', 'bouton', "Retour à l'accueil");
    retour.href = 'index.html#projets';
    conteneur.append(el('h1', 'titre-page', 'Projet introuvable'), retour);
    document.title = `Projet introuvable — ${p.nom}`;
    return;
  }
  document.title = `${pr.nom} — ${p.nom}`;

  const titres = el('div');
  titres.append(el('h1', 'titre-page', pr.nom), el('p', 'projet-sous', pr.soustitre));
  const entete = el('header', 'detail-entete');
  entete.append(titres);
  if (pr.periode) entete.append(el('span', 'badge', pr.periode));
  conteneur.append(entete, el('p', 'projet-resume', pr.resume));

  const liens = el('div', 'actions');
  const site = lienSur(pr.lien || '');
  if (site) { const a = el('a', 'bouton', pr.libelleLien || 'Voir le projet'); Object.assign(a, { href: site, target: '_blank', rel: 'noopener' }); liens.append(a); }
  const depot = lienSur(pr.depot || '');
  if (depot) { const a = el('a', 'bouton bouton-secondaire', 'Code source'); Object.assign(a, { href: depot, target: '_blank', rel: 'noopener' }); liens.append(a); }
  if (liens.children.length) conteneur.append(liens);

  const images = (pr.images ?? []).filter((i) => imageSure(i.src));
  if (images.length) {
    const galerie = el('div', 'galerie');
    images.forEach((i, n) => {
      const fig = el('figure', 'galerie-vignette');
      const ouvrir = el('button', 'galerie-ouvrir');
      ouvrir.type = 'button';
      ouvrir.setAttribute('aria-label', `Agrandir : ${i.legende || i.alt || ''}`);
      const img = el('img');
      Object.assign(img, { src: i.src, alt: i.alt || '', width: 1280, height: 600, loading: 'lazy', decoding: 'async' });
      ouvrir.append(img);
      ouvrir.addEventListener('click', () => visionneuse(images, n));
      fig.append(ouvrir);
      if (i.legende) fig.append(el('figcaption', '', i.legende));
      galerie.append(fig);
    });
    conteneur.append(galerie);
  }

  if (pr.chiffres?.length) {
    const ul = el('ul', 'chiffres');
    for (const c of pr.chiffres) {
      const li = el('li', 'chiffre verre');
      li.append(el('strong', '', c.valeur), el('span', '', c.libelle));
      ul.append(li);
    }
    conteneur.append(ul);
  }
  if (pr.points?.length) {
    const grille = el('ul', 'points');
    for (const pt of pr.points) {
      const li = el('li', 'point verre');
      li.append(el('strong', '', pt.titre), el('span', '', pt.texte));
      grille.append(li);
    }
    conteneur.append(el('h2', 'sous-titre', 'Ce que contient le projet'), grille);
  }
  if (pr.defis?.length) {
    const ul = el('ul', 'defis');
    ul.append(...pr.defis.map((d) => el('li', '', d)));
    conteneur.append(el('h2', 'sous-titre', 'Défis relevés'), ul);
  }
  conteneur.append(el('h2', 'sous-titre', 'Langages, technologies et outils'), groupesStack(pr.stack));
}

/** Visionneuse d'images : <dialog> natif (focus piégé, Échap, fond flouté), flèches du clavier. */
function visionneuse(images, depart) {
  let dialogue = $('lightbox');
  if (!dialogue) {
    dialogue = el('dialog', 'lightbox');
    dialogue.id = 'lightbox';
    dialogue.setAttribute('aria-label', 'Visionneuse d\'images');
    document.body.append(dialogue);
  }
  let n = depart;
  const figure = el('figure');
  const img = el('img');
  const legende = el('figcaption');
  figure.append(img, legende);
  const bouton = (classe, icon, label, action) => {
    const b = el('button', `lb-bouton ${classe}`);
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.append(icone(icon, 22));
    b.addEventListener('click', action);
    return b;
  };
  const afficher = (i) => {
    n = (i + images.length) % images.length;
    img.src = images[n].src;
    img.alt = images[n].alt || '';
    legende.textContent = images[n].legende || '';
  };
  dialogue.replaceChildren(figure);
  if (images.length > 1) dialogue.append(bouton('lb-precedent', 'precedent', 'Image précédente', () => afficher(n - 1)), bouton('lb-suivant', 'suivant', 'Image suivante', () => afficher(n + 1)));
  dialogue.append(bouton('lb-fermer', 'fermer', 'Fermer', () => dialogue.close()));
  dialogue.onclick = (ev) => { if (ev.target === dialogue) dialogue.close(); };
  dialogue.onkeydown = (ev) => { if (ev.key === 'ArrowLeft') afficher(n - 1); else if (ev.key === 'ArrowRight') afficher(n + 1); };
  afficher(depart);
  dialogue.showModal();
}

// ---- Page parcours : à propos, compétences, formation, expérience --------------------------------------------------------
function parcours(p) {
  document.title = `Parcours — ${p.nom}`;
  if (p.apropos?.length) {
    $('apropos-texte').append(...p.apropos.map((t) => el('p', '', t)));
    $('apropos').hidden = false;
  }
  for (const g of p.competences) {
    const ul = el('ul', 'etiquettes');
    ul.append(...g.items.map((i) => el('li', '', i)));
    const bloc = el('div', 'carte verre');
    bloc.append(el('h3', '', g.groupe), ul);
    $('liste-competences').append(bloc);
  }
  const etapes = (idListe, idSection, liste) => {
    if (!liste?.length) return;
    for (const e of liste) {
      const corps = el('div', 'etape-corps');
      corps.append(el('strong', '', e.titre || ''));
      if (e.lieu) corps.append(el('span', 'etape-lieu', ' · ' + e.lieu));
      if (e.texte) corps.append(el('p', '', e.texte));
      const contenu = el('div', 'etape-contenu');
      const logo = imageSure(e.logo);
      if (logo) {
        // Logo de l'école : pastille sombre (le logo est blanc sur transparent), lien vers le site de l'école si fourni.
        const lien = lienSur(e.lienLogo || '');
        const pastille = el(lien ? 'a' : 'span', 'etape-logo');
        if (lien) { pastille.href = lien; pastille.target = '_blank'; pastille.rel = 'noopener'; pastille.setAttribute('aria-label', `${e.logoAlt || 'Site de l\'école'} (nouvel onglet)`); }
        const img = el('img');
        Object.assign(img, { src: logo, alt: lien ? '' : (e.logoAlt || ''), width: 384, height: 384, loading: 'lazy', decoding: 'async' });
        pastille.append(img);
        contenu.append(pastille);
      }
      contenu.append(corps);
      const li = el('li', 'etape');
      li.append(el('span', 'etape-date', e.periode || ''), contenu);
      $(idListe).append(li);
    }
    $(idSection).hidden = false;
  };
  etapes('liste-formations', 'formations', p.formations);
  etapes('liste-parcours', 'parcours', p.parcours);
}

// ---- Démarrage ----------------------------------------------------------------------------------------------------------------
initialiserTheme();
try {
  const reponse = await fetch('data/profil.json', { cache: 'no-cache' });
  if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
  const p = await reponse.json();
  commun(p);
  ({ accueil, projet, parcours })[page]?.(p);
  effets();
} catch (e) {
  console.error(e);
  const cible = $('liste-projets') ?? $('detail-projet') ?? $('contenu');
  cible.append(el('p', 'erreur', "Le contenu n'a pas pu être chargé. Rechargez la page ou revenez dans un instant."));
}
