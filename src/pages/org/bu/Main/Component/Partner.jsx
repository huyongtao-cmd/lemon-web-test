import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { DatePicker, Input } from 'antd';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import ReactiveWrapper from '@/components/layout/ReactiveWrapper';
import { formatDT } from '@/utils/tempUtils/DateTime';
// import ModalDemo from '@sys/baseinfo/SubjTemplate/ModalDemo';
import { queryUdc } from '@/services/gen/app';
import { selectUsers } from '@/services/sys/user';

const DOMAIN = 'orgbuPartner';

@connect(({ loading, orgbuPartner }) => ({
  loading,
  orgbuPartner,
}))
class Partner extends PureComponent {
  // state = {
  //   startValue: [],
  //   endValue: [],
  // };

  componentDidMount() {
    const { dispatch, buId } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: buId,
    });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    // const { startValue, endValue } = this.state;
    // if (rowField === 'dateFrom') {
    //   startValue[rowIndex] = rowFieldValue;
    //   this.setState({
    //     startValue,
    //   });
    // } else if (rowField === 'dateTo') {
    //   endValue[rowIndex] = rowFieldValue;
    //   this.setState({
    //     endValue,
    //   });
    // }

    const { dispatch, orgbuPartner } = this.props;
    const { dataList } = orgbuPartner;

    let value = null;
    if (rowField === 'dateFrom' || rowField === 'dateTo') {
      value = formatDT(rowFieldValue);
    } else {
      value = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    }

    const newDataList = update(dataList, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { dataList: newDataList } });
  };

  render() {
    const { dispatch, loading, buId, orgbuPartner } = this.props;
    const { dataList, delList } = orgbuPartner;
    // const { startValue, endValue } = this.state;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      showCopy: false,
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource: dataList,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: update(dataList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  partnerResId: null,
                  partnerStatus: null,
                  distRatio: null,
                  dateFrom: null,
                  dateTo: null,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const delArr = [];
        selectedRowKeys.map(v => v > 0 && delArr.push(v));
        const newDataList = dataList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: newDataList,
            delList: delArr,
          },
        });
      },
      columns: [
        {
          width: 200,
          title: '合伙人',
          dataIndex: 'partnerResId',
          required: true,
          render: (value, row, index) => (
            <AsyncSelect
              value={value ? value + '' : null}
              source={() => selectUsers().then(resp => resp.response)}
              placeholder="合伙人"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={this.onCellChanged(index, 'partnerResId')}
            />
          ),
        },
        {
          title: '状态',
          dataIndex: 'partnerStatus',
          required: true,
          render: (value, row, index) => (
            <AsyncSelect
              value={value}
              source={() => queryUdc('COM.STATUS1').then(resp => resp.response)}
              onChange={this.onCellChanged(index, 'partnerStatus')}
              placeholder="请选择状态"
            />
          ),
        },
        {
          title: '利益分配比例',
          dataIndex: 'distRatio',
          render: (value, row, index) => (
            <Input
              value={value}
              onChange={this.onCellChanged(index, 'distRatio')}
              placeholder="请输入利益分配比例"
            />
          ),
        },
        {
          title: '加入时间',
          dataIndex: 'dateFrom',
          required: true,
          render: (value, row, index) => (
            <DatePicker
              // disabledDate={startVal => {
              //   if (!startVal || !endValue[index]) {
              //     return false;
              //   }
              //   return startVal.valueOf() > endValue[index].valueOf();
              // }}
              value={value ? moment(value) : null}
              // allowClear={false}
              className="x-fill-100"
              onChange={this.onCellChanged(index, 'dateFrom')}
            />
          ),
        },
        {
          title: '退出时间',
          dataIndex: 'dateTo',
          render: (value, row, index) => (
            <DatePicker
              // disabledDate={endVal => {
              //   if (!endVal || !startValue[index]) {
              //     return false;
              //   }
              //   return endVal.valueOf() <= startValue[index].valueOf();
              // }}
              value={value ? moment(value) : null}
              // allowClear={false}
              className="x-fill-100"
              onChange={this.onCellChanged(index, 'dateTo')}
            />
          ),
        },
      ],
      buttons: [],
    };

    return (
      <ReactiveWrapper>
        <EditableDataTable {...tableProps} />
      </ReactiveWrapper>
    );
  }
}

export default Partner;
