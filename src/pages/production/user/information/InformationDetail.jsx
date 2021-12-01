// 框架类
import React, { Component } from 'react';
import { Card } from 'antd';

// 产品化组件
import PageWrapper from '@/components/production/layout/PageWrapper';
import { informationTabList } from '@/pages/plat/res/profile/config';
import { outputHandle } from '@/utils/production/outputUtil';
import Loading from '@/components/core/DataLoading';
import SearchTable from '@/components/production/business/SearchTable';
import { handleEmptyProps } from '@/utils/production/objectUtils.ts';
import { fromQs } from '@/utils/stringUtils';

// 接口
import { informationDetail, changeList } from '@/services/production/user';
import TrainRecords from './train/TrainRecords';
import MyVacationList from '../../res/vacApply/listPage/myList';
import InformationDisplay from './InformationDisplay';

/***
 * 员工详情页
 */
class InformationDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operationkey: 'basic', // 控制tab，进入详情界面默认显示基本信息tab
      formData: {},
      loading: false,
      id: props.history.location.query.id,
      changeRecordList: [], // 异动信息列表
      changeRecordLoading: false, // 异动记录loading
      trainLoading: true, // 培训记录loading
    };
  }

  componentDidMount() {
    this.loadData(); // 基本信息
    // this.changeRecordList(); // 异动记录
  }

  loadData = async () => {
    // eslint-disable-next-line react/destructuring-assignment
    const { id } = this.state;
    this.setState({ loading: true });
    const res = await outputHandle(informationDetail, { id });
    const {
      data,
      data: { personExpand },
    } = res;
    this.setState({
      formData: {
        ...data,
        personExpand,
      },
      loading: false,
    });
  };

  fetchData = async params => {
    const { id, changeRecordLoading } = this.state;
    let wrappedParam = { ...params, id };
    wrappedParam = handleEmptyProps(wrappedParam); // 处理空属性,可以处理list,{},字符串
    this.setState({ changeRecordLoading: true });
    const { data } = await outputHandle(changeList, wrappedParam);
    this.setState({
      changeRecordList: data,
      changeRecordLoading: false,
    });
    return data;
  };

  // 切换Tab
  onOperationTabChange = key => {
    const { formData, changeRecordList } = this.state;
    this.setState({ operationkey: key });
    // if (key === 'basic') {
    //   formData;
    // } else if (key === 'changeRecord') {
    //   changeRecordList;
    // }
    // else if (key ==='salary'){
    //   changeRecordList
    // }
  };

  render() {
    const {
      operationkey,
      formData,
      loading,
      changeRecordLoading,
      trainLoading = true,
      id,
    } = this.state;
    const { resId } = fromQs();
    // 异动记录列
    const columns = [
      {
        title: '姓名',
        dataIndex: 'userName',
        // sorter: true,
        // render: (value, row, index) => (
        //   <Link twUri={`/demo/prod/case/singleCaseDetail?id=${row.id}&mode=DESCRIPTION`}>
        //     {value}
        //   </Link>
        // ),
      },
      {
        title: '所属BU',
        dataIndex: 'buName',
        // sorter: true,
      },
      {
        title: '职位',
        dataIndex: 'position',
        // sorter: true,
      },
      {
        title: '职级',
        dataIndex: 'jobGrade',
      },
      {
        title: '月薪（单位：元）',
        dataIndex: 'salary',
      },
      {
        title: '奖金类型',
        dataIndex: 'bonusType',
      },
      {
        title: '工作地',
        dataIndex: 'baseCityDesc',
      },
      {
        title: '直属上级',
        dataIndex: 'parentResName',
      },
      {
        title: '生效日期',
        dataIndex: 'effectiveDate',
      },
    ];

    // 薪资信息列
    const salaryColumns = [
      {
        title: '姓名',
        dataIndex: 'userName',
      },
      {
        title: '年薪（单位：元）',
        dataIndex: '',
      },
      {
        title: '月薪（单位：元）',
        dataIndex: 'salary',
      },
      {
        title: '奖金类型',
        dataIndex: 'bonusType',
      },
      {
        title: '生效日期',
        dataIndex: 'effectiveDate',
      },
    ];

    const contentList = {
      // 基本信息
      basic: (
        <div>
          <InformationDisplay />
        </div>
      ),
      // 异动记录
      changeRecord: (
        <div>
          <SearchTable
            tableTitle="异动历史"
            loading={changeRecordLoading}
            selectType={null} // 禁止勾选
            showExport={false} // 是否显示导出按钮
            showColumnSwitch={false} // 是否显示列控制器
            defaultSortBy="id"
            fetchData={this.fetchData}
            defaultSortDirection="DESC"
            columns={columns} // 要展示的列
            autoSearch // 进入页面默认查询数据
          />
        </div>
      ),
      // 培训记录
      train: (
        <div>
          <TrainRecords userId={id} />
        </div>
      ),
      // 假期列表
      vacation: (
        <div>
          <MyVacationList userId={id} resId={resId} />
        </div>
      ),
      // 薪资信息
      salary: (
        <div>
          <SearchTable
            tableTitle="薪资信息"
            selectType={null} // 禁止勾选
            showExport={false} // 是否显示导出按钮
            showColumnSwitch={false} // 是否显示列控制器
            defaultSortBy="id"
            fetchData={this.fetchData}
            defaultSortDirection="DESC"
            columns={salaryColumns} // 要展示的列
            autoSearch // 进入页面默认查询数据
          />
        </div>
      ),
    };

    return (
      <PageWrapper>
        <Card
          className="tw-card-multiTab"
          bordered={false}
          activeTabKey={operationkey}
          tabList={informationTabList}
          onTabChange={this.onOperationTabChange}
        >
          {!formData.id ? <Loading /> : contentList[operationkey]}
        </Card>
      </PageWrapper>
    );
  }
}

export default InformationDetail;
