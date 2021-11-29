import React, { PureComponent } from 'react';
import { Chart, Tooltip as BizTooltip, Geom, Coord, Legend, Axis, Guide, Label } from 'bizcharts';
import DataSet from '@antv/data-set';
import PropTypes from 'prop-types';

class LineChart extends PureComponent {
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
      <Chart height={height} data={data} padding={[10, 10, 30, 80]} forceFit>
        {/*
          坐标系:
            type:
              rect: 默认值,直角坐标系
              polar: 极坐标系，由角度和半径 2 个维度构成。
          */}
        <Coord type="rect" {...transposeJson} />

        {/*
          坐标轴的配置,不使用Axis组件则默认不显示所有坐标轴及相关的信息
          */}
        <Axis name={keyField} />
        <Axis name={valueField} />

        {/*
           几何标记和图表类型
            type:类型
              area:区域图
              areaStack:层叠区域图
            position:
            shape:将数据值映射到图形的形状上的方法
              smooth:曲线
              area:
              line: 直线
              dotLine: 点直线
          */}
        <Geom
          type="line"
          position={`${keyField}*${valueField}`}
          size={1}
          shape="line"
          {...dimensionField}
        />

        {/*
          图例:
          */}
        <Legend />

        {/*
          提示信息组件
          */}
        <BizTooltip
          crosshairs={{
            type: 'line',
          }}
        />
      </Chart>
    );
  }
}

LineChart.defaultProps = {
  data: [],
  dimensionField: undefined,
  transposeFlag: false,
};

LineChart.propTypes = {
  data: PropTypes.array,
  keyField: PropTypes.string.isRequired,
  valueField: PropTypes.string.isRequired,
  dimensionField: PropTypes.string,
  transposeFlag: PropTypes.bool,
};

export default LineChart;
