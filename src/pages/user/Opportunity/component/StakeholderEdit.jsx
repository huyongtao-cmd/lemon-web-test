import React, { PureComponent } from 'react';
import { Input } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import { UdcSelect, Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'userOppsDetailstakeholder';

@connect(({ loading, userOppsDetailstakeholder, dispatch }) => ({
  loading,
  userOppsDetailstakeholder,
  dispatch,
}))
class StakeholderEdit extends PureComponent {
  state = {
    _selectedRowKeys: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { sourceId: param.id, shClass: '1' } });
    // 页面可配置化
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BUSINESS_EDIT_STAKEHOLDERS' },
    });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      userOppsDetailstakeholder: { shsList },
    } = this.props;

    const newDataSource = update(shsList, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { shsList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      userOppsDetail: { formData },
      userOppsDetailstakeholder: { shsList, shsTotal, stakePageConfig },
    } = this.props;
    const { _selectedRowKeys } = this.state;
    // 页面配置数据处理
    if (!stakePageConfig.pageBlockViews || stakePageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = stakePageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    // console.log(pageFieldJson, 'pageFieldJson');
    const tableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`],
      total: shsTotal,
      dataSource: shsList,
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
            shsList: update(shsList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  // oppoId: formData.id,
                  shClass: '1',
                  sourceId: formData.id,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = shsList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { shsList: newDataSource },
        });
      },
      columns: [
        pageFieldJson.roleType.visibleFlag && {
          title: `${pageFieldJson.roleType.displayName}`,
          sortNo: `${pageFieldJson.roleType.sortNo}`,
          dataIndex: 'roleType',
          width: 200,
          required: !!pageFieldJson.roleType.requiredFlag,
          render: (value, row, index) => (
            <UdcSelect
              code="TSK.ROLE_TYPE"
              value={value}
              onChange={this.onCellChanged(index, 'roleType')}
            />
          ),
        },
        pageFieldJson.position.visibleFlag && {
          title: `${pageFieldJson.position.displayName}`,
          sortNo: `${pageFieldJson.position.sortNo}`,
          dataIndex: 'position',
          width: 200,
          required: !!pageFieldJson.position.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'position')}
            />
          ),
        },
        pageFieldJson.contactName.visibleFlag && {
          title: `${pageFieldJson.contactName.displayName}`,
          sortNo: `${pageFieldJson.contactName.sortNo}`,
          dataIndex: 'contactName',
          width: 150,
          required: !!pageFieldJson.contactName.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'contactName')}
            />
          ),
        },
        pageFieldJson.contactTel.visibleFlag && {
          title: `${pageFieldJson.contactTel.displayName}`,
          sortNo: `${pageFieldJson.contactTel.sortNo}`,
          dataIndex: 'contactTel',
          width: 150,
          required: !!pageFieldJson.contactTel.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'contactTel')}
            />
          ),
        },
        pageFieldJson.imAcc.visibleFlag && {
          title: `${pageFieldJson.imAcc.displayName}`,
          sortNo: `${pageFieldJson.imAcc.sortNo}`,
          dataIndex: 'imAcc',
          width: 200,
          required: !!pageFieldJson.imAcc.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'imAcc')}
            />
          ),
        },
        pageFieldJson.standpoint.visibleFlag && {
          title: `${pageFieldJson.standpoint.displayName}`,
          sortNo: `${pageFieldJson.standpoint.sortNo}`,
          dataIndex: 'standpoint',
          width: 200,
          required: !!pageFieldJson.standpoint.requiredFlag,
          render: (value, row, index) => (
            <Selection.UDC
              code="TSK:OPPO_STANDPOINT"
              value={value}
              onChange={this.onCellChanged(index, 'standpoint')}
            />
          ),
        },
        pageFieldJson.remark.visibleFlag && {
          title: `${pageFieldJson.remark.displayName}`,
          sortNo: `${pageFieldJson.remark.sortNo}`,
          dataIndex: 'remark',
          width: 300,
          required: !!pageFieldJson.remark.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={400}
              onBlur={this.onCellChanged(index, 'remark')}
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
          {formatMessage({ id: `user.management.oppo.stakeholder`, desc: '商机干系人' })}
        </div>
        <div style={{ margin: 12 }}>
          <EditableDataTable scroll={{ x: 1450 }} {...tableProps} />
        </div>
      </div>
    );
  }
}

export default StakeholderEdit;
