import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Input, Form, Radio, Switch, Tooltip } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const RadioGroup = Radio.Group;

const DOMAIN = 'benefitDistTemp';

@connect(({ loading, benefitDistTemp, dispatch, user }) => ({
  benefitDistTemp,
  dispatch,
  user,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class BenefitDistTempList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanTable` }).then(() => {
      dispatch({ type: `${DOMAIN}/functionList` });
      // 获取页面配置信息
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'T_PROFITDIST_FUNCTION' },
      });
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      benefitDistTemp: {
        businessFunList,
        list,
        total,
        searchForm,
        pageConfig: { pageBlockViews = [] },
      },
      dispatch,
      loading,
    } = this.props;
    const from = stringify({ from: getUrl() });

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '利益分配模板列表');
    const { pageFieldViews = {} } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
    const { busiFunctionId = {}, templateName = {}, activeFlag = {} } = pageFieldJson;

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
          title: busiFunctionId.displayName,
          dataIndex: 'busiFunctionId',
          options: {
            initialValue: searchForm.busiFunctionId || undefined,
          },
          tag: (
            <Selection
              key="busiFunctionId"
              className="x-fill-100"
              source={businessFunList}
              transfer={{ key: 'id', code: 'id', name: 'functionName' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${busiFunctionId.displayName}`}
            />
          ),
        },
        {
          title: templateName.displayName,
          dataIndex: 'templateName',
          options: {
            initialValue: searchForm.templateName || '',
          },
          tag: <Input placeholder={`请选择${templateName.displayName}`} />,
        },
        {
          title: activeFlag.displayName,
          dataIndex: 'activeFlag',
          options: {
            initialValue: searchForm.activeFlag || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="0">已启用</Radio>
              <Radio value="1">未启用</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
      ],
      columns: [
        {
          title: templateName.displayName,
          dataIndex: 'templateName',
          align: 'center',
          render: (value, row) => {
            const href = `/plat/distInfoMgmt/distInfoMgmt/benefitDistTemp/view?id=${
              row.id
            }&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: busiFunctionId.displayName,
          dataIndex: 'busiFunctionName',
          align: 'center',
        },
        {
          title: activeFlag.displayName,
          dataIndex: 'activeFlag',
          align: 'center',
          render: (val, row, index) => (
            <Switch
              checkedChildren="已启用"
              unCheckedChildren="未启用"
              checked={val === '0'}
              onChange={(bool, e) => {
                const parmas = bool ? '0' : '1';
                dispatch({
                  type: `${DOMAIN}/updateProStatus`,
                  payload: { id: row.id, state: parmas },
                }).then(res => {
                  if (res.ok) {
                    list[index].activeFlag = parmas;
                    list[index].activeFlagName = parmas === '0' ? '已启用' : '未启用';
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: list,
                    });
                  }
                });
              }}
            />
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
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
            router.push(`/plat/distInfoMgmt/distInfoMgmt/benefitDistTemp/edit?${from}`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length !== 1 || selectedRows.filter(v => v.activeFlag === '0').length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            router.push(`/plat/distInfoMgmt/distInfoMgmt/benefitDistTemp/edit?id=${id}&${from}`);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            !selectedRows.length || selectedRows.filter(v => v.activeFlag === '0').length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
        {
          key: 'filedEdit',
          className: 'tw-btn-primary',
          title: '字段类型维护',
          loading: false,
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/plat/distInfoMgmt/distInfoMgmt/benefitDistTemp/fieldTypeEdit?&${from}`);
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="利益分配模板列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default BenefitDistTempList;
