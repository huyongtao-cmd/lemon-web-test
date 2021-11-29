import React, { PureComponent } from 'react';
import { DatePicker, Divider, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import update from 'immutability-helper';
import moment from 'moment';

import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

import SubTable from './SubTable';

const DOMAIN = 'sysButempoperation';

@connect(({ loading, sysButempoperation, dispatch }) => ({
  loading,
  sysButempoperation,
  dispatch,
}))
class BuTemplateDetail extends PureComponent {
  state = {
    _selectedRowKeys: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({ type: `${DOMAIN}/queryExamPeriodList`, payload: { tmplId: param.id } });
    dispatch({ type: `${DOMAIN}/queryOperateList`, payload: { tmplId: param.id } });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      sysButempoperation: { examPeriodList },
    } = this.props;

    let value = rowFieldValue;
    if (rowField === 'dateTo') {
      const { dateFrom } = examPeriodList[rowIndex];
      if (moment(value).isBefore(dateFrom)) {
        createMessage({ type: 'error', description: '日期不应该早于`日期从`' });
        value = null;
      } else {
        // 日期组件赋值转换
        value = formatDT(value);
      }
    } else if (rowField === 'dateFrom') {
      const { dateTo } = examPeriodList[rowIndex];
      if (dateTo && moment(dateTo).isBefore(value)) {
        createMessage({ type: 'error', description: '日期不应该晚于`日期到`' });
        value = null;
      } else {
        // 日期组件赋值转换
        value = formatDT(value);
      }
    } else {
      // input框赋值转换
      value = value && value.target ? value.target.value : value;
    }
    const newDataSource = update(examPeriodList, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { examPeriodList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      sysButempDetail: { formData },
      sysButempoperation: { examPeriodList, operateList, classTree },
    } = this.props;
    const { _selectedRowKeys } = this.state;

    const tableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/queryExamPeriodList`],
      total: 0,
      dataSource: examPeriodList,
      showCopy: false,
      // rowSelection: {
      //   selectedRowKeys: _selectedRowKeys,
      //   onChange: (selectedRowKeys, selectedRows) => {
      //     this.setState({
      //       _selectedRowKeys: selectedRowKeys,
      //     });
      //   },
      // },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            examPeriodList: update(examPeriodList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  tmplId: formData.id,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = examPeriodList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { examPeriodList: newDataSource },
        });
      },
      columns: [
        {
          title: '日期从',
          dataIndex: 'dateFrom',
          required: true,
          render: (value, row, index) => (
            <DatePicker
              value={value ? moment(value) : null}
              className="x-fill-100"
              onChange={this.onCellChanged(index, 'dateFrom')}
            />
          ),
        },
        {
          title: '日期到',
          dataIndex: 'dateTo',
          required: true,
          render: (value, row, index) => (
            <DatePicker
              value={value ? moment(value) : null}
              className="x-fill-100"
              onChange={this.onCellChanged(index, 'dateTo')}
            />
          ),
        },
        {
          title: '期间名称',
          dataIndex: 'periodName',
          required: true,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'periodName')}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={400}
              onBlur={this.onCellChanged(index, 'remark')}
            />
          ),
        },
      ],
      buttons: [],
    };

    return (
      <div>
        <div className="tw-card-title">
          {formatMessage({ id: `app.settings.menuMap.operationRange`, desc: '经营范围' })}
        </div>
        <div style={{ margin: 12 }}>
          <SubTable
            domain={DOMAIN}
            loading={loading}
            dispatch={dispatch}
            tmplId={formData.id}
            operateList={operateList}
            classTree={classTree}
          />
        </div>
        <Divider dashed />
        <div className="tw-card-title">
          {formatMessage({ id: `app.settings.menuMap.examPeriod`, desc: '考核期间' })}
        </div>
        <div style={{ margin: 12 }}>
          <EditableDataTable {...tableProps} />
        </div>
      </div>
    );
  }
}

export default BuTemplateDetail;
