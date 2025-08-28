function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MountRegistry {
  static addMountListener(listener) {
    this.mountListeners.add(listener);
    return () => {
      this.mountListeners.delete(listener);
    };
  }

  static addUnmountListener(listener) {
    this.unmountListeners.add(listener);
    return () => {
      this.unmountListeners.delete(listener);
    };
  }

  static gestureHandlerWillMount(handler) {
    this.mountListeners.forEach(listener => listener(handler));
  }

  static gestureHandlerWillUnmount(handler) {
    this.unmountListeners.forEach(listener => listener(handler));
  }

  static gestureWillMount(gesture) {
    this.mountListeners.forEach(listener => listener(gesture));
  }

  static gestureWillUnmount(gesture) {
    this.unmountListeners.forEach(listener => listener(gesture));
  }

}

_defineProperty(MountRegistry, "mountListeners", new Set());

_defineProperty(MountRegistry, "unmountListeners", new Set());
//# sourceMappingURL=mountRegistry.js.map