import React, { PureComponent } from 'react';
import { Row, Col, Card, Tooltip, Icon, Tabs } from 'antd';
import { Chart, Tooltip as BizTooltip, Geom, Coord, Legend, Axis, Guide, Label } from 'bizcharts';
import DataSet from '@antv/data-set';
import PropTypes from 'prop-types';
import DataTable from '../DataTable';

const { Html, Arc } = Guide;

class ChartCard extends PureComponent {
  componentDidMount() {}

  render() {
    const { icon, title, data, keyField = 'key', valueField = 'value', type } = this.props;
    const { DataView } = DataSet;
    // transform 相关文档 https://g2.antv.vision/zh/docs/api/transform
    const dv = new DataView().source(data);
    dv.transform({
      type: 'rename',
      map: {
        [keyField]: 'key', // row.xxx 会被替换成 row.yyy
      },
    });
    dv.transform({
      type: 'rename',
      map: {
        [valueField]: 'value', // row.xxx 会被替换成 row.yyy
      },
    });

    return (
      <Card
        title={
          <span>
            <Icon type={icon} /> &nbsp;
            {title}
          </span>
        }
      >
        {/*
           图表组件
            scale:度量,数据比例尺
          */}
        <Chart height={500} data={dv} padding={[80, 100, 80, 80]} forceFit>
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
          <Geom type="area" position="key*value" shape="smooth" color="country" />
          <Geom type="line" position="key*value" size={1} shape="smooth" color="country" />

          {/*
          坐标系:
            type:
              rect: 默认值,直角坐标系
              polar: 极坐标系，由角度和半径 2 个维度构成。
          */}
          <Coord type="rect" />

          {/*
          坐标轴的配置,不使用Axis组件则默认不显示所有坐标轴及相关的信息
          */}
          <Axis name="key" />
          <Axis name="value" />

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

          {/*
          绘制图表的辅助元素
          */}
          {/* <Guide>
            <Html
              position={["50%", "0%"]}
              html="<span>哈哈</span>"
              alignX="middle"
              alignY="middle"
            />
          </Guide> */}
        </Chart>
      </Card>
    );
  }
}

ChartCard.defaultProps = {
  icon: 'bar-chart',
  data: [],
};

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  data: PropTypes.array,
  keyField: PropTypes.string.isRequired,
  valueField: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default ChartCard;
