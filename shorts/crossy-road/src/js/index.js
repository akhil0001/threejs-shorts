import {
  Scene,
  Color,
  DirectionalLight,
  WebGLRenderer,
  sRGBEncoding,
  GridHelper,
  OrthographicCamera,
  AxesHelper,
  Vector3,
} from "three";
import { GUI } from "dat.gui";
import { addDesktopControls } from "../components/desktop-controls";
import { Chicken, DIRECTION_KEYS } from "../characters/chicken";
import { Lane, LANE_DEPTH, LANE_TYPES } from "../characters/lane";
import { inRange, isEmpty, isNil } from "lodash";

const NUM_LANES_TO_BE = 8;
let NUM_LANES_GENERATED = 0;
const MIN_LANES_FOR_GENERATION = 5;

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

    const { orbitControls } = addDesktopControls(camera, renderer);
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;

    this.orbitControls = orbitControls;
    this.debugGUI = new GUI();

    this.chicken = new Chicken({
      camera,
      aspectRatio,
      onChickenJump: this.onChickenJump,
    });

    this.currentLaneOfDuck = -1;
    this.lanes = [];
    this.generateLanes();

    this.scene.add(this.chicken);
    renderer.setAnimationLoop(this.update);
  };

  update = () => {
    this.orbitControls.update();
    this.camera.lookAt(this.chicken.position);
    if (
      this.currentLaneOfDuck >=
      NUM_LANES_GENERATED - MIN_LANES_FOR_GENERATION
    ) {
      this.generateLanes();
    }

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

  onChickenJump = (direction) => {
    if ([DIRECTION_KEYS.LEFT, DIRECTION_KEYS.RIGHT].includes(direction)) {
      return false;
    }
    if (DIRECTION_KEYS.UP === direction) {
      this.currentLaneOfDuck++;
    } else {
      this.currentLaneOfDuck--;
    }
    // console.log(this.currentLaneOfDuck);
    // this.chicken.position.setZ(0);
    console.log(this.lanes[this.currentLaneOfDuck].logs);
    const intersects = this.lanes[this.currentLaneOfDuck].logs.filter((log) => {
      const flag = inRange(
        this.chicken.position.x,
        log.position.x - 2,
        log.position.x + 2
      );
      return flag;
    });

    if (!isEmpty(intersects)) {
      // intersects[0].add(this.chicken);
    }
  };

  generateLanes = (currentLaneOfDuck) => {
    // const eq = this.lanes.length / 2 - 2;
    // const removedLanes = this.lanes.splice(0, eq);
    // removedLanes.forEach((lane) => lane.dispose());
    for (let i = 0; i < NUM_LANES_TO_BE; i++) {
      const lane = new Lane({
        position: new Vector3(0, 0, -(NUM_LANES_GENERATED * LANE_DEPTH)),
        type: i === 0 ? LANE_TYPES.LAND : LANE_TYPES.WATER,
      });
      NUM_LANES_GENERATED = NUM_LANES_GENERATED + 1;
      this.scene.add(lane);
      this.lanes.push(lane);
    }
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
