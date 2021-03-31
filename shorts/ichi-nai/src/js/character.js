import {
  BoxBufferGeometry,
  MeshLambertMaterial,
  Mesh,
  SphereBufferGeometry,
  Color,
} from "three";
import * as CANNON from "cannon-es";
import { throttle, inRange } from "lodash";
import anime from "animejs";
import { COLORS, DIMENSIONS } from "./config";

const characterGeom = new BoxBufferGeometry(...DIMENSIONS.CHARACTER);
const characterMat = new MeshLambertMaterial({
  color: 0xb9375e,
});

const sphereGeom = new SphereBufferGeometry(...DIMENSIONS.HEAL_BUBBLE, 32, 32);
const sphereMat = new MeshLambertMaterial({
  color: new Color(COLORS.PINK),
  opacity: 0.2,
  transparent: true,
});

export class Character extends Mesh {
  constructor({ position, onJump }) {
    super(characterGeom, characterMat);
    this.currentTileIndex = null;
    this.prevTileIndex = null;
    this.originalPosition = position.clone();
    this.addBody();
    this.addMagicalSphere();
    this.castShadow = true;
    this.isJumping = false;
    this.isTileDropped = false;
    this.isFalling = false;
    this.throttledJump = throttle(this.jump, 500, { trailing: false });
    this.onJump = onJump;
    window.addEventListener("keyup", (event) => {
      const { key } = event;
      if (["ArrowLeft", "a", "A"].includes(key)) {
        this.throttledJump({
          axis: "z",
          distance: DIMENSIONS.TILE[2],
        });
      }
      if (["ArrowRight", "d", "D"].includes(key)) {
        this.throttledJump({
          axis: "z",
          distance: -DIMENSIONS.TILE[2],
        });
      }
      if (["ArrowUp", "w", "W"].includes(key)) {
        this.throttledJump({
          axis: "x",
          distance: -DIMENSIONS.TILE[0],
        });
      }
      if (["ArrowDown", "s", "S"].includes(key)) {
        this.throttledJump({
          axis: "x",
          distance: DIMENSIONS.TILE[0],
        });
      }
    });
  }

  addBody = () => {
    this.body = new CANNON.Body({
      mass: 1,
    });
    this.shape = new CANNON.Box(
      new CANNON.Vec3(
        DIMENSIONS.CHARACTER[0] / 2,
        DIMENSIONS.CHARACTER[1] / 2,
        DIMENSIONS.CHARACTER[2] / 2
      )
    );
    this.body.addShape(this.shape);
    this.body.addEventListener("collide", (event) => {
      if (this.currentTileIndex !== event.body.sceneIndex) {
        this.prevTileIndex = this.currentTileIndex;
        this.currentTileIndex = event.body.sceneIndex;
        if (this.isJumping) {
          this.isJumping = false;
        }
      }
    });
  };

  addMagicalSphere = () => {
    this.sphere = new Mesh(sphereGeom, sphereMat);
    this.add(this.sphere);
    this.sphere.visible = false;
  };

  jump = ({ axis, distance }) => {
    if (this.isFalling || this.isJumping) {
      return;
    }
    const originalPosition = this.position;
    this.isJumping = true;
    this.isTileDropped = false;
    anime({
      targets: this.body.position,
      keyframes: [
        {
          [axis]: originalPosition[axis],
          y: originalPosition.y,
        },
        {
          [axis]: originalPosition[axis] + distance / 2,
          y: originalPosition.y + 2,
        },
        {
          [axis]: originalPosition[axis] + distance,
          y: originalPosition.y + 1,
        },
      ],
      easing: "linear",
      duration: 500,
      update: ({ progress }) => {
        if (!this.isTileDropped && inRange(progress, 70, 80)) {
          this.isTileDropped = true;
          this.onJump(this.currentTileIndex);
        }
      },
    });
  };

  update = () => {
    this.position.copy(this.body.position);
    this.quaternion.copy(this.body.quaternion);
  };

  restorePosition = ({ onSuccessCb }) => {
    this.isFalling = true;
    this.sphere.visible = true;
    this.body.mass = 0;
    this.body.velocity.setZero();
    this.body.angularVelocity.setZero();
    this.body.updateMassProperties();
    anime({
      targets: this.body.position,
      keyframes: [
        {
          y: this.originalPosition.y + 3,
          z: this.originalPosition.z,
          x: this.originalPosition.x,
        },
        {
          y: this.originalPosition.y,
          z: this.originalPosition.z,
          x: this.originalPosition.x,
        },
      ],

      duration: 1000,
      easing: "linear",
      complete: () => {
        this.sphere.visible = false;
        this.isFalling = false;
        this.isJumping = false;
        this.body.mass = 1;
        this.body.velocity.setZero();
        this.body.angularVelocity.setZero();
        this.body.updateMassProperties();
        onSuccessCb();
      },
    });
  };

  dispose = () => {
    this.parent.remove(this);
    this.geometry.dispose();
    this.material.dispose();
  };
}