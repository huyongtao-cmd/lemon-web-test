import React, { PureComponent } from 'react';
import { connect } from 'dva';
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
import { isEmpty } from 'ramda';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { formatMessage } from 'umi/locale';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import moment from 'moment';
import BudgetEditTable from '../BudgetEditTable';
import Loading from '@/components/core/DataLoading';
import { selectProjectConditional } from '@/services/user/project/project';
import ChangeDetailModal from './changeDetailModal';
import { genFakeId } from '@/utils/mathUtils';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'projectBudgetCreate';

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

// 对比两个对象的值是否完全相等 返回值 true/false
function isObjectValueEqual(obj1, obj2) {
  const propNames = [];
  if (obj1) {
    const aProps = Object.getOwnPropertyNames(obj1);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < aProps.length; i++) {
      const propName = aProps[i];
      if (propName === 'totalsControlFlag' && obj1[propName] !== Number(obj2[propName])) {
        propNames.push('totalsControlFlag');
      } else if (propName !== 'totalsControlFlag' && obj1[propName] !== obj2[propName]) {
        propNames.push(propName);
      }
    }
  }

  return propNames;
}

@connect(({ loading, projectBudgetCreate, dispatch, user }) => ({
  loading,
  projectBudgetCreate,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (isEmpty(changedValues)) return;
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: changedValues,
    });
  },
})
class projectBudgetCreate extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // appropriationVisible: false,
      changeDetailsVisible: false,
      changelists: [],
      oldBudgetJson: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        projId: param.projId,
        taskId: param.taskId,
      },
    }).then(res => {
      if (res) {
        this.oldBudgetJsonCompare(res);
      }
    });
  }

  handleItem = (newItem, oldItem) => {
    const { changelists } = this.state;
    if (newItem.budgetAmt !== oldItem.budgetAmt) {
      changelists.push({
        id: newItem.id,
        changeField: 'budgetAmt', // 变更字段
        changeLabel: newItem.accName + '-预算金额', // 变更标签
        viewGroup: 'PROJ_MONEY_BUDGET_CHANGE_VIEW', // 视图分组
        viewGroupName: '项目费用预算变更',
        changeFieldType: 'number', // 字段类型
        deltaValue: newItem.budgetAmt - oldItem.budgetAmt, // 变更值
        beforeValue: oldItem.budgetAmt, // 变更前值
        afterValue: newItem.budgetAmt, // 变更后值
        documentId: newItem.id,
        fieldGroup: 'T_PROJ_BUDGETDTL',
      });
    }
    if (newItem.budgetControlFlag !== oldItem.budgetControlFlag) {
      changelists.push({
        id: newItem.id,
        changeField: 'budgetControlFlag', // 变更字段
        changeLabel: newItem.accName + '-预算控制', // 变更标签
        viewGroup: 'PROJ_MONEY_BUDGET_CHANGE_VIEW', // 视图分组
        viewGroupName: '项目费用预算变更',
        changeFieldType: 'string', // 字段类型
        deltaValue: '', // 变更值
        beforeValue: oldItem.budgetControlFlag, // 变更前值
        afterValue: newItem.budgetControlFlag, // 变更后值
        documentId: newItem.id,
        fieldGroup: 'T_PROJ_BUDGETDTL',
      });
    }
    if (newItem.remark === '' && oldItem.remark == null) {
      changelists.push();
    } else if (newItem.remark !== oldItem.remark) {
      changelists.push({
        id: newItem.id,
        changeField: 'remark', // 变更字段
        changeLabel: newItem.accName + '-备注', // 变更标签
        viewGroup: 'PROJ_MONEY_BUDGET_CHANGE_VIEW', // 视图分组
        viewGroupName: '项目费用预算变更',
        changeFieldType: 'string', // 字段类型
        deltaValue: '', // 变更值
        beforeValue: oldItem.remark, // 变更前值
        afterValue: newItem.remark, // 变更后值
        documentId: newItem.id,
        fieldGroup: 'T_PROJ_BUDGETDTL',
      });
    }

    this.setState({
      changelists,
    });
  };

  compare = (newBudget, oldBudgetJson) => {
    if (!newBudget || newBudget.length === 0) {
      return;
    }
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < newBudget.length; i++) {
      this.handleItem(newBudget[i], oldBudgetJson[newBudget[i].id]);
      this.compare(newBudget[i].children, oldBudgetJson);
    }
  };

  oldBudgetJsonCompare = oldBudget => {
    const { oldBudgetJson } = this.state;
    if (!oldBudget || oldBudget.length === 0) {
      return;
    }
    oldBudget.forEach(item => {
      oldBudgetJson[item.id] = item;
      this.oldBudgetJsonCompare(item.children);
    });
    this.setState({
      oldBudgetJson,
    });
  };

  // 行编辑触发事件
  onCellChanged = (row, rowField) => rowFieldValue => {
    const {
      projectBudgetCreate: { feeDataSource, feeFormData, treeCodeIdMap },
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
      projectBudgetCreate: { feeDataSource, feeFormData },
      form: { validateFieldsAndScroll },
    } = this.props;
    // 获取url上的参数
    const param = fromQs();
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
  handleSubmit = changeFormData => {
    const {
      dispatch,
      projectBudgetCreate: { feeFormData, beforeAbstractFormData, feeDataSource, copyFeeFormData },
      form: { validateFieldsAndScroll },
    } = this.props;
    // 获取url上的参数
    const param = fromQs();

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            projId: param.projId,
            changeFormData: {
              typeNo: 'PROJ_BUDGET_BUSINESS_CHANGE',
              documentId: Number(param.projId),
              submit: true,
              changeStatus: 'SUBMIT',
              procTaskId: param.taskId,
              id: beforeAbstractFormData ? beforeAbstractFormData.id : '',
              apprStatus: beforeAbstractFormData ? beforeAbstractFormData.apprStatus : '',
              ...changeFormData,
            },
          },
        });
      }
    });
    this.changeDetailsToggleModal();
  };

  // 点击提交时的弹窗
  changeDetailsToggleModal = () => {
    const { oldBudgetJson, changelists } = this.state;
    const {
      dispatch,
      projectBudgetCreate: {
        feeFormData,
        copyFeeFormData,
        feeDataSource,
        copyFeeDataSource,
        businessChangeDetailEntities,
        projectView,
      },
      form: { validateFieldsAndScroll },
    } = this.props;
    const { changeDetailsVisible } = this.state;
    if (!changeDetailsVisible) {
      this.compare(feeDataSource, oldBudgetJson);
    } else {
      this.setState({
        changelists: [],
      });
    }
    const changeFields = isObjectValueEqual(copyFeeFormData, feeFormData);
    const param = [];
    changeFields.forEach(item => {
      let changeFieldType = '';
      let deltaValue = '';
      changeFieldType = typeof feeFormData[item];
      if (changeFieldType === 'number') {
        deltaValue = feeFormData[item] - copyFeeFormData[item];
      } else {
        deltaValue = '';
      }
      if (item === 'budgetName') {
        param.push({
          id: genFakeId(-1),
          changeField: item, // 变更字段
          changeLabel: '预算名称', // 变更标签
          viewGroup: 'PROJ_BASIC_BUDGET_CHANGE_VIEW', // 视图分组
          viewGroupName: '项目基本信息预算变更',
          changeFieldType, // 字段类型
          deltaValue, // 变更值
          beforeValue: copyFeeFormData[item], // 变更前值
          afterValue: feeFormData[item], // 变更后值
          documentId: feeFormData.id,
          fieldGroup: 'T_PROJ_BUDGET',
        });
      } else if (item === 'eqvaBudgetCnt') {
        param.push(
          {
            id: genFakeId(-1),
            changeField: item, // 变更字段
            changeLabel: '当量', // 变更标签
            viewGroup: 'PROJ_EQUIVALENT_BUDGET_CHANGE_VIEW', // 视图分组
            viewGroupName: '项目当量预算变更',
            changeFieldType, // 字段类型
            deltaValue, // 变更值
            beforeValue: copyFeeFormData[item], // 变更前值
            afterValue: feeFormData[item], // 变更后值
            documentId: feeFormData.id,
            fieldGroup: 'T_PROJ_BUDGET',
          },
          {
            id: genFakeId(-1),
            changeField: 'eqvaBudgetAmt', // 变更字段
            changeLabel: '金额', // 变更标签
            viewGroup: 'PROJ_EQUIVALENT_BUDGET_CHANGE_VIEW', // 视图分组
            viewGroupName: '项目当量预算变更',
            changeFieldType, // 字段类型
            deltaValue:
              Math.round(feeFormData[item] * projectView.eqvaPrice * 100) / 100 -
              Math.round(copyFeeFormData[item] * projectView.eqvaPrice * 100) / 100, // 变更值
            beforeValue: Math.round(copyFeeFormData[item] * projectView.eqvaPrice * 100) / 100, // 变更前值
            afterValue: Math.round(feeFormData[item] * projectView.eqvaPrice * 100) / 100, // 变更后值
            documentId: feeFormData.id,
            fieldGroup: 'T_PROJ_BUDGET',
          }
        );
      } else if (item === 'totalsControlFlag') {
        param.push({
          id: genFakeId(-1),
          changeField: item, // 变更字段
          changeLabel: '预算控制', // 变更标签
          viewGroup: 'PROJ_BASIC_BUDGET_CHANGE_VIEW', // 视图分组
          viewGroupName: '项目基本信息预算变更',
          changeFieldType, // 字段类型
          deltaValue: '', // 变更值
          beforeValue: Number(copyFeeFormData[item]), // 变更前值
          afterValue: Number(feeFormData[item]), // 变更后值
          documentId: feeFormData.id,
          fieldGroup: 'T_PROJ_BUDGET',
        });
      } else if (item === 'feeBudgetAmt') {
        param.push({
          id: genFakeId(-1),
          changeField: item, // 变更字段
          changeLabel: '预算总费用', // 变更标签
          viewGroup: 'PROJ_BASIC_BUDGET_CHANGE_VIEW', // 视图分组
          viewGroupName: '项目基本信息预算变更',
          changeFieldType, // 字段类型
          deltaValue, // 变更值
          beforeValue: copyFeeFormData[item], // 变更前值
          afterValue: feeFormData[item], // 变更后值
          documentId: feeFormData.id,
          fieldGroup: 'T_PROJ_BUDGET',
        });
      }
    });
    dispatch({
      type: `${DOMAIN}/updateView`,
      payload: [...param, ...changelists],
    });
    this.setState({
      changeDetailsVisible: !changeDetailsVisible,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      projectBudgetCreate: {
        feeDataSource,
        feeFormData,
        projectshDataSource,
        projectView,
        businessChangeDetailEntities,
      },
      form: { getFieldDecorator, validateFieldsAndScroll },
    } = this.props;
    const { changeDetailsVisible } = this.state;
    const disabledBtn =
      loading.effects[`${DOMAIN}/query`] ||
      loading.effects[`${DOMAIN}/save`] ||
      loading.effects[`${DOMAIN}/submit`];
    const treeLoading = loading.effects[`${DOMAIN}/query`];
    //  || loading.effects[`${DOMAIN}/initBudget`];

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
              {/* <Button
                className="tw-btn-primary"
                icon="save"
                size="large"
                disabled={disabledBtn}
                onClick={this.handleSave}
              >
                {formatMessage({ id: `misc.save`, desc: '保存' })}
              </Button> */}

              <Button
                className="tw-btn-primary"
                icon="check-square"
                size="large"
                disabled={disabledBtn}
                onClick={() => {
                  validateFieldsAndScroll((error, values) => {
                    if (!error) {
                      this.changeDetailsToggleModal();
                    }
                  });
                }}
              >
                {formatMessage({ id: `misc.submit`, desc: '提交' })}
              </Button>

              {/* <Button
                className="tw-btn-primary"
                size="large"
                disabled={disabledBtn}
                onClick={() => this.initBudget()}
              >
                初始化预算
              </Button> */}
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
                  <Input
                    placeholder="请输入预算名称"
                    // onChange={e => {
                    //   this.onChangeName(
                    //     e.target.value,
                    //     'budgetName',
                    //     feeFormData.budgetName,
                    //     feeFormData.id
                    //   );
                    // }}
                  />
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
                    disabled
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
                      // onChange={e => {
                      //   this.onChangeName(
                      //     e,
                      //     'eqvaBudgetCnt',
                      //     feeFormData.eqvaBudgetCnt,
                      //     feeFormData.id
                      //   );
                      // }}
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
        {changeDetailsVisible ? (
          <ChangeDetailModal
            changeDetailsVisible={changeDetailsVisible}
            changeDetailsToggleModal={this.changeDetailsToggleModal}
            onCheck={this.handleSubmit}
            businessChangeDetailEntities={businessChangeDetailEntities}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default projectBudgetCreate;
