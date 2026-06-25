// Détection déterministe des couleurs d'une face à partir d'une image (dataURL).
import { FACE_ORDER } from "./geometry.js";

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0; const s = max === 0 ? 0 : d / max, v = max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return [h, s, v];
}

export function classify(r, g, b) {
  const [h, s, v] = rgbToHsv(r, g, b);
  if (v > 0.6 && s < 0.25) return "white";
  if (h < 16 || h >= 345) return "red";
  if (h < 45) return "orange";
  if (h < 72) return "yellow";
  if (h < 170) return "green";
  if (h < 265) return "blue";
  return "red";
}

// Lit les 9 stickers (grille 3x3) d'une image de face.
export function detectFace(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const fr = [0.2, 0.5, 0.8];
      const patch = Math.max(4, Math.round(Math.min(c.width, c.height) * 0.05));
      const colors = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const cx = Math.round(c.width * fr[col]);
          const cy = Math.round(c.height * fr[row]);
          const data = ctx.getImageData(cx - patch, cy - patch, patch * 2, patch * 2).data;
          let R = 0, G = 0, B = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) { R += data[i]; G += data[i + 1]; B += data[i + 2]; n++; }
          colors.push(classify(R / n, G / n, B / n));
        }
      }
      resolve(colors);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Construit la chaîne 54 facelettes URFDLB pour cubejs, à partir des couleurs.
export function buildFacelets(faces) {
  const colorToFace = {};
  for (const f of FACE_ORDER) {
    const center = faces[f][4];
    if (colorToFace[center] !== undefined)
      throw new Error(`Deux faces ont la même couleur centrale (${center}). Chaque centre doit être unique.`);
    colorToFace[center] = f;
  }
  if (Object.keys(colorToFace).length !== 6) throw new Error("Il faut 6 couleurs centrales différentes.");
  let s = "";
  for (const f of FACE_ORDER)
    for (const col of faces[f]) {
      if (colorToFace[col] === undefined) throw new Error(`Couleur non reconnue : ${col}.`);
      s += colorToFace[col];
    }
  for (const f of FACE_ORDER) {
    const n = s.split("").filter((ch) => ch === f).length;
    if (n !== 9) throw new Error(`La couleur de la face ${f} apparaît ${n} fois au lieu de 9. Vérifiez les couleurs.`);
  }
  return s;
}
