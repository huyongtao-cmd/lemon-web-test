/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { InputNumber, Form, Input, Row, Col, Card, Tabs, Timeline, Button } from 'antd';
import { mountToTab, closeThenGoto, markAsTab, markAsNoTab } from '@/layouts/routerControl';
import Loading from '@/components/core/DataLoading';
import FieldList from '@/components/layout/FieldList';
import moment from 'moment';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';
import Title from '@/components/layout/Title';
import { isEmpty, isNil } from 'ramda';
import { mul, div } from '@/utils/mathUtils';
import { UdcSelect, FileManagerEnhance, Selection, DatePicker } from '@/pages/gen/field';
import { getUrl } from '@/utils/flowToRouter';
import { selectBus, selectCusts, selectIamUsers, selectInternalOus } from '@/services/gen/list';
import classnames from 'classnames';
import { selectUsers, selectProject } from '@/services/user/project/projectLogList';

const { Field } = FieldList;
const { TabPane } = Tabs;

const DOMAIN = 'projectLogApproval';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, projectLogApproval, dispatch, user }) => ({
  loading,
  projectLogApproval,
  dispatch,
  user: user.user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.projectLogApproval;
    const fields = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField(formData[key]);
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class logApproval extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { mode, logId, problemId } = fromQs();
    if (mode === 'approvalEdit') {
      dispatch({
        type: `${DOMAIN}/getProjectApprovalInfoById`,
        payload: { mode, projectId: isNil(logId) ? '' : logId },
      }).then(res => {
        dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: { pageNo: 'PROJECT_LOG_Approval' },
        });
      });
    }
    if (mode === 'approvalAdd') {
      dispatch({
        type: `${DOMAIN}/getProjectApprovalInfoById`,
        payload: { mode, projectId: isNil(logId) ? '' : logId },
      }).then(res => {
        dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: { pageNo: 'PROJECT_LOG_Approval' },
        });
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        formData: {},
        submitClicked: false,
      },
    });
  }

  handleSubmit = lockFlag => () => {
    const { taskId } = fromQs();
    const { mode, logId, problemId } = fromQs();
    const projectId = { projectId: logId };
    const projectLogId = { projectLogId: logId };
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      projectLogApproval,
    } = this.props;
    const { formData } = projectLogApproval;
    const lockFlagToBack = { lockFlag };
    const respUserIdData = formData.respUserId;

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        submitClicked: true,
      },
    });

    const form = {
      ...formData,
      ...projectId,
      ...projectLogId,
    };
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            mode,
            values: { ...form, ...values },
          },
        }).then(response => {
          if (response.ok) {
            if (taskId) {
              dispatch({
                type: `${DOMAIN}/approveSubmit`,
                payload: {
                  taskId,
                  result: 'APPLIED',
                  remark: '提交',
                },
              });
            }

            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto('/user/project/logList?_refresh=0');
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  handleBack = lockFlag => () => {
    const { logId } = fromQs();
    router.push(`/user/project/logEdit?mode=edit&logId=${logId}`);
  };

  render() {
    const { user } = this.props;
    const currentUserId = user.extInfo.resId;
    const {
      loading,
      form: { getFieldDecorator },
      projectLogApproval,
    } = this.props;
    const { submitClicked } = projectLogApproval;
    const { pageConfig } = projectLogApproval;
    // 列表展示字段的可配置化
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }

    // let currentListConfig = [];

    const currentListConfig = pageConfig.pageBlockViews[0];

    const { pageFieldViews: pageFieldViewsList } = currentListConfig;
    const pageFieldJsonList = {};
    if (pageFieldViewsList) {
      pageFieldViewsList.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }

    const { mode } = fromQs();
    const { formData } = projectLogApproval;
    const titleData = formData.title;
    const currentUserName = user.extInfo.resName;
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="rollback"
            size="large"
            disabled=""
            onClick={this.handleBack(1)}
          >
            返回上一步
          </Button>

          <Button
            className="tw-btn-primary"
            icon="save"
            loading={submitClicked}
            size="large"
            onClick={this.handleSubmit(0)}
            disabled=""
          >
            提交
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleBack(1)}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="项目日志审批" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            {pageFieldJsonList.applyUserId.visibleFlag === 1 && (
              <Field
                name="applyUserId"
                label={pageFieldJsonList.applyUserId.displayName}
                decorator={{
                  rules: [
                    {
                      required: !!pageFieldJsonList.applyUserId.requiredFlag,
                      message: '请选择申请人',
                    },
                  ],
                  initialValue: formData.applyUserId || currentUserId,
                }}
              >
                <Selection.Columns
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  columns={particularColumns}
                  source={() => selectUsers()}
                  placeholder="请选择申请人"
                  showSearch
                  disabled
                />
              </Field>
            )}
            {pageFieldJsonList.applyTime.visibleFlag === 1 && (
              <Field
                name="applyTime"
                label={pageFieldJsonList.applyTime.displayName}
                decorator={{
                  rules: [
                    {
                      required: !!pageFieldJsonList.applyTime.requiredFlag,
                      message: '申请时间',
                    },
                  ],
                  initialValue: moment(),
                }}
              >
                <DatePicker
                  className="x-fill-100"
                  format="YYYY-MM-DD"
                  placeholder="申请时间"
                  disabled
                />
              </Field>
            )}
          </FieldList>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            {pageFieldJsonList.demandType.visibleFlag === 1 && (
              <Field
                name="demandType"
                label={pageFieldJsonList.demandType.displayName}
                decorator={{
                  rules: [
                    {
                      required: !!pageFieldJsonList.demandType.requiredFlag,
                      message: '请选择需求类型',
                    },
                  ],
                  initialValue: formData.demandType || '05',
                }}
              >
                <UdcSelect code="ACC:PROJECT_LOG_TYPE" placeholder="请选择需求类型" disabled />
              </Field>
            )}
            {pageFieldJsonList.requiredHours.visibleFlag === 1 && (
              <Field
                name="requiredHours"
                label={pageFieldJsonList.requiredHours.displayName}
                decorator={{
                  initialValue: formData.requiredHours ? formData.requiredHours : 0,
                  rules: [
                    {
                      required: !!pageFieldJsonList.requiredHours.requiredFlag,
                      message: '请输入所需工时',
                    },
                  ],
                }}
              >
                <InputNumber
                  precision={0}
                  min={0}
                  max={999999999999}
                  placeholder="请输入所需工时"
                  className="x-fill-100"
                />
              </Field>
            )}
          </FieldList>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            {pageFieldJsonList.chargeHours.visibleFlag === 1 && (
              <Field
                name="chargeHours"
                label={pageFieldJsonList.chargeHours.displayName}
                decorator={{
                  initialValue: formData.chargeHours ? formData.chargeHours : 0,
                  rules: [
                    {
                      required: !!pageFieldJsonList.chargeHours.requiredFlag,
                      message: '请输入收费工时',
                    },
                  ],
                }}
              >
                <InputNumber
                  precision={0}
                  min={0}
                  max={999999999999}
                  placeholder="请输入收费工时"
                  className="x-fill-100"
                />
              </Field>
            )}
            {pageFieldJsonList.chargeAmt.visibleFlag === 1 && (
              <Field
                name="chargeAmt"
                label={pageFieldJsonList.chargeAmt.displayName}
                decorator={{
                  initialValue: formData.chargeAmt ? formData.chargeAmt : 0,
                  rules: [
                    {
                      required: !!pageFieldJsonList.chargeAmt.requiredFlag,
                      message: '请输入收费金额',
                    },
                  ],
                }}
              >
                <InputNumber
                  precision={0}
                  min={0}
                  max={999999999999}
                  placeholder="请输入收费金额"
                  className="x-fill-100"
                />
              </Field>
            )}
          </FieldList>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            {pageFieldJsonList.expectedBenefits.visibleFlag === 1 && (
              <Field
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                name="expectedBenefits"
                label={pageFieldJsonList.expectedBenefits.displayName}
                decorator={{
                  initialValue: formData.expectedBenefits ? formData.expectedBenefits : '',
                  rules: [
                    {
                      required: !!pageFieldJsonList.expectedBenefits.requiredFlag,
                      message: '预期效益评估',
                    },
                  ],
                }}
              >
                <Input.TextArea autosize={{ minRows: 5, maxRows: 8 }} className="x-fill-100" />
              </Field>
            )}
          </FieldList>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            {pageFieldJsonList.backgroundDemand.visibleFlag === 1 && (
              <Field
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                name="backgroundDemand"
                label={pageFieldJsonList.backgroundDemand.displayName}
                decorator={{
                  initialValue: formData.backgroundDemand ? formData.backgroundDemand : '',
                  rules: [
                    {
                      required: !!pageFieldJsonList.backgroundDemand.requiredFlag,
                      message: '需求背景',
                    },
                  ],
                }}
              >
                <Input.TextArea autosize={{ minRows: 5, maxRows: 8 }} className="x-fill-100" />
              </Field>
            )}
          </FieldList>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            {pageFieldJsonList.demandDescribe.visibleFlag === 1 && (
              <Field
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                name="demandDescribe"
                label={pageFieldJsonList.demandDescribe.displayName}
                decorator={{
                  initialValue: formData.demandDescribe ? formData.demandDescribe : '',
                  rules: [
                    {
                      required: !!pageFieldJsonList.demandDescribe.requiredFlag,
                      message: '需求描述',
                    },
                  ],
                }}
              >
                <Input.TextArea autosize={{ minRows: 5, maxRows: 8 }} className="x-fill-100" />
              </Field>
            )}
          </FieldList>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            {pageFieldJsonList.demandTarget.visibleFlag === 1 && (
              <Field
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                name="demandTarget"
                label={pageFieldJsonList.demandTarget.displayName}
                decorator={{
                  initialValue: formData.demandTarget ? formData.demandTarget : '',
                  rules: [
                    {
                      required: !!pageFieldJsonList.demandTarget.requiredFlag,
                      message: '需求目标',
                    },
                  ],
                }}
              >
                <Input.TextArea autosize={{ minRows: 5, maxRows: 8 }} className="x-fill-100" />
              </Field>
            )}
          </FieldList>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="attache"
              label={formatMessage({
                id: `ui.menu.user.expense.form.attache`,
                desc: '相关附件',
              })}
              decorator={{
                initialValue: formData.id || undefined,
              }}
            >
              <FileManagerEnhance
                api="/api/op/v1/projectLog/demand/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default logApproval;
