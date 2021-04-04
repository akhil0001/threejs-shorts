import {
  BoxBufferGeometry,
  MeshLambertMaterial,
  Mesh,
  CanvasTexture,
  Color,
  Vector3,
} from "three";
import * as CANNON from "cannon-es";

import {
  COLORS,
  DIMENSIONS,
  EPSILON,
  FORCES,
  HEIGHT_FROM_FLOOR,
  POSITIONS,
} from "./config";
import anime from "animejs";
import { adjustTileBodyPosition } from "./utils";

const { TILE, GRASS } = DIMENSIONS;

const tileGeom = new BoxBufferGeometry(
  TILE[0] - EPSILON,
  TILE[1],
  TILE[2] - EPSILON
);

const grassGeom = new BoxBufferGeometry(
  GRASS[0] - EPSILON,
  GRASS[1],
  GRASS[2] - EPSILON
);

const tileMat = new MeshLambertMaterial({
  color: new Color(COLORS.WHITE),
});

const WEIGHT_COLORS = {
  0: COLORS.BLACK,
  1: COLORS.GREEN,
  2: COLORS.DARK_GREEN,
  3: COLORS.YELLOW,
};

export class Tile extends Mesh {
  constructor({ weight, isOrigin, isDestination, originalPosition }) {
    super(tileGeom, tileMat);
    this.castShadow = true;
    this._originalWeight = weight;
    this.weight = weight;
    this.receiveShadow = true;
    this.isDestination = isDestination;
    this.isOrigin = isOrigin;
    this.sceneIndex = 0;
    this.originalPosition = originalPosition.clone();
    // this.position.copy(this.originalPosition);
    this.userData.color = WEIGHT_COLORS[weight];
    this._tempVec = new Vector3();
    this._subVec = new Vector3(0, GRASS[1] / 2, 0);
    this.assignColors();
    this.addTexture();
    this.addGrass();
    this.addBody();
  }

  updateInfo = ({ weight, position, bodyMass, bodyPos, sceneIndex, delay }) => {
    this.sceneIndex = sceneIndex;
    this.body.sceneIndex = sceneIndex;
    this._originalWeight = weight; // this is not related to mass instead the number of times to jump to make it to 1; // TODO: Change the name of variable
    this.weight = weight;
    // this.position.copy(position);
    this.body.mass = bodyMass;
    // this.body.position.copy(bodyPos);
    this.body.updateMassProperties();
    this.originalPosition.copy(bodyPos);
    anime({
      targets: this.body.position,
      y: bodyPos.y,
      x: bodyPos.x,
      z: bodyPos.z,
      duration: 1000,
      delay,
      easing: "linear",
    });
  };

  assignColors = () => {
    if (this.isOrigin || this.isDestination) {
      this.userData.color = COLORS.ORANGE;
    }
  };

  addBody = () => {
    const shape = new CANNON.Box(
      new CANNON.Vec3(
        TILE[0] / 2 - EPSILON,
        (TILE[1] + GRASS[1]) / 2,
        TILE[2] / 2 - EPSILON
      )
    );
    const body = new CANNON.Body({
      mass: 0,
      type: CANNON.BODY_TYPES.DYNAMIC,
    });
    body.addShape(shape);
    this.body = body;
    this.body.position.copy(new CANNON.Vec3(...POSITIONS.GROUND));
  };

  addGrass = () => {
    const grassMat = new MeshLambertMaterial({
      color: this.userData.color,
      map: this.isOrigin || this.isDestination ? this.texture : null,
    });
    this.grass = new Mesh(grassGeom, grassMat);
    this.grass.position.set(0, 1.4, 0);
    this.grass.castShadow = true;
    this.grass.receiveShadow = true;
    this.add(this.grass);
  };

  addTexture = () => {
    const canvasContext = document.createElement("canvas").getContext("2d");
    canvasContext.canvas.width = 2048;
    canvasContext.canvas.height = 2048;
    canvasContext.fillStyle = "#ffffff";
    canvasContext.fill();

    canvasContext.fillRect(
      0,
      0,
      canvasContext.canvas.width,
      canvasContext.canvas.height
    );

    canvasContext.strokeStyle = WEIGHT_COLORS[this.weight];
    canvasContext.lineWidth = 100;

    canvasContext.strokeRect(
      0,
      0,
      canvasContext.canvas.width,
      canvasContext.canvas.height
    );

    canvasContext.strokeRect(
      400,
      400,
      canvasContext.canvas.width - 800,
      canvasContext.canvas.height - 800
    );

    canvasContext.strokeRect(
      800,
      800,
      canvasContext.canvas.width - 1600,
      canvasContext.canvas.height - 1600
    );
    this.texture = new CanvasTexture(canvasContext.canvas);
    this.texture.needsUpdate = true;
  };

  updateWeightColor = () => {
    if (this.isDestination) {
      return;
    }
    if (this.isOrigin) {
      this.grass.material.color = new Color(COLORS.ORANGE);
    } else
      this.grass.material.color = new Color(
        WEIGHT_COLORS[this._originalWeight]
      );
    this.grass.material.needsUpdate = true;
  };

  static notifyUserAboutMiss = ({ missedTiles, completeCb }) => {
    const { y } = adjustTileBodyPosition({
      posVec: new Vector3(0, HEIGHT_FROM_FLOOR, 0),
    });
    anime({
      targets: [...missedTiles],
      keyframes: [
        {
          y,
        },
        {
          y: y - 2,
        },
        {
          y,
        },
      ],
      duration: 1000,
      easing: "easeInOutQuad",
      delay: anime.stagger(100),
      complete: completeCb,
    });
  };

  update = () => {
    this._tempVec.set(...this.body.position.toArray()).sub(this._subVec);
    this.position.copy(this._tempVec);
    this.quaternion.copy(this.body.quaternion);
  };

  drop = () => {
    this.body.mass = 1;
    this.body.applyForce(new CANNON.Vec3(...FORCES.DROP_FORCE));
    this.body.updateMassProperties();
  };

  restorePosition = ({ delay }) => {
    const { x, y, z } = this.originalPosition;
    anime({
      targets: this.body.position,
      y: y,
      x: x,
      z: z,
      duration: 2000,
      easing: "linear",
      delay,
    });
    anime({
      targets: this.body.quaternion,
      x: 0,
      y: 0,
      z: 0,
      duration: 2000,
      easing: "linear",
      delay,
    });
    this.body.mass = 0;
    this.body.updateMassProperties();
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.weight = this._originalWeight;
    this.updateWeightColor();
  };

  dispose = () => {
    this.grass.parent.remove(this.grass);
    this.grass.material.dispose();
    this.grass.geometry.dispose();

    this.parent.remove(this);
    this.material.dispose();
    this.geometry.dispose();
  };
}
