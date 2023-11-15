//Interactive Graph
const apiKey = "L2RVpyHPSsvfTDaECnTmlpEnuqa5Fdns8So91S2P";
var cell;
var circles;
var svg = d3.select("svg"),
	width = +svg.attr("width"),
	height = +svg.attr("height"),
	radius = 800;

var voronoi = d3
	.voronoi()
	.x(function (d) {
		return d.x;
	})
	.y(function (d) {
		return d.y;
	})
	.extent([
		[-1, -1],
		[width + 1, height + 1],
	]);

getData();

//Drag functions

function dragstarted(d) {
	d3.select(this).raise().classed("active", true);
}

function dragged(d) {
	d3.select(this)
		.select("circle")
		.attr("cx", (d.x = d3.event.x))
		.attr("cy", (d.y = d3.event.y));
	cell = cell.data(voronoi.polygons(circles)).attr("d", renderCell);
}

function dragended(d, i) {
	d3.select(this).classed("active", false);
}

function renderCell(d) {
	return d == null ? null : "M" + d.join("L") + "Z";
}

function getData() {
	let totalLineData = [];

	const fromDateString = "2023-08-18";
	//Build API url with the date as parameter
	const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${apiKey}&start_date=${fromDateString}`;
	//Call the api and fetch the data
	fetch(apiUrl)
		.then((response) => response.json())
		.then((data) => {
			//Pull dates from the near_eath_objects object
			let near_earth_objects = Object.entries(data.near_earth_objects);
			//Iterate through the dates
			for (let element of near_earth_objects) {
				element[1].forEach((nmo) => {
					totalLineData.push({
						x: Math.round(
							nmo.estimated_diameter.kilometers.estimated_diameter_max *
								1.5 *
								(width - radius * 2) +
								radius
						),
						y: Math.round(
							nmo.close_approach_data[0].miss_distance.astronomical *
								(height - radius * 2) +
								radius
						),
					});
				});
			}

			circles = totalLineData.slice(0, 50);
			var test = d3.range(50).map(function () {
				return {
					x: Math.round(Math.random() * (width - radius * 2) + radius),
					y: Math.round(Math.random() * (height - radius * 2) + radius),
				};
			});

			debugger;
			renderData();
		})
		.catch((error) => {
			console.log(error);
		});
}

//Colour render
function renderData() {
	var color = d3
		.scaleOrdinal()
		.domain(circles)
		.range([
			"#000004",
			"#140e36",
			"#3b0f70",
			"#641a80",
			"#8c2981",
			"#b73779",
			"#de4968",
			"#f7705c",
			"#fe9f6d",
			"#fecf92",
			"#fcfdbf",
		]);

	//Circles and Cells
	var circle = svg
		.selectAll("g")
		.data(circles)
		.enter()
		.append("g")
		.call(
			d3
				.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended)
		);

	cell = circle
		.append("path")
		.data(voronoi.polygons(circles))
		.attr("d", renderCell)
		.attr("id", function (d, i) {
			return "cell-" + i;
		});

	circle
		.append("clipPath")
		.attr("id", function (d, i) {
			return "clip-" + i;
		})
		.append("use")
		.attr("xlink:href", function (d, i) {
			return "#cell-" + i;
		});

	circle
		.append("circle")
		.attr("clip-path", function (d, i) {
			return "url(#clip-" + i + ")";
		})
		.attr("cx", function (d) {
			return d.x;
		})
		.attr("cy", function (d) {
			return d.y;
		})
		.attr("r", radius)
		.style("fill", function (d, i) {
			return color(i);
		});
}
