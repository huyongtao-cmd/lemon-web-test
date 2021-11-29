import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Form, Card, DatePicker, Input, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import moment from 'moment';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import SelectWithCols from '@/components/common/SelectWithCols';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';
import { UdcSelect } from '@/pages/gen/field';

const { Field, FieldLine } = FieldList;
const DOMAIN = 'resActFinishCreate';

@connect(({ loading, resActFinishCreate, dispatch }) => ({
  loading,
  resActFinishCreate,
  dispatch,
}))
@Form.create({})
class ResActFinishCreate extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
    }
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      resActFinishCreate,
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      const param = fromQs();
      let hasFlowFlag = 0;
      if (param.apprId) {
        hasFlowFlag = 1;
      }
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { ...resActFinishCreate, ...values, hasFlowFlag, apprId: param.apprId },
        });
      }
    });
  };

  render() {
    const {
      loading,
      resActFinishCreate: {
        actNo,
        actName,
        planStartDate,
        planEndDate,
        eqvaQty,
        settledEqva,
        requiredDocList,
        finishDesc,
      },
      dispatch,
      form,
      form: { getFieldDecorator },
    } = this.props;
    const disabledBtn = !!loading.effects[`${DOMAIN}/query`] || !!loading.effects[`${DOMAIN}/save`];

    return (
      <PageHeaderWrapper title="活动完工申请">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={() => this.handleSave()}
          >
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="app.settings.menuMap.basicMessage"
              defaultMessage="基本信息"
            />
          }
          bordered={false}
        >
          {disabledBtn ? (
            <Loading />
          ) : (
            <FieldList
              layout="horizontal"
              legend={formatMessage({ id: `app.settings.menuMap.basicMessage`, desc: '基本信息' })}
              getFieldDecorator={getFieldDecorator}
              col={2}
            >
              <Field
                name="actNo"
                label="活动编号"
                decorator={{
                  initialValue: actNo,
                }}
              >
                <Input disabled />
              </Field>
              <Field
                name="actName"
                label="活动名称"
                decorator={{
                  initialValue: actName,
                }}
              >
                <Input disabled />
              </Field>

              <Field
                name="planStartDate"
                label="预计开始日期"
                decorator={{
                  initialValue: planStartDate,
                }}
              >
                <Input disabled />
              </Field>

              <Field
                name="planEndDate"
                label="预计结束日期"
                decorator={{
                  initialValue: planEndDate,
                }}
              >
                <Input disabled />
              </Field>

              <Field
                name="eqvaQty"
                label="活动当量"
                decorator={{
                  initialValue: eqvaQty,
                }}
              >
                <Input disabled />
              </Field>

              <Field
                name="settledEqva"
                label="已结算当量"
                decorator={{
                  initialValue: settledEqva,
                }}
              >
                <Input disabled />
              </Field>

              <Field
                name="requiredDocList"
                label="要求文档清单"
                decorator={{
                  initialValue: requiredDocList,
                }}
              >
                <Input disabled />
              </Field>

              <Field
                name="finishDesc"
                label="完工说明"
                decorator={{
                  initialValue: finishDesc,
                }}
              >
                <Input maxLength={35} />
              </Field>
            </FieldList>
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ResActFinishCreate;
