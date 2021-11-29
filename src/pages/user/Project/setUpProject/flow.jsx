import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Form, Input, Radio, Divider, InputNumber, Modal } from 'antd';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { pushFlowTask } from '@/services/gen/flow';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker, FileManagerEnhance, UdcSelect } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectProjectTmpl, selectProject } from '@/services/user/project/project';
import { selectUsers } from '@/services/sys/user';
import update from 'immutability-helper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { genFakeId } from '@/utils/mathUtils';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUsersWithBu } from '@/services/gen/list';
import ProjectReportModal from './projectReportModal';
import ApplyProjectDetail from './detail';
import SalesManagerDetail from './salesManagerDetail';
import ProjectManagerDetail from './projectManagerDetail';
import FlowCreate from './flowCreate';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const DOMAIN = 'setUpProjectFlow';
@connect(({ loading, setUpProjectFlow, dispatch, setUpProjectCreate }) => ({
  loading:
    loading.effects[`${DOMAIN}/submit`] ||
    loading.effects[`${DOMAIN}/queryDetail`] ||
    loading.effects[`${DOMAIN}/BUupdate`] ||
    loading.effects[`${DOMAIN}/BUCreate`] ||
    loading.effects[`${DOMAIN}/salesManCreate`] ||
    loading.effects[`${DOMAIN}/pmoCreate`] ||
    loading.effects[`${DOMAIN}/projectManagerCreate`],
  setUpProjectFlow,
  setUpProjectCreate,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedFields) {
    if (!isEmpty(changedFields)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm1`,
        payload: changedFields,
      });
    }
  },
})
@mountToTab()
class SetUpProjectFlow extends PureComponent {
  state = {
    projectReportModalVisible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    const param = fromQs();
    param.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        }).then(response => {
          if (Object.keys(response).length !== 0) {
            const { taskKey } = response;
            // 先查询项目申请人填写的信息
            dispatch({
              type: `${DOMAIN}/queryDetail`,
              payload: {
                id: param.id,
              },
            }).then(res => {
              // 存在说明是上级拒绝要修改  不存在说明是新建
              if (res.projectView) {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    currentState: 'update',
                  },
                });
                dispatch({
                  type: `${DOMAIN}/updateForm1`,
                  payload: res.projectView,
                });
              }
            });
          }
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
  }

  // 根据选择的bu负责人重新渲染相关子合同的数据来源
  fetchContractSource = value => {
    const { dispatch } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/contractSource`,
        payload: {
          deliBuId: value.id,
        },
      });
    }
  };

  // 根据选择的相关子合同获取对应信息
  fetchContractDetails = value => {
    const { dispatch } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/contractSourceDetail`,
        payload: {
          id: value.id,
        },
      });
    }
  };

  // 计算总价
  getValues = () => {
    const {
      dispatch,
      setUpProjectFlow: {
        formData: { totalEqva, eqvaPrice },
      },
    } = this.props;
    if (totalEqva && eqvaPrice) {
      const eqvaPriceTotal = (Number(totalEqva) * Number(eqvaPrice)).toString();
      dispatch({
        type: `${DOMAIN}/updateForm1`,
        payload: { eqvaPriceTotal },
      });
    }
  };

  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      setUpProjectFlow: { dataSource },
      dispatch,
    } = this.props;

    let value = rowFieldValue;

    // input框赋值转换
    value = value && value.target ? value.target.value : value;

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  // 点击取消按钮
  toggleProjectReportModal = e => {
    const { projectReportModalVisible } = this.state;
    this.setState({ projectReportModalVisible: !projectReportModalVisible });
  };

  render() {
    const { projectReportModalVisible } = this.state;
    const {
      dispatch,
      loading,
      setUpProjectCreate: { formData: projFormData },
      setUpProjectFlow: {
        fieldsConfig,
        flowForm,
        queryData: { projectRequestView, twUiSelects },
        formData,
        dataSource,
        deleteKeys,
        currentState,
      },
      form: { getFieldDecorator, setFieldsValue, validateFieldsAndScroll, getFieldValue },
    } = this.props;
    const { id, taskId, mode } = fromQs();
    const { taskKey, buttons } = fieldsConfig;
    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: 0,
      dataSource,
      showCopy: true,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: update(dataSource, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (_selectedRowKeys, selectedRows) => {
        const unValidSize = selectedRows.filter(row => row.briefId).length;
        if (unValidSize > 0) {
          createMessage({ type: 'warn', description: '已汇报的不能删除!' });
          return;
        }
        const newDataSource = dataSource.filter(row => _selectedRowKeys.indexOf(row.id) < 0);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: newDataSource,
            deleteKeys: [...deleteKeys, ..._selectedRowKeys],
          },
        });
      },
      onCopyItem: copied => {
        const newDataSource = update(dataSource, {
          $push: copied.map(item => ({
            ...item,
            id: genFakeId(-1),
          })),
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: newDataSource,
          },
        });
      },
      columns: [
        {
          title: '期间',
          dataIndex: 'periodDate',
          required: true,
          align: 'center',
          width: 100,
          options: {
            rules: [
              {
                required: true,
                message: '请输入期间!',
              },
            ],
          },
          render: (value, row, index) => (
            <DatePicker.MonthPicker
              placeholder="期间"
              value={value}
              disabled={row.briefId}
              size="small"
              style={{ width: '100%' }}
              onChange={this.onCellChanged(index, 'periodDate')}
            />
          ),
        },
        {
          title: '金额',
          dataIndex: 'amt',
          required: true,
          width: 100,
          options: {
            rules: [
              {
                required: true,
                message: '请输入金额!',
              },
            ],
          },
          render: (value, row, index) => (
            <InputNumber
              defaultValue={value}
              value={value}
              disabled={row.briefId}
              size="small"
              style={{ width: '100%' }}
              onChange={this.onCellChanged(index, 'amt')}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: 200,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'remark')}
            />
          ),
        },
        {
          title: '项目汇报单号',
          dataIndex: 'briefNo',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <a
              className="tw-link"
              onClick={() => router.push(`/user/project/projectReportDetail?id=${row.briefId}`)}
            >
              {row.briefNo}
            </a>
          ),
        },
      ],
      buttons: [
        {
          key: 'autoReportPlan',
          title: '自动计算汇报计划',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (_selectedRowKeys, selectedRows) => {
            this.toggleProjectReportModal();
          },
        },
      ],
    };
    return (
      <PageHeaderWrapper>
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
            // 点击通过按钮
            if (key === 'APPROVED') {
              // 提交人提交   这种情况就是bu负责人也拒绝
              if (taskKey === 'ACC_A65_01_SUBMIT_i') {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    // 点击提交按钮
                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: {
                        procTaskId: taskId,
                        procRemark: remark,
                        submit: 'true',
                        ...projFormData,
                      },
                    });
                  }
                });
              }
              // BU负责人填写
              if (taskKey === 'ACC_A65_02_BU_INCHARGE_APPROVE_b') {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    // 点击提交按钮
                    if (currentState === 'update') {
                      dispatch({
                        type: `${DOMAIN}/BUupdate`,
                        payload: {
                          procTaskId: taskId,
                          procRemark: remark,
                          submit: 'true',
                        },
                      });
                    } else {
                      dispatch({
                        type: `${DOMAIN}/BUCreate`,
                        payload: {
                          procTaskId: taskId,
                          procRemark: remark,
                          submit: 'true',
                        },
                      });
                    }
                  } else {
                    createMessage({ type: 'error', description: '必填项不能为空' });
                  }
                });
              }
              // 销售负责人点击通过按钮
              if (taskKey === 'ACC_A65_03_SALESMAN_APPROVE_b') {
                dispatch({
                  type: `${DOMAIN}/salesManCreate`,
                  payload: {
                    procTaskId: taskId,
                    procRemark: remark,
                    submit: 'true',
                  },
                });
              }
              // PMO点击通过按钮
              if (taskKey === 'ACC_A65_04_PMO_APPROVE') {
                dispatch({
                  type: `${DOMAIN}/pmoCreate`,
                  payload: {
                    procTaskId: taskId,
                    procRemark: remark,
                    submit: 'true',
                  },
                });
              }
            }
            // 项目经理点击通过按钮
            if (key === 'ACCEPT' && taskKey === 'ACC_A65_05_PRO_MANAGER_b') {
              dispatch({
                type: `${DOMAIN}/projectManagerCreate`,
                payload: {
                  procTaskId: taskId,
                  procRemark: remark,
                  submit: 'true',
                },
              });
            }
            // promise 为false,后续组件方法不走,走自己的逻辑
            return Promise.resolve(false);
          }}
        >
          {mode === 'view' ? <ApplyProjectDetail /> : null}
          {taskKey === 'ACC_A65_01_SUBMIT_i' && mode === 'edit' ? <FlowCreate /> : null}
          {taskKey === 'ACC_A65_02_BU_INCHARGE_APPROVE_b' && mode === 'edit' ? (
            <Card
              className="tw-card-adjust"
              style={{ marginTop: '6px' }}
              title={<Title icon="profile" text="项目简况" />}
              bordered={false}
            >
              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="projName"
                  label="项目名称"
                  decorator={{
                    initialValue: projectRequestView ? projectRequestView.projName : undefined,
                    rules: [
                      {
                        required: true,
                        message: '请输入项目名称',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入项目名称" />
                </Field>
                <Field
                  name="projNo"
                  label="编号"
                  decorator={{
                    initialValue: currentState === 'update' ? formData.projNo : undefined,
                  }}
                >
                  <Input placeholder="系统自动生成" disabled />
                </Field>
                <Field
                  name="contractId"
                  label="相关子合同"
                  decorator={{
                    initialValue: formData.contractId || undefined,
                    rules: [
                      {
                        required: true,
                        message: '请选择相关子合同',
                      },
                    ],
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={twUiSelects}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => this.fetchContractDetails(value)}
                    placeholder="请选择相关子合同"
                  />
                </Field>
                <Field
                  name="custIdst"
                  label="客户行业"
                  decorator={{
                    initialValue: formData.custIdst,
                    rules: [
                      {
                        required: false,
                        message: '请选择客户行业',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="TSK.OU_IDST" placeholder="请选择客户行业" />
                </Field>
                <Field
                  name="custRegion"
                  label="客户区域"
                  decorator={{
                    initialValue: formData.custRegion,
                    rules: [
                      {
                        required: false,
                        message: '请选择客户区域',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="TSK:CUST_REGION" placeholder="请选择客户区域" />
                </Field>
                <Field
                  name="deliveryAddress"
                  label="交付地点"
                  decorator={{
                    initialValue: formData.deliveryAddress,
                    rules: [
                      {
                        required: false,
                        message: '请输入交付地点',
                      },
                    ],
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="ouName"
                  label="签约公司"
                  decorator={{
                    initialValue: formData.ouName,
                    rules: [
                      {
                        required: false,
                        message: '请输入签约公司',
                      },
                    ],
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="workTypeDesc"
                  label="工作类型"
                  decorator={{
                    initialValue: formData.workTypeDesc,
                    rules: [
                      {
                        required: false,
                        message: '请选择工作类型',
                      },
                    ],
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="planStartDate"
                  label="预计开始日期"
                  decorator={{
                    initialValue: formData.planStartDate,
                    rules: [
                      {
                        required: true,
                        message: '请选择预计开始日期',
                      },
                    ],
                  }}
                >
                  <DatePicker
                    className="x-fill-100"
                    format="YYYY-MM-DD"
                    placeholder="请选择预计开始日期"
                  />
                </Field>
                <Field
                  name="planEndDate"
                  label="预计结束日期"
                  decorator={{
                    initialValue: formData.planEndDate,
                    rules: [
                      {
                        required: true,
                        message: '请选择预计结束日期',
                      },
                    ],
                  }}
                >
                  <DatePicker
                    className="x-fill-100"
                    format="YYYY-MM-DD"
                    placeholder="请选择预计结束日期"
                  />
                </Field>
                <Field
                  name="projTempId"
                  label="项目模板"
                  decorator={{
                    initialValue: formData.projTempId && formData.projTempId + '',
                    rules: [
                      {
                        required: true,
                        message: '请选择项目模板',
                      },
                    ],
                  }}
                >
                  <AsyncSelect
                    source={() => selectProjectTmpl().then(resp => resp.response)}
                    placeholder="请选择项目模板"
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  />
                </Field>
                <Field
                  name="custpaytravelFlag"
                  label="客户承担差旅"
                  decorator={{
                    initialValue:
                      formData.custpaytravelFlag === 1
                        ? '是'
                        : (formData.custpaytravelFlag === 0 ? '否' : '') || '',
                  }}
                >
                  <Input disabled />
                </Field>
                <Field name="sow" label="SOW节选">
                  <FileManagerEnhance
                    api="/api/op/v1/project/sow/sfs/token"
                    dataKey={formData.id}
                    listType="text"
                    disabled={false}
                  />
                </Field>
                <FieldLine label="差旅餐补限额">
                  <Field
                    name="maxTravelFee"
                    decorator={{
                      initialValue: formData.maxTravelFee,
                      rules: [
                        { required: false, message: '请输入差旅餐补限额' },
                        { pattern: /^[-+]?[0-9]*\.?[0-9]+$/, message: '请输入浮点数' },
                      ],
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <Input placeholder="请输入差旅餐补限额" />
                  </Field>
                  <Field name="maxTravelFeeDesc" wrapperCol={{ span: 23, offset: 1, xxl: 23 }}>
                    <span>/天</span>
                  </Field>
                </FieldLine>
                <Field
                  name="currCodeDesc"
                  label="币种"
                  decorator={{
                    initialValue: formData.currCodeDesc,
                    rules: [
                      {
                        required: false,
                        message: '请选择币种',
                      },
                    ],
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="remark"
                  label="备注"
                  decorator={{
                    initialValue: formData.remark,
                    rules: [
                      {
                        required: false,
                        message: '请输入备注',
                      },
                    ],
                  }}
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                >
                  <Input.TextArea placeholder="请输入备注" autosize={{ minRows: 3, maxRows: 6 }} />
                </Field>
                <Field
                  name="resId"
                  label="申请人"
                  decorator={{
                    initialValue: projectRequestView ? projectRequestView.resId : undefined,
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={() => selectUsersWithBu()}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    placeholder="请选择申请人"
                    disabled
                  />
                </Field>
                <Field
                  name="applyDate"
                  label="申请日期"
                  decorator={{
                    initialValue: projectRequestView ? projectRequestView.applyDate : undefined,
                  }}
                >
                  <Input placeholder="系统自动生成" disabled />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                legend="相关人员"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="deliBuId"
                  label="交付BU"
                  decorator={{
                    initialValue: projectRequestView ? projectRequestView.deliBuId : undefined,
                    rules: [
                      {
                        required: true,
                        message: '请选择交付BU',
                      },
                    ],
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={() => selectBuMultiCol()}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {
                      this.fetchContractSource(value);
                      dispatch({
                        type: `${DOMAIN}/updateForm1`,
                        payload: {
                          contractId: undefined,
                        },
                      });
                      setFieldsValue({ contractId: undefined });
                    }}
                    placeholder="请选择交付BU"
                  />
                </Field>
                <Field
                  name="deliResId"
                  label="交付负责人"
                  decorator={{
                    initialValue: projectRequestView ? projectRequestView.deliResId : undefined,
                    rules: [
                      {
                        required: true,
                        message: '请选择交付负责人',
                      },
                    ],
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={() => selectUsersWithBu()}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    placeholder="请选择交付负责人"
                  />
                </Field>
                <Field
                  name="pmResId"
                  label="项目经理"
                  decorator={{
                    initialValue: formData.pmResId,
                    rules: [
                      {
                        required: true,
                        message: '请选择项目经理',
                      },
                    ],
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={() => selectUsersWithBu()}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    placeholder="请选择项目经理"
                  />
                </Field>
                <Field
                  name="pmEqvaRatio"
                  label="项目经理当量系数"
                  decorator={{
                    initialValue: formData.pmEqvaRatio,
                    rules: [
                      {
                        required: true,
                        message: '请输入项目经理当量系数',
                      },
                      {
                        pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                        message: '请输入浮点数',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入项目经理当量系数" />
                </Field>
                <Field
                  name="salesmanResId"
                  label="销售负责人"
                  decorator={{
                    initialValue: projectRequestView ? projectRequestView.salesmanResId : '',
                    rules: [
                      {
                        required: true,
                        message: '请选择销售负责人',
                      },
                    ],
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={() => selectUsersWithBu()}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    placeholder="请选择销售负责人"
                  />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                legend="总预算信息"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="totalDays"
                  label="预计总人天"
                  decorator={{
                    initialValue: formData.totalDays,
                    rules: [
                      {
                        required: true,
                        message: '请输入预计总人天',
                      },
                      {
                        pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                        message: '请输入浮点数',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入预计总人天" />
                </Field>
                <Field
                  name="totalEqva"
                  label="预计总当量"
                  decorator={{
                    initialValue: formData.totalEqva,
                    rules: [
                      {
                        required: true,
                        message: '请输入预计总当量',
                      },
                      {
                        pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                        message: '请输入浮点数',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入预计总当量" onBlur={() => this.getValues()} />
                </Field>
                <FieldLine label="当量预估单价/总价" required>
                  <Field
                    name="eqvaPrice"
                    decorator={{
                      initialValue: formData.eqvaPrice,
                      rules: [
                        { required: true, message: '请输入当量预估单价' },
                        {
                          pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                          message: '请输入浮点数',
                        },
                      ],
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <Input placeholder="请输入当量预估单价" onBlur={() => this.getValues()} />
                  </Field>
                  <Field
                    name="eqvaPriceTotal"
                    decorator={{
                      initialValue: formData.eqvaPriceTotal,
                      rules: [
                        { required: false, message: '请输入当量预估总价' },
                        { pattern: /^[-+]?[0-9]*\.?[0-9]+$/, message: '请输入浮点数' },
                      ],
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <Input placeholder="当量预估总价" disabled />
                  </Field>
                </FieldLine>
                <Field
                  name="totalReimbursement"
                  label="费用总预算"
                  decorator={{
                    initialValue: formData.totalReimbursement,
                    rules: [
                      {
                        required: true,
                        message: '请输入费用总预算',
                      },
                      {
                        pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                        message: '请输入浮点数',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入费用总预算" />
                </Field>
                <Field
                  name="totalCost"
                  label="项目预算总成本"
                  decorator={{
                    initialValue: formData.totalCost,
                    rules: [
                      {
                        required: true,
                        message: '请输入项目总预算成本',
                      },
                      {
                        pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                        message: '请输入浮点数',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入项目总预算成本" />
                </Field>
                <Field name="reimbursement" label="预算附件">
                  <FileManagerEnhance
                    api="/api/op/v1/project/budget/sfs/token"
                    dataKey={formData.id}
                    listType="text"
                    disabled={false}
                  />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                legend="授权信息"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="epibolyPermitFlag"
                  label="允许使用外包"
                  decorator={{
                    initialValue: formData.epibolyPermitFlag,
                    rules: [
                      {
                        required: true,
                        message: '请输入允许使用外包',
                      },
                    ],
                  }}
                >
                  <RadioGroup
                    onChange={e => {
                      formData.epibolyPermitFlag = e.target.value;
                    }}
                  >
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </RadioGroup>
                </Field>
                <Field
                  name="subcontractPermitFlag"
                  label="允许转包"
                  decorator={{
                    initialValue: formData.subcontractPermitFlag,
                    rules: [
                      {
                        required: true,
                        message: '请输入允许转包',
                      },
                    ],
                  }}
                >
                  <RadioGroup
                    onChange={e => {
                      formData.subcontractPermitFlag = e.target.value;
                    }}
                  >
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </RadioGroup>
                </Field>
                <Field
                  name="timesheetPeriod"
                  label="工时结算周期"
                  decorator={{
                    initialValue: formData.timesheetPeriod,
                    rules: [
                      {
                        required: true,
                        message: '请选择工时结算周期',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="TSK.TIMESHEET_SETTLE_PERIOD" placeholder="请选择工时结算周期" />
                </Field>
                <Field
                  name="finishApproveFlag"
                  label="活动完工审批"
                  decorator={{
                    initialValue: formData.finishApproveFlag,
                    rules: [
                      {
                        required: true,
                        message: '请输入活动完工审批',
                      },
                    ],
                  }}
                >
                  <RadioGroup
                    onChange={e => {
                      formData.finishApproveFlag = e.target.value;
                    }}
                  >
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </RadioGroup>
                </Field>
                <Field
                  name="deposit"
                  label="最低保证金（%）"
                  decorator={{
                    initialValue: formData.deposit,
                    rules: [
                      {
                        required: true,
                        message: '请选择最低保证金',
                      },
                      {
                        pattern: /^(\d|[1-9]\d|100)(\.\d{1,2})?$/,
                        message: '可输入0-100，最多保留2位小数',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请选择最低保证金" />
                </Field>
                <Field
                  name="muiltiTaskFlag"
                  label="允许一人多任务"
                  decorator={{
                    initialValue: formData.muiltiTaskFlag,
                    rules: [
                      {
                        required: true,
                        message: '请选则是否允许一人多任务',
                      },
                    ],
                  }}
                >
                  <RadioGroup
                    onChange={e => {
                      formData.muiltiTaskFlag = e.target.value;
                    }}
                  >
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </RadioGroup>
                </Field>
                <Field
                  name="containsCustomerFlag"
                  label="是否有客户承担的费用"
                  decorator={{
                    initialValue: formData.containsCustomerFlag,
                    rules: [
                      {
                        required: true,
                        message: '请选择是否有客户承担的费用 ',
                      },
                    ],
                  }}
                >
                  <RadioGroup
                    onChange={e => {
                      formData.containsCustomerFlag = e.target.value;
                    }}
                  >
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </RadioGroup>
                </Field>
                <Field
                  name="budgetSwitchFlag"
                  label="项目预算总开关标志"
                  decorator={{
                    initialValue: formData.budgetSwitchFlag,
                    rules: [
                      {
                        required: true,
                        message: '请选择项目预算总开关标志',
                      },
                    ],
                  }}
                >
                  <RadioGroup
                    onChange={e => {
                      formData.budgetSwitchFlag = e.target.value;
                    }}
                  >
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </RadioGroup>
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                legend="其他信息"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="userdefinedNo"
                  label="参考合同"
                  decorator={{
                    initialValue: formData.userdefinedNo,
                    rules: [
                      {
                        required: false,
                        message: '请输入参考合同',
                      },
                    ],
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="relatedProjId"
                  label="关联项目"
                  decorator={{
                    initialValue: formData.relatedProjId && formData.relatedProjId + '',
                    rules: [
                      {
                        required: false,
                        message: '请选择关联项目',
                      },
                    ],
                  }}
                >
                  <AsyncSelect
                    source={() => selectProject().then(resp => resp.response)}
                    placeholder="请选择关联项目"
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  />
                </Field>
                <Field
                  name="performanceDesc"
                  label="项目绩效规则"
                  decorator={{
                    initialValue: formData.performanceDesc,
                    rules: [
                      {
                        required: true,
                        message: '请输入项目绩效规则',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入项目绩效规则" />
                </Field>

                <Field name="performance" label="绩效附件">
                  <FileManagerEnhance
                    api="/api/op/v1/project/performance/sfs/token"
                    dataKey={formData.id}
                    listType="text"
                    disabled={false}
                  />
                </Field>
                <FieldLine label="含税总金额/税率">
                  <Field
                    name="amt"
                    decorator={{
                      initialValue: formData.amt,
                      rules: [
                        { required: false, message: '请输入含税总金额' },
                        { pattern: /^[-+]?[0-9]*\.?[0-9]+$/, message: '请输入浮点数' },
                      ],
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <Input placeholder="请输入含税总金额" disabled />
                  </Field>
                  <Field
                    name="taxRate"
                    decorator={{
                      initialValue: formData.taxRate,
                      rules: [
                        { required: false, message: '请输入税率' },
                        { pattern: /^[-+]?[0-9]*\.?[0-9]+$/, message: '请输入浮点数' },
                      ],
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <Input placeholder="请输入税率" disabled />
                  </Field>
                </FieldLine>
                <Field
                  name="effectiveAmt"
                  label="有效合同金额"
                  decorator={{
                    initialValue: formData.effectiveAmt,
                    rules: [
                      {
                        required: false,
                        message: '请输入有效合同金额',
                      },
                      {
                        pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                        message: '请输入浮点数',
                      },
                    ],
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="closeReasonDesc"
                  label="关闭原因"
                  decorator={{
                    initialValue: formData.closeReasonDesc,
                    rules: [
                      {
                        required: false,
                        message: '请选择关闭原因',
                      },
                    ],
                  }}
                >
                  <Input disabled />
                </Field>

                <Field name="11" label="附件">
                  <FileManagerEnhance
                    api="/api/op/v1/project/attachment/sfs/token"
                    dataKey={formData.id}
                    listType="text"
                    disabled={false}
                  />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                legend="项目汇报策略"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="autoReportFlag"
                  label="自动项目汇报"
                  decorator={{
                    initialValue: formData.autoReportFlag,
                    rules: [{ required: true, message: '请选择是否自动项目汇报' }],
                  }}
                >
                  <Radio.Group
                    onChange={e => {
                      const { value } = e.target;
                      const reportParams = {
                        reportPeriodAmt: undefined,
                        reportStartDate: undefined,
                        reportQty: undefined,
                      };
                      if (value === 0) {
                        setFieldsValue(reportParams);
                        dispatch({
                          type: `${DOMAIN}/updateForm1`,
                          payload: reportParams,
                        });
                      }
                    }}
                  >
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </Radio.Group>
                </Field>
                {formData.autoReportFlag === 1 ? <EditableDataTable {...editTableProps} /> : ''}
              </FieldList>
            </Card>
          ) : null}
          {projectReportModalVisible ? (
            <ProjectReportModal
              projectReportModalVisible={projectReportModalVisible}
              toggleProjectReportModal={this.toggleProjectReportModal}
            />
          ) : null}
          {(taskKey === 'ACC_A65_03_SALESMAN_APPROVE_b' && mode === 'edit') ||
          (taskKey === 'ACC_A65_04_PMO_APPROVE' && mode === 'edit') ? (
            <SalesManagerDetail />
          ) : null}
          {taskKey === 'ACC_A65_05_PRO_MANAGER_b' && mode === 'edit' ? (
            <ProjectManagerDetail />
          ) : null}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default SetUpProjectFlow;
