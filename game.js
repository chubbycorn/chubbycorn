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

const game = new Phaser.Game(config);
let player;
let cupcakes;
let carrots;
let score = 0;
let scoreText;
let lives = 3;
let livesText;
let obstacles;

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
    player.setCollideWorldBounds(true);

    cupcakes = this.physics.add.group({
        key: 'cupcake',
        repeat: 5,
        setXY: { x: 400, y: 0, stepX: 150 }
    });

    cupcakes.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    carrots = this.physics.add.group();

    obstacles = this.physics.add.group({
        key: 'obstacle',
        repeat: 3,
        setXY: { x: 600, y: 0, stepX: 200 }
    });

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    livesText = this.add.text(16, 50, 'lives: 3', { fontSize: '32px', fill: '#000' });

    this.physics.add.collider(player, cupcakes, collectCupcake, null, this);
    this.physics.add.collider(player, carrots, hitCarrot, null, this);
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    this.input.on('pointerdown', () => {
        player.setVelocityY(-200);
    });
}

function update() {
    if (player.y > 600) {
        gameOver(this);
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
        gameOver(this);
    }
}

function hitObstacle(player, obstacle) {
    gameOver(this);
}

function gameOver(scene) {
    scene.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    scoreText.setText('Game Over! Final score: ' + score);
}
