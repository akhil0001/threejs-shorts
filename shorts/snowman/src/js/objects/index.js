import {
  BoxBufferGeometry,
  CylinderBufferGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  SphereBufferGeometry,
  Vector3,
} from "three";
import { FLAT_COLORS, originToBottom } from "../utils";
import anime from "animejs";
const baseGeom = new SphereBufferGeometry(0.25);
const baseMat = new MeshLambertMaterial({
  color: FLAT_COLORS.CLOUDS,
});

const bodyGeom = new SphereBufferGeometry(0.2);
const faceGeom = new SphereBufferGeometry(0.15);

const eyesGeom = new SphereBufferGeometry(0.01);
const eyesMat = new MeshLambertMaterial({
  color: FLAT_COLORS.WETASPHALT,
});

const noseGeometry = new CylinderBufferGeometry(0.03, 0.01, 0.2, 10);
const noseMaterial = new MeshLambertMaterial({
  color: FLAT_COLORS.CARROT,
});

const capBaseGeom = new BoxBufferGeometry(0.2, 0.01, 0.2);
const capBaseMat = new MeshLambertMaterial({
  color: FLAT_COLORS.MIDNIGHT_BLUE,
});

const capGeom = new BoxBufferGeometry(0.15, 0.25, 0.15);

const handsConnectionGeom = new BoxBufferGeometry(0.01, 0.8, 0.01);
const handsGeom = new BoxBufferGeometry(0.01, 0.2, 0.01);
const handsMat = new MeshLambertMaterial({
  color: FLAT_COLORS.POMEGRANATE,
});

class Hands extends Group {
  constructor() {
    super();
    this.addHands();
    this.castShadow = true;
  }

  addHands = () => {
    this.handsConnection = new Mesh(handsConnectionGeom, handsMat);
    this.add(this.handsConnection);
    this.handOne = new Mesh(handsGeom, handsMat);
    this.handTwo = this.handOne.clone();
    this.handOne.position.set(-0.1, 0.38, 0);
    this.handTwo.position.set(0.1, -0.38, 0);
    this.handTwo.rotateZ(-Math.PI / 2);
    this.handOne.rotateZ(-Math.PI / 2);
    this.handsConnection.add(this.handOne, this.handTwo);
    this.handsConnection.scale.set(1, 0, 1);
    this.animate();
  };

  animate = () => {
    const timeLine = anime.timeline({
      easing: "linear",
    });

    timeLine
      .add({
        targets: [
          this.handsConnection.scale,
          this.handOne.scale,
          this.handTwo.scale,
        ],
        y: 1,
        delay: 2000,
      })
      .add({
        targets: this.handsConnection.rotation,
        y: 10,
        duration: 10000,
      });
  };
}

class Cap extends Mesh {
  constructor({ position }) {
    super(capBaseGeom, capBaseMat);
    this.position.copy(position);
    this.scale.set(0, 0, 1);
    this.animateCapBase();
    this.createCap();
    this.castShadow = true;
  }

  createCap = () => {
    this.cap = new Mesh(capGeom, capBaseMat);
    this.cap.castShadow = true;
    originToBottom(capGeom);
    this.add(this.cap);
  };

  animateCapBase = () => {
    const myTimeline = anime.timeline({
      easing: "linear",
    });
    myTimeline
      .add({
        targets: this.scale,
        x: 1,
        duration: 50,
        delay: 1500,
      })
      .add({
        targets: this.scale,
        y: 1,
        duration: 400,
      });
  };
}

class Nose extends Mesh {
  constructor({ position }) {
    super(noseGeometry, noseMaterial);
    this.position.copy(position);
    this.rotateZ(-Math.PI / 2);
    this.attachAnimation();
    this.castShadow = true;
  }

  attachAnimation = () => {
    anime({
      targets: this.position,
      x: -0.15,
      easing: "linear",
      delay: 1000,
      duration: 300,
    });
  };
}

class Eyes extends Group {
  constructor() {
    super();
    this.init();
    this.castShadow = true;
  }

  init = () => {
    this.eyeOne = new Mesh(eyesGeom, eyesMat);
    this.eyeTwo = this.eyeOne.clone();
    this.eyeOne.position.set(-0.18, 0.05, -0.05);
    this.eyeTwo.position.set(-0.18, 0.05, 0.05);
    this.add(this.eyeOne, this.eyeTwo);
    this.position.setX(0.2);
    this.attachAnimation();
  };

  attachAnimation = () => {
    anime({
      targets: this.position,
      x: 0.05,
      duration: 800,
      easing: "linear",
    });
    anime({
      targets: [this.eyeTwo.scale, this.eyeOne.scale],
      y: 0.1,
      loop: true,
      delay: 2000,
      duration: 500,
      direction: "alternate",
      easing: "easeInOutSine",
    });
  };
}
class Face extends Mesh {
  constructor({ position }) {
    super(faceGeom, baseMat);
    this.position.copy(position);
    this.scale.set(1, 0, 1);
    this.eyes = new Eyes();
    this.nose = new Nose({ position: new Vector3(0, 0.02, 0) });
    this.cap = new Cap({ position: new Vector3(0, 0.12, 0) });
    this.add(this.eyes);
    this.add(this.nose);
    this.add(this.cap);
    this.attachAnimation();
    this.castShadow = true;
  }

  attachAnimation = () => {
    anime({
      targets: this.scale,
      y: 1,
      delay: 200,
      duration: 300,
      easing: "linear",
    });
  };
}
class Body extends Mesh {
  constructor({ position }) {
    super(bodyGeom, baseMat);
    originToBottom(bodyGeom);
    this.position.copy(position);
    this.scale.set(1, 0, 1);
    this.face = new Face({
      position: new Vector3(0, 0.4, 0),
    });
    this.hands = new Hands();
    this.hands.rotateX(-Math.PI / 2);
    this.hands.rotateY(-Math.PI / 3);
    this.hands.position.set(0, 0.25, 0);
    this.add(this.hands);
    this.add(this.face);
    this.castShadow = true;
    this.attachAnimation();
  }

  attachAnimation = () => {
    anime({
      targets: this.scale,
      y: 1,
      delay: 100,
      duration: 300,
      easing: "linear",
    });
  };
}
class Base extends Mesh {
  constructor({ position }) {
    super(baseGeom, baseMat);
    this.position.copy(position);
    originToBottom(baseGeom);
    this.scale.set(1, 0, 1);
    this.attachAnimation();
    this.body = new Body({
      position: new Vector3(0, 0.2, 0),
    });
    this.add(this.body);
    this.castShadow = true;
  }

  attachAnimation = () => {
    anime({
      targets: this.scale,
      y: 1,
      duration: 300,
      easing: "linear",
    });
  };
}

export class SnowMan extends Group {
  constructor({ onComplete }) {
    super();
    this.onComplete = onComplete;
    this.init();
  }

  init = () => {
    this.base = new Base({
      position: new Vector3(0, 0, 0),
    });
    this.add(this.base);
    anime({
      targets: this.base.position,
      x: -5,
      duration: 3000,
      delay: 4000,
      easing: "easeInBack",
      complete: () => {
        this.onComplete();
      },
    });
  };
}
