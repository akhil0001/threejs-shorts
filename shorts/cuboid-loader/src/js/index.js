import anime from "animejs";
import {
  AmbientLight,
  BoxBufferGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshLambertMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
} from "three";
import { addDesktopControls } from "../components/desktop-controls";

class Sketch {
  constructor({ canvasEl }) {
    this.canvasEl = canvasEl;
    this.colors = {
      LIGHT_GREY: new Color(0xdad2d8),
      GUN_METAL: new Color(0x143642),
      DARK_CYAN: new Color(0x0f8b8d),
      CARROT_ORANGE: new Color(0xf57f17),
      CARNELIAN: new Color(0xa8201a),
      STRAW: new Color(0xcad178),
      DARK_PURPLE: new Color(0x271f30),
      LIGHT_FRENCH_BEIGE: new Color(0xc7aa74),
      DARK_KHAKI: new Color(0xcdc078),
      GOLD_FUSION: new Color(0x7a7054),
      PERSIAN_PLUM: new Color(0x682025),
      FALU_RED: new Color(0x882020),
      COPPER_PENNY: new Color(0xb36163),
      ROSY_BROWN: new Color(0xb68e96),
      LAVENDER_GRAY: new Color(0xb9bbca),
      BEAU_BLUE: new Color(0xbbd1e4),
      URANIAN_BLUE: new Color(0xbce7fd),
    };
    this.init();
  }

  init = () => {
    const scene = new Scene();
    scene.background = new Color(0xffffff);

    const aspectRatio = window.innerWidth / window.innerHeight;

    const camera = new PerspectiveCamera(50, aspectRatio, 0.1, 50);
    camera.position.set(0, 1.6, 3);
    scene.add(camera);

    const light = new DirectionalLight(0xf5f5f5, 0.8);
    light.position.set(0.5, 1, -0.5);
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 10;
    scene.add(light);
    light.castShadow = true;

    const ambientLight = new AmbientLight(0xeeeeee, 0.5);
    scene.add(ambientLight);

    const renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.canvasEl,
    });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    const { orbitControls } = addDesktopControls(camera, renderer);
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;

    this.orbitControls = orbitControls;
    this.addGround();
    this.addCuboids();
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

  addGround = () => {
    const planeGeom = new PlaneBufferGeometry(10, 10);
    const planeMat = new MeshLambertMaterial({
      color: 0xfafafa,
    });
    const plane = new Mesh(planeGeom, planeMat);
    plane.rotateX(-Math.PI / 2);
    plane.receiveShadow = true;
    this.scene.add(plane);
  };

  addCuboids = () => {
    const width = 1.2;
    const depth = width;
    const height = 0.08;
    this.cuboids = [];

    const cuboidPrimeGeom = new BoxBufferGeometry(width, height, depth);
    const cuboidMat = new MeshLambertMaterial({
      color: 0xa8201a,
      flatShading: true,
    });
    let targetScale = 0.8;
    for (let i = 0; i < 15; i++) {
      const tempCuboidMat = cuboidMat.clone();
      tempCuboidMat.color = Object.values(this.colors)[i + 1];
      const tempCuboid = new Mesh(cuboidPrimeGeom, tempCuboidMat);
      tempCuboid.position.setY(height * i + height / 2);
      tempCuboid.castShadow = true;
      tempCuboid.receiveShadow = true;
      this.scene.add(tempCuboid);
      anime({
        targets: tempCuboid.rotation,
        keyframes: [
          {
            y: Math.PI * (i + 1),
            duration: 6000,
          },
        ],
        loop: true,
        easing: "easeInOutSine",
      });
      anime({
        targets: tempCuboid.scale,
        keyframes: [
          {
            x: targetScale,
            z: targetScale,
            duration: 1800,
          },
          {
            x: 1,
            z: 1,
            duration: 1800,
            delay: 2400,
          },
        ],
        loop: true,
        direction: "alternate",
        easing: "easeInOutSine",
      });
      targetScale = this.getHypotenuse(targetScale / 2, targetScale / 2);
    }
  };

  getHypotenuse = (w, h) => {
    return Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
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
