import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { isNil, isEmpty } from 'ramda';
import {
  Button,
  Card,
  Form,
  Input,
  Radio,
  InputNumber,
  Select,
  Row,
  Col,
  Divider,
  Table,
  Tooltip,
} from 'antd';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance, Selection, DatePicker, YearPicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import SelectWithCols from '@/components/common/SelectWithCols';
import Loading from '@/components/core/DataLoading';
import { selectUsersWithBu } from '@/services/gen/list';
import DataTable from '@/components/common/DataTable';
import styles from './index.less';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const DOMAIN = 'platCapaDoubleCheck';

@connect(({ loading, platCapaDoubleCheck }) => ({
  loading,
  platCapaDoubleCheck,
}))
class DoubleCheckDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'platCapaDoubleCheck/getPageConfigRes',
      payload: { pageNo: 'RENEW_CAPA_RES' },
    });
    this.fetchData();
    this.fetchResData({});
  }

  fetchData = () => {
    const { id } = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryDoubleCheckDetailHandle`,
      payload: {
        id,
      },
    });
  };

  fetchResData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryRes`,
      payload: {
        ...params,
      },
    });
  };

  handleCancel = () => {
    closeThenGoto('/hr/capacity/doubleCheck');
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

  checkpointName = value => (
    <>
      {value.map(item => {
        const { examPointName } = item;
        let examPointNameShow = examPointName;
        let longName = false;
        if (examPointName && examPointName.length > 30) {
          examPointNameShow = examPointName.substring(0, 30) + '...';
          longName = true;
        }

        let cpnComponents = (
          <div className={styles['detail-point-style']} key={item.id}>
            {examPointNameShow}
          </div>
        );
        if (longName) {
          cpnComponents = (
            <Tooltip placement="top" title={examPointName} key={item.id}>
              <div className={styles['detail-point-style']}>{examPointNameShow}</div>
            </Tooltip>
          );
        }

        return cpnComponents;
      })}
    </>
  );

  checkpointMode = value => (
    <>
      {value.map(item => (
        <div className={styles['detail-point-style']} key={item.id}>
          {item.examMethodName}
        </div>
      ))}
    </>
  );

  render() {
    const {
      loading,
      dispatch,
      platCapaDoubleCheck: {
        searchForm = {},
        total = 0,
        dataSource = [],
        doubleCheckDetail2 = {},
        capaLevelNameList2 = [],
        twCapaSetlevelTypeName2 = [],
        detailPageConfig = {},
        resDataSource = [],
        resTotal = 0,
      },
    } = this.props;

    const { renewType, capacName, endDate, startDate } = doubleCheckDetail2;

    const { pageBlockViews = [] } = detailPageConfig;
    let columns = [];
    let searchKeyBox = [];
    let searchBarForms = [];
    if (pageBlockViews && pageBlockViews.length > 0) {
      const { pageFieldViews = [] } = pageBlockViews[0];

      columns = pageFieldViews
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj)
        .map(item => {
          const { displayName, fieldKey } = item;
          const columnsItem = {
            title: displayName,
            dataIndex: fieldKey,
            align: 'center',
          };
          if (fieldKey === 'resStatus') {
            columnsItem.dataIndex = 'resStatusName';
          }
          if (fieldKey === 'buId') {
            columnsItem.dataIndex = 'buName';
          }
          if (fieldKey === 'renewResStatus') {
            columnsItem.dataIndex = 'renewResStatusName';
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

        if (fieldKey === 'resId') {
          searchBar.tag = (
            <Selection.Columns
              source={selectUsersWithBu}
              columns={[
                { dataIndex: 'code', title: '编号', span: 14 },
                { dataIndex: 'name', title: '名称', span: 10 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择资源"
              showSearch
            />
          );
        }

        if (fieldKey === 'buId') {
          searchBar.tag = <Selection.ColumnsForBu />;
        }

        if (fieldKey === 'renewResStatus') {
          searchBar.tag = (
            <Selection.UDC code="RES:RENEW_RES_STATUS" placeholder="请选择复核状态" />
          );
        }

        if (fieldKey === 'resStatus') {
          searchBar.tag = <Selection.UDC code="RES:RES_STATUS" placeholder="请选择资源状态" />;
        }

        return searchBar;
      });
    }

    const resTableProps = {
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      showColumn: false,
      showExport: false,
      loading: loading.effects[`${DOMAIN}/queryRes`],
      total: resTotal,
      dataSource: resDataSource,
      onChange: filters => {
        this.fetchResData(filters);
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
      searchBarForm: [...searchBarForms],
      leftButtons: [
        {
          key: 'cancel',
          className: 'tw-btn-primary',
          title: '取消复核',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows || (selectedRows && selectedRows.length === 0),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/cancelRes`,
              payload: {
                ids: selectedRowKeys.join(','),
              },
            });
          },
        },
      ],
      columns: [...columns],
    };

    const checkPointTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/queryDoubleCheckDetailHandle`],
      dataSource: capaLevelNameList2,
      pagination: false,
      bordered: true,
      columns: [
        {
          title: '考核点',
          dataIndex: 'examPoint',
          align: 'center',
        },
        {
          title: '考核方式',
          dataIndex: 'examMethodName',
          align: 'center',
        },
      ],
    };

    const capaSetCheckPointTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/queryDoubleCheckDetailHandle`],
      dataSource: twCapaSetlevelTypeName2,
      pagination: false,
      bordered: true,
      columns: [
        {
          title: '单项能力',
          dataIndex: 'capaName',
          align: 'center',
        },
        {
          title: '分类',
          dataIndex: 'capaType',
          align: 'center',
        },
        {
          title: '单项能力描述',
          dataIndex: 'capaLevelDesc',
          align: 'center',
        },
        {
          title: '考核点',
          dataIndex: 'twLevelCapaAbilityView',
          align: 'center',
          render: (value, row, index) => this.checkpointName(value),
        },
        {
          title: '考核方式',
          dataIndex: 'twLevelCapaAbilityView',
          align: 'center',
          render: (value, row, index) => this.checkpointMode(value),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="复核详情">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card title="复核详情" className="tw-card-adjust" bordered={false}>
          <div>
            <Row>
              <Col span={6}>
                {renewType}
                &nbsp;&nbsp;
                <span className={styles['capa-name']}>{capacName}</span>
              </Col>
              <Col span={6}>
                复核截止日期&nbsp;&nbsp;
                <span className={styles['capa-name']}>{endDate}</span>
              </Col>
              <Col span={6}>
                复核发起日期&nbsp;&nbsp;
                <span className={styles['capa-name']}>{startDate}</span>
              </Col>
            </Row>
          </div>
          <Divider dashed />
          <div className={styles['table-clear-padding']}>
            <div className={styles.title}>考核点</div>
            {renewType === '单项能力' ? (
              <Table {...checkPointTableProps} />
            ) : (
              <Table {...capaSetCheckPointTableProps} />
            )}
          </div>
          <Divider dashed />
          <div>
            <div className={styles.title}>复核资源</div>
            <DataTable {...resTableProps} />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DoubleCheckDetail;
