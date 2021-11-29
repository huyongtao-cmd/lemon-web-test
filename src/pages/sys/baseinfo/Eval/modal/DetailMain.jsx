import { connect } from 'dva';
import React from 'react';
import { Card, Input, Modal, Tooltip, Divider, Rate, Icon } from 'antd';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';

const DOMAIN = 'sysEvalMain';
const { Description } = DescriptionList;

@connect(({ loading, sysEvalMain, dispatch }) => ({
  loading,
  sysEvalMain,
  dispatch,
}))
class DetailMainModal extends React.Component {
  handleCancel = () => {
    const { dispatch, toggle } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    toggle();
  };

  render() {
    const {
      dispatch,
      loading,
      visible,
      sysEvalMain: { formData },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/query`],
      expirys: 0,
      // total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      showColumn: false,
      enableSelection: false,
      showExport: false,
      pagination: false,
      dataSource: formData.itemList,
      columns: [
        {
          title: '评价点',
          dataIndex: 'evalPoint',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'evalStatusName',
          align: 'center',
        },
        {
          title: '分数下限',
          dataIndex: 'scoreFrom',
          align: 'center',
        },
        {
          title: '分数上限',
          dataIndex: 'scoreTo',
          align: 'center',
        },
        {
          title: '评分标准',
          dataIndex: 'standardDesc',
          width: '40%',
          render: value => <pre>{value}</pre>,
        },
      ],
    };

    return (
      <Modal
        width="60%"
        destroyOnClose
        title="评价主数据详情"
        visible={visible}
        onCancel={this.handleCancel}
        footer={null}
      >
        <DescriptionList size="large" col={2}>
          <Description term="评价类别">{formData.evalClassName}</Description>
          <Description term="评价类型">{formData.evalTypeName}</Description>
          <DescriptionList size="large" col={1}>
            <Description term="评价描述">
              <pre>{formData.evalDesc}</pre>
            </Description>
          </DescriptionList>
        </DescriptionList>

        <Divider dashed />

        <div className="tw-card-title">评价点明细</div>
        <DataTable {...tableProps} />
      </Modal>
    );
  }
}

export default DetailMainModal;
