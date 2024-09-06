"use strict";
(self["webpackChunkapp"] = self["webpackChunkapp"] || []).push([["common"],{

/***/ 38329:
/*!*********************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/button-active-a4d897e8.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "c": () => (/* binding */ createButtonActiveGesture)
/* harmony export */ });
/* harmony import */ var _index_8e692445_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index-8e692445.js */ 40320);
/* harmony import */ var _haptic_029a46f6_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./haptic-029a46f6.js */ 56745);
/* harmony import */ var _index_422b6e83_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index-422b6e83.js */ 49099);
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */




const createButtonActiveGesture = (el, isButton) => {
  let currentTouchedButton;
  let initialTouchedButton;
  const activateButtonAtPoint = (x, y, hapticFeedbackFn) => {
    if (typeof document === 'undefined') {
      return;
    }
    const target = document.elementFromPoint(x, y);
    if (!target || !isButton(target)) {
      clearActiveButton();
      return;
    }
    if (target !== currentTouchedButton) {
      clearActiveButton();
      setActiveButton(target, hapticFeedbackFn);
    }
  };
  const setActiveButton = (button, hapticFeedbackFn) => {
    currentTouchedButton = button;
    if (!initialTouchedButton) {
      initialTouchedButton = currentTouchedButton;
    }
    const buttonToModify = currentTouchedButton;
    (0,_index_8e692445_js__WEBPACK_IMPORTED_MODULE_0__.c)(() => buttonToModify.classList.add('ion-activated'));
    hapticFeedbackFn();
  };
  const clearActiveButton = (dispatchClick = false) => {
    if (!currentTouchedButton) {
      return;
    }
    const buttonToModify = currentTouchedButton;
    (0,_index_8e692445_js__WEBPACK_IMPORTED_MODULE_0__.c)(() => buttonToModify.classList.remove('ion-activated'));
    /**
     * Clicking on one button, but releasing on another button
     * does not dispatch a click event in browsers, so we
     * need to do it manually here. Some browsers will
     * dispatch a click if clicking on one button, dragging over
     * another button, and releasing on the original button. In that
     * case, we need to make sure we do not cause a double click there.
     */
    if (dispatchClick && initialTouchedButton !== currentTouchedButton) {
      currentTouchedButton.click();
    }
    currentTouchedButton = undefined;
  };
  return (0,_index_422b6e83_js__WEBPACK_IMPORTED_MODULE_2__.createGesture)({
    el,
    gestureName: 'buttonActiveDrag',
    threshold: 0,
    onStart: (ev) => activateButtonAtPoint(ev.currentX, ev.currentY, _haptic_029a46f6_js__WEBPACK_IMPORTED_MODULE_1__.a),
    onMove: (ev) => activateButtonAtPoint(ev.currentX, ev.currentY, _haptic_029a46f6_js__WEBPACK_IMPORTED_MODULE_1__.b),
    onEnd: () => {
      clearActiveButton(true);
      (0,_haptic_029a46f6_js__WEBPACK_IMPORTED_MODULE_1__.h)();
      initialTouchedButton = undefined;
    },
  });
};




/***/ }),

/***/ 35862:
/*!***********************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/dir-e8b767a8.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "i": () => (/* binding */ isRTL)
/* harmony export */ });
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
/**
 * Returns `true` if the document or host element
 * has a `dir` set to `rtl`. The host value will always
 * take priority over the root document value.
 */
const isRTL = (hostEl) => {
  if (hostEl) {
    if (hostEl.dir !== '') {
      return hostEl.dir.toLowerCase() === 'rtl';
    }
  }
  return (document === null || document === void 0 ? void 0 : document.dir.toLowerCase()) === 'rtl';
};




/***/ }),

/***/ 40763:
/*!*********************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/focus-visible-bd02518b.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "startFocusVisible": () => (/* binding */ startFocusVisible)
/* harmony export */ });
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const ION_FOCUSED = 'ion-focused';
const ION_FOCUSABLE = 'ion-focusable';
const FOCUS_KEYS = [
  'Tab',
  'ArrowDown',
  'Space',
  'Escape',
  ' ',
  'Shift',
  'Enter',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'Home',
  'End',
];
const startFocusVisible = (rootEl) => {
  let currentFocus = [];
  let keyboardMode = true;
  const ref = rootEl ? rootEl.shadowRoot : document;
  const root = rootEl ? rootEl : document.body;
  const setFocus = (elements) => {
    currentFocus.forEach((el) => el.classList.remove(ION_FOCUSED));
    elements.forEach((el) => el.classList.add(ION_FOCUSED));
    currentFocus = elements;
  };
  const pointerDown = () => {
    keyboardMode = false;
    setFocus([]);
  };
  const onKeydown = (ev) => {
    keyboardMode = FOCUS_KEYS.includes(ev.key);
    if (!keyboardMode) {
      setFocus([]);
    }
  };
  const onFocusin = (ev) => {
    if (keyboardMode && ev.composedPath !== undefined) {
      const toFocus = ev.composedPath().filter((el) => {
        // TODO(FW-2832): type
        if (el.classList) {
          return el.classList.contains(ION_FOCUSABLE);
        }
        return false;
      });
      setFocus(toFocus);
    }
  };
  const onFocusout = () => {
    if (ref.activeElement === root) {
      setFocus([]);
    }
  };
  ref.addEventListener('keydown', onKeydown);
  ref.addEventListener('focusin', onFocusin);
  ref.addEventListener('focusout', onFocusout);
  ref.addEventListener('touchstart', pointerDown);
  ref.addEventListener('mousedown', pointerDown);
  const destroy = () => {
    ref.removeEventListener('keydown', onKeydown);
    ref.removeEventListener('focusin', onFocusin);
    ref.removeEventListener('focusout', onFocusout);
    ref.removeEventListener('touchstart', pointerDown);
    ref.removeEventListener('mousedown', pointerDown);
  };
  return {
    destroy,
    setFocus,
  };
};




/***/ }),

/***/ 74293:
/*!**************************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/framework-delegate-c3305a28.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "C": () => (/* binding */ CoreDelegate),
/* harmony export */   "a": () => (/* binding */ attachComponent),
/* harmony export */   "d": () => (/* binding */ detachComponent)
/* harmony export */ });
/* harmony import */ var F_GIT_hypertask_ionic2_hypertask_node_modules_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator */ 62783);
/* harmony import */ var _helpers_3b390e48_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers-3b390e48.js */ 97140);


/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
 // TODO(FW-2832): types

const attachComponent = /*#__PURE__*/function () {
  var _ref = (0,F_GIT_hypertask_ionic2_hypertask_node_modules_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])(function* (delegate, container, component, cssClasses, componentProps, inline) {
    var _a;

    if (delegate) {
      return delegate.attachViewToDom(container, component, componentProps, cssClasses);
    }

    if (!inline && typeof component !== 'string' && !(component instanceof HTMLElement)) {
      throw new Error('framework delegate is missing');
    }

    const el = typeof component === 'string' ? (_a = container.ownerDocument) === null || _a === void 0 ? void 0 : _a.createElement(component) : component;

    if (cssClasses) {
      cssClasses.forEach(c => el.classList.add(c));
    }

    if (componentProps) {
      Object.assign(el, componentProps);
    }

    container.appendChild(el);
    yield new Promise(resolve => (0,_helpers_3b390e48_js__WEBPACK_IMPORTED_MODULE_1__.c)(el, resolve));
    return el;
  });

  return function attachComponent(_x, _x2, _x3, _x4, _x5, _x6) {
    return _ref.apply(this, arguments);
  };
}();

const detachComponent = (delegate, element) => {
  if (element) {
    if (delegate) {
      const container = element.parentElement;
      return delegate.removeViewFromDom(container, element);
    }

    element.remove();
  }

  return Promise.resolve();
};

const CoreDelegate = () => {
  let BaseComponent;
  let Reference;

  const attachViewToDom = /*#__PURE__*/function () {
    var _ref2 = (0,F_GIT_hypertask_ionic2_hypertask_node_modules_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])(function* (parentElement, userComponent, userComponentProps = {}, cssClasses = []) {
      var _a, _b;

      BaseComponent = parentElement;
      /**
       * If passing in a component via the `component` props
       * we need to append it inside of our overlay component.
       */

      if (userComponent) {
        /**
         * If passing in the tag name, create
         * the element otherwise just get a reference
         * to the component.
         */
        const el = typeof userComponent === 'string' ? (_a = BaseComponent.ownerDocument) === null || _a === void 0 ? void 0 : _a.createElement(userComponent) : userComponent;
        /**
         * Add any css classes passed in
         * via the cssClasses prop on the overlay.
         */

        cssClasses.forEach(c => el.classList.add(c));
        /**
         * Add any props passed in
         * via the componentProps prop on the overlay.
         */

        Object.assign(el, userComponentProps);
        /**
         * Finally, append the component
         * inside of the overlay component.
         */

        BaseComponent.appendChild(el);
        yield new Promise(resolve => (0,_helpers_3b390e48_js__WEBPACK_IMPORTED_MODULE_1__.c)(el, resolve));
      } else if (BaseComponent.children.length > 0) {
        const root = BaseComponent.children[0];

        if (!root.classList.contains('ion-delegate-host')) {
          /**
           * If the root element is not a delegate host, it means
           * that the overlay has not been presented yet and we need
           * to create the containing element with the specified classes.
           */
          const el = (_b = BaseComponent.ownerDocument) === null || _b === void 0 ? void 0 : _b.createElement('div'); // Add a class to track if the root element was created by the delegate.

          el.classList.add('ion-delegate-host');
          cssClasses.forEach(c => el.classList.add(c)); // Move each child from the original template to the new parent element.

          el.append(...BaseComponent.children); // Append the new parent element to the original parent element.

          BaseComponent.appendChild(el);
        }
      }
      /**
       * Get the root of the app and
       * add the overlay there.
       */


      const app = document.querySelector('ion-app') || document.body;
      /**
       * Create a placeholder comment so that
       * we can return this component to where
       * it was previously.
       */

      Reference = document.createComment('ionic teleport');
      BaseComponent.parentNode.insertBefore(Reference, BaseComponent);
      app.appendChild(BaseComponent);
      return BaseComponent;
    });

    return function attachViewToDom(_x7, _x8) {
      return _ref2.apply(this, arguments);
    };
  }();

  const removeViewFromDom = () => {
    /**
     * Return component to where it was previously in the DOM.
     */
    if (BaseComponent && Reference) {
      Reference.parentNode.insertBefore(BaseComponent, Reference);
      Reference.remove();
    }

    return Promise.resolve();
  };

  return {
    attachViewToDom,
    removeViewFromDom
  };
};



/***/ }),

/***/ 56745:
/*!**************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/haptic-029a46f6.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "a": () => (/* binding */ hapticSelectionStart),
/* harmony export */   "b": () => (/* binding */ hapticSelectionChanged),
/* harmony export */   "c": () => (/* binding */ hapticSelection),
/* harmony export */   "d": () => (/* binding */ hapticImpact),
/* harmony export */   "h": () => (/* binding */ hapticSelectionEnd)
/* harmony export */ });
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const HapticEngine = {
  getEngine() {
    var _a;
    const win = window;
    return win.TapticEngine || (((_a = win.Capacitor) === null || _a === void 0 ? void 0 : _a.isPluginAvailable('Haptics')) && win.Capacitor.Plugins.Haptics);
  },
  available() {
    var _a;
    const win = window;
    const engine = this.getEngine();
    if (!engine) {
      return false;
    }
    /**
     * Developers can manually import the
     * Haptics plugin in their app which will cause
     * getEngine to return the Haptics engine. However,
     * the Haptics engine will throw an error if
     * used in a web browser that does not support
     * the Vibrate API. This check avoids that error
     * if the browser does not support the Vibrate API.
     */
    if (((_a = win.Capacitor) === null || _a === void 0 ? void 0 : _a.getPlatform()) === 'web') {
      return typeof navigator !== 'undefined' && navigator.vibrate !== undefined;
    }
    return true;
  },
  isCordova() {
    return !!window.TapticEngine;
  },
  isCapacitor() {
    const win = window;
    return !!win.Capacitor;
  },
  impact(options) {
    const engine = this.getEngine();
    if (!engine) {
      return;
    }
    const style = this.isCapacitor() ? options.style.toUpperCase() : options.style;
    engine.impact({ style });
  },
  notification(options) {
    const engine = this.getEngine();
    if (!engine) {
      return;
    }
    const style = this.isCapacitor() ? options.style.toUpperCase() : options.style;
    engine.notification({ style });
  },
  selection() {
    this.impact({ style: 'light' });
  },
  selectionStart() {
    const engine = this.getEngine();
    if (!engine) {
      return;
    }
    if (this.isCapacitor()) {
      engine.selectionStart();
    }
    else {
      engine.gestureSelectionStart();
    }
  },
  selectionChanged() {
    const engine = this.getEngine();
    if (!engine) {
      return;
    }
    if (this.isCapacitor()) {
      engine.selectionChanged();
    }
    else {
      engine.gestureSelectionChanged();
    }
  },
  selectionEnd() {
    const engine = this.getEngine();
    if (!engine) {
      return;
    }
    if (this.isCapacitor()) {
      engine.selectionEnd();
    }
    else {
      engine.gestureSelectionEnd();
    }
  },
};
/**
 * Check to see if the Haptic Plugin is available
 * @return Returns `true` or false if the plugin is available
 */
const hapticAvailable = () => {
  return HapticEngine.available();
};
/**
 * Trigger a selection changed haptic event. Good for one-time events
 * (not for gestures)
 */
const hapticSelection = () => {
  hapticAvailable() && HapticEngine.selection();
};
/**
 * Tell the haptic engine that a gesture for a selection change is starting.
 */
const hapticSelectionStart = () => {
  hapticAvailable() && HapticEngine.selectionStart();
};
/**
 * Tell the haptic engine that a selection changed during a gesture.
 */
const hapticSelectionChanged = () => {
  hapticAvailable() && HapticEngine.selectionChanged();
};
/**
 * Tell the haptic engine we are done with a gesture. This needs to be
 * called lest resources are not properly recycled.
 */
const hapticSelectionEnd = () => {
  hapticAvailable() && HapticEngine.selectionEnd();
};
/**
 * Use this to indicate success/failure/warning to the user.
 * options should be of the type `{ style: 'light' }` (or `medium`/`heavy`)
 */
const hapticImpact = (options) => {
  hapticAvailable() && HapticEngine.impact(options);
};




/***/ }),

/***/ 61712:
/*!*************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/index-2bcb741c.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "a": () => (/* binding */ arrowBackSharp),
/* harmony export */   "b": () => (/* binding */ closeCircle),
/* harmony export */   "c": () => (/* binding */ chevronBack),
/* harmony export */   "d": () => (/* binding */ closeSharp),
/* harmony export */   "e": () => (/* binding */ searchSharp),
/* harmony export */   "f": () => (/* binding */ checkmarkOutline),
/* harmony export */   "g": () => (/* binding */ ellipseOutline),
/* harmony export */   "h": () => (/* binding */ caretBackSharp),
/* harmony export */   "i": () => (/* binding */ arrowDown),
/* harmony export */   "j": () => (/* binding */ reorderThreeOutline),
/* harmony export */   "k": () => (/* binding */ reorderTwoSharp),
/* harmony export */   "l": () => (/* binding */ chevronDown),
/* harmony export */   "m": () => (/* binding */ chevronForwardOutline),
/* harmony export */   "n": () => (/* binding */ ellipsisHorizontal),
/* harmony export */   "o": () => (/* binding */ chevronForward),
/* harmony export */   "p": () => (/* binding */ caretUpSharp),
/* harmony export */   "q": () => (/* binding */ caretDownSharp),
/* harmony export */   "r": () => (/* binding */ removeOutline),
/* harmony export */   "s": () => (/* binding */ searchOutline),
/* harmony export */   "t": () => (/* binding */ close),
/* harmony export */   "u": () => (/* binding */ menuOutline),
/* harmony export */   "v": () => (/* binding */ menuSharp)
/* harmony export */ });
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
/* Ionicons v6.1.3, ES Modules */
const arrowBackSharp = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='square' stroke-miterlimit='10' stroke-width='48' d='M244 400L100 256l144-144M120 256h292' class='ionicon-fill-none'/></svg>";
const arrowDown = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M112 268l144 144 144-144M256 392V100' class='ionicon-fill-none'/></svg>";
const caretBackSharp = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M368 64L144 256l224 192V64z'/></svg>";
const caretDownSharp = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M64 144l192 224 192-224H64z'/></svg>";
const caretUpSharp = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M448 368L256 144 64 368h384z'/></svg>";
const checkmarkOutline = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' d='M416 128L192 384l-96-96' class='ionicon-fill-none ionicon-stroke-width'/></svg>";
const chevronBack = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M328 112L184 256l144 144' class='ionicon-fill-none'/></svg>";
const chevronDown = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M112 184l144 144 144-144' class='ionicon-fill-none'/></svg>";
const chevronForward = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M184 112l144 144-144 144' class='ionicon-fill-none'/></svg>";
const chevronForwardOutline = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M184 112l144 144-144 144' class='ionicon-fill-none'/></svg>";
const close = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z'/></svg>";
const closeCircle = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm75.31 260.69a16 16 0 11-22.62 22.62L256 278.63l-52.69 52.68a16 16 0 01-22.62-22.62L233.37 256l-52.68-52.69a16 16 0 0122.62-22.62L256 233.37l52.69-52.68a16 16 0 0122.62 22.62L278.63 256z'/></svg>";
const closeSharp = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M400 145.49L366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49z'/></svg>";
const ellipseOutline = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><circle cx='256' cy='256' r='192' stroke-linecap='round' stroke-linejoin='round' class='ionicon-fill-none ionicon-stroke-width'/></svg>";
const ellipsisHorizontal = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><circle cx='256' cy='256' r='48'/><circle cx='416' cy='256' r='48'/><circle cx='96' cy='256' r='48'/></svg>";
const menuOutline = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-miterlimit='10' d='M80 160h352M80 256h352M80 352h352' class='ionicon-fill-none ionicon-stroke-width'/></svg>";
const menuSharp = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M64 384h384v-42.67H64zm0-106.67h384v-42.66H64zM64 128v42.67h384V128z'/></svg>";
const removeOutline = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' d='M400 256H112' class='ionicon-fill-none ionicon-stroke-width'/></svg>";
const reorderThreeOutline = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' d='M96 256h320M96 176h320M96 336h320' class='ionicon-fill-none ionicon-stroke-width'/></svg>";
const reorderTwoSharp = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='square' stroke-linejoin='round' stroke-width='44' d='M118 304h276M118 208h276' class='ionicon-fill-none'/></svg>";
const searchOutline = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z' stroke-miterlimit='10' class='ionicon-fill-none ionicon-stroke-width'/><path stroke-linecap='round' stroke-miterlimit='10' d='M338.29 338.29L448 448' class='ionicon-fill-none ionicon-stroke-width'/></svg>";
const searchSharp = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M464 428L339.92 303.9a160.48 160.48 0 0030.72-94.58C370.64 120.37 298.27 48 209.32 48S48 120.37 48 209.32s72.37 161.32 161.32 161.32a160.48 160.48 0 0094.58-30.72L428 464zM209.32 319.69a110.38 110.38 0 11110.37-110.37 110.5 110.5 0 01-110.37 110.37z'/></svg>";




