import anime from "animejs";
import { ANIMATION_TIMINGS, POSITIONS, SHOULD_ANIMATION_PLAY } from "./config";

const levelEl = document.querySelector(".level");

export function reduceTitleAndMoveItUp() {
  anime.timeline().add({
    targets: ".title",
    top: "0%",
    fontSize: "2vmax",
    easing: "easeInOutQuad",
    duration: 500,
    delay: 1000,
  });
}

export function showupLevel({ text, completeCb }) {
  if (SHOULD_ANIMATION_PLAY) {
    completeCb();
  }
  levelEl.textContent = text;
  levelEl.innerHTML = levelEl.textContent.replace(
    /\S/g,
    "<span class='letter'>$&</span>"
  );

  anime.timeline().add({
    targets: "#level .letter",
    opacity: [0, 1],
    easing: "easeInOutQuad",
    duration: 2250,
    delay: (el, i) => 150 * (i + 1),
    complete: () => completeCb(),
  });
}
