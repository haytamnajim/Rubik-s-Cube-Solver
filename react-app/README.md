# 🧩 Rubik's Cube Solver 3D — version React

Réécriture **React + Vite** de l'application (la version HTML d'origine reste dans `../web/`).

Mêmes fonctionnalités : upload/webcam des 6 faces, détection des couleurs, correction
via patron 2D, solveur Kociemba (cubejs), cube 3D animé (Three.js), guide pas à pas,
saisie manuelle, démo aléatoire, vitesse + raccourcis clavier, plein écran.

## Démarrer

```bash
cd react-app
npm install
npm run dev        # http://localhost:5173
```

## Construire pour la production

```bash
npm run build      # génère dist/
npm run preview    # prévisualise le build
```

## Structure

```
src/
├── main.jsx              # point d'entrée
├── App.jsx               # état global + orchestration
├── styles.css            # styles (thème sombre)
├── hooks/useCube.js      # cube Three.js (build, peinture, animation, drag, clic)
├── lib/
│   ├── geometry.js       # constantes + géométrie + helpers
│   ├── detect.js         # détection des couleurs (HSV) + facelettes
│   └── solver.js         # wrapper cubejs (Kociemba)
└── components/
    ├── Navbar.jsx (mini-cube), PhotoMode.jsx, ManualMode.jsx,
    ├── GuidePanel.jsx, CameraModal.jsx, Net.jsx, Palette.jsx, Icons.jsx
```

## Stack
- React 18 + Vite 5
- three (rendu 3D)
- cubejs (solveur deux phases / Kociemba)
