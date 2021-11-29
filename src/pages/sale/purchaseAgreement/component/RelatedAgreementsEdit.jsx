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
import createMessage from '@/components/core/AlertMessage';

import { selectBu, selectSupplier } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsers } from '@/services/sys/user';
import {
  selectAbOus,
  selectUsersWithBu,
  selectTaskByProjIds,
  selectOus,
  selectCusts,
  selectProject,
} from '@/services/gen/list';
import style from '../style.less';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'salePurchaseAgreementsEdit';
const FieldListLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const applyColumns = [
  { dataIndex: 'purchaseAgreementNo', title: '编号', span: 10 },
  { dataIndex: 'purchaseAgreementName', title: '名称', span: 14 },
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
        agreementEntities,
        formData,
        agreementDeleteKeys,
        pageConfig,
        associationArr,
      },
      loading,
      dispatch,
    } = this.props;

    const currentBlockConfig = pageConfig.pageBlockViews.find(
      item => item.blockKey === 'PUR_ASSOCIATION_AGREEMENT'
    );
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });

    const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
      const val =
        rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
      if (rowField === 'associationId') {
        if (
          agreementEntities.find(
            (item, index) => item.associationId + '' === val + '' && index !== rowIndex
          ) !== undefined
        ) {
          createMessage({ type: 'warn', description: '此关联协议已存在' });
        } else {
          const association = associationArr.find(item => item.associationId + '' === val + '');
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              agreementEntities: update(agreementEntities, {
                [rowIndex]: {
                  associationId: {
                    $set: val,
                  },
                  supplierLegalNo: {
                    $set: association ? association.supplierLegalNo : null,
                  },
                  supplierLegalNoDesc: {
                    $set: association ? association.supplierLegalNoDesc : null,
                  },
                  purchaseAgreementNo: {
                    $set: association ? association.purchaseAgreementNo : null,
                  },
                  purchaseAgreementName: {
                    $set: association ? association.purchaseAgreementName : null,
                  },
                  agreementContent: {
                    $set: association ? association.agreementContent : null,
                  },
                },
              }),
            },
          });
        }
      } else {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            agreementEntities: update(agreementEntities, {
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
        title: `${pageFieldJson.associationId.displayName}`,
        sortNo: `${pageFieldJson.associationId.sortNo}`,
        key: 'associationId',
        dataIndex: 'associationId',
        className: 'text-center',
        required: !!pageFieldJson.associationId.requiredFlag,
        width: 200,
        options: {
          rules: [
            {
              required: !!pageFieldJson.associationId.requiredFlag,
              message: `请选择${pageFieldJson.associationId.displayName}`,
            },
          ],
        },
        render: (value, record, index) => (
          <Selection.Columns
            className="x-fill-100"
            columns={applyColumns}
            transfer={{
              key: 'associationId',
              code: 'associationId',
              name: 'purchaseAgreementName',
            }}
            source={associationArr.filter(
              item => item.associationId !== formData.id && item.visibleFlag
            )}
            value={value}
            placeholder={`请选择${pageFieldJson.associationId.displayName}`}
            showSearch
            onChange={onCellChanged(index, 'associationId')}
            dropdownMatchSelectWidth={false}
            dropdownStyle={{ width: 400 }}
            disabled={pageFieldJson.associationId.fieldMode !== 'EDITABLE'}
          />
        ),
      },
      {
        title: `${pageFieldJson.supplierLegalNo.displayName}`,
        sortNo: `${pageFieldJson.supplierLegalNo.sortNo}`,
        key: 'supplierLegalNo',
        dataIndex: 'supplierLegalNoDesc',
        className: 'text-center',
        required: !!pageFieldJson.supplierLegalNo.requiredFlag,
        width: 200,
        options: {
          rules: [
            {
              required: !!pageFieldJson.supplierLegalNo.requiredFlag,
              message: `请输入${pageFieldJson.supplierLegalNo.displayName}`,
            },
          ],
        },
        render: (value, record, index) => (
          <Input value={value} disabled={pageFieldJson.supplierLegalNo.fieldMode !== 'EDITABLE'} />
        ),
      },
      {
        title: `${pageFieldJson.purchaseAgreementNo.displayName}`,
        sortNo: `${pageFieldJson.purchaseAgreementNo.sortNo}`,
        key: 'purchaseAgreementNo',
        dataIndex: 'purchaseAgreementNo',
        required: !!pageFieldJson.purchaseAgreementNo.requiredFlag,
        width: 200,
        options: {
          rules: [
            {
              required: !!pageFieldJson.purchaseAgreementNo.requiredFlag,
              message: `请输入${pageFieldJson.purchaseAgreementNo.displayName}`,
            },
          ],
        },
        render: (value, row, index) => (
          <Input
            value={value}
            disabled={pageFieldJson.purchaseAgreementNo.fieldMode !== 'EDITABLE'}
          />
        ),
      },
      {
        title: `${pageFieldJson.purchaseAgreementName.displayName}`,
        sortNo: `${pageFieldJson.purchaseAgreementName.sortNo}`,
        key: 'purchaseAgreementName',
        dataIndex: 'purchaseAgreementName',
        width: 200,
        required: !!pageFieldJson.purchaseAgreementName.requiredFlag,
        options: {
          rules: [
            {
              required: !!pageFieldJson.purchaseAgreementName.requiredFlag,
              message: `请输入${pageFieldJson.purchaseAgreementName.displayName}`,
            },
          ],
        },
        render: (value, row, index) => (
          <Input
            value={value}
            disabled={pageFieldJson.purchaseAgreementName.fieldMode !== 'EDITABLE'}
          />
        ),
      },
      {
        title: `${pageFieldJson.agreementContent.displayName}`,
        sortNo: `${pageFieldJson.agreementContent.sortNo}`,
        key: 'agreementContent',
        dataIndex: 'agreementContent',
        required: !!pageFieldJson.agreementContent.requiredFlag,
        width: 300,
        options: {
          rules: [
            {
              required: !!pageFieldJson.agreementContent.requiredFlag,
              message: `请输入${pageFieldJson.agreementContent.displayName}`,
            },
          ],
        },
        render: (value, row, index) => (
          <Input value={value} disabled={pageFieldJson.agreementContent.fieldMode !== 'EDITABLE'} />
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
      dataSource: agreementEntities,
      // rowSelection: {
      //   getCheckboxProps: record => ({
      //     disabled: record.lineNo === -1,
      //   }),
      // },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            agreementEntities: [
              ...agreementEntities,
              {
                ...newRow,
                id: genFakeId(-1),
                documentId: null,
                documentNo: null,
                associationId: null,
                supplierLegalNo: null,
                supplierLegalNoDesc: null,
                purchaseAgreementNo: null,
                purchaseAgreementName: null,
                agreementContent: null,
              },
            ],
          },
        });
      },
      onDeleteItems: (_, selectedRows) => {
        const deleteIds = selectedRows.map(row => row.id);
        const newList = agreementEntities.filter(({ id }) => !deleteIds.includes(id));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            agreementDeleteKeys: [...agreementDeleteKeys, ...deleteIds].filter(v => !(v <= 0)),
            agreementEntities: newList,
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
        <div className="tw-card-title">关联协议</div>
        <EditableDataTable {...this.tableProps()} />
      </Card>
    );
  }
}

export default Edit;
