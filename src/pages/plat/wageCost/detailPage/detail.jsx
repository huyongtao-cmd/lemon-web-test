import React, { Component } from 'react';
import { Input } from 'antd';
import DataTable from '@/components/common/DataTable';
import { connect } from 'dva';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectFinperiod } from '@/services/user/Contract/sales';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import conf from '../common/detailTableConf';

const DOMAIN = 'wageCostDetailPage';
@connect(({ loading, wageCostDetailPage }) => ({
  loading,
  ...wageCostDetailPage,
}))
class WagePageDetail extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/detailListQuery`,
    });
  }

  // fetchData
  fetchData = filter => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/detailListQuery`,
      payload: filter,
    });
  };

  render() {
    const { loading, detailList, detailTotal } = this.props;
    return (
      <PageHeaderWrapper title="新增成本明细">
        <DataTable
          enableSelection={false}
          loading={loading.effects[`${DOMAIN}/detailListQuery`]}
          dataSource={detailList}
          total={detailTotal}
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
              title: '公司',
              dataIndex: 'coName',
              tag: <Input placeholder="公司名称" />,
            },
            {
              title: '部门',
              dataIndex: 'buName',
              tag: <Input placeholder="部门名称" />,
            },
            {
              title: '社保缴纳地',
              dataIndex: 'socialSecPlace',
              tag: <Input placeholder="社保缴纳地" />,
            },
            {
              title: '费用承担BU',
              dataIndex: 'expenseBuName',
              tag: <Input placeholder="费用承担BU" />,
            },
            {
              title: '付款对象',
              dataIndex: 'paymentObj',
              tag: <Input placeholder="付款对象" />,
            },
          ]}
          columns={conf().filter(val => ['remark', 'staffNum'].indexOf(val.dataIndex) === -1)}
          // columns={conf()}
          scroll={{ x: 5700 }}
          // 查询
          onChange={filters => {
            this.fetchData(filters);
          }}
        />
      </PageHeaderWrapper>
    );
  }
}

export default WagePageDetail;
