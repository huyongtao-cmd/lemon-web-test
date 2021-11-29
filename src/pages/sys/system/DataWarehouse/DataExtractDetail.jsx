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
const { Option } = Select;

const DOMAIN = 'dataExtractDetail';

@connect(({ loading, dataExtractDetail, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...dataExtractDetail,
  dispatch,
  user,
}))
@mountToTab()
class DataExtractDetail extends PureComponent {
  componentDidMount() {
    const params = fromQs();
    this.fetchData(params);
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  render() {
    const { loading, dataSource, formData } = this.props;
    const tableProps = {
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
          title: '数据库字段',
          dataIndex: 'databaseColumn',
          align: 'center',
        },
        {
          title: '字段标题',
          dataIndex: 'columnTitle',
          align: 'center',
        },
        /* {
          title: '转换方法',
          dataIndex: 'transformMethod',
          align: 'center',
          render: (value, row, index) => (
            <Select className="x-fill-100" size="small" defaultValue={value} disabled>
              <Option value="NOT_TRANSFORM">不转换</Option>
              <Option value="RANGE_TRANSFORM">区间转换</Option>
            </Select>
          ),
        },
        {
          title: '转换表达式',
          dataIndex: 'transformExpression',
          align: 'center',
        }, */
        {
          title: '值类型',
          dataIndex: 'columnTypeDesc',
          align: 'center',
        },
      ],
    };
    return (
      <PageHeaderWrapper>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="名称">{formData.extractName}</Description>
            <Description term="展现编号">{formData.presentNo}</Description>
            <Description term="抽取编号">{formData.extractNo}</Description>
            <Description term="触发时间">
              {formData.triggerTimeExpression || '跟随全局'}
            </Description>
            {/* <Description term="过滤条件表达式">{formData.filterExpression}</Description>
            <Description term="排序字段">{formData.orderColumn}</Description>
            <Description term="排序方向">{formData.orderDirection}</Description>
            <Description term="数据最大长度">{formData.rowLimit}</Description> */}
            <Description term="备注">{formData.remark}</Description>
            <Description term="触发时间说明">
              {`上次结束时间:${formData.lastRunTime ||
                '无'},下次预计触发时间:${formData.scheduledRunTime || '无'}`}
            </Description>
          </DescriptionList>
        </Card>
        <br />
        <Card title="抽取字段明细" bordered={false} className="tw-card-adjust">
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DataExtractDetail;
