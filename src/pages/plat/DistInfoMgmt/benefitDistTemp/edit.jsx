import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil, indexOf } from 'ramda';
import { Button, Card, Form, Input, Radio, Divider, Row, InputNumber } from 'antd';
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
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class BenefitDistTempEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();

    dispatch({ type: `${DOMAIN}/cleanView` }).then(res => {
      dispatch({ type: `${DOMAIN}/functionList`, paylod: { limit: 0 } });
      // 获取页面配置信息
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'T_PROFITDIST_FUNCTION' },
      });
      // 有id，修改
      id &&
        dispatch({
          type: `${DOMAIN}/queryDetail`,
          payload: {
            id,
          },
        }).then(response => {
          dispatch({
            type: `${DOMAIN}/proConAndproFac`,
            payload: {
              id: response?.datum?.busiFunctionId,
            },
          });
        });
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll, setFields },
      benefitDistTemp: { searchForm },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { from } = fromQs();
        dispatch({
          type: `${DOMAIN}/saveUpdateProConAndproFac`,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(markAsTab(from));
            dispatch({ type: `benefitDistTemp/query`, payload: searchForm });
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  handleTransferChange = rightDataList => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        profitConditionSelectList: rightDataList,
      },
    });
  };

  handleTransferChange1 = rightDataList => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        profitFactorSelectList: rightDataList,
      },
    });
  };

  // 配置所需要的内容1
  renderPage = () => {
    const {
      dispatch,
      benefitDistTemp: {
        formData,
        pageConfig: { pageBlockViews = [] },
        businessFunList,
      },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '利益分配模板编辑');
    // 修改之前的可配置化
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { busiFunctionId = {}, templateName = {}, activeFlag = {} } = pageFieldJson;
      const fields = [
        <Field
          name="busiFunctionId"
          label={busiFunctionId.displayName}
          key="busiFunctionId"
          decorator={{
            initialValue: formData.busiFunctionId || undefined,
            rules: [{ required: busiFunctionId.requiredFlag, message: '必填' }],
          }}
          sortNo={busiFunctionId.sortNo}
        >
          <Selection
            key="busiFunctionId"
            className="x-fill-100"
            source={businessFunList}
            transfer={{ key: 'id', code: 'id', name: 'functionName' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            disabled={!!fromQs().id}
            placeholder={`请选择${busiFunctionId.displayName}`}
            onChange={e => {
              if (e) {
                dispatch({
                  type: `${DOMAIN}/proConAndproFac`,
                  payload: {
                    id: e,
                  },
                });
              } else {
                dispatch({
                  type: `${DOMAIN}updateState`,
                  payload: {
                    profitConditionList: [],
                    profitConditionSelectList: [],
                    profitFactorList: [],
                    profitFactorSelectList: [],
                  },
                });
              }
            }}
          />
        </Field>,
        <Field
          name="templateName"
          label={templateName.displayName}
          key="templateName"
          decorator={{
            initialValue: formData.templateName || '',
            rules: [{ required: templateName.requiredFlag, message: '必填' }],
          }}
          sortNo={templateName.sortNo}
        >
          <Input placeholder={`请选择${templateName.displayName}`} />
        </Field>,
        <Field
          name="activeFlag"
          label={activeFlag.displayName}
          key="activeFlag"
          decorator={{
            initialValue: formData.activeFlag || '',
            rules: [{ required: activeFlag.requiredFlag, message: '必填' }],
          }}
          sortNo={activeFlag.sortNo}
        >
          <RadioGroup>
            <Radio value="0">已启用</Radio>
            <Radio value="1">未启用</Radio>
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
      form: { getFieldDecorator, setFieldsValue },
      benefitDistTemp: {
        profitConditionList,
        profitConditionSelectList,
        profitFactorList,
        profitFactorSelectList,
      },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const submitBtn =
      loading.effects[`${DOMAIN}/saveUpdateProConAndproFacRq`] ||
      loading.effects[`${DOMAIN}/queryDetail`];

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
          title={<Title icon="profile" text="利益分配模板维护" />}
          bordered={false}
        >
          {this.renderPage()}
          <Divider dashed />
          <FieldList
            legend="利益分配条件"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={1}
          >
            <Transfer
              data={{
                leftData: profitConditionList,
                rightData: profitConditionSelectList,
              }}
              onChange={rightDataList => this.handleTransferChange(rightDataList)}
              leftColumns={[
                {
                  title: '字段名称',
                  dataIndex: 'fieldName',
                  align: 'center',
                },
                {
                  title: '字段可选值',
                  dataIndex: 'fieldOptional',
                  align: 'center',
                },
              ]}
              rightColumns={[
                {
                  title: '利益分配条件',
                  dataIndex: 'fieldName',
                  align: 'center',
                },
              ]}
            />
          </FieldList>
          <br />
          <Divider dashed />

          <FieldList
            legend="利益分配对象"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={1}
          >
            <Transfer
              data={{
                leftData: profitFactorList,
                rightData: profitFactorSelectList,
              }}
              onChange={rightDataList => this.handleTransferChange1(rightDataList)}
              leftColumns={[
                {
                  title: '字段名称',
                  dataIndex: 'profitFieldName',
                  align: 'center',
                },
              ]}
              rightColumns={[
                {
                  title: '利益分配对象',
                  dataIndex: 'profitFieldName',
                  align: 'center',
                },
              ]}
            />
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BenefitDistTempEdit;
