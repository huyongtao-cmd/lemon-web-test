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
import { bearDepInfoTableProps } from './bearDepInfoConfig';
import style from '../../style.less';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'prePaymentApplyDetail';
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
@connect(({ prePaymentApplyDetail, loading }) => ({
  loading,
  prePaymentApplyDetail,
}))
@mountToTab()
class BearDepInfo extends PureComponent {
  render() {
    const { loading, prePaymentApplyDetail, form, dispatch, mode } = this.props;
    const { formData, pageConfig } = prePaymentApplyDetail;
    const { getFieldDecorator } = form;
    return (
      <>
        {pageConfig.pageBlockViews &&
          pageConfig.pageBlockViews.length > 1 && (
            <>
              <Card className="tw-card-adjust" bordered={false}>
                <div className="tw-card-title">费用承担部门</div>
                <EditableDataTable
                  {...bearDepInfoTableProps(
                    DOMAIN,
                    dispatch,
                    loading,
                    form,
                    mode,
                    prePaymentApplyDetail
                  )}
                />
              </Card>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={3}
                className={style.fill}
              >
                <Field
                  name="taxAmountAmt"
                  label="不含税金额"
                  {...FieldListLayout}
                  decorator={{
                    initialValue: formData.taxAmountAmt,
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="depAmt"
                  label="部门分摊合计"
                  {...FieldListLayout}
                  decorator={{
                    initialValue: formData.depAmt,
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="restAmt"
                  label="剩余金额"
                  {...FieldListLayout}
                  decorator={{
                    initialValue: formData.restAmt,
                  }}
                >
                  <Input disabled />
                </Field>
              </FieldList>
            </>
          )}
      </>
    );
  }
}

export default BearDepInfo;
