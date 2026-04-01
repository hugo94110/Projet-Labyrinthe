import * as THREE from 'three';

const FIRST_PERSON = 'first';
const TOP_DOWN = 'top';

export class Camera {
  constructor(renderer, player, maze) {
    this.renderer = renderer;
    this.player = player;
    this.maze = maze;

    this.mode = FIRST_PERSON;

    this.firstPersonCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Camera dessus
    this.topCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    this.updateTopCamera();



    window.addEventListener('keydown', (e) => {
      // controle (C)
      if (e.key === 'c' || e.key === 'C') {
        this.toggleCamera();
      }
    });

    window.addEventListener('resize', () => {
      this.firstPersonCamera.aspect = window.innerWidth / window.innerHeight;
      this.firstPersonCamera.updateProjectionMatrix();
      this.updateTopCamera();
    });
  }

  updateTopCamera() {
    const cols = this.maze ? this.maze.cols : 10;
    const rows = this.maze ? this.maze.rows : 10;
    const cellSize = this.maze ? this.maze.cellSize : 3;
    
    const width = cols * cellSize;
    const height = rows * cellSize;
    const aspect = window.innerWidth / window.innerHeight;

    let viewW, viewH;
    if (aspect > 1) {
      viewW = (height * aspect) / 2;
      viewH = height / 2;
    } else {
      viewW = width / 2;
      viewH = (width / aspect) / 2;
    }

    this.topCamera.left = -viewW;
    this.topCamera.right = viewW;
    this.topCamera.top = viewH;
    this.topCamera.bottom = -viewH;
    
    this.topCamera.position.set(width / 2, 50, height / 2);
    this.topCamera.lookAt(width / 2, 0, height / 2);
    this.topCamera.updateProjectionMatrix();
  }

  toggleCamera() {
    // switch de vue
    if (this.mode === FIRST_PERSON) {
      this.mode = TOP_DOWN;
    } else {
      this.mode = FIRST_PERSON;
    }
  }

  update(player) {
    const pos = player.getPosition();
    if (this.mode === FIRST_PERSON) {
      const angle = player.mesh.rotation.y;
      const eyeHeight = 1.3; 
      this.firstPersonCamera.position.set(pos.x, pos.y + eyeHeight, pos.z);
      const lookX = pos.x - Math.sin(angle) * 5;
      const lookZ = pos.z - Math.cos(angle) * 5;
      this.firstPersonCamera.lookAt(lookX, pos.y + eyeHeight, lookZ);
    } else {
      this.updateTopCamera();
    }
  }

  getActiveCamera() {
    return this.mode === FIRST_PERSON ? this.firstPersonCamera : this.topCamera;
  }
}