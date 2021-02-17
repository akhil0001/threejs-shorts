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

class Sketch {
  constructor({ canvasEl }) {
    this.canvasEl = canvasEl;
    this.init();
  }

  init = () => {
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
      canvas: this.canvasEl,
    });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = sRGBEncoding;

    const { orbitControls } = addDesktopControls(camera, renderer);
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;

    this.orbitControls = orbitControls;

    renderer.setAnimationLoop(this.update);
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
