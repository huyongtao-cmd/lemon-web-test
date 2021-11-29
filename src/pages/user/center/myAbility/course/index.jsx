import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Card, Form, Input, Divider, Tooltip, InputNumber, Radio } from 'antd';
import moment from 'moment';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { pushFlowTask } from '@/services/gen/flow';
import { createConfirm } from '@/components/core/Confirm';
import { add, genFakeId } from '@/utils/mathUtils';
import { selectUsersWithBu, selectCapasetLevel } from '@/services/gen/list';
import { UdcSelect, Selection } from '@/pages/gen/field';
import { getUrl } from '@/utils/flowToRouter';
import { fromQs } from '@/utils/stringUtils';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'growthCourse';

@connect(({ loading, growthCourse, dispatch }) => ({
  loading,
  growthCourse,
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
class Course extends Component {
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
      type: `${DOMAIN}/query`,
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
      form: { getFieldDecorator, validateFieldsAndScroll },
      growthCourse: { formData, flowForm, fieldsConfig },
    } = this.props;

    const { taskKey, buttons } = fieldsConfig;
    const { id, taskId, prcId, from, mode } = fromQs();

    return (
      <PageHeaderWrapper>
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
            const { remark, branch } = bpmForm;
            const { key, branches } = operation;
            const resultParams = {
              FLOW_PASS: 'APPROVED',
              FLOW_COMMIT: 'APPLIED',
              FLOW_RETURN: 'REJECTED',
            };
            validateFieldsAndScroll((error, values) => {
              if (!error) {
                const params = {
                  ...formData,
                  flow: {
                    branch,
                    remark,
                    result: resultParams[key],
                    taskId,
                  },
                };
                dispatch({
                  type: `${DOMAIN}/courseApplyHandle`,
                  payload: params,
                });
              }
            });
            return Promise.resolve(false);
          }}
        >
          <Card
            className="tw-card-adjust"
            style={{ marginTop: '6px' }}
            title={<Title icon="profile" text="培训课程权限申请" />}
            bordered={false}
          >
            <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
              <Field
                name="applyResId"
                label="申请人"
                decorator={{
                  initialValue: formData.applyResId || '',
                }}
              >
                <Selection.Columns
                  source={selectUsersWithBu}
                  columns={[
                    { dataIndex: 'code', title: '编号', span: 10 },
                    { dataIndex: 'name', title: '名称', span: 14 },
                  ]}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  placeholder="申请人"
                  disabled
                />
              </Field>
              <Field
                name="applyDate"
                label="申请日期"
                decorator={{
                  initialValue: formData.applyDate || '',
                }}
              >
                <Input disabled placeholder="申请日期" />
              </Field>

              <Field
                name="baseBu"
                label="BaseBU"
                decorator={{
                  initialValue: formData.baseBu || '',
                }}
              >
                <Input disabled placeholder="baseBu" />
              </Field>
              <Field
                name="presId"
                label="上级资源"
                decorator={{
                  initialValue: formData.presId || '',
                }}
              >
                <Selection.Columns
                  source={selectUsersWithBu}
                  columns={[
                    { dataIndex: 'code', title: '编号', span: 10 },
                    { dataIndex: 'name', title: '名称', span: 14 },
                  ]}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  placeholder="上级资源"
                  disabled
                />
              </Field>
              <Field
                name="resTypeName"
                label="资源类型"
                decorator={{
                  initialValue: formData.resTypeName || '',
                }}
              >
                <Input disabled placeholder="资源类型" />
              </Field>
              <Field
                name="courseNo"
                label="申请课程"
                decorator={{
                  initialValue: formData.courseNo || '',
                }}
              >
                <Input disabled placeholder="申请课程" />
              </Field>
              <Field
                name="capaLevelName"
                label="相关能力"
                decorator={{
                  initialValue: formData.capaLevelName || '',
                }}
              >
                <Input disabled placeholder="相关能力" />
              </Field>
              <Field
                name="capaAbilityName"
                label="相关考核点"
                decorator={{
                  initialValue: formData.capaAbilityName || '',
                }}
              >
                <Input disabled placeholder="相关考核点" />
              </Field>
              <Field
                name="accessFlag"
                label="开放课程权限"
                decorator={{
                  initialValue: formData.accessFlag || '',
                  rules: [{ required: mode !== 'view', message: '请选择是否开放课程权限' }],
                }}
              >
                <RadioGroup disabled={mode === 'view'}>
                  <Radio value="YES">是</Radio>
                  <Radio value="NO">否</Radio>
                </RadioGroup>
              </Field>
            </FieldList>
          </Card>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default Course;
