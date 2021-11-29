import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { isEmpty, isNil, hasIn } from 'ramda';
import classnames from 'classnames';
import { Button, Card, DatePicker, Form, Input, InputNumber } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';
import { fromQs } from '@/utils/stringUtils';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'changeBaseSsDetail';

@connect(({ loading, changeBaseSsDetail, dispatch }) => ({
  loading,
  changeBaseSsDetail,
  dispatch,
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
class ChangeBase extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();
    taskId && dispatch({ type: `${DOMAIN}/fetchConfig`, payload: taskId });
    // dispatch({
    //   type: `${DOMAIN}/updateState`,
    //   payload: {
    //     formData: {},
    //   },
    // });
    dispatch({
      type: `${DOMAIN}/getDetail`,
      payload: { id },
    });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      changeBaseSsDetail: { formData, resData, baseBuData, fieldsConfig, flowForm },
    } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/queryResDetail`];
    const { mode } = fromQs();
    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig} // 获取json文件配置信息
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { key } = operation;
            const {
              form: { validateFieldsAndScroll },
            } = this.props;
            if (key === 'FLOW_RETURN') {
              return Promise.resolve(true);
            }
            validateFieldsAndScroll((error, values) => {
              if (!error) {
                const { costAdd } = values;
                const { remark, cc, branch } = bpmForm;
                const { id, taskId, prcId, from } = fromQs();
                const flow = {};
                flow.taskId = taskId;
                flow.branch = branch;
                flow.remark = remark;
                flow.ccCrowd = cc;
                flow.result = 'APPROVED';
                // flow.doc = {};
                dispatch({
                  type: `${DOMAIN}/submit`,
                  payload: { costAdd, flow },
                }).then(res => {
                  if (res.ok) {
                    closeThenGoto(
                      `/user/changeBase/review?id=${id}&prcId=${prcId}&taskId=${taskId}&mode=view&from=${from}`
                    );
                  }
                });
              }
            });
            return Promise.resolve(false);
          }}
        >
          <Card
            className="tw-card-adjust"
            style={{ marginTop: '6px' }}
            title={
              <Title
                icon="profile"
                id="ui.menu.user.changeBase.create"
                defaultMessage="Base地与社保公积金缴纳地变更申请"
              />
            }
            bordered={false}
          >
            <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
              <Field
                name="applyResId"
                label="申请人"
                decorator={{
                  initialValue: formData.applyResId || '',
                  rules: [
                    {
                      required: fieldsConfig.taskKey === 'ORG_G02_01_SUBMIT_i',
                      message: '请选择申请人',
                    },
                  ],
                }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={resData}
                  columns={particularColumns}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  disabled={fieldsConfig.taskKey !== 'ORG_G02_01_SUBMIT_i'}
                  onColumnsChange={value => {
                    if (value && value.id) {
                      const { id } = value;
                      dispatch({
                        type: `${DOMAIN}/queryResDetail`,
                        payload: id,
                      });
                    }
                  }}
                />
              </Field>
              <Field
                name="applyDate"
                label="申请日期"
                decorator={{
                  initialValue: moment(formData.applyDate),
                }}
              >
                <DatePicker disabled className="x-fill-100" />
              </Field>
              <Field
                name="enrollDate"
                label="入职日期"
                decorator={{
                  initialValue: formData.enrollDate ? moment(formData.enrollDate) : null,
                }}
              >
                <DatePicker disabled className="x-fill-100" />
              </Field>
              <Field
                name="coopType"
                label="合作方式"
                decorator={{
                  initialValue: formData.coopTypeName || '',
                }}
              >
                <Input disabled placeholder="系统自动生成" />
              </Field>
              <Field
                name="ouId"
                label="所属公司"
                decorator={{
                  initialValue: formData.ouId || '',
                }}
              >
                <Selection
                  source={() => selectInternalOus()}
                  placeholder="请选择所属公司"
                  disabled
                />
              </Field>
              <Field
                name="baseBuId"
                label="BaseBU"
                decorator={{
                  initialValue: formData.baseBuId || '',
                }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={baseBuData}
                  columns={particularColumns}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  onColumnsChange={value => {}}
                  disabled
                />
              </Field>
              <Field
                name="oldBaseCity"
                label="原Base地"
                decorator={{
                  initialValue: formData.oldBaseCity,
                }}
              >
                <Selection.UDC disabled code="COM.CITY" placeholder="请选择Base地" />
              </Field>
              <Field
                name="newBaseCity"
                label="新Base地"
                decorator={{
                  initialValue: formData.newBaseCity,
                  rules: [
                    {
                      required: fieldsConfig.taskKey === 'ORG_G02_01_SUBMIT_i',
                      message: '请选择新Base地',
                    },
                  ],
                }}
              >
                <Selection.UDC
                  disabled={fieldsConfig.taskKey !== 'ORG_G02_01_SUBMIT_i'}
                  code="COM.CITY"
                  placeholder="请选择Base地"
                />
              </Field>
              <Field
                name="oldSecurityPl"
                label="原社保缴纳地"
                decorator={{
                  initialValue: formData.oldSecurityPl,
                  rules: [
                    {
                      required: fieldsConfig.taskKey === 'ORG_G02_01_SUBMIT_i',
                      message: '请选择原社保缴纳地',
                    },
                  ],
                }}
              >
                <Selection.UDC
                  disabled={fieldsConfig.taskKey !== 'ORG_G02_01_SUBMIT_i'}
                  code="COM.CITY"
                  placeholder="请选择社保缴纳地"
                />
              </Field>
              <Field
                name="newSecurityPl"
                label="新社保缴纳地"
                decorator={{
                  initialValue: formData.newSecurityPl,
                  rules: [
                    {
                      required: fieldsConfig.taskKey === 'ORG_G02_01_SUBMIT_i',
                      message: '请选择新社保缴纳地地',
                    },
                  ],
                }}
              >
                <Selection.UDC
                  disabled={fieldsConfig.taskKey !== 'ORG_G02_01_SUBMIT_i'}
                  code="COM.CITY"
                  placeholder="请选择社保缴纳地"
                />
              </Field>
              <Field
                name="chgReason"
                label="变更原因"
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                decorator={{
                  initialValue: formData.chgReason || '',
                  rules: [
                    {
                      required: fieldsConfig.taskKey === 'ORG_G02_01_SUBMIT_i',
                      message: '请输入变更原因',
                    },
                  ],
                }}
              >
                <Input.TextArea
                  disabled={fieldsConfig.taskKey !== 'ORG_G02_01_SUBMIT_i'}
                  rows={3}
                  placeholder="请输入变更原因"
                />
              </Field>
              {formData.costAdd &&
              fieldsConfig.taskKey &&
              fieldsConfig.taskKey !== 'ORG_G02_02_MONEY_CHARGER_CHK' ? (
                <Field
                  name="costAdd"
                  label="新增成本"
                  decorator={{
                    initialValue: formData.costAdd || '',
                    rules: [
                      {
                        required: mode !== 'view',
                        message: '请输入新增成本',
                      },
                    ],
                  }}
                >
                  <Input type="number" disabled placeholder="请输入新增成本" addonAfter="元" />
                </Field>
              ) : null}
              {fieldsConfig.taskKey === 'ORG_G02_02_MONEY_CHARGER_CHK' ? (
                <Field
                  name="costAdd"
                  label="新增成本"
                  decorator={{
                    initialValue: formData.costAdd || '',
                    rules: [
                      {
                        required: true,
                        message: '请输入新增成本',
                      },
                    ],
                  }}
                >
                  <Input type="number" placeholder="请输入新增成本" addonAfter="元" />
                </Field>
              ) : null}
              {formData.effDate && fieldsConfig.taskKey !== 'ORG_G02_05_PERSONEL_SPECIAL_CHK' ? (
                <Field
                  name="effDate"
                  label="生效日期"
                  decorator={{
                    initialValue: moment(formData.effDate || new Date()),
                    rules: [
                      {
                        required: false,
                        message: '请选择生效日期',
                      },
                    ],
                  }}
                >
                  <DatePicker disabled className="x-fill-100" />
                </Field>
              ) : null}
              {fieldsConfig.taskKey === 'ORG_G02_05_PERSONEL_SPECIAL_CHK' ? (
                <Field
                  name="effDate"
                  label="生效日期"
                  decorator={{
                    // initialValue: moment(formData.effDate || new Date()),
                    rules: [
                      {
                        required: true,
                        message: '请选择生效日期',
                      },
                    ],
                  }}
                >
                  <DatePicker className="x-fill-100" />
                </Field>
              ) : null}
            </FieldList>
          </Card>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default ChangeBase;
