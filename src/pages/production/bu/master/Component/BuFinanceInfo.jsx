import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Divider } from 'antd';
import DataTable from '@/components/common/DataTable';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'orgBuAcc';
const { Description } = DescriptionList;

@connect(({ loading, orgbu, orgBuAcc, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  orgbu,
  orgBuAcc,
  dispatch,
}))
@Form.create({})
class BuFinanceInfo extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { buId } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { buId },
    });
  }

  render() {
    const { loading, orgbu, orgBuAcc, dispatch } = this.props;
    const { formData } = orgbu;
    const { dataList = [] } = orgBuAcc;

    const tableProps = {
      rowKey: 'accId', // 目前数据里面没有 id
      sortBy: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      dispatch,
      loading,
      dataSource: dataList,
      enableSelection: false,
      showSearch: false,
      showColumn: false,
      columns: [
        {
          title: '财务年度',
          dataIndex: 'finYear',
          sorter: true,
        },
        {
          title: '财务期间',
          dataIndex: 'finPeriod',
          sorter: true,
        },
        {
          title: '科目编号',
          dataIndex: 'accCode',
          sorter: true,
          align: 'center',
        },
        {
          title: '科目名称',
          dataIndex: 'accName',
          sorter: true,
        },
        {
          title: '状态',
          dataIndex: 'accStatusDesc',
          sorter: true,
          align: 'center',
        },
        {
          title: '借',
          dataIndex: 'drAmt',
          sorter: true,
          align: 'right',
        },
        {
          title: '贷',
          dataIndex: 'crAmt',
          sorter: true,
          align: 'right',
        },
        {
          title: '余',
          dataIndex: 'balAmt',
          sorter: true,
          align: 'right',
        },
      ],
    };

    return (
      <>
        <DescriptionList size="large" title="基本信息">
          <Description term="当前财务年期">{formData.finPeriodName}</Description>
          <Description term="当前业务年期">{formData.busiPeriodName}</Description>
          <Description term="业务开始年期">{formData.beginPeriodName}</Description>
          <Description term="财务日历格式">{formData.finCalendarName}</Description>
          <Description term="科目模板">{formData.accTmplName}</Description>
          <Description term="币种">{formData.currCode}</Description>
        </DescriptionList>
        <Divider dashed />
        <DescriptionList size="large" title="财务科目">
          <DataTable {...tableProps} />
        </DescriptionList>
      </>
    );
  }
}

export default BuFinanceInfo;
