// 最常用的引入,基本每个页面都需要的组件
import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Checkbox, Divider, Tooltip } from 'antd';
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

const DOMAIN = 'DataPresentDetail';

@connect(({ loading, dataPresentDetail, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...dataPresentDetail,
  dispatch,
  user,
}))
@mountToTab()
class DataPresentDetail extends PureComponent {
  componentDidMount() {
    const params = fromQs();
    this.fetchData(params);
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  render() {
    const { loading, dataSource, formData, withdrawPayFlow, dispatch } = this.props;

    return (
      <PageHeaderWrapper>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="名称">{formData.martName}</Description>
            <Description term="来源表">{formData.tableId}</Description>
            <Description term="键字段">{formData.keyColumn}</Description>
            <Description term="键区间类型">{formData.keyRangeType}</Description>
            <Description term="键区间自定义">{formData.keyRangeDefine}</Description>
            <Description term="值字段">{formData.valueColumn}</Description>
            <Description term="过滤条件表达式">{formData.filterExpression}</Description>
            <Description term="数据最大长度">{formData.rowLimit}</Description>
            <Description term="表格类型">{formData.chartType}</Description>
            <Description term="坐标轴旋转">{formData.transposeFlag}</Description>
            <Description term="分组字段">{formData.groupColumn}</Description>
            <Description term="统计维度字段">{formData.dimensionColumn}</Description>
            <Description term="排序字段">{formData.orderColumn}</Description>
            <Description term="排序方向">{formData.orderDirection}</Description>
            <Description term="备注">{formData.remark}</Description>
          </DescriptionList>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: formData.helpContent }} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DataPresentDetail;
