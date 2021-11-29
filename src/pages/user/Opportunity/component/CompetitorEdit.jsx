import React, { PureComponent } from 'react';
import update from 'immutability-helper';
import { Input } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'userOppsDetailcompetitor';

@connect(({ loading, userOppsDetailcompetitor, dispatch }) => ({
  loading,
  userOppsDetailcompetitor,
  dispatch,
}))
class CompetitorEdit extends PureComponent {
  state = {
    _selectedRowKeys: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    // 页面可配置化
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BUSINESS_EDIT_COMPES' },
    });
    dispatch({ type: `${DOMAIN}/query`, payload: { oppoId: param.id } });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      userOppsDetailcompetitor: { compeList },
    } = this.props;
    const newDataSource = update(compeList, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { compeList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      userOppsDetail: { formData },
      userOppsDetailcompetitor: { compeList, compeTotal, competitorPageConfig },
    } = this.props;
    const { _selectedRowKeys } = this.state;

    // 页面配置数据处理
    if (!competitorPageConfig.pageBlockViews || competitorPageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = competitorPageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    // console.log(pageFieldJson, 'pageFieldJson');

    const tableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/query`],
      total: compeTotal,
      dataSource: compeList,
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
            compeList: update(compeList, {
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
        const newDataSource = compeList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { compeList: newDataSource },
        });
      },
      columns: [
        pageFieldJson.opponentName.visibleFlag && {
          title: `${pageFieldJson.opponentName.displayName}`,
          sortNo: `${pageFieldJson.opponentName.sortNo}`,
          dataIndex: 'opponentName',
          width: '20%',
          required: !!pageFieldJson.opponentName.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'opponentName')}
            />
          ),
        },
        pageFieldJson.prodName.visibleFlag && {
          title: `${pageFieldJson.prodName.displayName}`,
          sortNo: `${pageFieldJson.prodName.sortNo}`,
          dataIndex: 'prodName',
          width: '25%',
          required: !!pageFieldJson.prodName.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'prodName')}
            />
          ),
        },
        pageFieldJson.analyse.visibleFlag && {
          title: `${pageFieldJson.analyse.displayName}`,
          sortNo: `${pageFieldJson.analyse.sortNo}`,
          dataIndex: 'analyse',
          width: '30%',
          required: !!pageFieldJson.analyse.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'analyse')}
            />
          ),
        },
        pageFieldJson.treatment.visibleFlag && {
          title: `${pageFieldJson.treatment.displayName}`,
          sortNo: `${pageFieldJson.treatment.sortNo}`,
          dataIndex: 'treatment',
          width: '20%',
          required: !!pageFieldJson.treatment.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'treatment')}
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
          {formatMessage({ id: `user.management.oppo.competitor`, desc: '竞争对手' })}
        </div>
        <div style={{ margin: 12 }}>
          <EditableDataTable {...tableProps} />
        </div>
      </div>
    );
  }
}

export default CompetitorEdit;
