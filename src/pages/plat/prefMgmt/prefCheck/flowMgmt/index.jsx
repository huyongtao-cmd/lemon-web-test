import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Input, Form, Radio, Switch, Tooltip } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { Selection } from '@/pages/gen/field';
import { stringify } from 'qs';
import { createConfirm } from '@/components/core/Confirm';

const RadioGroup = Radio.Group;

const DOMAIN = 'prefCheckFlow';

@connect(({ loading, prefCheckFlow, dispatch, user }) => ({
  prefCheckFlow,
  dispatch,
  user,
  loading:
    loading.effects[`${DOMAIN}/query`] ||
    loading.effects[`${DOMAIN}/createReview`] ||
    loading.effects[`${DOMAIN}/checkIsPerformanceExam`],
}))
@Form.create({})
@mountToTab()
class PrefCheck extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      prefCheckFlow: { searchForm },
    } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanTableFrom` });
    _refresh === '0' ? dispatch({ type: `${DOMAIN}/query`, payload: searchForm }) : '';
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      prefCheckFlow: { list, total, searchForm },
      dispatch,
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading,
      total,
      dataSource: list,
      rowSelection: {
        type: 'radio',
      },
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '????????????',
          dataIndex: 'examName',
          options: {
            initialValue: searchForm.examName || '',
          },
          tag: <Input placeholder="?????????????????????" />,
        },
        {
          title: '????????????',
          dataIndex: 'examCycle',
          options: {
            initialValue: searchForm.examCycle || undefined,
          },
          tag: (
            <Selection.UDC
              className="x-fill-100"
              code="RES:PERFORMANCE_EXAM_CYCLE"
              showSearch
              placeholder="?????????????????????"
            />
          ),
        },
        {
          title: '??????',
          dataIndex: 'examStatus',
          options: {
            initialValue: searchForm.examStatus || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="CREATE">??????</Radio>
              <Radio value="IN PROCESS">?????????</Radio>
              <Radio value="FINISHED">?????????</Radio>
              <Radio value="">??????</Radio>
            </RadioGroup>
          ),
        },
      ],
      columns: [
        {
          title: '????????????',
          dataIndex: 'examName',
          align: 'center',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/hr/prefMgmt/prefCheck/flowMgmt/view?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '????????????',
          dataIndex: 'examCycleName',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'examDate',
          align: 'center',
          render: (value, row, index) => `${row.examPeriodStart}-${row.examPeriodEnd}`,
        },
        {
          title: '??????',
          dataIndex: 'examStatus',
          align: 'center',
          render: (val, row, index) =>
            val !== 'CREATE' ? (
              <Switch
                checkedChildren="?????????"
                unCheckedChildren="?????????"
                checked={val === 'FINISHED'}
                onChange={(bool, e) => {
                  const parmas = bool ? 'FINISHED' : 'IN PROCESS';
                  dispatch({
                    type: `${DOMAIN}/ChangeStatus`,
                    payload: { id: row.id, tmplStatus: parmas },
                  }).then(res => {
                    list[index].examStatus = parmas;
                    list[index].examStatusName = parmas === 'FINISHED' ? '?????????' : '?????????';
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: list,
                    });
                  });
                }}
              />
            ) : (
              '??????'
            ),
        },
        {
          title: '????????????',
          dataIndex: 'examDesc',
          render: (value, row, index) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '??????' }),
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/hr/prefMgmt/prefCheck/flowMgmt/create?${from}`);
          },
        },
        {
          key: 'copy',
          icon: 'copy',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.copy`, desc: '??????' }),
          loading,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/hr/prefMgmt/prefCheck/flowMgmt/create?id=${id}&${from}&copy=true`);
          },
        },
        {
          key: 'review',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.review', desc: '????????????' }),
          loading,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { examStatus, id } = selectedRows[0];
            if (examStatus === 'CREATE') {
              dispatch({
                type: `${DOMAIN}/createReview`,
                payload: {
                  id,
                },
              }).then(response => {
                if (response.ok) {
                  dispatch({
                    type: `${DOMAIN}/query`,
                  });
                  router.push(`/user/flow/process`);
                } else {
                  createMessage({ type: 'error', description: response.datum || '??????????????????' });
                }
              });
            } else {
              createMessage({ type: 'warn', description: '??????????????????????????????' });
            }
          },
        },
        {
          key: 'planComm',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.planComm`, desc: '??????????????????' }),
          loading,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: urls });
            dispatch({
              type: `${DOMAIN}/checkIsPerformanceExam`,
              payload: {
                performanceExamId: id,
                communicateType: 'PLAN',
              },
            }).then(response => {
              if (response.ok) {
                if (response.datum) {
                  if (response.datum === '????????????') {
                    createMessage({ type: 'error', description: '????????????' });
                  } else {
                    createConfirm({
                      content: '???????????????????????????????????????????????????',
                      onOk: () =>
                        router.push(
                          `/hr/prefMgmt/prefCheck/flowMgmt/createPlanComm?id=${id}&${from}&communicateType=PLAN`
                        ),
                    });
                  }
                } else {
                  router.push(
                    `/hr/prefMgmt/prefCheck/flowMgmt/createPlanComm?id=${id}&${from}&communicateType=PLAN`
                  );
                }
              }
            });
          },
        },
        {
          key: 'middleComm',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.middleComm`, desc: '??????????????????' }),
          loading,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: urls });
            dispatch({
              type: `${DOMAIN}/checkIsPerformanceExam`,
              payload: {
                performanceExamId: id,
                communicateType: 'MIDDLE',
              },
            }).then(response => {
              if (response.ok) {
                if (response.datum) {
                  if (response.datum === '????????????') {
                    createMessage({ type: 'error', description: '????????????' });
                  } else {
                    createConfirm({
                      content: '???????????????????????????????????????????????????',
                      onOk: () =>
                        router.push(
                          `/hr/prefMgmt/prefCheck/flowMgmt/createMiddleComm?id=${id}&${from}&communicateType=MIDDLE`
                        ),
                    });
                  }
                } else {
                  router.push(
                    `/hr/prefMgmt/prefCheck/flowMgmt/createMiddleComm?id=${id}&${from}&communicateType=MIDDLE`
                  );
                }
              }
            });
          },
        },
        {
          key: 'resultComm',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.resultComm`, desc: '??????????????????' }),
          loading,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: urls });
            dispatch({
              type: `${DOMAIN}/checkIsPerformanceExam`,
              payload: {
                performanceExamId: id,
                communicateType: 'RESULT',
              },
            }).then(response => {
              if (response.ok) {
                if (response.datum) {
                  if (response.datum === '????????????') {
                    createMessage({ type: 'error', description: '????????????' });
                  } else {
                    createConfirm({
                      content: '???????????????????????????????????????????????????',
                      onOk: () =>
                        router.push(
                          `/hr/prefMgmt/prefCheck/flowMgmt/createResultComm?id=${id}&${from}&communicateType=RESULT`
                        ),
                    });
                  }
                } else {
                  router.push(
                    `/hr/prefMgmt/prefCheck/flowMgmt/createResultComm?id=${id}&${from}&communicateType=RESULT`
                  );
                }
              }
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="??????????????????">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheck;
