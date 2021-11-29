import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Card, Form } from 'antd';
// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/production/stringUtil';
import { systemLocaleListPaging } from '@/services/production/system';
import createMessage from '../../../../components/core/AlertMessage';

// namespace声明
const DOMAIN = 'informationDisplay';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, informationDisplay, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...informationDisplay,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    console.log(formData);
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
class InformationDisplay extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, mode, key, flag } = fromQs();
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    const checked = flag === 'CHECK';
    // 把url的参数保存到state
    this.updateModelState({ formMode });
    this.callModelEffects('updateForm', { id });
    // this.callModelEffects('init');
    this.callModelEffects('init');
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  fetchData = async params => {
    const { response } = await systemLocaleListPaging(params);
    return response.data;
  };

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
   * 切换编辑模式
   */
  switchEdit = () => {
    this.callModelEffects('init');
    this.updateModelState({ formMode: 'EDIT' });
  };

  handleSave = (param, cb) => {
    const { formData, modifyFormData } = this.props;
    const { id } = formData;
    const { pResId = undefined } = modifyFormData;
    let IpResId;
    if (pResId) {
      IpResId = parseInt(pResId, 10);
      modifyFormData.pResId = IpResId;
    }
    if (modifyFormData.testFile > 1) {
      createMessage({
        type: 'error',
        description: '只能上传1张个人生活照',
      });
      return;
    }
    this.callModelEffects('save', { formData: { ...modifyFormData, id }, cb });
  };

  /**
   * 时间设置为null
   */
  // setTimeNull = () => {
  //   const {
  //     formData: { id },
  //   } = this.props;
  //   this.callModelEffects('setTimeNull', { id, nullFields: ['testTime'] });
  // };

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
          {[
            <Button
              size="large"
              type="primary"
              onClick={() => {
                this.handleSave({ submit: false }, () => {
                  closeThenGoto(`/hr/resource/information?refresh=` + new Date().valueOf());
                });
              }}
              loading={loading}
            >
              保存
            </Button>,
          ]}
        </ButtonCard>
        <BusinessForm
          title="基本信息"
          form={form}
          formData={formData}
          formMode={formMode}
          defaultColumnStyle={8}
        >
          <FormItem fieldType="BaseInput" label="用户名" fieldKey="login" />

          <FormItem fieldType="BaseInput" label="姓名" fieldKey="name" />

          <FormItem fieldType="BaseInput" label="员工编号" fieldKey="resNo" />

          <FormItem
            fieldType="BaseAllOuSimpleSelect"
            label="所属公司"
            fieldKey="ouId"
            descriptionRender={formData.ouName}
          />

          <FormItem
            fieldType="BuSimpleSelect"
            label="所属BU"
            fieldKey="buId"
            descriptionRender={formData.buName}
          />

          <FormItem
            fieldType="BaseCustomSelect"
            label="工作地"
            fieldKey="baseCity"
            parentKey="CUS:CITY"
          />

          <FormItem
            fieldType="BaseCustomSelect"
            label="职级"
            fieldKey="jobGrade"
            parentKey="CUS:JOB_GRADE"
            descriptionRender={formData.jobGrade}
          />

          <FormItem fieldType="BaseInput" label="职位" fieldKey="position" />

          <FormItem
            fieldType="ResSimpleSelect"
            label="直属上级"
            fieldKey="parentResId"
            descriptionRender={formData.presName}
          />

          <FormItem fieldType="BaseDatePicker" label="入职日期" fieldKey="enrollDate" defaultShow />

          <FormItem fieldType="BaseInputNumber" label="手机号" fieldKey="phone" />

          <FormItem fieldType="BaseInput" label="邮箱" fieldKey="email" />

          <FormItem fieldType="BaseDatePicker" label="生日" fieldKey="birthday" />

          <FormItem
            fieldType="BaseSelect"
            label="资源类型"
            fieldKey="resType1"
            descList={[
              { value: 'INTERNAL_RES', title: '内部资源' },
              { value: 'EXTERNAL_RES', title: '外部资源' },
            ]}
          />

          <FormItem fieldType="BaseSelect" label="性别" fieldKey="gender" parentKey="COM:GENDER" />

          <FormItem fieldType="BaseInput" label="银行" fieldKey="bankName" />

          <FormItem fieldType="BaseInput" label="户名" fieldKey="holderName" />

          <FormItem fieldType="BaseInput" label="银行账号" fieldKey="accountNo" />

          <FormItem
            fieldType="FileUpload"
            fieldKey="file"
            label="合同"
            multiple
            // fileList={attachments}
            // preview={
            //   currentNode !== 'create' &&
            //   currentNode !== 'applyEdit' &&
            //   currentNode !== 'advanceEdit'
            // }
          />
          <FormItem
            fieldType="FileUpload"
            fieldKey="file"
            label="保密协议"
            multiple
            // fileList={attachments}
            // preview={
            //   currentNode !== 'create' &&
            //   currentNode !== 'applyEdit' &&
            //   currentNode !== 'advanceEdit'
            // }
          />
          <FormItem
            fieldType="FileUpload"
            fieldKey="file"
            label="简历"
            multiple
            // fileList={attachments}
            // preview={
            //   currentNode !== 'create' &&
            //   currentNode !== 'applyEdit' &&
            //   currentNode !== 'advanceEdit'
            // }
          />
          {/*<FormItem*/}
          {/*  fieldType="FileUpload"*/}
          {/*  label="定稿附件"*/}
          {/*  key="attach"*/}
          {/*  fieldKey="attach"*/}
          {/*  fileList={attachments}*/}
          {/*  multiple*/}
          {/*/>,*/}
          <FormItem
            fieldType="FileUpload"
            fieldKey="file"
            key="file"
            label="个人生活照"
            multiple={false}
            // fileList={attachments}
            // preview={
            //   currentNode !== 'create' &&
            //   currentNode !== 'applyEdit' &&
            //   currentNode !== 'advanceEdit'
            // }
          />
          {/*
          <FormItem
            fieldType='BaseFileManagerEnhance'
            fieldKey='testFile'
            label='个人生活照'
            dataKey={formData.id}
            api='/api/production/testMain/test/sfs/token'
            multiple={false} // 是否可以多选上传
            // fileList={attachments} // 文件集合
            // preview={ // 详情模式显示
            //   currentNode !== 'create' &&
            //   currentNode !== 'applyEdit' &&
            //   currentNode !== 'advanceEdit'
            // }
          />
          */}
        </BusinessForm>
      </PageWrapper>
    );
  }
}

export default InformationDisplay;
