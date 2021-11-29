import React, { PureComponent } from 'react';
import moment from 'moment';
import router from 'umi/router';
import classnames from 'classnames';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { formatMessage } from 'umi/locale';
import { Button, Card, Input, Form, Modal } from 'antd';
import Title from '@/components/layout/Title';
import Loading from '@/components/core/DataLoading';
import FieldList from '@/components/layout/FieldList';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import createMessage from '@/components/core/AlertMessage';
import SelectWithCols from '@/components/common/SelectWithCols';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsNoTab } from '@/layouts/routerControl';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { getUrl } from '@/utils/flowToRouter';
import Detail from './view';
import LeaderDetail from './leaderRecieveDetail';

const { Description } = DescriptionList;
const { Field } = FieldList;

const columns = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
const DOMAIN = 'userLeadsDetail';
const TASK_LEADS_SUBMIT = 'TSK_S01_01_LEADS_SUBMIT_i';
const TASK_FLOW_ASSIGN_POINT = 'TSK_S01_02_LEADS_ASSIGN';
const TASK_FLOW_LEADS_DISPOSE = 'TSK_S01_03_LEADS_DISPOSE_b';
const TASK_FLOW_LEADS_EXAMINE = 'TSK_S01_04_LEADS_EXAMINE';
const TSK_S01_05_LEADS_RECIEVE_B = 'TSK_S01_05_LEADS_RECIEVE_b';

@connect(({ loading, userLeadsDetail, dispatch }) => ({
  loading,
  userLeadsDetail,
  dispatch,
}))
@mountToTab()
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
class userLeadsDetailDetail extends PureComponent {
  state = {
    closeReason: null,
    visible: false,
    bpmForm: {},
  };

