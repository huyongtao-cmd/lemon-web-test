import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Card, Divider, Tooltip } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { FileManagerEnhance } from '@/pages/gen/field';
import DescriptionList from '@/components/layout/DescriptionList';
import DetailEntityTable from './table/DetailEntityTable';
import { sub } from '@/utils/mathUtils';

const { Description } = DescriptionList;

const DOMAIN = 'vacationApply';

@connect(({ loading, vacationApply, dispatch }) => ({
  loading,
  vacationApply,
  dispatch,
}))
@mountToTab()
class ViewDetail extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {
          resVacationApply: { detailViewList: [] },
          recentResVacationList: [],
          resVacationList: [],
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });
  }

  render() {
    const {
      loading,
      dispatch,
      vacationApply: {
        formData: { resVacationApply, recentResVacationList, resVacationList },
      },
    } = this.props;
    const { detailViewList } = resVacationApply;

    const resVacationTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: false,
      dataSource: resVacationList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableDoubleClick: false,
      rowSelection: {
        type: 'radio',
        selectedRowKeys: [resVacationApply.vacationId] || [],
        onChange: () => {},
        getCheckboxProps: record => ({
          disabled: true,
        }),
      },
      columns: resVacationApply.enabledFlag
        ? [
            {
              title: '年度',
              dataIndex: 'vacationYear',
              align: 'center',
            },
            {
              title: '年度',
              dataIndex: 'vacationYear',
              align: 'center',
            },
            {
              title: '假期类型',
              dataIndex: 'vacationTypeName',
              align: 'center',
            },
            {
              title: '起始日期',
              dataIndex: 'startDate',
              align: 'center',
            },
            {
              title: '截止日期',
              dataIndex: 'endDate',
              align: 'center',
            },
            {
              title: '有效期',
              dataIndex: 'expirationDate',
              align: 'center',
            },
            {
              title: '总天数',
              dataIndex: 'totalDays',
              align: 'center',
            },
            {
              title: '已用天数',
              dataIndex: 'usedDays',
              width: 100,
              align: 'center',
            },
            {
              title: '可用天数',
              dataIndex: 'canUsedDays',
              align: 'center',
              render: (value, row, index) => sub(row.totalDays, row.usedDays).toFixed(1),
            },
            {
              title: '备注',
              dataIndex: 'remark',
              render: (value, row, index) => <pre>{value}</pre>,
            },
          ]
        : [
            {
              title: '年度',
              dataIndex: 'vacationYear',
              align: 'center',
            },
            {
              title: '假期类型',
              dataIndex: 'vacationTypeName',
              align: 'center',
            },
            {
              title: '起始日期',
              dataIndex: 'startDate',
              align: 'center',
              render: value => moment(value).format('YYYY-MM-DD'),
            },
            {
              title: '截止日期',
              dataIndex: 'endDate',
              align: 'center',
              render: value => moment(value).format('YYYY-MM-DD'),
            },
            {
              title: '有效期',
              dataIndex: 'expirationDate',
              align: 'center',
              render: value => moment(value).format('YYYY-MM-DD'),
            },
            {
              title: '总数',
              dataIndex: 'totalDays',
              align: 'center',
            },
            {
              title: '已用',
              dataIndex: 'usedDays',
              align: 'center',
            },
            {
              title: '可用',
              dataIndex: 'availableDays',
              align: 'center',
              render: (value, row, index) =>
                sub(sub(row.totalDays, row.usedDays), row.frozenDay).toFixed(1),
            },
            {
              title: '未开放',
              dataIndex: 'frozenDay',
              align: 'center',
            },
          ],
    };

    const detailViewTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: false,
      dataSource: detailViewList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '请假月份',
          dataIndex: 'vacationYear',
          align: 'center',
        },
        {
          title: '请假日期',
          dataIndex: 'vacationTypeName',
          align: 'center',
        },
        {
          title: '请假天数',
          dataIndex: 'startDate',
          align: 'center',
        },
      ],
    };

    const recentResVacationTableProps = {
      sortBy: 'id',
      rowKey: 'detailId',
      sortDirection: 'DESC',
      loading: false,
      dataSource: recentResVacationList,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      // pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '请假单号',
          dataIndex: 'applyNo',
          align: 'center',
        },
        {
          title: '休假日期',
          dataIndex: 'detailVDate',
          align: 'center',
        },
        {
          title: '假期类型',
          dataIndex: 'vacationTypeDesc',
          align: 'center',
        },
        {
          title: '休假天数',
          dataIndex: 'detailVDays',
          align: 'center',
        },
        {
          title: '事由',
          dataIndex: 'reason',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <span>{`${value.substr(0, 15)}...`}</span>
              </Tooltip>
            ) : (
              <span>{value}</span>
            ),
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={
            <Title icon="profile" id="ui.menu.plat.vacation.view" defaultMessage="请假申请详情" />
          }
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="请假单号">{resVacationApply.applyNo || ''}</Description>
            <Description term="请假人">{resVacationApply.apprResName || ''}</Description>
            <Description term="BaseBU">{resVacationApply.buName || ''}</Description>
            <Description term="直属领导">{resVacationApply.presName || ''}</Description>
            <Description term="所属公司">{resVacationApply.ouName || ''}</Description>
            <Description term="假期类型">{resVacationApply.vacationTypeDesc || ''}</Description>
            <Description term="请假开始/结束日期">
              {resVacationApply.startDate || ''}
              {resVacationApply.endDate ? '~' : ''}
              {resVacationApply.endDate || ''}
            </Description>
            <Description term="请假天数">{resVacationApply.vacationDays || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large">
            <Description term="附件">
              <FileManagerEnhance
                api="/api/person/v1/vacationApply/sfs/token"
                dataKey={resVacationApply.id}
                listType="text"
                preview
              />
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="请假事由">
              <pre>{resVacationApply.reason || ''}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="工作安排">
              <pre>{resVacationApply.workPlan || ''}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="申请人">{resVacationApply.apprResName || ''}</Description>
            <Description term="申请日期">{resVacationApply.apprDate || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="休假后补充清单">
              {resVacationApply.addFlag === '1' && <pre>有</pre>}
              {resVacationApply.addFlag === '0' && <pre>无</pre>}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="补充附件清单">
              <pre>{resVacationApply.addList || ''}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList size="large">
            <Description term="补充附件">
              <FileManagerEnhance
                api="/api/person/v1/vacationApply/supply/sfs/token"
                dataKey={resVacationApply.id}
                listType="text"
                preview
              />
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="请假明细" size="large" col={1}>
            <DetailEntityTable />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="剩余假期" size="large" col={1}>
            <DataTable {...resVacationTableProps} />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="近期休假情况" size="large" col={1}>
            <DataTable {...recentResVacationTableProps} />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ViewDetail;
