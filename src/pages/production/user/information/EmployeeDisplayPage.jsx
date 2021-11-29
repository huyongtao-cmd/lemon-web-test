import React from 'react';
import { connect } from 'dva';
import { Form, Input } from 'antd';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import Button from '@/components/production/basic/Button';

import { fromQs } from '@/utils/production/stringUtil';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { isEmpty } from 'ramda';
import ButtonCard from '@/components/production/layout/ButtonCard.tsx';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';

// namespace声明
const DOMAIN = 'employeeDisplayPage';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, employeeDisplayPage, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...employeeDisplayPage,
  user,
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
class EmployeeDisplayPage extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG

    const { id, copy, mode } = fromQs();
    const {
      formData,
      user: { extInfo = {} }, // 取当前登陆人的resId
    } = this.props;
    this.updateModelState({ formMode: mode, id, copy });
    this.callModelEffects('queryCompanyList', { innerType: 'INTERNAL' });
    this.callModelEffects('init', { id });
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
  callModelEffects = async (method, params) => {
    const { dispatch } = this.props;
    return dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 保存
   */
  handleSave = (param, cb) => {
    const { form, formData, modifyFormData } = this.props;
    const { id, phone, email } = formData;

    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (modifyFormData) {
          this.callModelEffects('save', { formData: { ...modifyFormData, id } });
        } else {
          this.callModelEffects('save', { formData: { ...formData, ...values } });
        }
        // closeThenGoto(`/plat/baseData/information?refresh=` + new Date().valueOf());
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
    const {
      form,
      formData,
      formMode,
      loading,
      saveLoading,
      companyList,
      user: { extInfo = {} }, // 取当前登陆人的resId
    } = this.props;

    return (
      <PageWrapper loading={loading}>
        <ButtonCard>
          {formMode === 'EDIT' && (
            <Button size="large" type="primary" onClick={this.handleSave} loading={saveLoading}>
              保存
            </Button>
          )}

          {/*<Button*/}
          {/*  size="large"*/}
          {/*  type="primary"*/}
          {/*  onClick={() => this.updateModelState({ formMode: 'DESCRIPTION' })}*/}
          {/*>*/}
          {/*  详情模式*/}
          {/*</Button>*/}
        </ButtonCard>
        <BusinessForm form={form} formData={formData} formMode={formMode} defaultColumnStyle={8}>
          {/*<BusinessFormTitle title="账户信息" />*/}
          <FormItem
            fieldType="BaseInput"
            label="用户名"
            fieldKey="login"
            initialValue={formData.login}
            disabled={!!formData.id}
            required
          />
          {/*<FormItem*/}
          {/*  fieldType="BaseInput"*/}
          {/*  label="密码"*/}
          {/*  fieldKey="password"*/}
          {/*  initialValue={formData.password}*/}
          {/*  required*/}
          {/*/>*/}
          {/*<BusinessFormTitle title="基本信息" />*/}
          <FormItem
            fieldType="BaseInput"
            label="姓名"
            fieldKey="name"
            initialValue={formData.name}
            required
          />
          <FormItem
            fieldType="BaseSelect"
            label="性别"
            fieldKey="gender"
            parentKey="COMMON:GENDER"
            descriptionField="genderDesc"
            initialValue={formData.genderDesc}
            required
          />
          <FormItem
            fieldType="BaseInput"
            label="身份证号"
            fieldKey="idenNo"
            initialValue={formData.idenNo}
            required
          />
          <FormItem
            fieldType="BaseDatePicker"
            label="生日"
            fieldKey="birthday"
            initialValue={formData.birthday}
          />
          <FormItem
            fieldType="BaseInput"
            label="员工编号"
            fieldKey="resNo"
            initialValue={formData.resNo}
            required
          />

          <FormItem
            fieldType="BaseSelect"
            label="所属公司"
            fieldKey="ouId"
            descList={companyList}
            initialValue={formData.ouId}
            descriptionField="ouName"
            required
          />
          <FormItem
            fieldType="BuSimpleSelect"
            // label="所属BU"
            fieldKey="buId"
            initialValue={formData.buId}
            descriptionField="buName"
            defaultShow
            advanced
            required
          />
          {/*<FormItem*/}
          {/*  fieldType="BaseSelect"*/}
          {/*  label="Base地"*/}
          {/*  fieldKey="baseCity"*/}
          {/*  parentKey="FUNCTION:REGION:NAME"*/}
          {/*  required*/}
          {/*/>*/}
          {/*<FormItem*/}
          {/*  fieldType="BaseSelect"*/}
          {/*  label="职级"*/}
          {/*  fieldKey="jobGrade"*/}
          {/*  parentKey="FUNCTION:GRADE"*/}
          {/*  initialValue={formData.jobGrade}*/}
          {/*  required="false"*/}
          {/*/>*/}
          <FormItem
            fieldType="BaseInput"
            label="职位"
            fieldKey="position"
            initialValue={formData.position}
          />
          <FormItem
            fieldType="ResSimpleSelect"
            label="直属上级"
            fieldKey="parentResId"
            initialValue={formData.parentResId}
            descriptionField="presName"
            required
          />

          <FormItem
            fieldType="BaseDatePicker"
            label="入职日期"
            fieldKey="enrollDate"
            initialValue={formData.enrollDate}
          />
          <FormItem
            fieldType="BaseInput"
            label="手机号"
            fieldKey="phone"
            initialValue={formData.phone}
            rules={[
              {
                validator(_, value) {
                  const reg = /(^1\d{10}$)|(^[0-9]\d{7}$)/;
                  if (!reg.test(value)) {
                    return Promise.reject(new Error('手机格式不正确!'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            required
          />
          <FormItem
            fieldType="BaseInput"
            label="邮箱"
            fieldKey="email"
            initialValue={formData.email}
            rules={[
              {
                validator(_, value) {
                  const reg = /^([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
                  if (!reg.test(value)) {
                    return Promise.reject(new Error('邮箱格式不正确!'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            required
          />

          <FormItem
            fieldType="BaseSelect"
            label="资源状态"
            fieldKey="resStatus"
            parentKey="RES:RES_STATUS"
            initialValue={formData.resStatusDesc}
            required
          />

          <FormItem
            fieldType="BaseSelect"
            label="资源类型1"
            fieldKey="resType1"
            parentKey="FUNCTION:RESOURCE:TYPE"
            initialValue={formData.resType1Desc}
          />

          {/*<BusinessFormTitle title="财务信息" />*/}
          {/*<FormItem*/}
          {/*  fieldType="BaseInput"*/}
          {/*  label="银行"*/}
          {/*  fieldKey="bankName"*/}
          {/*  initialValue={formData.bankName}*/}
          {/*  required*/}
          {/*/>*/}
          {/*<FormItem*/}
          {/*  fieldType="BaseInput"*/}
          {/*  label="户名"*/}
          {/*  fieldKey="holderName"*/}
          {/*  initialValue={formData.holderName}*/}
          {/*  required*/}
          {/*/>*/}
          {/*<FormItem*/}
          {/*  fieldType="BaseInput"*/}
          {/*  label="账号"*/}
          {/*  fieldKey="accountNo"*/}
          {/*  initialValue={formData.accountNo}*/}
          {/*  required*/}
          {/*/>*/}
        </BusinessForm>
      </PageWrapper>
    );
  }
}

export default EmployeeDisplayPage;
