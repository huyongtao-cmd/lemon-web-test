import React, { PureComponent } from 'react';
import { Table } from 'antd';
import { mountToTab } from '@/layouts/routerControl';

@mountToTab()
class RankTable extends PureComponent {
  componentDidMount() {}

  render() {
    // type : 0 目标进度榜 1 绩效考核评分榜
    const { dataSource = [], type = 0 } = this.props;

    const columnsProgress = [
      {
        title: '排名',
        dataIndex: 'no',
        align: 'center',
      },
      {
        title: '负责人',
        dataIndex: 'resName',
        align: 'center',
      },
      {
        title: '目标',
        dataIndex: 'objName',
        align: 'center',
      },
      {
        title: '目标周期',
        dataIndex: 'periodName',
        align: 'center',
      },
      {
        title: '当前进度',
        dataIndex: 'objCurProg',
        align: 'center',
      },
    ];
    const columnsGrade = [
      {
        title: '排名',
        dataIndex: 'no',
        align: 'center',
      },
      {
        title: '姓名',
        dataIndex: 'resName',
        align: 'center',
      },
      {
        title: '考核名称',
        dataIndex: 'objName',
        align: 'center',
      },
      {
        title: '得分',
        dataIndex: 'periodName',
        align: 'center',
      },
      {
        title: '等级',
        dataIndex: 'objCurProg',
        align: 'center',
      },
    ];
    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: false,
      dataSource,
      pagination: false,
      columns: type === 0 ? columnsProgress : columnsGrade,
    };

    return <Table {...tableProps} />;
  }
}

export default RankTable;
