import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card } from 'antd';
import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import router from 'umi/router';

const { Description } = DescriptionList;

const DOMAIN = 'communicateDetail';
@connect(({ loading, communicateDetail, dispatch }) => ({
  loading,
  communicateDetail,
  dispatch,
}))
@mountToTab()
class CommunicateDetail extends PureComponent {
  componentWillMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        detailFormData: {},
        detailExamPlanList: [],
        detailExamPlanTotal: 0,
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
      },
    });

    dispatch({
      type: `${DOMAIN}/queryDetailExamPlanList`,
      payload: {
        offset: 0,
        limit: 10,
        sortBy: 'id',
        sortDirection: 'DESC',
        performanceCommunicateId: id,
      },
    });
  }

  // 查看考核计划
  handleSubmit = () => {};

  render() {
    const {
      loading,
      communicateDetail: {
        detailFormData,
        detailExamPlanList,
        detailExamPlanTotal,
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
    const examRoleProps = {
      sortBy: 'apprResId',
      rowKey: 'key',
      sortDirection: 'DESC',
      showColumn: false,
      loading: loading.effects[`${DOMAIN}/queryDetail`],
      dataSource: communicateList,
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
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
    };

    const examPlanProps = {
      rowKey: 'docId',
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/queryDetailexamPlanList`],
      total: detailExamPlanTotal,
      columnsCache: DOMAIN,
      dataSource: detailExamPlanList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '被考核人',
          dataIndex: 'resName',
          align: 'center',
        },
        {
          title: '沟通进度',
          dataIndex: 'communicateStatusName',
          align: 'center',
        },
        {
          title: '查看沟通流程',
          align: 'center',
          render: (value, row, key) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const { communicateType } = fromQs();
            const href = `/hr/prefMgmt/communicate/checkExamContent?id=${
              row.id
            }&communicateType=${communicateType}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                查看
              </Link>
            );
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            size="large"
            onClick={() => {
              const { performanceExamId } = detailFormData;
              router.push(
                `/hr/prefMgmt/communicate/communicatePlanFlowDetail?id=${performanceExamId}&performanceExamContentType=CREATE`
              );
            }}
          >
            查看考核计划
          </Button>
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
          title={<Title icon="profile" text="绩效考核沟通" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="考核名称">{detailFormData.performanceExamName || ''}</Description>
            <Description term="可查看被考核人意见">
              {detailFormData.assessedVisible === 1 ? '是' : '否'}
            </Description>
            <Description term="发起人">{detailFormData.applyResName || ''}</Description>
            <Description term="发起时间">{detailFormData.applyDate || ''}</Description>
            <Description term="备注">{detailFormData.remark || ''}</Description>
          </DescriptionList>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="沟通参与角色" />}
          bordered={false}
        >
          <DescriptionList size="large" col={1}>
            <DataTable {...examRoleProps} />
          </DescriptionList>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="绩效考核沟通明细" />}
          bordered={false}
        >
          <DescriptionList size="large" col={1}>
            <DataTable {...examPlanProps} />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CommunicateDetail;
