import React, { PureComponent } from 'react';
import Loading from '@/components/core/DataLoading';
import { connect } from 'dva';
import { Card, Switch, List } from 'antd';
import DataTable from '@/components/common/DataTable';

import {
  businessPageFieldTypePermission,
  businessPagePermissionDelete,
  businessPageTabChoose,
} from '@/services/sys/system/pageConfig';
import BusinessPagePermissionModal from './BusinessPagePermissionModal';

const DOMAIN = 'businessPageEdit';

@connect(({ loading, dispatch }) => ({
  dispatch,
}))
class FieldTypePermissionList extends PureComponent {
  state = {
    loading: true,
    data: [],
    businessPageBlockPermissionVisible: false,
  };

  async componentDidMount() {
    this.setState({ loading: true });
    const { fieldId, udcCode } = this.props;
    const { response } = await businessPageFieldTypePermission({ fieldId, udcCode });
    this.setState({ data: response, loading: false });
  }

  renderList = () => {
    const { data } = this.state;
    const permissions = <DataTable {...this.getPageButtonTableProps(data)} />;
    return permissions;
  };

  renderButtonExpandRow = record => {
    const list = [];
    if (record.permissionViews && record.permissionViews.length > 0) {
      record.permissionViews.forEach(permission => {
        const l = (
          <p key={permission.id} style={{ margin: 0 }}>
            {/* eslint-disable-next-line no-useless-concat */}
            {`${permission.allowTypeDesc}:${permission.allowValueDesc}` + '　　'}
            <a className="tw-link" onClick={() => this.deletePermission(permission.id)}>
              删除
            </a>
          </p>
        );
        list.push(l);
      });
    }

    return (
      <div>
        <p style={{ margin: 0, fontWeight: 'bold' }}>权限配置:</p>
        {list}
      </div>
    );
  };

  /**
   * 权限弹出框
   */
  showButtonPermissionModal = param => {
    const { dispatch, pageId } = this.props;
    dispatch({
      type: `businessPagePermissionModal/updateState`,
      payload: { formData: param, pageId },
    });
    this.setState({ businessPageBlockPermissionVisible: true });
  };

  handlePageConfirm = data => {
    this.setState({ businessPageBlockPermissionVisible: false });
    this.componentDidMount();
  };

  /**
   * 调用model层异步方法
   * @param method 方法名
   * @param params 方法参数
   */
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 删除权限
   * @param id
   */
  deletePermission = id => {
    businessPagePermissionDelete({ keys: id }).then(() => {
      this.componentDidMount();
    });
  };

  getPageButtonTableProps = dataSource => {
    const { fieldId, udcCode } = this.props;
    const { loading } = this.state;
    const expandRowKeys = dataSource
      .filter(data => data.permissionViews && data.permissionViews.length > 0)
      .map(data => data.id);
    return {
      rowKey: 'id',
      loading,
      dataSource,
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      expandedRowRender: record => this.renderButtonExpandRow(record),
      // defaultExpandAllRows: true,
      defaultExpandedRowKeys: expandRowKeys,
      columns: [
        {
          title: '编号',
          dataIndex: 'valueCode',
          align: 'center',
        },
        {
          title: '名称',
          dataIndex: 'valueDesc',
        },
        {
          title: '添加权限',
          dataIndex: 'permissionFlag',
          align: 'center',
          width: 200,
          render: (value, row, index) => (
            <a
              className="tw-link"
              onClick={() =>
                this.showButtonPermissionModal({
                  permissionType: 'FIELD_TYPE',
                  permissionId: fieldId,
                  remark: row.valueCode,
                  allowType: 'ROLE',
                  allowValue: undefined,
                })
              }
            >
              添加权限
            </a>
          ),
        },
        {
          title: '是否可选',
          dataIndex: 'pageTabChoose',
          align: 'center',
          width: 200,
          render: (value, row, index) => (
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              defaultChecked={value !== '0'}
              onChange={val => this.onChooseFlagChanged(val, row)}
            />
          ),
        },
      ],
    };
  };

  onChooseFlagChanged = (value, record) => {
    const { pageId, blockId, fieldKey, fieldId } = this.props;
    this.setState({ loading: true });
    businessPageTabChoose({
      pageId,
      blockId,
      fieldKey,
      fieldId,
      valueCode: record.valueCode,
    }).then(() => {
      this.componentDidMount();
    });
  };

  render() {
    const { loading, businessPageBlockPermissionVisible } = this.state;
    return (
      <Card bordered={false} style={{ padding: '0px' }}>
        {/* {loading ? <Loading /> : this.renderList()} */}
        {this.renderList()}
        <BusinessPagePermissionModal
          zIndex={1040}
          visible={businessPageBlockPermissionVisible}
          onCancel={() => this.setState({ businessPageBlockPermissionVisible: false })}
          onOk={this.handlePageConfirm}
        />
      </Card>
    );
  }
}

export default FieldTypePermissionList;
