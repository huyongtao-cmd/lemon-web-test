import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import { Button, Card, Form, Input, Divider, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker, FileManagerEnhance, UdcSelect } from '@/pages/gen/field';
import { selectUsersWithBu } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import { selectProjectTmpl } from '@/services/user/project/project';
import moment from 'moment';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'transferMoneyFlowCreate';

@connect(({ loading, transferMoneyFlowCreate, dispatch, user }) => ({
  loading,
  transferMoneyFlowCreate,
  dispatch,
  user,
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
class TransferMoneyFlowCreate extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      user: {
        user: {
          extInfo: { resId, baseBuId },
        },
      },
    } = this.props;
    const { id, taskId } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/queryTransferCompany` });

    // 申请人重新申请流程中被审批人拒绝
    id &&
      taskId &&
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: {
          id,
        },
      });
    // 申请人为当前登录人,
    !id &&
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          applicantUserId: resId,
          applicantBuId: baseBuId,
        },
      });
  }

  // 根据选择的申请人获取申请人BU
  fetchApplicantBu = value => {
    const { dispatch } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/queryApplicantBu`,
        payload: {
          resId: value.id,
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          applicantBuId: undefined,
        },
      });
    }
  };

  // 根据选择的划款公司查询划款账号
  fetchTransferAccount = value => {
    const { dispatch } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/queryTransferAccount`,
        payload: {
          id: Number(value.valSphd1),
        },
      });
    }
  };

  // 根据选择的收款公司查询划款账号
  fetchCollectionAccount = value => {
    const { dispatch } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/queryCollectionAccount`,
        payload: {
          id: Number(value.valSphd1),
        },
      });
    }
  };

  handleSubmit = submit => {
    // 为true 跳到我的流程页
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { taskId } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // 点击提交按钮
        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            submit,
            procTaskId: taskId,
          },
        }).then(response => {
          if (response && response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/user/flow/process?type=procs`);
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      transferMoneyFlowCreate: {
        formData,
        resDataSource,
        baseBuDataSource,
        collectionCompanyList,
        transferCompanyList,
        transferAccountList,
        collectionAccountList,
      },
    } = this.props;
    const { mode } = fromQs();
    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/submit`];
    const queryBtn = loading.effects[`${DOMAIN}/queryDetail`];
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="upload"
            size="large"
            onClick={e => this.handleSubmit(true)}
            disabled={submitBtn || queryBtn}
            loading={loading.effects[`${DOMAIN}/submit`]}
          >
            提交
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              if (from) {
                closeThenGoto(markAsTab(from));
              } else {
                closeThenGoto('/user/flow/panel');
              }
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card className="tw-card-adjust" style={{ marginTop: '6x' }} bordered={false}>
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="资金拨款申请"
          >
            <Field
              name="transferNo"
              label="资金划款编号"
              decorator={{
                initialValue: formData.transferNo || undefined,
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>
            <Field
              name="applicantUserId"
              label="申请人"
              decorator={{
                initialValue: formData.applicantUserId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择申请人',
                  },
                ],
              }}
            >
              <Selection.Columns
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                columns={particularColumns}
                source={() => selectUsersWithBu()}
                placeholder="请选择申请人"
                showSearch
                onColumnsChange={value => {
                  this.fetchApplicantBu(value);
                }}
              />
            </Field>
            <Field
              name="applicantTime"
              label="申请日期"
              decorator={{
                initialValue: formData.applicantTime || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择申请日期',
                  },
                ],
              }}
            >
              <DatePicker className="x-fill-100" format="YYYY-MM-DD" placeholder="请选择申请日期" />
            </Field>
            <Field
              name="applicantBuId"
              label="申请人所属BU"
              decorator={{
                initialValue: formData.applicantBuId || undefined,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={baseBuDataSource}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                disabled
              />
            </Field>
            <Field
              name="transferCompany"
              label="划款公司"
              decorator={{
                initialValue: formData.transferCompany || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择划款公司',
                  },
                ],
              }}
            >
              <Selection
                className="x-fill-100"
                source={transferCompanyList}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onValueChange={value => {
                  this.fetchTransferAccount(value);
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      transferAccount: undefined,
                    },
                  });
                  setFieldsValue({ transferAccount: undefined });
                }}
                placeholder="请选择划款公司"
              />
            </Field>
            <Field
              name="transferAccount"
              label="划款账号"
              decorator={{
                initialValue: formData.transferAccount || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择划款账号',
                  },
                ],
              }}
            >
              <Selection
                className="x-fill-100"
                source={transferAccountList}
                transfer={{ key: 'id', code: 'valCode', name: 'valCode' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择划款账号"
              />
            </Field>
            <Field
              name="collectionCompany"
              label="收款公司"
              decorator={{
                initialValue: formData.collectionCompany || undefined,
              }}
            >
              <Selection
                className="x-fill-100"
                source={collectionCompanyList}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onValueChange={value => {
                  this.fetchCollectionAccount(value);
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      collectionAccount: undefined,
                    },
                  });
                  setFieldsValue({ collectionAccount: undefined });
                }}
                placeholder="请选择收款公司"
              />
            </Field>
            <Field
              name="collectionAccount"
              label="收款账号"
              decorator={{
                initialValue: formData.collectionAccount || undefined,
              }}
            >
              <Selection
                className="x-fill-100"
                source={collectionAccountList}
                transfer={{ key: 'id', code: 'valCode', name: 'valCode' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择收款账号"
              />
            </Field>
            <Field
              name="transferMoney"
              label="划款金额"
              decorator={{
                initialValue: formData.transferMoney || undefined,
                rules: [
                  {
                    required: true,
                    message: '请输入划款金额',
                  },
                ],
              }}
            >
              <InputNumber
                placeholder="请输入划款金额"
                min={0}
                className="x-fill-100"
                // precision={2}
              />
            </Field>
            <Field
              name="payWay"
              label="支付方式"
              decorator={{
                initialValue: formData.payWay,
                rules: [
                  {
                    required: true,
                    message: '请输入支付方式',
                  },
                ],
              }}
            >
              <Selection.UDC code="ACC:TRANSFER_PAY_WAY" placeholder="请选择支付方式" />
            </Field>
            <Field
              name="transferNote"
              label="划款说明"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.transferNote || undefined,
                rules: [
                  {
                    required: true,
                    message: '请输入划款说明',
                  },
                ],
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入划款说明" />
            </Field>
            <Field name="file" label="附件">
              <FileManagerEnhance
                api="/api/worth/v1/transfer/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>
            {/* <Field
              name="transferStatus"
              label="状态"
              decorator={{
                initialValue: formData.transferStatus || undefined,
              }}
            >
              <Selection.UDC code="COM:APPR_STATUS" disabled />
            </Field> */}
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TransferMoneyFlowCreate;
