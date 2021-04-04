import {
  AmbientLight,
  DirectionalLight,
  OrthographicCamera,
  PCFSoftShadowMap,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
  AxesHelper,
} from "three";
import * as CANNON from "cannon-es";
import cannonDebugger from "cannon-es-debugger";
import { GUI } from "dat.gui";
import { FORCES, WORLD_UPDATE_FREQUENCY, ZERO_MASS, POSITIONS } from "./config";
import { addDesktopControls } from "../components/desktop-controls";

export class Basics {
  constructor({ canvasEl }) {
    this.scene = null;
    this.camera = null;
    this.light = null;
    this.renderer = null;
    this.world = null;
    this.debugGUI = null;
    this.canvasEl = canvasEl;
    this.init();
  }

  init = () => {
    this.scene = new Scene();
    this.addCamera();
    this.addLights();
    this.createRenderer();
    this.initPhysics();
    this.addGround();
    this.addDebugHelpers();
  };

  addCamera = () => {
    const aspectRatio = window.innerWidth / window.innerHeight;
    this._d = 30;
    this.camera = new OrthographicCamera(
      -this._d * aspectRatio,
      this._d * aspectRatio,
      this._d * 1,
      -this._d * 1,
      0.1,
      10000
    );
    this.camera.position.set(this._d, this._d, this._d);
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
    const axesHelper = new AxesHelper(10);
    this.scene.add(axesHelper);

    const { orbitControls } = addDesktopControls(this.camera, this.renderer);
    this.orbitControls = orbitControls;
    // cannonDebugger(this.scene, this.world.bodies, {});

    this.debugGUI = new GUI();
  };

  addGround = () => {
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: ZERO_MASS });
    groundBody.addShape(groundShape);
    groundBody.position.set(...POSITIONS.GROUND);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);
  };

  initPhysics = () => {
    this.world = new CANNON.World();
    this.world.gravity.set(...FORCES.GRAVITY);
  };

  update = () => {
    this.world.step(WORLD_UPDATE_FREQUENCY);
    this.renderer.render(this.scene, this.camera);
  };

  onResize = ({ width, height }) => {
    const aspectRatio = width / height;
    this.camera.left = -this._d * aspectRatio;
    this.camera.right = this._d * aspectRatio;
    this.camera.top = this._d;
    this.camera.bottim = -this._d;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };
}
