import { useEffect, useRef, useState, useCallback } from "react";
import { useCube } from "./hooks/useCube.js";
import { initSolver, solveFacelets, randomFacelets } from "./lib/solver.js";
import { detectFace, buildFacelets } from "./lib/detect.js";
import {
  FACE_ORDER, blankPreviewFaces, solvedFaces, faceletsToFaces, invertMove,
} from "./lib/geometry.js";
import Navbar from "./components/Navbar.jsx";
import PhotoMode from "./components/PhotoMode.jsx";
import ManualMode from "./components/ManualMode.jsx";
import GuidePanel from "./components/GuidePanel.jsx";
import CameraModal from "./components/CameraModal.jsx";
import { IconCube, IconCamera, IconPencil, IconShuffle, IconFullscreen, IconInfo, IconCheck, IconAlert, IconSpinner } from "./components/Icons.jsx";

const REPO = "https://github.com/haytamnajim/Rubik-s-Cube-Solver";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function StatusBar({ status }) {
  const icon = status.type === "load" ? <IconSpinner /> : status.type === "ok" ? <IconCheck /> : status.type === "err" ? <IconAlert /> : <IconInfo />;
  return <div className={"status" + (status.type === "err" ? " err" : "")}>{icon}<span>{status.msg}</span></div>;
}

