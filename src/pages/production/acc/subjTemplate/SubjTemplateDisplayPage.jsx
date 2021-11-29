import React from 'react';
import { connect } from 'dva';
import { isEmpty, omit } from 'ramda';
import { Form } from 'antd';
// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';

import { fromQs } from '@/utils/production/stringUtil';
// service方法
import EditTable from '@/components/production/business/EditTable.tsx';
import DataTable from '@/components/production/business/DataTable.tsx';

import BusinessAccItemSelectModal from './BusinessAccItemSelectModal';
import { listToTreePlus } from '@/utils/production/TreeUtil';

// namespace声明
const DOMAIN = 'subjTemplateDisplayPage';

/**
 * 会计科目 综合展示页面
 */
@connect(({ loading, dispatch, subjTemplateDisplayPage }) => ({
  loading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...subjTemplateDisplayPage,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      if (Array.isArray(tempValue)) {
        tempValue.forEach((temp, index) => {
          Object.keys(temp).forEach(detailKey => {
            fields[`${key}[${index}].${detailKey}`] = Form.createFormField({
              value: temp[detailKey],
            });
          });
        });
      } else {
        fields[key] = Form.createFormField({ value: tempValue });
      }
    });
    return fields;
  },
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
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class SubjTemplateDisplayPage extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, copy, mode } = fromQs();
    // 把url的参数保存到state
    this.updateModelState({ formMode: mode, copy });
    this.callModelEffects('updateForm', { id });
    this.callModelEffects('init');
    this.callModelEffects('fetchFinancialAccSubjTree');
    this.callModelEffects('fetchBudgetItemTree');
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  /**
   * 调用model层异步方法
   * 这个方法是仅是封装一个小方法,后续修改调异步方法时不需要每次都解构dispatch
   * @param method 异步方法名称
   * @param params 调用方法参数
   */
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 保存
   */
  handleSave = () => {
    const { form, formData } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        this.callModelEffects('save', { formData: { ...formData, ...omit(['details'], values) } });
      }
    });
  };

  /**
   * 切换编辑模式
   */
  switchEdit = () => {
    this.callModelEffects('init');
    this.updateModelState({ formMode: 'EDIT' });
  };

  onExpand = (expanded, record) => {
    const { unExpandedRowKeys } = this.props;
    const set = new Set(unExpandedRowKeys);
    if (!expanded) {
      set.add(record.id);
    } else {
      set.delete(record.id);
    }
    this.updateModelState({ unExpandedRowKeys: [...set] });
  };

  render() {
    const {
      form,
      formData,
      formMode,
      unExpandedRowKeys,
      loading,
      financialAccSubjTreeList,
      budgetItemTreeList,
    } = this.props;

    const { details } = formData;
    const expandedRowKeys = details
      .map(d => d.id)
      .filter(detail => unExpandedRowKeys.indexOf(detail) === -1);
    const tempDetails = [...details]
      .sort((d1, d2) => d1.busAccItemCode.localeCompare(d2.busAccItemCode))
      .map(d => ({ ...d, parentId: d.parentId + '' }));
    const wrappedDetails = listToTreePlus(tempDetails, undefined, 'busAccItemId');

    const editColumns = [
      {
        title: '编码',
        dataIndex: 'busAccItemCode',
        width: '300px',
      },
      {
        title: '核算项目',
        dataIndex: 'busAccItemName',
        width: '200px',
      },
      {
        title: '关联预算项目',
        dataIndex: 'budgetItemId',
        width: '200px',
        descriptionField: 'budgetItemName',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseTreeSelect"
            options={budgetItemTreeList}
            disabled={record.busAccItemType === 'INCOME'}
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].budgetItemId`}
          />
        ),
      },
      {
        title: '关联会计科目',
        dataIndex: 'finAccSubjId',
        width: '200px',
        descriptionField: 'finAccSubjName',
        required: true,
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseTreeSelect"
            options={financialAccSubjTreeList}
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].finAccSubjId`}
            required
          />
        ),
      },
      {
        title: '是否考核项目',
        dataIndex: 'examineFlag',
        width: '50px',
        descriptionRender: text => (text ? '是' : '否'),
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseSwitch"
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].examineFlag`}
          />
        ),
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputTextArea"
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].remark`}
          />
        ),
      },
    ];

    const descriptionColumns = [
      {
        title: '编码',
        dataIndex: 'busAccItemCode',
        width: '300px',
      },
      {
        title: '核算项目',
        dataIndex: 'busAccItemName',
        width: '200px',
      },
      {
        title: '关联预算项目',
        dataIndex: 'budgetItemName',
        width: '200px',
      },
      {
        title: '关联会计科目',
        dataIndex: 'finAccSubjName',
        width: '200px',
      },
      {
        title: '是否考核项目',
        dataIndex: 'examineFlagDesc',
        width: '50px',
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];

    return (
      <PageWrapper loading={loading}>
        <ButtonCard>
          {formMode === 'EDIT' && [
            <Button
              key="selectBusinessAccitem"
              size="large"
              type="primary"
              onClick={() => this.updateModelState({ modalVisible: true })}
            >
              选择核算项目
            </Button>,
            <Button key="save" size="large" type="primary" onClick={this.handleSave}>
              保存
            </Button>,
          ]}
          {formMode === 'DESCRIPTION' && (
            <Button key="edit" size="large" type="primary" onClick={this.switchEdit}>
              编辑
            </Button>
          )}
        </ButtonCard>
        <BusinessForm
          title="科目模板"
          form={form}
          formData={formData}
          formMode={formMode}
          defaultColumnStyle={8}
        >
          <FormItem fieldType="BaseInput" label="编码" fieldKey="tmplCode" required />

          <FormItem fieldType="BaseInput" label="名称" fieldKey="tmplName" required />

          <FormItem
            fieldType="BaseSystemCascaderMultiSelect"
            label="模板类别"
            fieldKey="tmplType"
            parentKey="ACC:SUBJECT_TEMPLATE:TYPE"
            required
            cascaderValues={[]}
            onChange={(value, option, allOptions) => {
              this.callModelEffects('updateForm', { suitType: undefined });
            }}
          />

          <FormItem
            fieldType="BaseSystemCascaderMultiSelect"
            label="适用类型"
            fieldKey="suitType"
            parentKey="ACC:SUBJECT_TEMPLATE:TYPE"
            required
            cascaderValues={[`${formData.tmplType}`]}
          />

          <FormItem
            fieldType="BaseSelect"
            label="状态"
            fieldKey="enabledFlag"
            parentKey="COM:ENABLE_FLAG"
            required
            initialValue="true"
          />

          <FormItem fieldType="BaseInputTextArea" label="备注" fieldKey="remark" />
        </BusinessForm>

        {formMode === 'EDIT' && (
          <EditTable
            key={details.length}
            title="模板明细"
            form={form}
            columns={editColumns}
            dataSource={wrappedDetails}
            expandedRowKeys={expandedRowKeys}
            onExpand={this.onExpand}
            selectType={null}
          />
        )}

        {formMode === 'DESCRIPTION' && (
          <DataTable
            title="模板明细"
            columns={descriptionColumns}
            dataSource={wrappedDetails}
            expandedRowKeys={expandedRowKeys}
            prodSelection={false}
            onExpand={this.onExpand}
          />
        )}

        <BusinessAccItemSelectModal />
      </PageWrapper>
    );
  }
}

export default SubjTemplateDisplayPage;
