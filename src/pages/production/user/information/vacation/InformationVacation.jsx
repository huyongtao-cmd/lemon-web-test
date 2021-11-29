// 框架类
import React, { Component } from 'react';
import { Form } from 'antd';
// 产品化组件
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable from '@/components/production/business/SearchTable';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Button from '@/components/production/basic/Button';
import ButtonCard from '@/components/production/layout/ButtonCard';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import { outputHandle } from '@/utils/production/outputUtil';

@Form.create()
class InformationVacation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  renderSearchForm = () => [
    <SearchFormItem
      key="testDate"
      fieldType="BaseDatePicker"
      label="年度"
      fieldKey="testDate"
      defaultShow={false} // 判断默认查询是否显示该字段
      advanced // 是否高级查询条件,默认为否
    />,
    <SearchFormItem
      key="baseSelect"
      fieldType="BaseSelect"
      label="假期类型"
      fieldKey="baseSelect"
      parentKey="FUNCTION:SYSTEM_REMIND:TYPE"
    />,
  ];

  render() {
    const columns = [
      {
        title: '年度',
        dataIndex: '',
        // sorter: true,
        // render: (value, row, index) => (
        //   <Link twUri={`/demo/prod/case/singleCaseDetail?id=${row.id}&mode=DESCRIPTION`}>
        //     {value}
        //   </Link>
        // ),
      },
      {
        title: '假期类型',
        dataIndex: '',
      },
      {
        title: '起始',
        dataIndex: '',
      },
      {
        title: '截止',
        dataIndex: '',
      },
      {
        title: '有效期',
        dataIndex: '',
      },
      {
        title: '总数',
        dataIndex: '',
      },
      {
        title: '已用',
        dataIndex: '',
      },
      {
        title: '可用',
        dataIndex: '',
      },
    ];

    return (
      <PageWrapper>
        <SearchTable
          defaultAdvancedSearch={false} // 查询条件默认为高级查询
          showSearchCardTitle={false} // 是否展示查询区域Card的头部
          searchForm={this.renderSearchForm()} // 查询条件
          selectType={null} // 禁止勾选
          showExport // 是否显示导出按钮
          showColumnSwitch // 是否显示列控制器
          defaultSortBy="id"
          // fetchData={this.fetchData}
          defaultSortDirection="DESC"
          columns={columns} // 要展示的列
          autoSearch={false} // 进入页面默认查询数据
        />
      </PageWrapper>
    );
  }
}

export default InformationVacation;
