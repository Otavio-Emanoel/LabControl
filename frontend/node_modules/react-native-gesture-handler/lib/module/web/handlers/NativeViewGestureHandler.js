function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Platform } from 'react-native';
import { State } from '../../State';
import { DEFAULT_TOUCH_SLOP } from '../constants';
import GestureHandler from './GestureHandler';
export default class NativeViewGestureHandler extends GestureHandler {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "buttonRole", void 0);

    _defineProperty(this, "shouldActivateOnStart", false);

    _defineProperty(this, "disallowInterruption", false);

    _defineProperty(this, "startX", 0);

    _defineProperty(this, "startY", 0);

    _defineProperty(this, "minDistSq", DEFAULT_TOUCH_SLOP * DEFAULT_TOUCH_SLOP);
  }

  init(ref, propsRef) {
    super.init(ref, propsRef);
    this.shouldCancelWhenOutside = true;

    if (Platform.OS !== 'web') {
      return;
    }

    const view = this.delegate.view;
    this.restoreViewStyles(view);
    this.buttonRole = view.getAttribute('role') === 'button';
  }

  updateGestureConfig({
    enabled = true,
    ...props
  }) {
    super.updateGestureConfig({
      enabled: enabled,
      ...props
    });

    if (this.config.shouldActivateOnStart !== undefined) {
      this.shouldActivateOnStart = this.config.shouldActivateOnStart;
    }

    if (this.config.disallowInterruption !== undefined) {
      this.disallowInterruption = this.config.disallowInterruption;
    }

    const view = this.delegate.view;
    this.restoreViewStyles(view);
  }

  restoreViewStyles(view) {
    if (!view) {
      return;
    }

    view.style['touchAction'] = 'auto'; // @ts-ignore Turns on defualt touch behavior on Safari

    view.style['WebkitTouchCallout'] = 'auto';
  }

  onPointerDown(event) {
    this.tracker.addToTracker(event);
    super.onPointerDown(event);
    this.newPointerAction();
    this.tryToSendTouchEvent(event);
  }

  onPointerAdd(event) {
    this.tracker.addToTracker(event);
    super.onPointerAdd(event);
    this.newPointerAction();
  }

  newPointerAction() {
    const lastCoords = this.tracker.getAbsoluteCoordsAverage();
    this.startX = lastCoords.x;
    this.startY = lastCoords.y;

    if (this.state !== State.UNDETERMINED) {
      return;
    }

    this.begin();
    const view = this.delegate.view;
    const isRNGHText = view.hasAttribute('rnghtext');

    if (this.buttonRole || isRNGHText) {
      this.activate();
    }
  }

  onPointerMove(event) {
    this.tracker.track(event);
    const lastCoords = this.tracker.getAbsoluteCoordsAverage();
    const dx = this.startX - lastCoords.x;
    const dy = this.startY - lastCoords.y;
    const distSq = dx * dx + dy * dy;

    if (distSq >= this.minDistSq) {
      if (this.buttonRole && this.state === State.ACTIVE) {
        this.cancel();
      } else if (!this.buttonRole && this.state === State.BEGAN) {
        this.activate();
      }
    }
  }

  onPointerLeave() {
    if (this.state === State.BEGAN || this.state === State.ACTIVE) {
      this.cancel();
    }
  }

  onPointerUp(event) {
    super.onPointerUp(event);
    this.onUp(event);
  }

  onPointerRemove(event) {
    super.onPointerRemove(event);
    this.onUp(event);
  }

  onUp(event) {
    this.tracker.removeFromTracker(event.pointerId);

    if (this.tracker.trackedPointersCount === 0) {
      if (this.state === State.ACTIVE) {
        this.end();
      } else {
        this.fail();
      }
    }
  }

  shouldRecognizeSimultaneously(handler) {
    if (super.shouldRecognizeSimultaneously(handler)) {
      return true;
    }

    if (handler instanceof NativeViewGestureHandler && handler.state === State.ACTIVE && handler.disallowsInterruption()) {
      return false;
    }

    const canBeInterrupted = !this.disallowInterruption;

    if (this.state === State.ACTIVE && handler.state === State.ACTIVE && canBeInterrupted) {
      return false;
    }

    return this.state === State.ACTIVE && canBeInterrupted && handler.handlerTag > 0;
  }

  shouldBeCancelledByOther(_handler) {
    return !this.disallowInterruption;
  }

  disallowsInterruption() {
    return this.disallowInterruption;
  }

  isButton() {
    return this.buttonRole;
  }

}
//# sourceMappingURL=NativeViewGestureHandler.js.map