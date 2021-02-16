import {
  Scene,
  Color,
  PerspectiveCamera,
  DirectionalLight,
  WebGLRenderer,
  sRGBEncoding,
  GridHelper,
} from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { Controller } from "../components/controller";
import { addDesktopControls } from "../components/desktop-controls";
import { DebuggerComponent } from "../utils";

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
  const consoleOne = new DebuggerComponent();

  const consoleTwo = new DebuggerComponent();

  const controllerOne = new Controller({
    renderer,
    index: 0,
    onSelect,
    onSelectEnd,
    onConnectedCb: () => {
      scene.add(controllerOne.controllerGroup);
      controllerOne.controllerGroup.add(consoleOne.consolePanel);
      consoleOne.log("hello\n Controller one connected");
    },
    onDisconnectedCb: () => {
      controllerOne.controllerGroup.remove(consoleTwo.consolePanel);
      scene.remove(controllerOne.controllerGroup);
    },
  });
  const controllerTwo = new Controller({
    renderer,
    index: 1,
    onSelect,
    onSelectEnd,
    onConnectedCb: () => {
      scene.add(controllerTwo.controllerGroup);
      controllerTwo.controllerGroup.add(consoleTwo.consolePanel);
      consoleTwo.log("hello\n Controller Two connected");
    },
    onDisconnectedCb: () => {
      controllerTwo.controllerGroup.remove(consoleTwo.consolePanel);
      scene.remove(controllerTwo.controllerGroup);
    },
  });

  document.body.appendChild(VRButton.createButton(renderer));

  GLOBALS.camera = camera;
  GLOBALS.renderer = renderer;
  GLOBALS.scene = scene;
  GLOBALS.ctrl1 = controllerOne;
  GLOBALS.ctrl2 = controllerTwo;
  GLOBALS.orbitControls = orbitControls;
  GLOBALS.consoleOne = consoleOne;
  GLOBALS.consoleTwo = consoleTwo;
  renderer.setAnimationLoop(update);
}

function update() {
  const { camera, scene, renderer, orbitControls } = GLOBALS;
  orbitControls.update();
  renderer.render(scene, camera);
}

function onSelect(event) {
  GLOBALS.consoleOne.log("selected");
  console.log(event);
}

function onSelectEnd(event) {
  GLOBALS.consoleOne.log("");
  console.log(event);
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
