import {
  AdditiveBlending,
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
} from "three";

export class DebuggerComponent {
  constructor() {
    this.canvasEl = document.createElement("canvas");
    this.init();
  }

  init = () => {
    this.canvasEl.width = 1024;
    this.canvasEl.height = 1024;
    this.canvasTexture = new CanvasTexture(this.canvasEl);
    this.canvasContext = this.canvasEl.getContext("2d");
    this.consolePanelGeom = new PlaneBufferGeometry(
      (0.3 * this.canvasEl.width) / 1024,
      (0.3 * this.canvasEl.height) / 1024
    );
    this.consolePanelMat = new MeshBasicMaterial({
      map: this.canvasTexture,
      blending: AdditiveBlending,
      transparent: true,
    });
    this.consolePanel = new Mesh(this.consolePanelGeom, this.consolePanelMat);
    this.consolePanel.renderOrder = 1;
  };

  log = (text) => {
    if (typeof text !== "string") {
      text = JSON.stringify(text, null, 2);
    }
    this.canvasContext.font = "120px Verdana";
    this.canvasContext.fillStyle = "black";
    this.canvasContext.fillRect(
      0,
      0,
      this.canvasEl.width,
      this.canvasEl.height
    );
    this.canvasContext.fillStyle = "white";
    let y = 1;
    text
      .split("")
      .map((el, i) => {
        if (i > 16 * y) {
          y++;
          return (el = el + "-\n");
        }
        return el;
      })
      .join("")
      .split("\n")
      .forEach((str, i) => this.canvasContext.fillText(str, 0, (i + 1) * 120));
    this.canvasTexture.needsUpdate = true;
  };
}
