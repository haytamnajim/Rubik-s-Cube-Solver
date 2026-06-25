import { COLOR_HEX } from "../lib/geometry.js";

const NET_FACES = ["U", "L", "F", "R", "B", "D"];
const hex = (c) => "#" + (COLOR_HEX[c] !== undefined ? COLOR_HEX[c] : COLOR_HEX.gray).toString(16).padStart(6, "0");

// Patron 2D (cube déplié) cliquable pour corriger les couleurs.
export default function Net({ faces, onPaint }) {
  return (
    <div className="net">
      {NET_FACES.map((f) => (
        <div key={f} className={"netface nf-" + f}>
          {faces[f].map((col, i) => (
            <div
              key={i}
              className={"netcell" + (i !== 4 ? " edit" : "")}
              style={{ background: hex(col) }}
              title={i === 4 ? "centre (fixe)" : ""}
              onClick={i !== 4 ? () => onPaint(f, i) : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
