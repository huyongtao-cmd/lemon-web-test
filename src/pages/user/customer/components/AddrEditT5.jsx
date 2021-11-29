import React from 'react';
import { Input, Switch } from 'antd';
import update from 'immutability-helper';

import Title from '@/components/layout/Title';
import { UdcSelect } from '@/pages/gen/field';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';

import { AddrEditContext, DOMAIN } from '../customerInfoEdit';

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrEditT5 = props => (
  <AddrEditContext.Consumer>
    {({ dispatch, bankList, bankListDel }) => {
      const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
        const val =
          rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
        // console.log('rowIndex, rowField, val ->', rowIndex, rowField, val);
        // 更新单元格状态
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            bankList: update(bankList, {
              [rowIndex]: {
                [rowField]: {
                  $set: val,
                },
              },
            }),
          },
        });
      };

      const getTableProps = () => ({
        rowKey: 'id',
        scroll: { x: 2400 },
        loading: false,
        pagination: false,
        total: bankList.length,
        dataSource: bankList,
        showCopy: false,
        onAdd: newRow => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              bankList: update(bankList, {
                $push: [
                  {
                    ...newRow,
                    defaultFlag: 0,
                    id: genFakeId(-1),
                  },
                ],
              }),
            },
          });
        },
        onDeleteItems: (selectedRowKeys, selectedRows) => {
          // console.log('selectedRowKeys ->', selectedRowKeys);
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              bankList: bankList.filter(
                row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
              ),
              bankListDel: [...(bankListDel || []), ...selectedRowKeys.filter(row => row > 0)],
            },
          });
        },
        columns: [
          {
            title: '账户类型',
            dataIndex: 'accType',
            align: 'center',
            required: true,
            options: {
              rules: [
                {
                  required: true,
                  message: '账户类型',
                },
              ],
            },
            render: (value, row, index) => (
              <UdcSelect
                size="small"
                value={value}
                code="COM:ACCOUNT_TYPE1"
                placeholder="请选择账户类型"
                onChange={onCellChanged(index, 'accType')}
              />
            ),
          },
          {
            title: '银行',
            dataIndex: 'bankName',
            align: 'center',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入银行"
                onBlur={onCellChanged(index, 'bankName')}
              />
            ),
          },
          {
            title: '开户地',
            dataIndex: 'bankCity',
            align: 'center',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入开户地"
                onBlur={onCellChanged(index, 'bankCity')}
              />
            ),
          },
          {
            title: '开户网点',
            dataIndex: 'bankBranch',
            align: 'center',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入开户网点"
                onBlur={onCellChanged(index, 'bankBranch')}
              />
            ),
          },
          {
            title: '户名',
            dataIndex: 'holderName',
            align: 'center',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入账户类型"
                onBlur={onCellChanged(index, 'holderName')}
              />
            ),
          },
          {
            title: '账号',
            dataIndex: 'accountNo',
            align: 'center',
            required: true,
            options: {
              rules: [
                {
                  required: true,
                  message: '请填写账号',
                },
              ],
            },
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请填写账号"
                onBlur={onCellChanged(index, 'accountNo')}
              />
            ),
          },
          {
            title: '币种',
            dataIndex: 'currCode',
            align: 'center',
            width: 120,
            render: (value, row, index) => (
              <UdcSelect
                size="small"
                value={value}
                code="COM:CURRENCY_KIND"
                placeholder="请选择币种"
                onChange={onCellChanged(index, 'currCode')}
              />
            ),
          },
          {
            title: '默认',
            dataIndex: 'defaultFlag',
            align: 'center',
            render: (value, row, index) => (
              <Switch defaultChecked={!!+value} onChange={onCellChanged(index, 'defaultFlag')} />
            ),
          },
          {
            title: '备注',
            dataIndex: 'remark',
            align: 'left',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入备注"
                onBlur={onCellChanged(index, 'remark')}
              />
            ),
          },
        ],
        buttons: [],
      });

      return <EditableDataTable {...getTableProps()} />;
    }}
  </AddrEditContext.Consumer>
);

AddrEditT5.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, formData }) => (
      <span className={!formData.abNo ? 'tw-card-multiTab-disabled' : void 0}>
        <Title dir="right" icon={tabModified[5] ? 'warning' : null} text="银行账户" />
      </span>
    )}
  </AddrEditContext.Consumer>
);

export default AddrEditT5;
