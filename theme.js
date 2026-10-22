// Applique le thème choisi AVANT le premier affichage (évite un flash clair/sombre). Sans choix, le thème suit le système.
try { const t = localStorage.getItem('theme'); if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; } catch { /* stockage indisponible */ }
