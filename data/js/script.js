document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("pongCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 400;

    const paddleWidth = 10;
    const paddleHeight = 100;
    let paddleSpeed = 5;

    let leftY = canvas.height / 2 - paddleHeight / 2;
    let rightY = canvas.height / 2 - paddleHeight / 2;

    const ballSize = 10;
    let ballX = canvas.width / 2 - ballSize / 2;
    let ballY = canvas.height / 2 - ballSize / 2;
    let ballSpeedX = 3;
    let ballSpeedY = 3;

    let leftScore = 0;
    let rightScore = 0;
    let baseSpeed = 3;

    const keys = {};

    // Configuração do menu
    const maxScoreSelect = document.getElementById("maxScore");
    const resetBtn = document.getElementById("resetBtn");
    const winnerPopup = document.getElementById("winnerPopup");
    const winnerText = document.getElementById("winnerText");
    const closePopup = document.getElementById("closePopup");
    let maxScore = parseInt(maxScoreSelect.value);

    maxScoreSelect.addEventListener("change", () => {
        maxScore = parseInt(maxScoreSelect.value);
        resetGame();
    });

    resetBtn.addEventListener("click", resetGame);
    closePopup.addEventListener("click", () => {
        winnerPopup.classList.add("hidden");
        resetGame();  // reseta o jogo só depois que o usuário fecha o popup
    });
    document.addEventListener("keydown", (e) => keys[e.key] = true);
    document.addEventListener("keyup", (e) => keys[e.key] = false);

    function draw() {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // paddles com cores dinâmicas
        ctx.fillStyle = `hsl(${(leftScore*50)%360}, 100%, 50%)`;
        ctx.fillRect(0, leftY, paddleWidth, paddleHeight);

        ctx.fillStyle = `hsl(${(rightScore*50)%360}, 100%, 50%)`;
        ctx.fillRect(canvas.width - paddleWidth, rightY, paddleWidth, paddleHeight);

        // bola com cor dinâmica
        ctx.fillStyle = `hsl(${(leftScore + rightScore)*30 % 360}, 100%, 50%)`;
        ctx.fillRect(ballX, ballY, ballSize, ballSize);

        // pontuação
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.fillText(leftScore, canvas.width / 4, 30);
        ctx.fillText(rightScore, 3 * canvas.width / 4, 30);
    }

    function update() {
        // move paddles
        if (keys["w"]) leftY -= paddleSpeed;
        if (keys["s"]) leftY += paddleSpeed;
        if (keys["ArrowUp"]) rightY -= paddleSpeed;
        if (keys["ArrowDown"]) rightY += paddleSpeed;

        // limita paddles
        leftY = Math.max(0, Math.min(canvas.height - paddleHeight, leftY));
        rightY = Math.max(0, Math.min(canvas.height - paddleHeight, rightY));

        // move bola
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // topo/fundo
        if (ballY <= 0 || ballY + ballSize >= canvas.height) ballSpeedY *= -1;

        // paddle esquerdo
        if (ballX <= paddleWidth && ballY + ballSize >= leftY && ballY <= leftY + paddleHeight) {
            ballSpeedX *= -1;
            ballX = paddleWidth;
            triggerBuzzer();
        }

        // paddle direito
        if (ballX + ballSize >= canvas.width - paddleWidth && ballY + ballSize >= rightY && ballY <= rightY + paddleHeight) {
            ballSpeedX *= -1;
            ballX = canvas.width - paddleWidth - ballSize;
            triggerBuzzer();
        }

        // pontuação
        if (ballX < 0) {
            rightScore++;
            increaseSpeed();
            checkWinner();
            resetBall();
        }
        if (ballX + ballSize > canvas.width) {
            leftScore++;
            increaseSpeed();
            checkWinner();
            resetBall();
        }
    }

    function resetBall() {
        ballX = canvas.width / 2 - ballSize / 2;
        ballY = canvas.height / 2 - ballSize / 2;
        ballSpeedX = baseSpeed * (Math.random() > 0.5 ? 1 : -1);
        ballSpeedY = baseSpeed * (Math.random() > 0.5 ? 1 : -1);
    }

    function increaseSpeed() {
        baseSpeed += 0.5;
    }

    function resetGame() {
        leftScore = 0;
        rightScore = 0;
        baseSpeed = 3;
        resetBall();
        winnerPopup.classList.add("hidden");
    }

    function checkWinner() {
        if (leftScore >= maxScore) {
            winnerText.innerText = "Player 1 Wins!";
            winnerPopup.classList.remove("hidden");
            // NÃO resetar imediatamente
            // resetGame será chamado quando o usuário fechar o popup
        } else if (rightScore >= maxScore) {
            winnerText.innerText = "Player 2 Wins!";
            winnerPopup.classList.remove("hidden");
            // NÃO resetar imediatamente
        }
    }


    function triggerBuzzer() {
        // enviar requisição para ESP8266 tocar buzzer
        fetch("/buzzer").catch(() => {});
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    loop();
});
