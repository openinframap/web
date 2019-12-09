import {text_paint, operator_text, underground_p} from './style_oim_common.js';

// Colors
const usage_scale = [
  ['transmission', '#284893'],
  ['headrace', '#347bcf'],
  ['penstock', '#82bcfc'],
  ['tailrace', '#5a7d9d'],
  [null,'#7A7A85']
]

// Predicates
const structure_color = ["case",
  ["==", ["get","tunnel"],"flooded"], "#BBBBBB",
  ["==", ["get","man_made"],"pipeline"], "#646464",
  "#AAAAAA"
]

const usage_visible_p = ["all",
  ["any",
    ["all",
      ["==", ['get', 'usage'], "transmission"],
      [">", ['zoom'], 8]
    ],
    [">", ['zoom'], 11]
  ],
  ["has","usage"],
  ["!=", ["get","usage"], null]
];
let structure_visible_p = Object.assign([], usage_visible_p);
structure_visible_p.push(["any",["==", ["get","tunnel"],"flooded"], ["==", ["get","man_made"],"pipeline"]]);

// Functions
function usage_color() {
  let usage_fct = ['match', ["get", "usage"]];
  
  for (let row of usage_scale) {
    if (row[0] == null){
      usage_fct.push(row[1]);
      continue;
    }
    usage_fct.push(row[0]);
    usage_fct.push(row[1]);
  }

  return usage_fct;
}

// Layers
const layers = [
  {
    zorder: 20,
    id: 'water_pipeline_case',
    type: 'line',
    source: 'openinframap',
    minzoom: 7,
    'source-layer': 'water_ways',
    filter: structure_visible_p,
    paint: {
      'line-color': structure_color,
      'line-width': ['interpolate', ['linear'], ['zoom'],
        8, 1.5,
        13, 5.5
      ],
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
  },
  {
    zorder: 21,
    id: 'water_pipeline',
    type: 'line',
    source: 'openinframap',
    minzoom: 3,
    'source-layer': 'water_ways',
    filter: usage_visible_p,
    paint: {
      'line-color': usage_color(),
      'line-width': ['interpolate', ['linear'], ['zoom'],
        3, 0.3,
        13, 2
      ],
    },
  },
  {
    zorder: 520,
    id: 'water_pipeline_label',
    type: 'symbol',
    source: 'openinframap',
    'source-layer': 'water_ways',
    minzoom: 11,
    filter: usage_visible_p,
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
