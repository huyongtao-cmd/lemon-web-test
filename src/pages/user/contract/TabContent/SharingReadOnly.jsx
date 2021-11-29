/* eslint-disable prefer-destructuring */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, InputNumber, Table } from 'antd';
import update from 'immutability-helper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { UdcSelect } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import { fromQs } from '@/utils/stringUtils';
import { selectBu, selectSupplier } from '@/services/user/Contract/sales';
import { add, checkIfNumber, div, mul, sub } from '@/utils/mathUtils';
import { selectUsers } from '@/services/sys/user';
import { mountToTab } from '@/layouts/routerControl';

const DOMAIN = 'userContractSharing';

@connect(({ dispath, loading, userContractSharing, userContractEditSub }) => ({
  dispath,
  loading,
  userContractSharing,
  userContractEditSub,
}))
@mountToTab()
class Gathering extends PureComponent {
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
      userContractSharing: { dataList, ruleList },
    } = this.props;

    let value = null;
    let groupPercent = ruleList[rowIndex].groupPercent;

    if (rowField === 'remark') {
      value = rowFieldValue.target.value;
    } else if (rowField === 'groupRole') {
      value = rowFieldValue;
      switch (rowFieldValue) {
        case 'LEADS': {
          groupPercent = dataList[0].leadsSharePercent;
          break;
        }
        case 'DELI': {
          groupPercent = dataList[0].deliSharePercent;
          break;
        }
        case 'SIGN': {
          groupPercent = dataList[0].signSharePercent;
          break;
        }
        default: {
          groupPercent = ruleList[rowIndex].groupPercent;
        }
      }
    } else {
      value = rowFieldValue;
    }

    let maxGainerIngroupPercent = 100;
    ruleList.forEach((r, index) => {
      if (index !== rowIndex && r.groupRole === ruleList[rowIndex].groupRole) {
        maxGainerIngroupPercent -= r.gainerIngroupPercent || 0;
      }
    });

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
      },
    });

    dispatch({ type: `${DOMAIN}/updateState`, payload: { ruleList: newDataList } });
    dispatch({
      type: 'userContractEditSub/updateState',
      payload: { flag4: 1 },
    });
    // dispatch({ type: `${DOMAIN}/total` });
  };

  render() {
    const {
      dispatch,
      loading,
      formData,
      userContractSharing: {
        dataList,
        ruleList,
        delList,
        flag4,
        otherRecvList,
        delOtherList,
        otherRule,
      },
      userContractEditSub: { pageConfig = {} },
    } = this.props;

    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 6) {
      return <div />;
    }

    let pageRule = [];
    let pageAgree = [];
    let pageOther = [];
    pageBlockViews.forEach(block => {
      if (block.blockKey === 'SALE_CONTRACT_DETAIL_SUB_PROFIT_RULE') {
        pageRule = block.pageFieldViews;
      }
      if (block.blockKey === 'SALE_CONTRACT_DETAIL_SUB_PROFIT_AGREE') {
        pageAgree = block.pageFieldViews;
      }
      if (block.blockKey === 'SALE_CONTRACT_DETAIL_SUB_OTHER_RECV') {
        pageOther = block.pageFieldViews;
      }
    });

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

    const columns = [
      {
        title: '分配规则码',
        key: 'ruleNo',
        dataIndex: 'ruleNo',
        align: 'center',
      },
      {
        title: '平台抽成比例',
        key: 'platSharePercent',
        dataIndex: 'platSharePercent',
        align: 'center',
        render: value => `${value}%`,
      },
      {
        title: '基于',
        key: 'platShareBase',
        dataIndex: 'platShareBaseName',
        align: 'center',
      },
      {
        title: '行业补贴比例',
        key: 'leadsSharePercent',
        dataIndex: 'leadsSharePercent',
        align: 'center',
        render: value => `${value}%`,
      },
      {
        title: '基于',
        key: 'leadsShareBase',
        dataIndex: 'leadsShareBaseName',
        align: 'center',
      },
      {
        title: '签单抽成比例',
        key: 'signSharePercent',
        dataIndex: 'signSharePercent',
        align: 'center',
        render: value => `${value}%`,
      },
      {
        title: '基于',
        key: 'signShareBase',
        dataIndex: 'signShareBaseName',
        align: 'center',
      },
      {
        title: '售前抽成比例',
        key: 'deliSharePercent',
        dataIndex: 'deliSharePercent',
        align: 'center',
        render: value => `${value}%`,
      },
      {
        title: '基于',
        key: 'deliShareBase',
        dataIndex: 'deliShareBaseName',
        align: 'center',
      },
      {
        title: '备注',
        key: 'remark',
        dataIndex: 'remark',
        align: 'center',
      },
    ]
      .filter(col => !col.key || (jsonRule[col.key] && jsonRule[col.key].visibleFlag === 1))
      .map(col => ({
        ...col,
        title: jsonRule[col.key].displayName,
        sortNo: jsonRule[col.key].sortNo,
      }))
      .sort((f1, f2) => f1.sortNo - f2.sortNo);

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      dataSource: ruleList,
      loading: loading.effects[`${DOMAIN}/query`],
      size: 'small',
      // scroll: {
      //   x: '120%',
      // },
      rowSelection: {
        getCheckboxProps: record => ({
          disabled: record.lineSource === 'SYSTEM',
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
              busifieldType: ruleList[0].busifieldType,
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

      showAdd: false,
      showCopy: false,
      showDelete: false,
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

      columns: [
        {
          title: '分配规则码',
          key: 'ruleNo',
          dataIndex: 'ruleNo',
          align: 'center',
        },
        {
          title: '利益分配角色',
          key: 'groupRole',
          dataIndex: 'groupRole',
          align: 'center',
          required: true,
          render: (value, row, index) => (
            <UdcSelect
              onChange={this.onCellChanged(index, 'groupRole')}
              disabled
              allowClear={false}
              code="ACC:PROFIT_ROLE"
              value={value}
            />
          ),
        },
        {
          title: '利益分配比例',
          key: 'groupPercent',
          dataIndex: 'groupPercent',
          align: 'center',
          render: value => `${value || 0}%`,
        },
        {
          title: '基于',
          key: 'groupBaseType',
          dataIndex: 'groupBaseTypeDesc',
          align: 'center',
        },
        {
          title: '行来源类型',
          key: 'lineSource',
          dataIndex: 'lineSource',
          hidden: true,
          align: 'center',
          // required: true,
          render: value => (
            <UdcSelect allowClear={false} disabled code="ACC:LINE_SOURCE" value={value} />
          ),
          // }, {
          //   title: '分配标的类型',
          //   dataIndex: 'groupBaseType',
          //   align: 'center',
          //   required: true,
          //   render: value => <Input className="x-fill-100" defaultValue={value} />,
        },
        {
          title: '收益 BU/资源',
          key: 'gainerBuId',
          dataIndex: 'gainerBuId',
          align: 'center',
          required: true,
          render: (value, row, index) =>
            value ? (
              <AsyncSelect
                onChange={this.onCellChanged(index, 'gainerBuId')}
                value={value}
                disabled
                source={() => selectBu().then(resp => resp.response)}
                showSearch
                allowClear={false}
                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              />
            ) : (
              <AsyncSelect
                onChange={this.onCellChanged(index, 'gainerResId')}
                value={row.gainerResId}
                disabled
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
              disabled
              onChange={this.onCellChanged(index, 'gainerIngroupPercent')}
              min={0.01}
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
          dataIndex: 'allocationProportion',
          align: 'center',
          render: (value, allValues) =>
            `${value ||
              div(mul(allValues.groupPercent, allValues.gainerIngroupPercent || 0), 100)}%`,
        },
        {
          title: '预计分配额',
          key: 'expectDistAmt',
          dataIndex: 'expectDistAmt',
          align: 'center',
        },
        {
          title: '利益来源方',
          key: 'busifieldType',
          dataIndex: 'busifieldTypeDesc',
          align: 'center',
          render: value => value,
        },
        {
          title: '状态',
          key: 'agreeStatus',
          dataIndex: 'agreeStatusDesc',
          align: 'center',
          // render: value => <Input className="x-fill-100" defaultValue={value} />,
        },
        {
          title: '备注',
          key: 'remark',
          dataIndex: 'remark',
          align: 'left',
          render: (value, row, index) => (
            <Input
              disabled
              onChange={this.onCellChanged(index, 'remark')}
              className="x-fill-100"
              value={value}
            />
          ),
        },
      ]
        .filter(col => !col.key || (jsonAgree[col.key] && jsonAgree[col.key].visibleFlag === 1))
        .map(col => ({
          ...col,
          title: jsonAgree[col.key].displayName,
          sortNo: jsonAgree[col.key].sortNo,
        }))
        .sort((f1, f2) => f1.sortNo - f2.sortNo),
    };
    const otherRecvProps = {
      rowKey: 'id',
      sortBy: 'id',
      dataSource: otherRecvList,
      loading: loading.effects[`${DOMAIN}/query`], // loading 作用,异步请求加载数据时，给页面加上一个加载数据的效果，异步请求完成时，取消效果
      size: 'small',
      pagination: false,
      bordered: true,

      showAdd: false,
      showCopy: false,
      showDelete: false,
      columns: [
        {
          title: '交易类型码',
          key: 'dealNo',
          dataIndex: 'dealNo',
          align: 'center',
          width: 100,
        },
        {
          title: '交易类型说明',
          key: 'dealDesc',
          dataIndex: 'dealDesc',
          align: 'center',
          width: 100,
        },
        {
          title: '收入方BU',
          key: 'inBuId',
          dataIndex: 'inBuName',
          align: 'center',
          width: 100,
        },
        {
          title: '支出方BU',
          key: 'outBuId',
          dataIndex: 'outBuName',
          align: 'center',
          width: 100,
        },
        {
          title: '交易金额',
          key: 'dealAmt',
          dataIndex: 'dealAmt',
          align: 'center',
          width: 100,
        },
        {
          title: '相关收款节点',
          key: 'recvplanId',
          dataIndex: 'recvplanName',
          align: 'center',
          width: 100,
        },
        {
          title: '状态',
          key: 'applyStatus',
          dataIndex: 'applyStatusDesc',
          align: 'center',
          width: 80,
        },
        {
          title: '备注',
          key: 'remark',
          dataIndex: 'remark',
          align: 'left',
          width: 200,
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
          dataSource={dataList}
          columns={columns}
          loading={loading.effects[`${DOMAIN}/query`]}
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

        <br />

        <div className="tw-card-title m-b-2">子合同收益分配规则</div>

        {ruleList.length > 0 ? <EditableDataTable {...tableProps} /> : null}
        <br />

        <div className="tw-card-title m-b-2">其他相关收付计划</div>

        {otherRecvList.length > 0 ? <Table {...otherRecvProps} /> : null}
      </>
    );
  }
}

export default Gathering;
