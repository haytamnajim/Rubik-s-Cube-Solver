"""
Micro-service de resolution de Rubik's Cube.

Deux endpoints :
  GET  /health  -> verifie que le service tourne
  POST /solve   -> recoit les 6 faces (couleurs) et renvoie la solution

Le solveur utilise l'algorithme two-phase de Kociemba (paquet RubikTwoPhase,
100% Python, aucune compilation requise).
"""

import re
import twophase.solver as sv
from flask import Flask, request, jsonify

app = Flask(__name__)

# Ordre des faces attendu par l'algorithme de Kociemba.
# La chaine finale fait 54 caracteres : U(9) R(9) F(9) D(9) L(9) B(9).
FACE_ORDER = ["U", "R", "F", "D", "L", "B"]

# Position du sticker central dans une face lue de gauche a droite / haut en bas.
CENTER_INDEX = 4


def build_cubestring(faces: dict) -> str:
    """
    Transforme un dictionnaire {face: [9 couleurs]} en chaine de 54 lettres
    URFDLB attendue par le solveur.

    On utilise les stickers centraux pour savoir quelle COULEUR correspond a
    quelle FACE (ex: si le centre de la face U est 'white', alors toutes les
    facettes 'white' deviennent la lettre 'U').
    """
    # 1) Construire la table couleur -> lettre de face a partir des 6 centres.
    color_to_face = {}
    for face in FACE_ORDER:
        center_color = faces[face][CENTER_INDEX]
        if center_color in color_to_face:
            raise ValueError(
                f"Deux faces ont la meme couleur centrale '{center_color}'. "
                "Verifiez les photos / l'orientation du cube."
            )
        color_to_face[center_color] = face

    if len(color_to_face) != 6:
        raise ValueError("Il faut exactement 6 couleurs centrales differentes.")

    # 2) Construire la chaine dans l'ordre URFDLB.
    cubestring = ""
    for face in FACE_ORDER:
        for color in faces[face]:
            if color not in color_to_face:
                raise ValueError(
                    f"Couleur inconnue '{color}' : elle ne correspond a aucun "
                    "centre. Erreur de detection des couleurs probable."
                )
            cubestring += color_to_face[color]

    # 3) Verifier que chaque couleur apparait bien 9 fois.
    for face in FACE_ORDER:
        count = cubestring.count(face)
        if count != 9:
            raise ValueError(
                f"La couleur de la face '{face}' apparait {count} fois au lieu "
                "de 9. Erreur de detection probable."
            )

    return cubestring


def to_standard_notation(raw: str) -> list:
    """
    Convertit la sortie de RubikTwoPhase ('U3 R1 F2 ... (21f)') en notation
    standard ['U'', 'R', 'F2', ...].
      X1 -> X     (quart de tour horaire)
      X2 -> X2    (demi-tour)
      X3 -> X'    (quart de tour anti-horaire)
    """
    moves = []
    for token in raw.split():
        m = re.fullmatch(r"([URFDLB])([123])", token)
        if not m:
            continue  # ignore le suffixe '(21f)'
        face, turns = m.group(1), m.group(2)
        if turns == "1":
            moves.append(face)
        elif turns == "2":
            moves.append(face + "2")
        else:
            moves.append(face + "'")
    return moves


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/solve")
def solve():
    data = request.get_json(force=True, silent=True) or {}
    faces = data.get("faces")

    if not isinstance(faces, dict):
        return jsonify({"error": "Champ 'faces' manquant ou invalide."}), 400

    # Verifier qu'on a bien les 6 faces avec 9 couleurs chacune.
    for face in FACE_ORDER:
        if face not in faces:
            return jsonify({"error": f"Face '{face}' manquante."}), 400
        if not isinstance(faces[face], list) or len(faces[face]) != 9:
            return jsonify({"error": f"La face '{face}' doit contenir 9 couleurs."}), 400

    # Normaliser les couleurs (minuscules, sans espaces).
    faces = {f: [str(c).strip().lower() for c in faces[f]] for f in FACE_ORDER}

    try:
        cubestring = build_cubestring(faces)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    raw = sv.solve(cubestring, 19, 2)  # max 19 mouvements, 2s de calcul max
    if "error" in raw.lower() or raw.strip().startswith("Error"):
        return jsonify({
            "error": "Etat de cube invalide (impossible a resoudre). "
                     "Verifiez les couleurs detectees.",
            "cubestring": cubestring,
            "solver_output": raw,
        }), 422

    moves = to_standard_notation(raw)
    return jsonify({
        "cubestring": cubestring,
        "solution": " ".join(moves),
        "moves": moves,
        "move_count": len(moves),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
