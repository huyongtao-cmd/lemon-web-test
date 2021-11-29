import React, { PureComponent } from 'react';
import { connect } from 'dva';
import update from 'immutability-helper';
import { Form, Card, Input, DatePicker, Tooltip, Button, Radio, Row, Cascader } from 'antd';
import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import classnames from 'classnames';
import moment from 'moment';
import { isEmpty, isNil } from 'ramda';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { genFakeId, add } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import EditableDataTable from '@/components/common/EditableDataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';

import { selectInvInfo } from '@/services/plat/recv/Contract';
import { selectOus } from '@/services/plat/res/resprofile';
import { getUrl } from '@/utils/flowToRouter';

const RadioGroup = Radio.Group;

const { FieldLine } = FieldList;
const DOMAIN = 'invBatchEdit';
const { Field } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

// 递送方式=财务代递时，收件人、收件地址、收件人联系电话、必填
const DELI_METHOD_BY_FINANCIAL = '2';

@connect(({ loading, invBatchEdit, global, dispatch }) => ({
  loading,
  invBatchEdit,
  dispatch,
  global,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      let val = null;
      // antD 时间组件返回的是moment对象 转成字符串提交
      if (typeof value === 'object' && name !== 'invoiceItem') {
        val = formatDT(value);
      } else {
        val = value;
      }
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: val },
      });
    }
  },
})
@mountToTab()
class InvBatchEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData();
    dispatch({
      type: `${DOMAIN}/getInvoiceItemList`,
    });
  }

  fetchData = () => {
    const {
      dispatch,
      invBatchEdit: { formData, recvPlanList },
    } = this.props;
    const { id, ids } = fromQs();
    if (id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      });
    } else if (ids) {
      dispatch({
        type: `${DOMAIN}/queryByIds`,
        payload: ids,
      });
    }
  };

  // 保存按钮的调用
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll, getFieldValue },
      dispatch,
    } = this.props;
    const { ids, from, taskId } = fromQs();

    validateFieldsAndScroll((error, values) => {
      const isEdit = isNil(ids);
      //  当合同开票申请被拒绝时 申请人的入口只能从首页 我的待办 入口进入 因此会带上taskId isReEdit 用来标示  false  带上id url上的id true 忽略
      const isReEdit = isNil(taskId);
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            invAmt: getFieldValue('invAmt'),
            submitted: false,
            isEdit,
            isReEdit,
          },
        }).then(resp => {
          if (isEmpty(resp)) return;
          // 有 ids 的时候是新建，要跳转到编辑页……
          if (resp.success) {
            createMessage({ type: 'success', description: '保存成功' });
            ids &&
              (from
                ? closeThenGoto(`${from}/edit?id=${resp.id}&from=${from}`)
                : closeThenGoto(`/plat/saleRece/invBatch/edit?id=${resp.id}`));
          } else if (!resp.success) {
            createMessage({ type: 'warn', description: resp.message });
          }
        });
      }
    });
  };

  handleSubmit = () => {
    // TODO : 提交申请 工作流
    const {
      dispatch,
      invBatchEdit: { formData },
      form: { validateFieldsAndScroll, getFieldValue },
    } = this.props;
    if (!formData.invAmt || formData.invAmt === '0') {
      createMessage({ type: 'warn', description: '批次开票金额为0，不能提交开票申请！' });
      return;
    }
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { taskId, remark, ids } = fromQs();
        //  首次发起合同开票申请  不用穿id  isEdit 用来标识
        const isEdit = isNil(ids);

        //  当合同开票申请被拒绝时 申请人的入口只能从首页 我的待办 入口进入 因此会带上taskId isReEdit 用来标示  false  带上id url上的id true 忽略
        const isReEdit = isNil(taskId);
        if (formData.apprStatus === 'NOTSUBMIT' || !formData.apprStatus) {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: {
              invAmt: getFieldValue('invAmt'),
              submitted: true,
              isEdit,
              isReEdit,
            },
          }).then(resp => {
            if (resp.success) {
              this.goDetail(resp.id);
            } else createMessage({ type: 'warn', description: resp.message });
          });
        } else if (formData.apprStatus === 'REJECTED' || formData.apprStatus === 'WITHDRAW') {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: {
              invAmt: getFieldValue('invAmt'),
              submitted: true,
              isEdit,
              isReEdit,
            },
          }).then(resp => {
            if (resp.success) {
              dispatch({
                type: `${DOMAIN}/reSubmit`,
                payload: { taskId, remark },
              }).then(rst => {
                const { ok } = rst;
                if (ok) {
                  this.goDetail(resp.id);
                }
              });
            } else createMessage({ type: 'warn', description: '开票申请失败' });
          });
          // to 推动流程
        } else {
          createMessage({ type: 'warn', description: '现审批状态不可申请!' });
        }
      }
    });
  };

  handleFinish = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll, getFieldValue },
      invBatchEdit: {
        dtlList,
        recvPlanList,
        formData: { invAmt },
      },
    } = this.props;
    let total = 0;
    let totalAmt = 0;
    recvPlanList.map(v => {
      // total += v.recvAmt;
      total = add(total, v.recvAmt || 0);
      return void 0;
    });
    dtlList.map(v => {
      // totalAmt += +v.invAmt;
      totalAmt = add(totalAmt, v.invAmt || 0);
      return void 0;
    });

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (totalAmt === invAmt) {
          const { taskId, remark, ids } = fromQs();
          const isEdit = isNil(ids);
          //  当合同开票申请被拒绝时 申请人的入口只能从首页 我的待办 入口进入 因此会带上taskId isReEdit 用来标示  false  带上id url上的id true 忽略
          const isReEdit = isNil(taskId);
          dispatch({
            type: `${DOMAIN}/save`,
            payload: {
              invAmt: getFieldValue('invAmt'),
              submitted: false,
              isEdit,
              isReEdit,
            },
          }).then(resp => {
            if (resp.success) {
              dispatch({
                type: `${DOMAIN}/finish`,
              }).then(response => response && this.handleCancel());
            } else if (!resp.success) {
              createMessage({ type: 'error', description: resp.message });
            }
          });
        } else {
          createMessage({ type: 'warn', description: '开票金额的总额必须等于批次开票金额' });
        }
      }
    });
  };

  handleCancel = () => {
    const currentUrl = getUrl();
    currentUrl.includes('invBatches')
      ? closeThenGoto('/sale/contract/invBatches')
      : closeThenGoto('/plat/saleRece/contract/list');
  };

  goDetail = id => {
    const currentUrl = getUrl();
    const { from } = fromQs();

    // currentUrl.includes('invBatches')
    //   ? closeThenGoto(`/sale/contract/invBatches/detail?id=${id}&from=/sale/contract/invBatches`)
    //   : closeThenGoto(`/plat/saleRece/invBatch/detail?id=${id}&from=/sale/contract/invBatch/list`);

    if (currentUrl.includes('invBatches')) {
      closeThenGoto(`/sale/contract/invBatches/detail?id=${id}&from=/sale/contract/invBatches`);
    } else {
      closeThenGoto(`/plat/saleRece/invBatch/detail?id=${id}&from=${from}`);
    }
  };

  invInfoChange = value => {
    const { dispatch } = this.props;
    if (!isNil(value)) {
      dispatch({
        type: `${DOMAIN}/invInfoDetail`,
        payload: {
          id: value,
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          invinfoId: value,
        },
      });
    }
  };

  handleTaxRate = value => {
    const {
      dispatch,
      invBatchEdit: { dtlList },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        taxRate: +value,
      },
    });
    dtlList.map((v, i) => {
      dtlList[i].netAmt = (v.invAmt / (1 + +value / 100)).toFixed(2);
      dtlList[i].taxAmt = (v.invAmt - (v.invAmt / (1 + +value / 100)).toFixed(2)).toFixed(2);
      return void 0;
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dtlList },
    });
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      invBatchEdit: { dtlList, formData },
    } = this.props;

    let value = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    if (rowField === 'deliveryDate') {
      value = formatDT(rowFieldValue);
    } else if (rowField === 'invAmt') {
      // 开票金额
      dtlList[rowIndex].invAmt = value;
      // 净额
      dtlList[rowIndex].netAmt = (value / (1 + +formData.taxRate / 100)).toFixed(2);
      // 税金
      dtlList[rowIndex].taxAmt = (
        value - (value / (1 + +formData.taxRate / 100)).toFixed(2)
      ).toFixed(2);
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { dtlList },
      });
      return;
    }

    const newDataList = update(dtlList, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { dtlList: newDataList } });
  };

  refundBtnClick = () => {
    const {
      dispatch,
      invBatchEdit: { formData },
      form: { validateFieldsAndScroll, getFieldValue },
    } = this.props;
    const { status, id } = fromQs();
    if (status === '4') {
      dispatch({
        type: `${DOMAIN}/refundBtn`,
        payload: {
          disDisc: getFieldValue('disDisc'),
          invBatchId: id,
        },
      });
    }
  };

  render() {
    const {
      loading,
      dispatch,
      invBatchEdit: {
        dtlList,
        delList,
        recvPlanList,
        selectList,
        formData,
        custId,
        contractInfoFormData,
        invoiceItemList = [],
      },
      form: { getFieldDecorator },
    } = this.props;
    // console.warn(invoiceItemList);
    // console.warn(formData);

    const readOnly = true;
    const { taskId, status } = fromQs();

    const recvPlanTableProps = {
      // columnsCache: DOMAIN,
      columnsCache: `${DOMAIN}-recvPlanTableProps`,
      dispatch,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      filterMultiple: false,
      dataSource: recvPlanList,
      enableSelection: false,
      pagination: false,
      scroll: { x: '150%' },
      columns: [
        {
          title: '客户名',
          dataIndex: 'custName',
          render: (value, row, index) => (
            <Link
              className="tw-link"
              to={`/plat/addr/view?no=${contractInfoFormData.abNo}&from=${getUrl()}`}
            >
              {value}
            </Link>
          ),
        },
        {
          title: '主合同名称',
          dataIndex: 'mainContractName',
        },
        {
          title: '子合同号',
          dataIndex: 'contractNo',
          sorter: true,
          align: 'center',
        },
        {
          title: '子合同名称',
          dataIndex: 'contractName',
          sorter: true,
          align: 'center',
        },
        {
          title: '参考合同号',
          dataIndex: 'userdefinedNo',
          sorter: true,
          align: 'center',
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuName',
          sorter: true,
          align: 'center',
        },
        {
          title: '项目经理',
          dataIndex: 'projectManager',
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
        },
        {
          title: '当期收款金额',
          dataIndex: 'recvAmt',
          align: 'center',
          sorter: true,
        },
        {
          title: '当期收款比例 %',
          dataIndex: 'recvRatio',
          align: 'center',
          sorter: true,
          render: value => `${value * 100}`,
        },
        {
          title: '预计收款日期',
          dataIndex: 'expectRecvDate',
          align: 'center',
          sorter: true,
        },
        {
          title: '收款状态',
          dataIndex: 'recvStatusDesc',
          align: 'center',
          sorter: true,
        },
        {
          title: '税率',
          dataIndex: 'taxRate',
          align: 'center',
          sorter: true,
        },
        {
          title: '开票日期',
          dataIndex: 'invDate',
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
          title: '未开票金额',
          dataIndex: 'unInvAmt',
          align: 'center',
          sorter: true,
        },
        {
          title: '已收款金额',
          dataIndex: 'actualRecvAmt',
          align: 'center',
          sorter: true,
        },
        {
          title: '实际收款日期',
          dataIndex: 'actualRecvDate',
          align: 'center',
          sorter: true,
        },
        {
          title: '未收款金额',
          dataIndex: 'unRecvAmt',
          align: 'center',
          sorter: true,
        },
        {
          title: '已确认金额',
          dataIndex: 'confirmedAmt',
          align: 'center',
        },
      ],
    };

    const invBatchTableProps = {
      // columnsCache: DOMAIN,
      columnsCache: `${DOMAIN}-invBatchTableProps`,
      sortBy: 'id',
      rowKey: 'id',
      showCopy: false,
      showSearch: false,
      // loading: loading.effects[`${DOMAIN}/query`],
      dataSource: dtlList,
      pagination: false,
      leftButtons: [
        {
          key: 'add',
          title: '新增',
          className: 'tw-btn-primary',
          // icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                dtlList: update(dtlList, {
                  $push: [
                    {
                      id: genFakeId(-1),
                      invNo: null,
                      deliveryNo: null,
                      deliveryDate: new Date(),
                      invAmt: null,
                      netAmt: null,
                      taxAmt: null,
                    },
                  ],
                }),
              },
            });
          },
        },
        {
          key: 'copy',
          title: '复制',
          className: 'tw-btn-info',
          // icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                dtlList: update(dtlList, {
                  $push: [
                    {
                      ...selectedRows[0],
                      id: genFakeId(-1),
                    },
                  ],
                }),
              },
            });
          },
        },
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          // icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确定要删除这些发票吗?',
              onOk: () => {
                const delArr = [];
                selectedRowKeys.map(v => v > 0 && delArr.push(v));
                const newDataList = dtlList.filter(
                  row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
                );
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    dtlList: newDataList,
                    delList: delArr,
                  },
                });
              },
            });
          },
        },
      ],
      columns: [
        {
          title: '发票状态类型',
          dataIndex: 'invStatus',
          align: 'center',
          required: true,
          render: (value, row, index) => (
            <Selection.UDC
              className="tw-field-group-field"
              code="ACC:INV_STATUS"
              style={{
                width: 140,
              }}
              value={value}
              onChange={this.onCellChanged(index, 'invStatus')}
            />
          ),
        },
        {
          title: '发票号',
          dataIndex: 'invNo',
          align: 'center',
          sorter: true,
          required: true,
          render: (value, row, index) => (
            <Input defaultValue={value} onChange={this.onCellChanged(index, 'invNo')} />
          ),
        },
        {
          title: '快递号',
          dataIndex: 'deliveryNo',
          align: 'center',
          sorter: true,
          render: (value, row, index) => (
            <Input defaultValue={value} onChange={this.onCellChanged(index, 'deliveryNo')} />
          ),
        },
        {
          title: '快递时间',
          dataIndex: 'deliveryDate',
          align: 'center',
          sorter: true,
          render: (value, row, index) => (
            <DatePicker
              defaultValue={moment(value)}
              onChange={this.onCellChanged(index, 'deliveryDate')}
            />
          ),
        },
        {
          title: '开票金额',
          dataIndex: 'invAmt',
          align: 'center',
          sorter: true,
          required: true,
          render: (value, row, index) => (
            <Input defaultValue={value} onChange={this.onCellChanged(index, 'invAmt')} />
          ),
        },
        {
          title: '净额',
          dataIndex: 'netAmt',
          align: 'center',
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              value={value}
              onChange={this.onCellChanged(index, 'netAmt')}
            />
          ),
        },
        {
          title: '税金',
          dataIndex: 'taxAmt',
          align: 'center',
          sorter: true,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              value={value}
              onChange={this.onCellChanged(index, 'taxAmt')}
            />
          ),
        },
        {
          title: '下载链接',
          dataIndex: 'downloadUrl',
          align: 'center',
          sorter: true,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              value={value}
              onChange={this.onCellChanged(index, 'downloadUrl')}
            />
          ),
        },
      ],
    };

    const disabledBtn =
      !!loading.effects[`${DOMAIN}/query`] ||
      !!loading.effects[`${DOMAIN}/queryByIds`] ||
      !!loading.effects[`${DOMAIN}/save`] ||
      !!loading.effects[`${DOMAIN}/reSubmit`];

    return (
      <PageHeaderWrapper title="合同开票维护">
        <Card className="tw-card-rightLine">
          {// 空或者三种状态
          ['NOTSUBMIT', ''].some(stat => stat === formData.apprStatus || !formData.apprStatus) ||
          taskId ? (
            <Button
              className="tw-btn-primary"
              type="primary"
              icon="submit"
              size="large"
              disabled={disabledBtn}
              onClick={this.handleSubmit}
            >
              提交申请
            </Button>
          ) : null}

          {status === '4' && (
            // 退票原因说明
            <Button
              className="tw-btn-primary"
              type="primary"
              icon="submit"
              size="large"
              onClick={this.refundBtnClick}
            >
              提交
            </Button>
          )}

          {status === '3' || status === '9' ? (
            <Button
              className="tw-btn-primary"
              type="primary"
              icon="complete"
              size="large"
              onClick={this.handleFinish}
            >
              完成开票
            </Button>
          ) : null}

          {/* {formData.batchStatus + '' === '4' && (
            <Button
              className="tw-btn-primary"
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
          )} */}

          {fromQs().id && (
            <a
              href={`/print?scope=printInv&id=${fromQs().id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 'auto', marginRight: 8 }}
            >
              <Tooltip title="打印单据">
                <Button
                  className={classnames('separate', 'tw-btn-default')}
                  type="dashed"
                  icon="printer"
                  size="large"
                />
              </Tooltip>
            </a>
          )}
          <Button
            className={classnames('tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        {status === '4' && (
          <Row style={{ background: '#fff' }}>
            <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} hasSeparator={1}>
              <Field
                name="disDisc"
                label="退票原因说明"
                fieldCol={1}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                decorator={{
                  initialValue: (formData && formData.disDisc) || '',
                  rules: [
                    {
                      required: true,
                      message: '请输入退票原因',
                    },
                  ],
                }}
              >
                <Input.TextArea placeholder="请输入退票原因" rows={3} />
              </Field>
            </FieldList>
          </Row>
        )}

        <Card
          className="tw-card-adjust deepColorDecorator"
          bordered={false}
          title={<Title icon="profile" id="plat.recv.menu.invInfo" defaultMessage="开票基本信息" />}
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            <Field
              name="batchNo"
              label="开票批次号"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.batchNo,
              }}
            >
              <Input disabled={readOnly} placeholder="系统生成" />
            </Field>

            <Field
              name="batchStatus"
              label="批次状态"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.batchStatusDesc,
                rules: [
                  {
                    required: true,
                    message: '请选择批次状态',
                  },
                ],
              }}
            >
              <UdcSelect disabled={readOnly} code="ACC.INVBATCH_STATUS" />
            </Field>

            <FieldLine label="参考合同号/合同名" {...FieldListLayout} required>
              <Field
                name="userdefinedNo"
                decorator={{
                  initialValue: formData.userdefinedNo,
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Input disabled placeholder="请带入合同号" />
              </Field>
              <Field
                name="contractName"
                decorator={{
                  initialValue: formData.contractName,
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input disabled placeholder="请带入合同名" />
              </Field>
            </FieldLine>

            <FieldLine label="项目号/项目名" {...FieldListLayout} required>
              <Field
                name="projNo"
                decorator={{
                  initialValue: formData.projNo,
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Input placeholder="" disabled />
              </Field>
              <Field
                name="projName"
                decorator={{
                  initialValue: formData.projName,
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input disabled placeholder="请带入项目名" />
              </Field>
            </FieldLine>

            <Field
              name="invAmt"
              label="批次开票金额"
              decorator={{
                initialValue: formData.invAmt,
              }}
              {...FieldListLayout}
            >
              <Input disabled={readOnly} placeholder="系统自动带出" />
            </Field>

            {status === '3' ? (
              <Field
                name="batchDate"
                label="开票日期"
                decorator={{
                  initialValue: formData.batchDate ? moment(formData.batchDate) : null,
                  rules: [
                    {
                      required: true,
                      message: '请选择开票日期',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <DatePicker
                  placeholder="请选择开票日期"
                  format="YYYY-MM-DD"
                  className="x-fill-100"
                  disabled={status === '4'}
                />
              </Field>
            ) : null}

            <Field
              name="payMethod"
              label="付款方式"
              decorator={{
                initialValue: formData.payMethod,
              }}
              {...FieldListLayout}
            >
              <UdcSelect
                code="ACC.PAY_METHOD"
                placeholder="请选择付款方式"
                disabled={status === '4'}
              />
            </Field>

            <Field
              name="antiRecvDate"
              label="预计到账日期"
              decorator={{
                initialValue: formData.antiRecvDate ? moment(formData.antiRecvDate) : null,
                rules: [
                  {
                    required: true,
                    message: '请选择日期',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <DatePicker
                placeholder="请选择日期"
                format="YYYY-MM-DD"
                className="x-fill-100"
                disabled={status === '4'}
              />
            </Field>
          </FieldList>
        </Card>

        <Card
          className="tw-card-adjust deepColorDecorator"
          bordered={false}
          title={<Title icon="profile" id="plat.recv.menu.invContent" defaultMessage="开票内容" />}
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            <Field
              name="custName"
              label="客户名称"
              decorator={{
                initialValue: formData.custName,
              }}
              {...FieldListLayout}
            >
              <div>
                <span>
                  {formData.custName}
                  &emsp;
                </span>
                {custId === 0 || // 不是匹配固定id的记录，不用进行多租户改造
                  (custId === -1 && ( // 不是匹配固定id的记录，不用进行多租户改造
                    <span style={{ color: 'red' }}>该客户还未维护开票信息，请手工录入</span>
                  ))}
              </div>
            </Field>

            <Field
              name="invinfoId"
              label="开票信息"
              decorator={{
                initialValue: formData.invinfoId,
                rules: [
                  {
                    required: true,
                    message: '必填',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <AsyncSelect
                source={selectList}
                placeholder="请选择开票信息"
                disabled={status === '4' || custId === 0 || custId === -1} // 不是匹配固定id的记录，不用进行多租户改造
                onChange={this.invInfoChange}
              />
            </Field>

            <Field
              name="invTitle"
              label="发票抬头"
              decorator={{
                initialValue: formData.invTitle,
                rules: [
                  {
                    required:
                      formData.invType === 'EXCLUSIVE' ||
                      formData.invType === 'ELEC_EXCLUSIVE' ||
                      formData.invType === 'NORMAL' ||
                      formData.invType === 'ELEC_NORMAL',
                    message: '请输入发票抬头',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Input
                placeholder="请输入发票抬头"
                // disabled={status === '4'}
                disabled
              />
            </Field>
            <Field
              name="taxNo"
              label="税号"
              decorator={{
                initialValue: formData.taxNo,
                rules: [
                  {
                    required:
                      formData.invType === 'EXCLUSIVE' ||
                      formData.invType === 'ELEC_EXCLUSIVE' ||
                      formData.invType === 'NORMAL' ||
                      formData.invType === 'ELEC_NORMAL',
                    message: '请输入税号',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Input
                placeholder="请输入税号"
                // disabled={status === '4'}
                disabled
              />
            </Field>

            <Field
              name="addr"
              label="地址"
              decorator={{
                initialValue: formData.addr,
                rules: [
                  {
                    required:
                      formData.invType === 'EXCLUSIVE' || formData.invType === 'ELEC_EXCLUSIVE',
                    message: '必填',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Input
                placeholder="请输入地址"
                // disabled={status === '4'}
                disabled
              />
            </Field>

            <Field
              name="bankName"
              label="开户行"
              decorator={{
                initialValue: formData.bankName ? formData.bankName : '',
                rules: [
                  {
                    required:
                      formData.invType === 'EXCLUSIVE' || formData.invType === 'ELEC_EXCLUSIVE',
                    message: '必填',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Input placeholder="请输入开户行" disabled />
            </Field>

            <Field
              name="accountNo"
              label="账户"
              decorator={{
                initialValue: formData.accountNo,
                rules: [
                  {
                    required:
                      formData.invType === 'EXCLUSIVE' || formData.invType === 'ELEC_EXCLUSIVE',
                    message: '必填',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Input
                placeholder="请输入账户"
                // disabled={status === '4'}
                disabled
              />
            </Field>

            <Field
              name="invTelAb"
              label="电话"
              decorator={{
                initialValue: formData.invTelAb,
                rules: [
                  {
                    required:
                      formData.invType === 'EXCLUSIVE' || formData.invType === 'ELEC_EXCLUSIVE',
                    message: '必填',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Input
                placeholder="请输入电话"
                // disabled={status === '4'}
                disabled
              />
            </Field>

            <FieldLine label="发票类型/税率" {...FieldListLayout} required>
              <Field
                name="invType"
                decorator={{
                  initialValue: formData.invType,
                  rules: [
                    {
                      required: true,
                      message: '请选择发票类型',
                    },
                  ],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <UdcSelect
                  code="COM.INV_TYPE"
                  placeholder="请选择发票类型"
                  disabled={status === '4'}
                />
              </Field>
              <Field
                name="taxRate"
                decorator={{
                  initialValue: formData.taxRate,
                  rules: [
                    {
                      required: true,
                      message: '请选择税率',
                    },
                  ],
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <UdcSelect
                  code="COM.TAX_RATE"
                  placeholder="请选择税率"
                  onChange={this.handleTaxRate}
                  disabled={status === '4'}
                />
              </Field>
            </FieldLine>

            <Field
              name="currCode"
              label="币种"
              decorator={{
                initialValue: formData.currCode,
                rules: [
                  {
                    required:
                      formData.invType === 'EXCLUSIVE' ||
                      formData.invType === 'ELEC_EXCLUSIVE' ||
                      formData.invType === 'NORMAL' ||
                      formData.invType === 'ELEC_NORMAL',
                    message: '必填',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <UdcSelect
                code="COM:CURRENCY_KIND"
                placeholder="请选择币种"
                // disabled={status === '4'}
                disabled
              />
            </Field>

            {/* <Field
              name="invContent"
              label="发票内容"
              decorator={{
                initialValue: formData.invContent,
                rules: [
                  {
                    required: true,
                    message: '请输入发票内容',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Input placeholder="请输入发票内容" />
            </Field> */}
            <Field
              name="invoiceItem"
              label="商品信息"
              decorator={{
                initialValue: formData.invoiceItem || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择商品信息',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Cascader
                disabled={status === '4'}
                style={{ width: '100%' }}
                options={invoiceItemList}
                showSearch
                matchInputWidth
                placeholder="请选择商品信息"
              />
            </Field>

            {/* <Field
              name="saveAbFlag"
              label="保存开票信息到地址簿"
              decorator={{
                initialValue: formData.saveAbFlag ? formData.saveAbFlag : 1,
              }}
              {...FieldListLayout}
            >
              <RadioGroup
                disabled={status === '4'}
                onChange={e => {
                  formData.saveAbFlag = e.target.value;
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      formData: {
                        ...formData,
                        saveAbFlag: e.target.value,
                      },
                    },
                  });
                }}
              >
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </RadioGroup>
            </Field> */}
          </FieldList>
        </Card>

        <Card
          className="tw-card-adjust deepColorDecorator"
          bordered={false}
          title={
            <Title icon="profile" id="plat.recv.menu.invOtherInfo" defaultMessage="其他信息" />
          }
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            <Field
              name="deliMethod"
              label="递送方式"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.deliMethod,
                rules: [
                  {
                    required: true,
                    message: '请选择递送方式',
                  },
                ],
              }}
            >
              <UdcSelect
                disabled={status === '4'}
                code="COM.DELI_METHOD"
                placeholder="请输入递送方式"
              />
            </Field>

            <Field
              name="contactPerson"
              label="收件人"
              decorator={{
                initialValue: formData.contactPerson,
                rules: [
                  {
                    required: formData.deliMethod + '' === DELI_METHOD_BY_FINANCIAL,
                    message: '请输入收件人',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Input placeholder="请输入收件人" disabled={status === '4'} />
            </Field>

            <Field
              name="invEmail"
              label="收件人邮箱"
              decorator={{
                initialValue: formData.invEmail,
                rules: [
                  {
                    type: 'email',
                    message: '无效邮箱',
                  },
                  {
                    required: true,
                    message: '请输入收件人邮箱',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Input placeholder="请输入收件人邮箱" disabled={status === '4'} />
            </Field>
            <Field
              name="invAddr"
              label="收件人地址"
              decorator={{
                initialValue: formData.invAddr,
                rules: [
                  {
                    required: formData.deliMethod + '' === DELI_METHOD_BY_FINANCIAL,
                    message: '请输入收件人地址',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Input placeholder="请输入收件人地址" disabled={status === '4'} />
            </Field>

            {status === '3' ? (
              <Field
                name="batchDate"
                label="开票日期"
                decorator={{
                  initialValue: formData.batchDate ? moment(formData.batchDate) : null,
                  rules: [
                    {
                      required: true,
                      message: '请选择开票日期',
                    },
                  ],
                }}
                {...FieldListLayout}
              >
                <DatePicker
                  placeholder="请选择开票日期"
                  format="YYYY-MM-DD"
                  className="x-fill-100"
                  disabled={status === '4'}
                />
              </Field>
            ) : null}

            <Field
              name="invTel"
              label="收件人联系电话"
              decorator={{
                initialValue: formData.invTel,
                rules: [
                  {
                    required: formData.deliMethod + '' === DELI_METHOD_BY_FINANCIAL,
                    message: '请输入收件人联系电话',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Input placeholder="请输入收件人联系电话" disabled={status === '4'} />
            </Field>

            <Field
              name="ouId"
              label="开票主体"
              decorator={{
                initialValue: recvPlanList && recvPlanList.length > 0 ? recvPlanList[0].ouId : -1,
              }}
              {...FieldListLayout}
            >
              <AsyncSelect
                source={() => selectOus().then(resp => resp.response)}
                placeholder="请选择开票主体"
                disabled={readOnly}
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Field>

            <Field
              name="attache"
              label="附件"
              decorator={{
                initialValue: formData.attache,
              }}
              {...FieldListLayout}
            >
              <FileManagerEnhance
                api="/api/worth/v1/invBatchs/sfs/token"
                dataKey={formData.id}
                listType="text"
                // disabled={false}
                disabled={status === '4'}
              />
            </Field>

            <Field
              name="createUserName"
              label="创建人"
              decorator={{
                initialValue: formData.createUserName,
              }}
              {...FieldListLayout}
            >
              <Input disabled={readOnly} placeholder="系统生成" />
            </Field>

            <Field
              name="createTime"
              label="创建日期"
              decorator={{
                initialValue: formData.createTime ? formatDT(formData.createTime) : null,
              }}
              {...FieldListLayout}
            >
              <Input disabled={readOnly} placeholder="系统生成" />
            </Field>

            <Field
              name="invDesc"
              label="开票说明"
              fieldCol={1}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              decorator={{
                initialValue: formData.invDesc,
              }}
            >
              <Input.TextArea placeholder="请输入开票说明" rows={3} disabled={status === '4'} />
            </Field>
          </FieldList>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title icon="profile" id="plat.recv.menu.invContract" defaultMessage="开票相关合同" />
          }
          style={{ marginTop: 6 }}
        >
          <DataTable {...recvPlanTableProps} />
        </Card>

        {status === '3' || status === '9' ? (
          <Card
            className="tw-card-adjust"
            bordered={false}
            title={
              <Title
                icon="profile"
                id="plat.recv.menu.detailInvInfoDetail"
                defaultMessage="具体发票信息"
              />
            }
            style={{ marginTop: 6 }}
          >
            <DataTable {...invBatchTableProps} />
          </Card>
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default InvBatchEdit;
