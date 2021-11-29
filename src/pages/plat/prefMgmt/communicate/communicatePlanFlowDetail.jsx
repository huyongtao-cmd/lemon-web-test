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

const DOMAIN = 'communicatePlanFlowDetail';

@connect(({ loading, communicatePlanFlowDetail, dispatch }) => ({
  loading,
  communicatePlanFlowDetail,
  dispatch,
}))
@mountToTab()
// 查看工作计划
class communicatePlanFlowDetail extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id, _refresh, performanceExamContentType } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        detailFormData: {},
      },
    });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PERFORMANCE_EXAM_COMMUNICATE_DETAIL' },
    });
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
        performanceExamContentType,
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
      communicatePlanFlowDetail: {
        detailFormData,
        pointentityList,
        gradeEntityList,
        communicateList,
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
    // 考核点
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
          title: '权重',
          dataIndex: 'weight',
          align: 'center',
          render: value => `${value}%`,
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
    const examGradeTableProps = {
      sortBy: 'id',
      rowKey: 'resId',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/queryDetailExamResList`],
      dataSource: gradeEntityList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '等级名称',
          dataIndex: 'gradeName',
          align: 'center',
        },
        {
          title: '得分占比',
          dataIndex: 'gradeCheck',
          align: 'center',
        },
      ],
    };

    const examresTableProps = {
      sortBy: 'id',
      rowKey: 'key',
      sortDirection: 'DESC',
      dataSource: communicateList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        pageFieldJson.relatedRole.visibleFlag && {
          title: `${pageFieldJson.relatedRole.displayName}`,
          dataIndex: 'name',
          align: 'center',
          sortNo: `${pageFieldJson.relatedRole.sortNo}`,
        },
        pageFieldJson.apprResId.visibleFlag && {
          title: `${pageFieldJson.apprResId.displayName}`,
          dataIndex: 'source',
          align: 'center',
          sortNo: `${pageFieldJson.apprResId.sortNo}`,
        },
        {
          title: '权重',
          dataIndex: 'weight',
          align: 'center',
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
          title={<Title icon="profile" text="考核内容" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="考核名称">{detailFormData.examName || ''}</Description>
            <Description term="考核周期">{detailFormData.examCycleName || ''}</Description>

            <Description term="分数下限/上限">
              {`${detailFormData.scoreMin || 0} ~ ${detailFormData.scoreMax || 0}`}
            </Description>
          </DescriptionList>
          {/* <DescriptionList size="large" col={1}>
            <Description term="考核结果审批人">{detailFormData.examCfm || ''}</Description>
          </DescriptionList> */}
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
          <DescriptionList title="考核结果等级" size="large" col={1}>
            <DataTable {...examGradeTableProps} />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="考核评定" size="large" col={1}>
            <DataTable {...examresTableProps} />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default communicatePlanFlowDetail;
