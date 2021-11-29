import React, { Component } from 'react';
import { Card, Table } from 'antd';
import Title from '@/components/layout/Title';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'wageCostMainPage';

@connect(({ loading, wageCostMainPage }) => ({
  loading,
  ...wageCostMainPage,
}))
class PayObj extends Component {
  render() {
    const { loading, payObjList, payObjTotal, reasonObj, dispatch } = this.props;

    const defaultPagination = {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
      showTotal: total => `共 ${total} 条`,
      defaultPageSize: 10,
      defaultCurrent: 1,
      size: 'default',
    };

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
        width: '120',
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
        width: '80',
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
        width: '80',
        render: (record, obj, index) => <span>{to2(record)}</span>,
      },
      {
        title: '收款账户',
        dataIndex: 'accountNo',
        align: 'center',
        width: '120',
      },
      {
        title: '收款银行',
        dataIndex: 'bankName',
        align: 'center',
        width: '100',
      },
      {
        title: '户名',
        dataIndex: 'holderName',
        align: 'center',
        width: '80',
      },
      {
        title: '收款银行网点名称',
        dataIndex: 'bankBranch',
        align: 'center',
        width: '100',
      },
      {
        title: '付款依据',
        dataIndex: 'reasonName',
        align: 'center',
        width: '120',
      },
    ];
    return (
      <PageHeaderWrapper title="付款对象">
        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="ui.menu.plat.expense.wageCost.mainpage.payObjInfo"
              defaultMessage="付款对象信息"
            />
          }
          bordered={false}
          headStyle={{ backgroundColor: '#fff' }}
          bodyStyle={{ padding: '0px' }}
        />
        <DataTable
          enableSelection={false}
          showSearch={false}
          // bordered
          // pagination={defaultPagination}
          // loading={
          //   loading.effects[`wageCostMainPage/payObjSave`] ||
          //   loading.effects[`wageCostMainPage/payObjCreateData`]
          // }
          dataSource={payObjList}
          total={payObjTotal}
          scroll={{ x: 2000 }}
          leftButtons={[
            {
              key: 'add',
              className: 'tw-btn-primary',
              title: '生成付款申请单',
              loading: false,
              hidden: false,
              disabled: false,
              minSelections: 0,
              cb: (selectedRowKeys, selectedRows, queryParams) => {
                const { id } = fromQs();
                dispatch({
                  type: `${DOMAIN}/generateByCostHandle`,
                  payload: { id },
                });
              },
            },
          ]}
          columns={columns}
          searchBarForm={[]}
          rowKey={(record, index) => `${index}`}
        />
      </PageHeaderWrapper>
    );
  }
}

export default PayObj;
