export class Game {
  constructor({ renderer, scene, camera, rAFCb }) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.rAFCb = rAFCb;
  }
}
