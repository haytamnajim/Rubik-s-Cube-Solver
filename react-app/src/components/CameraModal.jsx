import { useEffect, useRef, useState } from "react";

const CAM_FACES = ["U", "R", "F", "D", "L", "B"];
const NOM = { U: "Haut (U)", R: "Droite (R)", F: "Avant (F)", D: "Bas (D)", L: "Gauche (L)", B: "Arrière (B)" };

export default function CameraModal({ open, dataUrls, onCapture, onClose, onError }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [target, setTarget] = useState("U");

  useEffect(() => {
    if (!open) return;
    setTarget(CAM_FACES.find((f) => !dataUrls[f]) || "U");
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        onError("La webcam nécessite HTTPS ou localhost. Hébergez l'app pour l'utiliser sur téléphone.");
        onClose(); return;
      }
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        onError("Caméra indisponible : " + err.message + " — autorisez l'accès à la caméra.");
        onClose();
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
      if (videoRef.current) videoRef.current.srcObject = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function shoot() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const s = Math.min(v.videoWidth, v.videoHeight);
    const c = document.createElement("canvas"); c.width = s; c.height = s;
    c.getContext("2d").drawImage(v, (v.videoWidth - s) / 2, (v.videoHeight - s) / 2, s, s, 0, 0, s, s);
    onCapture(target, c.toDataURL("image/jpeg", 0.9));
    const captured = { ...dataUrls, [target]: true };
    const next = CAM_FACES.find((f) => !captured[f]);
    if (next) setTarget(next);
  }

  if (!open) return null;
  return (
    <div className="cam-modal" onClick={(e) => { if (e.target.classList.contains("cam-modal")) onClose(); }}>
      <div className="cam-box">
        <div className="cam-head">
          <span>Capturer : <b>{NOM[target]}</b></span>
          <button className="sec" onClick={onClose}>Fermer</button>
        </div>
        <video ref={videoRef} className="cam-video" autoPlay playsInline muted />
        <div className="cam-chips">
          {CAM_FACES.map((f) => (
            <button key={f} className={"cam-chip" + (dataUrls[f] ? " done" : "") + (f === target ? " active" : "")}
              title={NOM[f]} onClick={() => setTarget(f)}>{f}</button>
          ))}
        </div>
        <div className="cam-actions"><button onClick={shoot}>Capturer cette face</button></div>
        <p className="cam-hint">Cadrez bien la face (lumière correcte). Sur téléphone, la caméra arrière est utilisée. Cliquez une pastille pour choisir la face.</p>
      </div>
    </div>
  );
}
