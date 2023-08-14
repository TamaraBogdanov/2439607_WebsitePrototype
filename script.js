fetch("https://api.nasa.gov/neo/rest/v1/neo/3542519?api_key=DEMO_KEY", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "User 1" }),
})
  .then((res) => {
    return res.json();
  })

  .then((data) => console.log(data))
  .catch((error) => console.log("ERROR"));
