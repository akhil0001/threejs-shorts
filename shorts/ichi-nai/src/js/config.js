import { Vector3 } from "three";
const WIDTH = 5 + 0.1;
const HEIGHT = 5;

export const COLORS = {
  GREEN: "#80b918",
  DARK_GREEN: "#43aa8b",
  YELLOW: "#f0ff00",
  ORANGE: "#f9844a",
  BLUE: "#003566",
  BLACK: "#463f3a",
};

export const gameLevels = [
  {
    level: 1,
    blocks: [
      {
        position: new Vector3(0, HEIGHT, 0),
        color: COLORS.ORANGE,
        isOrigin: true,
        weight: 1,
      },
      {
        position: new Vector3(WIDTH, HEIGHT, 0),
        color: COLORS.GREEN,
        weight: 1,
      },
      {
        position: new Vector3(WIDTH * 2, HEIGHT, 0),
        color: COLORS.GREEN,
        weight: 1,
      },
      {
        position: new Vector3(WIDTH * 2, HEIGHT, WIDTH * 1),
        color: COLORS.YELLOW,
        weight: 3,
      },
      {
        position: new Vector3(WIDTH * 2, HEIGHT, WIDTH * 2),
        color: COLORS.YELLOW,
        weight: 3,
      },
      {
        position: new Vector3(WIDTH * 1, HEIGHT, WIDTH * 2),
        color: COLORS.GREEN,
        weight: 1,
      },
      {
        position: new Vector3(0, HEIGHT, WIDTH * 2),
        color: COLORS.BLUE,
        isDestination: true,
        weight: 1,
      },
      {
        position: new Vector3(0, HEIGHT, WIDTH * 3),
        color: COLORS.GREEN,
        weight: 1,
      },
    ],
  },
];
