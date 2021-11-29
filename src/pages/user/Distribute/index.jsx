import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Input, DatePicker } from 'antd';
import router from 'umi/router';
import Link from 'umi/link';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import SelectWithCols from '@/components/common/SelectWithCols';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { selectCapasetLevel } from '@/services/gen/list';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { Selection } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
const DOMAIN = 'userDist';
const { RangePicker } = DatePicker;
@connect(({ loading, userDist }) => ({
  loading,
  userDist,
}))
@mountToTab()
class DistributeList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData({ offset: 0, limit: 10, sortBy: 'distNo', sortDirection: 'DESC' });
    // 资源下拉
    dispatch({
      type: `${DOMAIN}/queryResList`,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userDist: { dataSource, total, searchForm, resList, resSource },
    } = this.props;

    const tableProps = {
      sortBy: 'distNo',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
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
          title: '派发人',
          dataIndex: 'disterResId',
          options: {
            initialValue: searchForm.disterResId,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              valueKey="code"
              className="x-fill-100"
              columns={SEL_COL}
              dataSource={resSource}
              onChange={() => {}}
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      resSource: resList.filter(
                        d =>
                          d.code.indexOf(value) > -1 ||
                          d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                      ),
                    },
                  });
                },
                allowClear: true,
              }}
            />
          ),
        },
        {
          title: '派发',
          dataIndex: 'distNo',
          options: {
            initialValue: searchForm.distNo,
          },
          tag: <Input placeholder="请输入派发编号或者派发对象" />,
        },
        {
          title: '派发状态',
          dataIndex: 'distStatus',
          options: {
            initialValue: searchForm.distStatus,
          },
          tag: <Selection.UDC code="TSK.DISTRIBUTE_STATUS" placeholder="请选择派发状态" />,
        },
        {
          title: '派发时间',
          dataIndex: 'distTime',
          options: {
            initialValue: searchForm.distTime,
          },
          tag: <RangePicker />,
        },
        {
          title: '复合能力',
          dataIndex: 'capabilitySet',
          options: {
            initialValue: searchForm.capabilitySet,
          },
          tag: <Selection source={() => selectCapasetLevel()} placeholder="请选择复合能力" />,
        },
      ],
      columns: [
        {
          title: '派发编号',
          dataIndex: 'distNo',
          align: 'center',
          defaultSortOrder: 'descend',
          sorter: true,
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/distribute/detail?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '派发对象',
          dataIndex: 'reasonName',
        },
        {
          title: '派发状态',
          dataIndex: 'distStatusDesc',
          align: 'center',
        },
        {
          title: '审批状态',
          dataIndex: 'apprStatusDesc',
          align: 'center',
        },
        {
          title: '复合能力',
          dataIndex: 'capabilitySet',
          align: 'center',
          render: (value, row, index) => `${row.jobType1Desc}-${row.jobType2Desc}-${row.levelName}`,
        },
        {
          title: '派发人',
          dataIndex: 'disterResName',
        },
        {
          title: '接收资源',
          dataIndex: 'receiverResName',
        },
        {
          title: '派发方式',
          dataIndex: 'distMethodDesc',
          align: 'center',
        },
        {
          title: '派发时间',
          dataIndex: 'distTime',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: '派发说明',
          dataIndex: 'distDesc',
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 未派发,广播中的数据可以编辑
            const { procTaskId } = selectedRows[0];
            if (
              selectedRows[0].distStatus === 'CREATE' ||
              selectedRows[0].distStatus === 'BROADCASTING'
            ) {
              if (
                (selectedRows[0].apprStatus === 'NOTSUBMIT' ||
                  selectedRows[0].apprStatus === 'WITHDRAW' ||
                  selectedRows[0].apprStatus === 'REJECTED') &&
                !!procTaskId
              ) {
                router.push(
                  `/user/distribute/create?id=${
                    selectedRowKeys[0]
                  }&mode=update&apprId=${procTaskId}`
                );
                return;
              }
              router.push(`/user/distribute/create?id=${selectedRowKeys[0]}&mode=update`);
            } else {
              createMessage({ type: 'warn', description: '该状态不能编辑' });
            }
          },
        },
        {
          key: 'enbroadcast',
          className: 'tw-btn-primary',
          title: '取消广播',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 广播中的数据可以取消广播
            if (selectedRows[0].distStatus === 'BROADCASTING') {
              dispatch({
                type: `${DOMAIN}/cancelDistBroadcast`,
                payload: { distId: selectedRowKeys[0], queryParams },
              });
            } else {
              createMessage({ type: 'warn', description: '该状态不能取消广播' });
            }
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length < 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 未派发的可以删除
            if (
              selectedRows.length > 0 &&
              selectedRows.filter(v => v.distStatus === 'CREATE' && v.apprStatus === 'NOTSUBMIT')
                .length > 0
            ) {
              dispatch({
                type: `${DOMAIN}/deleteDistByIds`,
                payload: { ids: selectedRowKeys, queryParams },
              });
            } else {
              createMessage({ type: 'warn', description: '只有新建且未派发状态的数据能删除' });
            }
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="派发列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default DistributeList;
