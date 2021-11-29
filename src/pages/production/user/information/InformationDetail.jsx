// 框架类
import React, { Component } from 'react';
import { Card } from 'antd';

// 产品化组件
import PageWrapper from '@/components/production/layout/PageWrapper';
import { informationTabList } from '@/pages/plat/res/profile/config';
import DescriptionList from '@/components/layout/DescriptionList';
import { outputHandle } from '@/utils/production/outputUtil';
import Loading from '@/components/core/DataLoading';
import SearchTable from '@/components/production/business/SearchTable';
import { handleEmptyProps } from '@/utils/production/objectUtils.ts';
import FormItem from '@/components/production/business/FormItem';
import BusinessForm from '@/components/production/business/BusinessForm';

// 接口
import { informationDetail, changeList } from '@/services/production/user';
import VacationMgmt from '../../res/vacApply/listPage';
import TrainRecords from './train/TrainRecords';

const { Description } = DescriptionList;

class InformationDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operationkey: 'basic',
      formData: {},
      loading: false,
      id: props.history.location.query.id,
      changeRecordList: [],
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
    const { data } = await outputHandle(informationDetail, { id });
    this.setState({
      formData: { ...data },
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
    if (key === 'basic') {
      formData;
    } else if (key === 'changeRecord') {
      changeRecordList;
    }
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
        title: '年薪（单位：元）',
        dataIndex: 'salary',
      },
      {
        title: '奖金类型',
        dataIndex: 'bonusType',
      },
      {
        title: '工作地',
        dataIndex: 'baseCity',
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

    // 培训记录列
    const trainColumns = [
      {
        title: '课程名称',
        dataIndex: '',
        // sorter: true,
        // render: (value, row, index) => (
        //   <Link twUri={`/demo/prod/case/singleCaseDetail?id=${row.id}&mode=DESCRIPTION`}>
        //     {value}
        //   </Link>
        // ),
      },
      {
        title: '姓名',
        dataIndex: '',
      },
      {
        title: '员工编号',
        dataIndex: '',
      },
      {
        title: '所属公司',
        dataIndex: '',
      },
      {
        title: '所属BU',
        dataIndex: '',
      },
      {
        title: '工作地',
        dataIndex: '',
      },
      {
        title: '职级',
        dataIndex: '',
      },
      {
        title: '职位',
        dataIndex: '',
      },
      {
        title: '直属上级',
        dataIndex: '',
      },
      {
        title: '入职日期',
        dataIndex: '',
      },
      {
        title: '课程类型',
        dataIndex: '',
      },
      {
        title: '邮箱',
        dataIndex: '',
      },
      {
        title: '课程时间',
        dataIndex: '',
      },
      {
        title: '课程时长',
        dataIndex: '',
      },
      {
        title: '费用',
        dataIndex: '',
      },
      {
        title: '供应商',
        dataIndex: '',
      },
      {
        title: '备注',
        dataIndex: '',
      },
    ];

    // 薪资信息列
    const salaryColumns = [
      {
        title: '姓名',
        dataIndex: '',
        // sorter: true,
        // render: (value, row, index) => (
        //   <Link twUri={`/demo/prod/case/singleCaseDetail?id=${row.id}&mode=DESCRIPTION`}>
        //     {value}
        //   </Link>
        // ),
      },
      {
        title: '年薪（单位：元）',
        dataIndex: '',
      },
      {
        title: '月薪（单位：元）',
        dataIndex: '',
      },
      {
        title: '奖金类型',
        dataIndex: '',
      },
      {
        title: '生效日期',
        dataIndex: '',
      },
    ];

    const contentList = {
      // 基本信息
      basic: (
        <div>
          <BusinessForm
            title="基本信息"
            // form={form}
            formData={formData}
            formMode="DESCRIPTION"
            defaultColumnStyle={8}
          >
            <FormItem fieldType="BaseInput" label="用户名" fieldKey="login" />

            <FormItem fieldType="BaseInput" label="姓名" fieldKey="name" />

            <FormItem fieldType="BaseInput" label="员工编号" fieldKey="resNo" />

            <FormItem
              fieldType="BaseAllOuSimpleSelect"
              label="所属公司"
              fieldKey="ouId"
              descriptionRender={formData.ouName}
            />

            <FormItem
              fieldType="BuSimpleSelect"
              label="所属BU"
              fieldKey="buId"
              descriptionRender={formData.buName}
            />

            <FormItem
              fieldType="BaseCustomSelect"
              label="工作地"
              fieldKey="baseCity"
              parentKey="CUS:CITY"
            />

            <FormItem
              fieldType="BaseCustomSelect"
              label="职级"
              fieldKey="jobGrade"
              parentKey="CUS:JOB_GRADE"
              descriptionRender={formData.jobGrade}
            />

            <FormItem fieldType="BaseInput" label="职位" fieldKey="position" />

            <FormItem
              fieldType="ResSimpleSelect"
              label="直属上级"
              fieldKey="parentResId"
              descriptionRender={formData.presName}
            />

            <FormItem
              fieldType="BaseDatePicker"
              label="入职日期"
              fieldKey="enrollDate"
              defaultShow
            />

            <FormItem fieldType="BaseInputNumber" label="手机号" fieldKey="phone" />

            <FormItem fieldType="BaseInput" label="邮箱" fieldKey="email" />

            <FormItem fieldType="BaseDatePicker" label="生日" fieldKey="birthday" />

            <FormItem
              fieldType="BaseSelect"
              label="资源类型"
              fieldKey="resType1"
              descList={[
                { value: 'INTERNAL_RES', title: '内部资源' },
                { value: 'EXTERNAL_RES', title: '外部资源' },
              ]}
            />

            <FormItem
              fieldType="BaseSelect"
              label="性别"
              fieldKey="gender"
              parentKey="COM:GENDER"
            />

            <FormItem fieldType="BaseInput" label="银行" fieldKey="bankName" />

            <FormItem fieldType="BaseInput" label="户名" fieldKey="holderName" />

            <FormItem fieldType="BaseInput" label="银行账号" fieldKey="accountNo" />
            <FormItem
              fieldType="FileUpload"
              fieldKey="file"
              label="合同"
              multiple
              // fileList={attachments}
              preview
            />
            <FormItem
              fieldType="FileUpload"
              fieldKey="file"
              label="保密协议"
              multiple
              // fileList={attachments}
              preview
            />
            <FormItem
              fieldType="FileUpload"
              fieldKey="file"
              label="简历"
              multiple
              // fileList={attachments}
              preview
            />
            <FormItem
              fieldType="BaseFileManagerEnhance"
              fieldKey="testFile"
              label="个人生活照"
              multiple // 是否可以多选上传
              preview
              // fileList={attachments} // 文件集合
              // preview={ // 详情模式显示
              //   currentNode !== 'create' &&
              //   currentNode !== 'applyEdit' &&
              //   currentNode !== 'advanceEdit'
              // }
            />
          </BusinessForm>
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
        // <div>
        //   <SearchTable
        //     showExport={false} // 是否显示导出按钮
        //     showColumnSwitch={false} // 是否显示列控制器
        //     defaultAdvancedSearch={false} // 查询条件默认为高级查询
        //     showSearchCardTitle={false} // 是否展示查询区域Card的头部
        //     selectType={null} // 禁止勾选
        //     defaultSortBy='id'
        //     fetchData={this.fetchData}
        //     defaultSortDirection='DESC'
        //     columns={columns} // 要展示的列
        //     autoSearch // 进入页面默认查询数据
        //     tableExtraProps={{ scroll: { x: 2400 } }}
        //     loading={changeRecordLoading}
        //   />
        // </div>
      ),
      // 假期列表
      vacation: (
        <div>
          <VacationMgmt userId={id} />
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
            // fetchData={this.fetchData}
            defaultSortDirection="DESC"
            columns={salaryColumns} // 要展示的列
            autoSearch={false} // 进入页面默认查询数据
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
