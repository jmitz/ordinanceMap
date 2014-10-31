//app.js
// start.js
/*
 *  JavaScript used to get Query String from URL
 *  Posted http://stackoverflow.com/questions/979975/how-to-get-the-value-from-url-parameter
 */

var curOrdinance;
var fitted = 0;
var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
      // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
  fitted = false;
    return query_string;
} ();

curBasemap = 0;

basemaps = [{
  name: 'Streets',
  layer: L.esri.basemapLayer('Topographic')
},{
  name:'Imagery',
  layer:  L.layerGroup([
    L.esri.basemapLayer("Imagery"),
    L.esri.basemapLayer("ImageryLabels"),
    L.esri.basemapLayer("ImageryTransportation")
    ])
}];

referenceLayer = L.esri.dynamicMapLayer('http://geoservices.epa.illinois.gov/arcgis/rest/services/Boundaries/GroundwaterOrdinance/MapServer',{
    layers: [0], // 0 is ordinances
    opacity: 0.5 
});

var map = L.map('map',{
  maxZoom: 18,
  minZoom:6,
  zoom: 7,
  center: [40, -89.5],
  layers: [basemaps[curBasemap].layer, referenceLayer]
});


whereClause = "DLC_ID = '" + QueryString.ordinance + "'";

featureLayer = L.esri.featureLayer('http://geoservices.epa.illinois.gov/arcgis/rest/services/Boundaries/GroundwaterOrdinance/FeatureServer/0',{
  where: whereClause,
  precision: 5,
  crs: L.CRS.EPSG3857,
  onEachFeature: function(feature, layer){
    console.log(feature);
    console.log(layer);
  },

});

function switchBasemap(){
  map.removeLayer(basemaps[curBasemap].layer);
  jQuery('#switchBaseButton').html(basemaps[curBasemap].name);
  curBasemap = ++curBasemap % 2; // alternates curBasemap value between 0 and 1
  map.addLayer(basemaps[curBasemap].layer);
}

if (curOrdinance !== QueryString.ordinance){
  fitted = false;
  curOrdinance = QueryString.ordinance;  
}
featureLayer.on('load', function(e){
  if(!fitted && typeof(QueryString.ordinance)==='string'){
    try{
      map.fitBounds(featureLayer);
      fitted=true;
    }
    catch(err){
      // Display Unavailable Message
      console.log('No Feature Available');
      $('#dlcId').html(QueryString.ordinance);
      $('#noDataDiv').show();
    }
  }
});

map.addLayer(featureLayer);