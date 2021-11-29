// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import { Button, Card, Input, Select, Form, Divider, Col, InputNumber, Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import router from 'umi/router';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';

import { selectUsersWithBu } from '@/services/gen/list';
import { selectSupplierConditional } from '@/services/user/equivalent/equivalent';
import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'withdrawPay';

@connect(({ loading, withdrawPay, dispatch, user }) => ({
  loading,
  ...withdrawPay,
  dispatch,
  user,
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
class WithdrawPay extends PureComponent {
  componentDidMount() {
    const param = fromQs();
    const {
      dispatch,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;
    if (param.id) {
      // 编辑模式
    } else {
      // 新增模式
      this.fetchData(param);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
  }

  fetchData = params => {
    const {
      dispatch,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ids: params.ids },
    });
  };

  handleSubmit = () => {
    const { form, dispatch, formData, dataSource } = this.props;
    const dtlEntities = dataSource.map(data => ({ withdrawId: data.id }));
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/submit`,
        payload: {
          entity: {
            ...formData,
            ...values,
          },
          dtlEntities,
        },
      });
    });
  };

  render() {
    const {
      loading,
      total,
      dataSource,
      formData,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: disabledBtn,
      total,
      dataSource,
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      columns: [
        {
          title: '相关提现单号',
          dataIndex: 'withdrawNo',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/center/withdrawDetail?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '提现人',
          dataIndex: 'resName',
          align: 'center',
        },
        {
          title: '提现当量',
          dataIndex: 'eqva',
          align: 'center',
        },
        {
          title: '提现金额',
          dataIndex: 'amt',
          align: 'center',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          align: 'center',
        },
        {
          title: '提现状态',
          dataIndex: 'withdrawStatusDesc',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="提现">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSubmit}
          >
            保存
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="resId"
              label="申请人"
              decorator={{
                initialValue: formData.resId || (extInfo && extInfo.resId),
              }}
            >
              <Select disabled>
                <Option value={extInfo.resId}>{extInfo.resName}</Option>
              </Select>
            </Field>
            <Field
              name="withdrawPayNo"
              label="付款单号"
              decorator={{
                initialValue: formData.withdrawPayNo,
              }}
            >
              <Input disabled style={{ width: '100%' }} />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || formatDT(moment()),
              }}
            >
              <DatePicker disabled style={{ width: '100%' }} />
            </Field>
            <Field
              name="withdrawPayStatus"
              label="付款状态"
              decorator={{
                initialValue: formData.withdrawPayStatus,
              }}
            >
              <UdcSelect disabled code="ACC:WITHDRAW_PAY_STATUS" placeholder="付款状态" />
            </Field>

            <Field
              name="amt"
              label="付款金额"
              decorator={{
                initialValue: formData.amt ? formData.amt.toFixed(2) : 0,
              }}
            >
              <InputNumber disabled style={{ width: '100%' }} placeholder="提现金额" />
            </Field>

            <Field presentational />

            <Field
              name="supplierId"
              label="供应商1"
              decorator={{
                initialValue: formData.supplierId,
                rules: [{ required: true, message: '请选择供应商1' }],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectSupplierConditional({ abType: '02' })}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
              />
            </Field>

            <Field
              name="supplier2Id"
              label="供应商2"
              decorator={{
                initialValue: formData.supplier2Id,
                rules: [{ required: true, message: '请选择供应商2' }],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectSupplierConditional({ abType: '02' })}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
              />
            </Field>

            <Field
              name="supplierRate"
              label="供应商1费率"
              decorator={{
                initialValue: formData.taxRate,
                rules: [{ required: true, message: '请输入供应商1费率' }],
              }}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="供应商1费率"
                onChange={value => {
                  const supplierAmt = formData.amt * value;
                  const totalAmt = supplierAmt + (formData.supplier2Amt || 0);
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: { supplierAmt, totalAmt },
                  });
                }}
              />
            </Field>

            <Field
              name="supplier2Rate"
              label="供应商2费率"
              decorator={{
                initialValue: formData.taxRate,
                rules: [{ required: true, message: '请输入供应商2费率' }],
              }}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="供应商2费率"
                onChange={value => {
                  const supplier2Amt = formData.amt * value;
                  const totalAmt = supplier2Amt + (formData.supplierAmt || 0);
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: { supplier2Amt, totalAmt },
                  });
                }}
              />
            </Field>

            <Field
              name="supplierAmt"
              label="供应商1付款金额"
              decorator={{
                initialValue: formData.supplierAmt ? formData.supplierAmt.toFixed(2) : 0,
                rules: [{ required: true, message: '请输入供应商1付款金额' }],
              }}
            >
              <InputNumber disabled style={{ width: '100%' }} placeholder="供应商1付款金额" />
            </Field>

            <Field
              name="supplier2Amt"
              label="供应商2付款金额"
              decorator={{
                initialValue: formData.supplier2Amt ? formData.supplier2Amt.toFixed(2) : 0,
                rules: [{ required: true, message: '请输入供应商2付款金额' }],
              }}
            >
              <InputNumber disabled style={{ width: '100%' }} placeholder="供应商2付款金额" />
            </Field>

            <Field
              name="totalAmt"
              label="付款总额"
              decorator={{
                initialValue: formData.totalAmt ? formData.totalAmt.toFixed(2) : 0,
                rules: [{ required: true, message: '请输入含税总额' }],
              }}
            >
              <InputNumber disabled style={{ width: '100%' }} placeholder="含税总额" />
            </Field>

            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark,
              }}
            >
              <Input.TextArea rows={1} placeholder="备注" />
            </Field>
          </FieldList>
        </Card>
        <br />
        <Card title="提现列表" bordered={false} className="tw-card-adjust">
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default WithdrawPay;
