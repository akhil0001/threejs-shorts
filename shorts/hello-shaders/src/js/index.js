import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  sRGBEncoding,
  GridHelper,
  Vector2,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  Mesh,
  DoubleSide,
  ShaderMaterial,
} from "three";
import { GUI } from "dat.gui";
import { addDesktopControls } from "../components/desktop-controls";
import { GLSL_TYPES } from "./glsl-types";

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
    this.addShaderPlane();
    orbitControls.enableDamping = true;
    this.orbitControls = orbitControls;
    this.debugGUI = new GUI();

    renderer.setAnimationLoop(this.update);
  };

  initUniforms = () => {
    this.uniforms = {
      u_time: { type: GLSL_TYPES.FLOAT, value: 1.0 },
      u_resolution: { type: GLSL_TYPES.VECTOR2, value: new Vector2() },
    };
  };

  addShaderPlane = () => {
    const shaderPlaneGeom = new PlaneBufferGeometry(2, 2);
    // const shaderPlaneMat = new MeshBasicMaterial({
    //   color: 0xf0f0f0,
    //   side: DoubleSide,
    // });
    const shaderMat = ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: document.getElementById("vertexShader").textContent,
      fragmentShader: document.getElementById("fragmentShader").textContent,
    });
    this.shaderPlane = new Mesh(shaderPlaneGeom, shaderMat);
    this.scene.add(this.shaderPlane);
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
