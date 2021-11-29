import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Modal, Divider, Table } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import DescriptionList from '@/components/layout/DescriptionList';

const { Description } = DescriptionList;
const DOMAIN = 'trainAblityList';

@connect(({ loading, dispatch, trainAblityList, user }) => ({
  loading: loading.effects[`${DOMAIN}/getTrainingList`],
  dispatch,
  trainAblityList,
  user,
}))
@mountToTab()
class FitTrainModal extends PureComponent {
  componentDidMount() {}

  render() {
    const {
      loading,
      visible,
      closeModal,
      row,
      trainAblityList: { trainingList },
    } = this.props;

    const columns = [
      {
        title: '培训项目',
        dataIndex: 'progName',
        align: 'center',
        width: '20%',
      },
      {
        title: '学习进度',
        dataIndex: 'trnCurProg',
        align: 'center',
        width: '20%',
      },
      {
        title: '开始日期',
        dataIndex: 'startDate',
        align: 'center',
        width: '20%',
      },
      {
        title: '截止日期',
        dataIndex: 'endDate',
        align: 'center',
        width: '20%',
      },
      {
        title: '状态',
        dataIndex: 'trnStatusName',
        align: 'center',
        width: '20%',
      },
    ];
    return (
      <Modal
        centered
        title="适岗培训"
        visible={visible}
        destroyOnClose
        onCancel={closeModal}
        width="60%"
        footer={null}
      >
        <Card bordered={false} className="tw-card-adjust">
          <DescriptionList layout="horizontal" col={2}>
            <Description term="资源">{row.personName}</Description>
            <Description term="考核能力">{row.capasetLevelName}</Description>
          </DescriptionList>
          <Divider dashed />
          <FieldList legend="适岗培训" noReactive>
            <Table
              style={{ marginBottom: 24 }}
              pagination={false}
              loading={loading}
              dataSource={trainingList}
              columns={columns}
              rowKey="id"
              scroll={trainingList.length > 5 ? { y: 200 } : {}}
              bordered
            />
          </FieldList>
        </Card>
      </Modal>
    );
  }
}

export default FitTrainModal;
