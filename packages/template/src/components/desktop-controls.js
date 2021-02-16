import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export const addDesktopControls = (camera, renderer) => {
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.update();
  return {
    orbitControls,
  };
};
