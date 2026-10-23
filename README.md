# Portfolio de Brandon Gil

Site vitrine personnel, pensé pour les recruteurs : comprendre en quelques secondes qui je suis, voir un projet concret et pouvoir me contacter.

**Voir le site : [brandon-gil.github.io](https://brandon-gil.github.io)**

> Ce document décrit **comment le site est construit et ce que chaque rubrique permet de faire**. Il ne reprend volontairement pas le contenu du portfolio (parcours, projet, coordonnées) : pour cela, rendez-vous sur le site.

---

## Le principe en bref

- Un site **multi-pages** (accueil, détail du projet, parcours) servi tel quel par GitHub Pages : **aucun serveur, aucune base de données, aucun framework, aucune étape de compilation**.
- Le contenu est **séparé de la mise en page** : toutes les informations affichées viennent d'un seul fichier de données (`data/profil.json`). Les pages sont composées dans le navigateur à partir de ce fichier.
- Un site **rapide, accessible et sûr**, écrit avec les fonctions les plus récentes du web, avec un repli propre sur les navigateurs qui ne les ont pas encore.

---

## Les pages et leurs rubriques

### Accueil (`index.html`)

| Rubrique | Ce qu'elle fait |
|---|---|
| **Barre de navigation** | Pilule flottante en verre dépoli, toujours visible : liens vers les pages, bouton de thème clair/sombre et bouton de téléchargement du CV. |
| **Bouton « Télécharger mon CV »** | En haut à droite sur toutes les pages. Animé (brillance qui balaie, halo qui tourne) pour attirer l'œil ; télécharge le CV au format PDF. |
| **Présentation** | Le premier écran : métier visé, nom, accroche, pastilles d'information (disponibilité, localisation, école), et deux boutons d'action (voir le projet, me contacter). |
| **Photo interactive** | Portrait qui s'incline en 3D au survol. Au clic (ou au clavier), il **se retourne comme une carte** pour révéler trois mots clés accompagnés d'une justification courte. |
| **Rubrique Projet** | Une carte cliquable : miniature du projet, langages, technologies et outils utilisés, et une mention sur son état d'avancement. Un clic ouvre la page de détail. |
| **Contact** | Boutons vers l'e-mail, LinkedIn et GitHub. Le bouton e-mail ouvre un petit menu qui prépare un nouveau message (webmail ou application de messagerie) ou copie l'adresse. |
| **Groupe d'appartenance** | Grand bloc en bas de page présentant le groupe auquel appartient l'école, avec son logo et un lien vers son site. |

### Détail du projet (`projet.html`)

| Rubrique | Ce qu'elle fait |
|---|---|
| **En-tête du projet** | Titre, sous-titre, période, résumé, et bandeau précisant l'état d'avancement des applications concernées. |
| **Boutons** | Lien vers le projet en ligne (et vers le code source si un dépôt est renseigné). |
| **Galerie** | Captures du projet. Un clic ouvre une **visionneuse plein écran** (flèches du clavier, touche Échap pour fermer). |
| **Chiffres clés** | Quelques indicateurs qui **comptent de zéro à leur valeur** quand ils deviennent visibles, avec une note de bas de bloc si nécessaire. |
| **Fonctionnalités** | Cartes numérotées décrivant ce que contient le projet ; certaines portent un badge de statut. |
| **Défis relevés** | Liste des difficultés techniques rencontrées et de la façon dont elles ont été traitées. |
| **Langages, technologies et outils** | Étiquettes regroupées par catégorie. |

### Parcours (`parcours.html`)

| Rubrique | Ce qu'elle fait |
|---|---|
| **À propos** | Présentation personnelle en quelques paragraphes, suivie d'un bloc dédié à ce que m'apporte un engagement hors du cadre professionnel (logo, texte court, mots-clés). |
| **Compétences** | Cartes par catégorie (langages, back-end, front-end, tests, outils, bureautique, atouts, langues). |
| **Formation** | **Frise chronologique** : période, intitulé, établissement, avec le logo de l'école quand il existe (cliquable ou agrandissable). |
| **Expérience professionnelle** | Frise chronologique, la plus récente ou celle en cours en premier, avec un badge « en cours » le cas échéant. |
| **Contact** | Rappel des moyens de contact en bas de page. |

### Page 404 (`404.html`)

Page d'erreur aux couleurs du site, avec un retour à l'accueil.

---

## Fonctionnalités communes à toutes les pages

- **Thème clair / sombre** : suit le système par défaut, modifiable d'un clic, choix mémorisé sans clignotement au chargement.
- **Responsive** : mise en page pensée d'abord pour le téléphone, puis adaptée aux tablettes et ordinateurs.
- **Transitions entre pages** : navigation fluide (l'en-tête reste en place, le contenu glisse) lorsque le navigateur le permet.
- **Animations au défilement** : apparition progressive des blocs et barre de progression de lecture, sans JavaScript lourd.
- **Accessibilité** : navigation complète au clavier, lien d'évitement, focus visibles, textes alternatifs, rôles ARIA, respect des préférences « réduire les animations » et « contraste renforcé ».
- **Partage et référencement** : titres et descriptions par page, image d'aperçu pour les réseaux et messageries, données structurées pour les moteurs de recherche.
- **Impression** : version épurée (sans barre ni animations).

---

## Technologies utilisées

| Domaine | Choix |
|---|---|
| **Langages** | HTML5, CSS moderne, JavaScript (modules ES) — rien d'autre, **aucune dépendance** |
| **CSS** | Couches (`@layer`), imbrication native, couleurs `oklch`/`color-mix`, `light-dark()`, requêtes de conteneur, `:has()`, animations liées au défilement, transitions de vue, positionnement par ancre, `@property`, `@starting-style` |
| **Éléments natifs** | `popover` (menu e-mail), `<dialog>` (visionneuse d'images) |
| **Typographie** | Inter (variable), **hébergée sur le site** |
| **Icônes** | SVG intégrés (logos réseaux : Simple Icons, domaine public CC0) |
| **Hébergement** | GitHub Pages, HTTPS |

### Sécurité et performance

- **Politique de sécurité du contenu (CSP) stricte** : le site n'exécute que ses propres fichiers (aucun script ou style en ligne, aucune ressource externe).
- Les textes du fichier de données sont insérés **sans HTML** et seuls les liens `http`, `https` et `mailto` sont acceptés.
- Police et images optimisées, chargement différé des images hors écran, aucune bibliothèque tierce.

### Compatibilité

Pensé pour les navigateurs récents ; vérifié sur Chromium (Chrome, Edge). Les fonctions les plus récentes sont **prévues avec un repli** : sans elles, le contenu doit rester lisible et utilisable, seules certaines animations ou positions changent.

---

## Organisation des fichiers

```
index.html        Accueil
projet.html       Détail du projet
parcours.html     À propos, compétences, formation, expérience
404.html          Page d'erreur
style.css         Design du site (couches : reset, jetons, base, composants, pages, effets)
app.js            Composition des pages à partir des données, interactions
theme.js          Applique le thème choisi avant le premier affichage
data/profil.json  Toutes les informations affichées
assets/           Photo, logos, captures, police, image d'aperçu
```

## Mettre à jour le site

1. Modifier `data/profil.json` (textes, listes, liens) ou remplacer un fichier dans `assets/`.
2. Pousser sur la branche `main` : GitHub Pages republie le site en une à deux minutes.

---

## Droits d'utilisation

Les textes, la photo, le CV et les logos présentés sur ce site appartiennent à leurs propriétaires respectifs (les logos d'établissements sont des marques de leurs détenteurs et ne servent qu'à indiquer une affiliation). Ils ne sont pas réutilisables sans accord. La police Inter est sous licence SIL OFL 1.1 (voir `assets/fonts/Inter-LICENSE.txt`).
