import React from 'react';
import { connect } from 'dva';
import { Button, Card } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { isNil } from 'ramda';

import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';

const DOMAIN = 'userTravelTicketDetail'; // 自己替换

/**
 * 行政订票
 */
@connect(({ loading, userTravelTicketDetail }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...userTravelTicketDetail,
}))
// @mountToTab() // 切换tab页时保存新增的数据
class TicketDetail extends React.PureComponent {
  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    // 明细ID + 申请人ID
    if (param.applyId && param.resId) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
    } else {
      dispatch({
        type: `${DOMAIN}/clean`,
      });
    }
  }

  getTableProps = () => {
    const { loading, dataList, total } = this.props;
    return {
      rowKey: 'id',
      // scroll: { x: 1300 },
      loading,
      pagination: false,
      dataSource: dataList,
      total: total || 0,
      showCopy: false,
      showAdd: false,
      showDelete: false,
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
      buttons: [],
    };
  };

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数(任何this.state和connect中解构的this.props中监听的对象属性修改都会触发这个操作)
   * @return {React.ReactElement}
   */
  render() {
    const { loading, dispatch, dataList } = this.props;
    const { applyId, sourceUrl, resId, isMy, from } = fromQs();
    return (
      <PageHeaderWrapper title="行政订票">
        <Card className="tw-card-rightLine">
          {/* 不要改成===，这里只比较值，不判断类型 */}
          {isMy == 8 && ( // eslint-disable-line
            <Button
              className="tw-btn-primary"
              icon="form"
              size="large"
              disabled={sourceUrl === '/user/center/myTravel' || isMy == 1 || loading} // eslint-disable-line
              onClick={() => {
                if (!isNil(from)) {
                  const { taskId, prcId } = fromQs(from);
                  closeThenGoto(
                    `/user/center/travel/ticket?resId=${resId}&applyId=${applyId}&taskId=${taskId}&prcId=${prcId}`
                  );
                } else
                  closeThenGoto(`/user/center/travel/ticket?resId=${resId}&applyId=${applyId}`);
              }}
            >
              {formatMessage({ id: `misc.update`, desc: '修改' })}
            </Button>
          )}

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              if (!isNil(sourceUrl)) {
                closeThenGoto(
                  '/user/center/travel/detail?id=' + applyId + '&isMy=1&sourceUrl=' + sourceUrl ||
                    ''
                );
              } else if (!isNil(from)) {
                closeThenGoto(from);
              } else {
                closeThenGoto('/user/center/travel/detail?id=' + applyId + '&isMy=1');
              }
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <EditableDataTable {...this.getTableProps()} />
      </PageHeaderWrapper>
    );
  }
}

export default TicketDetail;
