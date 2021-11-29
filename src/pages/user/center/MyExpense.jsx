import React from 'react';
import { connect } from 'dva';
import { Checkbox, DatePicker, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import router from 'umi/router';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { mountToTab } from '@/layouts/routerControl';
import { selectBus } from '@/services/org/bu/bu';
import { Selection, BuVersion } from '@/pages/gen/field';
import { TagOpt } from '@/utils/tempUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { request } from '@/utils/networkUtils';
import { toUrl } from '@/utils/stringUtils';
import api from '@/api';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'userMyExpenseList';
const CREATE = 'CREATE';
const { revoke } = api.bpm;

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 费用报销
 */
@connect(({ loading, userMyExpenseList }) => ({
  // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  loading,
  ...userMyExpenseList, // 代表与该组件相关redux的model
}))
@mountToTab()
class ExpenseList extends React.PureComponent {
  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    this.fetchData({ offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchData = params => {
    const { dispatch } = this.props;
    // 判断isMy，作为接口参数，请求是否本人的报销
    const newParams = {
      ...params,
      ...getBuVersionAndBuParams(params.expenseBuId, 'expenseBuId', 'expenseBuVersionId'),
      ...getBuVersionAndBuParams(params.sumBuId, 'sumBuId', 'sumBuVersionId'),
    };
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...newParams, isMy: 1 },
    });
  };

  handleRevoked = prcId => {
    request.post(toUrl(revoke, { id: prcId })).then(({ response }) => {
      if (response.ok) {
        createMessage({ type: 'success', description: '撤销成功' });
        const { searchForm, dispatch } = this.props;
        dispatch({ type: `${DOMAIN}/updateSearchForm`, payload: { selectedRowKeys: [] } });
        this.fetchData(searchForm);
      } else {
        createMessage({ type: 'error', description: `当前流程不可撤回` });
      }
    });
  };

  getTableProps = () => {
    const { dispatch, loading, searchForm, dataSource, total } = this.props;

    return {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      scroll: { x: 2100 },
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '报销单批次号',
          dataIndex: 'reimBatchNo',
          options: {
            initialValue: searchForm.reimBatchNo,
          },
          tag: <Input placeholder="报销单批次号" />,
        },
        {
          title: '报销单号',
          dataIndex: 'reimNo',
          options: {
            initialValue: searchForm.reimNo,
          },
          tag: <Input placeholder="报销单号" />,
        },
        {
          title: '报销类型',
          dataIndex: 'reimType1',
          options: {
            initialValue: searchForm.reimType1,
          },
          tag: <Selection.UDC code="ACC:REIM_TYPE1" placeholder="请选择报销类型" />,
        },
        {
          title: '费用类型',
          dataIndex: 'reimType2',
          options: {
            initialValue: searchForm.reimType2,
          },
          tag: <Selection.UDC code="ACC:REIM_TYPE2" placeholder="请选择费用类型" />,
        },
        {
          title: '事由类型',
          dataIndex: 'reasonType',
          options: {
            initialValue: searchForm.reasonType,
          },
          tag: <Selection.UDC code="TSK:REASON_TYPE" placeholder="请选择事由类型" />,
        },
        {
          title: '事由名称',
          dataIndex: 'reasonName',
          options: {
            initialValue: searchForm.reasonName,
          },
          tag: <Input placeholder="事由名称" />,
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuId', // TODO: 这个需要做成下拉选择，暂无接口
          options: {
            initialValue: searchForm.expenseBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '费用归属BU',
          dataIndex: 'sumBuId', // TODO: 这个需要做成下拉选择，暂无接口
          options: {
            initialValue: searchForm.sumBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '是否分摊',
          dataIndex: 'allocationFlag', // TODO: 这个需要做成下拉选择，暂无接口
          options: {
            initialValue: !!searchForm.allocationFlag,
            valuePropName: 'checked',
          },
          tag: <Checkbox>是</Checkbox>,
        },
        {
          title: '报销单状态',
          dataIndex: 'reimStatus',
          options: {
            initialValue: searchForm.reimStatus,
          },
          tag: <Selection.UDC code="ACC:REIM_STATUS" placeholder="报销单状态" />,
        },
        {
          title: '日期区间',
          dataIndex: 'applyDate',
          options: {
            initialValue: [searchForm.applyDateStart, searchForm.applyDateEnd],
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
      ],
      columns: [
        {
          title: '报销单批次号',
          dataIndex: 'reimBatchNo',
          sorter: true,
          align: 'center',
        },
        {
          title: '报销单号',
          dataIndex: 'reimNo',
          align: 'center',
          render: (value, row, key) => {
            let type;
            switch (row.reimType2) {
              // 差旅报销
              case 'TRIP': {
                type = 'trip';
                break;
              }
              // 行政订票报销
              case 'TICKET': {
                type = 'trip';
                break;
              }
              // 专项费用报销
              case 'SPEC': {
                type = 'spec';
                break;
              }
              // 特殊费用报销 -因公报销
              case 'BSPECIAL': {
                type = 'particular';
                break;
              }
              // 特殊费用报销 -个人报销
              case 'PSPECIAL': {
                type = 'particular';
                break;
              }
              // 非差旅报销
              default: {
                type = 'normal';
                break;
              }
            }
            return (
              <Link
                className="tw-link"
                to={`/plat/expense/${type}/view?id=${row.id}&sourceUrl=/user/center/myExpense`}
              >
                {value}
              </Link>
            );
          },
        },
        {
          title: '事由名称',
          dataIndex: 'reasonName',
          align: 'center',
        },
        {
          title: '单据状态',
          dataIndex: 'reimStatusDesc',
          align: 'center',
        },
        {
          title: '审批状态',
          dataIndex: 'apprStatusDesc',
          align: 'center',
        },
        {
          title: '报销费用',
          dataIndex: 'taxedReimAmt',
          align: 'right',
          render: value => (value ? value.toFixed(2) : null),
        },
        {
          title: '调整后费用',
          dataIndex: 'totalAdjustedAmt',
          align: 'right',
          render: value => (value ? value.toFixed(2) : null),
        },
        {
          title: '报销类型',
          dataIndex: 'reimType1Name',
          align: 'center',
        },
        {
          title: '费用类型',
          dataIndex: 'reimType2Name',
          align: 'center',
        },
        {
          title: '事由类型',
          dataIndex: 'reasonTypeName',
          align: 'center',
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuName',
          align: 'left',
        },
        {
          title: '费用归属BU',
          dataIndex: 'sumBuName',
          align: 'left',
        },
        {
          title: '是否分摊',
          dataIndex: 'allocationFlag',
          align: 'center',
          render: value => (
            <TagOpt
              value={value}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        {
          title: '是否有票',
          dataIndex: 'hasInv',
          align: 'center',
          render: value => (
            <TagOpt
              value={value}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        {
          title: '发票法人公司',
          dataIndex: 'expenseOuName',
          align: 'left',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          align: 'center',
          // render: applyDate => formatDT(applyDate),
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          align: 'center',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
        },
      ],
      leftButtons: [
        {
          key: 'rollback',
          title: '撤回',
          className: 'tw-btn-primary',
          icon: 'rollback',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows[0] && !selectedRows[0].revokable,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { procId } = selectedRows[0];
            this.handleRevoked(procId);
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          icon: 'form',
          hidden: false,
          disabled: false, // selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'CREATE',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows) => {
            // TODO： 根据报销类型：特殊费用，跳转特殊费用报销

            if (selectedRows[0].reimStatus !== CREATE) {
              createMessage({ type: 'warn', description: '仅新建的报销单能够修改' });
              return 0;
            }

            let type = '';
            switch (selectedRows[0].reimType2) {
              case 'TRIP': {
                // 差旅报销
                type = 'trip';
                break;
              }
              // 行政订票报销
              case 'TICKET': {
                type = 'trip';
                break;
              }
              case 'SPEC': {
                // 专项费用报销
                type = 'spec';
                break;
              }
              // 特殊费用报销 -因公报销
              case 'BSPECIAL': {
                type = 'particular';
                break;
              }
              // 特殊费用报销 -个人报销
              case 'PSPECIAL': {
                type = 'particular';
                break;
              }
              default: {
                // 非差旅报销
                type = 'normal';
                break;
              }
            }

            router.push(
              `/plat/expense/${type}/edit?id=${
                selectedRowKeys[0]
              }&isMy=1&sourceUrl=/user/center/myExpense`
            );
            return 1;
            // router.push(
            //   `/plat/expense/${type}/apply/edit?id=${selectedRowKeys}&feeApplyId=${
            //     selectedRows[0].feeApplyId
            //     }`,
            // );
          },
        },
        {
          key: 'copy',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.copy`, desc: '复制' }),
          loading: false,
          icon: 'plus-circle',
          hidden: false,
          disabled: false, // selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'CREATE',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows) => {
            let type = '';
            switch (selectedRows[0].reimType2) {
              case 'TRIP': {
                // 差旅报销
                type = 'trip';
                break;
              }
              // 行政订票报销
              case 'TICKET': {
                type = 'trip';
                break;
              }
              case 'SPEC': {
                // 专项费用报销
                type = 'spec';
                break;
              }
              // 特殊费用报销 -因公报销
              case 'BSPECIAL': {
                type = 'particular';
                break;
              }
              // 特殊费用报销 -个人报销
              case 'PSPECIAL': {
                type = 'particular';
                break;
              }
              default: {
                // 非差旅报销
                type = 'normal';
                break;
              }
            }
            router.push(
              `/plat/expense/${type}/create?id=${
                selectedRowKeys[0]
              }&isMy=1&isCopy=1&sourceUrl=/user/center/myExpense`
            );
            return 1;
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const canDeleteMap = ['CREATE', 'REJECTED'];
            const unLegalRows = selectedRows.filter(
              ({ reimStatus }) => !canDeleteMap.includes(reimStatus)
            );
            if (isEmpty(unLegalRows)) {
              // 万一 rowKey 变了， selectedRowKeys 就不是 id 了
              const ids = selectedRows.map(({ id }) => id);
              dispatch({
                type: `${DOMAIN}/delete`,
                payload: ids,
              }).then(({ status, result }) => {
                if (status === 100) {
                  // 主动取消请求
                  return;
                }
                createMessage({
                  type: result ? 'success' : 'warn',
                  description: result ? '删除成功' : '删除失败',
                });
                result &&
                  this.fetchData({
                    ...searchForm,
                    allocationFlag: searchForm.allocationFlag ? 1 : 0,
                    applyDate: undefined,
                    applyDateStart:
                      searchForm.applyDate && searchForm.applyDate[0]
                        ? searchForm.applyDate[0].format('YYYY-MM-DD')
                        : undefined,
                    applyDateEnd:
                      searchForm.applyDate && searchForm.applyDate[1]
                        ? searchForm.applyDate[1].format('YYYY-MM-DD')
                        : undefined,
                  });
              });
            } else {
              createMessage({ type: 'warn', description: '仅新建和报销未通过的报销单能够删除' });
            }
          },
        },
      ],
    };
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    return (
      <PageHeaderWrapper title="费用报销">
        <DataTable {...this.getTableProps()} />
      </PageHeaderWrapper>
    );
  }
}

export default ExpenseList;
