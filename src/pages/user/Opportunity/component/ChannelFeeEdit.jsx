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

const DOMAIN = 'opportunityChannelFee';

@connect(({ loading, opportunityChannelFee, dispatch, user }) => ({
  loading,
  opportunityChannelFee,
  dispatch,
  user,
}))
class BenefitDistributionEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    // 页面可配置化
    dispatch({
      type: `${DOMAIN}/getPageConfig2`,
      payload: { pageNo: 'BUSINESS_EDIT_CHANNEL_COSTT' },
    });

    dispatch({ type: `${DOMAIN}/channelList`, payload: { id } });
  }

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      dispatch,
      opportunityChannelFee: { channelFeeList },
    } = this.props;

    const newDataSource = channelFeeList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { channelFeeList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      opportunityChannelFee: {
        channelFeeList,
        selectedChannelFeeList,
        pageConfig2: { pageBlockViews = [] },
        basicData: { signBuId, signResId, fuResId, suResId },
      },
      user: {
        user: {
          extInfo: { resId, resName },
        },
      },
    } = this.props;

    const { id } = fromQs();

    const submitting = loading.effects[`${DOMAIN}/costeSave`];

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
      loading: false,
      dataSource: channelFeeList,
      showCopy: false,
      rowSelection: {
        // selectedRowKeys: selectedChannelFeeList.map(v => v.id),
        onChange: (selectedRowKeys, selectedRows) => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: { selectedChannelFeeList: selectedRows },
          });
        },
      },
      showAdd: signBuId === resId || fuResId === resId || suResId === resId,
      showDelete: signBuId === resId || fuResId === resId || suResId === resId,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            channelFeeList: update(channelFeeList, {
              $push: [
                {
                  ...newRow,
                  oppoId: id,
                  id: genFakeId(-1),
                  activataStatus: '1',
                  sortNo: isEmpty(channelFeeList)
                    ? 1
                    : channelFeeList[channelFeeList.length - 1].sortNo + 1,
                  approvalStatus: 'NOTSUBMIT',
                  approvalStatusName: '未提交',
                  costDesc: null,
                  applyResId: resId,
                  applyResIdName: resName,
                  applyDate: moment().format('YYYY-MM-DD'),
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const noNew = selectedRows.filter(v => v.approvalStatus !== 'NOTSUBMIT');
        if (!isEmpty(noNew)) {
          createMessage({ type: 'warn', description: '只有审批状态为未提交的数据可以删除！' });
          return;
        }

        // 只删除新增的，前端自删除
        const tt = selectedRowKeys.filter(v => v > 0);
        if (isEmpty(tt)) {
          const newDataSource = channelFeeList.filter(
            row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
          );
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              channelFeeList: newDataSource.map((v, i) => ({ ...v, sortNo: i + 1 })),
            },
          });
          return;
        }

        dispatch({
          type: `${DOMAIN}/channelDel`,
          payload: {
            ids: selectedRowKeys.join(','),
          },
        }).then(res => {
          if (res.ok) {
            const newDataSource = channelFeeList.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            );
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                channelFeeList: newDataSource.map((v, i) => ({ ...v, sortNo: i + 1 })),
              },
            });

            dispatch({
              type: `${DOMAIN}/channelSave`,
            });
            return;
          }
          createMessage({ type: 'error', description: res.reason || '操作失败' });
        });
      },
      columns: pageFieldViewsVisible.map((v, i) => ({
        title: v.displayName || '',
        dataIndex: v.fieldKey,
        align: v.fieldKey === 'costDesc' ? 'left' : 'center',
        width:
          i === 0 ? 100 : i === 1 ? 100 : i === 2 ? 100 : i === 4 ? 100 : i === 5 ? 100 : 'auto',
        render: (val, row, index) =>
          // eslint-disable-next-line no-nested-ternary
          v.fieldKey === 'costDesc' &&
          row.activataStatus === '1' &&
          row.approvalStatus === 'NOTSUBMIT' ? (
            <Input.TextArea
              value={val}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'costDesc');
              }}
              autosize={{ minRows: 1, maxRows: 3 }}
              disabled={
                !(signBuId === resId || fuResId === resId || suResId === resId) ||
                row.activataStatus === '0' ||
                row.approvalStatus === 'APPROVED'
              }
            />
          ) : v.fieldKey === 'approvalStatus' || v.fieldKey === 'applyResId' ? (
            row[`${v.fieldKey}Name`]
          ) : v.fieldKey === 'activataStatus' && val === '1' ? (
            '未激活'
          ) : v.fieldKey === 'activataStatus' && val === '0' ? (
            '激活'
          ) : (
            row[v.fieldKey]
          ),
      })),
      leftButtons: [
        {
          key: 'active',
          className: 'tw-btn-primary',
          title: '激活',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length !== 1 ||
            selectedRows[0].approvalStatus !== 'APPROVED' ||
            selectedRows[0].activataStatus !== '1',
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // // 当前登录人不是签单BU负责人时不可激活
            // if (selectedRows[0].signBuId !== resId) {
            //   createMessage({
            //     type: 'warn',
            //     description: '您不是签单BU负责人，不能执行激活操作！',
            //   });
            //   return;
            // }
            dispatch({
              type: `${DOMAIN}/channelUpdateState`,
              payload: {
                id: selectedRowKeys[0],
                oppoId: id,
                state: '0',
              },
            });
          },
        },
      ],
      buttons: [],
    };

    return <EditableDataTable {...tableProps} />;
  }
}

export default BenefitDistributionEdit;
