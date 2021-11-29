import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Button, Card, Form, Input, Table, Divider } from 'antd';
import { isNil, isEmpty } from 'ramda';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
// import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import ReactiveWrapper from '@/components/layout/ReactiveWrapper';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { add } from '@/utils/mathUtils';

const { Field, FieldLine } = FieldList;
const { Description } = DescriptionList;

const DOMAIN = 'ticketMgmtDetails'; //

const accColumns = [
  { title: '账户', dataIndex: 'accountNo', span: 10 },
  { title: '银行', dataIndex: 'bankName', span: 7 },
  { title: '网点', dataIndex: 'bankBranch', span: 7 },
];

const columnsData = [
  {
    title: '报销人',
    key: 'reimName',
    dataIndex: 'reimName',
  },
  {
    title: '费用类型',
    dataIndex: 'ticketExpTypeDesc',
    key: 'ticketExpTypeDesc',
  },
  {
    title: '差旅费用类型',
    dataIndex: 'feeTypeDesc',
    key: 'feeTypeDesc',
  },
  {
    title: '日期',
    dataIndex: 'feeDate',
    key: 'feeDate',
  },
  {
    title: '时间',
    key: 'dtime',
    dataIndex: 'dtime',
  },
  {
    title: '地点（从）',
    key: 'fromPlaceDesc',
    dataIndex: 'fromPlaceDesc',
  },
  {
    title: '地点（至）',
    key: 'toPlaceDesc',
    dataIndex: 'toPlaceDesc',
  },
  {
    title: '报销金额（含税）',
    key: 'taxedReimAmt',
    dataIndex: 'taxedReimAmt',
  },
  {
    title: '航班/车次',
    key: 'reimDesc',
    dataIndex: 'reimDesc',
  },
  {
    title: '税率',
    key: 'taxRate',
    dataIndex: 'taxRate',
    render: value => `${value}%`,
  },
  {
    title: '税额',
    key: 'taxAmt',
    dataIndex: 'taxAmt',
  },
];

