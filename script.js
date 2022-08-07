import "./a2k-window";
import "./a2k-broken-window";

function onWindowDrag(e) {
  const { containerEl } = e.detail;
  const { width, top, left, height } = getComputedStyle(containerEl);

  const newEl = document.createElement("a2k-broken-window");

  newEl.setAttribute("width", width);
  newEl.setAttribute("top", top);
  newEl.setAttribute("left", left);
  newEl.setAttribute("height", height);

  containerEl.insertAdjacentElement("beforebegin", newEl);
}

window.addEventListener("windowDrag", onWindowDrag);
