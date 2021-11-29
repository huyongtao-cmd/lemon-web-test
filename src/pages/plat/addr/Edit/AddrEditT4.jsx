import React from 'react';
import { Input } from 'antd';
import { formatMessage } from 'umi/locale';
import update from 'immutability-helper';

import Title from '@/components/layout/Title';
import { UdcSelect } from '@/pages/gen/field';
import { genFakeId } from '@/utils/mathUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import EditableDataTable from '@/components/common/EditableDataTable';
import { createAlert } from '@/components/core/Confirm';

import { AddrEditContext, DOMAIN } from './index';

// 注意-> 真正的上下文在Consumer里面，多个Tab共享父页面的上下文
const AddrEditT4 = props => (
  <AddrEditContext.Consumer>
    {({ dispatch, connList, connListDel }) => {
      const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
        const val =
          rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
        // console.log('rowIndex, rowField, val ->', rowIndex, rowField, val);
        // 更新单元格状态
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            connList: update(connList, {
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
        scroll: { x: 1800 },
        loading: false,
        pagination: false,
        total: connList.length,
        dataSource: connList,
        showCopy: false,
        onAdd: newRow => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              connList: update(connList, {
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
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              connList: connList.filter(
                row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
              ),
              connListDel: selectedRowKeys.filter(row => row > 0).concat(connListDel),
            },
          });
        },
        columns: [
          {
            title: '联系人类型',
            dataIndex: 'contactType',
            align: 'center',
            width: 180,
            required: true,
            options: {
              rules: [
                {
                  required: true,
                  message: '请选择类型',
                },
              ],
            },
            render: (value, row, index) => (
              <UdcSelect
                size="small"
                value={value}
                code="COM:CONTACT_TYPE"
                placeholder="请选择联系人类型"
                onChange={onCellChanged(index, 'contactType')}
              />
            ),
          },
          {
            title: '姓名',
            dataIndex: 'contactPerson',
            align: 'center',
            required: true,
            options: {
              rules: [
                {
                  required: true,
                  message: '请输入姓名',
                },
              ],
            },
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入姓名"
                onBlur={onCellChanged(index, 'contactPerson')}
              />
            ),
          },
          {
            title: '手机',
            dataIndex: 'mobile',
            align: 'right',
            required: true,
            options: {
              rules: [
                {
                  required: true,
                  message: '请输入手机',
                },
              ],
            },
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入手机"
                onBlur={onCellChanged(index, 'mobile')}
              />
            ),
          },
          {
            title: '电话',
            dataIndex: 'tel',
            align: 'right',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入电话"
                onBlur={onCellChanged(index, 'tel')}
              />
            ),
          },
          {
            title: '邮箱',
            dataIndex: 'email',
            align: 'left',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入邮箱"
                onBlur={onCellChanged(index, 'email')}
              />
            ),
          },
          {
            title: '联系地址',
            dataIndex: 'address',
            align: 'left',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入联系地址"
                onBlur={onCellChanged(index, 'address')}
              />
            ),
          },
          {
            title: '社交账号类型',
            dataIndex: 'snsType',
            align: 'center',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="自由输入"
                onBlur={onCellChanged(index, 'snsType')}
              />
            ),
          },
          {
            title: '社交账号',
            dataIndex: 'snsNo',
            align: 'right',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入社交账号"
                onBlur={onCellChanged(index, 'snsNo')}
              />
            ),
          },
          {
            title: '部门',
            dataIndex: 'department',
            align: 'center',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入部门"
                onBlur={onCellChanged(index, 'department')}
              />
            ),
          },
          {
            title: '岗位',
            dataIndex: 'position',
            align: 'center',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入岗位"
                onBlur={onCellChanged(index, 'position')}
              />
            ),
          },
          {
            title: '关系',
            dataIndex: 'relation',
            align: 'center',
            render: (value, row, index) => (
              <Input
                size="small"
                defaultValue={value}
                placeholder="请输入关系"
                onBlur={onCellChanged(index, 'relation')}
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

AddrEditT4.Title = props => (
  <AddrEditContext.Consumer>
    {({ tabModified, formData }) => (
      <span className={!formData.abNo ? 'tw-card-multiTab-disabled' : void 0}>
        <Title dir="right" icon={tabModified[3] ? 'warning' : null} text="联系信息" />
      </span>
    )}
  </AddrEditContext.Consumer>
);

export default AddrEditT4;
