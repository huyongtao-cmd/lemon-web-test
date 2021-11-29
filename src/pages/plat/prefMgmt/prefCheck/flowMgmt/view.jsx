import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Divider, Tooltip } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';

const { Description } = DescriptionList;

const DOMAIN = 'prefCheckFlow';

@connect(({ loading, prefCheckFlow, dispatch }) => ({
  loading,
  prefCheckFlow,
  dispatch,
}))
@mountToTab()
class PrefCheckFlowView extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id, _refresh } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        detailFormData: {},
        detailExamResList: [],
        detailExamResTotal: 0,
        pageConfig: {},
      },
    });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PERFORMANCE_EXAM_DETAIL' },
    });
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });
    !(_refresh === '0') &&
      this.fetchData({
        offset: 0,
        limit: 10,
        sortBy: 'id',
        sortDirection: 'DESC',
      });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        pageConfig: {},
      },
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/queryDetailExamResList`, payload: { ...params, id } });
  };

  render() {
    const {
      loading,
      prefCheckFlow: {
        detailFormData,
        detailExamResList,
        detailExamResTotal,
        pointentityList,
        pageConfig,
      },
    } = this.props;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const examResTableProps = {
      sortBy: 'id',
      rowKey: 'resId',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/queryDetailExamResList`],
      total: detailExamResTotal,
      dataSource: detailExamResList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        pageFieldJson.resId.visibleFlag && {
          title: `${pageFieldJson.resId.displayName}`,
          dataIndex: 'resName',
          align: 'center',
          sortNo: `${pageFieldJson.resId.sortNo}`,
          render: (value, row, index) => `${row.abNo}-${row.foreignName}-${row.resName}`,
        },
        pageFieldJson.buId.visibleFlag && {
          title: `${pageFieldJson.buId.displayName}`,
          dataIndex: 'buName',
          align: 'center',
          sortNo: `${pageFieldJson.buId.sortNo}`,
        },
        pageFieldJson.coopType.visibleFlag && {
          title: `${pageFieldJson.coopType.displayName}`,
          dataIndex: 'coopTypeDesc',
          align: 'center',
          sortNo: `${pageFieldJson.coopType.sortNo}`,
        },
        pageFieldJson.resType.visibleFlag && {
          title: `${pageFieldJson.resType.displayName}`,
          dataIndex: 'resTypeName',
          align: 'center',
          sortNo: `${pageFieldJson.resType.sortNo}`,
        },
        pageFieldJson.enrollDate.visibleFlag && {
          title: `${pageFieldJson.enrollDate.displayName}`,
          dataIndex: 'enrollDate',
          align: 'center',
          sortNo: `${pageFieldJson.enrollDate.sortNo}`,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
    };

    const pointentityListTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: false,
      dataSource: pointentityList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '考核点来源',
          dataIndex: 'pointSourceName',
          align: 'center',
        },
        {
          title: '考核点',
          dataIndex: 'pointUdcName',
          align: 'center',
        },
        {
          title: '评分类型',
          dataIndex: 'poinTypeName',
          align: 'center',
        },
        {
          title: '权重',
          dataIndex: 'weight',
          align: 'center',
          render: (value, row, index) =>
            row.poinType === '2' || row.poinType === '3' ? null : `${value}%`,
        },
        {
          title: '评分标准',
          dataIndex: 'standardDesc',
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
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="绩效考核详情" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="考核名称">{detailFormData.examName || ''}</Description>
            <Description term="考核周期">{detailFormData.examCycleName || ''}</Description>
            <Description term="考核期间">
              {`${detailFormData.examPeriodStart || ''}-${detailFormData.examPeriodEnd || ''}`}
            </Description>
            <Description term="分数下限/上限">
              {`${detailFormData.scoreMin || 0} ~ ${detailFormData.scoreMax || 0}`}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="考核结果等级">{detailFormData.gradeCheck || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="考核评定">{detailFormData.examEval || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="考核结果审批人">{detailFormData.examCfm || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="可查看考核明细">{detailFormData.examCheck || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="考核说明">
              <pre>{detailFormData.examDesc || ''}</pre>
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="考核点" size="large" col={1}>
            <DataTable {...pointentityListTableProps} />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="考核资源" size="large" col={1}>
            <DataTable {...examResTableProps} />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckFlowView;
