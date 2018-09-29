// let hashmap = {};
//  schools.forEach((row) => {
//    const id = `${row.school_district}${row.id.toString()}`
//    if (hashmap.hasOwnProperty(id)) {
//      hashmap[id].push(row)
//    } else {
//      hashmap[id] = [];
//      hashmap[id].push(row);
//    }
//  });

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FkaWUtZ2lsbCIsImEiOiJjamtlOXhsdTczOWJiM3dtazU2ODZiZ2dzIn0.20B7rRYqEidFxaHOXuGKkA';
const map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/sadie-gill/cjkeaodtodv792sqkkg4yara2?fresh=true', // stylesheet location
    center: [-122.473373, 37.767579], // starting position [lng, lat]
    zoom: 11.5 // starting zoom
});

map.on('load', () => {

  map.addSource('schools', {
    type: 'vector',
    url: 'mapbox://sadie-gill.076g5x2v'
  });

  map.addSource('schoolsHover', {
    type: 'vector',
    url: 'mapbox://sadie-gill.076g5x2v'
  });


  map.addLayer({
    'id': 'schoolLayer',
    'type': 'circle',
    'source': 'schools',
    'source-layer': 'schools',
    'paint': {
      'circle-radius': 5,
      'circle-color': [
        'step',
        ['get', 'ppb'],
        '#C8D2D3',
        1, '#f2d434',
        5, '#eb980b',
        15, '#eb470b',
      ]
    }
  }, 'waterway-label')


  map.addLayer({
    'id': 'schoolLayerHover',
    'type': 'circle',
    'source': 'schoolsHover',
    'source-layer': 'schools',
    'paint': {
      'circle-radius': 5,
      'circle-color': 'rgba(68, 91, 244, 0)'
    }
  }, 'waterway-label')


let hoveredId = null;

map.on('mouseenter', 'schoolLayerHover', function(e) {
     // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';
    if (document.getElementById('key').classList.contains('opacity0')) {
      document.getElementById('key').classList.remove('opacity0');
      document.getElementById('key').classList.add('opacity100');
    }

    if (e.features[0].properties.id === hoveredId) return;
    hoveredId = e.features[0].properties.id;
    map.setFilter('schoolLayerHover', ['==', 'id', hoveredId]);
    map.setLayoutProperty('schoolLayerHover', 'icon-size', .25)
    const schoolList = hashmap[`SFUSD${e.features[0].properties.id}`];
    console.log(schoolList);
    // {
    //   "fw_id": 931,
    //   "school_district": "SFUSD",
    //   "school_name": "Yick Wo ES",
    //   "sample_point_name": "Yick Wo ES - Site E",
    //   "sample_date": "NA",
    //   "Pb (µg/L)": "NA",
    //   "result": "NA",
    //   "investigative_sample_number": "NA",
    //   "comments": "Site not indicated by school",
    //   "geo_school_name": "Yick Wo Elementary School",
    //   "address": "2245 JONES ST, SAN FRANCISCO, CA 94133",
    //   "lat": 37.80196,
    //   "lon": -122.4166107,
    //   "id": 131,
    //   "lead_present": "FALSE"
    // }
    const content = `
      <h5>${schoolList[0].geo_school_name}</h5>
      <table class='table table--fixed table--dark bg-darken50'>
        <thead>
          <tr>
            <th>Site</th>
            <th>Sample Date</th>
            <th>Pb (µg/L)</th>
          </tr>
        </thead>
        <tbody>
      ${schoolList.map(school  =>
        `<tr>
          <td>${school.sample_point_name}</td>
          <td>${school.sample_date}</td>
          <td>${school['Pb (µg/L)']}</td>
        </tr>`
    ).join('')}
    </tbody>
  </table>`
    console.log(content);
    document.getElementById('key').innerHTML = content;
 });

 map.on('mouseleave', 'schoolLayer', function() {
    hoveredId = null;
    map.getCanvas().style.cursor = '';
    map.setFilter('schoolLayerHover', ['==', 'id', '']);
    map.setLayoutProperty('schoolLayerHover', 'icon-size', .1)
 });
})
