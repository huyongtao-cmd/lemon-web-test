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
  Checkbox,
  DatePicker,
  Row,
  Col,
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
import Loading from '@/components/core/DataLoading';
import { closeThenGoto } from '@/layouts/routerControl';
import DescriptionList from '@/components/layout/DescriptionList';
import { UdcSelect, FileManagerEnhance } from '@/pages/gen/field';

import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { Axis, Chart, Coord, Geom, Legend, Tooltip as ChartsToolTip } from 'bizcharts';
import { ChartCard } from '@/components/common/Charts';
import DataSet from '@antv/data-set';

const { Description } = DescriptionList;
const { Field, FieldLine } = FieldList;

const DOMAIN = 'userProjectBudgetFlow';

@connect(({ loading, userProjectBudgetFlow, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/submit`],
  userProjectBudgetFlow,
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
class ProjectBudgetFlow extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id: param.id },
    });

    param.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
  }

  render() {
    const {
      dispatch,
      loading,
      userProjectBudgetFlow: {
        feeDataSource,
        feeFormData,
        projectshDataSource,
        fieldsConfig,
        flowForm,
        budgetAppropriationEntity,
        useCondition,
      },
      form: { getFieldDecorator },
    } = this.props;

    // 获取url上的参数
    const param = fromQs();

    // 费用预算表格
    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: feeDataSource.length,
      dataSource: feeDataSource,
      defaultExpandAllRows: true,
      showCopy: false,
      showAdd: false,
      showDelete: false,
      showSearch: false,
      pagination: false,
      enableSelection: false,
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
          render: (value, row, index) => (value === 1 ? '是' : '否'),
        },
        {
          title: '预算总金额',
          dataIndex: 'budgetAmt',
          // required: true,
          align: 'right',
        },
        // {
        //   title: '已使用预算金额',
        //   dataIndex: 'usedAmt',
        //   align: 'right',
        // },

        {
          title: '备注',
          align: 'center',
          dataIndex: 'remark',
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

    const data = [
      {
        label: '数量',
        总预算: feeFormData.eqvaBudgetCnt,
        已拨付: feeFormData.eqvaReleasedQty,
        已派发: useCondition.eqvaDistedQty,
        已结算: useCondition.eqvaSettledQty,
      },
    ];
    const ds = new DataSet();
    const dv = ds.createView().source(data);
    dv.transform({
      type: 'fold',
      fields: ['总预算', '已拨付', '已派发', '已结算'],
      // 展开字段集
      key: 'type',
      // key字段
      value: 'value', // value字段
    });

    // 费用数据
    const feeData = [
      {
        label: '费用',
        总预算: feeFormData.feeBudgetAmt,
        已拨付: feeFormData.feeReleasedAmt,
        已使用: useCondition.feeUsedAmt,
      },
    ];
    const feeDs = new DataSet();
    const feeDv = feeDs.createView().source(feeData);
    feeDv.transform({
      type: 'fold',
      fields: ['总预算', '已拨付', '已使用'],
      // 展开字段集
      key: 'type',
      // key字段
      value: 'value', // value字段
    });

    return (
      <PageHeaderWrapper>
        {loading ? (
          <Loading />
        ) : (
          <>
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
                // 当前节点名字
                const { taskKey } = fieldsConfig;
                // 当前点击按钮key
                const { key } = operation;
                const payload = {
                  taskId: param.taskId,
                  remark: bpmForm.remark,
                };

                if (key === 'EDIT') {
                  router.push(
                    `/user/project/projectBudget?projId=${feeFormData.projId}&taskId=${
                      param.taskId
                    }`
                  );
                  return Promise.resolve(false);
                }

                if (key === 'APPROVED' && taskKey === 'ACC_A51_02_INCHARGE_APPROVE_b') {
                  dispatch({
                    type: `${DOMAIN}/submit`,
                    payload: {
                      projId: feeFormData.projId,
                      taskId: param.taskId,
                      procRemark: bpmForm.remark,
                    },
                  });
                  return Promise.resolve(false);
                }

                if (key === 'APPROVED') {
                  // promise 为true,默认走后续组件流程的方法
                  return Promise.resolve(true);
                }

                if (key === 'REJECTED') {
                  return Promise.resolve(true);
                }
                // promise 为false,后续组件方法不走,走自己的逻辑
                return Promise.resolve(false);
              }}
            >
              {/* <Card className="tw-card-rightLine"></Card> */}
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
                {fieldsConfig.taskKey === 'ACC_A51_02_INCHARGE_APPROVE_b' ? (
                  <FieldList
                    layout="horizontal"
                    legend="本次拨付申请信息"
                    getFieldDecorator={getFieldDecorator}
                    col={2}
                    noReactive
                  >
                    <Field
                      name="applyFeeAmt"
                      label="费用金额"
                      decorator={{
                        initialValue: budgetAppropriationEntity.applyFeeAmt,
                        rules: [{ required: true, message: '请输入费用金额' }],
                      }}
                    >
                      <InputNumber
                        className="x-fill-100"
                        placeholder="请输入费用金额"
                        maxLength={10}
                        disabled
                        onChange={e => {
                          budgetAppropriationEntity.applyFeeAmt = e;
                          budgetAppropriationEntity.applyAmt =
                            e + budgetAppropriationEntity.applyEqvaAmt;
                        }}
                      />
                    </Field>

                    <FieldLine label="当量数/金额" fieldCol={2} required>
                      <Field
                        name="applyEqva"
                        decorator={{
                          initialValue: budgetAppropriationEntity.applyEqva,
                          rules: [{ required: true, message: '请输入当量数' }],
                        }}
                        wrapperCol={{ span: 23, xxl: 23 }}
                      >
                        <InputNumber
                          className="x-fill-100"
                          placeholder="请输入当量数"
                          maxLength={10}
                          disabled
                        />
                      </Field>
                      <Field
                        name="applyEqvaAmt"
                        decorator={{
                          initialValue: budgetAppropriationEntity.applyEqvaAmt,
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
                      label="申请拨付金额"
                      decorator={{
                        initialValue: budgetAppropriationEntity.applyAmt,
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
                      name="remark"
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
                        disabled
                        placeholder="请输入备注"
                        autosize={{ minRows: 3, maxRows: 6 }}
                        onChange={e => {
                          budgetAppropriationEntity.remark = e.target.value;
                        }}
                      />
                    </Field>
                    {/* <Field
                      name="amt"
                      label="拨付金额"
                      decorator={{
                        initialValue: budgetAppropriationEntity.applyAmt,
                        rules: [{required: false, message: '请输入拨付金额'}],
                      }}
                    >
                      <InputNumber
                        className="x-fill-100"
                        placeholder="请输入拨付金额"
                        onChange={e => {
                          budgetAppropriationEntity.amt = e;
                        }}
                      />
                    </Field> */}
                  </FieldList>
                ) : (
                  <DescriptionList layout="horizontal" title="本次拨付申请信息" col={2}>
                    <Description term="申请拨付费用预算金额">
                      {budgetAppropriationEntity.applyFeeAmt}
                    </Description>
                    <Description term="申请拨付当量数/金额">
                      {`${budgetAppropriationEntity.applyEqva}/${
                        budgetAppropriationEntity.applyEqvaAmt
                      }`}
                    </Description>
                    <Description term="申请拨付金额">
                      {budgetAppropriationEntity.applyAmt}
                    </Description>
                    <Description term="备注">{budgetAppropriationEntity.remark}</Description>

                    {/* <Description term="拨付金额">{budgetAppropriationEntity.amt}</Description> */}
                  </DescriptionList>
                )}

                <DescriptionList title="项目预算情况" />
                <Row>
                  <Col span={12}>
                    <ChartCard loading={false} title="当量使用情况">
                      <Chart data={dv} height={300} forceFit>
                        <Legend />
                        <Coord transpose scale={[1, -1]} />
                        <Axis
                          name="label"
                          label={{
                            offset: 12,
                          }}
                        />
                        <Axis name="value" position="right" />
                        <ChartsToolTip />
                        <Geom
                          type="interval"
                          position="label*value"
                          color="type"
                          adjust={[
                            {
                              type: 'dodge',
                              marginRatio: 1 / 32,
                            },
                          ]}
                        />
                      </Chart>
                    </ChartCard>
                  </Col>

                  <Col span={12}>
                    <ChartCard loading={false} title="费用使用情况">
                      <Chart data={feeDv} height={300}>
                        <Legend />
                        <Coord transpose scale={[1, -1]} />
                        <Axis
                          name="label"
                          label={{
                            offset: 12,
                          }}
                        />
                        <Axis name="value" position="right" />
                        <ChartsToolTip />
                        <Geom
                          type="interval"
                          position="label*value"
                          color="type"
                          adjust={[
                            {
                              type: 'dodge',
                              marginRatio: 1 / 32,
                            },
                          ]}
                        />
                      </Chart>
                    </ChartCard>
                  </Col>
                </Row>

                <DescriptionList layout="horizontal" title="项目费用预算" col={2}>
                  <Description term="预算编号">{feeFormData.budgetNo}</Description>
                  <Description term="预算名称">{feeFormData.budgetName}</Description>
                  <Description term="费用预算总金额">{feeFormData.feeBudgetAmt}</Description>
                  <Description term="已拨付费用预算金额">{feeFormData.feeReleasedAmt}</Description>
                  <Description term="预算控制">
                    {feeFormData.totalsControlFlag === 1 ? '是' : '否'}
                  </Description>
                  <Description term="相关项目名称">{feeFormData.projName}</Description>
                  <Description term="预算状态">{feeFormData.budgetStatusDesc}</Description>
                  <Description term="附件">
                    <FileManagerEnhance
                      api="/api/op/v1/project/projectBudget/sfs/token"
                      dataKey={feeFormData.id}
                      listType="text"
                      disabled
                      preview
                    />
                  </Description>
                  <Description term="预算创建人">{feeFormData.createUserName}</Description>
                  <Description term="预算创建时间">{feeFormData.createTime}</Description>
                </DescriptionList>
                <Divider dashed />
                <DataTable {...editTableProps} />

                <Divider dashed />
                <DescriptionList layout="horizontal" legend="项目当量预算" col={2}>
                  <Description term="当量预算总数/金额">
                    {`${feeFormData.eqvaBudgetCnt || '无'}/${feeFormData.eqvaBudgetAmt || '无'}`}
                  </Description>
                  <Description term="已派发当量总数/金额">
                    {`${feeFormData.distributedEqva || '无'}/${feeFormData.distributedAmt || '无'}`}
                  </Description>
                  <Description term="已拨付当量数/金额">
                    {`${feeFormData.eqvaReleasedQty || '无'}/${feeFormData.eqvaReleasedAmt ||
                      '无'}`}
                  </Description>
                  <Description term="已结算当量数/金额">
                    {`${feeFormData.settledEqva || '无'}/${feeFormData.settledAmt || '无'}`}
                  </Description>
                </DescriptionList>
                <Divider dashed />
                <DataTable {...projectshTableProps} scroll={{ x: 3000 }} />
              </Card>
            </BpmWrapper>
          </>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default ProjectBudgetFlow;
