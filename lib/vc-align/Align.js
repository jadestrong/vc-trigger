"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _vueTypes = _interopRequireDefault(require("vc-util-collection/lib/vue-types"));

var _domAlign = require("dom-align");

var _addEventListener = _interopRequireDefault(require("vc-util-collection/lib/Dom/addEventListener"));

var _util = require("./util");

var _vnode = require("vc-util-collection/lib/vnode.js");

var _cloneDeep = _interopRequireDefault(require("lodash/cloneDeep"));

function getElement(func) {
  if (typeof func !== 'function' || !func) return null;
  return func();
}

function getPoint(point) {
  if (typeof point !== 'object' || !point) return null;
  return point;
}

var _default = {
  props: {
    childrenProps: _vueTypes["default"].object,
    align: _vueTypes["default"].object.isRequired,
    target: _vueTypes["default"].oneOfType([_vueTypes["default"].func, _vueTypes["default"].object]).def(function () {
      return window;
    }),
    monitorBufferTime: _vueTypes["default"].number.def(50),
    monitorWindowResize: _vueTypes["default"].bool.def(false),
    disabled: _vueTypes["default"].bool.def(false)
  },
  data: function data() {
    this.aligned = false;
    return {};
  },
  mounted: function mounted() {
    var _this = this;

    this.$nextTick(function () {
      _this.prevProps = (0, _objectSpread2["default"])({}, _this.$props);
      var props = _this.$props; // if parent ref not attached .... use document.getElementById

      !_this.aligned && _this.forceAlign();

      if (!props.disabled && props.monitorWindowResize) {
        _this.startMonitorWindowResize();
      }
    });
  },
  updated: function updated() {
    var _this2 = this;

    this.$nextTick(function () {
      var prevProps = _this2.prevProps;
      var props = _this2.$props;
      var reAlign = false;

      if (!props.disabled) {
        var source = _this2.$el;
        var sourceRect = source ? source.getBoundingClientRect() : null;

        if (prevProps.disabled) {
          reAlign = true;
        } else {
          var lastElement = getElement(prevProps.target);
          var currentElement = getElement(props.target);
          var lastPoint = getPoint(prevProps.target);
          var currentPoint = getPoint(props.target);

          if ((0, _util.isWindow)(lastElement) && (0, _util.isWindow)(currentElement)) {
            // Skip if is window
            reAlign = false;
          } else if (lastElement !== currentElement || // Element change
          lastElement && !currentElement && currentPoint || // Change from element to point
          lastPoint && currentPoint && currentElement || // Change from point to element
          currentPoint && !(0, _util.isSamePoint)(lastPoint, currentPoint)) {
            reAlign = true;
          } // If source element size changed


          var preRect = _this2.sourceRect || {};

          if (!reAlign && source && (preRect.width !== sourceRect.width || preRect.height !== sourceRect.height)) {
            reAlign = true;
          }
        }

        _this2.sourceRect = sourceRect;
      }

      if (reAlign) {
        _this2.forceAlign();
      }

      if (props.monitorWindowResize && !props.disabled) {
        _this2.startMonitorWindowResize();
      } else {
        _this2.stopMonitorWindowResize();
      }

      _this2.prevProps = (0, _objectSpread2["default"])({}, _this2.$props, {
        align: (0, _cloneDeep["default"])(_this2.$props.align)
      });
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.stopMonitorWindowResize();
  },
  methods: {
    startMonitorWindowResize: function startMonitorWindowResize() {
      if (!this.resizeHandler) {
        this.bufferMonitor = (0, _util.buffer)(this.forceAlign, this.$props.monitorBufferTime);
        this.resizeHandler = (0, _addEventListener["default"])(window, 'resize', this.bufferMonitor);
      }
    },
    stopMonitorWindowResize: function stopMonitorWindowResize() {
      if (this.resizeHandler) {
        this.bufferMonitor.clear();
        this.resizeHandler.remove();
        this.resizeHandler = null;
      }
    },
    forceAlign: function forceAlign() {
      var _this$$props = this.$props,
          disabled = _this$$props.disabled,
          target = _this$$props.target,
          align = _this$$props.align;

      if (!disabled && target) {
        var source = this.$el;
        var result;
        var element = getElement(target);
        var point = getPoint(target);

        if (element) {
          result = (0, _domAlign.alignElement)(source, element, align);
        } else if (point) {
          result = (0, _domAlign.alignPoint)(source, point, align);
        }

        this.aligned = true;
        this.$listeners.align && this.$listeners.align(source, result);
      }
    }
  },
  render: function render() {
    var childrenProps = this.$props.childrenProps;
    var child = this.$slots["default"][0];

    if (childrenProps) {
      return (0, _vnode.cloneElement)(child, {
        props: childrenProps
      });
    }

    return child;
  }
};
exports["default"] = _default;