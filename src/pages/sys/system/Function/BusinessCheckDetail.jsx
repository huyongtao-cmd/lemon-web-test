// 最常用的引入,基本每个页面都需要的组件
import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Checkbox, Divider, Select, Tooltip } from 'antd';
import { connect } from 'dva';

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

const { Description } = DescriptionList;

const DOMAIN = 'businessCheckDetail';

@connect(({ loading, businessCheckDetail, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...businessCheckDetail,
  dispatch,
  user,
}))
@mountToTab()
class BusinessCheckDetail extends PureComponent {
  componentDidMount() {
    const params = fromQs();
    this.fetchData(params);
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  getTableProps = () => {
    const { loading, dataSource } = this.props;
    return {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
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
          title: '提示语言',
          dataIndex: 'language',
          align: 'center',
          width: 300,
          render: (value, row, index) => {
            const langList = [
              { 'zh-CN': '简体中文(中国)' },
              { 'zh-HK': '繁体中文(香港)' },
              { 'en-US': '英语(美国)' },
              { 'ja-JP': '日语(日本)' },
              { 'fr-FR': '法语(法国)' },
              { 'de-DE': '德语(德国)' },
              { 'ru-RU': '俄语(俄罗斯)' },
            ];
            return Object.values(langList.filter(lang => Object.keys(lang)[0] === value)[0])[0];
          },
        },
        {
          title: '提示信息',
          dataIndex: 'message',
          align: 'left',
        },
      ],
    };
  };

  render() {
    const { formData } = this.props;

    return (
      <PageHeaderWrapper>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="检查名称">{formData.checkName}</Description>
            <Description term="功能名称">{formData.functionName}</Description>
            <Description term="检查编号">{formData.checkNo}</Description>
            <Description term="是否启用">{formData.enabledFlag === 1 ? '是' : '否'}</Description>
            <Description term="是否启用">{formData.allowCloseFlag === 1 ? '是' : '否'}</Description>
            <Description term="配置参数1">{formData.ext1}</Description>
            <Description term="配置参数2">{formData.ext2}</Description>
            <Description term="配置参数3">{formData.ext3}</Description>
            <Description term="长配置参数4">{formData.ext4}</Description>
            <Description term="长配置参数5">{formData.ext5}</Description>
            <Description
              term="可配置参数说明"
              {...{ xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 }}
            >
              {formData.configRemark}
            </Description>
            <Description term="备注" {...{ xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 }}>
              {formData.remark}
            </Description>
          </DescriptionList>
        </Card>
        <Card title="提示信息" bordered={false} className="tw-card-adjust">
          <DataTable {...this.getTableProps()} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BusinessCheckDetail;
