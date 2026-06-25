import { IconGithub } from "./Icons.jsx";

const REPO = "https://github.com/haytamnajim/Rubik-s-Cube-Solver";
const MINI = [
  { cls: "mc-front", col: "#27ae46" }, { cls: "mc-back", col: "#1273e8" },
  { cls: "mc-right", col: "#e23b3b" }, { cls: "mc-left", col: "#ff8a1e" },
  { cls: "mc-top", col: "#ffffff" }, { cls: "mc-bottom", col: "#ffd500" },
];

function MiniCube() {
  return (
    <div className="scene">
      <div className="mini-cube">
        {MINI.map((f) => (
          <div key={f.cls} className={"mc-face " + f.cls}>
            {Array.from({ length: 9 }).map((_, i) => (
              <i key={i} style={{ background: f.col }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="brand">
        <MiniCube />
        <span className="name">Rubik Solver 3D</span>
      </div>
      <div className="nav-actions">
        <a className="nav-link" href={REPO} target="_blank" rel="noopener noreferrer">
          <IconGithub /><span>GitHub</span>
        </a>
      </div>
    </nav>
  );
}
