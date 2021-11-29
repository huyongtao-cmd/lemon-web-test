import React from 'react';
import { Input } from 'antd';
import update from 'immutability-helper';

import Title from '@/components/layout/Title';
import { UdcSelect, Selection } from '@/pages/gen/field';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';

import { AddrEditContext, DOMAIN } from '../customerInfoEdit';

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrEditT7 = props => (
  <AddrEditContext.Consumer>
    {({ dispatch, addressList, addressListDel }) => {
      const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
        const val =
          rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
        // console.log('rowIndex, rowField, val ->', rowIndex, rowField, val);
        // 更新单元格状态
        if (rowField === 'province') {
          dispatch({
            type: `${DOMAIN}/handleChangeCity`,
            payload: {
              [rowField]: val,
            },
          }).then(res => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                addressList: update(addressList, {
                  [rowIndex]: {
                    cityList: {
                      $set: res,
                    },
                    city: {
                      $set: '',
                    },
                    [rowField]: {
                      $set: val,
                    },
                  },
                }),
              },
            });
          });
        }
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            addressList: update(addressList, {
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
        scroll: { x: 1200 },
        loading: false,
        pagination: false,
        total: addressList.length,
        dataSource: addressList,
        showCopy: false,
        onAdd: newRow => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              addressList: update(addressList, {
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
              addressList: addressList.filter(
                row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
              ),
              addressListDel: [
                ...(addressListDel || []),
                ...selectedRowKeys.filter(row => row > 0),
              ],
            },
          });
        },
        columns: [
          {
            title: '地址类型',
            dataIndex: 'addressType',
            align: 'center',
            required: true,
            options: {
              rules: [
                {
                  required: true,
                  message: '请选择地址类型',
                },
              ],
            },
            render: (value, row, index) => (
              <Selection.UDC
                size="small"
                value={value}
                code="TSK:ADDRESS_TYPE"
                placeholder="请选择地址类型"
                onChange={onCellChanged(index, 'addressType')}
              />
            ),
          },
          {
            title: '国家',
            dataIndex: 'country',
            align: 'center',
            required: true,
            width: 100,
            options: {
              rules: [
                {
                  required: true,
                  message: '请选择国家',
                },
              ],
            },
            render: (value, row, index) => (
              <Selection.UDC
                size="small"
                value={value}
                code="COM:COUNTRY"
                placeholder="请选择国家"
                onChange={onCellChanged(index, 'country')}
              />
            ),
          },
          {
            title: '省',
            dataIndex: 'province',
            width: 200,
            align: 'center',
            render: (value, row, index) => (
              <Selection.UDC
                size="small"
                value={value}
                code="COM:PROVINCE"
                placeholder="请选择省"
                onChange={onCellChanged(index, 'province')}
              />
            ),
          },
          {
            title: '市',
            dataIndex: 'city',
            width: 200,
            align: 'center',
            render: (value, row, index) => (
              <Selection
                size="small"
                value={value}
                source={row.cityList}
                placeholder="请选择市"
                onChange={onCellChanged(index, 'city')}
              />
            ),
          },
          {
            title: '详细地址',
            dataIndex: 'detailaddr',
            align: 'left',
            required: true,
            options: {
              rules: [
                {
                  required: true,
                  message: '请填写详细地址',
                },
              ],
            },
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请填写详细地址"
                onBlur={onCellChanged(index, 'detailaddr')}
              />
            ),
          },
          {
            title: '邮编',
            dataIndex: 'zipcode',
            align: 'right',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请填写邮编"
                onBlur={onCellChanged(index, 'zipcode')}
              />
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

AddrEditT7.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, formData }) => (
      <span className={!formData.abNo ? 'tw-card-multiTab-disabled' : void 0}>
        <Title dir="right" icon={tabModified[7] ? 'warning' : null} text="地址信息" />
      </span>
    )}
  </AddrEditContext.Consumer>
);

export default AddrEditT7;
