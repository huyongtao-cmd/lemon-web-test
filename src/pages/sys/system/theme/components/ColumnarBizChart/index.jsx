/* eslint-disable no-restricted-syntax */
import React from 'react';
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

class Groupedcolumn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {}

  static getDerivedStateFromProps(nextProps, prevState) {
    if (JSON.stringify(nextProps.dataSource) !== JSON.stringify(prevState.data)) {
      return {
        data: nextProps.dataSource,
      };
    }
    return null;
  }

  render() {
    const { data } = this.state;
    const fields = [];
    for (const key in data[0]) {
      if (key !== 'id') fields.push(key);
    }
    // eslint-disable-next-line array-callback-return
    data.map(item => {
      for (const key in item) {
        // eslint-disable-next-line no-param-reassign
        if (key !== 'id') item[key] = Number(item[key]);
      }
    });
    const ds = new DataSet();
    const dv = ds.createView().source(data);
    dv.transform({
      type: 'fold',
      fields,
      // 展开字段集
      key: 'x轴',
      // key字段
      value: 'y轴', // value字段
    });
    return (
      <div>
        <Chart height={300} padding={[20, 'auto', 80, 'auto']} data={dv} forceFit>
          <Axis name="x轴" />
          <Axis name="y轴" />
          <Legend />
          <Tooltip
            crosshairs={{
              type: 'y',
            }}
          />
          <Geom
            type="interval"
            position="x轴*y轴"
            color="id"
            adjust={[
              {
                type: 'dodge',
                marginRatio: 1 / 32,
              },
            ]}
          />
        </Chart>
      </div>
    );
  }
}
export default Groupedcolumn;
