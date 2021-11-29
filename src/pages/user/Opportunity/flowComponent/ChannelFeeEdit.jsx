/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import update from 'immutability-helper';
import { Input, Button, Modal, Form, Divider, Checkbox } from 'antd';
import { connect } from 'dva';
import EditableDataTable from '@/components/common/EditableDataTable';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, includes } from 'ramda';
import moment from 'moment';
import { genFakeId } from '@/utils/mathUtils';

import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'opportunityCostEstimation';

@connect(({ loading, opportunityCostEstimation, dispatch }) => ({
  loading,
  opportunityCostEstimation,
  dispatch,
}))
class BenefitDistributionFlowEdit extends PureComponent {
  render() {
    const {
      loading,
      dispatch,
      opportunityCostEstimation: {
        flowFormData,
        list3,
        pageConfig2: { pageBlockViews = [] },
      },
    } = this.props;

    const submitting = loading.effects[`${DOMAIN}/saveFlowDetail`];

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '渠道费用');
    const { pageFieldViews } = currentListConfig[0];
    const pageFieldViewsVisible = pageFieldViews
      .filter(v => v.visibleFlag)
      .sort((field1, field2) => field1.sortNo - field2.sortNo);

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: submitting,
      dataSource: list3,
      showCopy: false,
      rowSelection: {
        selectedRowKeys: [flowFormData.oppoChannelCosttId || undefined],
        onChange: (selectedRowKeys, selectedRows) => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              flowFormData: {
                ...flowFormData,
                oppoChannelCosttId: selectedRowKeys.split(','),
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
        align: v.fieldKey === 'costDesc' ? 'left' : 'center',
        render: (val, row, index) =>
          v.fieldKey === 'approvalStatus' || v.fieldKey === 'applyResId'
            ? row[`${v.fieldKey}Name`]
            : v.fieldKey === 'activataStatus' && val === '1'
              ? '未激活'
              : v.fieldKey === 'activataStatus' && val === '0'
                ? '激活'
                : row[v.fieldKey],
      })),
      leftButtons: [],
      buttons: [],
    };

    return <EditableDataTable {...tableProps} />;
  }
}

export default BenefitDistributionFlowEdit;
