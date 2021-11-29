import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, hasIn, clone } from 'ramda';
import { Card, Form, Input, Divider, Switch, Radio } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import moment from 'moment';
import ViewDetail from './ViewDetail';
import ProjMemberReview from './table/ProjMemberReview';
import EvalPoint from './table/EvalPoint';
import ProjectAccountingDetail from '../ProjectAccountingDetail';

const { Field } = FieldList;
const RadioGroup = Radio.Group;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const DOMAIN = 'finishProjectFlow';

@connect(({ loading, finishProjectFlow, dispatch, user, userProject }) => ({
  loading,
  finishProjectFlow,
  dispatch,
  user,
  userProject,
}))
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
@mountToTab()
class FinishProjectFlow extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId, mode } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/queryProjList` });
    // 有id，修改
    id &&
      dispatch({
        type: `${DOMAIN}/projClosureApplyDetails`,
        payload: { id },
      });
    taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: taskId,
        }).then(res => {
          if (mode === 'edit' && !isNil(res) && !isEmpty(res)) {
            if (res.chkClass) {
              id &&
                dispatch({
                  type: `${DOMAIN}/checkresult`,
                  payload: { id, chkClass: res.chkClass },
                });
            }
            if (res.evalType && res.evalType === 'PM_TO_MEMBER') {
              id &&
                dispatch({
                  type: `${DOMAIN}/evalInfo`,
                  payload: { id, evalType: res.evalType },
                });
            }
            if (
              res.evalType &&
              (res.evalType === 'SALE_TO_PM' || res.evalType === 'LEADER_TO_PM')
            ) {
              id &&
                dispatch({
                  type: `${DOMAIN}/getPoint`,
                  payload: { id, evalType: res.evalType },
                });
            }
          }
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {
              buttons: [],
              chkClass: null,
              evalType: null,
              panels: {
                disabledOrHidden: {},
              },
            },
          },
        });
  }

  handleSubmit = submit => {
    const {
      form: { validateFieldsAndScroll },
      finishProjectFlow: { resultChkList },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const check = resultChkList.filter(
          i =>
            (i.finishStatus === '未处理' && i.allowContinue === false) ||
            (i.finishStatus === '未处理' && !i.remark)
        );

        if (!isEmpty(check)) {
          if (check[0].finishStatus === '未处理' && check[0].allowContinue === false) {
            createMessage({
              type: 'error',
              description: `${check[0].chkItemName}必须完成` || '当期页面存在未处理事项',
            });
            return;
          }
          if (check[0].finishStatus === '未处理' && !check[0].remark) {
            createMessage({
              type: 'error',
              description:
                `请在${check[0].chkItemName}备注处填写未完成的原因` || '当期页面存在未处理事项',
            });
            return;
          }
          return;
        }

        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            submit,
          },
        });
      }
    });
  };

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      finishProjectFlow: { resultChkList },
      dispatch,
    } = this.props;

    const newDataSource = resultChkList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { resultChkList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, validateFieldsAndScroll },
      finishProjectFlow: {
        formData,
        resDataSource,
        baseBuDataSource,
        projList,
        resultChkList,
        flowForm,
        fieldsConfig,
        getPointList,
      },
    } = this.props;
    const {
      panels: { disabledOrHidden },
      taskKey,
    } = fieldsConfig;
    const { id, taskId, prcId, from, mode } = fromQs();

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/checkresult`],
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      rowSelection: {
        getCheckboxProps: (rowKey, rows) => {
          if (rowKey.checkNethod === 'AUTO') {
            return false;
          }
          return true;
        },
      },
      enableDoubleClick: false,
      columns: [
        {
          title: '检查方式',
          align: 'center',
          dataIndex: '',
          width: '15%',
          render: (value, row, index) => {
            if (row.checkMethod === 'AUTO') {
              return '系统自动检查';
            }
            return '人工检查';
          },
        },
        {
          title: '检查事项',
          align: 'center',
          width: '15%',
          dataIndex: 'chkItemName',
        },
        {
          title: '检查说明',
          width: '30%',
          dataIndex: 'chkDesc',
        },
        {
          title: '完成状态',
          dataIndex: 'finishStatus',
          align: 'center',
          width: '15%',
          render: (val, row, index) => (
            <Switch
              checkedChildren="已完成"
              unCheckedChildren="未处理"
              checked={val === '已完成'}
              onChange={(bool, e) => {
                const parmas = bool ? '已完成' : '未处理';
                this.onCellChanged(index, parmas, 'finishStatus', row);
              }}
              disabled={row.checkMethod === 'AUTO'}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '25%',
          render: (value, row, index) => (
            <Input.TextArea
              autosize={{ minRows: 1, maxRows: 3 }}
              className="x-fill-100"
              value={row.remark || ''}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'remark', row);
              }}
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'reload',
          icon: 'sync',
          className: 'tw-btn-primary',
          title: '刷新',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const {
              finishProjectFlow: {
                fieldsConfig: { chkClass },
              },
            } = this.props;
            dispatch({
              type: `${DOMAIN}/checkresult`,
              payload: { id, chkClass },
            });
          },
        },
      ],
    };

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
            const { remark } = bpmForm;
            const { key } = operation;
            if (key === 'REJECTED') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () =>
                  pushFlowTask(taskId, {
                    remark,
                    result: key,
                  }).then(({ status, response }) => {
                    if (status === 200) {
                      createMessage({ type: 'success', description: '操作成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
                    return Promise.resolve(false);
                  }),
              });
            }
            if (key === 'CLOSE') {
              createConfirm({
                content: '确定要关闭该流程吗？',
                onOk: () =>
                  dispatch({
                    type: `${DOMAIN}/closeFlow`,
                    payload: {
                      prcId,
                      remark,
                    },
                  }),
              });
            }
            if (key === 'APPROVED' || key === 'APPLIED') {
              if (
                taskKey === 'ACC_A40_01_SUBMIT_i' ||
                taskKey === 'ACC_A40_02_BUS_EXP_CHK_b' ||
                taskKey === 'ACC_A40_03_FIN_CHK' ||
                taskKey === 'ACC_A40_04_DOC_ELEC_CHK' ||
                taskKey === 'ACC_A40_05_DOC_PAPER_CHK' ||
                taskKey === 'ACC_A40_09_PROJ_CASE' ||
                taskKey === 'ACC_A40_10_PROP'
              ) {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    // 检查待办事项是否满足提交条件
                    const check = resultChkList.filter(
                      i =>
                        (i.finishStatus === '未处理' && i.allowContinue === false) ||
                        (i.finishStatus === '未处理' && !i.remark)
                    );

                    if (!isEmpty(check)) {
                      if (check[0].finishStatus === '未处理' && check[0].allowContinue === false) {
                        createMessage({
                          type: 'error',
                          description:
                            `${check[0].chkItemName}必须完成` || '当期页面存在未处理事项',
                        });
                        return;
                      }
                      if (check[0].finishStatus === '未处理' && !check[0].remark) {
                        createMessage({
                          type: 'error',
                          description:
                            `请在${check[0].chkItemName}备注处填写未完成的原因` ||
                            '当期页面存在未处理事项',
                        });
                        return;
                      }
                      return;
                    }
                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: {
                        taskId,
                        result: key,
                        procRemark: remark,
                        submit: 'true',
                      },
                    }).then(() => {
                      if (!isNil(resultChkList) && !isEmpty(resultChkList)) {
                        dispatch({
                          type: `${DOMAIN}/checkresultUpdate`,
                          payload: resultChkList,
                        });
                      }
                    });
                  }
                });
              } else {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    const {
                      finishProjectFlow: { evalInfoList },
                    } = this.props;

                    // 校验项目经理必须对成员进行打分评价
                    if (taskKey === 'ACC_A40_06_PM_EVAL_MEMBER_b') {
                      const tt = [];
                      const newEvalInfoList = clone(evalInfoList);
                      newEvalInfoList.forEach(v => {
                        const tt1 = [];
                        v.evalDEntities.forEach(item => {
                          if (item.evalScore <= 0 && item.defaultScore <= 0) {
                            tt1.push(item);
                          }
                        });
                        if (tt1.length) {
                          // eslint-disable-next-line
                          v.evalDEntities = tt1;
                          tt.push(v);
                        }
                      });
                      if (tt.length) {
                        createMessage({
                          type: 'warn',
                          description: `请先完成对项目成员 ${tt[0].evaledResInfo} 的各项评价`,
                        });
                        return;
                      }
                    }
                    // 项目经理评审 (销售负责人)
                    if (
                      taskKey === 'ACC_A40_07_SALE_EVAL_PM_b' ||
                      taskKey === 'ACC_A40_08_LEADER_TO_PM_b'
                    ) {
                      const tt = getPointList[0].itemList.filter(
                        v => !v.evalScore && v.defaultScore <= 0
                      );
                      if (tt.length) {
                        createMessage({
                          type: 'warn',
                          description: `请先完成对项目经理 ${tt[0].evalPoint} 的评价`,
                        });
                        return;
                      }
                    }

                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: {
                        taskId,
                        result: key,
                        procRemark: remark,
                        submit: 'true',
                      },
                    }).then(res => {
                      if (taskKey === 'ACC_A40_06_PM_EVAL_MEMBER_b') {
                        dispatch({
                          type: `${DOMAIN}/evalSave`,
                          payload: evalInfoList,
                        });
                      }
                      if (
                        taskKey === 'ACC_A40_07_SALE_EVAL_PM_b' ||
                        taskKey === 'ACC_A40_08_LEADER_TO_PM_b'
                      ) {
                        const {
                          user: {
                            user: {
                              extInfo: { resId },
                            },
                          },
                        } = this.props;
                        getPointList[0].evalMasId = getPointList[0].id;
                        getPointList[0].sourceId = id;
                        getPointList[0].evalerResId = resId;
                        getPointList[0].evaledResId = formData.pmResId;
                        getPointList[0].evalDate = moment().format('YYYY-MM-DD');
                        getPointList[0].projId = formData.projId;
                        getPointList[0].evalTarget = formData.projName;
                        getPointList[0].evalStatus = 'EVALUATED';
                        getPointList[0].evalDEntities = getPointList[0].itemList;
                        getPointList[0].evalComment = formData.pmEvalComment;
                        delete getPointList[0].id;
                        delete getPointList[0].itemList;
                        dispatch({
                          type: `${DOMAIN}/evalSave`,
                          payload: getPointList,
                        });
                      }
                    });
                  }
                });
              }
            }
            return Promise.resolve(false);
          }}
        >
          {taskKey !== 'ACC_A40_09_PROJ_CLOSING_ACCOUNT' &&
            mode === 'edit' && (
              <Card
                className="tw-card-adjust"
                style={{ marginTop: '6px' }}
                title={<Title icon="profile" text="项目结项申请" />}
                bordered={false}
              >
                <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                  <Field
                    name="applyNo"
                    label="结项编号"
                    decorator={{
                      initialValue: formData.applyNo || undefined,
                    }}
                  >
                    <Input placeholder="系统自动生成" disabled />
                  </Field>
                  <Field
                    name="projId"
                    label="项目"
                    decorator={{
                      initialValue: formData.projId || undefined,
                      rules: [
                        {
                          required: isNil(fromQs().id),
                          message: '请选择项目',
                        },
                      ],
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={projList}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="请选择项目"
                      disabled={!isNil(fromQs().id)}
                    />
                  </Field>
                  <Field
                    name="projStatus"
                    label="项目状态"
                    decorator={{
                      initialValue: formData.projStatus || undefined,
                    }}
                  >
                    <Selection.UDC code="TSK:PROJ_STATUS" placeholder="系统自动生成" disabled />
                  </Field>
                  <Field
                    name="workType"
                    label="工作类型"
                    decorator={{
                      initialValue: formData.workType || undefined,
                    }}
                  >
                    <Selection.UDC code="TSK:WORK_TYPE" placeholder="系统自动生成" disabled />
                  </Field>
                  <Field
                    name="pmResId"
                    label="项目经理"
                    decorator={{
                      initialValue: formData.pmResId || undefined,
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={resDataSource}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="系统自动生成"
                      disabled
                    />
                  </Field>
                  <Field
                    name="deliBuId"
                    label="交付BU"
                    decorator={{
                      initialValue: formData.deliBuId || undefined,
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={baseBuDataSource}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="系统自动生成"
                      disabled
                    />
                  </Field>
                  <Field
                    name="deliResId"
                    label="交付负责人"
                    decorator={{
                      initialValue: formData.deliResId || undefined,
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={resDataSource}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="系统自动生成"
                      disabled
                    />
                  </Field>
                  <Field
                    name="salesmanResId"
                    label="销售负责人"
                    decorator={{
                      initialValue: formData.salesmanResId || undefined,
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={resDataSource}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="系统自动生成"
                      disabled
                    />
                  </Field>
                  {hasIn('remark', disabledOrHidden) && (
                    <Field
                      name="remark"
                      label="备注"
                      fieldCol={1}
                      labelCol={{ span: 4, xxl: 3 }}
                      wrapperCol={{ span: 19, xxl: 20 }}
                      decorator={{
                        initialValue: formData.remark || '',
                      }}
                    >
                      <Input.TextArea
                        disabled={!!disabledOrHidden.remark}
                        rows={3}
                        placeholder="请输入备注"
                      />
                    </Field>
                  )}
                  <Field
                    name="applyResId"
                    label="申请人"
                    decorator={{
                      initialValue: formData.applyResId || undefined,
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={resDataSource}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="系统自动生成"
                      disabled
                    />
                  </Field>
                  <Field
                    name="applyDate"
                    label="申请日期"
                    decorator={{
                      initialValue: formData.applyDate || undefined,
                    }}
                  >
                    <Input placeholder="系统自动生成" disabled />
                  </Field>
                  {hasIn('caseShowFlag', disabledOrHidden) && (
                    <Field
                      name="caseShowFlag"
                      label="项目宣传案例"
                      decorator={{
                        initialValue: String(formData.caseShowFlag) ? formData.jobHandOverFlag : '',
                        rules: [
                          {
                            required: !disabledOrHidden.caseShowFlag,
                            message: '请选择项目宣传案例',
                          },
                        ],
                      }}
                    >
                      <RadioGroup disabled={!!disabledOrHidden.caseShowFlag}>
                        <Radio value={0}>否</Radio>
                        <Radio value={1}>是</Radio>
                      </RadioGroup>
                    </Field>
                  )}
                </FieldList>
                {hasIn('chkClass', fieldsConfig) && (
                  <>
                    <Divider dashed />
                    <FieldList legend="结项检查事项" getFieldDecorator={getFieldDecorator} col={2}>
                      <DataTable {...tableProps} dataSource={resultChkList} />
                    </FieldList>
                  </>
                )}
                {hasIn('evalInfoList', disabledOrHidden) && (
                  <>
                    <Divider dashed />
                    <FieldList legend="项目成员评审" getFieldDecorator={getFieldDecorator} col={2}>
                      <ProjMemberReview />
                    </FieldList>
                  </>
                )}
                {hasIn('getPointList', disabledOrHidden) && (
                  <>
                    <Divider dashed />
                    <FieldList legend="项目评审明细" getFieldDecorator={getFieldDecorator} col={2}>
                      <Field
                        name="pmEvalComment"
                        label="总评"
                        fieldCol={1}
                        labelCol={{ span: 2, xxl: 2 }}
                        wrapperCol={{ span: 19, xxl: 19 }}
                        decorator={{
                          initialValue: (getPointList[0] && getPointList[0].evalComment) || '',
                        }}
                        style={{ marginTop: '20px' }}
                      >
                        <Input.TextArea rows={2} placeholder="请输入总评" />
                      </Field>
                      <Field
                        name="getPointList"
                        fieldCol={1}
                        labelCol={{ span: 2, xxl: 2 }}
                        wrapperCol={{ span: 22, xxl: 22 }}
                      >
                        <EvalPoint noReactive />
                      </Field>
                    </FieldList>
                  </>
                )}
              </Card>
            )}
          {taskKey === 'ACC_A40_09_PROJ_CLOSING_ACCOUNT' &&
            mode === 'edit' && <ProjectAccountingDetail />}
          {mode === 'view' && <ViewDetail />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default FinishProjectFlow;
