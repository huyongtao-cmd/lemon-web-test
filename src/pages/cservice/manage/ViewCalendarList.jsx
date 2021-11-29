import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Input, DatePicker } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { formatMessage } from 'umi/locale';
import { selectIamUsers } from '@/services/gen/list';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { isNil } from 'ramda';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'viewCalendarList';
const { RangePicker } = DatePicker;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 16 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
@connect(({ loading, viewCalendarList }) => ({
  viewCalendarList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class ViewCalendarList extends PureComponent {
  componentDidMount() {
    const { configId } = fromQs();
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm`, payload: {} }); // 进来选初始化搜索条件，再查询
    dispatch({ type: `${DOMAIN}/query`, payload: { id: isNil(configId) ? '' : configId } });
  }

  fetchData = params => {
    const { configId } = fromQs();
    const { dispatch } = this.props;
    const id = configId;
    dispatch({ type: `${DOMAIN}/query`, payload: { id, ...params } });
  };

  render() {
    const { configId } = fromQs();
    const {
      loading,
      dispatch,
      viewCalendarList: { list = [], total = 0, searchForm },
    } = this.props;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: {},
      loading,
      total,
      dataSource: list,
      enableSelection: true,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '事项ID',
          dataIndex: 'configId',
          options: {
            initialValue: configId,
          },
          // tag: <Input style={{ display:  'none' }} disabled />,
          tag: <Input disabled />,
        },
      ],
      columns: [
        {
          title: '事项编号',
          dataIndex: 'eventNo',
          align: 'center',
        },
        {
          title: '事项名称',
          dataIndex: 'eventName',
          align: 'center',
        },
        {
          title: '客户',
          dataIndex: 'custName',
          align: 'center',
        },
        {
          title: '责任人',
          align: 'center',
          dataIndex: 'mainPersonName',
        },
        {
          title: '运维时间',
          align: 'center',
          dataIndex: 'maintainDate',
        },
        {
          title: '备注',
          align: 'center',
          dataIndex: 'remark',
        },
        {
          title: '状态',
          align: 'center',
          dataIndex: 'statusDesc',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: loading || false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/cservice/manage/viewCalendarListDetail?mode=create&configId=${configId}`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            router.push(
              `/cservice/manage/viewCalendarListDetail?mode=edit&listId=${id}&configId=${configId}`
            );
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            let errorFlag = false;
            selectedRows.forEach(item => {
              if (item.status === 'PROCESSING' || item.status === 'FINISHED') {
                errorFlag = true;
              }
            });
            if (errorFlag) {
              createMessage({ type: 'error', description: '处理中、已处理的数据不能删除，请检查' });
            } else {
              dispatch({
                type: `${DOMAIN}/delete`,
                payload: { ids: selectedRowKeys.join(',') },
              });
            }
          },
        },
        {
          key: 'feedback',
          icon: 'form',
          className: 'tw-btn-primary',
          title: '反馈',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            router.push(`/cservice/manage/feedBack?detailId=${id}&configId=${configId}`);
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="运维日历循环事项查询">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default ViewCalendarList;
