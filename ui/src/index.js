import _ from 'lodash';
import Tooltip from 'tooltip.js';
var flot = require('flot');

var C = {
  base_url: window.location.protocol + '//' + window.location.host + '/api/v1/',
  graph: '#graph'
};

var S = {
  data: undefined,
  data_sorted: undefined,
  tooltip: undefined,
  tooltip_datapoint_current: undefined,
  plot: undefined,
  plot_overview: undefined,
};

function ep(endpoint) {
  return C.base_url + endpoint;
}

$(document).ready(function() {
  function plothover(event, pos, item) {

    if (!pos.x || !pos.y) {
      return;
    }

    if (item) {
      if (S.tooltip_datapoint_current == item.dataIndex) {
        S.tooltip.show();
        return;
      }
      S.tooltip_datapoint_current = item.dataIndex;

      var entry = S.data[item.dataIndex];
      // FIXME: HTML can be injected if entry.<property> are malicious
      var label = entry.classname + "::" + entry.name + "<br>" + entry.time + " sec";
      var x = item.datapoint[0].toFixed(2),
        y = item.datapoint[1].toFixed(2);

      x = item.pageX;
      // HACK: Would rather set tooltip offset but something is lost
      // in translation when tooltip.js passes offset to popper.js
      y = item.pageY + 40;

      $('#tooltip').offset({ left: x, top: y });
      S.tooltip.hide();
      S.tooltip.updateTitleContent(label);
      S.tooltip.show();

    } else {
      if (S.tooltip) {
        S.tooltip.hide();
      }
    }
  }

  $(C.graph).bind("plothover", plothover);

  function plothovercleanup(event, pos, item) {
      if (S.tooltip) {
        S.tooltip.hide();
      }
  }
  $(C.graph).bind("plothovercleanup", plothovercleanup);

  $(C.graph).bind("plotclick", function (event, pos, item) {
    console.log("Clicked");
  });

  var plotOptions = {
    xaxis: {
    },
    grid: {
      hoverable: true,
    },
    series: {
      points: {
        radius: 3,
        show: true,
        fill: true,
        fillColor: "#058DC7",
      },
      color: "#058DC7",
    },
    selection: {
      mode: "xy"
    }
  };

  function filterData(from, to) {
    var res = [];
    for (var i=parseInt(from); i <= parseInt(to); ++i) {
      res.push([i, S.data[i].time]);
    }
    console.log(JSON.stringify(res));
    return res;
  }

  $(C.graph).bind("plotselected", function (event, ranges) {
    // clamp the zooming to prevent eternal zoom
    if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
      ranges.xaxis.to = ranges.xaxis.from + 0.00001;
    }

    if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
      ranges.yaxis.to = ranges.yaxis.from + 0.00001;
    }

    // do the zooming
    S.plot = $.plot(C.graph, [filterData(ranges.xaxis.from, ranges.xaxis.to)],
      $.extend(true, {}, plotOptions, {
        xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
        yaxis: { min: ranges.yaxis.from, max: ranges.yaxis.to }
      })
    );

    S.plot_overview.setSelection(ranges, true);
  });
	$("#graph-overview").bind("plotselected", function (event, ranges) {
		S.plot.setSelection(ranges);
	});

  $.get(ep('cases/'), function(data) {
    S.data = data['results'];

    S.data.sort(function(a, b) {
      return b.time > a.time ? 1 : -1;
    });
    var index = 0;
    var datapoints = S.data.map(function(entry) {
      return [index++, entry.time];
    });

    S.plot = $.plot($(C.graph), [ datapoints ], plotOptions);
    S.plot_overview = $.plot("#graph-overview", [ datapoints ], plotOptions);

  });

  S.tooltip = new Tooltip($('#tooltip'), {
    placement: 'right',
    html: true,
  });

});
