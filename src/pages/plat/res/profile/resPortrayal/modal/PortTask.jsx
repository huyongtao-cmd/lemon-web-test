import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Button } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import { equals, type } from 'ramda';

const DOMAIN = 'resPortrayal';

@connect(({ loading, resPortrayal, dispatch }) => ({
  resPortrayal,
  dispatch,
  loading,
}))
@mountToTab()
class PortTaskModal extends PureComponent {
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

  render() {
    const {
      resPortrayal: { twResPortTaskView },
    } = this.props;
    const { visible, defaultPagination } = this.state;

    const tableProps = {
      rowKey: 'resCertId',
      columnsCache: DOMAIN,
      sortBy: 'resCertId',
      sortDirection: 'DESC',
      loading: false,
      total: 0,
      dataSource: twResPortTaskView,
      showSearch: false,
      showColumn: false,
      showExport: false,
      enableSelection: false,
      pagination: defaultPagination,
      searchBarForm: [],
      columns: [
        {
          title: '任务',
          dataIndex: 'taskName',
          align: 'center',
        },
        {
          title: '事由',
          dataIndex: 'reasonMerge',
          align: 'center',
        },
        {
          title: '复合能力',
          dataIndex: 'merge',
          align: 'center',
        },
        {
          title: '评价得分',
          dataIndex: 'evalScore',
          align: 'center',
        },
      ],
    };

    return (
      <Modal
        title="任务履历"
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
        <DataTable {...tableProps} />
      </Modal>
    );
  }
}

export default PortTaskModal;
