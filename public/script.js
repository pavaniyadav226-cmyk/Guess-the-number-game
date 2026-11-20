
// Get HTML elements
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const restartBtn = document.getElementById("restartBtn");
const hintBtn = document.getElementById("hintBtn");

const message = document.getElementById("message");
const attemptsDisplay = document.getElementById("attempts");
const bestScoreDisplay = document.getElementById("bestScore");
const numberDisplay = document.getElementById("numberDisplay");
const hintMessage = document.getElementById("hintMessage");

// Load best score from browser storage
let bestScore = localStorage.getItem("bestScore");

bestScoreDisplay.textContent = bestScore || "--";


// Check the guess using Python backend
async function checkGuess() {

    const guess = guessInput.value.trim();

    if (guess === "") {
        message.textContent = "⚠️ Please enter a number!";
        return;
    }

    guessBtn.disabled = true;

    try {

        const response = await fetch("/api/guess", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                guess: guess
            })

        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            return;
        }

        message.textContent = data.message;

        attemptsDisplay.textContent = data.attempts;

        if (data.status === "low") {
            message.style.color = "#ffcc70";
        }

        else if (data.status === "high") {
            message.style.color = "#ffcc70";
        }

        else if (data.status === "won") {

            message.style.color = "#65f5a5";

            numberDisplay.textContent = data.secret_number;

            // Update best score
            if (
                bestScore === null ||
                data.attempts < Number(bestScore)
            ) {

                bestScore = data.attempts;

                localStorage.setItem("bestScore", bestScore);

                bestScoreDisplay.textContent = bestScore;
            }

            hintBtn.disabled = true;
            guessInput.disabled = true;
        }

        guessInput.value = "";
        guessInput.focus();

    }

    catch (error) {

        message.textContent = "Something went wrong. Please try again.";

        console.error(error);

    }

    finally {

        guessBtn.disabled = false;

        // Keep button disabled after winning
        if (numberDisplay.textContent !== "?") {
            guessBtn.disabled = true;
        }
    }
}


// Get hint from Python
async function showHint() {

    hintBtn.disabled = true;

    try {

        const response = await fetch("/api/hint");

        const data = await response.json();

        if (!response.ok) {
            hintMessage.textContent = data.message;
            return;
        }

        hintMessage.textContent = "💡 " + data.hint;

    }

    catch (error) {

        hintMessage.textContent = "Unable to get a hint.";

    }

    finally {
        hintBtn.disabled = false;
    }
}


// Start a new game
async function restartGame() {

    restartBtn.disabled = true;

    try {

        const response = await fetch("/api/restart", {
            method: "POST"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        attemptsDisplay.textContent = "0";

        numberDisplay.textContent = "?";

        message.textContent = "Make your first guess!";

        message.style.color = "#d8ccff";

        hintMessage.textContent = "";

        guessInput.value = "";
        guessInput.disabled = false;

        guessBtn.disabled = false;
        hintBtn.disabled = false;

        guessInput.focus();

    }

    catch (error) {

        message.textContent = "Unable to restart. Please try again.";

        console.error(error);

    }

    finally {

        restartBtn.disabled = false;

    }
}


// Button click events
guessBtn.addEventListener("click", checkGuess);

restartBtn.addEventListener("click", restartGame);

hintBtn.addEventListener("click", showHint);


// Press Enter to submit guess
guessInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        checkGuess();
    }

});
