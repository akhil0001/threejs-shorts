import { showupLevel } from "./animation";
import { gameLevels } from "./config";

export class Game {
  constructor({ afterLoadGameData }) {
    this.level = 0;
    this.afterLoadGameData = afterLoadGameData;
    this.incrementLevel();
  }

  loadGameData = () => {
    this.gameData = gameLevels.filter(({ level }) => level === this.level)[0];
    this.afterLoadGameData({
      data: this.gameData,
    });
  };

  incrementLevel = () => {
    this.level++;
    showupLevel({
      text: `Level ${this.level}`,
      completeCb: this.loadGameData.bind(this),
    });
  };

  resetLevel = () => {
    this.loadGameData();
  };
}
