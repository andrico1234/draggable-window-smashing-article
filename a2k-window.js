import { html, css, LitElement } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { DragController } from "./dragController";

export class A2kWindow extends LitElement {
  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("a2k-window", A2kWindow);
