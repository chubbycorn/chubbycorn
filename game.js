const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true // Enable debug mode to see physics bodies
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
let hearts = [];
let obstacles;
let gameOverFlag = false;
let background;
let backgroundSpeed = 2;
let scoreTimer;
let gameOverText;
let finalScoreText;
let gameSpeed = 2;
let candyStickSpeed = 2.5; // Candy sticks move faster than the background
let cupcakeCarrotSpeed = 3; // Cupcakes and carrots move faster than candy sticks
let speedIncrementTimer;
let spawnTimer;

function preload() {
    this.load.image('background', 'assets/background.png'); // Ensure this path is correct
    this.load.image('chubbycorn', 'assets/chubbycorn.png');
    this.load.image('cupcake', 'assets/cupcake.png');
    this.load.image('carrot', 'assets/carrot.png');
    this.load.image('candy_stick', 'assets/candy_stick.png'); // New candy stick image
    this.load.image('heart', 'assets/heart.png'); // Heart image for lives
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

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    gameOverText = this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#000' });
    gameOverText.setOrigin(0.5);
    gameOverText.setVisible(false);

    finalScoreText = this.add.text(400, 400, 'Final Score: 0', { fontSize: '32px', fill: '#000' });
    finalScoreText.setOrigin(0.5);
    finalScoreText.setVisible(false);

    // Create hearts for lives
    for (let i = 0; i < lives; i++) {
        let heart = this.add.image(16 + i * 32, 64, 'heart');
        heart.setScale(0.5);
        heart.setDepth(10);
        hearts.push(heart);
    }

    this.physics.add.overlap(player, cupcakes, collectCupcake, null, this);
    this.physics.add.overlap(player, carrots, hitCarrot, null, this);
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    // Ensure score and lives counters are on the top layer
    scoreText.setDepth(10);
    gameOverText.setDepth(10);
    finalScoreText.setDepth(10);

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
            generateCandyStick();
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
            generateCandyStick();
        }, Phaser.Math.Between(2000, 5000)); // Randomize between 2 to 5 seconds
    });
}

function update() {
    if (player.y >= 600 && !gameOverFlag) {
        hitGround(this);
    }

    background.tilePositionX += backgroundSpeed; // Update background speed

    obstacles.getChildren().forEach(function (obstacle) {
        obstacle.x -= candyStickSpeed; // Move slightly faster than the background
        if (obstacle.x < -obstacle.width) {
            console.log('Obstacle out of bounds, destroying');
            obstacles.remove(obstacle, true, true); // Properly remove from physics world and scene
        }
    });

    cupcakes.getChildren().forEach(function (cupcake) {
        cupcake.x -= cupcakeCarrotSpeed; // Move faster than candy sticks
        if (cupcake.x < -cupcake.width) {
            cupcake.destroy();
        }
        if (cupcake.active) { // Check if cupcake is still active
            cupcake.setVelocityY(0); // Prevent falling
            cupcake.y += Math.sin(cupcake.x / 100) * 5; // Slower hovering effect
            cupcake.setDepth(5); // Ensure cupcakes are above candy sticks
        }
    });

    carrots.getChildren().forEach(function (carrot) {
        carrot.x -= cupcakeCarrotSpeed; // Move faster than candy sticks
        if (carrot.x < -carrot.width) {
            carrot.destroy();
        }
        if (carrot.active) { // Check if carrot is still active
            carrot.setVelocityY(0); // Prevent falling
            carrot.y += Math.sin(carrot.x / 100) * 5; // Slower hovering effect
            carrot.setDepth(5); // Ensure carrots are above candy sticks
        }
    });
}

function collectCupcake(player, cupcake) {
    cupcake.disableBody(true, true);
    displayScoreText(this, '+50', cupcake.x, cupcake.y);
    score += 50;
    scoreText.setText('score: ' + score);
}

function hitCarrot(player, carrot) {
    carrot.disableBody(true, true);
    displayScoreText(this, '-1', carrot.x, carrot.y);
    lives -= 1;
    updateLivesDisplay();
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
    candyStickSpeed = 2.5; // Reset candy stick speed
    cupcakeCarrotSpeed = 3; // Reset cupcake and carrot speed
    backgroundSpeed = 2; // Reset background speed
    lives = 3;
    scoreText.setText('score: 0');
    updateLivesDisplay(); // Reset lives display
    player.clearTint();
    player.setPosition(100, 300);
    scene.physics.resume();
    obstacles.clear(true, true);
    cupcakes.clear(true, true);
    carrots.clear(true, true);
    gameOverText.setVisible(false);
    finalScoreText.setVisible(false);
}

function generateCupcakeOrCarrot() {
    if (Phaser.Math.Between(0, 1) === 0) {
        let cupcake = cupcakes.create(800, Phaser.Math.Between(50, 550), 'cupcake');
        cupcake.setScale(0.5); // Adjusting the scale to fit the game
        cupcake.body.allowGravity = false; // Prevent gravity
        cupcake.setVelocityX(-cupcakeCarrotSpeed); // Move horizontally
    } else {
        let carrot = carrots.create(800, Phaser.Math.Between(50, 550), 'carrot');
        carrot.setScale(0.5); // Adjusting the scale to fit the game
        carrot.body.allowGravity = false; // Prevent gravity
        carrot.setVelocityX(-cupcakeCarrotSpeed); // Move horizontally
    }
}

function generateCandyStick() {
    let height = Phaser.Math.Between(120, 360); // 20% to 60% of 600px height
    let yPosition = Phaser.Math.Between(0, 1); // 0 for top, 1 for bottom
    let candyStick;

    if (yPosition === 0) {
        candyStick = obstacles.create(800, 0, 'candy_stick'); // Top border
        candyStick.setOrigin(0, 0); // Adjust origin for top
        candyStick.setFlipY(false); // Ensure it is not flipped
    } else {
        candyStick = obstacles.create(800, 600, 'candy_stick'); // Bottom border
        candyStick.setOrigin(0, 1); // Adjust origin for bottom
        candyStick.setFlipY(true); // Flip the image for bottom
    }

    candyStick.displayHeight = height;
    candyStick.body.allowGravity = false; // Prevent gravity
    candyStick.setImmovable(true); // Ensure candy stick is immovable
    candyStick.setVelocityX(-candyStickSpeed); // Move horizontally
}

function increaseSpeed() {
    gameSpeed += 0.1; // Gradually increase speed over time
    candyStickSpeed += 0.1; // Gradually increase candy stick speed
    cupcakeCarrotSpeed += 0.1; // Gradually increase cupcake and carrot speed
    backgroundSpeed += 0.1; // Gradually increase background speed
}

function displayScoreText(scene, text, x, y) {
    let scoreText = scene.add.text(x, y, text, { fontSize: '32px', fill: '#fff' });
    scoreText.setDepth(10);
    scene.tweens.add({
        targets: scoreText,
        y: y - 50,
        alpha: 0,
        duration: 1000,
        ease: 'Power1',
        onComplete: () => {
            scoreText.destroy();
        }
    });
}

function updateLivesDisplay() {
    hearts.forEach(heart => heart.destroy());
    hearts = [];
    for (let i = 0; i < lives; i++) {
        let heart = game.add.image(16 + i * 32, 64, 'heart');
        heart.setScale(0.5);
        heart.setDepth(10);
        hearts.push(heart);
    }
}
