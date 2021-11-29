import React from 'react';
import { Input, Switch } from 'antd';
import update from 'immutability-helper';

import Title from '@/components/layout/Title';
import { UdcSelect } from '@/pages/gen/field';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';

import { AddrEditContext, DOMAIN } from '../customerInfoEdit';

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrEditT6 = props => (
  <AddrEditContext.Consumer>
    {({ dispatch, invoiceList, invoiceListDel }) => {
      const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
        const val =
          rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
        // console.log('rowIndex, rowField, val ->', rowIndex, rowField, val);
        // 更新单元格状态
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            invoiceList: update(invoiceList, {
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
        scroll: { x: 1600 },
        loading: false,
        pagination: false,
        total: invoiceList.length,
        dataSource: invoiceList,
        showCopy: false,
        onAdd: newRow => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              invoiceList: update(invoiceList, {
                $push: [
                  {
                    ...newRow,
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
              invoiceList: invoiceList.filter(
                row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
              ),
              invoiceListDel: [
                ...(invoiceListDel || []),
                ...selectedRowKeys.filter(row => row > 0),
              ],
            },
          });
        },
        columns: [
          {
            title: '发票信息',
            dataIndex: 'invInfo',
            align: 'left',
            required: true,
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入发票信息"
                onBlur={onCellChanged(index, 'invInfo')}
              />
            ),
          },

          {
            title: '发票抬头',
            dataIndex: 'invTitle',
            align: 'left',
            required: true,
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入发票抬头"
                onBlur={onCellChanged(index, 'invTitle')}
              />
            ),
          },
          {
            title: '税号',
            dataIndex: 'taxNo',
            align: 'left',
            required: true,
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入税号"
                onBlur={onCellChanged(index, 'taxNo')}
              />
            ),
          },
          {
            title: '发票税率',
            dataIndex: 'taxRate',
            align: 'center',
            render: (value, row, index) => (
              <UdcSelect
                size="small"
                value={value}
                code="COM:TAX_RATE"
                placeholder="请选择税率"
                onChange={onCellChanged(index, 'taxRate')}
              />
            ),
          },
          {
            title: '开票类型',
            dataIndex: 'invType',
            align: 'center',
            render: (value, row, index) => (
              <UdcSelect
                size="small"
                value={value}
                code="COM:INV_TYPE"
                placeholder="请选择开票类型"
                onChange={onCellChanged(index, 'invType')}
              />
            ),
          },
          {
            title: '开票地址',
            dataIndex: 'invAddr',
            align: 'center',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入开票地址"
                onBlur={onCellChanged(index, 'invAddr')}
              />
            ),
          },
          {
            title: '电话',
            dataIndex: 'invTel',
            align: 'center',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入电话"
                onBlur={onCellChanged(index, 'invTel')}
              />
            ),
          },
          {
            title: '开户行',
            dataIndex: 'bankName',
            align: 'center',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入开户行"
                onBlur={onCellChanged(index, 'bankName')}
              />
            ),
          },
          {
            title: '账号',
            dataIndex: 'accountNo',
            align: 'center',
            // required: true,
            options: {
              rules: [
                {
                  // required: true,
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
            // required: true,
            // options: {
            //   rules: [
            //     {
            //       // required: true,
            //       message: '请选择币种',
            //     },
            //   ],
            // },
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

AddrEditT6.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, formData }) => (
      <span className={!formData.abNo ? 'tw-card-multiTab-disabled' : void 0}>
        <Title dir="right" icon={tabModified[6] ? 'warning' : null} text="开票信息" />
      </span>
    )}
  </AddrEditContext.Consumer>
);

export default AddrEditT6;
