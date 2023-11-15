//window.addEventListener("load", fetchAPOD);
//async function sendApiRequest() {
//let API_KEY = "f0BjM6fJZ6AdytjD5xX0eFaEmqUrNKH9eMgLwjyz";
//let response = await fetch(
// `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`
//);
//console.log(response);
//let data = await response.json();
//console.log(data);
//}//

const apiKey = "f0BjM6fJZ6AdytjD5xX0eFaEmqUrNKH9eMgLwjyz";

function fetchAPOD() {
	const apodDate = document.getElementById("searchDate").value;
	const apodVideo = document.getElementById("apodVideo");
	const apodImage = document.getElementById("apodImage");
	const apodDescription = document.getElementById("apodDescription");

	//check is date is empty
	if (apodDate == "") {
		alert("please select date");
		return;
	}
	const now = new Date();
	const dt = new Date(apodDate);
	if (dt.getDate() > now.getDate()) {
		alert("date cannot be in future");
		return;
	}
	const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${apodDate}`;

	apodImage.style.display = "none";
	apodVideo.style.display = "none";
	apodDescription.style.display = "none";

	fetch(apiUrl)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			if (data.media_type == "image") {
				apodImage.style.display = "block";
				apodImage.src = data.url;
				apodImage.alt = data.title;
			} else if (data.media_type == "video") {
				apodVideo.style.display = "block";

				apodVideo.src = data.url;
			}
			apodDescription.style.display = "block";
			apodDescription.textContent = data.title + ": " + data.explanation;
		})
		.catch((error) => {
			console.error("There was a problem fetching data:", error);
		});

	showGraph(apodDate);
}
// First Graph

function showGraph(toDate) {
	const loader = document.getElementById("loader");
	const graphContainer = document.getElementById("graphContainer");
	const graphText = document.getElementById("graphText");
	const graphText1 = document.getElementById("graphText1");
	graphText.style.display = "none";
	graphText1.style.display = "none";
	graphContainer.style.display = "none";
	loader.style.display = "block";
	let fromDate = new Date(toDate);
	fromDate.setDate(fromDate.getDate() - 7);

	const fromDateString = fromDate.toISOString().split("T");

	const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${fromDateString}&end_date= ${toDate}&api_key=${apiKey}`;
	let rows = [];

	fetch(url)
		.then((res) => res.json())
		.then((data) => {
			let near_earth_objects = Object.entries(data.near_earth_objects);
			for (let element of near_earth_objects) {
				const obj = { date: element[0], value: element[1].length };
				rows.push(obj);
			}
			showScatterGraph(data);
			//graph margins and dimensions

			///Set graph margins and dimensions
			var svg = d3.select("#barsvg"),
				margin = 150,
				width = svg.attr("width") - margin,
				height = svg.attr("height") - margin;
			svg.selectAll("*").remove();
			svg
				.append("text")
				.attr("transform", "translate(180,0)")
				.attr("x", 50)
				.attr("y", 50)
				.attr("font-size", "20px")
				.attr("font-color", "white")
				.text("Bar Graph showing the Near Earth Misses");

			var xScale = d3.scaleBand().range([0, width]).padding(0.4);

			var yScale = d3.scaleLinear().range([height, 0]);

			var g = svg
				.append("g")
				.attr("transform", "translate(" + 100 + "," + 100 + ")");

			xScale.domain(
				rows.map(function (d) {
					return d.date;
				})
			);
			yScale.domain([
				0,
				d3.max(rows, function (d) {
					return d.value;
				}),
			]);

			g.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(xScale))
				.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-45)")
				.style("text-anchor", "end");

			g.append("g").call(
				d3
					.axisLeft(yScale)
					.tickFormat(function (d) {
						return d;
					})
					.ticks(10)
			);

			g.selectAll(".bar")
				.data(rows)
				.enter()
				.append("rect")
				.attr("class", "bar")
				.attr("x", function (d) {
					return xScale(d.date);
				})
				.attr("y", function (d) {
					return yScale(d.value);
				})
				.attr("width", xScale.bandwidth())
				.attr("height", function (d) {
					return height - yScale(d.value);
				});
			graphText.style.display = "block";
			graphText1.style.display = "block";
			graphContainer.style.display = "block";
			loader.style.display = "none";
		})

		.catch((err) => {
			console.log(`error ${err}`);
		});
}

// Second Graph

