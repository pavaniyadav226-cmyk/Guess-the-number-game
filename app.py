
from flask import Flask, render_template, request, jsonify, session
import random

app = Flask(__name__)

# Used to manage the player's game session
app.secret_key = "number-guessing-game-secret-key"


def start_new_game():
    session["secret_number"] = random.randint(1, 100)
    session["attempts"] = 0
    session["game_over"] = False


@app.route("/")
def home():
    if "secret_number" not in session:
        start_new_game()

    return render_template("index.html")


@app.route("/api/guess", methods=["POST"])
def check_guess():
    data = request.get_json(silent=True) or {}

    try:
        guess = int(data.get("guess"))
    except (ValueError, TypeError):
        return jsonify({
            "message": "Please enter a valid whole number."
        }), 400

    if not 1 <= guess <= 100:
        return jsonify({
            "message": "Enter a number between 1 and 100."
        }), 400

    if session.get("game_over", False):
        return jsonify({
            "message": "Game over! Start a new game."
        }), 400

    secret_number = session["secret_number"]

    session["attempts"] += 1
    attempts = session["attempts"]

    if guess < secret_number:
        message = "📉 Too Low! Try a higher number."
        status = "low"

    elif guess > secret_number:
        message = "📈 Too High! Try a lower number."
        status = "high"

    else:
        message = "🎉 Congratulations! You guessed correctly!"
        status = "won"
        session["game_over"] = True

    return jsonify({
        "message": message,
        "status": status,
        "attempts": attempts,
        "secret_number": secret_number if status == "won" else None
    })


@app.route("/api/hint", methods=["GET"])
def get_hint():
    if session.get("game_over", False):
        return jsonify({
            "message": "Start a new game to get another hint."
        }), 400

    if "secret_number" not in session:
        start_new_game()

    number = session["secret_number"]

    if number <= 10:
        hint = "The secret number is between 1 and 10."
    else:
        lower = (number // 10) * 10
        upper = min(lower + 9, 100)
        hint = f"The secret number is between {lower} and {upper}."

    return jsonify({"hint": hint})


@app.route("/api/restart", methods=["POST"])
def restart():
    start_new_game()

    return jsonify({
        "message": "New game started!",
        "attempts": 0
    })


if __name__ == "__main__":
    app.run(debug=True)