/***/ }),

/***/ 70139:
/*!*************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/index-e6d1a8be.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "I": () => (/* binding */ ION_CONTENT_ELEMENT_SELECTOR),
/* harmony export */   "a": () => (/* binding */ findIonContent),
/* harmony export */   "b": () => (/* binding */ ION_CONTENT_CLASS_SELECTOR),
/* harmony export */   "c": () => (/* binding */ scrollByPoint),
/* harmony export */   "d": () => (/* binding */ disableContentScrollY),
/* harmony export */   "f": () => (/* binding */ findClosestIonContent),
/* harmony export */   "g": () => (/* binding */ getScrollElement),
/* harmony export */   "i": () => (/* binding */ isIonContent),
/* harmony export */   "p": () => (/* binding */ printIonContentErrorMsg),
/* harmony export */   "r": () => (/* binding */ resetContentScrollY),
/* harmony export */   "s": () => (/* binding */ scrollToTop)
/* harmony export */ });
/* harmony import */ var F_GIT_hypertask_ionic2_hypertask_node_modules_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator */ 62783);
/* harmony import */ var _helpers_3b390e48_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers-3b390e48.js */ 97140);
/* harmony import */ var _index_c4b11676_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index-c4b11676.js */ 75057);


/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */


const ION_CONTENT_TAG_NAME = 'ION-CONTENT';
const ION_CONTENT_ELEMENT_SELECTOR = 'ion-content';
const ION_CONTENT_CLASS_SELECTOR = '.ion-content-scroll-host';
/**
 * Selector used for implementations reliant on `<ion-content>` for scroll event changes.
 *
 * Developers should use the `.ion-content-scroll-host` selector to target the element emitting
 * scroll events. With virtual scroll implementations this will be the host element for
 * the scroll viewport.
 */

const ION_CONTENT_SELECTOR = `${ION_CONTENT_ELEMENT_SELECTOR}, ${ION_CONTENT_CLASS_SELECTOR}`;

const isIonContent = el => el.tagName === ION_CONTENT_TAG_NAME;
/**
 * Waits for the element host fully initialize before
 * returning the inner scroll element.
 *
 * For `ion-content` the scroll target will be the result
 * of the `getScrollElement` function.
 *
 * For custom implementations it will be the element host
 * or a selector within the host, if supplied through `scrollTarget`.
 */


const getScrollElement = /*#__PURE__*/function () {
  var _ref = (0,F_GIT_hypertask_ionic2_hypertask_node_modules_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])(function* (el) {
    if (isIonContent(el)) {
      yield new Promise(resolve => (0,_helpers_3b390e48_js__WEBPACK_IMPORTED_MODULE_1__.c)(el, resolve));
      return el.getScrollElement();
    }

    return el;
  });

  return function getScrollElement(_x) {
    return _ref.apply(this, arguments);
  };
}();
/**
 * Queries the element matching the selector for IonContent.
 * See ION_CONTENT_SELECTOR for the selector used.
 */


const findIonContent = el => {
  /**
   * First we try to query the custom scroll host selector in cases where
   * the implementation is using an outer `ion-content` with an inner custom
   * scroll container.
   */
  const customContentHost = el.querySelector(ION_CONTENT_CLASS_SELECTOR);

  if (customContentHost) {
    return customContentHost;
  }

  return el.querySelector(ION_CONTENT_SELECTOR);
};
/**
 * Queries the closest element matching the selector for IonContent.
 */


const findClosestIonContent = el => {
  return el.closest(ION_CONTENT_SELECTOR);
};
/**
 * Scrolls to the top of the element. If an `ion-content` is found, it will scroll
 * using the public API `scrollToTop` with a duration.
 */
// TODO(FW-2832): type


const scrollToTop = (el, durationMs) => {
  if (isIonContent(el)) {
    const content = el;
    return content.scrollToTop(durationMs);
  }

  return Promise.resolve(el.scrollTo({
    top: 0,
    left: 0,
    behavior: durationMs > 0 ? 'smooth' : 'auto'
  }));
};
/**
 * Scrolls by a specified X/Y distance in the component. If an `ion-content` is found, it will scroll
 * using the public API `scrollByPoint` with a duration.
 */


const scrollByPoint = (el, x, y, durationMs) => {
  if (isIonContent(el)) {
    const content = el;
    return content.scrollByPoint(x, y, durationMs);
  }

  return Promise.resolve(el.scrollBy({
    top: y,
    left: x,
    behavior: durationMs > 0 ? 'smooth' : 'auto'
  }));
};
/**
 * Prints an error informing developers that an implementation requires an element to be used
 * within either the `ion-content` selector or the `.ion-content-scroll-host` class.
 */


const printIonContentErrorMsg = el => {
  return (0,_index_c4b11676_js__WEBPACK_IMPORTED_MODULE_2__.a)(el, ION_CONTENT_ELEMENT_SELECTOR);
};
/**
 * Several components in Ionic need to prevent scrolling
 * during a gesture (card modal, range, item sliding, etc).
 * Use this utility to account for ion-content and custom content hosts.
 */


const disableContentScrollY = contentEl => {
  if (isIonContent(contentEl)) {
    const ionContent = contentEl;
    const initialScrollY = ionContent.scrollY;
    ionContent.scrollY = false;
    /**
     * This should be passed into resetContentScrollY
     * so that we can revert ion-content's scrollY to the
     * correct state. For example, if scrollY = false
     * initially, we do not want to enable scrolling
     * when we call resetContentScrollY.
     */

    return initialScrollY;
  } else {
    contentEl.style.setProperty('overflow', 'hidden');
    return true;
  }
};

const resetContentScrollY = (contentEl, initialScrollY) => {
  if (isIonContent(contentEl)) {
    contentEl.scrollY = initialScrollY;
  } else {
    contentEl.style.removeProperty('overflow');
  }
};



/***/ }),

/***/ 69386:
/*!****************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/keyboard-282b81b8.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "KEYBOARD_DID_CLOSE": () => (/* binding */ KEYBOARD_DID_CLOSE),
/* harmony export */   "KEYBOARD_DID_OPEN": () => (/* binding */ KEYBOARD_DID_OPEN),
/* harmony export */   "copyVisualViewport": () => (/* binding */ copyVisualViewport),
/* harmony export */   "keyboardDidClose": () => (/* binding */ keyboardDidClose),
/* harmony export */   "keyboardDidOpen": () => (/* binding */ keyboardDidOpen),
/* harmony export */   "keyboardDidResize": () => (/* binding */ keyboardDidResize),
/* harmony export */   "resetKeyboardAssist": () => (/* binding */ resetKeyboardAssist),
/* harmony export */   "setKeyboardClose": () => (/* binding */ setKeyboardClose),
/* harmony export */   "setKeyboardOpen": () => (/* binding */ setKeyboardOpen),
/* harmony export */   "startKeyboardAssist": () => (/* binding */ startKeyboardAssist),
/* harmony export */   "trackViewportChanges": () => (/* binding */ trackViewportChanges)
/* harmony export */ });
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const KEYBOARD_DID_OPEN = 'ionKeyboardDidShow';
const KEYBOARD_DID_CLOSE = 'ionKeyboardDidHide';
const KEYBOARD_THRESHOLD = 150;
// TODO(FW-2832): types
let previousVisualViewport = {};
let currentVisualViewport = {};
let keyboardOpen = false;
/**
 * This is only used for tests
 */
const resetKeyboardAssist = () => {
  previousVisualViewport = {};
  currentVisualViewport = {};
  keyboardOpen = false;
};
const startKeyboardAssist = (win) => {
  startNativeListeners(win);
  if (!win.visualViewport) {
    return;
  }
  currentVisualViewport = copyVisualViewport(win.visualViewport);
  win.visualViewport.onresize = () => {
    trackViewportChanges(win);
    if (keyboardDidOpen() || keyboardDidResize(win)) {
      setKeyboardOpen(win);
    }
    else if (keyboardDidClose(win)) {
      setKeyboardClose(win);
    }
  };
};
/**
 * Listen for events fired by native keyboard plugin
 * in Capacitor/Cordova so devs only need to listen
 * in one place.
 */
const startNativeListeners = (win) => {
  win.addEventListener('keyboardDidShow', (ev) => setKeyboardOpen(win, ev));
  win.addEventListener('keyboardDidHide', () => setKeyboardClose(win));
};
const setKeyboardOpen = (win, ev) => {
  fireKeyboardOpenEvent(win, ev);
  keyboardOpen = true;
};
const setKeyboardClose = (win) => {
  fireKeyboardCloseEvent(win);
  keyboardOpen = false;
};
/**
 * Returns `true` if the `keyboardOpen` flag is not
 * set, the previous visual viewport width equal the current
 * visual viewport width, and if the scaled difference
 * of the previous visual viewport height minus the current
 * visual viewport height is greater than KEYBOARD_THRESHOLD
 *
 * We need to be able to accommodate users who have zooming
 * enabled in their browser (or have zoomed in manually) which
 * is why we take into account the current visual viewport's
 * scale value.
 */
const keyboardDidOpen = () => {
  const scaledHeightDifference = (previousVisualViewport.height - currentVisualViewport.height) * currentVisualViewport.scale;
  return (!keyboardOpen &&
    previousVisualViewport.width === currentVisualViewport.width &&
    scaledHeightDifference > KEYBOARD_THRESHOLD);
};
/**
 * Returns `true` if the keyboard is open,
 * but the keyboard did not close
 */
const keyboardDidResize = (win) => {
  return keyboardOpen && !keyboardDidClose(win);
};
/**
 * Determine if the keyboard was closed
 * Returns `true` if the `keyboardOpen` flag is set and
 * the current visual viewport height equals the
 * layout viewport height.
 */
const keyboardDidClose = (win) => {
  return keyboardOpen && currentVisualViewport.height === win.innerHeight;
};
/**
 * Dispatch a keyboard open event
 */
const fireKeyboardOpenEvent = (win, nativeEv) => {
  const keyboardHeight = nativeEv ? nativeEv.keyboardHeight : win.innerHeight - currentVisualViewport.height;
  const ev = new CustomEvent(KEYBOARD_DID_OPEN, {
    detail: { keyboardHeight },
  });
  win.dispatchEvent(ev);
};
/**
 * Dispatch a keyboard close event
 */
const fireKeyboardCloseEvent = (win) => {
  const ev = new CustomEvent(KEYBOARD_DID_CLOSE);
  win.dispatchEvent(ev);
};
/**
 * Given a window object, create a copy of
 * the current visual and layout viewport states
 * while also preserving the previous visual and
 * layout viewport states
 */
const trackViewportChanges = (win) => {
  previousVisualViewport = Object.assign({}, currentVisualViewport);
  currentVisualViewport = copyVisualViewport(win.visualViewport);
};
/**
 * Creates a deep copy of the visual viewport
 * at a given state
 */
const copyVisualViewport = (visualViewport) => {
  return {
    width: Math.round(visualViewport.width),
    height: Math.round(visualViewport.height),
    offsetTop: visualViewport.offsetTop,
    offsetLeft: visualViewport.offsetLeft,
    pageTop: visualViewport.pageTop,
    pageLeft: visualViewport.pageLeft,
    scale: visualViewport.scale,
  };
};




/***/ }),

/***/ 63924:
/*!***************************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/keyboard-controller-73af62b2.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "c": () => (/* binding */ createKeyboardController)
/* harmony export */ });
/* harmony import */ var _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index-33ffec25.js */ 51356);
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */


/**
 * Creates a controller that tracks and reacts to opening or closing the keyboard.
 *
 * @internal
 * @param keyboardChangeCallback A function to call when the keyboard opens or closes.
 */
const createKeyboardController = (keyboardChangeCallback) => {
  let keyboardWillShowHandler;
  let keyboardWillHideHandler;
  let keyboardVisible;
  const init = () => {
    keyboardWillShowHandler = () => {
      keyboardVisible = true;
      if (keyboardChangeCallback)
        keyboardChangeCallback(true);
    };
    keyboardWillHideHandler = () => {
      keyboardVisible = false;
      if (keyboardChangeCallback)
        keyboardChangeCallback(false);
    };
    _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__.w === null || _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__.w === void 0 ? void 0 : _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__.w.addEventListener('keyboardWillShow', keyboardWillShowHandler);
    _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__.w === null || _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__.w === void 0 ? void 0 : _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__.w.addEventListener('keyboardWillHide', keyboardWillHideHandler);
  };
  const destroy = () => {
    _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__.w === null || _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__.w === void 0 ? void 0 : _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__.w.removeEventListener('keyboardWillShow', keyboardWillShowHandler);
    _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__.w === null || _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__.w === void 0 ? void 0 : _index_33ffec25_js__WEBPACK_IMPORTED_MODULE_0__.w.removeEventListener('keyboardWillHide', keyboardWillHideHandler);
    keyboardWillShowHandler = keyboardWillHideHandler = undefined;
  };
  const isKeyboardVisible = () => keyboardVisible;
  init();
  return { init, destroy, isKeyboardVisible };
};




/***/ }),

/***/ 34278:
/*!***********************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/spinner-configs-5d6b6fe7.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "S": () => (/* binding */ SPINNERS)
/* harmony export */ });
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const spinners = {
  bubbles: {
    dur: 1000,
    circles: 9,
    fn: (dur, index, total) => {
      const animationDelay = `${(dur * index) / total - dur}ms`;
      const angle = (2 * Math.PI * index) / total;
      return {
        r: 5,
        style: {
          top: `${9 * Math.sin(angle)}px`,
          left: `${9 * Math.cos(angle)}px`,
          'animation-delay': animationDelay,
        },
      };
    },
  },
  circles: {
    dur: 1000,
    circles: 8,
    fn: (dur, index, total) => {
      const step = index / total;
      const animationDelay = `${dur * step - dur}ms`;
      const angle = 2 * Math.PI * step;
      return {
        r: 5,
        style: {
          top: `${9 * Math.sin(angle)}px`,
          left: `${9 * Math.cos(angle)}px`,
          'animation-delay': animationDelay,
        },
      };
    },
  },
  circular: {
    dur: 1400,
    elmDuration: true,
    circles: 1,
    fn: () => {
      return {
        r: 20,
        cx: 48,
        cy: 48,
        fill: 'none',
        viewBox: '24 24 48 48',
        transform: 'translate(0,0)',
        style: {},
      };
    },
  },
  crescent: {
    dur: 750,
    circles: 1,
    fn: () => {
      return {
        r: 26,
        style: {},
      };
    },
  },
  dots: {
    dur: 750,
    circles: 3,
    fn: (_, index) => {
      const animationDelay = -(110 * index) + 'ms';
      return {
        r: 6,
        style: {
          left: `${9 - 9 * index}px`,
          'animation-delay': animationDelay,
        },
      };
    },
  },
  lines: {
    dur: 1000,
    lines: 8,
    fn: (dur, index, total) => {
      const transform = `rotate(${(360 / total) * index + (index < total / 2 ? 180 : -180)}deg)`;
      const animationDelay = `${(dur * index) / total - dur}ms`;
      return {
        y1: 14,
        y2: 26,
        style: {
          transform: transform,
          'animation-delay': animationDelay,
        },
      };
    },
  },
  'lines-small': {
    dur: 1000,
    lines: 8,
    fn: (dur, index, total) => {
      const transform = `rotate(${(360 / total) * index + (index < total / 2 ? 180 : -180)}deg)`;
      const animationDelay = `${(dur * index) / total - dur}ms`;
      return {
        y1: 12,
        y2: 20,
        style: {
          transform: transform,
          'animation-delay': animationDelay,
        },
      };
    },
  },
  'lines-sharp': {
    dur: 1000,
    lines: 12,
    fn: (dur, index, total) => {
      const transform = `rotate(${30 * index + (index < 6 ? 180 : -180)}deg)`;
      const animationDelay = `${(dur * index) / total - dur}ms`;
      return {
        y1: 17,
        y2: 29,
        style: {
          transform: transform,
          'animation-delay': animationDelay,
        },
      };
    },
  },
  'lines-sharp-small': {
    dur: 1000,
    lines: 12,
    fn: (dur, index, total) => {
      const transform = `rotate(${30 * index + (index < 6 ? 180 : -180)}deg)`;
      const animationDelay = `${(dur * index) / total - dur}ms`;
      return {
        y1: 12,
        y2: 20,
        style: {
          transform: transform,
          'animation-delay': animationDelay,
        },
      };
    },
  },
};
const SPINNERS = spinners;




