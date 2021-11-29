import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import { Button, Card, Form, Input, Select } from 'antd';
import classnames from 'classnames';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import DataTable from '@/components/common/DataTable';
import { TagOpt } from '@/utils/tempUtils';
import CreateModal from './CreateModal';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'sysSystemDatapowerDetail';

// 角色数据权限明细初始化
const defaultFormData = {
  id: null,
  dataPowerRuleId: null, // 功能表
  roleCode: null, // 角色编号
  strategy: null, // 权限控制策略
  docStatus: 0, // 状态：默认0表示启用
};

@connect(({ loading, sysSystemDatapowerDetail, dispatch }) => ({
  loading,
  sysSystemDatapowerDetail,
  dispatch,
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
@mountToTab()
class DatapowerDetail extends PureComponent {
  state = {
    datapowerVisible: false,
    datapowerFormData: {
      ...defaultFormData,
    },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'id', sortDirection: 'ASC', limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { roleCode } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { roleCode, ...params },
    });
  };

  // 行编辑保存
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      sysSystemDatapowerDetail: { dataSource },
      dispatch,
    } = this.props;

    const { id } = dataSource[rowIndex];
    const value =
      rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    if (rowField === 'strategy') {
      dispatch({
        type: `${DOMAIN}/updateStrategy`,
        payload: { id, strategy: value },
      });
    }
  };

  // 角色数据权限新增弹出窗。
  datapowerToggleModal = () => {
    const { dispatch } = this.props;
    const { datapowerVisible } = this.state;
    const { roleCode } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    this.setState({
      datapowerVisible: !datapowerVisible,
      datapowerFormData: {
        ...defaultFormData,
        roleCode,
      },
    });
  };

  // 角色数据权限保存按钮事件
  @Bind()
  @Debounce(400)
  datapowerSubmitModal() {
    const { datapowerVisible, datapowerFormData } = this.state;
    const { dispatch } = this.props;

    dispatch({
      type: `${DOMAIN}/datapowerCreate`,
      payload: { datapowerFormData: { ...datapowerFormData } },
    }).then(reason => {
      if (!reason) {
        return;
      }
      this.setState({
        datapowerVisible: !datapowerVisible,
        datapowerFormData,
      });
      this.fetchData();
    });
  }

  render() {
    const {
      dispatch,
      loading,
      sysSystemDatapowerDetail: { dataSource, total, searchForm = {} },
      form: { getFieldDecorator },
    } = this.props;
    const { datapowerFormData, datapowerVisible } = this.state;
    const { id, roleCode, roleName } = fromQs();

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      total,
      dataSource,
      scroll: { x: 3430 },
      // showSearch: false,
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
          title: '输入功能名称/列表',
          dataIndex: 'sourceKeyWord',
          formItemLayout: {
            labelCol: { span: 10 },
            wrapperCol: { span: 14 },
          },
          options: {
            initialValue: searchForm.sourceKeyWord,
          },
        },
      ],
      columns: [
        {
          title: '权限配置', // TODO: 国际化
          dataIndex: 'strategy',
          align: 'center',
          width: 140,
          fixed: 'left',
          render: (value, row, index) => (
            <Select
              name="strategy"
              defaultValue={value}
              allowClear
              style={{ width: 140 }}
              onChange={this.onCellChanged(index, 'strategy')}
            >
              <Select.Option value="RES">本人权限</Select.Option>
              <Select.Option value="RESSUB">本人及下属权限</Select.Option>
              <Select.Option value="BU">本BU权限</Select.Option>
              <Select.Option value="BUSUB">本BU及下级BU</Select.Option>
              <Select.Option value="PLAT">平台级权限</Select.Option>
            </Select>
          ),
        },
        {
          title: '权限配置ID', // TODO: 国际化
          dataIndex: 'id',
          align: 'center',
          width: 200,
        },
        {
          title: '功能名称(表名称)', // TODO: 国际化
          dataIndex: 'sourceName',
          align: 'center',
          width: 300,
        },
        {
          title: '功能列表(数据表)', // TODO: 国际化
          dataIndex: 'sourceKey',
          align: 'center',
          width: 400,
        },
        {
          title: '状态', // TODO: 国际化
          dataIndex: 'sourceStatus',
          align: 'center',
          width: 100,
          render: (value, rows) => (
            <TagOpt
              value={+(rows.sourceStatus === '1')}
              opts={[{ code: 0, name: '启用' }, { code: 1, name: '禁用' }]}
              palette="green|red"
            />
          ),
        },
        {
          title: '资源字段1', // TODO: 国际化
          dataIndex: 'col1',
          width: 100,
        },
        {
          title: '资源字段2', // TODO: 国际化
          dataIndex: 'col2',
          width: 100,
        },
        {
          title: '资源字段3', // TODO: 国际化
          dataIndex: 'col3',
          width: 100,
        },
        {
          title: '资源字段4', // TODO: 国际化
          dataIndex: 'col4',
          width: 100,
        },
        {
          title: '资源字段5', // TODO: 国际化
          dataIndex: 'col5',
          width: 100,
        },
        {
          title: '资源字段6', // TODO: 国际化
          dataIndex: 'col6',
          width: 100,
        },
        {
          title: '资源字段7', // TODO: 国际化
          dataIndex: 'col7',
          width: 100,
        },
        {
          title: '资源字段8', // TODO: 国际化
          dataIndex: 'col8',
          width: 100,
        },
        {
          title: '资源字段9', // TODO: 国际化
          dataIndex: 'col9',
          width: 100,
        },
        {
          title: '资源字段10', // TODO: 国际化
          dataIndex: 'col10',
          width: 100,
        },
        {
          title: 'BU字段1', // TODO: 国际化
          dataIndex: 'buCol1',
          width: 100,
        },
        {
          title: 'BU字段2', // TODO: 国际化
          dataIndex: 'buCol2',
          width: 100,
        },
        {
          title: 'BU字段3', // TODO: 国际化
          dataIndex: 'buCol3',
          width: 100,
        },
        {
          title: 'BU字段4', // TODO: 国际化
          dataIndex: 'buCol4',
          width: 100,
        },
        {
          title: 'BU字段5', // TODO: 国际化
          dataIndex: 'buCol5',
          width: 100,
        },
        {
          title: 'BU字段6', // TODO: 国际化
          dataIndex: 'buCol6',
          width: 100,
        },
        {
          title: 'BU字段7', // TODO: 国际化
          dataIndex: 'buCol7',
          width: 100,
        },
        {
          title: 'BU字段8', // TODO: 国际化
          dataIndex: 'buCol8',
          width: 100,
        },
        {
          title: 'BU字段9', // TODO: 国际化
          dataIndex: 'buCol9',
          width: 100,
        },
        {
          title: 'BU字段10', // TODO: 国际化
          dataIndex: 'buCol10',
          width: 100,
        },
        {
          title: '资源权限-拼接SQL', // TODO: 国际化
          dataIndex: 'dpResSql',
          width: 150,
        },
        {
          title: 'BU权限-拼接SQL', // TODO: 国际化
          dataIndex: 'dpBuSql',
          width: 150,
        },
        {
          title: '独立执行-SQL语句', // TODO: 国际化
          dataIndex: 'sourceSql',
          width: 150,
        },
        {
          title: '更新时间', // TODO: 国际化
          dataIndex: 'modifyTime',
          width: 100,
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.datapowerToggleModal(),
        },
        {
          key: 'start',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.start.use`, desc: '启用' }),
          loading: false,
          hidden: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认停用所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/updateStatus`,
                  payload: { id: selectedRowKeys[0], docStatus: 0, queryParams },
                }),
            });
          },
        },
        {
          key: 'stop',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.stop.use`, desc: '停用' }),
          loading: false,
          hidden: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认停用所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/updateStatus`,
                  payload: { id: selectedRowKeys[0], docStatus: 1, queryParams },
                }),
            });
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
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: {
                    ids: selectedRowKeys,
                    queryParams: {
                      roleCode: fromQs().roleCode,
                      ...queryParams,
                    },
                  },
                }),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/sys/powerMgmt/datapower')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card className="tw-card-adjust" title="角色信息" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="roleCode"
              label="角色编号"
              decorator={{
                initialValue: roleCode,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="roleName"
              label="角色名称"
              decorator={{
                initialValue: roleName,
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
        </Card>

        <Card className="tw-card-adjust" title="数据权限配置" bordered={false}>
          <DataTable {...tableProps} scroll={{ x: 1600 }} />
        </Card>
        <CreateModal
          datapowerFormData={datapowerFormData}
          visible={datapowerVisible}
          handleCancel={this.datapowerToggleModal}
          handleOk={this.datapowerSubmitModal}
        />
      </PageHeaderWrapper>
    );
  }
}

export default DatapowerDetail;
