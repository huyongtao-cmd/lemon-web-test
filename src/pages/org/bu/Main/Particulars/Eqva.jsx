import React, { PureComponent } from 'react';
import { connect } from 'dva';
import DataTable from '@/components/common/DataTable';
import ReactiveWrapper from '@/components/layout/ReactiveWrapper';

const DOMAIN = 'orgbuEqva';

@connect(({ loading, orgbuEqva }) => ({
  loading,
  orgbuEqva,
}))
class Eqva extends PureComponent {
  componentDidMount() {
    const { dispatch, buId } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: buId,
    });
  }

  render() {
    const { loading, orgbuEqva } = this.props;
    const { dataList } = orgbuEqva;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource: dataList,
      enableSelection: false,
      showSearch: false,
      showColumn: false,
      columns: [
        {
          title: '年度',
          dataIndex: 'finYear',
        },
        {
          title: '期间',
          dataIndex: 'finPeriod',
        },
        {
          title: '工种',
          dataIndex: 'jobTypeName',
          required: true,
        },
        {
          title: '工种子类', // TODO: 国际化
          dataIndex: 'jobType2Name',
          align: 'center',
        },
        {
          title: '合作方式',
          dataIndex: 'coopTypeDesc',
        },
        {
          title: '城市级别',
          dataIndex: 'cityLevelDesc',
        },
        {
          title: '资源名称', // TODO: 国际化
          dataIndex: 'resName',
        },
        {
          title: '单位当量收入',
          dataIndex: 'preeqvaAmt',
          required: true,
        },
        {
          title: '状态', // TODO: 国际化
          dataIndex: 'lineStatusDesc',
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
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

export default Eqva;
