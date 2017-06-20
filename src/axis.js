cubism_contextPrototype.axis = function() {
  var context = this,
      scale = context.scale,
      axis_ = d3.svg.axis().scale(scale);

  var formatDefault = context.step() < 6e4 ? cubism_axisFormatSeconds
      : context.step() < 864e5 ? cubism_axisFormatMinutes
      : cubism_axisFormatDays;
  var format = formatDefault;

  function axis(selection) {
    var id = ++cubism_id,
        tick,
        tickLine;

    var g = selection.append("svg")
        .datum({id: id})
        .attr("width", context.size())
        .attr("height", Math.max(28, -axis.tickSize()))
      .append("g")
        .attr("transform", "translate(0," + (axis_.orient() === "top" ? 27 : 4) + ")")
        .call(axis_);
    tickLine = g.append('line').style('display', 'none').attr('y1', 0).attr('y2', -2);

    context.on("change.axis-" + id, function() {
      g.call(axis_);
      if (!tick) tick = d3.select(g.node().appendChild(g.selectAll("text").node().cloneNode(true)))
          .style("display", "none")
          .text(null);
    });

    context.on("focus.axis-" + id, function(i) {
      if (tick) {
        if (i == null) {
          g.selectAll("text").style("fill-opacity", null);
          g.selectAll("line").style("display", null);
          tick.style("display", "none");
          tickLine.style("display", "none");
        } else {
          tick.style("display", null).text(format(scale.invert(i)));
          tickLine.style("display", null).attr('x1', i).attr('x2', i);
          var tickWidth = tick.node().getComputedTextLength();
          var tickI = Math.min(Math.max(tickWidth/2, i), context.size() - tickWidth/2);
          tick.attr("x", tickI);
          g.selectAll("text").style("fill-opacity", function(d) { return Math.abs(scale(d) - i) < tickWidth + 6 ? 0 : 1; });
          g.selectAll("line").style("display", function(d) { return Math.abs(scale(d) - i) < tickWidth + 6 ? 'none' : null; });
        }
      }
    });
  }

  axis.remove = function(selection) {

    selection.selectAll("svg")
        .each(remove)
        .remove();

    function remove(d) {
      context.on("change.axis-" + d.id, null);
      context.on("focus.axis-" + d.id, null);
    }
  };

  axis.focusFormat = function(_) {
    if (!arguments.length) return format == formatDefault ? null : _;
    format = _ == null ? formatDefault : _;
    return axis;
  };

  return d3.rebind(axis, axis_,
      "orient",
      "ticks",
      "tickSubdivide",
      "tickSize",
      "tickPadding",
      "tickFormat");
};

var cubism_axisFormatSeconds = d3.time.format("%I:%M:%S %p"),
    cubism_axisFormatMinutes = d3.time.format("%I:%M %p"),
    cubism_axisFormatDays = d3.time.format("%B %d");
