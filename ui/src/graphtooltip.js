import Tooltip from 'tooltip.js';

class GraphTooltip {
  constructor(data, graph_jq, tooltip_jq) {
    this.data = data;
    this.graph = graph;
    this.datapoint_current = undefined;
    this.tooltip_jq = tooltip_jq;
    let tooltip_options = {
      placement: 'right',
      html: true,
    };
    this.tooltip = new Tooltip(tooltip_jq, tooltip_options);
    var redefine_this = function(this_new, func) {
      return function(...args) {
        func.apply(this_new, args);
      };
    };
    graph_jq.bind("plothover", redefine_this(this, this.plothover));
    graph_jq.bind("plothovercleanup", redefine_this(this, this.plothovercleanup));
  }

  plothovercleanup(event, pos, item) {
    if (this.tooltip) {
      this.tooltip.hide();
    }
  }

  plothover(event, pos, item) {
    if (!pos.x || !pos.y) {
      return;
    }

    if (item) {
      if (this.datapoint_current == item.dataIndex) {
        this.tooltip.show();
        return;
      }
      this.datapoint_current = item.dataIndex;

      let entry = this.data[item.dataIndex];
      // FIXME: HTML can be injected if entry.<property> are malicious
      // TODO: make label a callback function to be filled in by outside user
      let label = entry.classname + "::" + entry.name + "<br>" + entry.time + " sec";
      let x = item.pageX;
      // HACK: Would rather set tooltip offset but something is lost
      // in translation when tooltip.js passes offset to popper.js
      let y = item.pageY + 40;

      this.tooltip_jq.offset({ left: x, top: y });
      this.tooltip.hide();
      this.tooltip.updateTitleContent(label);
      this.tooltip.show();

    } else {
      if (this.tooltip) {
        this.tooltip.hide();
      }
    }
  }
}

export {
  GraphTooltip
};
