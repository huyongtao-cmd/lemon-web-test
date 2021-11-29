import React from 'react';
import { connect } from 'dva';
import { Form, Input, Modal } from 'antd';
import router from 'umi/router';
import { isNil, isEmpty } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import { formatDTHM } from '@/utils/tempUtils/DateTime';
import { Selection, DatePicker } from '@/pages/gen/field';
import { createAlert } from '@/components/core/Confirm';
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import Link from 'umi/link';
import { selectIamUsers } from '@/services/gen/list';
import moment from 'moment';

const DOMAIN = 'platAddrList'; // 自己替换

const particularColumns = [{ dataIndex: 'name', title: '名称', span: 16 }];

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ loading, platAddrList }) => ({
  // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  ...platAddrList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { dispatch } = props;
      const { name, value } = Object.values(changedFields)[0];
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class AddrList extends React.PureComponent {
  /**
   * 页面内容加载之前要做的事情放在这里
   */
  // eslint-disable-next-line
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    this.fetchData();
  }

  // --------------- 剩下的私有函数写在这里 -----------------
  fetchData = (params = {}) => {
    const { dispatch } = this.props;
    const { syncTime, ...restParams } = params;
    if (Array.isArray(syncTime) && (syncTime[0] && syncTime[1])) {
      [restParams.syncTimeStart, restParams.syncTimeEnd] = syncTime;
    }
    dispatch({
      type: `${DOMAIN}/query`,
      payload: restParams,
    });
  };

  deleteItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/deleteRow`,
      payload: { id },
    }).then(({ success, status }) => {
      const { ok, reason } = success;
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (ok) {
        createAlert.success({
          content: '删除成功。',
        });
        this.fetchData();
      } else {
        createAlert.error({
          content: reason,
        });
      }
    });
  };

  changeStatus = abNos => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/changeSync`,
      payload: { abNos },
    }).then(({ success, errors, status }) => {
      this.setState({
        isLoading: false,
      });
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (success) {
        createAlert.success({
          content: '同步成功。',
        });
        this.fetchData();
      } else {
        createAlert.error({
          content: errors.msg,
        });
      }
    });
  };

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数(任何this.state和connect中解构的this.props中监听的对象属性修改都会触发这个操作)
   * @return {React.ReactElement}
   */

  render() {
    const { dispatch, loading, searchForm, dataSource, total } = this.props;
    const { isLoading } = this.state;
    const tableProps = {
      rowKey: 'abNo',
      sortBy: 'abNo',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
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
          title: '地址簿名称',
          dataIndex: 'abName',
          options: {
            initialValue: searchForm.abName,
          },
          tag: <Input placeholder="查询地址簿名称" />,
        },
        {
          title: '请输入编号',
          dataIndex: 'abNo',
          options: {
            initialValue: searchForm.abNo,
          },
          tag: <Input placeholder="请输入编号" />,
        },
        {
          title: '地址簿类型',
          dataIndex: 'abType',
          options: {
            initialValue: searchForm.abType,
          },
          tag: <Selection.UDC code="COM.AB_TYPE" placeholder="请选择地址簿类型" />,
        },
        {
          title: '唯一识别号',
          dataIndex: 'idenNo',
          options: {
            initialValue: searchForm.idenNo,
          },
          tag: <Input placeholder="唯一识别号" />,
        },
        {
          title: '相关主档',
          dataIndex: 'relateType',
          options: {
            initialValue: searchForm.relateType,
          },
          tag: <Selection.UDC code="TSK.AB_RELATE_TYPE" placeholder="请选择相关主档" />,
        },
        {
          title: '同步状态',
          dataIndex: 'syncStatus',
          options: {
            initialValue: searchForm.syncStatus,
          },
          tag: <Selection.UDC code="COM:SYNC_STATUS" placeholder="请选择同步状态" />,
        },
        {
          title: '同步时间',
          dataIndex: 'syncTime',
          options: {
            initialValue: searchForm.syncTime,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '创建人',
          dataIndex: 'createUserId',
          options: {
            initialValue: searchForm.createUserId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectIamUsers()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择创建人"
            />
          ),
        },
      ],
      columns: [
        {
          title: '编号',
          dataIndex: 'abNo',
          sorter: true,
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/plat/addr/view?no=${row.abNo}&id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '地址簿名称',
          dataIndex: 'abName',
        },
        {
          title: '唯一识别号',
          dataIndex: 'idenNo',
          align: 'center',
        },
        {
          title: '地址簿类型',
          dataIndex: 'abTypeName', // abType
          align: 'center',
        },
        {
          title: '相关主档',
          dataIndex: 'relateTypeName',
        },
        {
          title: '同步状态',
          dataIndex: 'syncStatusDesc',
          align: 'center',
        },
        {
          title: '最近同步时间',
          dataIndex: 'syncTime',
          align: 'center',
          render: syncTime => formatDTHM(syncTime),
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          align: 'center',
          render: createTime => formatDTHM(createTime),
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
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/plat/addr/edit');
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '修改',
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/plat/addr/edit?no=${selectedRowKeys}&id=${selectedRows[0].id}`);
          },
        },
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          icon: 'delete',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length < 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const tt = selectedRows.filter(v => v.syncStatus === 'SYNCED');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: `已经同步到用友中的信息，不允许删除！`,
              });
              return;
            }
            Modal.confirm({
              title: '删除地址簿',
              content: '确定删除该地址吗？',
              okText: '确认',
              cancelText: '取消',
              onOk: () => this.deleteItem(selectedRowKeys[0]), // 暂时不支持批量操作
            });
          },
        },
        {
          key: 'sync',
          title: '同步客商到用友',
          className: 'tw-btn-primary',
          icon: 'sync',
          loading: isLoading,
          hidden: false,
          disabled: selectedRows => selectedRows.length < 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const abNos = selectedRows.map(v => v.abNo).join(',');
            const tt = selectedRows.filter(v => v.syncStatus === 'SYNCED');
            const relateTypes = selectedRows.filter(
              v => v.relateType !== null && v.relateType.indexOf('03') !== -1
            );
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: `已同步的不允许再同步！`,
              });
              return;
            }
            if (!isEmpty(relateTypes)) {
              createMessage({
                type: 'warn',
                description: `仅能同步客商信息！`,
              });
              return;
            }

            Modal.confirm({
              title: '同步到用友',
              content: '即将同步记录到用友，同步成功后不允许再次同步，确定同步吗？',
              okText: '确认',
              cancelText: '取消',
              onOk: () => {
                this.setState({
                  isLoading: true,
                });
                return this.changeStatus(abNos);
              }, // 暂时不支持批量操作
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="地址列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default AddrList;
