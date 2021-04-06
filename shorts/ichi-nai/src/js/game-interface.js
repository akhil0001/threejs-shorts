import { Basics } from "./basics";
import { Intro } from "./intro";
import { Game } from "./game";

export const GAME_STATES = {
  INTRO: "INTRO",
  PLAY: "PLAY",
};
export class App {
  constructor({ canvasEl }) {
    this._gameState = GAME_STATES.INTRO;
    this._canvasEl = canvasEl;
    this._currentGameStateInstance = null;
    this.basics = null;
    this.data = null;
    this.init();
  }

  init = () => {
    /** basic stuff */
    this.basics = new Basics({
      canvasEl: this._canvasEl,
    });
    this.basics.renderer.setAnimationLoop(this.update);
    /**
     * Game state related Class
     */
    this.getCurrentGameInstance({ data: this.data });
  };

  getCurrentGameInstance = ({ data }) => {
    switch (this._gameState) {
      case GAME_STATES.INTRO:
        this._currentGameStateInstance = new Intro({
          scene: this.basics.scene,
          world: this.basics.world,
          data: data,
          changeGameState: this.changeGameState,
        });
        break;

      case GAME_STATES.PLAY:
        this._currentGameStateInstance = new Game({
          scene: this.basics.scene,
          world: this.basics.world,
          data: data,
          changeGameState: this.changeGameState,
        });
        break;
      default:
        break;
    }
  };

  update = () => {
    this.basics.update();
    this._currentGameStateInstance.update();
  };

  changeGameState = ({ state, data }) => {
    this._currentGameStateInstance.onExit();
    this._gameState = state;
    this.data = data;
    setTimeout(() => this.getCurrentGameInstance({ data: this.data }), 5000);
  };
}
