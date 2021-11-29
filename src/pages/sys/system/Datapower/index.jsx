import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import Bind from 'lodash-decorators/bind';
import Debounce from 'lodash-decorators/debounce';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DatapowerCreateModal from './DatapowerCreateModal';
import DataTable from '@/components/common/DataTable';
import { createConfirm } from '@/components/core/Confirm';
import { TagOpt } from '@/utils/tempUtils';

const DOMAIN = 'sysSystemDatapower';

@connect(({ loading, sysSystemDatapower }) => ({
  sysSystemDatapower,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key, value: value.value },
      });
    }
  },
})
class Datapower extends PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {
    // { sortBy: 'roleName', sortDirection: 'DESC' }
    this.fetchData({ sortBy: 'sourceName', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  // 切换弹出窗。
  toggleModal = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  // 角色数据权限保存按钮事件
  @Bind()
  @Debounce(400)
  handleSave(e, payload) {
    const {
      dispatch,
      sysSystemDatapower: { searchForm },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/add`,
      payload: { formData: payload, queryParams: searchForm },
    });
    this.toggleModal();
  }

  render() {
    const {
      dispatch,
      sysSystemDatapower: { dataSource, total },
    } = this.props;
    const { visible } = this.state;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
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
          title: '角色', // TODO: 国际化
          dataIndex: 'roleKeyWord',
          tag: <Input placeholder="请输入角色编号/名称" />,
        },
        {
          title: '功能', // TODO: 国际化
          dataIndex: 'sourceKeyWord',
          tag: <Input placeholder="请输入功能名称/表" />,
        },
      ],
      columns: [
        {
          title: '角色名称', // TODO: 国际化
          dataIndex: 'roleName',
          sorter: true,
          align: 'center',
          defaultSortOrder: 'descend',
        },
        {
          title: '角色编号', // TODO: 国际化
          dataIndex: 'roleCode',
        },
        {
          title: '功能名称', // TODO: 国际化
          dataIndex: 'sourceName',
          align: 'center',
        },
        {
          title: '功能列表', // TODO: 国际化
          dataIndex: 'sourceKey',
          align: 'center',
        },
        {
          title: '权限类型', // TODO: 国际化
          dataIndex: 'sourceType',
          align: 'center',
        },
        {
          title: '状态', // TODO: 国际化
          dataIndex: 'sourceStatus',
          align: 'center',
          render: (value, rows) => (
            <TagOpt
              value={+(rows.sourceStatus === '1')}
              opts={[{ code: 0, name: '启用' }, { code: 1, name: '禁用' }]}
              palette="green|red"
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'datapower',
          className: 'tw-btn-primary',
          //   icon: 'plus-circle',
          title: formatMessage({ id: `misc.role.datapower`, desc: '角色数据权限' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push(
              `/sys/powerMgmt/datapower/detail?id=${selectedRowKeys}&roleCode=${
                selectedRows[0].roleCode
              }&roleName=${selectedRows[0].roleName}`
            ),
        },
        {
          key: 'clean',
          className: 'tw-btn-info',
          // icon: 'clean',
          title: formatMessage({ id: `misc.clean.datapower`, desc: '清除权限缓存' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认清除所有权限缓存？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/cleanDatapower`,
                  payload: { queryParams },
                }),
            });
          },
        },
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({ visible: true });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除该角色所有权限配置？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: { roleCode: selectedRows[0].roleCode, queryParams },
                }),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} />
        <DatapowerCreateModal
          visible={visible}
          handleCancel={this.toggleModal}
          handleOk={this.handleSave}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Datapower;
