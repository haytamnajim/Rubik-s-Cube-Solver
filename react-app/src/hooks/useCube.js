import { useRef, useCallback, useEffect } from "react";
import * as THREE from "three";
import {
  FACE_NORMAL, FACELET_POS, MOVE_DEF, COLOR_HEX, parseMove, blankPreviewFaces,
} from "../lib/geometry.js";

const STICKER = 0.86, CUBIE = 0.94, OFFSET = 0.48;

// Encapsule le cube Three.js (rendu, build, peinture, animation, drag, clic).
// onStickerPaint(face, idx) est appelé quand on clique un sticker (mode manuel).
export function useCube(onStickerPaint) {
  const canvasRef = useRef(null);
  const refs = useRef({
    scene: null, camera: null, renderer: null, cubeGroup: null,
    cubies: [], stickerMeshes: [], raycaster: null, pointer: null,
  });
  const onPaintRef = useRef(onStickerPaint);
  useEffect(() => { onPaintRef.current = onStickerPaint; }, [onStickerPaint]);

  const resize = useCallback(() => {
    const r = refs.current, canvas = canvasRef.current;
    if (!r.renderer || !canvas) return;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    r.renderer.setSize(w, h, false);
    r.camera.aspect = w / h; r.camera.updateProjectionMatrix();
  }, []);

  const build = useCallback((faces) => {
    const r = refs.current;
    if (!r.scene) return;
    if (r.cubeGroup) r.scene.remove(r.cubeGroup);
    r.cubies = []; r.stickerMeshes = [];
    r.cubeGroup = new THREE.Group();
    const geo = new THREE.PlaneGeometry(STICKER, STICKER);
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const cubie = new THREE.Group();
      cubie.position.set(x, y, z);
      cubie.add(new THREE.Mesh(
        new THREE.BoxGeometry(CUBIE, CUBIE, CUBIE),
        new THREE.MeshStandardMaterial({ color: 0x101418, roughness: 0.6 })
      ));
      for (const [letter, n] of Object.entries(FACE_NORMAL)) {
        const onFace = (n[0] && x === n[0]) || (n[1] && y === n[1]) || (n[2] && z === n[2]);
        if (!onFace) continue;
        const idx = FACELET_POS[letter].findIndex((p) => p[0] === x && p[1] === y && p[2] === z);
        if (idx < 0) continue;
        const col = faces[letter][idx];
        if (!col) continue;
        const st = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: COLOR_HEX[col], roughness: 0.4 }));
        st.position.set(n[0] * OFFSET, n[1] * OFFSET, n[2] * OFFSET);
        if (letter === "U") st.rotation.x = -Math.PI / 2;
        else if (letter === "D") st.rotation.x = Math.PI / 2;
        else if (letter === "B") st.rotation.y = Math.PI;
        else if (letter === "R") st.rotation.y = Math.PI / 2;
        else if (letter === "L") st.rotation.y = -Math.PI / 2;
        st.userData = { face: letter, idx };
        cubie.add(st); r.stickerMeshes.push(st);
      }
      r.cubeGroup.add(cubie); r.cubies.push(cubie);
    }
    r.scene.add(r.cubeGroup);
  }, []);

  const paintFace = useCallback((face, colors) => {
    refs.current.stickerMeshes.forEach((st) => {
      if (st.userData.face === face) {
        const c = colors[st.userData.idx];
        st.material.color.setHex(COLOR_HEX[c] !== undefined ? COLOR_HEX[c] : COLOR_HEX.gray);
      }
    });
  }, []);

  const animateMove = useCallback((mv, speed = 1) => new Promise((resolve) => {
    const r = refs.current;
    if (!r.cubeGroup) { resolve(); return; }
    const { face, quarter } = parseMove(mv);
    const def = MOVE_DEF[face];
    r.cubeGroup.updateMatrixWorld(true);
    const pivot = new THREE.Group(); r.cubeGroup.add(pivot);
    const sel = r.cubies.filter((c) => Math.round(c.position[def.axis]) === def.layer);
    sel.forEach((c) => pivot.attach(c));
    const target = def.dir * quarter * (Math.PI / 2);
    const dur = 360 / speed * (Math.abs(quarter) === 2 ? 1.4 : 1);
    const t0 = performance.now();
    (function stepFn() {
      const t = Math.min(1, (performance.now() - t0) / dur);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      pivot.rotation[def.axis] = target * e;
      if (t < 1) requestAnimationFrame(stepFn);
      else {
        pivot.rotation[def.axis] = target;
        pivot.updateMatrixWorld(true);
        sel.forEach((c) => {
          r.cubeGroup.attach(c);
          c.position.x = Math.round(c.position.x);
          c.position.y = Math.round(c.position.y);
          c.position.z = Math.round(c.position.z);
        });
        r.cubeGroup.remove(pivot);
        resolve();
      }
    })();
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const r = refs.current;
    r.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    r.renderer.setPixelRatio(window.devicePixelRatio);
    r.scene = new THREE.Scene();
    r.scene.background = new THREE.Color(0x1a1f27);
    r.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    r.camera.position.set(4.2, 4.2, 5.6); r.camera.lookAt(0, 0, 0);
    r.scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dl = new THREE.DirectionalLight(0xffffff, 0.6); dl.position.set(5, 8, 6); r.scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0xffffff, 0.3); dl2.position.set(-5, -3, -4); r.scene.add(dl2);
    r.raycaster = new THREE.Raycaster(); r.pointer = new THREE.Vector2();
    build(blankPreviewFaces());
    resize();

    let raf;
    const loop = () => { raf = requestAnimationFrame(loop); r.renderer.render(r.scene, r.camera); };
    loop();

    let dragging = false, px = 0, py = 0, moved = 0;
    const paintAt = (cx, cy) => {
      const rect = canvas.getBoundingClientRect();
      r.pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
      r.pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
      r.raycaster.setFromCamera(r.pointer, r.camera);
      const hits = r.raycaster.intersectObjects(r.stickerMeshes, false);
      if (!hits.length) return;
      const st = hits[0].object;
      if (st.userData.idx === 4) return;
      if (onPaintRef.current) onPaintRef.current(st.userData.face, st.userData.idx);
    };
    const onDown = (e) => { dragging = true; px = e.clientX; py = e.clientY; moved = 0; canvas.style.cursor = "grabbing"; };
    const onUp = (e) => { if (dragging && moved < 6 && onPaintRef.current) paintAt(e.clientX, e.clientY); dragging = false; canvas.style.cursor = "grab"; };
    const onMove = (e) => {
      if (!dragging || !r.cubeGroup) return;
      moved += Math.abs(e.clientX - px) + Math.abs(e.clientY - py);
      r.cubeGroup.rotation.y += (e.clientX - px) * 0.01;
      r.cubeGroup.rotation.x += (e.clientY - py) * 0.01;
      px = e.clientX; py = e.clientY;
    };
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      r.renderer.dispose();
    };
  }, [build, resize]);

  return { canvasRef, build, paintFace, animateMove, resize };
}
