/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import update from 'immutability-helper';
import { Input, Button, Modal, Form, Divider, Checkbox } from 'antd';
import { connect } from 'dva';
import EditableDataTable from '@/components/common/EditableDataTable';
import DataTable from '@/components/common/DataTable';
import { FileManagerEnhance } from '@/pages/gen/field';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, includes } from 'ramda';
import moment from 'moment';
import { fromQs } from '@/utils/stringUtils';

const { Field } = FieldList;

const DOMAIN = 'opportunityCostEstimation';

@connect(({ loading, opportunityCostEstimation, dispatch }) => ({
  loading,
  opportunityCostEstimation,
  dispatch,
}))
class CostEstimationFlowEdit extends PureComponent {
  render() {
    const {
      loading,
      dispatch,
      opportunityCostEstimation: {
        flowFormData,
        list1,
        pageConfig: { pageBlockViews = [] },
      },
    } = this.props;

    const submitting = loading.effects[`${DOMAIN}/saveFlowDetail`];

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '成本估算');
    const { pageFieldViews } = currentListConfig[0];
    const pageFieldViewsVisible = pageFieldViews
      .filter(v => v.visibleFlag)
      .sort((field1, field2) => field1.sortNo - field2.sortNo);

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: submitting,
      dataSource: list1,
      showCopy: false,
      rowSelection: {
        selectedRowKeys: [flowFormData.oppoCosteEstimateId || undefined],
        onChange: (selectedRowKeys, selectedRows) => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              flowFormData: {
                ...flowFormData,
                oppoCosteEstimateId: selectedRowKeys.split(','),
              },
            },
          });
        },
      },
      showAdd: false,
      showDelete: false,
      columns: pageFieldViewsVisible.map(v => ({
        title: v.displayName || '',
        dataIndex: v.fieldKey,
        align: 'center',
        render: (val, row, index) =>
          // eslint-disable-next-line no-nested-ternary
          v.fieldKey === 'oppoCosteest' ||
          v.fieldKey === 'oppoCostesow' ||
          v.fieldKey === 'oppoThirdOffer' ? (
            <FileManagerEnhance
              api={
                // eslint-disable-next-line no-nested-ternary
                v.fieldKey === 'oppoCosteest'
                  ? '/api/op/v1/oppoCoste/est/sfs/token'
                  : v.fieldKey === 'oppoCostesow'
                    ? '/api/op/v1/oppoCoste/sow/sfs/token'
                    : '/api/op/v1/oppoCoste/thirdOffer/sfs/token'
              }
              listType="text"
              disabled={false}
              multiple={false}
              dataKey={row.id}
              preview
            />
          ) : v.fieldKey === 'approvalStatus' || v.fieldKey === 'costResId' ? (
            row[`${v.fieldKey}Name`]
          ) : v.fieldKey === 'activataStatus' && val === '1' ? (
            '未激活'
          ) : v.fieldKey === 'activataStatus' && val === '0' ? (
            '激活'
          ) : (
            row[v.fieldKey]
          ),
      })),
      leftButtons: [],
      buttons: [],
    };

    return <EditableDataTable {...tableProps} />;
  }
}

export default CostEstimationFlowEdit;
