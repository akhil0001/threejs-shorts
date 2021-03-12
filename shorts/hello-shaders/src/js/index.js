import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  sRGBEncoding,
  GridHelper,
  Vector2,
  PlaneBufferGeometry,
  Mesh,
  ShaderMaterial,
  DoubleSide,
  Clock,
} from "three";
import { GUI } from "dat.gui";
import vertexShader from "../shaders/hello-world.vert";
import fragmentShader from "../shaders/hello-world.frag";
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
    this.clock = new Clock();
    this.initUniforms();
    this.addShaderPlane();
    orbitControls.enableDamping = true;
    this.orbitControls = orbitControls;
    this.debugGUI = new GUI();

    renderer.setAnimationLoop(this.update);
  };

  initUniforms = () => {
    this.uniforms = {
      u_time: { type: GLSL_TYPES.FLOAT, value: 1.0 },
      u_resolution: {
        type: GLSL_TYPES.VECTOR2,
        value: new Vector2(
          this.renderer.domElement.width,
          this.renderer.domElement.height
        ),
      },
    };
  };

  addShaderPlane = () => {
    const shaderPlaneGeom = new PlaneBufferGeometry(2, 2);
    console.log({ fragmentShader, vertexShader });
    const shaderMat = new ShaderMaterial({
      uniforms: this.uniforms,
      fragmentShader,
      // vertexShader,
      side: DoubleSide,
    });
    this.shaderPlane = new Mesh(shaderPlaneGeom, shaderMat);
    this.scene.add(this.shaderPlane);
  };

  update = () => {
    this.orbitControls.update();
    this.uniforms.u_time.value = this.clock.getElapsedTime();
    this.renderer.render(this.scene, this.camera);
  };

  onResize = ({ width, height }) => {
    const aspectRatio = width / height;
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
    this.uniforms.u_resolution.value.set(width, height);
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
