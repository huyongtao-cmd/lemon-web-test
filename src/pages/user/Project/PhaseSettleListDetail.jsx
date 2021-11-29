import React, { PureComponent } from 'react';
import router from 'umi/router';
import { Button, Card, Input, Select, Form, InputNumber } from 'antd';
import { connect } from 'dva';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import DataSet from '@antv/data-set';
import DataTable from '../../../components/common/DataTable/index';

const { Option } = Select;
const { Field, FieldLine } = FieldList;
const { Description } = DescriptionList;

const DOMAIN = 'phaseSettleListDetail';

@connect(({ loading, phaseSettleListDetail, dispatch, user }) => ({
  loading,
  ...phaseSettleListDetail,
  dispatch,
  user,
}))
@mountToTab()
class PhaseSettleListDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    if (id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      });
    }
  }

  render() {
    const {
      loading,
      formData,
      dataSource,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      dataSource,
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      total: 0,
      columns: [
        {
          title: '资源',
          dataIndex: 'resName',
        },
        {
          title: '天数',
          dataIndex: 'days',
        },
        {
          title: '工时日期',
          dataIndex: 'tsDate',
        },
        {
          title: '客户结算价',
          dataIndex: 'price',
        },
        {
          title: '总额',
          dataIndex: 'amt',
          render: (value, row, index) => (row.days * row.price).toFixed(2),
        },
      ],
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false} className="tw-card-adjust">
          <DescriptionList title="基本信息" size="large" col={2} hasSeparator>
            <Description term="结算单名称">{formData.listName}</Description>
            <Description term="提交人">{formData.resName}</Description>
            <Description term="相关项目">
              <a
                className="tw-link"
                onClick={() => router.push(`/user/project/projectDetail?id=${formData.projId}`)}
              >
                {formData.projName}
              </a>
            </Description>

            <Description term="申请日期">{formData.applyDate}</Description>
            <Description term="收款阶段名称">{formData.phaseName}</Description>
            <Description term="工时日期范围">
              {(formData.startDate || '') + ' - ' + (formData.endDate || '')}
            </Description>
            <Description term="总人天">{formData.days}</Description>
            <Description term="总金额">{formData.amt}</Description>
            <Description term="备注">{formData.remark}</Description>
          </DescriptionList>

          <DescriptionList title="工时信息" />
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PhaseSettleListDetail;
