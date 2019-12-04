'use strict';

(function() {

  let data = "no data";
  let filteredData = "no data"
  let svgContainer = ""; // keep SVG reference in global scope

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("crime.csv")
      .then((data) => makeScatterPlot(data));
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = d3.nest()
      .key((d) => d.district)
      .key((d) => d.shooting)
      .rollup((v) => d3.sum(v, (d) => d.amount))
      .entries(csvData); // assign data as global variable
    filteredData = csvData.filter((row) => row.year == 2018);

    // get arrays of fertility rate data and life Expectancy data
    let shooting_rate_data = data.map((row) => parseFloat(row["Y"]));
    let not_shooting_data = data.map((row) => parseFloat(row[""]));

    // find data limits
    let axesLimits = findMinMax(shooting_rate_data, not_shooting_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Y", "");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();

    let years = [2018, 2017, 2016, 2015];

    // add dropdown menu
    let dropDown = d3.select("#filter").append("select")
        .attr("name", "year");

    // add options to dropdown menu
    var options = dropDown.selectAll("option")
        .data(years)
        .enter()
        .append("option");

    options.text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    // add filter functionality to dropdown menu
    dropDown.on("change", function() {
        // remove previous points
        svgContainer.selectAll('.point').remove();

        // change filtered data
        let year = this.value;
        filteredData = csvData.filter((row) => row.year == year);

        //plot new points
        plotData(mapFunctions);
    });
  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Shooting vs. Non-shooting Crimes by District");

    svgContainer.append('text')
      .attr('x', 130)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Shooting Crime Frequency');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Non-Shooting Crime Frequency');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // get population data as array
    let pop_data = filteredData.map((row) => +row["pop_mlns"]);
    let pop_limits = d3.extent(pop_data);

    // make size scaling function for population
    let pop_map_func = d3.scaleLinear()
      .domain([pop_limits[0], pop_limits[1]])
      .range([3, 20]);

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(filteredData)
      .enter()
      .append('circle')
        .attr('class', 'point')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 5)
        .attr('fill', "#4286f4")
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
      .range([50, 450]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

})();