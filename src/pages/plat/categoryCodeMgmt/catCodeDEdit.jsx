import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Divider, Radio, InputNumber } from 'antd';
import Title from '@/components/layout/Title';
import { Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto, markAsTab, markAsNoTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';
import { genFakeId } from '@/utils/mathUtils';

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
        type: `${DOMAIN}/updateCatCodeDFormData`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class catCodeDEdit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/cleanCatCodeDFormData`,
    }).then(res => {
      dispatch({
        type: `${DOMAIN}/catCodeDValDetails`,
        payload: { id },
      }).then(response => {
        if (response.supCatDId) {
          dispatch({
            type: `${DOMAIN}/catCodeDValDetailsSupValDropDown`,
            payload: { id: response.supCatDId },
          });
        }
      });
    });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'CATEGORY_SAVE' },
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      categoryCodeMgmt: { searchForm, catCodeDvalList, catCodeDFormData },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const tt = catCodeDvalList.filter(v => isNil(v.catVal) || isNil(v.catDesc));
        if (tt.length) {
          createMessage({ type: 'warn', description: '请填写类别码值所有必填项！！！' });
          return;
        }

        if (
          catCodeDFormData.supCatDId &&
          catCodeDvalList.filter(v => isNil(v.supCatDValId)).length
        ) {
          createMessage({ type: 'warn', description: '请填写类别码值上级值！！！' });
          return;
        }

        dispatch({
          type: `${DOMAIN}/catCodeDValInsert`,
          payload: {
            catDId: fromQs().id,
          },
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            const { from: fromUrl } = fromQs();
            closeThenGoto(markAsTab(fromUrl));
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  onCellChanged = (index, value, name) => {
    const {
      categoryCodeMgmt: { catCodeDvalList },
      dispatch,
    } = this.props;

    const newDataSource = catCodeDvalList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { catCodeDvalList: newDataSource },
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      categoryCodeMgmt: {
        catCodeDFormData,
        pageConfig: { pageBlockViews = [] },
      },
      form: { getFieldDecorator },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(
      v => v.blockPageName === '类别码维护 明细的修改'
    );
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const {
        tabField = {},
        showName = {},
        supCatDId = {},
        blankFlag = {},
        multFlag = {},
        catStatus = {},
      } = pageFieldJson;
      const fields = [
        <Field
          name="tabField"
          key="tabField"
          label={tabField.displayName}
          decorator={{
            initialValue: catCodeDFormData.tabField || '',
            rules: [{ required: tabField.requiredFlag, message: '必填' }],
          }}
        >
          <Input
            disabled={tabField.fieldMode === 'UNEDITABLE'}
            placeholder={`请输入${tabField.displayName}`}
          />
        </Field>,
        <Field
          name="showName"
          key="showName"
          label={showName.displayName}
          decorator={{
            initialValue: catCodeDFormData.showName || undefined,
            rules: [
              {
                required: showName.requiredFlag,
                message: '必填',
              },
            ],
          }}
        >
          <Input
            disabled={showName.fieldMode === 'UNEDITABLE'}
            placeholder={`请输入${showName.displayName}`}
          />
        </Field>,
        <Field
          name="supCatDName"
          key="supCatDId"
          label={supCatDId.displayName}
          decorator={{
            initialValue: catCodeDFormData.supCatDName || undefined,
            rules: [
              {
                required: supCatDId.requiredFlag,
                message: '必填',
              },
            ],
          }}
        >
          <Input
            disabled={supCatDId.fieldMode === 'UNEDITABLE'}
            placeholder={`请输入${supCatDId.displayName}`}
          />
        </Field>,
        <Field
          name="blankFlag"
          key="blankFlag"
          label={blankFlag.displayName}
          decorator={{
            initialValue: catCodeDFormData.blankFlag || undefined,
            rules: [
              {
                required: blankFlag.requiredFlag,
                message: '必填',
              },
            ],
          }}
        >
          <RadioGroup disabled={blankFlag.fieldMode === 'UNEDITABLE'}>
            <Radio value="YES">是</Radio>
            <Radio value="NO">否</Radio>
          </RadioGroup>
        </Field>,
        <Field
          name="multFlag"
          key="multFlag"
          label={multFlag.displayName}
          decorator={{
            initialValue: catCodeDFormData.multFlag || undefined,
            rules: [
              {
                required: multFlag.requiredFlag,
                message: '必填',
              },
            ],
          }}
        >
          <RadioGroup disabled={multFlag.fieldMode === 'UNEDITABLE'}>
            <Radio value="YES">是</Radio>
            <Radio value="NO">否</Radio>
          </RadioGroup>
        </Field>,
        <Field
          name="catStatus"
          key="catStatus"
          label={catStatus.displayName}
          decorator={{
            initialValue: catCodeDFormData.catStatus || undefined,
            rules: [
              {
                required: catStatus.requiredFlag,
                message: '必填',
              },
            ],
          }}
        >
          <RadioGroup disabled={catStatus.fieldMode === 'UNEDITABLE'}>
            <Radio value="IN_USE">启用</Radio>
            <Radio value="NOT_USED">停用</Radio>
          </RadioGroup>
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
        catCodeDFormData,
        catCodeDvalList,
        catCodeDvalSupList,
        pageConfig: { pageBlockViews = [] },
      },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;

    const btnLoading =
      loading.effects[`${DOMAIN}/catCodeDValDetails`] ||
      loading.effects[`${DOMAIN}/catCodeDValInsert`];

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(
      v => v.blockPageName === '类别码维护 类别码值新增/修改'
    );
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
    const { catVal = {}, catDesc = {}, supCatDValId = {}, sortNo = {} } = pageFieldJson;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      showCopy: false,
      loading: btnLoading,
      dataSource: catCodeDvalList,
      pagination: false,
      onAdd: newRow => {
        // 更新数组list数据
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            catCodeDvalList: update(catCodeDvalList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  catDId: fromQs().id,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = catCodeDvalList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );

        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            catCodeDvalList: newDataSource,
          },
        });
        // 只有删除后端返回的数据的时候才调用接口，其他数据前端做自删除，为了保留新输入数据，删除之后不重新拉取数据
        if (selectedRowKeys.filter(v => v > 0).length) {
          dispatch({
            type: `${DOMAIN}/catCodeDValNodeDetele`,
            payload: { ids: selectedRowKeys.filter(v => v > 0).join(',') },
          });
        }
      },
      columns: [
        {
          title: (
            <span className={catVal.requiredFlag && 'ant-form-item-required'}>
              {catVal.displayName}
            </span>
          ),
          dataIndex: 'catVal',
          align: 'center',
          width: '30%',
          render: (val, row, index) => (
            <Input
              value={val}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'catVal');
              }}
            />
          ),
        },
        {
          title: (
            <span className={catDesc.requiredFlag && 'ant-form-item-required'}>
              {catDesc.displayName}
            </span>
          ),
          dataIndex: 'catDesc',
          align: 'center',
          width: '30%',
          render: (val, row, index) => (
            <Input
              value={val}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'catDesc');
              }}
            />
          ),
        },
        {
          title: (
            <span
              className={
                catCodeDFormData.supCatDId && supCatDValId.requiredFlag
                  ? 'ant-form-item-required'
                  : null
              }
            >
              {supCatDValId.displayName}
            </span>
          ),
          dataIndex: 'supCatDValId',
          align: 'center',
          width: '30%',
          render: (val, row, index) => (
            <Selection
              key="supCatDId"
              value={val}
              className="x-fill-100"
              source={catCodeDvalSupList}
              transfer={{ key: 'id', code: 'id', name: 'catDesc' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              disabled={!catCodeDFormData.supCatDId}
              onChange={e => {
                this.onCellChanged(index, e, 'supCatDValId');
              }}
            />
          ),
        },
        {
          title: (
            <span className={sortNo.requiredFlag && 'ant-form-item-required'}>
              {sortNo.displayName}
            </span>
          ),
          dataIndex: 'sortNo',
          align: 'center',
          width: '10%',
          render: (val, row, index) => (
            <InputNumber
              value={val}
              min={0}
              onChange={e => {
                this.onCellChanged(index, e, 'sortNo');
              }}
            />
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={btnLoading}
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
          title={<Title icon="profile" text="类别码明细" />}
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            {this.renderPage()}
          </FieldList>
          <Divider dashed />
          <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="类别码值">
            <EditableDataTable {...tableProps} />
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default catCodeDEdit;
