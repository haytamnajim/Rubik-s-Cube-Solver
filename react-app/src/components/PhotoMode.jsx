import Palette from "./Palette.jsx";
import Net from "./Net.jsx";
import { IconCamera, IconWand } from "./Icons.jsx";

const FACES = [
  { key: "U", nom: "Haut", color: "var(--u)", hint: "Cube par-dessus (Vert devant)." },
  { key: "R", nom: "Droite", color: "var(--r)", hint: "La face de droite." },
  { key: "F", nom: "Avant", color: "var(--f)", hint: "La face Verte, de face." },
  { key: "D", nom: "Bas", color: "var(--d)", hint: "Le dessous (Vert devant)." },
  { key: "L", nom: "Gauche", color: "var(--l)", hint: "La face de gauche." },
  { key: "B", nom: "Arrière", color: "var(--b)", hint: "La face opposée au Vert." },
];

export default function PhotoMode({ faces, dataUrls, onFile, onOpenCam, activeColor, onPickColor, onNetPaint, solveDisabled, onSolve }) {
  return (
    <div>
      <h2>1. Vos 6 faces</h2>
      <div className="center-actions" style={{ margin: "0 0 16px" }}>
        <button className="sec" onClick={onOpenCam}><IconCamera />Prendre les photos (webcam)</button>
      </div>
      <div className="grid">
        {FACES.map((f) => (
          <div key={f.key} className={"face" + (dataUrls[f.key] ? " filled" : "")}>
            <div className="badge"><span className="dot" style={{ background: f.color }} />{f.nom} ({f.key})</div>
            <div className="hint">{f.hint}</div>
            <label className="drop">
              {dataUrls[f.key] ? <img src={dataUrls[f.key]} alt={f.key} /> : <span>+ Photo</span>}
              <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) onFile(f.key, file); e.target.value = ""; }} />
            </label>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 26 }}>2. Vérifiez &amp; corrigez</h2>
      <p className="sub" style={{ margin: "0 0 8px" }}>Choisissez une couleur puis cliquez un sticker du patron pour corriger une lecture. Les centres sont fixes.</p>
      <Palette activeColor={activeColor} onPick={onPickColor} />
      <Net faces={faces} onPaint={onNetPaint} />

      <div className="center-actions">
        <button disabled={solveDisabled} onClick={onSolve}><IconWand />Analyser &amp; Résoudre</button>
      </div>
    </div>
  );
}
