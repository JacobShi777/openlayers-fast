// main.js
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { defaults } from "ol/interaction";

import FastDraw from './fast/draw.js';
import FastHeatmap from './fast/heatmap.js';

class OlFast {
  map;
  draw;
  heatmap;

  constructor(options) {
    this._init(options)
    this.draw = new FastDraw(this)
    this.heatmap = new FastHeatmap(this)
  }

  _init(options) {
    // 判断是否有options，并且target是否是string
    if (!(options && typeof options.target === 'string')) {
      throw new Error('options.target is required and must be a string')
    }

    const _options = {
      layers: [
        new TileLayer({
          source: new OSM(),
          properties: {
            name: 'default'
          }
        }),
      ],
      view: new View({
        center: [113.267252, 23.137949],
        zoom: 1,
        projection: 'EPSG:4326',
      }),
      interactions: defaults({
        doubleClickZoom:false,   //屏蔽双击放大事件
      }),
      ...options
    }

    this.map = new Map(_options)

    // const dblClickInteraction = this.map
    //     .getInteractions()
    //     .getArray()
    //     .find(interaction => {
    //       console.log(interaction)
    //       return interaction instanceof ol.interaction.DoubleClickZoom;
    //     });
    // this.map.removeInteraction(dblClickInteraction);
  }
}

export default OlFast;
