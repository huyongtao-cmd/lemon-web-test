import React, { PureComponent } from 'react';
import { Row, Col, Card, Tooltip, Icon, Tabs } from 'antd';
import { Chart, Tooltip as BizTooltip, Geom, Coord, Legend, Axis, Guide, Label } from 'bizcharts';
import DataSet from '@antv/data-set';

const { Html, Arc } = Guide;

class ChartCard extends PureComponent {
  componentDidMount() {}

  render() {
    const { icon, title, data, keyField = 'key', valueField = 'value' } = this.props;
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
        <Chart
          height={300}
          data={data}
          scale={{
            value: {
              min: 0,
              max: 100,
              tickInterval: 10,
            },
          }}
          padding={[0, 0, 100, 0]}
          forceFit
        >
          <Coord
            type="polar"
            startAngle={(-1 / 2) * Math.PI}
            endAngle={(3 / 2) * Math.PI}
            radius={0.9}
          />
          <Axis
            name="value"
            zIndex={2}
            line={null}
            label={{
              offset: -16,
              textStyle: {
                fontSize: 18,
                textAlign: 'center',
                textBaseline: 'middle',
              },
            }}
            tickLine={{
              length: -18,
              stroke: '#fff',
              strokeOpacity: 1,
            }}
          />
          <Axis name="1" visible={false} />
          <Guide>
            <Arc
              zIndex={0}
              start={[0, 0.965]}
              end={[100, 0.965]}
              style={{
                // 底灰色
                stroke: '#CBCBCB',
                lineWidth: 10,
              }}
            />
            <Arc
              zIndex={1}
              start={[0, 0.965]}
              end={[90, 0.965]}
              style={{
                // 底灰色
                stroke: '#1890FF',
                lineWidth: 10,
              }}
            />
            <Html
              position={['50%', '95%']}
              html={() =>
                `<div style="width: 300px;text-align: center;font-size: 12px!important;"><p style="font-size: 1.75em; color: rgba(0,0,0,0.43);margin: 0;">合格率</p><p style="font-size: 3em;color: rgba(0,0,0,0.85);margin: 0;">${data[0]
                  .value * 10}%</p></div>`
              }
            />
          </Guide>

          <Geom
            type="point"
            position="value*1"
            color="#1890FF"
            active={false}
            style={{ stroke: '#fff', lineWidth: 1 }}
          />
        </Chart>
      </Card>
    );
  }
}

export default ChartCard;
