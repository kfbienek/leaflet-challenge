var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
options.timeZone = 'UTC';

//Feature array function
function addPopup(feature, layer) {
    // Give each feature a popup describing the place and time of the earthquake
    return layer.bindPopup(`<h3> ${feature.properties.place} </h3> <hr> <p> ${Date(feature.properties.time)} </p>`);
}

//layer markers
function createMap(earthquakes, data) {

    //Tile layer varriables
    var attribution =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    var titleUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var OpenStreetTiles = L.tileLayer(titleUrl, { attribution });

    var baseMaps = {
        "OpenStreet": OpenStreetTiles
    };

    // Circle for each earthquake
    var earthquakeCircles = [];
    data.forEach(function (element) {

        // Earthquake depth colors
        var color = "";
        if (element.depth < 10) {
            color = "#80ff00";
        }
        else if (element.depth < 30) {
            color = "#bfff00";
        }
        else if (element.depth < 50) {
            color = "#ffff00";
        }
        else if (element.depth < 70) {
            color = "#ffbf00";
        }
        else if (element.depth < 90) {
            color = "#ff8000";
        }
        else {
            color = "#ff4000";
        }

        circles = L.circle([element.lon, element.lat], {
            fillOpacity: .8,
            color: "black",
            weight: 1,
            fillColor: color,
            radius: element.mag * 20000
        }).bindPopup(`<h6 style="font-weight: bold;">${element.title}</h6> <hr> 
            <p>Date: ${element.time} (UTC)</p> 
            <p>Magnitude: ${element.mag} ml</p>
            <p>Depth: ${element.depth} km</p>
            <a href="${element.url}" target="_blank">More details...</a>`);
        earthquakeCircles.push(circles);
    });

    // layer group for state markers
    var earthquakeLayer = L.layerGroup(earthquakeCircles);	
    var overlayMaps = {
        "Earthquakes": earthquakeLayer
    };

    // Create map
    var myMap = L.map("map", {
        center: [39, -99],
        zoom: 5,
        fullscreenControl: true,
        layers: [OpenStreetTiles, earthquakeLayer]

    });

    //legend
    var myColors = ["#80ff00", "#bfff00", "#ffff00", "#ffbf00", "#ff8000", "#ff4000"];
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend');
        labels = ["<div style='background-color: lightgray'><strong>&nbsp&nbspDepth (km)&nbsp&nbsp</strong></div>"];
        categories = ['-10-10', ' 10-30', ' 30-50', ' 50-70', ' 70-90', '+90'];
        for (var i = 0; i < categories.length; i++) {
            div.innerHTML +=
                labels.push(
                    '<li class="circle" style="background-color:' + myColors[i] + '">' + categories[i] + '</li> '
                );
        }
        div.innerHTML = '<ul style="list-style-type:none; text-align: center">' + labels.join('') + '</ul>'
        return div;
    };
    legend.addTo(myMap);

    //scale
    L.control.scale()
        .addTo(myMap);

    //layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);
};
//define url
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url).then((data) => {

    // data variable
    var EarthquakesData = data;
    console.log(EarthquakesData);
    console.log(Object.keys(EarthquakesData));

    // earthquake data
    var dataDate = new Date(EarthquakesData.metadata.generated);
    console.log(`Data retrieved at: ${dataDate}`);
    console.log(`Number of records: ${EarthquakesData.metadata.count}`);
    console.log(EarthquakesData.features[0].properties.mag);
    console.log(new Date(EarthquakesData.features[0].properties.time));
    console.log(EarthquakesData.features[0].geometry.coordinates[0]);
    console.log(EarthquakesData.features[0].geometry.coordinates[1]);
    console.log(EarthquakesData.features[0].geometry.coordinates[2]);

    // object list with columns
    var cleanData = [];
    for (var i = 0; i < EarthquakesData.features.length; i++) {
        var time = new Date(EarthquakesData.features[i].properties.time);
        cleanData.push({
            "time": time.toLocaleTimeString("en-US", options),
            "title": EarthquakesData.features[i].properties.title,
            "url": EarthquakesData.features[i].properties.url,
            "lat": EarthquakesData.features[i].geometry.coordinates[0],
            "lon": EarthquakesData.features[i].geometry.coordinates[1],
            "mag": EarthquakesData.features[i].properties.mag,
            "depth": EarthquakesData.features[i].geometry.coordinates[2]
        });
    };
    console.log(cleanData);

    var earthquakes = L.geoJSON(data.features, {
        onEachFeature: addPopup
    });

    //load map
    createMap(earthquakes, cleanData);

});
