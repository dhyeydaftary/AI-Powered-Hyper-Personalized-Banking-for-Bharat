import '@testing-library/jest-dom/vitest';

// recharts' ResponsiveContainer requires ResizeObserver, which jsdom does
// not implement. A minimal no-op stub is enough for tests that only assert
// on rendered content, not real layout measurement.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  // @ts-expect-error -- test-only polyfill
  globalThis.ResizeObserver = ResizeObserverStub;
}

// jsdom has no PointerEvent constructor at all, which changes how
// @testing-library/user-event simulates clicks and can leave Radix UI's
// pointer-driven primitives (Select, Dialog triggers) never seeing the
// event they're listening for. A minimal polyfill built on MouseEvent is
// the standard workaround for this combination.
if (typeof globalThis.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    public pointerId: number;
    public pointerType: string;
    public isPrimary: boolean;
    public width: number;
    public height: number;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.pointerType = params.pointerType ?? 'mouse';
      this.isPrimary = params.isPrimary ?? true;
      this.width = params.width ?? 1;
      this.height = params.height ?? 1;
    }
  }
  // @ts-expect-error -- test-only polyfill
  globalThis.PointerEvent = PointerEventPolyfill;
}

// Radix UI's Select (and other pointer-driven primitives) call
// hasPointerCapture/setPointerCapture/releasePointerCapture and
// scrollIntoView internally when opening/closing — none of which jsdom
// implements. Without these no-op stubs, interacting with a Select in a
// test silently fails to open it.
if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}
