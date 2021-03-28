import { gameLevels } from "./config";

export class Game {
  constructor({ afterLoadGameData }) {
    this.level = 1;
    this.afterLoadGameData = afterLoadGameData;
    this.loadGameData();
  }

  loadGameData = () => {
    this.gameData = gameLevels.filter(({ level }) => level === this.level)[0];
    this.afterLoadGameData({
      data: this.gameData,
    });
  };

  incrementLevel = () => {
    this.level++;
    this.loadGameData();
  };
}
