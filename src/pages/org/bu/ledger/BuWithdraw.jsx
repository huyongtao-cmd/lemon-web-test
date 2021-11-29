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
import { selectProjectConditional } from '@/services/user/project/project';
import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'buWithdraw';

@connect(({ loading, buWithdraw, dispatch, user }) => ({
  loading,
  ...buWithdraw,
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
class BuWithdraw extends PureComponent {
  constructor(props) {
    super(props);

    this.dataTable = React.createRef();
  }

  componentDidMount() {
    const param = fromQs();
    const {
      dispatch,
      searchForm,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;
    if (param.id) {
      // 编辑模式
    } else {
      // 新增模式
      this.fetchData({ offset: 0, limit: 10 });
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { ledgerId: param.ledgerId, ledgerName: param.ledgerName },
      });
      dispatch({
        type: `${DOMAIN}/getBuWithdrawSum`,
        payload: { buLedgerId: param.ledgerId, buWithdrawFlag: true },
      });
    }
  }

  fetchData = params => {
    const {
      dispatch,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...params, buLedgerId: param.ledgerId, buWithdrawFlag: true },
    });
  };

  handleSubmit = () => {
    const param = fromQs();

    const { form, dispatch, formData } = this.props;
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
            ledgerId: param.ledgerId,
            submit: true,
          },
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
      searchForm,
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
      enableSelection: false,
      searchBarForm: [],
      leftButtons: [
        {
          key: 'submit',
          icon: 'submit',
          className: 'tw-btn-primary',
          title: '提交提现',
          hidden: true,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // const flag = selectedRows.filter(item => item.settleStatus !== 'CREATE').length;
            // if (flag) {
            //   createMessage({ type: 'warn', description: '只有新增状态的可以删除！' });
            //   return;
            // }
            const ids = selectedRows.map(selected => selected.id);
            // dispatch({
            //   type: `${DOMAIN}/delete`,
            //   payload: { keys: ids.join(',') },
            // });
          },
        },
      ],
      columns: [
        {
          title: '可提现当量',
          dataIndex: 'eqva',
          align: 'center',
          render: (value, row, key) => (row.approveSettleEqva - row.buWithdrawEqva).toFixed(2),
        },
        {
          title: '可提现金额',
          dataIndex: 'applyAmt',
          align: 'center',
          render: (value, row, key) =>
            (row.settlePrice * (row.approveSettleEqva - row.buWithdrawEqva)).toFixed(2),
        },
        {
          title: '相关结算单号',
          dataIndex: 'settleNo',
          align: 'center',
          render: (value, row, key) => {
            const { id, settleType } = row;
            let url;
            if (settleType === 'TASK_BY_PACKAGE') url = `/plat/intelStl/list/sum/preview?id=${id}`;
            else if (settleType === 'TASK_BY_MANDAY')
              url = `/plat/intelStl/list/single/preview?id=${id}`;
            else url = `/plat/intelStl/list/common/preview?id=${id}`;
            return (
              <Link className="tw-link" to={url}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '结算日期',
          dataIndex: 'settleDate',
          align: 'center',
        },
        {
          title: '结算人',
          dataIndex: 'incomeResName',
          align: 'center',
        },
        {
          title: '已提现当量',
          dataIndex: 'buWithdrawEqva',
          align: 'center',
        },
        {
          title: '相关项目',
          dataIndex: 'projName',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/project/projectDetail?id=${row.projId}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '相关任务',
          dataIndex: 'taskName',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/task/view?id=${row.taskId}`}>
              {value}
            </Link>
          ),
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
            提交
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
              label="提现人"
              decorator={{
                initialValue: formData.resId || (extInfo && extInfo.resId),
              }}
            >
              <Select disabled>
                <Option value={extInfo.resId}>{extInfo.resName}</Option>
              </Select>
            </Field>
            <Field
              name="withdrawNo"
              label="提现单号"
              decorator={{
                initialValue: formData.withdrawNo,
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
              name="apprStatus"
              label="审批状态"
              decorator={{
                initialValue: formData.apprStatus,
              }}
            >
              <UdcSelect disabled code="COM.APPR_STATUS" placeholder="审批状态" />
            </Field>
            <Field
              name="withdrawType"
              label="提现类型"
              decorator={{
                initialValue: formData.withdrawType,
              }}
            >
              <UdcSelect disabled code="ACC:WITHDRAW_TYPE" placeholder="提现类型" />
            </Field>

            <Field
              name="ledgerName"
              label="提现账户"
              decorator={{
                initialValue: formData.ledgerName,
              }}
            >
              <Input disabled style={{ width: '100%' }} />
            </Field>

            <Field
              name="eqva"
              label="提现当量"
              decorator={{
                initialValue: formData.eqva ? formData.eqva.toFixed(2) : 0,
              }}
            >
              <InputNumber disabled style={{ width: '100%' }} placeholder="提现当量" />
            </Field>
            <Field
              name="applyAmt"
              label="提现金额"
              decorator={{
                initialValue: formData.applyAmt ? formData.applyAmt.toFixed(2) : 0,
              }}
            >
              <InputNumber disabled style={{ width: '100%' }} placeholder="提现金额" />
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
        <Card title="结算单列表" bordered={false} className="tw-card-adjust">
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BuWithdraw;
