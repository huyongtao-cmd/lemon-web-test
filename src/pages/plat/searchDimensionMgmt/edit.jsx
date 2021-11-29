import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Divider, Radio, Switch } from 'antd';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';
import SearchDimAdd from './component/SearchDimAdd';
import SearchDimEdit from './component/SearchDimEdit';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'searchDimensionMgmt';

@connect(({ loading, dispatch, searchDimensionMgmt }) => ({
  loading,
  dispatch,
  searchDimensionMgmt,
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
      visibleEdit: false,
      selectId: null,
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
        type: `${DOMAIN}/saveSearchDimDetails`,
        payload: { id },
      });
      // 类别码定义详情
      dispatch({
        type: `${DOMAIN}/saveSearchDimList`,
        payload: { id },
      });
      // 获取页面配置信息
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'SEARCH_SAVE' },
      });
      // 类别码列表
      dispatch({
        type: `${DOMAIN}/searchDimensionCatCodeList`,
        payload: { id },
      });
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      searchDimensionMgmt: { searchForm, formData, searchDimList },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const tt = searchDimList.filter(v => !v.searchDimName);
        if (tt.length) {
          createMessage({ type: 'warn', description: '查询维度名称必填!' });
          return;
        }
        dispatch({
          type: `${DOMAIN}/searchDimensionEdit`,
          payload: formData,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto('/plat/market/searchDimensionMgmt?_refresh=0');
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
      searchDimensionMgmt: { searchDimList },
      dispatch,
    } = this.props;
    if (name === 'dfltFlag' && value === 'YES') {
      // eslint-disable-next-line
      searchDimList.forEach(v => (v[name] = 'NO'));
    }

    const newDataSource = searchDimList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { searchDimList: newDataSource },
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  toggleVisibleEdit = () => {
    const { visibleEdit } = this.state;
    this.setState({ visibleEdit: !visibleEdit });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      searchDimensionMgmt: {
        formData,
        pageConfig: { pageBlockViews = [] },
        catCodeList,
      },
      form: { getFieldDecorator },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '查询维度定义维护');
    // 修改之前的可配置化
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { searchNo = {}, searchName = {}, catId = {}, remark = {} } = pageFieldJson;
      const fields = [
        <Field
          name="searchNo"
          label={searchNo.displayName}
          key="searchNo"
          decorator={{
            initialValue: formData.searchNo || '',
            rules: [{ required: searchNo.requiredFlag, message: '必填' }],
          }}
          sortNo={searchNo.sortNo}
        >
          <Input
            disabled={searchNo.fieldMode === 'UNEDITABLE'}
            placeholder={`请输入${searchNo.displayName}`}
          />
        </Field>,
        <Field
          name="searchName"
          key="searchName"
          label={searchName.displayName}
          decorator={{
            initialValue: formData.searchName || '',
            rules: [{ required: searchName.requiredFlag, message: '必填' }],
          }}
        >
          <Input
            disabled={searchName.fieldMode === 'UNEDITABLE'}
            placeholder={`请输入${searchName.displayName}`}
          />
        </Field>,
        <Field
          name="catId"
          key="catId"
          label={catId.displayName}
          decorator={{
            initialValue: formData.catId || undefined,
            rules: [{ required: catId.requiredFlag, message: '必填' }],
          }}
        >
          <Selection
            key="catId"
            className="x-fill-100"
            source={catCodeList}
            transfer={{ key: 'id', code: 'id', name: 'catName' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${catId.displayName}`}
            disabled={catId.fieldMode === 'UNEDITABLE'}
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
      searchDimensionMgmt: {
        formData,
        pageConfig: { pageBlockViews },
        searchDimList,
        searchDimDelList,
      },
      form: { getFieldDecorator, setFieldsValue, getFieldValue, validateFieldsAndScroll },
    } = this.props;
    const { visible, visibleEdit, selectId } = this.state;

    const submitting = loading.effects[`${DOMAIN}/save`];

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '查询维度详情');
    const { pageFieldViews } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
    const { searchDimName = {}, dfltFlag = {}, searchDimStatus = {} } = pageFieldJson;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/catCodeDetailDetails`],
      dataSource: searchDimList,
      enableSelection: true,
      showSearch: false,
      showColumn: false,
      showExport: false,
      shwoAdd: false,
      pagination: false,
      columns: [
        {
          title: (
            <span className={searchDimName.requiredFlag && 'ant-form-item-required'}>
              {searchDimName.displayName}
            </span>
          ),
          dataIndex: 'searchDimName',
          align: 'center',
          width: 150,
          render: (val, row, index) => (
            <Input
              value={val}
              placeholder={`请输入${searchDimName.displayName}`}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'searchDimName');
              }}
            />
          ),
        },
        {
          title: (
            <span className={dfltFlag.requiredFlag && 'ant-form-item-required'}>
              {dfltFlag.displayName}
            </span>
          ),
          dataIndex: 'dfltFlag',
          align: 'center',
          width: 100,
          render: (val, row, index) => (
            <RadioGroup
              value={val}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'dfltFlag');
              }}
            >
              <Radio value="YES">是</Radio>
              <Radio value="NO">否</Radio>
            </RadioGroup>
          ),
        },
        {
          title: (
            <span className={searchDimStatus.requiredFlag && 'ant-form-item-required'}>
              {searchDimStatus.displayName}
            </span>
          ),
          dataIndex: 'searchDimStatus',
          align: 'center',
          width: 100,
          render: (val, row, index) => (
            <Switch
              checkedChildren="启用"
              unCheckedChildren="停用"
              checked={val === 'IN_USE'}
              onChange={(bool, e) => {
                const parmas = bool ? 'IN_USE' : 'NOT_USED';
                this.onCellChanged(index, parmas, 'searchDimStatus');
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
            validateFieldsAndScroll((error, values) => {
              if (!error) {
                const tt = searchDimList.filter(v => !v.searchDimName);
                if (tt.length) {
                  createMessage({ type: 'warn', description: '查询维度名称必填!' });
                  return;
                }
                dispatch({
                  type: `${DOMAIN}/searchDimensionEdit`,
                  payload: formData,
                }).then(response => {
                  if (response.ok) {
                    this.toggleVisible();
                  } else {
                    createMessage({ type: 'error', description: response.reason || '操作失败' });
                  }
                });
              }
            });
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
                const tt = searchDimList.filter(v => !v.searchDimName);
                if (tt.length) {
                  createMessage({ type: 'warn', description: '查询维度名称必填!' });
                  return;
                }
                dispatch({
                  type: `${DOMAIN}/searchDimensionEdit`,
                  payload: formData,
                }).then(response => {
                  if (response.ok) {
                    const { id, searchDimName: aa } = selectedRows[0];
                    this.toggleVisibleEdit();
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        selectName: aa,
                      },
                    });
                    this.setState(
                      {
                        selectId: id,
                      },
                      () => {
                        dispatch({
                          type: `${DOMAIN}/SearchDimDCatCodeList`,
                          payload: { id: formData.catId },
                        });
                        dispatch({
                          type: `${DOMAIN}/SearchDimDList`,
                          payload: { id },
                        });
                      }
                    );
                  } else {
                    createMessage({ type: 'error', description: response.reason || '操作失败' });
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
              type: `${DOMAIN}/saveSearchDimDetele`,
              payload: { ids: selectedRowKeys.join(',') },
            }).then(res => {
              if (res) {
                const newDataSource = searchDimList.filter(
                  row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
                );
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    searchDimList: newDataSource,
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
              const { from } = fromQs();
              if (from) {
                closeThenGoto(markAsTab(from));
              } else {
                closeThenGoto('/plat/market/searchDimensionMgmt');
              }
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="查询维度定义" />}
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            {this.renderPage()}
          </FieldList>
          <Divider dashed />
          <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="查询维度">
            <DataTable {...tableProps} />
          </FieldList>
        </Card>
        <SearchDimAdd
          visible={visible}
          onChange={() => {
            this.toggleVisible();
          }}
        />
        {selectId && (
          <SearchDimEdit
            key={selectId}
            visible={visibleEdit}
            selectId={selectId}
            onChange={() => {
              this.toggleVisibleEdit();
            }}
          />
        )}
      </PageHeaderWrapper>
    );
  }
}

export default CategoryCodeMgmtEdit;
