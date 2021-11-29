import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form } from 'antd';
import DataTable from '@/components/common/DataTable';
import DescriptionList from '@/components/layout/DescriptionList';

const DOMAIN = 'orgbu';

@connect(({ loading, orgbu }) => ({
  loading,
  orgbu,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateBasic`,
      payload: { key, value },
    });
  },
})
class BuResInfo extends PureComponent {
  state = {
    buModalVisible: false,
    selectValue: {
      buName: '',
    },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryBuTree`,
    });
  }

  render() {
    const { form, loading, orgbu, dispatch } = this.props;
    const { getFieldDecorator } = form;
    const { mode, formData, buTree } = orgbu;
    const { selectValue, buModalVisible } = this.state;

    const tableData = [
      {
        s1: '1',
        s2: '2',
        s3: '3',
        s4: '4',
        s5: '5',
        s6: '6',
        s7: '7',
      },
      {
        s1: '1',
        s2: '2',
        s3: '3',
        s4: '4',
        s5: '5',
        s6: '6',
        s7: '7',
      },
    ];

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      // limit: stringUtils.queryURL('limit'),
      // offset: stringUtils.queryURL('offset'),
      sortDirection: 'DESC',
      // scroll: {
      //   x: 1100,
      // },
      columnsCache: DOMAIN,
      dispatch,
      // loading,
      expirys: 0,
      dataSource: tableData,
      showSearch: false,
      showColumn: false,
      onChange: filters => {
        // console.log('onChange--', filters);
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      columns: [
        {
          title: '日期从',
          dataIndex: 's1',
          width: '15%',
          sorter: true,
        },
        {
          title: '日期到',
          dataIndex: 's2',
          width: '15%',
          sorter: true,
        },
        {
          title: '期间名称',
          dataIndex: 's3',
          width: '30%',
          sorter: true,
        },
        {
          title: '备注',
          dataIndex: 's4',
          width: '40%',
          sorter: true,
        },
      ],
    };

    return (
      <DescriptionList size="large" title="考核期间">
        <DataTable {...tableProps} />
      </DescriptionList>
    );
  }
}

export default BuResInfo;
