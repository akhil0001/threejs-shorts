import { get } from "lodash";
import { Vector3 } from "three";
import { Character } from "./character";
import { DIMENSIONS, HEIGHT_FROM_FLOOR } from "./config";
import { Tile } from "./tile";

export const LEVEL_STATUS = {
  PLAYING: "playing",
  DONE: "done",
  FAIL: "fail",
};

const posVec = new Vector3();
const mulVec = new Vector3(DIMENSIONS.TILE[0], 1, DIMENSIONS.TILE[2]);
const addVec = new Vector3(0, HEIGHT_FROM_FLOOR, 0);

export class GameScene {
  constructor({ scene, world, onLevelDone, onLevelReset }) {
    this.scene = scene;
    this.world = world;
    this.originTile = null;
    this.destinationTile = null;
    this.onLevelDone = onLevelDone;
    this.onLevelReset = onLevelReset;
    this.tiles = [];
    this.removedTiles = [];
    this.status = LEVEL_STATUS.PLAYING;
  }

  loadGameScene = ({ gameData }) => {
    const { tiles } = gameData;
    tiles.forEach((tile, index) => {
      this.addTileToScene({
        data: tile,
        index,
      });
    });
    this.addCharaterToScene({ position: this.originTile.position });
  };

  addTileToScene = ({ data, index }) => {
    const {
      position,
      isOrigin = false,
      isDestination = false,
      weight = 1,
    } = data;
    posVec
      .set(...position)
      .multiply(mulVec)
      .add(addVec);
    const tile = new Tile({
      weight,
      isDestination,
      isOrigin,
      originalPosition: posVec,
    });
    /**
     * three.js scene related
     */
    tile.sceneIndex = index;
    tile.weight = weight; // this is not related to mass instead the number of times to jump to make it to 1; // TODO: Change the name of variable
    tile.position.copy(posVec);
    this.scene.add(tile);
    /**
     * cannon.js realated
     */
    tile.body.sceneIndex = index;
    tile.body.mass = 0;
    // to adjust for grass
    const tempVec = posVec
      .clone()
      .add(new Vector3(0, DIMENSIONS.GRASS[1] / 4, 0));
    tile.body.position.copy(tempVec);
    tile.originalPosition = tempVec.clone();
    this.world.addBody(tile.body);

    if (isOrigin) {
      this.originTile = tile;
    }
    if (isDestination) {
      this.destinationTile = tile;
    }

    this.tiles.push(tile);
  };

  addCharaterToScene = ({ position }) => {
    const highVector = new Vector3(0, 5, 0);
    const newPosition = position.clone().add(highVector);
    this.character = new Character({
      onJump: this.onCharacterjump,
      position: newPosition,
    });
    this.character.position.copy(newPosition);
    this.scene.add(this.character);
    this.character.body.position.copy(newPosition);
    this.world.addBody(this.character.body);
  };

  update = () => {
    this.tiles.forEach((tile) => tile.update());
    this.character.update();
    if (
      (this.character.position.y < HEIGHT_FROM_FLOOR &&
        this.status !== LEVEL_STATUS.FAIL) ||
      (this.isDestinationReachedWithoutCompletingAllTiles() &&
        this.status !== LEVEL_STATUS.FAIL)
    ) {
      this.status = LEVEL_STATUS.FAIL;
      this.resetScene();
    }
    if (this.checkIfLevelIsComplete() && this.status !== LEVEL_STATUS.DONE) {
      this.status = LEVEL_STATUS.DONE;
      this.cleanup(this.onLevelDone);
    }
  };

  isDestinationReachedWithoutCompletingAllTiles = () => {
    const tileIndex = this.character.currentTileIndex;
    if (get(this.tiles[tileIndex], "isDestination", null)) {
      return this.tiles.length - 1 !== this.removedTiles.length;
    }
    return false;
  };

  onCharacterjump = (tileIndex) => {
    const jumpedFromTile = this.tiles[tileIndex];
    jumpedFromTile.weight--;
    jumpedFromTile.updateWeightColor();
    this.onTileWeightEqualsZero({
      tile: jumpedFromTile,
    });
  };

  onTileWeightEqualsZero = ({ tile }) => {
    if (tile.weight === 0 && !tile.isDestination) {
      this.removedTiles.push(tile);
      tile.drop();
    }
  };

  checkIfLevelIsComplete = () => {
    if (
      this.destinationTile.sceneIndex === this.character.currentTileIndex &&
      this.removedTiles.length === this.tiles.length - 1
    ) {
      return true;
    }
  };

  resetScene = () => {
    this.character.restorePosition({
      onSuccessCb: () => {
        this.status = LEVEL_STATUS.PLAYING;
        this.character.currentTileIndex = this.originTile.sceneIndex;
      },
    });
    this.removedTiles.forEach((tile, index) => {
      tile.restorePosition({ delay: index * 50 });
    });
    this.removedTiles = [];
  };

  cleanup = (cb) => {
    this.destinationTile.body.mass = 1;
    this.destinationTile.body.updateMassProperties();
    this.character.body.mass = 10;
    this.character.body.updateMassProperties();
    this.tiles.forEach((tile) => {
      tile.body.mass = 1;
      tile.body.updateMassProperties();
    });
    this.tiles.forEach((tile) => {
      tile.dispose();
      this.world.removeBody(tile.body);
    });
    this.character.dispose();
    this.world.removeBody(this.character.body);
    this.tiles = [];
    this.removedTiles = [];
    cb();
  };

  removeTileFromScene = () => {};
  removeCharacterFromScene = () => {};
}
