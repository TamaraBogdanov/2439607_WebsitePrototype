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

function showGraph(toDate) {
	const loader = document.getElementById("loader");
	const graphContainer = document.getElementById("graphContainer");
	const graphText = document.getElementById("graphText");
	graphText.style.display = "none";
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

			//graph margins and dimensions

			///Set graph margins and dimensions
			var svg = d3.select("svg"),
				margin = 200,
				width = svg.attr("width") - margin,
				height = svg.attr("height") - margin;
			svg.selectAll("*").remove();
			svg
				.append("text")
				.attr("transform", "translate(180,0)")
				.attr("x", 50)
				.attr("y", 50)
				.attr("font-size", "16px")
				.text("Earth near misses");

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
			graphContainer.style.display = "block";
			loader.style.display = "none";
		})

		.catch((err) => {
			console.log(`error ${err}`);
		});
}
