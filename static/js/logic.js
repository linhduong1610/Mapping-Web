
function buildUrl() {
  var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  var plateUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';
return [url, plateUrl]
}

function markerSize(mag) {
    return mag * 4;
  }

function setColor(mag) {
    if (mag <= 1) {
        return "#98EE00";
    } else if (mag <= 2) {
        return "#D4EE00";
    } else if (mag <= 3) {
        return "#EECC00";
    } else if (mag <= 4) {
        return "#EE9C00";
    } else if (mag <= 5) {
        return "#EA822C";
    } else {
        return "#EA2C2C";
    };
    }

function createFeatures(earthquake_data, boundaries_data) {

    function styleInfo(feature) {
            return {
                opacity: 1,
                fillOpacity: 1,
                fillColor: setColor(feature.properties.mag),
                color: "#000000",
                radius: markerSize(feature.properties.mag),
                stroke: true,
                weight: 0.5
            };
        }
    function onEachFeature(feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }

  const earthquakes = L.geoJSON(earthquake_data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: onEachFeature
    });

    const boundaries = L.geoJSON(boundaries_data, {
        color: "orange",
        weight: 2
    });
  
    createMap(boundaries, earthquakes);
  }

function createMap(boundaries,earthquakes) {
    const outdoors_map = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });
  
    const street_map = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY   
    });
    
    const dark_map = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY    
    });

    const base_maps = {
        "Dark": dark_map,
        "Outdoors": outdoors_map,
        "Street Map": street_map};

    const overlayMaps = {
      "Earthquakes": earthquakes,
      "Plates": boundaries
    };


     var myMap = L.map("map", {
      center: [
        37.09, -95.71],
      zoom: 3.25,
      layers: [
        street_map,
        boundaries,
        earthquakes]
     }); 


    L.control.layers(base_maps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
    
      const div = L.DomUtil.create('div', 'info legend')
      const magnitudes = [0, 1, 2, 3, 4, 5]
  
      for ( i = 0; i < magnitudes.length; i++) {
          div.innerHTML +=
              '<i style="background:' + setColor(magnitudes[i] + 1) + '"></i>  ' + 
      + magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
      }
  
      return div;
  };

   legend.addTo(myMap);

}


(async function(){
    
    let urlArray = buildUrl();
    plateUrl = urlArray[0];
    url = urlArray[1];
    const p_data = await d3.json(plateUrl);
    const e_data = await d3.json(url);
    createFeatures(p_data.features, e_data.features);

})();


