import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Tooltip } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { Selection, BuVersion } from '@/pages/gen/field';
import { queryUdc } from '@/services/gen/app';
import { selectBus } from '@/services/org/bu/bu';
import { selectOus, selectCusts, selectBuProduct } from '@/services/gen/list';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'sysBasicProfitdistRule';

@connect(({ loading, sysBasicProfitdistRule }) => ({
  sysBasicProfitdistRule,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class ProfitdistRule extends PureComponent {
  componentDidMount() {
    this.fetchData({ sortBy: 'id', sortDirection: 'ASC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.buId, 'buId', 'buVersionId'),
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      sysBasicProfitdistRule: { dataSource, total },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      total,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '分配规则码', // TODO: 国际化
          dataIndex: 'ruleNo',
          tag: <Input placeholder="请输入分配规则码" />,
        },
        {
          title: '签单法人主体', // TODO: 国际化
          dataIndex: 'ouId',
          tag: <Selection source={() => selectOus()} placeholder="请选择签单法人主体" />,
        },
        {
          title: 'BU', // TODO: 国际化
          dataIndex: 'buId',
          tag: <BuVersion />,
        },
        {
          title: 'BU类别', // TODO: 国际化
          dataIndex: 'buFactor1',
          tag: <Selection.UDC code="ORG.BU_CAT1" placeholder="请选择BU类别" />,
        },
        {
          title: 'BU小类', // TODO: 国际化
          dataIndex: 'buFactor2',
          tag: <Selection.UDC code="ORG.BU_CAT2" placeholder="请选择BU小类" />,
        },
        {
          title: '客户', // TODO: 国际化
          dataIndex: 'custId',
          tag: <Selection source={() => selectCusts()} placeholder="请选择客户" />,
        },
        {
          title: '客户类别', // TODO: 国际化
          dataIndex: 'custFactor1',
          tag: <Selection.UDC code="TSK.CUST_CAT1" placeholder="请选择客户类别" />,
        },
        {
          title: '客户小类', // TODO: 国际化
          dataIndex: 'custFactor2',
          tag: <Selection.UDC code="TSK.CUST_CAT2" placeholder="请选择客户小类" />,
        },
        {
          title: '客户性质', // TODO: 国际化
          dataIndex: 'custFactor3',
          tag: <Selection.UDC code="TSK.CONTRACT_CUSTPROP" placeholder="请选择客户性质" />,
        },
        {
          title: '提成类别', // TODO: 国际化
          dataIndex: 'projFactor1',
          tag: <Selection.UDC code="TSK.PROJ_PROP" placeholder="请选择提成类别" />,
        },
        {
          title: '销售品项编码', // TODO: 国际化
          dataIndex: 'prodId',
          tag: <Selection source={() => selectBuProduct()} placeholder="请选择销售品项编码" />,
        },
        {
          title: '产品大类', // TODO: 国际化
          dataIndex: 'prodFactor1',
          tag: <Selection.UDC code="TSK.SALE_TYPE1" placeholder="请选择产品大类" />,
        },
        {
          title: '产品小类', // TODO: 国际化
          dataIndex: 'prodFactor2',
          tag: <Selection.UDC code="TSK.SALE_TYPE2" placeholder="请选择产品小类" />,
        },
        {
          title: '供应主体类别', // TODO: 国际化
          dataIndex: 'prodFactor3',
          tag: <Selection.UDC code="COM.PROD_PROP" placeholder="请选择供应主体类别" />,
        },
        {
          title: '交易性质', // TODO: 国际化
          dataIndex: 'cooperationType',
          tag: <Selection.UDC code="TSK.COOPERATION_TYPE" placeholder="请选择交易性质" />,
        },
        {
          title: '促销码', // TODO: 国际化
          dataIndex: 'promotionType',
          tag: <Selection.UDC code="TSK.PROMOTION_TYPE" placeholder="请选择促销码" />,
        },
      ],
      columns: [
        {
          title: '分配规则码', // TODO: 国际化
          dataIndex: 'ruleNo',
          align: 'center',
          render: (value, row, key) => (
            <Link
              className="tw-link"
              to={`/plat/distInfoMgmt/profitdistRule/profitdistRuleQuery?id=${row.id}`}
            >
              {value}
            </Link>
          ),
        },
        {
          title: '具体BU编码', // TODO: 国际化
          dataIndex: 'buName',
          align: 'center',
        },
        {
          title: 'BU类别', // TODO: 国际化
          dataIndex: 'buFactor1Name',
          align: 'center',
        },
        {
          title: 'BU小类', // TODO: 国际化
          dataIndex: 'buFactor2Name',
        },
        {
          title: '具体客户编号', // TODO: 国际化
          dataIndex: 'custName',
          align: 'center',
        },
        {
          title: '客户类别', // TODO: 国际化
          dataIndex: 'custFactor1Name',
          align: 'center',
        },
        {
          title: '客户小类', // TODO: 国际化
          dataIndex: 'custFactor2Name',
          align: 'center',
        },
        {
          title: '客户性质', // TODO: 国际化
          dataIndex: 'custFactor3Name',
          align: 'center',
        },
        {
          title: '提成类别', // TODO: 国际化
          dataIndex: 'projFactor1Name',
          align: 'center',
        },
        {
          title: '具体销售品项编码', // TODO: 国际化
          dataIndex: 'prodName',
          align: 'center',
        },
        {
          title: '产品大类', // TODO: 国际化
          dataIndex: 'prodFactor1Name',
          align: 'center',
        },
        {
          title: '产品小类', // TODO: 国际化
          dataIndex: 'prodFactor2Name',
          align: 'center',
        },
        {
          title: '供应主体类别', // TODO: 国际化
          dataIndex: 'prodFactor3Name',
          align: 'center',
        },
        {
          title: '交易性质', // TODO: 国际化
          dataIndex: 'cooperationTypeName',
          align: 'center',
        },
        {
          title: '促销码', // TODO: 国际化
          dataIndex: 'promotionTypeName',
          align: 'center',
        },
        {
          title: '交易方式', // TODO: 国际化
          dataIndex: 'channelTypeName',
          align: 'center',
        },
        {
          title: '签单法人主体', // TODO: 国际化
          dataIndex: 'ouName',
          align: 'center',
        },
        {
          title: '平台编号', // TODO: 国际化
          dataIndex: 'busifieldTypeName',
          align: 'center',
        },
        {
          title: '平台抽成比例', // TODO: 国际化
          dataIndex: 'platSharePercent',
          align: 'right',
        },
        {
          title: '平台抽成基于', // TODO: 国际化
          dataIndex: 'platShareBaseName',
          align: 'center',
        },
        {
          title: '签单抽成比例', // TODO: 国际化
          dataIndex: 'signSharePercent',
          align: 'right',
        },
        {
          title: '签单抽成基于', // TODO: 国际化
          dataIndex: 'signShareBaseName',
          align: 'center',
        },
        {
          title: '售前抽成比例', // TODO: 国际化
          dataIndex: 'deliSharePercent',
          align: 'right',
        },
        {
          title: '售前抽成基于', // TODO: 国际化
          dataIndex: 'deliShareBaseName',
          align: 'center',
        },
        {
          title: '行业补贴比例', // TODO: 国际化
          dataIndex: 'leadsSharePercent',
          align: 'right',
        },
        {
          title: '行业补贴基于', // TODO: 国际化
          dataIndex: 'leadsShareBaseName',
          align: 'center',
        },
        {
          title: '备注', // TODO: 国际化
          dataIndex: 'remark',
          align: 'right',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push(`/plat/distInfoMgmt/profitdistRule/profitdistRuleDetail?mode=create`),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push(
              `/plat/distInfoMgmt/profitdistRule/profitdistRuleDetail?id=${selectedRowKeys}&mode=update`
            ),
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: { id: selectedRowKeys, queryParams },
                }),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} scroll={{ x: 4000 }} />
      </PageHeaderWrapper>
    );
  }
}

export default ProfitdistRule;
