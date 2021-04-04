export class GameStateInstanceInterface {
  constructor({ scene, world, changeGameState, data }) {
    this.scene = scene;
    this.world = world;
    this.data = data;
    this.changeGameState = changeGameState;
  }

  _init = () => {};
  onExit = () => {};
  update = () => {};
}
