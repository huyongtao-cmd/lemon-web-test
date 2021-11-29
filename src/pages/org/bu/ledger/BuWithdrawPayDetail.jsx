// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import { Button, Card, Input, InputNumber, Modal, Tooltip, Switch } from 'antd';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto, injectUdc } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import { Selection, DatePicker } from '@/pages/gen/field';
import router from 'umi/router';
import { add, checkIfNumber, div, mul, sub } from '@/utils/mathUtils';
import moment from 'moment';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import update from 'immutability-helper';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { selectUsersWithBu } from '@/services/gen/list';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const { Description } = DescriptionList;

const DOMAIN = 'buWithdrawPayDetail';

@connect(({ loading, buWithdrawPayDetail, dispatch, user }) => ({
  loading,
  ...buWithdrawPayDetail,
  dispatch,
  user,
}))
@mountToTab()
class BuWithdrawPayDetail extends PureComponent {
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
    const { loading, dataSource, formData, dispatch } = this.props;

    const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const { taskId, id } = fromQs();
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
          title: '项目',
          dataIndex: 'projName',
          align: 'center',
        },
        {
          title: '金额',
          dataIndex: 'amt',
          align: 'center',
        },
        {
          title: '相关报销单',
          dataIndex: 'reimId',
          align: 'center',
          render: (value, row, key) => {
            const url = `/plat/expense/normal/view?id=${value}`;
            return (
              <Link className="tw-link" to={url}>
                查看
              </Link>
            );
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="BU提现付款">
        <Card className="tw-card-rightLine">
          {/* <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSubmit}
          >
            提交
          </Button> */}
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="提现人">{formData.resName}</Description>
            <Description term="申请日期">{formData.applyDate}</Description>
            <Description term="BU名称">{formData.buName}</Description>

            <Description term="提现金额">{formData.amt}</Description>
            <Description term="查看提现单">{formData.amt}</Description>
            <Description term="备注">{formData.remark}</Description>
          </DescriptionList>
        </Card>
        <br />
        <Card title="提现信息" bordered={false} className="tw-card-adjust">
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BuWithdrawPayDetail;
