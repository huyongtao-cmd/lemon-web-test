import React from 'react';
import { connect } from 'dva';
import { Button, Card, Table, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import classnames from 'classnames';
import { isNil, isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { fromQs } from '@/utils/stringUtils';
import { pushFlowTask } from '@/services/gen/flow';
import { getUrl } from '@/utils/flowToRouter';

const DOMAIN = 'userTravelView';
const { Description } = DescriptionList;
const TASK_FLOW_POINT = 'ACC_A23_01_TRAVEL_SUBMIT_i';
const TASK_BOOKING = 'ACC_A23_04_BOOKING_b';
const TASK_BOOKING_NEW = 'ACC_A23_05_BOOKING_b'; // 由于插入老一个新节点，老的 TASK_BOOKING 排序后移，04 -> 05

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 出差申请新增/编辑
 */
@connect(({ loading, userTravelView, user }) => ({
  loading,
  ...userTravelView,
  user: user.user,
}))
@mountToTab()
class TaskEdit extends React.PureComponent {
  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });

      dispatch({
        type: `${DOMAIN}/queryTravelDels`,
        payload: { id: param.id },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/clean`,
      });
    }
  }

  getTableProps = () => {
    const { loading, ticketList, ticketTotal } = this.props;
    return {
      rowKey: 'id',
      // scroll: { x: 1300 },
      loading: loading.effects[`${DOMAIN}/queryTicketList`],
      pagination: false,
      dataSource: ticketList,
      total: ticketTotal || 0,
      columns: [
        {
          title: '费用类型',
          dataIndex: 'ticketExpTypeDesc',
          align: 'center',
          width: 100,
        },
        {
          title: '报销状态',
          dataIndex: 'reimbursementStatusDesc',
          align: 'center',
          width: 90,
        },
        {
          title: '购票渠道',
          dataIndex: 'ticketPurchasingChannelDesc',
          align: 'center',
          width: 90,
        },
        {
          title: '交通工具',
          dataIndex: 'vehicleDesc',
          align: 'center',
          width: 90,
        },
        {
          title: '出发地',
          dataIndex: 'fromPlaceDesc',
          align: 'center',
          width: 100,
        },
        {
          title: '目的地',
          dataIndex: 'toPlaceDesc',
          align: 'center',
          width: 100,
        },
        {
          title: '出差人',
          dataIndex: 'tripResName',
          align: 'center',
          width: 100,
        },
        {
          title: '出差日期',
          dataIndex: 'tripDate',
          align: 'center',
          width: 120,
        },
        {
          title: '时间',
          dataIndex: 'timespan',
          align: 'center',
        },
        {
          title: '车次/航班号',
          dataIndex: 'vehicleNo',
          align: 'center',
        },
        {
          title: '金额',
          dataIndex: 'expAmt',
          align: 'center',
        },
        {
          title: '订票日期',
          dataIndex: 'bookingDate',
          align: 'center',
          width: 120,
        },
        {
          title: '订票人',
          dataIndex: 'bookingResName',
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'center',
        },
      ],
    };
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const { loading, dispatch, formData, fieldsConfig, dataList, flowForm } = this.props;
    // 我的申请跳入时，会带入
    const { sourceUrl, id, taskId, prcId, from } = fromQs();

    const tableProps = {
      rowKey: 'id',
      // scroll: { x: 1600 },
      bordered: true,
      loading: loading.effects[`${DOMAIN}/queryTravelDels`],
      pagination: false,
      dataSource: dataList,
      total: dataList.length || 0,
      columns: [
        {
          title: '出差人',
          dataIndex: 'tripResName',
          key: 'tripResName',
          className: 'text-center',
        },
        {
          title: '出发地',
          dataIndex: 'fromPlaceDesc',
          key: 'fromPlace',
          className: 'text-center',
        },
        {
          title: '目的地',
          dataIndex: 'toPlaceDesc',
          key: 'toPlace',
          className: 'text-center',
        },
        {
          title: '交通工具',
          dataIndex: 'vehicleDesc',
          key: 'vehicle',
          className: 'text-center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          key: 'remark',
          className: 'text-center',
        },
        {
          title: '出发日期',
          dataIndex: 'beginDate',
          key: 'beginDate',
          className: 'text-center',
        },
        {
          title: '出发时间段',
          dataIndex: 'beginTimespan',
          key: 'beginTimespan',
          className: 'text-center',
        },
        // {
        //   title: '结束日期',
        //   dataIndex: 'endDate',
        //   key: 'endDate',
        //   className: 'text-center',
        // },
        // {
        //   title: '结束时间段',
        //   dataIndex: 'endTimespan',
        //   key: 'endTimespan',
        //   className: 'text-center',
        // },
      ],
      buttons: [],
    };

    return (
      <PageHeaderWrapper title="任务包信息">
        <BpmWrapper
          fieldsConfig={fieldsConfig} // 获取json文件配置信息
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark } = bpmForm; // 重新提交修改意见
            const { taskKey } = fieldsConfig;
            const { key, branches } = operation;
            if (taskKey === TASK_FLOW_POINT) {
              closeThenGoto(`/user/center/travel/edit?id=${id}&apprId=${taskId}&remark=${remark}`);
              return Promise.resolve(false);
            }
            if (key === 'BOOKING') {
              // 行政订票节点点击录入订票详情，立即跳转行政订票列表修改页，不推流程
              const thisUrl = `/user/center/travel/ticket?resId=${formData.applyResId}&applyId=${
                formData.id
              }&id=${id}&prcId=${prcId}&taskId=${taskId}&mode=&{model}`;
              closeThenGoto(thisUrl);
              return Promise.resolve(false);
            }
            if (key === 'BOOKINGVIEW') {
              // 行政订票 在 费用承担BU负责人/上级领导 或者 项目经理审批 这两个节点的时候， 可以跳转过去查看行政订票
              const thisUrl = `/user/center/travel/ticketDetail?resId=${
                formData.applyResId
              }&applyId=${formData.id}&from=${encodeURIComponent(getUrl())}`;
              closeThenGoto(thisUrl);
              return Promise.resolve(false);
            }
            if (
              key === 'APPROVED' &&
              (taskKey === TASK_BOOKING || taskKey === TASK_BOOKING_NEW) &&
              formData.apprStatus === 'APPROVING'
            ) {
              // 行政订票节点点击同意，推动流程，然后立即跳转行政订票列表页
              // 判断 branches 是因为有新老流程的差别，新流程有，老流程没有。当有的时候，
              return pushFlowTask(taskId, {
                remark,
                result: key,
                branch: !isNil(branches) ? 'APPROVED' : undefined,
              }).then(({ status, response }) => {
                if (status === 200) {
                  const thisUrl = `/user/center/travel/ticketDetail?resId=${
                    formData.applyResId
                  }&applyId=${formData.id}&isMy=8`;
                  closeThenGoto(thisUrl);
                }
                return Promise.resolve(false);
              });
            }
            return Promise.resolve(true);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              onClick={() => {
                router.push(
                  markAsTab(
                    `/user/center/travel/ticketDetail?resId=${formData.applyResId}&applyId=${
                      formData.id
                    }&isMy=8&sourceUrl=${sourceUrl || ''}`
                  )
                );
              }}
            >
              查看订票详情
            </Button>

            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() =>
                sourceUrl ? closeThenGoto(sourceUrl) : closeThenGoto(`/plat/adminMgmt/travelapply`)
              }
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>

          <Card className="tw-card-adjust" bordered={false} title="出差申请">
            <DescriptionList title="出差申请查询" size="large" col={2} hasSeparator>
              <Description term="出差单号">{formData.applyNo}</Description>
              <Description term="出差名称">{formData.applyName}</Description>
              <Description term="出差申请人">{formData.applyResName}</Description>
              <Description term="申请日期">
                {formData.applyDate
                  ? formatDT(formData.applyDate, 'YYYY-MM-DD')
                  : formData.applyDate}
              </Description>
              {/* <Description term="项目号">{formData.projNo}</Description> */}
              <Description term="项目名称">{formData.projName}</Description>
              {/* <Description term="任务包号">{formData.taskNo}</Description> */}
              <Description term="任务名称">{formData.taskName}</Description>
              <Description term="承担费用BU">{formData.buName}</Description>
              <Description term="费用所属公司">{formData.ouName}</Description>
              <Description term="出发-结束日期">
                {formData.beginDate && formData.endDate
                  ? [formData.beginDate, formData.endDate].join('-')
                  : null}
              </Description>
              <Description term="天数">{formData.days}</Description>
              <Description term="费用承担方">{formData.expenseByTypeDesc}</Description>
              <Description term="客户名称">{formData.custName}</Description>
              <Description term="是否行政订票">{formData.bookTicketFlag ? '是' : '否'}</Description>
              <Description term="费用码">{formData.feeCodeDesc}</Description>
              <Description term="申请状态">{formData.apprStatusName}</Description>
              <Description term="备注">{formData.remark}</Description>
            </DescriptionList>

            <div className="tw-card-title">出差人明细信息</div>
            <div style={{ margin: 12 }}>
              <Table {...tableProps} />
            </div>
            {!isEmpty(fieldsConfig) &&
              (fieldsConfig.taskKey.includes('PM_CONFIRM_b') ||
                fieldsConfig.taskKey.includes('BU_CONFIRM_b')) && (
                <>
                  <Divider dashed />
                  <div className="tw-card-title">订票信息</div>
                  <div style={{ margin: 12 }}>
                    <Table {...this.getTableProps()} />
                  </div>
                </>
              )}
          </Card>
          {/* <Card className="tw-card-adjust" bordered={false} title="出差人明细信息">
            <Table {...tableProps} />

          </Card> */}
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A23' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default TaskEdit;
