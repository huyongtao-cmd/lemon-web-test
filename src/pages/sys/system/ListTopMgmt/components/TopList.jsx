import React, { PureComponent } from 'react';
import { Chart, Geom, Axis, Tooltip, Coord, Label, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import { equals, isEmpty } from 'ramda';
import DataTable from '@/components/common/DataTable';
import { mul } from '@/utils/mathUtils';
import { ellipsisStr } from '@/utils/stringUtils';
import styles from './style.less';

class TopList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      item: props.item ? props.item : {},
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ item: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { item } = this.props;
    if (!equals(prevState.item, item)) {
      return item;
    }
    return null;
  }

  render() {
    const { item } = this.state;

    const previewTableProps = {
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: false,
      pagination: false,
      showSearch: false,
      showColumn: false,
      showExport: false,
      enableSelection: false,
      rowClassName: (record, index) => {
        const { resId } = item;
        const { mySort } = styles;
        if (record.RES && Number(record.RES) === resId) {
          return mySort;
        }
        return '';
      },
    };

    const SORT_VAL =
      item.list2.filter(v => v.type === 'SORT_VAL')[0] &&
      item.list2.filter(v => v.type === 'SORT_VAL')[0].word;
    const LABEL =
      item.list2.filter(v => v.type === 'LABEL')[0] &&
      item.list2.filter(v => v.type === 'LABEL')[0].word;

    const REMARK =
      item.list2.filter(v => v.type === 'REMARK')[0] &&
      item.list2.filter(v => v.type === 'REMARK')[0].word;

    // 多LABLE拼接
    const lableArr = item.list2.filter(v => v.type === 'LABEL').map(v => v.word);
    // const lableArrName = item.list.map(v => lableArr.map(key => v[key]).join(' '));

    const ds = new DataSet();
    const dv = ds.createView().source(
      item.list.map(v => ({
        ...v,
        [SORT_VAL]: Number(v[SORT_VAL]),
        allLableName: lableArr.map(key => v[key]).join(' '), // 所有lable拼接
        firstLableName: lableArr.map(key => v[key])[0], // 第一个lable
        noFirstLableName: lableArr.map((key, i) => (i ? v[key] : null)).join(' '), // 除去第一个lable拼接值，用作tooltip现实的title
      }))
    );

    dv.transform({
      type: 'fold',
      fields: [SORT_VAL],
      // 展开字段集
      key: 'type',
      // key字段
      value: 'value', // value字段
    });

    return (
      <>
        {item.layoutType === 'TABLE' && (
          <DataTable
            {...previewTableProps}
            columns={[
              {
                title: '排名',
                dataIndex: 'sort',
                align: 'center',
              },
              ...item.list2.filter(v => v.type !== 'REMARK').map((v, index) => ({
                title: v.field,
                dataIndex: v.word,
                align: v.type === 'SORT_VAL' ? 'right' : 'center',
                render: (value, row, i) =>
                  v.type === 'SORT_VAL'
                    ? Number(value)
                        .toFixed(2)
                        .replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,')
                    : value,
              })),
            ]}
            dataSource={
              item.list.map((v, index) => ({
                ...v,
              }))
              // .sort((a, b) => Number(b[SORT_VAL]) - Number(a[SORT_VAL]))
            }
          />
        )}
        {item.layoutType === 'BAR_CHART' && (
          <Chart
            height={mul(item.list.length, 80) || 500}
            data={dv}
            padding={[50, 120, 20, 120]}
            forceFit
          >
            <Legend
              position="top-center"
              offsetY={30}
              textStyle={{
                fontSize: '18',
              }}
              itemFormatter={val => item.list2.filter(v => v.type === 'SORT_VAL')[0].field} // val 为每个图例项的文本值
            />
            <Coord transpose scale={[1, -1]} />
            <Axis
              name="onlyKey"
              line={null}
              tickLine={null}
              label={{
                offset: 120,
                htmlTemplate(text, items, index) {
                  const { sort, RES } = dv.rows[index];
                  const { resId } = item;
                  return `<div style="width:120px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">
                              <span style="display:inline-block;width:30px;heigth:30px;background-color:${
                                sort <= 3 ? '#EF6D2D' : '#97ADC7'
                              };color:white;text-align:center;line-height:30px">${sort}</span><span style="display:inline-block;padding-left:8px;font-weight:${
                    Number(RES) === resId ? 'bolder' : 'normal'
                  };color:${Number(RES) === resId ? '#EF6D2D' : ''}" title='${dv.rows[index]
                    .firstLableName || ''}'>${dv.rows[index].firstLableName || ''}</span></div>`;
                },
              }}
            />
            <Axis name="value" visible={false} />
            <Tooltip />
            <Geom
              type="interval"
              position="onlyKey*value"
              color="type"
              size={25}
              tooltip={[
                `${LABEL}*value*${REMARK}*noFirstLableName`,
                // eslint-disable-next-line no-shadow
                (LABEL, value, REMARK, noFirstLableName) => ({
                  // 自定义 tooltip 上显示的 title 显示内容等。
                  name: LABEL,
                  title: noFirstLableName,
                  value: Number(value)
                    .toFixed(2)
                    .replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,'),
                }),
              ]}
            >
              <Label
                content="value"
                textStyle={{ fill: '#000', fontSize: '16' }}
                position="top"
                formatter={(text, items, index) =>
                  ellipsisStr(
                    Number(text)
                      .toFixed(2)
                      .replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,'),
                    12
                  )
                }
              />
            </Geom>
          </Chart>
        )}
        {item.layoutType === 'VERTICAL_CHART' && (
          <Chart
            height={400}
            width={mul(item.list.length, 120)}
            data={dv}
            padding={[90, 60, 60, 20]}
          >
            <Legend
              position="top-left"
              offsetY={40}
              offsetX={10}
              textStyle={{
                fontSize: '18',
              }}
              itemFormatter={val =>
                !isEmpty(item.list2.filter(v => v.type === 'SORT_VAL'))
                  ? item.list2.filter(v => v.type === 'SORT_VAL')[0].field
                  : ''
              } // val 为每个图例项的文本值
            />
            <Axis
              name="onlyKey"
              line={null}
              tickLine={null}
              label={{
                offset: 20,
                textStyle: {
                  fill: 'rgba(0, 0, 0, 0.65)',
                  fontSize: '16',
                  // writingMode: 'tb-rl',
                },
                htmlTemplate(text, items, indexs) {
                  const { RES } = dv.rows[indexs];
                  const { resId } = item;
                  return `<div style="width:120px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;text-align:center">
                  <span style=";font-weight:${Number(RES) === resId ? 'bolder' : 'normal'};color:${
                    Number(RES) === resId ? '#EF6D2D' : ''
                  }" title='${dv.rows[indexs].firstLableName || ''}'>${dv.rows[indexs]
                    .firstLableName || ''}</span></div>`;
                },
              }}
            />
            <Axis name="value" visible={false} />
            <Tooltip />
            <Geom
              type="interval"
              position="onlyKey*value"
              color="type"
              size={25}
              tooltip={[
                `${LABEL}*value*${REMARK}*noFirstLableName`,
                // eslint-disable-next-line no-shadow
                (LABEL, value, REMARK, noFirstLableName) => ({
                  // 自定义 tooltip 上显示的 title 显示内容等。
                  name: LABEL,
                  title: noFirstLableName,
                  value: Number(value)
                    .toFixed(2)
                    .replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,'),
                }),
              ]}
            >
              <Label
                content="value"
                offset={30}
                textStyle={{ fill: '#000', fontSize: '16', textAlign: 'middle' }}
                position="top"
                line={null}
                tickLine={null}
                htmlTemplate={(text, items, index) => {
                  const { sort } = dv.rows[index];
                  return `<span style="text-align:center;display:block;"><span style="display:inline-block;width:25px;heigth:25px;background-color:${
                    sort <= 3 ? '#EF6D2D' : '#97ADC7'
                  };color:white;text-align:center;line-height:25px">${sort}</span><span style="display:inline-block;width:auto;text-align:center;margin-letf:5px">${ellipsisStr(
                    Number(text)
                      .toFixed(2)
                      .replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,'),
                    12
                  )}</span></span>`;
                }}
              />
            </Geom>
          </Chart>
        )}
      </>
    );
  }
}

export default TopList;
