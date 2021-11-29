import React from 'react';
import { connect } from 'dva';
import { Card, Form, Input, Rate } from 'antd';
import { isEmpty } from 'ramda';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Loading from '@/components/core/DataLoading';
import createMessage from '@/components/core/AlertMessage';
import { FileManagerEnhance } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import router from 'umi/router';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import AssessorModal from './assessorModal';
import { mountToTab } from '@/layouts/routerControl';

const DOMAIN = 'communicatePlanFlow';
const { Field } = FieldList;
const { Description } = DescriptionList;

@connect(({ loading, communicatePlanFlow, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/queryDetail`],
  communicatePlanFlow,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedFields) {
    if (!isEmpty(changedFields)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedFields,
      });
    }
  },
})
@mountToTab()
class CommunicatePlanFlow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {},
        assPersonList: [],
        assessorList: [],
        communicateInfo: {},
      },
    });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id: param.id },
    });

    // 在流程的第一节点和每一个节点创建完成后请求数据
    dispatch({
      type: `${DOMAIN}/queryCommunicate`,
      payload: {
        id: param.id,
      },
    });
    // // 点击查看被考核人填写内容
    // dispatch({
    //   type: `${DOMAIN}/queryDetail`,
    //   payload: {
    //     performanceCommunicateResId: param.id,
    //   },
    // });
    param.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        }).then(response => {
          if (response) {
            const { taskKey } = response;
            let point = '';
            if (taskKey) {
              if (taskKey === 'ACC_A57_02_ASSESSED_b') {
                point = 'PERFORMANCE_PLAN_COMMUNICATION_FLOW_ASSESSED';
              } else if (taskKey === 'ACC_A57_03_ASSESSOR_b') {
                point = 'PERFORMANCE_PLAN_COMMUNICATION_FLOW_ASSESSOR';
                // 在考核人阶段是否可查看被考核人信息
                dispatch({
                  type: `${DOMAIN}/queryAssessedList`,
                  payload: {
                    performanceCommunicateResId: param.id,
                  },
                });
              } else if (taskKey === 'ACC_A57_04_HR_CFM') {
                point = 'PERFORMANCE_PLAN_COMMUNICATION_FLOW_HR';
                // 在hr填写内容页面查看考核人和被考核人填写信息
                dispatch({
                  type: `${DOMAIN}/queryDetail`,
                  payload: {
                    performanceCommunicateResId: param.id,
                  },
                });
                // 在hr填写页面请求被考核人和考核人填写内容
                dispatch({
                  type: `${DOMAIN}/getPageConfigs`,
                  payload: {
                    pageNos:
                      'PERFORMANCE_PLAN_COMMUNICATION_FLOW_ASSESSED,PERFORMANCE_PLAN_COMMUNICATION_FLOW_ASSESSOR',
                  },
                });
              }
              // 获取页面配置信息
              dispatch({
                type: `${DOMAIN}/getPageConfig`,
                payload: { pageNo: `${point}` },
              });
            }
          }
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
  }

  closeModal = () => {
    this.setState({
      visible: false,
    });
  };

  renderAssessor = () => {
    const {
      communicatePlanFlow: { pageConfig, formData, fieldsConfig },
      form: { getFieldDecorator },
    } = this.props;
    if (pageConfig) {
      if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
        return <div />;
      }
      const currentBlockConfig = pageConfig.pageBlockViews[0];
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { taskKey } = fieldsConfig;
      let fields = [];
      let title = '';
      if (taskKey === 'ACC_A57_02_ASSESSED_b') {
        title = '被考核人填写';
        fields = [
          <Field
            name="extNumber1"
            key="extNumber1"
            label={pageFieldJson.extNumber1.displayName}
            sortNo={pageFieldJson.extNumber1.sortNo}
            decorator={{
              rules: [{ required: false }],
              initialValue: formData.extNumber1 || undefined,
            }}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
          >
            <Rate />
          </Field>,

          <Field
            name="extBigVarchar1"
            key="extBigVarchar1"
            sortNo={pageFieldJson.extBigVarchar1.sortNo}
            label={pageFieldJson.extBigVarchar1.displayName}
            decorator={{
              rules: [{ required: false }],
              initialValue: formData.extBigVarchar1 || '',
            }}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
          >
            <Input.TextArea
              placeholder={`请填写${pageFieldJson.extBigVarchar1.displayName}`}
              rows={3}
            />
          </Field>,

          <Field
            name="extBigVarchar2"
            key="extBigVarchar2"
            sortNo={pageFieldJson.extBigVarchar2.sortNo}
            label={pageFieldJson.extBigVarchar2.displayName}
            decorator={{
              rules: [{ required: false }],
              initialValue: formData.extBigVarchar2 || '',
            }}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
          >
            <Input.TextArea
              placeholder={`请填写${pageFieldJson.extBigVarchar2.displayName}`}
              rows={3}
            />
          </Field>,
        ];
      } else if (taskKey === 'ACC_A57_03_ASSESSOR_b') {
        title = '考核人填写';
        fields = [
          <Field
            name="extBigVarchar1"
            key="extBigVarchar1"
            label={pageFieldJson.extBigVarchar1.displayName}
            sortNo={pageFieldJson.extBigVarchar1.sortNo}
            decorator={{
              rules: [{ required: false }],
              initialValue: formData.extBigVarchar1 || '',
            }}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
          >
            <Input.TextArea
              placeholder={`请填写${pageFieldJson.extBigVarchar1.displayName}`}
              rows={3}
            />
          </Field>,
          <Field name="attachment" label="附件" sortNo={999}>
            <FileManagerEnhance
              api="/api/worth/v1/performance/communicate/assessor/performanceCommunicateContent/sfs/token"
              dataKey={formData.id || ''}
              listType="text"
              disabled={false}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            />
          </Field>,
          <Field
            name="extBigVarchar2"
            key="extBigVarchar2"
            sortNo={pageFieldJson.extBigVarchar2.sortNo}
            label={pageFieldJson.extBigVarchar2.displayName}
            decorator={{
              rules: [{ required: false }],
              initialValue: formData.extBigVarchar2 || '',
            }}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
          >
            <Input.TextArea
              placeholder={`请填写${pageFieldJson.extBigVarchar2.displayName}`}
              rows={3}
            />
          </Field>,
        ];
      } else if (taskKey === 'ACC_A57_04_HR_CFM') {
        title = 'HR填写';
        fields = [
          <Field
            name="extBigVarchar1"
            key="extBigVarchar1"
            label={pageFieldJson.extBigVarchar1.displayName}
            sortNo={pageFieldJson.extBigVarchar1.sortNo}
            decorator={{
              rules: [{ required: false }],
              initialValue: formData.extBigVarchar1 || '',
            }}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
          >
            <Input.TextArea
              placeholder={`请填写${pageFieldJson.extBigVarchar1.displayName}`}
              rows={3}
            />
          </Field>,
        ];
      }
      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <Card className="tw-card-adjust" title={<Title icon="profile" text={`${title}`} />}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
            {filterList}
          </FieldList>
        </Card>
      );
    }
    return null;
  };

  render() {
    const { visible } = this.state;
    const {
      dispatch,
      loading,
      communicatePlanFlow: {
        fieldsConfig,
        flowForm,
        formData,
        checkAssessedData,
        assPersonList,
        assessorList,
        communicateView,
        communicateResView,
        pageConfigs,
      },
      form: { getFieldDecorator },
    } = this.props;
    const {
      PERFORMANCE_PLAN_COMMUNICATION_FLOW_ASSESSED: assessedPageConfig,
      PERFORMANCE_PLAN_COMMUNICATION_FLOW_ASSESSOR: assesPageConfig,
    } = pageConfigs;

    // 获取url上的参数
    const param = fromQs();
    // 当前节点名字
    const { taskKey, buttons } = fieldsConfig;
    if (buttons && buttons.length === 1) {
      if (taskKey === 'ACC_A57_03_ASSESSOR_b') {
        buttons.unshift({
          type: 'button',
          title: 'app.setting.flow.assessed.check.examPlan',
          className: 'tw-btn-primary',
          key: 'CHECKASSESSED',
        });
      }
      if (
        taskKey === 'ACC_A57_02_ASSESSED_b' ||
        taskKey === 'ACC_A57_03_ASSESSOR_b' ||
        taskKey === 'ACC_A57_04_HR_CFM'
      ) {
        buttons.unshift({
          type: 'button',
          title: 'app.setting.flow.check.examPlan',
          className: 'tw-btn-primary',
          key: 'CHECKPLAN',
        });
      }
    }
    let element = null;
    if (taskKey && taskKey !== 'ACC_A57_01_SUBMIT_i') {
      element = this.renderAssessor();
    }
    return (
      <PageHeaderWrapper>
        {loading ? (
          <Loading />
        ) : (
          <>
            <BpmWrapper
              fieldsConfig={fieldsConfig}
              flowForm={flowForm}
              buttonLoading={loading}
              onBpmChanges={value => {
                dispatch({
                  type: `${DOMAIN}/updateFlowForm`,
                  payload: value,
                });
              }}
              onBtnClick={({ operation, bpmForm }) => {
                // 当前点击按钮key
                const { key } = operation;
                const payload = {
                  taskId: param.taskId,
                  remark: bpmForm.remark,
                };
                // 查看考核计划
                if (key === 'CHECKPLAN') {
                  const urls = getUrl();
                  const from = stringify({ from: urls });
                  router.push(
                    `/hr/prefMgmt/communicate/communicatePlanFlowDetail?id=${
                      param.id
                    }&performanceExamContentType=OTHER`
                  );
                  return Promise.resolve(false);
                }
                // 查看被考核人填写内容
                if (key === 'CHECKASSESSED') {
                  if (checkAssessedData) {
                    if (checkAssessedData.assessedVisible) {
                      this.setState({
                        visible: true,
                      });
                    } else {
                      createMessage({ type: 'error', description: '不可查看被考核人明细' });
                    }
                  } else {
                    createMessage({ type: 'error', description: '不可查看被考核人明细' });
                  }
                }
                // 被考核人填写提交
                if (key === 'APPROVED' && taskKey === 'ACC_A57_02_ASSESSED_b') {
                  dispatch({
                    type: `${DOMAIN}/assessedSubmit`,
                    payload: {
                      taskId: param.taskId,
                      remark: bpmForm.remark,
                      performanceCommunicateResId: param.id,
                      ...formData,
                    },
                  });
                  return Promise.resolve(false);
                }
                // 考核人填写完毕后提交
                if (key === 'APPROVED' && taskKey === 'ACC_A57_03_ASSESSOR_b') {
                  dispatch({
                    type: `${DOMAIN}/assessorSubmit`,
                    payload: {
                      taskId: param.taskId,
                      remark: bpmForm.remark,
                      performanceCommunicateResId: param.id,
                      ...formData,
                    },
                  });
                  return Promise.resolve(false);
                }
                // hr填写完毕后提交
                if (key === 'APPROVED' && taskKey === 'ACC_A57_04_HR_CFM') {
                  dispatch({
                    type: `${DOMAIN}/hrSubmit`,
                    payload: {
                      taskId: param.taskId,
                      remark: bpmForm.remark,
                      performanceCommunicateResId: param.id,
                      ...formData,
                    },
                  });
                  return Promise.resolve(false);
                }

                if (key === 'APPROVED') {
                  // promise 为true,默认走后续组件流程的方法
                  return Promise.resolve(true);
                }
                // promise 为false,后续组件方法不走,走自己的逻辑
                return Promise.resolve(false);
              }}
            >
              {taskKey === 'ACC_A57_04_HR_CFM' ? (
                <div>
                  {element}
                  {assPersonList
                    ? assPersonList.map((item, key) => {
                        if (assessedPageConfig) {
                          if (
                            !assessedPageConfig.pageBlockViews ||
                            assessedPageConfig.pageBlockViews.length < 1
                          ) {
                            return <div />;
                          }
                          const currentBlockConfig = assessedPageConfig.pageBlockViews[0];
                          const { pageFieldViews } = currentBlockConfig;
                          const pageFieldJson = {};
                          pageFieldViews.forEach(field => {
                            pageFieldJson[field.fieldKey] = field;
                          });
                          let fields = [];
                          fields = [
                            <Description
                              term={pageFieldJson.extNumber1.displayName}
                              key="extNumber1"
                            >
                              <Rate defaultValue={Number(item.extNumber1) || undefined} disabled />
                            </Description>,
                            <Description
                              term={pageFieldJson.extBigVarchar1.displayName}
                              key="extBigVarchar1"
                            >
                              <Input.TextArea
                                placeholder={`请填写${pageFieldJson.extBigVarchar1.displayName}`}
                                rows={3}
                                disabled
                                defaultValue={item.extBigVarchar1 || ''}
                              />
                            </Description>,
                            <Description
                              term={pageFieldJson.extBigVarchar2.displayName}
                              key="extBigVarchar2"
                            >
                              <Input.TextArea
                                placeholder={`请填写${pageFieldJson.extBigVarchar2.displayName}`}
                                rows={3}
                                disabled
                                defaultValue={item.extBigVarchar2 || ''}
                              />
                            </Description>,
                          ];
                          const filterList = fields
                            .filter(
                              field => !field.key || pageFieldJson[field.key].visibleFlag === 1
                            )
                            .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
                          return (
                            <Card
                              className="tw-card-adjust"
                              style={{ marginTop: '6px' }}
                              title={<Title icon="profile" text="被考核人填写内容" />}
                              bordered={false}
                            >
                              <DescriptionList size="large" col={1}>
                                {filterList}
                              </DescriptionList>
                            </Card>
                          );
                        }
                        return null;
                      })
                    : null}
                  {/* 考核人填写内容 */}
                  {assessorList
                    ? assessorList.map((item, key) => {
                        if (assesPageConfig) {
                          if (
                            !assesPageConfig.pageBlockViews ||
                            assesPageConfig.pageBlockViews.length < 1
                          ) {
                            return <div />;
                          }
                          const currentBlockConfig = assesPageConfig.pageBlockViews[0];
                          const { pageFieldViews } = currentBlockConfig;
                          const pageFieldJson = {};
                          pageFieldViews.forEach(field => {
                            pageFieldJson[field.fieldKey] = field;
                          });
                          let fields = [];
                          fields = [
                            <Description
                              term={pageFieldJson.extBigVarchar1.displayName}
                              key="extBigVarchar1"
                            >
                              <Input.TextArea
                                placeholder={`请填写${pageFieldJson.extBigVarchar1.displayName}`}
                                rows={3}
                                disabled
                                defaultValue={item.extBigVarchar1 || ''}
                              />
                            </Description>,
                            <Description term="附件">
                              <FileManagerEnhance
                                api="/api/worth/v1/performance/communicate/assessor/performanceCommunicateContent/sfs/token"
                                dataKey={item.id}
                                listType="text"
                                disabled
                                preview
                              />
                            </Description>,
                            <Description
                              term={pageFieldJson.extBigVarchar2.displayName}
                              key="extBigVarchar2"
                            >
                              <Input.TextArea
                                placeholder={`请填写${pageFieldJson.extBigVarchar2.displayName}`}
                                rows={3}
                                disabled
                                defaultValue={item.extBigVarchar2 || ''}
                              />
                            </Description>,
                          ];
                          const filterList = fields
                            .filter(
                              field => !field.key || pageFieldJson[field.key].visibleFlag === 1
                            )
                            .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
                          return (
                            <Card
                              className="tw-card-adjust"
                              style={{ marginTop: '6px' }}
                              title={
                                <Title
                                  icon="profile"
                                  text={`考核人填写内容-${item.resName || ''}`}
                                />
                              }
                              bordered={false}
                            >
                              <DescriptionList size="large" col={1}>
                                {filterList}
                              </DescriptionList>
                            </Card>
                          );
                        }
                        return null;
                      })
                    : null}
                </div>
              ) : (
                <div>{element}</div>
              )}
              {!taskKey || taskKey === 'ACC_A57_01_SUBMIT_i' ? (
                <div>
                  <Card
                    className="tw-card-adjust"
                    style={{ marginTop: '6px' }}
                    title={<Title icon="profile" text="沟通信息" />}
                    bordered={false}
                  >
                    <DescriptionList size="large" col={2}>
                      <Description term="考核名称">
                        {communicateView ? communicateView.performanceExamName : ''}
                      </Description>
                      <Description term="考核沟通人">
                        {communicateResView ? communicateResView.resName : ''}
                      </Description>
                      <Description term="沟通类型">
                        {communicateView ? communicateView.communicateTypeName : ''}
                      </Description>
                      <Description term="沟通状态">
                        {communicateResView ? communicateResView.communicateStatusName : ''}
                      </Description>
                      <Description term="发起人">
                        {communicateView ? communicateView.applyResName : ''}
                      </Description>
                      <Description term="发起日期">
                        {communicateView ? communicateView.applyDate : ''}
                      </Description>
                    </DescriptionList>
                  </Card>
                </div>
              ) : null}
            </BpmWrapper>
          </>
        )}
        {visible ? <AssessorModal visible={visible} closeModal={this.closeModal} /> : null}
      </PageHeaderWrapper>
    );
  }
}

export default CommunicatePlanFlow;
