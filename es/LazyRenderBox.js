import PropTypes from "vc-util-collection/es/vue-types";
export default {
  props: {
    visible: PropTypes.bool,
    hiddenClassName: PropTypes.string
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