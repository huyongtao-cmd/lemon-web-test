import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Divider, Radio, Switch } from 'antd';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto, markAsTab, markAsNoTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { stringify } from 'qs';
import { getUrl } from '@/utils/flowToRouter';
import createMessage from '@/components/core/AlertMessage';
import CatCode from './component/CatCode';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'categoryCodeMgmt';

@connect(({ loading, dispatch, categoryCodeMgmt }) => ({
  loading,
  dispatch,
  categoryCodeMgmt,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class CategoryCodeMgmtEdit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    }).then(res => {
      // 类别码定义详情
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: { id },
      }).then(response => {
        dispatch({
          type: `${DOMAIN}/catCodeDetailTabField`,
          payload: { tabName: response.tabName },
        });
      });
      // 类别码明细列表
      dispatch({
        type: `${DOMAIN}/catCodeDetailDetails`,
        payload: { id },
      });
      // 获取页面配置信息
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'CATEGORY_SAVE' },
      });
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      categoryCodeMgmt: { searchForm, formData, catCodeList },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const tt = catCodeList.filter(v => !v.showName);
        if (tt.length) {
          createMessage({ type: 'warn', description: '请补全类别码明细必填项！' });
          return;
        }
        dispatch({
          type: `${DOMAIN}/save`,
          payload: formData,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto('/plat/market/categoryCodeMgmt?_refresh=0');
            dispatch({ type: `${DOMAIN}/query`, payload: searchForm });
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  onCellChanged = (index, value, name) => {
    const {
      categoryCodeMgmt: { catCodeList },
      dispatch,
    } = this.props;

    const newDataSource = catCodeList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { catCodeList: newDataSource },
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      categoryCodeMgmt: {
        formData,
        pageConfig: { pageBlockViews = [] },
      },
      form: { getFieldDecorator },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '类别码明细新增表单');
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { catNo = {}, catName = {}, tabName = {}, remark = {} } = pageFieldJson;
      const fields = [
        <Field
          name="catNo"
          label={catNo.displayName}
          key="catNo"
          decorator={{
            initialValue: formData.catNo || '',
            rules: [{ required: catNo.requiredFlag, message: '必填' }],
          }}
          sortNo={catNo.sortNo}
        >
          <Input
            disabled={catNo.fieldMode === 'UNEDITABLE'}
            placeholder={`请输入${catNo.displayName}`}
          />
        </Field>,
        <Field
          name="catName"
          key="catName"
          label={catName.displayName}
          decorator={{
            initialValue: formData.catName || '',
            rules: [{ required: catName.requiredFlag, message: '必填' }],
          }}
        >
          <Input
            disabled={catName.fieldMode === 'UNEDITABLE'}
            placeholder={`请输入${catName.displayName}`}
          />
        </Field>,
        <Field
          name="tabName"
          key="tabName"
          label={tabName.displayName}
          decorator={{
            initialValue: formData.tabName || '',
            rules: [{ required: tabName.requiredFlag, message: '必填' }],
          }}
        >
          <Input
            disabled={tabName.fieldMode === 'UNEDITABLE'}
            placeholder={`请输入${tabName.displayName}`}
          />
        </Field>,
        <Field
          name="remark"
          key="remark"
          label={remark.displayName}
          decorator={{
            initialValue: formData.remark || '',
            rules: [{ required: remark.requiredFlag, message: '必填' }],
          }}
          fieldCol={1}
          labelCol={{ span: 4, xxl: 3 }}
          wrapperCol={{ span: 19, xxl: 20 }}
        >
          <Input.TextArea
            disabled={remark.fieldMode === 'UNEDITABLE'}
            rows={3}
            placeholder={`请输入${remark.displayName}`}
          />
        </Field>,
      ];

      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          {filterList}
        </FieldList>
      );
    }

    return '';
  };

  render() {
    const {
      loading,
      form,
      dispatch,
      categoryCodeMgmt: {
        formData,
        catCodeList,
        pageConfig: { pageBlockViews = [] },
      },
      form: { getFieldDecorator, setFieldsValue, getFieldValue, validateFieldsAndScroll },
    } = this.props;
    const { visible } = this.state;

    const submitting = loading.effects[`${DOMAIN}/save`];

    const from = stringify({ from: markAsNoTab(getUrl()) });

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '类别码明细新增表格');
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
    const {
      tabField = {},
      showName = {},
      supCatDId = {},
      blankFlag = {},
      multFlag = {},
      catStatus = {},
    } = pageFieldJson;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/catCodeDetailDetails`],
      dataSource: catCodeList,
      enableSelection: true,
      showSearch: false,
      showColumn: false,
      showExport: false,
      shwoAdd: false,
      pagination: false,
      columns: [
        {
          title: (
            <span className={tabField.requiredFlag && 'ant-form-item-required'}>
              {tabField.displayName}
            </span>
          ),
          dataIndex: 'tabField',
          align: 'center',
        },
        {
          title: (
            <span className={showName.requiredFlag && 'ant-form-item-required'}>
              {showName.displayName}
            </span>
          ),
          dataIndex: 'showName',
          align: 'center',
          render: (val, row, index) => (
            <Input
              value={val}
              placeholder={`请输入${showName.displayName}`}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'showName');
              }}
            />
          ),
        },
        {
          title: (
            <span className={supCatDId.requiredFlag && 'ant-form-item-required'}>
              {supCatDId.displayName}
            </span>
          ),
          dataIndex: 'supCatDId',
          align: 'center',
          render: (val, row, index) => (
            <Selection
              key="supCatDId"
              value={val}
              className="x-fill-100"
              source={catCodeList}
              transfer={{ key: 'id', code: 'id', name: 'showName' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${supCatDId.displayName}`}
              onChange={e => {
                this.onCellChanged(index, e, 'supCatDId');
              }}
            />
          ),
        },
        {
          title: (
            <span className={blankFlag.requiredFlag && 'ant-form-item-required'}>
              {blankFlag.displayName}
            </span>
          ),
          dataIndex: 'blankFlag',
          align: 'center',
          render: (val, row, index) => (
            <RadioGroup
              value={val}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'blankFlag');
              }}
            >
              <Radio value="YES">是</Radio>
              <Radio value="NO">否</Radio>
            </RadioGroup>
          ),
        },
        {
          title: (
            <span className={multFlag.requiredFlag && 'ant-form-item-required'}>
              {multFlag.displayName}
            </span>
          ),
          dataIndex: 'multFlag',
          align: 'center',
          render: (val, row, index) => (
            <RadioGroup
              value={val}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'multFlag');
              }}
            >
              <Radio value="YES">是</Radio>
              <Radio value="NO">否</Radio>
            </RadioGroup>
          ),
        },
        {
          title: (
            <span className={catStatus.requiredFlag && 'ant-form-item-required'}>
              {catStatus.displayName}
            </span>
          ),
          dataIndex: 'catStatus',
          align: 'center',
          render: (val, row, index) => (
            <Switch
              checkedChildren="启用"
              unCheckedChildren="停用"
              checked={val === 'IN_USE'}
              onChange={(bool, e) => {
                const parmas = bool ? 'IN_USE' : 'NOT_USED';
                this.onCellChanged(index, parmas, 'catStatus');
              }}
            />
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        {
          key: 'create',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.toggleVisible();
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '明细维护',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            validateFieldsAndScroll((error, values) => {
              if (!error) {
                const tt = catCodeList.filter(v => !v.showName);
                if (tt.length) {
                  createMessage({ type: 'warn', description: '请补全类别码明细必填项！' });
                  return;
                }
                dispatch({
                  type: `${DOMAIN}/save`,
                  payload: formData,
                }).then(response => {
                  if (response.ok) {
                    const { id } = selectedRows[0];
                    router.push(`/plat/market/categoryCodeMgmt/catCodeDEdit?id=${id}&${from}`);
                  } else {
                    createMessage({ type: 'error', description: response.reason || '保存失败' });
                  }
                });
              }
            });
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
            dispatch({
              type: `${DOMAIN}/catCodeDetailDetele`,
              payload: { ids: selectedRowKeys.join(',') },
            }).then(res => {
              if (res) {
                const newDataSource = catCodeList.filter(
                  row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
                );
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    catCodeList: newDataSource,
                  },
                });
              }
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={submitting}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => {
              const { from: fromUrl } = fromQs();
              if (fromUrl) {
                closeThenGoto(markAsTab(fromUrl));
              } else {
                closeThenGoto('/plat/market/categoryCodeMgmt');
              }
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="类别码定义" />}
        >
          {this.renderPage()}
          <Divider dashed />
          <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="类别码明细" />
          <DataTable {...tableProps} />
        </Card>
        <CatCode visible={visible} onChange={() => this.toggleVisible()} />
      </PageHeaderWrapper>
    );
  }
}

export default CategoryCodeMgmtEdit;
