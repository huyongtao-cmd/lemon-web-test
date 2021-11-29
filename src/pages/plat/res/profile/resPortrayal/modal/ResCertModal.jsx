import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Button } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import { FileManagerEnhance } from '@/pages/gen/field';
import { equals, type } from 'ramda';

const DOMAIN = 'resPortrayal';

@connect(({ loading, resPortrayal, dispatch }) => ({
  resPortrayal,
  dispatch,
  loading,
}))
@mountToTab()
class ResCertModal extends PureComponent {
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
      dispatch,
      resPortrayal: { twResCertView },
    } = this.props;
    const { visible, defaultPagination } = this.state;

    const tableProps = {
      rowKey: 'resCertId',
      columnsCache: DOMAIN,
      sortBy: 'resCertId',
      sortDirection: 'DESC',
      loading: false,
      total: 0,
      dataSource: twResCertView,
      showSearch: false,
      showColumn: false,
      showExport: false,
      enableSelection: false,
      pagination: defaultPagination,
      searchBarForm: [],
      columns: [
        {
          title: '证书名称',
          dataIndex: 'certName',
          align: 'center',
        },
        {
          title: '证书号码',
          dataIndex: 'certNo',
          align: 'center',
        },
        {
          title: '获得时间',
          dataIndex: 'obtainDate',
          align: 'center',
        },
        {
          title: '颁发机构',
          dataIndex: 'releaseBy',
          align: 'center',
        },
        {
          title: '分数',
          dataIndex: 'score',
          align: 'center',
        },
        {
          title: '等级',
          dataIndex: 'grade',
          align: 'center',
        },
        {
          title: '证书附件',
          dataIndex: 'ResCertId',
          align: 'center',
          render: (value, row) => (
            <FileManagerEnhance
              api="/api/person/v1/res/cert/sfs/token"
              dataKey={row.resCertId}
              listType="text"
              disabled
              preview
            />
          ),
        },
      ],
    };

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
        <DataTable {...tableProps} />
      </Modal>
    );
  }
}

export default ResCertModal;
