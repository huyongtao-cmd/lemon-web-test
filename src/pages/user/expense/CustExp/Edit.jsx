import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Form, Card, Input, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import update from 'immutability-helper';
import classnames from 'classnames';
import { isEmpty } from 'ramda';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import EditableDataTable from '@/components/common/EditableDataTable';
import Link from 'umi/link';

import { Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { selectUsersWithBu } from '@/services/gen/list';
import { selectCustomer } from '@/services/user/Contract/sales';

const DOMAIN = 'custExpEdit';
const { Field, FieldLine } = FieldList;
const SEL_COL = [
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, custExpEdit, user, dispatch }) => ({
  loading,
  custExpEdit,
  user,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: changedValues,
    });
  },
})
@mountToTab()
class CustExpEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { ids, id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ids, id },
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      custExpEdit: { formData, dataList },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { formData, dataList },
        });
      }
    });
  };

  handleTaxRate = value => {
    const {
      dispatch,
      custExpEdit: { formData },
      form: { setFieldsValue },
    } = this.props;

    const taxRate = +value || 0;
    const taxedApplyAmt = ((+formData.applyAmt || 0) * (100 + taxRate)) / 100;

    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        taxedApplyAmt,
      },
    });
    setFieldsValue({
      taxedApplyAmt,
    });
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      custExpEdit: { formData, dataList },
      form: { setFieldsValue },
    } = this.props;

    if (rowField === 'applyAmt') {
      const taxRate = +formData.taxRate || 0;
      let applyAmt = 0;
      dataList.forEach((v, i) => {
        const num = rowIndex === i ? rowFieldValue : v.applyAmt || 0;
        applyAmt += +num;
      });
      const taxedApplyAmt = (applyAmt * (100 + taxRate)) / 100;
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          applyAmt,
          taxedApplyAmt,
        },
      });
      setFieldsValue({
        applyAmt,
        taxedApplyAmt,
      });
    }

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList: update(dataList, {
          [rowIndex]: {
            [rowField]: {
              $set:
                rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
            },
          },
        }),
      },
    });
  };

  render() {
    const {
      dispatch,
      custExpEdit: { formData, dataList, accountSource },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      pagination: false,
      dataSource: dataList,
      showAdd: false,
      showCopy: false,
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: dataList.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            ),
          },
        });
      },
      scroll: {
        x: 1500,
      },
      columns: [
        {
          title: '报销人',
          dataIndex: 'reimResName',
          // options: {
          //   initialValue: reimResName,
          // },
          // render: (value, row, index) => (
          //   <Selection.Columns
          //     source={selectUsersWithBu}
          //     value={value}
          //     transfer={{ key: 'id', code: 'id', name: 'name' }}
          //     placeholder="请选择资源"
          //     showSearch
          //     columns={[
          //       { dataIndex: 'code', title: '编号', span: 12 },
          //       { dataIndex: 'name', title: '名称', span: 12 },
          //     ]}
          //     onChange={this.onCellChanged(index, 'reimResId')}
          //   />
          // ),
        },
        {
          title: '费用发生日期',
          dataIndex: 'feeDate',
        },
        {
          title: '科目',
          dataIndex: 'accName',
        },
        // {
        //   title: '收款状态',
        //   dataIndex: 'recvStatusName',
        // },
        // {
        //   title: '请款状态',
        //   dataIndex: 'expapplyStatusName',
        // },
        {
          title: '报销说明',
          dataIndex: 'reimDesc',
          render: (value, row, index) => (
            <Input value={value} onChange={this.onCellChanged(index, 'reimDesc')} />
          ),
        },
        {
          title: '请款金额(不含税)',
          dataIndex: 'applyAmt',
          align: 'center',
          render: (value, row, index) => (
            <InputNumber value={value} onChange={this.onCellChanged(index, 'applyAmt')} />
          ),
        },
        {
          title: '货币码',
          dataIndex: 'currCodeName',
          align: 'center',
        },
        {
          title: '员工报销金额(含税)',
          dataIndex: 'taxedReimAmt',
          align: 'center',
        },
        {
          title: '员工报销金额(不含税)',
          dataIndex: 'reimAmt',
          align: 'center',
        },
        {
          title: '增值税税率',
          dataIndex: 'taxRate',
          align: 'center',
        },
        {
          title: '税额',
          dataIndex: 'taxAmt',
          align: 'center',
        },
      ],
      buttons: [],
    };

    // console.warn(formData);

    return (
      <PageHeaderWrapper title="客户承担费用维护">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/user/project/custExp')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="请款单基本信息" />}
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            <Field presentational label="请款单号">
              <Input disabled placeholder="系统生成" />
            </Field>

            <Field presentational label="申请日期">
              <Input placeholder="系统生成" disabled />
            </Field>

            <Field
              name="custexpApplyStatus"
              label="请款单状态"
              decorator={{
                initialValue: formData.custexpApplyStatus,
              }}
            >
              <Selection.UDC code="ACC:EXP_APPLY_STATUS" placeholder="请款单状态" disabled />
            </Field>

            <Field
              name="apprStatus"
              label="审批状态"
              decorator={{
                initialValue: formData.apprStatus,
              }}
            >
              <Selection.UDC code="COM:APPR_STATUS" placeholder="请选择审批状态" disabled />
            </Field>

            {/* <Field
              name="clearStatus"
              label="核销状态"
              decorator={{
                initialValue: formData.clearStatus,
              }}
            >
              <Selection.UDC code="ACC:CLEAR_STATUS" placeholder="请选择核销状态" disabled />
            </Field> */}

            <Field
              label="客户"
              name="custId"
              decorator={{
                initialValue: formData.custId,
                rules: [
                  {
                    required: true,
                    message: '请选择客户',
                  },
                ],
              }}
            >
              <Selection.Columns
                transfer={{ code: 'id', name: 'name' }}
                source={selectCustomer}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 400 }}
                placeholder="请选择客户"
                columns={SEL_COL}
                showSearch
                allowClear
              />
            </Field>

            <FieldLine label="申请人" required>
              <Field
                name="applyResId"
                decorator={{
                  initialValue: formData.applyResId,
                  rules: [{ required: true, message: '请选择申请人' }],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Selection.Columns
                  transfer={{ code: 'id', name: 'name' }}
                  source={selectUsersWithBu}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 300 }}
                  placeholder="请选择申请人"
                  columns={SEL_COL}
                  showSearch
                  allowClear
                  onColumnsChange={value => {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        applyJobGrade: value.jobGrade,
                        // abAccId: null,
                        // bankName: null,
                        // accName: null,
                        // bankBranch: null,
                      },
                    });
                    // setFieldsValue({
                    //   abAccId: null,
                    //   bankName: null,
                    //   accName: null,
                    //   bankBranch: null,
                    // });
                    // dispatch({
                    //   type: `${DOMAIN}/queryAccount`,
                    //   payload: value.id,
                    // });
                  }}
                />
              </Field>
              <Field
                name="applyJobGrade"
                decorator={{
                  initialValue: formData.applyJobGrade,
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input placeholder="职级" disabled />
              </Field>
            </FieldLine>

            <Field
              name="reasonType"
              label="事由类型/事由号"
              decorator={{
                initialValue: `${formData.reasonTypeName}  ${formData.reasonName}`,
              }}
            >
              <Input disabled />
            </Field>

            <Field
              name="expenseBuId"
              label="费用承担BU"
              decorator={{
                initialValue: formData.expenseBuName,
              }}
            >
              <Input disabled />
            </Field>

            <Field
              name="expenseOuId"
              label="费用承担公司"
              decorator={{
                initialValue: formData.expenseOuName,
              }}
            >
              <Input disabled />
            </Field>

            <Field
              name="applyAmt"
              label="请款总金额(不含税)"
              decorator={{
                initialValue: formData.applyAmt,
              }}
            >
              <InputNumber className="x-fill-100" placeholder="请输入请款总金额(不含税)" />
            </Field>

            <Field
              name="currCode"
              label="币种"
              decorator={{
                initialValue: formData.currCode,
              }}
            >
              <Selection.UDC code="COM:CURRENCY_KIND" placeholder="请选择币种" disabled />
            </Field>

            <Field
              name="taxedApplyAmt"
              label="请款总金额(含税)"
              decorator={{
                initialValue: formData.taxedApplyAmt,
              }}
            >
              <InputNumber className="x-fill-100" placeholder="请输入请款总金额(含税)" />
            </Field>

            <Field
              name="taxRate"
              label="税率"
              decorator={{
                initialValue: formData.taxRate,
                rules: [{ required: true, message: '请选择税率' }],
              }}
            >
              <Selection.UDC
                code="COM:TAX_RATE"
                placeholder="请选择税率"
                onChange={this.handleTaxRate}
              />
            </Field>

            <Field
              presentational
              label="相关报销单"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              {dataList &&
                dataList.map(v => {
                  let type;
                  switch (v.reimType2) {
                    // 差旅报销
                    case 'TRIP': {
                      type = 'trip';
                      break;
                    }
                    // 行政订票报销
                    case 'TICKET': {
                      type = 'trip';
                      break;
                    }
                    // 专项费用报销
                    case 'SPEC': {
                      type = 'spec';
                      break;
                    }
                    // 特殊费用报销 -因公报销
                    case 'BSPECIAL': {
                      type = 'particular';
                      break;
                    }
                    // 特殊费用报销 -个人报销
                    case 'PSPECIAL': {
                      type = 'particular';
                      break;
                    }
                    // 非差旅报销
                    default: {
                      type = 'normal';
                      break;
                    }
                  }
                  return (
                    <div>
                      <Link
                        className="tw-link"
                        to={`/plat/expense/${type}/view?id=${v.reimId}`}
                        key={v.id}
                      >
                        {v.reimNo}
                      </Link>
                    </div>
                  );
                })}
            </Field>
          </FieldList>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="请款单明细" />}
          style={{ marginTop: 6 }}
        >
          <EditableDataTable {...tableProps} />
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="请款账户信息" />}
          style={{ marginTop: 6 }}
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            <Field
              name="abAccId"
              label={formatMessage({
                id: `ui.menu.user.expense.form.abAccId`,
                desc: '收款账户',
              })}
              decorator={{
                initialValue: formData.abAccId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择收款账户',
                  },
                ],
              }}
            >
              <Selection.Columns
                transfer={{ key: 'abAccId', code: 'abAccId', name: 'accountNo' }}
                placeholder="请选择收款账户"
                source={accountSource}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                columns={[
                  { title: '账户', dataIndex: 'accountNo', span: 12 },
                  { title: '银行', dataIndex: 'bankName', span: 6 },
                  { title: '网点', dataIndex: 'bankBranch', span: 6 },
                ]}
                showSearch
                allowClear
                onColumnsChange={value => {
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      bankName: value.bankName,
                      accName: value.accName,
                      bankBranch: value.bankBranch,
                      accountNo: value.accountNo,
                    },
                  });
                  setFieldsValue({
                    bankName: value.bankName,
                    accName: value.accName,
                    bankBranch: value.bankBranch,
                    accountNo: value.accountNo,
                  });
                }}
              />
            </Field>
            <Field
              name="bankName"
              label={formatMessage({
                id: `ui.menu.user.expense.form.bankName`,
                desc: '收款银行',
              })}
              decorator={{
                initialValue: formData.bankName,
              }}
            >
              <Input disabled placeholder="请选择收款银行" />
            </Field>
            <Field
              name="accName"
              label={formatMessage({
                id: `ui.menu.user.expense.form.holderName`,
                desc: '户名',
              })}
              decorator={{
                initialValue: formData.accName,
              }}
            >
              <Input disabled placeholder="请选择户名" />
            </Field>
            <Field
              name="bankBranch"
              label={formatMessage({
                id: `ui.menu.user.expense.form.bankBranch`,
                desc: '收款银行网点名称',
              })}
              decorator={{
                initialValue: formData.bankBranch,
              }}
            >
              <Input disabled placeholder="请选择户名" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CustExpEdit;
