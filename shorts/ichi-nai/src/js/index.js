import {
  Scene,
  Color,
  DirectionalLight,
  WebGLRenderer,
  sRGBEncoding,
  OrthographicCamera,
  BoxBufferGeometry,
  Mesh,
  AxesHelper,
  PCFSoftShadowMap,
  AmbientLight,
  FogExp2,
  MeshStandardMaterial,
} from "three";
import { GUI } from "dat.gui";
import { addDesktopControls } from "../components/desktop-controls";
import * as CANNON from "cannon-es";
import cannonDebugger from "cannon-es-debugger";
import { inRange, isNil, throttle } from "lodash";
import anime from "animejs";
import { Game } from "./game";
import { Tile } from "./tile";

class Sketch {
  constructor({ canvasEl }) {
    this.canvasEl = canvasEl;
    this.init();
  }

  init = () => {
    this.scene = new Scene();
    this.scene.background = new Color(0x272640);

    const aspectRatio = window.innerWidth / window.innerHeight;

    this.d = 40;
    this.removedTiles = [];
    this.camera = new OrthographicCamera(
      -this.d * aspectRatio,
      this.d * aspectRatio,
      this.d * 1,
      -this.d * 1,
      0.1,
      10000
    );
    this.camera.position.set(this.d, this.d, this.d);
    this.scene.add(this.camera);

    this.light = new DirectionalLight(0xffffff);
    this.light.position.set(300, 300, 50);
    this.light.castShadow = true;
    // light.shadow.camera.near = 0.01;
    // light.shadow.camera.far = 10000;

    this.scene.add(this.light);

    const ambientLight = new AmbientLight(0xf0f0f0, 0.5);
    this.scene.add(ambientLight);

    const color = 0x101010;
    const density = 0.01;
    // this.scene.fog = new FogExp2(color, density);

    const axesHelper = new AxesHelper(10);
    this.scene.add(axesHelper);

    const renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvasEl,
    });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = sRGBEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);

    const { orbitControls } = addDesktopControls(this.camera, renderer);
    this.renderer = renderer;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.shadowMap.enabled = true;
    this.tiles = [];
    this.initPhysics();
    this.orbitControls = orbitControls;
    this.debugGUI = new GUI();
    this.createGame();
    // cannonDebugger(scene, this.world.bodies);
    renderer.setAnimationLoop(this.update);
    this.tileCount = 0;
  };

  initPhysics = () => {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -10, 0);
    // this.addGround();
  };

  createGame = () => {
    this.game = new Game({
      afterLoadGameData: this.afterLoadGameData,
    });
  };

  afterLoadGameData = ({ data }) => {
    this.character = new Character({ onJump: this.onJump });
    console.log(data);
    const { blocks } = data;
    blocks.forEach((block, index) => {
      const { position, color, isOrigin, isDestination, weight } = block;
      const tile = new Tile({
        color,
        isDestination,
        isOrigin,
      });
      if (isOrigin) {
        this.character.position.copy(position).setY(position.y + 4);
      }
      tile.name = "tile#" + index;
      tile.weight = weight;
      tile.body.name = "tile#" + index;
      tile.isDestination = isDestination;
      tile.position.copy(position);
      tile.body.position.copy(position);
      this.scene.add(tile);
      this.world.addBody(tile.body);
      this.tiles.push(tile);
    });

    this.world.addBody(this.character.body);
    this.character.body.position.copy(this.character.position);
    this.scene.add(this.character);
  };

  addGround = () => {
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.position.set(0, -30, 0);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);
  };

  update = () => {
    this.orbitControls.update();
    this.world.step(1 / 60);
    this.tiles.forEach((tile) => {
      tile.position.copy(tile.body.position);
    });
    if (
      !isNil(this.character.currentTileName) &&
      this.tiles[this.character.currentTileName.split("#")[1]].isDestination &&
      this.removedTiles.length === this.tiles.length - 1
    ) {
      console.log(this.removedTiles);
    }
    this.character.update();
    this.renderer.render(this.scene, this.camera);
  };

  onResize = ({ width, height }) => {
    const aspectRatio = width / height;
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  onJump = (tileName) => {
    const tileIndex = tileName.split("#")[1];
    const jumpedFromTile = this.tiles[tileIndex];
    jumpedFromTile.weight--;
    jumpedFromTile.updateWeight(jumpedFromTile.weight);
    if (jumpedFromTile.weight === 0 && !jumpedFromTile.isDestination) {
      this.removedTiles.push(jumpedFromTile);
      jumpedFromTile.body.mass = 1;
      jumpedFromTile.body.updateMassProperties();
    }
  };
}

let sketch = null;
window.addEventListener("load", () => {
  const canvasEl = document.querySelector("#canvas-container");
  sketch = new Sketch({
    canvasEl,
  });
});
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  sketch.onResize({ width, height });
});

const characterGeom = new BoxBufferGeometry(2, 2, 2);
const characterMat = new MeshStandardMaterial({
  color: 0xb9375e,
});

class Character extends Mesh {
  constructor({ onJump }) {
    super(characterGeom, characterMat);
    this.addBody();
    this.castShadow = true;
    this.throttledJump = throttle(this.jump, 500, { trailing: false });
    this.onJump = onJump;
    window.addEventListener("keyup", (event) => {
      if (event.key === "a") {
        this.throttledJump({
          axis: "z",
          distance: 5,
        });
      }
      if (event.key === "d") {
        this.throttledJump({
          axis: "z",
          distance: -5,
        });
      }
      if (event.key === "w") {
        this.throttledJump({
          axis: "x",
          distance: -5,
        });
      }
      if (event.key === "s") {
        this.throttledJump({
          axis: "x",
          distance: 5,
        });
      }
    });
  }

  addBody = () => {
    this.body = new CANNON.Body({
      mass: 1,
    });
    this.shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    this.body.linearDamping = 0.3;
    this.prevTileName = null;
    this.currentTileName = null;
    this.body.addShape(this.shape);
    this.body.addEventListener("collide", (event) => {
      if (this.currentTileName !== event.body.name) {
        this.prevTileName = this.currentTileName;
        this.currentTileName = event.body.name;
        if (this.isJumping) {
          this.isJumping = false;
        }
      }
    });
  };

  jump = ({ axis, distance }) => {
    const originalPosition = this.position;
    this.isJumping = true;
    this.isTileDropped = false;
    anime({
      targets: this.body.position,
      keyframes: [
        {
          [axis]: originalPosition[axis],
          y: originalPosition.y,
        },
        {
          [axis]: originalPosition[axis] + distance / 2,
          y: originalPosition.y + 2,
        },
        {
          [axis]: originalPosition[axis] + distance,
          y: originalPosition.y + 1,
        },
      ],
      easing: "linear",
      duration: 500,
      complete: () => {
        // this.onJump(this.prevTileName);
      },
      update: ({ progress }) => {
        if (!this.isTileDropped && inRange(progress, 70, 80)) {
          this.isTileDropped = true;
          this.onJump(this.currentTileName);
        }
      },
    });
  };

  update = () => {
    this.position.copy(this.body.position);
    this.quaternion.copy(this.body.quaternion);
  };
}
