/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {
  InputNumber,
  Form,
  Input,
  Row,
  Col,
  Card,
  Tabs,
  Timeline,
  Button,
  Select,
  TimePicker,
  Tooltip,
  Icon,
  Radio,
} from 'antd';
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
import { UdcSelect, FileManagerEnhance, Selection, DatePicker } from '@/pages/gen/field';
import { getUrl } from '@/utils/flowToRouter';
import LogEditor from '@/components/common/LogEditor';
import { selectBus, selectCusts, selectIamUsers, selectInternalOus } from '@/services/gen/list';
import classnames from 'classnames';
import styles from './style.less';
import { selectUsers, selectProject } from '@/services/user/project/projectLogList';
import zenStyle from './logDetailCss/ZentaoImg.less';

const FormItem = Form.Item;
const { Field } = FieldList;
const { TabPane } = Tabs;

const DOMAIN = 'projectLogChange';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 22 },
];

@connect(({ loading, projectLogChange, dispatch, user }) => ({
  loading,
  projectLogChange,
  dispatch,
  user: user.user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props.projectLogChange;
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
class logChange extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { mode, logId, problemId } = fromQs();
    if (mode === 'change') {
      dispatch({
        type: `${DOMAIN}/toChangeView`,
        payload: { mode, id: isNil(logId) ? '' : logId },
      }).then(res => {
        dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: { pageNo: 'PROJECT_LOG_Change' },
        });
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { formData: {}, loadFinish: false },
    });
  }

  handleSubmit = lockFlag => () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      projectLogChange,
    } = this.props;
    const { formData } = projectLogChange;
    const { mode } = fromQs();
    const contentDescriptionEditor = this.editorContent
      ? this.editorContent.getContent()
      : formData.contentDescription;
    const solutionEditor = this.editorPlan ? this.editorPlan.getContent() : formData.solution;

    const lockFlagToBack = { lockFlag };
    const respUserIdData = formData.respUserId;
    const responsibilityUserId = { responsibilityUserId: respUserIdData };
    const contentDescription = { contentDescription: contentDescriptionEditor };
    const solution = { solution: solutionEditor };
    const form = {
      ...formData,
    };
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            mode,
            values: {
              ...form,
              ...values,
              ...contentDescription,
              ...solution,
              ...responsibilityUserId,
            },
          },
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto('/user/project/logList?_refresh=0');
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
      projectLogChange,
    } = this.props;
    const { mode } = fromQs();
    const { loadFinish } = projectLogChange;
    const { formData } = projectLogChange;
    const { pageConfig } = projectLogChange;
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

    const { id } = formData;
    const { apprStatus } = formData;
    const { belongsType } = formData;
    let showContent = true;
    if (apprStatus === 'APPROVING' && belongsType === '05') {
      showContent = false;
    }
    const currentUserName = user.extInfo.resName;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 15 },
        md: { span: 18 },
      },
    };
    const formItemLayoutAttach = {
      labelCol: {
        xs: { span: 20 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 15 },
        md: { span: 8 },
      },
    };

    const formItemLayoutStatus = {
      labelCol: {
        xs: { span: 20 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 8 },
        md: { span: 8 },
      },
    };

    return (
      <PageHeaderWrapper>
        {!loadFinish ? (
          <Loading />
        ) : (
          <div>
            <Card className="tw-card-rightLine">
              <div style={{ display: 'inline-block', lineHeigh: '34px' }}>
                <span className={zenStyle.labelid}>{formData.logNumber}</span>
                <span className={zenStyle.formDataTitle}>{formData.title}</span>
              </div>
            </Card>
            <Card className="tw-card-adjust" bordered>
              {pageFieldJsonList.title.visibleFlag === 1 && (
                <Row gutter={24}>
                  <Col span={24}>
                    <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
                      <Field
                        {...formItemLayout}
                        name="title"
                        label={pageFieldJsonList.title.displayName}
                        decorator={{
                          initialValue: formData.title ? formData.title : '',
                          rules: [
                            {
                              required: !!pageFieldJsonList.title.requiredFlag,
                              message: '请输入标题',
                            },
                          ],
                        }}
                      >
                        <Input placeholder="请输入标题" />
                      </Field>
                    </FieldList>
                  </Col>
                </Row>
              )}
              {pageFieldJsonList.state.visibleFlag === 1 && (
                <Row gutter={24}>
                  <Col span={24}>
                    <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
                      <Field
                        {...formItemLayoutStatus}
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
                        />
                      </Field>
                    </FieldList>
                  </Col>
                </Row>
              )}
              {showContent && (
                <>
                  {pageFieldJsonList.contentDescription.visibleFlag === 1 && (
                    <Row>
                      <Col span={24}>
                        <FieldList
                          layout="horizontal"
                          getFieldDecorator={getFieldDecorator}
                          col={1}
                        >
                          <Field
                            {...formItemLayout}
                            name="contentDescription"
                            label={pageFieldJsonList.contentDescription.displayName}
                          >
                            {loadFinish ? (
                              <LogEditor
                                id="issueEditorContent"
                                height="200"
                                width="100%"
                                initialContent={formData.contentDescription}
                                ref={editorContent => {
                                  this.editorContent = editorContent;
                                }}
                              />
                            ) : (
                              ''
                            )}
                          </Field>
                        </FieldList>
                      </Col>
                    </Row>
                  )}
                </>
              )}
              {pageFieldJsonList.solution.visibleFlag === 1 && (
                <Row>
                  <Col span={24}>
                    <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
                      <Field
                        {...formItemLayout}
                        name="solution"
                        label={pageFieldJsonList.solution.displayName}
                      >
                        {loadFinish ? (
                          <LogEditor
                            id="issueEditorPlan"
                            height="200"
                            width="100%"
                            initialContent={formData.solution}
                            ref={editorPlan => {
                              this.editorPlan = editorPlan;
                            }}
                          />
                        ) : (
                          ''
                        )}
                      </Field>
                    </FieldList>
                  </Col>
                </Row>
              )}
              <Row>
                <Col span={24}>
                  <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
                    <Field
                      {...formItemLayoutAttach}
                      name="attache"
                      label="相关附件"
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
                </Col>
              </Row>
              <div style={{ textAlign: 'center', margin: '50px auto' }}>
                <Button
                  className="tw-btn-primary"
                  type="primary"
                  icon="save"
                  size="large"
                  onClick={this.handleSubmit(1)}
                >
                  保存
                </Button>
                <Button
                  style={{ marginLeft: '50px' }}
                  className={classnames('separate', 'tw-btn-default')}
                  icon="undo"
                  size="large"
                  onClick={() => {
                    closeThenGoto('/user/project/logList');
                  }}
                >
                  {formatMessage({ id: `misc.rtn`, desc: '返回' })}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default logChange;
