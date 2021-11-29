import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Card, Divider, Button, Alert, Form, Row, Col } from 'antd';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';
import moment from 'moment';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { YearPicker } from '@/pages/gen/field';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import { bottom } from './styles.less';

const DOMAIN = 'working';

const STANDARD_MESSAGE =
  '工时按8.0小时=1天换算，不统计“无任务”和“法定假/休假”工时； 利用率=年度工时合计/截止到当前日期的工作天数；  产出率=年度当量合计/截止到当前日期的额定当量';
const MONTH_MESSAGE =
  '往月额定工时=全月额定工时;往月额定当量=全月额定当量;本月额定工时=截止到当前日期的额定工时;本月额定当量=截止到当前日期的额定当量';
const { Field } = FieldList;
const { Description } = DescriptionList;
@connect(({ loading, working }) => ({
  working,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };
    props.dispatch({
      type: `${DOMAIN}/updateSearchForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class WorkingList extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const defaultSearchForm = {
      id: fromQs().resId,
      year: moment().year(),
    };
    const initialState = {
      searchForm: defaultSearchForm,
      list: [],
      detailList: [],
      detailTitle: undefined,
    };
    dispatch({ type: `${DOMAIN}/updateState`, payload: initialState });
    dispatch({ type: `${DOMAIN}/query`, payload: defaultSearchForm });
    this.fetchData({
      sortBy: 'resNo',
      sortDirection: 'ASC',
      ...defaultSearchForm,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { year } = params || {};
    if (isNil(year)) {
      createMessage({ type: 'warn', description: '请选择年份后再查询' });
      return;
    }
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params, id: fromQs().resId } });
  };

  tablePropsConfig = () => {
    const { loading, working, dispatch } = this.props;
    const { list, searchForm } = working;
    const tableProps = {
      title: () => <span style={{ color: 'red' }}>{STANDARD_MESSAGE}</span>,
      rowKey: 'period',
      sortBy: 'BaseBU',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      // scroll: { x: 3000 },
      loading,
      dataSource: list,
      searchForm,
      pagination: false,
      enableSelection: false,
      showClear: false,
      showSearch: false,
      showColumn: false,
      showExport: false,
      onChange: filters => {
        this.fetchData(filters);
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
      columns: [
        {
          title: 'BaseBU',
          dataIndex: 'buName',
          align: 'center',
        },
        {
          title: '期间',
          dataIndex: 'period',
          align: 'center',
        },
        {
          title: '当量系数',
          dataIndex: 'eqvaRatio',
          align: 'right',
          render: value => (+value).toFixed(1),
        },
        {
          title: '资源负责人',
          dataIndex: 'leaderName',
        },
        {
          title: '合作方式',
          dataIndex: 'coopTypeName',
          align: 'center',
        },
        {
          title: '额定工时(天)',
          dataIndex: 'ratedWorkHours',
          align: 'right',
          render: value => (isNil(value) ? '0.0' : value),
        },
        {
          title: '实际工时(天)',
          dataIndex: 'realityWorkHours',
          align: 'right',
          render: value => (isNil(value) ? '0.0' : value),
        },
        {
          title: '利用率',
          dataIndex: 'useRate',
          align: 'right',
          render: value => (isNil(value) ? '0.0%' : value),
        },
        {
          title: '额定当量',
          dataIndex: 'ratedEqva',
          align: 'right',
          render: value => (isNil(value) ? '0.0' : value),
        },
        {
          title: '实际当量',
          dataIndex: 'realityEqva',
          align: 'right',
          render: value => (isNil(value) ? '0.0' : value),
        },
        {
          title: '产出率',
          dataIndex: 'outputRate',
          align: 'right',
          render: value => (isNil(value) ? '0.0%' : value),
        },
      ],
    };

    return tableProps;
  };

  detailTableConfig = () => {
    const { loading, working } = this.props;
    const { detailList, detailTitle } = working;
    const tableProps = {
      title: () => <span style={{ color: 'red' }}>{MONTH_MESSAGE}</span>,
      rowKey: 'month',
      loading,
      dataSource: detailList,
      bordered: true,
      pagination: false,
      columns: [
        {
          title: detailTitle,
          dataIndex: 'month',
          align: 'center',
          render: value => (isNil(value) ? null : `${value}月`),
        },
        {
          title: '额定工时(天)',
          dataIndex: 'ratedWorkHours',
          align: 'right',
          render: value => (isNil(value) ? '0.0' : value),
        },
        {
          title: '实际工时(天)',
          dataIndex: 'realityWorkHours',
          align: 'right',
          render: value => (isNil(value) ? '0.0' : value),
        },
        {
          title: '利用率',
          dataIndex: 'useRate',
          align: 'right',
          render: value => (isNil(value) ? '0.0%' : value),
        },
        {
          title: '额定当量',
          dataIndex: 'ratedEqva',
          align: 'right',
          render: value => (isNil(value) ? '0.0' : value),
        },
        {
          title: '实际当量',
          dataIndex: 'realityEqva',
          align: 'right',
          render: value => (isNil(value) ? '0.0' : value),
        },
        {
          title: '产出率',
          dataIndex: 'outputRate',
          align: 'right',
          render: value => (isNil(value) ? '0.0%' : value),
        },
      ],
    };

    return tableProps;
  };

  render() {
    const {
      loading,
      working,
      working: {
        list,
        detailList,
        tsList,
        eqvaList,
        searchForm,
        resNo,
        resName,
        resStatus,
        resStatusDesc,
        period,
      },
      form: { getFieldDecorator },
    } = this.props;

    const tsTableConfig = {
      rowKey: 'realityWorkHours',
      loading,
      dataSource: tsList,
      bordered: true,
      pagination: false,
      showSearch: false,
      showExport: false,
      enableSelection: false,
      showColumn: false,
      columns: [
        {
          title: '额定工时(天)',
          dataIndex: 'ratedWorkHours',
          align: 'center',
          render: value => (isNil(value) ? '0.0' : value),
        },
        {
          title: '实际工时(天)',
          dataIndex: 'realityWorkHours',
          align: 'center',
          render: value => (isNil(value) ? '0.0' : value),
        },
        {
          title: '利用率',
          dataIndex: 'useRate',
          align: 'center',
          render: value => (isNil(value) ? '0.0%' : value),
        },
      ],
    };
    const eqvaTableConfig = {
      rowKey: 'realityEqva',
      loading,
      dataSource: eqvaList,
      bordered: true,
      pagination: false,
      showSearch: false,
      showExport: false,
      enableSelection: false,
      showColumn: false,
      columns: [
        {
          title: '额定当量',
          dataIndex: 'ratedEqva',
          align: 'center',
          render: value => (isNil(value) ? '0.0' : value),
        },
        {
          title: '实际当量',
          dataIndex: 'realityEqva',
          align: 'center',
          render: value => (isNil(value) ? '0.0' : value),
        },
        {
          title: '产出率',
          dataIndex: 'outputRate',
          align: 'center',
          render: value => (isNil(value) ? '0.0%' : value),
        },
      ],
    };
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              from ? closeThenGoto(from) : closeThenGoto(`/user/center/myTeam`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className={bottom}>
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="year"
              label="年份"
              decorator={{
                initialValue: isNil(searchForm.year) ? undefined : searchForm.year,
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if (isNil(value)) {
                        createMessage({ type: 'warn', description: '请选择年份后再查询' });
                      }
                      callback();
                    },
                  },
                ],
              }}
            >
              <YearPicker className="x-fill-100" mode="year" format="YYYY" />
            </Field>
            <Button
              icon="query"
              className="tw-btn-primary"
              // loading={`${DOMAIN}/query`}
              loading={false}
              size="large"
              onClick={() => {
                const { dispatch } = this.props;
                dispatch({
                  type: `${DOMAIN}/query`,
                  payload: null,
                });
              }}
            >
              查询
            </Button>
          </FieldList>
        </Card>
        <Card className={bottom}>
          <DescriptionList col={6} size="large">
            <Description term="姓名" labelWidth={50}>
              {resName}
            </Description>
            <Description term="编号" labelWidth={50}>
              {resNo}
            </Description>
            <Description term="状态" labelWidth={50}>
              {resStatusDesc}
            </Description>
            <Description term="期间" labelWidth={50}>
              {period}
            </Description>
          </DescriptionList>
          <Divider dashed />
          <Row>
            <Col span={12}>
              <div className="tw-card-title">工时(汇总)</div>
              <DataTable {...tsTableConfig} />
            </Col>
            <Col span={12}>
              <div className="tw-card-title">当量(汇总)</div>
              <DataTable {...eqvaTableConfig} />
            </Col>
          </Row>
        </Card>
        <Card className={bottom}>
          <div className="tw-card-title">明细(BU)</div>
          <DataTable {...this.tablePropsConfig()} />
        </Card>
        <Card className={bottom}>
          <div className="tw-card-title">明细(按月)</div>
          <br />
          <Table {...this.detailTableConfig()} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default WorkingList;
