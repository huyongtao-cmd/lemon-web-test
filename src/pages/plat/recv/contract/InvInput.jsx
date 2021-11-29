import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Form, Input, DatePicker, Radio, InputNumber } from 'antd';
import update from 'immutability-helper';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, markAsTab, closeThenGoto } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import { add } from '@/utils/mathUtils';
import { Selection } from '@/pages/gen/field';
import { selectInnerAccount } from '@/services/plat/recv/InvBatch';

const { Field } = FieldList;

const DOMAIN = 'invInput'; // 页面数据来源对应domain
const { Description } = DescriptionList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@connect(({ loading, dispatch, invInput }) => ({
  loading,
  dispatch,
  invInput,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      let val = null;
      // antD 时间组件返回的是moment对象 转成字符串提交
      if (name === 'recvDate') {
        val = formatDT(value);
      } else if (name === 'recvAmt') {
        val = (+value).toFixed(2);
      } else {
        val = value;
      }
      props.dispatch({
        type: `${DOMAIN}/updateRecvData`,
        payload: { [name]: val },
      });
    }
  },
})
class InvInput extends PureComponent {
  state = {
    iniAccountNo: null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ids: id,
      },
    });
    // 查询开票记录对应的合同的签约公司的银行账户
    dispatch({
      type: `${DOMAIN}/getAccountByInvId`,
      payload: {
        invId: id,
      },
    }).then(resp => {
      if (resp.ok) {
        this.setState({ iniAccountNo: resp.datum });
      }
    });
  }

  handleSave = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      invInput: { recvPlanList, recvData },
    } = this.props;
    const { id } = fromQs();

    const detailList = [];
    let recvAmtTotal = 0;
    recvPlanList.map(v => {
      // recvAmtTotal += v.recvAmt;
      recvAmtTotal = add(recvAmtTotal, v.recvAmt || 0);
      detailList.push({
        recvplanId: v.id,
        recvAmt: v.recvAmt,
      });
      return void 0;
    });

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (!recvAmtTotal) {
          createMessage({ type: 'warn', description: '请输入本次收款金额' });
          return;
        }
        if (+recvData.recvAmt !== recvAmtTotal) {
          createMessage({ type: 'warn', description: '表头与明细的收款金额不一致' });
          return;
        }
        const { iniAccountNo } = this.state;
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            sourceId: id,
            recvAmt: recvData.recvAmt,
            recvDate: recvData.recvDate,
            accountNo: recvData.accountNo ? recvData.accountNo : iniAccountNo,
            ledgerDate: recvData.ledgerDate ? recvData.ledgerDate : moment().format('YYYY-MM-DD'),
            remark: recvData.remark,
            detailList,
          },
        });
      }
    });
  };

  handleTotal = () => {
    const {
      form,
      dispatch,
      invInput: { recvPlanList },
    } = this.props;

    let recvAmt = 0;
    recvPlanList.map(v => {
      // recvAmt += v.recvAmt;
      recvAmt = add(recvAmt, v.recvAmt || 0);
      return void 0;
    });

    dispatch({
      type: `${DOMAIN}/updateRecvData`,
      payload: { recvAmt: recvAmt.toFixed(2) },
    });
    form.setFieldsValue({
      recvAmt: recvAmt.toFixed(2),
    });
  };

  handleDivision = () => {
    const {
      dispatch,
      invInput: { recvPlanList, recvData },
    } = this.props;

    // 未收款金额合计
    let unRecvAmtTotal = 0; // 未收款金额合计
    recvPlanList.map(v => {
      // unRecvAmtTotal += v.unRecvAmt;
      unRecvAmtTotal = add(unRecvAmtTotal, v.unRecvAmt || 0);
      return void 0;
    });
    // 如果表头”收款金额“ > 子表未收款金额合计
    if (recvData.recvAmt > unRecvAmtTotal) {
      createMessage({
        type: 'warn',
        description: '表头收款金额大于明细的未收款金额合计，无法分配',
      });
      return;
    }

    let title = +recvData.recvAmt; // 表头金额
    recvPlanList.map((v, i) => {
      if (title <= v.unRecvAmt) {
        // 如果表头金额 <= 当前行未收款金额
        // 那么当前行收款金额 = 表头金额
        recvPlanList[i].recvAmt = title;
        // 并且表头金额为0
        title = 0;
      } else {
        // 如果表头金额 > 当前行未收款金额
        // 那么当前行收款金额 = 当前行未收款金额
        recvPlanList[i].recvAmt = v.unRecvAmt;
        // 表头余额 = 表头金额 - 当前行未收款金额
        title -= v.unRecvAmt;
      }
      return void 0;
    });

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        recvPlanList,
      },
    });
  };

  handleCancel = () => {
    closeThenGoto('/plat/saleRece/invBatch/list');
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      invInput: { recvPlanList },
    } = this.props;
    const newDataList = update(recvPlanList, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { recvPlanList: newDataList } });
  };

  render() {
    const {
      invInput: { formData, recvData, recvPlanList },
      dispatch,
      form: { getFieldDecorator },
      loading,
    } = this.props;
    const { iniAccountNo } = this.state;
    const invBatchTableProps = {
      // columnsCache: DOMAIN,
      columnsCache: `${DOMAIN}-invBatchTableProps`,
      dispatch,
      rowKey: 'id',
      sortBy: 'recvNo',
      sortDirection: 'ASC',
      showSearch: false,
      enableSelection: false,
      pagination: false,
      scroll: {
        x: '200%',
      },
      dataSource: formData,
      columns: [
        {
          title: '开票批次号',
          dataIndex: 'batchNo',
        },
        {
          title: '批次状态',
          dataIndex: 'batchStatusDesc',
        },
        {
          title: '发票信息',
          dataIndex: 'invinfoId',
          align: 'center',
        },
        {
          title: '递送方式',
          dataIndex: 'deliMethodDesc',
          align: 'center',
        },
        {
          title: '发票抬头',
          dataIndex: 'invTitle',
          align: 'center',
        },
        {
          title: '收件人',
          dataIndex: 'contactPerson',
          align: 'center',
        },
        {
          title: '批次开票金额',
          dataIndex: 'invAmt',
          align: 'center',
        },
        {
          title: '收件人地址',
          dataIndex: 'invAddr',
          align: 'center',
        },
        {
          title: '开票日期',
          dataIndex: 'batchDate',
          align: 'center',
        },
        {
          title: '收件人联系电话',
          dataIndex: 'invTel',
          align: 'center',
        },
        {
          title: '发票类型',
          dataIndex: 'invTypeDesc',
          align: 'center',
        },
        {
          title: '税率%',
          dataIndex: 'taxRate',
          align: 'center',
        },
        {
          title: '开户银行',
          dataIndex: 'bankName',
          align: 'center',
        },
        {
          title: '付款方式',
          dataIndex: 'payMethodDesc',
          align: 'center',
        },
        {
          title: '收款账号',
          dataIndex: 'accountNo',
          align: 'center',
        },
        {
          title: '发票内容',
          dataIndex: 'invContent',
          align: 'center',
        },
        {
          title: '开票说明',
          dataIndex: 'invDesc',
          align: 'center',
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
          align: 'center',
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          align: 'center',
        },
      ],
    };

    const recvPlanTableProps = {
      // columnsCache: DOMAIN,
      columnsCache: `${DOMAIN}-recvPlanTableProps`,
      dispatch,
      rowKey: 'id',
      sortBy: 'recvNo',
      sortDirection: 'ASC',
      showSearch: false,
      enableSelection: false,
      pagination: false,
      scroll: {
        // x: '150%',
      },
      dataSource: recvPlanList,
      columns: [
        {
          title: '客户名',
          dataIndex: 'custName',
          sorter: true,
        },
        {
          title: '主合同名称',
          dataIndex: 'mainContractName',
        },
        {
          title: '子合同名称',
          dataIndex: 'contractName',
          sorter: true,
          align: 'center',
        },
        {
          title: '收款号',
          dataIndex: 'recvNo',
          align: 'center',
          sorter: true,
        },
        {
          title: '收款阶段',
          dataIndex: 'phaseDesc',
          align: 'center',
          sorter: true,
        },
        {
          title: '预计收款日期',
          dataIndex: 'expectRecvDate',
          align: 'center',
          sorter: true,
        },
        {
          title: '已开票金额',
          dataIndex: 'invAmt',
          align: 'center',
          sorter: true,
        },
        {
          title: '已收款金额',
          dataIndex: 'actualRecvAmt',
          align: 'center',
        },
        {
          title: '本次收款金额',
          dataIndex: 'recvAmt',
          align: 'center',
          sorter: true,
          render: (value, row, index) => (
            <InputNumber
              className="x-fill-100"
              defaultValue={value}
              value={value}
              onChange={this.onCellChanged(index, 'recvAmt')}
            />
          ),
        },
        {
          title: '已确认金额',
          dataIndex: 'confirmedAmt',
          align: 'center',
          sorter: true,
        },
        {
          title: '未收款金额',
          dataIndex: 'unRecvAmt',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="发票收款录入">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            // icon="form"
            size="large"
            onClick={this.handleSave} // TODO: 确定
            loading={loading.effects[`${DOMAIN}/save`]}
          >
            确定
          </Button>
          <Button
            className="tw-btn-primary"
            type="primary"
            // icon="form"
            size="large"
            onClick={this.handleTotal} // TODO: 按明细全额收款,不需要调用API，前端实现
          >
            按明细全额收款
          </Button>
          <Button
            className="tw-btn-primary"
            type="primary"
            // icon="form"
            size="large"
            onClick={this.handleDivision} // TODO: 按表头分配收款,不需要调用API，前端实现
          >
            按表头分配收款
          </Button>
          {(formData[0] || {}).batchStatus + '' === '4' && (
            <Button
              className="tw-btn-primary stand"
              type="primary"
              // icon="complete"
              size="large"
              onClick={() => {
                dispatch({
                  type: `${DOMAIN}/rollbackItems`,
                  payload: fromQs().id,
                });
              }}
            >
              退回
            </Button>
          )}
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title icon="profile" id="plat.recv.menu.recvInfo" defaultMessage="收款基本信息" />
          }
        >
          <FieldList
            layout="horizontal"
            legend={formatMessage({ id: `app.settings.menuMap.basic`, desc: '收款基本信息' })}
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            <Field
              name="recvAmt"
              label="收款金额(含税)"
              decorator={{
                initialValue: recvData.recvAmt,
                rules: [
                  {
                    required: true,
                    message: '请输入收款金额(含税)',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Input type="number" placeholder="请输入收款金额" />
            </Field>

            <Field
              name="recvDate"
              label="收款日期"
              {...FieldListLayout}
              decorator={{
                initialValue: recvData.recvDate ? moment(recvData.recvDate) : null,
                rules: [
                  {
                    required: true,
                    message: '请选择收款日期',
                  },
                ],
              }}
            >
              <DatePicker placeholder="请选择收款日期" format="YYYY-MM-DD" className="x-fill-100" />
            </Field>

            <Field
              name="accountNo"
              label="银行账号"
              decorator={{
                initialValue: recvData.accountNo ? recvData.accountNo : iniAccountNo,
                rules: [
                  {
                    required: true,
                    message: '请输入银行账号',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectInnerAccount()}
                columns={[
                  // span加起来不能超过24
                  { dataIndex: 'valCode', title: '账户', span: 6 },
                  { dataIndex: 'valDesc', title: '公司', span: 9 },
                  // { dataIndex: 'valSphd1', title: '银行', span: 3 },
                  { dataIndex: 'valSphd2', title: '网点', span: 9 },
                ]}
                transfer={{ key: 'id', code: 'valCode', name: 'valCode' }} // key唯一键，code要保存的值；name选中后显示的值
                dropdownMatchSelectWidth={false} // 下拉菜单菜单和选择器同款
                dropdownStyle={{ width: 700 }} // 下拉宽度
                showSearch
                onColumnsChange={() => {}}
                placeholder="请选择收款银行账号"
                // value={value}
                width={100}
                onChange={e => {}}
              />
            </Field>

            <Field
              name="ledgerDate"
              label="总账日期"
              decorator={{
                initialValue: recvData.ledgerDate ? recvData.ledgerDate : moment(),
                rules: [
                  {
                    required: true,
                    message: '请输入总账日期',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <DatePicker
                placeholder="请输入总账日期"
                format="YYYY-MM-DD"
                className="x-fill-100"
                allowClear={false}
              />
            </Field>

            <Field
              name="remark"
              label="备注"
              fieldCol={1}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              decorator={{
                initialValue: recvData.remark,
              }}
            >
              <Input.TextArea placeholder="请输入备注" rows={3} />
            </Field>
          </FieldList>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title icon="profile" id="plat.recv.menu.invBatchInfo" defaultMessage="开票信息" />
          }
        >
          <DataTable {...invBatchTableProps} />
          {/* <DescriptionList size="large" col={2} hasSeparator>
            <Description term="开票批次号">{formData.batchNo}</Description>
            <Description term="批次状态">{formData.batchStatusDesc}</Description>
            <Description term="发票信息">{formData.invinfoId}</Description>
            <Description term="递送方式">{formData.deliMethodDesc}</Description>
            <Description term="发票抬头">{formData.invTitle}</Description>
            <Description term="收件人">{formData.contactPerson}</Description>
            <Description term="批次开票金额">{formData.invAmt}</Description>
            <Description term="收件人地址">{formData.invAddr}</Description>
            <Description term="开票日期">{formData.batchDate}</Description>
            <Description term="收件人联系电话">{formData.invTel}</Description>
            <Description term="发票类型/税率">
              {formData.invTypeDesc} / {formData.taxRate}%
            </Description>
            <Description term="开户银行">{formData.bankName}</Description>
            <Description term="付款方式">{formData.payMethodDesc}</Description>
            <Description term="收款账号">{formData.accountNo}</Description>
            <Description term="发票内容">{formData.invContent}</Description>
            <Description term="开票说明">{formData.invDesc}</Description>
            <Description term="创建人">{formData.createUserName}</Description>
            <Description term="创建日期">{formData.createTime}</Description>
          </DescriptionList> */}
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" id="plat.recv.menu.recvDetail" defaultMessage="收款明细" />}
          style={{ marginTop: 6 }}
        >
          <DataTable {...recvPlanTableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default InvInput;
