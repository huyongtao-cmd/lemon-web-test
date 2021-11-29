import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Card, Button, Radio, InputNumber, Input, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import FieldList from '@/components/layout/FieldList';
import { createConfirm } from '@/components/core/Confirm';
import createMessage from '@/components/core/AlertMessage';
import AsyncSelect from '@/components/common/AsyncSelect';
import { pushFlowTask } from '@/services/gen/flow';
import { getUrl } from '@/utils/flowToRouter';
import { Selection, UdcSelect } from '@/pages/gen/field';
import { isEmpty, isNil, hasIn, clone, toLower } from 'ramda';
import { selectBu } from '@/services/user/Contract/sales';
import { div, mul, genFakeId } from '@/utils/mathUtils';
import update from 'immutability-helper';
import { selectUsers } from '@/services/sys/user';
import { queryUdc } from '@/services/gen/app';

const { Description } = DescriptionList;
const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'sharingFlow';
@connect(({ loading, dispatch, sharingFlow, user }) => ({
  loading,
  dispatch,
  sharingFlow,
  user,
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
class SharingFlow extends PureComponent {
  componentDidMount() {
    // 初始得到主合同id给formData赋值
    const {
      dispatch,
      sharingFlow: {
        fieldsConfig: { taskKey },
      },
    } = this.props;
    const { id, taskId } = fromQs();

    id &&
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: { modifyId: id },
      }).then(response => {
        if (response.ok) {
          const { sourceId } = response.datum;
          dispatch({
            type: `${DOMAIN}/querydataList`,
            payload: sourceId,
          });
        }
      });
    taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {
              buttons: [],
              panels: {
                disabledOrHidden: {},
              },
            },
          },
        });

    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: {
        pageNo: 'SALE_CONTRACT_PROFIT_MODIFY',
      },
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
        });
      }
    });
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      sharingFlow: { dataList, ruleList },
    } = this.props;

    let value = null;
    const rowData = ruleList[rowIndex];
    const mainData = dataList[0]; // 主表的值
    // eslint-disable-next-line
    let groupPercent = rowData.groupPercent;
    // eslint-disable-next-line
    let groupBaseType = rowData.groupBaseType;
    // eslint-disable-next-line
    let groupBaseTypeDesc = rowData.groupBaseTypeDesc;
    // eslint-disable-next-line
    let ruleNo = rowData.ruleNo;
    let $groupPercent = 0;
    if (rowField === 'remark') {
      // eslint-disable-next-line
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
          // 销售区域 对应 区域抽成比例
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
        // eslint-disable-next-line
        ruleNo = mainData.ruleNo;
        const a = toLower(rowData.groupRole) + 'ShareBase';
        const b = toLower(rowData.groupRole) + 'ShareBaseName';
        groupBaseType = mainData[a];
        groupBaseTypeDesc = mainData[b];
      } else {
        ruleNo = '';
      }
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
    } else {
      value = rowFieldValue;
    }

    // console.log(rowField, rowFieldValue, value, groupPercent);

    let maxGainerIngroupPercent = 100;
    ruleList.forEach((r, index) => {
      if (index !== rowIndex && r.groupRole === rowData.groupRole) {
        // console.log(index, r);
        maxGainerIngroupPercent -= r.gainerIngroupPercent || 0;
      }
    });

    if (rowField === 'groupRole') {
      // 此处对于单条的修改 update store
      const $arr = ruleList.filter(item => item.groupRole === rowFieldValue);
      if ($arr.length > 1) {
        // eslint-disable-next-line
        groupPercent = $arr[0].groupPercent;
        // eslint-disable-next-line
        groupBaseType = $arr[0].groupBaseType;
        // eslint-disable-next-line
        groupBaseTypeDesc = $arr[0].groupBaseTypeDesc;
        // eslint-disable-next-line
        maxGainerIngroupPercent = $arr[0].maxGainerIngroupPercent;
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
        },
      });

      dispatch({ type: `${DOMAIN}/updateState`, payload: { ruleList: newDataList } });
    } else if (rowField === 'gainerIngroupPercent') {
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
        },
      });

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
  };

  render() {
    const {
      sharingFlow: { pageConfig },
    } = this.props;
    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 3) {
      return <div />;
    }
    const [
      { pageFieldViews: baseView = {} },
      { pageFieldViews: ruleView = {} },
      { pageFieldViews: resultView = {} },
    ] = pageConfig.pageBlockViews;
    const baseJson = {};
    const ruleJson = {};
    const resultJson = {};
    baseView.forEach(field => {
      baseJson[field.fieldKey] = field;
    });
    ruleView.forEach(field => {
      ruleJson[field.fieldKey] = field;
    });
    resultView.forEach(field => {
      resultJson[field.fieldKey] = field;
    });

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      loading: false,
      showSearch: false,
      enableSelection: false,
      showColumn: false,
      showExport: false,
      scroll: { x: 1500 },
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
            <Selection.UDC
              code="ACC:PROFIT_ROLE"
              placeholder="请选择利益分配角色"
              disabled
              allowClear={false}
              value={value}
            />
          ),
        },
        {
          title: '利益分配比例',
          key: 'groupPercent',
          dataIndex: 'groupPercent',
          align: 'center',
          width: 100,
          required: true,
          render: (value, row, index) => (
            <InputNumber
              max={100}
              min={0}
              formatter={v => `${v}%`}
              parser={v => v.replace('%', '')}
              className="x-fill-100"
              disabled
              value={value}
            />
          ),
        },
        {
          title: '基于',
          key: 'groupBaseType',
          dataIndex: 'groupBaseType',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <Selection.UDC code="ACC:PROFIT_SHARE_BASE" value={value} disabled />
          ),
        },
        {
          title: '行来源类型',
          key: 'lineSource',
          dataIndex: 'lineSource',
          hidden: true,
          align: 'center',
          width: 150,
          render: value => <Selection.UDC disabled code="ACC:LINE_SOURCE" value={value} />,
        },
        {
          title: '收益 BU/资源',
          key: 'gainerBuId',
          dataIndex: 'gainerBuId',
          align: 'center',
          width: 200,
          required: true,
          render: (value, row, index) => (
            <Selection value={value} disabled source={() => selectBu()} />
          ),
        },
        {
          title: '收益占比',
          key: 'gainerInallPercent',
          dataIndex: 'gainerIngroupPercent',
          align: 'center',
          width: 100,
          required: true,
          render: (value, row, index) => (
            <InputNumber
              min={0}
              max={row.maxGainerIngroupPercent}
              formatter={v => `${v}%`}
              parser={v => v.replace('%', '')}
              className="x-fill-100"
              disabled
              value={value}
            />
          ),
        },
        {
          title: '实际利益分配比例',
          key: 'gainerInallPercent',
          dataIndex: 'allocationProportion',
          align: 'center',
          width: 150,
          render: (value, allValues) =>
            `${value ||
              div(mul(allValues.groupPercent, allValues.gainerIngroupPercent || 0), 100)}%`,
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
          key: 'busifieldType',
          dataIndex: 'busifieldTypeDesc',
          align: 'center',
          width: 100,
          render: value => value,
        },
        {
          title: '状态',
          key: 'agreeStatus',
          dataIndex: 'agreeStatusDesc',
          align: 'center',
          width: 100,
        },
        {
          title: '备注',
          key: 'remark',
          dataIndex: 'remark',
          align: 'left',
          width: 200,
          render: (value, row, index) => <Input className="x-fill-100" value={value} disabled />,
        },
      ]
        .filter(col => ruleJson[col.key].visibleFlag === 1)
        .map(col => ({
          ...col,
          title: ruleJson[col.key].displayName,
          sortNo: ruleJson[col.key].sortNo,
        }))
        .sort((c1, c2) => c1.sortNo - c2.sortNo),
    };

    const alreadyAllotTableProps = {
      rowKey: 'id',
      sortBy: 'id',
      loading: false,
      size: 'small',
      showSearch: false,
      enableSelection: false,
      showColumn: false,
      showExport: false,
      columns: [
        {
          title: '利益分配角色',
          key: 'groupRole',
          dataIndex: 'groupRoleDesc',
          align: 'left',
        },
        {
          title: '收益BU',
          key: 'gainerBuId',
          dataIndex: 'gainerBuName',
          align: 'left',
        },
        {
          title: '收益分得金额',
          key: 'receivedGainAmt',
          dataIndex: 'receivedGainAmt',
          align: 'right',
        },
        {
          title: '确认收入分得金额',
          key: 'confirmedGainAmt',
          dataIndex: 'confirmedGainAmt',
          align: 'right',
        },
        {
          title: '查看详情',
          key: 'lineSource',
          dataIndex: 'lineSource',
          hidden: true,
          align: 'center',
          render: (value, row, index) => {
            const {
              sharingFlow: {
                formData: { sourceId },
              },
            } = this.props;
            const { groupRole, gainerBuId } = row;
            return (
              <Link
                className="tw-link"
                to={`/plat/distInfoMgmt?contractId=${sourceId}&groupRole=${groupRole}&gainerBuId=${gainerBuId}`}
              >
                查看详情
              </Link>
            );
          },
        },
      ]
        .filter(col => resultJson[col.key].visibleFlag === 1)
        .map(col => ({
          ...col,
          title: resultJson[col.key].displayName,
          sortNo: resultJson[col.key].sortNo,
        }))
        .sort((c1, c2) => c1.sortNo - c2.sortNo),
    };

    const {
      dispatch,
      loading,
      user: {
        user: {
          extInfo: { resId },
        },
      },
      form: { validateFieldsAndScroll, getFieldDecorator },
      sharingFlow: { formData, ruleList, dataList, flowForm, fieldsConfig },
    } = this.props;

    const { profitdistResults } = formData;
    // eslint-disable-next-line
    profitdistResults && profitdistResults.map(v => (v.id = genFakeId()));

    const { panels, taskKey, buttons } = fieldsConfig;
    const { id, taskId, prcId, from, mode } = fromQs();

    // 规则被使用，就不能修改了,其他状态可以修改，即新建，激活
    // const ALREADY_USED = (ruleList[0] || {}).agreeStatus === 'SETTLED';
    const ALREADY_USED = false; // 取消已结算不能删除的限制

    const afterTableProps = {
      rowKey: 'id',
      sortBy: 'id',
      dataSource: ruleList,
      loading: loading.effects[`${DOMAIN}/query`],
      size: 'small',
      showAdd: !ALREADY_USED && taskKey === 'ACC_A39_01_SUBMIT_i',
      showDelete: !ALREADY_USED,
      showCopy: false,
      showSearch: false,
      enableSelection: false,
      showColumn: false,
      showExport: false,
      rowSelection: {
        getCheckboxProps: record => ({
          disabled:
            record.lineSource === 'SYSTEM' || ALREADY_USED || taskKey !== 'ACC_A39_01_SUBMIT_i',
        }),
      },
      onChange: filters => {
        this.fetchData(filters);
      },
      onAdd: newRow => {
        let gainerIngroupPercent = 100;
        ruleList.forEach((r, index) => {
          if (r.groupRole === 'DELI') {
            gainerIngroupPercent -= r.gainerIngroupPercent || 0;
          }
        });

        const newList = update(ruleList, {
          $push: [
            {
              ...newRow,
              gainerBuId: 1,
              lineSource: 'MAN',
              agreeStatusDesc: '新建',
              gainerIngroupPercent, // 收益占比，100% - 本分配角色的收益占比之后 LEADS
              groupRole: 'DELI',
              groupPercent: dataList[0].deliSharePercent,
              busifieldType: dataList[0].busifieldType,
              ruleNo: dataList[0].ruleNo, // 后台需要这个值做存储
              groupBaseType: dataList[0].deliShareBase, // 根据 DELI 取对应值给后台
              groupBaseTypeDesc: dataList[0].deliShareBaseName, // 根据 DELI 取对应值展示
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
          payload: { ruleList: newDataSource },
        });
      },

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
            <AsyncSelect
              source={() =>
                // 新建的规则，不能选交付BU，所以做一下过滤。交付BU的钱是这几个角色分完后剩下的
                queryUdc('ACC:PROFIT_ROLE').then(({ response }) =>
                  response.filter(({ code }) => code !== 'DELIVER')
                )
              }
              placeholder="请选择利益分配角色"
              onChange={this.onCellChanged(index, 'groupRole')}
              disabled={row.lineSource === 'SYSTEM' || taskKey !== 'ACC_A39_01_SUBMIT_i'}
              allowClear={false}
              value={value === 'DELIVER' ? '交付BU' : value} // 角色udc包含交付bu选项；但是下拉中又不能选择改值，但是又要显示改值
            />
          ),
        },
        {
          title: '利益分配比例',
          key: 'groupPercent',
          dataIndex: 'groupPercent',
          align: 'center',
          // width: 120,
          // render: value => `${value}%`,
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
              disabled={ALREADY_USED || taskKey !== 'ACC_A39_01_SUBMIT_i'}
              value={value}
            />
          ),
        },
        {
          title: '基于',
          key: 'groupBaseType',
          dataIndex: 'groupBaseType',
          align: 'center',
          width: 80,
          render: (value, row, index) => (
            <UdcSelect
              allowClear={false}
              code="ACC:PROFIT_SHARE_BASE"
              value={value}
              onChange={this.onCellChanged(index, 'groupBaseType')}
              disabled={taskKey !== 'ACC_A39_01_SUBMIT_i'}
            />
          ),
        },
        {
          title: '行来源类型',
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
          title: '收益 BU/资源',
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
                disabled={
                  ALREADY_USED || row.lineSource === 'SYSTEM' || taskKey !== 'ACC_A39_01_SUBMIT_i'
                }
                source={() => selectBu().then(resp => resp.response)}
                showSearch
                allowClear={false}
                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              />
            ) : (
              <AsyncSelect
                onChange={this.onCellChanged(index, 'gainerResId')}
                value={row.gainerResId}
                disabled={
                  ALREADY_USED || row.lineSource === 'SYSTEM' || taskKey !== 'ACC_A39_01_SUBMIT_i'
                }
                source={() => selectUsers().then(resp => resp.response)}
                showSearch
                allowClear={false}
                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              />
            ),
        },
        {
          title: '收益占比',
          key: 'gainerInallPercent',
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
              disabled={ALREADY_USED || taskKey !== 'ACC_A39_01_SUBMIT_i'}
              value={value}
            />
          ),
        },
        {
          title: '实际利益分配比例',
          key: 'gainerInallPercent',
          dataIndex: 'allocationProportion',
          align: 'center',
          width: 150,
          render: (value, allValues) =>
            `${value ||
              div(mul(allValues.groupPercent, allValues.gainerIngroupPercent || 0), 100)}%`,
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
          key: 'busifieldType',
          dataIndex: 'busifieldTypeDesc',
          align: 'center',
          width: 100,
          render: value => value,
        },
        {
          title: '状态',
          key: 'agreeStatus',
          dataIndex: 'agreeStatusDesc',
          align: 'center',
          width: 80,
          // render: value => <Input className="x-fill-100" defaultValue={value} />,
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
              disabled={ALREADY_USED || taskKey !== 'ACC_A39_01_SUBMIT_i'}
            />
          ),
        },
      ],
    };

    const baseInfo = [
      <Description key="contractName" term="子合同名称">
        {formData.contractName}
      </Description>,
      <Description key="contractNo" term="编号">
        {formData.contractNo}
      </Description>,
      <Description key="signBuId" term="签单BU">
        {formData.signBuName}
      </Description>,
      <Description key="salesmanResId" term="销售负责人">
        {formData.salesmanResName}
      </Description>,
      <Description key="deliBuId" term="交付BU">
        {formData.deliBuName}
      </Description>,
      <Description key="deliResId" term="交付负责人">
        {formData.deliResName}
      </Description>,
      <Description key="regionBuId" term="销售区域BU">
        {formData.regionBuName}
      </Description>,
      <Description key="signDate" term="签订日期">
        {formData.signDate}
      </Description>,
      <Description key="amtTaxRate" term="含税总金额/税率">
        {formData.amt}
        {formData.taxRate && '/'}
        {formData.taxRate}
        {formData.taxRate && '% '}
      </Description>,
      <Description key="unTaxAmt" term="不含税金额">
        {formData.unTaxAmt}
      </Description>,
      <Description key="purchasingSum" term="相关项目采购">
        {formData.purChaseAmt}
      </Description>,
      <Description key="extraAmt" term="其他应减费用">
        {formData.extraAmt}
      </Description>,
      <Description key="effectiveAmt" term="有效合同额">
        {formData.effectiveAmt}
      </Description>,
      <Description key="grossProfit" term="可分配毛利">
        {formData.grossProfit}
      </Description>,
    ]
      .filter(desc => baseJson[desc.key].visibleFlag === 1)
      .map(desc => ({
        ...desc,
        props: {
          ...desc.props,
          term: baseJson[desc.key].displayName,
        },
      }))
      .sort((d1, d2) => d1.sortNo - d2.sortNo);

    return (
      <PageHeaderWrapper title="子合同收益分配流程">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark, branch } = bpmForm;
            const { key, branches } = operation;
            if (key === 'REJECTED') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () => {
                  if (taskKey === 'ACC_A39_02_BU_RES_b') {
                    dispatch({
                      type: `${DOMAIN}/flowApproveSecond`,
                      payload: {
                        taskId,
                        remark,
                        result: key,
                        worker: resId,
                      },
                    });
                    return Promise.resolve(false);
                  }
                  pushFlowTask(taskId, {
                    remark,
                    result: key,
                    branch,
                  }).then(({ status, response }) => {
                    if (status === 200) {
                      createMessage({ type: 'success', description: '操作成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
                    return Promise.resolve(false);
                  });
                  return Promise.resolve(false);
                },
              });
            }
            if (key === 'CLOSE') {
              createConfirm({
                content: '确定要关闭该流程吗？',
                onOk: () =>
                  dispatch({
                    type: `${DOMAIN}/closeFlow`,
                    payload: {
                      prcId,
                      remark,
                    },
                  }),
              });
            }

            if (key === 'APPROVED' || key === 'APPLIED') {
              if (taskKey !== 'ACC_A39_01_SUBMIT_i' && taskKey !== 'ACC_A39_02_BU_RES_b') {
                return Promise.resolve(true);
              }
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  if (taskKey === 'ACC_A39_02_BU_RES_b') {
                    dispatch({
                      type: `${DOMAIN}/flowApproveSecond`,
                      payload: {
                        taskId,
                        remark,
                        result: key,
                        worker: resId,
                      },
                    });
                  } else {
                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: {
                        taskId,
                        result: key,
                        procRemark: remark,
                      },
                    });
                  }
                }
              });
            }
            return Promise.resolve(false);
          }}
        >
          <Card className="tw-card-multiTab" bordered={false}>
            <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
              <Field
                name="resetFlag"
                label={baseJson.resetFlag.displayName || '是否影响已分配数据'}
                decorator={{
                  initialValue: formData.resetFlag,
                  rules: [
                    {
                      required: mode === 'edit' && taskKey === 'ACC_A39_01_SUBMIT_i',
                      message: `请选择${baseJson.resetFlag.displayName || '是否影响已分配数据'}`,
                    },
                  ],
                }}
              >
                <RadioGroup disabled={mode === 'view' || taskKey !== 'ACC_A39_01_SUBMIT_i'}>
                  <Radio value={1}>按修改后规则重新分配所有收入</Radio>
                  <Radio value={0}>不影响历史数据，修改后规则仅适用于新的收入数据</Radio>
                </RadioGroup>
              </Field>
            </FieldList>
            <DescriptionList
              size="large"
              title={formatMessage({ id: `sys.system.basicInfo`, desc: '基本信息' })}
              // col={2}
            >
              {baseInfo}
            </DescriptionList>
            <Divider dashed />
            <DescriptionList title="修改前规则" size="large">
              <DataTable {...tableProps} dataSource={formData.profitAgreeBef || []} />
            </DescriptionList>
            <Divider dashed />
            <FieldList legend="修改后规则">
              <EditableDataTable scroll={{ x: 1370 }} {...afterTableProps} />
            </FieldList>
            <Divider dashed />
            <DescriptionList title="已分配收入数据" size="large">
              <DataTable
                {...alreadyAllotTableProps}
                dataSource={formData.profitdistResults || []}
              />
            </DescriptionList>
          </Card>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default SharingFlow;
