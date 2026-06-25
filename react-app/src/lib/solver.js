// Wrapper autour de cubejs (algorithme de Kociemba).
import Cube from "cubejs";
import "cubejs/lib/solve.js";

let ready = false;

export function initSolver() {
  if (ready) return;
  Cube.initSolver();
  ready = true;
}
export function solverReady() { return ready; }

// Résout une chaîne de 54 facelettes (URFDLB) -> "R U R' ...".
export function solveFacelets(facelets) {
  return Cube.fromString(facelets).solve();
}

// Renvoie la chaîne 54 facelettes d'un cube mélangé aléatoire valide.
export function randomFacelets() {
  return Cube.random().asString();
}
