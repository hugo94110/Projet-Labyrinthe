import { Scene } from './scene.js';
import { Maze } from './maze.js';
import { Player } from './player.js';
import { Collision } from './collision.js';
import { Camera } from './camera.js';
import { Game } from './game.js';

// Init modules
const scene = new Scene();
const maze = new Maze(scene.scene); // build maze
const player = new Player(scene.scene);
const collision = new Collision(maze);
const camera = new Camera(scene.renderer, player, maze);
const game = new Game(maze, player, camera);

game.start();

// Boucle principale (game loop)
function animate() {
  requestAnimationFrame(animate);
  player.update(collision); // input + collision
  camera.update(player); // sync cam
  game.update();
  scene.render(camera.getActiveCamera()); // draw frame
}

animate();