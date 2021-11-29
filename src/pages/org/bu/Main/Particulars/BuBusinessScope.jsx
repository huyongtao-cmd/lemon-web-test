import React, { PureComponent } from 'react';
import { connect } from 'dva';
import DataTable from '@/components/common/DataTable';
import ReactiveWrapper from '@/components/layout/ReactiveWrapper';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'buBusinessScope';

@connect(({ loading, buBusinessScope }) => ({
  buBusinessScope,
  loading: loading.effects[`${DOMAIN}/query`], // 菊花旋转等待数据源(领域空间/子模块)
}))
class BuBusinessScope extends PureComponent {
  componentDidMount() {
    const { dispatch, buId } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: buId,
    });
  }

  render() {
    const { buBusinessScope, loading } = this.props;
    const { dataList } = buBusinessScope;

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading,
      expirys: 0,
      dataSource: dataList,
      enableSelection: false,
      showSearch: false,
      showColumn: false,
      columns: [
        {
          title: '分类编号',
          dataIndex: 'code',
          width: '20%',
        },
        {
          title: '分类名称',
          dataIndex: 'className',
          width: '20%',
        },
        {
          title: '上级分类',
          dataIndex: 'pname',
          width: '20%',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '40%',
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

export default BuBusinessScope;
