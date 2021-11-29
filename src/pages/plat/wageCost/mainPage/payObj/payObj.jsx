import React, { Component } from 'react';
import { Button, Card, Divider, Modal, Form, Select, Table, Input } from 'antd';
import AsyncSelect from '@/components/common/AsyncSelect';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import update from 'immutability-helper';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { objOf } from 'ramda';
// import { selectSupplier } from '@/services/plat/wageCost';

const DOMAIN = 'wageCostMainPage';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 11 },
  { dataIndex: 'name', title: '名称', span: 13 },
];

@connect(({ loading, wageCostMainPage }) => ({
  loading,
  ...wageCostMainPage,
}))
class PayObj extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { loading, payObjList, reasonObj, dispatch } = this.props;

    const defaultPagination = {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
      showTotal: total => `共 ${total} 条`,
      defaultPageSize: 10,
      defaultCurrent: 1,
      size: 'default',
    };

    const SelectValueChange = (obj, row) => {
      if (obj) {
        const newDataSource = update(payObjList, {
          [row.mytempId]: {
            reasonNo: {
              $set: obj.valCode,
            },
          },
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            payObjList: newDataSource,
            // payObjIsSave: false,
          },
        });
      } else {
        const newDataSource = update(payObjList, {
          [row.mytempId]: {
            reasonNo: {
              $set: '',
            },
          },
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            payObjList: newDataSource,
            // payObjIsSave: false,
          },
        });
      }
    };

    const updatePay = (e, obj, index) => {
      if (obj) {
        const newDataSource = update(payObjList, {
          [obj.mytempId]: {
            payNote: {
              $set: e.target.value,
            },
          },
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            payObjList: newDataSource,
            // payObjIsSave: false,
          },
        });
      }
    };

    // const SelectDropdownVisibleChange = row => {
    //   if (row.abNo) {
    //     dispatch({
    //       type: `${DOMAIN}/selectReason`,
    //       payload: {
    //         abNo: row.abNo,
    //       },
    //     });
    //   }
    // };

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
        width: 50,
        render: (record, obj, index) => <span>{index + 1}</span>,
        fixed: 'left',
      },
      {
        title: '公司',
        dataIndex: 'coName',
        align: 'center',
        width: 280,
        fixed: 'left',
      },
      {
        title: '地区',
        dataIndex: 'socialSecPlace',
        align: 'center',
        width: 80,
        fixed: 'left',
      },
      {
        title: '付款对象',
        dataIndex: 'abName',
        align: 'center',
        width: 280,
        fixed: 'left',
      },
      {
        title: '费用说明',
        dataIndex: 'payNote',
        align: 'center',
        width: 160,
        render: (value, obj, index) => (
          <Input value={value} onChange={e => updatePay(e, obj, index)} />
        ),
        fixed: 'left',
      },
      {
        title: '金额',
        // dataIndex: 'amt',
        align: 'right',
        width: 100,
        render: (record, obj, index) => <span>{to2(record.amt)}</span>,
      },
      {
        title: '收款账户',
        dataIndex: 'accountNo',
        align: 'center',
        width: 180,
      },
      {
        title: '收款银行',
        dataIndex: 'bankName',
        align: 'center',
        width: 180,
      },
      {
        title: '户名',
        dataIndex: 'holderName',
        align: 'center',
        width: 180,
      },
      {
        title: '收款银行网点名称',
        dataIndex: 'bankBranch',
        align: 'center',
        width: 280,
      },
      {
        title: '付款依据',
        dataIndex: 'reasonNo',
        align: 'center',
        width: 330,
        render: (value, row, index) => (
          <Selection.Columns
            className="x-fill-100"
            source={row.abNo ? reasonObj[row.abNo] : []}
            transfer={{ key: 'id', code: 'valCode', name: 'valDesc' }}
            columns={particularColumns}
            value={value}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={obj => {
              SelectValueChange(obj, row);
            }}
            // onDropdownVisibleChange={() => {
            //   SelectDropdownVisibleChange(row);
            // }}
            placeholder="请选择付款依据"
          />
        ),
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
        >
          <Button
            className="tw-btn-primary"
            // icon="plus-circle"
            size="large"
            disabled={false}
            // loading={
            //   loading.effects[`wageCostMainPage/payObjSave`] ||
            //   loading.effects[`wageCostMainPage/payObjCreateData`]
            // }
            onClick={() => {
              dispatch({
                type: `${DOMAIN}/payObjCreateData`,
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
          //   loading.effects[`wageCostMainPage/payObjSave`] ||
          //   loading.effects[`wageCostMainPage/payObjCreateData`]
          // }
          dataSource={payObjList}
          scroll={{ x: 2100 }}
          columns={columns}
          rowKey={(record, index) => `${index}`}
        />
      </PageHeaderWrapper>
    );
  }
}

export default PayObj;
