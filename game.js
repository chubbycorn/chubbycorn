const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false // Disable debug mode for production
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
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
let hearts = [];
let obstacles;
let clouds;
let gameOverFlag = false;
let background;
let backgroundSpeed = 2;
let scoreTimer;
let gameOverText;
let finalScoreText;
let gameSpeed = 2;
let candyStickSpeed = 2.5;
let cupcakeCarrotSpeed = 3;
let speedIncrementTimer;
let spawnTimer;
let cloudTimer;

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('chubbycorn', 'assets/chubbycorn.png');
    this.load.image('cupcake', 'assets/cupcake.png');
    this.load.image('carrot', 'assets/carrot.png');
    this.load.image('candy_stick', 'assets/candy_stick.png');
    this.load.image('heart', 'assets/heart.png');
    this.load.image('cloud01', 'assets/cloud01.png');
}

function create() {
    background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background').setOrigin(0, 0);

    player = this.physics.add.sprite(100, 300, 'chubbycorn');
    player.setScale(window.innerWidth / 1600);
    player.setCollideWorldBounds(true);
    player.body.onWorldBounds = true;

    cupcakes = this.physics.add.group();
    carrots = this.physics.add.group();
    obstacles = this.physics.add.group();
    clouds = this.physics.add.group();

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' }).setScrollFactor(0);

    gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Game Over', { fontSize: '64px', fill: '#000' });
    gameOverText.setOrigin(0.5);
    gameOverText.setVisible(false);

    finalScoreText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, 'Final Score: 0', { fontSize: '32px', fill: '#000' });
    finalScoreText.setOrigin(0.5);
    finalScoreText.setVisible(false);

    updateLivesDisplay(this);

    this.physics.add.overlap(player, cupcakes, collectCupcake, null, this);
    this.physics.add.overlap(player, carrots, hitCarrot, null, this);
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    scoreText.setDepth(10);
    gameOverText.setDepth(10);
    finalScoreText.setDepth(10);

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
    restartButton.style.top = '60%';
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
        }, 1000);
        spawnTimer = setInterval(() => {
            generateCupcakeOrCarrot();
            generateCandyStick();
        }, Phaser.Math.Between(2000, 5000));
        cloudTimer = setInterval(() => {
            generateCloud();
        }, 10000);
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
        }, 1000);
        spawnTimer = setInterval(() => {
            generateCupcakeOrCarrot();
            generateCandyStick();
        }, Phaser.Math.Between(2000, 5000));
        cloudTimer = setInterval(() => {
            generateCloud();
        }, 10000);
    });
}

function update() {
    if (player.y >= this.scale.height && !gameOverFlag) {
        hitGround(this);
    }

    background.tilePositionX += backgroundSpeed;

    obstacles.getChildren().forEach(function (obstacle) {
        obstacle.x -= candyStickSpeed;
        if (obstacle.x < -obstacle.width) {
            obstacles.remove(obstacle, true, true);
        }
    });

    cupcakes.getChildren().forEach(function (cupcake) {
        cupcake.x -= cupcakeCarrotSpeed;
        if (cupcake.x < -cupcake.width) {
            cupcake.destroy();
        }
        if (cupcake.active) {
            cupcake.setVelocityY(0);
            cupcake.y += Math.sin(cupcake.x / 400) * 5;
            cupcake.setDepth(5);
        }
    });

    carrots.getChildren().forEach(function (carrot) {
        carrot.x -= cupcakeCarrotSpeed;
        if (carrot.x < -carrot.width) {
            carrot.destroy();
        }
        if (carrot.active) {
            carrot.setVelocityY(0);
            carrot.y += Math.sin(carrot.x / 400) * 5;
            carrot.setDepth(5);
        }
    });

    clouds.getChildren().forEach(function (cloud) {
        cloud.x -= cloud.speed;
        if (cloud.x < -cloud.width) {
            cloud.destroy();
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
    displayScoreText(this, '-1 ', carrot.x, carrot.y);
    displayHeartImage(this, carrot.x + 35, carrot.y);
    lives -= 1;
    updateLivesDisplay(this);
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
    clearInterval(cloudTimer);
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
    gameSpeed = 2;
    candyStickSpeed = 2.5;
    cupcakeCarrotSpeed = 3;
    backgroundSpeed = 2;
    lives = 3;
    scoreText.setText('score: 0');
    updateLivesDisplay(scene);
    player.clearTint();
    player.setPosition(100, 300);
    scene.physics.resume();
    obstacles.clear(true, true);
    cupcakes.clear(true, true);
    carrots.clear(true, true);
    clouds.clear(true, true);
    gameOverText.setVisible(false);
    finalScoreText.setVisible(false);
}

function generateCupcakeOrCarrot() {
    if (Phaser.Math.Between(0, 1) === 0) {
        let cupcake = cupcakes.create(800, Phaser.Math.Between(50, 550), 'cupcake');
        cupcake.setScale(0.5);
        cupcake.body.allowGravity = false;
        cupcake.setVelocityX(-cupcakeCarrotSpeed);
    } else {
        let carrot = carrots.create(800, Phaser.Math.Between(50, 550), 'carrot');
        carrot.setScale(0.5);
        carrot.body.allowGravity = false;
        carrot.setVelocityX(-cupcakeCarrotSpeed);
    }
}

function generateCandyStick() {
    let height = Phaser.Math.Between(120, 360);
    let yPosition = Phaser.Math.Between(0, 1);
    let candyStick;

    if (yPosition === 0) {
        candyStick = obstacles.create(800, 0, 'candy_stick');
        candyStick.setOrigin(0, 0);
        candyStick.setFlipY(false);
    } else {
        candyStick = obstacles.create(800, 600, 'candy_stick');
        candyStick.setOrigin(0, 1);
        candyStick.setFlipY(true);
    }

    candyStick.displayHeight = height;
    candyStick.body.allowGravity = false;
    candyStick.setImmovable(true);
    candyStick.setVelocityX(-candyStickSpeed);
}

function generateCloud() {
    let yPosition = Phaser.Math.Between(10, 50);
    let cloud = clouds.create(800, yPosition, 'cloud01');
    cloud.body.allowGravity = false;
    cloud.speed = Phaser.Math.Between(backgroundSpeed - 1, backgroundSpeed + 1);
    cloud.setVelocityX(-cloud.speed);
    cloud.setDepth(9);
}

function increaseSpeed() {
    gameSpeed += 0.1;
    candyStickSpeed += 0.1;
    cupcakeCarrotSpeed += 0.1;
    backgroundSpeed += 0.1;
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

function displayHeartImage(scene, x, y) {
    let heart = scene.add.image(x + 30, y, 'heart');
    heart.setScale(0.5);
    heart.setDepth(10);
    scene.tweens.add({
        targets: heart,
        y: y - 50,
        alpha: 0,
        duration: 1000,
        ease: 'Power1',
        onComplete: () => {
            heart.destroy();
        }
    });
}

function updateLivesDisplay(scene) {
    hearts.forEach(heart => heart.destroy());
    hearts = [];
    let startX = scoreText.getBounds().x + scoreText.width + 20;
    for (let i = 0; i < lives; i++) {
        let heart = scene.add.image(startX + i * 32, 24, 'heart');
        heart.setScale(0.5);
        heart.setDepth(10);
        hearts.push(heart);
    }
}

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
