// import anime from "animejs";
// import * as CANNON from "cannon-es";
// import { floor, random } from "lodash";
// import {
//   BoxBufferGeometry,
//   Color,
//   Group,
//   Mesh,
//   MeshBasicMaterial,
//   Vector3,
// } from "three";
// import { FLAT_COLORS } from "../utils";

// export const LANE_DEPTH = 8;
// const LANE_WIDTH = window.innerWidth / 7;
// const LANE_HEIGHT = 0.2;
// const epsilon = 0.5;
// const BRANCH_WIDTH = 3;
// const LANE_COLUMNS = floor(LANE_WIDTH / (BRANCH_WIDTH + 2));
// const MAX_NUM_TREES = LANE_COLUMNS / 2;
// const MAX_NUM_LOGS = 15;
// const MAX_LOG_SPEED = 0.005;
// const LOG_DEPTH = LANE_DEPTH / 3;
// const LOG_WIDTH = LANE_WIDTH / 12;
// const LOG_HEIGHT = LANE_HEIGHT * 8;

// export const LANE_TYPES = {
//   LAND: "LAND",
//   WATER: "WATER",
// };

// const laneGeom = new BoxBufferGeometry(
//   LANE_WIDTH,
//   LANE_HEIGHT,
//   LANE_DEPTH - epsilon
// );
// const laneMat = new MeshBasicMaterial({
//   color: FLAT_COLORS.MIDNIGHT_BLUE,
// });

// const LOG_TYPE_WIDTH = {
//   SMALL: 4,
//   MEDIUM: 6,
//   LARGE: 8,
// };

// export class Lane extends Mesh {
//   constructor({ position, type = LANE_TYPES.WATER, world }) {
//     super(laneGeom, laneMat);
//     this.type = type;
//     this.laneSpeed = 0;
//     this.logs = [];
//     this.world = world;
//     this.position.copy(position);
//     this.init();
//   }

//   init = () => {
//     this.userData.logs = [];
//     this.position.copy(this.position);
//     if (this.type === LANE_TYPES.LAND) {
//       this.material = laneMat.clone();
//       this.material.color = new Color(FLAT_COLORS.GREENSEA);
//       this.addTrees();
//     }
//     if (this.type === LANE_TYPES.WATER) {
//       this.logDirection = Math.random() >= 0.5 ? "RIGHT" : "LEFT";
//       this.addLogs({
//         direction: this.logDirection,
//       });
//       this.laneSpeed = MAX_LOG_SPEED;
//     }
//   };

//   addTrees = () => {
//     const numOfTrees = random(6, MAX_NUM_TREES);
//     const treePositions = new Set();
//     let randomPosition = null;
//     let randomColumn = 0;
//     const startPoint = -LANE_WIDTH / 2;
//     for (let i = 0; i < numOfTrees; i++) {
//       const tree = new Tree();
//       do {
//         randomColumn = random(0, LANE_COLUMNS);
//         randomPosition = startPoint + randomColumn * (BRANCH_WIDTH + 2);
//       } while (treePositions.has(randomColumn));
//       treePositions.add(randomColumn);
//       tree.position.setX(randomPosition);
//       this.add(tree);
//     }
//   };

//   addLogs = ({ direction }) => {
//     const numOfLogs = random(5, MAX_NUM_LOGS);
//     this.logPositions = new Set();
//     let randomPosition = null;
//     this.endPosition = direction === "RIGHT" ? LANE_WIDTH / 2 : -LANE_WIDTH / 2;
//     for (let i = 0; i < numOfLogs; i++) {
//       do {
//         randomPosition =
//           direction === "RIGHT"
//             ? random(-LANE_WIDTH / 2, LANE_WIDTH / 2)
//             : -random(-LANE_WIDTH / 2, LANE_WIDTH / 2);
//       } while (this.logPositions.has(randomPosition));
//       const log = new Log({
//         direction,
//         world: this.world,
//         position: new Vector3(randomPosition, this.position.y, this.position.z),
//       });
//       this.logPositions.add(randomPosition);
//       const distanceToBeTravelled = Math.abs(this.endPosition - randomPosition);
//       const duration = distanceToBeTravelled / MAX_LOG_SPEED;
//       // log.scale.set(random(0.2, 0.4), 1, 1);
//       // log.animate({
//       //   duration,
//       //   onComplete: this.onLogTravelComplete,
//       // });
//       this.logs.push(log);
//       this.log = log;
//     }
//   };

