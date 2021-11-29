import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Button, Card, Form, Input, InputNumber } from 'antd';
import { isNil, cond, equals, T, isEmpty } from 'ramda';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import { Selection } from '@/pages/gen/field';
import { sub, mul, add, div, checkIfNumber } from '@/utils/mathUtils';
import { selectFinperiod } from '@/services/user/Contract/sales';

const { Description } = DescriptionList;
const DOMAIN = 'distInfoDetail';

@connect(({ distInfoDetail, loading }) => ({ distInfoDetail, loading }))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: changedValues,
    });
  },
})
@mountToTab()
class DistInfoDetail extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: id,
    });
  }

  tableProps = () => {
    const {
      dispatch,
      loading,
      distInfoDetail: { total, list },
    } = this.props;
    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      rowKey: 'groupRole',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      enableSelection: false,
      dataSource: list,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: changedValues,
        });
      },
      columns: [
        {
          title: '利益分配角色',
          dataIndex: 'groupRoleDesc',
        },
        {
          title: '收益BU',
          dataIndex: 'gainerBuName',
        },
        {
          title: '实际合同收益分配比例',
          dataIndex: 'gainerInallPercent',
          render: value => (value || value === 0) && <span>{value}%</span>,
        },
        {
          title: '利益分配基于',
          dataIndex: 'groupBaseTypeDesc',
        },
        {
          title: '收款分得金额',
          dataIndex: 'receivedGainAmt',
          align: 'right',
        },
        {
          title: '本期确认收入分得金额',
          dataIndex: 'confirmedGainAmt',
          align: 'right',
        },
      ],
    };
    return tableProps;
  };

  render() {
    const {
      distInfoDetail: { formData },
    } = this.props;

    // 是否是收款计划入口
    const isRecv = formData.triggerType === 'RECV_DIST';

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => {
              const { sourceUrl } = fromQs();
              sourceUrl
                ? closeThenGoto(sourceUrl)
                : closeThenGoto('/plat/distInfoMgmt/distInfoList');
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false}>
          <DescriptionList col={2} title="合同信息" hasSeparator>
            <Description term="相关子合同">{formData.contractInfo}</Description>
            <Description term="合同金额">{formData.camt}</Description>
            <Description term="税率">{formData.taxRate}%</Description>
            <Description term="有效销售额">{formData.effectiveAmt}</Description>
            <Description term="毛利">{formData.grossProfit}</Description>
          </DescriptionList>
          <DescriptionList col={2} title="收款及分配信息" hasSeparator>
            <Description term="当期应收金额">{formData.recvedAmt}</Description>
            <Description term="已收款金额">{formData.actualRecvedAmt}</Description>
            <Description term="往期已分配金额">{formData.prevDistRecvedAmt}</Description>
            <Description term="剩余可分配金额">{formData.batchDistRecvedAmt}</Description>
            <Description term="收入核算期间">{isRecv ? formData.finPeriodName : ''}</Description>
            <Description term="本期实际分配收入">{formData.batchDistRecvedAmt}</Description>
          </DescriptionList>
          <DescriptionList col={2} title="合同收入确认信息" hasSeparator>
            <Description term="当期确认收入金额">{formData.confirmAmt}</Description>
            <Description term="累计已确认收入">{formData.confirmedAmt}</Description>
            <Description term="往期已分配收入">{formData.prevDistConfirmedAmt}</Description>
            <Description term="剩余可分配收入">{formData.avalAmt}</Description>
            <Description term="收入核算期间">{isRecv ? '' : formData.finPeriodName}</Description>
            <Description term="本期实际分配收入">{formData.batchDistConfirmedAmt}</Description>
          </DescriptionList>
          <DescriptionList size="large" title="合同收益分配信息" />
          <DataTable {...this.tableProps()} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DistInfoDetail;
