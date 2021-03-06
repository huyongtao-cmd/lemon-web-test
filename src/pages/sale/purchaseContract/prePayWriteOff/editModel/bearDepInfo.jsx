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

const DOMAIN = 'prePayWriteOffEdit';
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
@connect(({ prePayWriteOffEdit, loading }) => ({
  loading,
  prePayWriteOffEdit,
}))
@mountToTab()
class BearDepInfo extends PureComponent {
  render() {
    const { loading, prePayWriteOffEdit, form, dispatch, mode } = this.props;
    const { formData, pageConfig } = prePayWriteOffEdit;
    const { getFieldDecorator } = form;
    return (
      <>
        {pageConfig.pageBlockViews &&
          pageConfig.pageBlockViews.length > 1 && (
            <>
              <Card className="tw-card-adjust" bordered={false}>
                <div className="tw-card-title">??????????????????</div>
                <EditableDataTable
                  {...bearDepInfoTableProps(
                    DOMAIN,
                    dispatch,
                    loading,
                    form,
                    mode,
                    prePayWriteOffEdit
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
                  label="???????????????"
                  {...FieldListLayout}
                  decorator={{
                    initialValue: formData.taxAmountAmt,
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="depAmt"
                  label="??????????????????"
                  {...FieldListLayout}
                  decorator={{
                    initialValue: formData.depAmt,
                  }}
                >
                  <Input disabled />
                </Field>
                <Field
                  name="restAmt"
                  label="????????????"
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
