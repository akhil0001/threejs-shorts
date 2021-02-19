import { AmbientLight, DirectionalLight } from "three";
import { FLAT_COLORS } from "./utils";

export function addLights({ scene }) {
  const lights = {};
  const ambientLight = new AmbientLight(FLAT_COLORS.WHITE, 0.8);
  const directionalLight = new DirectionalLight(FLAT_COLORS.CLOUDS, 0.8);
  directionalLight.position.set(-1, 10, -10);
  directionalLight.castShadow = true;

  scene.add(ambientLight);
  scene.add(directionalLight);
  lights.ambientLight = ambientLight;
  lights.directionalLight = directionalLight;
  return { lights };
}