export default function App() {
  // ----- état -----
  const [mode, setMode] = useState("photo");
  const [solverReady, setSolverReady] = useState(false);
  const [photoFaces, setPhotoFaces] = useState(blankPreviewFaces());
  const [manualFaces, setManualFaces] = useState(solvedFaces());
  const [dataUrls, setDataUrls] = useState({});
  const [moves, setMoves] = useState([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [solved, setSolved] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1);
  const [activeColor, setActiveColor] = useState("white");
  const [status, setStatus] = useState({ msg: "Préparation du solveur…", type: "info" });
  const [caption, setCaption] = useState("Aperçu 3D — il se remplit à chaque photo ajoutée. Glissez pour tourner.");
  const [camOpen, setCamOpen] = useState(false);

  // ----- refs (pour callbacks asynchrones / boucle de lecture) -----
  const stepRef = useRef(0), playingRef = useRef(false), animatingRef = useRef(false);
  const movesRef = useRef([]), animSpeedRef = useRef(1);
  const modeRef = useRef("photo"), solvedRef = useRef(false), solverReadyRef = useRef(false);
  const activeColorRef = useRef("white"), photoFacesRef = useRef(photoFaces), manualFacesRef = useRef(manualFaces);
  const solveSourceRef = useRef(null), handlersRef = useRef({});
  // synchronise les refs à chaque rendu
  movesRef.current = moves; animSpeedRef.current = animSpeed; modeRef.current = mode;
  solvedRef.current = solved; solverReadyRef.current = solverReady; activeColorRef.current = activeColor;
  photoFacesRef.current = photoFaces; manualFacesRef.current = manualFaces;

  const setStepBoth = (n) => { stepRef.current = n; setStep(n); };
  const setPlayingBoth = (v) => { playingRef.current = v; setPlaying(v); };

  // ----- peinture manuelle (clic sur un sticker du cube 3D) -----
  const handleManualPaint = useCallback((face, idx) => {
    setManualFaces((prev) => {
      const next = { ...prev, [face]: prev[face].slice() };
      next[face][idx] = activeColorRef.current;
      paintFace(face, next[face]);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStickerPaint = mode === "manual" && !solved ? handleManualPaint : null;
  const { canvasRef, build, paintFace, animateMove, resize } = useCube(onStickerPaint);

  // ----- init du solveur -----
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        initSolver();
        setSolverReady(true);
        setStatus({ msg: "Prêt — chargez vos 6 faces ou cliquez « Mélanger ».", type: "info" });
      } catch (e) { setStatus({ msg: "Erreur d'init du solveur : " + e.message, type: "err" }); }
    }, 60);
    return () => clearTimeout(t);
  }, []);

  // ----- traitement d'une image de face (fichier ou webcam) -----
  const processFaceImage = useCallback(async (face, dataUrl) => {
    setDataUrls((prev) => ({ ...prev, [face]: dataUrl }));
    try {
      const colors = await detectFace(dataUrl);
      const nf = { ...photoFacesRef.current, [face]: colors };
      photoFacesRef.current = nf;
      setPhotoFaces(nf);
      if (modeRef.current === "photo" && !solvedRef.current) paintFace(face, colors);
    } catch (e) { /* image illisible */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paintFace]);

  const onFile = (face, file) => {
    const reader = new FileReader();
    reader.onload = () => processFaceImage(face, reader.result);
    reader.readAsDataURL(file);
  };

  const onNetPaint = (face, idx) => {
    setPhotoFaces((prev) => {
      const next = { ...prev, [face]: prev[face].slice() };
      next[face][idx] = activeColorRef.current;
      photoFacesRef.current = next;
      if (modeRef.current === "photo" && !solvedRef.current) paintFace(face, next[face]);
      return next;
    });
  };

  // ----- résolution -----
  const runSolve = useCallback((facesObj) => {
    setStatus({ msg: "Calcul de la solution…", type: "load" });
    let facelets, solStr;
    try { facelets = buildFacelets(facesObj); }
    catch (e) { setStatus({ msg: e.message, type: "err" }); return false; }
    try { solStr = solveFacelets(facelets); }
    catch (e) { setStatus({ msg: "État de cube invalide (impossible à résoudre). Vérifiez les couleurs.", type: "err" }); return false; }
    if (typeof solStr !== "string" || /error/i.test(solStr)) {
      setStatus({ msg: "État de cube invalide. Vérifiez les couleurs.", type: "err" }); return false;
    }
    const arr = solStr.split(/\s+/).filter(Boolean);
    solveSourceRef.current = facesObj;
    build(facesObj);
    movesRef.current = arr; setMoves(arr);
    setPlayingBoth(false); setStepBoth(0);
    solvedRef.current = true; setSolved(true);
    setStatus({ msg: "Cube résolu en " + arr.length + " mouvements !", type: "ok" });
    setCaption("Suivez le guide : Lecture, ou Suivant / Précédent.");
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [build]);

  // ----- guide pas à pas -----
  const doNext = useCallback(async () => {
    if (animatingRef.current || stepRef.current >= movesRef.current.length) return;
    animatingRef.current = true;
    await animateMove(movesRef.current[stepRef.current], animSpeedRef.current);
    setStepBoth(stepRef.current + 1);
    animatingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateMove]);

  const doPrev = useCallback(async () => {
    if (animatingRef.current || stepRef.current <= 0) return;
    animatingRef.current = true;
    setStepBoth(stepRef.current - 1);
    await animateMove(invertMove(movesRef.current[stepRef.current]), animSpeedRef.current);
    animatingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateMove]);

  const doReset = useCallback(async () => {
    if (animatingRef.current) return;
    setPlayingBoth(false);
    if (solveSourceRef.current) build(solveSourceRef.current);
    setStepBoth(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [build]);

  const togglePlay = useCallback(async () => {
    if (playingRef.current) { setPlayingBoth(false); return; }
    if (stepRef.current >= movesRef.current.length) await doReset();
    setPlayingBoth(true);
    while (playingRef.current && stepRef.current < movesRef.current.length) {
      await doNext();
      await sleep(250 / animSpeedRef.current);
    }
    setPlayingBoth(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doNext, doReset]);

  handlersRef.current = { play: togglePlay, next: doNext, prev: doPrev, reset: doReset };

  // ----- démo (cube aléatoire résolu automatiquement) -----
  const demo = () => {
    if (!solverReadyRef.current) { setStatus({ msg: "Le solveur n'est pas encore prêt, patientez…", type: "info" }); return; }
    const f = faceletsToFaces(randomFacelets());
    photoFacesRef.current = f; setPhotoFaces(f);
    if (runSolve(f)) {
      setStatus({ msg: "Démo : cube mélangé en " + movesRef.current.length + " mouvements — résolution automatique…", type: "ok" });
      setCaption("Démo automatique : le cube se résout tout seul. Glissez pour tourner.");
      setTimeout(() => { if (!playingRef.current && stepRef.current === 0) handlersRef.current.play(); }, 1000);
    }
  };

  // ----- onglets -----
  const toPhoto = () => {
    setMode("photo"); modeRef.current = "photo"; setSolved(false); solvedRef.current = false;
    build(photoFacesRef.current);
    setCaption("Aperçu 3D — il se remplit à chaque photo ajoutée. Glissez pour tourner.");
    const n = Object.keys(dataUrls).length;
    setStatus({ msg: solverReady ? (n > 0 ? n + " / 6 faces chargées" : "Prêt — chargez vos 6 faces.") : "Préparation du solveur…", type: "info" });
  };
  const toManual = () => {
    setMode("manual"); modeRef.current = "manual"; setSolved(false); solvedRef.current = false;
    const f = solvedFaces(); manualFacesRef.current = f; setManualFaces(f);
    build(f);
    setCaption("Cliquez les stickers pour peindre. Glissez pour tourner le cube.");
    setStatus({ msg: solverReady ? "Choisissez une couleur, peignez les stickers, puis « Résoudre ce cube »." : "Préparation du solveur…", type: "info" });
  };

  // ----- plein écran + raccourcis clavier -----
  const toggleFullscreen = () => {
    const el = document.getElementById("canvasWrap");
    if (!document.fullscreenElement) (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el);
    else (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document);
  };
  useEffect(() => {
    const onFs = () => setTimeout(resize, 120);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [resize]);
  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName || "")) return;
      if (!solvedRef.current) return;
      if (e.code === "Space") { e.preventDefault(); handlersRef.current.play(); }
      else if (e.code === "ArrowRight") { e.preventDefault(); handlersRef.current.next(); }
      else if (e.code === "ArrowLeft") { e.preventDefault(); handlersRef.current.prev(); }
      else if (e.key && e.key.toLowerCase() === "r") { handlersRef.current.reset(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const allUploaded = FACE_ORDER.every((f) => dataUrls[f]);

  return (
    <>
      <Navbar />
      <div className="wrap">
        <header className="hero">
          <div className="logo"><IconCube /></div>
          <h1>Résolveur de Rubik's Cube 3D</h1>
          <p className="sub">Chargez une photo de chaque face (ou saisissez les couleurs à la main), et laissez-vous guider mouvement par mouvement sur un cube 3D animé.</p>
        </header>

        <div className="tabs-wrap">
          <div className="tabs">
            <button className={"tab" + (mode === "photo" ? " active" : "")} onClick={toPhoto}><IconCamera />Photos</button>
            <button className={"tab" + (mode === "manual" ? " active" : "")} onClick={toManual}><IconPencil />Saisie manuelle</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="sec" onClick={demo}><IconShuffle />Mélanger un cube (démo)</button>
          </div>
        </div>

        <div className="app-layout">
          <div className="viewer-side">
            <div id="canvasWrap"><canvas id="cubeCanvas" ref={canvasRef} /></div>
            <p className="viewer-cap">{caption}</p>
            <button className="sec fs-btn" onClick={toggleFullscreen}><IconFullscreen />Plein écran</button>
          </div>

          <div className="control-side">
            {!solved && mode === "photo" && (
              <PhotoMode
                faces={photoFaces} dataUrls={dataUrls} onFile={onFile}
                onOpenCam={() => setCamOpen(true)}
                activeColor={activeColor} onPickColor={setActiveColor} onNetPaint={onNetPaint}
                solveDisabled={!(allUploaded && solverReady)} onSolve={() => runSolve(photoFacesRef.current)}
              />
            )}
            {!solved && mode === "manual" && (
              <ManualMode activeColor={activeColor} onPickColor={setActiveColor} onSolve={() => runSolve(manualFacesRef.current)} />
            )}

            <StatusBar status={status} />

            {solved && (
              <GuidePanel
                moves={moves} step={step} playing={playing} animSpeed={animSpeed}
                onPlay={togglePlay} onPrev={doPrev} onNext={doNext} onReset={doReset} onSpeed={setAnimSpeed}
              />
            )}
          </div>
        </div>

        <footer>
          <IconCube />
          <span>Rubik's Cube Solver — détection des couleurs, solveur Kociemba &amp; cube 3D, 100 % dans le navigateur</span> ·
          <a href={REPO} target="_blank" rel="noopener noreferrer">Code source</a>
        </footer>
      </div>

      <CameraModal
        open={camOpen} dataUrls={dataUrls}
        onCapture={(face, dataUrl) => processFaceImage(face, dataUrl)}
        onClose={() => setCamOpen(false)}
        onError={(msg) => setStatus({ msg, type: "err" })}
      />
    </>
  );
}
