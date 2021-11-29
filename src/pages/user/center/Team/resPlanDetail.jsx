import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { DatePicker, Input } from 'antd';
import { omit, keys, values, isNil, isEmpty } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import { UdcSelect, RangeInput, Selection } from '@/pages/gen/field';
import { formatDT } from '@/utils/tempUtils/DateTime';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import SelectWithCols from '@/components/common/SelectWithCols';
import createMessage from '@/components/core/AlertMessage';
import { selectUsersWithBu } from '@/services/gen/list';
import styles from './styles.less';

const DOMAIN = 'resPlanDetail';

const commonColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const defaultPagination = {
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
  showTotal: total => `共 ${total} 条`,
  defaultPageSize: 10,
  defaultCurrent: 1,
  size: 'default',
};

const formatYW = value => `${moment(value).weekYear()}${formatDT(value, 'WW')}`;

@connect(({ loading, resPlanDetail }) => ({
  resPlanDetail,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class ResPlanDetailList extends Component {
  state = {
    // cacheDeliBuList: undefined,
    // cacheDeliResList: undefined,
    // cacheSignBuList: undefined,
    // cachePmResList: undefined,
    cacheUpResList: undefined,
    cacheResList: undefined,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const defaultSearchForm = {
      yearWeekStart: [
        moment().startOf('week'),
        moment()
          .startOf('week')
          .add(7, 'week')
          .startOf('week'),
      ],
    };
    const initialState = {
      searchForm: defaultSearchForm,
      dynamicColumnsCfg: [],
      list: [],
      total: 0,
      resList: [],
      buList: [],
      orgList: [],
    };
    // 数据清洗
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: initialState,
    });
    dispatch({ type: `${DOMAIN}/queryResSelect` });
    dispatch({ type: `${DOMAIN}/queryBuSelect` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { yearWeekStart } = params || {};
    if (isEmpty(yearWeekStart) || isNil(yearWeekStart)) {
      // yearWeekStart is required !!!
      createMessage({ type: 'warn', description: '请选择期间后再查询' });
      return;
    }
    const newYearWeekStart = {
      yearWeekStart: formatYW(yearWeekStart[0]),
      yearWeekEnd: formatYW(yearWeekStart[1]),
      start: formatDT(yearWeekStart[0]),
      end: formatDT(yearWeekStart[1]),
    };
    if (moment(yearWeekStart[1]).diff(moment(yearWeekStart[0]), 'weeks') >= 8) {
      createMessage({ type: 'warn', description: '最多只能查询8周的数据，请调整查询期间！' });
      return;
    }
    const newParams = {
      ...newYearWeekStart,
      ...omit(['yearWeekStart'], params),
    };
    dispatch({ type: `${DOMAIN}/query`, payload: newParams });
  };

  tablePropsConfig = () => {
    const { loading, resPlanDetail, dispatch } = this.props;
    const { list, total, searchForm, buList, resList, dynamicColumnsCfg } = resPlanDetail;
    const { cacheUpResList, cacheResList } = this.state;

    /**
     * hard code !!!
     * 超级特殊情况
     * 需要有未分配资源可供选择，做统计。只有这一处，最终决定前端硬编码
     */
    const specialResList = [{ id: -1, code: '-', name: '未分配资源' }, ...resList];

    const modifiedMultiSelect = (changedValues = {}, allValues) => {
      const key = keys(changedValues)[0];
      const value = values(changedValues)[0] || {};
      let modifiedChanges = {};
      if (key === 'deliBuId') {
        // 交付BU
        modifiedChanges = {
          deliBuId: value.id,
          deliBuCode: value.code,
          deliBuName: value.name,
          ...omit(['deliBuId'], allValues),
        };
        // isNil(value) && this.setState({ cacheDeliBuList: undefined });
      } else if (key === 'deliResId') {
        // 交付负责人
        modifiedChanges = {
          deliResId: value.id,
          deliResCode: value.code,
          deliResName: value.name,
          ...omit(['deliResId'], allValues),
        };
        // isNil(value) && this.setState({ cacheDeliResList: undefined });
      } else if (key === 'signBuId') {
        // 签单BU
        modifiedChanges = {
          signBuId: value.id,
          signBuCode: value.code,
          signBuName: value.name,
          ...omit(['signBuId'], allValues),
        };
        // isNil(value) && this.setState({ cacheSignBuList: undefined });
      } else if (key === 'pmResId') {
        // 项目经理
        modifiedChanges = {
          pmResId: value.id,
          pmResCode: value.code,
          pmResName: value.name,
          ...omit(['pmResId'], allValues),
        };
        // isNil(value) && this.setState({ cachePmResList: undefined });
      } else if (key === 'upResId') {
        // 资源负责人
        modifiedChanges = {
          upResId: value.id,
          upResCode: value.code,
          upResName: value.name,
          ...omit(['upResId'], allValues),
        };
        isNil(value) && this.setState({ cacheUpResList: undefined });
      } else if (key === 'resId') {
        // 资源
        modifiedChanges = {
          resId: value.id,
          resCode: value.code,
          resName: value.name,
          ...omit(['resId'], allValues),
        };
        isNil(value) && this.setState({ cacheResList: undefined });
      } else modifiedChanges = allValues;
      return modifiedChanges;
    };

    const tableProps = {
      // title: () => <span style={{ color: 'red' }}>{STANDARD_MESSAGE}</span>,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      scroll: { x: isEmpty(dynamicColumnsCfg) ? 1250 : 1250 + dynamicColumnsCfg.length * 90 },
      loading,
      total,
      dataSource: list,
      searchForm,
      enableSelection: false,
      onChange: (filters, pagination) => {
        let modifiedFilters = modifiedMultiSelect({ deliBuId: filters.deliBuId }, filters);
        modifiedFilters = modifiedMultiSelect({ deliResId: filters.deliResId }, modifiedFilters);
        modifiedFilters = modifiedMultiSelect({ signBuId: filters.signBuId }, modifiedFilters);
        modifiedFilters = modifiedMultiSelect({ pmResId: filters.pmResId }, modifiedFilters);
        modifiedFilters = modifiedMultiSelect({ upResId: filters.upResId }, modifiedFilters);
        // modifiedFilters = modifiedMultiSelect({ resId: filters.resId }, modifiedFilters);
        const params = omit(
          [
            'deliBuCode',
            'deliBuName',
            'deliResCode',
            'deliResName',
            'signBuCode',
            'signBuName',
            'pmResCode',
            'pmResName',
            'upResCode',
            'upResName',
            'resCode',
            'resName',
          ],
          modifiedFilters
        );
        // 点击页码不发送请求
        if (pagination) {
          this.fetchData(params);
        }
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: {
            ...searchForm,
            ...changedValues,
          },
        });
      },
      rowClassName: (record, index) => {
        const { planTypeName } = record;
        const { oppo, proj, other } = styles;
        let className = other;
        switch (planTypeName) {
          case '商机':
            className = oppo;
            break;
          case '项目':
            className = '';
            break;
          default:
            break;
        }
        return className;
      },
      searchBarForm: [
        {
          title: '期间',
          dataIndex: 'yearWeekStart',
          options: {
            initialValue: searchForm.yearWeekStart,
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (!isEmpty(value)) {
                    const weeks = moment(value[1]).diff(moment(value[0]), 'weeks');
                    if (weeks >= 8) {
                      createMessage({
                        type: 'warn',
                        description: '最多只能查询8周的数据，请调整查询期间！',
                      });
                    }
                  } else {
                    createMessage({ type: 'warn', description: '请选择期间后再查询' });
                  }
                  callback();
                },
              },
            ],
          },
          tag: (
            <DatePicker.RangePicker
              format="YYYY-MM-DD"
              className="x-fill-100"
              disabledDate={current =>
                moment(current).format('YYYY-MM-DD') !==
                moment(current)
                  .startOf('week')
                  .format('YYYY-MM-DD')
              }
            />
          ),
        },
        {
          title: '资源负责人',
          dataIndex: 'upResId',
          options: {
            initialValue: searchForm.upResId,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              placeholder="请选择资源负责人"
              columns={commonColumns}
              dataSource={isNil(cacheUpResList) ? resList : cacheUpResList}
              selectProps={{
                className: 'x-fill-100',
                showSearch: true,
                onSearch: value => {
                  if (isNil(value)) this.setState({ cacheUpResList: undefined });
                  else
                    this.setState({
                      cacheUpResList: resList.filter(
                        d =>
                          d.code.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
                          d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                      ),
                    });
                },
                allowClear: true,
              }}
            />
          ),
        },
        {
          title: '计划类型',
          dataIndex: 'planType',
          options: {
            initialValue: searchForm.planType,
          },
          tag: <UdcSelect code="COM.PLAN_TYPE" placeholder="请选择计划类型" />,
        },
        {
          title: '商机/项目名',
          dataIndex: 'oppProjName',
          options: {
            initialValue: searchForm.oppProjName,
          },
          tag: <Input placeholder="请输入商机/项目名" />,
        },
        {
          title: '成单概率',
          dataIndex: 'probability',
          options: {
            initialValue: searchForm.probability,
          },
          tag: <UdcSelect code="TSK:WIN_PROBABLITY" placeholder="请选择成单概率" />,
        },
        {
          title: '资源',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={commonColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择资源"
            />
          ),
        },
      ],
      columns: [
        {
          title: '资源编号',
          dataIndex: 'resNo',
          fixed: dynamicColumnsCfg.length > 0 ? 'left' : null,
          width: 100,
        },
        {
          title: '资源',
          dataIndex: 'resName',
          fixed: dynamicColumnsCfg.length > 0 ? 'left' : null,
          width: 80,
        },
        {
          title: '资源负责人',
          dataIndex: 'upResName',
          fixed: dynamicColumnsCfg.length > 0 ? 'left' : null,
          width: 100,
        },
        {
          title: '参考负荷率',
          dataIndex: 'loadRate',
          fixed: dynamicColumnsCfg.length > 0 ? 'left' : null,
          align: 'right',
          width: 80,
        },
        {
          title: '商机/项目名',
          dataIndex: 'oppProjName',
          fixed: dynamicColumnsCfg.length > 0 ? 'left' : null,
          width: 180,
        },
        {
          title: '计划类型',
          dataIndex: 'planTypeName',
          align: 'center',
          fixed: dynamicColumnsCfg.length > 0 ? 'left' : null,
          width: 100,
        },
        {
          title: '复合能力',
          dataIndex: 'capaSet',
          // width: 160,
        },
        // {
        //   title: '交付BU',
        //   dataIndex: 'deliBuName',
        //   width: 150,
        // },
        // {
        //   title: '交付负责人',
        //   dataIndex: 'deliResName',
        //   width: 120,
        // },
        {
          title: '项目经理',
          dataIndex: 'pmResName',
          // width: 100,
        },
        {
          title: '成单概率',
          dataIndex: 'probabilityName',
          // width: 80,
          align: 'center',
          // render: value => (isNil(value) ? '' : `${value}%`),
        },
        {
          title: '进入时间',
          dataIndex: 'startDate',
          // width: 120,
          render: value => formatDT(value),
        },
        {
          title: '退出时间',
          dataIndex: 'endDate',
          // width: 120,
          render: value => formatDT(value),
        },
      ].concat(
        dynamicColumnsCfg.map(cfg => {
          const { main, sub, key } = cfg;
          return {
            title: (
              <>
                <div>{main}</div>
                <small>{sub}</small>
              </>
            ),
            dataIndex: key,
            align: 'right',
            width: 90,
            render: v => (isNil(v) || isNil(v.days) ? 0 : v.days),
          };
        })
      ),
    };

    return tableProps;
  };

  render() {
    return (
      <PageHeaderWrapper>
        <DataTable {...this.tablePropsConfig()} />
      </PageHeaderWrapper>
    );
  }
}

export default ResPlanDetailList;
