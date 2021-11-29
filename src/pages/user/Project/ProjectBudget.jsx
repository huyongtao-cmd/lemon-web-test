import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  DatePicker,
  Switch,
  Radio,
  Modal,
} from 'antd';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import router from 'umi/router';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { formatMessage } from 'umi/locale';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import BudgetEditTable from './BudgetEditTable';
import Loading from '@/components/core/DataLoading';
import { selectProjectConditional } from '@/services/user/project/project';

import './ProjectBudget.less';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'userProjectBudget';

const blankState = {
  selectedRowKeys: [],
  appropriationVisible: false,
};
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

/**
 * 找树形json的某个节点
 * @param json 源json
 * @param nodeId 节点id属性的值
 */
const getNode = (json, nodeId) => {
  if (!json || !nodeId) {
    return undefined;
  }
  for (let i = 0; i < json.length; i += 1) {
    if (json[i].id === nodeId) {
      return json[i];
    }
    if (json[i].children) {
      const returnNode = getNode(json[i].children, nodeId);
      if (returnNode) {
        return returnNode;
      }
    }
  }
  return undefined;
};
// 递归设置预算金额
const setBudgetAmt = (budgetList, oldValue, newValue, upperCode, treeCodeIdMap) => {
  if (!upperCode) {
    return;
  }
  const upperRow = getNode(budgetList, treeCodeIdMap[upperCode]);
  upperRow.budgetAmt = upperRow.budgetAmt - oldValue + newValue;
  setBudgetAmt(budgetList, oldValue, newValue, upperRow.upperCode, treeCodeIdMap);
};

