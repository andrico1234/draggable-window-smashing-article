import { noChange } from "lit";
import { Directive, directive, PartType } from "lit/directive.js";
import PointerTracker from "pointer-tracker";

class DragDirective extends Directive {
  hasInitialised = false;

  update(part, args) {
    if (this.hasInitialised) return;

    const draggableElement = part.element;
    const [dragController, pointerTrackerOptions] = args;

    draggableElement.setAttribute("data-dragging", "idle");
    dragController.draggableElement = draggableElement;

    dragController.pointerTracker = new PointerTracker(draggableElement, {
      start(...args) {
        pointerTrackerOptions.start(...args);
        draggableElement.setAttribute("data-dragging", "dragging");
        return true;
      },
      move(...args) {
        pointerTrackerOptions.move(...args);
      },
      end(...args) {
        draggableElement.setAttribute("data-dragging", "idle");
      },
    });

    this.hasInitialised = true;
  }

  render() {
    return noChange;
  }
}

const dragDirective = directive(DragDirective);

export class DragController {
  styles = {
    position: "absolute",
    top: "0px",
    left: "0px",
  };

  constructor(host, options) {
    const { containerId = "" } = options;

    this.host = host;
    this.host.addController(this);
    this.containerId = containerId;
  }

  hostDisconnected() {
    if (this.pointerTracker) {
      this.pointerTracker.stop();
    }
  }

  applyDrag() {
    return dragDirective(this, {
      start: this.#onDragStart,
      move: this.#onDrag,
    });
  }

  updateElPosition(x, y) {
    this.styles = {
      ...this.styles,
      left: x,
      top: y,
    };
  }

  calculateWindowPosition(pointer) {
    const el = this.draggableElement;
    const containerEl = this.host.shadowRoot?.querySelector(this.containerId);

    if (!el || !containerEl) return;

    const { top, left } = this.styles;

    // These values exist as strings on the styles object, we need to parse them as numbers
    const parsedTop = Number(top?.replace("px", ""));
    const parsedLeft = Number(left?.replace("px", ""));

    // JavaScript's floats can be weird, so we're flooring these to integers
    const cursorPositionX = Math.floor(pointer.pageX);
    const cursorPositionY = Math.floor(pointer.pageY);

    const hasCursorMoved =
      cursorPositionX !== this.cursorPositionX ||
      cursorPositionY !== this.cursorPositionY;

    // We only need to do calculate window position if the cursor position has changed
    if (hasCursorMoved) {
      const { bottom, height } = el.getBoundingClientRect();
      const { right, width } = containerEl.getBoundingClientRect();

      // The difference between the cursor's previous position and its current position
      const xDelta = cursorPositionX - this.cursorPositionX;
      const yDelta = cursorPositionY - this.cursorPositionY;

      const { availWidth, availHeight } = screen;

      const outOfBoundsTop = parsedTop + yDelta < 0;
      const outOfBoundsLeft = parsedLeft + xDelta < 0;
      const outOfBoundsBottom = bottom + yDelta > availHeight;
      const outOfBoundsRight = right + xDelta >= availWidth;

      const isOutOfBounds =
        outOfBoundsBottom ||
        outOfBoundsLeft ||
        outOfBoundsRight ||
        outOfBoundsTop;

      // Set the cursor positions for the next time this function is invoked
      this.cursorPositionX = cursorPositionX;
      this.cursorPositionY = cursorPositionY;

      // The happy path, if the draggable element doesn't attempt to go beyond the browser's boundaries
      if (!isOutOfBounds) {
        const top = `${parsedTop + yDelta}px`;
        const left = `${parsedLeft + xDelta}px`;

        this.updateElPosition(left, top);
      } else {
        // Otherwise we force the window to remain within the browser window
        if (outOfBoundsTop) {
          const left = `${parsedLeft + xDelta}px`;

          this.updateElPosition(left, "0px");
        } else if (outOfBoundsLeft) {
          const top = `${parsedTop + yDelta}px`;

          this.updateElPosition("0px", top);
        } else if (outOfBoundsBottom) {
          const top = `${availableHeight - height}px`;
          const left = `${parsedLeft + xDelta}px`;

          this.updateElPosition(left, top);
        } else if (outOfBoundsRight) {
          const top = `${parsedTop + yDelta}px`;
          const left = `${Math.floor(availableWidth - width)}px`;

          this.updateElPosition(left, top);
        }
      }

      // We trigger a lifecycle update
      this.host.requestUpdate();
    }
  }

  #onDragStart = (pointer, ev) => {
    this.cursorPositionX = Math.floor(pointer.pageX);
    this.cursorPositionY = Math.floor(pointer.pageY);
  };

  #onDrag = (_, pointers) => {
    const el = this.draggableElement;
    const containerEl = this.host.shadowRoot?.querySelector(this.containerId);

    const event = new CustomEvent("windowDrag", {
      bubbles: true,
      composed: true,
      detail: {
        pointer: pointers[0],
        containerEl,
        draggableEl: el,
      },
    });

    this.host.dispatchEvent(event);
    this.calculateWindowPosition(pointers[0]);
  };
}
