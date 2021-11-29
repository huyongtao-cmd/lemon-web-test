import React, { PureComponent } from 'react';
import { Input } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'userOppsDetailpartner';

@connect(({ loading, userOppsDetailpartner, dispatch }) => ({
  loading,
  userOppsDetailpartner,
  dispatch,
}))
class PartnerEdit extends PureComponent {
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
      payload: { pageNo: 'BUSINESS_EDIT_PARTNERS' },
    });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      userOppsDetailpartner: { partnerList },
    } = this.props;

    const newDataSource = update(partnerList, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { partnerList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      userOppsDetail: { formData },
      userOppsDetailpartner: { partnerList, partnerTotal, partnerPageConfig },
    } = this.props;
    const { _selectedRowKeys } = this.state;

    if (!partnerPageConfig.pageBlockViews || partnerPageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = partnerPageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    // console.log(pageFieldJson, 'pageFieldJson');

    const tableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`],
      total: partnerTotal,
      dataSource: partnerList,
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
            partnerList: update(partnerList, {
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
        const newDataSource = partnerList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { partnerList: newDataSource },
        });
      },
      columns: [
        pageFieldJson.partnerName.visibleFlag && {
          title: `${pageFieldJson.partnerName.displayName}`,
          sortNo: `${pageFieldJson.partnerName.sortNo}`,
          dataIndex: 'partnerName',
          required: !!pageFieldJson.partnerName.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'partnerName')}
            />
          ),
        },
        pageFieldJson.partnerNo.visibleFlag && {
          title: `${pageFieldJson.partnerNo.displayName}`,
          sortNo: `${pageFieldJson.partnerNo.sortNo}`,
          dataIndex: 'partnerNo',
          required: !!pageFieldJson.partnerNo.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'partnerNo')}
            />
          ),
        },
        pageFieldJson.contactName.visibleFlag && {
          title: `${pageFieldJson.contactName.displayName}`,
          sortNo: `${pageFieldJson.contactName.sortNo}`,
          dataIndex: 'contactName',
          required: !!pageFieldJson.contactName.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'contactName')}
            />
          ),
        },
        pageFieldJson.contactEmail.visibleFlag && {
          title: `${pageFieldJson.contactEmail.displayName}`,
          sortNo: `${pageFieldJson.contactEmail.sortNo}`,
          dataIndex: 'contactEmail',
          required: !!pageFieldJson.contactEmail.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'contactEmail')}
            />
          ),
        },
        pageFieldJson.contactTel.visibleFlag && {
          title: `${pageFieldJson.contactTel.displayName}`,
          sortNo: `${pageFieldJson.contactTel.sortNo}`,
          dataIndex: 'contactTel',
          required: !!pageFieldJson.contactTel.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'contactTel')}
            />
          ),
        },
        pageFieldJson.coopDesc.visibleFlag && {
          title: `${pageFieldJson.coopDesc.displayName}`,
          sortNo: `${pageFieldJson.coopDesc.sortNo}`,
          dataIndex: 'coopDesc',
          required: !!pageFieldJson.coopDesc.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'coopDesc')}
            />
          ),
        },
        pageFieldJson.profitShare.visibleFlag && {
          title: `${pageFieldJson.profitShare.displayName}`,
          sortNo: `${pageFieldJson.profitShare.sortNo}`,
          dataIndex: 'profitShare',
          required: !!pageFieldJson.profitShare.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'profitShare')}
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
          {formatMessage({ id: `user.management.oppo.partner`, desc: '合作伙伴' })}
        </div>
        <div style={{ margin: 12 }}>
          <EditableDataTable {...tableProps} />
        </div>
      </div>
    );
  }
}

export default PartnerEdit;
