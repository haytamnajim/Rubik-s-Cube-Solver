import { describeMove } from "../lib/geometry.js";
import { IconPlay, IconPause, IconPrev, IconNext, IconRestart, IconTrophy } from "./Icons.jsx";

export default function GuidePanel({ moves, step, playing, animSpeed, onPlay, onPrev, onNext, onReset, onSpeed }) {
  const pct = moves.length ? Math.round((step / moves.length) * 100) : 0;
  const done = step >= moves.length;
  const cur = done ? null : moves[step];
  return (
    <div className="panel">
      <h2 style={{ margin: "0 0 14px" }}>2. Guide de résolution</h2>
      <div><span className="bigcount">{moves.length}</span> <span style={{ color: "var(--muted)" }}>mouvements</span></div>
      <div className="progress"><div style={{ width: pct + "%" }} /></div>
      <div className="currentmove">
        <div className="big">{done ? <IconTrophy /> : (cur || "—")}</div>
        <div className="desc">{done ? "Cube résolu ! Bravo." : describeMove(cur)}</div>
        <div style={{ marginTop: 6, color: "var(--muted)" }}>Étape <b>{step}</b> / {moves.length}</div>
      </div>
      <div className="controls">
        <button className="sec" onClick={onReset}><IconRestart /><span>Début</span></button>
        <button className="sec" onClick={onPrev}><IconPrev /><span>Précédent</span></button>
        <button onClick={onPlay}>{playing ? <IconPause /> : <IconPlay />}<span>{playing ? "Pause" : "Lecture"}</span></button>
        <button className="sec" onClick={onNext}><IconNext /><span>Suivant</span></button>
      </div>
      <div className="speedrow">
        <span>Vitesse</span>
        <input type="range" min="0.5" max="3" step="0.5" value={animSpeed} onChange={(e) => onSpeed(parseFloat(e.target.value))} />
        <b>{animSpeed}×</b>
      </div>
      <div className="moveline">
        {moves.map((m, i) => (
          <span key={i} className={"m" + (i < step ? " done" : "") + (i === step ? " current" : "")}>{m}</span>
        ))}
      </div>
    </div>
  );
}
