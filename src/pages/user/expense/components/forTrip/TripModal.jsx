import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Form, Modal, Checkbox } from 'antd';
import { isNil, isEmpty, forEach } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import { createConfirm } from '@/components/core/Confirm';
import createMessage from '@/components/core/AlertMessage';
import { add, mul } from '@/utils/mathUtils';
import moment from 'moment';
import { Selection } from '@/pages/gen/field';

const { Field } = FieldList;

const DOMAIN = 'userExpenseTripEdit';
@connect(({ loading, dispatch, userExpenseTripEdit }) => ({
  loading,
  dispatch,
  userExpenseTripEdit,
}))
@Form.create({})
@mountToTab()
class TripModal extends PureComponent {
  toggleVisible = () => {
    const {
      userExpenseTripEdit: { visible },
      dispatch,
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { visible: !visible },
    });
  };

  handleOk = () => {
    const {
      userExpenseTripEdit: {
        detailList,
        mealMoenyList,
        modalParmas: { index, feeAmt },
      },
      dispatch,
      form: { validateFieldsAndScroll, setFields },
    } = this.props;

    if (!feeAmt) {
      setFields({
        feeAmt: {
          value: undefined,
          errors: [new Error('请先维护每日餐费额度')],
        },
      });
    }
    if (feeAmt) {
      this.toggleVisible();
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
    } else {
      createMessage({ type: 'warn', description: '请先维护每日餐费额度' });
    }
  };

  handleCancel = () => {
    createConfirm({
      content: '系统将不保存本次编辑，是否继续？',
      onOk: () => {
        this.toggleVisible();
        const { dispatch } = this.props;

        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
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
      userExpenseTripEdit: { mealMoenyList, modalParmas },
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
      userExpenseTripEdit: { detailList, visible, mealMoenyList, modalParmas },
      form: { getFieldDecorator },
      cities,
    } = this.props;

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
            <Input
              disabled
              placeholder={modalParmas.feeAmt ? '系统自动生成' : '请先维护餐费额度'}
            />
          </Field>
        </FieldList>
        <DataTable {...tableProps} />
      </Modal>
    );
  }
}

export default TripModal;
