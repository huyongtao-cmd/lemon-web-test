import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Modal, Checkbox, Button } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import { isEmpty } from 'ramda';
import PageWrapper from '@/components/production/layout/PageWrapper';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

const DOMAIN = 'projectMember';

@connect(({ loading, dispatch, projectMember }) => ({
  treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...projectMember,
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
class index extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/ResourceId`,
    });
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
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

  handleCancel = e => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {},
        visible: false,
      },
    });
  };

  handleSave = flag => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      formData,
      callBackFun,
      projectId,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { expectStartDate, expectEndDate } = formData;
        if (moment(expectStartDate).isAfter(moment(expectEndDate))) {
          createMessage({
            type: 'warn',
            description: `预计结束日期不能早于预计开始日期！`,
          });
          return;
        }

        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            continueAddFlag: flag,
          },
        });

        dispatch({
          type: `${DOMAIN}/projectMemberEdit`,
          payload: {
            ...formData,
            projectId,
          },
        }).then(res => {
          if (!isEmpty(res) && flag) {
            this.handleCancel();
          } else {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                formData: {
                  memberType: formData.memberType,
                },
              },
            });
          }
          callBackFun();
        });
      }
    });
  };

  render() {
    const { formData, form, formMode, visible, resourceList } = this.props;

    return (
      <PageWrapper>
        <Modal
          title="项目成员新增"
          visible={visible}
          onCancel={this.handleCancel}
          width="70%"
          footer={
            <div>
              <Button
                className="tw-btn-default"
                type="primary"
                size="large"
                style={{ marginBottom: '5px' }}
                onClick={() => {
                  this.handleCancel();
                }}
              >
                取消
              </Button>
              <Button
                className="tw-btn-primary"
                type="primary"
                size="large"
                style={{ marginBottom: '5px' }}
                onClick={() => {
                  this.handleSave(true);
                }}
              >
                保存
              </Button>
              <Button
                className="tw-btn-primary"
                type="primary"
                size="large"
                style={{ marginBottom: '5px' }}
                onClick={() => {
                  this.handleSave(false);
                }}
              >
                保存并创建下一条
              </Button>
            </div>
          }
        >
          <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
            <FormItem
              label="角色名称"
              key="projectRole"
              fieldKey="projectRole"
              fieldType="BaseInput"
              initialValue={formData.projectRole}
              required
            />
            <FormItem
              label="临时资源"
              key="temporaryRes"
              fieldKey="temporaryRes"
              fieldType="Custom"
              initialValue={formData.temporaryRes}
            >
              <Checkbox
                // key={formData.temporaryRes}
                checked={formData.memberType === 'TEMPORARY_RES'}
                onChange={e => {
                  if (e.target.checked) {
                    this.callModelEffects('updateForm', {
                      memberResId: undefined,
                      memberName: undefined,
                      memberType: 'TEMPORARY_RES',
                    });
                    return;
                  }
                  this.callModelEffects('updateForm', {
                    memberName: undefined,
                    memberType: undefined,
                  });
                }}
              />
            </FormItem>
            <FormItem
              label="资源编号"
              key="memberResId"
              fieldKey="memberResId"
              fieldType="BaseSelect"
              initialValue={formData.memberResId}
              descList={resourceList}
              disabled={formData.memberType === 'TEMPORARY_RES'}
              required={formData.memberType !== 'TEMPORARY_RES'}
              onChange={(value, option, allOptions) => {
                if (!isEmpty(option)) {
                  this.callModelEffects('updateForm', {
                    memberName: option[0].resName,
                    contactInformation: option[0].phone,
                  });
                  return;
                }
                this.callModelEffects('updateForm', {
                  memberName: undefined,
                  contactInformation: undefined,
                });
              }}
            />
            <FormItem
              label="姓名"
              key="memberName"
              fieldKey="memberName"
              fieldType="BaseInput"
              initialValue={formData.memberName}
              disabled={formData.memberType !== 'TEMPORARY_RES'}
              required={formData.memberType === 'TEMPORARY_RES'}
            />
            <FormItem
              label="预计开始日期"
              key="expectStartDate"
              fieldKey="expectStartDate"
              fieldType="BaseDatePicker"
              initialValue={formData.expectStartDate}
            />
            <FormItem
              label="预计结束日期"
              key="expectEndDate"
              fieldKey="expectEndDate"
              fieldType="BaseDatePicker"
              initialValue={formData.expectEndDate}
            />
            <FormItem
              label="所属小组"
              key="memberGroup"
              fieldKey="memberGroup"
              fieldType="BaseCustomSelect"
              parentKey="CUS:MEMBER_GROUP"
              initialValue={formData.memberGroup}
              required
            />
            <FormItem
              label="联系方式"
              key="contactInformation"
              fieldKey="contactInformation"
              fieldType="BaseInput"
              initialValue={formData.contactInformation}
            />
            <FormItem
              label="备注"
              key="remark"
              fieldKey="remark"
              fieldType="BaseInputTextArea"
              initialValue={formData.remark}
            />
          </BusinessForm>
        </Modal>
      </PageWrapper>
    );
  }
}

export default index;
