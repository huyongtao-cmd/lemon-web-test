import React, { PureComponent } from 'react';
import moment from 'moment';
import router from 'umi/router';
import classnames from 'classnames';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { formatMessage } from 'umi/locale';
import { Button, Card, Input, Form, Modal } from 'antd';
import Title from '@/components/layout/Title';
import Loading from '@/components/core/DataLoading';
import FieldList from '@/components/layout/FieldList';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import createMessage from '@/components/core/AlertMessage';
import SelectWithCols from '@/components/common/SelectWithCols';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsNoTab } from '@/layouts/routerControl';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { getUrl } from '@/utils/flowToRouter';
import VersionOneZero from './VersionOneZero';
import VersionThreeZero from './VersionThreeZero';
import ViewDetail from './ViewDetail';

const { Description } = DescriptionList;
const { Field } = FieldList;

const columns = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
const DOMAIN = 'userLeadsDetail';
const TASK_LEADS_SUBMIT = 'TSK_S01_01_LEADS_SUBMIT_i';
const TASK_FLOW_ASSIGN_POINT = 'TSK_S01_02_LEADS_ASSIGN';
const TASK_FLOW_LEADS_DISPOSE = 'TSK_S01_03_LEADS_DISPOSE_b';
const TASK_FLOW_LEADS_EXAMINE = 'TSK_S01_04_LEADS_EXAMINE';
const TSK_S01_05_LEADS_RECIEVE_B = 'TSK_S01_05_LEADS_RECIEVE_b';

@connect(({ loading, userLeadsDetail, dispatch }) => ({
  loading,
  userLeadsDetail,
  dispatch,
}))
@mountToTab()
@Form.create({})
class userLeadsDetailDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/getPageConfigs`,
      payload: {
        pageNos:
          'LEADS_MANAGEMENT_DETAILS,LEADS_MANAGEMENT_ASSIGN,LEADS_MANAGEMENT_DISPOSE,LEADS_MANAGEMENT_EXAMINE,LEADS_MANAGEMENT_RECIEVE',
      },
    });
    if (param) {
      param.id &&
        dispatch({
          type: `${DOMAIN}/query`,
          payload: param,
        });

      param.taskId &&
        dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        });
      dispatch({ type: `${DOMAIN}/selectUsers` });
    } else {
      dispatch({
        type: `${DOMAIN}/clean`,
      });
    }
  }

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, validateFieldsAndScroll, setFieldsValue },
      userLeadsDetail: {
        formData,
        page,
        salemanList,
        salemanSource,
        fieldsConfig,
        flowForm,
        salesmanResRecord,
      },
    } = this.props;
    const { taskId, id, mode } = fromQs();
    const { taskKey, version } = fieldsConfig;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const isInternal = formData.sourceType === 'INTERNAL';
    return (
      <>
        {mode === 'edit' && version === '1.0' && <VersionOneZero />}
        {mode === 'edit' && version === '3.0' && <VersionThreeZero />}
        {mode === 'view' && <ViewDetail />}
      </>
    );
  }
}

export default userLeadsDetailDetail;
