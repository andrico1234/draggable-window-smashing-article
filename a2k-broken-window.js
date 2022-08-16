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

  render() {
    return html`
      <div
        style=${styleMap({
          transform: `translate(${this.left}px, ${this.top}px)`,
        })}
        id="outer-container"
      >
        <div id="middle-container">
          <div
            style=${styleMap({
              width: `${this.width}px`,
              height: `${this.height}px`,
            })}
          ></div>
        </div>
      </div>
    `;
  }
}

window.customElements.define("a2k-broken-window", BrokenWindow);
