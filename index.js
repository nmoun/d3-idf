
var svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");

var citiesFeaturesCollection = null;


var request = new XMLHttpRequest();
request.responseType = 'json';
request.open('GET', 'file:///C:/Users/Nicolas/Documents/projects/d3-idf/salaires.geojson');
request.send();
request.onload = function () {
  citiesFeaturesCollection = request.response;
  changeCriteria();
};

var max = 1, min = -11, rangeLegend = [600, 1000];

var g = svg.append("g")
  .attr("class", "key")
  .attr("transform", "translate(0,20)");

g.append("text")
  .attr("class", "caption")
  .attr("x", rangeLegend[0])
  .attr("y", -6)
  .attr("fill", "#000")
  .attr("text-anchor", "start")
  .attr("font-weight", "bold")
  .attr("font-family", "Nasalization")
  .text("Différence salaire hommes/femmes 2014");

g.append("rect")
    .attr("x", rangeLegend[0])
    .attr("y", 0)
    .attr("width", rangeLegend[1] - rangeLegend[0])
    .attr("height", 8)
    .style("fill", "url(#linear-gradient)"); 

var mapContainer = svg
  .append('g')
  .attr("transform", "translate(0,50)");


var radios = document.getElementsByName("criteria");
for(var i  = 0 ; i < radios.length ;i++){
  radios[i].onchange = changeCriteria;
}

createLinearGradient();

function getAxis(min, max){
  var scale = d3.scaleLinear()
    .domain([min, max])
    .rangeRound(rangeLegend);

  var values = d3.range(min, max, (parseFloat(max)- parseFloat(min))/5).map(d => d.toFixed(2));
  values.push(parseFloat(max).toFixed(2));
  var xAxis = d3.axisBottom(scale)
    .tickSize(10)
    .tickValues(values)
    .tickFormat(function(n) { return n + "€/h"});

  return xAxis;
}

function updateLegend(min, max){
  updateLinearGradient(min, max);
  axe = getAxis(min, max);
  g.selectAll("g").remove();
  g.append("g").call(axe);
  g.select('.domain').remove();
}

function createLinearGradient(){
  svg.selectAll("defs").remove();
    
  linearGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "linear-gradient");

  linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", '#cc0000');

  linearGradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", '#ffffff');

  linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", '#0066ff');
}

function updateLinearGradient(min, max){
  
  var positionZero = d3.scaleLinear()
    .domain([min, max])
    .range([0, 100]);
    
  var linearGradient = svg.select("linearGradient");

  var offset = Math.max(positionZero(0), 0)
  linearGradient
    .selectAll("stop")
    .filter(function(){
      return this.getAttribute('stop-color') == '#ffffff'
    })
    .transition()
    .duration(1000)
    .attr('offset',offset + "%");
};

function changeCriteria(){
  var radios = document.getElementsByName("criteria");
  var value = null;
  for(var i  = 0 ; i < radios.length ;i++){
    if(radios[i].checked){
      value = radios[i].value;
    }
  }
  // var value = select.selectedOptions[0].value
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

  updateLegend(min, max);

  // map generation
  var paths = mapContainer
    .selectAll("path")
    .data(citiesFeaturesCollection.features, function(d) {
      return d.properties.codgeo;
    });
  
  paths
    .transition()
    .duration(500)
    .attr("fill",function(d){
      return color(d.properties[h] - d.properties[f])
    })
    .selectAll("title")
    .text(function(d){
      return d.properties.libgeo + " : h = " + d.properties[h] + " - f : " + d.properties[f];
    }); // update 

  // add
  paths.enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "#555555")
    .attr("fill",function(d){
      return color(d.properties[h] - d.properties[f])
    })
    .append("title")
    .text(function(d){
      return  d.properties.libgeo + " : h = " + d.properties[h] + " - f : " + d.properties[f];
    });

  // remove
  paths.exit().remove();
}