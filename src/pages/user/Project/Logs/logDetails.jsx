/* eslint-disable no-nested-ternary,react/no-danger */
import React, { PureComponent } from 'react';
import Link from 'umi/link';
import { connect } from 'dva';
import router from 'umi/router';
import { InputNumber, Form, Input, Row, Col, Card, Tabs, Divider, Timeline, Button } from 'antd';
import { mountToTab, closeThenGoto, markAsTab, markAsNoTab } from '@/layouts/routerControl';
import Loading from '@/components/core/DataLoading';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';
import Title from '@/components/layout/Title';
import { isEmpty, isNil } from 'ramda';
import { mul, div } from '@/utils/mathUtils';
import classnames from 'classnames';
import { UdcSelect, FileManagerEnhance, Selection, DatePicker } from '@/pages/gen/field';
import { getUrl } from '@/utils/flowToRouter';
import Ueditor from '@/components/common/Ueditor';
import { selectBus, selectCusts, selectIamUsers, selectInternalOus } from '@/services/gen/list';
import { selectProject } from '@/services/user/project/projectLogList';
import { selectUsers } from '@/services/sys/user';
import styles from './style.less';
import stylesLogDetail from './logDetails.less';
import zenStyle from './logDetailCss/ZentaoImg.less';
import AddHistory from './modal/AddHistory';
import AddRecord from './modal/AddRecord';
import { createConfirm } from '@/components/core/Confirm';

const { Field } = FieldList;
const { TabPane } = Tabs;

