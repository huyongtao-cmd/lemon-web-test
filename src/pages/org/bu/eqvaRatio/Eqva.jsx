import React, { PureComponent } from 'react';
import { Input, Form, InputNumber, DatePicker } from 'antd';
import { connect } from 'dva';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import { genFakeId } from '@/utils/mathUtils';
import update from 'immutability-helper';
import moment from 'moment';

const DOMAIN = 'orgEqva';

const { RangePicker } = DatePicker;

// 加载列表数据
@connect(({ loading, orgEqvaRatio }) => ({
  loading: loading.effects[`${DOMAIN}/query`], // 加载数据请求完成，菊花旋转图标隐藏
  ...orgEqvaRatio.orgEqva, // 解析本命名空间下的变量到props中
}))
@Form.create({})
// 切换到本tab页时？
@mountToTab()
class Eqva extends PureComponent {
  // 组件加载时，加载数据
  componentDidMount() {
    // 父组件加载时加载本页面数据
  }

  // 行编辑触发事件
  onCellChanged = (index, name, e) => {
    const value = e && e.target && e.target.value ? e.target.value : e;
    const {
      eqva: { dataList, delIds },
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
    dispatch({
      type: `orgEqvaRatio/updateState`,
      payload: {
        eqva: {
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
      eqva: { dataList, delIds },
      total,
      pageConfig,
      dispatch,
      pageBlockView,
      pageButtonViews,
    } = this.props;
    const { mode } = fromQs();
    if (!pageButtonViews || pageButtonViews.length < 3) {
      return <div />;
    }

    const { pageFieldViews } = pageBlockView;
    const pageFieldJson = {};
    // 对象数据数据处理，可以直接通过pageFieldJson.eqvaRatio取出对应字段的配置
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field; // fieldKey = 驼峰变量名
    });
    const { buId, resId, startDate, endDate, period, ratedEqva, remark } = pageFieldJson;
    const readOnly = !mode || mode === 'view';
    const tableProps = {
      rowKey: 'id',
      sortBy: 'startDate',
      dataSource: dataList,
      columnsCache: DOMAIN,
      dispatch,
      // loading:loading.effects[`${DOMAIN}/query`],
      total,
      showAdd: !readOnly && pageButtonViews[0].buttonName.visible,
      showDelete: !readOnly && pageButtonViews[2].buttonName.visible,
      showCopy: false,
      readOnly,
      buttons: [
        {
          key: 'save',
          title: pageButtonViews[1].buttonName || '保存',
          className: 'tw-btn-primary',
          // loading:`${DOMAIN}/saveEqvaRatio`,//todo
          // hidden: readOnly || pageButtonViews[1].visible,
          hidden: true,
          disable: false,
          minSelections: 0,
          cb: () => {
            dispatch({
              type: `${DOMAIN}/saveEqva`,
              payload: null,
            });
          },
        },
      ],
      onAdd: newRow => {
        const { buId: buIdQs, resId: resIdQs } = fromQs();
        dispatch({
          type: `orgEqvaRatio/updateState`,
          payload: {
            eqva: {
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
                    ratedEqva: null,
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
            eqva: {
              dataList: newDataList,
              delIds: newDelIds,
            },
          },
        });
      },
      columns: [
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
          key: ratedEqva.fieldKey, // 额定当量
          title: '额定当量',
          dataIndex: 'ratedEqva',
          render: (value, row, index) => (
            <InputNumber
              className="x-fill-100"
              // precision={2}
              defaultValue={value}
              onChange={e => this.onCellChanged(index, 'ratedEqva', e)}
              disabled={readOnly || ratedEqva.fieldMode !== 'EDITABLE'}
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
              onChange={e => {
                this.onCellChanged(index, 'remark', e);
              }}
              defaultValue={value}
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

export default Eqva;
