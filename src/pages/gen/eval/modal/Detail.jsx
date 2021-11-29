import { connect } from 'dva';
import React from 'react';
import { Modal } from 'antd';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';

const DOMAIN = 'evalDetailModal';
const { Description } = DescriptionList;

@connect(({ loading, evalDetailModal, dispatch }) => ({
  loading,
  evalDetailModal,
  dispatch,
}))
class EvalDetailModal extends React.Component {
  handleCancel = () => {
    const { toggle } = this.props;
    toggle();
  };

  render() {
    const {
      dispatch,
      loading,
      visible,
      evalDetailModal: { formData, dataSource, total },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/query`],
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      showColumn: false,
      enableSelection: false,
      showExport: false,
      pagination: false,
      dataSource,
      columns: [
        {
          title: '评价点',
          dataIndex: 'evalItemName',
          align: 'center',
          width: 150,
        },
        {
          title: '评分',
          dataIndex: 'evalScore',
          align: 'center',
          width: 80,
        },
        {
          title: '简评',
          dataIndex: 'evalComment',
          render: value => <pre>{value}</pre>,
        },
      ],
    };

    return (
      <Modal
        width={950}
        destroyOnClose
        title="评价详情"
        visible={visible}
        onCancel={this.handleCancel}
        footer={null}
      >
        <DescriptionList size="small" col={2} noReactive>
          <Description term="评价对象" labelWidth={70}>
            {formData.sourceName}
          </Description>
          <Description term="评价日期" labelWidth={70}>
            {formData.evalDate}
          </Description>
          <Description term="评价类别" labelWidth={70}>
            {formData.evalClassName}
          </Description>
          <Description term="评价类型" labelWidth={70}>
            {formData.evalTypeName}
          </Description>
          <Description term="评价人" labelWidth={70}>
            {formData.evalerResName}
          </Description>
          <Description term="被评价人" labelWidth={70}>
            {formData.evaledResName}
          </Description>
          <Description term="评语" labelWidth={70} className="x-fill-100">
            <pre>{formData.evalComment}</pre>
          </Description>
        </DescriptionList>

        <span style={{ paddingLeft: 24 }}>{`平均分数: ${formData.averageScore}`}</span>
        <DataTable {...tableProps} />
      </Modal>
    );
  }
}

export default EvalDetailModal;
