import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input, Form, Radio, Modal, Checkbox } from 'antd';
import { isNil, mapObjIndexed, isEmpty } from 'ramda';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import SyntheticField from '@/components/common/SyntheticField';
import CityTrigger from '@/pages/gen/field/CityTrigger';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import ExcelImportExport from '@/components/common/ExcelImportExport';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import CustomerFuzzyList from './CustomerFuzzy';

const RadioGroup = Radio.Group;
const { Field } = FieldList;

const DOMAIN = 'customer';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, customer }) => ({
  customer,
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`],
}))
@Form.create({})
@mountToTab()
class Customer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      importVisible: false,
      confirmLoading: false,
      radioFlag: true,
      parmas: {},
      fuzzyVisible: false,
      uploading: false,
      failedList: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // 页面可配置化
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'CUSTOMER_MANAGEMENT_LIST' },
    });
    dispatch({ type: `${DOMAIN}/res` });
    const { saveEdit, mode } = fromQs();
    !saveEdit && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    saveEdit &&
      this.fetchData({
        sortBy: 'id',
        sortDirection: 'DESC',
        offset: 0,
        limit: 10,
        title: '',
      });
    mode === 'true' &&
      this.setState({
        fuzzyVisible: true,
      });
    if (saveEdit) {
      const url = getUrl().replace('?saveEdit=true', '');
      closeThenGoto(url);
    }
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  // 省 -> 市
  handleChangeCity = (value, index) => {
    if (index === 1) {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { cityList: [] },
      });
      dispatch({
        type: `${DOMAIN}/handleChangeCity`,
        payload: value[1],
      });
    }
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  toggleImportVisible = () => {
    const { importVisible } = this.state;
    this.setState({ importVisible: !importVisible });
  };

  handleCancel = () => {
    const { form } = this.props;
    this.toggleVisible();
    form.resetFields();
  };

  handleOk = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      const { radioFlag, parmas } = this.state;
      const { noDataChecker, noSalePic, noSaleVp, dataChecker, salePic, saleVp } = values;
      const cleanedValues = mapObjIndexed((value, key) => (isNil(value) ? null : value), values);

      if (radioFlag && !dataChecker && !salePic && !saleVp) {
        createMessage({ type: 'warn', description: '请至少选择一个更改派发项' });
        return;
      }
      if (!radioFlag && !noDataChecker && !noSalePic && !noSaleVp) {
        createMessage({ type: 'warn', description: '请至少选择一个取消派发项' });
        return;
      }

      if (!error) {
        this.setState({
          confirmLoading: true,
        });
        const payloads = {
          ...cleanedValues,
          ...parmas,
        };
        dispatch({
          type: `${DOMAIN}/changeDist`,
          payload: payloads,
        });
        this.toggleVisible();
        this.setState({
          confirmLoading: false,
          radioFlag: true,
        });
        const { form } = this.props;
        form.resetFields();
      }
    });
  };

  toggleFuzzyVisible = () => {
    const { fuzzyVisible } = this.state;
    const { form, dispatch } = this.props;
    this.setState({ fuzzyVisible: !fuzzyVisible }, () => {
      dispatch({ type: `${DOMAIN}/cleansearchFuzzyForm` });
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          fuzzyList: [],
          fuzzyTotal: 0,
        },
      });
      const { mode } = fromQs();
      if (mode) {
        const url = getUrl().replace('?mode=true', '');
        closeThenGoto(url);
      }
    });
  };

  handleFuzzyOk = () => {
    this.toggleFuzzyVisible();
  };

  radioChange = () => {
    const { form } = this.props;
    const { radioFlag } = this.state;
    this.setState({
      radioFlag: !radioFlag,
    });
    form.resetFields();
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
        createMessage({ type: 'success', description: '上传成功' });
        this.toggleImportVisible();
        this.fetchData();
        return null;
      }
      if (
        res.datum &&
        Array.isArray(res.datum.failExcelData) &&
        !isEmpty(res.datum.failExcelData)
      ) {
        createMessage({ type: 'error', description: res.datum.msg || '上传失败' });
        this.setState({
          failedList: res.datum.failExcelData,
        });
      } else {
        createMessage({ type: 'error', description: res.datum.msg || '上传失败,返回结果为空' });
        this.toggleImportVisible();
      }
      return null;
    });
  };

  render() {
    const {
      customer: { list, total, searchForm, resDataSource, cityList, searchFuzzyForm, pageConfig },
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      loading,
    } = this.props;
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let showExport = null;
    let currentListConfig = [];
    let currentQueryConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.blockKey === 'CUSTOMER_MANAGEMENT_LIST') {
        // 客户管理列表
        // showExport = view.allowExportFlag;
        currentListConfig = view;
      } else if (view.blockKey === 'CUSTOMER_MANAGEMENT_QUERY') {
        currentQueryConfig = view;
      }
    });
    pageConfig.pageButtonViews.forEach(view => {
      if (view.buttonKey === 'LIST_EXPORT') {
        showExport = view.visible;
      }
    });
    const { pageFieldViews: pageFieldViewsList } = currentListConfig;
    const { pageFieldViews: pageFieldViewsQuery } = currentQueryConfig;
    const pageFieldJsonList = {};
    const pageFieldJsonQuery = {};
    if (pageFieldViewsList) {
      pageFieldViewsList.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsQuery) {
      pageFieldViewsQuery.forEach(field => {
        pageFieldJsonQuery[field.fieldKey] = field;
      });
    }
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: '100%' },
      loading,
      total,
      dataSource: list,
      showExport,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        pageFieldJsonQuery.custType.visibleFlag && {
          title: `${pageFieldJsonQuery.custType.displayName}`,
          dataIndex: 'custType',
          sortNo: `${pageFieldJsonQuery.custType.sortNo}`,
          options: {
            initialValue: searchForm.issaleVp || undefined,
          },
          tag: (
            <Selection.UDC
              code="TSK:CUST_TYPE"
              placeholder={`请选择${pageFieldJsonQuery.custType.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.custName.visibleFlag && {
          title: `${pageFieldJsonQuery.custName.displayName}`,
          dataIndex: 'custName',
          sortNo: `${pageFieldJsonQuery.custName.sortNo}`,
          options: {
            initialValue: searchForm.custName || '',
          },
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.custName.displayName}`} />,
        },
        pageFieldJsonQuery.custRegion.visibleFlag && {
          title: `${pageFieldJsonQuery.custRegion.displayName}`,
          dataIndex: 'category',
          sortNo: `${pageFieldJsonQuery.custRegion.sortNo}`,
          options: {
            initialValue: searchForm.category,
          },
          tag: <CityTrigger cityList={cityList} onChange={this.handleChangeCity} />,
        },

        pageFieldJsonQuery.custStatus.visibleFlag && {
          title: `${pageFieldJsonQuery.custStatus.displayName}`,
          dataIndex: 'custStatus',
          sortNo: `${pageFieldJsonQuery.custStatus.sortNo}`,
          options: {
            initialValue: searchForm.custStatus || '1',
          },
          tag: (
            <SyntheticField className="tw-field-group">
              <Radio.Group className="tw-field-group-filter" defaultValue="0" buttonStyle="solid">
                <Radio.Button value="1">=</Radio.Button>
                <Radio.Button value="0">≠</Radio.Button>
              </Radio.Group>
              <Selection.UDC
                className="tw-field-group-field"
                code="TSK:CUST_STATUS"
                placeholder={`请选择${pageFieldJsonQuery.custStatus.displayName}`}
                showSearch
              />
            </SyntheticField>
          ),
        },
        pageFieldJsonQuery.custLabel1.visibleFlag && {
          title: `${pageFieldJsonQuery.custLabel1.displayName}`,
          dataIndex: 'custLabel1',
          sortNo: `${pageFieldJsonQuery.custLabel1.sortNo}`,
          options: {
            initialValue: searchForm.custLabel1 || '',
          },
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.custLabel1.displayName}`} />,
        },
        pageFieldJsonQuery.custLabel2.visibleFlag && {
          title: `${pageFieldJsonQuery.custLabel2.displayName}`,
          dataIndex: 'custLabel2',
          sortNo: `${pageFieldJsonQuery.custLabel2.sortNo}`,
          options: {
            initialValue: searchForm.custLabel2 || '',
          },
          tag: <Input placeholder="请输入ERP系统" />,
        },
        pageFieldJsonQuery.custLabel3.visibleFlag && {
          title: `${pageFieldJsonQuery.custLabel3.displayName}`,
          dataIndex: 'custLabel3',
          sortNo: `${pageFieldJsonQuery.custLabel3.sortNo}`,
          options: {
            initialValue: searchForm.custLabel3 || '',
          },
          tag: <Input placeholder="请输入近期可能的IT项目" />,
        },
        pageFieldJsonQuery.dataChecker.visibleFlag && {
          title: `${pageFieldJsonQuery.dataChecker.displayName}`,
          dataIndex: 'dataChecker',
          sortNo: `${pageFieldJsonQuery.dataChecker.sortNo}`,
          options: {
            initialValue: searchForm.dataChecker || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${pageFieldJsonQuery.dataChecker.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.saleVp.visibleFlag && {
          title: `${pageFieldJsonQuery.saleVp.displayName}`,
          dataIndex: 'saleVp',
          sortNo: `${pageFieldJsonQuery.saleVp.sortNo}`,
          options: {
            initialValue: searchForm.saleVp || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${pageFieldJsonQuery.saleVp.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.salePic.visibleFlag && {
          title: `${pageFieldJsonQuery.salePic.displayName}`,
          dataIndex: 'salePic',
          sortNo: `${pageFieldJsonQuery.salePic.sortNo}`,
          options: {
            initialValue: searchForm.salePic || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${pageFieldJsonQuery.salePic.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.dataFrom.visibleFlag && {
          title: `${pageFieldJsonQuery.dataFrom.displayName}`,
          dataIndex: 'dataFrom',
          sortNo: `${pageFieldJsonQuery.dataFrom.sortNo}`,
          options: {
            initialValue: searchForm.dataFrom || '',
          },
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.dataFrom.displayName}`} />,
        },
        pageFieldJsonQuery.isdatachecker.visibleFlag && {
          title: `${pageFieldJsonQuery.isdatachecker.displayName}`,
          dataIndex: 'isdataChecker',
          sortNo: `${pageFieldJsonQuery.isdatachecker.sortNo}`,
          options: {
            initialValue: searchForm.isdataChecker || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="">全部</Radio>
              <Radio value="0">已派发</Radio>
              <Radio value="1">未派发</Radio>
            </RadioGroup>
          ),
        },
        pageFieldJsonQuery.issalevp.visibleFlag && {
          title: `${pageFieldJsonQuery.issalevp.displayName}`,
          dataIndex: 'issaleVp',
          sortNo: `${pageFieldJsonQuery.issalevp.sortNo}`,
          options: {
            initialValue: searchForm.issaleVp || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="">全部</Radio>
              <Radio value="0">已派发</Radio>
              <Radio value="1">未派发</Radio>
            </RadioGroup>
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      columns: [
        pageFieldJsonList.custName.visibleFlag && {
          title: `${pageFieldJsonList.custName.displayName}`,
          dataIndex: 'custName',
          sortNo: `${pageFieldJsonList.custName.sortNo}`,
          width: 200,
          render: (value, rowData) => {
            const { id, abNo } = rowData;
            const url = getUrl();

            let href = '';
            if (abNo) {
              href = `/sale/management/customerInfoDetail?id=${id}&no=${abNo}&from=${url}`;
            } else {
              href = `/sale/management/customerInfoDetail?id=${id}&from=${url}`;
            }

            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        pageFieldJsonList.custType.visibleFlag && {
          title: `${pageFieldJsonList.custType.displayName}`,
          dataIndex: 'custTypeName',
          sortNo: `${pageFieldJsonList.custType.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.custStatus.visibleFlag && {
          title: `${pageFieldJsonList.custStatus.displayName}`,
          dataIndex: 'custStatusName',
          sortNo: `${pageFieldJsonList.custStatus.sortNo}`,
          className: 'text-center',
          width: 80,
        },
        pageFieldJsonList.custRegion.visibleFlag && {
          title: `${pageFieldJsonList.custRegion.displayName +
            '-' +
            pageFieldJsonList.province.displayName +
            '-' +
            pageFieldJsonList.city.displayName}`,
          dataIndex: 'custRegIon',
          sortNo: `${pageFieldJsonList.custRegion.sortNo}`,
          className: 'text-center',
          width: 140,
          render: (value, rowData) => {
            const { custRegIonName, provInceName, cityName } = rowData;
            return `${custRegIonName || ''}${provInceName ? '-' : ''}${provInceName || ''}${
              cityName ? '-' : ''
            }${cityName || ''}`;
          },
        },
        pageFieldJsonList.switchboard.visibleFlag && {
          title: `${pageFieldJsonList.switchboard.displayName}`,
          dataIndex: 'switchBoard',
          sortNo: `${pageFieldJsonList.switchboard.sortNo}`,
          className: 'text-center',
          width: 100,
        },
        pageFieldJsonList.chairmanTel.visibleFlag && {
          title: `${pageFieldJsonList.chairmanTel.displayName}`,
          dataIndex: 'chairManTel',
          sortNo: `${pageFieldJsonList.chairmanTel.sortNo}`,
          className: 'text-center',
          width: 100,
        },
        pageFieldJsonList.itAdminTel.visibleFlag && {
          title: `${pageFieldJsonList.itAdminTel.displayName}`,
          dataIndex: 'itAdminTel',
          sortNo: `${pageFieldJsonList.itAdminTel.sortNo}`,
          className: 'text-center',
          width: 100,
        },
        pageFieldJsonList.otherPicTel.visibleFlag && {
          title: `${pageFieldJsonList.otherPicTel.displayName}`,
          dataIndex: 'otherPicTel',
          sortNo: `${pageFieldJsonList.otherPicTel.sortNo}`,
          className: 'text-center',
          width: 100,
        },
        pageFieldJsonList.companyEmail.visibleFlag && {
          title: `${pageFieldJsonList.companyEmail.displayName}`,
          dataIndex: 'companyEmail',
          sortNo: `${pageFieldJsonList.companyEmail.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.chairmanEmail.visibleFlag && {
          title: `${pageFieldJsonList.chairmanEmail.displayName}`,
          dataIndex: 'chairManEmail',
          sortNo: `${pageFieldJsonList.chairmanEmail.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.itAdminEmail.visibleFlag && {
          title: `${pageFieldJsonList.itAdminEmail.displayName}`,
          dataIndex: 'itAdminEmail',
          sortNo: `${pageFieldJsonList.itAdminEmail.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.otherPicEmail.visibleFlag && {
          title: `${pageFieldJsonList.otherPicEmail.displayName}`,
          dataIndex: 'otherPicEmail',
          sortNo: `${pageFieldJsonList.otherPicEmail.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.custLabel1.visibleFlag && {
          title: `${pageFieldJsonList.custLabel1.displayName}`,
          dataIndex: 'custLabel1',
          sortNo: `${pageFieldJsonList.custLabel1.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.custLabel2.visibleFlag && {
          title: `${pageFieldJsonList.custLabel2.displayName}`,
          dataIndex: 'custLabel2',
          sortNo: `${pageFieldJsonList.custLabel2.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.custLabel3.visibleFlag && {
          title: `${pageFieldJsonList.custLabel3.displayName}`,
          dataIndex: 'custLabel3',
          sortNo: `${pageFieldJsonList.custLabel3.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.dataChecker.visibleFlag && {
          title: `${pageFieldJsonList.dataChecker.displayName}`,
          dataIndex: 'dataCheckerName',
          sortNo: `${pageFieldJsonList.dataChecker.sortNo}`,
          className: 'text-center',
          width: 100,
        },
        pageFieldJsonList.saleVp.visibleFlag && {
          title: `${pageFieldJsonList.saleVp.displayName}`,
          dataIndex: 'saleVpName',
          sortNo: `${pageFieldJsonList.saleVp.sortNo}`,
          className: 'text-center',
          width: 100,
        },
        pageFieldJsonList.salePic.visibleFlag && {
          title: `${pageFieldJsonList.salePic.displayName}`,
          dataIndex: 'salePicName',
          sortNo: `${pageFieldJsonList.salePic.sortNo}`,
          className: 'text-center',
          width: 100,
        },
        pageFieldJsonList.dataFrom.visibleFlag && {
          title: `${pageFieldJsonList.dataFrom.displayName}`,
          dataIndex: 'dataFrom',
          sortNo: `${pageFieldJsonList.dataFrom.sortNo}`,
          className: 'text-center',
          width: 100,
        },
        pageFieldJsonList.remark.visibleFlag && {
          title: `${pageFieldJsonList.remark.displayName}`,
          dataIndex: 'remark',
          sortNo: `${pageFieldJsonList.remark.sortNo}`,
          width: 120,
          render: (value, rowData) => <pre>{value}</pre>,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '新增潜在客户',
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/sale/management/customerCreate?${from}`);
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
            const { id, abNo } = selectedRows[0];
            if (abNo) {
              router.push(`/sale/management/customerInfoEdit?id=${id}&no=${abNo}`);
            } else {
              router.push(`/sale/management/customerInfoEdit?id=${id}`);
            }
          },
        },
        {
          key: 'changeDist',
          icon: 'form',
          className: 'tw-btn-info',
          title: '派发管理',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.toggleVisible();
            this.setState({
              parmas: {
                ids: selectedRowKeys.join(','),
              },
            });
          },
        },
        {
          key: 'fuzzyCkeck',
          icon: 'team',
          className: 'tw-btn-info',
          title: '模糊查重',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.toggleFuzzyVisible();
          },
        },
        {
          key: 'import',
          icon: 'file-excel',
          className: 'tw-btn-primary',
          title: '导入潜在客户',
          loading: false,
          // hidden: checkRole(),
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.toggleImportVisible();
          },
        },
        {
          key: 'submit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: '登记为客户',
          loading: false,
          hidden: false,
          // 当状态为“有效”、客户类型为“潜在客户”时
          disabled: selectedRows =>
            !(
              selectedRows.length === 1 &&
              selectedRows[0].custType === 'POTENTIAL_CUST' &&
              selectedRows[0].custStatus === 'ACTIVE'
            ),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 当状态为“有效”、客户类型为“潜在客户”时
            const { id, abNo } = selectedRows[0];
            router.push(
              `/sale/management/customerInfoEdit?id=${id}&no=${abNo || ''}&isSubmit=${true}`
            );
          },
        },
      ],
    };

    const {
      visible,
      importVisible,
      failedList,
      uploading,
      confirmLoading,
      radioFlag,
      fuzzyVisible,
    } = this.state;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    const excelImportProps = {
      templateUrl: location.origin + `/template/customerTemplate.xlsx`, // eslint-disable-line
      option: {
        fileName: '导入失败记录',
        datas: [
          {
            sheetName: '潜在客户数据导入失败记录', // 表名
            sheetFilter: [
              'errorMsg',
              'custName',
              'custRegion',
              'province',
              'city',
              'switchBoard',
              'companyEmail',
              'headOfficeAddr',
              'custLabel1',
              'custLabel2',
              'custLabel3',
              'custLabel4',
              'custLabel5',
              'dataFrom',
              'chairManName',
              'chairManTel',
              'chairManEmail',
              'itAdminName',
              'itAdminTel',
              'itAdminEmail',
              'otherPicName',
              'otherPicTel',
              'otherPicEmail',
              'remark',
              'lastCheckDate',
              'lastModifyDate',
            ], // 列过滤
            sheetHeader: [
              '失败原因',
              '公司名称',
              '区域',
              '省份',
              '城市',
              '总机固话',
              '公司邮箱',
              '总部地址',
              '客户标签1',
              '客户标签2',
              '客户标签3',
              '客户标签4',
              '客户标签5',
              '数据来源',
              '董事长-姓名',
              '董事长-电话',
              '董事长-邮箱',
              'IT负责人-姓名',
              'IT负责人-电话',
              'IT负责人-邮箱',
              '其他负责人-姓名',
              '其他负责人-电话',
              '其他负责人-邮箱',
              '备注',
              '数据最后校验日期',
              '数据最后更新日期',
            ], // 第一行标题
            columnWidths: [
              12,
              4,
              6,
              6,
              6,
              6,
              6,
              6,
              8,
              8,
              8,
              8,
              8,
              8,
              6,
              6,
              6,
              6,
              6,
              6,
              6,
              6,
              6,
              6,
              6,
            ], // 列宽 需与列顺序对应
          },
        ],
      },
      controlModal: {
        visible: importVisible,
        failedList,
        uploading,
      },
    };
    return (
      <PageHeaderWrapper title="客户管理列表">
        <ExcelImportExport
          {...excelImportProps}
          closeModal={this.toggleImportVisible}
          handleUpload={this.handleUpload}
        />
        <DataTable {...tableProps} scroll={{ x: 3000 }} />
        <Modal
          centered
          title="模糊查重"
          visible={fuzzyVisible}
          onOk={this.handleFuzzyOk}
          onCancel={() => this.toggleFuzzyVisible()}
          width={1200}
          destroyOnClose
        >
          <CustomerFuzzyList />
        </Modal>
        <Modal
          centered
          title="派发管理"
          visible={visible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
          width={800}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
            <Field name="changeDist">
              <Radio className="x-fill-100" checked={radioFlag} onChange={this.radioChange}>
                更改派发人
              </Radio>
            </Field>
            <Field
              name="dataChecker"
              label="校验人"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                disabled={!radioFlag}
                defaultValues=""
              />
            </Field>
            <Field name="saleVp" label="销售VP" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                disabled={!radioFlag}
                defaultValues=""
              />
            </Field>
            <Field
              name="salePic"
              label="销售负责人"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                disabled={!radioFlag}
                defaultValues=""
              />
            </Field>
            <Field name="noDist">
              <Radio checked={!radioFlag} onChange={this.radioChange}>
                取消派发
              </Radio>
            </Field>
            <Field name="noDataChecker" decorator={{ valuePropName: 'checked' }}>
              <Checkbox name="noDataChecker" style={{ marginLeft: '50px' }} disabled={radioFlag}>
                取消校验人
              </Checkbox>
            </Field>
            <Field name="noSaleVp" decorator={{ valuePropName: 'checked' }}>
              <Checkbox name="noSaleVp" style={{ marginLeft: '50px' }} disabled={radioFlag}>
                取消销售VP
              </Checkbox>
            </Field>
            <Field name="noSalePic" decorator={{ valuePropName: 'checked' }}>
              <Checkbox name="noSalePic" style={{ marginLeft: '50px' }} disabled={radioFlag}>
                取消销售负责人
              </Checkbox>
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default Customer;
