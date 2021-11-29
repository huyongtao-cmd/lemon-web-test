import { connect } from 'dva';
import React from 'react';
import { Modal } from 'antd';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';

const DOMAIN = 'evalDetailModal';
const { Description } = DescriptionList;

class EvalDetailModal extends React.PureComponent {
  render() {
    const { dispatch, visible, toggle, source } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      showColumn: false,
      enableSelection: false,
      showExport: false,
      pagination: false,
      dataSource: source.itemList,
      columns: [
        {
          title: '评价点',
          dataIndex: 'evalItemName',
          align: 'center',
          width: 150,
        },
        {
          title: '评分(分)',
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
        onCancel={toggle}
        footer={null}
      >
        <DescriptionList size="small" col={2} noReactive>
          <Description term="评价对象" labelWidth={70}>
            {source.evalTarget}
          </Description>
          <Description term="评价日期" labelWidth={70}>
            {source.evalDate}
          </Description>
          <Description term="评价类别" labelWidth={70}>
            {source.evalClassName}
          </Description>
          <Description term="评价类型" labelWidth={70}>
            {source.evalTypeName}
          </Description>
          <Description term="评价人" labelWidth={70}>
            {source.evalerResName}
          </Description>
          <Description term="被评价人" labelWidth={70}>
            {source.evaledResName}
          </Description>
          <Description term="评语" labelWidth={70} className="x-fill-100">
            <pre>{source.evalComment}</pre>
          </Description>
        </DescriptionList>

        <span style={{ paddingLeft: 24 }}>{`平均分数: ${source.averageScore}`}</span>

        <DataTable {...tableProps} />
      </Modal>
    );
  }
}

export default EvalDetailModal;
