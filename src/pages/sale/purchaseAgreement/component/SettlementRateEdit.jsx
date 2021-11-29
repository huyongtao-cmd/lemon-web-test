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

const limitDecimals = value => {
  // eslint-disable-next-line no-useless-escape
  const reg = /^(\-)*(\d+)\.(\d\d).*$/;
  let res = '';
  if (typeof value === 'string') {
    // eslint-disable-next-line no-restricted-globals
    res = !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : '';
  } else if (typeof value === 'number') {
    // eslint-disable-next-line no-restricted-globals
    res = !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : '';
  }
  return res;
};

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
      salePurchaseAgreementsEdit: { resSetRateEntities, resSetRateDeletedKeys, pageConfig },
      loading,
      dispatch,
    } = this.props;

    const onCellChanged = (rowIndex, rowField) => rowFieldValue => {
      const val =
        rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          resSetRateEntities: update(resSetRateEntities, {
            [rowIndex]: {
              [rowField]: {
                $set: val,
              },
            },
          }),
        },
      });
    };

    const currentBlockConfig = pageConfig.pageBlockViews.find(
      item => item.blockKey === 'PUR_AGREEMENT_RES_RATE'
    );
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const columnsList = [
      {
        title: '序号',
        dataIndex: 'id',
        className: 'text-center',
        width: 50,
        render: (value, record, index) => index + 1,
      },
      {
        title: `${pageFieldJson.startAtm.displayName}`,
        sortNo: `${pageFieldJson.startAtm.sortNo}`,
        dataIndex: 'startAtm',
        key: 'startAtm',
        className: 'text-center',
        width: 200,
        required: !!pageFieldJson.startAtm.requiredFlag,
        options: {
          rules: [
            {
              required: !!pageFieldJson.startAtm.requiredFlag,
              message: `请输入${pageFieldJson.startAtm.displayName}`,
            },
            {
              validator: (rule, value, callback) => {
                if (isNil(value)) {
                  callback();
                } else {
                  const error = [];
                  if (!checkIfNumber(value)) error.push('输入类型不正确');
                  callback(error);
                }
              },
            },
          ],
        },
        render: (value, row, index) => (
          <InputNumber
            className="x-fill-100"
            value={value}
            min={0}
            onChange={onCellChanged(index, 'startAtm')}
            placeholder={`请输入${pageFieldJson.startAtm.displayName}`}
            formatter={limitDecimals}
            parser={limitDecimals}
            disabled={pageFieldJson.startAtm.fieldMode !== 'EDITABLE'}
          />
        ),
      },
      {
        title: `${pageFieldJson.endAtm.displayName}`,
        sortNo: `${pageFieldJson.endAtm.sortNo}`,
        dataIndex: 'endAtm',
        key: 'endAtm',
        className: 'text-center',
        width: 200,
        required: !!pageFieldJson.endAtm.requiredFlag,
        options: {
          rules: [
            {
              required: !!pageFieldJson.endAtm.requiredFlag,
              message: `请输入${pageFieldJson.endAtm.displayName}`,
            },
            {
              validator: (rule, value, callback) => {
                if (isNil(value)) {
                  callback();
                } else {
                  const error = [];
                  if (!checkIfNumber(value)) error.push('输入类型不正确');
                  callback(error);
                }
              },
            },
          ],
        },
        render: (value, row, index) => (
          <InputNumber
            className="x-fill-100"
            value={value}
            min={0}
            onChange={onCellChanged(index, 'endAtm')}
            placeholder={`请输入${pageFieldJson.endAtm.displayName}`}
            formatter={limitDecimals}
            parser={limitDecimals}
            disabled={pageFieldJson.endAtm.fieldMode !== 'EDITABLE'}
          />
        ),
      },
      {
        title: `${pageFieldJson.serviceRate.displayName}`,
        sortNo: `${pageFieldJson.serviceRate.sortNo}`,
        dataIndex: 'serviceRate',
        key: 'serviceRate',
        className: 'text-center',
        width: 200,
        required: !!pageFieldJson.serviceRate.requiredFlag,
        options: {
          rules: [
            {
              required: !!pageFieldJson.serviceRate.requiredFlag,
              message: `请输入${pageFieldJson.serviceRate.displayName}`,
            },
          ],
        },
        render: (value, row, index) => (
          <InputNumber
            className="x-fill-100"
            value={value}
            min={0}
            // max={100}
            placeholder={`请输入${pageFieldJson.serviceRate.displayName}`}
            formatter={val => `${limitDecimals(val)}%`}
            parser={val => limitDecimals(val.replace('%', ''))}
            onChange={onCellChanged(index, 'serviceRate')}
            disabled={pageFieldJson.serviceRate.fieldMode !== 'EDITABLE'}
          />
        ),
      },
      {
        title: `${pageFieldJson.remark.displayName}`,
        sortNo: `${pageFieldJson.remark.sortNo}`,
        key: 'remark',
        dataIndex: 'remark',
        required: !!pageFieldJson.remark.requiredFlag,
        width: 300,
        options: {
          rules: [
            {
              required: !!pageFieldJson.remark.requiredFlag,
              message: `请输入${pageFieldJson.remark.displayName}`,
            },
          ],
        },
        render: (value, row, index) => (
          <Input
            className="x-fill-100"
            value={value}
            placeholder={`请输入${pageFieldJson.remark.displayName}`}
            onChange={onCellChanged(index, 'remark')}
            disabled={pageFieldJson.remark.fieldMode !== 'EDITABLE'}
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
      dataSource: resSetRateEntities,
      // rowSelection: {
      //   getCheckboxProps: record => ({
      //     disabled: record.lineNo === -1,
      //   }),
      // },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            resSetRateEntities: [
              ...resSetRateEntities,
              {
                ...newRow,
                id: genFakeId(-1),
                serviceRate: null,
                startAtm: null,
                endAtm: null,
                remark: null,
              },
            ],
          },
        });
      },
      onDeleteItems: (_, selectedRows) => {
        const deleteIds = selectedRows.map(row => row.id);
        const newList = resSetRateEntities.filter(({ id }) => !deleteIds.includes(id));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            resSetRateDeletedKeys: [...resSetRateDeletedKeys, ...deleteIds].filter(v => !(v <= 0)),
            resSetRateEntities: newList,
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
        <div className="tw-card-title">人力资源结算费率</div>
        <EditableDataTable {...this.tableProps()} />
      </Card>
    );
  }
}

export default Edit;
