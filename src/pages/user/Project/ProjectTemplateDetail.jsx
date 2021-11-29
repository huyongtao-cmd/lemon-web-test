import React, { PureComponent } from 'react';
import { Card } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';
import { UdcSelect } from '@/pages/gen/field';

import DataTable from '../../../components/common/DataTable/index';

const { Description } = DescriptionList;

const DOMAIN = 'projectTemplateDetail';

@connect(({ loading, projectTemplateDetail, dispatch, user }) => ({
  loading,
  ...projectTemplateDetail,
  dispatch,
  user,
}))
@mountToTab()
class ProjectTemplateDetail extends PureComponent {
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
      activityList,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      dataSource: activityList,
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      total: 0,
      columns: [
        {
          title: '活动编码',
          dataIndex: 'actNo',
          required: true,
          align: 'center',
          width: 100,
        },
        {
          title: '活动名称',
          dataIndex: 'actName',
          required: true,
          width: 300,
        },
        {
          title: '规划天数',
          dataIndex: 'days',
          // required: true,
          align: 'right',
          width: 50,
        },
        {
          title: '规划当量',
          dataIndex: 'eqva',
          align: 'right',
          width: 50,
        },
        {
          title: '里程碑',
          dataIndex: 'milestoneFlag',
          required: true,
          align: 'center',
          width: 50,
          render: (value, row, key) => (value === 1 ? '是' : '否'),
        },
        {
          title: '阶段',
          dataIndex: 'phaseFlag',
          required: false,
          align: 'center',
          width: 50,
          render: (value, row, key) => (value === 1 ? '是' : '否'),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: 200,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="项目情况汇报">
        <Card bordered={false} className="tw-card-adjust">
          <DescriptionList title="基本信息" size="large" col={2} hasSeparator>
            <Description term="模板名称">{formData.tmplName}</Description>
            <Description term="适用类型">{formData.workTypeDesc}</Description>
            <Description term="科目模板">{formData.accTmplName}</Description>
            <Description term="是否启用">{formData.enabledFlag === 1 ? '是' : '否'}</Description>
            <Description term="备注">{formData.remark}</Description>
          </DescriptionList>

          <DescriptionList title="项目收款信息" />
          <DataTable {...editTableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ProjectTemplateDetail;
