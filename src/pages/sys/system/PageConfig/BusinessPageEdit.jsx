// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import {
  Button,
  Card,
  Input,
  Select,
  Form,
  InputNumber,
  Tooltip,
  Checkbox,
  TreeSelect,
  Switch,
  Popover,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import RichText from '@/components/common/RichText';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import router from 'umi/router';
import DescriptionList from '@/components/layout/DescriptionList';
import Loading from '@/components/core/DataLoading';
import DataTable from '@/components/common/DataTable';
import BusinessPageBlockModal from './BusinessPageBlockModal';
import BusinessPageMainModal from './BusinessPageMainModal';
import BusinessPageButtonModal from './BusinessPageButtonModal';
import BusinessPageTabModal from './BusinessPageTabModal';
import BusinessPagePermissionModal from './BusinessPagePermissionModal';
import FieldTypePermission from './FieldTypePermission';
import FieldTypePermissionList from './FieldTypePermissionList';

import { businessPageFieldTypePermission } from '@/services/sys/system/pageConfig';

const { Description } = DescriptionList;
const { Option } = Select;
const { Field, FieldLine } = FieldList;

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'businessPageEdit';

@connect(({ loading, businessPageEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  ...businessPageEdit,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };
    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class BusinessPageEdit extends PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch, formData } = this.props;
    const param = fromQs();
    if (param.id) {
      // 编辑模式
      this.callModelEffects('query', { id: param.id });
    } else {
      // 新增模式
      dispatch({
        type: `${DOMAIN}/clearForm`,
      });
    }
  }

  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
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

  getFieldTypePermission = (fieldId, fieldKey, blockId, udcCode) => {
    const key = 'FieldTypePermissionLoad_' + fieldId;
    const param = fromQs();
    // eslint-disable-next-line react/destructuring-assignment
    const load = this.state[key];
    return (
      <FieldTypePermission
        load={load}
        content={
          <FieldTypePermissionList
            blockId={blockId}
            pageId={param.id}
            fieldKey={fieldKey}
            fieldId={fieldId}
            udcCode={udcCode}
          />
        }
      />
    );
  };

  getPageBlockTableProps = dataSource => {
    const { loading } = this.props;
    return {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      dataSource,
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      columns: [
        {
          title: '字段名称',
          dataIndex: 'fieldName',
          align: 'center',
        },
        {
          title: '字段备注',
          dataIndex: 'fieldDesc',
        },
        {
          title: '字段类型',
          dataIndex: 'fieldTypeDesc',
          align: 'center',
        },
        {
          title: '类型码',
          dataIndex: 'udcCode',
          align: 'center',
          render: (value, row, index) => {
            if (row.fieldType === 'UDC') {
              const { udcCode } = row;
              const content = this.getFieldTypePermission(row.id, row.fieldKey, row.pageId, value);
              return (
                <Popover
                  content={content}
                  title="类别码定义"
                  trigger="hover"
                  onVisibleChange={e => {
                    if (e) {
                      const key = 'FieldTypePermissionLoad_' + row.id;
                      this.setState({ [key]: true });
                    }
                  }}
                >
                  <a className="tw-link">{udcCode}</a>
                </Popover>
              );
            }
            return value;
          },
        },
        {
          title: '业务类型',
          dataIndex: 'businessType',
          align: 'center',
        },
        {
          title: '是否显示',
          dataIndex: 'visibleFlag',
          align: 'center',
          render: (value, row, index) => (value === 1 ? '是' : '否'),
        },
        {
          title: '显示名称',
          dataIndex: 'displayName',
          align: 'center',
        },
        {
          title: '显示模式',
          dataIndex: 'fieldModeDesc',
          align: 'center',
          width: 120,
        },
        {
          title: '是否必填',
          dataIndex: 'requiredFlag',
          align: 'center',
          render: (value, row, index) => (value === 1 ? '是' : '否'),
        },
        {
          title: '默认值',
          dataIndex: 'fieldDefaultValue',
          align: 'center',
          width: 100,
        },
        {
          title: '排序号',
          dataIndex: 'sortNo',
          align: 'center',
          width: 50,
        },
        {
          title: '字段KEY',
          dataIndex: 'fieldKey',
          align: 'center',
          width: 150,
        },
        {
          title: '字段组',
          dataIndex: 'fieldGroup',
          align: 'center',
          width: 50,
        },
      ],
    };
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
   * 删除权限
   * @param id
   */
  deletePermission = id => {
    this.callModelEffects('deletePermission', { keys: id });
  };

  getPageButtonTableProps = dataSource => {
    const { loading } = this.props;
    const expandRowKeys = dataSource
      .filter(data => data.permissionViews && data.permissionViews.length > 0)
      .map(data => data.id);
    return {
      rowKey: 'id',
      columnsCache: DOMAIN,
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
          title: '按钮名称',
          dataIndex: 'buttonName',
          align: 'center',
        },
        {
          title: '按钮KEY',
          dataIndex: 'buttonKey',
        },
        {
          title: '图标',
          dataIndex: 'buttonIcon',
          align: 'center',
        },
        {
          title: '是否显示',
          dataIndex: 'visibleFlag',
          align: 'center',
          render: (value, row, index) => (value === 1 ? '是' : '否'),
        },
        {
          title: '按钮组',
          dataIndex: 'buttonGroup',
          align: 'center',
        },
        {
          title: '按钮样式',
          dataIndex: 'buttonStyle',
          align: 'center',
          width: 120,
        },
        {
          title: '排序号',
          dataIndex: 'sortNo',
          align: 'center',
          width: 50,
        },
        {
          title: '前置事件',
          dataIndex: 'beforeEvent',
          align: 'center',
          width: 200,
        },
        {
          title: '后置事件',
          dataIndex: 'afterEvent',
          align: 'center',
          width: 200,
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
                  permissionType: 'BUTTON',
                  permissionId: row.id,
                  allowType: 'ROLE',
                  allowValue: undefined,
                })
              }
            >
              添加权限
            </a>
          ),
        },
      ],
    };
  };

  getPageTabProps = dataSource => {
    const { loading } = this.props;
    const expandRowKeys = dataSource
      .filter(data => data.permissionViews && data.permissionViews.length > 0)
      .map(data => data.id);
    return {
      rowKey: 'id',
      columnsCache: DOMAIN,
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
          title: '标签页名称',
          dataIndex: 'tabName',
          align: 'center',
        },
        {
          title: '标签页KEY',
          dataIndex: 'tabKey',
        },
        {
          title: '是否显示',
          dataIndex: 'visibleFlag',
          align: 'center',
          render: (value, row, index) => (value === 1 ? '是' : '否'),
        },
        // {
        //   title: '排序号',
        //   dataIndex: 'sortNo',
        //   align: 'center',
        //   width: 50,
        // },
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
                  permissionType: 'TAB',
                  permissionId: row.id,
                  allowType: 'ROLE',
                  allowValue: undefined,
                })
              }
            >
              添加权限
            </a>
          ),
        },
      ],
    };
  };

  /**
   * 标签页弹出框
   */
  showUpdatePageTabModal = () => {
    const { dispatch, pageTabEntities } = this.props;
    const param = fromQs();
    dispatch({
      type: `businessPageTabModal/updateState`,
      payload: {
        pageId: param.id,
        dataSource: pageTabEntities,
      },
    });
    this.updateModelState({ businessPageTabVisible: true });
  };

  /**
   * 按钮弹出框
   */
  showUpdatePageButtonModal = () => {
    const { dispatch, pageButtonEntities } = this.props;
    const param = fromQs();
    dispatch({
      type: `businessPageButtonModal/updateState`,
      payload: {
        pageId: param.id,
        dataSource: pageButtonEntities,
      },
    });
    this.updateModelState({ businessPageBlockButtonVisible: true });
  };

  showUpdatePageBlockModal = pageBlockId => {
    const { dispatch, pageBlockEntities } = this.props;
    const pageBlockModalData = pageBlockEntities.filter(
      pageBlockEntity => pageBlockEntity.id === pageBlockId
    )[0];
    dispatch({
      type: `businessPageBlockModal/updateState`,
      payload: {
        formData: pageBlockModalData,
        pageFieldEntities: pageBlockModalData.pageFieldViews,
      },
    });
    this.updateModelState({ businessPageBlockModalVisible: true });
  };

  showUpdatePageMainModal = () => {
    const { dispatch, formData } = this.props;
    dispatch({
      type: `businessPageMainModal/updateState`,
      payload: { formData },
    });
    this.updateModelState({ businessPageMainModalVisible: true });
  };

  /**
   * 权限弹出框
   */
  showButtonPermissionModal = param => {
    const { dispatch } = this.props;
    const params = fromQs();
    dispatch({
      type: `businessPagePermissionModal/updateState`,
      payload: { formData: param, pageId: params.id },
    });
    this.updateModelState({ businessPageBlockPermissionVisible: true });
  };

  /**
   * 渲染每个页面区域
   * @param pageBlock
   * @returns {*}
   */
  renderPageBlock = pageBlock => (
    <Card
      className="tw-card-adjust"
      title={`页面区域【${pageBlock.blockPageName}】`}
      key={pageBlock.id}
      extra={
        <a
          onClick={() => {
            this.showUpdatePageBlockModal(pageBlock.id);
          }}
        >
          修改
        </a>
      }
    >
      <DescriptionList>
        <Description term="区域KEY">{pageBlock.blockKey}</Description>
        <Description term="区域名称">{pageBlock.blockPageName}</Description>
        <Description term="关联表">{`${pageBlock.tableDesc}(${pageBlock.tableName})`}</Description>
        <Description term="区域类型">{`${pageBlock.blockPageTypeDesc}`}</Description>
        <Description term="排序号">{`${pageBlock.sortNo}`}</Description>
        {/* <Description term="允许导出">{`${pageBlock.allowExportFlag ? '是' : '否'}`}</Description> */}
      </DescriptionList>
      <DataTable {...this.getPageBlockTableProps(pageBlock.pageFieldViews)} />
    </Card>
  );

  /**
   * 页面区域确定按钮点击
   * @param data 页面区域 数据
   */
  handlePageConfirm = data => {
    const param = fromQs();
    this.updateModelState({
      businessPageBlockModalVisible: false,
      businessPageMainModalVisible: false,
      businessPageBlockButtonVisible: false,
      businessPageBlockPermissionVisible: false,
      businessPageTabVisible: false,
    });
    this.callModelEffects('query', { id: param.id });
  };

  render() {
    const {
      loading,
      formData,
      pageBlockEntities,
      pageButtonEntities,
      pageTabEntities,
      businessPageBlockModalVisible,
      businessPageMainModalVisible,
      businessPageBlockButtonVisible,
      businessPageTabVisible,
      businessPageBlockPermissionVisible,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;

    return (
      <PageHeaderWrapper>
        {formData.id ? (
          <>
            <Card className="tw-card-rightLine">
              <Button
                className="tw-btn-primary"
                type="primary"
                size="large"
                loading={loading}
                onClick={() => {
                  const { dispatch } = this.props;
                  dispatch({
                    type: `businessPageBlockModal/updateState`,
                    payload: { formData: { pageId: formData.id }, pageFieldEntities: [] },
                  });
                  this.updateModelState({ businessPageBlockModalVisible: true });
                }}
              >
                添加页面区域
              </Button>
              <Button
                className="tw-btn-primary"
                type="primary"
                size="large"
                loading={loading}
                onClick={() => {
                  const { id } = fromQs();
                  router.push(`/sys/system/businessSceneManage?id=${id}`);
                }}
              >
                场景管理
              </Button>
            </Card>
            <Card
              title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
              bordered={false}
              className="tw-card-adjust"
              extra={
                <a
                  onClick={() => {
                    this.showUpdatePageMainModal();
                  }}
                >
                  修改
                </a>
              }
            >
              <DescriptionList>
                <Description term="页面编号">{formData.pageNo}</Description>
                <Description term="页面名称">{formData.pageName}</Description>
                <Description term="备注">{formData.remark}</Description>
              </DescriptionList>
            </Card>
            <Card
              className="tw-card-adjust"
              title="标签页信息"
              extra={
                <a
                  onClick={() => {
                    this.showUpdatePageTabModal();
                  }}
                >
                  修改
                </a>
              }
            >
              <DataTable {...this.getPageTabProps(pageTabEntities)} />
            </Card>
            <Card
              className="tw-card-adjust"
              title="按钮信息"
              extra={
                <a
                  onClick={() => {
                    this.showUpdatePageButtonModal();
                  }}
                >
                  修改
                </a>
              }
            >
              <DataTable {...this.getPageButtonTableProps(pageButtonEntities)} />
            </Card>
            {pageBlockEntities &&
              pageBlockEntities.map(pageBlockEntity => this.renderPageBlock(pageBlockEntity))}
          </>
        ) : (
          <Loading />
        )}

        <BusinessPageBlockModal
          visible={businessPageBlockModalVisible}
          onCancel={() => this.updateModelState({ businessPageBlockModalVisible: false })}
          onOk={this.handlePageConfirm}
        />
        <BusinessPageMainModal
          visible={businessPageMainModalVisible}
          onCancel={() => this.updateModelState({ businessPageMainModalVisible: false })}
          onOk={this.handlePageConfirm}
        />
        <BusinessPageButtonModal
          visible={businessPageBlockButtonVisible}
          onCancel={() => this.updateModelState({ businessPageBlockButtonVisible: false })}
          onOk={this.handlePageConfirm}
        />
        <BusinessPageTabModal
          visible={businessPageTabVisible}
          onCancel={() => this.updateModelState({ businessPageTabVisible: false })}
          onOk={this.handlePageConfirm}
        />
        <BusinessPagePermissionModal
          visible={businessPageBlockPermissionVisible}
          onCancel={() => this.updateModelState({ businessPageBlockPermissionVisible: false })}
          onOk={this.handlePageConfirm}
        />
      </PageHeaderWrapper>
    );
  }
}

export default BusinessPageEdit;