/***/ }),

/***/ 92311:
/*!******************************************************************!*\
  !*** ./node_modules/@ionic/core/dist/esm/swipe-back-e35bd7d6.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createSwipeBackGesture": () => (/* binding */ createSwipeBackGesture)
/* harmony export */ });
/* harmony import */ var _helpers_3b390e48_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers-3b390e48.js */ 97140);
/* harmony import */ var _dir_e8b767a8_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dir-e8b767a8.js */ 35862);
/* harmony import */ var _index_422b6e83_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index-422b6e83.js */ 49099);
/* harmony import */ var _gesture_controller_17060b7c_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./gesture-controller-17060b7c.js */ 24840);
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */





const createSwipeBackGesture = (el, canStartHandler, onStartHandler, onMoveHandler, onEndHandler) => {
  const win = el.ownerDocument.defaultView;
  let rtl = (0,_dir_e8b767a8_js__WEBPACK_IMPORTED_MODULE_1__.i)(el);
  /**
   * Determine if a gesture is near the edge
   * of the screen. If true, then the swipe
   * to go back gesture should proceed.
   */
  const isAtEdge = (detail) => {
    const threshold = 50;
    const { startX } = detail;
    if (rtl) {
      return startX >= win.innerWidth - threshold;
    }
    return startX <= threshold;
  };
  const getDeltaX = (detail) => {
    return rtl ? -detail.deltaX : detail.deltaX;
  };
  const getVelocityX = (detail) => {
    return rtl ? -detail.velocityX : detail.velocityX;
  };
  const canStart = (detail) => {
    /**
     * The user's locale can change mid-session,
     * so we need to check text direction at
     * the beginning of every gesture.
     */
    rtl = (0,_dir_e8b767a8_js__WEBPACK_IMPORTED_MODULE_1__.i)(el);
    return isAtEdge(detail) && canStartHandler();
  };
  const onMove = (detail) => {
    // set the transition animation's progress
    const delta = getDeltaX(detail);
    const stepValue = delta / win.innerWidth;
    onMoveHandler(stepValue);
  };
  const onEnd = (detail) => {
    // the swipe back gesture has ended
    const delta = getDeltaX(detail);
    const width = win.innerWidth;
    const stepValue = delta / width;
    const velocity = getVelocityX(detail);
    const z = width / 2.0;
    const shouldComplete = velocity >= 0 && (velocity > 0.2 || delta > z);
    const missing = shouldComplete ? 1 - stepValue : stepValue;
    const missingDistance = missing * width;
    let realDur = 0;
    if (missingDistance > 5) {
      const dur = missingDistance / Math.abs(velocity);
      realDur = Math.min(dur, 540);
    }
    onEndHandler(shouldComplete, stepValue <= 0 ? 0.01 : (0,_helpers_3b390e48_js__WEBPACK_IMPORTED_MODULE_0__.l)(0, stepValue, 0.9999), realDur);
  };
  return (0,_index_422b6e83_js__WEBPACK_IMPORTED_MODULE_2__.createGesture)({
    el,
    gestureName: 'goback-swipe',
    gesturePriority: 40,
    threshold: 10,
    canStart,
    onStart: onStartHandler,
    onMove,
    onEnd,
  });
};




