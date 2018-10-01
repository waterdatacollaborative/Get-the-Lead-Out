mapboxgl.accessToken = 'pk.eyJ1Ijoic2FkaWUtZ2lsbCIsImEiOiJjamtlOXhsdTczOWJiM3dtazU2ODZiZ2dzIn0.20B7rRYqEidFxaHOXuGKkA';
const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/sadie-gill/cjkeaodtodv792sqkkg4yara2', // stylesheet location
  center: [
    -122.473373, 37.767579
  ], // starting position [lng, lat]
  zoom: 11.5 // starting zoom
});

const range = d3.scaleThreshold().domain([1, 5, 15]).range(['#C8D2D3', '#f2d434', '#eb980b', '#eb470b']);

const imagePath = {
  '#C8D2D3': 'img/school-blue.svg',
  '#f2d434': 'img/school-yellow.svg',
  '#eb980b': 'img/school-orange.svg',
  '#eb470b': 'img/school-red.svg'
};

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
      'circle-radius': [
        'case',
        [
          'boolean',
          [
            'feature-state', 'hover'
          ],
          false
        ],
        9,
        5
      ],
      'circle-stroke-color': 'rgba(47, 47, 47, 0.65)',
      'circle-stroke-width': [
        'case',
        [
          'boolean',
          [
            'feature-state', 'hover'
          ],
          false
        ],
        15,
        2
      ],
      'circle-color': [
        'step',
        [
          'get', 'ppb'
        ],
        '#C8D2D3',
        1,
        '#f2d434',
        5,
        '#eb980b',
        15,
        '#eb470b'
      ]
    }
  })

  map.addLayer({
    'id': 'schoolLayerHover',
    'type': 'circle',
    'source': 'schoolsHover',
    'source-layer': 'schools',
    'paint': {
      'circle-radius': 5,
      'circle-color': 'rgba(68, 91, 244, 0)'
    }
  })

  const updateDashboard = (id) => {
    const dash = document.getElementById('dashboard');
    const ppb = document.getElementById(id).value;
    const color = range(ppb);
    const selection = document.getElementById(id);
    selection.selected = true;
    dash.innerHTML = `
    <img class='w120' src='${imagePath[color]}' alt='school icon' />
    <div><span style='color:${color};' class='txt-h2'>${ppb == 0
      ? '< 1'
      : ppb}</span><span style='color:${color};'> ppb</span></div>
    <div><span class='txt-h4'>${selection.text}</span></div>`
  }

  let hoveredId = null;

  const updateMap = (id) => {
    if (hoveredId) {
      // set the hover attribute to false with feature state
      map.setFeatureState({
        source: 'schools',
        sourceLayer: 'schools',
        id: hoveredId
      }, {hover: false});
    }

    hoveredId = id;
    // set the hover attribute to true with feature state
    map.setFeatureState({
      source: 'schools',
      sourceLayer: 'schools',
      id: id
    }, {hover: true});
  }

  const setAfterLoad = (e) => {
    if (e.sourceId === 'schools' && e.isSourceLoaded) {
      const features = map.queryRenderedFeatures({layers: ['schoolLayer']});
      const divSelect = document.createElement('div');
      const arrow = document.createElement('div');
      const select = document.createElement('select');
      arrow.className = 'select-arrow color-gray-dark'
      divSelect.className = 'select-container mt6';
      select.className = 'select select--s select--white color-gray-dark';
      select.id = 'SchoolList';
      const sortAlpha = (data) => {
        return data.sort((x, y) => {
          return d3.ascending(x.properties.school_name, y.properties.school_name);
        });
      }
      sortAlpha(features);
      select.innerHTML = `
        <option disabled selected value>Select A school</option>
        ${features.map((f) => {
        return `<option id='${f.id}' value='${f.properties.ppb}'>
          ${f.properties.school_name}
          </option>`}).join(' ')}`;
        divSelect.append(select);
        divSelect.append(arrow)
        document.getElementById('key').append(divSelect);
        document.getElementById('SchoolList').addEventListener('change', (e) => {
          const id = document.getElementById('SchoolList').options[document.getElementById('SchoolList').selectedIndex].id
          updateDashboard(id);
          updateMap(id)
        })
        map.off('sourcedata', setAfterLoad);
      }}

    if (map.isSourceLoaded('schools')) {
      setAfterLoad()
    } else {
      map.on('sourcedata', setAfterLoad);
    }

    map.on('mouseenter', 'schoolLayerHover', function(e) {
      map.getCanvas().style.cursor = 'pointer';
      if (e.features.length > 0) {
        if (hoveredId) {
          // set the hover attribute to false with feature state
          map.setFeatureState({
            source: 'schools',
            sourceLayer: 'schools',
            id: hoveredId
          }, {hover: false});
        }

        hoveredId = e.features[0].id;
        // set the hover attribute to true with feature state
        map.setFeatureState({
          source: 'schools',
          sourceLayer: 'schools',
          id: hoveredId
        }, {hover: true});

        updateDashboard(hoveredId);
      }
    });
    //
    // map.on('mouseleave', 'schoolLayerHover', function() {
    //   map.getCanvas().style.cursor = '';
    //   map.setFeatureState({
    //     source: 'schools',
    //     sourceLayer: 'schools',
    //     id: hoveredId
    //   }, {hover: false});
    //   hoveredId = null;
    // });
  })
