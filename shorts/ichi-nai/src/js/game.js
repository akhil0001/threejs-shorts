import { showupLevel } from "./animation";
import { gameLevels } from "./config";
import { GameStateInstanceInterface } from "./interface";
import { GameScene } from "./gamescene";
import { isNil } from "lodash";

export class Game extends GameStateInstanceInterface {
  constructor({ scene, world, changeGameState, data }) {
    super({ scene, world, changeGameState, data });
    this.level = 0;
    this._resetBtn = null;
    this._addEventListenerToResetBtn();
    this.gameScene = new GameScene({
      scene: this.scene,
      character: this.data.character,
      onLevelDone: () => this.incrementLevel(),
      onLevelReset: () => this.resetLevel,
      world: this.world,
    });
    this.incrementLevel();
  }

  loadGameData = () => {
    this.gameData = gameLevels.filter(({ level }) => level === this.level)[0];
  };

  _addEventListenerToResetBtn = () => {
    this._resetBtn = document.querySelector(".reset-btn");
    if (!isNil(this._resetBtn)) {
      this._resetBtn.addEventListener("click", () => {
        this.resetLevel();
      });
    }
  };

  incrementLevel = () => {
    console.log("called");
    this.level++;
    showupLevel({
      text: `Level ${this.level}`,
      completeCb: () => {},
    });
    this.loadGameData();
    this.gameScene.loadGameScene({
      gameData: this.gameData,
    });
  };

  resetLevel = () => {
    // this.loadGameData();
    this.gameScene.resetScene();
  };

  update = () => {
    this.gameScene.update();
  };
}
