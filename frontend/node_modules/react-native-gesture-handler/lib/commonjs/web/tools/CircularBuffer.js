"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class CircularBuffer {
  constructor(size) {
    _defineProperty(this, "capacity", void 0);

    _defineProperty(this, "buffer", void 0);

    _defineProperty(this, "index", void 0);

    _defineProperty(this, "_size", void 0);

    this.capacity = size;
    this.buffer = new Array(size);
    this.index = 0;
    this._size = 0;
  }

  push(element) {
    this.buffer[this.index] = element;
    this.index = (this.index + 1) % this.capacity;
    this._size = Math.min(this.size + 1, this.capacity);
  }

  get(at) {
    if (this._size === this.capacity) {
      let index = (this.index + at) % this.capacity;

      if (index < 0) {
        index += this.capacity;
      }

      return this.buffer[index];
    } else {
      return this.buffer[at];
    }
  }

  clear() {
    this.buffer = new Array(this.capacity);
    this.index = 0;
    this._size = 0;
  }

  get size() {
    return this._size;
  }

}

exports.default = CircularBuffer;
//# sourceMappingURL=CircularBuffer.js.map