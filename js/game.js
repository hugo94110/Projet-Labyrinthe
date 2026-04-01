const EXIT_DISTANCE = 1.5;

export class Game {
  constructor(maze, player, camera) {
    this.maze = maze;
    this.player = player;
    this.camera = camera;

    this.gameOver = false;
    this.startTime = null;
    this.elapsedSeconds = 0;

    this.chrono = document.getElementById('chrono');
    this.finalContainer = document.getElementById('finalContainer');
    this.finalChrono = document.getElementById('finalChrono');
    this.buttonRestart = document.getElementById('buttonRestart');

    // relancer partie btn
    this.buttonRestart.addEventListener('click', () => {
      this.restart();
    });
    // flag des controles
    window.controlsEnabled = true;
  }

  start() {
    // reset
    this.gameOver = false;
    window.controlsEnabled = true;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;

    // repostionner le joueur au debut
    const startPos = this.maze.getStartPosition();
    this.player.setPosition(startPos.x, startPos.y, startPos.z);

    this.finalContainer.style.display = 'none';
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // chrono en secondes
    this.elapsedSeconds = (Date.now() - this.startTime) / 1000;
    this.chrono.textContent = this.formatTime(this.elapsedSeconds);

    this.checkExit();
  }

  checkExit() {
    const playerPos = this.player.getPosition();
    const exitPos = this.maze.exitPosition;

    const dx = playerPos.x - exitPos.x;
    const dz = playerPos.z - exitPos.z;
    // distance 2D joueur-sortie
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < EXIT_DISTANCE) {
      this.endGame();
    }
  }

  endGame() {
    // stop logique et inputs
    this.gameOver = true;

    window.controlsEnabled = false;

    if (this.player && this.player.keys) {
      this.player.keys.forward = false;
      this.player.keys.backward = false;
      this.player.keys.left = false;
      this.player.keys.right = false;
    }

    const timeStr = this.formatTime(this.elapsedSeconds);
    this.finalChrono.textContent = 'Temps final : ' + timeStr;
    this.finalContainer.style.display = 'flex';
  }

  restart() {
    // regen le labyrinthe puis restart complet
    this.maze.build(this.maze.cols, this.maze.rows);
    this.start();
  }

  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let minStr = '' + minutes;
    if (minutes < 10) {
      minStr = '0' + minutes;
    }

    let secStr = '' + seconds;
    if (seconds < 10) {
      secStr = '0' + seconds;
    }

    return minStr + ':' + secStr;
  }
}