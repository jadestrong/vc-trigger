import _mergeJSXProps from "@vue/babel-helper-vue-jsx-merge-props";
import _objectSpread from "@babel/runtime/helpers/objectSpread";
import Vue from 'vue';
import ref from 'vue-ref';
import PropTypes from "vc-util-collection/es/vue-types";
import contains from "vc-util-collection/es/Dom/contains";
import { hasProp, getComponentFromProp, getEvents, filterEmpty } from "vc-util-collection/es/props-util";
import { requestAnimationTimeout, cancelAnimationTimeout } from "vc-util-collection/es/requestAnimationTimeout";
import addEventListener from "vc-util-collection/es/Dom/addEventListener";
import warning from "vc-util-collection/es/warning";
import Popup from './Popup';
import { getAlignFromPlacement, getAlignPopupClassName, noop } from './utils';
import BaseMixin from "vc-util-collection/es/BaseMixin";
import { cloneElement } from "vc-util-collection/es/vnode";
import ContainerRender from "vc-util-collection/es/ContainerRender";
Vue.use(ref, {
  name: 'ant-ref'
});

function returnEmptyString() {
  return '';
}

function returnDocument() {
  return window.document;
}

var ALL_HANDLERS = ['click', 'mousedown', 'touchstart', 'mouseenter', 'mouseleave', 'focus', 'blur', 'contextmenu'];
export default {
  name: 'Trigger',
  mixins: [BaseMixin],
  props: {
    action: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).def([]),
    showAction: PropTypes.any.def([]),
    hideAction: PropTypes.any.def([]),
    getPopupClassNameFromAlign: PropTypes.any.def(returnEmptyString),
    // onPopupVisibleChange: PropTypes.func.def(noop),
    afterPopupVisibleChange: PropTypes.func.def(noop),
    popup: PropTypes.any,
    popupStyle: PropTypes.object.def({}),
    prefixCls: PropTypes.string.def('rc-trigger-popup'),
    popupClassName: PropTypes.string.def(''),
    popupPlacement: PropTypes.string,
    builtinPlacements: PropTypes.object,
    popupTransitionName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    popupAnimation: PropTypes.any,
    mouseEnterDelay: PropTypes.number.def(0),
    mouseLeaveDelay: PropTypes.number.def(0.1),
    zIndex: PropTypes.number,
    focusDelay: PropTypes.number.def(0),
    blurDelay: PropTypes.number.def(0.15),
    getPopupContainer: PropTypes.func,
    getDocument: PropTypes.func.def(returnDocument),
    forceRender: PropTypes.bool,
    destroyPopupOnHide: PropTypes.bool.def(false),
    mask: PropTypes.bool.def(false),
    maskClosable: PropTypes.bool.def(true),
    // onPopupAlign: PropTypes.func.def(noop),
    popupAlign: PropTypes.object.def({}),
    popupVisible: PropTypes.bool,
    defaultPopupVisible: PropTypes.bool.def(false),
    maskTransitionName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    maskAnimation: PropTypes.string,
    stretch: PropTypes.string,
    alignPoint: PropTypes.bool // Maybe we can support user pass position in the future

  },
  provide: function provide() {
    return {
      vcTriggerContext: this
    };
  },
  inject: {
    vcTriggerContext: {
      "default": function _default() {
        return {};
      }
    }
  },
  data: function data() {
    var props = this.$props;
    var popupVisible;

    if (hasProp(this, 'popupVisible')) {
      popupVisible = !!props.popupVisible;
    } else {
      popupVisible = !!props.defaultPopupVisible;
    }

    return {
      sPopupVisible: popupVisible,
      point: null
    };
  },
  watch: {
    popupVisible: function popupVisible(val) {
      if (val !== undefined) {
        this.sPopupVisible = val;
      }
    },
    sPopupVisible: function sPopupVisible(val) {
      var _this = this;

      this.$nextTick(function () {
        _this.renderComponent(null, function () {
          _this.afterPopupVisibleChange(val);
        });
      });
    }
  },
  beforeCreate: function beforeCreate() {
    var _this2 = this;

    ALL_HANDLERS.forEach(function (h) {
      _this2["fire".concat(h)] = function (e) {
        _this2.fireEvents(h, e);
      };
    });
  },
  mounted: function mounted() {
    var _this3 = this;

    this.$nextTick(function () {
      _this3.renderComponent(null);

      _this3.updatedCal();
    });
  },
  updated: function updated() {
    var _this4 = this;

    this.$nextTick(function () {
      _this4.updatedCal();
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.clearDelayTimer();
    this.clearOutsideHandler();
    clearTimeout(this.mouseDownTimeout);
  },
  methods: {
    updatedCal: function updatedCal() {
      var props = this.$props;
      var state = this.$data; // We must listen to `mousedown` or `touchstart`, edge case:
      // https://github.com/ant-design/ant-design/issues/5804
      // https://github.com/react-component/calendar/issues/250
      // https://github.com/react-component/trigger/issues/50

      if (state.sPopupVisible) {
        var currentDocument;

        if (!this.clickOutsideHandler && (this.isClickToHide() || this.isContextmenuToShow())) {
          currentDocument = props.getDocument();
          this.clickOutsideHandler = addEventListener(currentDocument, 'mousedown', this.onDocumentClick);
        } // always hide on mobile


        if (!this.touchOutsideHandler) {
          currentDocument = currentDocument || props.getDocument();
          this.touchOutsideHandler = addEventListener(currentDocument, 'touchstart', this.onDocumentClick);
        } // close popup when trigger type contains 'onContextmenu' and document is scrolling.


        if (!this.contextmenuOutsideHandler1 && this.isContextmenuToShow()) {
          currentDocument = currentDocument || props.getDocument();
          this.contextmenuOutsideHandler1 = addEventListener(currentDocument, 'scroll', this.onContextmenuClose);
        } // close popup when trigger type contains 'onContextmenu' and window is blur.


        if (!this.contextmenuOutsideHandler2 && this.isContextmenuToShow()) {
          this.contextmenuOutsideHandler2 = addEventListener(window, 'blur', this.onContextmenuClose);
        }
      } else {
        this.clearOutsideHandler();
      }
    },
    onMouseenter: function onMouseenter(e) {
      var mouseEnterDelay = this.$props.mouseEnterDelay;
      this.fireEvents('mouseenter', e);
      this.delaySetPopupVisible(true, mouseEnterDelay, mouseEnterDelay ? null : e);
    },
    onMouseMove: function onMouseMove(e) {
      this.fireEvents('mousemove', e);
      this.setPoint(e);
    },
    onMouseleave: function onMouseleave(e) {
      this.fireEvents('mouseleave', e);
      this.delaySetPopupVisible(false, this.$props.mouseLeaveDelay);
    },
    onPopupMouseenter: function onPopupMouseenter() {
      this.clearDelayTimer();
    },
    onPopupMouseleave: function onPopupMouseleave(e) {
      if (e && e.relatedTarget && !e.relatedTarget.setTimeout && this._component && this._component.getPopupDomNode && contains(this._component.getPopupDomNode(), e.relatedTarget)) {
        return;
      }

      this.delaySetPopupVisible(false, this.$props.mouseLeaveDelay);
    },
    onFocus: function onFocus(e) {
      this.fireEvents('focus', e); // incase focusin and focusout

      this.clearDelayTimer();

      if (this.isFocusToShow()) {
        this.focusTime = Date.now();
        this.delaySetPopupVisible(true, this.$props.focusDelay);
      }
    },
    onMousedown: function onMousedown(e) {
      this.fireEvents('mousedown', e);
      this.preClickTime = Date.now();
    },
    onTouchstart: function onTouchstart(e) {
      this.fireEvents('touchstart', e);
      this.preTouchTime = Date.now();
    },
    onBlur: function onBlur(e) {
      this.fireEvents('blur', e);
      this.clearDelayTimer();

      if (this.isBlurToHide()) {
        this.delaySetPopupVisible(false, this.$props.blurDelay);
      }
    },
    onContextmenu: function onContextmenu(e) {
      e.preventDefault();
      this.fireEvents('contextmenu', e);
      this.setPopupVisible(true, e);
    },
    onContextmenuClose: function onContextmenuClose() {
      if (this.isContextmenuToShow()) {
        this.close();
      }
    },
    onClick: function onClick(event) {
      this.fireEvents('click', event); // focus will trigger click

      if (this.focusTime) {
        var preTime;

        if (this.preClickTime && this.preTouchTime) {
          preTime = Math.min(this.preClickTime, this.preTouchTime);
        } else if (this.preClickTime) {
          preTime = this.preClickTime;
        } else if (this.preTouchTime) {
          preTime = this.preTouchTime;
        }

        if (Math.abs(preTime - this.focusTime) < 20) {
          return;
        }

        this.focusTime = 0;
      }

      this.preClickTime = 0;
      this.preTouchTime = 0;

      if (event && event.preventDefault) {
        event.preventDefault();
      }

      if (event && event.domEvent) {
        event.domEvent.preventDefault();
      }

      var nextVisible = !this.$data.sPopupVisible;

      if (this.isClickToHide() && !nextVisible || nextVisible && this.isClickToShow()) {
        this.setPopupVisible(!this.$data.sPopupVisible, event);
      }
    },
    onPopupMouseDown: function onPopupMouseDown() {
      var _this5 = this;

      var _this$vcTriggerContex = this.vcTriggerContext,
          vcTriggerContext = _this$vcTriggerContex === void 0 ? {} : _this$vcTriggerContex;
      this.hasPopupMouseDown = true;
      clearTimeout(this.mouseDownTimeout);
      this.mouseDownTimeout = setTimeout(function () {
        _this5.hasPopupMouseDown = false;
      }, 0);

      if (vcTriggerContext.onPopupMouseDown) {
        vcTriggerContext.onPopupMouseDown.apply(vcTriggerContext, arguments);
      }
    },
    onDocumentClick: function onDocumentClick(event) {
      if (this.$props.mask && !this.$props.maskClosable) {
        return;
      }

      var target = event.target;
      var root = this.$el;

      if (!contains(root, target) && !this.hasPopupMouseDown) {
        this.close();
      }
    },
    getPopupDomNode: function getPopupDomNode() {
      if (this._component && this._component.getPopupDomNode) {
        return this._component.getPopupDomNode();
      }

      return null;
    },
    getRootDomNode: function getRootDomNode() {
      return this.$el; // return this.$el.children[0] || this.$el
    },
    handleGetPopupClassFromAlign: function handleGetPopupClassFromAlign(align) {
      var className = [];
      var props = this.$props;
      var popupPlacement = props.popupPlacement,
          builtinPlacements = props.builtinPlacements,
          prefixCls = props.prefixCls,
          alignPoint = props.alignPoint,
          getPopupClassNameFromAlign = props.getPopupClassNameFromAlign;

      if (popupPlacement && builtinPlacements) {
        className.push(getAlignPopupClassName(builtinPlacements, prefixCls, align, alignPoint));
      }

      if (getPopupClassNameFromAlign) {
        className.push(getPopupClassNameFromAlign(align));
      }

      return className.join(' ');
    },
    getPopupAlign: function getPopupAlign() {
      var props = this.$props;
      var popupPlacement = props.popupPlacement,
          popupAlign = props.popupAlign,
          builtinPlacements = props.builtinPlacements;

      if (popupPlacement && builtinPlacements) {
        return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
      }

      return popupAlign;
    },
    savePopup: function savePopup(node) {
      this._component = node;
    },
    getComponent: function getComponent() {
      var h = this.$createElement;
      var self = this;
      var mouseProps = {};

      if (this.isMouseEnterToShow()) {
        mouseProps.mouseenter = self.onPopupMouseenter;
      }

      if (this.isMouseLeaveToHide()) {
        mouseProps.mouseleave = self.onPopupMouseleave;
      }

      mouseProps.mousedown = this.onPopupMouseDown;
      mouseProps.touchstart = this.onPopupMouseDown;
      var handleGetPopupClassFromAlign = self.handleGetPopupClassFromAlign,
          getRootDomNode = self.getRootDomNode,
          getContainer = self.getContainer,
          $listeners = self.$listeners;
      var _self$$props = self.$props,
          prefixCls = _self$$props.prefixCls,
          destroyPopupOnHide = _self$$props.destroyPopupOnHide,
          popupClassName = _self$$props.popupClassName,
          action = _self$$props.action,
          popupAnimation = _self$$props.popupAnimation,
          popupTransitionName = _self$$props.popupTransitionName,
          popupStyle = _self$$props.popupStyle,
          mask = _self$$props.mask,
          maskAnimation = _self$$props.maskAnimation,
          maskTransitionName = _self$$props.maskTransitionName,
          zIndex = _self$$props.zIndex,
          stretch = _self$$props.stretch,
          alignPoint = _self$$props.alignPoint;
      var _this$$data = this.$data,
          sPopupVisible = _this$$data.sPopupVisible,
          point = _this$$data.point;
      var align = this.getPopupAlign();
      var popupProps = {
        props: {
          prefixCls: prefixCls,
          destroyPopupOnHide: destroyPopupOnHide,
          visible: sPopupVisible,
          point: alignPoint && point,
          action: action,
          align: align,
          animation: popupAnimation,
          getClassNameFromAlign: handleGetPopupClassFromAlign,
          stretch: stretch,
          getRootDomNode: getRootDomNode,
          mask: mask,
          zIndex: zIndex,
          transitionName: popupTransitionName,
          maskAnimation: maskAnimation,
          maskTransitionName: maskTransitionName,
          getContainer: getContainer,
          popupClassName: popupClassName,
          popupStyle: popupStyle
        },
        on: _objectSpread({
          align: $listeners.popupAlign || noop
        }, mouseProps),
        directives: [{
          name: 'ant-ref',
          value: this.savePopup
        }]
      };
      return h(Popup, _mergeJSXProps([{}, popupProps]), [getComponentFromProp(self, 'popup')]);
    },
    getContainer: function getContainer() {
      var props = this.$props;
      var popupContainer = document.createElement('div'); // Make sure default popup container will never cause scrollbar appearing
      // https://github.com/react-component/trigger/issues/41

      popupContainer.style.position = 'absolute';
      popupContainer.style.top = '0';
      popupContainer.style.left = '0';
      popupContainer.style.width = '100%';
      var mountNode = props.getPopupContainer ? props.getPopupContainer(this.$el) : props.getDocument().body;
      mountNode.appendChild(popupContainer);
      this.popupContainer = popupContainer;
      return popupContainer;
    },
    setPopupVisible: function setPopupVisible(sPopupVisible, event) {
      var alignPoint = this.$props.alignPoint;
      this.clearDelayTimer();

      if (this.$data.sPopupVisible !== sPopupVisible) {
        if (!hasProp(this, 'popupVisible')) {
          this.setState({
            sPopupVisible: sPopupVisible
          });
        }

        this.$listeners.popupVisibleChange && this.$listeners.popupVisibleChange(sPopupVisible);
      } // Always record the point position since mouseEnterDelay will delay the show


      if (sPopupVisible && alignPoint && event) {
        this.setPoint(event);
      }
    },
    setPoint: function setPoint(point) {
      var alignPoint = this.$props.alignPoint;
      if (!alignPoint || !point) return;
      this.setState({
        point: {
          pageX: point.pageX,
          pageY: point.pageY
        }
      });
    },
    delaySetPopupVisible: function delaySetPopupVisible(visible, delayS, event) {
      var _this6 = this;

      var delay = delayS * 1000;
      this.clearDelayTimer();

      if (delay) {
        var point = event ? {
          pageX: event.pageX,
          pageY: event.pageY
        } : null;
        this.delayTimer = requestAnimationTimeout(function () {
          _this6.setPopupVisible(visible, point);

          _this6.clearDelayTimer();
        }, delay);
      } else {
        this.setPopupVisible(visible, event);
      }
    },
    clearDelayTimer: function clearDelayTimer() {
      if (this.delayTimer) {
        cancelAnimationTimeout(this.delayTimer);
        this.delayTimer = null;
      }
    },
    clearOutsideHandler: function clearOutsideHandler() {
      if (this.clickOutsideHandler) {
        this.clickOutsideHandler.remove();
        this.clickOutsideHandler = null;
      }

      if (this.contextmenuOutsideHandler1) {
        this.contextmenuOutsideHandler1.remove();
        this.contextmenuOutsideHandler1 = null;
      }

      if (this.contextmenuOutsideHandler2) {
        this.contextmenuOutsideHandler2.remove();
        this.contextmenuOutsideHandler2 = null;
      }

      if (this.touchOutsideHandler) {
        this.touchOutsideHandler.remove();
        this.touchOutsideHandler = null;
      }
    },
    createTwoChains: function createTwoChains(event) {
      var fn = function fn() {};

      var events = this.$listeners;

      if (this.childOriginEvents[event] && events[event]) {
        return this["fire".concat(event)];
      }

      fn = this.childOriginEvents[event] || events[event] || fn;
      return fn;
    },
    isClickToShow: function isClickToShow() {
      var _this$$props = this.$props,
          action = _this$$props.action,
          showAction = _this$$props.showAction;
      return action.indexOf('click') !== -1 || showAction.indexOf('click') !== -1;
    },
    isContextmenuToShow: function isContextmenuToShow() {
      var _this$$props2 = this.$props,
          action = _this$$props2.action,
          showAction = _this$$props2.showAction;
      return action.indexOf('contextmenu') !== -1 || showAction.indexOf('contextmenu') !== -1;
    },
    isClickToHide: function isClickToHide() {
      var _this$$props3 = this.$props,
          action = _this$$props3.action,
          hideAction = _this$$props3.hideAction;
      return action.indexOf('click') !== -1 || hideAction.indexOf('click') !== -1;
    },
    isMouseEnterToShow: function isMouseEnterToShow() {
      var _this$$props4 = this.$props,
          action = _this$$props4.action,
          showAction = _this$$props4.showAction;
      return action.indexOf('hover') !== -1 || showAction.indexOf('mouseenter') !== -1;
    },
    isMouseLeaveToHide: function isMouseLeaveToHide() {
      var _this$$props5 = this.$props,
          action = _this$$props5.action,
          hideAction = _this$$props5.hideAction;
      return action.indexOf('hover') !== -1 || hideAction.indexOf('mouseleave') !== -1;
    },
    isFocusToShow: function isFocusToShow() {
      var _this$$props6 = this.$props,
          action = _this$$props6.action,
          showAction = _this$$props6.showAction;
      return action.indexOf('focus') !== -1 || showAction.indexOf('focus') !== -1;
    },
    isBlurToHide: function isBlurToHide() {
      var _this$$props7 = this.$props,
          action = _this$$props7.action,
          hideAction = _this$$props7.hideAction;
      return action.indexOf('focus') !== -1 || hideAction.indexOf('blur') !== -1;
    },
    forcePopupAlign: function forcePopupAlign() {
      if (this.$data.sPopupVisible && this._component && this._component.$refs.alignInstance) {
        this._component.$refs.alignInstance.forceAlign();
      }
    },
    fireEvents: function fireEvents(type, e) {
      if (this.childOriginEvents[type]) {
        this.childOriginEvents[type](e);
      }

      this.__emit(type, e);
    },
    close: function close() {
      this.setPopupVisible(false);
    }
  },
  render: function render() {
    var _this7 = this;

    var h = arguments[0];
    var sPopupVisible = this.sPopupVisible;
    var children = filterEmpty(this.$slots["default"]);
    var _this$$props8 = this.$props,
        forceRender = _this$$props8.forceRender,
        alignPoint = _this$$props8.alignPoint;

    if (children.length > 1) {
      warning(false, 'Trigger $slots.default.length > 1, just support only one default', true);
    }

    var child = children[0];
    this.childOriginEvents = getEvents(child);
    var newChildProps = {
      props: {},
      on: {},
      key: 'trigger'
    };

    if (this.isContextmenuToShow()) {
      newChildProps.on.contextmenu = this.onContextmenu;
    } else {
      newChildProps.on.contextmenu = this.createTwoChains('contextmenu');
    }

    if (this.isClickToHide() || this.isClickToShow()) {
      newChildProps.on.click = this.onClick;
      newChildProps.on.mousedown = this.onMousedown;
      newChildProps.on.touchstart = this.onTouchstart;
    } else {
      newChildProps.on.click = this.createTwoChains('click');
      newChildProps.on.mousedown = this.createTwoChains('mousedown');
      newChildProps.on.touchstart = this.createTwoChains('onTouchstart');
    }

    if (this.isMouseEnterToShow()) {
      newChildProps.on.mouseenter = this.onMouseenter;

      if (alignPoint) {
        newChildProps.on.mousemove = this.onMouseMove;
      }
    } else {
      newChildProps.on.mouseenter = this.createTwoChains('mouseenter');
    }

    if (this.isMouseLeaveToHide()) {
      newChildProps.on.mouseleave = this.onMouseleave;
    } else {
      newChildProps.on.mouseleave = this.createTwoChains('mouseleave');
    }

    if (this.isFocusToShow() || this.isBlurToHide()) {
      newChildProps.on.focus = this.onFocus;
      newChildProps.on.blur = this.onBlur;
    } else {
      newChildProps.on.focus = this.createTwoChains('focus');

      newChildProps.on.blur = function (e) {
        if (e && (!e.relatedTarget || !contains(e.target, e.relatedTarget))) {
          _this7.createTwoChains('blur')(e);
        }
      };
    }

    var trigger = cloneElement(child, newChildProps);
    return h(ContainerRender, {
      "attrs": {
        "parent": this,
        "visible": sPopupVisible,
        "autoMount": false,
        "forceRender": forceRender,
        "getComponent": this.getComponent,
        "getContainer": this.getContainer,
        "children": function children(_ref) {
          var renderComponent = _ref.renderComponent;
          _this7.renderComponent = renderComponent;
          return trigger;
        }
      }
    });
  }
};