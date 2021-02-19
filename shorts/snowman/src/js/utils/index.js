/**
 * Colors
 */

export const FLAT_COLORS = {
  PETER_RIVER: 0x3498db,
  WETASPHALT: 0x34495e,
  BELIZEHOLE: 0x2980b9,
  MIDNIGHT_BLUE: 0x2c3e50,
  CARROT: 0xe67e22,
  CLOUDS: 0xecf0f1,
  POMEGRANATE: 0xc0392b,
  WHITE: 0xffffff,
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
