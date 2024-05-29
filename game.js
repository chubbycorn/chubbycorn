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

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('chubbycorn', 'assets/chubbycorn.png');
    this.load.image('cupcake', 'assets/cupcake.png');
    this.load.image('carrot', 'assets/carrot.png');
    this.load.image('obstacle', 'assets/obstacle.png');
}

function create() {
    this.add.image(400, 300, 'background');
    player = this.physics.add.sprite(100, 450, 'chubbycorn');
    player.setScale(0.1); // Adjusting the scale to fit the game
    player.setCollideWorldBounds(true);

    cupcakes = this.physics.add.group({
        key: 'cupcake',
        repeat: 5,
        setXY: { x: 400, y: 0, stepX: 150 }
    });

    cupcakes.children.iterate(function (child) {
        child.setScale(0.1); // Adjusting the scale to fit the game
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    carrots = this.physics.add.group();

    obstacles = this.physics.add.group({
        key: 'obstacle',
        repeat: 3,
        setXY: { x: 600, y: 0, stepX: 200 }
    });

    obstacles.children.iterate(function (child) {
        child.setScale(0.1); // Adjusting the scale to fit the game
    });

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    livesText = this.add.text(16, 50, 'lives: 3', { fontSize: '32px', fill: '#000' });

    this.physics.add.collider(player, cupcakes, collectCupcake, null, this);
    this.physics.add.collider(player, carrots, hitCarrot, null, this);
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);
    this.physics.add.collider(player, this.physics.world.bounds, hitGround, null, this);

    this.input.on('pointerdown', () => {
        if (!gameOverFlag) {
            player.setVelocityY(-200);
        }
    });

    this.scene.pause();
    document.getElementById('startButton').addEventListener('click', () => {
        this.scene.resume();
        document.getElementById('startButton').style.display = 'none';
    });

    document.getElementById('restartButton').addEventListener('click', () => {
        resetGame(this);
        this.scene.resume();
        document.getElementById('restartButton').style.display = 'none';
    });
}

function update() {
    if (player.y > 600) {
        endGame(this);
    }

    Phaser.Actions.IncX(obstacles.getChildren(), -2);
    obstacles.children.iterate(function (obstacle) {
        if (obstacle.x < -obstacle.width) {
            obstacle.x = 800 + Math.random() * 400;
        }
    });

    Phaser.Actions.IncX(cupcakes.getChildren(), -2);
    cupcakes.children.iterate(function (cupcake) {
        if (cupcake.x < -cupcake.width) {
            cupcake.x = 800 + Math.random() * 400;
        }
    });

    if (Math.random() < 0.01) {
        const x = 800;
        const y = Math.random() * 600;
        const carrot = carrots.create(x, y, 'carrot');
        carrot.setScale(0.1); // Adjusting the scale to fit the game
        carrot.setVelocityX(-200);
    }
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

function hitGround(player, bounds) {
    endGame(this);
}

function endGame(scene) {
    gameOverFlag = true;
    scene.physics.pause();
    player.setTint(0xff0000);
    scoreText.setText('Game Over! Final score: ' + score);
    document.getElementById('restartButton').style.display = 'inline';
}

function resetGame(scene) {
    gameOverFlag = false;
    score = 0;
    lives = 3;
    scoreText.setText('score: 0');
    livesText.setText('lives: 3');
    player.clearTint();
    player.setPosition(100, 450);
    scene.physics.resume();
    obstacles.clear(true, true);
    cupcakes.clear(true, true);
    carrots.clear(true, true);
    create();
}
