import React, { PureComponent } from 'react';
import update from 'immutability-helper';
import { Input } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { genFakeId } from '@/utils/mathUtils';
import SelectWithCols from '@/components/common/SelectWithCols';
import EditableDataTable from '@/components/common/EditableDataTable';
import { fromQs } from '@/utils/stringUtils';
import { resCol, roleCol } from '../config/index';

const DOMAIN = 'sysButemprole';

@connect(({ loading, sysButemprole, dispatch }) => ({
  loading,
  sysButemprole,
  dispatch,
}))
class BuTemplateDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();

    dispatch({ type: `${DOMAIN}/queryRoleList`, payload: { tmplId: param.id } });
    dispatch({ type: `${DOMAIN}/queryBuTmplRoleSelect` });
    dispatch({ type: `${DOMAIN}/queryBuTmplResSelect` });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      sysButemprole: { roleList },
    } = this.props;

    const newDataSource = update(roleList, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { roleList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      sysButempDetail: { formData },
      sysButemprole: { roleList, roleSelectList, resSelectList },
    } = this.props;
    const tableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/queryRoleList`],
      total: roleList.length,
      dataSource: roleList,
      showCopy: false,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            roleList: update(roleList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  tmplId: formData.id,
                  roleName: null,
                  resName: null,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = roleList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length // 符合条件的条数，然后取反，得true或false
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { roleList: newDataSource },
        });
      },
      columns: [
        {
          title: '角色',
          dataIndex: 'roleCode',
          required: true,
          width: '30%',
          render: (value, row, index) => (
            <SelectWithCols
              // 选择框里展示那个字段
              labelKey="name"
              columns={roleCol}
              value={value ? { name: row.roleName, code: value } : undefined}
              dataSource={
                roleSelectList.length
                  ? roleSelectList.filter(
                      item =>
                        !roleList
                          .map(r => (r.roleCode || r.roleCode === value ? r.roleCode : null))
                          .filter(keyValue => !!keyValue && item.code === keyValue).length
                    )
                  : []
              }
              onChange={v => {
                const newDataSource = update(roleList, {
                  [index]: {
                    roleCode: {
                      $set: v ? v.code : null,
                    },
                    roleName: {
                      $set: v ? v.name : null,
                    },
                  },
                });
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: { roleList: newDataSource },
                });
              }}
              selectProps={{
                allowClear: true,
                style: { width: '100%' },
              }}
            />
          ),
        },
        {
          title: '资源',
          dataIndex: 'resId',
          // required: true,
          width: '40%',
          render: (value, row, index) => (
            <SelectWithCols
              // 选择框里展示那个字段
              labelKey="name"
              valueKey="code"
              columns={resCol}
              dataSource={resSelectList}
              value={
                value ? { name: row.resName, code: value, valSphd1: row.englishName } : undefined
              }
              onChange={v => {
                const newDataSource = update(roleList, {
                  [index]: {
                    resId: {
                      $set: v ? v.id : null,
                    },
                    resName: {
                      $set: v ? v.name : null,
                    },
                  },
                });
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: { roleList: newDataSource },
                });
              }}
              selectProps={{
                allowClear: true,
                style: { width: '100%' },
              }}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={400}
              onBlur={this.onCellChanged(index, 'remark')}
            />
          ),
        },
      ],
      buttons: [],
    };

    return (
      <div>
        <div className="tw-card-title">
          {formatMessage({ id: `app.settings.menuMap.role`, desc: '角色信息' })}
        </div>
        <div style={{ margin: 12 }}>
          <EditableDataTable {...tableProps} />
        </div>
      </div>
    );
  }
}

export default BuTemplateDetail;
