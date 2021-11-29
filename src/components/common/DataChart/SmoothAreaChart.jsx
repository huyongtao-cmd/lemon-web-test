import React, { PureComponent } from 'react';
import { Chart, Tooltip as BizTooltip, Geom, Coord, Legend, Axis, Guide, Label } from 'bizcharts';
import DataSet from '@antv/data-set';
import PropTypes from 'prop-types';

/**
 * 曲线面积图
 */
class SmoothAreaChart extends PureComponent {
  componentDidMount() {}

  render() {
    const { height, data, keyField, valueField, dimensionField, transposeFlag } = this.props;
    const dimensionJson = {};
    const transposeJson = {};
    if (dimensionField) {
      dimensionJson.color = dimensionField;
    }
    if (transposeFlag) {
      transposeJson.transpose = true;
    }

    return (
      <Chart height={height} data={data} padding={[30, 10, 80, 80]} forceFit>
        <Coord type="rect" />
        <Axis name={keyField} />
        <Axis name={valueField} />
        {/* 注意 color 的字段类型 必须为字符串,否则不生效 */}
        <Geom
          type="area"
          position={`${keyField}*${valueField}`}
          shape="smooth"
          color={dimensionField}
        />
        <Geom
          type="line"
          position={`${keyField}*${valueField}`}
          size={1}
          shape="smooth"
          color={dimensionField}
        />

        <Legend />
        <BizTooltip />
      </Chart>
    );
  }
}

SmoothAreaChart.defaultProps = {
  data: [],
  dimensionField: undefined,
  transposeFlag: false,
};

SmoothAreaChart.propTypes = {
  data: PropTypes.array,
  keyField: PropTypes.string.isRequired,
  valueField: PropTypes.string.isRequired,
  dimensionField: PropTypes.string,
  transposeFlag: PropTypes.bool,
};

export default SmoothAreaChart;
