import _objectSpread from "@babel/runtime/helpers/objectSpread";
import PropTypes from "vc-util-collection/es/vue-types";
import { alignElement, alignPoint } from 'dom-align';
import addEventListener from "vc-util-collection/es/Dom/addEventListener";
import { isWindow, buffer, isSamePoint } from './util';
import { cloneElement } from "vc-util-collection/es/vnode.js";
import clonedeep from 'lodash/cloneDeep';

function getElement(func) {
  if (typeof func !== 'function' || !func) return null;
  return func();
}

function getPoint(point) {
  if (typeof point !== 'object' || !point) return null;
  return point;
}

export default {
  props: {
    childrenProps: PropTypes.object,
    align: PropTypes.object.isRequired,
    target: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).def(function () {
      return window;
    }),
    monitorBufferTime: PropTypes.number.def(50),
    monitorWindowResize: PropTypes.bool.def(false),
    disabled: PropTypes.bool.def(false)
  },
  data: function data() {
    this.aligned = false;
    return {};
  },
  mounted: function mounted() {
    var _this = this;

    this.$nextTick(function () {
      _this.prevProps = _objectSpread({}, _this.$props);
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

          if (isWindow(lastElement) && isWindow(currentElement)) {
            // Skip if is window
            reAlign = false;
          } else if (lastElement !== currentElement || // Element change
          lastElement && !currentElement && currentPoint || // Change from element to point
          lastPoint && currentPoint && currentElement || // Change from point to element
          currentPoint && !isSamePoint(lastPoint, currentPoint)) {
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

      _this2.prevProps = _objectSpread({}, _this2.$props, {
        align: clonedeep(_this2.$props.align)
      });
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.stopMonitorWindowResize();
  },
  methods: {
    startMonitorWindowResize: function startMonitorWindowResize() {
      if (!this.resizeHandler) {
        this.bufferMonitor = buffer(this.forceAlign, this.$props.monitorBufferTime);
        this.resizeHandler = addEventListener(window, 'resize', this.bufferMonitor);
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
          result = alignElement(source, element, align);
        } else if (point) {
          result = alignPoint(source, point, align);
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
      return cloneElement(child, {
        props: childrenProps
      });
    }

    return child;
  }
};