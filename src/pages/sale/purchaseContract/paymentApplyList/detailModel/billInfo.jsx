/* eslint-disable import/no-unresolved */
/* eslint-disable consistent-return */
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

import DataTable from '@/components/common/DataTable';

import { formatDT } from '@/utils/tempUtils/DateTime';
import { toIsoDate } from '@/utils/timeUtils';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';
import router from 'umi/router';
import { selectBu, selectSupplier } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsers } from '@/services/sys/user';
import { selectAbOus, selectUsersWithBu, selectOus, selectCusts } from '@/services/gen/list';
import style from '../style.less';

const DOMAIN = 'paymentApplyDetail';
const { Field, FieldLine } = FieldList;
const FieldListLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@connect(({ loading, paymentApplyDetail, dispatch, user }) => ({
  loading,
  paymentApplyDetail,
  dispatch,
  user,
}))
@mountToTab()
class BillInfo extends PureComponent {
  // 表单是否可填控制
  pageFieldMode = fieldMode => {
    const { mode } = this.props;
    const isEdit = mode === 'view' ? true : fieldMode === 'UNEDITABLE';
    return isEdit;
  };

  // 单据信息
  renderInfoPageConfig = () => {
    const { paymentApplyDetail } = this.props;
    const { pageConfig, formData } = paymentApplyDetail;
    const { mode } = this.props;
    if (pageConfig) {
      if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
        return <div />;
      }
      const currentBlockConfig = pageConfig.pageBlockViews.filter(
        item => item.blockKey === 'BASE_INFO'
      )[0];
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const fields = [
        <Field
          name="createTime"
          key="createTime"
          label={pageFieldJson.createTime.displayName}
          sortNo={pageFieldJson.createTime.sortNo}
          {...FieldListLayout}
          decorator={{
            initialValue: formData.createTime ? moment(formData.createTime) : '',
            rules: [
              {
                required: pageFieldJson.createTime.requiredFlag,
                message: `请输入${pageFieldJson.createTime.displayName}`,
              },
            ],
          }}
        >
          <DatePicker
            placeholder={`请输入${pageFieldJson.createTime.displayName}`}
            format="YYYY-MM-DD HH-mm-ss"
            disabled={this.pageFieldMode(pageFieldJson.createTime.fieldMode)}
            className="x-fill-100"
          />
        </Field>,
        <Field
          name="createUserName"
          key="createUserName"
          label={pageFieldJson.createUserName.displayName}
          sortNo={pageFieldJson.createUserName.sortNo}
          {...FieldListLayout}
          decorator={{
            initialValue: formData.createUserName || '',
            rules: [
              {
                required: pageFieldJson.createUserName.requiredFlag,
                message: `请输入${pageFieldJson.createUserName.displayName}`,
              },
            ],
          }}
        >
          <Input
            placeholder={`请输入${pageFieldJson.createUserName.displayName}`}
            className="x-fill-100"
            disabled={this.pageFieldMode(pageFieldJson.createUserName.fieldMode)}
          />
        </Field>,
        <Field
          name="state"
          key="state"
          label={pageFieldJson.state.displayName}
          sortNo={pageFieldJson.state.sortNo}
          {...FieldListLayout}
          decorator={{
            initialValue: formData.state || '',
            rules: [
              {
                required: pageFieldJson.state.requiredFlag,
                message: `请选择${pageFieldJson.state.displayName}`,
              },
            ],
          }}
        >
          <Selection.UDC
            code="TSK:PAYMENT_APPLY_STATE"
            placeholder={`请选择${pageFieldJson.state.displayName}`}
            disabled={this.pageFieldMode(pageFieldJson.state.fieldMode)}
          />
        </Field>,
      ];
      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return filterList;
    }
    return '';
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList
            layout="horizontal"
            legend="单据信息"
            getFieldDecorator={getFieldDecorator}
            col={3}
            className={style.fill}
          >
            {this.renderInfoPageConfig()}
          </FieldList>
        </Card>
      </>
    );
  }
}

export default BillInfo;
