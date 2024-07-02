import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer, Heatmap as HeatmapLayer} from 'ol/layer.js';
import { fromLonLat } from 'ol/proj'
import Point from 'ol/geom/Point.js'
import Feature from "ol/Feature"

// import styleBuilder from './style-builder';

class FastHeatmap {
  #layer
  #source
  #module = 'heatmap'

  constructor(_this) {
    this.map = _this.map
    this.#source = new VectorSource();
    this.#layer = new HeatmapLayer({
      source: this.#source,
      radius: 8,
      blur: 15,
      properties: {
        name: 'default-heatmap'
      }
    });
    this.map.addLayer(this.#layer);
  }

  addPoints(data) {
    const features = data.map(item => {
      return new Feature({
        geometry: new Point(fromLonLat([item.longitude, item.latitude], 'EPSG:4326')),
        weight: 1,
      })
    })
    this.#source.addFeatures(features)
  }

  /**
   * 添加图层
   * - 未指定时，添加默认图层
   * @param {string | undefined} name 
   */
  addLayer(name) {
    name = name || 'default'
    this.map.getLayers().getArray().some(layer => layer.get('name') === name && layer.get('module') === this.#module)
    if (this.map.getLayers().getArray().some(layer => layer.get('name') === name)) {
      throw new Error(`layer ${name} already exists`)
    }
    const source = new VectorSource({wrapX: false});
    const layer = new VectorLayer({
      source,
      properties: { name, module: this.#module }
    });
    this.map.addLayer(layer);
    this.#layer = layer
    this.#source = source
  }

  /**
   * 删除图层
   * - 未指定时，删除默认图层
   * @param {string | undefined} name 
   */
  removeLayer(name) {
    name = name || 'default'
    const layer = this.map.getLayers().getArray().find(layer => layer.get('name') === name && layer.get('module') === this.#module)
    if (!layer) {
      throw new Error(`layer ${name} not exists`)
    }
    this.map.removeLayer(layer)
  }

  /**
   * 设置当前图层
   * @param {string | undefined} name 
   */
  setCurrentLayer(name) {
    name = name || 'default'
    const layer = this.map.getLayers().getArray().find(layer => layer.get('name') === name && layer.get('module') === this.#module)
    if (!layer) {
      throw new Error(`layer ${name} not found`)
    }
    this.#layer = layer
    this.#source = layer.getSource()
  }

  /**
   * 设置图层可见
   * @param {boolean} visible 
   * @param {*} name 
   */
  setLayerVisible(visible, name) {
    if (!name) {
      name = this.#layer.get('name')
    }
    const layer = this.map.getLayers().getArray().find(layer => layer.get('name') === name && layer.get('module') === this.#module)
    if (!layer) {
      throw new Error(`layer ${name} not found`)
    }
    layer.setVisible(visible)
  }
}

export default FastHeatmap;
