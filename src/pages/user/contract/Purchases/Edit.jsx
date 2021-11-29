import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, DatePicker, InputNumber, Button, Divider, Radio } from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { isEmpty, takeLast, add, isNil, gte, lte } from 'ramda';
import update from 'immutability-helper';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import EditableDataTable from '@/components/common/EditableDataTable';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { fromQs, getGuid } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { toIsoDate } from '@/utils/timeUtils';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';
import router from 'umi/router';

import { selectBu, selectSupplier } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsers } from '@/services/sys/user';
import { selectAbOus } from '@/services/gen/list';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'userContractPurchaseEdit';
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
@connect(({ userContractPurchaseEdit, loading }) => ({
  loading,
  userContractPurchaseEdit,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (name === 'purchaseLegalName' || name === 'purchaseBuId') return;
    if (name === 'signDate' || name === 'activateDate') {
      // antD 时间组件返回的是moment对象 转成字符串提交
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
  },
})
@mountToTab()
class PurchaseEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { pid } = fromQs();
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
    dispatch({
      type: `${DOMAIN}/queryPurchase`,
      payload: pid,
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      userContractPurchaseEdit: { formData, list, deletedKeys },
      dispatch,
    } = this.props;
    // const{from} = fromQs();
    // console.log("!!<<<<",from);

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { signDate, activateDate, closeDate, ...rest } = values;
        const purchaseContractEntity = {
          ...formData,
          signDate: toIsoDate(signDate),
          activateDate: toIsoDate(activateDate),
          closeDate: toIsoDate(closeDate),
          ...rest,
        };

        const payPlanList = list.filter(({ lineNo }) => lineNo !== -1).map((item, index) => {
          const { stage, id, unPayAmt, planPayDate, ...restParam } = item;
          let isNew = false;
          if (typeof id === 'string') {
            isNew = id.includes('new');
          }
          return {
            id: isNew ? -1 : id,
            pcontractId: formData.id,
            planPayDate: toIsoDate(planPayDate),
            ...restParam,
          };
        });
        // console.warn(' --> ', values, purchaseContractEntity);
        dispatch({
          type: `${DOMAIN}/saveEdit`,
          payload: {
            purchaseContractEntity,
            pContractPayload: {
              pcontractId: formData.id,
              entityList: payPlanList,
              delIds: deletedKeys,
            },
          },
        });
      }
    });
  };

  handleCancel = () => {
    const { mainId, id, from } = fromQs();
    if (mainId && id) {
      closeThenGoto(`/sale/contract/editSub?mainId=${mainId}&id=${id}`);
    }
    if (from !== undefined) {
      closeThenGoto(from);
    } else {
      closeThenGoto(`/sale/contract/purchasesList`);
    }
  };

  handlePurchaseLegal = (key, data) => {
    const { form } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/updateForm`,
    //   payload: {
    //     purchaseLegalNo: key,
    //     purchaseLegalName: data.props.title,
    //   },
    // });
    form.setFieldsValue({
      purchaseLegalNo: key,
      purchaseLegalName: data.props.title,
    });
  };

  handleSupplier = (key, data) => {
    const { form } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/updateForm`,
    //   payload: {
    //     purchaseLegalNo: key,
    //     purchaseLegalName: data.props.title,
    //   },
    // });
    form.setFieldsValue({
      supplierLegalNo: key,
      supplierLegalName: data.props.title,
    });
  };

  linkageBu = value => {
    const { dispatch, form } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/linkageBu`,
        payload: value,
      }).then(res => {
        form.setFieldsValue({
          purchaseLegalNo: res.purchaseLegalNo,
          purchaseLegalName: res.purchaseLegalName,
        });
      });
    } else {
      form.setFieldsValue({
        purchaseLegalNo: null,
        purchaseLegalName: null,
      });
    }
  };

  linkageSupplier = value => {
    const { dispatch, form } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/linkageSupplier`,
        payload: value,
      }).then(res => {
        if (res.buId) {
          form.setFieldsValue({
            supplierLegalNo: res.supplierLegalNo,
            supplierLegalName: res.supplierLegalName,
          });
        }
      });
    } else {
      form.setFieldsValue({
        supplierLegalNo: null,
        supplierLegalName: null,
      });
    }
  };

  handleUdc1Change = value => {
    const { dispatch, form } = this.props;
    if (!value) {
      return;
    }
    dispatch({
      type: `${DOMAIN}/udc2`,
      payload: {
        defId: 'TSK:PURCHASE_TYPE2',
        parentDefId: 'TSK:PURCHASE_TYPE1',
        parentVal: value,
      },
    }).then(() => {
      // 2级联动选项滞空
      form.setFieldsValue({
        purchaseType2: null,
        purchaseType2Desc: null,
      });
    });
  };

  calcList = (list = []) => {
    const [tail, ...others] = list.reverse();
    const pioneer = others.reverse();
    // reset sumItem
    tail.actualPayAmt = 0;
    tail.unPayAmt = 0;
    // calc sum
    pioneer.forEach(item => {
      const { actualPayAmt = 0, unPayAmt = 0 } = item;
      tail.actualPayAmt = mathAdd(tail.actualPayAmt || 0, actualPayAmt || 0);
      tail.unPayAmt = mathAdd(tail.unPayAmt || 0, unPayAmt || 0);
    });
    return [...pioneer, tail];
  };

  calcItemsSum = (list = [], option = '') => {
    if (!option) return undefined;
    return list.map(l => l[option]).reduce((prev, curr) => mathAdd(prev || 0, curr || 0), 0);
  };

  tableProps = () => {
    const {
      userContractPurchaseEdit: { list, formData, selectedRowKeys, deletedKeys, payStatusUDC },
      loading,
      dispatch,
    } = this.props;

    const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
      let val = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
      let newList = update(list, {
        [rowIndex]: {
          [rowField]: {
            $set: val,
          },
        },
      });
      // 当期实际付款金额 应 小于或等于 当期付款金额， 如果不满足条件，则直接替换为可以填写的最大金额，即 payAmt
      if (rowField === 'actualPayAmt') {
        const { payAmt } = list[rowIndex];
        if (!gte(payAmt, val)) val = payAmt;
        newList = update(list, {
          [rowIndex]: {
            [rowField]: { $set: val },
            unPayAmt: { $set: sub(payAmt, val || 0) },
          },
        });
      }
      // 当期付款金额改变时，把当期实际付款金额置空，
      if (rowField === 'payAmt') {
        const otherSumAmt = this.calcItemsSum(
          list.filter((_, index) => index !== rowIndex).filter(l => l.lineNo !== -1),
          'payAmt'
        );
        const maxPayAmt = sub(formData.amt, otherSumAmt);
        const value = gte(maxPayAmt, val) ? val : maxPayAmt;
        newList = update(list, {
          [rowIndex]: {
            [rowField]: { $set: value },
            actualPayAmt: { $set: value },
            unPayAmt: { $set: 0 },
          },
        });
      }
      // 更新单元格状态
      if (rowField === 'payAmt' || rowField === 'actualPayAmt') {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            list: this.calcList(newList),
          },
        });
      } else {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            list: newList,
          },
        });
      }
    };

    const tableProps = {
      rowKey: 'lineNo',
      showCopy: false,
      loading: loading.effects[`${DOMAIN}/queryPurchase`],
      scroll: {
        x: 1700,
      },
      dataSource: list,
      rowSelection: {
        selectedRowKeys,
        onChange: (_selectedRowKeys, selectedRows) => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              selectedRowKeys: _selectedRowKeys.filter(key => key !== -1),
            },
          });
        },
      },
      onAdd: newRow => {
        const firstLine = isEmpty(list);
        const hasSum = firstLine ? false : takeLast(1, list)[0].lineNo === -1;
        const pushItem = firstLine
          ? {
              ...newRow,
              lineNo: 1,
              taxRate: formData.taxRate,
              id: genFakeId(-1),
            }
          : {
              ...newRow,
              lineNo: add(takeLast(hasSum ? 2 : 1, list)[0].lineNo, 1),
              taxRate: formData.taxRate,
              id: genFakeId(-1),
            };
        const sumItem = Object.keys(newRow)
          // eslint-disable-next-line
          .map(key => {
            if (key === 'actualPayAmt' || key === 'unPayAmt') return { [key]: undefined };
            return { [key]: -1 };
          })
          // eslint-disable-next-line
          .reduce((prev, curr) => {
            return { ...prev, ...curr };
          }, {});
        const compileList = firstLine
          ? [pushItem, sumItem]
          : [...(hasSum ? list.filter(({ lineNo }) => lineNo !== -1) : list), pushItem, sumItem];
        const finalList = this.calcList(compileList);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            list: finalList,
          },
        });
      },
      onDeleteItems: (_, selectedRows) => {
        const deleteIds = selectedRows
          .filter(row => row.lineNo !== -1 || !row.id.includes('new'))
          .map(row => row.id);
        const newList = list.filter(({ id }) => !deleteIds.includes(id));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            deletedKeys: [...deletedKeys, ...deleteIds].filter(v => !(v <= 0)),
            list: newList,
          },
        });
      },
      columns: [
        {
          title: '行号',
          dataIndex: 'lineNo',
          className: 'text-center',
          width: 100,
          render: (value, record, index) => (value === -1 ? '合计' : value),
        },
        {
          title: '付款阶段号',
          dataIndex: 'stage',
          className: 'text-center',
          width: 200,
          render: (value, record, index) =>
            value === -1 ? undefined : `${formData.contractNo}-${record.lineNo}`,
        },
        {
          title: '付款阶段名称',
          dataIndex: 'phaseDesc',
          width: 200,
          options: {
            rules: [
              {
                required: true,
                message: '请选择付款阶段名称',
              },
            ],
          },
          render: (value, row, index) =>
            value === -1 ? (
              undefined
            ) : (
              <Input
                className="x-fill-100"
                size="small"
                value={value}
                placeholder="请输入付款阶段名称"
                onChange={onCellChanged(index, 'phaseDesc')}
              />
            ),
        },
        {
          title: '当期付款金额',
          dataIndex: 'payAmt',
          className: 'text-right',
          width: 200,
          options: {
            rules: [
              {
                required: true,
                message: '请选择当期付款金额',
              },
              {
                validator: (rule, value, callback) => {
                  if (isNil(value)) {
                    callback();
                  } else {
                    const error = [];
                    if (!checkIfNumber(value)) error.push('输入类型不正确');
                    callback(error);
                  }
                },
              },
            ],
          },
          render: (value, row, index) =>
            value === -1 ? (
              undefined
            ) : (
              <Input
                className="x-fill-100"
                size="small"
                value={value}
                placeholder="请输入当期付款金额"
                onChange={onCellChanged(index, 'payAmt')}
              />
            ),
        },
        {
          title: '当期付款比例',
          dataIndex: 'payRatio',
          className: 'text-right',
          width: 200,
          render: (value, row, index) =>
            value === -1
              ? undefined
              : `${mul(div(row.payAmt || 0, formData.amt), 100).toFixed(2)}%`,
        },
        {
          title: '预计付款日期',
          dataIndex: 'planPayDate',
          width: 150,
          options: {
            rules: [
              {
                required: true,
                message: '请选择预计付款日期',
              },
            ],
          },
          render: (value, row, index) =>
            value === -1 ? (
              undefined
            ) : (
              <DatePicker
                className="x-fill-100"
                format="YYYY-MM-DD"
                defaultValue={typeof value === 'string' ? moment(value) : value}
                onChange={onCellChanged(index, 'planPayDate')}
              />
            ),
        },
        {
          title: '付款状态',
          dataIndex: 'payStatus',
          className: 'text-center',
          width: 150,
          options: {
            rules: [
              {
                required: true,
                message: '请选择付款状态',
              },
            ],
          },
          render: (value, row, index) =>
            value === -1 ? (
              undefined
            ) : (
              <AsyncSelect
                className="x-fill-100"
                value={value}
                source={payStatusUDC}
                placeholder="请选择付款状态"
                onChange={onCellChanged(index, 'payStatus')}
              />
            ),
        },
        {
          title: '税率',
          dataIndex: 'taxRate',
          className: 'text-right',
          width: 100,
          render: (value, row, index) => (value === -1 ? undefined : `${value}%`),
        },
        {
          title: '当期实际付款金额',
          dataIndex: 'actualPayAmt',
          className: 'text-right',
          width: 100,
          options: {
            rules: [
              {
                required: true,
                message: '请选择当期实际付款金额',
              },
              {
                validator: (rule, value, callback) => {
                  if (isNil(value)) {
                    callback();
                  } else {
                    const error = [];
                    if (!checkIfNumber(value)) error.push('输入类型不正确');
                    callback(error);
                  }
                },
              },
            ],
          },
          render: (value, row, index) =>
            row.lineNo === -1 ? (
              value
            ) : (
              <Input
                className="x-fill-100"
                size="small"
                value={value}
                placeholder="请输入当期付款金额"
                onChange={onCellChanged(index, 'actualPayAmt')}
              />
            ),
        },
        {
          title: '当期未付金额',
          dataIndex: 'unPayAmt',
          className: 'text-right',
          width: 100,
        },
      ],
      pagination: false,
    };
    return tableProps;
  };

  render() {
    const {
      loading,
      userContractPurchaseEdit: { formData, udcType1, udcType2, deletedKeys },
      form: { getFieldDecorator },
    } = this.props;
    const readOnly = true;
    const { id } = fromQs();
    console.warn(deletedKeys);

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryPurchase`] || loading.effects[`${DOMAIN}/saveEdit`];

    return (
      <PageHeaderWrapper title="采购合同">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
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
            <Title
              icon="profile"
              id="user.contract.menu.editPurchases"
              defaultMessage="修改采购合同"
            />
          }
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="contractName"
              label="合同名称"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.contractName,
                rules: [
                  {
                    required: true,
                    message: '请输入合同名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入合同名称" />
            </Field>

            {!isNil(formData.subContractId) && (
              <Field
                name="serviceType"
                label="项目采购类型"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.serviceType,
                  rules: [
                    {
                      required: true,
                      message: '请选择项目采购类型',
                    },
                  ],
                }}
              >
                <Selection.UDC code="TSK:PURCHASE_SERVICE_TYPE" placeholder="请选择项目采购类型" />
              </Field>
            )}

            <Field
              name="contractNo"
              label="编号"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.contractNo,
              }}
            >
              <Input disabled={readOnly} placeholder="系统生成" />
            </Field>

            <Field
              name="platType"
              label="平台合同类型"
              decorator={{
                initialValue: formData.platType,
                rules: [
                  {
                    required: true,
                    message: '请选择平台合同类型',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <UdcSelect code="TSK.PLAT_TYPE" placeholder="请选择平台合同类型" />
            </Field>

            <Field
              name="signDate"
              label="签约日期"
              decorator={{
                initialValue: formData.signDate ? moment(formData.signDate) : null,
              }}
              {...FieldListLayout}
            >
              <DatePicker placeholder="请选择签约日期" format="YYYY-MM-DD" className="x-fill-100" />
            </Field>

            <Field
              name="purchaseType"
              label="采购类型"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.purchaseType,
                rules: [
                  {
                    required: true,
                    message: '请选择采购类型',
                  },
                ],
              }}
            >
              <UdcSelect code="TSK.PURCHASE_TYPE" placeholder="请选择采购类型" disabled />
            </Field>

            <Field
              name="subContractName"
              label="关联子合同"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.subContractName,
                rules: [
                  {
                    required: false,
                    message: '请选择关联子合同',
                  },
                ],
              }}
            >
              <Input disabled={readOnly} placeholder="请选择关联子合同" />
            </Field>

            <Field
              name="purchaseType1"
              label="采购大类"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.purchaseType1Desc,
                rules: [
                  {
                    required: true,
                    message: '请选择采购大类',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={udcType1}
                placeholder="请选择采购大类"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={this.handleUdc1Change}
              />
            </Field>

            <Field
              name="purchaseType2"
              label="采购小类"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.purchaseType2Desc,
              }}
            >
              <AsyncSelect
                source={udcType2}
                placeholder="请选择采购小类"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Field>

            <Field
              name="productName"
              label="采购产品"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.productName,
                rules: [
                  {
                    required: true,
                    message: '请输入采购产品',
                  },
                ],
              }}
            >
              <Input placeholder="请输入采购产品" />
            </Field>

            <Field
              name="briefDesc"
              label="采购内容简述"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.briefDesc,
              }}
            >
              <Input placeholder="请选择采购内容简述" />
            </Field>

            <FieldLine label="金额/税率" {...FieldListLayout} required>
              <Field
                name="amt"
                decorator={{
                  initialValue: formData.amt,
                  rules: [
                    {
                      required: true,
                      message: '请输入金额',
                    },
                  ],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <InputNumber placeholder="请输入含税总金额" className="x-fill-100" />
              </Field>
              <Field
                name="taxRate"
                decorator={{
                  initialValue: formData.taxRate,
                  rules: [
                    {
                      required: true,
                      message: '请输入税率',
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (isNil(value)) {
                          callback();
                        } else {
                          if (!checkIfNumber(value)) callback(['输入类型不正确']);
                          else if (!gte(value, 0) && !lte(value, 100))
                            callback(['请输入0-100之间的整数']);
                          callback();
                        }
                      },
                    },
                  ],
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input type="number" addonAfter="%" placeholder="请输入税率" />
              </Field>
            </FieldLine>

            <Field
              name="excluding"
              label="不含税金额"
              {...FieldListLayout}
              decorator={{
                initialValue:
                  formData.amt && formData.taxRate
                    ? (formData.amt / (1 + +formData.taxRate / 100)).toFixed(2)
                    : 0,
              }}
            >
              <InputNumber
                disabled={readOnly}
                placeholder="金额/税率自动带出"
                className="x-fill-100"
              />
            </Field>

            <Field
              name="purchaseBuId"
              label="采购主体BU"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.purchaseBuId,
                rules: [
                  {
                    required: true,
                    message: '请选择采购主体BU',
                  },
                ],
              }}
            >
              {/* <AsyncSelect
                source={() => selectBu().then(resp => resp.response)}
                placeholder="请选择采购主体BU"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={this.linkageBu}
              /> */}
              <Selection.ColumnsForBu onChange={this.linkageBu} />
            </Field>

            <FieldLine label="采购主体法人/法人号" {...FieldListLayout}>
              <Field
                name="purchaseLegalName"
                decorator={{
                  initialValue: formData.purchaseLegalName,
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <AsyncSelect
                  source={() => selectAbOus().then(resp => resp.response)}
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={this.handlePurchaseLegal}
                  placeholder="请选择采购主体法人"
                />
              </Field>
              <Field
                name="purchaseLegalNo"
                decorator={{
                  initialValue: formData.purchaseLegalNo,
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input disabled={readOnly} placeholder="请输入法人号" />
              </Field>
            </FieldLine>

            <FieldLine label="供应商号/BU" {...FieldListLayout} required>
              <Field
                name="supplierId"
                decorator={{
                  initialValue: formData.supplierId,
                  rules: [
                    {
                      required: true,
                      message: '请输入供应商号',
                    },
                  ],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <AsyncSelect
                  source={() => selectSupplier().then(resp => resp.response)}
                  placeholder="请选择供应商号"
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={this.linkageSupplier}
                />
              </Field>
              <Field
                name="supplierBuId"
                decorator={{
                  initialValue: formData.supplierBuId,
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input disabled={readOnly} />
              </Field>
            </FieldLine>

            <FieldLine label="供应商法人/法人号" {...FieldListLayout}>
              <Field
                name="supplierLegalName"
                decorator={{
                  initialValue: formData.supplierLegalName,
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <AsyncSelect
                  source={() => selectAbOus().then(resp => resp.response)}
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={this.handleSupplier}
                  placeholder="请输入供应商法人"
                  // disabled={readOnly}
                />
              </Field>
              <Field
                name="supplierLegalNo"
                decorator={{
                  initialValue: formData.supplierLegalNo,
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input disabled={readOnly} placeholder="请输入法人号" />
              </Field>
            </FieldLine>

            <Field
              name="purchaseInchargeResId"
              label="采购负责人"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.purchaseInchargeResId,
                rules: [
                  {
                    required: true,
                    message: '采购负责人不能为空',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={() => selectUsers().then(resp => resp.response)}
                placeholder="请选择采购负责人"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                // onChange={this.linkageSupplier}
              />
            </Field>

            <Field
              presentational
              label="合同相关附件"
              {...FieldListLayout}
              decorator={{
                initialValue: null,
              }}
            >
              <FileManagerEnhance
                api="/api/op/v1/contract/purchase/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>

            <Field
              presentational
              label="比价资料"
              {...FieldListLayout}
              decorator={{
                initialValue: null,
              }}
            >
              <FileManagerEnhance
                api="/api/op/v1/contract/parity/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>

            <Field
              name="thirdPartFlag"
              label="是否第三方外包"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.thirdPartFlag,
              }}
            >
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            </Field>

            <Field
              name="contractStatus"
              label="合同状态"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.contractStatus,
              }}
            >
              <UdcSelect
                disabled={readOnly}
                code="TSK.CONTRACT_STATUS"
                placeholder="请选择合同状态"
              />
            </Field>

            <Field
              name="closeReason"
              label="关闭原因"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.closeReason,
              }}
            >
              <UdcSelect
                disabled={readOnly}
                code="TSK.CONTRACT_CLOSE_REASON"
                placeholder="请选择关闭原因"
              />
            </Field>

            {formData.purchaseType === 'PROJECT' && (
              <Field
                name="deliBuName"
                label="交付BU"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.deliBuName,
                }}
              >
                <Input disabled={readOnly} placeholder="请选择签单BU" />
              </Field>
            )}

            {formData.purchaseType === 'PROJECT' && (
              <Field
                name="deliResId"
                label="交付负责人"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.deliResId,
                }}
              >
                <AsyncSelect
                  source={() => selectUsers().then(resp => resp.response)}
                  placeholder="请选择交付负责人"
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  disabled={readOnly}
                />
              </Field>
            )}

            {formData.purchaseType === 'PROJECT' && (
              <Field
                name="signBuName"
                label="签单BU"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.signBuName,
                }}
              >
                <Input disabled={readOnly} placeholder="请选择签单BU" />
              </Field>
            )}

            {formData.purchaseType === 'PROJECT' && (
              <Field
                name="salesmanResId"
                label="销售负责人"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.salesmanResId,
                }}
              >
                <AsyncSelect
                  source={() => selectUsers().then(resp => resp.response)}
                  placeholder="请选择销售负责人"
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  disabled={readOnly}
                />
              </Field>
            )}

            <Field
              name="activateDate"
              label="激活时间"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.activateDate ? moment(formData.activateDate) : null,
              }}
            >
              <DatePicker
                placeholder="请选择激活时间"
                format="YYYY-MM-DD"
                className="x-fill-100"
                disabled={readOnly}
              />
            </Field>

            <Field
              name="closeDate"
              label="关闭时间"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.closeDate ? moment(formData.closeDate) : null,
              }}
            >
              <DatePicker
                placeholder="请选择关闭时间"
                format="YYYY-MM-DD"
                className="x-fill-100"
                disabled={readOnly}
              />
            </Field>

            <Field
              name="currCode"
              label="币种"
              decorator={{
                initialValue: formData.currCode,
              }}
              {...FieldListLayout}
            >
              <UdcSelect code="COM.CURRENCY_KIND" placeholder="请选择币种" />
            </Field>
            <Field
              name="specCode"
              label="特殊关联码"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.specCode,
              }}
            >
              <Input placeholder="请输入特殊关联码" />
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
              <Input.TextArea placeholder="请输入备注" rows={3} />
            </Field>

            <Field
              name="createUserName"
              label="创建人"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.createUserName,
              }}
            >
              <Input disabled={readOnly} placeholder="系统生成" />
            </Field>

            <Field
              name="createTime"
              label="创建日期"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.createTime,
              }}
            >
              <Input disabled={readOnly} placeholder="系统生成" />
            </Field>
          </FieldList>
        </Card>
        <Divider dashed />
        <Card className="tw-card-adjust" title="采购合同付款计划" bordered={false}>
          <EditableDataTable {...this.tableProps()} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PurchaseEdit;
