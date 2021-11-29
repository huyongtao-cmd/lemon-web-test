import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Input } from 'antd';
import moment from 'moment';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { remindString } from '@/components/production/basic/Remind';

import CustomInput from './CustomInput';

import { fromQs } from '@/utils/production/stringUtil';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import BaseSystemCascaderMultiSelect from '@/components/production/basic/BaseSystemCascaderMultiSelect.tsx';

// namespace声明
const DOMAIN = 'singleCaseDetailDemo';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, singleCaseDetailDemo, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...singleCaseDetailDemo,
  user,
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
  // onFieldsChange(props, changedFields) {
  //   props.onChange(changedFields);
  // },
  // 更新表单
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
class SingleCaseDetailDemo extends React.PureComponent {
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
    console.log('formData:', formData);
    form.validateFieldsAndScroll((error, values) => {
      console.log('error:::', error);
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

  /**
   * 时间设置为null
   */
  setTimeNull = () => {
    const {
      formData: { id },
    } = this.props;
    this.callModelEffects('setTimeNull', { id, nullFields: ['testTime'] });
  };

  render() {
    const {
      form,
      formData,
      formMode,
      loading,
      user: { extInfo = {} }, // 取当前登陆人的resId
    } = this.props;

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
          <Button size="large" type="primary" onClick={this.setTimeNull}>
            指定修改时间为null
          </Button>

          <Button
            size="large"
            type="primary"
            onClick={() => this.updateModelState({ formMode: 'DESCRIPTION' })}
          >
            详情模式
          </Button>

          <Button
            size="large"
            type="primary"
            onClick={() => alert(remindString({ remindCode: 'test', defaultMessage: '哈哈哈' }))}
          >
            前端消息码
          </Button>
        </ButtonCard>
        <BusinessForm title="单表场景" form={form} formData={formData} formMode={formMode}>
          <BusinessFormTitle title="小标题" />

          <FormItem fieldType="BaseInput" label="编码" fieldKey="testNo" />

          <FormItem fieldType="BaseInput" label="名称" fieldKey="testName" required />

          <FormItem
            fieldType="BaseInputNumber"
            label="年龄"
            fieldKey="testAge"
            required
            onBlur={() => {
              form.validateFields(['testAge']);
            }}
          />

          <FormItem
            fieldType="BaseDatePicker"
            label="日期"
            initialValue={moment().format('YYYY-MM-DD')}
            fieldKey="testDate"
            required
          />

          <FormItem fieldType="BaseTimePicker" label="时间" fieldKey="testTime" required />

          <FormItem
            fieldType="InternalOuSimpleSelect"
            label="公司"
            fieldKey="testCompanyId"
            descriptionField="testCompanyName"
          />

          <FormItem
            fieldType="BaseFileManagerEnhance"
            label="附件"
            fieldKey="testFile"
            api="/api/production/testMain/test/sfs/token"
            dataKey={formData.id}
          />

          <FormItem
            fieldType="BaseInput"
            label="拓展字段1"
            fieldKey="testVarchar1"
            initialValue="初始值"
            disabled
            placeholder="演示不可编辑"
          />

          <FormItem
            fieldType="BaseInputHidden"
            label="时间"
            fieldKey="hiddenField"
            initialValue="hidden"
          />

          <FormItem fieldType="BaseInputTextArea" label="备注" fieldKey="remark" />

          <BusinessFormTitle title="这是个小标题，以下字段数据库未保存" />

          <FormItem
            fieldType="ResSimpleSelect"
            label="资源"
            fieldKey="resId"
            resStatus="3"
            descriptionField="resName"
            onChange={(value, option, allOptions) => {
              console.log(value);
              console.log(option);
              console.log(allOptions);
            }}
          />

          <FormItem
            fieldType="UserSimpleSelect"
            label="用户"
            fieldKey="userId"
            resStatus="3"
            resType1="EXTERNAL_RES"
            descriptionField="userName"
            initialValue={1491}
          />

          <FormItem fieldType="BaseDateRangePicker" label="日期范围" fieldKey="planDate" />

          <FormItem
            fieldType="BaseUdcSelect"
            label="旧版UDC"
            fieldKey="udcCode"
            udcCode="ACC:ACC_CAT02"
          />

          <FormItem
            fieldType="BuSimpleSelect"
            label="部门选择"
            fieldKey="buId"
            onChange={(value, option, allOptions) => {
              console.log(value);
              console.log(option);
              console.log(allOptions);
            }}
          />

          <FormItem fieldType="ContractSimpleSelect" label="合同选择" fieldKey="contractId" />

          <FormItem fieldType="TenantSimpleSelect" label="租户选择" fieldKey="tenantId" />

          <FormItem
            fieldType="BaseCustomSelect"
            label="自定义选择项"
            fieldKey="customSelectId"
            parentKey="COMMON"
          />

          <FormItem
            fieldType="BaseCustomSelect"
            label="自定义选择项多选"
            mode="multiple"
            fieldKey="customSelectId2"
            parentKey="COMMON"
          />

          <FormItem
            fieldType="Custom"
            label="自定义组件"
            fieldKey="custom"
            question="如果最后一个字符不是$,会自动添加"
          >
            <CustomInput />
          </FormItem>

          <FormItem fieldType="Group" label="输入框组" required>
            <FormItem fieldKey="groupField1" fieldType="BaseInput" groupWidth="60%" />
            <FormItem fieldKey="groupField2" fieldType="BaseInput" groupWidth="40%" />
          </FormItem>

          <FormItem fieldType="Group" label="级联组件" disabled>
            <FormItem
              fieldKey="province"
              descriptionField="province"
              fieldType="BaseSystemCascaderMultiSelect"
              parentKey="COMMON:ADM_DIVISION:CHINA"
              disabled={false}
              cascaderValues={[]}
              onChange={value => {
                this.callModelEffects('updateForm', { city: undefined, area: undefined });
              }}
            />
            <FormItem
              fieldKey="city"
              descriptionField="city"
              fieldType="BaseSystemCascaderMultiSelect"
              parentKey="COMMON:ADM_DIVISION:CHINA"
              cascaderValues={[`${formData.province}`]}
              onChange={value => {
                this.callModelEffects('updateForm', { area: undefined });
              }}
            />
            <FormItem
              fieldKey="area"
              descriptionField="area"
              fieldType="BaseSystemCascaderMultiSelect"
              parentKey="COMMON:ADM_DIVISION:CHINA"
              cascaderValues={[`${formData.province}`, `${formData.city}`]}
            />
          </FormItem>

          <FormItem fieldType="Group" label="自定义选择项级联组件">
            <FormItem
              fieldKey="customProvince"
              descriptionField="customProvince"
              fieldType="BaseCustomCascaderMultiSelect"
              parentKey="COMMON:ADM_DIVISION:CHINA"
              cascaderValues={[]}
              onChange={value => {
                this.callModelEffects('updateForm', {
                  customCity: undefined,
                  customArea: undefined,
                });
              }}
            />
            <FormItem
              fieldKey="customCity"
              descriptionField="customCity"
              fieldType="BaseCustomCascaderMultiSelect"
              parentKey="COMMON:ADM_DIVISION:CHINA"
              cascaderValues={[`${formData.customProvince}`]}
              onChange={value => {
                this.callModelEffects('updateForm', { customArea: undefined });
              }}
            />
            <FormItem
              fieldKey="customArea"
              descriptionField="customArea"
              fieldType="BaseCustomCascaderMultiSelect"
              parentKey="COMMON:ADM_DIVISION:CHINA"
              cascaderValues={[`${formData.customProvince}`, `${formData.customCity}`]}
            />
          </FormItem>

          <p>我是一个原生的dom标签</p>

          <FormItem
            fieldType="ResSimpleSelect"
            label="申请人"
            fieldKey="applyResId"
            mode="multiple"
            initialValue="5,6"
            descList={[{ value: extInfo.resId, title: extInfo.resName }]}
          />

          <FormItem
            fieldType="BaseDatePicker"
            label="申请日期"
            fieldKey="applyDate"
            disabled
            initialValue={moment().format('YYYY-MM-DD')}
          />

          <FormItem fieldType="ProjectSimpleSelect" label="项目下拉" fieldKey="projectId" />

          <FormItem fieldType="ProductSimpleSelect" label="产品下拉" fieldKey="productId" />

          <FormItem fieldType="BaseInputAmt" label="金额输入" fieldKey="amt" />
        </BusinessForm>
      </PageWrapper>
    );
  }
}

export default SingleCaseDetailDemo;
