import * as THREE from 'three';

export class Collision {
  constructor(maze) {
    this.maze = maze;
  }

  isColliding(x, z, radius) {
    // AABB joueur (hitbox simple)
    const playerBox = new THREE.Box3(
      new THREE.Vector3(x - radius, 0, z - radius),
      new THREE.Vector3(x + radius, 2, z + radius)
    );

    // Toutes les hitbox murs du maze
    const walls = this.maze.wallBoxes;

    // Stop des qu'un mur touche la hitbox joueur
    for (let i = 0; i < walls.length; i++) {
      if (playerBox.intersectsBox(walls[i])) {
        return true;
      }
    }

    // Rien touche -> pas de collision
    return false;
  }
}