const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);
let player;
let cupcakes;
let carrots;
let score = 0;
let scoreText;
let lives = 3;
let livesText;
let obstacles;
let gameOverFlag = false;
let background;
let backgroundSpeed = 2;
let scoreTimer;
let gameOverText;
let finalScoreText;
let gameSpeed = 2;
let speedIncrementTimer;
let spawnTimer;

function preload() {
    this.load.image('background', 'assets/background.png'); // Ensure this path is correct
    this.load.image('chubbycorn', 'assets/chubbycorn.png');
    this.load.image('cupcake', 'assets/cupcake.png');
    this.load.image('carrot', 'assets/carrot.png');
    this.load.image('obstacle', 'assets/obstacle.png');
}

function create() {
    background = this.add.tileSprite(0, 0, 800, 600, 'background').setOrigin(0, 0);

    player = this.physics.add.sprite(100, 300, 'chubbycorn');
    player.setScale(0.5); // Increase the scale to make the unicorn larger
    player.setCollideWorldBounds(true);
    player.body.onWorldBounds = true; // Enable world bounds collision

    cupcakes = this.physics.add.group();
    carrots = this.physics.add.group();
    obstacles = this.physics.add.group();

    generateObstacles();

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    livesText = this.add.text(16, 50, 'lives: 3', { fontSize: '32px', fill: '#000' });

    gameOverText = this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#000' });
    gameOverText.setOrigin(0.5);
    gameOverText.setVisible(false);

    finalScoreText = this.add.text(400, 400, 'Final Score: 0', { fontSize: '32px', fill: '#000' });
    finalScoreText.setOrigin(0.5);
    finalScoreText.setVisible(false);

    this.physics.add.collider(player, cupcakes, collectCupcake, null, this);
    this.physics.add.collider(player, carrots, hitCarrot, null, this);
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    // Check for player touching the floor
    this.physics.world.on('worldbounds', (body, up, down) => {
        if (down) {
            hitGround(this);
        }
    });

    this.input.on('pointerdown', () => {
        if (!gameOverFlag) {
            player.setVelocityY(-200);
        }
    });

    this.scene.pause();

    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');

    startButton.style.position = 'absolute';
    startButton.style.left = '50%';
    startButton.style.top = '50%';
    startButton.style.transform = 'translate(-50%, -50%)';

    restartButton.style.position = 'absolute';
    restartButton.style.left = '50%';
    restartButton.style.top = '50%';
    restartButton.style.transform = 'translate(-50%, -50%)';
    restartButton.style.display = 'none';

    startButton.addEventListener('click', () => {
        this.scene.resume();
        startButton.style.display = 'none';
        scoreTimer = setInterval(() => {
            if (!gameOverFlag) {
                score += 1;
                scoreText.setText('score: ' + score);
            }
        }, 100);
        speedIncrementTimer = setInterval(() => {
            increaseSpeed();
        }, 1000); // Increase speed every second
        spawnTimer = setInterval(() => {
            generateCupcakeOrCarrot();
        }, Phaser.Math.Between(2000, 5000)); // Randomize between 2 to 5 seconds
    });

    restartButton.addEventListener('click', () => {
        resetGame(this);
        this.scene.resume();
        restartButton.style.display = 'none';
        scoreTimer = setInterval(() => {
            if (!gameOverFlag) {
                score += 1;
                scoreText.setText('score: ' + score);
            }
        }, 100);
        speedIncrementTimer = setInterval(() => {
            increaseSpeed();
        }, 1000); // Increase speed every second
        spawnTimer = setInterval(() => {
            generateCupcakeOrCarrot();
        }, Phaser.Math.Between(2000, 5000)); // Randomize between 2 to 5 seconds
    });
}

function update() {
    if (player.y >= 600 && !gameOverFlag) {
        hitGround(this);
    }

    background.tilePositionX += backgroundSpeed; // Update background speed

    Phaser.Actions.IncX(obstacles.getChildren(), -gameSpeed);
    obstacles.children.iterate(function (obstacle) {
        if (obstacle.x < -obstacle.width) {
            obstacle.x = 800 + Math.random() * 400;
        }
    });

    Phaser.Actions.IncX(cupcakes.getChildren(), -gameSpeed);
    cupcakes.children.iterate(function (cupcake) {
        if (cupcake.x < -cupcake.width) {
            cupcake.x = 800 + Math.random() * 400;
        }
        cupcake.setVelocityY(0); // Prevent falling
        cupcake.y += Math.sin(cupcake.x / 50) * 10; // Hovering effect
    });

    Phaser.Actions.IncX(carrots.getChildren(), -gameSpeed);
    carrots.children.iterate(function (carrot) {
        if (carrot.x < -carrot.width) {
            carrot.x = 800 + Math.random() * 400;
        }
        carrot.setVelocityY(0); // Prevent falling
        carrot.y += Math.sin(carrot.x / 50) * 10; // Hovering effect
    });
}

function collectCupcake(player, cupcake) {
    cupcake.disableBody(true, true);
    score += 50;
    scoreText.setText('score: ' + score);
}

function hitCarrot(player, carrot) {
    carrot.disableBody(true, true);
    lives -= 1;
    livesText.setText('lives: ' + lives);
    if (lives <= 0) {
        endGame(this);
    }
}

function hitObstacle(player, obstacle) {
    endGame(this);
}

function hitGround(scene) {
    endGame(scene);
}

function endGame(scene) {
    gameOverFlag = true;
    clearInterval(scoreTimer);
    clearInterval(speedIncrementTimer);
    clearInterval(spawnTimer);
    scene.physics.pause();
    player.setTint(0xff0000);
    gameOverText.setVisible(true);
    finalScoreText.setText('Final Score: ' + score);
    finalScoreText.setVisible(true);
    document.getElementById('restartButton').style.display = 'inline';
}

function resetGame(scene) {
    gameOverFlag = false;
    score = 0;
    gameSpeed = 2; // Reset game speed
    backgroundSpeed = 2; // Reset background speed
    lives = 3;
    scoreText.setText('score: 0');
    livesText.setText('lives: 3');
    player.clearTint();
    player.setPosition(100, 300);
    scene.physics.resume();
    obstacles.clear(true, true);
    cupcakes.clear(true, true);
    carrots.clear(true, true);
    generateObstacles();
    gameOverText.setVisible(false);
    finalScoreText.setVisible(false);
}

function generateObstacles() {
    for (let i = 0; i < 3; i++) {
        let obstacle = obstacles.create(600 + i * 200, 500, 'obstacle');
        obstacle.setScale(0.1); // Adjusting the scale to fit the game
        obstacle.setImmovable(true);
    }
}

function generateCupcakeOrCarrot() {
    if (Phaser.Math.Between(0, 1) === 0) {
        let cupcake = cupcakes.create(800, Phaser.Math.Between(50, 550), 'cupcake');
        cupcake.setScale(0.5); // Adjusting the scale to fit the game
        cupcake.body.allowGravity = false; // Prevent gravity
        cupcake.setVelocityX(-gameSpeed); // Move horizontally
    } else {
        let carrot = carrots.create(800, Phaser.Math.Between(50, 550), 'carrot');
        carrot.setScale(0.5); // Adjusting the scale to fit the game
        carrot.body.allowGravity = false; // Prevent gravity
        carrot.setVelocityX(-gameSpeed); // Move horizontally
    }
}

function increaseSpeed() {
    gameSpeed += 0.1; // Gradually increase speed over time
    backgroundSpeed += 0.1; // Gradually increase background speed
}
