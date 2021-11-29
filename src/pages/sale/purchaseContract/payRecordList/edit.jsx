/* eslint-disable array-callback-return */
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
import { selectAccountByNo } from '@/services/sale/purchaseContract/paymentApplyList';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

import { payRecordTableProps } from './editConfig/payRecordConfig';
import { CONFIGSCENE, FLOW_NO } from '../constConfig';

const DOMAIN = 'payRecordEdit';

@connect(({ loading, payRecordEdit, dispatch, user }) => ({
  loading,
  payRecordEdit,
  dispatch,
  user,
}))
@mountToTab()
class Edit extends PureComponent {
  componentDidMount() {
    const { mode, id } = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { mode, id: id || '' },
    });
  }

  render() {
    const { loading, payRecordEdit, dispatch } = this.props;
    const { pageConfig } = payRecordEdit;
    const { mode, id } = fromQs();
    return (
      <>
        <Card className="tw-card-adjust" bordered={false}>
          <div className="tw-card-title">付款单记录</div>
          <EditableDataTable
            {...payRecordTableProps(DOMAIN, dispatch, loading, mode, payRecordEdit)}
          />
        </Card>
        {mode === 'view' && (
          <BpmConnection source={[{ docId: id, procDefKey: FLOW_NO.PAYRECORD }]} />
        )}
      </>
    );
  }
}

export default Edit;
