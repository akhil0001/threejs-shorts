import {
  BoxBufferGeometry,
  MeshLambertMaterial,
  Mesh,
  CanvasTexture,
  Color,
  Vector3,
} from "three";
import * as CANNON from "cannon-es";

import { COLORS, DIMENSIONS, EPSILON, FORCES } from "./config";
import anime from "animejs";

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
    this.originalWeight = weight;
    this.weight = 0;
    this.receiveShadow = true;
    this.isDestination = isDestination;
    this.isOrigin = isOrigin;
    this.sceneIndex = 0;
    this.originalPosition = originalPosition.clone();
    this.userData.color = WEIGHT_COLORS[weight];
    this._tempVec = new Vector3();
    this._subVec = new Vector3(0, GRASS[1] / 2, 0);
    this.assignColors();
    this.addTexture();
    this.addGrass();
    this.addBody();
  }

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
    } else this.grass.material.color = new Color(WEIGHT_COLORS[this.weight]);
    this.grass.material.needsUpdate = true;
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
      duration: 1500,
      easing: "linear",
      delay,
    });
    anime({
      targets: this.body.quaternion,
      x: 0,
      y: 0,
      z: 0,
      duration: 1500,
      easing: "linear",
      delay,
    });
    this.body.mass = 0;
    this.body.updateMassProperties();
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.weight = this.originalWeight;
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
