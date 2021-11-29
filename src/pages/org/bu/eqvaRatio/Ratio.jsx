import React, { PureComponent, useCallback } from 'react';
import { Input, Form, InputNumber, DatePicker, Card, Button } from 'antd';
import { connect } from 'dva';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import FieldList from '@/components/layout/FieldList';
import { genFakeId } from '@/utils/mathUtils';
import update from 'immutability-helper';
import moment from 'moment';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'orgRatio';

const { RangePicker } = DatePicker;

// 加载列表数据
@connect(({ loading, orgEqvaRatio }) => ({
  loading: loading.effects[`${DOMAIN}/query`], // 加载数据请求完成，菊花旋转图标隐藏
  ...orgEqvaRatio.orgRatio, // 解析本命名空间下的变量到props中
}))
@Form.create({})
// 切换到本tab页时？
@mountToTab()
class Ratio extends PureComponent {
  // 组件加载时，加载数据

  componentDidMount() {
    // 父组件加载时加载本页面数据
  }

  // 行编辑触发事件
  onCellChanged = (index, name, e) => {
    // 字段没值的时候，给e，备注字段会存对象导致报错；给''，会导致当量系数、日期字段值存不到state中
    const value = e && e.target && e.target.value ? e.target.value : e;
    const {
      ratio: { dataList, delIds },
      dispatch,
    } = this.props;

    const newDataSource = dataList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value, // key中通过[]取变量的值
    };
    if (name === 'period') {
      newDataSource[index] = {
        ...newDataSource[index],
        startDate: value ? moment(value[0]).format('YYYY-MM-DD') : '',
        endDate: value ? moment(value[1]).format('YYYY-MM-DD') : '',
      };
    }
    if (name === 'remark' && !e.target.value) {
      newDataSource[index] = {
        ...newDataSource[index],
        remark: '',
      };
    }

