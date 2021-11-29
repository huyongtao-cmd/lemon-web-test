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

const DOMAIN = 'opportunityBenefitDistribution';

@connect(({ loading, opportunityBenefitDistribution, dispatch, user }) => ({
  loading,
  opportunityBenefitDistribution,
  dispatch,
  user,
}))
class BenefitDistributionEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    // 页面可配置化
    dispatch({
      type: `${DOMAIN}/getPageConfig1`,
      payload: { pageNo: 'BUSINESS_EDIT_BENEFIT_AIIOT' },
    });

    dispatch({ type: `${DOMAIN}/benefitList`, payload: { id } });
  }

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      dispatch,
      opportunityBenefitDistribution: { benefitDistributionList },
    } = this.props;

    const newDataSource = benefitDistributionList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { benefitDistributionList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      opportunityBenefitDistribution: {
        benefitDistributionList,
        selectedBenefitDistributionList,
        pageConfig1: { pageBlockViews = [] },
        basicData: { deliResId, deliBuId, fuResId, suResId },
      },
      user: {
        user: {
          extInfo: { resId, resName },
        },
      },
    } = this.props;

    const { id } = fromQs();

    const submitting =
      loading.effects[`${DOMAIN}/benefitSave`] || loading.effects[`${DOMAIN}/benefitList`];

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '利益分配');
    const { pageFieldViews } = currentListConfig[0];
    const pageFieldViewsVisible = pageFieldViews
      .filter(v => v.visibleFlag)
      .sort((field1, field2) => field1.sortNo - field2.sortNo);

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: submitting,
      dataSource: benefitDistributionList,
      showCopy: false,
      rowSelection: {
        // selectedRowKeys: selectedBenefitDistributionList.map(v => v.id),
        onChange: (selectedRowKeys, selectedRows) => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: { selectedBenefitDistributionList: selectedRows },
          });
        },
      },
      showAdd: deliResId === resId || deliBuId === resId || fuResId === resId || suResId === resId,
      showDelete:
        deliResId === resId || deliBuId === resId || fuResId === resId || suResId === resId,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            benefitDistributionList: update(benefitDistributionList, {
              $push: [
                {
                  ...newRow,
                  oppoId: id,
                  id: genFakeId(-1),
                  activataStatus: '1',
                  sortNo: isEmpty(benefitDistributionList)
                    ? 1
                    : benefitDistributionList[benefitDistributionList.length - 1].sortNo + 1,
                  approvalStatus: 'NOTSUBMIT',
                  approvalStatusName: '未提交',
                  standardCode: 'C',
                  ruleDesc: null,
                  estResId: resId,
                  estResIdName: resName,
                  estDate: moment().format('YYYY-MM-DD'),
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
          const newDataSource = benefitDistributionList.filter(
            row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
          );
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              benefitDistributionList: newDataSource.map((v, i) => ({ ...v, sortNo: i + 1 })),
            },
          });
          return;
        }

        dispatch({
          type: `${DOMAIN}/benefitDel`,
          payload: {
            ids: selectedRowKeys.join(','),
          },
        }).then(res => {
          if (res.ok) {
            const newDataSource = benefitDistributionList.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            );
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                benefitDistributionList: newDataSource.map((v, i) => ({ ...v, sortNo: i + 1 })),
              },
            });

            dispatch({
              type: `${DOMAIN}/benefitSave`,
            });
            return;
          }
          createMessage({ type: 'error', description: res.reason || '删除失败' });
        });
      },
      columns: pageFieldViewsVisible.map((v, i) => ({
        title: v.displayName || '',
        dataIndex: v.fieldKey,
        align: v.fieldKey === 'ruleDesc' ? 'left' : 'center',
        width:
          i === 0
            ? 100
            : i === 1
              ? 100
              : i === 2
                ? 100
                : i === 3
                  ? 150
                  : i === 5
                    ? 100
                    : i === 6
                      ? 100
                      : 'auto',
        render: (val, row, index) =>
          // eslint-disable-next-line no-nested-ternary
          v.fieldKey === 'ruleDesc' &&
          row.activataStatus === '1' &&
          row.approvalStatus === 'NOTSUBMIT' ? (
            <Input.TextArea
              value={val}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'ruleDesc');
              }}
              autosize={{ minRows: 1, maxRows: 3 }}
              disabled={
                !(
                  deliResId === resId ||
                  deliBuId === resId ||
                  fuResId === resId ||
                  suResId === resId
                ) ||
                row.activataStatus === '0' ||
                row.approvalStatus === 'APPROVED'
              }
            />
          ) : v.fieldKey === 'approvalStatus' || (v.fieldKey === 'estResId' && val) ? (
            row[`${v.fieldKey}Name`]
          ) : v.fieldKey === 'estResId' && !val ? (
            '（商机的报备人）'
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
          disabled: selectedRows => {
            if (selectedRows.length !== 1) {
              return true;
            }
            if (selectedRows[0]?.deliBuId === resId && selectedRows[0]?.estResId === resId) {
              return false;
            }
            return (
              selectedRows.length !== 1 ||
              selectedRows[0].approvalStatus !== 'APPROVED' ||
              selectedRows[0].activataStatus !== '1'
            );
          },
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // // 当前登录人不是BU负责人不是交付负责人时不可激活
            // if (selectedRows[0].deliBuId !== resId && selectedRows[0].deliResId !== resId) {
            //   createMessage({
            //     type: 'warn',
            //     description: '您不是交付BU负责人也不是交付负责人，不能执行激活操作！',
            //   });
            //   return;
            // }

            // // 交付BU负责人的成本估算只能由交付BU负责人进行激活
            // if (selectedRows[0].estResId !== resId && selectedRows[0].deliBuId !== resId) {
            //   createMessage({
            //     type: 'warn',
            //     description: '交付BU负责人的成本估算只能由交付BU负责人进行激活！',
            //   });
            //   return;
            // }

            dispatch({
              type: `${DOMAIN}/benefitUpdateStatus`,
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
