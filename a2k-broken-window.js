import { css, html, LitElement } from "lit";
import { styleMap } from "lit/directives/style-map.js";

export class BrokenWindow extends LitElement {
  static properties = {
    height: {},
    width: {},
    top: {},
    left: {},
  };

  static styles = css`
    #outer-container {
      position: absolute;
      display: flex;
    }

    #middle-container {
      border: var(--border-width) solid var(--color-gray-400);
      box-shadow: 2px 2px var(--color-black);
      background-color: var(--color-gray-500);
    }
  `;

  constructor() {
    super();

    this.height = "";
    this.width = "";
    this.top = "";
    this.left = "";
  }

  render() {
    return html`
      <div
        style=${styleMap({ top: this.top, left: this.left })}
        id="outer-container"
      >
        <div id="middle-container">
          <div
            style=${styleMap({ width: this.width, height: this.height })}
          ></div>
        </div>
      </div>
    `;
  }
}

window.customElements.define("a2k-broken-window", BrokenWindow);
