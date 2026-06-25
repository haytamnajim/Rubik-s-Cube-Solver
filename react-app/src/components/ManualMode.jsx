import Palette from "./Palette.jsx";
import { IconWand } from "./Icons.jsx";

export default function ManualMode({ activeColor, onPickColor, onSolve }) {
  return (
    <div>
      <h2>1. Peignez votre cube</h2>
      <p className="sub">Choisissez une couleur, puis cliquez sur les stickers du cube 3D pour les peindre. Glissez pour tourner. Les centres sont fixes.</p>
      <Palette activeColor={activeColor} onPick={onPickColor} />
      <div className="center-actions">
        <button onClick={onSolve}><IconWand />Résoudre ce cube</button>
      </div>
    </div>
  );
}
