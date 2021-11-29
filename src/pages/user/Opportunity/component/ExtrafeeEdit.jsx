import React, { PureComponent } from 'react';
import { Input, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import { UdcSelect } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'userOppsDetailextrafee';

@connect(({ loading, userOppsDetailextrafee, dispatch }) => ({
  loading,
  userOppsDetailextrafee,
  dispatch,
}))
class ExtrafeeEdit extends PureComponent {
  state = {
    _selectedRowKeys: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { oppoId: param.id } });
    // 页面可配置化
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BUSINESS_EDIT_EXTRAFEES' },
    });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      userOppsDetailextrafee: { extrafeeList },
    } = this.props;

    const newDataSource = update(extrafeeList, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { extrafeeList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      userOppsDetail: { formData },
      userOppsDetailextrafee: { extrafeeList, extrafeeTotal, extrafeePageConfig },
    } = this.props;
    const { _selectedRowKeys } = this.state;

    // 页面配置数据处理
    if (!extrafeePageConfig.pageBlockViews || extrafeePageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = extrafeePageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    // console.log(pageFieldJson, 'pageFieldJson');

    const tableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/query`],
      total: extrafeeTotal,
      dataSource: extrafeeList,
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
            extrafeeList: update(extrafeeList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  oppoId: formData.id,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = extrafeeList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { extrafeeList: newDataSource },
        });
      },
      columns: [
        pageFieldJson.feeType.visibleFlag && {
          title: `${pageFieldJson.feeType.displayName}`,
          sortNo: `${pageFieldJson.feeType.sortNo}`,
          dataIndex: 'feeType',
          width: '25%',
          required: !!pageFieldJson.feeType.requiredFlag,
          render: (value, row, index) => (
            <UdcSelect
              code="TSK.FEE_TYPE"
              value={value}
              onChange={this.onCellChanged(index, 'feeType')}
            />
          ),
        },
        pageFieldJson.opposityDesc.visibleFlag && {
          title: `${pageFieldJson.opposityDesc.displayName}`,
          sortNo: `${pageFieldJson.opposityDesc.sortNo}`,
          dataIndex: 'opposityDesc',
          width: '25%',
          required: !!pageFieldJson.opposityDesc.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'opposityDesc')}
            />
          ),
        },
        pageFieldJson.baseAmt.visibleFlag && {
          title: `${pageFieldJson.baseAmt.displayName}`,
          sortNo: `${pageFieldJson.baseAmt.sortNo}`,
          dataIndex: 'baseAmt',
          width: '25%',
          required: !!pageFieldJson.baseAmt.requiredFlag,
          render: (value, row, index) => (
            <InputNumber
              defaultValue={value}
              className="x-fill-100"
              min={0}
              max={100}
              onBlur={this.onCellChanged(index, 'baseAmt')}
            />
          ),
        },
        pageFieldJson.ratio.visibleFlag && {
          title: `${pageFieldJson.ratio.displayName}`,
          sortNo: `${pageFieldJson.ratio.sortNo}`,
          dataIndex: 'ratio',
          width: '25%',
          required: !!pageFieldJson.ratio.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              className="x-fill-100"
              maxLength={35}
              onBlur={this.onCellChanged(index, 'ratio')}
            />
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      buttons: [],
    };

    return (
      <div>
        <div className="tw-card-title">
          {formatMessage({ id: `user.management.oppo.extrafee`, desc: '额外销售费用' })}
        </div>
        <div style={{ margin: 12 }}>
          <EditableDataTable {...tableProps} />
        </div>
      </div>
    );
  }
}

export default ExtrafeeEdit;
