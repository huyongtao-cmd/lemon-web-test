import React, { PureComponent } from 'react';
import {
  G2,
  Chart,
  Geom,
  Axis,
  Tooltip,
  Coord,
  Label,
  Legend,
  View,
  Guide,
  Shape,
  Facet,
  Util,
} from 'bizcharts';
import DataSet from '@antv/data-set';
import { equals, isNil, isEmpty, type } from 'ramda';

// eslint-disable-next-line react/prefer-stateless-function
class CircleCharts extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      title: props.title || '完成率',
      data: props.data || [],
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ data: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { data } = this.props;
    if (!equals(prevState.data, data)) {
      return Array.isArray(data) ? data : [];
    }
    return null;
  }

  render() {
    const { title, data } = this.state;
    const { DataView } = DataSet;
    const { Html } = Guide;
    const dv = new DataView();
    dv.source(data).transform({
      type: 'percent',
      field: 'count',
      dimension: 'item',
      as: 'percent',
    });
    const cols = {
      percent: {
        formatter: val => (val * 100).toFixed(2) + '%',
      },
    };
    return (
      <div>
        <Chart height={220} data={dv} scale={cols} padding={[0, 65]} forceFit>
          <Coord type="theta" radius={0.75} innerRadius={0.6} />
          <Axis name="percent" />
          <Tooltip
            showTitle={false}
            itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
          />
          <Guide>
            <Html
              position={['50%', '50%']}
              html={`<div style=&quot;color:#8c8c8c;font-size:0.4em;text-align: center;width: 10em;&quot;>${title}</div>`}
              alignX="middle"
              alignY="middle"
            />
          </Guide>
          <Geom
            type="intervalStack"
            position="percent"
            color="item"
            size={15}
            tooltip={[
              'item*percent',
              (item, percent) => ({
                name: item,
                value: (percent * 100).toFixed(2) + '%',
              }),
            ]}
            style={{
              lineWidth: 1,
              stroke: '#fff',
            }}
          >
            <Label
              content="percent"
              offset={10}
              formatter={(val, item) => item.point.item + ': ' + val}
            />
          </Geom>
        </Chart>
      </div>
    );
  }
}

export default CircleCharts;