    if (name === 'startDate' && !!dataList[index].endDate) {
      if (moment(dataList[index].endDate).isBefore(value)) {
        createMessage({ type: 'warn', description: '开始日期不能晚于结束日期!' });
      }
    }
    if (name === 'endDate' && !!value) {
      if (moment(dataList[index].startDate).isAfter(value)) {
        createMessage({ type: 'warn', description: '结束日期不能早于开始日期!' });
      }
    }
    dispatch({
      type: `orgEqvaRatio/updateState`,
      payload: {
        ratio: {
          dataList: newDataSource,
          delIds,
        },
      },
    });
  };

  // 组件渲染
  render() {
    const {
      loading,
      ratio: { dataList, delIds },
      total,
      pageConfig,
      dispatch,
      pageBlockView,
      pageButtonViews,
    } = this.props;
    const { mode } = fromQs();

    if (!pageBlockView || pageBlockView.length < 1) {
      return <div />;
    }
    if (!pageButtonViews || pageButtonViews.length < 3) {
      return <div />;
    }
    const { pageFieldViews } = pageBlockView;
    const pageFieldJson = {};
    // 对象数据数据处理，可以直接通过pageFieldJson.eqvaRatio取出对应字段的配置
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field; // fieldKey = 驼峰变量名
    });
    const { buId, resId, startDate, endDate, period, eqvaRatio, remark } = pageFieldJson;
    const readOnly = !mode || mode === 'view';
    const tableProps = {
      rowKey: 'id',
      sortBy: 'startDate',
      dataSource: dataList,
      columnsCache: DOMAIN,
      readOnly,
      dispatch,
      // loading:loading.effects[`${DOMAIN}/query`],
      total,
      showAdd: !readOnly && pageButtonViews[0].buttonName.visible,
      showDelete: !readOnly && pageButtonViews[2].buttonName.visible,
      showCopy: false,
      buttons: [
        {
          key: 'save',
          title: pageButtonViews[1].buttonName || '保存',
          className: 'tw-btn-primary',
          // loading:`${DOMAIN}/saveEqvaRatio`,
          // hidden: readOnly || pageButtonViews[1].visible,
          hidden: true,
          disable: false,
          minSelections: 0,
          cb: () => {
            dispatch({
              type: `${DOMAIN}/saveRatio`,
              payload: null,
            }).then(() => {
              const { resId: resIdQs, buId: buIdQs } = fromQs();
              dispatch({
                type: `orgEqvaRatio/getResInfo`,
                payload: {
                  buId: buIdQs,
                  resId: resIdQs,
                },
              });
            });
          },
        },
      ],
      onAdd: newRow => {
        const { buId: buIdQs, resId: resIdQs } = fromQs();
        dispatch({
          type: `orgEqvaRatio/updateState`,
          payload: {
            ratio: {
              dataList: update(dataList || [], {
                $push: [
                  {
                    ...newRow,
                    id: genFakeId(-1),
                    period: [],
                    buId: buIdQs,
                    resId: resIdQs,
                    startDate: null,
                    endDate: null,
                    eqvaRatio: null,
                  },
                ],
              }),
              delIds,
            },
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDelIds = delIds || [];
        selectedRowKeys.map(keyValue => keyValue > 0 && newDelIds.push(keyValue)); // 数组添加元素
        const newDataList = dataList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `orgEqvaRatio/updateState`,
          payload: {
            ratio: {
              dataList: newDataList,
              delIds: newDelIds,
            },
          },
        });
      },
      columns: [
        {
          key: startDate.fieldKey, // 开始日期
          align: 'center',
          render: (value, row, index) => (
            <DatePicker
              defaultValue={row.startDate ? moment(row.startDate) : null}
              onChange={e => this.onCellChanged(index, 'startDate', e)}
              disabled={readOnly || startDate.fieldMode !== 'EDITABLE'}
              allowClear={false}
              format="YYYY-MM-DD"
            />
          ),
        },
        {
          key: endDate.fieldKey, // 结束日期
          align: 'center',
          render: (value, row, index) => (
            <DatePicker
              defaultValue={row.endDate ? moment(row.endDate) : null}
              onChange={e => this.onCellChanged(index, 'endDate', e)}
              disabled={readOnly || endDate.fieldMode !== 'EDITABLE'}
              format="YYYY-MM-DD"
            />
          ),
        },
        {
          key: period.fieldKey, // 期间
          align: 'center',
          render: (value, row, index) => (
            <RangePicker
              defaultValue={[
                row.startDate ? moment(row.startDate) : null,
                row.endDate ? moment(row.endDate) : '',
              ]}
              onChange={e => this.onCellChanged(index, 'period', e)}
              disabled={readOnly || period.fieldMode !== 'EDITABLE'}
              allowClear={false}
            />
          ),
        },
        {
          key: eqvaRatio.fieldKey, // 当量系数
          render: (value, row, index) => (
            <InputNumber
              className="x-fill-100"
              // precision={2}
              defaultValue={value}
              onChange={e => this.onCellChanged(index, 'eqvaRatio', e)}
              disabled={readOnly || eqvaRatio.fieldMode !== 'EDITABLE'}
              max={99999999}
            />
          ),
        },
        {
          key: remark.fieldKey, // 备注
          render: (value, row, index) => (
            <Input.TextArea
              autosize={{ minRows: 1, maxRows: 3 }}
              className="x-fill-100"
              defaultValue={value}
              onChange={e => {
                this.onCellChanged(index, 'remark', e);
              }}
              disabled={readOnly || remark.fieldMode !== 'EDITABLE'}
            />
          ),
        },
      ]
        .filter(column => pageFieldJson[column.key].visibleFlag === 1)
        .sort((c1, c2) => c1.sortNo - c2.sortNo)
        .map(column => ({
          ...column,
          title: pageFieldJson[column.key].displayName,
          dataIndex: pageFieldJson[column.key].fieldKey,
          sortNo: pageFieldJson[column.key].sortNo,
          required: mode === 'edit' && pageFieldJson[column.key].requiredFlag,
          disable: mode === 'view' && pageFieldJson[column.key].fieldMode !== 'EDITABLE',
        })),
    };

    return <EditableDataTable {...tableProps} scroll={{ x: 1600 }} />;
  }
}

export default Ratio;
