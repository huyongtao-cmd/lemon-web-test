import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import update from 'immutability-helper';
import { gte, isNil, isEmpty, clone } from 'ramda';
import { Card, Button, Input, Table } from 'antd';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import EditableDataTable from '@/components/common/EditableDataTable';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { mul, add, sub, div, checkIfNumber } from '@/utils/mathUtils';
import EvalTemple from './config/EvalModal';
import EvalList from './config/EvalList';
import { createConfirm } from '@/components/core/Confirm';
import EvalCommonModal from '@/pages/gen/eval/modal/Common';

const { Description } = DescriptionList;
const DOMAIN = 'SinglePreview';

const TASK_FLOW_01 = 'ACC_A22_01_EQVA_SETTLE_SUBMIT_i';

@connect(({ SinglePreview, user, loading }) => ({ SinglePreview, user, loading }))
@mountToTab()
class SinglePreview extends Component {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();
    dispatch({
      type: `${DOMAIN}/queryInfo`,
      payload: id,
    }).then(() => {
      setTimeout(() => {
        taskId
          ? dispatch({
              type: `${DOMAIN}/fetchConfig`,
              payload: taskId,
            })
          : dispatch({ type: `${DOMAIN}/cleanFlow` });
      }, 0);
    });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      SinglePreview: { list },
      dispatch,
    } = this.props;
    const value =
      rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    const newList = update(list, { [rowIndex]: { [rowField]: { $set: value } } });
    const rowData = list[rowIndex];
    const { applySettleEqva = 0 } = rowData;

    const result = gte(applySettleEqva, value);
    if (!result) {
      createMessage({ type: 'warn', description: `输入的值不能大于${applySettleEqva}` });
      const modifiedList = update(list, { [rowIndex]: { [rowField]: { $set: applySettleEqva } } });
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          [rowField]: modifiedList
            .map(l => l.applySettleEqva)
            .reduce((prev, curr) => add(prev || 0, curr || 0), 0),
        },
      });
      // 更新单元格状态
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          list: modifiedList,
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          [rowField]: newList
            .map(l => l.applySettleEqva)
            .reduce((prev, curr) => add(prev || 0, curr || 0), 0),
        },
      });
      // 更新单元格状态
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          list: newList,
        },
      });
    }
  };

  tableProps = () => {
    const {
      SinglePreview: { list },
      loading,
    } = this.props;
    const { taskId, mode } = fromQs();

    const tableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/queryInfo`],
      scroll: {
        x: 1200,
      },
      showAdd: false,
      showCopy: false,
      showDelete: false,
      dataSource: list,
      bordered: true,
      // rowSelection: false,
      columns: [
        {
          title: '工作日期',
          dataIndex: 'workDate',
          className: 'text-center',
          width: 100,
        },
        {
          title: '工时状态',
          dataIndex: 'timeSheetStatusName',
          className: 'text-center',
          width: 80,
        },
        {
          title: '结算状态',
          dataIndex: 'settleStatusName',
          className: 'text-center',
          width: 80,
        },
        {
          title: '活动编号',
          dataIndex: 'actNo',
          className: 'text-center',
          width: 50,
        },
        {
          title: '活动名称',
          dataIndex: 'actName',
          width: 200,
        },
        {
          title: '工作说明',
          dataIndex: 'workDesc',
          width: 300,
        },
        {
          title: '工时',
          dataIndex: 'workHour',
          className: 'text-center',
          width: 50,
        },
        {
          title: '理论获得当量',
          dataIndex: 'applySettleEqva',
          className: 'text-center',
          width: 100,
        },
        taskId &&
          mode === 'edit' && {
            title: '实际结算当量',
            dataIndex: 'approveSettleEqva',
            className: 'text-center',
            width: 100,
            options: {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (isNil(value)) {
                      callback();
                    } else {
                      const error = [];
                      if (!checkIfNumber(value)) error.push('输入类型不正确');
                      callback(error);
                    }
                  },
                },
              ],
            },
            render: (value, row, index) => (
              <Input value={value} onChange={this.onCellChanged(index, 'approveSettleEqva')} />
            ),
          },
      ].filter(Boolean),
      pagination: false,
    };
    return tableProps;
  };

  render() {
    const {
      SinglePreview: { formData, fieldsConfig: config, flowForm, list },
      user: {
        user: { info = {}, extInfo = {} },
      },
      dispatch,
    } = this.props;
    const { visible } = this.state;
    const { id, taskId, mode, sourceUrl } = fromQs();

    const showButton =
      formData && formData.evalStatus === 'NONE' && extInfo.resId + '' === formData.dispatchId + '';
    const { priceVisible, salaryVisible } = formData;
    let priceAndSalaryTerm = '';
    let priceAndSalaryValue = '';
    if (priceVisible && salaryVisible) {
      priceAndSalaryTerm = '结算单价/当量工资';
      priceAndSalaryValue = `${formData.settlePrice}/${formData.eqvaSalary}`;
    } else if (priceVisible && !salaryVisible) {
      priceAndSalaryTerm = '结算单价';
      priceAndSalaryValue = `${formData.settlePrice}`;
    } else if (!priceVisible && salaryVisible) {
      priceAndSalaryTerm = '当量工资';
      priceAndSalaryValue = `${formData.eqvaSalary}`;
    }

    let fieldsConfig = {};
    if (!isEmpty(config)) {
      const { taskKey } = config;
      if (taskKey !== TASK_FLOW_01 && !showButton) {
        const newConfig = clone(config);
        fieldsConfig = {
          ...newConfig,
          buttons: newConfig.buttons.filter(({ key }) => key !== 'EVAL'),
        };
      } else {
        fieldsConfig = config;
      }
    }
    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fields={[]}
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          scope="ACC_A22_SINGLE"
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { taskKey } = fieldsConfig;
            const { remark } = bpmForm;
            if (taskKey === TASK_FLOW_01) {
              closeThenGoto(
                `/plat/intelStl/list/single/edit?id=${id}&taskId=${taskId}&remark=${remark}`
              );
              return Promise.resolve(false);
            }
            if (operation.key === 'EVAL') {
              this.setState({ visible: true });
              return Promise.resolve(false);
            }
            if (operation.key && operation.key === 'REJECTED') {
              return Promise.resolve(true);
            }
            // ACC_A22_02_EMPLOYER_CONFIRM_b
            return new Promise((resolve, reject) => {
              const formD = {
                settleType: 'TASK_BY_MANDAY',
                id,
                settleDate: formData.settleDate,
                remark: formData.remark,
                twEqvaSettleDEntities: list,
                procTaskId: taskId,
                procRemark: remark,
              };
              dispatch({ type: `${DOMAIN}/checkAndSave`, payload: formD }).then(result => {
                if (result) {
                  // closeThenGoto(`/plat/intelStl/list/sum/preview?id=${id}`);
                  // 校验当量是否都已经结算
                  dispatch({
                    type: `SumPreview/checkTaskEqva`,
                    payload: id,
                  }).then(allStled => {
                    if (allStled) {
                      // 全部结算
                      // 弹出 提示窗口
                      createConfirm({
                        content: '任务包下所有当量已经结算，是否关闭该任务包？',
                        onOk: () =>
                          dispatch({
                            // 任务包下所有当量都已结算完毕，关闭任务包，弹出评价窗口
                            type: `SumPreview/closeTaskByStlId`,
                            payload: id,
                          }).then(taskView => {
                            // 选择关闭任务包，关闭成功后跳转到评价界面
                            const { disterResId, receiverResId, id: sourceId } = taskView;
                            if (taskView) {
                              // 如果接包人和发包人是同一个人 不需评价
                              if (disterResId === receiverResId)
                                closeThenGoto(`/user/flow/process`);
                              this.setState({ visible: true });
                              dispatch({
                                type: `evalCommonModal/query`,
                                payload: {
                                  evalClass: 'TASK',
                                  evalType: 'SENDER2RECEIVER',
                                  evalerResId: disterResId,
                                  evaledResId: receiverResId,
                                  sourceId,
                                },
                              });
                            } else {
                              closeThenGoto(`/user/flow/process`);
                            }
                          }),
                        onCancel: () => closeThenGoto(`/user/flow/process`),
                      });
                    } else {
                      closeThenGoto(`/user/flow/process`);
                    }
                  });
                }
                // checkAndSave方法完成保存、调用存储过程、审批流程工作，所以此处不再走架构提供的审批方法
                return resolve(false);
              });
            });
          }}
        >
          <Card className="tw-card-rightLine">
            {/*
              * 条件：
              * 1. 状态为 未评价 'NONE|FINISH' -> 'NONE'
              * 2. 当前操作人（登录人）为 发包人 info.id === dispatchId
              * 3. taskId， 如果没有 taskId，要展示按钮，通过按钮操作，如果有 taskId，则变成受控组件，通过 showModal 来控制
             */}
            {/* <EvalTemple
              showButton={showButton && !taskId}
              showModal={visible}
              onCancel={() => this.setState({ visible: false })}
              sourceId={id}
              evalerResName={info.name}
              evaledResName={formData.applyResName}
              options={{
                evalClass: 'TASK',
                evalType: 'RECIEVER2SENDER',
              }}
            /> */}
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              disabled={false}
              onClick={() =>
                sourceUrl ? closeThenGoto(sourceUrl) : closeThenGoto('/plat/intelStl/list')
              }
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
          <Card className="tw-card-adjust" bordered={false}>
            <DescriptionList size="large" col={2} title="当量结算单价">
              <Description term="结算单号">{formData.settleNo}</Description>
              <Description term="申请人">{formData.applyResName}</Description>
              <Description term="申请日期">
                {formatDT(formData.applyDate, 'YYYY-MM-DD HH:mm:ss')}
              </Description>
              <Description term="结算日期">
                {formatDT(formData.settleDate, 'YYYY-MM-DD HH:mm:ss')}
              </Description>
              <Description term={'申请结算当量' + (priceVisible ? '/金额' : '')}>
                {`${formData.applySettleEqva}` +
                  (priceVisible ? `/${formData.applySettleAmt}` : '')}
              </Description>
              <Description
                style={!priceVisible && !salaryVisible ? { visibility: 'hidden' } : {}}
                term={priceAndSalaryTerm}
              >
                {priceAndSalaryValue + (!priceVisible && !salaryVisible ? '占位' : '')}
              </Description>
              <Description
                style={{ clear: 'left' }}
                term={'批准结算的当量' + (priceVisible ? '/金额' : '')}
              >
                {`${formData.approveSettleEqva}` +
                  (priceVisible
                    ? `/${
                        taskId && mode === 'edit'
                          ? mul(formData.approveSettleEqva || 0, formData.settlePrice || 0)
                          : formData.approveSettleAmt
                      }`
                    : '')}
              </Description>
              {salaryVisible ? (
                <Description term="资源当量收入金额">
                  {(taskId && mode === 'edit') ||
                  (formData.settleStatusName && formData.settleStatusName === '完成')
                    ? `${mul(formData.approveSettleEqva || 0, formData.eqvaSalary || 0).toFixed(0)}`
                    : `${mul(formData.applySettleEqva || 0, formData.eqvaSalary || 0).toFixed(0)}`}
                </Description>
              ) : (
                <Description style={{ visibility: 'hidden' }} term="占位">
                  占位
                </Description>
              )}

              <Description term="结算状态">{formData.settleStatusName}</Description>
              <Description term="审批状态">{formData.apprStatusName}</Description>
              <Description term="验收方式">{formData.acceptMethodName}</Description>
              <Description term="相关项目">
                {formData.projName}（{formData.projNo}）
              </Description>
              <Description term="收入资源">{formData.incomeResName}</Description>
              <Description term="任务包名称">
                {formData.taskName}（{formData.taskNo}）
              </Description>
              <Description term="发包人">{formData.dispatchName}</Description>
              <Description term="项目经理">{formData.pmName}</Description>
              <Description term="质保金比例/质保当量">
                {`${formData.guaranteeRate}/${
                  taskId && mode === 'edit'
                    ? mul(
                        formData.approveSettleEqva || 0,
                        div(+formData.guaranteeRate, 100)
                      ).toFixed(2)
                    : formData.graranteeEqva
                }`}
              </Description>
              <Description term="支出BU">{formData.expenseBuName}</Description>
              <Description term="结算说明">{formData.remark}</Description>
            </DescriptionList>
          </Card>
          <Card className="tw-card-adjust" title="结算明细" bordered={false}>
            {taskId && mode === 'edit' ? (
              <EditableDataTable {...this.tableProps()} />
            ) : (
              <Table {...this.tableProps()} />
            )}
          </Card>
          {/* <EvalList
            isEval={formData.evalStatus === 'FINISH'}
            sourceId={id}
            options={{
              evalClass: 'TASK',
              evalType: 'RECIEVER2SENDER',
            }}
          /> */}
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A22.SINGLE' }]} />}
        </BpmWrapper>
        <EvalCommonModal
          visible={visible}
          toggle={() => {
            this.setState({ visible: !visible });
            closeThenGoto(`/user/flow/process`);
          }}
        />
      </PageHeaderWrapper>
    );
  }
}

export default SinglePreview;
