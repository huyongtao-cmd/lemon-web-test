import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Card, Form, Input, Divider, Tooltip, InputNumber, Radio, DatePicker } from 'antd';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import { FileManagerEnhance, UdcSelect, Selection } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { pushFlowTask } from '@/services/gen/flow';
import { createConfirm } from '@/components/core/Confirm';
import { selectUsersWithBu } from '@/services/gen/list';
import { add, genFakeId } from '@/utils/mathUtils';
import moment from 'moment';
import { getUrl } from '@/utils/flowToRouter';
import { fromQs } from '@/utils/stringUtils';
import styles from '../index.less';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'growthCertificate';

@connect(({ loading, growthCertificate, dispatch }) => ({
  loading,
  growthCertificate,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class PrefCheckFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { dispatch } = this.props;
    const { id, pid, pcontractId, taskId } = fromQs();
    dispatch({
      type: 'growthCertificate/getCertFnHandle',
      payload: {
        id,
      },
    });
    taskId &&
      dispatch({
        type: `${DOMAIN}/fetchConfig`,
        payload: taskId,
      });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { validateFieldsAndScroll, getFieldDecorator, setFields },
      growthCertificate: { formData, flowForm, fieldsConfig },
    } = this.props;

    const { id, taskId, prcId, from, mode } = fromQs();
    const flowCanEdit = !(
      fieldsConfig.buttons &&
      fieldsConfig.buttons[0] &&
      fieldsConfig.buttons[0].branches &&
      fieldsConfig.buttons[0].branches[0] &&
      fieldsConfig.buttons[0].branches[0].code === 'FLOW_PASS'
    );

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {}}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark, branch } = bpmForm;
            const { key, branches } = operation;
            if (branch === 'FLOW_PASS') {
              const resultParams = {
                FLOW_PASS: 'APPROVED',
                FLOW_COMMIT: 'APPLIED',
                FLOW_RETURN: 'REJECTED',
              };
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  const params = {
                    ...formData,
                    ...values,
                    lastRenewDate: values.lastRenewDate
                      ? moment(values.lastRenewDate).format('YYYY-MM-DD')
                      : null,
                    obtainDate: values.obtainDate
                      ? moment(values.obtainDate).format('YYYY-MM-DD')
                      : null,
                    flow: {
                      branch,
                      remark,
                      result: resultParams[key],
                      taskId,
                    },
                  };
                  dispatch({
                    type: `${DOMAIN}/saveflowCertFn`,
                    payload: params,
                  });
                }
              });
              return Promise.resolve(false);
            }

            return Promise.resolve(true);
          }}
        >
          <Card
            className="tw-card-adjust"
            style={{ marginTop: '6px' }}
            title={<Title icon="profile" text="资格证书上传申请" />}
            bordered={false}
          >
            <FieldList getFieldDecorator={getFieldDecorator} col={2}>
              <Field
                name="certName"
                label="证书名称"
                decorator={{
                  initialValue: formData.certName,
                }}
              >
                <Input placeholder="请输入证书名称" disabled />
              </Field>
              <Field
                name="certNo"
                label="证书号码"
                decorator={{
                  initialValue: formData.certNo,
                  rules: [{ required: !flowCanEdit, message: '请输入证书号码' }],
                }}
              >
                <Input placeholder="请输入证书号码" disabled={flowCanEdit} />
              </Field>

              <Field
                name="attache"
                label="证书附件"
                decorator={{
                  rules: [{ required: !flowCanEdit, message: '请上传证书附件' }],
                }}
              >
                <FileManagerEnhance
                  api="/api/base/v1/resCourseApply/sfs/token"
                  dataKey={formData.id}
                  listType="text"
                  disabled={flowCanEdit}
                />
              </Field>

              <Field
                name="obtainDate"
                label="获得时间"
                decorator={{
                  initialValue: formData.obtainDate ? moment(formData.obtainDate) : null,
                }}
              >
                <DatePicker
                  placeholder="请选择获得时间"
                  className="x-fill-100"
                  disabled={flowCanEdit}
                />
              </Field>
              <FieldLine label="有效期" required={!flowCanEdit}>
                <Field
                  name="validType"
                  wrapperCol={{ span: 24, xxl: 24 }}
                  decorator={{
                    initialValue: formData.validType,
                    rules: [
                      {
                        required: !flowCanEdit,
                        message: '请选择有效期类型',
                      },
                    ],
                  }}
                >
                  <RadioGroup disabled={flowCanEdit}>
                    <Radio value="0" style={{ marginRight: 0 }}>
                      长期
                    </Radio>
                    <Radio value="1" style={{ marginRight: 0 }}>
                      定期
                    </Radio>
                  </RadioGroup>
                </Field>

                <Field
                  name="validMonths"
                  wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
                  decorator={{
                    initialValue: formData.validMonths,
                    rules: [
                      {
                        required: formData.validType === '1' && !flowCanEdit,
                        message: '请输入有效期',
                      },
                    ],
                  }}
                >
                  <Input
                    placeholder="有效期"
                    addonAfter="个月"
                    disabled={flowCanEdit || formData.validType === '0'}
                  />
                </Field>
              </FieldLine>
              <Field
                name="lastRenewDate"
                label="上次认证时间"
                decorator={{
                  initialValue: formData.lastRenewDate ? moment(formData.lastRenewDate) : null,
                }}
              >
                <DatePicker
                  placeholder="请选择上次认证时间"
                  className="x-fill-100"
                  disabled={flowCanEdit || formData.validType === '0'}
                />
              </Field>

              <Field
                name="score"
                label="分数"
                decorator={{
                  initialValue: formData.score,
                }}
              >
                <Input placeholder="请输入分数" disabled={flowCanEdit} />
              </Field>

              <Field
                name="grade"
                label="等级"
                decorator={{
                  initialValue: formData.grade,
                }}
              >
                <Input placeholder="请输入等级" disabled={flowCanEdit} />
              </Field>
              <Field
                name="releaseBy"
                label="颁发机构"
                decorator={{
                  initialValue: formData.releaseBy,
                }}
              >
                <Input placeholder="请输入颁发机构" disabled={flowCanEdit} />
              </Field>

              <Field
                name="certDesc"
                label="证书说明"
                decorator={{
                  initialValue: formData.certDesc,
                }}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
              >
                <Input.TextArea rows={3} placeholder="请输入证书说明" disabled={flowCanEdit} />
              </Field>
              <Field
                name="capaLevelName"
                label="相关能力"
                decorator={{
                  initialValue: formData.capaLevelName,
                }}
              >
                <Input placeholder="请输入相关能力" disabled />
              </Field>
              <Field
                name="capaAbilityName"
                label="相关考核点"
                decorator={{
                  initialValue: formData.capaAbilityName,
                }}
              >
                <Input placeholder="请输入相关考核点" disabled />
              </Field>
              <Field
                name="applyResName"
                label="申请人"
                decorator={{
                  initialValue: formData.applyResName,
                }}
              >
                <Input placeholder="请输入申请人" disabled />
              </Field>
              <Field
                name="applyDate"
                label="申请日期"
                decorator={{
                  initialValue: formData.applyDate,
                }}
              >
                <Input placeholder="请输入申请日期" disabled />
              </Field>
            </FieldList>
          </Card>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckFlow;
