import _mergeJSXProps4 from "@vue/babel-helper-vue-jsx-merge-props";
import _mergeJSXProps3 from "@vue/babel-helper-vue-jsx-merge-props";
import _mergeJSXProps2 from "@vue/babel-helper-vue-jsx-merge-props";
import _mergeJSXProps from "@vue/babel-helper-vue-jsx-merge-props";
import _extends from "@babel/runtime/helpers/extends";
import _objectSpread from "@babel/runtime/helpers/objectSpread";
import PropTypes from "vc-util-collection/es/vue-types";
import Align from './vc-align';
import PopupInner from './PopupInner';
import LazyRenderBox from './LazyRenderBox';
import animate from "vc-util-collection/es/css-animation";
import BaseMixin from "vc-util-collection/es/BaseMixin";
export default {
  mixins: [BaseMixin],
  props: {
    visible: PropTypes.bool,
    getClassNameFromAlign: PropTypes.func,
    getRootDomNode: PropTypes.func,
    align: PropTypes.any,
    destroyPopupOnHide: PropTypes.bool,
    prefixCls: PropTypes.string,
    getContainer: PropTypes.func,
    transitionName: PropTypes.string,
    animation: PropTypes.any,
    maskAnimation: PropTypes.string,
    maskTransitionName: PropTypes.string,
    mask: PropTypes.bool,
    zIndex: PropTypes.number,
    popupClassName: PropTypes.any,
    popupStyle: PropTypes.object.def({}),
    stretch: PropTypes.string,
    point: PropTypes.shape({
      pageX: PropTypes.number,
      pageY: PropTypes.number
    })
  },
  data: function data() {
    return {
      // Used for stretch
      stretchChecked: false,
      targetWidth: undefined,
      targetHeight: undefined
    };
  },
  mounted: function mounted() {
    var _this = this;

    this.$nextTick(function () {
      _this.rootNode = _this.getPopupDomNode();

      _this.setStretchSize();
    });
  },
  updated: function updated() {
    var _this2 = this;

    this.$nextTick(function () {
      _this2.setStretchSize();
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.$el.remove();
  },
  methods: {
    onAlign: function onAlign(popupDomNode, align) {
      var props = this.$props;
      var currentAlignClassName = props.getClassNameFromAlign(align); // FIX: https://github.com/react-component/trigger/issues/56
      // FIX: https://github.com/react-component/tooltip/issues/79

      if (this.currentAlignClassName !== currentAlignClassName) {
        this.currentAlignClassName = currentAlignClassName;
        popupDomNode.className = this.getClassName(currentAlignClassName);
      }

      this.$listeners.align && this.$listeners.align(popupDomNode, align);
    },
    // Record size if stretch needed
    setStretchSize: function setStretchSize() {
      var _this$$props = this.$props,
          stretch = _this$$props.stretch,
          getRootDomNode = _this$$props.getRootDomNode,
          visible = _this$$props.visible;
      var _this$$data = this.$data,
          stretchChecked = _this$$data.stretchChecked,
          targetHeight = _this$$data.targetHeight,
          targetWidth = _this$$data.targetWidth;

      if (!stretch || !visible) {
        if (stretchChecked) {
          this.setState({
            stretchChecked: false
          });
        }

        return;
      }

      var $ele = getRootDomNode();
      if (!$ele) return;
      var height = $ele.offsetHeight;
      var width = $ele.offsetWidth;

      if (targetHeight !== height || targetWidth !== width || !stretchChecked) {
        this.setState({
          stretchChecked: true,
          targetHeight: height,
          targetWidth: width
        });
      }
    },
    getPopupDomNode: function getPopupDomNode() {
      return this.$refs.popupInstance ? this.$refs.popupInstance.$el : null;
    },
    getTargetElement: function getTargetElement() {
      return this.$props.getRootDomNode();
    },
    // `target` on `rc-align` can accept as a function to get the bind element or a point.
    // ref: https://www.npmjs.com/package/rc-align
    getAlignTarget: function getAlignTarget() {
      var point = this.$props.point;

      if (point) {
        return point;
      }

      return this.getTargetElement;
    },
    getMaskTransitionName: function getMaskTransitionName() {
      var props = this.$props;
      var transitionName = props.maskTransitionName;
      var animation = props.maskAnimation;

      if (!transitionName && animation) {
        transitionName = "".concat(props.prefixCls, "-").concat(animation);
      }

      return transitionName;
    },
    getTransitionName: function getTransitionName() {
      var props = this.$props;
      var transitionName = props.transitionName;
      var animation = props.animation;

      if (!transitionName) {
        if (typeof animation === 'string') {
          transitionName = "".concat(animation);
        } else if (animation && animation.props && animation.props.name) {
          transitionName = animation.props.name;
        }
      }

      return transitionName;
    },
    getClassName: function getClassName(currentAlignClassName) {
      return "".concat(this.$props.prefixCls, " ").concat(this.$props.popupClassName, " ").concat(currentAlignClassName);
    },
    getPopupElement: function getPopupElement() {
      var _this3 = this;

      var h = this.$createElement;
      var props = this.$props,
          $slots = this.$slots,
          $listeners = this.$listeners,
          getTransitionName = this.getTransitionName;
      var _this$$data2 = this.$data,
          stretchChecked = _this$$data2.stretchChecked,
          targetHeight = _this$$data2.targetHeight,
          targetWidth = _this$$data2.targetWidth;
      var align = props.align,
          visible = props.visible,
          prefixCls = props.prefixCls,
          animation = props.animation,
          popupStyle = props.popupStyle,
          getClassNameFromAlign = props.getClassNameFromAlign,
          destroyPopupOnHide = props.destroyPopupOnHide,
          stretch = props.stretch; // const { mouseenter, mouseleave } = $listeners

      var className = this.getClassName(this.currentAlignClassName || getClassNameFromAlign(align)); // const hiddenClassName = `${prefixCls}-hidden`

      if (!visible) {
        this.currentAlignClassName = null;
      }

      var sizeStyle = {};

      if (stretch) {
        // Stretch with target
        if (stretch.indexOf('height') !== -1) {
          sizeStyle.height = typeof targetHeight === 'number' ? "".concat(targetHeight, "px") : targetHeight;
        } else if (stretch.indexOf('minHeight') !== -1) {
          sizeStyle.minHeight = typeof targetHeight === 'number' ? "".concat(targetHeight, "px") : targetHeight;
        }

        if (stretch.indexOf('width') !== -1) {
          sizeStyle.width = typeof targetWidth === 'number' ? "".concat(targetWidth, "px") : targetWidth;
        } else if (stretch.indexOf('minWidth') !== -1) {
          sizeStyle.minWidth = typeof targetWidth === 'number' ? "".concat(targetWidth, "px") : targetWidth;
        } // Delay force align to makes ui smooth


        if (!stretchChecked) {
          // sizeStyle.visibility = 'hidden'
          setTimeout(function () {
            if (_this3.$refs.alignInstance) {
              _this3.$refs.alignInstance.forceAlign();
            }
          }, 0);
        }
      }

      var popupInnerProps = {
        props: {
          prefixCls: prefixCls,
          visible: visible // hiddenClassName,

        },
        "class": className,
        on: $listeners,
        ref: 'popupInstance',
        style: _objectSpread({}, sizeStyle, popupStyle, this.getZIndexStyle())
      };
      var transitionProps = {
        props: _extends({
          appear: true,
          css: false
        })
      };
      var transitionName = getTransitionName();
      var useTransition = !!transitionName;
      var transitionEvent = {
        beforeEnter: function beforeEnter() {// el.style.display = el.__vOriginalDisplay
          // this.$refs.alignInstance.forceAlign()
        },
        enter: function enter(el, done) {
          // align updated后执行动画
          _this3.$nextTick(function () {
            if (_this3.$refs.alignInstance) {
              _this3.$refs.alignInstance.$nextTick(function () {
                animate(el, "".concat(transitionName, "-enter"), done);
              });
            }
          });
        },
        leave: function leave(el, done) {
          animate(el, "".concat(transitionName, "-leave"), done);
        }
      };

      if (typeof animation === 'object') {
        useTransition = true;

        var _animation$on = animation.on,
            on = _animation$on === void 0 ? {} : _animation$on,
            _animation$props = animation.props,
            _props = _animation$props === void 0 ? {} : _animation$props;

        transitionProps.props = _objectSpread({}, transitionProps.props, _props);
        transitionProps.on = _objectSpread({}, transitionEvent, on);
      } else {
        transitionProps.on = transitionEvent;
      }

      if (!useTransition) {
        transitionProps = {};
      }

      if (destroyPopupOnHide) {
        return h("transition", _mergeJSXProps([{}, transitionProps]), [visible ? h(Align, {
          "attrs": {
            "target": this.getAlignTarget(),
            "monitorWindowResize": true,
            "align": align
          },
          "key": "popup",
          "ref": "alignInstance",
          "on": {
            "align": this.onAlign
          }
        }, [h(PopupInner, _mergeJSXProps2([{}, popupInnerProps]), [$slots["default"]])]) : null]);
      }

      return h("transition", _mergeJSXProps4([{}, transitionProps]), [h(Align, {
        "directives": [{
          name: "show",
          value: visible
        }],
        "attrs": {
          "target": this.getAlignTarget(),
          "monitorWindowResize": true,
          "disabled": !visible,
          "align": align
        },
        "key": "popup",
        "ref": "alignInstance",
        "on": {
          "align": this.onAlign
        }
      }, [h(PopupInner, _mergeJSXProps3([{}, popupInnerProps]), [$slots["default"]])])]);
    },
    getZIndexStyle: function getZIndexStyle() {
      var style = {};
      var props = this.$props;

      if (props.zIndex !== undefined) {
        style.zIndex = props.zIndex;
      }

      return style;
    },
    getMaskElement: function getMaskElement() {
      var h = this.$createElement;
      var props = this.$props;
      var maskElement = null;

      if (props.mask) {
        var maskTransition = this.getMaskTransitionName();
        maskElement = h(LazyRenderBox, {
          "directives": [{
            name: "show",
            value: props.visible
          }],
          "style": this.getZIndexStyle(),
          "key": "mask",
          "class": "".concat(props.prefixCls, "-mask"),
          "attrs": {
            "visible": props.visible
          }
        });

        if (maskTransition) {
          maskElement = h("transition", {
            "attrs": {
              "appear": true,
              "name": maskTransition
            }
          }, [maskElement]);
        }
      }

      return maskElement;
    }
  },
  render: function render() {
    var h = arguments[0];
    var getMaskElement = this.getMaskElement,
        getPopupElement = this.getPopupElement;
    return h("div", [getMaskElement(), getPopupElement()]);
  }
};