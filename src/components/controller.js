import { isNil } from "lodash";
import {
  BufferGeometry,
  Line,
  MeshBasicMaterial,
  Mesh,
  AdditiveBlending,
  Float32BufferAttribute,
  LineBasicMaterial,
  RingBufferGeometry,
} from "three";

export class Controller {
  constructor({
    renderer,
    index = 0,
    onConnectedCb = () => {},
    onDisconnectedCb = () => {},
    onSelect = () => {},
    onSelectEnd = () => {},
  }) {
    this.renderer = renderer;
    this.index = index;
    this.controllerGroup = this.renderer.xr.getController(this.index);
    this.onConnectedCb = onConnectedCb;
    this.onDisconnectedCb = onDisconnectedCb;
    this.onSelect = onSelect;
    this.onSelectEnd = onSelectEnd;
    this.init();
  }

  init = () => {
    this.controllerGroup.addEventListener(
      "connected",
      this.onControllerConnected
    );
    this.controllerGroup.addEventListener(
      "disconnected",
      this.onControllerDisconnected
    );
    this.controllerGroup.addEventListener("selectstart", this.onSelect);
    this.controllerGroup.addEventListener("selectend", this.onSelectEnd);
  };

  onControllerConnected = (event) => {
    const { data } = event;
    this.controllerGroup.add(buildController(data));
    this.onConnectedCb(event);
  };

  onControllerDisconnected = (event) => {
    this.controllerGroup.remove(this.children[0]);
    this.onDisconnectedCb(event);
  };

  destroy = () => {
    if (!isNil(this.controllerGroup.parent)) {
      this.controllerGroup.parent.remove(this.controllerGroup);
    }
  };
}

function buildController(data) {
  let geometry, material;

  switch (data.targetRayMode) {
    case "tracked-pointer":
      geometry = new BufferGeometry();
      geometry.setAttribute(
        "position",
        new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3)
      ); // wutt
      geometry.setAttribute(
        "color",
        new Float32BufferAttribute([0.5, 0.5, 5, 0, 0, 0], 3)
      );

      material = new LineBasicMaterial({
        vertexColors: true,
        blending: AdditiveBlending,
        color: 0x090000,
      });

      return new Line(geometry, material);

    case "gaze":
      geometry = new RingBufferGeometry(0.02, 0.04, 32).translate(0, 0, -1);
      material = new MeshBasicMaterial({
        opacity: 0.5,
        transparent: true,
      });
      return new Mesh(geometry, material);
  }
}
