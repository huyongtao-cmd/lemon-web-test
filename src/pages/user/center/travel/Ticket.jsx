import React from 'react';
import { connect } from 'dva';
import { Button, Card, DatePicker, Input, InputNumber } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import update from 'immutability-helper';
import moment from 'moment';
import classnames from 'classnames';

import { selectUsers } from '@/services/sys/user';
import { genFakeId } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto, markAsTab, mountToTab, injectUdc } from '@/layouts/routerControl';
import { UdcSelect } from '@/pages/gen/field';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import { createAlert } from '@/components/core/Confirm';
import { queryUdc } from '@/services/gen/app';

const DOMAIN = 'userTravelTicket'; // 自己替换

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 行政订票
 */
@connect(({ loading, userTravelTicket }) => ({
  loading,
  ...userTravelTicket, // 代表与该组件相关redux的model
}))
@injectUdc(
  {
    ticketExpTypeList: 'ACC.TICKET_EXP_TYPE',
    vehicleList: 'ACC.TICKET_VEHICLE',
    placeList: 'COM:CITY',
    ticketChannelList: 'ACC:TICKET_CHANNEL',
  },
  DOMAIN
)
@mountToTab()
class AdminTicket extends React.PureComponent {
  /**
   * 页面内容加载之前要做的事情放在这里
   */
  // eslint-disable-next-line
  constructor(props) {
    super(props);
    // this.setState({});
  }

  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    // 明细ID + 申请人ID
    if (!!param.applyId && !!param.resId) {
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

  // --------------- 剩下的私有函数写在这里 -----------------

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dispatch, dataList } = this.props;
    const val = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    // console.log('rowIndex, rowField, val ->', rowIndex, rowField, val);
    // 更新单元格状态
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList: update(dataList, {
          [rowIndex]: {
            [rowField]: {
              $set: val,
            },
          },
        }),
      },
    });
  };

  // 保存
  handleSave = () => {
    const { dispatch, dataList } = this.props;

    if (dataList.length <= 0) {
      createMessage({ type: 'error', description: '请至少填写一条记录。' });
      return;
    }
    // 校验必填字段
    const requiredFiled = dataList.filter(
      item =>
        !item.ticketExpType ||
        !item.vehicle ||
        !item.fromPlace ||
        !item.toPlace ||
        !item.tripResId ||
        !item.tripDate ||
        !item.timespan ||
        !item.vehicleNo ||
        !item.expAmt
    );
    if (requiredFiled.length) {
      return;
    }

    // const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/save`,
    }).then(success => {
      const { sourceUrl, applyId, prcId, taskId, from } = fromQs();
      // 明细ID + 申请人ID
      // success && closeThenGoto(`/user/center/travel/edit?id=${param.applyId}`);
      const busiUrl =
        '/user/center/travel/detail?id=' +
        applyId +
        '&prcId=' +
        (prcId || '') +
        '&taskId=' +
        (taskId || '') +
        '&mode=edit'; // 从出差申请审批流程-行政订票节点（出差申请详情页 ）跳转过来的url
      success && closeThenGoto(busiUrl);
    });
  };

  deleteItem = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/deleteRow`,
      payload: { id },
    }).then(success => {
      if (success) {
        createAlert.success({
          content: '删除成功。',
        });
        this.fetchData();
      } else {
        createAlert.error({
          content: '删除失败。',
        });
      }
    });
  };

  getTableProps = () => {
    const { dispatch, dataList, delList } = this.props;
    const { _udcMap = {} } = this.state;
    const {
      ticketExpTypeList = [],
      vehicleList = [],
      placeList = [],
      ticketChannelList = [],
    } = _udcMap;

    return {
      rowKey: 'id',
      scroll: { x: 1800 },
      loading: false,
      pagination: false,
      dataSource: dataList,
      total: dataList.length || 0,
      showCopy: false,
      onAdd: newRow => {
        const genId = genFakeId(-1);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: update(dataList, {
              $push: [
                {
                  ...newRow,
                  id: genId,
                },
              ],
            }),
          },
        });
        return genId;
      },
      onSave: (rowForm, record, index) => {
        // console.log('rowForm, record, index ->', rowForm, record, index);
        let isValid = false;
        rowForm.validateFields((error, row) => {
          if (error) {
            createMessage({ type: 'error', description: '行编辑未通过，请检查输入项。' });
            return;
          }
          // const { dispatch, dataList } = this.props;
          row.planEndDate = formatDT(row.planEndDate); // eslint-disable-line
          row.planStartDate = formatDT(row.planStartDate); // eslint-disable-line
          // 更新单元格状态 - 异步
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataList: update(dataList, {
                [index]: {
                  $merge: row,
                },
              }),
            },
          });
          // 注意 不一定保存成功 但是校验已经可以返回了。
          // 数据保存成功或者失败会提示用户，并且可能会导致表格刷新。
          isValid = true;
        });
        // console.log('isValid ->', isValid);
        return isValid;
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        // console.log('selectedRowKeys ->', selectedRowKeys);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: dataList.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            ),
            delList: [...(delList || []), ...selectedRowKeys.filter(keyValue => keyValue > 0)],
          },
        });
      },
      columns: [
        {
          title: '费用类型',
          dataIndex: 'ticketExpType',
          align: 'center',
          width: 120,
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请输入费用类型!',
              },
            ],
          },
          render: (value, row, index) => (
            <AsyncSelect
              value={value}
              source={ticketExpTypeList}
              placeholder="TICKET_EXP_TYPE"
              onChange={this.onCellChanged(index, 'ticketExpType')}
            />
          ),
        },
        {
          title: '报销状态',
          dataIndex: 'reimbursementStatusDesc',
          align: 'center',
        },
        {
          title: '购票渠道',
          dataIndex: 'ticketPurchasingChannel',
          align: 'center',
          required: true,
          width: 120,
          options: {
            rules: [
              {
                required: true,
                message: '请选择购票渠道',
              },
            ],
          },
          render: (value, row, index) => (
            <AsyncSelect
              value={value}
              source={ticketChannelList}
              placeholder="请选择购票渠道"
              onChange={this.onCellChanged(index, 'ticketPurchasingChannel')}
            />
          ),
        },
        {
          title: '交通工具',
          dataIndex: 'vehicle',
          align: 'center',
          required: true,
          width: 100,
          options: {
            rules: [
              {
                required: true,
                message: '请选择交通工具',
              },
            ],
          },
          render: (value, row, index) => (
            <AsyncSelect
              value={value}
              source={vehicleList}
              placeholder="请选择交通工具"
              onChange={this.onCellChanged(index, 'vehicle')}
            />
          ),
        },
        {
          title: '出发地',
          dataIndex: 'fromPlace',
          align: 'center',
          editable: true,
          required: true,
          width: 100,
          options: {
            rules: [
              {
                required: true,
                message: '请选择出发地',
              },
            ],
          },
          render: (value, row, index) => (
            <AsyncSelect
              value={value}
              source={placeList}
              placeholder="请选择出发地"
              showSearch
              filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              onChange={this.onCellChanged(index, 'fromPlace')}
            />
          ),
        },
        {
          title: '目的地',
          dataIndex: 'toPlace',
          align: 'center',
          editable: true,
          required: true,
          width: 100,
          options: {
            rules: [
              {
                required: true,
                message: '请选择目的地',
              },
            ],
          },
          render: (value, row, index) => (
            <AsyncSelect
              value={value}
              source={placeList}
              placeholder="请选择目的地"
              showSearch
              filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              onChange={this.onCellChanged(index, 'toPlace')}
            />
          ),
        },
        {
          title: '出差人',
          dataIndex: 'tripResId',
          align: 'center',
          required: true,
          width: 100,
          options: {
            rules: [
              {
                required: true,
                message: '请输入出差人',
              },
            ],
          },
          render: (value, row, index) => (
            <AsyncSelect
              source={() => selectUsers().then(resp => resp.response)}
              placeholder="请选择出差人"
              showSearch
              value={value}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={this.onCellChanged(index, 'tripResId')}
            />
          ),
        },
        {
          title: '出差日期',
          dataIndex: 'tripDate',
          align: 'center',
          editable: true,
          required: true,
          width: 150,
          options: {
            rules: [
              {
                required: true,
                message: '请输入出差日期',
              },
            ],
          },
          render: (value, row, index) => (
            <DatePicker
              placeholder="出差日期"
              format="YYYY-MM-DD"
              className="x-fill-100"
              value={row.tripDate ? moment(row.tripDate) : null}
              onChange={this.onCellChanged(index, 'tripDate')}
            />
          ),
        },
        {
          title: '时间',
          dataIndex: 'timespan',
          align: 'center',
          editable: true,
          required: true,
          width: 340,
          options: {
            rules: [
              {
                required: true,
                message: '请输入时间',
              },
            ],
          },
          render: (value, row, index) => (
            <Input
              placeholder="请输入时间段"
              defaultValue={value}
              onBlur={this.onCellChanged(index, 'timespan')}
            />
          ),
        },
        {
          title: '车次/航班号',
          dataIndex: 'vehicleNo',
          align: 'center',
          width: 200,
          editable: true,
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请输入车次/航班号',
              },
            ],
          },
          render: (value, row, index) => (
            <Input
              placeholder="车次/航班号"
              defaultValue={value}
              onBlur={this.onCellChanged(index, 'vehicleNo')}
            />
          ),
        },
        {
          title: '金额',
          dataIndex: 'expAmt',
          align: 'center',
          width: 200,
          editable: true,
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请输入金额',
              },
            ],
          },
          render: (value, row, index) => (
            <InputNumber
              className="x-fill-100"
              placeholder="请输入金额"
              defaultValue={value}
              onBlur={this.onCellChanged(index, 'expAmt')}
            />
          ),
        },
        {
          title: '订票日期',
          dataIndex: 'bookingDate',
          align: 'center',
          editable: true,
          width: 150,
          render: (value, row, index) => (
            <DatePicker
              placeholder="订票日期"
              format="YYYY-MM-DD"
              className="x-fill-100"
              value={row.bookingDate ? moment(row.bookingDate) : null}
              onChange={this.onCellChanged(index, 'bookingDate')}
            />
          ),
        },
        {
          title: '订票人',
          dataIndex: 'bookingResId',
          align: 'center',
          editable: true,
          width: 120,
          render: (value, row, index) => (
            <AsyncSelect
              source={() => selectUsers().then(resp => resp.response)}
              placeholder="请选择订票人"
              showSearch
              value={value}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={this.onCellChanged(index, 'bookingResId')}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'center',
          editable: true,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              placeholder="请输入备注"
              onBlur={this.onCellChanged(index, 'remark')}
            />
          ),
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

    const { sourceUrl, applyId, prcId, taskId, from } = fromQs();
    const busiUrl =
      '/user/center/travel/detail?id=' +
      applyId +
      '&prcId=' +
      (prcId || '') +
      '&taskId=' +
      (taskId || '') +
      '&mode=edit'; // 从出差申请审批流程-行政订票节点（出差申请详情页 ）跳转过来的url

    const disabledBtn = loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`];

    return (
      <PageHeaderWrapper title="行政订票">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto(busiUrl)}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <EditableDataTable {...this.getTableProps()} />
      </PageHeaderWrapper>
    );
  }
}

export default AdminTicket;
