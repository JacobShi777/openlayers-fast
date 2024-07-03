import Draw from 'ol/interaction/Draw.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import { createBox } from 'ol/interaction/Draw'

import styleBuilder from '../utils/style-builder';

class FastDraw {
  #draw
  #layer
  #source
  // layerList = []
  // 点击事件的回调函数
  clickCallback = {
    callback: null,
    enable: true, // 是否允许触发点击事件; 当绘制开始时，不允许触发点击事件
    // 在绘制的时候也会触发点击事件，所以需要一个标志位来判断是否是绘制结束
    // 绘制结束时触发点击事件，不需要执行回调函数；但要将enable设置为true，以便下次点击事件能够触发回调函数
    // 主要还是因为click事件是在drawend事件之后触发的，有没有draw相关的事件，是在click之后触发的？
    drawend: false
  }

  constructor(_this) {
    this.map = _this.map
    this.#source = new VectorSource({wrapX: false});
    this.#layer = new VectorLayer({
      source: this.#source,
      properties: {
        name: 'default-draw'
      }
    });
    this.map.addLayer(this.#layer);

    // 设置点击事件
    this.map.on('click', (e) => {
      if (!this.clickCallback.enable || !this.clickCallback.callback) {
        if (this.clickCallback.drawend) {
          this.clickCallback.enable = true
          this.clickCallback.drawend = false
        }
        return
      } 
      this.map.forEachFeatureAtPixel(e.pixel, (feature) => {
        this.highlightFeature(feature.getId())
        this.clickCallback.callback({
          id: feature.getId(),
          type: feature.get('type'),
          properties: feature.getProperties()
        })
      });
    });
  }

  setClickCallback(callback) {
    this.clickCallback = {
      callback,
      enable: true,
      drawend: false
    }
  }

  drawPoint(options, callback) {
    this.#addInteraction(this.#source, 'Point', options, callback);
    console.warn('drawPoint is deprecated, use drawFeature instead')
    
  }
  drawPolygon(options, callback) {
    this.#addInteraction(this.#source, 'Polygon', options, callback);
    console.warn('drawPolygon is deprecated, use drawFeature instead')
  }

  drawFeature(type, options, callback) {
    this.#addInteraction(this.#source, type, options, callback);
  }

  #addInteraction(source, value, options = {}, callback) {
    this.#draw && this.map.removeInteraction(this.#draw);
    this.clickCallback.enable = false
    this.clickCallback.drawend = false

    if (value !== 'None') {
      if (value === 'Rectangle') {
        this.#draw = new Draw({
            source: source,
            type: 'Circle',
            geometryFunction: createBox()
        });
      } else {
        this.#draw = new Draw({
          source,
          type: value,
        });
      }
      this.map.addInteraction(this.#draw);
      
      const _this = this
      this.#draw.on('drawend',  (e) => {
        e.feature.setId(new Date().getTime())
        e.feature.setProperties({ 
          type: value,
          textContent: options.textContent,
          highlighted: false,
          properties: options.properties
        })
        e.feature.setStyle(styleBuilder(value, {
          ..._this.#layer.get('styleOptions'),
          textContent: options.textContent 
        }))

        if (!options.continuousDrawing) {
          _this.map.removeInteraction(_this.#draw)
          _this.clickCallback.drawend = true
        }
        callback && callback({
          id: e.feature.getId(),
          type: value,
          coordinates: e.feature.getGeometry().getCoordinates(),
          properties: e.feature.getProperties()
        })
      });
    }
  }

  stopDrawing() {
    this.map.removeInteraction(this.#draw)
    this.clickCallback.enable = true
  }

  // 获取所有绘制的要素
  getFeatures() {
    return this.#source.getFeatures()
  }

  // 根据id删除指定要素
  removeFeatureById(id) {
    const feature = this.#source.getFeatureById(id)
    this.#source.removeFeature(feature)
  }

  // 删除所有要素
  removeFeatures() {
    this.#source.clear()
  }

  // 设置要素样式
  setFeatureStyle(id, style) {
    const feature = this.#source.getFeatureById(id)
    feature.setStyle(style)
  }

  // 高亮要素
  highlightFeature(id) {
    const feature = this.#source.getFeatureById(id)
    const highlighted = feature.get('highlighted')
    if (highlighted) {
      feature.setStyle(
        styleBuilder(feature.get('type'), { textContent: feature.get('textContent') })
      )
      feature.set('highlighted', false)
      return
    }
    const type = feature.get('type')
    let options
    if (type === 'Point' || type === 'MultiPoint') {
      options = {
        fillColor: 'yellow',
        strokeColor: 'red',
        strokeWidth: 2
      }
    } else {
      options = {
        fillColor: 'rgba(255, 0, 0, 0.1)',
        strokeColor: 'red',
        strokeWidth: 2
      }
    }
    feature.setStyle(
      styleBuilder(feature.get('type'), { textContent: feature.get('textContent'), ...options })
    )
    feature.set('highlighted', true)
  }

  // 获取要素坐标
  getFeatureCoordinates(id) {
    const feature = this.#source.getFeatureById(id)
    return feature.getGeometry().getCoordinates()
  }
  // 获取全部要素坐标
  getFeaturesCoordinates() {
    return this.#source.getFeatures().map(feature => feature.getGeometry().getCoordinates())
  }

  // 添加图层
  addLayer(name) {
    const source = new VectorSource({wrapX: false});
    const layer = new VectorLayer({
      source,
      properties: { name }
    });
    this.map.addLayer(layer);
    this.#layer = layer
    this.#source = source
  }

  // 删除图层
  removeLayer(name) {
    // 默认图层不能删除
    if (name.startsWith('default')) {
      throw new Error('default layer cannot be deleted')
    }
    const layer = this.map.getLayers().getArray().find(layer => layer.get('name') === name)
    if (!layer) {
      throw new Error(`layer ${name} not found`)
    }
    this.map.removeLayer(layer)
    // 设置默认图层
    this.setCurrentLayer('default-draw')
  }

  // 设置图层可见
  setLayerVisible(visible, name) {
    // 如果 name 为空，则设置当前图层
    if (!name) {
      name = this.#layer.get('name')
    }
    const layer = this.map.getLayers().getArray().find(layer => layer.get('name') === name)
    if (!layer) {
      throw new Error(`layer ${name} not found`)
    }
    layer.setVisible(visible)
  }

  // 设置图层样式
  setLayerStyle(options) {
    this.#source.getFeatures().forEach(feature => {
      feature.setStyle(styleBuilder(feature.get('type'), {
        textContent: feature.get('textContent'),
        ...options
      }))
    })
    this.#layer.set('styleOptions', options)
  }

  // 设置当前图层
  setCurrentLayer(name) {
    if (!name) {
      name = 'default-draw'
    }
    const layer = this.map.getLayers().getArray().find(layer => layer.get('name') === name)
    if (!layer) {
      throw new Error(`layer ${name} not found`)
    }
    this.#layer = layer
    this.#source = layer.getSource()
  }

  test() {
    this.map.getLayers().forEach((layer) => {
      console.log(layer.get('name'))
    })
  }

}

export default FastDraw;
