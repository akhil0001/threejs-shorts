import { Vector3 } from "three";
import * as CANNON from "cannon-es";
import { Character } from "./character";
import {
  gameLevels,
  POSITIONS,
  DIMENSIONS,
  HEIGHT_FROM_FLOOR,
  FORCES,
} from "./config";
import { Tile } from "./tile";

const tempVec = new Vector3();
const mulVec = new Vector3(DIMENSIONS.TILE[0], 0, DIMENSIONS.TILE[2]);
const addVec = new Vector3(0, -HEIGHT_FROM_FLOOR, 0);
export class Intro {
  constructor({ scene, world }) {
    this.scene = scene;
    this.world = world;
    this.levelData = null;
    this.tiles = [];
    this.init();
  }

  init = () => {
    this.character = new Character({
      position: new Vector3(...POSITIONS.SPACE_INTRO),
      onJump: () => {},
      currentTileIndex: null,
      isSpaceBubbleVisible: true,
    });
    const posVec = tempVec.clone().set(...POSITIONS.SPACE_INTRO);
    this.character.position.copy(posVec);
    this.character.body.position.copy(posVec);
    this.character.body.mass = 0;
    this.character.body.updateMassProperties();
    this.character.float();
    this.scene.add(this.character);
    this.world.addBody(this.character.body);
    this.getIntroLevelData();
    this.buildTiles();
  };

  getIntroLevelData = () => {
    this.levelData = gameLevels.filter(({ level }) => level === 0)[0];
  };

  buildTiles = () => {
    this.levelData.tiles.forEach(({ position }, index) => {
      const posVec = tempVec
        .clone()
        .set(...position)
        .multiply(mulVec)
        .add(addVec);
      const tile = new Tile({
        originalPosition: tempVec,
        weight: index,
      });
      tile.position.copy(posVec);
      tile.body.mass = 0;
      tile.body.updateMassProperties();
      tile.body.position.copy(posVec);
      this.tiles.push(tile);
      this.scene.add(tile);
      this.world.addBody(tile.body);
    });
  };

  update = () => {
    this.tiles.forEach((tile) => tile.update());
    this.character.update();
  };

  dispose = (cb) => {
    this.tiles.forEach((tile, index) => {
      tile.body.mass = 1;
      tile.body.applyForce(
        new CANNON.Vec3(
          FORCES.DROP_FORCE[0] * index,
          FORCES.DROP_FORCE[1],
          FORCES.DROP_FORCE[2] * index
        )
      );
      tile.body.updateMassProperties();
    });
    this.character.floatAnime.pause();
    cb(this.character);
  };
}
