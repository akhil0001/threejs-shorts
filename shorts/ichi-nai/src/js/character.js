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
  constructor({
    position,
    onJump,
    currentTileIndex,
    isSpaceBubbleVisible = false,
  }) {
    super(characterGeom, characterMat);
    this.currentTileIndex = currentTileIndex;
    this.isSpaceBubbleVisible = isSpaceBubbleVisible;
    this.prevTileIndex = null;
    this.originalPosition = position.clone();
    this.addBody();
    this.addMagicalSphere();
    this.castShadow = true;
    this.isJumping = false;
    this.isTileDropped = false;
    this.isFalling = false;
    this.throttledJump = throttle(this.jump.bind(this), 500, {
      trailing: false,
    });
    this.onJump = onJump;
    this.addEyes();
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

  addEyes = () => {
    const eyeOne = new Eye();
    const eyeTwo = new Eye();
    eyeOne.position.set(1, 0.2, 0.8);
    eyeTwo.position.set(1, 0.2, -0.8);

    this.add(eyeOne, eyeTwo);
  };

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
    this.sphere.visible = this.isSpaceBubbleVisible;
  };

  toggleMagicalSphereVisibility = ({ flag }) => {
    this.isSpaceBubbleVisible = flag;
    this.sphere.visible = flag;
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
          y: this.originalPosition.y + 2,
          z: this.originalPosition.z,
          x: this.originalPosition.x,
        },
        {
          y: this.originalPosition.y,
          z: this.originalPosition.z,
          x: this.originalPosition.x,
        },
      ],

      duration: 2000,
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

  float = () => {
    this.toggleMagicalSphereVisibility({ flag: true });
    this.floatAnime = anime({
      targets: this.body.position,
      keyframes: [
        {
          y: this.body.position.y,
        },
        {
          y: this.body.position.y + 0.8,
        },
        {
          y: this.body.position.y - 0.8,
        },
      ],
      loop: true,
      direction: "alternate",
      duration: 5000,
      update: () => {
        this.body.quaternion.y -= 0.01;
      },
      easing: "linear",
    });
  };

  dispose = () => {
    this.parent.remove(this);
    this.geometry.dispose();
    this.material.dispose();
  };
}

const eyeGeom = new BoxBufferGeometry(0.2, 0.8, 0.8);
const eyeMat = new MeshLambertMaterial({
  color: COLORS.WHITE,
});

class Eye extends Mesh {
  constructor() {
    super(eyeGeom, eyeMat);
  }
}