/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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ZDg5N2U4LmpzIiwiLi9ub2RlX21vZHVsZXMvQGlvbmljL2NvcmUvZGlzdC9lc20vZGlyLWU4Yjc2N2E4LmpzIiwiLi9ub2RlX21vZHVsZXMvQGlvbmljL2NvcmUvZGlzdC9lc20vZm9jdXMtdmlzaWJsZS1iZDAyNTE4Yi5qcyIsIi4vbm9kZV9tb2R1bGVzL0Bpb25pYy9jb3JlL2Rpc3QvZXNtL2ZyYW1ld29yay1kZWxlZ2F0ZS1jMzMwNWEyOC5qcyIsIi4vbm9kZV9tb2R1bGVzL0Bpb25pYy9jb3JlL2Rpc3QvZXNtL2hhcHRpYy0wMjlhNDZmNi5qcyIsIi4vbm9kZV9tb2R1bGVzL0Bpb25pYy9jb3JlL2Rpc3QvZXNtL2luZGV4LTJiY2I3NDFjLmpzIiwiLi9ub2RlX21vZHVsZXMvQGlvbmljL2NvcmUvZGlzdC9lc20vaW5kZXgtZTZkMWE4YmUuanMiLCIuL25vZGVfbW9kdWxlcy9AaW9uaWMvY29yZS9kaXN0L2VzbS9rZXlib2FyZC0yODJiODFiOC5qcyIsIi4vbm9kZV9tb2R1bGVzL0Bpb25pYy9jb3JlL2Rpc3QvZXNtL2tleWJvYXJkLWNvbnRyb2xsZXItNzNhZjYyYjIuanMiLCIuL25vZGVfbW9kdWxlcy9AaW9uaWMvY29yZS9kaXN0L2VzbS9zcGlubmVyLWNvbmZpZ3MtNWQ2YjZmZTcuanMiLCIuL25vZGVfbW9kdWxlcy9AaW9uaWMvY29yZS9kaXN0L2VzbS9zd2lwZS1iYWNrLWUzNWJkN2Q2LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogKEMpIElvbmljIGh0dHA6Ly9pb25pY2ZyYW1ld29yay5jb20gLSBNSVQgTGljZW5zZVxuICovXG5pbXBvcnQgeyBjIGFzIHdyaXRlVGFzayB9IGZyb20gJy4vaW5kZXgtOGU2OTI0NDUuanMnO1xuaW1wb3J0IHsgaCBhcyBoYXB0aWNTZWxlY3Rpb25FbmQsIGEgYXMgaGFwdGljU2VsZWN0aW9uU3RhcnQsIGIgYXMgaGFwdGljU2VsZWN0aW9uQ2hhbmdlZCB9IGZyb20gJy4vaGFwdGljLTAyOWE0NmY2LmpzJztcbmltcG9ydCB7IGNyZWF0ZUdlc3R1cmUgfSBmcm9tICcuL2luZGV4LTQyMmI2ZTgzLmpzJztcblxuY29uc3QgY3JlYXRlQnV0dG9uQWN0aXZlR2VzdHVyZSA9IChlbCwgaXNCdXR0b24pID0+IHtcbiAgbGV0IGN1cnJlbnRUb3VjaGVkQnV0dG9uO1xuICBsZXQgaW5pdGlhbFRvdWNoZWRCdXR0b247XG4gIGNvbnN0IGFjdGl2YXRlQnV0dG9uQXRQb2ludCA9ICh4LCB5LCBoYXB0aWNGZWVkYmFja0ZuKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICBpZiAoIXRhcmdldCB8fCAhaXNCdXR0b24odGFyZ2V0KSkge1xuICAgICAgY2xlYXJBY3RpdmVCdXR0b24oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRhcmdldCAhPT0gY3VycmVudFRvdWNoZWRCdXR0b24pIHtcbiAgICAgIGNsZWFyQWN0aXZlQnV0dG9uKCk7XG4gICAgICBzZXRBY3RpdmVCdXR0b24odGFyZ2V0LCBoYXB0aWNGZWVkYmFja0ZuKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IHNldEFjdGl2ZUJ1dHRvbiA9IChidXR0b24sIGhhcHRpY0ZlZWRiYWNrRm4pID0+IHtcbiAgICBjdXJyZW50VG91Y2hlZEJ1dHRvbiA9IGJ1dHRvbjtcbiAgICBpZiAoIWluaXRpYWxUb3VjaGVkQnV0dG9uKSB7XG4gICAgICBpbml0aWFsVG91Y2hlZEJ1dHRvbiA9IGN1cnJlbnRUb3VjaGVkQnV0dG9uO1xuICAgIH1cbiAgICBjb25zdCBidXR0b25Ub01vZGlmeSA9IGN1cnJlbnRUb3VjaGVkQnV0dG9uO1xuICAgIHdyaXRlVGFzaygoKSA9PiBidXR0b25Ub01vZGlmeS5jbGFzc0xpc3QuYWRkKCdpb24tYWN0aXZhdGVkJykpO1xuICAgIGhhcHRpY0ZlZWRiYWNrRm4oKTtcbiAgfTtcbiAgY29uc3QgY2xlYXJBY3RpdmVCdXR0b24gPSAoZGlzcGF0Y2hDbGljayA9IGZhbHNlKSA9PiB7XG4gICAgaWYgKCFjdXJyZW50VG91Y2hlZEJ1dHRvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBidXR0b25Ub01vZGlmeSA9IGN1cnJlbnRUb3VjaGVkQnV0dG9uO1xuICAgIHdyaXRlVGFzaygoKSA9PiBidXR0b25Ub01vZGlmeS5jbGFzc0xpc3QucmVtb3ZlKCdpb24tYWN0aXZhdGVkJykpO1xuICAgIC8qKlxuICAgICAqIENsaWNraW5nIG9uIG9uZSBidXR0b24sIGJ1dCByZWxlYXNpbmcgb24gYW5vdGhlciBidXR0b25cbiAgICAgKiBkb2VzIG5vdCBkaXNwYXRjaCBhIGNsaWNrIGV2ZW50IGluIGJyb3dzZXJzLCBzbyB3ZVxuICAgICAqIG5lZWQgdG8gZG8gaXQgbWFudWFsbHkgaGVyZS4gU29tZSBicm93c2VycyB3aWxsXG4gICAgICogZGlzcGF0Y2ggYSBjbGljayBpZiBjbGlja2luZyBvbiBvbmUgYnV0dG9uLCBkcmFnZ2luZyBvdmVyXG4gICAgICogYW5vdGhlciBidXR0b24sIGFuZCByZWxlYXNpbmcgb24gdGhlIG9yaWdpbmFsIGJ1dHRvbi4gSW4gdGhhdFxuICAgICAqIGNhc2UsIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHdlIGRvIG5vdCBjYXVzZSBhIGRvdWJsZSBjbGljayB0aGVyZS5cbiAgICAgKi9cbiAgICBpZiAoZGlzcGF0Y2hDbGljayAmJiBpbml0aWFsVG91Y2hlZEJ1dHRvbiAhPT0gY3VycmVudFRvdWNoZWRCdXR0b24pIHtcbiAgICAgIGN1cnJlbnRUb3VjaGVkQnV0dG9uLmNsaWNrKCk7XG4gICAgfVxuICAgIGN1cnJlbnRUb3VjaGVkQnV0dG9uID0gdW5kZWZpbmVkO1xuICB9O1xuICByZXR1cm4gY3JlYXRlR2VzdHVyZSh7XG4gICAgZWwsXG4gICAgZ2VzdHVyZU5hbWU6ICdidXR0b25BY3RpdmVEcmFnJyxcbiAgICB0aHJlc2hvbGQ6IDAsXG4gICAgb25TdGFydDogKGV2KSA9PiBhY3RpdmF0ZUJ1dHRvbkF0UG9pbnQoZXYuY3VycmVudFgsIGV2LmN1cnJlbnRZLCBoYXB0aWNTZWxlY3Rpb25TdGFydCksXG4gICAgb25Nb3ZlOiAoZXYpID0+IGFjdGl2YXRlQnV0dG9uQXRQb2ludChldi5jdXJyZW50WCwgZXYuY3VycmVudFksIGhhcHRpY1NlbGVjdGlvbkNoYW5nZWQpLFxuICAgIG9uRW5kOiAoKSA9PiB7XG4gICAgICBjbGVhckFjdGl2ZUJ1dHRvbih0cnVlKTtcbiAgICAgIGhhcHRpY1NlbGVjdGlvbkVuZCgpO1xuICAgICAgaW5pdGlhbFRvdWNoZWRCdXR0b24gPSB1bmRlZmluZWQ7XG4gICAgfSxcbiAgfSk7XG59O1xuXG5leHBvcnQgeyBjcmVhdGVCdXR0b25BY3RpdmVHZXN0dXJlIGFzIGMgfTtcbiIsIi8qIVxuICogKEMpIElvbmljIGh0dHA6Ly9pb25pY2ZyYW1ld29yay5jb20gLSBNSVQgTGljZW5zZVxuICovXG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBkb2N1bWVudCBvciBob3N0IGVsZW1lbnRcbiAqIGhhcyBhIGBkaXJgIHNldCB0byBgcnRsYC4gVGhlIGhvc3QgdmFsdWUgd2lsbCBhbHdheXNcbiAqIHRha2UgcHJpb3JpdHkgb3ZlciB0aGUgcm9vdCBkb2N1bWVudCB2YWx1ZS5cbiAqL1xuY29uc3QgaXNSVEwgPSAoaG9zdEVsKSA9PiB7XG4gIGlmIChob3N0RWwpIHtcbiAgICBpZiAoaG9zdEVsLmRpciAhPT0gJycpIHtcbiAgICAgIHJldHVybiBob3N0RWwuZGlyLnRvTG93ZXJDYXNlKCkgPT09ICdydGwnO1xuICAgIH1cbiAgfVxuICByZXR1cm4gKGRvY3VtZW50ID09PSBudWxsIHx8IGRvY3VtZW50ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkb2N1bWVudC5kaXIudG9Mb3dlckNhc2UoKSkgPT09ICdydGwnO1xufTtcblxuZXhwb3J0IHsgaXNSVEwgYXMgaSB9O1xuIiwiLyohXG4gKiAoQykgSW9uaWMgaHR0cDovL2lvbmljZnJhbWV3b3JrLmNvbSAtIE1JVCBMaWNlbnNlXG4gKi9cbmNvbnN0IElPTl9GT0NVU0VEID0gJ2lvbi1mb2N1c2VkJztcbmNvbnN0IElPTl9GT0NVU0FCTEUgPSAnaW9uLWZvY3VzYWJsZSc7XG5jb25zdCBGT0NVU19LRVlTID0gW1xuICAnVGFiJyxcbiAgJ0Fycm93RG93bicsXG4gICdTcGFjZScsXG4gICdFc2NhcGUnLFxuICAnICcsXG4gICdTaGlmdCcsXG4gICdFbnRlcicsXG4gICdBcnJvd0xlZnQnLFxuICAnQXJyb3dSaWdodCcsXG4gICdBcnJvd1VwJyxcbiAgJ0hvbWUnLFxuICAnRW5kJyxcbl07XG5jb25zdCBzdGFydEZvY3VzVmlzaWJsZSA9IChyb290RWwpID0+IHtcbiAgbGV0IGN1cnJlbnRGb2N1cyA9IFtdO1xuICBsZXQga2V5Ym9hcmRNb2RlID0gdHJ1ZTtcbiAgY29uc3QgcmVmID0gcm9vdEVsID8gcm9vdEVsLnNoYWRvd1Jvb3QgOiBkb2N1bWVudDtcbiAgY29uc3Qgcm9vdCA9IHJvb3RFbCA/IHJvb3RFbCA6IGRvY3VtZW50LmJvZHk7XG4gIGNvbnN0IHNldEZvY3VzID0gKGVsZW1lbnRzKSA9PiB7XG4gICAgY3VycmVudEZvY3VzLmZvckVhY2goKGVsKSA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKElPTl9GT0NVU0VEKSk7XG4gICAgZWxlbWVudHMuZm9yRWFjaCgoZWwpID0+IGVsLmNsYXNzTGlzdC5hZGQoSU9OX0ZPQ1VTRUQpKTtcbiAgICBjdXJyZW50Rm9jdXMgPSBlbGVtZW50cztcbiAgfTtcbiAgY29uc3QgcG9pbnRlckRvd24gPSAoKSA9PiB7XG4gICAga2V5Ym9hcmRNb2RlID0gZmFsc2U7XG4gICAgc2V0Rm9jdXMoW10pO1xuICB9O1xuICBjb25zdCBvbktleWRvd24gPSAoZXYpID0+IHtcbiAgICBrZXlib2FyZE1vZGUgPSBGT0NVU19LRVlTLmluY2x1ZGVzKGV2LmtleSk7XG4gICAgaWYgKCFrZXlib2FyZE1vZGUpIHtcbiAgICAgIHNldEZvY3VzKFtdKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IG9uRm9jdXNpbiA9IChldikgPT4ge1xuICAgIGlmIChrZXlib2FyZE1vZGUgJiYgZXYuY29tcG9zZWRQYXRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHRvRm9jdXMgPSBldi5jb21wb3NlZFBhdGgoKS5maWx0ZXIoKGVsKSA9PiB7XG4gICAgICAgIC8vIFRPRE8oRlctMjgzMik6IHR5cGVcbiAgICAgICAgaWYgKGVsLmNsYXNzTGlzdCkge1xuICAgICAgICAgIHJldHVybiBlbC5jbGFzc0xpc3QuY29udGFpbnMoSU9OX0ZPQ1VTQUJMRSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgICBzZXRGb2N1cyh0b0ZvY3VzKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IG9uRm9jdXNvdXQgPSAoKSA9PiB7XG4gICAgaWYgKHJlZi5hY3RpdmVFbGVtZW50ID09PSByb290KSB7XG4gICAgICBzZXRGb2N1cyhbXSk7XG4gICAgfVxuICB9O1xuICByZWYuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93bik7XG4gIHJlZi5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgb25Gb2N1c2luKTtcbiAgcmVmLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0Jywgb25Gb2N1c291dCk7XG4gIHJlZi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgcG9pbnRlckRvd24pO1xuICByZWYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgcG9pbnRlckRvd24pO1xuICBjb25zdCBkZXN0cm95ID0gKCkgPT4ge1xuICAgIHJlZi5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duKTtcbiAgICByZWYucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIG9uRm9jdXNpbik7XG4gICAgcmVmLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0Jywgb25Gb2N1c291dCk7XG4gICAgcmVmLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBwb2ludGVyRG93bik7XG4gICAgcmVmLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHBvaW50ZXJEb3duKTtcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBkZXN0cm95LFxuICAgIHNldEZvY3VzLFxuICB9O1xufTtcblxuZXhwb3J0IHsgc3RhcnRGb2N1c1Zpc2libGUgfTtcbiIsIi8qIVxuICogKEMpIElvbmljIGh0dHA6Ly9pb25pY2ZyYW1ld29yay5jb20gLSBNSVQgTGljZW5zZVxuICovXG5pbXBvcnQgeyBjIGFzIGNvbXBvbmVudE9uUmVhZHkgfSBmcm9tICcuL2hlbHBlcnMtM2IzOTBlNDguanMnO1xuXG4vLyBUT0RPKEZXLTI4MzIpOiB0eXBlc1xuY29uc3QgYXR0YWNoQ29tcG9uZW50ID0gYXN5bmMgKGRlbGVnYXRlLCBjb250YWluZXIsIGNvbXBvbmVudCwgY3NzQ2xhc3NlcywgY29tcG9uZW50UHJvcHMsIGlubGluZSkgPT4ge1xuICB2YXIgX2E7XG4gIGlmIChkZWxlZ2F0ZSkge1xuICAgIHJldHVybiBkZWxlZ2F0ZS5hdHRhY2hWaWV3VG9Eb20oY29udGFpbmVyLCBjb21wb25lbnQsIGNvbXBvbmVudFByb3BzLCBjc3NDbGFzc2VzKTtcbiAgfVxuICBpZiAoIWlubGluZSAmJiB0eXBlb2YgY29tcG9uZW50ICE9PSAnc3RyaW5nJyAmJiAhKGNvbXBvbmVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignZnJhbWV3b3JrIGRlbGVnYXRlIGlzIG1pc3NpbmcnKTtcbiAgfVxuICBjb25zdCBlbCA9IHR5cGVvZiBjb21wb25lbnQgPT09ICdzdHJpbmcnID8gKF9hID0gY29udGFpbmVyLm93bmVyRG9jdW1lbnQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5jcmVhdGVFbGVtZW50KGNvbXBvbmVudCkgOiBjb21wb25lbnQ7XG4gIGlmIChjc3NDbGFzc2VzKSB7XG4gICAgY3NzQ2xhc3Nlcy5mb3JFYWNoKChjKSA9PiBlbC5jbGFzc0xpc3QuYWRkKGMpKTtcbiAgfVxuICBpZiAoY29tcG9uZW50UHJvcHMpIHtcbiAgICBPYmplY3QuYXNzaWduKGVsLCBjb21wb25lbnRQcm9wcyk7XG4gIH1cbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsKTtcbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IGNvbXBvbmVudE9uUmVhZHkoZWwsIHJlc29sdmUpKTtcbiAgcmV0dXJuIGVsO1xufTtcbmNvbnN0IGRldGFjaENvbXBvbmVudCA9IChkZWxlZ2F0ZSwgZWxlbWVudCkgPT4ge1xuICBpZiAoZWxlbWVudCkge1xuICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gZWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgcmV0dXJuIGRlbGVnYXRlLnJlbW92ZVZpZXdGcm9tRG9tKGNvbnRhaW5lciwgZWxlbWVudCk7XG4gICAgfVxuICAgIGVsZW1lbnQucmVtb3ZlKCk7XG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xufTtcbmNvbnN0IENvcmVEZWxlZ2F0ZSA9ICgpID0+IHtcbiAgbGV0IEJhc2VDb21wb25lbnQ7XG4gIGxldCBSZWZlcmVuY2U7XG4gIGNvbnN0IGF0dGFjaFZpZXdUb0RvbSA9IGFzeW5jIChwYXJlbnRFbGVtZW50LCB1c2VyQ29tcG9uZW50LCB1c2VyQ29tcG9uZW50UHJvcHMgPSB7fSwgY3NzQ2xhc3NlcyA9IFtdKSA9PiB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICBCYXNlQ29tcG9uZW50ID0gcGFyZW50RWxlbWVudDtcbiAgICAvKipcbiAgICAgKiBJZiBwYXNzaW5nIGluIGEgY29tcG9uZW50IHZpYSB0aGUgYGNvbXBvbmVudGAgcHJvcHNcbiAgICAgKiB3ZSBuZWVkIHRvIGFwcGVuZCBpdCBpbnNpZGUgb2Ygb3VyIG92ZXJsYXkgY29tcG9uZW50LlxuICAgICAqL1xuICAgIGlmICh1c2VyQ29tcG9uZW50KSB7XG4gICAgICAvKipcbiAgICAgICAqIElmIHBhc3NpbmcgaW4gdGhlIHRhZyBuYW1lLCBjcmVhdGVcbiAgICAgICAqIHRoZSBlbGVtZW50IG90aGVyd2lzZSBqdXN0IGdldCBhIHJlZmVyZW5jZVxuICAgICAgICogdG8gdGhlIGNvbXBvbmVudC5cbiAgICAgICAqL1xuICAgICAgY29uc3QgZWwgPSB0eXBlb2YgdXNlckNvbXBvbmVudCA9PT0gJ3N0cmluZycgPyAoX2EgPSBCYXNlQ29tcG9uZW50Lm93bmVyRG9jdW1lbnQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5jcmVhdGVFbGVtZW50KHVzZXJDb21wb25lbnQpIDogdXNlckNvbXBvbmVudDtcbiAgICAgIC8qKlxuICAgICAgICogQWRkIGFueSBjc3MgY2xhc3NlcyBwYXNzZWQgaW5cbiAgICAgICAqIHZpYSB0aGUgY3NzQ2xhc3NlcyBwcm9wIG9uIHRoZSBvdmVybGF5LlxuICAgICAgICovXG4gICAgICBjc3NDbGFzc2VzLmZvckVhY2goKGMpID0+IGVsLmNsYXNzTGlzdC5hZGQoYykpO1xuICAgICAgLyoqXG4gICAgICAgKiBBZGQgYW55IHByb3BzIHBhc3NlZCBpblxuICAgICAgICogdmlhIHRoZSBjb21wb25lbnRQcm9wcyBwcm9wIG9uIHRoZSBvdmVybGF5LlxuICAgICAgICovXG4gICAgICBPYmplY3QuYXNzaWduKGVsLCB1c2VyQ29tcG9uZW50UHJvcHMpO1xuICAgICAgLyoqXG4gICAgICAgKiBGaW5hbGx5LCBhcHBlbmQgdGhlIGNvbXBvbmVudFxuICAgICAgICogaW5zaWRlIG9mIHRoZSBvdmVybGF5IGNvbXBvbmVudC5cbiAgICAgICAqL1xuICAgICAgQmFzZUNvbXBvbmVudC5hcHBlbmRDaGlsZChlbCk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gY29tcG9uZW50T25SZWFkeShlbCwgcmVzb2x2ZSkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChCYXNlQ29tcG9uZW50LmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHJvb3QgPSBCYXNlQ29tcG9uZW50LmNoaWxkcmVuWzBdO1xuICAgICAgaWYgKCFyb290LmNsYXNzTGlzdC5jb250YWlucygnaW9uLWRlbGVnYXRlLWhvc3QnKSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogSWYgdGhlIHJvb3QgZWxlbWVudCBpcyBub3QgYSBkZWxlZ2F0ZSBob3N0LCBpdCBtZWFuc1xuICAgICAgICAgKiB0aGF0IHRoZSBvdmVybGF5IGhhcyBub3QgYmVlbiBwcmVzZW50ZWQgeWV0IGFuZCB3ZSBuZWVkXG4gICAgICAgICAqIHRvIGNyZWF0ZSB0aGUgY29udGFpbmluZyBlbGVtZW50IHdpdGggdGhlIHNwZWNpZmllZCBjbGFzc2VzLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgZWwgPSAoX2IgPSBCYXNlQ29tcG9uZW50Lm93bmVyRG9jdW1lbnQpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgLy8gQWRkIGEgY2xhc3MgdG8gdHJhY2sgaWYgdGhlIHJvb3QgZWxlbWVudCB3YXMgY3JlYXRlZCBieSB0aGUgZGVsZWdhdGUuXG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2lvbi1kZWxlZ2F0ZS1ob3N0Jyk7XG4gICAgICAgIGNzc0NsYXNzZXMuZm9yRWFjaCgoYykgPT4gZWwuY2xhc3NMaXN0LmFkZChjKSk7XG4gICAgICAgIC8vIE1vdmUgZWFjaCBjaGlsZCBmcm9tIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSB0byB0aGUgbmV3IHBhcmVudCBlbGVtZW50LlxuICAgICAgICBlbC5hcHBlbmQoLi4uQmFzZUNvbXBvbmVudC5jaGlsZHJlbik7XG4gICAgICAgIC8vIEFwcGVuZCB0aGUgbmV3IHBhcmVudCBlbGVtZW50IHRvIHRoZSBvcmlnaW5hbCBwYXJlbnQgZWxlbWVudC5cbiAgICAgICAgQmFzZUNvbXBvbmVudC5hcHBlbmRDaGlsZChlbCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcm9vdCBvZiB0aGUgYXBwIGFuZFxuICAgICAqIGFkZCB0aGUgb3ZlcmxheSB0aGVyZS5cbiAgICAgKi9cbiAgICBjb25zdCBhcHAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpb24tYXBwJykgfHwgZG9jdW1lbnQuYm9keTtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBwbGFjZWhvbGRlciBjb21tZW50IHNvIHRoYXRcbiAgICAgKiB3ZSBjYW4gcmV0dXJuIHRoaXMgY29tcG9uZW50IHRvIHdoZXJlXG4gICAgICogaXQgd2FzIHByZXZpb3VzbHkuXG4gICAgICovXG4gICAgUmVmZXJlbmNlID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnaW9uaWMgdGVsZXBvcnQnKTtcbiAgICBCYXNlQ29tcG9uZW50LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKFJlZmVyZW5jZSwgQmFzZUNvbXBvbmVudCk7XG4gICAgYXBwLmFwcGVuZENoaWxkKEJhc2VDb21wb25lbnQpO1xuICAgIHJldHVybiBCYXNlQ29tcG9uZW50O1xuICB9O1xuICBjb25zdCByZW1vdmVWaWV3RnJvbURvbSA9ICgpID0+IHtcbiAgICAvKipcbiAgICAgKiBSZXR1cm4gY29tcG9uZW50IHRvIHdoZXJlIGl0IHdhcyBwcmV2aW91c2x5IGluIHRoZSBET00uXG4gICAgICovXG4gICAgaWYgKEJhc2VDb21wb25lbnQgJiYgUmVmZXJlbmNlKSB7XG4gICAgICBSZWZlcmVuY2UucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoQmFzZUNvbXBvbmVudCwgUmVmZXJlbmNlKTtcbiAgICAgIFJlZmVyZW5jZS5yZW1vdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9O1xuICByZXR1cm4geyBhdHRhY2hWaWV3VG9Eb20sIHJlbW92ZVZpZXdGcm9tRG9tIH07XG59O1xuXG5leHBvcnQgeyBDb3JlRGVsZWdhdGUgYXMgQywgYXR0YWNoQ29tcG9uZW50IGFzIGEsIGRldGFjaENvbXBvbmVudCBhcyBkIH07XG4iLCIvKiFcbiAqIChDKSBJb25pYyBodHRwOi8vaW9uaWNmcmFtZXdvcmsuY29tIC0gTUlUIExpY2Vuc2VcbiAqL1xuY29uc3QgSGFwdGljRW5naW5lID0ge1xuICBnZXRFbmdpbmUoKSB7XG4gICAgdmFyIF9hO1xuICAgIGNvbnN0IHdpbiA9IHdpbmRvdztcbiAgICByZXR1cm4gd2luLlRhcHRpY0VuZ2luZSB8fCAoKChfYSA9IHdpbi5DYXBhY2l0b3IpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5pc1BsdWdpbkF2YWlsYWJsZSgnSGFwdGljcycpKSAmJiB3aW4uQ2FwYWNpdG9yLlBsdWdpbnMuSGFwdGljcyk7XG4gIH0sXG4gIGF2YWlsYWJsZSgpIHtcbiAgICB2YXIgX2E7XG4gICAgY29uc3Qgd2luID0gd2luZG93O1xuICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuZ2V0RW5naW5lKCk7XG4gICAgaWYgKCFlbmdpbmUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV2ZWxvcGVycyBjYW4gbWFudWFsbHkgaW1wb3J0IHRoZVxuICAgICAqIEhhcHRpY3MgcGx1Z2luIGluIHRoZWlyIGFwcCB3aGljaCB3aWxsIGNhdXNlXG4gICAgICogZ2V0RW5naW5lIHRvIHJldHVybiB0aGUgSGFwdGljcyBlbmdpbmUuIEhvd2V2ZXIsXG4gICAgICogdGhlIEhhcHRpY3MgZW5naW5lIHdpbGwgdGhyb3cgYW4gZXJyb3IgaWZcbiAgICAgKiB1c2VkIGluIGEgd2ViIGJyb3dzZXIgdGhhdCBkb2VzIG5vdCBzdXBwb3J0XG4gICAgICogdGhlIFZpYnJhdGUgQVBJLiBUaGlzIGNoZWNrIGF2b2lkcyB0aGF0IGVycm9yXG4gICAgICogaWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0aGUgVmlicmF0ZSBBUEkuXG4gICAgICovXG4gICAgaWYgKCgoX2EgPSB3aW4uQ2FwYWNpdG9yKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuZ2V0UGxhdGZvcm0oKSkgPT09ICd3ZWInKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnZpYnJhdGUgIT09IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGlzQ29yZG92YSgpIHtcbiAgICByZXR1cm4gISF3aW5kb3cuVGFwdGljRW5naW5lO1xuICB9LFxuICBpc0NhcGFjaXRvcigpIHtcbiAgICBjb25zdCB3aW4gPSB3aW5kb3c7XG4gICAgcmV0dXJuICEhd2luLkNhcGFjaXRvcjtcbiAgfSxcbiAgaW1wYWN0KG9wdGlvbnMpIHtcbiAgICBjb25zdCBlbmdpbmUgPSB0aGlzLmdldEVuZ2luZSgpO1xuICAgIGlmICghZW5naW5lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHN0eWxlID0gdGhpcy5pc0NhcGFjaXRvcigpID8gb3B0aW9ucy5zdHlsZS50b1VwcGVyQ2FzZSgpIDogb3B0aW9ucy5zdHlsZTtcbiAgICBlbmdpbmUuaW1wYWN0KHsgc3R5bGUgfSk7XG4gIH0sXG4gIG5vdGlmaWNhdGlvbihvcHRpb25zKSB7XG4gICAgY29uc3QgZW5naW5lID0gdGhpcy5nZXRFbmdpbmUoKTtcbiAgICBpZiAoIWVuZ2luZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzdHlsZSA9IHRoaXMuaXNDYXBhY2l0b3IoKSA/IG9wdGlvbnMuc3R5bGUudG9VcHBlckNhc2UoKSA6IG9wdGlvbnMuc3R5bGU7XG4gICAgZW5naW5lLm5vdGlmaWNhdGlvbih7IHN0eWxlIH0pO1xuICB9LFxuICBzZWxlY3Rpb24oKSB7XG4gICAgdGhpcy5pbXBhY3QoeyBzdHlsZTogJ2xpZ2h0JyB9KTtcbiAgfSxcbiAgc2VsZWN0aW9uU3RhcnQoKSB7XG4gICAgY29uc3QgZW5naW5lID0gdGhpcy5nZXRFbmdpbmUoKTtcbiAgICBpZiAoIWVuZ2luZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0NhcGFjaXRvcigpKSB7XG4gICAgICBlbmdpbmUuc2VsZWN0aW9uU3RhcnQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbmdpbmUuZ2VzdHVyZVNlbGVjdGlvblN0YXJ0KCk7XG4gICAgfVxuICB9LFxuICBzZWxlY3Rpb25DaGFuZ2VkKCkge1xuICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuZ2V0RW5naW5lKCk7XG4gICAgaWYgKCFlbmdpbmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNDYXBhY2l0b3IoKSkge1xuICAgICAgZW5naW5lLnNlbGVjdGlvbkNoYW5nZWQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbmdpbmUuZ2VzdHVyZVNlbGVjdGlvbkNoYW5nZWQoKTtcbiAgICB9XG4gIH0sXG4gIHNlbGVjdGlvbkVuZCgpIHtcbiAgICBjb25zdCBlbmdpbmUgPSB0aGlzLmdldEVuZ2luZSgpO1xuICAgIGlmICghZW5naW5lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmlzQ2FwYWNpdG9yKCkpIHtcbiAgICAgIGVuZ2luZS5zZWxlY3Rpb25FbmQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbmdpbmUuZ2VzdHVyZVNlbGVjdGlvbkVuZCgpO1xuICAgIH1cbiAgfSxcbn07XG4vKipcbiAqIENoZWNrIHRvIHNlZSBpZiB0aGUgSGFwdGljIFBsdWdpbiBpcyBhdmFpbGFibGVcbiAqIEByZXR1cm4gUmV0dXJucyBgdHJ1ZWAgb3IgZmFsc2UgaWYgdGhlIHBsdWdpbiBpcyBhdmFpbGFibGVcbiAqL1xuY29uc3QgaGFwdGljQXZhaWxhYmxlID0gKCkgPT4ge1xuICByZXR1cm4gSGFwdGljRW5naW5lLmF2YWlsYWJsZSgpO1xufTtcbi8qKlxuICogVHJpZ2dlciBhIHNlbGVjdGlvbiBjaGFuZ2VkIGhhcHRpYyBldmVudC4gR29vZCBmb3Igb25lLXRpbWUgZXZlbnRzXG4gKiAobm90IGZvciBnZXN0dXJlcylcbiAqL1xuY29uc3QgaGFwdGljU2VsZWN0aW9uID0gKCkgPT4ge1xuICBoYXB0aWNBdmFpbGFibGUoKSAmJiBIYXB0aWNFbmdpbmUuc2VsZWN0aW9uKCk7XG59O1xuLyoqXG4gKiBUZWxsIHRoZSBoYXB0aWMgZW5naW5lIHRoYXQgYSBnZXN0dXJlIGZvciBhIHNlbGVjdGlvbiBjaGFuZ2UgaXMgc3RhcnRpbmcuXG4gKi9cbmNvbnN0IGhhcHRpY1NlbGVjdGlvblN0YXJ0ID0gKCkgPT4ge1xuICBoYXB0aWNBdmFpbGFibGUoKSAmJiBIYXB0aWNFbmdpbmUuc2VsZWN0aW9uU3RhcnQoKTtcbn07XG4vKipcbiAqIFRlbGwgdGhlIGhhcHRpYyBlbmdpbmUgdGhhdCBhIHNlbGVjdGlvbiBjaGFuZ2VkIGR1cmluZyBhIGdlc3R1cmUuXG4gKi9cbmNvbnN0IGhhcHRpY1NlbGVjdGlvbkNoYW5nZWQgPSAoKSA9PiB7XG4gIGhhcHRpY0F2YWlsYWJsZSgpICYmIEhhcHRpY0VuZ2luZS5zZWxlY3Rpb25DaGFuZ2VkKCk7XG59O1xuLyoqXG4gKiBUZWxsIHRoZSBoYXB0aWMgZW5naW5lIHdlIGFyZSBkb25lIHdpdGggYSBnZXN0dXJlLiBUaGlzIG5lZWRzIHRvIGJlXG4gKiBjYWxsZWQgbGVzdCByZXNvdXJjZXMgYXJlIG5vdCBwcm9wZXJseSByZWN5Y2xlZC5cbiAqL1xuY29uc3QgaGFwdGljU2VsZWN0aW9uRW5kID0gKCkgPT4ge1xuICBoYXB0aWNBdmFpbGFibGUoKSAmJiBIYXB0aWNFbmdpbmUuc2VsZWN0aW9uRW5kKCk7XG59O1xuLyoqXG4gKiBVc2UgdGhpcyB0byBpbmRpY2F0ZSBzdWNjZXNzL2ZhaWx1cmUvd2FybmluZyB0byB0aGUgdXNlci5cbiAqIG9wdGlvbnMgc2hvdWxkIGJlIG9mIHRoZSB0eXBlIGB7IHN0eWxlOiAnbGlnaHQnIH1gIChvciBgbWVkaXVtYC9gaGVhdnlgKVxuICovXG5jb25zdCBoYXB0aWNJbXBhY3QgPSAob3B0aW9ucykgPT4ge1xuICBoYXB0aWNBdmFpbGFibGUoKSAmJiBIYXB0aWNFbmdpbmUuaW1wYWN0KG9wdGlvbnMpO1xufTtcblxuZXhwb3J0IHsgaGFwdGljU2VsZWN0aW9uU3RhcnQgYXMgYSwgaGFwdGljU2VsZWN0aW9uQ2hhbmdlZCBhcyBiLCBoYXB0aWNTZWxlY3Rpb24gYXMgYywgaGFwdGljSW1wYWN0IGFzIGQsIGhhcHRpY1NlbGVjdGlvbkVuZCBhcyBoIH07XG4iLCIvKiFcbiAqIChDKSBJb25pYyBodHRwOi8vaW9uaWNmcmFtZXdvcmsuY29tIC0gTUlUIExpY2Vuc2VcbiAqL1xuLyogSW9uaWNvbnMgdjYuMS4zLCBFUyBNb2R1bGVzICovXG5jb25zdCBhcnJvd0JhY2tTaGFycCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PHBhdGggc3Ryb2tlLWxpbmVjYXA9J3NxdWFyZScgc3Ryb2tlLW1pdGVybGltaXQ9JzEwJyBzdHJva2Utd2lkdGg9JzQ4JyBkPSdNMjQ0IDQwMEwxMDAgMjU2bDE0NC0xNDRNMTIwIDI1NmgyOTInIGNsYXNzPSdpb25pY29uLWZpbGwtbm9uZScvPjwvc3ZnPlwiO1xuY29uc3QgYXJyb3dEb3duID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7dXRmOCw8c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgY2xhc3M9J2lvbmljb24nIHZpZXdCb3g9JzAgMCA1MTIgNTEyJz48cGF0aCBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIHN0cm9rZS13aWR0aD0nNDgnIGQ9J00xMTIgMjY4bDE0NCAxNDQgMTQ0LTE0NE0yNTYgMzkyVjEwMCcgY2xhc3M9J2lvbmljb24tZmlsbC1ub25lJy8+PC9zdmc+XCI7XG5jb25zdCBjYXJldEJhY2tTaGFycCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PHBhdGggZD0nTTM2OCA2NEwxNDQgMjU2bDIyNCAxOTJWNjR6Jy8+PC9zdmc+XCI7XG5jb25zdCBjYXJldERvd25TaGFycCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PHBhdGggZD0nTTY0IDE0NGwxOTIgMjI0IDE5Mi0yMjRINjR6Jy8+PC9zdmc+XCI7XG5jb25zdCBjYXJldFVwU2hhcnAgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDt1dGY4LDxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyBjbGFzcz0naW9uaWNvbicgdmlld0JveD0nMCAwIDUxMiA1MTInPjxwYXRoIGQ9J000NDggMzY4TDI1NiAxNDQgNjQgMzY4aDM4NHonLz48L3N2Zz5cIjtcbmNvbnN0IGNoZWNrbWFya091dGxpbmUgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDt1dGY4LDxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyBjbGFzcz0naW9uaWNvbicgdmlld0JveD0nMCAwIDUxMiA1MTInPjxwYXRoIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgZD0nTTQxNiAxMjhMMTkyIDM4NGwtOTYtOTYnIGNsYXNzPSdpb25pY29uLWZpbGwtbm9uZSBpb25pY29uLXN0cm9rZS13aWR0aCcvPjwvc3ZnPlwiO1xuY29uc3QgY2hldnJvbkJhY2sgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDt1dGY4LDxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyBjbGFzcz0naW9uaWNvbicgdmlld0JveD0nMCAwIDUxMiA1MTInPjxwYXRoIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlLXdpZHRoPSc0OCcgZD0nTTMyOCAxMTJMMTg0IDI1NmwxNDQgMTQ0JyBjbGFzcz0naW9uaWNvbi1maWxsLW5vbmUnLz48L3N2Zz5cIjtcbmNvbnN0IGNoZXZyb25Eb3duID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7dXRmOCw8c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgY2xhc3M9J2lvbmljb24nIHZpZXdCb3g9JzAgMCA1MTIgNTEyJz48cGF0aCBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIHN0cm9rZS13aWR0aD0nNDgnIGQ9J00xMTIgMTg0bDE0NCAxNDQgMTQ0LTE0NCcgY2xhc3M9J2lvbmljb24tZmlsbC1ub25lJy8+PC9zdmc+XCI7XG5jb25zdCBjaGV2cm9uRm9yd2FyZCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PHBhdGggc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBzdHJva2Utd2lkdGg9JzQ4JyBkPSdNMTg0IDExMmwxNDQgMTQ0LTE0NCAxNDQnIGNsYXNzPSdpb25pY29uLWZpbGwtbm9uZScvPjwvc3ZnPlwiO1xuY29uc3QgY2hldnJvbkZvcndhcmRPdXRsaW5lID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7dXRmOCw8c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgY2xhc3M9J2lvbmljb24nIHZpZXdCb3g9JzAgMCA1MTIgNTEyJz48cGF0aCBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIHN0cm9rZS13aWR0aD0nNDgnIGQ9J00xODQgMTEybDE0NCAxNDQtMTQ0IDE0NCcgY2xhc3M9J2lvbmljb24tZmlsbC1ub25lJy8+PC9zdmc+XCI7XG5jb25zdCBjbG9zZSA9IFwiZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PHBhdGggZD0nTTI4OS45NCAyNTZsOTUtOTVBMjQgMjQgMCAwMDM1MSAxMjdsLTk1IDk1LTk1LTk1YTI0IDI0IDAgMDAtMzQgMzRsOTUgOTUtOTUgOTVhMjQgMjQgMCAxMDM0IDM0bDk1LTk1IDk1IDk1YTI0IDI0IDAgMDAzNC0zNHonLz48L3N2Zz5cIjtcbmNvbnN0IGNsb3NlQ2lyY2xlID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7dXRmOCw8c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgY2xhc3M9J2lvbmljb24nIHZpZXdCb3g9JzAgMCA1MTIgNTEyJz48cGF0aCBkPSdNMjU2IDQ4QzE0MS4zMSA0OCA0OCAxNDEuMzEgNDggMjU2czkzLjMxIDIwOCAyMDggMjA4IDIwOC05My4zMSAyMDgtMjA4UzM3MC42OSA0OCAyNTYgNDh6bTc1LjMxIDI2MC42OWExNiAxNiAwIDExLTIyLjYyIDIyLjYyTDI1NiAyNzguNjNsLTUyLjY5IDUyLjY4YTE2IDE2IDAgMDEtMjIuNjItMjIuNjJMMjMzLjM3IDI1NmwtNTIuNjgtNTIuNjlhMTYgMTYgMCAwMTIyLjYyLTIyLjYyTDI1NiAyMzMuMzdsNTIuNjktNTIuNjhhMTYgMTYgMCAwMTIyLjYyIDIyLjYyTDI3OC42MyAyNTZ6Jy8+PC9zdmc+XCI7XG5jb25zdCBjbG9zZVNoYXJwID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7dXRmOCw8c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgY2xhc3M9J2lvbmljb24nIHZpZXdCb3g9JzAgMCA1MTIgNTEyJz48cGF0aCBkPSdNNDAwIDE0NS40OUwzNjYuNTEgMTEyIDI1NiAyMjIuNTEgMTQ1LjQ5IDExMiAxMTIgMTQ1LjQ5IDIyMi41MSAyNTYgMTEyIDM2Ni41MSAxNDUuNDkgNDAwIDI1NiAyODkuNDkgMzY2LjUxIDQwMCA0MDAgMzY2LjUxIDI4OS40OSAyNTYgNDAwIDE0NS40OXonLz48L3N2Zz5cIjtcbmNvbnN0IGVsbGlwc2VPdXRsaW5lID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7dXRmOCw8c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgY2xhc3M9J2lvbmljb24nIHZpZXdCb3g9JzAgMCA1MTIgNTEyJz48Y2lyY2xlIGN4PScyNTYnIGN5PScyNTYnIHI9JzE5Micgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBjbGFzcz0naW9uaWNvbi1maWxsLW5vbmUgaW9uaWNvbi1zdHJva2Utd2lkdGgnLz48L3N2Zz5cIjtcbmNvbnN0IGVsbGlwc2lzSG9yaXpvbnRhbCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PGNpcmNsZSBjeD0nMjU2JyBjeT0nMjU2JyByPSc0OCcvPjxjaXJjbGUgY3g9JzQxNicgY3k9JzI1Nicgcj0nNDgnLz48Y2lyY2xlIGN4PSc5NicgY3k9JzI1Nicgcj0nNDgnLz48L3N2Zz5cIjtcbmNvbnN0IG1lbnVPdXRsaW5lID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7dXRmOCw8c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgY2xhc3M9J2lvbmljb24nIHZpZXdCb3g9JzAgMCA1MTIgNTEyJz48cGF0aCBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1taXRlcmxpbWl0PScxMCcgZD0nTTgwIDE2MGgzNTJNODAgMjU2aDM1Mk04MCAzNTJoMzUyJyBjbGFzcz0naW9uaWNvbi1maWxsLW5vbmUgaW9uaWNvbi1zdHJva2Utd2lkdGgnLz48L3N2Zz5cIjtcbmNvbnN0IG1lbnVTaGFycCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PHBhdGggZD0nTTY0IDM4NGgzODR2LTQyLjY3SDY0em0wLTEwNi42N2gzODR2LTQyLjY2SDY0ek02NCAxMjh2NDIuNjdoMzg0VjEyOHonLz48L3N2Zz5cIjtcbmNvbnN0IHJlbW92ZU91dGxpbmUgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDt1dGY4LDxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyBjbGFzcz0naW9uaWNvbicgdmlld0JveD0nMCAwIDUxMiA1MTInPjxwYXRoIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgZD0nTTQwMCAyNTZIMTEyJyBjbGFzcz0naW9uaWNvbi1maWxsLW5vbmUgaW9uaWNvbi1zdHJva2Utd2lkdGgnLz48L3N2Zz5cIjtcbmNvbnN0IHJlb3JkZXJUaHJlZU91dGxpbmUgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDt1dGY4LDxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyBjbGFzcz0naW9uaWNvbicgdmlld0JveD0nMCAwIDUxMiA1MTInPjxwYXRoIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgZD0nTTk2IDI1NmgzMjBNOTYgMTc2aDMyME05NiAzMzZoMzIwJyBjbGFzcz0naW9uaWNvbi1maWxsLW5vbmUgaW9uaWNvbi1zdHJva2Utd2lkdGgnLz48L3N2Zz5cIjtcbmNvbnN0IHJlb3JkZXJUd29TaGFycCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PHBhdGggc3Ryb2tlLWxpbmVjYXA9J3NxdWFyZScgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlLXdpZHRoPSc0NCcgZD0nTTExOCAzMDRoMjc2TTExOCAyMDhoMjc2JyBjbGFzcz0naW9uaWNvbi1maWxsLW5vbmUnLz48L3N2Zz5cIjtcbmNvbnN0IHNlYXJjaE91dGxpbmUgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDt1dGY4LDxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyBjbGFzcz0naW9uaWNvbicgdmlld0JveD0nMCAwIDUxMiA1MTInPjxwYXRoIGQ9J00yMjEuMDkgNjRhMTU3LjA5IDE1Ny4wOSAwIDEwMTU3LjA5IDE1Ny4wOUExNTcuMSAxNTcuMSAwIDAwMjIxLjA5IDY0eicgc3Ryb2tlLW1pdGVybGltaXQ9JzEwJyBjbGFzcz0naW9uaWNvbi1maWxsLW5vbmUgaW9uaWNvbi1zdHJva2Utd2lkdGgnLz48cGF0aCBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1taXRlcmxpbWl0PScxMCcgZD0nTTMzOC4yOSAzMzguMjlMNDQ4IDQ0OCcgY2xhc3M9J2lvbmljb24tZmlsbC1ub25lIGlvbmljb24tc3Ryb2tlLXdpZHRoJy8+PC9zdmc+XCI7XG5jb25zdCBzZWFyY2hTaGFycCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PHBhdGggZD0nTTQ2NCA0MjhMMzM5LjkyIDMwMy45YTE2MC40OCAxNjAuNDggMCAwMDMwLjcyLTk0LjU4QzM3MC42NCAxMjAuMzcgMjk4LjI3IDQ4IDIwOS4zMiA0OFM0OCAxMjAuMzcgNDggMjA5LjMyczcyLjM3IDE2MS4zMiAxNjEuMzIgMTYxLjMyYTE2MC40OCAxNjAuNDggMCAwMDk0LjU4LTMwLjcyTDQyOCA0NjR6TTIwOS4zMiAzMTkuNjlhMTEwLjM4IDExMC4zOCAwIDExMTEwLjM3LTExMC4zNyAxMTAuNSAxMTAuNSAwIDAxLTExMC4zNyAxMTAuMzd6Jy8+PC9zdmc+XCI7XG5cbmV4cG9ydCB7IGFycm93QmFja1NoYXJwIGFzIGEsIGNsb3NlQ2lyY2xlIGFzIGIsIGNoZXZyb25CYWNrIGFzIGMsIGNsb3NlU2hhcnAgYXMgZCwgc2VhcmNoU2hhcnAgYXMgZSwgY2hlY2ttYXJrT3V0bGluZSBhcyBmLCBlbGxpcHNlT3V0bGluZSBhcyBnLCBjYXJldEJhY2tTaGFycCBhcyBoLCBhcnJvd0Rvd24gYXMgaSwgcmVvcmRlclRocmVlT3V0bGluZSBhcyBqLCByZW9yZGVyVHdvU2hhcnAgYXMgaywgY2hldnJvbkRvd24gYXMgbCwgY2hldnJvbkZvcndhcmRPdXRsaW5lIGFzIG0sIGVsbGlwc2lzSG9yaXpvbnRhbCBhcyBuLCBjaGV2cm9uRm9yd2FyZCBhcyBvLCBjYXJldFVwU2hhcnAgYXMgcCwgY2FyZXREb3duU2hhcnAgYXMgcSwgcmVtb3ZlT3V0bGluZSBhcyByLCBzZWFyY2hPdXRsaW5lIGFzIHMsIGNsb3NlIGFzIHQsIG1lbnVPdXRsaW5lIGFzIHUsIG1lbnVTaGFycCBhcyB2IH07XG4iLCIvKiFcbiAqIChDKSBJb25pYyBodHRwOi8vaW9uaWNmcmFtZXdvcmsuY29tIC0gTUlUIExpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgYyBhcyBjb21wb25lbnRPblJlYWR5IH0gZnJvbSAnLi9oZWxwZXJzLTNiMzkwZTQ4LmpzJztcbmltcG9ydCB7IGEgYXMgcHJpbnRSZXF1aXJlZEVsZW1lbnRFcnJvciB9IGZyb20gJy4vaW5kZXgtYzRiMTE2NzYuanMnO1xuXG5jb25zdCBJT05fQ09OVEVOVF9UQUdfTkFNRSA9ICdJT04tQ09OVEVOVCc7XG5jb25zdCBJT05fQ09OVEVOVF9FTEVNRU5UX1NFTEVDVE9SID0gJ2lvbi1jb250ZW50JztcbmNvbnN0IElPTl9DT05URU5UX0NMQVNTX1NFTEVDVE9SID0gJy5pb24tY29udGVudC1zY3JvbGwtaG9zdCc7XG4vKipcbiAqIFNlbGVjdG9yIHVzZWQgZm9yIGltcGxlbWVudGF0aW9ucyByZWxpYW50IG9uIGA8aW9uLWNvbnRlbnQ+YCBmb3Igc2Nyb2xsIGV2ZW50IGNoYW5nZXMuXG4gKlxuICogRGV2ZWxvcGVycyBzaG91bGQgdXNlIHRoZSBgLmlvbi1jb250ZW50LXNjcm9sbC1ob3N0YCBzZWxlY3RvciB0byB0YXJnZXQgdGhlIGVsZW1lbnQgZW1pdHRpbmdcbiAqIHNjcm9sbCBldmVudHMuIFdpdGggdmlydHVhbCBzY3JvbGwgaW1wbGVtZW50YXRpb25zIHRoaXMgd2lsbCBiZSB0aGUgaG9zdCBlbGVtZW50IGZvclxuICogdGhlIHNjcm9sbCB2aWV3cG9ydC5cbiAqL1xuY29uc3QgSU9OX0NPTlRFTlRfU0VMRUNUT1IgPSBgJHtJT05fQ09OVEVOVF9FTEVNRU5UX1NFTEVDVE9SfSwgJHtJT05fQ09OVEVOVF9DTEFTU19TRUxFQ1RPUn1gO1xuY29uc3QgaXNJb25Db250ZW50ID0gKGVsKSA9PiBlbC50YWdOYW1lID09PSBJT05fQ09OVEVOVF9UQUdfTkFNRTtcbi8qKlxuICogV2FpdHMgZm9yIHRoZSBlbGVtZW50IGhvc3QgZnVsbHkgaW5pdGlhbGl6ZSBiZWZvcmVcbiAqIHJldHVybmluZyB0aGUgaW5uZXIgc2Nyb2xsIGVsZW1lbnQuXG4gKlxuICogRm9yIGBpb24tY29udGVudGAgdGhlIHNjcm9sbCB0YXJnZXQgd2lsbCBiZSB0aGUgcmVzdWx0XG4gKiBvZiB0aGUgYGdldFNjcm9sbEVsZW1lbnRgIGZ1bmN0aW9uLlxuICpcbiAqIEZvciBjdXN0b20gaW1wbGVtZW50YXRpb25zIGl0IHdpbGwgYmUgdGhlIGVsZW1lbnQgaG9zdFxuICogb3IgYSBzZWxlY3RvciB3aXRoaW4gdGhlIGhvc3QsIGlmIHN1cHBsaWVkIHRocm91Z2ggYHNjcm9sbFRhcmdldGAuXG4gKi9cbmNvbnN0IGdldFNjcm9sbEVsZW1lbnQgPSBhc3luYyAoZWwpID0+IHtcbiAgaWYgKGlzSW9uQ29udGVudChlbCkpIHtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gY29tcG9uZW50T25SZWFkeShlbCwgcmVzb2x2ZSkpO1xuICAgIHJldHVybiBlbC5nZXRTY3JvbGxFbGVtZW50KCk7XG4gIH1cbiAgcmV0dXJuIGVsO1xufTtcbi8qKlxuICogUXVlcmllcyB0aGUgZWxlbWVudCBtYXRjaGluZyB0aGUgc2VsZWN0b3IgZm9yIElvbkNvbnRlbnQuXG4gKiBTZWUgSU9OX0NPTlRFTlRfU0VMRUNUT1IgZm9yIHRoZSBzZWxlY3RvciB1c2VkLlxuICovXG5jb25zdCBmaW5kSW9uQ29udGVudCA9IChlbCkgPT4ge1xuICAvKipcbiAgICogRmlyc3Qgd2UgdHJ5IHRvIHF1ZXJ5IHRoZSBjdXN0b20gc2Nyb2xsIGhvc3Qgc2VsZWN0b3IgaW4gY2FzZXMgd2hlcmVcbiAgICogdGhlIGltcGxlbWVudGF0aW9uIGlzIHVzaW5nIGFuIG91dGVyIGBpb24tY29udGVudGAgd2l0aCBhbiBpbm5lciBjdXN0b21cbiAgICogc2Nyb2xsIGNvbnRhaW5lci5cbiAgICovXG4gIGNvbnN0IGN1c3RvbUNvbnRlbnRIb3N0ID0gZWwucXVlcnlTZWxlY3RvcihJT05fQ09OVEVOVF9DTEFTU19TRUxFQ1RPUik7XG4gIGlmIChjdXN0b21Db250ZW50SG9zdCkge1xuICAgIHJldHVybiBjdXN0b21Db250ZW50SG9zdDtcbiAgfVxuICByZXR1cm4gZWwucXVlcnlTZWxlY3RvcihJT05fQ09OVEVOVF9TRUxFQ1RPUik7XG59O1xuLyoqXG4gKiBRdWVyaWVzIHRoZSBjbG9zZXN0IGVsZW1lbnQgbWF0Y2hpbmcgdGhlIHNlbGVjdG9yIGZvciBJb25Db250ZW50LlxuICovXG5jb25zdCBmaW5kQ2xvc2VzdElvbkNvbnRlbnQgPSAoZWwpID0+IHtcbiAgcmV0dXJuIGVsLmNsb3Nlc3QoSU9OX0NPTlRFTlRfU0VMRUNUT1IpO1xufTtcbi8qKlxuICogU2Nyb2xscyB0byB0aGUgdG9wIG9mIHRoZSBlbGVtZW50LiBJZiBhbiBgaW9uLWNvbnRlbnRgIGlzIGZvdW5kLCBpdCB3aWxsIHNjcm9sbFxuICogdXNpbmcgdGhlIHB1YmxpYyBBUEkgYHNjcm9sbFRvVG9wYCB3aXRoIGEgZHVyYXRpb24uXG4gKi9cbi8vIFRPRE8oRlctMjgzMik6IHR5cGVcbmNvbnN0IHNjcm9sbFRvVG9wID0gKGVsLCBkdXJhdGlvbk1zKSA9PiB7XG4gIGlmIChpc0lvbkNvbnRlbnQoZWwpKSB7XG4gICAgY29uc3QgY29udGVudCA9IGVsO1xuICAgIHJldHVybiBjb250ZW50LnNjcm9sbFRvVG9wKGR1cmF0aW9uTXMpO1xuICB9XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoZWwuc2Nyb2xsVG8oe1xuICAgIHRvcDogMCxcbiAgICBsZWZ0OiAwLFxuICAgIGJlaGF2aW9yOiBkdXJhdGlvbk1zID4gMCA/ICdzbW9vdGgnIDogJ2F1dG8nLFxuICB9KSk7XG59O1xuLyoqXG4gKiBTY3JvbGxzIGJ5IGEgc3BlY2lmaWVkIFgvWSBkaXN0YW5jZSBpbiB0aGUgY29tcG9uZW50LiBJZiBhbiBgaW9uLWNvbnRlbnRgIGlzIGZvdW5kLCBpdCB3aWxsIHNjcm9sbFxuICogdXNpbmcgdGhlIHB1YmxpYyBBUEkgYHNjcm9sbEJ5UG9pbnRgIHdpdGggYSBkdXJhdGlvbi5cbiAqL1xuY29uc3Qgc2Nyb2xsQnlQb2ludCA9IChlbCwgeCwgeSwgZHVyYXRpb25NcykgPT4ge1xuICBpZiAoaXNJb25Db250ZW50KGVsKSkge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBlbDtcbiAgICByZXR1cm4gY29udGVudC5zY3JvbGxCeVBvaW50KHgsIHksIGR1cmF0aW9uTXMpO1xuICB9XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoZWwuc2Nyb2xsQnkoe1xuICAgIHRvcDogeSxcbiAgICBsZWZ0OiB4LFxuICAgIGJlaGF2aW9yOiBkdXJhdGlvbk1zID4gMCA/ICdzbW9vdGgnIDogJ2F1dG8nLFxuICB9KSk7XG59O1xuLyoqXG4gKiBQcmludHMgYW4gZXJyb3IgaW5mb3JtaW5nIGRldmVsb3BlcnMgdGhhdCBhbiBpbXBsZW1lbnRhdGlvbiByZXF1aXJlcyBhbiBlbGVtZW50IHRvIGJlIHVzZWRcbiAqIHdpdGhpbiBlaXRoZXIgdGhlIGBpb24tY29udGVudGAgc2VsZWN0b3Igb3IgdGhlIGAuaW9uLWNvbnRlbnQtc2Nyb2xsLWhvc3RgIGNsYXNzLlxuICovXG5jb25zdCBwcmludElvbkNvbnRlbnRFcnJvck1zZyA9IChlbCkgPT4ge1xuICByZXR1cm4gcHJpbnRSZXF1aXJlZEVsZW1lbnRFcnJvcihlbCwgSU9OX0NPTlRFTlRfRUxFTUVOVF9TRUxFQ1RPUik7XG59O1xuLyoqXG4gKiBTZXZlcmFsIGNvbXBvbmVudHMgaW4gSW9uaWMgbmVlZCB0byBwcmV2ZW50IHNjcm9sbGluZ1xuICogZHVyaW5nIGEgZ2VzdHVyZSAoY2FyZCBtb2RhbCwgcmFuZ2UsIGl0ZW0gc2xpZGluZywgZXRjKS5cbiAqIFVzZSB0aGlzIHV0aWxpdHkgdG8gYWNjb3VudCBmb3IgaW9uLWNvbnRlbnQgYW5kIGN1c3RvbSBjb250ZW50IGhvc3RzLlxuICovXG5jb25zdCBkaXNhYmxlQ29udGVudFNjcm9sbFkgPSAoY29udGVudEVsKSA9PiB7XG4gIGlmIChpc0lvbkNvbnRlbnQoY29udGVudEVsKSkge1xuICAgIGNvbnN0IGlvbkNvbnRlbnQgPSBjb250ZW50RWw7XG4gICAgY29uc3QgaW5pdGlhbFNjcm9sbFkgPSBpb25Db250ZW50LnNjcm9sbFk7XG4gICAgaW9uQ29udGVudC5zY3JvbGxZID0gZmFsc2U7XG4gICAgLyoqXG4gICAgICogVGhpcyBzaG91bGQgYmUgcGFzc2VkIGludG8gcmVzZXRDb250ZW50U2Nyb2xsWVxuICAgICAqIHNvIHRoYXQgd2UgY2FuIHJldmVydCBpb24tY29udGVudCdzIHNjcm9sbFkgdG8gdGhlXG4gICAgICogY29ycmVjdCBzdGF0ZS4gRm9yIGV4YW1wbGUsIGlmIHNjcm9sbFkgPSBmYWxzZVxuICAgICAqIGluaXRpYWxseSwgd2UgZG8gbm90IHdhbnQgdG8gZW5hYmxlIHNjcm9sbGluZ1xuICAgICAqIHdoZW4gd2UgY2FsbCByZXNldENvbnRlbnRTY3JvbGxZLlxuICAgICAqL1xuICAgIHJldHVybiBpbml0aWFsU2Nyb2xsWTtcbiAgfVxuICBlbHNlIHtcbiAgICBjb250ZW50RWwuc3R5bGUuc2V0UHJvcGVydHkoJ292ZXJmbG93JywgJ2hpZGRlbicpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuY29uc3QgcmVzZXRDb250ZW50U2Nyb2xsWSA9IChjb250ZW50RWwsIGluaXRpYWxTY3JvbGxZKSA9PiB7XG4gIGlmIChpc0lvbkNvbnRlbnQoY29udGVudEVsKSkge1xuICAgIGNvbnRlbnRFbC5zY3JvbGxZID0gaW5pdGlhbFNjcm9sbFk7XG4gIH1cbiAgZWxzZSB7XG4gICAgY29udGVudEVsLnN0eWxlLnJlbW92ZVByb3BlcnR5KCdvdmVyZmxvdycpO1xuICB9XG59O1xuXG5leHBvcnQgeyBJT05fQ09OVEVOVF9FTEVNRU5UX1NFTEVDVE9SIGFzIEksIGZpbmRJb25Db250ZW50IGFzIGEsIElPTl9DT05URU5UX0NMQVNTX1NFTEVDVE9SIGFzIGIsIHNjcm9sbEJ5UG9pbnQgYXMgYywgZGlzYWJsZUNvbnRlbnRTY3JvbGxZIGFzIGQsIGZpbmRDbG9zZXN0SW9uQ29udGVudCBhcyBmLCBnZXRTY3JvbGxFbGVtZW50IGFzIGcsIGlzSW9uQ29udGVudCBhcyBpLCBwcmludElvbkNvbnRlbnRFcnJvck1zZyBhcyBwLCByZXNldENvbnRlbnRTY3JvbGxZIGFzIHIsIHNjcm9sbFRvVG9wIGFzIHMgfTtcbiIsIi8qIVxuICogKEMpIElvbmljIGh0dHA6Ly9pb25pY2ZyYW1ld29yay5jb20gLSBNSVQgTGljZW5zZVxuICovXG5jb25zdCBLRVlCT0FSRF9ESURfT1BFTiA9ICdpb25LZXlib2FyZERpZFNob3cnO1xuY29uc3QgS0VZQk9BUkRfRElEX0NMT1NFID0gJ2lvbktleWJvYXJkRGlkSGlkZSc7XG5jb25zdCBLRVlCT0FSRF9USFJFU0hPTEQgPSAxNTA7XG4vLyBUT0RPKEZXLTI4MzIpOiB0eXBlc1xubGV0IHByZXZpb3VzVmlzdWFsVmlld3BvcnQgPSB7fTtcbmxldCBjdXJyZW50VmlzdWFsVmlld3BvcnQgPSB7fTtcbmxldCBrZXlib2FyZE9wZW4gPSBmYWxzZTtcbi8qKlxuICogVGhpcyBpcyBvbmx5IHVzZWQgZm9yIHRlc3RzXG4gKi9cbmNvbnN0IHJlc2V0S2V5Ym9hcmRBc3Npc3QgPSAoKSA9PiB7XG4gIHByZXZpb3VzVmlzdWFsVmlld3BvcnQgPSB7fTtcbiAgY3VycmVudFZpc3VhbFZpZXdwb3J0ID0ge307XG4gIGtleWJvYXJkT3BlbiA9IGZhbHNlO1xufTtcbmNvbnN0IHN0YXJ0S2V5Ym9hcmRBc3Npc3QgPSAod2luKSA9PiB7XG4gIHN0YXJ0TmF0aXZlTGlzdGVuZXJzKHdpbik7XG4gIGlmICghd2luLnZpc3VhbFZpZXdwb3J0KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGN1cnJlbnRWaXN1YWxWaWV3cG9ydCA9IGNvcHlWaXN1YWxWaWV3cG9ydCh3aW4udmlzdWFsVmlld3BvcnQpO1xuICB3aW4udmlzdWFsVmlld3BvcnQub25yZXNpemUgPSAoKSA9PiB7XG4gICAgdHJhY2tWaWV3cG9ydENoYW5nZXMod2luKTtcbiAgICBpZiAoa2V5Ym9hcmREaWRPcGVuKCkgfHwga2V5Ym9hcmREaWRSZXNpemUod2luKSkge1xuICAgICAgc2V0S2V5Ym9hcmRPcGVuKHdpbik7XG4gICAgfVxuICAgIGVsc2UgaWYgKGtleWJvYXJkRGlkQ2xvc2Uod2luKSkge1xuICAgICAgc2V0S2V5Ym9hcmRDbG9zZSh3aW4pO1xuICAgIH1cbiAgfTtcbn07XG4vKipcbiAqIExpc3RlbiBmb3IgZXZlbnRzIGZpcmVkIGJ5IG5hdGl2ZSBrZXlib2FyZCBwbHVnaW5cbiAqIGluIENhcGFjaXRvci9Db3Jkb3ZhIHNvIGRldnMgb25seSBuZWVkIHRvIGxpc3RlblxuICogaW4gb25lIHBsYWNlLlxuICovXG5jb25zdCBzdGFydE5hdGl2ZUxpc3RlbmVycyA9ICh3aW4pID0+IHtcbiAgd2luLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWJvYXJkRGlkU2hvdycsIChldikgPT4gc2V0S2V5Ym9hcmRPcGVuKHdpbiwgZXYpKTtcbiAgd2luLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWJvYXJkRGlkSGlkZScsICgpID0+IHNldEtleWJvYXJkQ2xvc2Uod2luKSk7XG59O1xuY29uc3Qgc2V0S2V5Ym9hcmRPcGVuID0gKHdpbiwgZXYpID0+IHtcbiAgZmlyZUtleWJvYXJkT3BlbkV2ZW50KHdpbiwgZXYpO1xuICBrZXlib2FyZE9wZW4gPSB0cnVlO1xufTtcbmNvbnN0IHNldEtleWJvYXJkQ2xvc2UgPSAod2luKSA9PiB7XG4gIGZpcmVLZXlib2FyZENsb3NlRXZlbnQod2luKTtcbiAga2V5Ym9hcmRPcGVuID0gZmFsc2U7XG59O1xuLyoqXG4gKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYGtleWJvYXJkT3BlbmAgZmxhZyBpcyBub3RcbiAqIHNldCwgdGhlIHByZXZpb3VzIHZpc3VhbCB2aWV3cG9ydCB3aWR0aCBlcXVhbCB0aGUgY3VycmVudFxuICogdmlzdWFsIHZpZXdwb3J0IHdpZHRoLCBhbmQgaWYgdGhlIHNjYWxlZCBkaWZmZXJlbmNlXG4gKiBvZiB0aGUgcHJldmlvdXMgdmlzdWFsIHZpZXdwb3J0IGhlaWdodCBtaW51cyB0aGUgY3VycmVudFxuICogdmlzdWFsIHZpZXdwb3J0IGhlaWdodCBpcyBncmVhdGVyIHRoYW4gS0VZQk9BUkRfVEhSRVNIT0xEXG4gKlxuICogV2UgbmVlZCB0byBiZSBhYmxlIHRvIGFjY29tbW9kYXRlIHVzZXJzIHdobyBoYXZlIHpvb21pbmdcbiAqIGVuYWJsZWQgaW4gdGhlaXIgYnJvd3NlciAob3IgaGF2ZSB6b29tZWQgaW4gbWFudWFsbHkpIHdoaWNoXG4gKiBpcyB3aHkgd2UgdGFrZSBpbnRvIGFjY291bnQgdGhlIGN1cnJlbnQgdmlzdWFsIHZpZXdwb3J0J3NcbiAqIHNjYWxlIHZhbHVlLlxuICovXG5jb25zdCBrZXlib2FyZERpZE9wZW4gPSAoKSA9PiB7XG4gIGNvbnN0IHNjYWxlZEhlaWdodERpZmZlcmVuY2UgPSAocHJldmlvdXNWaXN1YWxWaWV3cG9ydC5oZWlnaHQgLSBjdXJyZW50VmlzdWFsVmlld3BvcnQuaGVpZ2h0KSAqIGN1cnJlbnRWaXN1YWxWaWV3cG9ydC5zY2FsZTtcbiAgcmV0dXJuICgha2V5Ym9hcmRPcGVuICYmXG4gICAgcHJldmlvdXNWaXN1YWxWaWV3cG9ydC53aWR0aCA9PT0gY3VycmVudFZpc3VhbFZpZXdwb3J0LndpZHRoICYmXG4gICAgc2NhbGVkSGVpZ2h0RGlmZmVyZW5jZSA+IEtFWUJPQVJEX1RIUkVTSE9MRCk7XG59O1xuLyoqXG4gKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUga2V5Ym9hcmQgaXMgb3BlbixcbiAqIGJ1dCB0aGUga2V5Ym9hcmQgZGlkIG5vdCBjbG9zZVxuICovXG5jb25zdCBrZXlib2FyZERpZFJlc2l6ZSA9ICh3aW4pID0+IHtcbiAgcmV0dXJuIGtleWJvYXJkT3BlbiAmJiAha2V5Ym9hcmREaWRDbG9zZSh3aW4pO1xufTtcbi8qKlxuICogRGV0ZXJtaW5lIGlmIHRoZSBrZXlib2FyZCB3YXMgY2xvc2VkXG4gKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYGtleWJvYXJkT3BlbmAgZmxhZyBpcyBzZXQgYW5kXG4gKiB0aGUgY3VycmVudCB2aXN1YWwgdmlld3BvcnQgaGVpZ2h0IGVxdWFscyB0aGVcbiAqIGxheW91dCB2aWV3cG9ydCBoZWlnaHQuXG4gKi9cbmNvbnN0IGtleWJvYXJkRGlkQ2xvc2UgPSAod2luKSA9PiB7XG4gIHJldHVybiBrZXlib2FyZE9wZW4gJiYgY3VycmVudFZpc3VhbFZpZXdwb3J0LmhlaWdodCA9PT0gd2luLmlubmVySGVpZ2h0O1xufTtcbi8qKlxuICogRGlzcGF0Y2ggYSBrZXlib2FyZCBvcGVuIGV2ZW50XG4gKi9cbmNvbnN0IGZpcmVLZXlib2FyZE9wZW5FdmVudCA9ICh3aW4sIG5hdGl2ZUV2KSA9PiB7XG4gIGNvbnN0IGtleWJvYXJkSGVpZ2h0ID0gbmF0aXZlRXYgPyBuYXRpdmVFdi5rZXlib2FyZEhlaWdodCA6IHdpbi5pbm5lckhlaWdodCAtIGN1cnJlbnRWaXN1YWxWaWV3cG9ydC5oZWlnaHQ7XG4gIGNvbnN0IGV2ID0gbmV3IEN1c3RvbUV2ZW50KEtFWUJPQVJEX0RJRF9PUEVOLCB7XG4gICAgZGV0YWlsOiB7IGtleWJvYXJkSGVpZ2h0IH0sXG4gIH0pO1xuICB3aW4uZGlzcGF0Y2hFdmVudChldik7XG59O1xuLyoqXG4gKiBEaXNwYXRjaCBhIGtleWJvYXJkIGNsb3NlIGV2ZW50XG4gKi9cbmNvbnN0IGZpcmVLZXlib2FyZENsb3NlRXZlbnQgPSAod2luKSA9PiB7XG4gIGNvbnN0IGV2ID0gbmV3IEN1c3RvbUV2ZW50KEtFWUJPQVJEX0RJRF9DTE9TRSk7XG4gIHdpbi5kaXNwYXRjaEV2ZW50KGV2KTtcbn07XG4vKipcbiAqIEdpdmVuIGEgd2luZG93IG9iamVjdCwgY3JlYXRlIGEgY29weSBvZlxuICogdGhlIGN1cnJlbnQgdmlzdWFsIGFuZCBsYXlvdXQgdmlld3BvcnQgc3RhdGVzXG4gKiB3aGlsZSBhbHNvIHByZXNlcnZpbmcgdGhlIHByZXZpb3VzIHZpc3VhbCBhbmRcbiAqIGxheW91dCB2aWV3cG9ydCBzdGF0ZXNcbiAqL1xuY29uc3QgdHJhY2tWaWV3cG9ydENoYW5nZXMgPSAod2luKSA9PiB7XG4gIHByZXZpb3VzVmlzdWFsVmlld3BvcnQgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50VmlzdWFsVmlld3BvcnQpO1xuICBjdXJyZW50VmlzdWFsVmlld3BvcnQgPSBjb3B5VmlzdWFsVmlld3BvcnQod2luLnZpc3VhbFZpZXdwb3J0KTtcbn07XG4vKipcbiAqIENyZWF0ZXMgYSBkZWVwIGNvcHkgb2YgdGhlIHZpc3VhbCB2aWV3cG9ydFxuICogYXQgYSBnaXZlbiBzdGF0ZVxuICovXG5jb25zdCBjb3B5VmlzdWFsVmlld3BvcnQgPSAodmlzdWFsVmlld3BvcnQpID0+IHtcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogTWF0aC5yb3VuZCh2aXN1YWxWaWV3cG9ydC53aWR0aCksXG4gICAgaGVpZ2h0OiBNYXRoLnJvdW5kKHZpc3VhbFZpZXdwb3J0LmhlaWdodCksXG4gICAgb2Zmc2V0VG9wOiB2aXN1YWxWaWV3cG9ydC5vZmZzZXRUb3AsXG4gICAgb2Zmc2V0TGVmdDogdmlzdWFsVmlld3BvcnQub2Zmc2V0TGVmdCxcbiAgICBwYWdlVG9wOiB2aXN1YWxWaWV3cG9ydC5wYWdlVG9wLFxuICAgIHBhZ2VMZWZ0OiB2aXN1YWxWaWV3cG9ydC5wYWdlTGVmdCxcbiAgICBzY2FsZTogdmlzdWFsVmlld3BvcnQuc2NhbGUsXG4gIH07XG59O1xuXG5leHBvcnQgeyBLRVlCT0FSRF9ESURfQ0xPU0UsIEtFWUJPQVJEX0RJRF9PUEVOLCBjb3B5VmlzdWFsVmlld3BvcnQsIGtleWJvYXJkRGlkQ2xvc2UsIGtleWJvYXJkRGlkT3Blbiwga2V5Ym9hcmREaWRSZXNpemUsIHJlc2V0S2V5Ym9hcmRBc3Npc3QsIHNldEtleWJvYXJkQ2xvc2UsIHNldEtleWJvYXJkT3Blbiwgc3RhcnRLZXlib2FyZEFzc2lzdCwgdHJhY2tWaWV3cG9ydENoYW5nZXMgfTtcbiIsIi8qIVxuICogKEMpIElvbmljIGh0dHA6Ly9pb25pY2ZyYW1ld29yay5jb20gLSBNSVQgTGljZW5zZVxuICovXG5pbXBvcnQgeyB3IGFzIHdpbiB9IGZyb20gJy4vaW5kZXgtMzNmZmVjMjUuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjb250cm9sbGVyIHRoYXQgdHJhY2tzIGFuZCByZWFjdHMgdG8gb3BlbmluZyBvciBjbG9zaW5nIHRoZSBrZXlib2FyZC5cbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwYXJhbSBrZXlib2FyZENoYW5nZUNhbGxiYWNrIEEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSBrZXlib2FyZCBvcGVucyBvciBjbG9zZXMuXG4gKi9cbmNvbnN0IGNyZWF0ZUtleWJvYXJkQ29udHJvbGxlciA9IChrZXlib2FyZENoYW5nZUNhbGxiYWNrKSA9PiB7XG4gIGxldCBrZXlib2FyZFdpbGxTaG93SGFuZGxlcjtcbiAgbGV0IGtleWJvYXJkV2lsbEhpZGVIYW5kbGVyO1xuICBsZXQga2V5Ym9hcmRWaXNpYmxlO1xuICBjb25zdCBpbml0ID0gKCkgPT4ge1xuICAgIGtleWJvYXJkV2lsbFNob3dIYW5kbGVyID0gKCkgPT4ge1xuICAgICAga2V5Ym9hcmRWaXNpYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChrZXlib2FyZENoYW5nZUNhbGxiYWNrKVxuICAgICAgICBrZXlib2FyZENoYW5nZUNhbGxiYWNrKHRydWUpO1xuICAgIH07XG4gICAga2V5Ym9hcmRXaWxsSGlkZUhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICBrZXlib2FyZFZpc2libGUgPSBmYWxzZTtcbiAgICAgIGlmIChrZXlib2FyZENoYW5nZUNhbGxiYWNrKVxuICAgICAgICBrZXlib2FyZENoYW5nZUNhbGxiYWNrKGZhbHNlKTtcbiAgICB9O1xuICAgIHdpbiA9PT0gbnVsbCB8fCB3aW4gPT09IHZvaWQgMCA/IHZvaWQgMCA6IHdpbi5hZGRFdmVudExpc3RlbmVyKCdrZXlib2FyZFdpbGxTaG93Jywga2V5Ym9hcmRXaWxsU2hvd0hhbmRsZXIpO1xuICAgIHdpbiA9PT0gbnVsbCB8fCB3aW4gPT09IHZvaWQgMCA/IHZvaWQgMCA6IHdpbi5hZGRFdmVudExpc3RlbmVyKCdrZXlib2FyZFdpbGxIaWRlJywga2V5Ym9hcmRXaWxsSGlkZUhhbmRsZXIpO1xuICB9O1xuICBjb25zdCBkZXN0cm95ID0gKCkgPT4ge1xuICAgIHdpbiA9PT0gbnVsbCB8fCB3aW4gPT09IHZvaWQgMCA/IHZvaWQgMCA6IHdpbi5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlib2FyZFdpbGxTaG93Jywga2V5Ym9hcmRXaWxsU2hvd0hhbmRsZXIpO1xuICAgIHdpbiA9PT0gbnVsbCB8fCB3aW4gPT09IHZvaWQgMCA/IHZvaWQgMCA6IHdpbi5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlib2FyZFdpbGxIaWRlJywga2V5Ym9hcmRXaWxsSGlkZUhhbmRsZXIpO1xuICAgIGtleWJvYXJkV2lsbFNob3dIYW5kbGVyID0ga2V5Ym9hcmRXaWxsSGlkZUhhbmRsZXIgPSB1bmRlZmluZWQ7XG4gIH07XG4gIGNvbnN0IGlzS2V5Ym9hcmRWaXNpYmxlID0gKCkgPT4ga2V5Ym9hcmRWaXNpYmxlO1xuICBpbml0KCk7XG4gIHJldHVybiB7IGluaXQsIGRlc3Ryb3ksIGlzS2V5Ym9hcmRWaXNpYmxlIH07XG59O1xuXG5leHBvcnQgeyBjcmVhdGVLZXlib2FyZENvbnRyb2xsZXIgYXMgYyB9O1xuIiwiLyohXG4gKiAoQykgSW9uaWMgaHR0cDovL2lvbmljZnJhbWV3b3JrLmNvbSAtIE1JVCBMaWNlbnNlXG4gKi9cbmNvbnN0IHNwaW5uZXJzID0ge1xuICBidWJibGVzOiB7XG4gICAgZHVyOiAxMDAwLFxuICAgIGNpcmNsZXM6IDksXG4gICAgZm46IChkdXIsIGluZGV4LCB0b3RhbCkgPT4ge1xuICAgICAgY29uc3QgYW5pbWF0aW9uRGVsYXkgPSBgJHsoZHVyICogaW5kZXgpIC8gdG90YWwgLSBkdXJ9bXNgO1xuICAgICAgY29uc3QgYW5nbGUgPSAoMiAqIE1hdGguUEkgKiBpbmRleCkgLyB0b3RhbDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHI6IDUsXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgdG9wOiBgJHs5ICogTWF0aC5zaW4oYW5nbGUpfXB4YCxcbiAgICAgICAgICBsZWZ0OiBgJHs5ICogTWF0aC5jb3MoYW5nbGUpfXB4YCxcbiAgICAgICAgICAnYW5pbWF0aW9uLWRlbGF5JzogYW5pbWF0aW9uRGVsYXksXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0sXG4gIH0sXG4gIGNpcmNsZXM6IHtcbiAgICBkdXI6IDEwMDAsXG4gICAgY2lyY2xlczogOCxcbiAgICBmbjogKGR1ciwgaW5kZXgsIHRvdGFsKSA9PiB7XG4gICAgICBjb25zdCBzdGVwID0gaW5kZXggLyB0b3RhbDtcbiAgICAgIGNvbnN0IGFuaW1hdGlvbkRlbGF5ID0gYCR7ZHVyICogc3RlcCAtIGR1cn1tc2A7XG4gICAgICBjb25zdCBhbmdsZSA9IDIgKiBNYXRoLlBJICogc3RlcDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHI6IDUsXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgdG9wOiBgJHs5ICogTWF0aC5zaW4oYW5nbGUpfXB4YCxcbiAgICAgICAgICBsZWZ0OiBgJHs5ICogTWF0aC5jb3MoYW5nbGUpfXB4YCxcbiAgICAgICAgICAnYW5pbWF0aW9uLWRlbGF5JzogYW5pbWF0aW9uRGVsYXksXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0sXG4gIH0sXG4gIGNpcmN1bGFyOiB7XG4gICAgZHVyOiAxNDAwLFxuICAgIGVsbUR1cmF0aW9uOiB0cnVlLFxuICAgIGNpcmNsZXM6IDEsXG4gICAgZm46ICgpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHI6IDIwLFxuICAgICAgICBjeDogNDgsXG4gICAgICAgIGN5OiA0OCxcbiAgICAgICAgZmlsbDogJ25vbmUnLFxuICAgICAgICB2aWV3Qm94OiAnMjQgMjQgNDggNDgnLFxuICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoMCwwKScsXG4gICAgICAgIHN0eWxlOiB7fSxcbiAgICAgIH07XG4gICAgfSxcbiAgfSxcbiAgY3Jlc2NlbnQ6IHtcbiAgICBkdXI6IDc1MCxcbiAgICBjaXJjbGVzOiAxLFxuICAgIGZuOiAoKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByOiAyNixcbiAgICAgICAgc3R5bGU6IHt9LFxuICAgICAgfTtcbiAgICB9LFxuICB9LFxuICBkb3RzOiB7XG4gICAgZHVyOiA3NTAsXG4gICAgY2lyY2xlczogMyxcbiAgICBmbjogKF8sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBhbmltYXRpb25EZWxheSA9IC0oMTEwICogaW5kZXgpICsgJ21zJztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHI6IDYsXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgbGVmdDogYCR7OSAtIDkgKiBpbmRleH1weGAsXG4gICAgICAgICAgJ2FuaW1hdGlvbi1kZWxheSc6IGFuaW1hdGlvbkRlbGF5LFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9LFxuICB9LFxuICBsaW5lczoge1xuICAgIGR1cjogMTAwMCxcbiAgICBsaW5lczogOCxcbiAgICBmbjogKGR1ciwgaW5kZXgsIHRvdGFsKSA9PiB7XG4gICAgICBjb25zdCB0cmFuc2Zvcm0gPSBgcm90YXRlKCR7KDM2MCAvIHRvdGFsKSAqIGluZGV4ICsgKGluZGV4IDwgdG90YWwgLyAyID8gMTgwIDogLTE4MCl9ZGVnKWA7XG4gICAgICBjb25zdCBhbmltYXRpb25EZWxheSA9IGAkeyhkdXIgKiBpbmRleCkgLyB0b3RhbCAtIGR1cn1tc2A7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB5MTogMTQsXG4gICAgICAgIHkyOiAyNixcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybSxcbiAgICAgICAgICAnYW5pbWF0aW9uLWRlbGF5JzogYW5pbWF0aW9uRGVsYXksXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0sXG4gIH0sXG4gICdsaW5lcy1zbWFsbCc6IHtcbiAgICBkdXI6IDEwMDAsXG4gICAgbGluZXM6IDgsXG4gICAgZm46IChkdXIsIGluZGV4LCB0b3RhbCkgPT4ge1xuICAgICAgY29uc3QgdHJhbnNmb3JtID0gYHJvdGF0ZSgkeygzNjAgLyB0b3RhbCkgKiBpbmRleCArIChpbmRleCA8IHRvdGFsIC8gMiA/IDE4MCA6IC0xODApfWRlZylgO1xuICAgICAgY29uc3QgYW5pbWF0aW9uRGVsYXkgPSBgJHsoZHVyICogaW5kZXgpIC8gdG90YWwgLSBkdXJ9bXNgO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeTE6IDEyLFxuICAgICAgICB5MjogMjAsXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gICAgICAgICAgJ2FuaW1hdGlvbi1kZWxheSc6IGFuaW1hdGlvbkRlbGF5LFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9LFxuICB9LFxuICAnbGluZXMtc2hhcnAnOiB7XG4gICAgZHVyOiAxMDAwLFxuICAgIGxpbmVzOiAxMixcbiAgICBmbjogKGR1ciwgaW5kZXgsIHRvdGFsKSA9PiB7XG4gICAgICBjb25zdCB0cmFuc2Zvcm0gPSBgcm90YXRlKCR7MzAgKiBpbmRleCArIChpbmRleCA8IDYgPyAxODAgOiAtMTgwKX1kZWcpYDtcbiAgICAgIGNvbnN0IGFuaW1hdGlvbkRlbGF5ID0gYCR7KGR1ciAqIGluZGV4KSAvIHRvdGFsIC0gZHVyfW1zYDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHkxOiAxNyxcbiAgICAgICAgeTI6IDI5LFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNmb3JtLFxuICAgICAgICAgICdhbmltYXRpb24tZGVsYXknOiBhbmltYXRpb25EZWxheSxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSxcbiAgfSxcbiAgJ2xpbmVzLXNoYXJwLXNtYWxsJzoge1xuICAgIGR1cjogMTAwMCxcbiAgICBsaW5lczogMTIsXG4gICAgZm46IChkdXIsIGluZGV4LCB0b3RhbCkgPT4ge1xuICAgICAgY29uc3QgdHJhbnNmb3JtID0gYHJvdGF0ZSgkezMwICogaW5kZXggKyAoaW5kZXggPCA2ID8gMTgwIDogLTE4MCl9ZGVnKWA7XG4gICAgICBjb25zdCBhbmltYXRpb25EZWxheSA9IGAkeyhkdXIgKiBpbmRleCkgLyB0b3RhbCAtIGR1cn1tc2A7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB5MTogMTIsXG4gICAgICAgIHkyOiAyMCxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybSxcbiAgICAgICAgICAnYW5pbWF0aW9uLWRlbGF5JzogYW5pbWF0aW9uRGVsYXksXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0sXG4gIH0sXG59O1xuY29uc3QgU1BJTk5FUlMgPSBzcGlubmVycztcblxuZXhwb3J0IHsgU1BJTk5FUlMgYXMgUyB9O1xuIiwiLyohXG4gKiAoQykgSW9uaWMgaHR0cDovL2lvbmljZnJhbWV3b3JrLmNvbSAtIE1JVCBMaWNlbnNlXG4gKi9cbmltcG9ydCB7IGwgYXMgY2xhbXAgfSBmcm9tICcuL2hlbHBlcnMtM2IzOTBlNDguanMnO1xuaW1wb3J0IHsgaSBhcyBpc1JUTCB9IGZyb20gJy4vZGlyLWU4Yjc2N2E4LmpzJztcbmltcG9ydCB7IGNyZWF0ZUdlc3R1cmUgfSBmcm9tICcuL2luZGV4LTQyMmI2ZTgzLmpzJztcbmltcG9ydCAnLi9nZXN0dXJlLWNvbnRyb2xsZXItMTcwNjBiN2MuanMnO1xuXG5jb25zdCBjcmVhdGVTd2lwZUJhY2tHZXN0dXJlID0gKGVsLCBjYW5TdGFydEhhbmRsZXIsIG9uU3RhcnRIYW5kbGVyLCBvbk1vdmVIYW5kbGVyLCBvbkVuZEhhbmRsZXIpID0+IHtcbiAgY29uc3Qgd2luID0gZWwub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldztcbiAgbGV0IHJ0bCA9IGlzUlRMKGVsKTtcbiAgLyoqXG4gICAqIERldGVybWluZSBpZiBhIGdlc3R1cmUgaXMgbmVhciB0aGUgZWRnZVxuICAgKiBvZiB0aGUgc2NyZWVuLiBJZiB0cnVlLCB0aGVuIHRoZSBzd2lwZVxuICAgKiB0byBnbyBiYWNrIGdlc3R1cmUgc2hvdWxkIHByb2NlZWQuXG4gICAqL1xuICBjb25zdCBpc0F0RWRnZSA9IChkZXRhaWwpID0+IHtcbiAgICBjb25zdCB0aHJlc2hvbGQgPSA1MDtcbiAgICBjb25zdCB7IHN0YXJ0WCB9ID0gZGV0YWlsO1xuICAgIGlmIChydGwpIHtcbiAgICAgIHJldHVybiBzdGFydFggPj0gd2luLmlubmVyV2lkdGggLSB0aHJlc2hvbGQ7XG4gICAgfVxuICAgIHJldHVybiBzdGFydFggPD0gdGhyZXNob2xkO1xuICB9O1xuICBjb25zdCBnZXREZWx0YVggPSAoZGV0YWlsKSA9PiB7XG4gICAgcmV0dXJuIHJ0bCA/IC1kZXRhaWwuZGVsdGFYIDogZGV0YWlsLmRlbHRhWDtcbiAgfTtcbiAgY29uc3QgZ2V0VmVsb2NpdHlYID0gKGRldGFpbCkgPT4ge1xuICAgIHJldHVybiBydGwgPyAtZGV0YWlsLnZlbG9jaXR5WCA6IGRldGFpbC52ZWxvY2l0eVg7XG4gIH07XG4gIGNvbnN0IGNhblN0YXJ0ID0gKGRldGFpbCkgPT4ge1xuICAgIC8qKlxuICAgICAqIFRoZSB1c2VyJ3MgbG9jYWxlIGNhbiBjaGFuZ2UgbWlkLXNlc3Npb24sXG4gICAgICogc28gd2UgbmVlZCB0byBjaGVjayB0ZXh0IGRpcmVjdGlvbiBhdFxuICAgICAqIHRoZSBiZWdpbm5pbmcgb2YgZXZlcnkgZ2VzdHVyZS5cbiAgICAgKi9cbiAgICBydGwgPSBpc1JUTChlbCk7XG4gICAgcmV0dXJuIGlzQXRFZGdlKGRldGFpbCkgJiYgY2FuU3RhcnRIYW5kbGVyKCk7XG4gIH07XG4gIGNvbnN0IG9uTW92ZSA9IChkZXRhaWwpID0+IHtcbiAgICAvLyBzZXQgdGhlIHRyYW5zaXRpb24gYW5pbWF0aW9uJ3MgcHJvZ3Jlc3NcbiAgICBjb25zdCBkZWx0YSA9IGdldERlbHRhWChkZXRhaWwpO1xuICAgIGNvbnN0IHN0ZXBWYWx1ZSA9IGRlbHRhIC8gd2luLmlubmVyV2lkdGg7XG4gICAgb25Nb3ZlSGFuZGxlcihzdGVwVmFsdWUpO1xuICB9O1xuICBjb25zdCBvbkVuZCA9IChkZXRhaWwpID0+IHtcbiAgICAvLyB0aGUgc3dpcGUgYmFjayBnZXN0dXJlIGhhcyBlbmRlZFxuICAgIGNvbnN0IGRlbHRhID0gZ2V0RGVsdGFYKGRldGFpbCk7XG4gICAgY29uc3Qgd2lkdGggPSB3aW4uaW5uZXJXaWR0aDtcbiAgICBjb25zdCBzdGVwVmFsdWUgPSBkZWx0YSAvIHdpZHRoO1xuICAgIGNvbnN0IHZlbG9jaXR5ID0gZ2V0VmVsb2NpdHlYKGRldGFpbCk7XG4gICAgY29uc3QgeiA9IHdpZHRoIC8gMi4wO1xuICAgIGNvbnN0IHNob3VsZENvbXBsZXRlID0gdmVsb2NpdHkgPj0gMCAmJiAodmVsb2NpdHkgPiAwLjIgfHwgZGVsdGEgPiB6KTtcbiAgICBjb25zdCBtaXNzaW5nID0gc2hvdWxkQ29tcGxldGUgPyAxIC0gc3RlcFZhbHVlIDogc3RlcFZhbHVlO1xuICAgIGNvbnN0IG1pc3NpbmdEaXN0YW5jZSA9IG1pc3NpbmcgKiB3aWR0aDtcbiAgICBsZXQgcmVhbER1ciA9IDA7XG4gICAgaWYgKG1pc3NpbmdEaXN0YW5jZSA+IDUpIHtcbiAgICAgIGNvbnN0IGR1ciA9IG1pc3NpbmdEaXN0YW5jZSAvIE1hdGguYWJzKHZlbG9jaXR5KTtcbiAgICAgIHJlYWxEdXIgPSBNYXRoLm1pbihkdXIsIDU0MCk7XG4gICAgfVxuICAgIG9uRW5kSGFuZGxlcihzaG91bGRDb21wbGV0ZSwgc3RlcFZhbHVlIDw9IDAgPyAwLjAxIDogY2xhbXAoMCwgc3RlcFZhbHVlLCAwLjk5OTkpLCByZWFsRHVyKTtcbiAgfTtcbiAgcmV0dXJuIGNyZWF0ZUdlc3R1cmUoe1xuICAgIGVsLFxuICAgIGdlc3R1cmVOYW1lOiAnZ29iYWNrLXN3aXBlJyxcbiAgICBnZXN0dXJlUHJpb3JpdHk6IDQwLFxuICAgIHRocmVzaG9sZDogMTAsXG4gICAgY2FuU3RhcnQsXG4gICAgb25TdGFydDogb25TdGFydEhhbmRsZXIsXG4gICAgb25Nb3ZlLFxuICAgIG9uRW5kLFxuICB9KTtcbn07XG5cbmV4cG9ydCB7IGNyZWF0ZVN3aXBlQmFja0dlc3R1cmUgfTtcbiJdLCJuYW1lcyI6WyJjIiwiY29tcG9uZW50T25SZWFkeSIsImF0dGFjaENvbXBvbmVudCIsImRlbGVnYXRlIiwiY29udGFpbmVyIiwiY29tcG9uZW50IiwiY3NzQ2xhc3NlcyIsImNvbXBvbmVudFByb3BzIiwiaW5saW5lIiwiX2EiLCJhdHRhY2hWaWV3VG9Eb20iLCJIVE1MRWxlbWVudCIsIkVycm9yIiwiZWwiLCJvd25lckRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImZvckVhY2giLCJjbGFzc0xpc3QiLCJhZGQiLCJPYmplY3QiLCJhc3NpZ24iLCJhcHBlbmRDaGlsZCIsIlByb21pc2UiLCJyZXNvbHZlIiwiZGV0YWNoQ29tcG9uZW50IiwiZWxlbWVudCIsInBhcmVudEVsZW1lbnQiLCJyZW1vdmVWaWV3RnJvbURvbSIsInJlbW92ZSIsIkNvcmVEZWxlZ2F0ZSIsIkJhc2VDb21wb25lbnQiLCJSZWZlcmVuY2UiLCJ1c2VyQ29tcG9uZW50IiwidXNlckNvbXBvbmVudFByb3BzIiwiX2IiLCJjaGlsZHJlbiIsImxlbmd0aCIsInJvb3QiLCJjb250YWlucyIsImFwcGVuZCIsImFwcCIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImJvZHkiLCJjcmVhdGVDb21tZW50IiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsIkMiLCJhIiwiZCIsInByaW50UmVxdWlyZWRFbGVtZW50RXJyb3IiLCJJT05fQ09OVEVOVF9UQUdfTkFNRSIsIklPTl9DT05URU5UX0VMRU1FTlRfU0VMRUNUT1IiLCJJT05fQ09OVEVOVF9DTEFTU19TRUxFQ1RPUiIsIklPTl9DT05URU5UX1NFTEVDVE9SIiwiaXNJb25Db250ZW50IiwidGFnTmFtZSIsImdldFNjcm9sbEVsZW1lbnQiLCJmaW5kSW9uQ29udGVudCIsImN1c3RvbUNvbnRlbnRIb3N0IiwiZmluZENsb3Nlc3RJb25Db250ZW50IiwiY2xvc2VzdCIsInNjcm9sbFRvVG9wIiwiZHVyYXRpb25NcyIsImNvbnRlbnQiLCJzY3JvbGxUbyIsInRvcCIsImxlZnQiLCJiZWhhdmlvciIsInNjcm9sbEJ5UG9pbnQiLCJ4IiwieSIsInNjcm9sbEJ5IiwicHJpbnRJb25Db250ZW50RXJyb3JNc2ciLCJkaXNhYmxlQ29udGVudFNjcm9sbFkiLCJjb250ZW50RWwiLCJpb25Db250ZW50IiwiaW5pdGlhbFNjcm9sbFkiLCJzY3JvbGxZIiwic3R5bGUiLCJzZXRQcm9wZXJ0eSIsInJlc2V0Q29udGVudFNjcm9sbFkiLCJyZW1vdmVQcm9wZXJ0eSIsIkkiLCJiIiwiZiIsImciLCJpIiwicCIsInIiLCJzIl0sInNvdXJjZVJvb3QiOiJ3ZWJwYWNrOi8vLyJ9