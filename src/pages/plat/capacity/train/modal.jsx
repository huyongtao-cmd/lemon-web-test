import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Modal, Divider, Tooltip } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import DescriptionList from '@/components/layout/DescriptionList';
import Link from 'umi/link';

const { Description } = DescriptionList;
const DOMAIN = 'platTrain';

@connect(({ loading, dispatch, platTrain, user }) => ({
  loading:
    loading.effects[`${DOMAIN}/queryCapaSetList`] || loading.effects[`${DOMAIN}/queryCapaList`],
  dispatch,
  platTrain,
  user,
}))
@mountToTab()
class AssoabilityModal extends PureComponent {
  componentDidMount() {
    this.fetchCapaList();
    this.fetchCapaSetList();
  }

  fetchCapaList = param => {
    const { dispatch, selectedRow } = this.props;
    dispatch({
      type: `${DOMAIN}/queryCapaList`,
      payload: {
        trainingProgId: selectedRow.id,
        ...param,
      },
    });
  };

  fetchCapaSetList = param => {
    const { dispatch, selectedRow } = this.props;
    dispatch({
      type: `${DOMAIN}/queryCapaSetList`,
      payload: {
        trainingProgId: selectedRow.id,
        ...param,
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      visible,
      closeModal,
      selectedRow,
      platTrain: { capaDataSource, capaTotal, capaSetDataSource, capaSetTotal },
    } = this.props;

    const capaTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      scroll: { y: 200 },
      dispatch,
      loading,
      total: capaTotal,
      enableSelection: false,
      showColumn: false,
      showSearch: false,
      showExport: false,
      dataSource: capaDataSource,
      onChange: filters => this.fetchCapaList(filters),
      columns: [
        {
          title: '单项能力',
          dataIndex: 'capaName',
          align: 'center',
          width: '30%',
          render: (val, row, index) => {
            const href = `/hr/capacity/capa_edit?id=${row.capaId}`;
            return (
              <Link
                className="tw-link"
                to={href}
                onClick={() => {
                  closeModal();
                }}
              >
                {val}
              </Link>
            );
          },
        },
        {
          title: '分类一',
          dataIndex: 'capaType1Name',
          align: 'center',
          width: '20%',
        },
        {
          title: '分类二',
          dataIndex: 'capaType2Name',
          align: 'center',
          width: '20%',
        },
        {
          title: '能力描述',
          dataIndex: 'capaDesc',
          width: '30%',
          align: 'center',
          render: (val, row, index) =>
            val && val.length > 50 ? (
              <Tooltip placement="top" title={val}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '400px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {val}
                </span>
              </Tooltip>
            ) : (
              <pre>{val}</pre>
            ),
        },
      ],
    };
    const capaSetTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      scroll: { y: 200 },
      dispatch,
      loading,
      total: capaSetTotal,
      enableSelection: false,
      showColumn: false,
      showSearch: false,
      showExport: false,
      dataSource: capaSetDataSource,
      onChange: filters => this.fetchCapaSetList(filters),
      columns: [
        {
          title: '复合能力',
          dataIndex: 'capaSetName',
          align: 'center',
          width: '40%',
          render: (val, row, index) => {
            const href = `/hr/capacity/set_edit?id=${row.capaSetId}`;
            return (
              <Link
                className="tw-link"
                to={href}
                onClick={() => {
                  closeModal();
                }}
              >
                {val}
              </Link>
            );
          },
        },
        {
          title: '相关单项能力',
          dataIndex: 'capaNames',
          align: 'center',
          width: '60%',
          render: (val, row, index) =>
            val && val.length > 50 ? (
              <Tooltip placement="top" title={val}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '500px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {val}
                </span>
              </Tooltip>
            ) : (
              <pre>{val}</pre>
            ),
        },
      ],
    };
    return (
      <Modal
        centered
        title="关联能力"
        visible={visible}
        destroyOnClose
        onCancel={closeModal}
        width="70%"
        footer={null}
      >
        <Card bordered={false} className="tw-card-adjust">
          <div>
            <span style={{ fontSIze: '20px', fontWeight: 'bold' }}>{selectedRow.progName}</span>
          </div>
          <Divider />
          <FieldList legend="单项能力" noReactive>
            <DataTable {...capaTableProps} />
          </FieldList>
          <FieldList legend="复合能力" noReactive>
            <DataTable {...capaSetTableProps} />
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default AssoabilityModal;
