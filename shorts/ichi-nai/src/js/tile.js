import {
  BoxBufferGeometry,
  MeshLambertMaterial,
  Mesh,
  CanvasTexture,
  Color,
} from "three";
import * as CANNON from "cannon-es";

import { COLORS } from "./config";

const tileGeom = new BoxBufferGeometry(5, 2, 5);
const tileMat = new MeshLambertMaterial({
  color: 0xffffff,
});

const WEIGHT_COLORS = {
  0: COLORS.BLACK,
  1: COLORS.GREEN,
  2: COLORS.DARK_GREEN,
  3: COLORS.YELLOW,
};

const grassGeom = new BoxBufferGeometry(5, 0.4, 5);

export class Tile extends Mesh {
  constructor({ color, isOrigin, isDestination }) {
    super(tileGeom, tileMat);
    this.castShadow = true;
    this.weight = 0;
    this.receiveShadow = true;
    this.userData.color = color;
    this.isDestination = isDestination;
    this.isOrigin = isOrigin;
    // this.addTexture();
    this.addGrass();
    this.addBody();
  }

  addBody = () => {
    const shape = new CANNON.Box(new CANNON.Vec3(2.5, 1.2, 2.5));
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
      // map: this.texture,
    });
    this.grass = new Mesh(grassGeom, grassMat);
    this.grass.position.set(0, 1, 0);
    this.grass.castShadow = true;
    this.grass.receiveShadow = true;
    this.add(this.grass);
  };

  addTexture = () => {
    const canvasContext = document.createElement("canvas").getContext("2d");
    canvasContext.canvas.width = 2048;
    canvasContext.canvas.height = 2048;
    // canvasContext.fillStyle = color;
    // canvasContext.fill();

    // canvasContext.fillRect(
    //   0,
    //   0,
    //   canvasContext.canvas.width,
    //   canvasContext.canvas.height
    // );

    this.texture = new CanvasTexture(canvasContext.canvas);
    this.texture.needsUpdate = true;
  };

  updateWeight = () => {
    if (this.isDestination) {
      return;
    }
    this.grass.material.color = new Color(WEIGHT_COLORS[this.weight]);
    this.grass.material.needsUpdate = true;
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