  handleCloseReason = () => {
    const { closeReason, bpmForm } = this.state;

    const { taskId, id, mode } = fromQs();
    const {
      dispatch,
      userLeadsDetail: { formData },
    } = this.props;
    const param = fromQs();
    if (!closeReason) {
      createMessage({ type: 'error', description: '请选择关闭原因' });
      return;
    }

    const flows = {
      ...formData,
      flow: {
        taskId,
        result: 'APPROVED',
        remark: bpmForm.remark,
        branch: bpmForm.branch,
      },
    };
    // dispatch({ type: `${DOMAIN}/saveCloseReason`, payload: { id: formData.id, closeReason } })
    dispatch({
      type: `${DOMAIN}/close`,
      payload: flows,
    }).then(res => {
      if (res) {
        const url = getUrl().replace('edit', 'view');
        closeThenGoto(url);
      }
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  // 不明白为什么要写两个版本的详情  这个页面一共控制3个节点，
  // 即2-5，2-4之间的话流程表单显示内容不一样，我分开渲染，在到第五个节点时只显示下部分的线索详情
  // 2-4的线索详情与5的线索详情相同  5的详情因要用到可配置化，所以我单独写成了一个详情组件
  renderPage = (taskKey, title) => {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, validateFieldsAndScroll, setFieldsValue },
      userLeadsDetail: {
        formData,
        page,
        salemanList,
        salemanSource,
        fieldsConfig,
        flowForm,
        salesmanResRecord,
        pageConfig,
        leaderConfig,
        saleConfig,
        leaderReviewConfig,
      },
    } = this.props;
    let fields = [];
    let filterList = [];
    if (taskKey === TASK_FLOW_LEADS_DISPOSE) {
      if (!saleConfig.pageBlockViews || saleConfig.pageBlockViews.length < 1) {
        return <div />;
      }
      let currentBlockConfig = {};
      saleConfig.pageBlockViews.forEach(view => {
        if (view.blockKey === 'LEADS_MANAGEMENT_DISPOSE') {
          // 线索分配流程的销售负责人处理审批页面
          currentBlockConfig = view;
        }
      });
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { isRewardName = {}, rewardBuIdName = {}, isRewardReasonName = {} } = pageFieldJson;

      fields = [
        <Field
          name="isReward"
          key="isRewardName"
          label={isRewardName.displayName}
          sortno={isRewardName.sortNo}
          decorator={{
            initialValue: formData.isReward || undefined,
            rules: [
              {
                required: !!isRewardName.requiredFlag,
                message: `请选择${isRewardName.displayName}`,
              },
            ],
          }}
        >
          <Selection.UDC
            onChange={e => {
              if (!e || e === 'NO') {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: { rewardBuId: undefined },
                });
                setFieldsValue({
                  rewardBuId: undefined,
                });
              }
            }}
            code="COM:YESNO"
            placeholder={`请选择${isRewardName.displayName}`}
          />
        </Field>,
        <Field
          name="rewardBuId"
          key="rewardBuIdName"
          label={rewardBuIdName.displayName}
          sortno={rewardBuIdName.sortNo}
          decorator={{
            initialValue: formData.rewardBuId || undefined,
            rules: [
              {
                required: formData.isReward === 'YES',
                message: `请选择${rewardBuIdName.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            className="x-fill-100"
            placeholder={`请选择${rewardBuIdName.displayName}`}
            columns={columns}
            disabled={formData.isReward === 'NO' || !formData.isReward}
            source={() => selectBuMultiCol()}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            dropdownStyle={{ width: 440 }}
            showSearch
          />
        </Field>,
        <Field
          name="isRewardReason"
          key="isRewardReasonName"
          label={isRewardReasonName.displayName}
          sortno={isRewardReasonName.sortNo}
          fieldCol={1}
          labelCol={{ span: 4, xxl: 3 }}
          wrapperCol={{ span: 19, xxl: 20 }}
          decorator={{
            initialValue: formData.isRewardReason || undefined,
            rules: [
              {
                required: !!isRewardReasonName.requiredFlag,
                message: `请输入${isRewardReasonName.displayName}`,
              },
            ],
          }}
        >
          <Input.TextArea
            disabled={formData.isReward === 'YES' || !formData.isReward}
            rows={3}
            placeholder={`请输入${isRewardReasonName.displayName}`}
          />
        </Field>,
      ];
      filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    } else if (taskKey === TASK_FLOW_LEADS_EXAMINE) {
      if (!leaderReviewConfig.pageBlockViews || leaderReviewConfig.pageBlockViews.length < 1) {
        return <div />;
      }
      let currentBlockConfig = {};
      leaderReviewConfig.pageBlockViews.forEach(view => {
        if (view.blockKey === 'LEADS_MANAGEMENT_EXAMINE') {
          // 线索分配流程的线索管理员审核审批页面
          currentBlockConfig = view;
        }
      });
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const {
        isRewardName = {},
        rewardBuIdName = {},
        isRewardReasonName = {},
        rewardPriceName = {},
        currencyTypeName = {},
      } = pageFieldJson;
      fields = [
        <Field
          name="isReward"
          key="isRewardName"
          label={isRewardName.displayName}
          sortno={isRewardName.sortNo}
          decorator={{
            initialValue: formData.isReward || undefined,
            rules: [
              {
                required: !!isRewardName.requiredFlag,
                message: `请选择${isRewardName.displayName}`,
              },
            ],
          }}
        >
          <Selection.UDC
            onChange={e => {
              if (!e || e === 'NO') {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    rewardBuId: null,
                    rewardPrice: null,
                    currencyType: null,
                  },
                });
                setFieldsValue({
                  rewardBuId: null,
                  rewardPrice: null,
                  currencyType: null,
                });
              }
            }}
            code="COM:YESNO"
            placeholder={`请选择${isRewardName.displayName}`}
          />
        </Field>,
        <Field
          name="rewardBuId"
          key="rewardBuIdName"
          label={rewardBuIdName.displayName}
          sortno={rewardBuIdName.sortNo}
          decorator={{
            initialValue: formData.rewardBuId || undefined,
            rules: [
              {
                required: formData.isReward === 'YES',
                message: `请选择${rewardBuIdName.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            className="x-fill-100"
            placeholder={`请选择${rewardBuIdName.displayName}`}
            columns={columns}
            disabled={formData.isReward === 'NO' || !formData.isReward}
            source={() => selectBuMultiCol()}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            dropdownStyle={{ width: 440 }}
            showSearch
          />
        </Field>,
        <Field
          name="isRewardReason"
          key="isRewardReasonName"
          label={isRewardReasonName.displayName}
          sortno={isRewardReasonName.sortNo}
          fieldCol={1}
          labelCol={{ span: 4, xxl: 3 }}
          wrapperCol={{ span: 19, xxl: 20 }}
          decorator={{
            initialValue: formData.isRewardReason || undefined,
          }}
        >
          <Input.TextArea
            disabled={formData.isReward === 'YES' || !formData.isReward}
            rows={3}
            placeholder={`请输入${isRewardReasonName.displayName}`}
          />
        </Field>,
        <Field
          name="rewardPrice"
          key="rewardPriceName"
          label={rewardPriceName.displayName}
          sortno={rewardPriceName.sortNo}
          decorator={{
            initialValue: formData.rewardPrice || undefined,
            rules: [
              {
                required: formData.isReward === 'YES',
                message: `请输入${rewardPriceName.displayName}`,
              },
            ],
          }}
        >
          <Input
            disabled={formData.isReward === 'NO' || !formData.isReward}
            placeholder={`请输入${rewardPriceName.displayName}`}
          />
        </Field>,
        <Field
          name="currencyType"
          key="currencyTypeName"
          label={currencyTypeName.displayName}
          sortno={currencyTypeName.sortNo}
          decorator={{
            initialValue: formData.currencyType || undefined,
            rules: [
              {
                required: formData.isReward === 'YES',
                message: `请选择${currencyTypeName.displayName}`,
              },
            ],
          }}
        >
          <Selection.UDC
            code="COM:CURRENCY_KIND"
            disabled={formData.isReward === 'NO' || !formData.isReward}
            placeholder={`请选择${currencyTypeName.displayName}`}
          />
        </Field>,
      ];
      filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    } else if (taskKey === TASK_FLOW_ASSIGN_POINT) {
      if (!leaderConfig.pageBlockViews || leaderConfig.pageBlockViews.length < 1) {
        return <div />;
      }
      let currentBlockConfig = {};
      leaderConfig.pageBlockViews.forEach(view => {
        if (view.blockKey === 'LEADS_MANAGEMENT_ASSIGN') {
          // 线索分配流程的线索管理员分配审批页面
          currentBlockConfig = view;
        }
      });
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { salesmanResId = {} } = pageFieldJson;
      fields = [
        <Field
          name="salesmanResId"
          key="salesmanResId"
          label={salesmanResId.displayName}
          sortno={salesmanResId.sortNo}
          decorator={{
            initialValue: formData.salesmanResId,
            rules: [
              {
                required: !!salesmanResId.requiredFlag,
                message: `请选择${salesmanResId.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            className="x-fill-100"
            source={salemanSource}
            columns={columns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            placeholder={`请选择${salesmanResId.displayName}`}
            onColumnsChange={value => {}}
          />
        </Field>,
      ];
      filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    }
    return (
      <Card
        title={<Title icon="profile" id="app.setting.flow.form" defaultMessage="流程表单" />}
        className="tw-card-adjust x-fill-100"
        style={{ marginBottom: 4 }}
      >
        <FieldList getFieldDecorator={getFieldDecorator} layout="horizontal" col={2} legend={title}>
          {filterList}
        </FieldList>
      </Card>
    );
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, validateFieldsAndScroll, setFieldsValue },
      userLeadsDetail: {
        formData,
        page,
        salemanList,
        salemanSource,
        fieldsConfig,
        flowForm,
        salesmanResRecord,
        pageConfig,
        leaderConfig,
        saleConfig,
        leaderReviewConfig,
        lastLeaderConfig,
      },
    } = this.props;
    const { closeReason, visible } = this.state;
    const { taskId, id, mode } = fromQs();
    const { taskKey, version } = fieldsConfig;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const isInternal = formData.sourceType === 'INTERNAL';

    return (
      <PageHeaderWrapper title="线索详情">
        <BpmWrapper
          fields={[]}
          fieldsConfig={
            taskKey === TSK_S01_05_LEADS_RECIEVE_B
              ? {
                  ...fieldsConfig,
                  buttons: fieldsConfig.buttons.filter(
                    v => v.key === (formData.isReward === 'YES' ? 'ACCEPT_REWARD' : 'FLOW_DIST')
                  ),
                }
              : fieldsConfig
          }
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, formData: formD, bpmForm }) => {
            // taskid branch result
            const { key } = operation;
            const { remark, branch } = bpmForm;
            if (taskKey === TASK_LEADS_SUBMIT) {
              closeThenGoto(
                `/sale/management/leadsedit?id=${id}&mode=update&page=leads&taskId=${taskId}&remark=${remark}`
              );
              return Promise.resolve(false);
            }
            // if (formData.apprStatus === 'FLOW_DIST') {
            if (key === 'FLOW_DIST') {
              // 这个节点需要业务表单操作,业务操作完之后，推进节点
              return new Promise((resolve, reject) => {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    const flow = {
                      ...formData,
                      flow: {
                        taskId,
                        result: 'APPROVED',
                        remark,
                        branch,
                      },
                    };
                    dispatch({
                      type: `${DOMAIN}/save`,
                      payload: flow,
                    }).then(res => {
                      if (res) {
                        const url = getUrl().replace('edit', 'view');
                        closeThenGoto(url);
                      }
                    });
                  } else resolve(false);
                });
              });
            }
            if (key === 'ACCEPT_REWARD') {
              // 这个节点需要业务表单操作,业务操作完之后，推进节点
              return new Promise((resolve, reject) => {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    const flow = {
                      ...formData,
                      flow: {
                        taskId,
                        result: 'APPROVED',
                        remark,
                        branch,
                      },
                    };
                    dispatch({
                      type: `${DOMAIN}/finsh`,
                      payload: flow,
                    }).then(res => {
                      if (res) {
                        router.push(
                          `/plat/expense/normal/create?rewardFlag=true&rm=${
                            formData.rewardPrice
                          }&bz=CNY&expenseBu=${formData.rewardBuId}&expenseOuId=${
                            formData.expenseOuId
                          }&leadNo=${formData.leadsNo}&leadName=${
                            formData.leadsName
                          }&expenseBuName=${formData.rewardBuIdName}&leadsId=${id}`
                        );
                      }
                    });
                  } else resolve(false);
                });
              });
            }
            if (key === 'FLOW_CLOSE') {
              this.setState({ visible: true, bpmForm });
              return Promise.resolve(false);
            }
            // }
            return Promise.resolve(false);
          }}
        >
          {mode === 'edit' && (
            <>
              {leaderConfig ? (
                fieldsConfig.taskKey === TASK_FLOW_ASSIGN_POINT &&
                taskId &&
                this.renderPage(TASK_FLOW_ASSIGN_POINT, '跟进人员')
              ) : (
                <Loading />
              )}
              {saleConfig ? (
                fieldsConfig.taskKey === TASK_FLOW_LEADS_DISPOSE &&
                taskId &&
                this.renderPage(TASK_FLOW_LEADS_DISPOSE, '销售人员审核')
              ) : (
                <Loading />
              )}
              {leaderReviewConfig ? (
                fieldsConfig.taskKey === TASK_FLOW_LEADS_EXAMINE &&
                taskId &&
                this.renderPage(TASK_FLOW_LEADS_EXAMINE, '线索管理员确认')
              ) : (
                <Loading />
              )}
              {formData.id && fieldsConfig.taskKey !== TSK_S01_05_LEADS_RECIEVE_B ? (
                <Detail mode="threeZero" />
              ) : null}
              {formData.id && fieldsConfig.taskKey === TSK_S01_05_LEADS_RECIEVE_B ? (
                <LeaderDetail pageConfig={lastLeaderConfig} />
              ) : null}
            </>
          )}
          {/* 详情页要添加相关流程项目，因此是不存在 taskId 的时候才展示 */}
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'TSK_S01' }]} />}
        </BpmWrapper>
        <Modal
          destroyOnClose
          title="关闭线索"
          visible={visible}
          onOk={this.handleCloseReason}
          onCancel={this.toggleVisible}
          width="50%"
        >
          <FieldList
            getFieldDecorator={getFieldDecorator}
            layout="horizontal"
            style={{ overflow: 'hidden' }}
            col={1}
          >
            <Field
              name="closeReason"
              label="关闭原因"
              decorator={{
                initialValue: closeReason,
              }}
            >
              <UdcSelect
                // value={closeReason}
                code="TSK.LEADS_CLOSE_REASON"
                onChange={value => {
                  this.setState({ closeReason: value });
                }}
              />
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default userLeadsDetailDetail;
