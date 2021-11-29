import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { Selection } from '@/pages/gen/field';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { mountToTab } from '@/layouts/routerControl';
import { Input, Radio, Popover } from 'antd';
import SyntheticField from '@/components/common/SyntheticField';

const DOMAIN = 'userMyDist';
const DISTRIBUTED = 'DISTRIBUTED';
const RadioGroup = Radio.Group;
@connect(({ loading, userMyDist }) => ({
  loading,
  userMyDist,
}))
@mountToTab()
class DistributeList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const defaultSearchForm = {
      distStatus: ['1', 'DISTRIBUTED'],
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        searchForm: defaultSearchForm,
        dataSource: [],
        total: 0,
      },
    });
    // this.fetchData({ offset: 0, limit: 10, sortBy: 'distNo', sortDirection: 'DESC' });
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
      userMyDist: { dataSource, total, searchForm },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
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
          title: '派发编号',
          dataIndex: 'distNo',
          options: {
            initialValue: searchForm.distNo,
          },
          tag: <Input placeholder="请输入派发编号" />,
        },
        {
          title: '派发状态',
          dataIndex: 'distStatus',
          options: {
            initialValue: searchForm.distStatus,
          },
          tag: (
            <SyntheticField className="tw-field-group">
              <Radio.Group className="tw-field-group-filter" buttonStyle="solid">
                <Radio.Button value="0">=</Radio.Button>
                <Radio.Button value="1">≠</Radio.Button>
              </Radio.Group>
              <Selection.UDC
                className="tw-field-group-field"
                code="TSK.DISTRIBUTE_STATUS"
                placeholder="请选择派发状态"
                showSearch
              />
            </SyntheticField>
          ),
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
          title: '响应人数',
          dataIndex: 'repsePerson',
          align: 'center',
          render: (value, row, index) => {
            let repsePersonVal = <span>{value}</span>;
            if (value > 0) {
              repsePersonVal = (
                <Popover content={row.repsePersonResName}>
                  <span style={{ color: '#00538f' }}>{value}</span>
                </Popover>
              );
            }
            return repsePersonVal;
          },
        },
        {
          title: '派发状态',
          dataIndex: 'distStatusDesc',
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
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
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
      <PageHeaderWrapper title="我的派发">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default DistributeList;
