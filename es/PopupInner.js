import _mergeJSXProps from "@vue/babel-helper-vue-jsx-merge-props";
import PropTypes from "vc-util-collection/es/vue-types";
import LazyRenderBox from './LazyRenderBox';
export default {
  props: {
    hiddenClassName: PropTypes.string.def(''),
    prefixCls: PropTypes.string,
    visible: PropTypes.bool
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
    return h("div", _mergeJSXProps([{}, divProps, {
      "class": !visible ? hiddenClassName : ''
    }]), [h(LazyRenderBox, {
      "class": "".concat(prefixCls, "-content"),
      "attrs": {
        "visible": visible
      }
    }, [this.$slots["default"]])]);
  }
};