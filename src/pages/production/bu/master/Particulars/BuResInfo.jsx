import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Divider, Tooltip, InputNumber } from 'antd';
import DataTable from '@/components/common/DataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import { UdcSelect } from '@/pages/gen/field';
import { selectUsers } from '@/services/sys/user';
import { findBuPUserSelect } from '@/services/org/bu/component/buResInfo';
import router from 'umi/router';
import Link from 'umi/link';

const DOMAIN = 'buResInfoLinmon';

@connect(({ dispatch, loading, buResInfoLinmon }) => ({
  dispatch,
  buResInfoLinmon,
  loading,
}))
class BuResInfo extends PureComponent {
  state = {
    roleTableShow: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData();
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BU_MASTER_DATA_RESOURCE_INFORMATION_LIST' },
    });
  }

  fetchData = params => {
    const { dispatch, buId } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...params, buId },
    });
  };

  render() {
    const { loading, buResInfoLinmon, dispatch, buId } = this.props;
    const { listTableData = [], roleTableData = [], searchForm, pageConfig } = buResInfoLinmon;
    const { roleTableShow } = this.state;
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const tableProps = {
      rowKey: 'id',
      domain: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource: listTableData,
      scroll: { x: 1300 },
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
        pageFieldJson.resId.visibleFlag && {
          title: `${pageFieldJson.resId.displayName}`,
          sortNo: `${pageFieldJson.resId.sortNo}`,
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId,
          },
          tag: (
            <AsyncSelect
              source={() => selectUsers().then(resp => resp.response)}
              placeholder="请选择资源"
            />
          ),
        },
        {
          title: '上级领导',
          dataIndex: 'presId',
          options: {
            initialValue: searchForm.presId,
          },
          tag: (
            <AsyncSelect
              source={() =>
                findBuPUserSelect().then(resp =>
                  (Array.isArray(resp.response) ? resp.response : []).map(item => ({
                    id: item.id,
                    code: item.valCode,
                    name: item.valDesc,
                  }))
                )
              }
              placeholder="请选择上级领导"
            />
          ),
        },
        {
          title: '状态',
          dataIndex: 'resStatus',
          options: {
            initialValue: searchForm.resStatus,
          },
          tag: <UdcSelect code="COM.STATUS1" placeholder="请选择状态" />,
        },
      ].filter(Boolean),
      columns: [
        pageFieldJson.resId.visibleFlag && {
          title: `${pageFieldJson.resId.displayName}`,
          sortNo: `${pageFieldJson.resId.sortNo}`,
          dataIndex: 'resName',
          align: 'center',
          width: 100,
        },
        pageFieldJson.resStatus.visibleFlag && {
          title: `${pageFieldJson.resStatus.displayName}`,
          sortNo: `${pageFieldJson.resStatus.sortNo}`,
          dataIndex: 'resStatusDesc',
          align: 'center',
          width: 100,
        },
        pageFieldJson.dateFrom.visibleFlag && {
          title: `${pageFieldJson.dateFrom.displayName}`,
          sortNo: `${pageFieldJson.dateFrom.sortNo}`,
          dataIndex: 'dateFrom',
          width: 100,
        },
        pageFieldJson.dateTo.visibleFlag && {
          title: `${pageFieldJson.dateTo.displayName}`,
          sortNo: `${pageFieldJson.dateTo.sortNo}`,
          dataIndex: 'dateTo',
          width: 100,
        },

        pageFieldJson.pResId.visibleFlag && {
          title: `${pageFieldJson.pResId.displayName}`,
          sortNo: `${pageFieldJson.pResId.sortNo}`,
          dataIndex: 'presName',
          align: 'center',
          width: 100,
        },
        pageFieldJson.remark.visibleFlag && {
          title: `${pageFieldJson.remark.displayName}`,
          sortNo: `${pageFieldJson.remark.sortNo}`,
          dataIndex: 'remark',
          width: 150,
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        {
          key: 'eye',
          className: 'tw-btn-primary',
          icon: 'eye',
          title: '预览',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows) => {
            dispatch({
              type: `${DOMAIN}/queryBuResRoleInfo`,
              payload: {
                buresId: selectedRowKeys[0],
              },
            }).then(() => {
              this.setState({ roleTableShow: true });
            });
          },
        },
      ],
    };

    const roleTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/queryBuResRoleInfo`],
      expirys: 0,
      enableSelection: false,
      showSearch: false,
      showColumn: false,
      showExport: false,
      dataSource: roleTableData,
      columns: [
        {
          title: '角色',
          dataIndex: 'roleName',
          required: true,
          align: 'left',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'left',
        },
      ],
    };

    return (
      <>
        <div className="tw-card-title">账户经营状况</div>
        <div style={{ margin: 12 }}>
          <DataTable {...tableProps} />
        </div>

        {roleTableShow && (
          <>
            <Divider dashed />
            <div className="tw-card-title">资源角色</div>
            <div style={{ margin: 12 }}>
              <DataTable {...roleTableProps} />
            </div>
          </>
        )}
      </>
    );
  }
}

export default BuResInfo;
