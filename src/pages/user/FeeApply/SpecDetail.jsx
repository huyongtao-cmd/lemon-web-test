import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Button, Card, Divider, Modal, Form, Select } from 'antd';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { formatMessage } from 'umi/locale';
import DataTable from '@/components/common/DataTable';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';

const { Field } = FieldList;
const { Option } = Select;
const { Description } = DescriptionList;

const DOMAIN = 'userFeeApplySpecDetail';
const FEE_APPLY_SUBMIT = 'ACC_A19_01_FEE_APPLY_SUBMIT_i'; // 提交
const FEE_APPLY_SUPERIOR_CONFIRM = 'ACC_A19_02_SUPERIOR_CONFIRM_b'; // 领导审批
const FEE_APPLY_FIN_PIC_CONFIRM = 'ACC_A19_03_PLAT_ALL_CONFIRM'; // 财务平台总体负责人

@connect(({ loading, userFeeApplySpecDetail, dispatch }) => ({
  loading,
  userFeeApplySpecDetail,
  dispatch,
}))
@Form.create()
class FeeApplySpecDetail extends PureComponent {
  state = {
    visible: false,
    branch: null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: param,
    });

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
      loading,
      dispatch,
      form: { getFieldDecorator },
      userFeeApplySpecDetail: { formData, dataSource, flowForm, fieldsConfig: config },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const { visible, branch } = this.state;
    const { taskId, id } = fromQs();

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      pagination: false,
      enableSelection: false,
      total: 0,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      showSearch: false,
      columns: [
        // {
        //   title: '费用科目', // TODO: 国际化
        //   dataIndex: 'accName',
        // },
        {
          title: '费用金额', // TODO: 国际化
          dataIndex: 'applyAmt',
        },
        {
          title: '费用说明', // TODO: 国际化
          dataIndex: 'feeDesc',
        },
      ],
    };

    let fieldsConfig = {};
    if (!isEmpty(config)) {
      const { taskKey } = config;
      // 提交节点
      if (
        taskKey === FEE_APPLY_SUBMIT &&
        (formData.apprStatus === 'NOTSUBMIT' ||
          formData.apprStatus === 'REJECTED' ||
          formData.apprStatus === 'WITHDRAW')
      ) {
        fieldsConfig = config;
      }
      // 领导审批
      if (
        taskKey === FEE_APPLY_SUPERIOR_CONFIRM &&
        (formData.apprStatus === 'APPROVING' || formData.apprStatus === 'REJECTED')
      ) {
        fieldsConfig = config;
      }
      // 财务负责人审批
      if (taskKey === FEE_APPLY_FIN_PIC_CONFIRM && formData.apprStatus === 'APPROVING') {
        fieldsConfig = config;
      }
    }

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, formData: formD, bpmForm }) => {
            const { taskKey } = fieldsConfig;
            // 提交节点-修改按钮
            if (
              taskKey === FEE_APPLY_SUBMIT &&
              (formData.apprStatus === 'REJECTED' || formData.apprStatus === 'WITHDRAW')
            ) {
              closeThenGoto(
                `/plat/expense/spec/specedit?id=${formData.id}&apprId=${taskId}&remark=${
                  bpmForm.remark
                }`
              );
              return Promise.resolve(false);
            }
            return Promise.resolve(true);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              disabled={disabledBtn}
              onClick={() => closeThenGoto('/plat/expense/spec/list')}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>

          <Card
            className="tw-card-adjust"
            title={
              <Title
                icon="profile"
                id="ui.menu.user.feeapply.specDetail"
                defaultMessage="特殊费用申请详情"
              />
            }
            bordered={false}
          >
            <DescriptionList size="large" title="特殊费用申请信息" col={2}>
              <Description term="申请单号">{formData.applyNo}</Description>
              <Description term="申请人">{formData.applyResName}</Description>
              <Description term="申请单号名称">{formData.applyName}</Description>
              <Description term="申请人base bu">{formData.applyBuName}</Description>
              <Description term="用途类型">{formData.usageTypeName}</Description>
              {/* <Description term="费用码">{formData.feeCodeName}</Description> */}
              <Description term="是否项目相关">{formData.applyTypeName}</Description>
              <Description term="事由号">{formData.reasonName}</Description>
              <Description term="客户">{formData.abName}</Description>
              <Description term="费用承担BU">{formData.expenseBuName}</Description>
              <Description term="费用预计使用日期">{formData.expectDate}</Description>
              <Description term="费用归属BU">{formData.sumBuName}</Description>
              <Description term="费用总额">{formData.applyAmt}</Description>
              <Description term="申请日期">{formData.applyDate}</Description>
              <Description term="申请状态">{formData.apprStatusName}</Description>
              <Description term="费用申请原因说明">
                <pre>{formData.remark}</pre>
              </Description>
            </DescriptionList>
            <Divider dashed />
            <div className="tw-card-title">费用明细信息</div>
            <DataTable {...tableProps} />
          </Card>
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A19' }]} />}
        </BpmWrapper>

        <Modal
          destroyOnClose
          title="选择退回节点"
          visible={visible}
          onOk={this.onOk}
          onCancel={this.toggleVisible}
          width="50%"
        >
          <FieldList
            getFieldDecorator={getFieldDecorator}
            layout="horizontal"
            style={{ overflow: 'hidden' }}
            col={1}
          >
            <Field name="closeReason" label="退回节点" required>
              <Select className="x-fill-100" value={branch} onChange={this.handleSelectRejectPoint}>
                <Option value="REJECTED_INITIATOR">发起节点</Option>
                <Option value="REJECTED_SUPERIOR">上一节点</Option>
              </Select>
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default FeeApplySpecDetail;
