/* eslint-disable react/no-unused-prop-types */
import React, { PureComponent } from 'react';
import { equals } from 'ramda';
import { Row, Col, Card, Tooltip, Icon, Tabs } from 'antd';
import { Chart, Tooltip as BizTooltip, Geom, Coord, Legend, Axis, Guide, Label } from 'bizcharts';
import DataSet from '@antv/data-set';
import PropTypes from 'prop-types';
import LineChart from './LineChart';
import BarChart from './BarChart';
import DonutChart from './DonutChart';
import SmoothAreaChart from './SmoothAreaChart';
import MapChart from './MapChart';

import { dataChartAllByNo } from '@/services/sys/system/dataWarehouse';

const { Html, Arc } = Guide;

class Index extends PureComponent {
  state = {
    ...this.props,
  };

  componentDidMount() {
    const { chartNo, queryParam } = this.props;
    if (chartNo) {
      dataChartAllByNo({ no: chartNo, ...queryParam }).then(chartInfo => {
        const { response } = chartInfo;
        this.setState({
          icon: response.chartIcon,
          title: response.chartTitle,
          data: response.data,
          keyField: response.keyColumn,
          valueField: response.valueColumn,
          type: response.chartType,
          showFlag: response.showFlag,
          dimensionField: response.dimensionColumn,
          transposeFlag: response.transposeFlag,
        });
      });
    }
  }

  componentWillReceiveProps(nextProp) {
    const { chartNo, queryParam } = nextProp;
    const { chartNo: chartNoOld, queryParam: oldQueryParam } = this.props;
    if (!equals(chartNo, chartNoOld) || !equals(queryParam, oldQueryParam)) {
      dataChartAllByNo({ no: chartNo, ...queryParam }).then(chartInfo => {
        const { response } = chartInfo;
        this.setState({
          icon: response.chartIcon,
          title: response.chartTitle,
          data: response.data,
          keyField: response.keyColumn,
          valueField: response.valueColumn,
          type: response.chartType,
          showFlag: response.showFlag,
          dimensionField: response.dimensionColumn,
          transposeFlag: response.transposeFlag,
        });
      });
    }
  }

  /**
   * 处理表格类型
   */
  handleChartType = () => {
    const {
      type,
      chartHeight,
      keyField,
      valueField,
      data,
      transposeFlag,
      dimensionField,
    } = this.state;
    const { children } = this.props;
    switch (type) {
      case 'CUSTOM':
        return children !== null && children !== undefined && children;
      case 'LINE_CHART':
        return (
          <LineChart
            height={chartHeight}
            keyField={keyField}
            valueField={valueField}
            data={data}
            transposeFlag={transposeFlag}
            dimensionField={dimensionField}
          />
        );
      case 'BAR_CHART':
        return (
          <BarChart
            height={chartHeight}
            keyField={keyField}
            valueField={valueField}
            data={data}
            transposeFlag={transposeFlag}
          />
        );
      case 'DONUT_CHART':
        return (
          <DonutChart
            height={chartHeight}
            keyField={keyField}
            valueField={valueField}
            data={data}
          />
        );
      case 'SMOOTH_AREA_CHART':
        return (
          <SmoothAreaChart
            height={chartHeight}
            keyField={keyField}
            valueField={valueField}
            data={data}
            transposeFlag={transposeFlag}
            dimensionField={dimensionField}
          />
        );
      case 'MAP_CHART':
        return (
          <MapChart
            height={chartHeight}
            keyField={keyField}
            valueField={valueField}
            data={data}
            transposeFlag={transposeFlag}
            dimensionField={dimensionField}
          />
        );
      default:
        return '图表类型错误!';
    }
  };

  render() {
    const {
      icon,
      title,
      data,
      keyField,
      valueField,
      type,
      showFlag,
      chartBefore,
      ...rest
    } = this.state;
    return showFlag ? (
      <Card
        title={
          <span>
            <Icon type={icon || 'bar-chart'} /> &nbsp;
            {title}
          </span>
        }
      >
        {chartBefore || undefined}
        {this.handleChartType()}
      </Card>
    ) : (
      <div />
    );
  }
}

Index.defaultProps = {
  icon: 'bar-chart',
  chartHeight: undefined,
  showFlag: true,
  data: [],
  keyField: undefined,
  valueField: undefined,
  chartNo: undefined,
  dimensionField: undefined,
  transposeFlag: false,
};

Index.propTypes = {
  chartNo: PropTypes.string,
  chartHeight: PropTypes.number,
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  data: PropTypes.array,
  keyField: PropTypes.string,
  valueField: PropTypes.string,
  dimensionField: PropTypes.string,
  type: PropTypes.string.isRequired,
  showFlag: PropTypes.bool,
  transposeFlag: PropTypes.bool,
};

export default Index;
