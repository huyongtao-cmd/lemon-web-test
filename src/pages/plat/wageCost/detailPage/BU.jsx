import React, { Component } from 'react';
import { Input } from 'antd';
import DataTable from '@/components/common/DataTable';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { selectFinperiod } from '@/services/user/Contract/sales';
import AsyncSelect from '@/components/common/AsyncSelect';

const DOMAIN = 'wageCostDetailPage';

@connect(({ loading, wageCostDetailPage }) => ({
  loading,
  ...wageCostDetailPage,
}))
class BU extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/buListQuery`,
    });
  }

  // fetchData
  fetchData = filter => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/buListQuery`,
      payload: filter,
    });
  };

  render() {
    const { loading, buList, buTotal } = this.props;

    const to2 = num => {
      if (num) {
        return num.toFixed(2);
      }
      return '';
    };

    const columns = [
      {
        title: '序号',
        dataIndex: '',
        align: 'center',
        width: '18',
        render: (record, obj, index) => <span>{index + 1}</span>,
      },
      {
        title: 'BU编号',
        dataIndex: 'buNo',
        align: 'center',
        width: '200',
      },
      {
        title: 'BU名称',
        dataIndex: 'buName',
        align: 'center',
        width: '80',
      },
      {
        title: 'BU负责人',
        dataIndex: 'inchargeRes',
        align: 'center',
        width: '120',
      },
      {
        title: '金额',
        dataIndex: 'amt',
        align: 'right',
        width: '100',
        render: (record, obj, index) => <span>{to2(record)}</span>,
      },
      // {
      //   title: '财务期间',
      //   dataIndex: 'finPeriodName',
      //   align: 'center',
      //   width: '120',
      // },
    ];
    return (
      <PageHeaderWrapper title="BU成本">
        <DataTable
          enableSelection={false}
          loading={loading.effects[`${DOMAIN}/buListQuery`]}
          dataSource={buList}
          total={buTotal}
          searchBarForm={[
            {
              title: '财务期间',
              dataIndex: 'finPeriodIds',
              tag: (
                <AsyncSelect
                  mode="multiple"
                  source={() => selectFinperiod().then(resp => resp.response)}
                  placeholder="请选择财务期间"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              ),
            },
            {
              title: 'BU名称',
              dataIndex: 'buName',
              tag: <Input placeholder="BU名称" />,
            },
          ]}
          columns={columns}
          scroll={{ x: 1200 }}
          // 查询
          onChange={filters => {
            this.fetchData(filters);
          }}
        />
      </PageHeaderWrapper>
    );
  }
}

export default BU;
