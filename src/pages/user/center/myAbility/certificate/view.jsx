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
            title={<Title icon="profile" text="????????????????????????" />}
            bordered={false}
          >
            <FieldList getFieldDecorator={getFieldDecorator} col={2}>
              <Field
                name="certName"
                label="????????????"
                decorator={{
                  initialValue: formData.certName,
                }}
              >
                <Input placeholder="?????????????????????" disabled />
              </Field>
              <Field
                name="certNo"
                label="????????????"
                decorator={{
                  initialValue: formData.certNo,
                  rules: [{ required: !flowCanEdit, message: '?????????????????????' }],
                }}
              >
                <Input placeholder="?????????????????????" disabled={flowCanEdit} />
              </Field>

              <Field
                name="attache"
                label="????????????"
                decorator={{
                  rules: [{ required: !flowCanEdit, message: '?????????????????????' }],
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
                label="????????????"
                decorator={{
                  initialValue: formData.obtainDate ? moment(formData.obtainDate) : null,
                }}
              >
                <DatePicker
                  placeholder="?????????????????????"
                  className="x-fill-100"
                  disabled={flowCanEdit}
                />
              </Field>
              <FieldLine label="?????????" required={!flowCanEdit}>
                <Field
                  name="validType"
                  wrapperCol={{ span: 24, xxl: 24 }}
                  decorator={{
                    initialValue: formData.validType,
                    rules: [
                      {
                        required: !flowCanEdit,
                        message: '????????????????????????',
                      },
                    ],
                  }}
                >
                  <RadioGroup disabled={flowCanEdit}>
                    <Radio value="0" style={{ marginRight: 0 }}>
                      ??????
                    </Radio>
                    <Radio value="1" style={{ marginRight: 0 }}>
                      ??????
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
                        message: '??????????????????',
                      },
                    ],
                  }}
                >
                  <Input
                    placeholder="?????????"
                    addonAfter="??????"
                    disabled={flowCanEdit || formData.validType === '0'}
                  />
                </Field>
              </FieldLine>
              <Field
                name="lastRenewDate"
                label="??????????????????"
                decorator={{
                  initialValue: formData.lastRenewDate ? moment(formData.lastRenewDate) : null,
                }}
              >
                <DatePicker
                  placeholder="???????????????????????????"
                  className="x-fill-100"
                  disabled={flowCanEdit || formData.validType === '0'}
                />
              </Field>

              <Field
                name="score"
                label="??????"
                decorator={{
                  initialValue: formData.score,
                }}
              >
                <Input placeholder="???????????????" disabled={flowCanEdit} />
              </Field>

              <Field
                name="grade"
                label="??????"
                decorator={{
                  initialValue: formData.grade,
                }}
              >
                <Input placeholder="???????????????" disabled={flowCanEdit} />
              </Field>
              <Field
                name="releaseBy"
                label="????????????"
                decorator={{
                  initialValue: formData.releaseBy,
                }}
              >
                <Input placeholder="?????????????????????" disabled={flowCanEdit} />
              </Field>

              <Field
                name="certDesc"
                label="????????????"
                decorator={{
                  initialValue: formData.certDesc,
                }}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
              >
                <Input.TextArea rows={3} placeholder="?????????????????????" disabled={flowCanEdit} />
              </Field>
              <Field
                name="capaLevelName"
                label="????????????"
                decorator={{
                  initialValue: formData.capaLevelName,
                }}
              >
                <Input placeholder="?????????????????????" disabled />
              </Field>
              <Field
                name="capaAbilityName"
                label="???????????????"
                decorator={{
                  initialValue: formData.capaAbilityName,
                }}
              >
                <Input placeholder="????????????????????????" disabled />
              </Field>
              <Field
                name="applyResName"
                label="?????????"
                decorator={{
                  initialValue: formData.applyResName,
                }}
              >
                <Input placeholder="??????????????????" disabled />
              </Field>
              <Field
                name="applyDate"
                label="????????????"
                decorator={{
                  initialValue: formData.applyDate,
                }}
              >
                <Input placeholder="?????????????????????" disabled />
              </Field>
            </FieldList>
          </Card>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckFlow;