//   onLogTravelComplete = (log) => {
//     let randomPosition = null;
//     do {
//       randomPosition =
//         this.logDirection === "RIGHT"
//           ? random(-LANE_WIDTH / 2, LANE_WIDTH / 2)
//           : -random(-LANE_WIDTH / 2, LANE_WIDTH / 2);
//     } while (this.logPositions.has(randomPosition));
//     log.position.setX(randomPosition);
//     this.logPositions.add(randomPosition);
//     const distanceToBeTravelled = Math.abs(this.endPosition - randomPosition);
//     const duration = distanceToBeTravelled / MAX_LOG_SPEED;
//     log.animate({
//       duration,
//       onComplete: this.onLogTravelComplete,
//     });
//   };

//   dispose = () => {
//     this.parent.remove(this);
//     this.geometry.dispose();
//     this.material.dispose();
//     this.children.forEach((child) => {
//       console.log(child.name);
//       if (child.material) {
//         child.material.dispose();
//       }
//       if (child.geometry) {
//         child.geometry.dispose();
//       }
//     });
//   };
// }

// class Tree extends Group {
//   constructor() {
//     super();
//     this.TRUNK_WIDTH = 1;
//     this.TRUNK_HEIGHT = random(2, 5);

//     this.BRANCH_HEIGHT = random(3, 8);
//     this.init();
//   }

//   init = () => {
//     const trunkGeom = new BoxBufferGeometry(
//       this.TRUNK_WIDTH,
//       this.TRUNK_HEIGHT,
//       this.TRUNK_WIDTH
//     );
//     const trunkMat = new MeshBasicMaterial({
//       color: FLAT_COLORS.PUMPKIN,
//     });
//     this.trunk = new Mesh(trunkGeom, trunkMat);

//     const branchGeom = new BoxBufferGeometry(
//       BRANCH_WIDTH,
//       this.BRANCH_HEIGHT,
//       BRANCH_WIDTH
//     );
//     const branchMat = new MeshBasicMaterial({
//       color: FLAT_COLORS.SUNFLOWER,
//     });
//     this.trunk.position.setY(this.TRUNK_HEIGHT / 2);

//     this.branch = new Mesh(branchGeom, branchMat);
//     this.branch.position.setY(this.TRUNK_HEIGHT + this.BRANCH_HEIGHT / 2);
//     this.add(this.branch, this.trunk);
//   };
// }

// const logGeom = new BoxBufferGeometry(
//   LOG_TYPE_WIDTH.SMALL,
//   LOG_HEIGHT,
//   LOG_DEPTH
// );
// const logMat = new MeshBasicMaterial({
//   color: FLAT_COLORS.ALIZAIN,
// });

// class Log extends Mesh {
//   constructor({ direction, world, position }) {
//     super(logGeom, logMat);
//     this.direction = direction;
//     this.speed = MAX_LOG_SPEED;
//     this.world = world;
//     this.userData.position = position;
//     this.init();
//   }

//   init = () => {
//     this.name = "log";
//     this.position.copy(this.userData.position);
//     this.addShape();
//     // this.position.set(
//     //   this.direction === "RIGHT" ? -LANE_WIDTH / 2 : LANE_WIDTH / 2,
//     //   LOG_HEIGHT / 2,
//     //   0
//     // );
//   };

//   addShape = () => {
//     this.logShape = new CANNON.Box(
//       new CANNON.Vec3(LOG_TYPE_WIDTH.SMALL / 2, LOG_HEIGHT / 2, LOG_DEPTH / 2)
//     );
//     this.logBody = new CANNON.Body({
//       mass: 1,
//       type: CANNON.BODY_TYPES.STATIC,
//     });
//     this.logBody.addShape(this.logShape);
//     this.logBody.position.copy(this.userData.position);
//     this.world.addBody(this.logBody);
//   };

//   animate = ({ duration, onComplete }) => {
//     const log = this;
//     anime({
//       targets: this.position,
//       x: this.direction === "RIGHT" ? LANE_WIDTH / 2 : -LANE_WIDTH / 2,
//       duration: duration,
//       easing: "linear",
//       complete: function () {
//         onComplete(log);
//       },
//     });
//   };
// }
