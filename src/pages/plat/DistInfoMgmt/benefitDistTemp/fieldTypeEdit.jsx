import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil, indexOf } from 'ramda';
import { Button, Card, Form, Input, Radio, Divider, Row, InputNumber, Table, Checkbox } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { genFakeId, add } from '@/utils/mathUtils';
import update from 'immutability-helper';
import Transfer from '../component/Transfer';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'benefitDistTemp';

@connect(({ loading, benefitDistTemp, dispatch, user }) => ({
  loading,
  benefitDistTemp,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateFieldTypeForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class BenefitDistTempEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({ type: `${DOMAIN}/cleanField` }).then(res => {
      dispatch({ type: `${DOMAIN}/fieldTypeListRq`, payload: { limit: 0 } });
      // 获取页面配置信息
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'T_PROFITDIST_FUNCTION' },
      });
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/saveBusinessTableFieldType`,
        });
      }
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      dispatch,
      benefitDistTemp: {
        fieldTypeFormData,
        pageConfig: { pageBlockViews = [] },
        fieldTypeFunList,
      },
      form: { getFieldDecorator },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '字段类型维护');
    // 修改之前的可配置化
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { busiFunctionId = {} } = pageFieldJson;
      const fields = [
        <Field
          name="busiFunctionId"
          label={busiFunctionId.displayName}
          key="busiFunctionId"
          decorator={{
            initialValue: fieldTypeFormData.busiFunctionId || undefined,
            rules: [{ required: busiFunctionId.requiredFlag, message: '必填' }],
          }}
          sortNo={busiFunctionId.sortNo}
        >
          <Selection
            key="busiFunctionId"
            className="x-fill-100"
            source={fieldTypeFunList}
            transfer={{ key: 'id', code: 'id', name: 'functionName' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${busiFunctionId.displayName}`}
            onChange={e => {
              if (e) {
                // 拉取所有字段
                dispatch({
                  type: `${DOMAIN}/field`,
                  payload: {
                    id: e,
                    pageNo: 'SALE_CONTRACT_CREATE_SUB',
                  },
                }).then(res => {
                  // 拉取所有字段的选中情况
                  dispatch({
                    type: `${DOMAIN}/saveBusinessTableFieldTypeDetail`,
                    payload: {
                      id: e,
                    },
                  }).then(respone => {
                    const tt = res.map(v => {
                      if (respone.filter(item => item.businessTableFieldId === v.id).length) {
                        return {
                          ...v,
                          ...respone.filter(item => item.businessTableFieldId === v.id)[0],
                        };
                      }
                      return { ...v, id: genFakeId(-1), businessTableFieldId: v.id };
                    });
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        fieldTypeList: tt,
                      },
                    });
                  });
                });
              } else {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    fieldTypeFormData: {},
                    fieldTypeList: [],
                  },
                });
              }
            }}
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

  // 行编辑触发事件
  onCellChanged = (rowId, value, name) => {
    const {
      benefitDistTemp: { fieldTypeList },
      dispatch,
    } = this.props;

    const index = fieldTypeList.findIndex(v => v.businessTableFieldId === rowId);
    const newDataSource = fieldTypeList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { fieldTypeList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator, setFieldsValue },
      benefitDistTemp: { fieldTypeList },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const submitBtn =
      loading.effects[`${DOMAIN}/saveUpdateProConAndproFacRq`] ||
      loading.effects[`${DOMAIN}/queryDetail`];

    const columns = [
      {
        title: '字段',
        dataIndex: 'fieldName',
        align: 'center',
        width: '40%',
      },
      {
        title: '分配对象',
        dataIndex: 'name1',
        align: 'center',
        width: '30%',
        render: (val, row, index) => (
          <Checkbox
            checked={row.markType === 'ROLE'}
            disabled={row.isUse === 'true'}
            onChange={e => {
              this.onCellChanged(
                row.businessTableFieldId,
                e.target.checked ? 'ROLE' : null,
                'markType'
              );
              this.onCellChanged(row.businessTableFieldId, true, 'update');
            }}
          />
        ),
      },
      {
        title: '分配条件',
        dataIndex: 'name2',
        align: 'center',
        width: '30%',
        render: (val, row, index) => (
          <Checkbox
            checked={row.markType === 'CONDITION'}
            disabled={row.isUse === 'true'}
            onChange={e => {
              this.onCellChanged(
                row.businessTableFieldId,
                e.target.checked ? 'CONDITION' : null,
                'markType'
              );
              this.onCellChanged(row.businessTableFieldId, true, 'update');
            }}
          />
        ),
      },
    ];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={submitBtn}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="字段类型维护" />}
          bordered={false}
        >
          {this.renderPage()}
          <Divider dashed />
          <FieldList
            legend="字段类型配置"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Table
              title={() => (
                <span style={{ color: 'red' }}>※ 已经在利益分配模板中使用的字段不可再编辑</span>
              )}
              style={{ width: '600px' }}
              columns={columns}
              pagination
              dataSource={fieldTypeList}
              rowKey="id"
            />
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BenefitDistTempEdit;