const DOMAIN = 'projectLogDetails';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, projectLogDetails, dispatch, user }) => ({
  loading,
  projectLogDetails,
  dispatch,
  user: user.user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.projectLogDetails;
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

    if (name === 'responsibilityUserId') {
      const respUserId = { respUserId: value };
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: respUserId,
      });
      return;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class logDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      visibleRecord: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { mode, logId } = fromQs();
    if (mode === 'detail') {
      dispatch({
        type: `${DOMAIN}/toDetailView`,
        payload: { mode, id: isNil(logId) ? '' : logId },
      }).then(res => {
        dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: { pageNo: 'PROJECT_LOG_Detail' },
        });
        dispatch({
          type: `${DOMAIN}/getProjectApprovalById`,
          payload: { mode, projectId: isNil(logId) ? '' : logId },
        });
        dispatch({
          type: `${DOMAIN}/findProjectChangeLogList`,
          payload: {
            mode,
            changeId: isNil(logId) ? '' : logId,
            offset: 0,
            limit: 5,
            sortBy: 'id',
            sortDirection: 'DESC',
          },
        });
        dispatch({
          type: `${DOMAIN}/findProjectRecordList`,
          payload: { mode, changeId: isNil(logId) ? '' : logId },
        });
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {},
        loadFinish: false,
        timelineDataCount: 0,
        loadMoreLoading: false,
      },
    });
  }

  loadMore = params => () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      projectLogDetails,
    } = this.props;
    const { mode, logId } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        loadMoreLoading: true,
      },
    });
    dispatch({
      type: `${DOMAIN}/findProjectChangeLogList`,
      payload: {
        mode,
        changeId: isNil(logId) ? '' : logId,
        offset: 0,
        limit: 10000,
        sortBy: 'id',
        sortDirection: 'DESC',
      },
    });
  };

  goTask = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      projectLogDetails,
    } = this.props;
    const { formData } = projectLogDetails;
    router.push(`/user/task/view?id=${formData.taskId}&from=/user/project/logList`);
  };

  goProc = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      projectLogDetails,
    } = this.props;
    const { formData } = projectLogDetails;
    router.push(
      `/user/project/logApprovalDetail?currentMode=detail&demandId=${formData.demandId}&prcId=${
        formData.procId
      }&taskId=&mode=view&from=http%3A%2F%2Flocalhost%3A3001%2Fuser%2Fflow%2Fprocess%3Ftype%3Dprocs`
    );
  };

  handleSubmit = lockFlag => () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      projectLogDetails,
    } = this.props;
    const contentDescriptionEditor = this.editorContent.getContent();
    const solutionEditor = this.editorPlan.getContent();
    const { formData } = projectLogDetails;
    const { timelineData } = projectLogDetails;
    const { approvalData } = projectLogDetails;
    const { mode } = fromQs();
    const lockFlagToBack = { lockFlag };
    const form = {
      ...formData,
      contentDescription: contentDescriptionEditor,
      solution: solutionEditor,
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
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto('/user/project/logList');
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  toggleVisibleRecord = () => {
    const { visibleRecord } = this.state;
    this.setState({ visibleRecord: !visibleRecord });
  };

  doChange = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      projectLogDetails,
    } = this.props;
    const { formData } = projectLogDetails;
    const logId = formData.id;
    closeThenGoto(`/user/project/logChange?mode=change&logId=${logId}`);
  };

  goBackProject = () => {
    closeThenGoto('/user/project/logList');
  };

  doEdit = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      projectLogDetails,
    } = this.props;
    const { formData } = projectLogDetails;
    const logId = formData.id;
    const taskNameTemp = formData.taskName;
    const apprStatusTemp = formData.apprStatus;
    const belongsTypeTemp = formData.belongsType;
    closeThenGoto(`/user/project/logEdit?mode=edit&logId=${logId}`);
  };

  doDelete = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      projectLogDetails,
    } = this.props;
    const { formData } = projectLogDetails;
    const logId = formData.id;
    const taskNameTemp = formData.taskName;
    const apprStatusTemp = formData.apprStatus;
    const belongsTypeTemp = formData.belongsType;
    let errorFlag = false;
    if (belongsTypeTemp === '05' && apprStatusTemp !== 'NOTSUBMIT') {
      errorFlag = true;
    }
    if (errorFlag) {
      createMessage({ type: 'error', description: '不允许删除已生成审批流程数据' });
    } else {
      createConfirm({
        content: '确认删除所选记录？',
        onOk: () =>
          dispatch({
            type: `${DOMAIN}/delete`,
            payload: { ids: logId },
          }),
      });
    }
  };

  render() {
    const { user } = this.props;
    const { visible } = this.state;
    const { visibleRecord } = this.state;
    const {
      loading,
      form: { getFieldDecorator },
      projectLogDetails,
    } = this.props;
    const { loadFinish } = projectLogDetails;
    const { mode, logId } = fromQs();
    let showNoData = false;
    if (mode === 'turned') {
      showNoData = true;
    }
    const { pageConfig } = projectLogDetails;
    // 列表展示字段的可配置化
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }

    const currentListConfig = pageConfig.pageBlockViews[0];
    const currentDemandConfig = pageConfig.pageBlockViews[1];

    const { pageFieldViews: pageFieldViewsList } = currentListConfig;
    const { pageFieldViews: pageFieldViewsDemand } = currentDemandConfig;
    const pageFieldJsonList = {};
    const pageFieldJsonDemand = {};
    if (pageFieldViewsList) {
      pageFieldViewsList.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsDemand) {
      pageFieldViewsDemand.forEach(field => {
        pageFieldJsonDemand[field.fieldKey] = field;
      });
    }

    const { formData } = projectLogDetails;
    const { timelineData } = projectLogDetails;
    const { approvalData } = projectLogDetails;
    const { recordData } = projectLogDetails;
    const { timelineDataCount } = projectLogDetails;
    let showMoreFlag = false;
    const { loadMoreLoading } = projectLogDetails;
    if (timelineDataCount > timelineData.length) {
      showMoreFlag = true;
    }
    const titleData = formData.title;
    const currentUserName = user.extInfo.resName;
    return (
      <PageHeaderWrapper>
        {!loadFinish ? (
          <Loading />
        ) : (
          <div>
            {pageFieldJsonList.title.visibleFlag === 1 && (
              <Card className="tw-card-rightLine">
                <div style={{ display: 'inline-block', lineHeigh: '34px' }}>
                  <span className={zenStyle.labelid}>{formData.logNumber}</span>
                  <span className={zenStyle.formDataTitle}>{formData.title}</span>
                </div>
              </Card>
            )}
            <div className="tw-card-adjust" style={{ marginTop: '5px' }}>
              <Row gutter={10}>
                <Col span={14}>
                  {pageFieldJsonList.contentDescription.visibleFlag === 1 && (
                    <Card className={zenStyle.contentDescription}>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                        }}
                      >
                        {pageFieldJsonList.contentDescription.displayName}
                      </div>
                      {/* eslint-disable-next-line react/no-danger */}
                      <div dangerouslySetInnerHTML={{ __html: formData.contentDescription }} />
                    </Card>
                  )}
                  {pageFieldJsonList.solution.visibleFlag === 1 && (
                    <div style={{ marginTop: '5px' }}>
                      <Card className={zenStyle.solution}>
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: '700',
                          }}
                        >
                          {pageFieldJsonList.solution.displayName}
                        </div>
                        {/* eslint-disable-next-line react/no-danger */}
                        <div dangerouslySetInnerHTML={{ __html: formData.solution }} />
                      </Card>
                    </div>
                  )}
                </Col>
                <Col span={10}>
                  <Card
                    style={{
                      minHeight: this.rightCard && this.rightCard.clientHeight,
                      boxShadow: '0px 0px 15px #e8e8e8',
                    }}
                    bodyStyle={{ border: '1px' }}
                  >
                    <Tabs
                      defaultActiveKey="1"
                      type="card"
                      tabBarStyle={{ fontSize: '18px', fontWeight: '700' }}
                    >
                      <TabPane tab="基本信息" key="1">
                        {pageFieldJsonList.toProject.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="toProject"
                              label="所属项目"
                              decorator={{
                                rules: [
                                  {
                                    required: false,
                                    message: '请选择项目',
                                  },
                                ],
                                initialValue: formData.toProject || undefined,
                              }}
                            >
                              <div>{formData.projName}</div>
                            </Field>
                          </FieldList>
                        )}
                        {pageFieldJsonList.importanDegree.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="importanDegree"
                              label="重要程度"
                              decorator={{
                                rules: [
                                  {
                                    required: false,
                                    message: '请选择重要程度',
                                  },
                                ],
                                initialValue: formData.importanDegree || '1',
                              }}
                            >
                              <div>{formData.importanDegree}</div>
                            </Field>
                          </FieldList>
                        )}
                        {pageFieldJsonList.logPriority.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="logPriority"
                              label="优先级"
                              decorator={{
                                rules: [
                                  {
                                    required: false,
                                    message: '请选择优先级',
                                  },
                                ],
                                initialValue: formData.logPriority || 'HIGH',
                              }}
                            >
                              <div>{formData.logPriorityDesc}</div>
                            </Field>
                          </FieldList>
                        )}
                        {pageFieldJsonList.logUserId.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="logUserId"
                              label="提出人"
                              decorator={{
                                rules: [
                                  {
                                    required: false,
                                    message: '请选择提出人',
                                  },
                                ],
                                initialValue: formData.logUserId || undefined,
                              }}
                            >
                              <div>{formData.logUserName}</div>
                            </Field>
                          </FieldList>
                        )}
                        {pageFieldJsonList.logMentionTime.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="logMentionTime"
                              label="提出日期"
                              decorator={{
                                initialValue: formData.logMentionTime || undefined,
                                rules: [
                                  {
                                    required: false,
                                    message: '请输入提出日期',
                                  },
                                ],
                              }}
                            >
                              <div>{formData.logMentionTime}</div>
                            </Field>
                          </FieldList>
                        )}
                        {pageFieldJsonList.belongsType.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="belongsType"
                              label="所属类型"
                              decorator={{
                                rules: [
                                  {
                                    required: false,
                                    message: '请选择所属类型',
                                  },
                                ],
                                initialValue: formData.belongsType || '01',
                              }}
                            >
                              <div>{formData.belongsTypeDesc}</div>
                            </Field>
                          </FieldList>
                        )}
                        {pageFieldJsonList.hopeResolveTime.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="hopeResolveTime"
                              label="希望解决时间"
                              decorator={{
                                initialValue: formData.hopeResolveTime || undefined,
                                rules: [
                                  {
                                    required: false,
                                    message: '请输入希望解决时间',
                                  },
                                ],
                              }}
                            >
                              <div>{formData.hopeResolveTime}</div>
                            </Field>
                          </FieldList>
                        )}
                        {pageFieldJsonList.responsibilityUserId.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="responsibilityUserId"
                              label="责任人"
                              decorator={{
                                rules: [
                                  {
                                    required: false,
                                    message: '请选择责任人',
                                  },
                                ],
                                initialValue: formData.respUserId || undefined,
                              }}
                            >
                              <div>{formData.respUserName}</div>
                            </Field>
                          </FieldList>
                        )}
                        {pageFieldJsonList.appointedTime.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="appointedTime"
                              label="指派日期"
                              decorator={{
                                initialValue: formData.appointedTime || undefined,
                                rules: [
                                  {
                                    required: false,
                                    message: '请输入指派日期',
                                  },
                                ],
                              }}
                            >
                              <div>{formData.appointedTime}</div>
                            </Field>
                          </FieldList>
                        )}
                        {pageFieldJsonList.solveUserId.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="solveUserId"
                              label="实际解决人"
                              decorator={{
                                rules: [
                                  {
                                    required: false,
                                    message: '请选择实际解决人',
                                  },
                                ],
                                initialValue: formData.solveUserId || undefined,
                              }}
                            >
                              <div>{formData.solveUserName}</div>
                            </Field>
                          </FieldList>
                        )}
                        {pageFieldJsonList.actualTime.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="actualTime"
                              label="实际解决时间"
                              decorator={{
                                initialValue: formData.actualTime || undefined,
                                rules: [
                                  {
                                    required: false,
                                    message: '请输入实际解决时间',
                                  },
                                ],
                              }}
                            >
                              <div>{formData.actualTime}</div>
                            </Field>
                          </FieldList>
                        )}
                        {pageFieldJsonList.expectedHours.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="expectedHours"
                              label="预计工时"
                              decorator={{
                                initialValue: formData.expectedHours || undefined,
                                rules: [
                                  {
                                    required: false,
                                    message: '请输入预计工时',
                                  },
                                ],
                              }}
                            >
                              <div>{formData.expectedHours}</div>
                            </Field>
                          </FieldList>
                        )}
                        {pageFieldJsonList.state.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="state"
                              label="当前状态"
                              decorator={{
                                rules: [
                                  {
                                    required: false,
                                    message: '请选择当前状态',
                                  },
                                ],
                                initialValue: formData.state || 'PENDING',
                              }}
                            >
                              <div>{formData.stateDesc}</div>
                            </Field>
                          </FieldList>
                        )}
                        <FieldList
                          layout="horizontal"
                          getFieldDecorator={getFieldDecorator}
                          col={1}
                        >
                          <Field
                            labelCol={{ span: 8, xxl: 6 }}
                            wrapperCol={{ span: 14, xxl: 18 }}
                            name="taskName"
                            label="关联任务包"
                            decorator={{
                              initialValue: formData.taskName || '暂无',
                              rules: [
                                {
                                  required: false,
                                  message: '关联任务包',
                                },
                              ],
                            }}
                          >
                            <a className="tw-link" onClick={() => this.goTask()}>
                              <div>{formData.taskName}</div>
                            </a>
                          </Field>
                        </FieldList>
                      </TabPane>
                      {approvalData.applyUserId !== undefined && (
                        <TabPane tab="需求审批信息" key="2">
                          {pageFieldJsonDemand.applyUserId.visibleFlag === 1 && (
                            <FieldList
                              layout="horizontal"
                              getFieldDecorator={getFieldDecorator}
                              col={1}
                            >
                              <Field
                                name="applyUserId"
                                label="申请人"
                                decorator={{
                                  rules: [
                                    {
                                      required: false,
                                      message: '请选择申请人',
                                    },
                                  ],
                                  initialValue: approvalData.applyUserId
                                    ? approvalData.applyUserId
                                    : undefined,
                                }}
                              >
                                <div>{approvalData.applyResName}</div>
                              </Field>
                            </FieldList>
                          )}
                          {pageFieldJsonDemand.applyTime.visibleFlag === 1 && (
                            <FieldList
                              layout="horizontal"
                              getFieldDecorator={getFieldDecorator}
                              col={1}
                            >
                              <Field
                                name="applyTime"
                                label="申请时间"
                                decorator={{
                                  initialValue: approvalData.applyTime || undefined,
                                  rules: [
                                    {
                                      required: false,
                                      message: '请输入申请时间',
                                    },
                                  ],
                                }}
                              >
                                <div>{approvalData.applyTime}</div>
                              </Field>
                            </FieldList>
                          )}
                          {pageFieldJsonDemand.demandType.visibleFlag === 1 && (
                            <FieldList
                              layout="horizontal"
                              getFieldDecorator={getFieldDecorator}
                              col={1}
                            >
                              <Field
                                name="demandTypeDesc"
                                label="需求类型"
                                decorator={{
                                  rules: [
                                    {
                                      required: false,
                                      message: '请选择需求类型',
                                    },
                                  ],
                                  initialValue: approvalData.demandTypeDesc,
                                }}
                              >
                                <div>{approvalData.demandTypeDesc}</div>
                              </Field>
                            </FieldList>
                          )}
                          {pageFieldJsonDemand.requiredHours.visibleFlag === 1 && (
                            <FieldList
                              layout="horizontal"
                              getFieldDecorator={getFieldDecorator}
                              col={1}
                            >
                              <Field
                                name="requiredHours"
                                label="所需工时"
                                decorator={{
                                  initialValue: approvalData.requiredHours || undefined,
                                  rules: [
                                    {
                                      required: false,
                                      message: '请输入所需工时',
                                    },
                                  ],
                                }}
                              >
                                <div>{approvalData.requiredHours}</div>
                              </Field>
                            </FieldList>
                          )}
                          {pageFieldJsonDemand.chargeHours.visibleFlag === 1 && (
                            <FieldList
                              layout="horizontal"
                              getFieldDecorator={getFieldDecorator}
                              col={1}
                            >
                              <Field
                                name="chargeHours"
                                label="收费工时"
                                decorator={{
                                  initialValue: approvalData.chargeHours || undefined,
                                  rules: [
                                    {
                                      required: false,
                                      message: '请输入收费工时',
                                    },
                                  ],
                                }}
                              >
                                <div>{approvalData.chargeHours}</div>
                              </Field>
                            </FieldList>
                          )}
                          {pageFieldJsonDemand.chargeAmt.visibleFlag === 1 && (
                            <FieldList
                              layout="horizontal"
                              getFieldDecorator={getFieldDecorator}
                              col={1}
                            >
                              <Field
                                name="chargeAmt"
                                label="收费金额"
                                decorator={{
                                  initialValue: approvalData.chargeAmt || undefined,
                                  rules: [
                                    {
                                      required: false,
                                      message: '请输入收费金额',
                                    },
                                  ],
                                }}
                              >
                                <div>{approvalData.chargeAmt}</div>
                              </Field>
                            </FieldList>
                          )}
                          {pageFieldJsonDemand.expectedBenefits.visibleFlag === 1 && (
                            <FieldList
                              layout="horizontal"
                              getFieldDecorator={getFieldDecorator}
                              col={1}
                            >
                              <Field
                                name="expectedBenefits"
                                label="预期效益评估"
                                decorator={{
                                  initialValue: approvalData.expectedBenefits || undefined,
                                  rules: [
                                    {
                                      required: false,
                                      message: '请输入预期效益评估',
                                    },
                                  ],
                                }}
                              >
                                <div>{approvalData.expectedBenefits}</div>
                              </Field>
                            </FieldList>
                          )}
                          {pageFieldJsonDemand.backgroundDemand.visibleFlag === 1 && (
                            <FieldList
                              layout="horizontal"
                              getFieldDecorator={getFieldDecorator}
                              col={1}
                            >
                              <Field
                                name="backgroundDemand"
                                label="需求背景"
                                decorator={{
                                  initialValue: approvalData.backgroundDemand || undefined,
                                  rules: [
                                    {
                                      required: false,
                                      message: '请输入需求背景',
                                    },
                                  ],
                                }}
                              >
                                <div>{approvalData.backgroundDemand}</div>
                              </Field>
                            </FieldList>
                          )}
                          {pageFieldJsonDemand.demandDescribe.visibleFlag === 1 && (
                            <FieldList
                              layout="horizontal"
                              getFieldDecorator={getFieldDecorator}
                              col={1}
                            >
                              <Field
                                name="demandDescribe"
                                label="需求描述"
                                decorator={{
                                  initialValue: approvalData.demandDescribe || undefined,
                                  rules: [
                                    {
                                      required: false,
                                      message: '请输入需求描述',
                                    },
                                  ],
                                }}
                              >
                                <div>{approvalData.demandDescribe}</div>
                              </Field>
                            </FieldList>
                          )}
                          {pageFieldJsonDemand.demandTarget.visibleFlag === 1 && (
                            <FieldList
                              layout="horizontal"
                              getFieldDecorator={getFieldDecorator}
                              col={1}
                            >
                              <Field
                                name="demandTarget"
                                label="需求目标"
                                decorator={{
                                  initialValue: approvalData.demandTarget || undefined,
                                  rules: [
                                    {
                                      required: false,
                                      message: '请输入需求目标',
                                    },
                                  ],
                                }}
                              >
                                <div>{approvalData.demandTarget}</div>
                              </Field>
                            </FieldList>
                          )}

                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              labelCol={{ span: 8, xxl: 6 }}
                              wrapperCol={{ span: 14, xxl: 8 }}
                              name="attache"
                              label={formatMessage({
                                id: `ui.menu.user.expense.form.attache`,
                                desc: '相关附件',
                              })}
                              decorator={{
                                initialValue: approvalData.id || undefined,
                              }}
                            >
                              <FileManagerEnhance
                                preview
                                api="/api/op/v1/projectLog/demand/sfs/token"
                                dataKey={approvalData.id}
                                listType="text"
                              />
                            </Field>
                          </FieldList>
                          {pageFieldJsonDemand.apprStatus.visibleFlag === 1 && (
                            <FieldList
                              layout="horizontal"
                              getFieldDecorator={getFieldDecorator}
                              col={1}
                            >
                              <Field
                                name="apprStatusDesc"
                                label="审批状态"
                                decorator={{
                                  rules: [
                                    {
                                      required: false,
                                      message: '请选择审批状态',
                                    },
                                  ],
                                  initialValue: approvalData.apprStatusDesc,
                                }}
                              >
                                <div>{formData.apprStatusDesc}</div>
                              </Field>
                            </FieldList>
                          )}
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              labelCol={{ span: 8, xxl: 6 }}
                              wrapperCol={{ span: 14, xxl: 18 }}
                              name="procName"
                              label="相关流程"
                              decorator={{
                                initialValue: formData.procName || '暂无',
                                rules: [
                                  {
                                    required: false,
                                    message: '相关流程',
                                  },
                                ],
                              }}
                            >
                              <a className="tw-link" onClick={() => this.goProc()}>
                                <div>{formData.procName}</div>
                              </a>
                            </Field>
                          </FieldList>
                        </TabPane>
                      )}
                    </Tabs>
                  </Card>
                  <div style={{ marginTop: '5px' }}>
                    <Card
                      headStyle={{
                        fontSize: '18px',
                        fontWeight: '700',
                      }}
                      title={<Title text="创建信息" />}
                    >
                      {pageFieldJsonList.createUserId.visibleFlag === 1 && (
                        <FieldList
                          layout="horizontal"
                          getFieldDecorator={getFieldDecorator}
                          col={1}
                        >
                          <Field
                            name="createUserName"
                            label="创建人"
                            decorator={{
                              rules: [
                                {
                                  required: false,
                                  message: '请选择创建人',
                                },
                              ],
                              initialValue: formData.createUserName || currentUserName,
                            }}
                          >
                            <div>{formData.createUserName}</div>
                          </Field>
                        </FieldList>
                      )}
                      {pageFieldJsonList.createTime.visibleFlag === 1 && (
                        <FieldList
                          layout="horizontal"
                          getFieldDecorator={getFieldDecorator}
                          col={1}
                        >
                          <Field
                            name="createTime"
                            label="创建时间"
                            decorator={{
                              initialValue: formData.createTime || moment(),
                              rules: [
                                {
                                  required: false,
                                  message: '请输入创建时间',
                                },
                              ],
                            }}
                          >
                            <div>{moment(formData.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                          </Field>
                        </FieldList>
                      )}
                    </Card>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="tw-card-adjust" style={{ marginTop: '5px' }}>
              <Row gutter={10}>
                <Col span={14}>
                  <Card
                    title={<Title text="附件" />}
                    headStyle={{
                      fontSize: '18px',
                      fontWeight: '700',
                    }}
                  >
                    <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
                      <Field
                        labelCol={{ span: 8, xxl: 6 }}
                        wrapperCol={{ span: 14, xxl: 8 }}
                        disabled
                        name="attache"
                        decorator={{
                          initialValue: formData.id || undefined,
                        }}
                      >
                        <FileManagerEnhance
                          api="/api/op/v1/projectLog/sfs/token"
                          dataKey={formData.id}
                          listType="text"
                          preview
                        />
                      </Field>
                    </FieldList>
                  </Card>
                </Col>
              </Row>
            </div>
            <div className="tw-card-adjust" style={{ marginTop: '5px' }}>
              <Row gutter={10}>
                <Col span={14}>
                  <Card
                    title={<Title text="跟踪日志" />}
                    headStyle={{
                      fontSize: '18px',
                      fontWeight: '700',
                    }}
                    extra={
                      <Button
                        className={classnames('separate', 'tw-btn-primary')}
                        icon="plus"
                        size="large"
                        onClick={this.toggleVisibleRecord}
                      >
                        添加日志
                      </Button>
                    }
                  >
                    {recordData.map((item, index) => (
                      <div className="" key={item.createTime}>
                        <div className={stylesLogDetail.feedbackItem}>
                          <div className={stylesLogDetail.feedbackItemSolver}>
                            {item.traceResName} ({item.traceResNo}) |{' '}
                            {moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}
                          </div>
                          <div
                            className={stylesLogDetail.feedbackItemContent}
                            dangerouslySetInnerHTML={{ __html: item.traceContent }}
                          />
                        </div>
                      </div>
                    ))}
                  </Card>
                </Col>
              </Row>
            </div>
            <div className="tw-card-adjust" style={{ marginTop: '5px' }}>
              <Row gutter={10}>
                <Col span={14}>
                  <Card
                    headStyle={{
                      fontSize: '18px',
                      fontWeight: '700',
                    }}
                    title={<Title text="历史记录" />}
                    extra={
                      <Button
                        className={classnames('separate', 'tw-btn-primary')}
                        icon="plus"
                        size="large"
                        onClick={this.toggleVisible}
                      >
                        添加备注
                      </Button>
                    }
                  >
                    {!showNoData && (
                      <Timeline>
                        {timelineData.map(item => {
                          const { id, createTime, changeResName, changeDesc, changeTime } = item;
                          const addHis = '添加备注';
                          const projChangeLogItemList = item.projChangeLogItemList
                            ? item.projChangeLogItemList
                            : [];
                          return (
                            <>
                              <Timeline.Item>
                                {changeResName} {changeDesc}{' '}
                                {moment(changeTime).format('YYYY-MM-DD HH:mm:ss')} <Divider />
                                {projChangeLogItemList.map(i => {
                                  const changeTypeData = i.changeType;
                                  const beforeContentData = i.beforeContent;
                                  const afterContentData = i.afterContent;
                                  return (
                                    <>
                                      {changeTypeData || addHis}
                                      {'：'}
                                      {/* eslint-disable-next-line react/no-danger */}
                                      <div
                                        className={stylesLogDetail.historyCard}
                                        dangerouslySetInnerHTML={{ __html: beforeContentData }}
                                      />
                                      {changeTypeData ? '→' : ''}
                                      {/* eslint-disable-next-line react/no-danger */}
                                      <div
                                        className={stylesLogDetail.historyCard}
                                        dangerouslySetInnerHTML={{ __html: afterContentData }}
                                      />
                                      <Divider />
                                    </>
                                  );
                                })}
                              </Timeline.Item>
                            </>
                          );
                        })}
                      </Timeline>
                    )}
                    {showNoData && (
                      <Timeline>
                        <Timeline.Item>暂无记录</Timeline.Item>
                      </Timeline>
                    )}
                    {showMoreFlag && (
                      <div style={{ marginLeft: '20px' }}>
                        <Button
                          className="tw-btn-primary"
                          type="primary"
                          size="large"
                          onClick={this.loadMore(1)}
                          loading={loadMoreLoading}
                        >
                          ...查看更早的历史记录
                        </Button>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
            <main id="main" className={zenStyle.main}>
              <div className={zenStyle.container}>
                <div id="mainContent">
                  <div className={zenStyle.mainActions}>
                    <div className={zenStyle.btnToolbar}>
                      <a
                        onClick={() => {
                          this.goBackProject();
                        }}
                        id="back"
                        className={zenStyle.btn}
                      >
                        <img alt="" src="/static/images/projectLog/1_back.jpg" />
                      </a>
                      <div className={zenStyle.divider} />
                      <a
                        onClick={() => {
                          this.doChange();
                        }}
                        id="change"
                        className={zenStyle.btn}
                      >
                        <img alt="" src="/static/images/projectLog/2_back.jpg" />
                      </a>
                      <a
                        onClick={() => {
                          this.doEdit();
                        }}
                        id="edit"
                        className={zenStyle.btn}
                      >
                        <img alt="" src="/static/images/projectLog/3_back.jpg" />
                      </a>
                      <a
                        onClick={() => {
                          this.doDelete();
                        }}
                        id="delete"
                        className={zenStyle.btn}
                      >
                        <img alt="" src="/static/images/projectLog/4_back.jpg" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}
        <AddHistory visible={visible} toggle={this.toggleVisible} mode={mode} logId={logId} />
        <AddRecord
          visible={visibleRecord}
          toggle={this.toggleVisibleRecord}
          mode={mode}
          logId={logId}
        />
      </PageHeaderWrapper>
    );
  }
}

export default logDetails;
