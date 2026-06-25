// Constantes et géométrie du cube (partagées entre détection, solveur et 3D).
export const FACE_ORDER = ["U", "R", "F", "D", "L", "B"];

export const COLOR_HEX = {
  white: 0xffffff, yellow: 0xffd500, red: 0xdd2222,
  orange: 0xff8800, blue: 0x0066cc, green: 0x22aa22, gray: 0x2b303c,
};

export const CENTER_COLOR = { U: "white", R: "red", F: "green", D: "yellow", L: "orange", B: "blue" };

export const FACE_NORMAL = {
  U: [0, 1, 0], R: [1, 0, 0], F: [0, 0, 1], D: [0, -1, 0], L: [-1, 0, 0], B: [0, 0, -1],
};

// Position (x,y,z) de chaque facelette, dans l'ordre de lecture de cubejs.
export const FACELET_POS = {
  U: [[-1,1,-1],[0,1,-1],[1,1,-1],[-1,1,0],[0,1,0],[1,1,0],[-1,1,1],[0,1,1],[1,1,1]],
  R: [[1,1,1],[1,1,0],[1,1,-1],[1,0,1],[1,0,0],[1,0,-1],[1,-1,1],[1,-1,0],[1,-1,-1]],
  F: [[-1,1,1],[0,1,1],[1,1,1],[-1,0,1],[0,0,1],[1,0,1],[-1,-1,1],[0,-1,1],[1,-1,1]],
  D: [[-1,-1,1],[0,-1,1],[1,-1,1],[-1,-1,0],[0,-1,0],[1,-1,0],[-1,-1,-1],[0,-1,-1],[1,-1,-1]],
  L: [[-1,1,-1],[-1,1,0],[-1,1,1],[-1,0,-1],[-1,0,0],[-1,0,1],[-1,-1,-1],[-1,-1,0],[-1,-1,1]],
  B: [[1,1,-1],[0,1,-1],[-1,1,-1],[1,0,-1],[0,0,-1],[-1,0,-1],[1,-1,-1],[0,-1,-1],[-1,-1,-1]],
};

export const MOVE_DEF = {
  U: { axis: "y", layer: 1, dir: -1 }, D: { axis: "y", layer: -1, dir: 1 },
  R: { axis: "x", layer: 1, dir: -1 }, L: { axis: "x", layer: -1, dir: 1 },
  F: { axis: "z", layer: 1, dir: -1 }, B: { axis: "z", layer: -1, dir: 1 },
};

export const MOVE_LABEL = {
  U: "Face HAUT", D: "Face BAS", R: "Face DROITE", L: "Face GAUCHE", F: "Face AVANT", B: "Face ARRIÈRE",
};

export function parseMove(mv) {
  const face = mv[0];
  const mod = mv.slice(1);
  let quarter = 1;
  if (mod === "2") quarter = 2;
  else if (mod === "'") quarter = -1;
  return { face, quarter };
}

export function invertMove(mv) {
  const { face, quarter } = parseMove(mv);
  if (quarter === 2) return face + "2";
  return quarter === -1 ? face : face + "'";
}

export function describeMove(mv) {
  if (!mv) return "";
  const { face, quarter } = parseMove(mv);
  const sens = quarter === 2 ? "un demi-tour (180°)" : quarter === -1 ? "sens anti-horaire (90°)" : "sens horaire (90°)";
  return MOVE_LABEL[face] + " — " + sens;
}

export function solvedFaces() {
  return {
    U: Array(9).fill("white"), R: Array(9).fill("red"), F: Array(9).fill("green"),
    D: Array(9).fill("yellow"), L: Array(9).fill("orange"), B: Array(9).fill("blue"),
  };
}

export function blankPreviewFaces() {
  const f = {};
  for (const k of FACE_ORDER) { f[k] = Array(9).fill("gray"); f[k][4] = CENTER_COLOR[k]; }
  return f;
}

// Chaîne 54 facelettes (URFDLB, lettres de face) -> objet couleurs {U:[9],...}.
export function faceletsToFaces(str) {
  const faces = {};
  FACE_ORDER.forEach((f, fi) => {
    faces[f] = [];
    for (let i = 0; i < 9; i++) faces[f].push(CENTER_COLOR[str[fi * 9 + i]]);
  });
  return faces;
}
