import React, { PureComponent } from 'react';
import { connect } from 'dva';
import DataTable from '@/components/common/DataTable';
import ReactiveWrapper from '@/components/layout/ReactiveWrapper';

const DOMAIN = 'orgbu';

@connect(({ loading, orgbu }) => ({
  loading,
  orgbu,
}))
class BuSettlementEQVA extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryBuTree`,
    });
  }

  render() {
    const { dispatch } = this.props;

    const tableData = [
      {
        s1: '1',
        s2: '2',
        s3: '3',
        s4: '4',
        s5: '5',
        s6: '6',
        s7: '7',
      },
      {
        s1: '1',
        s2: '2',
        s3: '3',
        s4: '4',
        s5: '5',
        s6: '6',
        s7: '7',
      },
    ];

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      // limit: stringUtils.queryURL('limit'),
      // offset: stringUtils.queryURL('offset'),
      sortDirection: 'DESC',
      scroll: {
        x: 2850,
      },
      columnsCache: DOMAIN,
      dispatch,
      // loading,
      expirys: 0,
      dataSource: tableData,
      showSearch: false,
      showColumn: false,
      onChange: filters => {
        // console.log('onChange--', filters);
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      columns: [
        {
          title: '结算当量名称*',
          dataIndex: 's1',
          width: 150,
          sorter: true,
        },
        {
          title: '当量周期格式*',
          dataIndex: 's2',
          width: 150,
          sorter: true,
        },
        {
          title: '到当量类别码',
          dataIndex: 's3',
          width: 150,
          sorter: true,
        },
        {
          title: '到BU编号',
          dataIndex: 's4',
          width: 150,
          sorter: true,
        },
        {
          title: '到BU名称',
          dataIndex: 's5',
          width: 150,
          sorter: true,
        },
        {
          title: '币种*',
          dataIndex: 's6',
          width: 150,
          sorter: true,
        },
        {
          title: 'Markup金额',
          dataIndex: 's7',
          width: 150,
          sorter: true,
        },
        {
          title: 'Markup百分比',
          dataIndex: 's8',
          width: 150,
          sorter: true,
        },
        {
          title: '生效日期*',
          dataIndex: 's9',
          width: 150,
          sorter: true,
        },
        {
          title: '过期日期*',
          dataIndex: 's10',
          width: 150,
          sorter: true,
        },
        {
          title: '审批状态',
          dataIndex: 's11',
          width: 150,
          sorter: true,
        },
        {
          title: '提交人',
          dataIndex: 's12',
          width: 150,
          sorter: true,
        },
        {
          title: '提交时间',
          dataIndex: 's13',
          width: 150,
          sorter: true,
        },
        {
          title: '审批人',
          dataIndex: 's14',
          width: 150,
          sorter: true,
        },
        {
          title: '审批时间',
          dataIndex: 's15',
          width: 150,
          sorter: true,
        },
        {
          title: '激活人',
          dataIndex: 's16',
          width: 150,
          sorter: true,
        },
        {
          title: '激活时间',
          dataIndex: 's17',
          width: 150,
          sorter: true,
        },
        {
          title: '不激活人',
          dataIndex: 's18',
          width: 150,
          sorter: true,
        },
        {
          title: '不激活时间',
          dataIndex: 's19',
          width: 150,
          sorter: true,
        },
      ],
    };

    return (
      <ReactiveWrapper>
        <DataTable {...tableProps} />
      </ReactiveWrapper>
    );
  }
}

export default BuSettlementEQVA;
