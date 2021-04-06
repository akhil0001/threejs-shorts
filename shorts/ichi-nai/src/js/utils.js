import { Vector3 } from "three";
import { DIMENSIONS } from "./config";

const addVec = new Vector3(0, DIMENSIONS.GRASS[1] / 4, 0);

export const adjustTileBodyPosition = ({ posVec }) =>
  posVec.clone().add(addVec);
