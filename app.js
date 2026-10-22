// Portfolio dynamique : tout le contenu vient de data/profil.json (modifier ce fichier suffit, aucun HTML à toucher).
// Les textes sont toujours insérés avec textContent (jamais innerHTML) : le contenu du JSON ne peut pas injecter de code.
(() => {
  const $ = (id) => document.getElementById(id);

  /** Crée un élément avec classe et texte. */
  function el(balise, classe, texte) {
    const e = document.createElement(balise);
    if (classe) e.className = classe;
    if (texte !== undefined && texte !== null) e.textContent = texte;
    return e;
  }

  // Logos des réseaux (Simple Icons, licence CC0) et enveloppe pour l'email ; ils héritent de la couleur du texte (thème clair/sombre).
  const ICONES = {
    github: { vue: '0 0 24 24', d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12', rempli: true },
    linkedin: { vue: '0 0 24 24', d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', rempli: true },
    email: { vue: '0 0 24 24', d: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 2.2V18h18V7.2l-8.4 6.3a1 1 0 0 1-1.2 0L3 7.2zM4.3 6l7.7 5.8L19.7 6H4.3z', rempli: true },
  };

  /** Icône SVG décorative (le texte du bouton porte le sens). */
  function icone(nom) {
    const i = ICONES[String(nom).toLowerCase()];
    if (!i) return null;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', i.vue);
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('fill', 'currentColor');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', i.d);
    if (i.rempli) path.setAttribute('fill-rule', 'evenodd');
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

  function afficher(p) {
    document.title = `${p.nom} — ${p.titre}`;
    $('marque').textContent = p.nom;
    $('pied-nom').textContent = p.nom;
    $('titre-nom').textContent = p.nom;
    $('titre-metier').textContent = p.titre;
    $('accroche').textContent = p.accroche;
    if (p.disponibilite) { $('dispo').textContent = p.disponibilite; $('dispo').hidden = false; }
    if (p.localisation) { $('lieu').textContent = '📍 ' + p.localisation; $('lieu').hidden = false; }

    const photo = $('photo');
    if (p.photo) { photo.src = p.photo; photo.alt = p.photoAlt || `Portrait de ${p.nom}`; } else { photo.closest('figure').hidden = true; }

    const cv = lienSur(p.cv || '');
    if (cv) { $('cta-cv').href = cv; $('cta-cv').hidden = false; }

    // À propos
    if (p.apropos && p.apropos.length) {
      p.apropos.forEach((t) => $('apropos-texte').appendChild(el('p', '', t)));
      $('apropos').hidden = false;
    }

    // Projets
    p.projets.forEach((pr) => $('liste-projets').appendChild(carteProjet(pr)));

    // Compétences
    p.competences.forEach((g) => {
      const bloc = el('div', 'carte');
      bloc.appendChild(el('h3', '', g.groupe));
      const ul = el('ul', 'etiquettes');
      g.items.forEach((i) => ul.appendChild(el('li', '', i)));
      bloc.appendChild(ul);
      $('liste-competences').appendChild(bloc);
    });

    // Formation et expérience (une section masquée si sa liste est vide)
    const etapes = (idListe, idSection, liste) => {
      if (!liste || !liste.length) return false;
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
      return true;
    };
    const aFormation = etapes('liste-formations', 'formations', p.formations);
    const aExperience = etapes('liste-parcours', 'parcours', p.parcours);
    if (aFormation || aExperience) $('menu-parcours').hidden = false;

    // Contacts : seuls ceux qui sont renseignés apparaissent ; pas de contact = pas de section vide.
    const contacts = (p.contacts || []).map((c) => {
      const brut = c.lien || (/^email$/i.test(c.libelle) && c.valeur ? `mailto:${c.valeur}` : '');
      return { ...c, href: lienSur(brut) };
    }).filter((c) => c.href);
    if (contacts.length) {
      contacts.forEach((c) => {
        const li = el('li');
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
      $('cta-contact').hidden = false;
    }
    $('annee').textContent = new Date().getFullYear();
  }

  function carteProjet(pr) {
    const carte = el('article', 'projet');
    const entete = el('header', 'projet-entete');
    const titres = el('div');
    titres.appendChild(el('h3', 'projet-nom', pr.nom));
    titres.appendChild(el('p', 'projet-sous', pr.soustitre));
    entete.appendChild(titres);
    if (pr.periode) entete.appendChild(el('span', 'badge', pr.periode));
    carte.appendChild(entete);

    carte.appendChild(el('p', 'projet-resume', pr.resume));

    if (pr.chiffres && pr.chiffres.length) {
      const ul = el('ul', 'chiffres');
      pr.chiffres.forEach((c) => {
        const li = el('li', 'chiffre');
        li.appendChild(el('strong', '', c.valeur));
        li.appendChild(el('span', '', c.libelle));
        ul.appendChild(li);
      });
      carte.appendChild(ul);
    }

    const liens = el('div', 'actions');
    const site = lienSur(pr.lien || '');
    if (site) { const a = el('a', 'bouton', pr.libelleLien || 'Voir le projet'); a.href = site; a.target = '_blank'; a.rel = 'noopener'; liens.appendChild(a); }
    const depot = lienSur(pr.depot || '');
    if (depot) { const a = el('a', 'bouton bouton-secondaire', 'Code source'); a.href = depot; a.target = '_blank'; a.rel = 'noopener'; liens.appendChild(a); }
    if (liens.children.length) carte.appendChild(liens);

    if (pr.points && pr.points.length) {
      carte.appendChild(el('h4', '', 'Ce que contient le projet'));
      const grille = el('ul', 'points');
      pr.points.forEach((pt) => {
        const li = el('li', 'point');
        li.appendChild(el('strong', '', pt.titre));
        li.appendChild(el('span', '', pt.texte));
        grille.appendChild(li);
      });
      carte.appendChild(grille);
    }
    if (pr.defis && pr.defis.length) {
      carte.appendChild(el('h4', '', 'Défis relevés'));
      const ul = el('ul', 'defis');
      pr.defis.forEach((d) => ul.appendChild(el('li', '', d)));
      carte.appendChild(ul);
    }
    if (pr.technos && pr.technos.length) {
      carte.appendChild(el('h4', '', 'Technologies'));
      const ul = el('ul', 'etiquettes');
      pr.technos.forEach((t) => ul.appendChild(el('li', '', t)));
      carte.appendChild(ul);
    }
    return carte;
  }

  fetch('data/profil.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(afficher)
    .catch(() => {
      const m = el('p', 'erreur', "Le contenu n'a pas pu être chargé. Rechargez la page ou revenez dans un instant.");
      $('liste-projets').appendChild(m);
    });
})();
