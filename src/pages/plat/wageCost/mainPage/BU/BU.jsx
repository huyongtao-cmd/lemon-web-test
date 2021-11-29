import React, { Component } from 'react';
import { Button, Card, Divider, Modal, Form, Select, Table, Input } from 'antd';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import update from 'immutability-helper';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';

const DOMAIN = 'wageCostMainPage';

@connect(({ loading, wageCostMainPage }) => ({
  loading,
  ...wageCostMainPage,
}))
class BU extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { loading, BUList, dispatch } = this.props;

    const defaultPagination = {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
      showTotal: total => `共 ${total} 条`,
      defaultPageSize: 10,
      defaultCurrent: 1,
      size: 'default',
    };

    const inputChange = (e, row) => {
      const val = e.target.value;
      const newDataSource = update(BUList, {
        [row.mytempId]: {
          remark: {
            $set: val,
          },
        },
      });
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          BUList: newDataSource,
          // BUIsSave: false,
        },
      });
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
        // dataIndex: 'amt',
        align: 'right',
        width: '100',
        render: (record, obj, index) => <span>{to2(record.amt)}</span>,
      },
      {
        title: '财务期间',
        dataIndex: 'finPeriodName',
        align: 'center',
        width: '120',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        align: 'center',
        width: 400,
        render: (value, row, index) => (
          <Input.TextArea
            // defaultValue={value}
            value={value}
            rows={1}
            maxLength={200}
            onChange={e => {
              inputChange(e, row);
            }}
          />
        ),
      },
    ];
    return (
      <PageHeaderWrapper title="BU成本">
        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="ui.menu.plat.expense.wageCost.mainpage.BUInfo"
              defaultMessage="BU人力成本"
            />
          }
          bordered={false}
          headStyle={{ backgroundColor: '#fff' }}
        >
          <Button
            className="tw-btn-primary"
            // icon="plus-circle"
            size="large"
            disabled={false}
            // loading={
            //   loading.effects[`wageCostMainPage/BUSave`] ||
            //   loading.effects[`wageCostMainPage/BUCreateData`]
            // }
            onClick={() => {
              dispatch({
                type: `${DOMAIN}/BUCreateData`,
              });
            }}
          >
            <Title
              id="ui.menu.plat.expense.wageCost.mainpage.createData"
              defaultMessage="生成数据"
            />
          </Button>
        </Card>
        <Table
          bordered
          pagination={defaultPagination}
          // loading={
          //   loading.effects[`wageCostMainPage/BUSave`] ||
          //   loading.effects[`wageCostMainPage/BUCreateData`]
          // }
          dataSource={BUList}
          scroll={{ x: 1200 }}
          columns={columns}
          rowKey={(record, index) => `${index}`}
        />
      </PageHeaderWrapper>
    );
  }
}

export default BU;
