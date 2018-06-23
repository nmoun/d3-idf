
var svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");

var citiesFeaturesCollection = null;

fetch('file:///C:/Users/Nicolas/Documents/projects/d3-idf/salaries.json')
.then(function(res){
  if(res.status == 200){ console.log("wat");}
  return res.json();
})
.then(function(cities){

  citiesFeaturesCollection = {"type": "FeatureCollection", "features": cities.map(function(val){
    return {"type":"Feature","id": val.fields.codgeo,"properties":{
      "title": val.fields.libgeo,
      "snhmf2614": val.fields.snhmf2614,
      "snhm2614": val.fields.snhm2614,
      "snhmh2614": val.fields.snhmh2614,
      "snhmf1814": val.fields.snhmf1814,
      "snhm1814": val.fields.snhm1814,
      "snhmh1814": val.fields.snhmh1814,
      "snhmf5014": val.fields.snhmf5014,
      "snhm5014": val.fields.snhm5014,
      "snhmh5014": val.fields.snhmh5014,
    }, "geometry": val.fields.geo_shape };
  })};

  changeAge();

});

var max = 1, min = -11, rangeLegend = [600, 1000];
var xLegend = d3.scaleLinear()
    .domain([min, max])
    .rangeRound(rangeLegend);

var xAxis = d3.axisBottom(xLegend)
    .tickSize(10)
    .tickValues(d3.range(min + (parseFloat(max)- parseFloat(min))/5, max, (parseFloat(max)- parseFloat(min))/5).map(d => d.toFixed(2)))
    .tickFormat(function(n) { return n + "€/h"});

var g = svg.append("g")
.attr("class", "key")
.attr("transform", "translate(0,40)");

g.append("text")
  .attr("class", "caption")
  .attr("x", xLegend.range()[0])
  .attr("y", -6)
  .attr("fill", "#000")
  .attr("text-anchor", "start")
  .attr("font-weight", "bold")
  .text("Difference salaire 2014");

createLinearGradient(min, max);

g.append("rect")
    .attr("x", xLegend.range()[0])
    .attr("y", 0)
    .attr("width", xLegend.range()[1]-xLegend.range()[0])
    .attr("height", 8)
    .style("fill", "url(#linear-gradient)"); 

g.append("g").call(xAxis);

function getAxis(min, max){
  var scale = d3.scaleLinear()
    .domain([min, max])
    .rangeRound(rangeLegend);

  var xAxis = d3.axisBottom(scale)
    .tickSize(10)
    .tickValues(d3.range(min + (parseFloat(max)- parseFloat(min))/5, max, (parseFloat(max)- parseFloat(min))/5).map(d => d.toFixed(2)))
    .tickFormat(function(n) { return n + "€/h"});

  return xAxis;
}

function createLinearGradient(min, max){

  svg.selectAll("defs").remove();
  
  var positionZero = d3.scaleLinear()
    .domain([min, max])
    .range([0, 100]);

  console.log('percent zero ' + positionZero(0))
    
  var linearGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "linear-gradient");

  if(min < 0){
    linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", '#cc0000');

    var offset = positionZero(0)
    linearGradient.append("stop")
      .attr("offset", offset + "%")
      .attr("stop-color", '#ffffff');
  } else {
    linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", '#ffffff');
  }

  linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", '#0066ff');
};

function changeAge(){
  var select = document.getElementById("age-select");
  var value = select.selectedOptions[0].innerText
  var h = "snhmh" + value + "14", f = "snhmf" + value + "14";

  // Create a unit projection.
  var projection = d3.geoAlbers()
  .scale(1)
  .translate([0, 0])
  .rotate([20,0,0]);

  // Create a path generator.
  var path = d3.geoPath()
    .projection(projection);

  // Compute the bounds of a feature of interest, then derive scale & translate.
  var b = path.bounds(citiesFeaturesCollection),
  s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
  t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  console.log(JSON.stringify(citiesFeaturesCollection))

  // console.log("b: " + b)	
  // console.log("scale : " + s)	
  // console.log("translate : " + t)	

  // Update the projection to use computed scale & translate.
  projection
  .scale(s)
  .translate(t);
  
  // var color = d3.scaleLinear(d3.schemeBlues[9]);
  var tmp = citiesFeaturesCollection.features.map(function(v){
    return v.properties[h] - v.properties[f];
  })
  min = Math.min.apply(null, tmp);
  max = Math.max.apply(null, tmp);
  console.log("différence minimum = " + min)
  console.log("différence max = " + max)
  var color = d3.scaleLinear();

  if(min < 0){
    color.domain([min, 0 ,max])
    .range(["red", "white", "blue"]);
  } else {
    color.domain([min, max])
    .range(["white", "blue"]);
  }

  console.log("exemple color min: " + color(min))
  console.log("exemple color max: " + color(max))

  // LA LEGENDE
  createLinearGradient(min, max);
  // xLegend.domain([min, max])
  axe = getAxis(min, max);
  g.selectAll("g").remove();//.attr('transform',"translate(0," + (parseFloat(max)- parseFloat(min))/5 + ")").call(xAxis);
  g.append("g").call(axe);
  // legend.call(xAxis);

  // LA MAP
  var paths = svg
      .append('g')
      .selectAll("path")
      .filter(function(d){
        return d.attr('class').indexOf('domain') !== 'domain'
      })
      .data(citiesFeaturesCollection.features, function(d) { return d.codgeo; })
      .attr("fill",function(d){
        return color(Math.abs(d.properties[h] - d.properties[f]))
      }); // update

  paths
      .selectAll("title")
      .text(function(d){
        return  "up: " + d.properties.title + " : h = " + d.properties[h] + " - f : " + d.properties[f];
      }); // update title

  // add
  paths.enter()
    .append("path").attr("d", path)
    .attr("stroke", "#555555")
    .attr("fill",function(d){
      return color(d.properties[h] - d.properties[f])
    })
    .append("title")
    .text(function(d){
      return  d.properties.title + " : h = " + d.properties[h] + " - f : " + d.properties[f];
    });

  // remove
  paths.exit().remove();
}