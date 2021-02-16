import {
  Scene,
  Color,
  PerspectiveCamera,
  DirectionalLight,
  WebGLRenderer,
  sRGBEncoding,
  GridHelper,
} from "three";
import { addDesktopControls } from "../components/desktop-controls";

const GLOBALS = {};

function init() {
  const canvasContainer = document.getElementById("canvas-container");
  const scene = new Scene();
  scene.background = new Color(0x101010);

  const aspectRatio = window.innerWidth / window.innerHeight;

  const camera = new PerspectiveCamera(50, aspectRatio, 0.1, 50);
  camera.position.set(0, 1.6, 3);
  scene.add(camera);

  const light = new DirectionalLight(0xffffff);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  const gridHelper = new GridHelper(100, 100);
  gridHelper.position.set(0, 0, 0);
  gridHelper.material.opacity = 0.5;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  const renderer = new WebGLRenderer({
    antialias: true,
    canvas: canvasContainer,
  });
  renderer.xr.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = sRGBEncoding;

  const { orbitControls } = addDesktopControls(camera, renderer);
  GLOBALS.camera = camera;
  GLOBALS.renderer = renderer;
  GLOBALS.scene = scene;

  GLOBALS.orbitControls = orbitControls;

  renderer.setAnimationLoop(update);
}

function update() {
  const { camera, scene, renderer, orbitControls } = GLOBALS;
  orbitControls.update();
  renderer.render(scene, camera);
}

function onResize() {
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
  const aspectRatio = WIDTH / HEIGHT;
  const { camera, renderer } = GLOBALS;
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();
  renderer.setSize(WIDTH, HEIGHT);
}

window.addEventListener("load", init);
window.addEventListener("resize", onResize);
