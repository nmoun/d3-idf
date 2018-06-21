
var svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");




fetch('file:///C:/Users/Nicolas/Documents/projects/d3-idf/us-10m.v1.json')
.then(function(res){
  return res.json();
})
.then(function(us){
// console.log("US");
console.log("US topojson.feature(us, us.objects.counties).features: " + JSON.stringify(topojson.feature(us, us.objects.counties).features));
console.log("US topojson.feature(us, us.objects.counties): " + JSON.stringify(topojson.feature(us, us.objects.counties)));
});

fetch('file:///C:/Users/Nicolas/Documents/projects/d3-idf/salaries.json')
.then(function(res){
  if(res.status == 200){ console.log("wat");}
  return res.json();
})
.then(function(cities){

  var cities100 = {"type": "FeatureCollection", "features": cities.map(function(val){
    return {"type":"Feature","id": val.fields.codgeo,"properties":{"title": val.fields.libgeo}, "geometry": val.fields.geo_shape };
  })};

  // Create a unit projection.
  var projection = d3.geoAlbers()
  .scale(1)
  .translate([0, 0])
  .rotate([20,0,0]);

  // Create a path generator.
  var path = d3.geoPath()
    .projection(projection);

  // Compute the bounds of a feature of interest, then derive scale & translate.
  var b = path.bounds(cities100),
  s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
  t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  console.log(JSON.stringify(cities100))

  console.log("b: " + b)	
  console.log("scale : " + s)	
  console.log("translate : " + t)	

  console.log("petit b : " + path.bounds(cities100.features[0].geometry));
  // Update the projection to use computed scale & translate.
  projection
  .scale(s)
  .translate(t);
  

  svg.selectAll("path")
  .data(cities100.features)
  .enter()
  .append("path")
  .attr("d", path)
  .attr("fill","#999999")
  .append("title")
  .text(function(d){
    console.log("d yo " +d)
    console.log(JSON.stringify(d))
    return  d.properties.title;
  });
});
