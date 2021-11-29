import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Form, Input, Radio, Divider, InputNumber, Modal } from 'antd';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { pushFlowTask } from '@/services/gen/flow';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectProjectTmpl, selectProject } from '@/services/user/project/project';
import { selectUsers } from '@/services/sys/user';
import update from 'immutability-helper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { genFakeId } from '@/utils/mathUtils';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUsersWithBu } from '@/services/gen/list';
import { stringify } from 'qs';
import TransferMoneyDetail from './detail';
import FlowCreate from './flowCreate';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const DOMAIN = 'transferMoneyFlow';
@connect(({ loading, transferMoneyFlow, dispatch, transferMoneyDetail }) => ({
  loading: loading.effects[`${DOMAIN}/submit`] || loading.effects[`${DOMAIN}/queryDetail`],
  transferMoneyFlow,
  transferMoneyDetail,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedFields) {
    if (!isEmpty(changedFields)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm1`,
        payload: changedFields,
      });
    }
  },
})
@mountToTab()
class TransferMoneyFlow extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    const param = fromQs();
    // dispatch({
    //   type: `${DOMAIN}/queryDetail`,
    //   payload: { id: param.id },
    // });

    param.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
  }

  render() {
    const {
      dispatch,
      loading,
      transferMoneyDetail: { formData },
      transferMoneyFlow: { fieldsConfig, flowForm },
      form: { getFieldDecorator, setFieldsValue, validateFieldsAndScroll, getFieldValue },
    } = this.props;
    const { id, taskId, mode } = fromQs();
    const { taskKey, buttons } = fieldsConfig;

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          formData={formData}
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          scope="ACC_A66"
          buttonLoading={loading}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark } = bpmForm;
            const { key } = operation;
            if (key === 'REJECTED') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () =>
                  pushFlowTask(taskId, {
                    remark,
                    result: key,
                  }).then(({ status, response }) => {
                    if (status === 200) {
                      createMessage({ type: 'success', description: '操作成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
                    return Promise.resolve(false);
                  }),
              });
            }

            if (key === 'EDIT') {
              const urls = getUrl();
              const from = stringify({ from: urls });
              router.push(
                `/plat/expense/transferMoney/flowCreate?id=${formData.id}&taskId=${taskId}&${from}`
              );
              return Promise.resolve(false);
            }
            // 点击通过按钮
            if (key === 'APPROVED') {
              // promise 为true,默认走后续组件流程的方法
              return Promise.resolve(true);
            }
            // promise 为false,后续组件方法不走,走自己的逻辑
            return Promise.resolve(false);
          }}
        >
          <TransferMoneyDetail />
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default TransferMoneyFlow;
