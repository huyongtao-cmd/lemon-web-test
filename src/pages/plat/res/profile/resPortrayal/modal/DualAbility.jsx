import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Button, Table } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import { FileManagerEnhance } from '@/pages/gen/field';

import { equals, isNil, isEmpty, type } from 'ramda';

const DOMAIN = 'resPortrayal';

@connect(({ loading, resPortrayal, dispatch }) => ({
  resPortrayal,
  dispatch,
  loading,
}))
@mountToTab()
class DualAbilityModal extends PureComponent {
  constructor(props) {
    super(props);
    const { visible, defaultPagination } = props;
    this.state = {
      visible,
      defaultPagination,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ visible: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { visible } = this.props;
    if (!equals(prevState.visible, visible)) {
      return visible;
    }
    return null;
  }

  onChange = (v, index) => {
    const { visible } = this.state;
    this.setState({ visible }, () => {
      const { onChange } = this.props;
      type(onChange) === 'Function' && onChange(visible, index);
    });
  };

  expandedRowRender = (record, index, indent, expanded) => {
    const tableProps = {
      sortBy: 'ids',
      rowKey: 'ids',
      dataSource: record.twResCapaListView || [],
      pagination: false,
      columns: [
        {
          title: '能力',
          dataIndex: 'entryName',
          width: '20%',
        },
        {
          title: '状态',
          dataIndex: 'obtainStatusName',
          align: 'center',
          width: '20%',
        },
        {
          title: '获得日期',
          dataIndex: 'obtainDate',
          align: 'center',
          width: '20%',
        },
        {
          title: '上次认证日期',
          dataIndex: 'lastRenewDate',
          align: 'center',
          width: '20%',
        },
        {
          title: '到期日期',
          dataIndex: 'dueDate',
          align: 'center',
          width: '20%',
        },
      ],
    };

    return <Table style={{ marginLeft: '-8px', marginRight: '-8px' }} {...tableProps} />;
  };

  render() {
    const {
      dispatch,
      resPortrayal: { individualAbility },
    } = this.props;
    const { visible, defaultPagination } = this.state;

    return (
      <Modal
        title="资质证书"
        visible={visible}
        onCancel={() => this.onChange()}
        footer={[
          <Button
            className="tw-btn-primary"
            style={{ backgroundColor: '#284488' }}
            key="makeSure"
            onClick={() => this.onChange()}
          >
            确定
          </Button>,
        ]}
        destroyOnClose
        width="60%"
      >
        <DataTable
          enableSelection={false}
          showSearch={false}
          showColumn={false}
          showExport={false}
          pagination={defaultPagination}
          loading={false}
          dataSource={individualAbility}
          columns={[
            {
              title: '分类',
              dataIndex: 'name',
              render: (value, row) => `${row.capaType1Name}-${row.capaType2Name}`,
            },
          ]}
          rowKey="cid"
          expandedRowRender={this.expandedRowRender}
        />
      </Modal>
    );
  }
}

export default DualAbilityModal;
