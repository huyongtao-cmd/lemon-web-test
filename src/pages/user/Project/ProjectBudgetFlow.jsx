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

    // ??????url????????????
    const param = fromQs();

    // ??????????????????
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
          title: '??????',
          dataIndex: 'accName',
          align: 'left',
        },
        // {
        //   title: '??????????????????',
        //   dataIndex: 'secondLevelName',
        // },
        // {
        //   title: '??????????????????',
        //   dataIndex: 'thirdLevelName',
        //   align: 'right',
        // },
        {
          title: '????????????',
          dataIndex: 'budgetControlFlag',
          // required: true,
          align: 'center',
          render: (value, row, index) => (value === 1 ? '???' : '???'),
        },
        {
          title: '???????????????',
          dataIndex: 'budgetAmt',
          // required: true,
          align: 'right',
        },
        // {
        //   title: '?????????????????????',
        //   dataIndex: 'usedAmt',
        //   align: 'right',
        // },

        {
          title: '??????',
          align: 'center',
          dataIndex: 'remark',
        },
      ],
      buttons: [],
    };

    // ????????????????????????
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
          title: '????????????',
          dataIndex: 'role',
        },
        {
          title: '????????????',
          dataIndex: 'capasetLevelName',
        },
        {
          title: '??????',
          dataIndex: 'resName',
        },
        {
          title: '??????????????????',
          dataIndex: 'planStartDate',
        },
        {
          title: '??????????????????',
          dataIndex: 'planEndDate',
        },
        {
          title: '???????????????',
          dataIndex: 'workbenchFlag',
          align: 'center',
          render: (value, row, index) => {
            if (value === 1) {
              return <div>???</div>;
            }
            if (value === 0) {
              return <div>???</div>;
            }
            return <div>{value}</div>;
          },
        },
        {
          title: '????????????',
          dataIndex: 'planEqva',
          align: 'right',
        },
        {
          title: '?????????',
          dataIndex: 'projNo',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'taskNo',
          align: 'center',
        },
        {
          title: '??????????????????',
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
          title: '????????????',
          dataIndex: 'cooperationType',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'acceptMethodName',
          align: 'center',
        },
        {
          title: '?????????',
          dataIndex: 'eqvaQty',
          align: 'right',
        },
        {
          title: '????????????',
          dataIndex: 'eqvaSalary',
          align: 'right',
        },
        {
          title: 'BU?????????',
          dataIndex: 'buSettlePrice',
          align: 'right',
        },
        {
          title: '?????????',
          dataIndex: 'ohfeePrice',
          align: 'right',
        },
        {
          title: '??????',
          dataIndex: 'taxRate',
          align: 'right',
        },
        {
          title: '??????????????????',
          dataIndex: 'settlePrice',
          align: 'right',
        },
        {
          title: '??????????????????',
          dataIndex: 'mandayPrice',
          align: 'right',
        },
        {
          title: '????????????',
          dataIndex: 'distributedAmt',
          align: 'right',
        },
        {
          title: '??????????????????',
          dataIndex: 'settledEqva',
          align: 'right',
        },
        {
          title: '???????????????',
          dataIndex: 'settledAmt',
          align: 'right',
        },
      ],
      leftButtons: [],
    };

    const data = [
      {
        label: '??????',
        ?????????: feeFormData.eqvaBudgetCnt,
        ?????????: feeFormData.eqvaReleasedQty,
        ?????????: useCondition.eqvaDistedQty,
        ?????????: useCondition.eqvaSettledQty,
      },
    ];
    const ds = new DataSet();
    const dv = ds.createView().source(data);
    dv.transform({
      type: 'fold',
      fields: ['?????????', '?????????', '?????????', '?????????'],
      // ???????????????
      key: 'type',
      // key??????
      value: 'value', // value??????
    });

    // ????????????
    const feeData = [
      {
        label: '??????',
        ?????????: feeFormData.feeBudgetAmt,
        ?????????: feeFormData.feeReleasedAmt,
        ?????????: useCondition.feeUsedAmt,
      },
    ];
    const feeDs = new DataSet();
    const feeDv = feeDs.createView().source(feeData);
    feeDv.transform({
      type: 'fold',
      fields: ['?????????', '?????????', '?????????'],
      // ???????????????
      key: 'type',
      // key??????
      value: 'value', // value??????
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
                // ??????????????????
                const { taskKey } = fieldsConfig;
                // ??????????????????key
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
                  // promise ???true,????????????????????????????????????
                  return Promise.resolve(true);
                }

                if (key === 'REJECTED') {
                  return Promise.resolve(true);
                }
                // promise ???false,????????????????????????,??????????????????
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
                    defaultMessage="????????????????????????"
                  />
                }
              >
                {fieldsConfig.taskKey === 'ACC_A51_02_INCHARGE_APPROVE_b' ? (
                  <FieldList
                    layout="horizontal"
                    legend="????????????????????????"
                    getFieldDecorator={getFieldDecorator}
                    col={2}
                    noReactive
                  >
                    <Field
                      name="applyFeeAmt"
                      label="????????????"
                      decorator={{
                        initialValue: budgetAppropriationEntity.applyFeeAmt,
                        rules: [{ required: true, message: '?????????????????????' }],
                      }}
                    >
                      <InputNumber
                        className="x-fill-100"
                        placeholder="?????????????????????"
                        maxLength={10}
                        disabled
                        onChange={e => {
                          budgetAppropriationEntity.applyFeeAmt = e;
                          budgetAppropriationEntity.applyAmt =
                            e + budgetAppropriationEntity.applyEqvaAmt;
                        }}
                      />
                    </Field>

                    <FieldLine label="?????????/??????" fieldCol={2} required>
                      <Field
                        name="applyEqva"
                        decorator={{
                          initialValue: budgetAppropriationEntity.applyEqva,
                          rules: [{ required: true, message: '??????????????????' }],
                        }}
                        wrapperCol={{ span: 23, xxl: 23 }}
                      >
                        <InputNumber
                          className="x-fill-100"
                          placeholder="??????????????????"
                          maxLength={10}
                          disabled
                        />
                      </Field>
                      <Field
                        name="applyEqvaAmt"
                        decorator={{
                          initialValue: budgetAppropriationEntity.applyEqvaAmt,
                          rules: [{ required: false, message: '?????????????????????' }],
                        }}
                        wrapperCol={{ span: 23, xxl: 23 }}
                      >
                        <InputNumber
                          className="x-fill-100"
                          disabled
                          placeholder="?????????????????????"
                          onChange={e => {
                            budgetAppropriationEntity.applyEqvaAmt = e;
                          }}
                        />
                      </Field>
                    </FieldLine>
                    <Field
                      name="applyAmt"
                      label="??????????????????"
                      decorator={{
                        initialValue: budgetAppropriationEntity.applyAmt,
                        rules: [{ required: false, message: '??????????????????' }],
                      }}
                    >
                      <InputNumber
                        className="x-fill-100"
                        disabled
                        placeholder="???????????????????????????"
                        onChange={e => {
                          budgetAppropriationEntity.applyAmt = e;
                        }}
                      />
                    </Field>
                    <Field
                      name="remark"
                      label="??????"
                      decorator={{
                        initialValue: budgetAppropriationEntity.remark,
                        rules: [{ required: false }, { max: 400, message: '?????????400??????' }],
                      }}
                      fieldCol={1}
                      labelCol={{ span: 4, xxl: 3 }}
                      wrapperCol={{ span: 19, xxl: 20 }}
                    >
                      <Input.TextArea
                        disabled
                        placeholder="???????????????"
                        autosize={{ minRows: 3, maxRows: 6 }}
                        onChange={e => {
                          budgetAppropriationEntity.remark = e.target.value;
                        }}
                      />
                    </Field>
                    {/* <Field
                      name="amt"
                      label="????????????"
                      decorator={{
                        initialValue: budgetAppropriationEntity.applyAmt,
                        rules: [{required: false, message: '?????????????????????'}],
                      }}
                    >
                      <InputNumber
                        className="x-fill-100"
                        placeholder="?????????????????????"
                        onChange={e => {
                          budgetAppropriationEntity.amt = e;
                        }}
                      />
                    </Field> */}
                  </FieldList>
                ) : (
                  <DescriptionList layout="horizontal" title="????????????????????????" col={2}>
                    <Description term="??????????????????????????????">
                      {budgetAppropriationEntity.applyFeeAmt}
                    </Description>
                    <Description term="?????????????????????/??????">
                      {`${budgetAppropriationEntity.applyEqva}/${
                        budgetAppropriationEntity.applyEqvaAmt
                      }`}
                    </Description>
                    <Description term="??????????????????">
                      {budgetAppropriationEntity.applyAmt}
                    </Description>
                    <Description term="??????">{budgetAppropriationEntity.remark}</Description>

                    {/* <Description term="????????????">{budgetAppropriationEntity.amt}</Description> */}
                  </DescriptionList>
                )}

                <DescriptionList title="??????????????????" />
                <Row>
                  <Col span={12}>
                    <ChartCard loading={false} title="??????????????????">
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
                    <ChartCard loading={false} title="??????????????????">
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

                <DescriptionList layout="horizontal" title="??????????????????" col={2}>
                  <Description term="????????????">{feeFormData.budgetNo}</Description>
                  <Description term="????????????">{feeFormData.budgetName}</Description>
                  <Description term="?????????????????????">{feeFormData.feeBudgetAmt}</Description>
                  <Description term="???????????????????????????">{feeFormData.feeReleasedAmt}</Description>
                  <Description term="????????????">
                    {feeFormData.totalsControlFlag === 1 ? '???' : '???'}
                  </Description>
                  <Description term="??????????????????">{feeFormData.projName}</Description>
                  <Description term="????????????">{feeFormData.budgetStatusDesc}</Description>
                  <Description term="??????">
                    <FileManagerEnhance
                      api="/api/op/v1/project/projectBudget/sfs/token"
                      dataKey={feeFormData.id}
                      listType="text"
                      disabled
                      preview
                    />
                  </Description>
                  <Description term="???????????????">{feeFormData.createUserName}</Description>
                  <Description term="??????????????????">{feeFormData.createTime}</Description>
                </DescriptionList>
                <Divider dashed />
                <DataTable {...editTableProps} />

                <Divider dashed />
                <DescriptionList layout="horizontal" legend="??????????????????" col={2}>
                  <Description term="??????????????????/??????">
                    {`${feeFormData.eqvaBudgetCnt || '???'}/${feeFormData.eqvaBudgetAmt || '???'}`}
                  </Description>
                  <Description term="?????????????????????/??????">
                    {`${feeFormData.distributedEqva || '???'}/${feeFormData.distributedAmt || '???'}`}
                  </Description>
                  <Description term="??????????????????/??????">
                    {`${feeFormData.eqvaReleasedQty || '???'}/${feeFormData.eqvaReleasedAmt ||
                      '???'}`}
                  </Description>
                  <Description term="??????????????????/??????">
                    {`${feeFormData.settledEqva || '???'}/${feeFormData.settledAmt || '???'}`}
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
