from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import analyze_player, load_player_data, preprocess_data, compare_player_attributes

import os

app = Flask(__name__)
CORS(app)

@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    position = data.get("position")
    player_name = data.get("player_name")

    if not position or not player_name:
        return jsonify({"error": "Missing position or player_name"}), 400

    try:
        results = analyze_player(position, player_name)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/positions", methods=["POST"])
def list_players_by_position():
    try:
        data = request.get_json()
        position = data.get("position")

        if not position:
            return jsonify({"error": "Missing position in request"}), 400

        df, _ = load_player_data(position)
        players = df['Player'].dropna().unique().tolist()
        return jsonify({"players": players})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/compare", methods=["POST"])
def compare():
    data = request.get_json()
    position = data.get("position")
    target = data.get("target")
    others = data.get("others")

    if not position or not target or not others:
        return jsonify({"error": "Missing fields: position, target, or others"}), 400

    try:
        df, weights_dict = load_player_data(position)
        df_clean, _, _, _ = preprocess_data(df, weights_dict)

        # Fake DataFrame for similar players
        similar_df = df_clean[df_clean['Player'].isin(others)][['Player', 'Position']]
        comparisons = compare_player_attributes(target, similar_df, df_clean, weights_dict)
        return jsonify({"comparisons": comparisons})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=3000)
