"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vueTypes = _interopRequireDefault(require("vc-util-collection/lib/vue-types"));

var _default = {
  props: {
    visible: _vueTypes["default"].bool,
    hiddenClassName: _vueTypes["default"].string
  },
  render: function render() {
    var h = arguments[0];
    var _this$$props = this.$props,
        hiddenClassName = _this$$props.hiddenClassName,
        visible = _this$$props.visible;
    var children = null;

    if (hiddenClassName || !this.$slots["default"] || this.$slots["default"].length > 1) {
      var cls = '';

      if (!visible && hiddenClassName) {// cls += ` ${hiddenClassName}`
      }

      children = h("div", {
        "class": cls
      }, [this.$slots["default"]]);
    } else {
      children = this.$slots["default"][0];
    }

    return children;
  }
};
exports["default"] = _default;