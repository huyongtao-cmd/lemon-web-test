/* eslint-disable prefer-destructuring */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, InputNumber, Table, message } from 'antd';
import { isEmpty, isNil, clone, toLower } from 'ramda';
import update from 'immutability-helper';
import EditableDataTable from '@/components/common/EditableDataTable';
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
const DOMAIN = 'userContractSharing';

@connect(({ dispath, loading, userContractSharing, userContractEditSub }) => ({
  dispath,
  loading,
  userContractSharing,
  userContractEditSub,
}))
@injectUdc(
  {
    groupRoleUdc: 'ACC:PROFIT_ROLE',
    groupBaseUdc: 'ACC:PROFIT_SHARE_BASE',
  },
  DOMAIN
)
@mountToTab()
class Sharing extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      formData: { profitRuleId },
    } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: id,
    });
    if (profitRuleId) {
      // 查询分配规则主数据id
      dispatch({
        type: `${DOMAIN}/findProfitdistRuleById`,
        payload: {
          profitRuleId,
        },
      });
    }
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      userContractSharing: { dataList, ruleList, otherRecvList, delOtherList, otherRule },
      formData,
    } = this.props;

    const { amt, effectiveAmt, grossProfit, taxRate } = formData; // 合同总金额、有效合同额、毛利、税率

    let value = null;
    const rowData = ruleList[rowIndex];
    let mainData = dataList[0]; // 主表的值
    if (otherRule && otherRule.length > 0) {
      mainData = otherRule[0];
    }
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

    dispatch({
      type: 'userContractEditSub/updateState',
      payload: { flag4: 1 },
    });
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

  // 其他相关收付计划：行编辑触发事件
  // onCellChanged 可以通过高阶函数自动获取输入的值；
  // onOtherCellChanged 需要把输入的值传过来；select 用e.target.value; input 直接用e
  onOtherCellChanged = (index, value, name) => {
    const {
      dispatch,
      userContractSharing: { otherRecvList },
    } = this.props;
    const newotherRecvList = otherRecvList;
    newotherRecvList[index] = {
      ...newotherRecvList[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { otherRecvList: newotherRecvList },
    });
  };

  render() {
    const {
      dispatch, // 貌似啥都没有
      loading, // {effects:{...:false},models:{...false}}
      formData, // 合同表单信息,来自EditSubTab.jsx
      userContractSharing: { dataList, ruleList, delList, flag4, delOtherList, otherRule }, // 利益分配tab 信息
      userContractEditSub: { pageConfig = {} },
    } = this.props; // 从state中传数据过来？
    let {
      userContractSharing: { otherRecvList },
    } = this.props;

    const { pageBlockViews = [] } = pageConfig;

    let pageFieldView = [];
    let pageRule = [];
    let pageAgree = [];
    let pageOther = [];
    pageBlockViews.forEach(block => {
      if (block.blockKey === 'SALE_CONTRACT_EDIT_SUB') {
        pageFieldView = block.pageFieldViews;
      }
      if (block.blockKey === 'SALE_CONTRACT_EDIT_SUB_PROFIT_RULE') {
        pageRule = block.pageFieldViews;
      }
      if (block.blockKey === 'SALE_CONTRACT_EDIT_SUB_PROFIT_AGREE') {
        pageAgree = block.pageFieldViews;
      }
      if (block.blockKey === 'SALE_CONTRACT_EDIT_SUB_OTHER_RECV') {
        pageOther = block.pageFieldViews;
      }
    });
    // const { pageFieldViews = {} } = pageBlockViews[0];
    // const { pageFieldViews: pageRule = {} } = pageBlockViews[3];
    // const { pageFieldViews: pageAgree = {} } = pageBlockViews[4];
    // const { pageFieldViews: pageOther = {} } = pageBlockViews[5];
    const jsonRule = {};
    const jsonAgree = {};
    const jsonOther = {};
    pageRule.forEach(field => {
      jsonRule[field.fieldKey] = field;
    });
    pageAgree.forEach(field => {
      jsonAgree[field.fieldKey] = field;
    });
    pageOther.forEach(field => {
      jsonOther[field.fieldKey] = field;
    });

    const btnJson = {};
    if (pageConfig && pageConfig.pageButtonViews && pageConfig.pageButtonViews.length > 1) {
      pageConfig.pageButtonViews.forEach(btn => {
        btnJson[btn.buttonKey] = btn;
      });
    }

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
    ]
      .filter(col => !col.key || (jsonRule[col.key] && jsonRule[col.key].visibleFlag === 1))
      .map(col => ({
        ...col,
        title: jsonRule[col.key].displayName,
        sortNo: jsonRule[col.key].sortNo,
      }))
      .sort((f1, f2) => f1.sortNo - f2.sortNo);

    const { contractStatus } = formData;
    // const readOnly = !(contractStatus === 'CREATE' || contractStatus === 'ACTIVE');
    const readOnly = true;

    const { _udcMap = {} } = this.state;
    const { groupRoleUdc = [], groupBaseUdc = [] } = _udcMap;
    // 规则被使用，就不能修改了,其他状态可以修改，即新建，激活
    // const ALREADY_USED = (ruleList[0] || {}).agreeStatus === 'SETTLED';
    const ALREADY_USED = false; // 取消已结算不能删除的限制
    // 新建的规则，不能选交付BU、税，所以做一下过滤。交付BU的钱是这几个角色分完后剩下的；税是后台生成的，前端不能选择、修改
    const filteredGroupRoleUdc = groupRoleUdc.filter(
      ({ code }) => code !== 'DELIVER' && code !== 'TAX'
    );
    const filteredGroupBaseUdc = groupBaseUdc.filter(({ code }) => code !== 'TAX');
    const subjCol = [
      { dataIndex: 'code', title: '编号', span: 6 },
      { dataIndex: 'name', title: '名称', span: 14 },
    ];
    const recvCol = [
      { dataIndex: 'code', title: '编号', span: 10 },
      { dataIndex: 'name', title: '名称', span: 14 },
    ];
    const { id: contractId } = fromQs();
    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      dataSource: ruleList,
      loading:
        loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getProfitAgreesByRuleId`],
      size: 'small',
      showAdd: !ALREADY_USED,
      showDelete: !ALREADY_USED,
      showCopy: false,
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
        if ((isNil(dataList) || isEmpty(dataList)) && (isNil(otherRule) || isEmpty(otherRule))) {
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
        let rule = ruleList;
        if (otherRule && otherRule.length > 0) {
          rule = otherRule;
        }

        const newList = update(ruleList, {
          $push: [
            {
              ...newRow,
              gainerBuId: 1,
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
        dispatch({
          type: 'userContractEditSub/updateState',
          payload: { flag4: 1 },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = ruleList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { ruleList: newDataSource, delList: [...delList, ...selectedRowKeys] },
        });
        dispatch({
          type: 'userContractEditSub/updateState',
          payload: { flag4: 1 },
        });
      },
      // 子合同收益分配规则-可配置化只能配置显示名称、顺序，不能配置是否必填、是否可编辑
      columns: [
        {
          title: jsonAgree.ruleNo.displayName,
          key: 'ruleNo',
          dataIndex: 'ruleNo',
          align: 'center',
          width: 100,
        },
        {
          title: jsonAgree.groupRole.displayName,
          key: 'groupRole',
          dataIndex: 'groupRole',
          align: 'center',
          width: 150,
          required: true,
          render: (value, row, index) => (
            <AsyncSelect
              source={filteredGroupRoleUdc}
              placeholder="请选择利益分配角色"
              onChange={this.onCellChanged(index, 'groupRole')}
              // disabled={
              //   row.lineSource === 'SYSTEM' ||
              //   row.groupRole === 'DELIVER' ||
              //   row.groupRole === 'TAX'
              // }
              allowClear={false}
              code="ACC:PROFIT_ROLE"
              // eslint-disable-next-line
              value={value === 'DELIVER' ? '交付BU' : value === 'TAX' ? '税' : value} // 角色udc包含交付bu选项；但是下拉中又不能选择改值，但是又要显示改值
              disabled
            />
          ),
        },
        {
          title: jsonAgree.groupPercent.displayName,
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
              // disabled={ALREADY_USED || row.groupRole === 'DELIVER' || row.groupRole === 'TAX'}
              value={value}
              disabled
            />
          ),
        },
        {
          title: jsonAgree.groupBaseType.displayName,
          key: 'groupBaseType',
          dataIndex: 'groupBaseTypeDesc',
          align: 'center',
          width: 80,
          render: (value, row, index) => (
            <AsyncSelect
              source={filteredGroupBaseUdc}
              placeholder="请选择基于"
              onChange={this.onCellChanged(index, 'groupBaseTypeDesc')}
              // disabled={
              //   row.lineSource === 'SYSTEM' ||
              //   row.groupRole === 'DELIVER' ||
              //   row.groupRole === 'TAX'
              // }
              allowClear={false}
              code="ACC:PROFIT_SHARE_BASE"
              value={value}
              disabled
            />
          ),
        },
        {
          title: jsonAgree.lineSource.displayName,
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
          title: jsonAgree.gainerBuId.displayName,
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
                disabled
              />
            ) : (
              <AsyncSelect
                onChange={this.onCellChanged(index, 'gainerResId')}
                value={row.gainerResId}
                // disabled={ALREADY_USED || row.lineSource === 'SYSTEM'}
                source={() => selectUsers().then(resp => resp.response)}
                showSearch
                allowClear={false}
                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                disabled
              />
            ),
        },
        {
          title: jsonAgree.gainerIngroupPercent.displayName,
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
              disabled
            />
          ),
        },
        {
          title: jsonAgree.gainerInallPercent.displayName,
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
        jsonAgree.expectDistAmt.visibleFlag === 1 && {
          title: jsonAgree.expectDistAmt.displayName,
          key: 'expectDistAmt',
          dataIndex: 'expectDistAmt',
          align: 'center',
          width: 80,
        },
        jsonAgree.busifieldType.visibleFlag === 1 && {
          title: jsonAgree.busifieldType.displayName,
          key: 'busifieldType',
          dataIndex: 'busifieldTypeDesc',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <UdcSelect code="COM:BUSIFIELD_TYPE" value={value || 'EL'} disabled />
          ),
        },
        {
          title: jsonAgree.agreeStatus.displayName,
          key: 'agreeStatus',
          dataIndex: 'agreeStatusDesc',
          align: 'center',
          width: 80,
        },
        jsonAgree.remark.visibleFlag === 1 && {
          title: jsonAgree.remark.displayName,
          key: 'remark',
          dataIndex: 'remark',
          align: 'left',
          width: 200,
          render: (value, row, index) => (
            <Input
              onChange={this.onCellChanged(index, 'remark')}
              className="x-fill-100"
              value={value}
              disabled
            />
          ),
        },
      ]
        // .filter(col=>!col.key || pageFieldJson[col.key] && pageFieldJson[col.key].visibleFlag === 1)
        .map(col => ({
          ...col,
          title: jsonAgree[col.key].displayName,
          sortNo: jsonAgree[col.key].sortNo,
        }))
        .sort((f1, f2) => f1.sortNo - f2.sortNo),
    };

    const otherRecvProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource: otherRecvList,
      showColumn: false,
      // onRow: () => {},// 干嘛的
      enableDoubleClick: false,
      showCopy: false,
      showSearch: false,
      pagination: false,
      leftButtons: [
        {
          key: 'adds',
          title: btnJson.adds.buttonName || '新增',
          className: 'tw-btn-primary',
          // icon: 'plus-circle',
          loading: false,
          hidden: !btnJson.adds.visible,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = fromQs();
            let newList;
            if (isNil(otherRecvList) || isEmpty(otherRecvList)) {
              newList = update(otherRecvList, {
                $push: [
                  {
                    id: genFakeId(-1),
                    contractId: id,
                    dealNo: '',
                    dealDesc: '',
                    inBuId: null,
                    outBuId: null,
                    dealAmt: 0,
                    recvplanId: null,
                    applyStatus: 'CREATE', // 已收款金额
                    remark: '',
                  },
                ],
              });
            } else {
              newList = update(otherRecvList, {
                $push: [
                  {
                    id: -1 * Math.random(),
                    contractId: id,
                    dealNo: '',
                    dealDesc: '',
                    inBuId: null,
                    outBuId: null,
                    dealAmt: 0,
                    recvplanId: null,
                    applyStatus: 'CREATE', // 已收款金额
                    remark: '',
                  },
                ],
              });
            }

            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: { otherRecvList: newList },
            });
            dispatch({
              type: 'userContractEditSub/updateState',
              payload: { flag4: 1 },
            });
          },
        },
        {
          key: 'stlApply',
          title: btnJson.stlApply.buttonName || '发起结算申请',
          className: 'tw-btn-info',
          // icon: 'form',
          loading: false,
          hidden: !btnJson.stlApply.visible,
          minSelections: 0,
          disabled: row => {
            if (!row.length) return true;
            let bool = false;
            row.forEach(v => {
              if (
                !v.applyStatus ||
                v.applyStatus !== 'CREATE' ||
                !v.dealNo ||
                v.dealNo === '系统生成'
              ) {
                bool = true;
              }
            });
            return bool;
          },
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/stlApply`,
              payload: { otherRecv: selectedRowKeys[0] },
            });
          },
        },
        {
          key: 'cancel',
          title: btnJson.cancel.buttonName || '取消',
          className: 'tw-btn-info',
          loading: false,
          hidden: !btnJson.cancel.visible,
          minSelections: 0,
          disabled: row => {
            if (!row.length) return true;
            let bool = false;
            row.forEach(v => {
              if (
                !v.applyStatus ||
                v.applyStatus !== 'CREATE' ||
                !v.dealNo ||
                v.dealNo === '系统生成'
              ) {
                bool = true;
              }
            });
            return bool;
          },
          cb: (selectedRowKeys, selectedRows) => {
            otherRecvList = otherRecvList.map(recv => {
              // 必须要接一下结果
              if (selectedRowKeys.filter(r => recv.id === r).length) {
                return { ...recv, applyStatus: 'CANCEL' };
              }
              return recv;
            });
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: { otherRecvList }, // 必须加{}
            });
          },
        },
        {
          key: 'deletes',
          title: btnJson.deletes.buttonName || '删除',
          className: 'tw-btn-error',
          loading: false,
          hidden: !btnJson.deletes.visible,
          minSelections: 2, // 0是常驻；1是单选；2是多选
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const len = selectedRows.filter(row => row.applyStatus !== 'CREATE' && row.applyStatus)
              .length;
            if (len) {
              createMessage({
                type: 'warn',
                description: '只能删除已创建状态的记录！',
              });
              return;
            }
            const newDataSource = otherRecvList.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            );
            const newdelOtherList = update(delOtherList, {
              $push: selectedRowKeys.filter(r => r > 0),
            });
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: { otherRecvList: newDataSource },
            });
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: { delOtherList: newdelOtherList },
            });
            dispatch({
              type: 'userContractEditSub/updateState',
              payload: { flag4: 1 },
            });
          },
        },
        {
          key: 'save',
          title: btnJson.save.buttonName || '保存',
          className: 'tw-btn-primary',
          // icon:'',
          load: true,
          hidden: !btnJson.save.visible,
          disable: readOnly, // 合同新建、激活时可以操作
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (!otherRecvList || otherRecvList.length === 0) {
              createMessage({ type: 'warn', description: '数据不能为空！' });
              return;
            }
            if (otherRecvList.filter(r => !r.inBuId).length) {
              createMessage({ type: 'warn', description: '收入方bu不能为空！' });
              return;
            }
            if (otherRecvList.filter(r => !r.outBuId).length) {
              createMessage({ type: 'warn', description: '支持方bu不能为空！' });
              return;
            }
            if (otherRecvList.filter(r => !r.dealAmt && r.dealAmt !== 0).length) {
              createMessage({ type: 'warn', description: '交易金额不能为空！' });
              return;
            }
            // 先保存，models层做了刷新
            dispatch({
              type: `${DOMAIN}/saveRecv`,
            });
          },
        },
      ]
        .map(btn => ({
          ...btn,
          sortNo: btnJson[btn.key].sortNo,
        }))
        .sort((b1, b2) => b1.sortNo - b1.sortNo),
      columns: [
        {
          title: '交易类型码',
          key: 'dealNo',
          dataIndex: 'dealNo',
          align: 'center',
          width: 120,
          render: (value, row, index) => value || '系统生成',
        },
        {
          title: '交易类型说明',
          key: 'dealDesc',
          dataIndex: 'dealDesc',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <Input
              value={value}
              className="x-fill-100"
              disabled={row.applyStatus !== 'CREATE'}
              onChange={e => {
                // 先通过change事件改编state的值，然后在改编render中的value。
                // 使用e=>可以避免报react嵌套深度超过限制的警告
                // 这个地方要手动传参数
                this.onOtherCellChanged(index, e.target.value, 'dealDesc');
              }}
            />
          ),
        },
        {
          title: <span className="ant-form-item-required">收入方BU</span>,
          key: 'inBuId',
          dataIndex: 'inBuId',
          align: 'center',
          required: true,
          width: 100,
          render: (value, row, index) => (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectBuMultiCol()}
              columns={subjCol}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={() => {}}
              placeholder="请选择收入方BU"
              value={value}
              disabled={row.applyStatus !== 'CREATE'}
              onChange={e => {
                this.onOtherCellChanged(index, e, 'inBuId');
              }}
            />
          ),
        },
        {
          title: <span className="ant-form-item-required">支出方BU</span>,
          key: 'outBuId',
          dataIndex: 'outBuId',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectBuMultiCol()}
              columns={subjCol}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={() => {}}
              placeholder="请选择支出方BU"
              disabled={row.applyStatus !== 'CREATE'}
              value={value}
              onChange={e => {
                this.onOtherCellChanged(index, e, 'outBuId');
              }}
            />
          ),
        },
        {
          title: <span className="ant-form-item-required">交易金额</span>,
          key: 'dealAmt',
          dataIndex: 'dealAmt',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              className="x-fill-100"
              disabled={row.applyStatus !== 'CREATE'}
              onChange={e => {
                this.onOtherCellChanged(index, e, 'dealAmt');
              }}
            />
          ),
        },
        {
          title:
            jsonOther.recvplanId.requiredFlag === 1 ? (
              <span className="ant-form-item-required">相关收款节点</span>
            ) : (
              '相关收款节点'
            ),
          key: 'recvplanId',
          dataIndex: 'recvplanId',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectRecvPlanMultiCol({ contractId })}
              columns={recvCol}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false} // 下拉菜单菜单和选择器同款
              dropdownStyle={{ width: 350 }} // 下拉宽度
              showSearch
              onColumnsChange={() => {}}
              placeholder="请选择相关收款节点"
              disabled={row.applyStatus !== 'CREATE'}
              value={value}
              width={100}
              onChange={e => {
                this.onOtherCellChanged(index, e, 'recvplanId');
              }}
            />
          ),
        },
        {
          title: '状态',
          key: 'applyStatus',
          dataIndex: 'applyStatus',
          align: 'center',
          width: 80,
          render: (value, row, index) => (
            <Selection.UDC
              code="TSK:CONTRACT_OTHER_FEE_STAT"
              placeholder="请选择状态"
              value={value || 'CREATE'}
              disabled
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
            <Input
              value={value}
              className="x-fill-100"
              disabled={row.applyStatus !== 'CREATE'}
              onChange={e => {
                this.onOtherCellChanged(index, e.target.value, 'remark');
              }}
            />
          ),
        },
      ]
        .filter(col => !col.key || (jsonOther[col.key] && jsonOther[col.key].visibleFlag === 1))
        .map(col => ({
          ...col,
          title:
            jsonOther[col.key].requiredFlag === 1 ? (
              <span className="ant-form-item-required">{jsonOther[col.key].displayName}</span>
            ) : (
              jsonOther[col.key].displayName
            ),
          sortNo: jsonOther[col.key].sortNo,
          required: jsonOther[col.key].requiredFlag === 1,
        }))
        .sort((f1, f2) => f1.sortNo - f2.sortNo),
    };

    return (
      <>
        <div className="tw-card-title m-b-2">
          {otherRule && otherRule.length > 0 ? '原平台利益分配规则' : '平台利益分配规则'}
        </div>

        <Table
          bordered
          rowKey="id"
          pagination={false}
          dataSource={dataList.filter(x => !isEmpty(x))}
          columns={columns}
          loading={loading.effects[`${DOMAIN}/query`]}
          // scroll={{ x: 1100 }}
        />

        <br />
        {otherRule &&
          otherRule.length > 0 && <div className="tw-card-title m-b-2">生效中的利益分配规则</div>}
        {otherRule &&
          otherRule.length > 0 && (
            <Table
              bordered
              rowKey="id"
              pagination={false}
              dataSource={otherRule}
              columns={columns}
              loading={loading.effects[`${DOMAIN}/findProfitdistRuleById`]}
              // scroll={{ x: 1100 }}
            />
          )}

        <div className="tw-card-title m-b-2">子合同收益分配规则</div>

        {ruleList.length > 0 ? <EditableDataTable scroll={{ x: 1370 }} {...tableProps} /> : null}

        <br />

        <div className="tw-card-title m-b-2">其他相关收付计划</div>

        <DataTable {...otherRecvProps} />
      </>
    );
  }
}

export default Sharing;
