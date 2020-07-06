var quakesUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
var faultUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

function createMap(data, faultData)
{

    var quakes = createEarthquakes(data);
    var faults = createFaults(faultData);

    var darkview = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", 
    {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/dark-v10",
        accessToken: API_KEY
    });

    var satelliteview = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", 
    {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    var base = { Dark: darkview, Satellite: satelliteview };

    var lGroup = { Earthquakes: quakes, FaultLines: faults };
    
    var myMap = L.map("map", {
        center: [0,0],
        zoom: 2,
        layers: [darkview, quakes, faults]
    });

    createLegend().addTo(myMap);

    L.control.layers(base, lGroup).addTo(myMap);
}

function createLegend()
{
    var legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function(map) 
    {
        var div = L.DomUtil.create('div', 'info legend');
        var grades = [0, 1, 2, 3, 4, 5];
        var labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

        for (var i = 0; i < grades.length; i++) 
        {
            div.innerHTML += '<i style="background:' + pickColor(grades[i]) + '"></i> ' +
                labels[i]+ '<br>';
        }

      return div;
    };   
    return legend;
}

function createFaults(data)
{
    function makeFaults(feature, layer)
    {
        return L.polyline(feature.geometry.coordinates);
    }

    var faults = L.geoJSON(data, {
        onEachFeature: makeFaults,
        style: 
            {
                weight: 1,
                color: 'white'
            }
    });

    return faults;
}

function createEarthquakes(data) 
{
    function popups(feature, layer) 
    {
      layer.bindPopup("<h3>Magnitude:" + feature.properties.mag +
        "<br>Location: " + feature.properties.place + "</h3><hr><p>" +
         new Date(feature.properties.time) + "</p>");
    }

    function makeCircles(feature, layer)
    {
        return L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 
            {
                fillOpacity: 1,
                color: pickColor(feature.properties.mag),
                fillColor: pickColor(feature.properties.mag),
                radius:  findRadius(feature)
            });
    }
  
    var earthquakes = L.geoJSON(data, {
        onEachFeature: popups,
        pointToLayer: makeCircles
      });
  
    return earthquakes;
}

function findRadius(feature)
{
    return feature.properties.mag * 4;
}

function pickColor(mag)
{
    var color = 'black';
    if(mag < 1.0)
    {
        color = '#79ff00';
    }
    else if (mag < 2)
    {
        color = '#aaff00';
    }
    else if(mag < 3)
    {
        color = '#ddff00';
    }
    else if(mag < 4)
    {
        color = '#ffa800';
    }
    else if(mag < 5)
    {
        color = '#ff7700';
    }
    else
    {
        color = '#f94b00';
    }

    return color;
} 

function doStuff()
{
    d3.json(quakesUrl, function(data)
    {
        d3.json(faultUrl, function(faultData)
        {
            createMap(data.features, faultData.features);
        });
    });
}

doStuff()