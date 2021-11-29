import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, DatePicker, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import Title from '@/components/layout/Title';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { pushFlowTask } from '@/services/gen/flow';
import { fromQs } from '@/utils/stringUtils';
import moment from 'moment';

const { Description } = DescriptionList;
const { Field } = FieldList;
const DOMAIN = 'platResEnrollDetail';
const ACC_A28_01 = 'ACC_A28_01_RES_ENTRY_SUBMIT_i';
const ACC_A28_02 = 'ACC_A28_02_RES_ENTRY_b';
const ACC_A28_03 = 'ACC_A28_03_RES_ENTRY_b';
const ACC_A28_04 = 'ACC_A28_04_FINAL_CHECK';

@connect(({ dispath, platResEnrollDetail, user }) => ({
  dispath,
  platResEnrollDetail,
  user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class EnrollDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();
    id &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { resId: id },
      }) &&
      dispatch({
        type: `${DOMAIN}/queryCreate`,
        payload: { resId: id },
      }) &&
      dispatch({
        type: `${DOMAIN}/queryCreateInfo`,
        payload: { resId: id },
      });

    taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
  }

  handleChange = e => {
    const {
      dispatch,
      platResEnrollDetail: { haveLoginName },
    } = this.props;
    if (!haveLoginName) {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          loginName: e.target.value,
        },
      });
    }
  };

  render() {
    const {
      dispatch,
      form: { validateFieldsAndScroll, getFieldDecorator },
      platResEnrollDetail: { formDataSource, formData, fieldsConfig, flowForm, createData },
      user: {
        user: { roles = [] },
      },
    } = this.props;
    const { id, taskId, prcId, from } = fromQs();

    return (
      <PageHeaderWrapper title="资源入职申请">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { taskKey } = fieldsConfig;
            const { remark } = bpmForm;
            const { key } = operation;
            // 退回 修改
            if (taskKey === ACC_A28_01) {
              if (key === 'EDIT') {
                closeThenGoto(
                  `/hr/res/profile/list/resEnroll?id=${id}&taskId=${taskId}&remark=${remark}`
                );
                return Promise.resolve(false);
              }
            }
            // 审批 通过/拒绝
            if (taskKey === ACC_A28_02 || taskKey === ACC_A28_03) {
              // bu负责人 或者 上级领导 都推流程
              return pushFlowTask(taskId, { remark, result: key, branch: key }).then(
                ({ status, response }) => {
                  if (status === 200) {
                    createMessage({ type: 'success', description: '提交成功' });
                    closeThenGoto(
                      `/hr/res/profile/list/resEnroll/detail?id=${id}&prcId=${prcId}&taskId=${taskId}&mode=view&from=${from}`
                    );
                  }
                  return Promise.resolve(false);
                }
              );
            }
            // 创建资源用户
            if (taskKey === ACC_A28_04) {
              if (key === 'APPROVED') {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    dispatch({
                      type: `${DOMAIN}/create`,
                    }).then(
                      res =>
                        res &&
                        pushFlowTask(taskId, { remark, result: key, branch: key }).then(
                          ({ status, response }) => {
                            if (status === 200) {
                              createMessage({ type: 'success', description: '提交成功' });
                              closeThenGoto(
                                `/hr/res/profile/list/resEnroll/detail?id=${id}&prcId=${prcId}&taskId=${taskId}&mode=view&from=${from}`
                              );
                            }
                            return Promise.resolve(false);
                          }
                        )
                    );
                  }
                });
              } else if (key === 'REJECTED') {
                dispatch({
                  type: `${DOMAIN}/del`,
                  payload: { resId: id },
                }).then(
                  res =>
                    res &&
                    pushFlowTask(taskId, { remark, result: key, branch: key }).then(
                      ({ status, response }) => {
                        if (status === 200) {
                          dispatch({
                            type: `${DOMAIN}/cancel`,
                            payload: prcId,
                          });
                        }
                        return Promise.resolve(false);
                      }
                    )
                );
              }
              return Promise.resolve(false);
            }
            return Promise.resolve(true);
          }}
        >
          {fieldsConfig.taskKey !== ACC_A28_04 &&
            roles.indexOf('PLAT_IT_ADMIN') < 0 && (
              <Card
                className="tw-card-adjust"
                bordered={false}
                title={
                  <Title
                    icon="profile"
                    id="ui.menu.plat.res.resEnroll"
                    defaultMessage="资源入职申请"
                  />
                }
              >
                <DescriptionList size="large" col={2}>
                  <Description term="姓名">{formDataSource.personName}</Description>
                  <Description term="英文名">{formDataSource.foreignName}</Description>
                  <Description term="性别">{formDataSource.genderName}</Description>
                  <Description term="出生日期">{formDataSource.birthday}</Description>
                  <Description term="证件类型">{formDataSource.idTypeName}</Description>
                  <Description term="证件号码">{formDataSource.idNo}</Description>
                  <Description term="资源类型一">{formDataSource.resType1Name}</Description>
                  <Description term="资源类型二">{formDataSource.resType2Name}</Description>
                  <Description term="预定入职日期">{formDataSource.enrollDate}</Description>
                  <Description term="所属公司">{formDataSource.ouName}</Description>
                  <Description term="BaseBU">{formDataSource.baseBuName}</Description>
                  <Description term="Base地">{formDataSource.baseCityName}</Description>
                  <Description term="上级资源">{formDataSource.presName}</Description>
                  <Description term="职级">{formDataSource.jobGrade}</Description>
                  <Description term="当量系数">{formDataSource.eqvaRatio}</Description>
                  <Description term="工号">{formDataSource.empNo}</Description>
                  <Description term="电脑额度">{formDataSource.compfeeQuota}</Description>
                  <Description term="话费额度">{formDataSource.telfeeQuota}</Description>
                  <Description term="发薪方式">{formDataSource.salaryMethodName}</Description>
                  <Description term="发薪周期">{formDataSource.salaryPeriodName}</Description>
                  <Description term="BU角色">{formDataSource.roleCodeName}</Description>
                  <Description term="服务方式">{formDataSource.serviceTypeName}</Description>
                  <Description term="服务时间段">
                    {formDataSource.serviceClockFrom}~{formDataSource.serviceClockTo}
                  </Description>
                  <Description term="能否出差">
                    {formDataSource.busitripFlag ? '是' : '否'}
                  </Description>
                </DescriptionList>
              </Card>
            )}
          {fieldsConfig.taskKey === ACC_A28_04 && (
            <Card
              className="tw-card-adjust"
              bordered={false}
              title={
                <Title
                  icon="profile"
                  id="ui.menu.plat.res.resCreate"
                  defaultMessage="资源用户创建"
                />
              }
            >
              <FieldList
                layout="horizontal"
                legend={formatMessage({
                  id: `app.settings.menuMap.basicMessage`,
                  desc: '基本信息',
                })}
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="personName"
                  label="姓名"
                  decorator={{
                    initialValue: formData.personName,
                  }}
                >
                  <Input placeholder="请输入姓名" disabled />
                </Field>
                <Field
                  name="foreignName"
                  label="英文名"
                  decorator={{
                    initialValue: formData.foreignName,
                  }}
                >
                  <Input placeholder="请输入英文名" disabled />
                </Field>
                <Field
                  name="enrollDate"
                  label="预定入职日期"
                  Presentational
                  decorator={{
                    initialValue: formData.enrollDate,
                  }}
                >
                  <Input placeholder="请输入预定入职日期" disabled />
                </Field>
                <Field
                  name="newEnrollDate"
                  label="实际入职日期"
                  decorator={{
                    initialValue: formData.newEnrollDate ? moment(formData.newEnrollDate) : null,
                    rules: [{ required: true, message: '请选择实际入职日期' }],
                  }}
                >
                  <DatePicker className="x-fill-100" />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                legend="用户信息"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="mobile"
                  label="手机号"
                  decorator={{
                    initialValue: formData.mobile,
                    rules: [
                      {
                        required: true,
                        message: '请输入手机号',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入手机号" />
                </Field>
                <Field
                  name="emailAddr"
                  label="邮箱"
                  decorator={{
                    initialValue: formData.emailAddr,
                    rules: [
                      {
                        required: true,
                        message: '请输入邮箱',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入邮箱" onChange={this.handleChange} />
                </Field>
                <Field
                  name="userName"
                  label="用户名"
                  decorator={{
                    initialValue: formData.userName,
                    rules: [
                      {
                        required: true,
                        message: '请输入用户名',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入用户名" disabled />
                </Field>
                <Field
                  name="userTitle"
                  label="抬头"
                  decorator={{
                    initialValue: formData.userTitle,
                    rules: [
                      {
                        required: true,
                        message: '请输入抬头',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入抬头" />
                </Field>
                <Field
                  name="loginName"
                  label="登录名"
                  decorator={{
                    initialValue: formData.loginName,
                  }}
                >
                  <Input placeholder="请输入登录名" disabled />
                </Field>
                <Field
                  name="loginPassword"
                  label="密码"
                  decorator={{
                    initialValue: formData.loginPassword,
                    rules: [
                      {
                        required: true,
                        message: '请输入密码',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入密码" />
                </Field>
              </FieldList>
            </Card>
          )}
          {fieldsConfig.taskKey !== ACC_A28_04 &&
            roles.indexOf('PLAT_IT_ADMIN') > -1 && (
              <Card
                className="tw-card-adjust"
                bordered={false}
                title={
                  <Title
                    icon="profile"
                    id="ui.menu.plat.res.resCreate"
                    defaultMessage="资源用户创建"
                  />
                }
              >
                <DescriptionList size="large" col={2} title="基本信息">
                  <Description term="姓名">{createData.personName}</Description>
                  <Description term="英文名">{createData.foreignName}</Description>
                  <Description term="入职日期">{createData.enrollDate}</Description>
                </DescriptionList>
                <DescriptionList size="large" col={2} title="用户信息">
                  <Description term="手机号">{createData.mobile}</Description>
                  <Description term="邮箱">{createData.emailAddr}</Description>
                  <Description term="用户名">{createData.userName}</Description>
                  <Description term="抬头">{createData.userTitle}</Description>
                  <Description term="登录名">{createData.loginName}</Description>
                </DescriptionList>
              </Card>
            )}

          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A28' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default EnrollDetail;
