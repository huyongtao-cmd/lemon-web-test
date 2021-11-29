import React, { PureComponent } from 'react';
import { Chart, Tooltip as BizTooltip, Geom, Coord, Legend, Axis, Guide, Label } from 'bizcharts';
import DataSet from '@antv/data-set';
import PropTypes from 'prop-types';
import numeral from 'numeral';

const { AMapUI } = window;
const constructGeoJSON = features => {
  if (!features) return false;
  if (Array.isArray(features)) {
    return {
      type: 'FeatureCollection',
      features: [...features],
    };
  }
  return features;
};

const getGeojsonByCode = (adcode = 100000, withSub = true) => {
  if (!AMapUI) {
    return Promise.reject();
  }
  // 文档：https://lbs.amap.com/api/javascript-api/reference-amap-ui/geo/district-explorer
  return new Promise((resolve, reject) => {
    AMapUI.load('ui/geo/DistrictExplorer', DistrictExplorer => {
      const districtExplorer = new DistrictExplorer();
      districtExplorer.loadAreaNode(adcode, (error, areaNode) => {
        if (error) {
          reject();
        }
        let res = null;
        if (withSub) {
          res = areaNode.getSubFeatures();
        } else {
          res = areaNode.getParentFeature();
        }
        resolve(constructGeoJSON(res));
      });
    });
  });
};

/**
 * 地图
 */
class MapChart extends PureComponent {
  state = {};

  componentDidMount() {
    getGeojsonByCode(100000, true).then(res => {
      this.setState({ chinaGeo: res });
    });
  }

  processGeoData = (geoData, dataValue) => {
    const { keyField, valueField } = this.props;
    const { features } = geoData;
    features.forEach(one => {
      const name = one && one.properties && one.properties.name;
      dataValue.forEach(item => {
        if (name.includes(item[keyField])) {
          // eslint-disable-next-line no-param-reassign
          one.value = item[valueField];
        }
      });
    });

    const geoDv = new DataSet.View().source(geoData, { type: 'GeoJSON' });
    return geoDv;
  };

  render() {
    const { height, data, keyField, valueField } = this.props;

    // 地图组件处理
    const { chinaGeo } = this.state;
    if (!chinaGeo) {
      return '数据加载中...';
    }
    const mapData = this.processGeoData(chinaGeo, data);

    const mapScale = {
      latitude: {
        sync: true,
        nice: false,
      },
      longitude: {
        sync: true,
        nice: false,
      },
      [valueField]: {
        formatter: val => numeral(val || 0),
      },
    };

    return (
      <Chart
        height={height}
        width={645}
        scale={mapScale}
        data={mapData}
        padding={[10, 0, 0, 50]}
        onGetG2Instance={g2Chart => {}}
        onPolygonClick={ev => {
          const point = {
            x: ev.x,
            y: ev.y,
          };
          console.log('数据.........');
          // eslint-disable-next-line no-underscore-dangle
          console.log(ev.data._origin.name);
        }}
      >
        <Geom
          type="polygon"
          position="longitude*latitude"
          style={{ lineWidth: 1, stroke: '#505050' }}
          // color={['value', ['#31c5f8', '#61d3f8', '#89dcfd', '#b0e8f8', '#d8f3ff']]}
          color={['value', ['#d9f4ff', '#33c5f6']]}
          tooltip={[
            `name*value`,
            (name, value) => ({
              name,
              value,
            }),
          ]}
        >
          <Legend position="bottom-left" offsetY={-130} offsetX={0} slidable={false} width={320} />
        </Geom>
        <BizTooltip showTitle={false} />
      </Chart>
    );
  }
}

MapChart.defaultProps = {
  data: [],
};

MapChart.propTypes = {
  data: PropTypes.array,
  keyField: PropTypes.string.isRequired,
  valueField: PropTypes.string.isRequired,
};

export default MapChart;
