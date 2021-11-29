import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import {
  Input,
  Form,
  Radio,
  Modal,
  DatePicker,
  Upload,
  message,
  Button,
  Icon,
  Row,
  Col,
} from 'antd';
import { isNil, isEmpty, mapObjIndexed } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, FileManagerEnhance } from '@/pages/gen/field';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { selectInternalOus, selectUsersWithBu } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import ExportJsonExcel from 'js-export-excel';
import moment from 'moment';

const { Field } = FieldList;
const { Dragger } = Upload;

const DOMAIN = 'taxList';

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

@connect(({ loading, taxList }) => ({
  taxList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class TaxList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      fileList: [],
      uploading: false,
      uploadFaile: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/reimName` });
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState(
      {
        visible: !visible,
      },
      () => {
        this.setState({
          uploadFaile: false,
          fileList: [],
        });
      }
    );
  };

  handleUpload = () => {
    this.setState({
      uploading: true,
    });

    const { fileList } = this.state;
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('file', file);
    });

    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/costrushUpload`,
      payload: formData,
    }).then(res => {
      this.setState({
        uploading: false,
      });
      if (res.ok) {
        this.toggleVisible();
      } else {
        this.setState({
          uploadFaile: true,
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { faileList: res.datum },
        });
      }
    });
  };

  downLoadFaileExcel = () => {
    const {
      taxList: { faileList },
    } = this.props;
    const option = {
      fileName: '发票清单(抵扣失败记录)',
      datas: [
        {
          sheetData: faileList, // 数据
          sheetName: '发票清单(抵扣失败记录)', // 表名
          sheetFilter: [
            'rowIndex',
            'invCode',
            'invNo',
            'batchDate',
            'custName',
            'invAmt',
            'taxAmt',
            'invStatus',
            'invType',
          ], // 列过滤
          sheetHeader: [
            '序号',
            '发票代码',
            '发票号码',
            '开票日期',
            '销方名称',
            '金额',
            '税额',
            '发票状态',
            '发票类型',
          ], // 第一行标题
          columnWidths: [3, 7, 7, 7, 15, 5, 5, 5, 7], // 列宽 需与列顺序对应
        },
      ],
    };
    const toExcel = new ExportJsonExcel(option); // new
    toExcel.saveExcel();

    this.toggleVisible();
  };

  render() {
    const {
      taxList,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      loading,
    } = this.props;
    const { list, total, searchForm, reimNameData } = taxList;
    const { fileList, uploading, visible, uploadFaile } = this.state;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: '100%' },
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
          title: '费用报销单号',
          dataIndex: 'reimNo',
          options: {
            initialValue: searchForm.reimNo,
          },
          tag: <Input placeholder="费用报销单号" />,
        },
        {
          title: '流程编号',
          dataIndex: 'procNo',
          options: {
            initialValue: searchForm.procNo,
          },
          tag: <Input placeholder="流程编号" />,
        },
        {
          title: '报销申请人',
          dataIndex: 'reimResId',
          options: {
            initialValue: searchForm.reimResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder="报销申请人"
              showSearch
            />
          ),
        },
        {
          title: '抵扣标记',
          dataIndex: 'dedTag',
          options: {
            initialValue: searchForm.dedTag,
          },
          tag: <Selection.UDC code="ACC:SUB_TAG" placeholder="抵扣标记" />,
        },
        {
          title: '抵扣操作日期',
          dataIndex: 'dedDate',
          options: {
            initialValue: searchForm.dedDate || null,
          },
          tag: <DatePicker format="YYYY-MM-DD" placeholder="抵扣操作日期" className="x-fill-100" />,
        },
        {
          title: '抵扣操作人',
          dataIndex: 'dedResId',
          options: {
            initialValue: searchForm.dedResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder="抵扣操作人"
              showSearch
            />
          ),
        },
        {
          title: '流程类型',
          dataIndex: 'procKey',
          options: {
            initialValue: searchForm.procKey,
          },
          tag: <Selection.UDC code="ACC:REIM_PROC_KEY" placeholder="流程类型" />,
        },
        {
          title: '当前流程节点',
          dataIndex: 'taskName',
          options: {
            initialValue: searchForm.taskName,
          },
          tag: <Input placeholder="当前流程节点" />,
        },
        {
          title: '财务记账日期',
          dataIndex: 'reimAccountTime',
          options: {
            initialValue: searchForm.reimAccountTime || '',
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
        {
          title: '财务稽核专员',
          dataIndex: 'reimId',
          options: {
            initialValue: searchForm.reimId,
          },
          tag: (
            <Selection.Columns
              source={reimNameData}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder="财务稽核专员"
              showSearch
            />
          ),
        },
        {
          title: '记账批次号',
          dataIndex: 'batchNo',
          options: {
            initialValue: searchForm.batchNo,
          },
          tag: <Input placeholder="记账批次号" />,
        },
        {
          title: '费用所属公司',
          dataIndex: 'expenseOuId',
          options: {
            initialValue: searchForm.expenseOuId,
          },
          tag: <Selection source={() => selectInternalOus()} placeholder="费用所属公司" />,
        },
      ],
      columns: [
        {
          title: '报销单号',
          dataIndex: 'reimNo',
          align: 'center',
          width: 150,
          render: (value, row, key) => {
            const url = getUrl();
            const from = stringify({ from: url });
            let type;
            switch (row.reimType2) {
              // 差旅报销
              case 'TRIP': {
                type = 'trip';
                break;
              }
              // 行政订票报销
              case 'TICKET': {
                type = 'trip';
                break;
              }
              // 专项费用报销
              case 'SPEC': {
                type = 'spec';
                break;
              }
              // 特殊费用报销 -因公报销
              case 'BSPECIAL': {
                type = 'particular';
                break;
              }
              // 特殊费用报销 -个人报销
              case 'PSPECIAL': {
                type = 'particular';
                break;
              }
              // 非差旅报销
              default: {
                type = 'normal';
                break;
              }
            }
            return (
              <Link className="tw-link" to={`/plat/expense/${type}/view?id=${row.reimId}&${from}`}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '标记抵扣',
          dataIndex: 'dedTagName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '抵扣批次号',
          dataIndex: 'dedBatch',
          width: 150,
        },
        {
          title: '抵扣操作日期',
          dataIndex: 'dedDate',
          className: 'text-center',
          width: 140,
        },
        {
          title: '抵扣操作人',
          dataIndex: 'dedResName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '流程编号',
          dataIndex: 'procNo',
          className: 'text-center',
          width: 150,
        },
        {
          title: '报销人',
          dataIndex: 'reimResName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '差旅费用类型',
          dataIndex: 'feetyprName',
          width: 150,
        },
        {
          title: '费用科目',
          dataIndex: 'accName',
          width: 200,
        },
        {
          title: '报销金额(含税)',
          dataIndex: 'adJustedAmt',
          width: 100,
        },
        {
          title: '报销金额(不含税)',
          dataIndex: 'reimAmt',
          width: 100,
        },
        {
          title: '税额',
          dataIndex: 'taxAmt',
          width: 100,
        },
        {
          title: '税率',
          dataIndex: 'taxRate',
          width: 100,
        },
        {
          title: '费用发生日期',
          dataIndex: 'feeDate',
          width: 100,
        },
        {
          title: '报销说明',
          dataIndex: 'reimDesc',
          width: 100,
        },
        {
          title: '发票号',
          dataIndex: 'invNo',
          width: 100,
        },
        {
          title: '财务稽核专员',
          dataIndex: 'roleName',
          className: 'text-center',
          width: 100,
        },
        {
          title: '流程类型',
          dataIndex: 'procName',
          width: 150,
        },
        {
          title: '当前流程节点',
          dataIndex: 'taskName',
          width: 200,
        },
        {
          title: '记账批次号',
          dataIndex: 'batchNo',
          width: 120,
        },
        {
          title: '财务记账日期',
          dataIndex: 'reimAccountTime',
          className: 'text-center',
          width: 200,
        },
      ],
      leftButtons: [
        {
          key: 'deduction',
          icon: 'property-safety',
          className: 'tw-btn-primary',
          title: '抵扣',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            loading ||
            !selectedRows.length ||
            selectedRows.filter(v => v.dedTag === 'SUBBED').length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/updateCost`,
              payload: {
                ids: selectedRowKeys.join(','),
              },
            });
          },
        },
        {
          key: 'autoDeduction',
          icon: 'safety-certificate',
          className: 'tw-btn-primary',
          title: '自动抵扣',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length || loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.toggleVisible();
          },
        },
      ],
    };
    const uploadProps = {
      accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };

    return (
      <PageHeaderWrapper title="进项税抵扣">
        <DataTable {...tableProps} scroll={{ x: 3000 }} />
        <Modal
          centered
          title="进项税自动抵扣"
          visible={visible}
          onOk={() => this.toggleVisible()}
          onCancel={() => this.toggleVisible()}
          width={600}
        >
          {!uploadFaile ? (
            <>
              <Row>
                <Col span={16} offset={4}>
                  <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                      <Icon type="file-excel" />
                    </p>
                    <p className="ant-upload-text">点击上传进项税发票抵扣清单</p>
                  </Dragger>
                </Col>
              </Row>
              <Row>
                <Col span={6} offset={4}>
                  <Button
                    type="primary"
                    className="tw-btn-warning"
                    onClick={this.handleUpload}
                    disabled={fileList.length === 0}
                    loading={uploading}
                    style={{ marginTop: 16 }}
                  >
                    {uploading ? '上传中...' : '确认上传抵扣'}
                  </Button>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <Row>
                <Col span={18} offset={2}>
                  <span style={{ fontSize: '18px', color: 'red' }}>
                    未能全部抵扣，请下载并查看抵扣失败记录
                  </span>
                </Col>
                <Col span={18} offset={2} style={{ marginTop: '20px', color: 'black' }}>
                  <a onClick={this.downLoadFaileExcel}>发票清单(抵扣失败记录)</a>
                </Col>
              </Row>
            </>
          )}
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default TaxList;
