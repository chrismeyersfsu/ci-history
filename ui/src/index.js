import _ from 'lodash';
import Tooltip from 'tooltip.js';
var flot = require('flot');

var C = {
  base_url: window.location.protocol + '//' + window.location.host + '/api/v1/',
  graph: '#graph'
};

var S = {
  data: undefined,
  tooltip: undefined,
  tooltip_datapoint_current: undefined,
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
      var label = entry.classname + "::" + entry.name;
			var x = item.datapoint[0].toFixed(2),
				y = item.datapoint[1].toFixed(2);

      x = item.pageX;
      // HACK: Would rather set tooltip offset but something is lost
      // in translation when tooltip.js passes offset to popper.js
      y = item.pageY + 25;

      console.log(x, y);
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
  $('#graphByTime').bind("plothover", plothover);

	function plothovercleanup(event, pos, item) {
      if (S.tooltip) {
				S.tooltip.hide();
			}
	}
  $(C.graph).bind("plothovercleanup", plothovercleanup);
  $('#graphByTime').bind("plothovercleanup", plothovercleanup);

	$(C.graph).bind("plotclick", function (event, pos, item) {
		if (item) {
			$("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
			plot.highlight(item.series, item.datapoint);
		}
	});

	var plotOptions = {
		xaxis: {
			mode: "categories",
			show: false,
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

	$("#graph").bind("plotselected", function (event, ranges) {
		// clamp the zooming to prevent eternal zoom
		if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
			ranges.xaxis.to = ranges.xaxis.from + 0.00001;
		}

		if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
			ranges.yaxis.to = ranges.yaxis.from + 0.00001;
		}

		// do the zooming
		$.plot("#graph", getData(ranges.xaxis.from, ranges.xaxis.to),
			$.extend(true, {}, options, {
				xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
				yaxis: { min: ranges.yaxis.from, max: ranges.yaxis.to }
			})
		);

		// don't fire event on the overview to prevent eternal loop
		overview.setSelection(ranges, true);
	});


  $.get(ep('cases/'), function(data) {
    S.data = data['results'];
    var datapoints = data['results'].map(function(entry) {
      return [entry.classname, entry.time];
    });

    var dByTime = data['results'];
    dByTime.sort(function(a, b) {
      return a.time > b.time ? 1 : -1;
    });
    var index = 0;
    var pointsByTime = dByTime.map(function(entry) {
      return [index++, entry.time];
    });
    console.log(pointsByTime);

    $.plot($(C.graph), [ datapoints ], plotOptions);
    $.plot($('#graphByTime'), [ pointsByTime ], plotOptions);

  });

  S.tooltip = new Tooltip($('#tooltip'), {
    placement: 'right',
    title: "blah blah",
  });

});
