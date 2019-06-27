"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _babelHelperVueJsxMergeProps = _interopRequireDefault(require("@vue/babel-helper-vue-jsx-merge-props"));

var _vueTypes = _interopRequireDefault(require("vc-util-collection/lib/vue-types"));

var _LazyRenderBox = _interopRequireDefault(require("./LazyRenderBox"));

var _default = {
  props: {
    hiddenClassName: _vueTypes["default"].string.def(''),
    prefixCls: _vueTypes["default"].string,
    visible: _vueTypes["default"].bool
  },
  render: function render() {
    var h = arguments[0];
    var _this$$props = this.$props,
        prefixCls = _this$$props.prefixCls,
        visible = _this$$props.visible,
        hiddenClassName = _this$$props.hiddenClassName;
    var $listeners = this.$listeners;
    var divProps = {
      on: $listeners
    };
    return h("div", (0, _babelHelperVueJsxMergeProps["default"])([{}, divProps, {
      "class": !visible ? hiddenClassName : ''
    }]), [h(_LazyRenderBox["default"], {
      "class": "".concat(prefixCls, "-content"),
      "attrs": {
        "visible": visible
      }
    }, [this.$slots["default"]])]);
  }
};
exports["default"] = _default;