function showScatterGraph(data) {
	var totalWidth = 800;
	var totalHeight = 600;

	var margin = {
		top: 50,
		left: 50,
		bottom: 30,
		right: 30,
	};

	var width = totalWidth - margin.left - margin.right;
	var height = totalHeight - margin.top - margin.bottom;
	var formatDecimal = d3.format(",.0f");

	// Data selection

	var theData = [];
	let near_earth_objects = Object.entries(data.near_earth_objects);
	for (let element of near_earth_objects) {
		var date = element[0];
		element[1].forEach((nmo) => {
			var item = {
				radius: nmo.absolute_magnitude_h * 10,
				cx: parseFloat(nmo.close_approach_data[0].miss_distance.kilometers),
				cy: nmo.absolute_magnitude_h * 10,
			};
			theData.push(item);
		});
	}
	// Size Scale
	var sizeDomain = d3.extent(theData, function (d) {
		return d.radius;
	});

	var sizeRange = [4, 16];

	var sizeScale = d3.scaleLinear().domain(sizeDomain).range(sizeRange);

	// X Scale
	var xDomain = d3.extent(theData, function (d) {
		return d.cx;
	});

	var xRange = [0, width];
	var xPadding = d3.mean(theData, function (d) {
		return d.cx;
	});
	var xScale = d3.scaleLinear().domain(xDomain).range(xRange).nice(10);

	// Y Scale
	var yDomain = d3.extent(theData, function (d) {
		return d.cy;
	});
	var yRange = [height, 0];
	var yScale = d3.scaleLinear().domain(yDomain).range(yRange).nice(5);

	// Colour scale
	var colorDomain = d3.extent(theData, function (d) {
		return d.radius;
	});

	var colorize = d3.scaleSequential(d3.interpolateRdPu);

	var colorScale = d3.scaleLinear().domain(colorDomain).range([0, 1]);

	var xAxis = d3.axisBottom(xScale).tickSize(6).tickSizeInner(-height);

	var yAxis = d3.axisLeft(yScale).ticks(5).tickSizeInner(-width);

	// Grouping scatter ID

	var svg = d3
		.select("#scatterplot")
		.attr("width", totalWidth)
		.attr("height", totalHeight);

	// Svg group

	var mainGroup = svg
		.append("g")
		.attr("id", "mainGroup")
		.attr("transform", "translate( " + margin.left + ", " + margin.top + ")");

	var xAxisGroup = mainGroup
		.append("g")
		.attr("id", "xaxis")
		.attr("class", "axis")
		.attr("transform", "translate( 0," + height + ")")
		.call(function customXAxis(g) {
			g.call(xAxis);

			g.selectAll(".tick:not(:first-of-type) line")
				.attr("stroke", "#777")
				.attr("stroke-dasharray", "3,2");

			g.selectAll(".tick text").attr("y", 9);
		});

	var yAxisGroup = mainGroup
		.append("g")
		.attr("id", "yaxis")
		.attr("class", "axis")
		.call(function customYAxis(g) {
			g.call(yAxis);

			g.selectAll(".tick:not(:first-of-type) line")
				.attr("stroke", "#777")
				.attr("stroke-dasharray", "3,2");
			g.selectAll(".tick text").attr("x", -9);
		});

	var eventGroup = mainGroup.append("g").attr("id", "event-overlay");

	var crosshair = eventGroup.append("g").attr("id", "crosshair");

	var eventRect = eventGroup.append("rect");

	var canvasGroup = eventGroup.append("g").attr("id", "circleGroup");

	// create a tooltip
	var tooltip = d3
		.select("#scatterplot")
		.append("div")
		.style("position", "absolute")
		.style("visibility", "hidden")
		.text("I'm a circle!");

	//
	d3.select("#circleBasicTooltip")
		.on("mouseover", function () {
			return tooltip.style("visibility", "visible");
		})
		.on("mousemove", function () {
			return tooltip
				.style("top", event.pageY - 800 + "px")
				.style("left", event.pageX - 800 + "px");
		})
		.on("mouseout", function () {
			return tooltip.style("visibility", "hidden");
		});

	// Chart Assembly

	var crosshairSettings = {
		xLabelTextOffset: height + 12,
		yLabelTextOffset: -9,
		labelWidth: 38,
		labelHeight: 14,
		labelColor: "#aaa",
		labelStrokeColor: "none",
		labelStrokeWidth: "0.5px",
	};

	crosshair.append("line").attrs({
		id: "focusLineX",
		class: "focusLine",
	});
	crosshair.append("line").attrs({
		id: "focusLineY",
		class: "focusLine",
	});

	crosshair.append("rect").attrs({
		id: "focusLineXLabelBackground",
		class: "focusLineLabelBackground",
		fill: crosshairSettings.labelColor,
		stroke: crosshairSettings.labelStrokeColor,
		"stroke-width": crosshairSettings.labelStrokeWidth,
		width: crosshairSettings.labelWidth,
		height: crosshairSettings.labelHeight,
	});

	crosshair.append("text").attrs({
		id: "focusLineXLabel",
		class: "label",
		"text-anchor": "middle",
		"alignment-baseline": "central",
	});

	var ylabel = crosshair.append("g").attr("id", "yLabelGroup");
	ylabel.append("rect").attrs({
		id: "focusLineYLabelBackground",
		class: "focusLineLabelBackground",
		fill: crosshairSettings.labelColor,
		stroke: crosshairSettings.labelStrokeColor,
		"stroke-width": crosshairSettings.labelStrokeWidth,
		width: crosshairSettings.labelWidth,
		height: crosshairSettings.labelHeight,
	});
	ylabel.append("text").attrs({
		id: "focusLineYLabel",
		class: "label",
		"text-anchor": "end",
		"alignment-baseline": "central",
	});

	canvasGroup
		.selectAll("circle")
		.data(theData)
		.enter()
		.append("circle")
		.attr("id", "circleBasicTooltip")
		.attr("cx", function (d) {
			return xScale(d.cx);
		})
		.attr("cy", function (d) {
			return yScale(d.cy);
		})
		.attr("r", function (d) {
			return sizeScale(sizeDomain[0]);
		})
		.style("fill", function (d) {
			return colorize(colorScale(d.radius));
		})
		.style("opacity", 1)
		.on("mouseover", function (d, i) {
			d3.select(this)
				.attrs({
					stroke: "#000000",
					"stroke-width": "1.5px",
					cursor: "pointer",
				})
				.styles({
					fill: "darkorange",
				});
			crosshair.style("display", null);
			setCrosshair(xScale(d.cx), yScale(d.cy));
		})
		.on("mouseout", function (d, i) {
			d3.select(this)
				.attrs({
					stroke: "none",
				})
				.style("fill", function (d) {
					return colorize(colorScale(d.radius));
				});
		})
		.transition()
		.attr("r", function (d) {
			return sizeScale(d.radius);
		});

	eventRect
		.attrs({
			width: width,
			height: height,
		})
		.styles({
			opacity: 0.0,
			display: null,
		})
		.on("mouseover", function () {
			crosshair.style("display", null);
		})
		.on("mouseout", function () {
			crosshair.style("display", "none");
		})
		.on("mousemove", function handleMouseMove() {
			var mouse = d3.mouse(this);

			var x = mouse[0];
			var y = mouse[1];

			setCrosshair(x, y);
		});

	//Graph Heading
	svg
		.append("text")
		.attr("x", totalWidth / 2)
		.attr("y", 20)
		.attr("text-anchor", "middle")
		.text(
			"Scatter Plot showing Asteroid Size in meters (Y) and its Distance from earth (X) "
		);
	// Crosshair data

	function setCrosshair(x, y) {
		d3.select("#focusLineX")
			.attr("x1", x)
			.attr("y1", 0)
			.attr("x2", x)
			.attr("y2", height + 6);

		d3.select("#focusLineY")
			.attr("x1", -6)
			.attr("y1", y)
			.attr("x2", width)
			.attr("y2", y);

		d3.select("#focusLineXLabel")
			.attr("x", x)
			.attr("y", height + 12)
			.text(formatDecimal(xScale.invert(x)));
		d3.select("#focusLineXLabelBackground")
			.attr(
				"transform",
				"translate( " +
					(x - crosshairSettings.labelWidth * 0.5) +
					" , " +
					(height + 5) +
					" )"
			)
			.text(formatDecimal(xScale.invert(x)));

		d3.select("#focusLineYLabel")
			.attr("transform", "translate( -9, " + y + ")")
			.text(formatDecimal(yScale.invert(y)));
		d3.select("#focusLineYLabelBackground").attr(
			"transform",
			"translate( " + -crosshairSettings.labelWidth + ", " + (y - 8) + ")"
		);
	}
}
