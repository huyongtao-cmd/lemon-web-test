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

const DOMAIN = 'dataWarehouseTableDetail';

@connect(({ loading, dataWarehouseTableDetail, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...dataWarehouseTableDetail,
  dispatch,
  user,
}))
@mountToTab()
class DataWarehouseTableDetail extends PureComponent {
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
          dataIndex: 'fieldColumn',
          align: 'center',
        },
        {
          title: '字段标题',
          dataIndex: 'fieldName',
          align: 'center',
        },
        {
          title: '值类型',
          dataIndex: 'fieldTypeDesc',
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
            <Description term="名称">{formData.dataTable}</Description>
            <Description term="备注">{formData.remark}</Description>
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

export default DataWarehouseTableDetail;
