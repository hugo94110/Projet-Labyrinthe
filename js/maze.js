import * as THREE from 'three';

const CELL_SIZE = 3;
const WALL_HEIGHT = 2.5;
const WALL_THICKNESS = 0.3;

export class Maze {
  constructor(scene) {
    this.scene = scene;
    this.cellSize = CELL_SIZE;
    this.wallHeight = WALL_HEIGHT;
    this.wallBoxes = [];
    this.exitPosition = null;
    this.grid = null;
    this.cols = 0;
    this.rows = 0;

    // Charger les textures
    const loader = new THREE.TextureLoader();

    // Texture pour le sol
    this.floorTexture = loader.load('/textures/floor.jpg');
    this.floorTexture.wrapS = THREE.RepeatWrapping;
    this.floorTexture.wrapT = THREE.RepeatWrapping;

    this.floorNormal = loader.load('/textures/floor_normal.jpg');
    this.floorNormal.wrapS = THREE.RepeatWrapping;
    this.floorNormal.wrapT = THREE.RepeatWrapping;

    // Texture pour le mul 
    this.wallTexture = loader.load('/textures/wall.jpg');
    this.wallTexture.wrapS = THREE.RepeatWrapping;
    this.wallTexture.wrapT = THREE.RepeatWrapping;

    this.wallNormal = loader.load('/textures/wall_normal.jpg');
    this.wallNormal.wrapS = THREE.RepeatWrapping;
    this.wallNormal.wrapT = THREE.RepeatWrapping;

    this.build(10, 10);
  }

  build(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    // Sert aux collisions joueur/murs
    this.wallBoxes = [];

    // sa reset l'ancien labyrinthe avant regen
    const existing = this.scene.children.filter(obj => obj.userData.isMazePart);
    for (const obj of existing) {
      this.scene.remove(obj);
    }

    this.grid = this.generateMaze(cols, rows);
    this.addFloor();
    this.addWalls();
    this.addExit();
  }

