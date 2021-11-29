// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import { Button, Card, Tooltip } from 'antd';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import router from 'umi/router';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';

const { Description } = DescriptionList;

const DOMAIN = 'unfreezeDetail';

@connect(({ loading, unfreezeDetail, dispatch, user }) => ({
  loading,
  ...unfreezeDetail,
  dispatch,
  user,
}))
@mountToTab()
class UnfreezeDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const params = fromQs();
    this.fetchData(params);

    params.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: params.taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  render() {
    const { loading, dataSource, formData, dispatch, fieldsConfig: config, flowForm } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const { taskId, id } = fromQs();
    const allBpm = [{ docId: id, procDefKey: 'ACC_A32', title: '解冻申请流程' }];
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: disabledBtn,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      columns: [
        {
          title: '解冻账户名称',
          dataIndex: 'ledgerName',
          align: 'center',
        },
        {
          title: '解冻当量',
          dataIndex: 'unfreezeEqva',
          align: 'center',
        },
        {
          title: '解冻金额',
          dataIndex: 'unfreezeAmt',
          align: 'center',
        },
        {
          title: '冻结时间',
          dataIndex: 'inTime',
          align: 'center',
        },
        {
          title: '相关项目',
          dataIndex: 'projName',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/project/projectDetail?id=${row.projId}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '相关任务',
          dataIndex: 'taskName',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/task/view?id=${row.taskId}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '相关结算单号',
          dataIndex: 'settleNo',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/plat/intelStl/list/common/preview?id=${row.settleId}`}>
              {value}
            </Link>
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="解冻">
        <BpmWrapper
          fieldsConfig={config}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { taskKey } = config;
            const { key } = operation;
            const payload = {
              taskId,
              remark: bpmForm.remark,
            };

            if (key === 'APPROVED') {
              return Promise.resolve(true);
            }

            if (key === 'REJECTED') {
              return Promise.resolve(true);
            }

            return Promise.resolve(false);
          }}
        >
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              type="primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={this.handleSubmit}
            >
              提交
            </Button>
          </Card>
          <Card
            title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
            bordered={false}
            className="tw-card-adjust"
          >
            <DescriptionList size="large" col={2} hasSeparator>
              <Description term="解冻人">{formData.resName}</Description>
              <Description term="解冻单号">{formData.unfreezeNo}</Description>
              <Description term="申请日期">{formData.applyDate}</Description>
              <Description term="审批状态">{formData.apprStatusDesc}</Description>
              <Description term="解冻当量">{formData.unfreezeEqva}</Description>
              <Description term="解冻金额">{formData.unfreezeAmt}</Description>
              <Description term="备注">{formData.remark}</Description>
            </DescriptionList>
          </Card>
          <br />
          <Card title="解冻列表" bordered={false} className="tw-card-adjust">
            <DataTable {...tableProps} />
          </Card>
        </BpmWrapper>
        {!taskId && !disabledBtn && <BpmConnection source={allBpm} />}
      </PageHeaderWrapper>
    );
  }
}

export default UnfreezeDetail;
