import {
  Scene,
  Color,
  DirectionalLight,
  WebGLRenderer,
  sRGBEncoding,
  OrthographicCamera,
  AxesHelper,
  PCFSoftShadowMap,
  AmbientLight,
  FogExp2,
} from "three";
import { GUI } from "dat.gui";
import { addDesktopControls } from "../components/desktop-controls";
import * as CANNON from "cannon-es";
import cannonDebugger from "cannon-es-debugger";
import { Game } from "./game";
import { GameScene } from "./gamescene";
import { FORCES, POSITIONS, WORLD_UPDATE_FREQUENCY, ZERO_MASS } from "./config";

import "../styles.css";
import { isNil } from "lodash";

class Sketch {
  constructor({ canvasEl }) {
    this.canvasEl = canvasEl;
    this.init();
  }

  init = () => {
    this.scene = new Scene();
    this.addCamera();
    this.addLights();
    this.createRenderer();
    this.initPhysics();
    this.createGame();
    this.addDebugHelpers();

    this.renderer.setAnimationLoop(this.update);
  };

  addCamera = () => {
    const aspectRatio = window.innerWidth / window.innerHeight;
    this.d = 30;
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
  };

  addLights = () => {
    this.light = new DirectionalLight(0xffffff);
    this.light.position.set(-300, 300, 50);

    this.scene.add(this.light);

    const ambientLight = new AmbientLight(0xf0f0f0, 0.5);
    this.scene.add(ambientLight);
  };

  createRenderer = () => {
    const renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvasEl,
      alpha: true,
    });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = sRGBEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer = renderer;
    this.renderer.setClearColor(0x000000, 0);

    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.shadowMap.enabled = true;
  };

  addDebugHelpers = () => {
    const color = 0xf0f0f0;
    const density = 0.01;
    // this.scene.fog = new FogExp2(color, density);

    const axesHelper = new AxesHelper(10);
    // this.scene.add(axesHelper);

    const { orbitControls } = addDesktopControls(this.camera, this.renderer);
    this.orbitControls = orbitControls;
    // cannonDebugger(this.scene, this.world.bodies, {
    //   color: 0x101010,
    // });

    this.debugGUI = new GUI();
  };

  initPhysics = () => {
    this.world = new CANNON.World();
    this.world.gravity.set(...FORCES.GRAVITY);
    this.addGround();
  };

  createGame = () => {
    // scene first , data next
    this.gameScene = new GameScene({
      scene: this.scene,
      world: this.world,
      onLevelDone: this.onLevelDone,
      onLevelReset: this.onResetLevel,
    });
    this.game = new Game({
      afterLoadGameData: this.afterLoadGameData,
    });
  };

  afterLoadGameData = ({ data }) => {
    this.gameScene.loadGameScene({
      gameData: data,
    });
  };

  onLevelDone = () => {
    this.game.incrementLevel();
  };

  onResetLevel = () => {
    this.game.resetLevel();
  };

  addGround = () => {
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: ZERO_MASS });
    groundBody.addShape(groundShape);
    groundBody.position.set(...POSITIONS.GROUND);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);
  };

  update = () => {
    this.orbitControls.update();
    this.world.step(WORLD_UPDATE_FREQUENCY);
    if (this.gameScene.character) {
      this.gameScene.update();
    }
    this.renderer.render(this.scene, this.camera);
  };

  onResize = ({ width, height }) => {
    const aspectRatio = width / height;
    this.camera.left = -this.d * aspectRatio;
    this.camera.right = this.d * aspectRatio;
    this.camera.top = this.d;
    this.camera.bottim = -this.d;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };
}

let sketch = null;
window.addEventListener("load", () => {
  // const canvasEl = document.querySelector("#canvas-container");
  // sketch = new Sketch({
  //   canvasEl,
  // });
  onWindowLoad();
});
window.addEventListener("resize", () => {
  const canvasEl = document.querySelector("#canvas-container");
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvasEl.width = width;
  canvasEl.height = height;
  if (!isNil(sketch)) sketch.onResize({ width, height });
});

function onWindowLoad() {
  const canvasEl = document.querySelector("#canvas-container");
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;
  // sketch = new Sketch({
  //   canvasEl,
  // });
}
