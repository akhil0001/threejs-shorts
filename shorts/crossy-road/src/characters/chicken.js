import anime from "animejs";
import { BoxBufferGeometry, Mesh, MeshBasicMaterial } from "three";
import { FLAT_COLORS } from "../utils";

const CHICK_SIZE = 2;
const TIME_FOR_JUMP = 500;
const CHICKEN_JUMP_DISTANCE = 8;
const chickenGeom = new BoxBufferGeometry(CHICK_SIZE, CHICK_SIZE, CHICK_SIZE);
const chickenMat = new MeshBasicMaterial({
  color: FLAT_COLORS.CLOUDS,
});

export const DIRECTION_KEYS = {
  UP: "w",
  DOWN: "s",
  LEFT: "a",
  RIGHT: "d",
};

export class Chicken extends Mesh {
  constructor({ camera, aspectRatio, onChickenJump }) {
    super(chickenGeom, chickenMat);
    this.camera = camera;
    this.aspectRatio = aspectRatio;
    this.onChickenJump = onChickenJump;
    this.relativeSpeed = 0;
    this.init();
  }

  init = () => {
    this.position.set(0, CHICK_SIZE / 2, 8);
    this.attachEventListenersToWindow();
  };

  attachEventListenersToWindow = () => {
    window.addEventListener("keydown", (e) => {
      if (e.key === DIRECTION_KEYS.UP) {
        this.jump("z", CHICKEN_JUMP_DISTANCE, e.key);
      }
      if (e.key === DIRECTION_KEYS.DOWN) {
        this.jump("z", -CHICKEN_JUMP_DISTANCE, e.key);
      }

      if (e.key === DIRECTION_KEYS.RIGHT) {
        this.jump("x", -CHICKEN_JUMP_DISTANCE / 2, e.key);
      }

      if (e.key === DIRECTION_KEYS.LEFT) {
        this.jump("x", CHICKEN_JUMP_DISTANCE / 2, e.key);
      }
    });
  };

  jump = (directionAxis, distance, key) => {
    if (this.isJumping) {
      return;
    }
    this.isJumping = true;
    anime({
      targets: [this.position],
      [directionAxis]: this.position[directionAxis] - distance,
      easing: "easeInOutSine",
      duration: TIME_FOR_JUMP,
      complete: () => {
        this.isJumping = false;
        this.onChickenJump(key);
      },
    });
    anime({
      targets: [this.camera.position],
      [directionAxis]: this.camera.position[directionAxis] - distance,
      easing: "easeInOutSine",
      duration: TIME_FOR_JUMP,
    });
  };
}
