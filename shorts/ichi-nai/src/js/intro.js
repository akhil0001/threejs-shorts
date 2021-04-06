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
import { isNil } from "lodash";
import { GAME_STATES } from "./game-interface";
import { GameStateInstanceInterface } from "./interface";
import { changePlayToRedoBtn, reduceTitleAndMoveItUp } from "./animation";

const tempVec = new Vector3();
const mulVec = new Vector3(DIMENSIONS.TILE[0], 0, DIMENSIONS.TILE[2]);
const addVec = new Vector3(0, -HEIGHT_FROM_FLOOR, 0);
export class Intro extends GameStateInstanceInterface {
  constructor({ scene, world, changeGameState, data }) {
    super({ scene, world, changeGameState, data });
    this.levelData = null;
    this.tiles = [];
    this._init();
  }

  _init = () => {
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
    this._getIntroLevelData();
    this._buildTiles();
    this._addEventListenerToPlayBtn();
  };

  _getIntroLevelData = () => {
    this.levelData = gameLevels.filter(({ level }) => level === 0)[0];
  };

  _buildTiles = () => {
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

  _addEventListenerToPlayBtn = () => {
    this._playBtn = document.querySelector(".play-btn");
    if (isNil(this._playBtn)) {
      console.warn("could not access the play button");
      return this._playBtn;
    }
    this._playBtn.addEventListener("click", () => {
      this.changeGameState({
        state: GAME_STATES.PLAY,
        data: {
          character: this.character,
        },
      });
    });
  };

  update = () => {
    this.tiles.forEach((tile) => tile.update());
    this.character.update();
  };

  onExit = () => {
    reduceTitleAndMoveItUp();
    changePlayToRedoBtn();
    this._dispose();
  };

  _dispose = () => {
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
  };
}
