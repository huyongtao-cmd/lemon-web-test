import React from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Select } from 'antd';
import router from 'umi/router';

import { mountToTab } from '@/layouts/routerControl';
import { formatDTHM } from '@/utils/tempUtils/DateTime';
import { Selection } from '@/pages/gen/field';
import { createAlert } from '@/components/core/Confirm';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import Link from 'umi/link';

const DOMAIN = 'platAddrSup'; // 自己替换

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ loading, platAddrSup }) => ({
  ...platAddrSup,
  loading: loading.effects[`${DOMAIN}/querySup`] || loading.effects[`${DOMAIN}/deleteRow`],
}))
@mountToTab()
class AddList extends React.PureComponent {
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
    this.fetchData();
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchData = params => {
    const { dispatch } = this.props;

    dispatch({
      // type: `${DOMAIN}/query`,
      type: `${DOMAIN}/querySup`,
      payload: params,
    });
  };

  deleteItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/deleteRow`,
      payload: { id },
    }).then(({ success, status }) => {
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (success) {
        createAlert.success({
          content: '删除成功。',
        });
        this.fetchData();
      } else {
        createAlert.error({
          content: '删除失败。',
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

    const tableProps = {
      rowKey: 'abNo',
      sortBy: 'abNo',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading,
      total,
      scroll: { x: '120%' },
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
          title: '供应商名称',
          dataIndex: 'abName',
          options: {
            initialValue: searchForm.abName,
          },
          tag: <Input placeholder="查询供应商名称" />,
        },
        {
          title: '编号',
          dataIndex: 'abNo',
          options: {
            initialValue: searchForm.abNo,
          },
          tag: <Input placeholder="请输入编号" />,
        },
        {
          title: '供应商类型',
          dataIndex: 'abType',
          options: {
            initialValue: searchForm.abType,
          },
          tag: <Selection.UDC code="COM.AB_TYPE" placeholder="请选择供应商类型" />,
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
      ],
      columns: [
        {
          title: '编号',
          dataIndex: 'abNo',
          sorter: true,
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/plat/addr/sup/view?no=${row.abNo}&id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '供应商名称',
          dataIndex: 'abName',
        },
        {
          title: '唯一识别号',
          dataIndex: 'idenNo',
          align: 'center',
        },
        {
          title: '供应商类型',
          dataIndex: 'abTypeName', // abType
          align: 'center',
        },
        {
          title: '相关主档',
          dataIndex: 'relateTypeName',
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
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/plat/addr/sup/edit');
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '修改',
          icon: 'form',
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/plat/addr/sup/edit?no=${selectedRowKeys}&id=${selectedRows[0].id}`);
          },
        },
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          icon: 'delete',
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            Modal.confirm({
              title: '删除地址簿',
              content: '确定删除该地址吗？',
              okText: '确认',
              cancelText: '取消',
              onOk: () => this.deleteItem(selectedRowKeys[0]), // 暂时不支持批量操作
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

export default AddList;
