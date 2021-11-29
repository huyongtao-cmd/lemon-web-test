import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Card, Button, Radio, InputNumber, Input, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import Link from 'umi/link';
import classnames from 'classnames';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import { Selection, UdcSelect } from '@/pages/gen/field';
import { isEmpty } from 'ramda';
import { selectBu } from '@/services/user/Contract/sales';
import { div, mul, genFakeId } from '@/utils/mathUtils';

const { Description } = DescriptionList;
const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'userContractEditDetails';
@connect(({ loading, dispatch, userContractEditDetails }) => ({
  loading,
  dispatch,
  userContractEditDetails,
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
class EditDetail extends PureComponent {
  componentDidMount() {
    // 初始得到主合同id给formData赋值
    const { dispatch } = this.props;
    const { contractId } = fromQs();
    dispatch({
      type: `${DOMAIN}/querySub`,
      payload: contractId,
    });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: {
        pageNo: 'SALE_CONTRACT_PROFIT_MODIFY',
      },
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { contractId, profitRuleId } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            sourceId: contractId,
            sourceType: 'CONTRACT',
            profitRuleId,
          },
        });
      }
    });
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator },
      userContractEditDetails: { formData, ruleList, pageConfig },
    } = this.props;
    const { profitdistResults } = formData;
    // eslint-disable-next-line
    profitdistResults && profitdistResults.map(v => (v.id = genFakeId()));
    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 3) {
      return <div />;
    }
    const [
      { pageFieldViews: baseView = {} },
      { pageFieldViews: ruleView = {} },
      { pageFieldViews: resultView = {} },
    ] = pageBlockViews;
    const baseJson = {};
    const ruleJson = {};
    const resultJson = {};
    baseView.forEach(field => {
      baseJson[field.fieldKey] = field;
    });
    ruleView.forEach(field => {
      ruleJson[field.fieldKey] = field;
    });
    resultView.forEach(field => {
      resultJson[field.fieldKey] = field;
    });

    const submitBtn = loading.effects[`${DOMAIN}/querySub`] || loading.effects[`${DOMAIN}/submit`];

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      loading: false,
      showSearch: false,
      enableSelection: false,
      showColumn: false,
      showExport: false,
      scroll: { x: 1500 },
      columns: [
        {
          title: '分配规则码',
          key: 'ruleNo',
          dataIndex: 'ruleNo',
          align: 'center',
          width: 100,
        },
        {
          title: '利益分配角色',
          key: 'groupRole',
          dataIndex: 'groupRole',
          align: 'center',
          width: 150,
          required: true,
          render: (value, row, index) => (
            <Selection.UDC
              code="ACC:PROFIT_ROLE"
              placeholder="请选择利益分配角色"
              disabled
              allowClear={false}
              value={value}
            />
          ),
        },
        {
          title: '利益分配比例',
          key: 'groupPercent',
          dataIndex: 'groupPercent',
          align: 'center',
          width: 100,
          required: true,
          render: (value, row, index) => (
            <InputNumber
              max={100}
              min={0}
              formatter={v => `${v}%`}
              parser={v => v.replace('%', '')}
              className="x-fill-100"
              disabled
              value={value}
            />
          ),
        },
        {
          title: '基于',
          key: 'groupBaseType',
          dataIndex: 'groupBaseTypeDesc',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <Selection.UDC code="ACC:PROFIT_SHARE_BASE" value={value} disabled />
          ),
        },
        {
          title: '行来源类型',
          key: 'lineSource',
          dataIndex: 'lineSource',
          hidden: true,
          align: 'center',
          width: 150,
          render: value => <Selection.UDC disabled code="ACC:LINE_SOURCE" value={value} />,
        },
        {
          title: '收益 BU/资源',
          key: 'gainerBuId',
          dataIndex: 'gainerBuId',
          align: 'center',
          width: 200,
          required: true,
          render: (value, row, index) => (
            <Selection value={value} disabled source={() => selectBu()} />
          ),
        },
        {
          title: '收益占比',
          key: 'gainerIngroupPercent',
          dataIndex: 'gainerIngroupPercent',
          align: 'center',
          width: 100,
          required: true,
          render: (value, row, index) => (
            <InputNumber
              min={0}
              max={row.maxGainerIngroupPercent}
              formatter={v => `${v}%`}
              parser={v => v.replace('%', '')}
              className="x-fill-100"
              disabled
              value={value}
            />
          ),
        },
        {
          title: '实际利益分配比例',
          key: 'gainerInallPercent',
          dataIndex: 'allocationProportion',
          align: 'center',
          width: 150,
          render: (value, allValues) =>
            `${value ||
              div(mul(allValues.groupPercent, allValues.gainerIngroupPercent || 0), 100)}%`,
        },
        {
          title: '预计分配额',
          key: 'expectDistAmt',
          dataIndex: 'expectDistAmt',
          align: 'center',
          width: 80,
        },
        {
          title: '利益来源方',
          key: 'busifieldType',
          dataIndex: 'busifieldType',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <UdcSelect code="COM:BUSIFIELD_TYPE" value={value} disabled />
          ),
        },
        {
          title: '状态',
          key: 'agreeStatus',
          dataIndex: 'agreeStatusDesc',
          align: 'center',
          width: 100,
        },
        {
          title: '备注',
          key: 'remark',
          dataIndex: 'remark',
          align: 'left',
          width: 200,
          render: (value, row, index) => <Input className="x-fill-100" value={value} disabled />,
        },
      ]
        .filter(col => ruleJson[col.key].visibleFlag === 1)
        .map(col => ({
          ...col,
          title: ruleJson[col.key].displayName,
          sortNo: ruleJson[col.key].sortNo,
        }))
        .sort((c1, c2) => c1.sortNo - c2.sortNo),
    };

    const alreadyAllotTableProps = {
      rowKey: 'id',
      sortBy: 'id',
      loading: false,
      size: 'small',
      showSearch: false,
      enableSelection: false,
      showColumn: false,
      showExport: false,
      columns: [
        {
          title: '利益分配角色',
          key: 'groupRole',
          dataIndex: 'groupRoleDesc',
          align: 'left',
        },
        {
          title: '收益BU',
          key: 'gainerBuId',
          dataIndex: 'gainerBuName',
          align: 'left',
        },
        {
          title: '收益分得金额',
          key: 'receivedGainAmt',
          dataIndex: 'receivedGainAmt',
          align: 'right',
        },
        {
          title: '确认收入分得金额',
          key: 'confirmedGainAmt',
          dataIndex: 'confirmedGainAmt',
          align: 'right',
        },
        {
          title: '查看详情',
          key: 'lineSource',
          dataIndex: 'lineSource',
          hidden: true,
          align: 'center',
          render: (value, row, index) => {
            const { contractId } = fromQs();
            const { groupRole, gainerBuId } = row;
            return (
              <Link
                className="tw-link"
                to={`/plat/distInfoMgmt?contractId=${contractId}&groupRole=${groupRole}&gainerBuId=${gainerBuId}`}
              >
                查看详情
              </Link>
            );
          },
        },
      ]
        .filter(col => resultJson[col.key].visibleFlag === 1)
        .map(col => ({
          ...col,
          title: resultJson[col.key].displayName,
          sortNo: resultJson[col.key].sortNo,
        }))
        .sort((c1, c2) => c1.sortNo - c2.sortNo),
    };

    const baseInfo = [
      <Description key="contractName" term="子合同名称">
        {formData.contractName}
      </Description>,
      <Description key="contractNo" term="编号">
        {formData.contractNo}
      </Description>,
      <Description key="signBuId" term="签单BU">
        {formData.signBuName}
      </Description>,
      <Description key="salesmanResId" term="销售负责人">
        {formData.salesmanResName}
      </Description>,
      <Description key="deliBuId" term="交付BU">
        {formData.deliBuName}
      </Description>,
      <Description key="deliResId" term="交付负责人">
        {formData.deliResName}
      </Description>,
      <Description key="regionBuId" term="销售区域BU">
        {formData.regionBuName}
      </Description>,
      <Description key="signDate" term="签订日期">
        {formData.signDate}
      </Description>,
      <Description key="amtTaxRate" term="含税总金额/税率">
        {formData.amt} / {formData.taxRate}%
      </Description>,
      <Description key="unTaxAmt" term="不含税金额">
        {formData.unTaxAmt}
      </Description>,
      <Description key="purchasingSum" term="相关项目采购">
        {formData.purChaseAmt}
      </Description>,
      <Description key="extraAmt" term="其他应减费用">
        {formData.extraAmt}
      </Description>,
      <Description key="effectiveAmt" term="有效合同额">
        {formData.effectiveAmt}
      </Description>,
      <Description key="grossProfit" term="可分配毛利">
        {formData.grossProfit}
      </Description>,
    ]
      .filter(desc => baseJson[desc.key].visibleFlag === 1)
      .map(desc => ({
        ...desc,
        props: {
          ...desc.props,
          term: baseJson[desc.key].displayName,
        },
      }))
      .sort((d1, d2) => d1.sortNo - d2.sortNo);

    return (
      <PageHeaderWrapper title="销售子合同详情">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={submitBtn}
          >
            提交
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              router.goBack();
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card className="tw-card-multiTab" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="resetFlag"
              label={baseJson.resetFlag.displayName || '是否影响已分配数据'}
              decorator={{
                initialValue: Number(formData.resetFlag) || '',
                rules: [
                  {
                    required: true,
                    message: `请选择${baseJson.resetFlag.displayName || '是否影响已分配数据'}`,
                  },
                ],
              }}
            >
              <RadioGroup>
                <Radio value={1}>按修改后规则重新分配所有收入</Radio>
                <Radio value={0}>不影响历史数据，修改后规则仅适用于新的收入数据</Radio>
              </RadioGroup>
            </Field>
          </FieldList>
          <DescriptionList
            size="large"
            title={formatMessage({ id: `sys.system.basicInfo`, desc: '基本信息' })}
            col={2}
          >
            {baseInfo}
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="修改前规则" size="large">
            <DataTable {...tableProps} dataSource={formData.profitAgreeBef || []} />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="修改后规则" size="large">
            <DataTable {...tableProps} dataSource={ruleList} />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="已分配收入数据" size="large">
            <DataTable {...alreadyAllotTableProps} dataSource={formData.profitdistResults || []} />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default EditDetail;
