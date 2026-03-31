import * as THREE from 'three';

const MOVE_SPEED = 0.09;
const ROTATE_SPEED = 0.045;
const PLAYER_RADIUS = 0.4;

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.speed = MOVE_SPEED;
    this.radius = PLAYER_RADIUS;

    // Etat des touches (ZQSD + fleches)
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };

    this.mesh = this.createMesh();
    this.scene.add(this.mesh);
    this.listenKeys();
  }

  createMesh() {
    const group = new THREE.Group();
    const bodyGeo = new THREE.CapsuleGeometry(0.35, 0.8, 4, 8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);
    const headGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xFFCC80 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.8;
    head.castShadow = true;
    group.add(head);
    return group;
  }

  listenKeys() {
    // Keydown: active le mouvement
    window.addEventListener('keydown', (e) => {
      if (window.controlsEnabled === false) return;
      if (e.key === 'z' || e.key === 'Z' || e.key === 'ArrowUp') {
        this.keys.forward = true;
      }
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        this.keys.backward = true;
      }
      if (e.key === 'q' || e.key === 'Q' || e.key === 'ArrowLeft') {
        this.keys.left = true;
      }
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        this.keys.right = true;
      }
    });

    // Keyup: coupe le mouvement
    window.addEventListener('keyup', (e) => {
      if (window.controlsEnabled === false) return;
      if (e.key === 'z' || e.key === 'Z' || e.key === 'ArrowUp') {
        this.keys.forward = false;
      }
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        this.keys.backward = false;
      }
      if (e.key === 'q' || e.key === 'Q' || e.key === 'ArrowLeft') {
        this.keys.left = false;
      }
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        this.keys.right = false;
      }
    });
  }

  update(collision) {
    // Rotation gauche/droite
    let angle = this.mesh.rotation.y;
    if (this.keys.left) angle += ROTATE_SPEED;
    if (this.keys.right) angle -= ROTATE_SPEED;
    this.mesh.rotation.y = angle;

    // Avance/recule selon l'angle courant
    let move = 0;
    if (this.keys.forward) move -= this.speed;
    if (this.keys.backward) move += this.speed;

    if (move !== 0) {
      const dx = Math.sin(angle) * move;
      const dz = Math.cos(angle) * move;
      const newX = this.mesh.position.x + dx;
      const newZ = this.mesh.position.z + dz;

      // Test separe X/Z: effet "glisse" le long des murs
      if (!collision.isColliding(newX, this.mesh.position.z, this.radius)) {
        this.mesh.position.x = newX;
      }
      if (!collision.isColliding(this.mesh.position.x, newZ, this.radius)) {
        this.mesh.position.z = newZ;
      }
    }
  }

  getPosition() {
    return this.mesh.position;
  }

  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }

  isActive(gameOver) {
    return !gameOver;
  }
}