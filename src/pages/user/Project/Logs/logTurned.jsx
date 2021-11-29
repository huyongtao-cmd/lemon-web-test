/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
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
import { selectUsers, selectProject, queryProjList } from '@/services/user/project/projectLogList';
import { getUrl } from '@/utils/flowToRouter';
import { selectBus, selectCusts, selectIamUsers, selectInternalOus } from '@/services/gen/list';
import styles from './style.less';
import stylesLogDetail from './logDetails.less';
import zenStyle from './logDetailCss/ZentaoImg.less';
import LogEditor from '@/components/common/LogEditor';

const { Field } = FieldList;
const { TabPane } = Tabs;

const DOMAIN = 'projectLogEdit';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, projectLogEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/getPageConfig`],
  projectLogEdit,
  dispatch,
  user: user.user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.projectLogEdit;
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
    if (name === 'belongsType') {
      const belongsTypeInner = { belongsTypeInner: `1` };
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: belongsTypeInner,
      });
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class logEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { mode, logId, problemId } = fromQs();
    if (mode === 'turned') {
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'PROJECT_LOG_Edit' },
      });
      dispatch({
        type: `${DOMAIN}/getQuestionInfo`,
        payload: { mode, id: isNil(problemId) ? '' : problemId },
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
      },
    });
  }

  handleSubmit = lockFlag => () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      projectLogEdit,
    } = this.props;
    const { formData } = projectLogEdit;
    const { timelineData } = projectLogEdit;
    const solutionEditor = this.editorPlan.getContent();
    const contentDescriptionEditor = this.editorContent.getContent();
    const { mode } = fromQs();
    const { taskId } = fromQs();
    const lockFlagToBack = { lockFlag };
    const form = {
      ...formData,
      solution: solutionEditor,
      contentDescription: contentDescriptionEditor,
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
            const { belongsType } = values;
            const ids = response.datum.id;
            if (belongsType === '05') {
              if (mode === 'turned') {
                closeThenGoto(`/user/project/logApproval?mode=approvalAdd&logId=${ids}`);
              }
            } else {
              closeThenGoto('/user/project/logList?_refresh=0');
            }
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  render() {
    const { user } = this.props;
    const {
      loading,
      form: { getFieldDecorator },
      projectLogEdit,
    } = this.props;
    const { loadFinish } = projectLogEdit;
    const { pageConfig } = projectLogEdit;
    const { mode } = fromQs();
    let showNoData = false;
    if (mode === 'turned') {
      showNoData = true;
    }
    // 列表展示字段的可配置化
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageConfig.pageBlockViews[0];
    const { pageFieldViews: pageFieldViewsList } = currentListConfig;
    const pageFieldJsonList = {};
    if (pageFieldViewsList) {
      pageFieldViewsList.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }

    const { formData } = projectLogEdit;
    const { timelineData } = projectLogEdit;
    const { recordData } = projectLogEdit;
    const titleData = formData.title;
    const currentUserName = user.extInfo.resName;
    const belongsType = formData.belongsType ? formData.belongsType : undefined;
    let belongsTypeDisabledFlag = false;
    const belongsTypeInner = formData.belongsTypeInner ? formData.belongsTypeInner : undefined;
    if (belongsType === '05' && belongsTypeInner !== '1') {
      belongsTypeDisabledFlag = true;
    }
    const { timelineDataCount } = projectLogEdit;
    let showMoreFlag = false;
    const { loadMoreLoading } = projectLogEdit;
    if (timelineDataCount > timelineData.length) {
      showMoreFlag = true;
    }
    const formItemLayoutAttach = {
      labelCol: {
        xs: { span: 20 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 15 },
        md: { span: 15 },
      },
    };
    return (
      <PageHeaderWrapper>
        {!loadFinish ? (
          <Loading />
        ) : (
          <div>
            <Card className="tw-card-rightLine">
              <Button
                className="tw-btn-primary"
                icon="save"
                size="large"
                disabled=""
                onClick={this.handleSubmit(1)}
              >
                保存
              </Button>

              <Button
                className={classnames('separate', 'tw-btn-default')}
                icon="undo"
                size="large"
                onClick={() => {
                  closeThenGoto('/user/project/logList');
                }}
              >
                {formatMessage({ id: `misc.rtn`, desc: '返回' })}
              </Button>
            </Card>
            {pageFieldJsonList.title.visibleFlag === 1 && (
              <Card className="tw-card-rightLine">
                <FieldList getFieldDecorator={getFieldDecorator} className={styles.formWrap}>
                  <Field
                    name="title"
                    label={pageFieldJsonList.title.displayName}
                    decorator={{
                      initialValue: formData.title || undefined,
                      rules: [
                        {
                          required: !!pageFieldJsonList.title.requiredFlag,
                          message: '请输入标题',
                        },
                      ],
                    }}
                  >
                    <Input placeholder="请输入标题" style={{ width: '800px' }} />
                  </Field>
                </FieldList>
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
                      <div>
                        <LogEditor
                          id="issueEditorContent"
                          height="650"
                          width="100%"
                          initialContent={formData.contentDescription}
                          ref={editorContent => {
                            this.editorContent = editorContent;
                          }}
                        />
                      </div>
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
                        <div>
                          <LogEditor
                            id="issueEditorPlan"
                            height="230"
                            width="100%"
                            initialContent=""
                            ref={editorPlan => {
                              this.editorPlan = editorPlan;
                            }}
                          />
                        </div>
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
                    <Tabs defaultActiveKey="1" type="card">
                      <TabPane tab="基本信息" key="1">
                        {pageFieldJsonList.toProject.visibleFlag === 1 && (
                          <FieldList
                            layout="horizontal"
                            getFieldDecorator={getFieldDecorator}
                            col={1}
                          >
                            <Field
                              name="toProject"
                              label={pageFieldJsonList.toProject.displayName}
                              decorator={{
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.toProject.requiredFlag,
                                    message: '请选择项目',
                                  },
                                ],
                                initialValue: formData.toProject || undefined,
                              }}
                            >
                              <Selection.Columns
                                transfer={{ key: 'id', code: 'id', name: 'name' }}
                                columns={particularColumns}
                                source={() => queryProjList()}
                                placeholder="请选择项目"
                                showSearch
                                style={{ marginLeft: '15px' }}
                              />
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
                              label={pageFieldJsonList.importanDegree.displayName}
                              decorator={{
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.importanDegree.requiredFlag,
                                    message: '请选择重要程度',
                                  },
                                ],
                                initialValue: formData.importanDegree || '1',
                              }}
                            >
                              <UdcSelect
                                code="ACC:PROJECT_DEGREE"
                                placeholder="请选择重要程度"
                                disabled={false}
                                style={{ marginLeft: '15px' }}
                              />
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
                              label={pageFieldJsonList.logPriority.displayName}
                              decorator={{
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.logPriority.requiredFlag,
                                    message: '请选择优先级',
                                  },
                                ],
                                initialValue: formData.logPriority || 'HIGH',
                              }}
                            >
                              <UdcSelect
                                code="ACC:PROJECT_PRIORITY"
                                placeholder="请选择优先级"
                                disabled={false}
                                style={{ marginLeft: '15px' }}
                              />
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
                              label={pageFieldJsonList.logUserId.displayName}
                              decorator={{
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.logUserId.requiredFlag,
                                    message: '请选择提出人',
                                  },
                                ],
                                initialValue: formData.logUserId || undefined,
                              }}
                            >
                              <Selection.Columns
                                transfer={{ key: 'id', code: 'id', name: 'name' }}
                                columns={particularColumns}
                                source={() => selectUsers()}
                                placeholder="请选择提出人"
                                showSearch
                                style={{ marginLeft: '15px' }}
                              />
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
                              label={pageFieldJsonList.logMentionTime.displayName}
                              decorator={{
                                initialValue: formData.logMentionTime || undefined,
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.logMentionTime.requiredFlag,
                                    message: '请输入提出日期',
                                  },
                                ],
                              }}
                            >
                              <DatePicker
                                placeholder="请输入提出日期"
                                style={{ marginLeft: '15px' }}
                              />
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
                              label={pageFieldJsonList.belongsType.displayName}
                              decorator={{
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.belongsType.requiredFlag,
                                    message: '请选择所属类型',
                                  },
                                ],
                                initialValue: formData.belongsType || '01',
                              }}
                            >
                              <UdcSelect
                                code="ACC:PROJECT_LOG_TYPE"
                                placeholder="请选择所属类型"
                                disabled={belongsTypeDisabledFlag}
                                style={{ marginLeft: '15px' }}
                              />
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
                              label={pageFieldJsonList.hopeResolveTime.displayName}
                              decorator={{
                                initialValue: formData.hopeResolveTime || undefined,
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.hopeResolveTime.requiredFlag,
                                    message: '请输入希望解决时间',
                                  },
                                ],
                              }}
                            >
                              <DatePicker
                                placeholder="请输入希望解决时间"
                                style={{ marginLeft: '15px' }}
                              />
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
                              label={pageFieldJsonList.responsibilityUserId.displayName}
                              decorator={{
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.responsibilityUserId.requiredFlag,
                                    message: '请选择责任人',
                                  },
                                ],
                                initialValue: formData.respUserId || undefined,
                              }}
                            >
                              <Selection.Columns
                                transfer={{ key: 'id', code: 'id', name: 'name' }}
                                columns={particularColumns}
                                source={() => selectUsers()}
                                placeholder="请选择责任人"
                                showSearch
                                style={{ marginLeft: '15px' }}
                              />
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
                              label={pageFieldJsonList.appointedTime.displayName}
                              decorator={{
                                initialValue: formData.appointedTime || undefined,
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.appointedTime.requiredFlag,
                                    message: '请输入指派日期',
                                  },
                                ],
                              }}
                            >
                              <DatePicker
                                placeholder="请输入指派日期"
                                style={{ marginLeft: '15px' }}
                              />
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
                              label={pageFieldJsonList.solveUserId.displayName}
                              decorator={{
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.solveUserId.requiredFlag,
                                    message: '请选择实际解决人',
                                  },
                                ],
                                initialValue: formData.solveUserId || undefined,
                              }}
                            >
                              <Selection.Columns
                                transfer={{ key: 'id', code: 'id', name: 'name' }}
                                columns={particularColumns}
                                source={() => selectUsers()}
                                placeholder="请选择实际解决人"
                                showSearch
                                style={{ marginLeft: '15px' }}
                              />
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
                              label={pageFieldJsonList.actualTime.displayName}
                              decorator={{
                                initialValue: formData.actualTime || undefined,
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.actualTime.requiredFlag,
                                    message: '请输入实际解决时间',
                                  },
                                ],
                              }}
                            >
                              <DatePicker
                                placeholder="请输入实际解决时间"
                                style={{ marginLeft: '15px' }}
                              />
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
                              label={pageFieldJsonList.expectedHours.displayName}
                              decorator={{
                                initialValue: formData.expectedHours || undefined,
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.expectedHours.requiredFlag,
                                    message: '请输入预计工时',
                                  },
                                ],
                              }}
                            >
                              <InputNumber
                                min={0}
                                step={1}
                                max={999999999999}
                                placeholder="处理时长"
                                className="x-fill-100"
                                style={{ marginLeft: '15px' }}
                              />
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
                              label={pageFieldJsonList.state.displayName}
                              decorator={{
                                rules: [
                                  {
                                    required: !!pageFieldJsonList.state.requiredFlag,
                                    message: '请选择当前状态',
                                  },
                                ],
                                initialValue: formData.state || 'PENDING',
                              }}
                            >
                              <UdcSelect
                                code="ACC:PROJECT_LOG_STATE"
                                placeholder="请选择当前状态"
                                disabled={false}
                                style={{ marginLeft: '15px' }}
                              />
                            </Field>
                          </FieldList>
                        )}
                      </TabPane>
                    </Tabs>
                  </Card>
                  <div style={{ marginTop: '5px' }}>
                    <Card
                      title={<Title text="创建信息" />}
                      style={{
                        minHeight: this.rightCard && this.rightCard.clientHeight,
                        boxShadow: '0px 0px 15px #e8e8e8',
                      }}
                      bodyStyle={{ border: '1px' }}
                    >
                      {pageFieldJsonList.createUserId.visibleFlag === 1 && (
                        <FieldList
                          layout="horizontal"
                          getFieldDecorator={getFieldDecorator}
                          col={1}
                        >
                          <Field
                            name="createUserName"
                            label={pageFieldJsonList.createUserId.displayName}
                            decorator={{
                              rules: [
                                {
                                  required: !!pageFieldJsonList.createUserId.requiredFlag,
                                  message: '请选择创建人',
                                },
                              ],
                              initialValue: formData.createUserName || currentUserName,
                            }}
                          >
                            <Input
                              placeholder="请选择创建人"
                              className="x-fill-100"
                              style={{ marginLeft: '15px' }}
                              disabled
                            />
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
                            label={pageFieldJsonList.createTime.displayName}
                            decorator={{
                              initialValue: formData.createTime || moment(),
                              rules: [
                                {
                                  required: !!pageFieldJsonList.createTime.requiredFlag,
                                  message: '请输入创建时间',
                                },
                              ],
                            }}
                          >
                            <DatePicker
                              disabled
                              placeholder="请输入创建时间"
                              style={{ marginLeft: '15px' }}
                            />
                          </Field>
                        </FieldList>
                      )}
                    </Card>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="tw-card-adjust" style={{ marginTop: '5px', marginBottom: '20px' }}>
              <Row gutter={10}>
                <Col span={14}>
                  <div>
                    <Card title={<Title text="附件" />}>
                      <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
                        <Field
                          {...formItemLayoutAttach}
                          name="attache"
                          decorator={{
                            initialValue: formData.id || undefined,
                          }}
                        >
                          <FileManagerEnhance
                            api="/api/op/v1/projectLog/sfs/token"
                            dataKey={formData.id}
                            listType="text"
                            disabled={false}
                          />
                        </Field>
                      </FieldList>
                    </Card>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default logEdit;
