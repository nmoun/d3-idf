
var svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");

// Create a unit projection.
var projection = d3.geoAlbers()
.scale(1)
.translate([0, 0]);

// Create a path generator.
var path = d3.geoPath()
.projection(projection);


fetch('file:///C:/Users/Nicolas/Documents/projects/d3-idf/us-10m.v1.json')
.then(function(res){
if(res.status == 200){ console.log("wat");}
return res.json();
})
.then(function(us){
console.log("US");
console.log("US topojson.feature: " + JSON.stringify(topojson.feature(us, us.objects.counties)));
console.log("US raw: " + JSON.stringify(us.objects.counties));

});

fetch('file:///C:/Users/Nicolas/Documents/projects/d3-idf/salaries.json')
.then(function(res){
  if(res.status == 200){ console.log("wat");}
  return res.json();
})
.then(function(cities){
  console.log("1st stuff");
  console.log(JSON.stringify(cities[0].fields.geo_shape));

  var citiesPolygon = cities[0].fields.geo_shape.coordinates;
  // var citiesFormatted = {"type":"FeatureCollection","features":[{"type":"Feature","id":"05089","properties":{},"geometry": cities[0].fields.geo_shape}]};

  // Compute the bounds of a feature of interest, then derive scale & translate.
  // var b = path.bounds(citiesFormatted),
  // s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
  // t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];


  // console.log("b: " + b)	
  // console.log("scale : " + s)	
  // console.log("translate : " + t)	

  // console.log(JSON.stringify(citiesFormatted))

  // Update the projection to use computed scale & translate.
  // projection
  // .scale(s)
  // .translate(t);
  console.log("" + citiesPolygon)

  var scaleX = d3.scaleLinear()
        .domain([2.28,2.34])
        .range([0,960]);

  var scaleY = d3.scaleLinear()
        .domain([48.84, 48.87])
        .range([500,0]);

  var line = d3.line()
        .x(function(d) {
          return scaleX(d[0]);
        })
        .y(function(d) {
          return scaleY(d[1]);
        });

  svg.selectAll("path")
  .data(citiesPolygon)
  .enter()
  .append("path")
  .attr("d", line)
  .attr("fill","#999999");
});
