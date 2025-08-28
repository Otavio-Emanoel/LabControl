function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import EventManager from './EventManager';
import { EventTypes } from '../interfaces';
import { PointerType } from '../../PointerType';
export default class WheelEventManager extends EventManager {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "wheelDelta", {
      x: 0,
      y: 0
    });

    _defineProperty(this, "resetDelta", _event => {
      this.wheelDelta = {
        x: 0,
        y: 0
      };
    });

    _defineProperty(this, "wheelCallback", event => {
      this.wheelDelta.x += event.deltaX;
      this.wheelDelta.y += event.deltaY;
      const adaptedEvent = this.mapEvent(event);
      this.onWheel(adaptedEvent);
    });
  }

  registerListeners() {
    this.view.addEventListener('pointermove', this.resetDelta);
    this.view.addEventListener('wheel', this.wheelCallback);
  }

  unregisterListeners() {
    this.view.removeEventListener('pointermove', this.resetDelta);
    this.view.removeEventListener('wheel', this.wheelCallback);
  }

  mapEvent(event) {
    return {
      x: event.clientX + this.wheelDelta.x,
      y: event.clientY + this.wheelDelta.y,
      offsetX: event.offsetX - event.deltaX,
      offsetY: event.offsetY - event.deltaY,
      pointerId: -1,
      eventType: EventTypes.MOVE,
      pointerType: PointerType.OTHER,
      time: event.timeStamp,
      // @ts-ignore It does exist, but it's deprecated
      wheelDeltaY: event.wheelDeltaY
    };
  }

  resetManager() {
    super.resetManager();
  }

}
//# sourceMappingURL=WheelEventManager.js.map