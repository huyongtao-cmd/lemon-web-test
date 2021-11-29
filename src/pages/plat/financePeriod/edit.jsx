import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { Button, Card, Form, Input } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

const { Field } = FieldList;

const DOMAIN = 'financialPeriod';

@connect(({ loading, financialPeriod, dispatch }) => ({
  loading,
  financialPeriod,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class FinancialPeriodEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();

    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      dispatch({ type: `${DOMAIN}/queryFinYearAll` });
      id &&
        dispatch({
          type: `${DOMAIN}/queryDetail`,
          payload: {
            id,
          },
        });
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      financialPeriod: { searchForm },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { id } = fromQs();
        if (!isNil(id)) {
          dispatch({
            type: `${DOMAIN}/update`,
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '保存成功' });
              closeThenGoto('/plat/finAccout/financePeriod?_refresh=0');
              dispatch({ type: `${DOMAIN}/query`, payload: searchForm });
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        } else {
          dispatch({
            type: `${DOMAIN}/submit`,
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '保存成功' });
              closeThenGoto('/plat/finAccout/financePeriod?_refresh=0');
              dispatch({ type: `${DOMAIN}/query`, payload: searchForm });
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        }
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      financialPeriod: { formData, finYearAllData },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/submit`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={e => this.handleSubmit()}
            disabled={submitBtn}
          >
            保存
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
          title={<Title icon="profile" text="财务期间维护" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="finYearId"
              label="财务年度"
              decorator={{
                initialValue: formData.finYearId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择财务年度',
                  },
                ],
              }}
            >
              <Selection
                className="x-fill-100"
                source={finYearAllData}
                transfer={{ key: 'id', code: 'id', name: 'code' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onChange={value => {}}
                onValueChange={e => {
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: { finYear: null, periodName: null },
                  });
                  setFieldsValue({
                    periodName: null,
                  });
                  if (e) {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: { finYear: e.code },
                    });
                  }
                }}
                placeholder="请选择财务年度"
              />
            </Field>
            <Field
              name="periodName"
              label="期间名称"
              decorator={{
                initialValue: formData.periodName || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择期间名称',
                  },
                ],
              }}
            >
              <DatePicker.MonthPicker
                format="YYYY-MM"
                disabledDate={current =>
                  formData.finYear
                    ? moment(current).year() !==
                      moment()
                        .year(formData.finYear)
                        .year()
                    : false
                }
                placeholder="请选择期间名称"
              />
            </Field>
            <Field
              name="periodStatus"
              label="状态"
              decorator={{
                initialValue: formData.periodStatus || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选状态',
                  },
                ],
              }}
            >
              <Selection.UDC code="ACC:PERIOD_STATUS" placeholder="请选择状态" />
            </Field>
            <Field
              name="remark"
              label="备注"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.remark || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default FinancialPeriodEdit;
