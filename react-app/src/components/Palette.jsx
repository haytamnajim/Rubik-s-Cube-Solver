import { COLOR_HEX } from "../lib/geometry.js";

const PALETTE = [
  { name: "white", label: "Blanc" }, { name: "red", label: "Rouge" }, { name: "green", label: "Vert" },
  { name: "yellow", label: "Jaune" }, { name: "orange", label: "Orange" }, { name: "blue", label: "Bleu" },
];

const hex = (n) => "#" + n.toString(16).padStart(6, "0");

export default function Palette({ activeColor, onPick }) {
  return (
    <div className="palette">
      {PALETTE.map((c) => (
        <div
          key={c.name}
          className={"swatch" + (c.name === activeColor ? " active" : "")}
          style={{ background: hex(COLOR_HEX[c.name]) }}
          title={c.label}
          onClick={() => onPick(c.name)}
        />
      ))}
    </div>
  );
}
