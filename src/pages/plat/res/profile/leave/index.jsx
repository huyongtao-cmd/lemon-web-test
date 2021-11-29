import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, hasIn } from 'ramda';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Radio,
  TimePicker,
  InputNumber,
  Select,
  Switch,
  Checkbox,
  Divider,
} from 'antd';
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
import { formatDT } from '@/utils/tempUtils/DateTime';
import HolidayTable from './table/HolidayTable';
import NormalModal from './modal/Normal';
import WorkVerify from './modal/WorkVerify';
import ViewDetail from './ViewDetail';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

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
    if (value || value === 0) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
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
  },
})
@mountToTab()
class LeaveApply extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nowTitle: '',
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
          const { taskKey: values } = res;
          if (taskKey === 'ACC_A31_04_HANDOVER_b') {
            this.setState({
              nowTitle: 'ui.menu.plat.res.workHandover',
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
              nowTitle: 'ui.menu.plat.res.dimission',
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

    dispatch({
      type: `${DOMAIN}/checkresultList`,
      payload: id,
    });
    if (taskKey === 'ACC_A31_04_HANDOVER_b') {
      this.setState({
        nowTitle: 'ui.menu.plat.res.workHandover',
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
        nowTitle: 'ui.menu.plat.res.dimission',
      });
    }
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
    const { nowTitle } = this.state;

    const tableProps = {
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
            <Card
              className="tw-card-adjust"
              style={{ marginTop: '6px' }}
              title={
                <Title
                  icon="profile"
                  id={nowTitle || 'ui.menu.plat.res.leaveApply'}
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
                  <DataTable {...tableProps} dataSource={resChkData} />
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
                <FieldList legend="离职事项办理-人事" getFieldDecorator={getFieldDecorator} col={2}>
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
                <FieldList legend="离职事项办理-财务" getFieldDecorator={getFieldDecorator} col={2}>
                  <DataTable {...leavelResTableProps} dataSource={finChkData} />
                </FieldList>
              )}
              {hasIn('offiChkDataView', disabledOrHidden) && <Divider />}
              {hasIn('offiChkDataView', disabledOrHidden) && (
                <FieldList legend="离职事项办理-行政" getFieldDecorator={getFieldDecorator} col={2}>
                  <DataTable {...leavelResTableProps} dataSource={offiChkData} />
                </FieldList>
              )}
            </Card>
          )}
          {mode === 'view' && <ViewDetail />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default LeaveApply;
