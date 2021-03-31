export const COLORS = {
  GREEN: "#80b918",
  DARK_GREEN: "#43aa8b",
  YELLOW: "#f0ff00",
  ORANGE: "#ff6b6b",
  BLUE: "#003566",
  BLACK: "#463f3a",
  WHITE: "#ffffff",
  PINK: "#0077b6",
};

export const gameLevels = [
  {
    level: 1,
    tiles: [
      {
        position: [-2, 0, 0],
        isDestination: true,
        weight: 1,
      },
      {
        position: [-1, 0, 0],
        weight: 1,
      },
      {
        position: [0, 0, 0],
        weight: 1,
      },
      {
        position: [1, 0, 0],
        weight: 1,
      },
      {
        position: [2, 0, 0],
        weight: 1,
        isOrigin: true,
      },
      {
        position: [0, 0, 1],
        weight: 1,
      },
      {
        position: [-1, 0, 1],
        weight: 1,
      },
    ],
  },
  {
    level: 2,
    tiles: [
      {
        position: [0, 0, -3],
        isOrigin: true,
        weight: 1,
      },
      {
        position: [0, 0, -2],
      },
      {
        position: [-1, 0, -2],
      },
      {
        position: [0, 0, -1],
      },
      {
        position: [-1, 0, -1],
      },
      {
        position: [1, 0, -1],
      },
      {
        position: [0, 0, 0],
      },
      {
        position: [1, 0, 0],
      },
      {
        position: [0, 0, 1],
        isDestination: true,
      },
    ],
  },
];

export const DIMENSIONS = {
  TILE: [5, 2, 5],
  GRASS: [5, 0.8, 5],
  CHARACTER: [2, 2, 2],
  HEAL_BUBBLE: [2.5],
};

export const FORCES = {
  GRAVITY: [0, -9.8, 0],
  DROP_FORCE: [-90, -10, -90],
};

export const POSITIONS = {
  GROUND: [0, -80, 0],
};

export const ZERO_MASS = 0;
export const WORLD_UPDATE_FREQUENCY = 1 / 60;

export const EPSILON = 0.1;
export const WIDTH = 5 + EPSILON;
export const HEIGHT_FROM_FLOOR = 5;
