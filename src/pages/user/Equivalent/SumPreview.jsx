import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { gte, isNil, isEmpty, clone } from 'ramda';
import update from 'immutability-helper';
import { Card, Button, Input, Table, DatePicker } from 'antd';
import moment from 'moment';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import createMessage from '@/components/core/AlertMessage';
import EditableDataTable from '@/components/common/EditableDataTable';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { mul, add, sub, div, checkIfNumber } from '@/utils/mathUtils';
import EvalTemple from './config/EvalModal';
import EvalList from './config/EvalList';
import { createConfirm } from '@/components/core/Confirm';
import EvalCommonModal from '@/pages/gen/eval/modal/Common';

const { Description } = DescriptionList;
const DOMAIN = 'SumPreview';

const TASK_FLOW_01 = 'ACC_A22_01_EQVA_SETTLE_SUBMIT_i';

@connect(({ SumPreview, user, loading }) => ({ SumPreview, user, loading }))
@mountToTab()
class SumPreview extends Component {
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
      SumPreview: { list, formData },
      dispatch,
    } = this.props;
    const value =
      rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    const newList = update(list, { [rowIndex]: { [rowField]: { $set: value } } });
    const rowData = list[rowIndex];
    const { avalSettleEqva, ssCompPercent } = rowData;
    // applySettleEqva
    if (rowField === 'approveSettleEqva') {
      const result = gte(avalSettleEqva, value);
      if (!result) {
        createMessage({ type: 'warn', description: `????????????????????????${avalSettleEqva}` });
        const modifiedList = update(list, { [rowIndex]: { [rowField]: { $set: avalSettleEqva } } });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            [rowField]: modifiedList
              .map(l => l.approveSettleEqva)
              .reduce((prev, curr) => add(prev || 0, curr || 0), 0),
          },
        });
        // ?????????????????????
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
              .map(l => l.approveSettleEqva)
              .reduce((prev, curr) => add(prev || 0, curr || 0), 0),
          },
        });
        // ?????????????????????
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            list: newList,
          },
        });
      }
      // reportCompPercent
    } else {
      // const calc = sub(100, ssCompPercent || 0);
      const result = gte(100, value);
      if (!result) {
        createMessage({ type: 'warn', description: `????????????????????????100` });
        // ?????????????????????
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            list: update(list, { [rowIndex]: { [rowField]: { $set: 100 } } }),
          },
        });
      } else {
        // ?????????????????????
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            list: newList,
          },
        });
      }
    }
  };

  onFieldsChange = (rowField, value) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        [rowField]: value,
      },
    });
  };

  tableProps = () => {
    const {
      SumPreview: { list },
      loading,
    } = this.props;
    const { taskId, mode } = fromQs();

    const tableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/queryInfo`],
      scroll: {
        x: 1590,
      },
      showAdd: false,
      showCopy: false,
      showDelete: false,
      dataSource: list,
      bordered: true,
      rowSelection: false,
      columns: [
        {
          title: '??????',
          dataIndex: 'actNo',
          className: 'text-center',
          width: 100,
        },
        {
          title: '????????????',
          dataIndex: 'actName',
          width: 200,
        },
        {
          title: '????????????',
          dataIndex: 'planEqva',
          className: 'text-center',
          width: 100,
        },
        {
          title: '???????????????',
          dataIndex: 'distedEqva',
          className: 'text-center',
          width: 100,
        },
        {
          title: '???????????????',
          dataIndex: 'settledEqva',
          className: 'text-center',
          width: 100,
        },
        {
          title: '???????????????',
          dataIndex: 'avalSettleEqva',
          className: 'text-center',
          width: 150,
        },
        {
          title: '????????????',
          dataIndex: 'actStatusName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '????????????',
          dataIndex: 'settleStatusName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '????????????????????????',
          dataIndex: 'ssCompPercent',
          className: 'text-center',
          width: 150,
          render: value => (value !== null ? `${value}%` : undefined),
        },
        {
          title: '???????????????',
          dataIndex: 'reportCompPercent',
          className: 'text-center',
          width: 150,
          render: value => (value !== null ? `${value}%` : undefined),
        },
        taskId &&
          mode === 'edit' && {
            title: '?????????????????????',
            dataIndex: 'approveCompPercent',
            className: 'text-center',
            width: 200,
            options: {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (isNil(value)) {
                      callback();
                    } else {
                      const error = [];
                      if (!checkIfNumber(value)) error.push('?????????????????????');
                      callback(error);
                    }
                  },
                },
              ],
            },
            render: (value, row, index) => {
              if (!taskId) return value !== null ? `${value}%` : undefined;
              return (
                <Input
                  value={value}
                  addonAfter="%"
                  onChange={this.onCellChanged(index, 'approveCompPercent')}
                />
              );
            },
          },
        // {
        //   title: '??????????????????',
        //   dataIndex: 'avalSettleEqvaPercent',
        //   className: 'text-center',
        //   width: 150,
        //   render: value => (value !== null ? `${value}%` : undefined),
        // },
        {
          title: '??????????????????',
          dataIndex: 'applySettleEqva',
          width: 100,
        },
        {
          title: '??????????????????',
          dataIndex: 'approveSettleEqva',
          width: 150,
          options: {
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (isNil(value)) {
                    callback(['???????????????????????????']);
                  } else {
                    const error = [];
                    if (!checkIfNumber(value)) error.push('?????????????????????');
                    callback(error);
                  }
                },
              },
            ],
          },
          render: (value, row, index) => {
            if (!taskId || mode === 'view') return value !== null ? `${value}` : undefined;
            return (
              <Input value={value} onChange={this.onCellChanged(index, 'approveSettleEqva')} />
            );
          },
        },
        {
          title: '??????????????????',
          dataIndex: 'planStartDate',
          width: 120,
        },
        {
          title: '??????????????????',
          dataIndex: 'planEndDate',
          width: 120,
        },
      ].filter(Boolean),
      pagination: false,
    };
    return tableProps;
  };

  render() {
    const {
      SumPreview: { formData, fieldsConfig: config, flowForm, list },
      user: {
        user: { info = {}, extInfo = {} },
      },
      dispatch,
    } = this.props;
    const { visible } = this.state;
    const { id, taskId, mode, sourceUrl } = fromQs();

    const showButton =
      formData.evalStatus === 'NONE' && extInfo && extInfo.resId + '' === formData.dispatchId + '';
    const { priceVisible, salaryVisible } = formData;
    let priceAndSalaryTerm = '';
    let priceAndSalaryValue = '';
    if (priceVisible && salaryVisible) {
      priceAndSalaryTerm = '????????????/????????????';
      priceAndSalaryValue = `${formData.settlePrice}/${formData.eqvaSalary}`;
    } else if (priceVisible && !salaryVisible) {
      priceAndSalaryTerm = '????????????';
      priceAndSalaryValue = `${formData.settlePrice}`;
    } else if (!priceVisible && salaryVisible) {
      priceAndSalaryTerm = '????????????';
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
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            // ?????????????????????
            const { taskKey } = fieldsConfig;
            const { remark } = bpmForm;
            if (taskKey === TASK_FLOW_01) {
              closeThenGoto(
                `/plat/intelStl/list/sum/edit?id=${id}&taskId=${taskId}&remark=${remark}`
              );
              return Promise.resolve(false);
            }
            if (operation.key === 'EVAL') {
              this.setState({ visible: true });
              return Promise.resolve(false);
            }
            // ACC_A22_02_EMPLOYER_CONFIRM_b
            if (operation.key && operation.key === 'REJECTED') {
              return Promise.resolve(true);
            }
            return new Promise((resolve, reject) => {
              const formD = {
                settleType: 'TASK_BY_PACKAGE',
                id,
                settleDate: formData.settleDate,
                remark: formData.remark,
                procRemark: remark,
                twEqvaSettleDEntities: list,
                procTaskId: taskId,
              };
              dispatch({ type: `${DOMAIN}/checkAndSave`, payload: formD }).then(result => {
                if (result) {
                  // closeThenGoto(`/plat/intelStl/list/sum/preview?id=${id}`);
                  // ?????????????????????????????????
                  dispatch({
                    type: `${DOMAIN}/checkTaskEqva`,
                    payload: id,
                  }).then(allStled => {
                    if (allStled) {
                      // ????????????
                      // ?????? ????????????
                      createConfirm({
                        content: '??????????????????????????????????????????????????????????????????',
                        onOk: () =>
                          dispatch({
                            // ?????????????????????????????????????????????????????????????????????????????????
                            type: `${DOMAIN}/closeTaskByStlId`,
                            payload: id,
                          }).then(taskView => {
                            // ????????????????????????????????????????????????????????????
                            const { disterResId, receiverResId, id: sourceId } = taskView;
                            if (taskView) {
                              // ?????????????????????????????????????????? ????????????
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
                // checkAndSave???????????????????????????????????????????????????????????????????????????????????????????????????????????????
                return resolve(false);
              });
            });
          }}
        >
          <Card className="tw-card-rightLine">
            {/*
              * ?????????
              * 1. ????????? ????????? 'NONE|FINISH' -> 'NONE'
              * 2. ????????????????????????????????? ????????? info.id === dispatchId
              * 3. taskId??? ???????????? taskId??????????????????????????????????????????????????? taskId????????????????????????????????? showModal ?????????
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
              {formatMessage({ id: `misc.rtn`, desc: '??????' })}
            </Button>
          </Card>
          <Card className="tw-card-adjust" bordered={false}>
            <DescriptionList size="large" col={2} title="??????????????????">
              <Description term="????????????">{formData.settleNo}</Description>
              <Description term="?????????">{formData.applyResName}</Description>
              <Description term="????????????">
                {formatDT(formData.applyDate, 'YYYY-MM-DD HH:mm:ss')}
              </Description>
              <Description term="????????????">
                {taskId && mode === 'edit' ? (
                  <DatePicker
                    onChange={value => {
                      this.onFieldsChange('settleDate', value);
                    }}
                    className="x-fill-100"
                    format="YYYY-MM-DD"
                    defaultValue={moment(formData.settleDate)}
                  />
                ) : (
                  formatDT(formData.settleDate, 'YYYY-MM-DD HH:mm:ss')
                )}
              </Description>
              <Description term={'??????????????????' + (priceVisible ? '/??????' : '')}>
                {`${formData.applySettleEqva}` +
                  (priceVisible ? `/${formData.applySettleAmt}` : '')}
              </Description>
              <Description
                style={!priceVisible && !salaryVisible ? { visibility: 'hidden' } : {}}
                term={priceAndSalaryTerm}
              >
                {priceAndSalaryValue + (!priceVisible && !salaryVisible ? '??????' : '')}
              </Description>
              <Description
                style={{ clear: 'left' }}
                term={'?????????????????????' + (priceVisible ? '/??????' : '')}
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
                <Description term="????????????????????????">
                  {(taskId && mode === 'edit') ||
                  (formData.settleStatusName && formData.settleStatusName === '??????')
                    ? `${mul(formData.approveSettleEqva || 0, formData.eqvaSalary || 0).toFixed(0)}`
                    : `${mul(formData.applySettleEqva || 0, formData.eqvaSalary || 0).toFixed(0)}`}
                </Description>
              ) : (
                <Description style={{ visibility: 'hidden' }} term="??????">
                  ??????
                </Description>
              )}
              <Description term="????????????">{formData.settleStatusName}</Description>
              <Description term="????????????">{formData.apprStatusName}</Description>
              <Description term="????????????">{formData.acceptMethodName}</Description>
              <Description term="????????????">
                {formData.projName}???{formData.projNo}???
              </Description>
              <Description term="????????????">{formData.incomeResName}</Description>
              <Description term="???????????????">
                {formData.taskName}???{formData.taskNo}???
              </Description>
              <Description term="?????????">{formData.dispatchName}</Description>
              <Description term="????????????">{formData.pmName}</Description>
              <Description term="???????????????/????????????">
                {taskId && mode === 'edit'
                  ? `${formData.guaranteeRate}/${mul(
                      formData.approveSettleEqva || 0,
                      div(+formData.guaranteeRate, 100)
                    ).toFixed(2)}`
                  : `${formData.guaranteeRate}/${formData.graranteeEqva}`}
              </Description>
              <Description term="??????BU">{formData.expenseBuName}</Description>
              <Description term="????????????">{formData.remark}</Description>
            </DescriptionList>
          </Card>
          <Card className="tw-card-adjust" title="????????????" bordered={false}>
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
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A22.SUM' }]} />}
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

export default SumPreview;
