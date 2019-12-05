import {text_paint, operator_text, operator_label} from './style_oim_common.js';
// Colors
const medium_scale = [
  ['fibre', '#1c9100'],
  ['copper', '#ff8900'],
  ['coaxial', '#136fff'],
  [null,'#7A7A85']
]

const radius_scale = [
  ["exchange", 5],
  ["connection_point", 3],
  ["data_center", 6],
  [null,2]
]

// Predicates
const sites_visible_p = ["any",
  ["==", ["get", "telecom"], "exchange"],
  ["all",
    ["==", ["get","telecom"],"connection_point"],
    [">", ["zoom"], 11]
  ]
]

const sites_label_detail = ["case",
    ['!=', ['get', 'ref:FR:PTT'], ''],
      ["concat",['get', 'ref:FR:PTT'], operator_label],
    ['!=', ['get', 'ref:FR:ARCEP'], ''],
      ["concat", ['get', 'ref:FR:ARCEP'], operator_label],
    ['!=', ['get', 'name'], ''],
      ["concat",["get", "name"], operator_label],
    ["case",
      ["all", ['==', ['get','telecom'], 'exchange'], ['==', ['get','telecom:medium'], 'fibre']],
        "NRO",
      ["all", ['==', ['get','telecom'], 'exchange'], ['==', ['get','telecom:medium'], 'copper']],
	"NRA",
      ['==', ['get','telecom'], 'exchange'],
        "Central",
      ['==', ['get','telecom'], 'connection_point'],
        "SR",
      "Site"
    ]
];

const sites_label_visible_p = ["any",
  ["all", 
    ["==", ["get", "telecom"], "exchange"],
    [">", ["zoom"], 13]
  ],
  [">", ["zoom"], 14]
]

const sites_label = ["step",
  ["zoom"],
  ["get", "name"],
  12, sites_label_detail
];

// Determine the minimum zoom a point is visible at (before it can be seen as an
// area), based on the area of the substation.
const sites_point_visible_p = ["any",
  ["==", ["coalesce", ["get", "area"], 0], 0], // Area = 0 - mapped as node
  ["all",
    ["<", ["coalesce", ["get", "area"], 0], 100],
    ["<", ["zoom"], 16]
  ],
  ["all",
    ["<", ["coalesce", ["get", "area"], 0], 250],
    ["<", ["zoom"], 15]
  ],
  ["<", ["zoom"], 13]
]

// Functions
function medium_color() {
  let medium_fct = ['match', ["get", "telecom:medium"]];
  
  for (let row of medium_scale) {
    if (row[0] == null){
      medium_fct.push(row[1]);
      continue;
    }
    medium_fct.push(row[0]);
    medium_fct.push(row[1]);
  }

  return medium_fct;
}

function telecom_radius (){
  let radius_fct = ["match", ["get", "telecom"]];

  for (let row of radius_scale) {
    if (row[0] == null){
      radius_fct.push(row[1]);
      continue;
    }
    radius_fct.push(row[0]);
    radius_fct.push(row[1]);
  }

  return [
    'interpolate',
    ['linear'],
    ['zoom'],
    5, 1,
    12, radius_fct
  ];
}

const medium_text_paint = Object.assign({'text-color':medium_color()},text_paint);

// Layers
const layers = [
  {
    zorder: 40,
    id: 'telecoms_line',
    type: 'line',
    source: 'openinframap',
    minzoom: 3,
    'source-layer': 'telecoms_communication_line',
    paint: {
      'line-color': '#61637A',
      'line-width': ['interpolate', ['linear'], ['zoom'],
        3, 0.3,
        11, 2
      ],
      'line-dasharray': [3, 2],
    },
  },
  {
    zorder: 140,
    id: 'telecoms_sites',
    type: 'fill',
    source: 'openinframap',
    minzoom: 10,
    'source-layer': 'telecoms_sites',
    paint: {
      'fill-opacity': 0.3,
      'fill-color': medium_color(),
      'fill-outline-color': 'rgba(0, 0, 0, 1)',
    },
  },
  {
    zorder: 141,
    id: 'telecoms_sites_points',
    type: 'circle',
    filter: ["all", sites_visible_p, sites_point_visible_p],
    source: 'openinframap',
    minzoom: 10,
    'source-layer': 'telecoms_sites_points',
    paint: {
      'circle-radius': telecom_radius(),
      'circle-color': medium_color(),
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'],
          5, 0,
          6, 0.1,
          8, 0.5,
          15, 1
      ]
    },
  },
  {
    zorder: 142,
    id: 'telecoms_mast',
    type: 'symbol',
    source: 'openinframap',
    minzoom: 10,
    'source-layer': 'telecoms_mast',
    paint: text_paint,
    layout: {
      'icon-image': 'comms_tower',
      'icon-anchor': 'bottom',
      'icon-size': ['interpolate', ["linear"], ["zoom"],
        10, 0.6,
        14, 1
      ],
      'text-field': operator_text,
      'text-size': {
        "stops": [
          [11, 0],
          [12, 0],
          [12.01, 10]
        ],
      },
      'text-anchor': 'top',
      'text-offset': {
        'stops': [
          [11, [0, 1]],
          [16, [0, 2]]
        ]
      },
      'text-optional': true
    },
  },
  {
    id: 'telecoms_sites_symbol',
    type: 'symbol',
    source: 'openinframap',
    filter: sites_label_visible_p,
    minzoom: 10,
    'source-layer': 'telecoms_sites_points',
    paint: medium_text_paint,
    layout: {
      'text-field': sites_label,
      'text-size': {
        "stops": [
          [11, 0],
          [12, 0],
          [12.01, 10]
        ],
      },
      'text-offset': [0, 1],
      'text-anchor': 'top',
    },
  },
  {
    id: 'telecoms_line_label',
    type: 'symbol',
    source: 'openinframap',
    minzoom: 9,
    'source-layer': 'telecoms_communication_line',
    paint: text_paint,
    layout: {
      'text-field': '{name}',
      'symbol-placement': 'line',
      'symbol-spacing': 400,
      'text-size': 10,
      'text-offset': [0, 1],
      'text-max-angle': 10
    }
  },

];

export default layers;
