import React, { PureComponent } from 'react';
import moment from 'moment';
import router from 'umi/router';
import classnames from 'classnames';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { formatMessage } from 'umi/locale';
import { Button, Card, Form, Modal } from 'antd';
import Title from '@/components/layout/Title';
import Loading from '@/components/core/DataLoading';
import FieldList from '@/components/layout/FieldList';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import createMessage from '@/components/core/AlertMessage';
import SelectWithCols from '@/components/common/SelectWithCols';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { UdcSelect } from '@/pages/gen/field';
import Detail from './view';

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

@connect(({ loading, userLeadsDetail, dispatch }) => ({
  loading,
  userLeadsDetail,
  dispatch,
}))
@mountToTab()
@Form.create()
class userLeadsDetailDetail extends PureComponent {
  state = {
    closeReason: null,
    remark: null,
    visible: false,
  };

  handleCloseReason = () => {
    const { closeReason, remark } = this.state;
    const {
      dispatch,
      userLeadsDetail: { formData },
    } = this.props;
    const param = fromQs();
    if (!closeReason) {
      createMessage({ type: 'error', description: '请选择关闭原因' });
      return;
    }
    dispatch({ type: `${DOMAIN}/saveCloseReason`, payload: { id: formData.id, closeReason } }).then(
      result => {
        if (!result) {
          return;
        }
        dispatch({
          type: `${DOMAIN}/approvalLeads`,
          payload: { taskId: param.taskId, params: { result: 'CLOSE', remark } },
        }).then(() => {
          this.toggleVisible();
        });
      }
    );
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  renderPage = (taskKey, title) => {
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
        pageConfig,
        leaderConfig,
        saleConfig,
        leaderReviewConfig,
      },
    } = this.props;
    const { taskId, id, mode } = fromQs();
    let fields = [];
    let filterList = [];
    if (taskKey === TASK_FLOW_ASSIGN_POINT) {
      if (!leaderConfig.pageBlockViews || leaderConfig.pageBlockViews.length < 1) {
        return <div />;
      }
      let currentBlockConfig = {};
      leaderConfig.pageBlockViews.forEach(view => {
        if (view.blockKey === 'LEADS_MANAGEMENT_DISPOSE') {
          // 线索分配流程的销售负责人处理审批页面
          currentBlockConfig = view;
        }
      });
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { salesmanResId = {} } = pageFieldJson;
      fields = [
        <Field
          name="salesmanResId"
          key="salesmanResId"
          label={salesmanResId.displayName}
          sortno={salesmanResId.sortNo}
          decorator={{
            initialValue: formData.salesmanResId
              ? { name: formData.salesmanName, code: formData.salesmanResId }
              : salesmanResRecord,
            rules: [
              {
                required: !!salesmanResId.requiredFlag,
                message: `请选择${salesmanResId.displayName}`,
              },
            ],
          }}
        >
          <SelectWithCols
            labelKey="name"
            valueKey="code"
            columns={columns}
            dataSource={salemanSource}
            selectProps={{
              showSearch: true,
              onSearch: value => {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    salemanSource: salemanList.filter(
                      d =>
                        d.code.indexOf(value) > -1 ||
                        d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                    ),
                  },
                });
              },
              allowClear: true,
              style: { width: '100%' },
              disabled: mode === 'view',
            }}
            onChange={value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  salesmanResRecord: value,
                },
              });
            }}
          />
        </Field>,
      ];
      filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    }
    return (
      <FieldList getFieldDecorator={getFieldDecorator} layout="horizontal" col={2} legend={title}>
        {filterList}
      </FieldList>
    );
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, validateFieldsAndScroll },
      userLeadsDetail: {
        formData,
        page,
        salemanList,
        salemanSource,
        fieldsConfig,
        flowForm,
        salesmanResRecord,
        pageConfig,
      },
    } = this.props;
    const { closeReason, visible } = this.state;
    const { taskId, id, mode } = fromQs();
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const isInternal = formData.sourceType === 'INTERNAL';
    return (
      <PageHeaderWrapper title="线索详情">
        <BpmWrapper
          fields={[]}
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
            const { key } = operation;
            if (taskKey === TASK_LEADS_SUBMIT) {
              const { remark } = bpmForm;
              closeThenGoto(
                `/sale/management/leadsedit?id=${id}&mode=update&page=leads&taskId=${taskId}&remark=${remark}`
              );
              return Promise.resolve(false);
            }
            if (taskKey === TASK_FLOW_ASSIGN_POINT && formData.apprStatus === 'APPROVING') {
              if (key === 'ASSIGN') {
                // 这个节点需要业务表单操作,业务操作完之后，推进节点
                return new Promise((resolve, reject) => {
                  validateFieldsAndScroll((error, values) => {
                    if (!error) {
                      const salesmanResId = values.salesmanResId.id;
                      const payload = {
                        ...formData,
                        salesmanResId,
                      };
                      dispatch({
                        type: `${DOMAIN}/save`,
                        payload,
                      }).then(result => resolve(result));
                    } else resolve(false);
                  });
                });
              }
              if (key === 'CLOSE') {
                this.setState({ visible: true, remark: bpmForm.remark });
                return Promise.resolve(false);
              }
            }
            return Promise.resolve(true);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className={classnames('separate', 'tw-btn-default', 'stand')}
              icon="undo"
              size="large"
              disabled={disabledBtn}
              onClick={() => {
                page === 'myleads'
                  ? router.push(`/user/center/${page}`)
                  : router.push(`/sale/management/${page}`);
              }}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
          <Card
            title={<Title icon="profile" id="app.setting.flow.form" defaultMessage="流程表单" />}
            className="tw-card-adjust x-fill-100"
            style={{ marginBottom: 4 }}
          >
            {fieldsConfig.taskKey === TASK_FLOW_ASSIGN_POINT &&
              taskId &&
              this.renderPage(TASK_FLOW_ASSIGN_POINT, '跟进人员')}
          </Card>
          {formData.id ? <Detail mode="oneZero" /> : null}
          {/* 详情页要添加相关流程项目，因此是不存在 taskId 的时候才展示 */}
          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'TSK_S01' }]} />}
        </BpmWrapper>
        <Modal
          destroyOnClose
          title="关闭线索"
          visible={visible}
          onOk={this.handleCloseReason}
          onCancel={this.toggleVisible}
          width="50%"
        >
          <FieldList
            getFieldDecorator={getFieldDecorator}
            layout="horizontal"
            style={{ overflow: 'hidden' }}
            col={1}
          >
            <Field
              name="closeReason"
              label="关闭原因"
              decorator={{
                initialValue: closeReason,
              }}
            >
              <UdcSelect
                // value={closeReason}
                code="TSK.LEADS_CLOSE_REASON"
                onChange={value => {
                  this.setState({ closeReason: value });
                }}
              />
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default userLeadsDetailDetail;
