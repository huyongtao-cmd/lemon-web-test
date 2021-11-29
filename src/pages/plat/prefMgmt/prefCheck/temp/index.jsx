import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Input, Form, Radio, Switch, Tooltip } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { formatMessage } from 'umi/locale';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const RadioGroup = Radio.Group;

const DOMAIN = 'prefCheck';

@connect(({ loading, prefCheck, dispatch, user }) => ({
  prefCheck,
  dispatch,
  user,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class PrefCheck extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanTableFrom` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      prefCheck: { list, total, searchForm },
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
          title: '模板名称',
          dataIndex: 'tmplName',
          options: {
            initialValue: searchForm.tmplName || '',
          },
          tag: <Input placeholder="请输入模板名称" />,
        },
        {
          title: '是否启用',
          dataIndex: 'enabledFlag',
          options: {
            initialValue: searchForm.enabledFlag || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="YES">已启用</Radio>
              <Radio value="NO">未启用</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
      ],
      columns: [
        {
          title: '模板名称',
          dataIndex: 'tmplName',
          align: 'center',
          render: (value, row) => {
            const href = `/hr/prefMgmt/prefCheck/temp/view?id=${row.id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '是否启用',
          dataIndex: 'enabledFlag',
          align: 'center',
          render: (val, row, index) => (
            <Switch
              checkedChildren="已启用"
              unCheckedChildren="未启用"
              checked={val === 'YES'}
              onChange={(bool, e) => {
                const parmas = bool ? 'YES' : 'NO';
                dispatch({
                  type: `${DOMAIN}/ChangeStatus`,
                  payload: { id: row.id, tmplStatus: parmas },
                }).then(res => {
                  list[index].enabledFlag = parmas;
                  list[index].enabledFlagName = parmas === 'YES' ? '已启用' : '未启用';
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: list,
                  });
                });
              }}
            />
          ),
        },
        {
          title: '分数下限',
          dataIndex: 'scoreMin',
          align: 'center',
        },
        {
          title: '分数上限',
          dataIndex: 'scoreMax',
          align: 'center',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/hr/prefMgmt/prefCheck/temp/edit?${from}`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // if (selectedRows[0].isUserIng === 'USERING') {
            //   createMessage({
            //     type: 'warn',
            //     description: `考核模板【${selectedRows[0].tmplName}】为使用中模板，不能修改！`,
            //   });
            //   return;
            // }
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/hr/prefMgmt/prefCheck/temp/edit?id=${id}&${from}`);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="绩效考核模板列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheck;
