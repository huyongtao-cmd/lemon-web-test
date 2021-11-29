import React, { PureComponent } from 'react';
import { Card, Divider, Form, Input, Modal, Select } from 'antd';
import update from 'immutability-helper';

import createMessage from '@/components/core/AlertMessage';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import { UdcSelect } from '@/pages/gen/field';
import { add, genFakeId, checkIfNumber } from '@/utils/mathUtils';
import { injectUdc, mountToTab } from '@/layouts/routerControl';

const { Field } = FieldList;

const fieldLabels = {
  levelNo: '级别编号',
  levelName: '级别名称',
  levelStatus: '状态',
  defFlag: '是否默认',
};

const DOMAIN = 'platCapaLevel';

const blankState = {
  selectedRowKeys: [],
};

@Form.create({
  onFieldsChange(props, changedFields) {
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@injectUdc(
  {
    lvlStatus: 'COM.STATUS1',
  },
  DOMAIN
)
class DetailModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...blankState,
    };
  }

  clearState = () => {
    this.setState(blankState);
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      formData,
      formData: { leveldEntities },
      dispatch,
      domain,
    } = this.props;
    // console.log('form-data: ', formData, leveldEntities, rowIndex, rowField);
    const newDataSource = update(leveldEntities, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });

    dispatch({
      type: `${domain}/updateState`,
      payload: {
        formData: {
          ...formData,
          leveldEntities: newDataSource,
        },
      },
    });
  };

  render() {
    const {
      dispatch,
      form: { getFieldDecorator },
      visible,
      formData,
      formData: { leveldEntities },
      onToggle,
      onSubmit,
      domain,
      canEdit,
      canEditDet,
      confirmLoading,
    } = this.props;

    const { selectedRowKeys, _udcMap = {} } = this.state;
    const { lvlStatus = [] } = _udcMap;

    // 字表的ds是主表的明细
    const total = leveldEntities ? leveldEntities.length : 0;

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      // limit: stringUtils.queryURL('limit'),
      // offset: stringUtils.queryURL('offset'),
      sortDirection: 'DESC',
      pagination: false,
      scroll: {
        x: '40%',
        // y: 900,
      },
      domain,
      showSearch: false,
      dispatch,
      showColumn: false,
      showExport: false,
      loading: false,
      expirys: 0,
      enableSelection: false,
      onChange: filters => {
        // this.fetchPageData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {},
      enableDoubleClick: false,
      total,
      dataSource: leveldEntities, // 外层代换
      columns: [
        {
          title: '级别高低(从低到高)',
          dataIndex: 'sortNo',
          align: 'center',
          render: (value, row, index) => (!checkIfNumber(value) ? index + 1 : value),
        },
        {
          title: '明细编号',
          align: 'center',
          dataIndex: 'leveldNo',
          width: '45%',
        },
        {
          title: '名称',
          align: 'center',
          dataIndex: 'leveldName',
          width: '45%',
        },
      ],
    };

    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total,
      dataSource: leveldEntities,
      showCopy: false,
      rowSelection: {
        selectedRowKeys,
        onChange: (_selectedRowKeys, _selectedRows) => {
          this.setState({
            selectedRowKeys: _selectedRowKeys,
          });
        },
      },
      onAdd: newRow => {
        // console.log('mathUtil ->', genFakeId, add)
        dispatch({
          type: `${domain}/updateState`,
          payload: {
            formData: {
              ...formData,
              leveldEntities: update(leveldEntities, {
                $push: [
                  {
                    ...newRow,
                    id: genFakeId(-1),
                    sortNo: total + 1,
                    leveldNo: '',
                    leveldName: '',
                  },
                ],
              }),
            },
          },
        });
      },

      onDeleteItems: (_selectedRowKeys, selectedRows) => {
        let { delList = [] } = formData;
        if (_selectedRowKeys.some(rowId => rowId > 0)) {
          delList = delList.concat(_selectedRowKeys);
        }
        const newDataSource = leveldEntities.filter(
          row => !_selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${domain}/updateState`,
          payload: {
            formData: {
              ...formData,
              leveldEntities: newDataSource.map((item, index) => ({
                ...item,
                sortNo: index + 1,
              })),
              delList,
            },
          },
        });

        // for(var k = 0;k<selectedRows;k++){
        //
        // }
        // selectedRows.filter((item)=>{ })
        // selectedRows.forEach((item)=>{
        //   console.log('----item', item)
        // })
        // leveldEntities.splice(selectedRowKeys - 1,1)
        // dispatch({
        //   type: `${domain}/updateState`,
        //   payload: {
        //     formData: {
        //       ...formData,
        //     }
        //   },
        // });
      },
      columns: [
        {
          title: '级别高低(从低到高)',
          dataIndex: 'order',
          className: 'text-center',
          render: (value, row, index) => index + 1,
        },
        {
          title: '明细编号',
          dataIndex: 'leveldNo',
          required: true,
          className: 'text-center',
          render: (value, row, index) =>
            row.id < 0 ? (
              <Input
                defaultValue={value}
                size="small"
                onChange={this.onCellChanged(index, 'leveldNo')}
              />
            ) : (
              value
            ),
        },
        {
          title: '名称',
          dataIndex: 'leveldName',
          required: true,
          className: 'text-center',
          render: (value, row, index) =>
            row.id < 0 ? (
              <Input
                defaultValue={value}
                size="small"
                onChange={this.onCellChanged(index, 'leveldName')}
              />
            ) : (
              value
            ),
        },
      ],
      buttons: [
        {
          key: 'upper',
          title: '上移',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (_selectedRowKeys, selectedRows) => {
            // console.log(_selectedRowKeys, selectedRows);
            let targetIndex = 0;

            leveldEntities.forEach((data, index) => {
              if (data.id === _selectedRowKeys[0]) {
                targetIndex = index;
              }
            });

            if (targetIndex > 0) {
              const obj = leveldEntities.splice(targetIndex, 1);
              leveldEntities.splice(targetIndex - 1, 0, obj[0]);

              // console.log('上移 leveldEntities ->', leveldEntities);

              dispatch({
                type: `${domain}/updateState`,
                payload: {
                  formData: {
                    ...formData,
                    leveldEntities,
                  },
                },
              });
            } else {
              // console.log('不好使');
            }
          },
        },
        {
          key: 'lower',
          title: '下移',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (_selectedRowKeys, selectedRows) => {
            // console.log(_selectedRowKeys, selectedRows);
            let targetIndex = 0;

            leveldEntities.forEach((data, index) => {
              if (data.id === _selectedRowKeys[0]) {
                targetIndex = index;
              }
            });
            // console.log(targetIndex, dataSource.length);
            if (targetIndex !== leveldEntities.length - 1) {
              const obj = leveldEntities.splice(targetIndex, 1);
              leveldEntities.splice(targetIndex + 1, 0, obj[0]);

              // console.log('下移 leveldEntities ->', leveldEntities);

              dispatch({
                type: `${domain}/updateState`,
                payload: {
                  formData: {
                    ...formData,
                    leveldEntities,
                  },
                },
              });
            } else {
              // console.log('不好使');
            }
          },
        },
      ],
    };

    const hasFooter = canEditDet || canEdit ? {} : { footer: null };
    const editTitle = canEditDet || canEdit ? '级别修改' : '级别详情';

    return (
      <Modal
        className="p-b-5"
        destroyOnClose
        title={formData.id ? editTitle : '级别新增'}
        visible={visible}
        onOk={(...param) => onSubmit(...param) || this.clearState()}
        onCancel={(...param) => onToggle(...param) || this.clearState()}
        width={800}
        confirmLoading={confirmLoading}
        {...hasFooter}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2} noReactive>
            {/* !!formData.id && (
             <Field
             name="levelNo"
             label={fieldLabels.levelNo}
             decorator={{
                  initialValue: formData.levelNo,
                }}
             >
             {!canEditDet && !canEdit ? (
                  <span>{formData.levelNo}</span>
                ) : (
                  <Input disabled="true" />
                )}
             </Field>
             ) */}
            <Field
              name="levelName"
              label={fieldLabels.levelName}
              decorator={{
                initialValue: formData.levelName,
                rules: [{ required: canEdit, message: '请输入' + fieldLabels.levelName }],
              }}
            >
              {!canEditDet && !canEdit ? (
                <span>{formData.levelName}</span>
              ) : (
                <Input
                  onChange={e => {
                    formData.levelName = e.target.value;
                  }}
                  disabled={!canEdit}
                />
              )}
            </Field>
            <Field
              name="levelStatus"
              label={fieldLabels.levelStatus}
              decorator={{
                initialValue: formData.levelStatus,
              }}
            >
              {!canEditDet && !canEdit ? (
                <span>{formData.levelStatus === 'ACTIVE' ? '有效' : '无效'}</span>
              ) : (
                <UdcSelect
                  code="COM.STATUS1"
                  placeholder="请选择"
                  disabled={!canEditDet && !canEdit}
                  onChange={value => {
                    // TODO: 此处实现不是很好 应该用dispatch 当前为快速修复问题先临时这样保持一致。
                    formData.levelStatus = value;
                  }}
                />
              )}
            </Field>
            <Field
              name="defFlag"
              label={fieldLabels.defFlag}
              decorator={{
                initialValue: formData.defFlag === 0 ? 0 : 1,
              }}
            >
              {!canEditDet && !canEdit ? (
                <span>{formData.defFlag ? '是' : '否'}</span>
              ) : (
                <Select
                  disabled={!canEditDet && !canEdit}
                  onChange={value => {
                    formData.defFlag = +value;
                  }}
                >
                  <Select.Option value={0}>否</Select.Option>
                  <Select.Option value={1}>是</Select.Option>
                </Select>
              )}
            </Field>
          </FieldList>
        </Card>
        <Divider className="m-t-0" />
        <div className="tw-card-title">级别明细</div>
        {canEditDet || canEdit ? (
          <div style={{ marginTop: 10 }}>
            <EditableDataTable {...editTableProps} />
          </div>
        ) : (
          <div style={{ margin: '0 -24px' }}>
            <DataTable {...tableProps} />
          </div>
        )}
      </Modal>
    );
  }
}

export default DetailModal;
