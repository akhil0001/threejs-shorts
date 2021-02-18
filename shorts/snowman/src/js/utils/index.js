import { random } from "lodash";
import { Color } from "three";
/**
 * Colors
 */

export const FLAT_COLORS = {
  TURQOISE: 0x1abc9c,
  EMERALD: 0x2ecc71,
  PETER_RIVER: 0x3498db,
  AMETHYST: 0x9b59b6,
  WETASPHALT: 0x34495e,
  GREENSEA: 0x16a085,
  NEPHRITIS: 0x27ae60,
  BELIZEHOLE: 0x2980b9,
  WISTERIA: 0x8e44ad,
  MIDNIGHT_BLUE: 0x2c3e50,
  SUNFLOWER: 0xf1c40f,
  CARROT: 0xe67e22,
  ALIZAIN: 0xe74c3c,
  CLOUDS: 0xecf0f1,
  CONCRETE: 0x95a5a6,
  ORANGE: 0xf39c12,
  PUMPKIN: 0xd35400,
  POMEGRANATE: 0xc0392b,
  SILVER: 0xbdc3c7,
  ASBESTOS: 0x7f8c8d,
  WHITE: 0xffffff,
  LIGHT_GREY: 0xd4d4d4,
  BLACK: 0x000000,
};

export const generateRandomColor = () => {
  const randomColor = `hsl(${random(0, 360)},${random(25, 100)}%, 35%)`;
  return new Color(randomColor);
};

// https://stackoverflow.com/questions/33454919/scaling-a-three-js-geometry-only-up/33462018
export function originToBottom(geometry) {
  const shift = geometry.boundingBox
    ? geometry.boundingBox.min.y
    : (geometry.computeBoundingBox(), geometry.boundingBox.min.y);

  // 2. Then you translate all your vertices up
  // so the vertical origin is the bottom of the feet :
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    geometry.attributes.position[i] -= shift;
  }
  // or as threejs implements (WestLangley's answer) :
  geometry.translate(0, -shift, 0);

  // finally
  geometry.verticesNeedUpdate = true;
}
