import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  sRGBEncoding,
  PCFShadowMap,
  PlaneBufferGeometry,
  MeshLambertMaterial,
  Mesh,
} from "three";
import { GUI } from "dat.gui";
import { addDesktopControls } from "../components/desktop-controls";
import { SnowMan } from "./objects";
import { FLAT_COLORS } from "./utils";
import { addLights } from "./lights";

class Sketch {
  constructor({ canvasEl }) {
    this.canvasEl = canvasEl;
    this.init();
  }

  init = () => {
    const scene = new Scene();
    scene.background = new Color(FLAT_COLORS.CLOUDS);

    const aspectRatio = window.innerWidth / window.innerHeight;

    const camera = new PerspectiveCamera(50, aspectRatio, 0.1, 50);
    camera.position.set(0, 1.6, 3);
    scene.add(camera);

    const renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvasEl,
    });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;

    const { orbitControls } = addDesktopControls(camera, renderer);
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;

    this.orbitControls = orbitControls;
    this.debugGUI = new GUI();
    /**
     * lights
     */
    this.lights = addLights({ scene: this.scene });

    /**
     * objects
     */

    this.snowMan = new SnowMan({
      onComplete: this.onAnimationComplete,
    });
    this.scene.add(this.snowMan);

    addFloor({ scene: this.scene });
    this.camera.position.set(-2.5, 2.5, 3);
    renderer.setAnimationLoop(this.update);
  };

  onAnimationComplete = () => {
    this.scene.remove(this.snowMan);
    this.snowMan = new SnowMan({
      onComplete: this.onAnimationComplete,
    });
    this.scene.add(this.snowMan);
  };

  update = () => {
    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
  };

  onResize = ({ width, height }) => {
    const aspectRatio = width / height;
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };
}

function addFloor({ scene }) {
  const floorGeom = new PlaneBufferGeometry(100, 100);
  const floorMat = new MeshLambertMaterial({
    color: FLAT_COLORS.PETER_RIVER,
  });
  const floor = new Mesh(floorGeom, floorMat);
  floor.receiveShadow = true;
  floor.rotateX(-Math.PI / 2);
  scene.add(floor);
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
