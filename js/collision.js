import * as THREE from 'three';

export class Collision {
  constructor(maze) {
    this.maze = maze;
  }

  isColliding(x, z, radius) {
    // player
    const playerBox = new THREE.Box3(
      new THREE.Vector3(x - radius, 0, z - radius),
      new THREE.Vector3(x + radius, 2, z + radius)
    );

    // hitbox des murs
    const walls = this.maze.wallBoxes;

    for (let i = 0; i < walls.length; i++) {
      if (playerBox.intersectsBox(walls[i])) {
        return true;
      }
    }

    // pas de collision
    return false;
  }
}