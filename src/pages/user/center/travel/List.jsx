import React from 'react';
import { connect } from 'dva';
import { DatePicker, Input, Modal } from 'antd';
import router from 'umi/router';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, BuVersion } from '@/pages/gen/field';
import { selectUsers } from '@/services/sys/user';
import { selectUsersWithBu } from '@/services/gen/list';
import { request, serverUrl, getCsrfToken } from '@/utils/networkUtils';
import api from '@/api';
import createMessage from '@/components/core/AlertMessage';
import { toQs, toUrl } from '@/utils/stringUtils';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const { editBtnStatus } = api.user.travel;
const DOMAIN = 'userCenterTravel'; // 自己替换

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

/**
 * 行政订票
 */
@connect(({ loading, userCenterTravel }) => ({
  // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  ...userCenterTravel, // 代表与该组件相关redux的model
}))
@mountToTab()
class UserCenterTravel extends React.PureComponent {
  /**
   * 页面内容加载之前要做的事情放在这里
   */
  // eslint-disable-next-line
  constructor(props) {
    super(props);
    // this.setState({});
  }

  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const { searchForm } = this.props;
    this.fetchData({ ...searchForm, offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchData = params => {
    const { dispatch } = this.props;

    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.buId, 'buId', 'buVersionId'),
      },
    });
  };

  deleteItem = (ids, queryParams) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/deleteRow`,
      payload: { ids, queryParams },
    });
  };

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数(任何this.state和connect中解构的this.props中监听的对象属性修改都会触发这个操作)
   * @return {React.ReactElement}
   */
  render() {
    const { dispatch, loading, searchForm, dataSource, total } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      scroll: { x: 1700 },
      loading,
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
          title: '出差单号',
          dataIndex: 'applyNo',
          options: {
            initialValue: searchForm.applyNo,
          },
          tag: <Input placeholder="查询出差单号" />,
        },
        {
          title: '出差申请人',
          dataIndex: 'applyResId',
          options: {
            initialValue: searchForm.applyResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder="请选择出差申请人"
              showSearch
            />
          ),
        },
        {
          title: '相关任务包',
          dataIndex: 'taskName',
          options: {
            initialValue: searchForm.taskName,
          },
          tag: <Input placeholder="查询相关任务包" />,
        },
        {
          title: '相关项目',
          dataIndex: 'projName',
          options: {
            initialValue: searchForm.projName,
          },
          tag: <Input placeholder="请输入相关项目" />,
        },
        {
          title: '费用承担BU',
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId,
          },
          tag: <BuVersion />,
        },
        {
          title: '客户',
          dataIndex: 'custName',
          options: {
            initialValue: searchForm.custName,
          },
          tag: <Input placeholder="请输入客户" />,
        },
        {
          title: '出发日期',
          dataIndex: 'beginDate',
          options: {
            initialValue: searchForm.beginDate,
          },
          tag: <DatePicker.RangePicker placeholder={['从', '至']} className="x-fill-100" />,
        },
        {
          title: '出差申请状态',
          dataIndex: 'applyStatus',
          options: {
            initialValue: searchForm.applyStatus,
          },
          tag: <Selection.UDC code="ACC.BUSITRIP_APPLY_STATUS" placeholder="请选择出差申请状态" />,
        },
        {
          title: '是否行政订票',
          dataIndex: 'bookTicketFlag',
          options: {
            initialValue: searchForm.bookTicketFlag,
          },
          tag: <Selection.UDC code="COM.YESNO" placeholder="请选择是否行政订票" />,
        },
      ],
      columns: [
        {
          title: '出差单号',
          dataIndex: 'applyNo',
          align: 'center',
          sorter: true,
          width: 130,
          render: (value, row, index) => (
            <Link className="tw-link" to={`/user/center/travel/detail?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '出差名称',
          dataIndex: 'applyName',
        },
        {
          title: '出差申请人',
          dataIndex: 'applyResName',
          align: 'center',
        },
        {
          title: '申请状态',
          dataIndex: 'applyStatusName',
          align: 'center',
        },
        {
          title: '流程状态',
          dataIndex: 'apprStatusName',
          align: 'center',
        },
        {
          title: '任务包',
          dataIndex: 'taskName',
          align: 'center',
        },
        {
          title: '项目名称',
          dataIndex: 'projName',
          align: 'center',
        },
        {
          title: '费用承担BU',
          dataIndex: 'buName',
          align: 'center',
        },
        {
          title: '客户',
          dataIndex: 'custName',
          align: 'center',
        },
        {
          title: '出发日期',
          dataIndex: 'beginDate',
          align: 'center',
          width: 130,
          render: createTime => formatDT(createTime),
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          align: 'center',
          sorter: true,
          width: 130,
          render: applyDate => formatDT(applyDate),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          title: '新增',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/user/center/travel/edit');
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '修改',
          loading: false,
          icon: 'form',
          hidden: false,
          // disabled: selectedRows => selectedRows[0] && selectedRows[0].applyStatus !== 'CREATE',
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id, applyStatus } = selectedRows[0];
            // 此处发送请求判断是否可编辑
            request
              .get(toUrl(editBtnStatus, { id }))
              .then(res => {
                const { response } = res;
                if (response.ok) {
                  if (applyStatus === 'APPROVED') {
                    router.push(
                      `/user/center/travel/edit?id=${selectedRowKeys}&isMy=1&sourceUrl=/user/center/myTravel&canEdit=part`
                    );
                  }
                  if (applyStatus === 'CREATE' || applyStatus === 'REJECTED') {
                    router.push(
                      `/user/center/travel/edit?id=${selectedRowKeys}&isMy=1&sourceUrl=/user/center/myTravel&canEdit=all`
                    );
                  }
                } else {
                  createMessage({
                    type: 'error',
                    description: response.reason || '当前出差单不可修改',
                  });
                }
              })
              .catch(err => {
                console.log(err);
              });
          },
        },
        {
          key: 'originate',
          className: 'tw-btn-primary',
          title: '发起报销',
          loading: false,
          icon: 'form',
          hidden: true,
          disabled: selectedRows => selectedRows[0] && selectedRows[0].applyStatus !== 'APPROVED',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // TODO:
            // router.push(`/user/expense/trip/create?id=${selectedRowKeys}`);
          },
        },
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          icon: 'delete',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows[0] && selectedRows.filter(item => item.applyStatus !== 'CREATE').length,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            Modal.confirm({
              title: '删除出差申请',
              content: '确定删除吗？',
              okText: '确认',
              cancelText: '取消',
              onOk: () => this.deleteItem(selectedRowKeys, queryParams),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="出差申请(资源)">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default UserCenterTravel;
