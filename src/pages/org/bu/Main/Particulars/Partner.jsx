import React, { PureComponent } from 'react';
import { connect } from 'dva';
import DataTable from '@/components/common/DataTable';
import ReactiveWrapper from '@/components/layout/ReactiveWrapper';

const DOMAIN = 'orgbuPartner';

@connect(({ loading, orgbuPartner }) => ({
  loading,
  orgbuPartner,
}))
class Partner extends PureComponent {
  componentDidMount() {
    const { dispatch, buId } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: buId,
    });
  }

  render() {
    const {
      loading,
      orgbuPartner: { dataList },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      enableSelection: false,
      showSearch: false,
      showColumn: false,
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource: dataList,
      columns: [
        {
          title: '合伙人',
          dataIndex: 'partnerResName',
          required: true,
        },
        {
          title: '状态',
          dataIndex: 'partnerStatusDesc',
          required: true,
        },
        {
          title: '利益分配比例',
          dataIndex: 'allocationProportion',
          required: true,
        },
        {
          title: '加入时间',
          dataIndex: 'dateFrom',
          required: true,
        },
        {
          title: '退出时间',
          dataIndex: 'dateTo',
          required: true,
        },
      ],
    };

    return (
      <ReactiveWrapper>
        <DataTable {...tableProps} />
      </ReactiveWrapper>
    );
  }
}

export default Partner;
