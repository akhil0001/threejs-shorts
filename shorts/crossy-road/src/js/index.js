import {
  Scene,
  Color,
  DirectionalLight,
  WebGLRenderer,
  sRGBEncoding,
  GridHelper,
  OrthographicCamera,
  AxesHelper,
  BoxBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from "three";
import * as CANNON from "cannon-es";
import { GUI } from "dat.gui";
import { addDesktopControls } from "../components/desktop-controls";
import { Chicken } from "../characters/chicken";
import cannonDebugger from "cannon-es-debugger";

class Sketch {
  constructor({ canvasEl }) {
    this.canvasEl = canvasEl;
    this.init();
  }

  init = () => {
    const scene = new Scene();
    scene.background = new Color(0x101010);

    const aspectRatio = window.innerWidth / window.innerHeight;
    this.d = 20;
    const camera = new OrthographicCamera(
      -this.d * aspectRatio,
      this.d * aspectRatio,
      this.d * 1,
      -this.d * 1,
      0.1,
      10000
    );
    camera.position.set(this.d * 2 * 0.5, this.d * 2, this.d * 2);

    const light = new DirectionalLight(0xffffff);
    scene.add(light);

    const gridHelper = new GridHelper(100, 20);
    gridHelper.position.set(0, 0, 0);
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    const axesHelper = new AxesHelper(10);
    scene.add(axesHelper);

    const renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvasEl,
    });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = sRGBEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);

    const { orbitControls } = addDesktopControls(camera, renderer);
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;

    this.orbitControls = orbitControls;
    this.debugGUI = new GUI();
    this.initPhysics();
    this.addPhysicsMaterial();
    this.addGround();
    this.chicken = new Chicken({
      camera,
      aspectRatio,
      world: this.world,
      onChickenJump: this.onChickenJump,
    });
    this.addLane();
    cannonDebugger(this.scene, this.world.bodies);
    this.scene.add(this.chicken);
    this.waterLog.body.material = this.physicsMaterial;
    renderer.setAnimationLoop(this.update);
  };

  addPhysicsMaterial = () => {
    this.physicsMaterial = new CANNON.Material("physics");
    const physicsContactMaterial = new CANNON.ContactMaterial(
      this.physicsMaterial,
      this.physicsMaterial,
      {
        friction: 10,
        restitution: 0,
        frictionEquationRelaxation: 10,
      }
    );
    this.world.addContactMaterial(physicsContactMaterial);
  };

  addGround = () => {
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      mass: 0,
      material: this.physicsMaterial,
    });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.name = "ground";
    this.world.addBody(groundBody);
  };

  addLane = () => {
    const waterLanePos = new Vector3(0, 0, -10);
    this.waterLane = new WaterLane();
    this.waterLane.position.copy(waterLanePos);
    this.scene.add(this.waterLane);
    this.addWaterLog();
  };

  addWaterLog = () => {
    this.waterLog = new WaterLog();
    this.waterLog.position.set(0, 0.5, -8);
    this.waterLog.body.position.copy(this.waterLog.position);
    this.scene.add(this.waterLog);
    this.world.addBody(this.waterLog.body);
  };

  initPhysics = () => {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -10, 0);
    this.world.defaultContactMaterial.contactEquationStiffness = 1e7;

    // Stabilization time in number of timesteps
    this.world.defaultContactMaterial.contactEquationRelaxation = 4;
  };

  update = () => {
    this.world.step(1 / 60);
    // this.chicken.chickenBody.position.copy(this.chicken.position);
    this.chicken.position.copy(this.chicken.chickenBody.position);
    this.chicken.quaternion.copy(this.chicken.chickenBody.quaternion);
    this.orbitControls.update();
    this.camera.lookAt(this.chicken.position);
    this.renderer.render(this.scene, this.camera);
  };

  onResize = ({ width, height }) => {
    const aspectRatio = width / height;
    this.camera.left = -aspectRatio * this.d;
    this.camera.right = aspectRatio * this.d;
    this.camera.top = this.d;
    this.camera.bottom = -this.d;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  onChickenJump = (direction) => {};
}

/**
 * Sketch
 */
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

const waterLaneGeom = new BoxBufferGeometry(20, 0.6, 10);
const waterLaneMat = new MeshBasicMaterial({
  color: 0x4361ee,
});
class WaterLane extends Mesh {
  constructor() {
    super(waterLaneGeom, waterLaneMat);
  }
}

const waterLogGeom = new BoxBufferGeometry(8, 1, 8);
const waterLogMat = new MeshBasicMaterial({
  color: 0x774936,
});

class WaterLog extends Mesh {
  constructor() {
    super(waterLogGeom, waterLogMat);
    this.initPhysics();
  }

  initPhysics = () => {
    this.shape = new CANNON.Box(new CANNON.Vec3(4, 0.5, 4));
    this.body = new CANNON.Body({
      mass: 10.5,
      type: CANNON.BODY_TYPES.STATIC,
    });

    this.body.addShape(this.shape);
    this.body.name = "water-log";
  };
}
