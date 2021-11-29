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
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import PResEvalPoint from './table/PResEvalPoint';
import BuPicEvalPoint from './table/BuPicEvalPoint';
import ResCapacity from './table/ResCapacity';
import ViewDetail from './ViewDetail';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'probationLast';

@connect(({ loading, probationLast, dispatch }) => ({
  loading,
  probationLast,
  dispatch,
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
class probationLast extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId, mode } = fromQs();

    dispatch({ type: `${DOMAIN}/clean` }).then(() => {
      dispatch({ type: `${DOMAIN}/res` });
      dispatch({ type: `${DOMAIN}/bu` });
      dispatch({ type: `${DOMAIN}/queryProjList` });

      // 有id，修改
      id &&
        dispatch({
          type: `${DOMAIN}/flowDetail`,
          payload: { id },
        });

      taskId
        ? dispatch({
            type: `${DOMAIN}/fetchConfig`,
            payload: taskId,
          }).then(res => {
            if (mode === 'edit' && !isNil(res) && !isEmpty(res)) {
              if ((res.evalType && res.evalType === 'P_RES') || res.evalType === 'BU_PIC') {
                id &&
                  dispatch({
                    type: `${DOMAIN}/getPoint`,
                    payload: {
                      id,
                      evalClass: 'PROBATION_PERIOD',
                    },
                  });
              }
              if (res.taskKey === 'ACC_A43_01_SUBMIT_i') {
                dispatch({
                  type: `${DOMAIN}/checkresult`,
                  payload: {
                    id,
                    chkClass: 'PROBATION_FINAL_CHK',
                  },
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
                evalClass: null,
                panels: {
                  disabledOrHidden: {},
                },
              },
            },
          });
    });
  }

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      probationLast: { resultChkList },
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
      form: { getFieldDecorator, validateFieldsAndScroll, setFieldsValue },
      probationLast: {
        formData,
        resData,
        baseBuData,
        resultChkList,
        flowForm,
        fieldsConfig,
        pResPointList,
        pResPointItemList,
        buPicPointList,
      },
    } = this.props;

    const {
      panels: { disabledOrHidden },
      taskKey,
    } = fieldsConfig;
    const { id, taskId, prcId, from, mode } = fromQs();

    // console.warn('probationLast');
    // console.warn(formData);

    const tableProps = {
      sortBy: 'id',
      rowKey: 'chkItemId',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/getResults`],
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
              probationLast: {
                formData: { resId },
              },
            } = this.props;
            dispatch({
              type: `${DOMAIN}/getResults`,
              payload: { resId, chkClasses: 'PROBATION_FINAL_CHK' },
            });
          },
        },
      ],
    };

    const pResEvalListViewTableProps = {
      sortBy: 'id',
      rowKey: 'iden',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/getPoint`],
      dataSource: pResPointItemList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '评价点',
          dataIndex: 'evalItemName',
          align: 'center',
          width: '30%',
        },
        {
          title: '评分',
          dataIndex: 'evalScore',
          align: 'center',
          width: '35%',
        },
        {
          title: '简评',
          dataIndex: 'evalComment',
          width: '35%',
          render: value => <pre>{value}</pre>,
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
            // console.warn('onBtnClick');
            // console.warn(formData);
            // debugger;
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
              if (taskKey === 'ACC_A43_01_SUBMIT_i') {
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
                    }).then(res => {
                      if (res.ok) {
                        const tt = resultChkList.filter(v => isNil(v.idenId));
                        const {
                          datum: { id: idenId },
                        } = res;
                        if (tt.length) {
                          // eslint-disable-next-line
                          resultChkList.map(v => (v.idenId = idenId));
                        }
                        dispatch({
                          type: `${DOMAIN}/checkresultUpdate`,
                          payload: resultChkList,
                        }).then(response => {
                          if (response.ok) {
                            createMessage({ type: 'success', description: '操作成功' });
                            const url = getUrl().replace('edit', 'view');
                            closeThenGoto(url);
                          }
                        });
                      }
                    });
                  }
                });
              } else if (
                taskKey === 'ACC_A43_03_SUPER_APPR_b' ||
                taskKey === 'ACC_A43_04_BU_APPR_b'
              ) {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: {
                        taskId,
                        result: key,
                        procRemark: remark,
                        submit: 'true',
                      },
                    }).then(res => {
                      if (res.ok) {
                        if (taskKey === 'ACC_A43_03_SUPER_APPR_b') {
                          pResPointList[0].evalMasId = pResPointList[0].id;
                          pResPointList[0].sourceId = id;
                          pResPointList[0].evaledResId = formData.resId;
                          pResPointList[0].evalClass = pResPointList[0].evalClass;
                          pResPointList[0].evalTarget = formData.docName;
                          pResPointList[0].evalStatus = 'EVALUATED';
                          pResPointList[0].evalComment = formData.pmEvalComment;
                          pResPointList[0].evalDEntities = pResPointList[0].itemList;
                          delete pResPointList[0].id;
                          delete pResPointList[0].itemList;
                          dispatch({
                            type: `${DOMAIN}/evalSave`,
                            payload: pResPointList,
                          }).then(response => {
                            if (response.ok) {
                              createMessage({ type: 'success', description: '操作成功' });
                              const url = getUrl().replace('edit', 'view');
                              closeThenGoto(url);
                            }
                          });
                        } else if (taskKey === 'ACC_A43_04_BU_APPR_b') {
                          buPicPointList[0].evalMasId = buPicPointList[0].id;
                          buPicPointList[0].sourceId = id;
                          buPicPointList[0].evaledResId = formData.resId;
                          buPicPointList[0].evalClass = buPicPointList[0].evalClass;
                          buPicPointList[0].evalTarget = formData.docName;
                          buPicPointList[0].evalStatus = 'EVALUATED';
                          buPicPointList[0].evalComment = formData.pmEvalCommentBu;
                          buPicPointList[0].evalDEntities = buPicPointList[0].itemList;
                          delete buPicPointList[0].id;
                          delete buPicPointList[0].itemList;
                          dispatch({
                            type: `${DOMAIN}/evalSave`,
                            payload: buPicPointList,
                          }).then(response => {
                            if (response.ok) {
                              createMessage({ type: 'success', description: '操作成功' });
                              const url = getUrl().replace('edit', 'view');
                              closeThenGoto(url);
                            }
                          });
                        }
                      }
                    });
                  }
                });
              } else {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: {
                        taskId,
                        result: key,
                        procRemark: remark,
                        submit: 'true',
                      },
                    }).then(response => {
                      if (response.ok) {
                        createMessage({ type: 'success', description: '操作成功' });
                        const url = getUrl().replace('edit', 'view');
                        closeThenGoto(url);
                      }
                    });
                  }
                });
              }
            }
            return Promise.resolve(false);
          }}
        >
          {mode === 'edit' && (
            <Card
              className="tw-card-adjust"
              style={{ marginTop: '6px' }}
              title={<Title icon="profile" text="试用期考核(末期)" />}
              bordered={false}
            >
              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                {hasIn('resId', disabledOrHidden) && (
                  <Field
                    name="resId"
                    label="资源"
                    decorator={{
                      initialValue: formData.resId || undefined,
                      rules: [
                        {
                          required: !disabledOrHidden.resId,
                          message: '请选择资源',
                        },
                      ],
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={resData}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      disabled={!!disabledOrHidden.resId}
                      onColumnsChange={value => {
                        if (value && value.id) {
                          dispatch({
                            type: `${DOMAIN}/queryResDetail`,
                            payload: value.id,
                          }).then(res => {
                            dispatch({
                              type: `${DOMAIN}/getResults`,
                              payload: {
                                resId: value.id,
                                chkClasses: 'PROBATION_FINAL_CHK',
                              },
                            });
                          });
                        }
                      }}
                      placeholder="请选择考核资源"
                    />
                  </Field>
                )}
                {hasIn('baseBuId', disabledOrHidden) && (
                  <Field
                    name="baseBuId"
                    label="BaseBU"
                    decorator={{
                      initialValue: formData.baseBuId || undefined,
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={baseBuData}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="系统自动生成"
                      disabled
                    />
                  </Field>
                )}
                {hasIn('presId', disabledOrHidden) && (
                  <Field
                    name="presId"
                    label="直属领导"
                    decorator={{
                      initialValue: formData.presId || undefined,
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={resData}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="系统自动生成"
                      disabled
                    />
                  </Field>
                )}
                {hasIn('probationPeriod', disabledOrHidden) && (
                  <Field
                    name="probationPeriod"
                    label="试用期"
                    decorator={{
                      initialValue: formData.probationPeriod || '',
                    }}
                  >
                    <Input placeholder="系统自动生成" disabled />
                  </Field>
                )}
                {hasIn('mobile', disabledOrHidden) && (
                  <Field
                    name="mobile"
                    label="手机号码"
                    decorator={{
                      initialValue: formData.mobile || '',
                    }}
                  >
                    <Input placeholder="系统自动生成" disabled />
                  </Field>
                )}
                {hasIn('emailAddr', disabledOrHidden) && (
                  <Field
                    name="emailAddr"
                    label="平台邮箱"
                    decorator={{
                      initialValue: formData.emailAddr || '',
                    }}
                  >
                    <Input placeholder="系统自动生成" disabled />
                  </Field>
                )}
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
                {hasIn('applyResName', disabledOrHidden) && (
                  <Field
                    name="applyResName"
                    label="申请人"
                    decorator={{
                      initialValue: formData.applyResName || '',
                    }}
                  >
                    <Input disabled />
                  </Field>
                )}
                {hasIn('applyDate', disabledOrHidden) && (
                  <Field
                    name="applyDate"
                    label="申请日期"
                    decorator={{
                      initialValue: formData.applyDate || '',
                    }}
                  >
                    <Input disabled />
                  </Field>
                )}
                {hasIn('selfEval1', disabledOrHidden) && (
                  <Field
                    name="selfEval1"
                    label="成长收获"
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    decorator={{
                      initialValue: formData.selfEval1 || '',
                      rules: [
                        {
                          required: true,
                          message: '请输入成长收获或近期工作点评',
                        },
                      ],
                    }}
                  >
                    <Input.TextArea
                      disabled={!!disabledOrHidden.selfEval1}
                      rows={3}
                      placeholder="成长收获或近期工作点评"
                    />
                  </Field>
                )}
                {hasIn('selfEval2', disabledOrHidden) && (
                  <Field
                    name="selfEval2"
                    label="近期工作成果"
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    decorator={{
                      initialValue: formData.selfEval2 || '',
                      rules: [
                        {
                          required: true,
                          message: '请输入近期工作成果',
                        },
                      ],
                    }}
                  >
                    <Input.TextArea
                      disabled={!!disabledOrHidden.selfEval2}
                      rows={3}
                      placeholder="近期工作成果"
                    />
                  </Field>
                )}
                {hasIn('selfEval3', disabledOrHidden) && (
                  <Field
                    name="selfEval3"
                    label="自我定位"
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    decorator={{
                      initialValue: formData.selfEval3 || '',
                      rules: [
                        {
                          required: true,
                          message: '请输入自我定位或发展方向',
                        },
                      ],
                    }}
                  >
                    <Input.TextArea
                      disabled={!!disabledOrHidden.selfEval3}
                      rows={3}
                      placeholder="自我定位或发展方向"
                    />
                  </Field>
                )}
                {hasIn('selfEval4', disabledOrHidden) && (
                  <Field
                    name="selfEval4"
                    label="需改进的方面"
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    decorator={{
                      initialValue: formData.selfEval4 || '',
                      rules: [
                        {
                          required: true,
                          message: '请输入需改进的方面',
                        },
                      ],
                    }}
                  >
                    <Input.TextArea
                      disabled={!!disabledOrHidden.selfEval4}
                      rows={3}
                      placeholder="自认为需要改进的3个方面"
                    />
                  </Field>
                )}
                {hasIn('selfEval5', disabledOrHidden) && (
                  <Field
                    name="selfEval5"
                    label="建议"
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    decorator={{
                      initialValue: formData.selfEval5 || '',
                    }}
                  >
                    <Input.TextArea
                      disabled={!!disabledOrHidden.selfEval5}
                      rows={3}
                      placeholder="对公司、部门等的建议"
                    />
                  </Field>
                )}
              </FieldList>
              {hasIn('resultChkList', disabledOrHidden) && (
                <>
                  <Divider dashed />
                  <FieldList
                    legend="入职培训完成情况"
                    getFieldDecorator={getFieldDecorator}
                    col={2}
                  >
                    <DataTable {...tableProps} dataSource={resultChkList} />
                  </FieldList>
                </>
              )}
              {hasIn('selfEvalList', disabledOrHidden) && (
                <>
                  <Divider dashed />
                  <FieldList legend="自评" getFieldDecorator={getFieldDecorator} col={2}>
                    <Field
                      name="selfEval1"
                      label="成长收获"
                      fieldCol={1}
                      labelCol={{ span: 4, xxl: 3 }}
                      wrapperCol={{ span: 19, xxl: 20 }}
                      decorator={{
                        initialValue: formData.selfEval1 || '',
                        rules: [
                          {
                            required: !disabledOrHidden.selfEvalList && true,
                            message: '请输入成长收获或近期工作点评',
                          },
                        ],
                      }}
                    >
                      <Input.TextArea
                        disabled={!!disabledOrHidden.selfEvalList}
                        rows={3}
                        placeholder="成长收获或近期工作点评"
                      />
                    </Field>
                    <Field
                      name="selfEval2"
                      label="近期工作成果"
                      fieldCol={1}
                      labelCol={{ span: 4, xxl: 3 }}
                      wrapperCol={{ span: 19, xxl: 20 }}
                      decorator={{
                        initialValue: formData.selfEval2 || '',
                        rules: [
                          {
                            required: !disabledOrHidden.selfEvalList && true,
                            message: '请输入近期工作成果',
                          },
                        ],
                      }}
                    >
                      <Input.TextArea
                        disabled={!!disabledOrHidden.selfEvalList}
                        rows={3}
                        placeholder="近期工作成果"
                      />
                    </Field>
                    <Field
                      name="selfEval3"
                      label="自我定位"
                      fieldCol={1}
                      labelCol={{ span: 4, xxl: 3 }}
                      wrapperCol={{ span: 19, xxl: 20 }}
                      decorator={{
                        initialValue: formData.selfEval3 || '',
                        rules: [
                          {
                            required: !disabledOrHidden.selfEvalList && true,
                            message: '请输入自我定位或发展方向',
                          },
                        ],
                      }}
                    >
                      <Input.TextArea
                        disabled={!!disabledOrHidden.selfEvalList}
                        rows={3}
                        placeholder="自我定位或发展方向"
                      />
                    </Field>
                    <Field
                      name="selfEval4"
                      label="需改进的方面"
                      fieldCol={1}
                      labelCol={{ span: 4, xxl: 3 }}
                      wrapperCol={{ span: 19, xxl: 20 }}
                      decorator={{
                        initialValue: formData.selfEval4 || '',
                        rules: [
                          {
                            required: !disabledOrHidden.selfEvalList && true,
                            message: '请输入需改进的方面',
                          },
                        ],
                      }}
                    >
                      <Input.TextArea
                        disabled={!!disabledOrHidden.selfEvalList}
                        rows={3}
                        placeholder="自认为需要改进的3个方面"
                      />
                    </Field>
                    <Field
                      name="selfEval5"
                      label="建议"
                      fieldCol={1}
                      labelCol={{ span: 4, xxl: 3 }}
                      wrapperCol={{ span: 19, xxl: 20 }}
                      decorator={{
                        initialValue: formData.selfEval5 || '',
                      }}
                    >
                      <Input.TextArea
                        disabled={!!disabledOrHidden.selfEvalList}
                        rows={3}
                        placeholder="对公司、部门等的建议"
                      />
                    </Field>
                  </FieldList>
                </>
              )}
              {hasIn('pResEvalList', disabledOrHidden) && (
                <>
                  <Divider dashed />
                  <FieldList legend="直属领导评审" getFieldDecorator={getFieldDecorator} col={2}>
                    <Field
                      name="pmEvalComment"
                      label="总评"
                      fieldCol={1}
                      labelCol={{ span: 2, xxl: 2 }}
                      wrapperCol={{ span: 19, xxl: 19 }}
                      decorator={{
                        initialValue: (pResPointList[0] && pResPointList[0].evalComment) || '',
                        rules: [
                          {
                            required: true,
                            message: '请输入总评',
                          },
                        ],
                      }}
                      style={{ marginTop: '20px' }}
                    >
                      <Input.TextArea
                        disabled={!!disabledOrHidden.pResEvalList}
                        rows={2}
                        placeholder="请输入总评"
                      />
                    </Field>
                    <Field
                      name="pResEvalList"
                      fieldCol={1}
                      labelCol={{ span: 2, xxl: 2 }}
                      wrapperCol={{ span: 22, xxl: 22 }}
                    >
                      <PResEvalPoint noReactive />
                    </Field>
                  </FieldList>
                </>
              )}
              {hasIn('pResEvalListView', disabledOrHidden) && (
                <>
                  <Divider dashed />
                  <FieldList legend="直属领导评审" getFieldDecorator={getFieldDecorator} col={2}>
                    <Field
                      name="pmEvalComment"
                      label="总评"
                      fieldCol={1}
                      labelCol={{ span: 2, xxl: 2 }}
                      wrapperCol={{ span: 19, xxl: 19 }}
                      decorator={{
                        initialValue: !isEmpty(formData) ? formData.presEval.evalComment : '',
                        rules: [
                          {
                            required: false,
                            message: '请输入总评',
                          },
                        ],
                      }}
                      style={{ marginTop: '20px' }}
                    >
                      <Input.TextArea
                        disabled={!!disabledOrHidden.pResEvalListView}
                        rows={2}
                        placeholder="请输入总评"
                      />
                    </Field>
                    <Field
                      name="pResEvalListView"
                      fieldCol={1}
                      labelCol={{ span: 2, xxl: 2 }}
                      wrapperCol={{ span: 22, xxl: 22 }}
                    >
                      <DataTable
                        {...pResEvalListViewTableProps}
                        dataSource={
                          !isEmpty(formData) &&
                          !isNil(formData.presEval) &&
                          Array.isArray(formData.presEval.itemList)
                            ? formData.presEval.itemList
                            : []
                        }
                      />
                    </Field>
                  </FieldList>
                </>
              )}
              {hasIn('buPicEvalList', disabledOrHidden) && (
                <>
                  <Divider dashed />
                  <FieldList legend="BU负责人评审" getFieldDecorator={getFieldDecorator} col={2}>
                    <Field
                      name="pmEvalCommentBu"
                      label="总评"
                      fieldCol={1}
                      labelCol={{ span: 2, xxl: 2 }}
                      wrapperCol={{ span: 19, xxl: 19 }}
                      decorator={{
                        initialValue: (pResPointList[0] && pResPointList[0].evalComment) || '',
                        rules: [
                          {
                            required: true,
                            message: '请输入总评',
                          },
                        ],
                      }}
                      style={{ marginTop: '20px' }}
                    >
                      <Input.TextArea rows={2} placeholder="请输入总评" />
                    </Field>
                    <Field
                      name="pResPointList"
                      fieldCol={1}
                      labelCol={{ span: 2, xxl: 2 }}
                      wrapperCol={{ span: 22, xxl: 22 }}
                    >
                      <BuPicEvalPoint noReactive />
                    </Field>
                  </FieldList>
                </>
              )}
              {hasIn('buPicCheckResult', disabledOrHidden) && (
                <FieldList getFieldDecorator={getFieldDecorator} col={2}>
                  <Field
                    name="buPicCheckResult"
                    label="评审结果"
                    decorator={{
                      initialValue: formData.buPicCheckResult || undefined,
                      rules: [
                        {
                          required: !disabledOrHidden.buPicCheckResult,
                          message: '请选择评审结果',
                        },
                      ],
                    }}
                  >
                    <Selection.UDC
                      code="RES:CHECK_RESULT"
                      filters={[{ sphd2: 'FINAL' }]}
                      placeholder="请选择评审结果"
                      onChange={value => {
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: { buPicRegularDate: null },
                        });
                        setFieldsValue({
                          buPicRegularDate: null,
                        });

                        // 按期转正自动带入后端返回的转正日期
                        if (value === '3') {
                          const { regularDate } = formData;
                          dispatch({
                            type: `${DOMAIN}/updateForm`,
                            payload: { buPicRegularDate: regularDate },
                          });
                          setFieldsValue({
                            buPicRegularDate: regularDate,
                          });
                        }
                      }}
                      disabled={!!disabledOrHidden.buPicCheckResult}
                    />
                  </Field>
                  <Field
                    name="buPicRegularDate"
                    label="转正日期"
                    decorator={{
                      initialValue: formData.buPicRegularDate || '',
                      rules: [
                        {
                          required:
                            formData.buPicCheckResult === '2' && !disabledOrHidden.buPicRegularDate,
                          message: '请选择转正日期',
                        },
                      ],
                    }}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      disabled={
                        formData.buPicCheckResult !== '2' || !!disabledOrHidden.buPicRegularDate
                      }
                    />
                  </Field>
                  {hasIn('regularReward', disabledOrHidden) && (
                    <Field
                      name="regularReward"
                      label="转正奖励(推荐人)"
                      decorator={{
                        initialValue: formData.regularReward || '',
                        rules: [
                          {
                            required: true,
                            message: '请输入转正奖励',
                          },
                        ],
                      }}
                    >
                      <Input placeholder="请输入转正奖励" />
                    </Field>
                  )}
                </FieldList>
              )}

              {hasIn('capacity', disabledOrHidden) && (
                <>
                  <Divider dashed />
                  <ResCapacity />
                </>
              )}
            </Card>
          )}
          {mode === 'view' && <ViewDetail />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default probationLast;
