import _ from 'lodash';
import { GraphTooltip } from './graphtooltip.js';
var flot = require('flot');

// Config
var C = {
  base_url: window.location.protocol + '//' + window.location.host + '/api/v1/',
  graph: '#graph',
  tooltip: '#tooltip',
};

// State
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

  $.get(ep('runs/'), function(data) {
    let run_id = data['results'][0]['_id']['$oid'];

    console.log("Getting run_id " + run_id);
    $.get(ep('cases/?run=' + run_id), function(data) {
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

      let tooltip = new GraphTooltip(S.data, $(C.graph), $(C.tooltip));

    });
  });


});