@connect(({ loading, dispatch, ticketMgmtDetails }) => ({
  loading,
  dispatch,
  ticketMgmtDetails,
}))
@Form.create()
@mountToTab()
class TicketMgmtDetails extends React.Component {
  componentDidMount() {
    const param = fromQs().idList;
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getDetails`,
      payload: param,
    });
  }

  handleSave = formData => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
          payload: formData,
        });
      }
    });
  };

  render() {
    const {
      dispatch,
      loading,
      ticketMgmtDetails: { formData, detail, tableData },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;
    // calc money
    const allMoney = tableData
      .map(({ reimAmt }) => reimAmt)
      .reduce((prev, curr) => add(prev, curr || 0), 0);

    const preparing = loading.effects[`${DOMAIN}/getDetails`];
    const submitting = loading.effects[`${DOMAIN}/submit`];

    return (
      <PageHeaderWrapper title="行政订票报销详情">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={preparing || submitting || isEmpty(tableData)}
            onClick={() => this.handleSave(formData)}
          >
            {formatMessage({ id: `misc.mergeApply`, desc: '提交报销' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/plat/adminMgmt/TicketMgmt')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend={formatMessage({
              id: `plat.recv.field.ticketMngtInfo`,
              desc: '行政订票报销基本信息',
            })}
          >
            <Field name="batchNo" label="报销单批次号">
              <Input disabled placeholder="系统生成" />
            </Field>
            <FieldLine label="报销类型">
              <Field
                name="reimType1Desc"
                decorator={{
                  initialValue: detail.reimType1Desc,
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Input disabled />
              </Field>
              <Field
                name="reimType2Desc"
                decorator={{
                  initialValue: detail.reimType2Desc,
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input disabled />
              </Field>
            </FieldLine>
            <Field
              name="ticketPurchasingChannelDesc"
              label="购买渠道"
              decorator={{
                initialValue: detail.ticketPurchasingChannelDesc,
              }}
            >
              <Input disabled placeholder="系统生成" />
            </Field>
            <Field
              name="payMethod"
              label="支付方式"
              decorator={{
                initialValue: formData.payMethod || detail.payMethod,
                rules: [
                  {
                    required: true,
                    message: '请选择支付方式',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="ACC:PAY_METHOD"
                placeholder="请选择支付方式"
                disabled={!isNil(getFieldValue('feeApplyId'))}
                onChange={value => {
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: { payMethod: value },
                  });
                }}
              />
            </Field>
            <Field
              name="allMoney"
              label="报销总金额"
              decorator={{
                initialValue: allMoney,
              }}
            >
              <Input disabled placeholder="系统生成" />
            </Field>
            <Field
              name="applyDate"
              label="报销申请日期"
              decorator={{
                initialValue: detail.applyDate,
              }}
            >
              <Input disabled placeholder="系统生成" />
            </Field>
            <Field
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              name="remark"
              label="报销说明"
              decorator={{
                initialValue: formData.remark || detail.remark,
                rules: [{ max: 400, message: '不能超过400字' }],
              }}
            >
              <Input.TextArea
                onChange={value => {
                  const remark = value.target.value;
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: { remark: isNil(remark) ? undefined : remark },
                  });
                }}
                autosize={{ minRows: 2, maxRows: 5 }}
                className="x-fill-100"
              />
            </Field>
          </FieldList>
        </Card>

        <Card
          className="tw-card-adjust"
          title={formatMessage({
            id: `plat.recv.field.ticketMngtBill`,
            desc: '行政订票报销基本信息',
          })}
          bordered={false}
          style={{ marginTop: '4px' }}
          loading={loading.effects[`${DOMAIN}/getDetails`]}
        >
          {tableData.map((item, index) => {
            const tableProps = {
              rowKey: record => JSON.stringify(record),
              dataSource: item.reimdList,
              total: false,
              pagination: false,
              columns: columnsData,
            };
            return (
              <React.Fragment key={JSON.stringify(item)}>
                <DescriptionList title={`${item.busiApplyNo} - ${item.busiApplyName}`}>
                  <Description term="报销单号">{item.reimNo}</Description>
                  <Description style={{ visibility: 'hidden' }} term="占位">
                    占位
                  </Description>
                  <Description term="是事由类型/事由号">
                    {item.reasonTypeDesc} / {item.reasonCode} - {item.reasonName}
                  </Description>
                  <Description term="费用承担BU">{item.expenseBuName}</Description>
                  <Description term="费用承担公司">{item.expenseOuName}</Description>
                  <Description term="费用码">{item.feeCodeDesc}</Description>
                </DescriptionList>
                <p />
                <ReactiveWrapper>
                  <Table bordered {...tableProps} />
                  {index !== tableData.length - 1 && <Divider dashed />}
                </ReactiveWrapper>
              </React.Fragment>
            );
          })}
        </Card>

        <Card className="tw-card-adjust" bordered={false} style={{ marginTop: '4px' }}>
          <FieldList
            getFieldDecorator={getFieldDecorator}
            legend={formatMessage({
              id: `plat.recv.field.ticketMngtAccountDertails`,
              desc: '账户明细',
            })}
          >
            <Field
              name="abAccId"
              label="收款账户"
              decorator={{
                initialValue: formData.abAccId,
                rules: [
                  {
                    required: true,
                    message: '请选择收款账户',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={detail.accountList}
                columns={accColumns}
                transfer={{ key: 'id', code: 'id', name: 'accountNo' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 540 }}
                showSearch
                onColumnsChange={value => {
                  let updateForm = {};
                  if (isNil(value)) {
                    updateForm = {
                      bankName: undefined,
                      holderName: undefined,
                    };
                  } else {
                    updateForm = {
                      bankName: value.bankName,
                      holderName: value.holderName,
                    };
                  }
                  setFieldsValue(updateForm);
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: { abAccId: isNil(value) ? undefined : value.id },
                  });
                }}
              />
            </Field>
            <Field
              name="bankName"
              label="收款银行"
              decorator={{
                initialValue: formData.bankName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="holderName"
              label="户名"
              decorator={{
                initialValue: formData.holderName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="bankBranch"
              label="收银网点名称"
              decorator={{
                initialValue: formData.bankBranch,
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TicketMgmtDetails;
