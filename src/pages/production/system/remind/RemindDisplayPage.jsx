import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form } from 'antd';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';

import { fromQs } from '@/utils/production/stringUtil';

// namespace声明
const DOMAIN = 'remindDisplayPage';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, remindDisplayPage }) => ({
  loading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...remindDisplayPage,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      fields[key] = Form.createFormField({ value: tempValue });
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
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class RemindDisplayPage extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, copy, mode } = fromQs();
    // 把url的参数保存到state
    this.updateModelState({ formMode: mode, id, copy });
    this.callModelEffects('init');
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
        this.callModelEffects('save', { formData: { ...formData, ...values } });
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

  render() {
    const { form, formData, formMode, loading } = this.props;

    return (
      <PageWrapper loading={loading}>
        <ButtonCard>
          {formMode === 'EDIT' && (
            <Button size="large" type="primary" onClick={this.handleSave}>
              保存
            </Button>
          )}
          {formMode === 'DESCRIPTION' && (
            <Button size="large" type="primary" onClick={this.switchEdit}>
              编辑
            </Button>
          )}
        </ButtonCard>
        <BusinessForm title="消息提醒" form={form} formData={formData} formMode={formMode}>
          <FormItem fieldType="BaseInput" label="消息码" fieldKey="remindCode" required />

          <FormItem fieldType="BaseInput" label="消息内容" fieldKey="remindContent" required />

          <FormItem fieldType="BaseInputNumber" label="国际化码" fieldKey="remindContentLocale" />

          <FormItem
            fieldType="BaseSelect"
            parentKey="FUNCTION:SYSTEM_REMIND:TYPE"
            label="消息类型"
            fieldKey="remindType"
            required
          />

          <FormItem
            fieldType="BaseRadioSelect"
            label="是否前端"
            fieldKey="portalFlag"
            options={[{ label: '是', value: true }, { label: '否', value: false }]}
            initialValue={false}
            required
          />

          <FormItem fieldType="BaseInputTextArea" label="说明" fieldKey="remark" />
        </BusinessForm>
      </PageWrapper>
    );
  }
}

export default RemindDisplayPage;
