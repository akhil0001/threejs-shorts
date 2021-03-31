import anime from "animejs";

const levelTitle = document.querySelector("#title");

export function showupLevel({ text, completeCb }) {
  levelTitle.textContent = text;
  levelTitle.innerHTML = levelTitle.textContent.replace(
    /\S/g,
    "<span class='letter'>$&</span>"
  );

  anime.timeline().add({
    targets: "#title .letter",
    opacity: [0, 1],
    easing: "easeInOutQuad",
    duration: 2250,
    delay: (el, i) => 150 * (i + 1),
    complete: () => completeCb(),
  });
}
