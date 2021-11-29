import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Form, Modal, Checkbox } from 'antd';
import { isNil, isEmpty, forEach } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import { createConfirm } from '@/components/core/Confirm';
import { add, mul } from '@/utils/mathUtils';
import moment from 'moment';
import { Selection } from '@/pages/gen/field';

const { Field } = FieldList;

const DOMAIN = 'userExpenseTripView';
@connect(({ loading, dispatch, userExpenseTripView }) => ({
  loading,
  dispatch,
  userExpenseTripView,
}))
@Form.create({})
@mountToTab()
class TripModalView extends PureComponent {
  toggleVisible = () => {
    const {
      userExpenseTripView: { visible },
      dispatch,
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { visible: !visible },
    });
  };

  handleOk = () => {
    this.toggleVisible();
    const {
      userExpenseTripView: {
        detailList,
        mealMoenyList,
        modalParmas: { index },
      },
      dispatch,
    } = this.props;

    const allMoney = mealMoenyList.map(v => v.meals).reduce((x, y) => add(x, y));

    const newDetailList = detailList;
    newDetailList[index] = {
      ...newDetailList[index],
      tripMealsDayList: mealMoenyList,
      taxedReimAmt: allMoney,
      reimAmt: allMoney,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        detailList: newDetailList,
      },
    });
  };

  handleCancel = () => {
    const { disabled, enableAdjustedAmt } = this.props;
    const disabledBtn = disabled && !enableAdjustedAmt;
    // 若是详情展示页，则Modal消失是不需要提示数据将被清除
    if (disabledBtn) {
      this.toggleVisible();
      return;
    }

    createConfirm({
      content: '系统将不保存本次编辑，是否继续？',
      onOk: () => {
        this.toggleVisible();
        const {
          userExpenseTripView: {
            // detailList,
            mealMoenyList,
            // modalParmas: { index },
          },
          dispatch,
        } = this.props;

        // const newDetailList = detailList;
        // newDetailList[index] = {
        //   ...newDetailList[index],
        //   tripMealsDayList: [],
        // };

        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            // detailList: newDetailList,
            mealMoenyList: [],
          },
        });
      },
    });
  };

  // 行编辑触发事件
  onCellChangeds = (index, checked, name, row) => {
    // eslint-disable-next-line no-param-reassign
    row[name] = checked ? '1' : '0';
    const {
      userExpenseTripView: { mealMoenyList, modalParmas },
      dispatch,
    } = this.props;

    const num = mealMoenyList.filter(v => v.tripDate === row.tripDate)[0].id;

    const newMealMoeny = mealMoenyList;
    newMealMoeny[num] = {
      ...newMealMoeny[num],
      [name]: checked ? '1' : '0',
      meals: mul(
        add(
          add(mul(Number(row.morning), 0.2), mul(Number(row.night), 0.4)),
          mul(Number(row.noon), 0.4)
        ),
        modalParmas.feeAmt || 0
      ),
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        mealMoenyList: newMealMoeny,
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userExpenseTripView: { detailList, visible, mealMoenyList, modalParmas },
      form: { getFieldDecorator },
      cities,
      disabled,
      enableAdjustedAmt,
    } = this.props;
    const disabledBtn = disabled && !enableAdjustedAmt;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/getMealFee`],
      dataSource: mealMoenyList,
      showColumn: false,
      showSearch: false,
      showExport: false,
      pagination: true,
      enableSelection: false,
      enableDoubleClick: false,
      rowSelection: {
        getCheckboxProps: (rowKey, rows) => {
          if (disabledBtn) {
            return false;
          }
          return true;
        },
      },
      columns: [
        {
          title: '出差日期',
          dataIndex: 'tripDate',
          align: 'center',
          render: value => (
            <span>
              {value}
              <span>&nbsp;&nbsp;&nbsp;</span>({moment(value).format('dd')})
            </span>
          ),
        },
        {
          title: '早',
          dataIndex: 'morning',
          align: 'center',
          render: (value, row, index) => (
            <Checkbox
              checked={value === '1'}
              disabled={disabledBtn}
              onChange={e => {
                const { checked } = e.target;
                this.onCellChangeds(index, checked, 'morning', row);
              }}
            />
          ),
        },
        {
          title: '中',
          dataIndex: 'noon',
          align: 'center',
          render: (value, row, index) => (
            <Checkbox
              checked={value === '1'}
              disabled={disabledBtn}
              onChange={e => {
                const { checked } = e.target;
                this.onCellChangeds(index, checked, 'noon', row);
              }}
            />
          ),
        },
        {
          title: '晚',
          dataIndex: 'night',
          align: 'center',
          render: (value, row, index) => (
            <Checkbox
              disabled={disabledBtn}
              checked={value === '1'}
              onChange={e => {
                const { checked } = e.target;
                this.onCellChangeds(index, checked, 'night', row);
              }}
            />
          ),
        },
        {
          title: '餐费',
          dataIndex: 'meals',
          align: 'center',
          // render: (value, row, index) => {
          //   const { morning, noon, night } = row;
          //   // 早中晚三餐餐费占比分别为20%。40%，40%
          //   return mul(add(add(mul(morning, 0.2), mul(night, 0.4)), mul(noon, 0.4)), value);
          // },
        },
      ],
    };

    return (
      <Modal
        centered
        title="差旅餐补自动计算"
        visible={visible}
        onOk={() => this.handleOk()}
        onCancel={() => this.handleCancel()}
        width={800}
        destroyOnClose
      >
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          <Field
            name="fromPlace"
            label="出差地"
            labelCol={{ span: 8, xxl: 8 }}
            wrapperCol={{ span: 16, xxl: 16 }}
            decorator={{
              initialValue: modalParmas.fromPlace || '',
            }}
          >
            <Selection allowClear={false} source={cities} disabled />
          </Field>
          <Field
            name="feeAmt"
            label="每日餐费"
            labelCol={{ span: 10, xxl: 10 }}
            wrapperCol={{ span: 14, xxl: 14 }}
            decorator={{
              initialValue: modalParmas.feeAmt || '',
            }}
          >
            <Input disabled placeholder="系统自动生成" />
          </Field>
        </FieldList>
        <DataTable {...tableProps} />
      </Modal>
    );
  }
}

export default TripModalView;
