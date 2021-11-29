import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import moment from 'moment';
import classnames from 'classnames';
import { isNil, isEmpty } from 'ramda';
import { Button, Card, Form, Input, Radio, InputNumber, Select } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance, Selection, YearPicker, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import SelectWithCols from '@/components/common/SelectWithCols';
import Loading from '@/components/core/DataLoading';
import DataTable from '@/components/common/DataTable';
import SyntheticField from '@/components/common/SyntheticField';
import { selectUsersWithBu } from '@/services/gen/list';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const DOMAIN = 'platCapaDoubleCheck';
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
@connect(({ loading, platCapaDoubleCheck }) => ({
  loading,
  platCapaDoubleCheck,
}))
class DoubleCheck extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'platCapaDoubleCheck/getPageConfig',
      payload: { pageNo: 'RENEW_CAPA_SELECT' },
    });
    this.fetchData({});
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const newParams = Object.assign({}, params);
    if (params.endDate) {
      [newParams.reCheckStartDate, newParams.reCheckDateEnd] = params.endDate;
      newParams.endDate = undefined;
    }

    if (params.startDate) {
      [newParams.stayReCheckStartDate, newParams.stayReCheckDateEnd] = params.startDate;
      newParams.endDate = undefined;
    }

    dispatch({
      type: 'platCapaDoubleCheck/query',
      payload: { ...newParams },
    });
  };

  sortObj = (obj1, obj2) => {
    const a = obj1.sortNo;
    const b = obj2.sortNo;
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  };

  render() {
    const {
      dispatch,
      loading,
      platCapaDoubleCheck: { total = 0, dataSource = [], searchForm = {}, pageConfig = {} },
    } = this.props;
    const { pageBlockViews = [] } = pageConfig;
    let columns = [];
    let searchKeyBox = [];
    let searchBarForms = [];
    if (pageBlockViews && pageBlockViews.length > 0) {
      const { pageFieldViews = [] } = pageBlockViews[0];

      columns = pageFieldViews
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj)
        .map(item => {
          const columnsItem = {
            title: item.displayName,
            dataIndex: item.fieldKey,
            align: 'center',
          };
          if (item.fieldKey === 'renewCapaName') {
            columnsItem.render = (value, rowData, key) => (
              <Link to={`/hr/capacity/doubleCheck/detail?id=${rowData.id}`}>{value}</Link>
            );
          }
          return columnsItem;
        });
    }
    if (pageBlockViews && pageBlockViews.length > 1) {
      searchKeyBox = pageBlockViews[1].pageFieldViews
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj);

      searchBarForms = searchKeyBox.map(item => {
        const { displayName, fieldKey } = item;
        const searchBar = {
          title: displayName,
          dataIndex: fieldKey,
          options: {
            initialValue: searchForm[fieldKey],
          },
        };

        if (fieldKey === 'renewType') {
          searchBar.tag = (
            <RadioGroup>
              <Radio value="CAPA">单项能力</Radio>
              <Radio value="CAPASET">复核能力</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          );
        }

        if (fieldKey === 'endDate') {
          searchBar.tag = <DatePicker.RangePicker format="YYYY-MM-DD" />;
        }

        if (fieldKey === 'startDate') {
          searchBar.tag = <DatePicker.RangePicker format="YYYY-MM-DD" />;
        }

        if (fieldKey === 'inRenewCount') {
          searchBar.dataIndex = 'stayReCheckRes';
          searchBar.tag = (
            <SyntheticField className="tw-field-group">
              <Radio.Group
                className="tw-field-group-filter"
                buttonStyle="solid"
                defaultValue="0"
                style={{ width: '40%' }}
              >
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="0">
                  &gt;
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="1">
                  &lt;
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="2">
                  =
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="3">
                  ≠
                </Radio.Button>
              </Radio.Group>
              <InputNumber min={0} />
            </SyntheticField>
          );
        }

        if (fieldKey === 'invalidCount') {
          searchBar.dataIndex = 'invalidReCheckRes';
          searchBar.tag = (
            <SyntheticField className="tw-field-group">
              <Radio.Group
                className="tw-field-group-filter"
                buttonStyle="solid"
                defaultValue="0"
                style={{ width: '40%' }}
              >
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="0">
                  &gt;
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="1">
                  &lt;
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="2">
                  =
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="3">
                  ≠
                </Radio.Button>
              </Radio.Group>
              <InputNumber min={0} />
            </SyntheticField>
          );
        }

        return searchBar;
      });
    }

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      showColumn: false,
      showExport: false,
      enableSelection: false,
      loading: loading.effects['platCapaDoubleCheck/query'],
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
      searchBarForm: [...searchBarForms],
      columns: [...columns],
    };

    return (
      <PageHeaderWrapper title="能力复核">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default DoubleCheck;
