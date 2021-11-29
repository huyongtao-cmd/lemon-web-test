import React from 'react';
import { Chart, Geom, Axis, Tooltip, Coord, Label, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import { equals } from 'ramda';

class Donut extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
    const { data } = this.state;
    const { DataView } = DataSet;

    const dv = new DataView();
    dv.source(data).transform({
      type: 'percent',
      field: 'count',
      dimension: 'item',
      as: 'percent',
    });
    const cols = {
      percent: {
        formatter: val => val * 100 + '%',
      },
    };
    return (
      <div>
        <Chart height={220} data={dv} scale={cols} padding={[0, 65]} forceFit>
          <Coord type="theta" radius={0.75} innerRadius={0.6} />
          <Axis name="percent" />
          <Legend position="right" offsetX={-50} offsetY={-50} />
          <Tooltip
            showTitle={false}
            itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
          />
          <Geom
            type="intervalStack"
            position="percent"
            color="item"
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
              formatter={(val, item) =>
                `${item.point.item}：${(item.point.percent * 100).toFixed(2)}%`
              }
            />
          </Geom>
        </Chart>
      </div>
    );
  }
}

export default Donut;
