import {Circle, Fill, Stroke, Style, Text} from 'ol/style.js';

const styleBuilder = (type, options = {}) => {
  const blue = [0, 153, 255, 1];
  const transparentWhite = [255, 255, 255, 0.5];

  const pointFillColor = options.fillColor || blue
  const pointStrokeColor = options.strokeColor || transparentWhite
  const pointStrokeWidth = options.strokeWidth || 2

  const lineFillColor = options.fillColor || transparentWhite
  const lineStrokeColor = options.strokeColor || blue
  const lineStrokeWidth = options.strokeWidth || 2

  const polygonFillColor = options.fillColor || transparentWhite
  const polygonStrokeColor = options.strokeColor || blue
  const polygonStrokeWidth = options.strokeWidth || 2

  let style
  if (type === 'Point' || type === 'MultiPoint') {
    style = new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: pointFillColor,
        }),
        stroke: new Stroke({
          color: pointStrokeColor,
          width: pointStrokeWidth,
        }),
      }),
      text: !options.textContent ? undefined : new Text({
        fill: new Fill({
          color: "rgba(255,255,255,0.9)"
        }),
        font: "16px monospace",
        scale: [1, 1],
        text: options.textContent,
        offsetY: -20,
        stroke: new Stroke({ color: "rgba(0,0,0,0.9)", width: 2 })
      }),
      zIndex: Infinity,
    })
  } else if (type === 'LineString' || type === 'MultiLineString') {
    style = [
      new Style({
        stroke: new Stroke({
          color: lineStrokeColor,
          width: lineStrokeWidth,
        }),
        text: !options.textContent ? undefined : new Text({
          fill: new Fill({
            color: "rgba(255,255,255,0.9)"
          }),
          font: "16px monospace",
          overflow: true,
          text: options.textContent,
          offsetY: -30,
          stroke: new Stroke({ color: "rgba(0,0,0,0.9)", width: 2 })
        })
      }),
    ]
  } 
  else if (type === 'Polygon' || type === 'MultiPolygon') {
    style = new Style({
      fill: new Fill({
        color: polygonFillColor,
      }),
      stroke: new Stroke({
        color: polygonStrokeColor,
        width: polygonStrokeWidth,
      }),
      text: !options.textContent ? undefined : new Text({
        fill: new Fill({
          color: "rgba(255,255,255,0.9)"
        }),
        font: "16px monospace",
        overflow: true,
        text: options.textContent,
        offsetY: -30,
        stroke: new Stroke({ color: "rgba(0,0,0,0.9)", width: 2 })
      })
    })
  }

  // styles['Circle'] = styles['Polygon'].concat(
  //   styles['LineString']
  // );
  
  // styles['GeometryCollection'] =
  //     styles['Polygon'].concat(
  //         styles['LineString'],
  //         styles['Point']
  //     );
  // console.log(style instanceof Style)

  return style;
}


export default styleBuilder;
