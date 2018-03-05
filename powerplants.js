mapboxgl.accessToken = 'pk.eyJ1IjoiZmx5aW5nc2l5aW5nIiwiYSI6ImNqM25oMmV4YTAwMWIzMnF0Z2owdjd4b3QifQ.Ms5WS32cgwUCYDrHLw0k8g';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
    center: [-120, 37], // starting position [lng, lat]
    zoom: 6 // starting zoom
});

map.on('load', function() {
    map.addSource('powerplantsSource', {
        'type': 'geojson',
        // 'data': 'https://opendata.arcgis.com/datasets/4a702cd67be24ae7ab8173423a768e1b_0.geojson'
        'data': 'powerplants.geojson'
    });

    map.addLayer({
        'id': 'powerplants',
        'type': 'circle',
        'source': 'powerplantsSource',
        'paint': {
            'circle-radius': {
              'property': 'MW',
              'type': 'exponential',
              'stops': [
                [1,6],
                [2393, 30]
              ]
            },
            'circle-color': [
              'match',
              ['get', 'General_Fuel'],
              'Battery', '#ffed6f',
              'Biomass', '#b3de69',
              'Coal', '#fb8072',
              'Digester Gas','#8dd3c7',
              'Gas','#bebada',
              'Geothermal', '#ccc',
              'Hydro', '#80b1d3',
              'Landfill Gas', '#ccebc5',
              'MSW', '#bc80bd',
              'Nuclear', '#fccde5',
              'Solar PV', '#d9d9d9',
              'Solar Thermal', '#fdb462',
              'Wind', '#ffffb3',
              '#ccc'
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
            'circle-opacity': 0.8
        }
    });

    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
    var infoBox = document.getElementById('infoBox');

    map.on('mouseover', 'powerplants', function(e){
      map.getCanvas().style.cursor = 'pointer';
      var coordinates = e.features[0].geometry.coordinates.slice();
      var name = e.features[0].properties.Plant_Name;
      while(Math.abs(e.lngLat.lng - coordinates[0]) > 180){ //mark
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360:-360;
      }
      popup.setLngLat(coordinates)
        .setHTML(name)
        .addTo(map);
    });

    map.on('click', 'powerplants', function(e){
      map.getCanvas().style.cursor = 'pointer';
      var coordinates = e.features[0].geometry.coordinates.slice();
      while(Math.abs(e.lngLat.lng - coordinates[0]) > 180){ //mark
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360:-360;
      }
      infoBox.innerHTML = '<b>Plant Name: </b>' + e.features[0].properties.Plant_Name + '</br>';
      infoBox.innerHTML += '<b>Megawatt:  </b>' + e.features[0].properties.MW + '</br>';
      infoBox.innerHTML += '<b>General Fuel: </b>' + e.features[0].properties.General_Fuel + '</br>';
      infoBox.innerHTML += '<b>Status: </b>' + e.features[0].properties.Status + '</br>';
      infoBox.innerHTML += '<b>Plant County: </b>' + e.features[0].properties.Plant_County + '</br>';
      infoBox.innerHTML += '<b>Owner: </b>' + e.features[0].properties.Owner_Name + '</br>';
      if(e.features[0].properties.Service_Area){
        infoBox.innerHTML += '<b>Service Area: </b>' + e.features[0].properties.Service_Area + '</br>';
      }
    });

    map.on('mouseleave', 'powerplants', function(){
      map.getCanvas().style.cursor = '';
      popup.remove();
      infoBox.innerHTML = '';
      infoBox.innerHTML = 'Click the power plants to see more details';
    });





});

//init the accordion
function _initAccordion(){
  var acc = document.getElementsByClassName('my-accordion');
  for (var i = 0; i < acc.length; i++) {
    acc[i].addEventListener('click', function() {
      this.classList.toggle('active');
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight){
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  }
}


//init the layer manager
var box = document.getElementsByClassName('layerCheckbox');
for(var i = 0; i < box.length; i++){
  var checkbox = box[i];
  var layerId = checkbox.getAttribute('name');
  var legend = document.getElementById(layerId + 'Legend');
  checkbox.onclick = function(e){
    // e.preventDefault();
    // e.stopPropagation();
    if(checkbox.checked){
      map.setLayoutProperty(layerId, 'visibility', 'visible');
      legend.style.display = 'block';
    } else {
      map.setLayoutProperty(layerId, 'visibility', 'none');
      legend.style.display = 'none';
    }
  }
}


// init the legendBox
function _initLegend(){
  var powerplantsLegend = document.getElementById('legendBox');
  // var powerplantsLegend = document.getElementById('powerplantsLegend');
  var colorMap = [
    ['Battery', '#ffed6f'],
    ['Biomass', '#b3de69'],
    ['Coal', '#fb8072'],
    ['Digester Gas','#8dd3c7'],
    ['Gas','#bebada'],
    ['Geothermal', '#ccc'],
    ['Hydro', '#80b1d3'],
    ['Landfill Gas', '#ccebc5'],
    ['MSW', '#bc80bd'],
    ['Nuclear', '#fccde5'],
    ['Solar PV', '#d9d9d9'],
    ['Solar Thermal', '#fdb462'],
    ['Wind', '#ffffb3']
  ];
  for(var i=0; i< colorMap.length; i++){
    var div = document.createElement('div');
    div.innerHTML = '<span style="background-color:' + colorMap[i][1] + ' "></span>' + colorMap[i][0];
    powerplantsLegend.appendChild(div);
  }
}

function _initSearchTool(){
  // init the county dropdown
  var countySelect = document.getElementById('countySelect');
  var county = [];
  $.ajax({
    url:'countyQueryResult.json',
    dataType: 'json',
    success: function(res){
      var features = res.features;
      for(var i=0; i<features.length; i++){
        if(features[i].attributes['Plant_County']){
          var c = features[i].attributes['Plant_County'];
          county.push(c);
        }
      }
      county.sort();
      for(var i=0; i<county.length; i++){
        var c = county[i];
        var opt = document.createElement('option');
        opt.innerHTML = c;
        opt.setAttribute('value', c);
        countySelect.appendChild(opt);
      }
    },
    error: function(){
      console.log("Error: Failed to load the county data");
    }
  });

  $("#countySelect").change(function(){
    var selected = $("#countySelect").val();
    if(selected != 'Choose'){
      map.setFilter('powerplants', ['==', 'Plant_County', selected]);
    } else {
      map.setFilter('powerplants', null);
    }
  });

  // init the zipcode autocomplete
  var zipcodeInput = document.getElementById('zipcodeInput');
  var zipcode = [];
  $.ajax({
    url: 'zipcodeQueryResult.json',
    dataType: 'json',
    success: function(res){
      var features = res.features;
      for(var i=0; i<features.length; i++){
        if(features[i].attributes['Zip_Code']){
          var z = features[i].attributes['Zip_Code'];
          zipcode.push(z);
        }
      }
      $("#zipcodeInput").autocomplete({
        source: zipcode,
        select: function(event, ui){
          var selected = ui.item.value;
          map.setFilter('powerplants', ['==', 'Zip_Code', selected]);
        }
      });

    },
    error: function(){
      console.log('Error: Failed to load the zipcode data');
    }
  });

  // init the general fuel dropdown
  var fuelTypes = [
    'Battery',
    'Biomass',
    'Coal',
    'Digester Gas',
    'Gas',
    'Geothermal',
    'Hydro',
    'Landfill Gas',
    'MSW',
    'Nuclear',
    'Solar PV',
    'Solar Thermal',
    'Wind' ];
  var generalFuelSelect = document.getElementById('generalFuelSelect');
  for(var i=0; i<fuelTypes.length; i++){
    var opt = document.createElement('option');
    opt.innerHTML = fuelTypes[i];
    opt.setAttribute('value', fuelTypes[i]);
    generalFuelSelect.appendChild(opt);
  }

  $('#generalFuelSelect').change(function(){
    var selected = $("#generalFuelSelect").val();
    if(selected != 'Choose'){
      map.setFilter('powerplants', ['==', 'General_Fuel', selected]);
    } else {
      map.setFilter('powerplants', null);
    }
  });

  // init the operating swtich
  $('#operatingSwitch').change(function(){
    if(this.checked){
      map.setFilter('powerplants', ['==', 'Status', 'Operating']);
    } else {
      map.setFilter('powerplants', null);
    }
  });

  // init the button
  $('#clearSearchBtn').click(function(){
    map.setFilter('powerplants', null);
    $('#countySelect').val('Choose');
    $('#zipcodeInput').val('');
    $('#generalFuelSelect').val('Choose');
    $('#operatingSwitch').prop('checked', false);
  });

}


function init(){
  _initAccordion();
  _initLegend();
  _initSearchTool();
}

init();


// map.flyTo({
//   center: [-122, 38], // starting position [lng, lat]
//   zoom: 5 // starting zoom
// })

//Active Fire layer
// fireJson.features.forEach(function(marker) {
//   if(marker.type == 'Feature' && marker.geometry.type == 'Point'){
//     // create a HTML element for each feature
//     var el = document.createElement('div');
//     el.className = 'marker';
//
//     // make a marker for each feature and add to the map
//     new mapboxgl.Marker(el)
//     .setLngLat(marker.geometry.coordinates)
//     .addTo(map);
//
//     el.addEventListener('mouseover', function(){
//       var box = document.getElementById('box');
//       box.innerHTML = '';
//       box.append(
//         'Name: ' + marker.properties.name + '\n' +
//         'Description: ' + marker.properties.description
//       );
//     });
//
//   }
//
// });

// $('.marker').mouseover(function(){
//   $('#box').html()
// });
