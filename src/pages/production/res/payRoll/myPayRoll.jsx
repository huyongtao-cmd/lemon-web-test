import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import PageWrapper from '@/components/production/layout/PageWrapper';
import { Table, Card, Button } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { DatePicker } from '@/pages/gen/field';
import moment from 'moment';
import './index.less';

const { Field } = FieldList;

const DOMAIN = 'myPayRoll';
@connect(({ loading, dispatch, user: { user }, myPayRoll }) => ({
  loading,
  dispatch,
  user,
  myPayRoll,
}))
class MyPayRoll extends React.Component {
  state = {
    getInternalState: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const defaultSearchForm = {
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
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...params },
    });
  };

  onSearchBarChange = (changedValues, allValues) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateSearchForm`,
      payload: {
        year: changedValues,
      },
    });
  };

  render() {
    const {
      myPayRoll: { formData = {}, searchForm, time },
      user: { info, extInfo },
    } = this.props;
    const { year } = searchForm;
    const { getInternalState } = this.state;
    !isEmpty(formData) &&
      formData.forEach(v => {
        const item = v;
        delete item.oldId;
        delete item.序号;
      });
    return (
      <PageWrapper>
        <Card>
          <Field name="year" label="年份" fieldCol="4">
            <DatePicker.YearPicker
              className="x-fill-100"
              mode="year"
              format="YYYY"
              value={year}
              allowClear={false}
              onChange={v => {
                this.onSearchBarChange(v);
              }}
            />
          </Field>
          <Button
            icon="query"
            className="tw-btn-primary"
            loading={false}
            size="large"
            style={{ left: '0' }}
            onClick={() => {
              this.fetchData({ year });
            }}
          >
            查询
          </Button>
        </Card>
        <Card>
          <div>
            <span className="describe-form change-color">年份</span>
            <span className="describe-form">{time.year}</span>
            <span className="describe-form change-color">工号</span>
            <span className="describe-form">{info.login}</span>
            <span className="describe-form change-color">姓名</span>
            <span className="describe-form">{info.name}</span>
            <span className="describe-form change-color">部门</span>
            <span className="describe-form">{extInfo.baseBuName}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            {!isEmpty(formData) ? (
              formData.map(item => (
                <>
                  <Table
                    columns={Object.keys(item).map(rowItem => ({
                      title: rowItem,
                      key: rowItem,
                      dataIndex: rowItem,
                      align: 'center',
                    }))}
                    title={() => `${item.年份}年${item.月份}月份工资信息`}
                    dataSource={[item]}
                    pagination={false}
                    scroll={{ x: 4000 }}
                    bordered
                    style={{ marginTop: 20 }}
                  />
                </>
              ))
            ) : (
              <div className="center">暂无数据</div>
            )}
          </div>
        </Card>
      </PageWrapper>
    );
  }
}

export default MyPayRoll;
