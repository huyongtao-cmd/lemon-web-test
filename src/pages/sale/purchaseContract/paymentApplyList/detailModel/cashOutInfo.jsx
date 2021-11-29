/* eslint-disable import/no-unresolved */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, DatePicker, InputNumber, Button, Divider, Radio } from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { isEmpty, takeLast, add, isNil, gte, lte } from 'ramda';
import update from 'immutability-helper';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { fromQs, getGuid } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { toIsoDate } from '@/utils/timeUtils';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';
import router from 'umi/router';

import { selectBu, selectSupplier } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsers } from '@/services/sys/user';
import { selectAbOus, selectUsersWithBu, selectOus, selectCusts } from '@/services/gen/list';
import { cashOutInfoTableProps } from './cashOutInfoConfig';
import style from '../style.less';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'paymentApplyDetail';
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
@connect(({ paymentApplyDetail, loading }) => ({
  loading,
  paymentApplyDetail,
}))
@mountToTab()
class CashOutInfo extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { pid = 319 } = fromQs();
    if (pid) {
      dispatch({
        type: `${DOMAIN}/clearForm`,
      });
      dispatch({
        type: `${DOMAIN}/queryPurchase`,
        payload: pid,
      });
    }
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      paymentApplyDetail: { formData, list },
      dispatch,
    } = this.props;
    // const{from} = fromQs();
    // console.log("!!<<<<",from);

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { signDate, activateDate, closeDate, ...rest } = values;
        const purchaseContractEntity = {
          ...formData,
          signDate: toIsoDate(signDate),
          activateDate: toIsoDate(activateDate),
          closeDate: toIsoDate(closeDate),
          ...rest,
        };

        const payPlanList = list.filter(({ lineNo }) => lineNo !== -1).map((item, index) => {
          const { stage, id, unPayAmt, planPayDate, ...restParam } = item;
          let isNew = false;
          if (typeof id === 'string') {
            isNew = id.includes('new');
          }
          return {
            id: isNew ? -1 : id,
            pcontractId: formData.id,
            planPayDate: toIsoDate(planPayDate),
            ...restParam,
          };
        });
        // console.warn(' --> ', values, purchaseContractEntity);
        dispatch({
          type: `${DOMAIN}/saveEdit`,
          payload: {
            purchaseContractEntity,
            pContractPayload: {
              pcontractId: formData.id,
              entityList: payPlanList,
            },
          },
        });
      }
    });
  };

  render() {
    const {
      loading,
      paymentApplyDetail: { formData },
      form: { getFieldDecorator },
      dispatch,
      paymentApplyDetail,
    } = this.props;
    const readOnly = true;
    const { id } = fromQs();
    return (
      <>
        <Card className="tw-card-adjust" bordered={false}>
          <div className="tw-card-title">提现申请</div>
          <DataTable {...cashOutInfoTableProps(DOMAIN, dispatch, loading, paymentApplyDetail)} />
        </Card>
        <Divider dashed />
        <FieldList
          layout="horizontal"
          getFieldDecorator={getFieldDecorator}
          col={3}
          className={style.fill}
        >
          <Field
            name="withdrawTotal"
            label="提现金额合计"
            {...FieldListLayout}
            decorator={{
              initialValue: formData.withdrawTotal,
            }}
          >
            <Input disabled />
          </Field>
          <Field
            name="feeRate"
            label="费率"
            {...FieldListLayout}
            decorator={{
              initialValue: formData.feeRate,
            }}
          >
            <Input disabled />
          </Field>
          <Field
            name="amtRateTotal"
            label="申请金额合计"
            {...FieldListLayout}
            decorator={{
              initialValue: formData.amtRateTotal,
            }}
          >
            <Input disabled />
          </Field>
        </FieldList>
      </>
    );
  }
}

export default CashOutInfo;
