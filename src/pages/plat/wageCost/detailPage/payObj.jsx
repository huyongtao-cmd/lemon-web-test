import React, { Component } from 'react';
import { Input } from 'antd';
import router from 'umi/router';
import DataTable from '@/components/common/DataTable';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectFinperiod } from '@/services/user/Contract/sales';

const DOMAIN = 'wageCostDetailPage';

@connect(({ loading, wageCostDetailPage }) => ({
  loading,
  ...wageCostDetailPage,
}))
class PayObj extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/payObjListQuery`,
    });
  }

  // fetchData
  fetchData = filter => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/payObjListQuery`,
      payload: filter,
    });
  };

  render() {
    const { loading, payobjList, payObjTotal, dispatch } = this.props;

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
        title: '公司',
        dataIndex: 'coName',
        align: 'center',
        width: '200',
      },
      {
        title: '地区',
        dataIndex: 'socialSecPlace',
        align: 'center',
        width: '80',
      },
      {
        title: '付款对象',
        dataIndex: 'abName',
        align: 'center',
        width: '120',
      },
      {
        title: '费用说明',
        dataIndex: 'payNote',
        align: 'center',
        width: '100',
      },
      {
        title: '金额',
        dataIndex: 'amt',
        align: 'right',
        width: '120',
        render: (record, obj, index) => <span>{to2(record)}</span>,
      },
      {
        title: '收款账户',
        dataIndex: 'accountNo',
        align: 'center',
      },
      {
        title: '收款银行',
        dataIndex: 'bankName',
        align: 'center',
      },
      {
        title: '户名',
        dataIndex: 'holderName',
        align: 'center',
      },
      {
        title: '收款银行网点名称',
        dataIndex: 'bankBranch',
        align: 'center',
      },
      {
        title: '付款依据',
        dataIndex: 'reasonName',
        align: 'center',
      },
    ];
    return (
      <PageHeaderWrapper title="付款对象">
        <DataTable
          loading={loading.effects[`${DOMAIN}/payObjListQuery`]}
          dataSource={payobjList}
          total={payObjTotal}
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
              title: '地区',
              dataIndex: 'socialSecPlace',
              tag: <Input placeholder="地区名称" />,
            },
            {
              title: '付款对象',
              dataIndex: 'paymentObj',
              tag: <Input placeholder="付款对象" />,
            },
          ]}
          columns={columns}
          scroll={{ x: 2000 }}
          // 查询
          onChange={filters => {
            this.fetchData(filters);
          }}
        />
      </PageHeaderWrapper>
    );
  }
}

export default PayObj;
