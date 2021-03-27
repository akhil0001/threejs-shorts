import anime from "animejs";
import { Box, Body, BODY_TYPES, Vec3 } from "cannon-es";

import { BoxBufferGeometry, Mesh, MeshBasicMaterial } from "three";
import { FLAT_COLORS } from "../utils";

const CHICK_SIZE = 2;
const TIME_FOR_JUMP = 800;
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
  constructor({ camera, aspectRatio, world, onChickenJump }) {
    super(chickenGeom, chickenMat);
    this.camera = camera;
    this.aspectRatio = aspectRatio;
    this.onChickenJump = onChickenJump;
    this.relativeSpeed = 0;
    this.world = world;
    this.init();
  }

  init = () => {
    this.position.set(0, CHICK_SIZE / 2, 8);
    this.createChickenBodyInPhysics();
    this.attachEventListenersToWindow();
  };

  createChickenBodyInPhysics = () => {
    this.chickenShape = new Box(
      new Vec3(CHICK_SIZE / 2, CHICK_SIZE / 2, CHICK_SIZE / 2)
    );
    this.chickenBody = new Body({
      mass: 1,
      type: BODY_TYPES.DYNAMIC,
      linearDamping: 0.5,
      angularDamping: 0.5,
    });
    this.chickenBody.addShape(this.chickenShape);
    this.chickenBody.addEventListener("collide", (event) => {
      console.log(event.body.name);
      // this.chickenBody.velocity.y = 0;
      // this.chickenBody.velocity.z = 0;
    });
    this.world.addBody(this.chickenBody);
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
    // this.isJumping = true;
    // anime({
    //   targets: [this.position],

    //   keyframes: [
    //     {
    //       y: CHICK_SIZE / 2,
    //       [directionAxis]: this.position.z,
    //     },
    //     {
    //       y: CHICK_SIZE / 2 + 5,
    //       [directionAxis]: this.position.z - distance / 2,
    //     },
    //     {
    //       y: CHICK_SIZE / 2,
    //       [directionAxis]: this.position[directionAxis] - distance,
    //     },
    //   ],
    //   easing: "easeInOutBounce",
    //   duration: TIME_FOR_JUMP,
    //   complete: () => {
    //     this.isJumping = false;
    //     this.onChickenJump(key);
    //   },
    // });
    console.log("hello");
    this.chickenBody.velocity.y = 10;
    this.chickenBody.velocity.z = -5;

    // anime({
    //   targets: [this.camera.position],
    //   keyframes: [
    //     {
    //       y: this.camera.position.y,
    //       [directionAxis]: this.camera.position.z,
    //     },
    //     {
    //       y: this.camera.position.y + 5,
    //       [directionAxis]: this.camera.position.z - distance / 2,
    //     },
    //     {
    //       y: this.camera.position.y,
    //       [directionAxis]: this.camera.position[directionAxis] - distance,
    //     },
    //   ],
    //   easing: "easeInOutBounce",
    //   duration: TIME_FOR_JUMP,
    // });
  };
}
