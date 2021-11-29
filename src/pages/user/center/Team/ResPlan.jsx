import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, DatePicker, Button, Alert } from 'antd';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import { isEmpty, isNil, omit } from 'ramda';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { UdcSelect, RangeInput } from '@/pages/gen/field';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'resPlan';
const { RangePicker } = DatePicker;
const titleStyle = { marginRight: 16 };

@connect(({ loading, resPlan }) => ({
  resPlan,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class ResPlanList extends Component {
  componentDidMount() {
    const { resId } = fromQs();
    const { dispatch } = this.props;
    const defaultSearchForm = {
      id: resId,
      DateRange: [
        moment().startOf('week'),
        moment()
          .startOf('week')
          .add(3, 'month')
          .startOf('week'),
      ],
    };
    const initialState = {
      searchForm: defaultSearchForm,
      dynamicColumnsCfg: [],
      list: [],
      total: null,
      resInfo: {},
    };
    // 数据清洗
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: initialState,
    });
    dispatch({ type: `${DOMAIN}/queryResInfo`, payload: resId });
    this.fetchData({
      sortBy: 'resNo',
      sortDirection: 'ASC',
      ...defaultSearchForm,
    });
  }

  fetchData = params => {
    // modified
    const { DateRange, loadRate } = params || {};
    if (isEmpty(DateRange) || isNil(DateRange)) {
      // DateRange is required !!!
      createMessage({ type: 'warn', description: '请选择期间后再查询' });
      return;
    }
    const newDateRanger = {
      startDate: formatDT(DateRange[0]),
      endDate: formatDT(DateRange[1]),
    };
    if (moment(DateRange[1]).diff(moment(DateRange[0]), 'weeks') >= 20) {
      createMessage({ type: 'warn', description: '最多只能查询20周的数据，请调整查询期间！' });
      return;
    }
    let newLoadRate = {};
    if (!isNil(loadRate)) {
      newLoadRate = {
        minLoadRate: loadRate[0],
        maxLoadRate: loadRate[1],
      };
    }
    const newParams = {
      ...newDateRanger,
      ...newLoadRate,
      ...omit(['DateRange', 'loadRate'], params),
    };
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: newParams });
  };

  tablePropsConfig = () => {
    const { loading, resPlan, dispatch } = this.props;
    const { list, total, searchForm, dynamicColumnsCfg, resInfo } = resPlan;

    const titleCfg = isEmpty(resInfo)
      ? {}
      : {
          title: () => (
            <>
              <span style={titleStyle}>
                资源编号：
                <strong>{resInfo.resNo}</strong>
              </span>
              <span style={titleStyle}>
                资源：
                <strong>{resInfo.resName}</strong>
              </span>
              <span style={titleStyle}>
                资源负责人：
                <strong>{resInfo.presName}</strong>
              </span>
            </>
          ),
        };
    const tableProps = {
      ...titleCfg,
      rowKey: 'id',
      sortBy: 'resNo',
      sortDirection: 'ASC',
      columnsCache: DOMAIN,
      scroll: { x: isEmpty(dynamicColumnsCfg) ? 1140 : 1140 + dynamicColumnsCfg.length * 150 },
      loading,
      total,
      dataSource: list,
      searchForm,
      enableSelection: false,
      onChange: filters => {
        this.fetchData({ ...filters, id: fromQs().resId });
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: {
            ...searchForm,
            ...allValues,
            id: fromQs().resId, // 保证即使是 点击表单清空，id(resId) 也要存在
          },
        });
      },
      searchBarForm: [
        {
          title: '期间',
          dataIndex: 'DateRange',
          options: {
            initialValue: searchForm.DateRange,
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (!isEmpty(value)) {
                    const weeks = moment(value[1]).diff(moment(value[0]), 'weeks');
                    if (weeks >= 20) {
                      createMessage({
                        type: 'warn',
                        description: '最多只能查询20周的数据，请调整查询期间！',
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
            <RangePicker
              format="YYYY-MM-DD"
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
          title: '计划类型',
          dataIndex: 'planType',
          options: {
            initialValue: searchForm.planType,
          },
          tag: <UdcSelect code="COM.PLAN_TYPE" placeholder="请选择合作方式" />,
        },
        {
          title: '商机/项目名',
          dataIndex: 'itemName',
          options: {
            initialValue: searchForm.itemName,
          },
        },
        {
          title: '参考负荷率',
          dataIndex: 'loadRate',
          options: {
            initialValue: searchForm.loadRate,
          },
          tag: <RangeInput />,
        },
      ],
      columns: [
        {
          title: '复合能力',
          dataIndex: 'capaset',
          fixed: 'left',
          width: 200,
        },
        {
          title: '商机/项目名',
          dataIndex: 'itemName',
          fixed: 'left',
          width: 200,
        },
        {
          title: '计划类型',
          dataIndex: 'planTypeName',
          align: 'center',
          width: 100,
        },
        {
          title: '商机/项目状态',
          dataIndex: 'itemStatus',
          align: 'center',
          // width: 100,
        },
        {
          title: '交付负责人',
          dataIndex: 'deliResName',
          width: 100,
        },
        {
          title: '项目经理',
          dataIndex: 'pmResName',
          width: 100,
        },
        {
          title: '进入时间',
          dataIndex: 'startDate',
          width: 120,
        },
        {
          title: '退出时间',
          dataIndex: 'endDate',
          width: 120,
        },
        {
          title: '参考负荷率',
          dataIndex: 'referLoadRate',
          align: 'right',
          width: 100,
          render: value => (isNil(value) ? '0.0%' : value),
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
            width: 150,
            render: v => (isNil(v.workingDays) ? '0.0' : v.workingDays),
          };
        })
      ),
    };

    return tableProps;
  };

  render() {
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from, resId } = fromQs();
              if (from === '/hr/res/resPortrayal') {
                closeThenGoto(`${from}?id=${resId}`);
              } else {
                from ? closeThenGoto(from) : closeThenGoto(`/user/center/myTeam`);
              }
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <DataTable {...this.tablePropsConfig()} />
      </PageHeaderWrapper>
    );
  }
}

export default ResPlanList;
