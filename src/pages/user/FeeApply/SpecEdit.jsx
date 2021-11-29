import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Divider, Form, Input, InputNumber, DatePicker, TreeSelect } from 'antd';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import update from 'immutability-helper';
import classnames from 'classnames';
import moment from 'moment';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import createMessage from '@/components/core/AlertMessage';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import { selectUsers } from '@/services/sys/user';
import { selectBus } from '@/services/org/bu/bu';
import { genFakeId } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import { UdcSelect } from '@/pages/gen/field';

const { Field, FieldLine } = FieldList;
const { TreeNode } = TreeSelect;
// chore
const DOMAIN = 'userFeeApplySpecEdit';

// 递归渲染树节点
const loop = data =>
  data.map(item => {
    if (item.children) {
      return (
        <TreeNode key={`${item.accName}-${item.id}`} title={item.accName} value={item}>
          {!isEmpty(item.children) && loop(item.children)}
        </TreeNode>
      );
    }
    return <TreeNode key={`${item.accName}-${item.id}`} title={item.accName} value={item} />;
  });

@connect(({ loading, userFeeApplySpecEdit, dispatch }) => ({
  loading,
  userFeeApplySpecEdit,
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
@mountToTab()
class SpecEdit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      projectDisabled: true, // 是否项目相关 默认否，只读
      sumBuId: null, // 费用归属BU
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id: param.id },
      });
    }
  }

  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      userFeeApplySpecEdit: { dataSource },
      dispatch,
      form,
    } = this.props;

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
    // 费用金额求和
    let sum = 0;
    newDataSource.forEach((item, i) => {
      if (item.applyAmt) {
        sum += parseInt(item.applyAmt, 10);
      }
    });
    form.setFieldsValue({
      applyAmt: sum,
    });
  };

  // 保存按钮事件
  handleSave = isSubmit => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      userFeeApplySpecEdit: { formData, dataSource, deleteList },
    } = this.props;

    if (isSubmit) {
      // 提交时校验 用途类型、费用码、是否项目相关、费用承担BU、费用科目、费用金额
      if (!formData.usageType) {
        createMessage({ type: 'error', description: `用途类型必填` });
        return;
      }
      // if (!formData.feeCode) {
      //   createMessage({ type: 'error', description: `费用码必填` });
      //   return;
      // }
      if (!formData.applyType) {
        createMessage({ type: 'error', description: `是否项目相关选项必填` });
        return;
      }
      if (!formData.expenseBuId) {
        createMessage({ type: 'error', description: `费用承担BU必填` });
        return;
      }
      if (!formData.applyAmt) {
        createMessage({ type: 'error', description: `费用总额不能为空` });
        return;
      }
      // if (dataSource.filter(v => !v.accId).length) {
      //   createMessage({ type: 'error', description: `费用科目必填` });
      //   return;
      // }
      if (dataSource.filter(v => !v.applyAmt).length) {
        createMessage({ type: 'error', description: `费用金额必填` });
        return;
      }
    }
    // 是否项目：选中项目时，事由号必填
    if (formData.applyType === 'PROJECT' && !formData.reasonId) {
      createMessage({ type: 'error', description: `选中项目时，事由号必填` });
      return;
    }
    // 浮点数校验
    const re = /^[0-9]+.?[0-9]*$/;
    const applyAmtNotNumError = dataSource.filter(v => v.applyAmt && !re.test(v.applyAmt));
    const applyAmtError = dataSource.filter(
      v => v.applyAmt && parseFloat(v.applyAmt) > 999999999999
    );

    if (applyAmtNotNumError.length) {
      createMessage({ type: 'error', description: `费用金额为浮点数` });
      return;
    }

    if (applyAmtError.length) {
      createMessage({ type: 'error', description: `费用金额已超最大值999999999999` });
      return;
    }

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { apprId = null, remark = null } = fromQs();
        dispatch({
          type: `${DOMAIN}/save`, // isSubmit===true提交
          payload: { formData, dataSource, deleteList, isSubmit, apprId, remark },
        });
      }
    });
  };

  // 是否项目相关change事件
  handleChangeApplyType = value => {
    const {
      dispatch,
      form,
      userFeeApplySpecEdit: { formData },
    } = this.props;
    formData.applyType = value;
    form.setFieldsValue({
      reasonId: null,
      custId: null,
      expenseBuId: null,
      sumBuId: null,
      applyType: value,
    });
    if (value === 'PROJECT') {
      // 项目，事由号可编辑
      this.setState({ projectDisabled: false });
    } else {
      this.setState({ projectDisabled: true });
      dispatch({
        type: `${DOMAIN}/queryByProjId`,
        payload: { projId: null, formData },
      });
    }
  };

  // 事由号change事件
  handleChangeReasonId = value => {
    const { dispatch, form } = this.props;
    form.setFieldsValue({
      reasonId: value,
    });
    dispatch({
      type: `${DOMAIN}/queryByProjId`,
      payload: { projId: value },
    }).then(reason => {
      const {
        userFeeApplySpecEdit: { formData },
      } = this.props;

      form.setFieldsValue({
        custId: formData.custId,
        expenseBuId: formData.expenseBuId,
        sumBuId: formData.sumBuId,
      });

      // 根据费用承担bu.id获取费用科目树
      if (formData.expenseBuId) {
        dispatch({
          type: `${DOMAIN}/queryByBuId`,
          payload: { expenseBuId: formData.expenseBuId },
        });
      }
    });
  };

  // 费用承担BU change事件
  handleChangeExpenseBuId = value => {
    const {
      dispatch,
      form,
      userFeeApplySpecEdit: { buDataList, dataSource },
    } = this.props;
    const { sumBuId } = this.state;
    form.setFieldsValue({
      expenseBuId: value,
    });

    // 根据费用承担bu,获取费用归属BUid
    buDataList.map(item => {
      if (item.id + '' === value) {
        form.setFieldsValue({
          sumBuId: item.sumBuId,
        });
      }
      return item;
    });
    if (!value) {
      form.setFieldsValue({
        sumBuId: null,
      });
    }
    // 清空费用科目
    dataSource.map(item => {
      const newItem = item;
      newItem.accName = null;
      return item;
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: dataSource,
    });
    // 根据费用承担bu.id获取费用科目树
    if (value) {
      dispatch({
        type: `${DOMAIN}/queryByBuId`,
        payload: { expenseBuId: value },
      });
    }
  };

  // 科目选择触发事件
  onSelect = (rowIndex, rowField) => rowFieldValue => {
    const {
      userFeeApplySpecEdit: { dataSource, data },
      dispatch,
    } = this.props;

    const newDataSource = dataSource;
    newDataSource[rowIndex] = {
      ...newDataSource[rowIndex],
      [rowField]: rowFieldValue && rowFieldValue.id,
    };
    newDataSource[rowIndex] = {
      ...newDataSource[rowIndex],
      accName: rowFieldValue && rowFieldValue.accName,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      userFeeApplySpecEdit: {
        formData,
        dataSource,
        projDataList,
        custDataList,
        buDataList,
        accDataList,
      },
      form: { getFieldDecorator },
    } = this.props;
    const { projectDisabled } = this.state;
    const disabledBtn = loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`];

    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: 0,
      dataSource,
      showCopy: false,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: update(dataSource, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  accName: '',
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (_selectedRowKeys, selectedRows) => {
        const newDataSource = dataSource.filter(
          row => !_selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: newDataSource.map((item, index) => ({ ...item })),
            deleteList: _selectedRowKeys,
          },
        });
      },
      columns: [
        // {
        //   title: '费用科目',
        //   dataIndex: 'accId',
        //   required: false,
        //   width: '20%',
        //   render: (value, row, index) => (
        //     <TreeSelect
        //       value={row.accName}
        //       style={{ width: 300 }}
        //       dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        //       defaultExpandAll
        //       onSelect={this.onSelect(index, 'accId')}
        //     >
        //       {accDataList && loop(accDataList)}
        //     </TreeSelect>
        //   ),
        // },
        {
          title: '费用金额',
          dataIndex: 'applyAmt',
          required: false,
          align: 'right',
          width: '20%',
          render: (value, row, index) => (
            <InputNumber
              value={value}
              className="x-fill-100"
              precision={2} // 小数点两位
              onChange={this.onCellChanged(index, 'applyAmt')}
            />
          ),
        },
        {
          title: '费用说明',
          dataIndex: 'feeDesc',
          required: false,
          align: 'right',
          render: (value, row, index) => (
            <Input value={value} onChange={this.onCellChanged(index, 'feeDesc')} maxLength={90} />
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          {/* <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={() => {
              this.handleSave(false);
            }}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button> */}
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={() => {
              this.handleSave(true);
            }}
          >
            提交
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto(`/plat/expense/spec/list`)}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="ui.menu.user.feeapply.specEdit"
              defaultMessage="特殊费用申请编辑"
            />
          }
        >
          <div className="tw-card-title">特殊费用申请信息</div>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="applyNo"
              label="申请单号"
              decorator={{
                initialValue: formData.applyNo,
                rules: [
                  {
                    required: false,
                    message: '请输入申请单号',
                  },
                ],
              }}
            >
              <Input placeholder="系统生成" disabled />
            </Field>

            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: formData.applyResId,
                rules: [
                  {
                    required: false,
                    message: '请输入申请人',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={() => selectUsers().then(resp => resp.response)}
                placeholder="请选择特殊费用申请人"
                showSearch
                disabled
              />
            </Field>

            <Field
              name="applyName"
              label="申请单名称"
              decorator={{
                initialValue: formData.applyName,
                rules: [
                  {
                    required: true,
                    message: '请输入申请单名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入申请单名称" />
            </Field>

            <Field
              name="applyBuId"
              label="申请人baseBU"
              decorator={{
                initialValue: formData.applyBuId,
              }}
            >
              <AsyncSelect
                source={() => selectBus().then(resp => resp.response)}
                placeholder="请输入所属组织"
                disabled
              />
            </Field>

            {/* <FieldLine label="用途类型/费用码"> */}
            <Field
              name="usageType"
              label="用途类型"
              decorator={{
                initialValue: formData.usageType,
              }}
              // wrapperCol={{ span: 23, xxl: 23 }}
            >
              <UdcSelect code="ACC.EXP_USE_TYPE" placeholder="请选择用途类型" />
            </Field>
            {/* <Field
              name="feeCode"
              decorator={{
                initialValue: formData.feeCode,
                rules: [
                  {
                    required: false,
                    message: '请选择费用码',
                  },
                ],
              }}
              wrapperCol={{ span: 23, xxl: 23 }}
            >
              <UdcSelect code="ACC.ACC_CAT02" placeholder="请选择费用码" />
            </Field>
          </FieldLine> */}

            <FieldLine label="是否项目相关/事由号">
              <Field
                name="applyType"
                decorator={{
                  initialValue: formData.applyType,
                  rules: [
                    {
                      required: true,
                      message: '请选择是否项目相关',
                    },
                  ],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <UdcSelect
                  code="ACC.PROJECT_JUDGE"
                  placeholder="请选择是否项目相关"
                  onChange={this.handleChangeApplyType}
                />
              </Field>
              <Field
                name="reasonId"
                decorator={{
                  initialValue: formData.reasonId,
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <AsyncSelect
                  source={projDataList}
                  disabled={formData.applyType === 'NONPROJECT' ? projectDisabled : false}
                  onChange={this.handleChangeReasonId}
                />
              </Field>
            </FieldLine>

            <Field
              name="custId"
              label="客户"
              decorator={{
                initialValue: formData.custId,
              }}
            >
              <AsyncSelect
                source={custDataList}
                disabled={formData.applyType === 'NONPROJECT' ? !projectDisabled : true}
              />
            </Field>

            <Field
              name="expenseBuId"
              label="费用承担BU"
              decorator={{
                initialValue: formData.expenseBuId,
              }}
            >
              <AsyncSelect
                source={buDataList}
                disabled={formData.applyType === 'NONPROJECT' ? !projectDisabled : true}
                onChange={this.handleChangeExpenseBuId}
              />
            </Field>

            <Field
              name="expectDate"
              label="费用预计使用日期"
              decorator={{
                initialValue: formData.expectDate && moment(formData.expectDate),
                rules: [
                  {
                    required: false,
                    message: '请选择费用预计使用日期',
                  },
                ],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>

            <Field
              name="sumBuId"
              label="费用归属BU"
              decorator={{
                initialValue: formData.sumBuId,
              }}
            >
              <AsyncSelect
                source={() => selectBus().then(resp => resp.response)}
                showSearch
                disabled
              />
            </Field>

            <Field
              name="applyAmt"
              label="费用总额"
              decorator={{
                initialValue: formData.applyAmt,
              }}
            >
              <Input disabled />
            </Field>

            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate,
              }}
            >
              <Input placeholder="系统生成" disabled />
            </Field>

            <Field
              name="apprStatusName"
              label="申请状态"
              decorator={{
                initialValue: formData.apprStatusName,
              }}
            >
              <Input placeholder="申请状态" disabled />
            </Field>

            <Field
              name="remark"
              label="费用申请原因说明"
              decorator={{
                initialValue: formData.remark,
                rules: [{ required: false }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="请输入费用申请原因说明" rows={3} maxLength={400} />
            </Field>
          </FieldList>
          <Divider dashed />

          <div className="tw-card-title">费用明细信息</div>
          <EditableDataTable {...editTableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SpecEdit;
