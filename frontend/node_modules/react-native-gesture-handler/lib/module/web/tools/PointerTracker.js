function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import VelocityTracker from './VelocityTracker';
const MAX_POINTERS = 20;
export default class PointerTracker {
  constructor() {
    _defineProperty(this, "velocityTracker", new VelocityTracker());

    _defineProperty(this, "_trackedPointers", new Map());

    _defineProperty(this, "touchEventsIds", new Map());

    _defineProperty(this, "lastMovedPointerId", void 0);

    _defineProperty(this, "cachedAbsoluteAverages", {
      x: 0,
      y: 0
    });

    _defineProperty(this, "cachedRelativeAverages", {
      x: 0,
      y: 0
    });

    this.lastMovedPointerId = NaN;

    for (let i = 0; i < MAX_POINTERS; ++i) {
      this.touchEventsIds.set(i, NaN);
    }
  }

  addToTracker(event) {
    if (this.trackedPointers.has(event.pointerId)) {
      return;
    }

    this.lastMovedPointerId = event.pointerId;
    const newElement = {
      abosoluteCoords: {
        x: event.x,
        y: event.y
      },
      relativeCoords: {
        x: event.offsetX,
        y: event.offsetY
      },
      timestamp: event.time,
      velocityX: 0,
      velocityY: 0
    };
    this.trackedPointers.set(event.pointerId, newElement);
    this.mapTouchEventId(event.pointerId);
    this.cachedAbsoluteAverages = this.getAbsoluteCoordsAverage();
    this.cachedRelativeAverages = this.getRelativeCoordsAverage();
  }

  removeFromTracker(pointerId) {
    this.trackedPointers.delete(pointerId);
    this.removeMappedTouchId(pointerId);
  }

  track(event) {
    const element = this.trackedPointers.get(event.pointerId);

    if (!element) {
      return;
    }

    this.lastMovedPointerId = event.pointerId;
    this.velocityTracker.add(event);
    const [velocityX, velocityY] = this.velocityTracker.velocity;
    element.velocityX = velocityX;
    element.velocityY = velocityY;
    element.abosoluteCoords = {
      x: event.x,
      y: event.y
    };
    element.relativeCoords = {
      x: event.offsetX,
      y: event.offsetY
    };
    this.trackedPointers.set(event.pointerId, element);
    this.cachedAbsoluteAverages = this.getAbsoluteCoordsAverage();
    this.cachedRelativeAverages = this.getRelativeCoordsAverage();
  } // Mapping TouchEvents ID


  mapTouchEventId(id) {
    for (const [mappedId, touchId] of this.touchEventsIds) {
      if (isNaN(touchId)) {
        this.touchEventsIds.set(mappedId, id);
        break;
      }
    }
  }

  removeMappedTouchId(id) {
    const mappedId = this.getMappedTouchEventId(id);

    if (!isNaN(mappedId)) {
      this.touchEventsIds.set(mappedId, NaN);
    }
  }

  getMappedTouchEventId(touchEventId) {
    for (const [key, value] of this.touchEventsIds.entries()) {
      if (value === touchEventId) {
        return key;
      }
    }

    return NaN;
  }

  getVelocity(pointerId) {
    var _this$trackedPointers, _this$trackedPointers2;

    return {
      x: (_this$trackedPointers = this.trackedPointers.get(pointerId)) === null || _this$trackedPointers === void 0 ? void 0 : _this$trackedPointers.velocityX,
      y: (_this$trackedPointers2 = this.trackedPointers.get(pointerId)) === null || _this$trackedPointers2 === void 0 ? void 0 : _this$trackedPointers2.velocityY
    };
  }

  getLastAbsoluteCoords(pointerId) {
    var _this$trackedPointers3;

    return (_this$trackedPointers3 = this.trackedPointers.get(pointerId !== null && pointerId !== void 0 ? pointerId : this.lastMovedPointerId)) === null || _this$trackedPointers3 === void 0 ? void 0 : _this$trackedPointers3.abosoluteCoords;
  }

  getLastRelativeCoords(pointerId) {
    var _this$trackedPointers4;

    return (_this$trackedPointers4 = this.trackedPointers.get(pointerId !== null && pointerId !== void 0 ? pointerId : this.lastMovedPointerId)) === null || _this$trackedPointers4 === void 0 ? void 0 : _this$trackedPointers4.relativeCoords;
  } // Some handlers use these methods to send average values in native event.
  // This may happen when pointers have already been removed from tracker (i.e. pointerup event).
  // In situation when NaN would be sent as a response, we return cached value.
  // That prevents handlers from crashing


  getAbsoluteCoordsAverage() {
    const coordsSum = this.getAbsoluteCoordsSum();
    const avgX = coordsSum.x / this.trackedPointers.size;
    const avgY = coordsSum.y / this.trackedPointers.size;
    const averages = {
      x: isNaN(avgX) ? this.cachedAbsoluteAverages.x : avgX,
      y: isNaN(avgY) ? this.cachedAbsoluteAverages.y : avgY
    };
    return averages;
  }

  getRelativeCoordsAverage() {
    const coordsSum = this.getRelativeCoordsSum();
    const avgX = coordsSum.x / this.trackedPointers.size;
    const avgY = coordsSum.y / this.trackedPointers.size;
    const averages = {
      x: isNaN(avgX) ? this.cachedRelativeAverages.x : avgX,
      y: isNaN(avgY) ? this.cachedRelativeAverages.y : avgY
    };
    return averages;
  }

  getAbsoluteCoordsSum(ignoredPointer) {
    const sum = {
      x: 0,
      y: 0
    };
    this.trackedPointers.forEach((value, key) => {
      if (key !== ignoredPointer) {
        sum.x += value.abosoluteCoords.x;
        sum.y += value.abosoluteCoords.y;
      }
    });
    return sum;
  }

  getRelativeCoordsSum(ignoredPointer) {
    const sum = {
      x: 0,
      y: 0
    };
    this.trackedPointers.forEach((value, key) => {
      if (key !== ignoredPointer) {
        sum.x += value.relativeCoords.x;
        sum.y += value.relativeCoords.y;
      }
    });
    return sum;
  }

  resetTracker() {
    this.velocityTracker.reset();
    this.trackedPointers.clear();
    this.lastMovedPointerId = NaN;

    for (let i = 0; i < MAX_POINTERS; ++i) {
      this.touchEventsIds.set(i, NaN);
    }
  }

  static shareCommonPointers(stPointers, ndPointers) {
    return stPointers.some(pointerId => ndPointers.includes(pointerId));
  }

  get trackedPointersCount() {
    return this.trackedPointers.size;
  }

  get trackedPointersIDs() {
    const keys = [];
    this.trackedPointers.forEach((_value, key) => {
      keys.push(key);
    });
    return keys;
  }

  get trackedPointers() {
    return this._trackedPointers;
  }

}
//# sourceMappingURL=PointerTracker.js.map