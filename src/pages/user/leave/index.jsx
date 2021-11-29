import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, hasIn } from 'ramda';
import { Card, Form, Input, Switch, Checkbox, Divider, Modal, Button } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import moment from 'moment';
import HolidayTable from './table/HolidayTable';
import NormalModal from './modal/Normal';
import WorkVerify from './modal/WorkVerify';
import ViewDetail from './ViewDetail';
import leaveDesc from './image/leaveDesc.png';

const { Field } = FieldList;

const DOMAIN = 'leave';

@connect(({ loading, leave, dispatch }) => ({
  loading,
  leave,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];

    if (name === 'vacationFlag') {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value ? '已安排' : '未安排' },
      });
      return;
    }

    if (name === 'jobHandOverFlag' && value === 0) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { jobHandOver: '' },
      });
    }
    if (name === 'emailSet' && value === 'CLOSE') {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { emailReceiver: '' },
      });
    }

    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@mountToTab()
class LeaveApply extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nowTitle: '',
      visible: false,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      leave: {
        fieldsConfig: { taskKey },
      },
    } = this.props;
    const { id, taskId } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
      payload: id,
    }).then(item => {
      id &&
        dispatch({
          type: `${DOMAIN}/query`,
          payload: id,
        }).then(res => {
          const { applyDate, resId } = res;
          dispatch({ type: `${DOMAIN}/myVacationList`, payload: { resId, applyDate } });
        });
      taskId
        ? dispatch({
            type: `${DOMAIN}/fetchConfig`,
            payload: taskId,
          }).then(res => {
            const { taskKey: taskKeys } = res;
            if (taskKeys === 'ACC_A31_05_DIMISSION_b') {
              this.setState({
                visible: true,
              });
            }
            if (taskKey === 'ACC_A31_04_HANDOVER_b') {
              this.setState({
                nowTitle: 'ui.menu.hr.res.workHandover',
              });
            }
            if (
              taskKey === 'ACC_A31_05_DIMISSION_b' ||
              taskKey === 'ACC_A31_06_FINANCE' ||
              taskKey === 'ACC_A31_07_ADMINISTRATIVE_b' ||
              taskKey === 'ACC_A31_08_PERSONNEL' ||
              taskKey === 'ACC_A31_09_CHECKIN'
            ) {
              this.setState({
                nowTitle: 'ui.menu.hr.res.dimission',
              });
            }

            // 第八节点检查事项特殊拉取
            if (taskKeys !== 'ACC_A31_08_PERSONNEL') {
              dispatch({
                type: `${DOMAIN}/checkresultList`,
                payload: id,
              });
            }
          })
        : dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              fieldsConfig: {
                buttons: [],
                panels: {
                  disabledOrHidden: {},
                },
              },
            },
          });
      dispatch({ type: `${DOMAIN}/res` });
      dispatch({ type: `${DOMAIN}/bu` });

      if (taskKey === 'ACC_A31_04_HANDOVER_b') {
        this.setState({
          nowTitle: 'ui.menu.hr.res.workHandover',
        });
      }
      if (
        taskKey === 'ACC_A31_05_DIMISSION_b' ||
        taskKey === 'ACC_A31_06_FINANCE' ||
        taskKey === 'ACC_A31_07_ADMINISTRATIVE_b' ||
        taskKey === 'ACC_A31_08_PERSONNEL' ||
        taskKey === 'ACC_A31_09_CHECKIN'
      ) {
        this.setState({
          nowTitle: 'ui.menu.hr.res.dimission',
        });
      }
    });
  }

  // 行编辑触发事件
  onCellChanged = (index, value, name, row) => {
    const {
      leave: { dataSource },
      dispatch,
    } = this.props;
    let newIndex;
    dataSource.filter((item, num) => {
      if (item.id === row.id) {
        newIndex = num;
      }
      return null;
    });

    const newDataSource = dataSource;
    newDataSource[newIndex] = {
      ...newDataSource[newIndex],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataSource: newDataSource,
        resChkData: dataSource.filter(v => v.chkCalss === 'LEAVE_RES_CHK'),
        finChkData: dataSource.filter(v => v.chkCalss === 'LEAVE_FIN_CHK'),
        offiChkData: dataSource.filter(v => v.chkCalss === 'LEAVE_OFFI_CHK'),
        hrChkData: dataSource.filter(v => v.chkCalss === 'LEAVE_HR_CHK'),
        ITChekData: dataSource.filter(v => v.chkCalss === 'LEAVE_IT_CHK'),
      },
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  render() {
    const {
      loading,
      dispatch,
      form,
      leave: {
        formData,
        flowForm,
        fieldsConfig,
        dataSource,
        resChkData,
        finChkData,
        offiChkData,
        hrChkData,
        ITChekData,
        myVacationList,
      },
    } = this.props;
    const {
      getFieldDecorator,
      setFieldsValue,
      setFields,
      getFieldValue,
      validateFieldsAndScroll,
    } = form;
    const {
      panels: { disabledOrHidden },
      taskKey,
    } = fieldsConfig;
    const { id, taskId, prcId, from, mode } = fromQs();
    const { nowTitle, visible } = this.state;

    const submitBtn =
      loading.effects[`${DOMAIN}/hrcheckList`] ||
      loading.effects[`${DOMAIN}/query`] ||
      loading.effects[`${DOMAIN}/submit`];

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading:
        taskKey === 'ACC_A31_08_PERSONNEL'
          ? loading.effects[`${DOMAIN}/hrcheckList`]
          : loading.effects[`${DOMAIN}/checkresultList`],
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
          width: '10%',
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
          render: val => <pre>{val}</pre>,
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
          width: '30%',
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
            if (taskKey !== 'ACC_A31_08_PERSONNEL') {
              dispatch({
                type: `${DOMAIN}/checkresultList`,
                payload: id,
              });
            } else {
              // 第八节点(离职事项办理-人事)检查事项
              // eslint-disable-next-line no-lonely-if
              if (formData.contractEndDate) {
                dispatch({
                  type: `${DOMAIN}/hrcheckList`,
                  payload: {
                    id: fromQs().id,
                    contractEndDate: moment(formData.contractEndDate).format('YYYY-MM-DD'),
                  },
                });
              } else {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    hrChkData: [],
                  },
                });
              }
            }
          },
        },
      ],
    };

    const resTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/checkresultList`],
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
          width: '10%',
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
          render: val => <pre>{val}</pre>,
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
          width: '30%',
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
            dispatch({
              type: `${DOMAIN}/checkresultList`,
              payload: id,
            });
          },
        },
      ],
      rightButtons: [
        {
          key: 'alert',
          icon: 'alert',
          className: 'tw-btn-error',
          title: '离职办理事项说明',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({
              visible: true,
            });
          },
        },
      ],
    };

    const leavelResTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: false,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '检查事项',
          dataIndex: 'chkItemName',
        },
        {
          title: '检查说明',
          dataIndex: 'chkDesc',
          render: val => <pre>{val}</pre>,
        },
        {
          title: '完成状态',
          dataIndex: 'finishStatus',
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          render: (value, row, index) => <pre>{value}</pre>,
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
          buttonLoading={submitBtn}
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
              const { jobHandOverFlag, jobHandOver, emailSet, emailReceiver } = formData;
              if (jobHandOverFlag && !jobHandOver) {
                setFields({
                  jobHandOver: {
                    value: undefined,
                    errors: [new Error('请选择工作交接人')],
                  },
                });
              }
              if (emailSet === 'RECEIVER' && !emailReceiver) {
                setFields({
                  emailReceiver: {
                    value: undefined,
                    errors: [new Error('请选择邮件代收人')],
                  },
                });
              }
              if (
                taskKey === 'ACC_A31_05_DIMISSION_b' ||
                taskKey === 'ACC_A31_06_FINANCE' ||
                taskKey === 'ACC_A31_07_ADMINISTRATIVE_b' ||
                taskKey === 'ACC_A31_08_PERSONNEL' ||
                taskKey === 'ACC_A31_09_CHECKIN'
              ) {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    // 检查待办事项是否满足提交条件
                    let dataArr = [];
                    switch (taskKey) {
                      case 'ACC_A31_05_DIMISSION_b':
                        dataArr = resChkData;
                        break;
                      case 'ACC_A31_06_FINANCE':
                        dataArr = finChkData;
                        break;
                      case 'ACC_A31_07_ADMINISTRATIVE_b':
                        dataArr = offiChkData;
                        break;
                      case 'ACC_A31_08_PERSONNEL':
                        dataArr = hrChkData;
                        break;
                      case 'ACC_A31_09_CHECKIN':
                        dataArr = ITChekData;
                        break;
                      default:
                        break;
                    }

                    const check = dataArr.filter(
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
                      dispatch({
                        type: `${DOMAIN}/checkresultUpdate`,
                        payload: dataArr,
                      });
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
                    });
                  }
                });
              }
            }
            return Promise.resolve(false);
          }}
        >
          {mode === 'edit' && (
            <>
              <Modal
                centered
                title="离职办理事项说明"
                visible={visible}
                confirmLoading={false}
                onOk={() => this.toggleVisible()}
                onCancel={() => this.toggleVisible()}
                width={800}
                footer={[
                  <Button
                    className="tw-btn-primary"
                    style={{ backgroundColor: '#284488' }}
                    key="makeSure"
                    onClick={() => this.toggleVisible()}
                  >
                    确定
                  </Button>,
                ]}
              >
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: 'bolder',
                    marginBottom: '10px',
                  }}
                >
                  离职办理事项说明
                </div>
                <ul style={{ textIndent: '-1.5em' }}>
                  <li style={{ marginBottom: '10px' }}>
                    1、
                    员工提交离职流程后，请本人务必及时跟进每一个环节审批人处理流程，离职流程必须在最后结薪日当天全部审批完成
                    <span style={{ color: 'red', display: 'block' }}>审批流：</span>
                    <img width="100%" src={leaveDesc} alt="离职办理事项说明" />
                  </li>
                  <li>
                    2、工时必须填写到最后结薪日，包含所有年假和调休时间，同时员工本人填写完后需要审批人审批完成，
                  </li>
                  <li>
                    3、
                    <span style={{ color: 'red' }}>
                      所有审批中的流程，请员工本人务必及时与审批人沟通，尽快审批，包括工时审批、当量结算申请、费用报销、待办事宜等
                    </span>
                  </li>
                  <li>4、有系统操作问题请在系统上提交问题反馈，会有专人解答处理</li>
                </ul>
              </Modal>

              <Card
                className="tw-card-adjust"
                style={{ marginTop: '6px' }}
                title={
                  <Title
                    icon="profile"
                    id={nowTitle || 'ui.menu.hr.res.leaveApply'}
                    defaultMessage="离职申请"
                  />
                }
                bordered={false}
              >
                {taskKey === 'ACC_A31_04_HANDOVER_b' ? (
                  <WorkVerify form={form} />
                ) : (
                  <NormalModal form={form} />
                )}
                {hasIn('myVacationList', disabledOrHidden) && <Divider />}
                {hasIn('myVacationList', disabledOrHidden) && (
                  <FieldList legend="剩余假期" getFieldDecorator={getFieldDecorator} col={2}>
                    {hasIn('vacationFlag', disabledOrHidden) && (
                      <Field
                        name="vacationFlag"
                        decorator={{
                          initialValue: formData.vacationFlag || '',
                          rules: [
                            {
                              required: true,
                              message: '请勾选已安排休完剩余假期',
                            },
                          ],
                        }}
                      >
                        <Checkbox
                          disabled={!!disabledOrHidden.vacationFlag}
                          style={{ marginLeft: '30px' }}
                          checked={formData.vacationFlag === '已安排'}
                        >
                          已安排休完剩余假期
                        </Checkbox>
                      </Field>
                    )}
                    <HolidayTable />
                  </FieldList>
                )}
                {hasIn('resChkData', disabledOrHidden) && <Divider />}
                {hasIn('resChkData', disabledOrHidden) && (
                  <FieldList legend="离职事项办理" getFieldDecorator={getFieldDecorator} col={2}>
                    <DataTable {...resTableProps} dataSource={resChkData} />
                  </FieldList>
                )}
                {hasIn('finChkData', disabledOrHidden) && <Divider />}
                {hasIn('finChkData', disabledOrHidden) && (
                  <FieldList legend="离职事项办理" getFieldDecorator={getFieldDecorator} col={2}>
                    <DataTable {...tableProps} dataSource={finChkData} />
                  </FieldList>
                )}
                {hasIn('offiChkData', disabledOrHidden) && <Divider />}
                {hasIn('offiChkData', disabledOrHidden) && (
                  <FieldList legend="离职事项办理" getFieldDecorator={getFieldDecorator} col={2}>
                    <DataTable {...tableProps} dataSource={offiChkData} />
                  </FieldList>
                )}
                {hasIn('hrChkData', disabledOrHidden) && <Divider />}
                {hasIn('hrChkData', disabledOrHidden) && (
                  <FieldList
                    legend="离职事项办理-人事"
                    getFieldDecorator={getFieldDecorator}
                    col={2}
                  >
                    <DataTable {...tableProps} dataSource={hrChkData} />
                  </FieldList>
                )}
                {hasIn('ITChekData', disabledOrHidden) && <Divider />}
                {hasIn('ITChekData', disabledOrHidden) && (
                  <FieldList legend="离职事项办理" getFieldDecorator={getFieldDecorator} col={2}>
                    <DataTable {...tableProps} dataSource={ITChekData} />
                  </FieldList>
                )}
                {hasIn('finChkDataView', disabledOrHidden) && <Divider />}
                {hasIn('finChkDataView', disabledOrHidden) && (
                  <FieldList
                    legend="离职事项办理-财务"
                    getFieldDecorator={getFieldDecorator}
                    col={2}
                  >
                    <DataTable {...leavelResTableProps} dataSource={finChkData} />
                  </FieldList>
                )}
                {hasIn('offiChkDataView', disabledOrHidden) && <Divider />}
                {hasIn('offiChkDataView', disabledOrHidden) && (
                  <FieldList
                    legend="离职事项办理-行政"
                    getFieldDecorator={getFieldDecorator}
                    col={2}
                  >
                    <DataTable {...leavelResTableProps} dataSource={offiChkData} />
                  </FieldList>
                )}
              </Card>
            </>
          )}
          {mode === 'view' && <ViewDetail />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default LeaveApply;