@connect(({ loading, userProjectBudget, dispatch }) => ({
  loading,
  userProjectBudget,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { key, value: value.value },
    });
  },
})
class ProjectBudget extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...blankState,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { projId: param.projId },
    });
  }

  clearState = () => {
    this.setState(blankState);
  };

  // 行编辑触发事件
  onCellChanged = (row, rowField) => rowFieldValue => {
    const {
      userProjectBudget: { feeDataSource, feeFormData, treeCodeIdMap },
      dispatch,
    } = this.props;
    if (rowField === 'budgetAmt') {
      const newValue = Number(rowFieldValue);
      if (Number.isNaN(newValue)) {
        return;
      }
      const oldValue = row.budgetAmt;

      setBudgetAmt(feeDataSource, oldValue, newValue, row.upperCode, treeCodeIdMap);
      // eslint-disable-next-line no-param-reassign
      row.budgetAmt = newValue;

      const { feeBudgetAmt } = feeFormData;

      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          feeDataSource,
          feeFormData: {
            ...feeFormData,
            feeBudgetAmt: feeBudgetAmt - oldValue + newValue,
          },
        },
      });
    } else if (rowField === 'budgetControlFlag') {
      // eslint-disable-next-line no-param-reassign
      row.budgetControlFlag = rowFieldValue.target.checked ? 1 : 0;

      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { feeDataSource },
      });
    } else if (rowField === 'remark') {
      // eslint-disable-next-line no-param-reassign
      row.remark = rowFieldValue.target.value;

      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { feeDataSource },
      });
    }
  };

  // 保存按钮事件
  handleSave = () => {
    const {
      dispatch,
      userProjectBudget: { feeDataSource, feeFormData },
      form: { validateFieldsAndScroll },
    } = this.props;
    // 获取url上的参数
    const param = fromQs();
    // // 校验明细项
    // const budgetAmtError = feeDataSource.filter(v => v.budgetControlFlag === 1 && !v.budgetAmt);
    // // 浮点数校验
    // const re = /^[0-9]+.?[0-9]*$/;
    // const budgetAmtNotNumError = feeDataSource.filter(v => v.budgetAmt && !re.test(v.budgetAmt));
    //
    // if (budgetAmtError.length) {
    //   createMessage({ type: 'error', description: `请填写费用总金额` });
    //   return;
    // }
    // if (budgetAmtNotNumError.length) {
    //   createMessage({ type: 'error', description: `费用总金额为浮点数` });
    //   return;
    // }
    // // 预算总金额求和
    // let sum = 0;
    // feeDataSource.forEach((item, i) => {
    //   if (item.budgetAmt) {
    //     sum += parseInt(item.budgetAmt, 10);
    //   }
    // });
    // // 累计预算总金额不得超过表头中的预算总金额
    // if (
    //   (feeFormData.feeBudgetAmt && sum > feeFormData.feeBudgetAmt) ||
    //   (!feeFormData.feeBudgetAmt && sum > 0)
    // ) {
    //   createMessage({ type: 'error', description: `累计预算总金额不得超过表头中的费用预算总金额` });
    //   return;
    // }
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          projId: param.projId,
        });
      }
    });
  };

  // 提交按钮事件
  handleSubmit = () => {
    const {
      dispatch,
      userProjectBudget: { feeFormData, budgetAppropriationEntity },
      form: { validateFieldsAndScroll },
    } = this.props;
    // 获取url上的参数
    const param = fromQs();
    if (
      feeFormData.feeBudgetAmt <
      budgetAppropriationEntity.applyFeeAmt + (feeFormData.feeReleasedAmt || 0)
    ) {
      createMessage({ type: 'warn', description: '申请拨付费用金额加已拨付金额超过预算费用金额!' });
      return;
    }
    if (
      feeFormData.eqvaBudgetCnt <
      budgetAppropriationEntity.applyEqva + (feeFormData.eqvaReleasedQty || 0)
    ) {
      createMessage({ type: 'warn', description: '申请拨付当量加已拨付当量超过预算当量!' });
      return;
    }
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
          projId: param.projId,
          taskId: param.taskId,
        });
      }
    });
  };

  initBudget = () => {
    const {
      userProjectBudget: { feeDataSource },
      dispatch,
    } = this.props;
    createConfirm({
      content: '初始化将清空原科目信息,重新从科目模板拉取科目,是否确认?',
      onOk: () => dispatch({ type: `${DOMAIN}/initBudget` }),
    });
  };

  appropriationToggleModal = () => {
    const {
      userProjectBudget: { budgetAppropriationEntity, projectView },
      form: { getFieldDecorator },
    } = this.props;
    const { appropriationVisible } = this.state;
    if (appropriationVisible) {
      budgetAppropriationEntity.applyAmt = 0;
      budgetAppropriationEntity.applyEqva = 0;
      budgetAppropriationEntity.applyEqvaAmt = 0;
      budgetAppropriationEntity.applyFeeAmt = 0;
    }
    this.setState({
      appropriationVisible: !appropriationVisible,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userProjectBudget: {
        feeDataSource,
        feeFormData,
        projectshDataSource,
        budgetAppropriationEntity,
        projectView,
      },
      form: { getFieldDecorator, validateFieldsAndScroll },
    } = this.props;
    const { appropriationVisible } = this.state;

    const { selectedRowKeys } = this.state;
    // 获取url上的参数
    const param = fromQs();
    const disabledBtn =
      loading.effects[`${DOMAIN}/query`] ||
      loading.effects[`${DOMAIN}/save`] ||
      loading.effects[`${DOMAIN}/submit`];
    const treeLoading =
      loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/initBudget`];

    // 费用预算表格
    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: 0,
      dataSource: feeDataSource,
      showCopy: false,
      showAdd: false,
      showDelete: false,
      rowSelection: null,
      columns: [
        {
          title: '科目',
          dataIndex: 'accName',
          align: 'left',
        },
        // {
        //   title: '二级预算目录',
        //   dataIndex: 'secondLevelName',
        // },
        // {
        //   title: '三级预算目录',
        //   dataIndex: 'thirdLevelName',
        //   align: 'right',
        // },
        {
          title: '预算控制',
          dataIndex: 'budgetControlFlag',
          // required: true,
          align: 'center',
          render: (value, row, index) => (
            <Checkbox
              checked={value === 1}
              onChange={this.onCellChanged(row, 'budgetControlFlag')}
            />
          ),
        },
        {
          title: '预算金额',
          dataIndex: 'budgetAmt',
          // required: true,
          align: 'right',
          render: (value, row, index) =>
            !row.children ? (
              <InputNumber
                className="x-fill-100 input-number-right"
                precision={2}
                value={value}
                size="small"
                maxLength={10}
                onChange={this.onCellChanged(row, 'budgetAmt')}
                // disabled={!row.budgetControlFlag}
              />
            ) : (
              value
            ),
        },
        // {
        //   title: '已使用',
        //   dataIndex: 'usedAmt',
        //   align: 'right',
        // },
        // {
        //   title: '使用中',
        //   dataIndex: 'usingAmt',
        //   align: 'right',
        // },
        // {
        //   title: '超额控制',
        //   dataIndex: 'overControlFlag',
        //   // required: true,
        //   align: 'center',
        //   render: (value, row, index) => (
        //     <Checkbox
        //       checked={value === 1}
        //       onChange={this.onCellCheckBoxChanged(index, 'overControlFlag')}
        //       disabled={!row.budgetControlFlag}
        //     />
        //   ),
        // },
        // {
        //   title: '偏离度（%）',
        //   align: 'center',
        //   dataIndex: 'divergeRate',
        //   render: (value, row, index) => (
        //     <Input
        //       value={value}
        //       size="small"
        //       onChange={this.onCellChanged(index, 'divergeRate')}
        //       disabled={!row.overControlFlag}
        //     />
        //   ),
        // },
        {
          title: '备注',
          align: 'center',
          dataIndex: 'remark',
          render: (value, row, index) => (
            <Input value={value} size="small" onChange={this.onCellChanged(row, 'remark')} />
          ),
        },
      ],
      buttons: [],
    };

    // 项目成员管理表格
    const projectshTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      pagination: false,
      enableSelection: false,
      total: 0,
      dataSource: projectshDataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      showSearch: false,
      columns: [
        {
          title: '项目角色',
          dataIndex: 'role',
        },
        {
          title: '复合能力',
          dataIndex: 'capasetLevelName',
        },
        {
          title: '资源',
          dataIndex: 'resName',
        },
        {
          title: '预计开始日期',
          dataIndex: 'planStartDate',
        },
        {
          title: '预计结束日期',
          dataIndex: 'planEndDate',
        },
        {
          title: '工作台显示',
          dataIndex: 'workbenchFlag',
          align: 'center',
          render: (value, row, index) => {
            if (value === 1) {
              return <div>是</div>;
            }
            if (value === 0) {
              return <div>否</div>;
            }
            return <div>{value}</div>;
          },
        },
        {
          title: '规划当量',
          dataIndex: 'planEqva',
          align: 'right',
        },
        {
          title: '项目号',
          dataIndex: 'projNo',
          align: 'center',
        },
        {
          title: '任务包号',
          dataIndex: 'taskNo',
          align: 'center',
        },
        {
          title: '派发当量系数',
          dataIndex: 'eqvaRatio',
          align: 'right',
        },
        {
          title: 'FromBU',
          dataIndex: 'expenseBuName',
        },
        {
          title: 'ToBU',
          dataIndex: 'receiverBuName',
        },
        {
          title: '合作类型',
          dataIndex: 'cooperationType',
          align: 'center',
        },
        {
          title: '验收方式',
          dataIndex: 'acceptMethodName',
          align: 'center',
        },
        {
          title: '总当量',
          dataIndex: 'eqvaQty',
          align: 'right',
        },
        {
          title: '当量工资',
          dataIndex: 'eqvaSalary',
          align: 'right',
        },
        {
          title: 'BU结算价',
          dataIndex: 'buSettlePrice',
          align: 'right',
        },
        {
          title: '管理费',
          dataIndex: 'ohfeePrice',
          align: 'right',
        },
        {
          title: '税点',
          dataIndex: 'taxRate',
          align: 'right',
        },
        {
          title: '当量结算单价',
          dataIndex: 'settlePrice',
          align: 'right',
        },
        {
          title: '参考人天单价',
          dataIndex: 'mandayPrice',
          align: 'right',
        },
        {
          title: '派发金额',
          dataIndex: 'distributedAmt',
          align: 'right',
        },
        {
          title: '已结算当量数',
          dataIndex: 'settledEqva',
          align: 'right',
        },
        {
          title: '已结算金额',
          dataIndex: 'settledAmt',
          align: 'right',
        },
      ],
      leftButtons: [],
    };

    return (
      <PageHeaderWrapper>
        {treeLoading ? (
          <Loading />
        ) : (
          <>
            <Card className="tw-card-rightLine">
              <Button
                className="tw-btn-primary"
                icon="save"
                size="large"
                disabled={disabledBtn}
                onClick={this.handleSave}
              >
                {formatMessage({ id: `misc.save`, desc: '保存' })}
              </Button>

              <Button
                className="tw-btn-primary"
                icon="check-square"
                size="large"
                disabled={disabledBtn}
                onClick={() => {
                  validateFieldsAndScroll((error, values) => {
                    if (!error) {
                      this.appropriationToggleModal();
                    }
                  });
                }}
              >
                {formatMessage({ id: `misc.submit`, desc: '提交' })}
              </Button>

              <Button
                className="tw-btn-primary"
                size="large"
                disabled={disabledBtn}
                onClick={() => this.initBudget()}
              >
                初始化预算
              </Button>
            </Card>
            <Card
              className="tw-card-adjust"
              title={
                <Title
                  icon="profile"
                  id="ui.menu.user.project.projectBudget"
                  defaultMessage="项目整体费用预算"
                />
              }
            >
              <FieldList
                layout="horizontal"
                legend="项目费用预算"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  label="预算编码"
                  name="budgetNo"
                  decorator={{
                    initialValue: feeFormData.budgetNo,
                  }}
                >
                  <Input placeholder="系统生成" disabled />
                </Field>

                <Field
                  name="budgetName"
                  label="预算名称"
                  decorator={{
                    initialValue: feeFormData.budgetName,
                    rules: [
                      {
                        required: true,
                        message: '请输入预算名称',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入预算名称" />
                </Field>

                <Field
                  name="feeBudgetAmt"
                  label="预算总费用"
                  decorator={{
                    initialValue: feeFormData.feeBudgetAmt,
                  }}
                >
                  <Input placeholder="请输入预算总费用" disabled />
                </Field>

                <Field
                  name="feeReleasedAmt"
                  label="已拨付费用预算金额"
                  decorator={{
                    initialValue: feeFormData.feeReleasedAmt,
                  }}
                >
                  <Input disabled />
                </Field>

                {/* <Field
                  name="usedAmt"
                  label="已使用费用预算金额"
                  decorator={{
                    initialValue: feeFormData.usedAmt,
                  }}
                >
                  <Input disabled />
                </Field> */}

                <Field
                  name="totalsControlFlag"
                  label="预算控制"
                  decorator={{
                    initialValue:
                      feeFormData.totalsControlFlag === undefined
                        ? undefined
                        : feeFormData.totalsControlFlag + '',
                  }}
                >
                  <Radio.Group>
                    <Radio value="1">是</Radio>
                    <Radio value="0">否</Radio>
                  </Radio.Group>
                </Field>

                <Field
                  name="projId"
                  label="相关项目名称"
                  decorator={{
                    initialValue: feeFormData.projId,
                  }}
                >
                  <Selection.Columns
                    disabled
                    className="x-fill-100"
                    source={() => selectProjectConditional({})}
                    columns={SEL_COL}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{ width: 440 }}
                    showSearch
                  />
                </Field>

                <Field
                  name="budgetStatus"
                  label="预算状态"
                  decorator={{
                    initialValue: feeFormData.budgetStatus,
                  }}
                >
                  <UdcSelect code="ACC.BUDG_STATUS" placeholder="请选择预算状态" disabled />
                </Field>

                <Field name="attachment" label="附件">
                  <FileManagerEnhance
                    api="/api/op/v1/project/projectBudget/sfs/token"
                    dataKey={feeFormData.id}
                    listType="text"
                    disabled={false}
                  />
                </Field>

                <Field
                  name="createUserName"
                  label="预算创建人"
                  decorator={{
                    initialValue: feeFormData.createUserName,
                  }}
                >
                  <Input placeholder="系统生成" disabled />
                </Field>

                <Field
                  name="createTime"
                  label="预算创建时间"
                  decorator={{
                    initialValue: feeFormData.createTime,
                  }}
                >
                  <Input placeholder="系统生成" disabled />
                </Field>
              </FieldList>
              <Divider dashed />
              <BudgetEditTable {...editTableProps} loading={treeLoading} />

              <Divider dashed />
              <FieldList
                layout="horizontal"
                legend="项目当量预算"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <FieldLine label="当量预算总数/金额" required>
                  <Field
                    name="eqvaBudgetCnt"
                    decorator={{
                      rules: [{ required: true, message: '请填写预算当量' }],
                      initialValue: feeFormData.eqvaBudgetCnt,
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <InputNumber
                      className="x-fill-100"
                      maxLength={10}
                      onChange={e => {
                        feeFormData.eqvaBudgetAmt =
                          Math.round(e * projectView.eqvaPrice * 100) / 100;
                      }}
                    />
                  </Field>
                  <Field
                    name="eqvaBudgetAmt"
                    decorator={{
                      initialValue: feeFormData.eqvaBudgetAmt,
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <Input disabled />
                  </Field>
                </FieldLine>
                <FieldLine label="已派发当量总数/金额">
                  <Field
                    name="distributedEqva"
                    decorator={{
                      initialValue: feeFormData.distributedEqva,
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="distributedAmt"
                    decorator={{
                      initialValue: feeFormData.distributedAmt,
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <Input disabled />
                  </Field>
                </FieldLine>
                <FieldLine label="已拨付当量数/金额">
                  <Field
                    name="eqvaReleasedQty"
                    decorator={{
                      initialValue: feeFormData.eqvaReleasedQty,
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="eqvaReleasedAmt"
                    decorator={{
                      initialValue: feeFormData.eqvaReleasedAmt,
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <Input disabled />
                  </Field>
                </FieldLine>
                <FieldLine label="已结算当量数/金额">
                  <Field
                    name="settledEqva"
                    decorator={{
                      initialValue: feeFormData.settledEqva,
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <Input disabled />
                  </Field>
                  <Field
                    name="settledAmt"
                    decorator={{
                      initialValue: feeFormData.settledAmt,
                    }}
                    wrapperCol={{ span: 23, xxl: 23 }}
                  >
                    <Input disabled />
                  </Field>
                </FieldLine>
              </FieldList>
              <Divider dashed />
              <DataTable {...projectshTableProps} scroll={{ x: 3000 }} />
            </Card>
          </>
        )}

        <Modal
          centered
          width="60%"
          destroyOnClose
          title="拨付申请信息"
          visible={appropriationVisible}
          confirmLoading={disabledBtn}
          onOk={this.handleSubmit}
          onCancel={this.appropriationToggleModal}
        >
          <Card className="tw-card-adjust" bordered={false}>
            <FieldList
              layout="horizontal"
              legend=""
              getFieldDecorator={getFieldDecorator}
              col={2}
              noReactive
            >
              <Field
                name="applyFeeAmt"
                label="费用金额"
                decorator={{
                  initialValue: budgetAppropriationEntity.applyFeeAmt || 0,
                  rules: [{ required: true, message: '请输入费用金额' }],
                }}
              >
                <InputNumber
                  className="x-fill-100"
                  placeholder="请输入费用金额"
                  maxLength={10}
                  onChange={e => {
                    budgetAppropriationEntity.applyFeeAmt = e;
                    budgetAppropriationEntity.applyAmt = e + budgetAppropriationEntity.applyEqvaAmt;
                  }}
                />
              </Field>

              <FieldLine label="当量数/金额" fieldCol={2} required>
                <Field
                  name="applyEqva"
                  decorator={{
                    initialValue: budgetAppropriationEntity.applyEqva || 0,
                    rules: [{ required: true, message: '请输入当量数' }],
                  }}
                  wrapperCol={{ span: 23, xxl: 23 }}
                >
                  <InputNumber
                    className="x-fill-100"
                    placeholder="请输入当量数"
                    maxLength={10}
                    onChange={e => {
                      budgetAppropriationEntity.applyEqva = e;
                      budgetAppropriationEntity.applyEqvaAmt =
                        Math.round(e * projectView.eqvaPrice * 100) / 100;
                      budgetAppropriationEntity.applyAmt =
                        budgetAppropriationEntity.applyEqvaAmt +
                        budgetAppropriationEntity.applyFeeAmt;
                    }}
                  />
                </Field>
                <Field
                  name="applyEqvaAmt"
                  decorator={{
                    initialValue: budgetAppropriationEntity.applyEqvaAmt || 0,
                    rules: [{ required: false, message: '请输入当量金额' }],
                  }}
                  wrapperCol={{ span: 23, xxl: 23 }}
                >
                  <InputNumber
                    className="x-fill-100"
                    disabled
                    placeholder="请输入当量金额"
                    onChange={e => {
                      budgetAppropriationEntity.applyEqvaAmt = e;
                    }}
                  />
                </Field>
              </FieldLine>
              <Field
                name="applyAmt"
                label="总金额"
                decorator={{
                  initialValue: budgetAppropriationEntity.applyAmt || 0,
                  rules: [{ required: false, message: '请输入总金额' }],
                }}
              >
                <InputNumber
                  className="x-fill-100"
                  disabled
                  placeholder="请输入申请拨付金额"
                  onChange={e => {
                    budgetAppropriationEntity.applyAmt = e;
                  }}
                />
              </Field>
              <Field
                name="remark2"
                label="备注"
                decorator={{
                  initialValue: budgetAppropriationEntity.remark,
                  rules: [{ required: false }, { max: 400, message: '不超过400个字' }],
                }}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
              >
                <Input.TextArea
                  placeholder="请输入备注"
                  autosize={{ minRows: 3, maxRows: 6 }}
                  onChange={e => {
                    budgetAppropriationEntity.remark = e.target.value;
                  }}
                />
              </Field>
            </FieldList>
          </Card>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default ProjectBudget;
