/* eslint-disable prefer-destructuring */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, InputNumber, Table, Button, Form, Card, Spin } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import classnames from 'classnames';

import { isEmpty, isNil, clone, toLower } from 'ramda';
import update from 'immutability-helper';
import EditableDataTable from '@/components/common/EditableDataTable';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { fromQs } from '@/utils/stringUtils';
import { selectBu, selectSupplier } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { add, checkIfNumber, div, mul, sub, genFakeId } from '@/utils/mathUtils';
import { selectUsers } from '@/services/sys/user';
import { mountToTab, injectUdc } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import DataTable from '@/components/common/DataTable';
import { Selection, UdcSelect } from '@/pages/gen/field';
import { selectRecvPlanMultiCol } from '@/services/plat/recv/Contract';

// 子合同维护  收益分配   子合同收益分配规则
const DOMAIN = 'sharingEdit';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ dispath, loading, sharingEdit, global }) => ({
  dispath,
  loading,
  sharingEdit,
  global,
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
class SharingEdit extends PureComponent {
  state = {};

  componentDidMount() {
    const {
      dispatch,
      sharingEdit: {
        formData: { profitRuleId },
      },
    } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/queryDetails`,
      payload: { contractId: id },
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      sharingEdit: { formData, delList, ruleList, normSettleView, normSettleViewDel },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (formData.benefitDistributionCode === 'S' && isEmpty(ruleList)) {
          createMessage({ type: 'warn', description: '特殊分类配-分配规则不饿能为空!' });
          return;
        }

        const tt = normSettleView.filter(
          v => (!v.fromBu && !v.fromResNo) || (!v.toBu && !v.toResNo)
        );
        if (!isEmpty(tt)) {
          createMessage({ type: 'warn', description: '请正确填写泛用结算单支出方和收入方!' });
          return;
        }

        const tt1 = normSettleView.filter(v => !v.type || isNil(v.estimatedTotalAmount));
        if (!isEmpty(tt1)) {
          createMessage({ type: 'warn', description: '请补全泛用结算单中的必填信息!' });
          return;
        }

        dispatch({
          type: `${DOMAIN}/saveNewRule`,
          payload: {
            ...formData,
            rows: ruleList,
            normSettleView,
            delIds1: delList,
            delIds2: normSettleViewDel,
          },
        });
      }
    });
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      sharingEdit: { formData, dataList, ruleList },
    } = this.props;

    const { amt = 0, effectiveAmt = 0, grossProfit = 0, taxRate = 0 } = formData; // 合同总金额、有效合同额、毛利、税率

    let value = null;
    const rowData = ruleList[rowIndex];
    const mainData = dataList[0]; // 主表的值

    let groupPercent = rowData.groupPercent;
    const gainerIngroupPercent = rowData.gainerIngroupPercent;
    let groupBaseType = rowData.groupBaseType;
    let groupBaseTypeDesc = rowData.groupBaseTypeDesc;
    let ruleNo = rowData.ruleNo;
    let $groupPercent = 0;
    if (rowField === 'remark') {
      value = rowFieldValue.target.value;
    } else if (rowField === 'groupRole') {
      value = rowFieldValue;
      switch (rowFieldValue) {
        case 'LEADS': {
          // 平台销售支持 对应 平台销售抽成比例
          groupPercent = mainData.leadsSharePercent;
          groupBaseType = mainData.leadsShareBase;
          groupBaseTypeDesc = mainData.leadsShareBaseName;
          break;
        }
        case 'DELI': {
          // 销售区域 对应 售前抽成比例
          groupPercent = mainData.deliSharePercent;
          groupBaseType = mainData.deliShareBase;
          groupBaseTypeDesc = mainData.deliShareBaseName;
          break;
        }
        case 'SIGN': {
          // 签单BU 对应 签单抽成比例
          groupPercent = mainData.signSharePercent;
          groupBaseType = mainData.signShareBase;
          groupBaseTypeDesc = mainData.signShareBaseName;
          break;
        }
        case 'PLAT': {
          // 签单BU 对应 签单抽成比例
          groupPercent = mainData.platSharePercent;
          groupBaseType = mainData.platShareBase;
          groupBaseTypeDesc = mainData.platShareBaseName;
          break;
        }
        default: {
          // ‘PLAT’ 平台抽成 对应 平台抽成比例
          groupPercent = mainData.platSharePercent;
          groupBaseType = mainData.platShareBase;
          groupBaseTypeDesc = mainData.platShareBaseName;
        }
      }
      // 需求423 同一利益分配角色，利益分配比例相等，但是可以修改，利益分配比例或者基于 发生修改时，分配规则吗清空 ,同一利益分配角色，收益占比想家为100
    } else if (rowField === 'groupPercent') {
      // 利益分配比例发生修改时，分配规则吗清空
      value = rowFieldValue;
      groupPercent = value;
      // 利益分配比例 变化时  保存初始的比例  继承于主表
      if (rowData.groupRole === 'LEADS') {
        $groupPercent = mainData.leadsSharePercent;
      } else if (rowData.groupRole === 'DELI') {
        $groupPercent = mainData.deliSharePercent;
      } else if (rowData.groupRole === 'SIGN') {
        $groupPercent = mainData.signSharePercent;
      } else if (rowData.groupRole === 'PLAT') {
        $groupPercent = mainData.platSharePercent;
      }
      // rowFieldValue 等于原始值 分配规则码/基于恢复原样   否则 为空
      if (rowFieldValue === $groupPercent) {
        ruleNo = mainData.ruleNo;
        const a = toLower(rowData.groupRole) + 'ShareBase';
        const b = toLower(rowData.groupRole) + 'ShareBaseName';
        groupBaseType = mainData[a];
        groupBaseTypeDesc = mainData[b];
      } else {
        ruleNo = '';
      }

      // 计算预计分配金额
      let expectDistAmt = 0;
      const allocationProportion = div(mul(value, gainerIngroupPercent || 0), 100); // 实际利益分配比例
      if (groupBaseType === 'NETSALE') {
        // 签单额(不含税)=合同含税总金额/(1+税率)*实际分配比例
        expectDistAmt = div(mul(div(amt, add(1, div(taxRate, 100))), allocationProportion), 100);
      } else if (groupBaseType === 'EFFSALE') {
        // 有效销售额=合同有效销售额*实际利益分配比例
        expectDistAmt = div(mul(effectiveAmt, allocationProportion), 100);
      } else if (groupBaseType === 'MARGIN') {
        // 毛利=合同毛利*实际利益分配比例
        expectDistAmt = div(mul(grossProfit, allocationProportion), 100);
      }
      const newDataList = update(ruleList, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
          groupPercent: {
            $set: groupPercent,
          },
          groupBaseType: {
            $set: groupBaseType,
          },
          groupBaseTypeDesc: {
            $set: groupBaseTypeDesc,
          },
          ruleNo: {
            $set: ruleNo,
          },
          expectDistAmt: {
            $set: expectDistAmt,
          },
        },
      });
      ruleList[rowIndex].expectDistAmt = expectDistAmt; // update方法无法修改此值，所以此处强制修改
      // 预计可分配金额总和(不包括交付bu)
      const sumExpAmt = ruleList
        .filter(list => list.groupRole !== 'DELIVER')
        .map(list => list.expectDistAmt)
        .reduce((sum, val) => add(sum || 0, val || 0), 0);
      const buDistAmt = sub(amt, sumExpAmt);
      // ruleList[rowIndex].expectDistAmt = buDistAmt;// ,所以此处强制修改
      // eslint-disable-next-line no-restricted-syntax
      for (const v of ruleList) {
        if (v.groupRole === 'DELIVER') {
          v.expectDistAmt = buDistAmt;
          break;
        }
      }

      dispatch({ type: `${DOMAIN}/updateState`, payload: { ruleList: newDataList } });
    } else if (rowField === 'groupBaseTypeDesc') {
      // 基于 发生修改时，分配规则吗清空
      value = rowFieldValue;
      switch (rowFieldValue) {
        case 'MARGIN': {
          // 毛利
          groupBaseType = rowFieldValue;
          groupBaseTypeDesc = '毛利';
          ruleNo = '';
          break;
        }
        case 'EFFSALE': {
          // 有效
          ruleNo = '';
          groupBaseType = rowFieldValue;
          groupBaseTypeDesc = '有效销售额';
          break;
        }
        case 'NETSALE': {
          // 签单
          ruleNo = '';
          groupBaseType = rowFieldValue;
          groupBaseTypeDesc = '签单额(不含税)';
          break;
        }
        default: {
          // eslint-disable-next-line no-self-assign
          ruleNo = ruleNo;
        }
      }

      // 计算预计分配金额
      let expectDistAmt = 0;
      const allocationProportion = div(mul(groupPercent, gainerIngroupPercent || 0), 100); // 实际利益分配比例
      if (groupBaseType === 'NETSALE') {
        // 签单额(不含税)=合同含税总金额/(1+税率)*实际分配比例
        expectDistAmt = div(mul(div(amt, add(1, div(taxRate, 100))), allocationProportion), 100);
      } else if (groupBaseType === 'EFFSALE') {
        // 有效销售额=合同有效销售额*实际利益分配比例
        expectDistAmt = div(mul(effectiveAmt, allocationProportion), 100);
      } else if (groupBaseType === 'MARGIN') {
        // 毛利=合同毛利*实际利益分配比例
        expectDistAmt = div(mul(grossProfit, allocationProportion), 100);
      }
      const newDataList = update(ruleList, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
          groupPercent: {
            $set: groupPercent,
          },
          groupBaseType: {
            $set: groupBaseType,
          },
          groupBaseTypeDesc: {
            $set: groupBaseTypeDesc,
          },
          ruleNo: {
            $set: ruleNo,
          },
          expectDistAmt: {
            $set: expectDistAmt,
          },
        },
      });
      ruleList[rowIndex].expectDistAmt = expectDistAmt; // update方法无法修改此值，所以此处强制修改
      // 预计可分配金额总和(不包括交付bu)
      const sumExpAmt = ruleList
        .filter(list => list.groupRole !== 'DELIVER')
        .map(list => list.expectDistAmt)
        .reduce((sum, val) => add(sum || 0, val || 0), 0);
      const buDistAmt = sub(amt, sumExpAmt);
      // ruleList[rowIndex].expectDistAmt = buDistAmt;// ,所以此处强制修改
      // eslint-disable-next-line no-restricted-syntax
      for (const v of ruleList) {
        if (v.groupRole === 'DELIVER') {
          v.expectDistAmt = buDistAmt;
          break;
        }
      }

      dispatch({ type: `${DOMAIN}/updateState`, payload: { ruleList: newDataList } });
    } else {
      value = rowFieldValue;
    }

    let maxGainerIngroupPercent = 100;
    ruleList.forEach((r, index) => {
      if (index !== rowIndex && r.groupRole === rowData.groupRole) {
        maxGainerIngroupPercent -= r.gainerIngroupPercent || 0;
      }
    });

    if (rowField === 'groupRole') {
      // 此处对于单条的修改 update store
      const $arr = ruleList.filter(item => item.groupRole === rowFieldValue);
      if ($arr.length > 1) {
        groupPercent = $arr[0].groupPercent;
        groupBaseType = $arr[0].groupBaseType;
        groupBaseTypeDesc = $arr[0].groupBaseTypeDesc;
        maxGainerIngroupPercent = $arr[0].maxGainerIngroupPercent;
      }

      // 计算预计分配金额
      let expectDistAmt = 0;
      const allocationProportion = div(mul(groupPercent, gainerIngroupPercent || 0), 100); // 实际利益分配比例
      if (groupBaseType === 'NETSALE') {
        // 签单额(不含税)=合同含税总金额/(1+税率)*实际分配比例
        expectDistAmt = div(mul(div(amt, add(1, div(taxRate, 100))), allocationProportion), 100);
      } else if (groupBaseType === 'EFFSALE') {
        // 有效销售额=合同有效销售额*实际利益分配比例
        expectDistAmt = div(mul(effectiveAmt, allocationProportion), 100);
      } else if (groupBaseType === 'MARGIN') {
        // 毛利=合同毛利*实际利益分配比例
        expectDistAmt = div(mul(grossProfit, allocationProportion), 100);
      }

      const newDataList = update(ruleList, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
          groupPercent: {
            $set: groupPercent,
          },
          maxGainerIngroupPercent: {
            $set: maxGainerIngroupPercent,
          },
          groupBaseType: {
            $set: groupBaseType,
          },
          groupBaseTypeDesc: {
            $set: groupBaseTypeDesc,
          },
          ruleNo: {
            $set: ruleNo,
          },
          expectDistAmt: {
            $set: expectDistAmt,
          },
        },
      });
      ruleList[rowIndex].expectDistAmt = expectDistAmt; // update方法无法修改此值，所以此处强制修改

      dispatch({ type: `${DOMAIN}/updateState`, payload: { ruleList: newDataList } });
    } else if (rowField === 'gainerIngroupPercent') {
      // 计算预计分配金额
      let expectDistAmt = 0;
      const allocationProportion = div(mul(groupPercent, value || 0), 100); // 实际利益分配比例
      if (groupBaseType === 'NETSALE') {
        // 签单额(不含税)=合同含税总金额/(1+税率)*实际分配比例
        expectDistAmt = div(mul(div(amt, add(1, div(taxRate, 100))), allocationProportion), 100);
      } else if (groupBaseType === 'EFFSALE') {
        // 有效销售额=合同有效销售额*实际利益分配比例
        expectDistAmt = div(mul(effectiveAmt, allocationProportion), 100);
      } else if (groupBaseType === 'MARGIN') {
        // 毛利=合同毛利*实际利益分配比例
        expectDistAmt = div(mul(grossProfit, allocationProportion), 100);
      }

      const newDataList = update(ruleList, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
          groupPercent: {
            $set: groupPercent,
          },
          maxGainerIngroupPercent: {
            $set: maxGainerIngroupPercent,
          },
          groupBaseType: {
            $set: groupBaseType,
          },
          groupBaseTypeDesc: {
            $set: groupBaseTypeDesc,
          },
          ruleNo: {
            $set: ruleNo,
          },
          expectDistAmt: {
            $set: expectDistAmt,
          },
        },
      });
      ruleList[rowIndex].expectDistAmt = expectDistAmt; // update方法无法修改此值，所以此处强制修改
      // 预计可分配金额总和(不包括交付bu)
      const sumExpAmt = ruleList
        .filter(list => list.groupRole !== 'DELIVER')
        .map(list => list.expectDistAmt)
        .reduce((sum, val) => add(sum || 0, val || 0), 0);
      const buDistAmt = sub(amt, sumExpAmt);
      // ruleList[rowIndex].expectDistAmt = buDistAmt;// ,所以此处强制修改
      // eslint-disable-next-line no-restricted-syntax
      for (const v of ruleList) {
        if (v.groupRole === 'DELIVER') {
          v.expectDistAmt = buDistAmt;
          break;
        }
      }
      dispatch({ type: `${DOMAIN}/updateState`, payload: { ruleList: newDataList } });
    } else {
      // 同一利益分配角色，利益分配比例相等，但是可以修改  遍历
      const $list = clone(ruleList);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < $list.length; i++) {
        if ($list[i].id === rowData.id) {
          $list[i].ruleNo = ruleNo;
          $list[i].groupBaseTypeDesc = groupBaseTypeDesc;
          $list[i].groupBaseType = groupBaseType;
          $list[i].maxGainerIngroupPercent = maxGainerIngroupPercent;
          $list[i].groupPercent = groupPercent;
          $list[i][rowField] = value;
        }
      }
      dispatch({ type: `${DOMAIN}/updateState`, payload: { ruleList: $list } });
    }

    // dispatch({ type: `${DOMAIN}/total` });
    // 预计可分配金额总和(不包括交付bu)
    const sumExpAmt = ruleList
      .filter(list => list.groupRole !== 'DELIVER')
      .map(list => list.expectDistAmt)
      .reduce((sum, val) => add(sum || 0, val || 0), 0);

    const buDistAmt = sub(amt, sumExpAmt);
    // eslint-disable-next-line no-restricted-syntax
    for (const v of ruleList) {
      if (v.groupRole === 'DELIVER') {
        v.expectDistAmt = buDistAmt;
        break;
      }
    }
  };

  // 行编辑触发事件
  onNormSettleViewCellChanged = (index, value, name) => {
    const {
      sharingEdit: { normSettleView },
      dispatch,
    } = this.props;

    const newDataSource = normSettleView;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { normSettleView: newDataSource },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      sharingEdit: {
        formData,
        dataList,
        ruleList,
        delList,
        normSettleView,
        normSettleViewDel,
        projectList,
        taskList,
      }, // 利益分配tab 信息
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      global: { userList },
    } = this.props; // 从state中传数据过来？

    const pageLoading = loading.effects[`${DOMAIN}/queryDetails`];

    const { contractStatus, unitEquivalentValue } = formData;

    const readOnly = formData.benefitDistributionCode === 'S' || contractStatus === 'CREATE';

    // 规则被使用，就不能修改了,其他状态可以修改，即新建，激活
    // const ALREADY_USED = (ruleList[0] || {}).agreeStatus === 'SETTLED';
    const ALREADY_USED = false; // 取消已结算不能删除的限制

    // 平台利益分配规则
    const columns = [
      {
        title: '分配规则码',
        key: 'ruleNo',
        dataIndex: 'ruleNo',
        align: 'center',
        width: 150,
      },
      {
        title: '平台抽成比例',
        key: 'platSharePercent',
        dataIndex: 'platSharePercent',
        align: 'center',
        width: 100,
        render: value => `${value}%`,
      },
      {
        title: '基于',
        key: 'platShareBase',
        dataIndex: 'platShareBaseName',
        align: 'center',
        width: 80,
      },
      {
        title: '平台销售抽成比例',
        key: 'leadsSharePercent',
        dataIndex: 'leadsSharePercent',
        align: 'center',
        width: 120,
        render: value => `${value}%`,
      },
      {
        title: '基于',
        key: 'leadsShareBase',
        dataIndex: 'leadsShareBaseName',
        align: 'center',
        width: 80,
      },
      {
        title: '签单抽成比例',
        key: 'signSharePercent',
        dataIndex: 'signSharePercent',
        align: 'center',
        width: 120,
        render: value => `${value}%`,
      },
      {
        title: '基于',
        key: 'signShareBase',
        dataIndex: 'signShareBaseName',
        align: 'center',
        width: 80,
      },
      {
        title: '售前抽成比例',
        key: 'deliSharePercent',
        dataIndex: 'deliSharePercent',
        align: 'center',
        width: 120,
        render: value => `${value}%`,
      },
      {
        title: '基于',
        key: 'deliShareBase',
        dataIndex: 'deliShareBaseName',
        align: 'center',
        width: 80,
      },
      {
        title: '备注',
        key: 'remark',
        dataIndex: 'remark',
        align: 'center',
        width: 200,
      },
    ];

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      dataSource: ruleList,
      loading: loading.effects[`${DOMAIN}/queryDetails`],
      size: 'small',
      // showAdd: true,
      // showDelete: true,
      // showCopy: false,
      readOnly,
      rowSelection: {
        getCheckboxProps: record => ({
          disabled:
            record.lineSource === 'SYSTEM' ||
            ALREADY_USED ||
            record.groupRole === 'DELIVER' ||
            record.groupRole === 'TAX',
        }),
      },
      onChange: filters => {
        this.fetchData(filters);
      },
      onAdd: newRow => {
        if (isNil(dataList) || isEmpty(dataList)) {
          createMessage({
            type: 'warn',
            description:
              '平台利益分配规则为空，无法生成子合同收益分配规则,可以选择其他平台利益分配规则',
          });
          return;
        }
        let gainerIngroupPercent = 100;
        ruleList.forEach((r, index) => {
          if (r.groupRole === 'DELI') {
            gainerIngroupPercent -= r.gainerIngroupPercent || 0;
          }
        });

        // 新增子合同分配规则，默认原平台利益分配规则，如果选择了其他平台利益分配规则，就用其他平台利益分配规则初始化
        const rule = ruleList;

        const newList = update(ruleList, {
          $push: [
            {
              ...newRow,
              gainerBuId: 1,
              id: genFakeId(-1),
              lineSource: 'MAN',
              agreeStatusDesc: '新建',
              gainerIngroupPercent, // 收益占比，100% - 本分配角色的收益占比之后 LEADS
              groupRole: 'DELI',
              groupPercent: rule[0].deliSharePercent || 0,
              busifieldType: rule[0].busifieldType,
              ruleNo: rule[0].ruleNo, // 后台需要这个值做存储
              groupBaseType: rule[0].deliShareBase, // 根据 DELI 取对应值给后台
              groupBaseTypeDesc: rule[0].deliShareBaseName, // 根据 DELI 取对应值展示
            },
          ],
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { ruleList: newList },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = ruleList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            ruleList: newDataSource,
            delList: [...delList, ...selectedRowKeys].filter(v => v > 0),
          },
        });
      },
      // 子合同收益分配规则-可配置化只能配置显示名称、顺序，不能配置是否必填、是否可编辑
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
            // 新建的规则，不能选交付BU、税，所以做一下过滤。交付BU的钱是这几个角色分完后剩下的；税是后台生成的，前端不能选择、修改
            <Selection.UDC
              code="ACC:PROFIT_ROLE"
              resTransform={source =>
                source.filter(({ code }) => code !== 'DELIVER' && code !== 'TAX')
              }
              placeholder="请选择利益分配角色"
              onChange={this.onCellChanged(index, 'groupRole')}
              disabled={
                row.lineSource === 'SYSTEM' ||
                row.groupRole === 'DELIVER' ||
                row.groupRole === 'TAX'
              }
              allowClear={false}
              // eslint-disable-next-line
              value={value === 'DELIVER' ? '交付BU' : value === 'TAX' ? '税' : value} // 角色udc包含交付bu选项；但是下拉中又不能选择改值，但是又要显示改值
            />
          ),
        },
        {
          title: '利益分配比例',
          key: 'groupPercent',
          dataIndex: 'groupPercent',
          align: 'center',
          width: 80,
          required: true,
          render: (value, row, index) => (
            <InputNumber
              onChange={this.onCellChanged(index, 'groupPercent')}
              max={100}
              min={0}
              formatter={v => `${v}%`}
              parser={v => v.replace('%', '')}
              className="x-fill-100"
              disabled={ALREADY_USED || row.groupRole === 'DELIVER' || row.groupRole === 'TAX'}
              value={value}
            />
          ),
        },
        {
          title: '基于',
          key: 'groupBaseType',
          dataIndex: 'groupBaseTypeDesc',
          align: 'center',
          width: 80,
          render: (value, row, index) => (
            // 新建的规则，不能选交付BU、税，所以做一下过滤。交付BU的钱是这几个角色分完后剩下的；税是后台生成的，前端不能选择、修改
            <Selection.UDC
              placeholder="请选择基于"
              onChange={this.onCellChanged(index, 'groupBaseTypeDesc')}
              disabled={
                row.lineSource === 'SYSTEM' ||
                row.groupRole === 'DELIVER' ||
                row.groupRole === 'TAX'
              }
              resTransform={source => source.filter(({ code }) => code !== 'TAX')}
              allowClear={false}
              code="ACC:PROFIT_SHARE_BASE"
              value={value}
            />
          ),
        },
        {
          title: '待定',
          key: 'lineSource',
          dataIndex: 'lineSource',
          hidden: true,
          align: 'center',
          width: 160,
          // required: true,
          render: value => (
            <UdcSelect allowClear={false} disabled code="ACC:LINE_SOURCE" value={value} />
          ),
        },
        {
          title: '收益BU/资源',
          key: 'gainerBuId',
          dataIndex: 'gainerBuId',
          align: 'center',
          width: 180,
          required: true,
          render: (value, row, index) =>
            value ? (
              <AsyncSelect
                onChange={this.onCellChanged(index, 'gainerBuId')}
                value={value}
                source={() => selectBu().then(resp => resp.response)}
                showSearch
                allowClear={false}
                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              />
            ) : (
              <AsyncSelect
                onChange={this.onCellChanged(index, 'gainerResId')}
                value={row.gainerResId}
                disabled={ALREADY_USED || row.lineSource === 'SYSTEM'}
                source={() => selectUsers().then(resp => resp.response)}
                showSearch
                allowClear={false}
                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              />
            ),
        },
        {
          title: '收益占比',
          key: 'gainerIngroupPercent',
          dataIndex: 'gainerIngroupPercent',
          align: 'center',
          width: 80,
          required: true,
          render: (value, row, index) => (
            <InputNumber
              onChange={this.onCellChanged(index, 'gainerIngroupPercent')}
              min={0}
              max={row.maxGainerIngroupPercent}
              formatter={v => `${v}%`}
              parser={v => v.replace('%', '')}
              className="x-fill-100"
              value={value}
            />
          ),
        },
        {
          title: '实际利益分配比例',
          key: 'gainerInallPercent',
          dataIndex: 'allocationProportion', // 总感觉这个单词是错误的
          align: 'center',
          width: 150,
          render: (value, allValues) =>
            `${value ||
              div(
                mul(Number(allValues.groupPercent), Number(allValues.gainerIngroupPercent) || 0),
                100
              )}%`,
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
          key: 'busifieldTypeDesc',
          dataIndex: 'busifieldTypeDesc',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <UdcSelect code="COM:BUSIFIELD_TYPE" value={value || 'EL'} disabled />
          ),
        },
        {
          title: '状态',
          key: 'agreeStatus',
          dataIndex: 'agreeStatusDesc',
          align: 'center',
          width: 80,
        },
        {
          title: '备注',
          key: 'remark',
          dataIndex: 'remark',
          align: 'left',
          width: 200,
          render: (value, row, index) => (
            <Input
              onChange={this.onCellChanged(index, 'remark')}
              className="x-fill-100"
              value={value}
            />
          ),
        },
      ],
    };

    const normSettleTableProps = {
      rowKey: 'id',
      sortBy: 'id',
      dataSource: normSettleView,
      scroll: { x: 1850 },
      loading: loading.effects[`${DOMAIN}/queryDetails`],
      size: 'small',
      rowSelection: {
        getCheckboxProps: record => ({
          disabled:
            record.lineSource === 'SYSTEM' ||
            ALREADY_USED ||
            record.groupRole === 'DELIVER' ||
            record.groupRole === 'TAX',
        }),
      },
      onChange: filters => {
        this.fetchData(filters);
      },
      onAdd: newRow => {
        const newList = update(normSettleView, {
          $push: [
            {
              ...newRow,
              id: genFakeId(-1),
              gainerBuId: 1,
              estimatedTotalAmount: 0,
            },
          ],
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { normSettleView: newList },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = normSettleView.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            normSettleView: newDataSource,
            normSettleViewDel: [...normSettleViewDel, ...selectedRowKeys].filter(v => v > 0),
          },
        });
      },
      // 子合同收益分配规则-可配置化只能配置显示名称、顺序，不能配置是否必填、是否可编辑
      columns: [
        {
          title: 'FromBU',
          key: 'fromBu',
          dataIndex: 'fromBu',
          align: 'center',
          width: 200,
          render: (value, row, index) => (
            <Selection.ColumnsForBu
              disabled={row.fromResNo}
              value={value}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 300 }}
              onChange={e => {
                this.onNormSettleViewCellChanged(index, e, 'fromBu');
                this.onNormSettleViewCellChanged(index, null, 'fromResNo');
              }}
              placeholder="请选择FromBU"
            />
          ),
        },
        // {
        //   title: 'From个人',
        //   key: 'fromResNo',
        //   dataIndex: 'fromResNo',
        //   align: 'center',
        //   width: 150,
        //   render: (value, row, index) => (
        //     <Selection.Columns
        //       disabled={row.fromBu}
        //       value={value}
        //       className="x-fill-100"
        //       source={userList}
        //       columns={particularColumns}
        //       transfer={{ key: 'id', code: 'id', name: 'name' }}
        //       dropdownMatchSelectWidth={false}
        //       dropdownStyle={{ width: 300 }}
        //       showSearch
        //       placeholder="请选择From个人"
        //       onChange={e => {
        //         this.onNormSettleViewCellChanged(index, e, 'fromResNo');
        //         this.onNormSettleViewCellChanged(index, null, 'fromBu');
        //       }}
        //     />
        //   ),
        // },
        {
          title: 'ToBU',
          key: 'toBu',
          dataIndex: 'toBu',
          align: 'center',
          width: 200,
          render: (value, row, index) => (
            <Selection.ColumnsForBu
              disabled={row.toResNo}
              value={value}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 300 }}
              onChange={e => {
                this.onNormSettleViewCellChanged(index, e, 'toBu');
                this.onNormSettleViewCellChanged(index, null, 'toResNo');
              }}
              placeholder="请选择ToBU"
            />
          ),
        },
        // {
        //   title: 'To个人',
        //   key: 'toResNo',
        //   dataIndex: 'toResNo',
        //   align: 'center',
        //   width: 150,
        //   render: (value, row, index) => (
        //     <Selection.Columns
        //       disabled={row.toBu}
        //       value={value}
        //       className="x-fill-100"
        //       source={userList}
        //       columns={particularColumns}
        //       transfer={{ key: 'id', code: 'id', name: 'name' }}
        //       dropdownMatchSelectWidth={false}
        //       dropdownStyle={{ width: 300 }}
        //       showSearch
        //       placeholder="请选择From个人"
        //       onChange={e => {
        //         this.onNormSettleViewCellChanged(index, e, 'toResNo');
        //         this.onNormSettleViewCellChanged(index, null, 'toBu');
        //       }}
        //     />
        //   ),
        // },
        {
          title: '类型',
          key: 'type',
          dataIndex: 'type',
          align: 'center',
          width: 150,
          required: true,
          render: (value, row, index) => (
            <Selection.UDC
              value={value}
              className="x-fill-100"
              code="ACC:PROFIT_TYPE"
              placeholder="请选择类型"
              filters={[
                {
                  sphd1: '1',
                  sphd2: '1',
                },
              ]}
              onChange={e => {
                this.onNormSettleViewCellChanged(index, e, 'type');
              }}
            />
          ),
        },
        {
          title: '金额',
          key: 'estimatedTotalAmount',
          dataIndex: 'estimatedTotalAmount',
          align: 'center',
          width: 150,
          required: true,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              className="x-fill-100"
              placeholder="请输入金额"
              precision={2}
              min={0}
              onChange={e => {
                this.onNormSettleViewCellChanged(index, e, 'estimatedTotalAmount');
                this.onNormSettleViewCellChanged(
                  index,
                  div(e || 0, unitEquivalentValue) || 0,
                  'equivalentEqui'
                );
              }}
            />
          ),
        },
        {
          title: '等值当量',
          key: 'equivalentEqui',
          dataIndex: 'equivalentEqui',
          align: 'center',
          width: 100,
          render: val => (val ? val.toFixed(2) : 0),
        },
        {
          title: '项目号',
          key: 'projectNo',
          dataIndex: 'projectNo',
          align: 'center',
          width: 150,
          render: (value, row, index) => (
            <Selection
              value={value}
              className="x-fill-100"
              source={projectList}
              transfer={{ key: 'projNo', code: 'projNo', name: 'projName' }}
              dropdownMatchSelectWidth={false}
              showSearch
              placeholder="请选择项目号"
              onChange={e => {
                this.onNormSettleViewCellChanged(index, e, 'projectNo');
              }}
            />
          ),
        },
        {
          title: '任务号',
          key: 'taskNo',
          dataIndex: 'taskNo',
          align: 'center',
          width: 150,
          render: (value, row, index) => (
            <Selection
              value={value}
              className="x-fill-100"
              source={taskList}
              transfer={{ key: 'taskNo', code: 'taskNo', name: 'taskName' }}
              dropdownMatchSelectWidth={false}
              showSearch
              placeholder="请选择任务号"
              onChange={e => {
                this.onNormSettleViewCellChanged(index, e, 'taskNo');
              }}
            />
          ),
        },
        {
          title: '事件号',
          key: 'eventNo',
          dataIndex: 'eventNo',
          align: 'center',
          width: 150,
          render: (value, row, index) => (
            <Input
              value={value}
              className="x-fill-100"
              placeholder="请输入事件号"
              onChange={e => {
                this.onNormSettleViewCellChanged(index, e.target.value, 'eventNo');
              }}
            />
          ),
        },
        {
          title: '费用码',
          key: 'costCode',
          dataIndex: 'costCode',
          align: 'center',
          width: 150,
          render: (value, row, index) => (
            <Selection.UDC
              value={value}
              className="x-fill-100"
              code="ACC:ACC_CAT02"
              placeholder="请选择费用码"
              onChange={e => {
                this.onNormSettleViewCellChanged(index, e, 'costCode');
              }}
            />
          ),
        },
        {
          title: '备注',
          key: 'remark',
          dataIndex: 'remark',
          align: 'left',
          width: 200,
          render: (value, row, index) => (
            <Input.TextArea
              value={value}
              onChange={e => {
                this.onNormSettleViewCellChanged(index, e.target.value, 'remark');
              }}
              autosize={{ minRows: 1, maxRows: 3 }}
              placeholder="请输入备注"
            />
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="子合同利益分配修改">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={pageLoading || loading.effects[`${DOMAIN}/saveNewRule`]}
            onClick={this.handleSave}
          >
            保存
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={pageLoading}
            onClick={this.handleCancel}
          >
            返回
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false}>
          <Spin spinning={pageLoading}>
            <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="基本信息">
              <Field
                name="mainContractNo"
                label="主合同号"
                decorator={{
                  initialValue: formData.mainContractNo || '',
                }}
              >
                <Input disabled />
              </Field>
              <Field
                name="ouName"
                label="合同主体"
                decorator={{
                  initialValue: formData.ouName || '',
                }}
              >
                <Input disabled />
              </Field>
              <Field
                name="contractNo"
                label="子合同号"
                decorator={{
                  initialValue: formData.contractNo || '',
                }}
              >
                <Input disabled />
              </Field>
              <Field
                name="oppoNo"
                label="商机号"
                decorator={{
                  initialValue: formData.oppoNo || '',
                }}
              >
                <Input disabled />
              </Field>
              <Field
                name="benefitDistributionCode"
                label="利益分配码"
                decorator={{
                  rules: [{ required: true, message: '必填' }],
                  initialValue: formData.benefitDistributionCode || undefined,
                }}
              >
                <Selection.UDC
                  code="TSK:BENEFIT_DISTRIBUTION_CODE"
                  placeholder="请选择利益分配码"
                />
              </Field>
              <Field
                name="benefitDistributionExplanation"
                label="利益分配说明"
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                decorator={{
                  initialValue: formData.benefitDistributionExplanation || undefined,
                }}
              >
                <Input.TextArea rows={3} placeholder="请输入利益分配说明" />
              </Field>
              <Field
                name="computor"
                label="计算符"
                decorator={{
                  initialValue: formData.computor || undefined,
                }}
              >
                <Selection.UDC code="COM:APPR_STATUS" placeholder="请选择计算符" disabled />
              </Field>
              <Field
                name="contractStatus"
                label="合同状态"
                decorator={{
                  initialValue: formData.contractStatus || undefined,
                }}
              >
                <Selection.UDC code="TSK.CONTRACT_STATUS" disabled placeholder="请选择审批状态" />
              </Field>
            </FieldList>
            <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="计算因子">
              <Field
                name="amt"
                label="含税合同额"
                decorator={{
                  initialValue: formData.amt || '',
                }}
              >
                <InputNumber className="x-fill-100" precision={2} disabled />
              </Field>
              <Field
                name="travelExpenses"
                label="差旅费"
                decorator={{
                  initialValue: formData.travelExpenses || '',
                }}
              >
                <InputNumber className="x-fill-100" precision={2} min={0} />
              </Field>
              <Field
                name="excludingTax"
                label="不含税合同额"
                decorator={{
                  initialValue: formData.excludingTax || '',
                }}
              >
                <InputNumber className="x-fill-100" precision={2} disabled />
              </Field>
              <Field
                name="channelCostAmt"
                label="渠道费用"
                decorator={{
                  initialValue: formData.channelCostAmt || '',
                }}
              >
                <InputNumber className="x-fill-100" precision={2} disabled />
              </Field>
              <Field
                name="unconventionalExpenses"
                label="非常规费用"
                decorator={{
                  initialValue: formData.unconventionalExpenses || undefined,
                }}
              >
                <InputNumber
                  className="x-fill-100"
                  min={0}
                  precision={2}
                  placeholder="请输入非常规费用"
                />
              </Field>
              <Field
                name="contractPurchaseAmt"
                label="合同采购额"
                decorator={{
                  initialValue: formData.contractPurchaseAmt || '',
                }}
              >
                <InputNumber className="x-fill-100" precision={2} disabled />
              </Field>
              <Field
                name="unconventionalExpensesDescription"
                label="非常规费用说明"
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                decorator={{
                  initialValue: formData.unconventionalExpensesDescription || '',
                }}
              >
                <Input.TextArea rows={3} placeholder="请输入非常规费用说明" />
              </Field>
            </FieldList>
            <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="分配因子">
              <Field
                name="customerNature"
                label="客户性质"
                decorator={{
                  initialValue: formData.customerNature || undefined,
                }}
              >
                <Selection.UDC code="TSK:CONTRACT_CUSTPROP" placeholder="请选择客户性质" disabled />
              </Field>
              <Field
                name="cooperationType"
                label="交易性质"
                decorator={{
                  initialValue: formData.cooperationType || undefined,
                }}
              >
                <Selection.UDC code="TSK:COOPERATION_TYPE" placeholder="请选择交易性质" disabled />
              </Field>
              <Field
                name="projProp"
                label="提成类别"
                decorator={{
                  initialValue: formData.projProp || undefined,
                }}
              >
                <Selection.UDC code="TSK:PROJ_PROP" placeholder="请选择提成类别" disabled />
              </Field>
              <Field
                name="channelType"
                label="交易方式"
                decorator={{
                  initialValue: formData.channelType || undefined,
                }}
              >
                <Selection.UDC code="TSK:CHANNEL_TYPE" placeholder="请选择交易方式" disabled />
              </Field>
              <Field
                name="contractNo"
                label="供应主体类别"
                decorator={{
                  initialValue: formData.contractNo || undefined,
                }}
              >
                <Selection.UDC code="COM:PROD_PROP" placeholder="请选择供应主体类别" disabled />
              </Field>
            </FieldList>
            <br />
            <FieldList getFieldDecorator={getFieldDecorator} col={1} legend="标准分配规则">
              <Table
                bordered
                rowKey="id"
                pagination={false}
                dataSource={dataList.filter(x => !isEmpty(x))}
                columns={columns}
                loading={loading.effects[`${DOMAIN}/queryDetails`]}
              />
            </FieldList>
            <br />

            <FieldList
              getFieldDecorator={getFieldDecorator}
              col={1}
              legend="本单分配规则"
              noReactive
            >
              <EditableDataTable scroll={{ x: 1370 }} {...tableProps} />
            </FieldList>
            <br />

            <FieldList
              getFieldDecorator={getFieldDecorator}
              col={1}
              legend="泛用结算申请"
              noReactive
            >
              <EditableDataTable scroll={{ x: 1370 }} {...normSettleTableProps} />
            </FieldList>
          </Spin>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SharingEdit;