  generateMaze(cols, rows) {
    // Grille logique: chaque case a 4 murs
    const grid = [];
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        grid[r][c] = {
          visited: false,
          walls: { top: true, right: true, bottom: true, left: true }
        };
      }
    }

    const stack = [];
   
    grid[0][0].visited = true;
    stack.push({ r: 0, c: 0 });

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(grid, current.r, current.c, rows, cols);

      if (neighbors.length === 0) {
        // Cul-de-sac => on remonte
        stack.pop();
      } else {
        // Prend un voisin random + casse le mur entre les 2
        const index = Math.floor(Math.random() * neighbors.length);
        const next = neighbors[index];
        this.removeWall(grid, current.r, current.c, next.r, next.c);
        grid[next.r][next.c].visited = true;
        stack.push({ r: next.r, c: next.c });
      }
    }

    return grid;
  }

  getUnvisitedNeighbors(grid, r, c, rows, cols) {
    const neighbors = [];
    if (r > 0 && !grid[r - 1][c].visited) neighbors.push({ r: r - 1, c: c, dir: 'top' });
    if (r < rows - 1 && !grid[r + 1][c].visited) neighbors.push({ r: r + 1, c: c, dir: 'bottom' });
    if (c > 0 && !grid[r][c - 1].visited) neighbors.push({ r: r, c: c - 1, dir: 'left' });
    if (c < cols - 1 && !grid[r][c + 1].visited) neighbors.push({ r: r, c: c + 1, dir: 'right' });
    return neighbors;
  }

  removeWall(grid, r1, c1, r2, c2) {
    if (r2 === r1 - 1) { grid[r1][c1].walls.top = false; grid[r2][c2].walls.bottom = false; }
    if (r2 === r1 + 1) { grid[r1][c1].walls.bottom = false; grid[r2][c2].walls.top = false; }
    if (c2 === c1 - 1) { grid[r1][c1].walls.left = false; grid[r2][c2].walls.right = false; }
    if (c2 === c1 + 1) { grid[r1][c1].walls.right = false; grid[r2][c2].walls.left = false; }
  }

  addFloor() {
    const width = this.cols * CELL_SIZE;
    const depth = this.rows * CELL_SIZE;
    const geo = new THREE.PlaneGeometry(width + 10, depth + 10);

    // Repete de la texture en fonction de la taille du labyrinthe
    this.floorTexture.repeat.set(this.cols * 2, this.rows * 2);
    this.floorNormal.repeat.set(this.cols * 2, this.rows * 2);

    const mat = new THREE.MeshStandardMaterial({
      map: this.floorTexture,
      normalMap: this.floorNormal
    });

    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(width / 2, 0, depth / 2);
    floor.receiveShadow = true;
    floor.userData.isMazePart = true;
    this.scene.add(floor);
  }

  addWalls() {
    const mat = new THREE.MeshStandardMaterial({
      map: this.wallTexture,
      normalMap: this.wallNormal
    });

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        const x = c * CELL_SIZE + CELL_SIZE / 2;
        const z = r * CELL_SIZE + CELL_SIZE / 2;

        if (cell.walls.top) {
          this.createWall(mat, x, z - CELL_SIZE / 2, CELL_SIZE + WALL_THICKNESS, WALL_THICKNESS);
        }
        if (cell.walls.left) {
          this.createWall(mat, x - CELL_SIZE / 2, z, WALL_THICKNESS, CELL_SIZE + WALL_THICKNESS);
        }
      }
    }

    // Ferme la bordure du bas
    const lastRow = this.rows - 1;
    for (let c = 0; c < this.cols; c++) {
      const x = c * CELL_SIZE + CELL_SIZE / 2;
      const z = lastRow * CELL_SIZE + CELL_SIZE / 2;
      if (this.grid[lastRow][c].walls.bottom) {
        this.createWall(mat, x, z + CELL_SIZE / 2, CELL_SIZE + WALL_THICKNESS, WALL_THICKNESS);
      }
    }

    // Ferme la bordure de droite
    const lastCol = this.cols - 1;
    for (let r = 0; r < this.rows; r++) {
      const x = lastCol * CELL_SIZE + CELL_SIZE / 2;
      const z = r * CELL_SIZE + CELL_SIZE / 2;
      if (this.grid[r][lastCol].walls.right) {
        this.createWall(mat, x + CELL_SIZE / 2, z, WALL_THICKNESS, CELL_SIZE + WALL_THICKNESS);
      }
    }
  }

  createWall(mat, x, z, sizeX, sizeZ) {
    const geo = new THREE.BoxGeometry(sizeX, WALL_HEIGHT, sizeZ);
    const wall = new THREE.Mesh(geo, mat);
    wall.position.set(x, WALL_HEIGHT / 2, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData.isMazePart = true;

    
    const box = new THREE.Box3().setFromObject(wall);
    this.wallBoxes.push(box);
    this.scene.add(wall);
  }

  addExit() {
    // Sortie fixee en bas a droite
    const exitX = (this.cols - 1) * CELL_SIZE + CELL_SIZE / 2;
    const exitZ = (this.rows - 1) * CELL_SIZE + CELL_SIZE / 2;
    this.exitPosition = new THREE.Vector3(exitX, 0, exitZ);

    const geo = new THREE.BoxGeometry(CELL_SIZE * 0.8, 0.1, CELL_SIZE * 0.8);
    const mat = new THREE.MeshLambertMaterial({ color: 0x00ff88 });
    const exit = new THREE.Mesh(geo, mat);
    exit.position.set(exitX, 0.05, exitZ);
    exit.userData.isMazePart = true;
    this.scene.add(exit);
  }

  getStartPosition() {
    // Spawn joueur en haut a gauche
    return new THREE.Vector3(CELL_SIZE / 2, 0, CELL_SIZE / 2);
  }
}