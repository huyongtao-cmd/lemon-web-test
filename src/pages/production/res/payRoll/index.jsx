import React from 'react';
import { connect } from 'dva';
import { Form, Switch, Row, Col } from 'antd';
import { isEmpty, omit } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ExcelImportExport from '@/components/common/ExcelImportExport';
import SearchTable from '@/components/production/business/SearchTable';
import PayRollDetail from './components/detail';
import { outputHandle } from '@/utils/production/outputUtil';
import createMessage from '@/components/core/AlertMessage';
import { payRollPagingRq, payRollDeleteRq } from '@/services/production/res';

import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';

const DOMAIN = 'resPayRoll';

@connect(({ loading, dispatch, resPayRoll }) => ({
  loading,
  dispatch,
  resPayRoll,
}))
class Payroll extends React.Component {
  state = {
    visible: false,
    failedList: [],
    formData: {},
  };

  componentDidMount() {}

  fetchData = async params => {
    const { response } = await payRollPagingRq({
      ...params,
    });
    this.setState({ formData: response.data });
    return response.data;
  };

  toggleImportVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible }, () => {
      this.setState({
        failedList: [],
      });
    });
  };

  renderColumns = () => {
    const { pageConfig } = this.props;

    const fields = [
      {
        title: '序号',
        dataIndex: '序号',
        align: 'center',
      },
      {
        title: '年份',
        dataIndex: '年份',
        align: 'center',
      },
      {
        title: '月份',
        dataIndex: '月份',
        align: 'center',
      },
      {
        title: '部门',
        dataIndex: '部门',
        align: 'center',
      },
      {
        title: '用户名',
        dataIndex: '用户名',
        align: 'center',
      },
      {
        title: '姓名',
        dataIndex: '姓名',
        align: 'center',
      },
      {
        title: '操作',
        align: 'center',
        render: (value, row) => (
          <a
            onClick={() => {
              this.onRow(row);
            }}
          >
            查看明细
          </a>
        ),
      },
    ];

    return fields;
  };

  renderSearchForm = () => {
    const { pageConfig } = this.props;

    const fields = [
      <SearchFormItem
        key="year"
        fieldKey="year"
        label="年份"
        placeholder="请输入年份"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="月份"
        fieldKey="month"
        key="month"
        placeholder="请输入月份"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="部门名称"
        fieldKey="buName"
        key="buName"
        placeholder="请输入部门名称"
        // fieldType="BuSimpleSelect"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="姓名"
        fieldKey="queryName"
        key="queryName"
        placeholder="请输入姓名/用户名"
        // fieldType="ResSimpleSelect"
        fieldType="BaseInput"
        defaultShow
      />,
    ];

    return fields;
  };

  deleteData = async keys =>
    outputHandle(payRollDeleteRq, { ids: keys.join(',') }, undefined, false);

  onRow = data => {
    this.setState({ formData: data });
  };

  handleUpload = fileList => {
    const fileData = new FormData();
    fileList.forEach(file => {
      fileData.append('excel', file);
    });
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/upload`,
      payload: fileData,
    }).then(res => {
      if (res.ok) {
        createMessage({ type: 'success', description: '上传成功' });
        this.toggleImportVisible();

        const { getInternalState } = this.state;
        const { refreshData } = getInternalState();
        refreshData();
        return;
      }
      if (res.data && Array.isArray(res.data) && !isEmpty(res.data)) {
        let errorMsgs = '';
        if (res.errors) {
          res.errors.forEach(error => {
            errorMsgs += error.msg;
          });
        }
        createMessage({
          type: 'warn',
          description: errorMsgs || '部分数据上传失败，请下载错误数据进行更正',
        });
        this.setState({
          failedList: res.data,
        });
      } else {
        let errorMsgs = '';
        if (res.errors) {
          res.errors.forEach(error => {
            errorMsgs += error.msg;
          });
        }
        createMessage({ type: 'error', description: errorMsgs || '部分数据上传失败,返回结果为空' });
        this.toggleImportVisible();
      }
    });
  };

  render() {
    const { dispatch, loading } = this.props;
    const { getInternalState, visible, failedList, projectId, formData = {} } = this.state;
    const obj = {
      ...omit(
        ['oldId', '序号', '年份', '月份', '部门', '用户名', '姓名', 'rows', 'total'],
        formData
      ),
    };
    const excelImportProps = {
      // eslint-disable-next-line no-restricted-globals
      templateUrl: location.origin + `/template/payRollTemplate_new.xls`,
      option: {
        fileName: '导入失败记录',
        datas: [
          {
            sheetName: '导入失败记录', // 表名
            sheetFilter: [
              'serNo',
              'year',
              'month',
              'buName',
              'userName',
              'name',
              'yearlySalary',
              'monthlySalary',
              'standard',
              'ticketWage',
              'holidayExpenses',
              'addition',
              'deduction',
              'grossPay',
              'socialBaseAmt',
              'accumulationFundBaseAmt',
              'endowmentInsurance',
              'medicare',
              'unemploymentInsurance',
              'perAccFund',
              'addPerAccFund',
              'accumulationFundTotalAmT',
              'childrenEducation',
              'supElderly',
              'housingLoanInterest',
              'housingRent',
              'continuingEducation',
              'monDeductionTotalAmt',
              'taxableIncome',
              'totalTaxAmt',
              'totalPsnTaxAmt',
              'personalIncomeTax',
              'netPaySum',
              'taxThirteenSalary',
              'taxYearBonus',
              'thirteenAndBonusPreTax',
              'thirteenAndBonusPsnTax',
              'thirteenAndBonus',
              'remark',
              'errorMessage',
            ], // 列过滤
            sheetHeader: [
              '序号',
              '年份',
              '月份',
              '部门名称',
              '用户名',
              '姓名',
              '2021年薪',
              '2021月薪',
              '工资核算表标准',
              '贴票工资（税后）',
              '过节费',
              '其他加项',
              '其他扣项',
              '应发工资',
              '社保基数',
              '公积金基数',
              '养老保险',
              '医疗保险',
              '失业保险',
              '公积金',
              '补充公积金',
              '本月个人交金合计',
              '子女教育',
              '赡养老人',
              '住房贷款利息',
              '住房租金',
              '继续教育',
              '本月专项扣除合计',
              '本月应纳税工资',
              '累计应纳税所得额',
              '累计应纳个税额',
              '本月应扣个税额',
              '本月实发工资',
              '计税13薪',
              '计税年终奖',
              '税前十三薪+年终奖',
              '13薪+年终奖个税',
              '实发计税13薪+年终奖',
              '备注',
              '失败原因',
            ], // 第一行标题
            columnWidths: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8], // 列宽 需与列顺序对应
          },
        ],
      },
      controlModal: {
        visible,
        failedList,
        uploading: loading.effects[`${DOMAIN}/upload`],
      },
    };

    return (
      <PageWrapper>
        <Row gutter={8}>
          <Col span={16}>
            <ExcelImportExport
              {...excelImportProps}
              closeModal={this.toggleImportVisible}
              handleUpload={this.handleUpload}
            />
            <SearchTable
              wrapperInternalState={internalState => {
                this.setState({ getInternalState: internalState });
              }}
              defaultSortBy="id"
              defaultSortDirection="DESC"
              showSearchCardTitle={false}
              searchForm={this.renderSearchForm()}
              defaultColumnStyle={12}
              defaultSearchForm={{}}
              fetchData={this.fetchData}
              columns={this.renderColumns()}
              // onRow={record => ({
              //   onClick: () => {
              //     this.onRow(record);
              //   }, // 点击行
              //   onMouseEnter: () => {
              //     this.onRow(record);
              //   }, // 鼠标经过
              // })}
              rowKey="oldId"
              deleteData={data => this.deleteData(data)}
              extraButtons={[
                {
                  key: 'importExcel',
                  title: '导入Excel',
                  type: 'primary',
                  size: 'large',
                  loading: false,
                  cb: internalState => {
                    this.setState({
                      visible: true,
                    });
                  },
                },
              ]}
            />
          </Col>
          <Col span={8}>
            <PayRollDetail formData={obj} />
          </Col>
        </Row>
      </PageWrapper>
    );
  }
}

export default Payroll;
