import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, InputNumber } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import update from 'immutability-helper';
import { formatMessage } from 'umi/locale';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { Selection } from '@/pages/gen/field';
import { selectActiveBu } from '@/services/gen/list';

const DOMAIN = 'platAuAcc';

@connect(({ loading, platAuAcc }) => ({
  platAuAcc,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class AuAcc extends PureComponent {
  componentDidMount() {
    this.fetchData({ sortBy: 'id', sortDirection: 'ASC', limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      platAuAcc: { dataSource },
      dispatch,
    } = this.props;

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  // 保存按钮事件
  handleSave = queryParams => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/save`,
      queryParams,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      platAuAcc: { dataSource, total, searchForm },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      enableSelection: false,
      total,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '公司', // TODO: 国际化
          dataIndex: 'ouName',
          options: {
            initialValue: searchForm.ouName,
          },
          tag: <Input placeholder="请输入公司名称" />,
        },
        {
          title: 'BU', // TODO: 国际化
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId,
          },
          tag: <Selection source={() => selectActiveBu()} placeholder="请选择BU" />,
        },
        {
          title: '账套', // TODO: 国际化
          dataIndex: 'accsetName',
          options: {
            initialValue: searchForm.accsetName,
          },
          tag: <Input placeholder="请输入账套" />,
        },
        {
          title: '科目', // TODO: 国际化
          dataIndex: 'accSearchKey',
          options: {
            initialValue: searchForm.accSearchKey,
          },
          tag: <Input placeholder="请输入科目编号或名称" />,
        },
        {
          title: '科目级别', // TODO: 国际化
          dataIndex: 'accLevel',
          options: {
            initialValue: searchForm.accLevel,
            rules: [
              {
                pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                message: '请输入浮点数',
              },
            ],
          },
          tag: <Input placeholder="请输入科目级别" />,
        },
        {
          title: '科目状态', // TODO: 国际化
          dataIndex: 'accStatus',
          options: {
            initialValue: searchForm.accStatus,
          },
          tag: <Selection.UDC code="ACC.ACC_STATUS" placeholder="请选择科目状态" />,
        },
      ],
      columns: [
        {
          title: 'BU', // TODO: 国际化
          dataIndex: 'bu',
          width: 200,
          fixed: 'left',
        },
        {
          title: '公司', // TODO: 国际化
          dataIndex: 'ouName',
        },
        {
          title: '账套名称', // TODO: 国际化
          dataIndex: 'accsetName',
        },
        {
          title: '状态', // TODO: 国际化
          dataIndex: 'accStatusName',
          align: 'center',
        },
        {
          title: '科目号', // TODO: 国际化
          dataIndex: 'accCode',
          align: 'center',
        },
        {
          title: '科目名称', // TODO: 国际化
          dataIndex: 'accName',
          align: 'center',
        },
        {
          title: '科目级别', // TODO: 国际化
          dataIndex: 'accLevel',
          align: 'right',
        },
        {
          title: '是否汇总科目', // TODO: 国际化
          dataIndex: 'sumFlag',
          render: value => <div>{value === 1 ? '是' : '否'}</div>,
        },
        {
          title: '财务年度', // TODO: 国际化
          dataIndex: 'finYear',
          align: 'right',
        },
        {
          title: '本年度当前累计金额', // TODO: 国际化
          dataIndex: 'baseBuName',
          align: 'right',
          width: 100,
        },
        {
          title: '期间1-借方金额', // TODO: 国际化
          dataIndex: 'drAmt1',
          // defaultSortOrder: 'descend',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt1')}
            />
          ),
        },
        {
          title: '期间1-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt1',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt1')}
            />
          ),
        },
        {
          title: '期间2-借方金额', // TODO: 国际化
          dataIndex: 'drAmt2',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt2')}
            />
          ),
        },
        {
          title: '期间2-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt2',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt2')}
            />
          ),
        },
        {
          title: '期间3-借方金额', // TODO: 国际化
          dataIndex: 'drAmt3',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt3')}
            />
          ),
        },
        {
          title: '期间3-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt3',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt3')}
            />
          ),
        },
        {
          title: '期间4-借方金额', // TODO: 国际化
          dataIndex: 'drAmt4',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt4')}
            />
          ),
        },
        {
          title: '期间4-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt4',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt4')}
            />
          ),
        },
        {
          title: '期间5-借方金额', // TODO: 国际化
          dataIndex: 'drAmt5',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt5')}
            />
          ),
        },
        {
          title: '期间5-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt5',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt5')}
            />
          ),
        },
        {
          title: '期间6-借方金额', // TODO: 国际化
          dataIndex: 'drAmt6',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt6')}
            />
          ),
        },
        {
          title: '期间6-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt6',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt6')}
            />
          ),
        },
        {
          title: '期间7-借方金额', // TODO: 国际化
          dataIndex: 'drAmt7',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt7')}
            />
          ),
        },
        {
          title: '期间7-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt7',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt7')}
            />
          ),
        },
        {
          title: '期间8-借方金额', // TODO: 国际化
          dataIndex: 'drAmt8',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt8')}
            />
          ),
        },
        {
          title: '期间8-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt8',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt8')}
            />
          ),
        },
        {
          title: '期间9-借方金额', // TODO: 国际化
          dataIndex: 'drAmt9',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt9')}
            />
          ),
        },
        {
          title: '期间9-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt9',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt9')}
            />
          ),
        },
        {
          title: '期间10-借方金额', // TODO: 国际化
          dataIndex: 'drAmt10',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt10')}
            />
          ),
        },
        {
          title: '期间10-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt10',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt10')}
            />
          ),
        },
        {
          title: '期间11-借方金额', // TODO: 国际化
          dataIndex: 'drAmt11',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt11')}
            />
          ),
        },
        {
          title: '期间11-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt11',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt11')}
            />
          ),
        },
        {
          title: '期间12-借方金额', // TODO: 国际化
          dataIndex: 'drAmt12',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt12')}
            />
          ),
        },
        {
          title: '期间12-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt12',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt12')}
            />
          ),
        },
        {
          title: '期间13-借方金额', // TODO: 国际化
          dataIndex: 'drAmt13',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt13')}
            />
          ),
        },
        {
          title: '期间13-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt13',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt13')}
            />
          ),
        },
        {
          title: '期间14-借方金额', // TODO: 国际化
          dataIndex: 'drAmt14',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'drAmt14')}
            />
          ),
        },
        {
          title: '期间14-贷方金额', // TODO: 国际化
          dataIndex: 'crAmt14',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'crAmt14')}
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'save',
          className: 'tw-btn-primary',
          icon: 'save',
          title: formatMessage({ id: `misc.save`, desc: '保存' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.handleSave(queryParams);
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} scroll={{ x: 6000 }} />
      </PageHeaderWrapper>
    );
  }
}

export default AuAcc;
