import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, DatePicker, InputNumber, Button, Divider, Radio } from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { isEmpty, takeLast, add, isNil, gte, lte } from 'ramda';
import update from 'immutability-helper';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import EditableDataTable from '@/components/common/EditableDataTable';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { fromQs, getGuid } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { toIsoDate } from '@/utils/timeUtils';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';
import router from 'umi/router';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'salePurchaseAgreementsEdit';
const FieldListLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
@connect(({ salePurchaseAgreementsEdit, loading }) => ({
  loading,
  salePurchaseAgreementsEdit,
}))
@mountToTab()
class Edit extends PureComponent {
  componentDidMount() {}

  tableProps = () => {
    const {
      salePurchaseAgreementsEdit: {
        agreementResEntities,
        agreementResDeletedKeys,
        resArr,
        pageConfig,
      },
      loading,
      dispatch,
    } = this.props;

    const currentBlockConfig = pageConfig.pageBlockViews.find(
      item => item.blockKey === 'PUR_AGREEMENT_RES'
    );
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });

    const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
      const val =
        rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
      if (rowField === 'resDate') {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            agreementResEntities: update(agreementResEntities, {
              [rowIndex]: {
                resStartDate: {
                  $set: val && val[0] ? formatDT(val[0]) : null,
                },
                resEndDate: {
                  $set: val && val[1] ? formatDT(val[1]) : null,
                },
              },
            }),
          },
        });
      } else {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            agreementResEntities: update(agreementResEntities, {
              [rowIndex]: {
                [rowField]: {
                  $set: val,
                },
              },
            }),
          },
        });
      }
    };
    const columnsList = [
      {
        title: '序号',
        dataIndex: 'id',
        className: 'text-center',
        width: 50,
        render: (value, record, index) => index + 1,
      },
      {
        title: `${pageFieldJson.resId.displayName}`,
        sortNo: `${pageFieldJson.resId.sortNo}`,
        key: 'resId',
        dataIndex: 'resId',
        required: !!pageFieldJson.resId.requiredFlag,
        width: 200,
        options: {
          rules: [
            {
              required: !!pageFieldJson.resId.requiredFlag,
              message: `请选择${pageFieldJson.resId.displayName}`,
            },
          ],
        },
        render: (value, row, index) => (
          <Selection.Columns
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            columns={applyColumns}
            source={resArr}
            className="x-fill-100"
            value={value}
            placeholder={`请选择${pageFieldJson.resId.displayName}`}
            showSearch
            onChange={onCellChanged(index, 'resId')}
            disabled={pageFieldJson.resId.fieldMode !== 'EDITABLE'}
          />
        ),
      },
      {
        title: `${pageFieldJson.resStartDate.displayName}`,
        sortNo: `${pageFieldJson.resStartDate.sortNo}`,
        dataIndex: 'resStartDate',
        key: 'resStartDate',
        required: !!pageFieldJson.resStartDate.requiredFlag,
        width: 150,
        options: {
          rules: [
            {
              required: !!pageFieldJson.resStartDate.requiredFlag,
              message: `请选择${pageFieldJson.resStartDate.displayName}`,
            },
          ],
        },
        render: (value, row, index) => (
          <DatePicker.RangePicker
            className="x-fill-100"
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
            value={
              row.resStartDate && row.resEndDate
                ? [moment(row.resStartDate), moment(row.resEndDate)]
                : null
            }
            onChange={onCellChanged(index, 'resDate')}
            disabled={pageFieldJson.resStartDate.fieldMode !== 'EDITABLE'}
          />
        ),
      },
    ];
    const columnsFilterList = columnsList.filter(
      field => !field.key || pageFieldJson[field.key].visibleFlag === 1
    );

    const tableProps = {
      rowKey: 'id',
      showCopy: false,
      // loading: loading.effects[`${DOMAIN}/queryPurchase`],
      pagination: false,
      // scroll: {
      //   x: 1700,
      // },
      dataSource: agreementResEntities,
      // rowSelection: {
      //   getCheckboxProps: record => ({
      //     disabled: record.lineNo === -1,
      //   }),
      // },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            agreementResEntities: [
              ...agreementResEntities,
              {
                ...newRow,
                id: genFakeId(-1),
                resId: null,
                resStartDate: null,
                resEndDate: null,
              },
            ],
          },
        });
      },
      onDeleteItems: (_, selectedRows) => {
        const deleteIds = selectedRows.map(row => row.id);
        const newList = agreementResEntities.filter(({ id }) => !deleteIds.includes(id));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            agreementResDeletedKeys: [...agreementResDeletedKeys, ...deleteIds].filter(
              v => !(v <= 0)
            ),
            agreementResEntities: newList,
          },
        });
      },
      columns: columnsFilterList,
    };
    return tableProps;
  };

  render() {
    return (
      <Card
        className="tw-card-adjust"
        bordered={false}
        // title="采购合同"
      >
        <div className="tw-card-title">关联资源</div>
        <EditableDataTable {...this.tableProps()} />
      </Card>
    );
  }
}

export default Edit;
