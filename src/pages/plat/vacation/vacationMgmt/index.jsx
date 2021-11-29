import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Tooltip } from 'antd';
import { isEmpty } from 'ramda';
import { formatMessage } from 'umi/locale';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker, YearPicker } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { sub } from '@/utils/mathUtils';
import ExcelImportExport from '@/components/common/ExcelImportExport';
import createMessage from '@/components/core/AlertMessage';
import SelectWithCols from '@/components/common/SelectWithCols';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import moment from 'moment';
import ParamConfig from './paramConfigModal';
import BatchEditModal from './batchEditModal';

const DOMAIN = 'vacationMgmt';
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const roleAuth = [
  'SYS_ADMIN',
  'PLAT_HR_ADMIN',
  'PLAT_ALL_PIC',
  'PLAT_IT_ADMIN',
  'PLAT_HR_PIC',
  'PLAT_RES_PIC',
  'PLAT_SALARY_PIC',
];

@connect(({ loading, vacationMgmt, user }) => ({
  // loading,
  user,
  vacationMgmt,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class VacationMgmt extends PureComponent {
  state = {
    visible: false,
    failedList: [],
    uploading: false,
    paramConfigVisible: false,
    batchEditVisible: false,
  };

  componentDidMount() {
    const {
      dispatch,
      user: { user },
    } = this.props;
    const { roles = [] } = user;

    dispatch({ type: `${DOMAIN}/res` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    dispatch({ type: `${DOMAIN}/baseBU` });
    dispatch({
      type: `${DOMAIN}/queryTemporaryTime`,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  handleUpload = fileList => {
    this.setState({
      uploading: true,
    });

    const fileData = new FormData();
    fileList.forEach(file => {
      fileData.append('file', file);
    });

    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/upload`,
      payload: fileData,
    }).then(res => {
      this.setState({
        uploading: false,
      });
      if (res.ok) {
        this.toggleVisible();
        return null;
      }
      if (Array.isArray(res.datum) && !isEmpty(res.datum)) {
        createMessage({ type: 'error', description: res.reason || '上传失败' });
        this.setState({
          failedList: res.datum,
        });
      } else {
        createMessage({ type: 'error', description: res.reason || '上传失败,返回结果为空' });
        this.toggleVisible();
      }
      return null;
    });
  };

  // 打开/关闭参数配置弹窗
  paramConfigModal = flag => {
    const { paramConfigVisible } = this.state;
    this.setState({
      paramConfigVisible: !paramConfigVisible,
    });
    if (flag === 'YES') {
      createMessage({ type: 'success', description: '修改成功' });
    }
  };

  // 打开/关闭批量修改弹窗
  batchEditModal = flag => {
    const {
      vacationMgmt: { searchForm },
    } = this.props;
    const { batchEditVisible } = this.state;
    this.setState({
      batchEditVisible: !batchEditVisible,
    });
    if (flag === 'YES') {
      createMessage({ type: 'success', description: '修改成功' });
      this.fetchData(searchForm);
    }
  };

  render() {
    const {
      loading,
      dispatch,
      vacationMgmt: {
        list,
        total,
        searchForm,
        resDataSource,
        baseBuDataSource,
        baseBuData,
        selectedKeys,
      },
      user: { user },
    } = this.props;
    const { roles = [] } = user;
    const { visible, failedList, uploading, paramConfigVisible, batchEditVisible } = this.state;
    // 判断权限
    const checkRole = () => {
      let flag = false;
      roles.forEach(v => {
        if (roleAuth.includes(v)) {
          flag = true;
        }
      });
      return !flag;
    };

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 1450 },
      loading,
      total,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '年度',
          className: 'x-fill-100',
          dataIndex: 'vacationYear',
          tag: <YearPicker className="x-fill-100" format="YYYY" />,
        },
        {
          title: '资源',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId,
          },
          tag: (
            // Selection.ResFilterDimission含离职框
            <Selection.Columns
              className="x-fill-100"
              // source={resDataSource}
              source={() => selectUserMultiCol()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择资源"
            />
          ),
        },
        {
          title: '假期类型',
          dataIndex: 'vacationType',
          options: {
            initialValue: searchForm.vacationType,
          },
          tag: <Selection.UDC code="COM:VACATION_TYPE" placeholder="请选择假期类型" />,
        },
        {
          title: '有效期',
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: 'BaseBU',
          dataIndex: 'baseBu',
          options: {
            initialValue: searchForm.baseBu,
          },
          // formItemLayout,
          tag: (
            <SelectWithCols
              labelKey="name"
              placeholder="请选择BaseBU"
              columns={[
                { dataIndex: 'code', title: '编号', span: 6 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              dataSource={baseBuDataSource}
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      baseBuDataSource: baseBuData.filter(
                        d =>
                          d.code.indexOf(value) > -1 ||
                          d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                      ),
                    },
                  });
                },
                allowClear: true,
                style: { width: '100%' },
              }}
            />
          ),
        },
        {
          title: 'Base地',
          dataIndex: 'baseCity',
          options: {
            initialValue: searchForm.baseCity,
          },
          // formItemLayout,
          tag: <Selection.UDC code="COM.CITY" placeholder="请选择Base地" />,
        },
      ],
      columns: [
        {
          title: '年度',
          dataIndex: 'vacationYear',
          width: 100,
          align: 'center',
        },
        // {
        //   title: '资源',
        //   dataIndex: 'redId',
        //   align: 'center',
        //   width: 200,
        //   render: (value, rowData) => {
        //     const { resNo, resName } = rowData;
        //     return `${resNo || ''}${resNo ? '-' : ''}${resName || ''}`;
        //   },
        // },
        {
          title: '编号',
          dataIndex: 'resNo',
          width: 100,
          align: 'center',
        },
        {
          title: '姓名',
          dataIndex: 'resName',
          width: 100,
          align: 'center',
        },
        {
          title: 'BaseBU',
          dataIndex: 'buName',
          width: 100,
          align: 'center',
        },
        {
          title: 'Base地',
          dataIndex: 'baseCityName',
          width: 100,
          align: 'center',
        },
        {
          title: '假期类型',
          dataIndex: 'vacationTypeName',
          width: 100,
          align: 'center',
        },
        {
          title: '起始日期',
          dataIndex: 'startDate',
          width: 150,
          align: 'center',
        },
        {
          title: '截止日期',
          dataIndex: 'endDate',
          width: 150,
          align: 'center',
        },
        {
          title: '有效期',
          dataIndex: 'expirationDate',
          width: 150,
          align: 'center',
        },
        {
          title: '总天数',
          dataIndex: 'totalDays',
          width: 100,
          align: 'center',
        },
        {
          title: '已用天数',
          dataIndex: 'usedDays',
          width: 150,
          align: 'center',
          render: (value, row, index) => {
            const href = `/hr/attendanceMgmt/vacationApply?vacationId=${row.id}`;
            return (
              <>
                <span>{value}</span>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <Link className="tw-link" to={href}>
                  查看明细
                </Link>
              </>
            );
          },
        },
        {
          title: '可用天数',
          dataIndex: 'canUsedDays',
          width: 100,
          align: 'center',
          render: (value, row, index) =>
            sub(sub(row.totalDays, row.usedDays), row.frozenDay).toFixed(1),
        },
        {
          title: '未开放天数',
          dataIndex: 'frozenDay',
          width: 100,
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: 150,
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <span>{`${value.substr(0, 15)}...`}</span>
              </Tooltip>
            ) : (
              <span>{value}</span>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/hr/attendanceMgmt/vacationMgmt/edit');
          },
        },
        {
          key: 'import',
          icon: 'file-excel',
          className: 'tw-btn-primary',
          title: 'Excel导入',
          loading: false,
          hidden: checkRole(),
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.toggleVisible();
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/hr/attendanceMgmt/vacationMgmt/edit?id=${selectedRows[0].id}`);
          },
        },
        {
          key: 'paramConfig',
          // icon: 'form',
          className: 'tw-btn-primary',
          title: '参数修改',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/queryTemporaryTime`,
            }).then(() => {
              this.setState({
                paramConfigVisible: true,
              });
            });
          },
        },
        {
          key: 'batchEdit',
          // icon: 'form',
          className: 'tw-btn-primary',
          title: '有效期批量修改',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/clean`,
            }).then(() => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  selectedKeys: selectedRowKeys.join(','),
                  formData: {
                    expirationDate: moment().format('YYYY-MM-DD'),
                  },
                },
              });
              this.setState({
                batchEditVisible: true,
              });
            });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: {
                ids: selectedRowKeys.join(','),
              },
            });
          },
        },
      ],
    };

    const excelImportProps = {
      templateUrl: location.origin + `/template/vacationImport.xlsx`, // eslint-disable-line
      option: {
        fileName: '导入失败记录',
        datas: [
          {
            sheetName: '假期功能_资源假期数据导入失败记录', // 表名
            sheetFilter: [
              'vacationYear',
              'resId',
              'resName',
              'vacationTypeName',
              'startDate',
              'endDate',
              'expirationDate',
              'totalDays',
              'usedDays',
              'errorMsg',
            ], // 列过滤
            sheetHeader: [
              '年度',
              '资源编号',
              '资源姓名',
              '假期类型',
              '起始日期',
              '截止日期',
              '有效期',
              '总天数',
              '已用天数',
              '失败原因',
            ], // 第一行标题
            columnWidths: [4, 6, 6, 6, 8, 8, 8, 8, 8, 12], // 列宽 需与列顺序对应
          },
        ],
      },
      controlModal: {
        visible,
        failedList,
        uploading,
      },
    };

    return (
      <PageHeaderWrapper title="假期管理">
        <ExcelImportExport
          {...excelImportProps}
          closeModal={this.toggleVisible}
          handleUpload={this.handleUpload}
        />
        <DataTable {...tableProps} />
        {paramConfigVisible ? (
          <ParamConfig visible={paramConfigVisible} closeModal={this.paramConfigModal} />
        ) : null}
        {batchEditVisible ? (
          <BatchEditModal visible={batchEditVisible} closeModal={this.batchEditModal} />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default VacationMgmt;
