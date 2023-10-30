// Declare the chart dimensions and margins.
const width = 1450; // the outer width of the chart, in pixels
const height = window.innerHeight;
const apiKey = "L2RVpyHPSsvfTDaECnTmlpEnuqa5Fdns8So91S2P";

const yScale = d3
	.scaleLinear()
	.range([height - 4, 4])
	.domain([0, 1]);

const area = d3
	.area()
	// .defined(i => D[i])
	.curve(d3.curveBasis)
	.y((d) => yScale(d.y))
	.x0((d) => d.x1)
	.x1((d) => d.x2);

const svg = d3
	.select("#artContainer")
	.append("svg")
	.attr("height", height)
	.attr("viewBox", [0, 0, width, height])
	.attr("style", "max-width: 100%; height: auto; height: intrinsic;");

const g = svg.append("g").attr("transform", `translate(0, 0)`);

const lineScale = d3
	.scaleLinear()
	.range([18, width - 18])
	.domain([0, 1]);

const widthScale = d3.scaleLinear().range([0, 7]).domain([0, 1]);
//assign a current date to from dat
fetchData();

async function fetchData() {
	let fromDate = new Date();
	let totalLineData = [];
	let totalLines = 0;

	//Change the date to a 2 months ago
	fromDate.setMonth(fromDate.getMonth() - 3);
	//Remove time from the date
	const fromDateString = fromDate.toISOString().split("T")[0];
	//Build API url with the date as parameter
	const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${apiKey}&start_date=${fromDateString}`;
	//Call the api and fetch the data
	await fetch(apiUrl)
		.then((response) => response.json())
		.then((data) => {
			//Pull dates from the near_eath_objects object
			let near_earth_objects = Object.entries(data.near_earth_objects);
			//Iterate through the dates
			for (let element of near_earth_objects) {
				let diameterData = [];
				let velocityData = [];
				let missedDistanceData = [];
				let magnitudeData = [];
				let yOffset = 0.5;
				element[1].forEach((nmo) => {
					magnitudeData.push({
						x1: -nmo.absolute_magnitude_h / 10,
						x2: nmo.absolute_magnitude_h / 10,
						y: yOffset / near_earth_objects.length,
					});

					diameterData.push({
						x1: -nmo.estimated_diameter.meters.estimated_diameter_min,
						x2: nmo.estimated_diameter.meters.estimated_diameter_max,
						y: yOffset / near_earth_objects.length,
					});

					velocityData.push({
						x1: -nmo.close_approach_data[0].relative_velocity
							.kilometers_per_second,
						x2: nmo.close_approach_data[0].relative_velocity
							.kilometers_per_second,
						y: yOffset / near_earth_objects.length,
					});

					missedDistanceData.push({
						x1: -nmo.close_approach_data[0].miss_distance.lunar,
						x2: nmo.close_approach_data[0].miss_distance.lunar,
						y: yOffset / near_earth_objects.length,
					});

					yOffset++;
				});

				totalLines += 4;

				totalLineData.push(diameterData);
				totalLineData.push(velocityData);
				totalLineData.push(missedDistanceData);
				totalLineData.push(magnitudeData);
			}
		})
		.catch((error) => {
			console.log(error);
		});

	for (let i = 0; i < totalLines; i++) {
		g.append("path")
			.attr("stroke", "#777")
			.attr("fill", getColourScheme(Math.floor(Math.random() * 6) + 1))
			.attr("fill-opacity", 0.3)
			.attr("d", area(totalLineData[i]))
			.attr("transform", `translate(${lineScale(i / totalLines)},0)`);
	}
}

//
getColourScheme = (number) => {
	switch (number) {
		case 1:
			return d3.schemeBlues[6][4];
		case 2:
			return d3.schemePurples[6][4];
		case 3:
			return d3.schemeReds[6][4];
		case 4:
			return d3.schemeGreens[6][4];
		case 5:
			return d3.schemeGreys[6][4];
		case 6:
			return d3.schemeOranges[6][4];
		default:
			// purple
			return d3.schemePurples[6][4];
	}
};
