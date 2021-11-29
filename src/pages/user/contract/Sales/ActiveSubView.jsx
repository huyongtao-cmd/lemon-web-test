import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Button, Form, Card, Input, DatePicker, InputNumber, Table, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { selectContract, selectFinperiod, selectBuProduct } from '@/services/user/Contract/sales';
import moment from 'moment';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { FileManagerEnhance, Selection } from '@/pages/gen/field';
import { div, mul } from '@/utils/mathUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { selectUsersWithBu } from '@/services/gen/list';
import { isNil } from 'ramda';

const DOMAIN = 'activeSubContractView';
const { Field, FieldLine } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const subjCol = [
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, activeSubContractView, dispatch }) => ({
  loading,
  activeSubContractView,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      if (value instanceof Object && name !== 'signDate') {
        const key = name.split('Id')[0];
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [key + 'Id']: value.id, [key + 'Name']: value.name },
        });
      } else if (name === 'signDate') {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [name]: formatDT(value) },
        });
      } else {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [name]: value },
        });
      }
    }
  },
})
@mountToTab()
class ActiveSubView extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();

    taskId &&
      dispatch({
        type: `${DOMAIN}/fetchConfig`,
        payload: taskId,
      });

    id &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      }).then(res => {
        if (res.ok) {
          const { id: contractId } = res.datum;
          dispatch({
            type: `${DOMAIN}/procurDemandDetail`,
            payload: { contractId },
          });
        }
      });
  }

  render() {
    const {
      loading,
      dispatch,
      activeSubContractView: {
        formData,
        ruleList = [],
        salesRegionBuDataSource = [],
        fieldsConfig,
        flowForm,
        procurDemandDViews,
        subContractId,
      },
      form: { getFieldDecorator },
    } = this.props;
    const readOnly = true;
    const { taskKey, buttons } = fieldsConfig;

    const disabledBtn =
      loading.effects[`${DOMAIN}/querySubContractDetail`] ||
      loading.effects[`${DOMAIN}/saveSubContractDetail`];
    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      dataSource: ruleList,
      loading: loading.effects[`${DOMAIN}/query`],
      size: 'small',
      // scroll: {
      //   x: '120%',
      // },

      columns: [
        {
          title: '分配规则码',
          dataIndex: 'ruleNo',
          align: 'center',
        },
        {
          title: '利益分配角色',
          dataIndex: 'groupRoleDesc',
          align: 'center',
        },
        {
          title: '利益分配比例',
          dataIndex: 'groupPercent',
          align: 'center',
          render: value => `${value || 0}%`,
        },
        {
          title: '基于',
          dataIndex: 'groupBaseTypeDesc',
          align: 'center',
        },
        {
          title: '行来源类型',
          dataIndex: 'lineSourceDesc',
          align: 'center',
        },
        {
          title: '收益 BU/资源',
          dataIndex: 'gainerBuName',
          align: 'center',
        },
        {
          title: '收益占比',
          dataIndex: 'gainerIngroupPercent',
          align: 'center',
          width: 80,
          // required: true,
          render: value => `${value || 0}%`,
        },
        {
          title: '实际利益分配比例',
          dataIndex: 'allocationProportion',
          align: 'center',
          render: (value, allValues) =>
            `${value ||
              div(mul(allValues.groupPercent, allValues.gainerIngroupPercent || 0), 100)}%`,
        },
        {
          title: '预计分配额',
          dataIndex: 'expectDistAmt',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'agreeStatusDesc',
          align: 'center',
        },
        {
          title: '利益来源方',
          dataIndex: 'busifieldTypeDesc',
          align: 'center',
          render: value => value,
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'left',
          render: (value, row, index) => <Input disabled className="x-fill-100" value={value} />,
        },
      ],
    };

    const procurDemandTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      scroll: { x: 2250 },
      showColumn: false,
      onRow: () => {},
      enableDoubleClick: false,
      showCopy: false,
      columns: [
        {
          title: '序号',
          key: 'sortNo',
          dataIndex: 'sortNo',
          align: 'center',
          width: 100,
        },
        {
          title: '建议供应商',
          key: 'supplierId',
          dataIndex: 'supplierIdName',
          align: 'center',
          width: 250,
        },
        {
          title: '需求说明',
          key: 'demandSaid',
          dataIndex: 'demandSaid',
          width: 250,
        },
        {
          title: '关联产品',
          key: 'buProdId',
          dataIndex: 'buProdName',
          align: 'center',
          width: 200,
        },
        {
          title: '采购大类',
          key: 'classId',
          dataIndex: 'className',
          align: 'center',
          width: 200,
        },
        {
          title: '采购小类',
          key: 'subClassId',
          dataIndex: 'subClassName',
          align: 'center',
          width: 200,
        },
        {
          title: '数量',
          key: 'demandNum',
          dataIndex: 'demandNum',
          align: 'center',
          width: 150,
        },
        {
          title: '含税单价',
          key: 'taxPrice',
          dataIndex: 'taxPrice',
          align: 'right',
          width: 200,
          render: val => !isNil(val) && val.toFixed(2),
        },
        {
          title: '货币',
          key: 'symbol',
          dataIndex: 'symbolName',
          align: 'center',
          width: 150,
        },
        {
          title: '税率',
          key: 'taxRate',
          dataIndex: 'taxRate',
          align: 'center',
          width: 150,
          render: val => `${val}%`,
        },
        {
          title: '含税总额(自动计算)',
          key: 'taxAmt',
          dataIndex: 'taxAmt',
          align: 'right',
          width: 200,
          render: val => !isNil(val) && val.toFixed(2),
        },
        {
          title: '不含税总额(自动计算)',
          key: 'taxNotamt',
          dataIndex: 'taxNotamt',
          align: 'right',
          width: 200,
          render: val => !isNil(val) && val.toFixed(2),
        },
        {
          title: '采购合同',
          key: 'contractNo',
          dataIndex: 'contractNo',
          align: 'center',
          width: 200,
        },
      ],
    };

    const { mode, taskId, id } = fromQs();

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          scope="ACC_A62"
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            // TODO passResultSubContract
            const { branch, remark } = bpmForm;
            const { key } = operation;
            const resultParams = {};
            const pass = {};
            if (taskId) {
              // 判断是否在第二个节点，用pass接口传输->新旧流程会签节点的审批
              if (taskKey === 'ACC_A62_02_ACTIVATION_b' || taskKey === 'ACC_A62_04_ACTIVATION_b') {
                // 第二个节点被通过
                if (key === 'FLOW_COMMIT') {
                  // 无效代码
                  resultParams.result = 'APPROVED';
                  dispatch({
                    type: `${DOMAIN}/submission`, // 普通的流程审批；没分支
                    payload: {
                      result: resultParams.result,
                      taskId,
                    },
                  });
                } else {
                  pass.taskId = taskId;
                  pass.key = key;
                  if (key === 'FLOW_PASS') {
                    resultParams.result = 'APPROVED';
                    pass.result = 'APPROVED';
                  }
                  // 第二个节点被退回
                  if (key === 'FLOW_RETURN') {
                    resultParams.result = 'REJECTED';
                    pass.result = 'REJECTED';
                  }
                  dispatch({
                    type: `${DOMAIN}/passResult`, // 会签 不需要branch+普通节点审批
                    payload: {
                      payload: {
                        taskId,
                        result: resultParams.result,
                        remark: bpmForm.remark,
                      },
                      view: {
                        ...formData,
                        kid: Number(id),
                        flow: pass,
                      },
                    },
                  });
                  return Promise.resolve(false);
                }
              } else {
                // 在第三个节点走新流程
                return Promise.resolve(true); // 第三个节点 配置中有分支，参数中就有分支，架构默认方法
              }
            }
            return Promise.resolve(true);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => closeThenGoto('/sale/contract/salesList')}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>

          <Card className="tw-card-adjust" bordered={false}>
            <FieldList
              layout="horizontal"
              legend="合同激活申请信息"
              getFieldDecorator={getFieldDecorator}
              col={2}
              // hasSeparator={1}
            >
              <Field
                name="contractNo"
                label="子合同编号"
                decorator={{
                  initialValue: formData.contractNo,
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} />
              </Field>

              <Field
                name="cname"
                label="子合同名称"
                decorator={{
                  initialValue: formData.cname,
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} />
              </Field>
              <Field
                name="signBuName"
                label="签单BU"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.signBuName,
                  rules: [
                    {
                      required: true,
                    },
                  ],
                }}
              >
                <Selection.Columns
                  disabled
                  source={salesRegionBuDataSource}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  showSearch
                />
              </Field>

              <Field
                name="salesmanResName"
                label="销售负责人"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.salesmanResName,
                  rules: [
                    {
                      required: true,
                    },
                  ],
                }}
              >
                <Selection.Columns
                  disabled={readOnly}
                  source={selectUsersWithBu}
                  columns={[
                    { dataIndex: 'code', title: '编号', span: 10 },
                    { dataIndex: 'name', title: '名称', span: 14 },
                  ]}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  showSearch
                />
              </Field>

              <Field
                name="deliBuName"
                label="交付BU"
                decorator={{
                  initialValue: formData.deliBuName,
                  rules: [
                    {
                      required: true,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Selection.Columns
                  disabled
                  source={salesRegionBuDataSource}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  showSearch
                />
              </Field>

              <Field
                name="deliResName"
                label="交付负责人"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.deliResName,
                  rules: [
                    {
                      required: true,
                    },
                  ],
                }}
              >
                <Selection.Columns
                  disabled={readOnly}
                  source={selectUsersWithBu}
                  columns={[
                    { dataIndex: 'code', title: '编号', span: 10 },
                    { dataIndex: 'name', title: '名称', span: 14 },
                  ]}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  showSearch
                />
              </Field>

              <Field
                name="regionBuName"
                label="销售区域BU"
                decorator={{
                  initialValue: formData.regionBuName,
                  rules: [
                    {
                      required: true,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Selection.Columns
                  disabled
                  source={salesRegionBuDataSource}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  showSearch
                />
              </Field>

              <Field
                name="signDate"
                label="签订日期"
                decorator={{
                  initialValue: formData.signDate ? moment(formData.signDate) : null,
                  rules: [
                    {
                      required: true,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <DatePicker disabled format="YYYY-MM-DD" className="x-fill-100" placeholder=" " />
              </Field>

              <Field
                name="startDate"
                label="合同开始日期"
                decorator={{
                  initialValue: formData.startDate ? moment(formData.startDate) : null,
                }}
                {...FieldListLayout}
                required
              >
                <DatePicker disabled format="YYYY-MM-DD" className="x-fill-100" placeholder=" " />
              </Field>

              <Field
                name="endDate"
                label="合同结束日期"
                decorator={{
                  initialValue: formData.endDate ? moment(formData.endDate) : null,
                  rules: [
                    {
                      required: true,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <DatePicker disabled format="YYYY-MM-DD" className="x-fill-100" placeholder=" " />
              </Field>

              <FieldLine label="含税总金额/税率" required {...FieldListLayout}>
                <Field
                  name="amt"
                  decorator={{
                    initialValue: formData.amt,
                    rules: [
                      {
                        required: true,
                      },
                    ],
                  }}
                  wrapperCol={{ span: 23, xxl: 23 }}
                >
                  <InputNumber disabled={readOnly} className="x-fill-100" />
                </Field>
                <Field
                  name="taxRate"
                  decorator={{
                    initialValue: formData.taxRate,
                  }}
                  wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
                >
                  <Input disabled={readOnly} type="number" addonAfter="%" />
                </Field>
              </FieldLine>

              <Field
                name="notRateAmt"
                label="不含税金额"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.notRateAmt,
                  rules: [
                    {
                      required: true,
                    },
                  ],
                }}
              >
                <Input disabled={readOnly} />
              </Field>

              <Field
                name="contractName"
                label="相关项目采购"
                decorator={{
                  initialValue: formData.contractName,
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} />
              </Field>

              <Field
                name="extraAmt"
                label="其它应减费用"
                decorator={{
                  initialValue: formData.extraAmt,
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} />
              </Field>

              <Field
                name="effectiveAmt"
                required
                label="有效合同额"
                decorator={{
                  initialValue: formData.effectiveAmt,
                  rules: [
                    {
                      required: true,
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} />
              </Field>

              <Field
                name="grossProfit"
                label="可分配毛利"
                decorator={{
                  initialValue: formData.grossProfit,
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} />
              </Field>
              <Field
                key="productId"
                name="productId"
                label="产品"
                decorator={{
                  initialValue: formData.productId || undefined,
                }}
                {...FieldListLayout}
              >
                <Selection
                  disabled
                  source={() => selectBuProduct()}
                  placeholder="请选择产品"
                  showSearch
                />
              </Field>
              <Field
                key="attache"
                name="attache"
                label="附件"
                decorator={{
                  initialValue: formData.attache,
                  // rules: [
                  //   {
                  //     required:attache.requiredFlag,
                  //     message:`请输入${attache.displayName}`,
                  //   },
                  // ],
                }}
                {...FieldListLayout}
              >
                <FileManagerEnhance
                  api="/api/op/v1/contract/sub/sfs/token"
                  dataKey={subContractId}
                  listType="text"
                  preview={taskKey === 'ACC_A62_01_ABILITY_SUBMIT_i' ? false : true}
                />
              </Field>
              <Field
                name="remark"
                label={formatMessage({ id: `sys.baseinfo.subjTemplate.remark`, desc: '备注' })}
                decorator={{
                  initialValue: formData.remark,
                }}
                fieldCol={1}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
              >
                <Input.TextArea disabled rows={3} />
              </Field>
            </FieldList>
            <Divider dashed />

            <FieldList
              layout="horizontal"
              legend="采购需求信息"
              getFieldDecorator={getFieldDecorator}
              col={2}
              // hasSeparator={1}
            >
              <Field
                name="demandNo"
                label="需求编号"
                decorator={{
                  initialValue: formData.demandNo,
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} />
              </Field>
              <Field
                name="demandTotalAmo"
                label="需求总金额"
                decorator={{
                  initialValue: formData.demandTotalAmo,
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} />
              </Field>
              <Field
                name="demandStatusName"
                label="需求状态"
                decorator={{
                  initialValue: formData.demandStatusName,
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} />
              </Field>
              <Field
                name="edemandResIdName"
                label="需求负责人"
                decorator={{
                  initialValue: formData.edemandResIdName,
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} />
              </Field>
              <Field
                name="demandData"
                label="需求日期"
                decorator={{
                  initialValue: formData.demandData,
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} />
              </Field>
              <Field
                name="demandTypeName"
                label="需求类别"
                decorator={{
                  initialValue: formData.demandTypeName,
                }}
                {...FieldListLayout}
              >
                <Input disabled={readOnly} />
              </Field>
              <Field
                name="demandRem"
                label="需求备注"
                fieldCol={1}
                labelCol={{ span: 4, xxl: 4 }}
                wrapperCol={{ span: 20, xxl: 20 }}
                decorator={{
                  initialValue: formData.demandRem,
                }}
                // {...FieldListLayout}
              >
                <Input.TextArea rows={3} disabled={readOnly} />
              </Field>
            </FieldList>

            {formData.demandType !== 'SERVICES_TRADE' &&
            formData.demandType !== 'PRODUCT_TRADE' ? null : (
              <>
                <Divider dashed />
                <FieldList
                  layout="horizontal"
                  legend="子合同收益分配规则"
                  getFieldDecorator={getFieldDecorator}
                  col={2}
                  noReactive
                >
                  <Table
                    bordered
                    rowKey="id"
                    sortBy="id"
                    dataSource={ruleList}
                    loading={loading.effects[`${DOMAIN}/query`]}
                    pagination={false}
                    scroll={{ x: 1370 }}
                    {...tableProps}
                  />
                </FieldList>

                <Divider dashed />
                <FieldList
                  layout="horizontal"
                  legend="采购需求明细"
                  getFieldDecorator={getFieldDecorator}
                  col={2}
                  noReactive
                >
                  <Table
                    bordered
                    rowKey="id"
                    sortBy="id"
                    dataSource={procurDemandDViews}
                    loading={loading.effects[`${DOMAIN}/procurDemandDetail`]}
                    pagination={false}
                    {...procurDemandTableProps}
                  />
                </FieldList>
              </>
            )}
          </Card>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default ActiveSubView;
