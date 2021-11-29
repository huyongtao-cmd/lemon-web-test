import React, { PureComponent } from 'react';
import { Button, Icon, Input, Modal, Radio, Upload } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { isEmpty, type } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, DatePicker, BuVersion } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
// import { selectSubContract, recvPlanSelect } from '@/services/user/Contract/sales';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectProjectConditional } from '@/services/user/project/project';
// import { selectLedgerConditional } from '@/services/user/equivalent/equivalent';
import { selectFinperiod } from '@/services/user/Contract/sales';
import { selectUsersWithBu } from '@/services/gen/list';
import SyntheticField from '@/components/common/SyntheticField';
import { saveAs } from 'file-saver';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const { Dragger } = Upload;
const DOMAIN = 'projectReportList';
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@connect(({ loading, projectReportList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/upload`] || loading.effects[`${DOMAIN}/query`],
  ...projectReportList,
  dispatch,
  user,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
@mountToTab()
class ProjectReportList extends PureComponent {
  defaultState = {
    //  eslint-disable-next-line
    templateUrl: location.origin + `/template/projectLaborImport.xlsx`,
    showImportModalFlag: false,
    draggerProps: {
      accept: '.xlsx,xls',
      multiple: false,
      beforeUpload: file => {
        this.setState({ file });
        return false;
      },
    },
  };

  state = this.defaultState;

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.deliBuId, 'deliBuId', 'deliBuVersionId'),
        ...getBuVersionAndBuParams(params.signBuId, 'signBuId', 'signBuVersionId'),
      },
    });
  };

  showImportModal = () => {
    this.setState({ showImportModalFlag: true });
  };

  downloadTemplate = () => {
    const { templateUrl } = this.state;
    saveAs(templateUrl, '项目劳务成本导入模板.xlsx');
  };

  importModaCancel = () => {
    this.setState(this.defaultState);
  };

  handleUpload = (v, index) => {
    const { file } = this.state;
    const { dispatch } = this.props;
    const fileData = new FormData();
    fileData.append('file', file);
    dispatch({ type: `${DOMAIN}/uploadLabor`, payload: fileData });
  };

  tablePropsConfig = () => {
    const { loading, list, total, searchForm, dispatch, user } = this.props;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      searchForm, // 把这个注入，可以切 tab 保留table状态
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      scroll: { x: 2100 },
      searchBarForm: [
        {
          title: '单据号',
          dataIndex: 'briefNo',
          options: {
            initialValue: searchForm.briefNo,
          },
          tag: <Input allowClear placeholder="请输入单据号" />,
        },
        {
          title: '项目',
          dataIndex: 'projId',
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectProjectConditional({})}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
        // {
        //   title: '交易日期',
        //   dataIndex: 'settleDate',
        //   tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        // },
        {
          title: '状态',
          dataIndex: 'briefStatus',
          tag: <Selection.UDC code="TSK:BRIEF_STATUS" placeholder="请选择状态" />,
        },
        {
          title: '财务期间',
          dataIndex: 'finPeriodId',
          tag: <Selection source={() => selectFinperiod()} placeholder="财务期间" />,
        },
        {
          title: '项目进度状态',
          dataIndex: 'projProcessStatus',
          tag: <Selection.UDC code="TSK:PROJ_PROCESS_STATUS" placeholder="请选择项目进度状态" />,
        },
        {
          title: '子合同状态',
          dataIndex: 'contractStatus',
          tag: <Selection.UDC code="TSK:CONTRACT_STATUS" placeholder="请选择子合同状态" />,
        },
        {
          title: '汇报日期',
          dataIndex: 'applyDate',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuId',
          tag: <BuVersion />,
        },
        {
          title: '签单BU',
          dataIndex: 'signBuId',
          tag: <BuVersion />,
        },
        {
          title: '已分配金额',
          dataIndex: 'distedAmt',
          options: {
            initialValue: searchForm.distedAmt,
          },
          formItemLayout,
          tag: (
            <SyntheticField className="tw-field-group">
              <Radio.Group
                className="tw-field-group-filter"
                buttonStyle="solid"
                defaultValue="0"
                style={{ width: '40%' }}
              >
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value=">">
                  &gt;
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="<">
                  &lt;
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="=">
                  =
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="!=">
                  ≠
                </Radio.Button>
              </Radio.Group>
              <Input placeholder="请输入已分配金额" />
            </SyntheticField>
          ),
        },
        {
          title: '可分配金额',
          dataIndex: 'distAmt',
          options: {
            initialValue: searchForm.distAmt,
          },
          formItemLayout,
          tag: (
            <SyntheticField className="tw-field-group">
              <Radio.Group
                className="tw-field-group-filter"
                buttonStyle="solid"
                defaultValue="0"
                style={{ width: '40%' }}
              >
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value=">">
                  &gt;
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="<">
                  &lt;
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="=">
                  =
                </Radio.Button>
                <Radio.Button style={{ width: '25%', textAlign: 'center', padding: 0 }} value="!=">
                  ≠
                </Radio.Button>
              </Radio.Group>
              <Input placeholder="请输入可分配金额" />
            </SyntheticField>
          ),
        },
        {
          title: '汇报人',
          dataIndex: 'applyResId',
          options: {
            initialValue: searchForm.applyResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={SEL_COL}
              source={() => selectUsersWithBu()}
              placeholder="请选择汇报人"
              showSearch
            />
          ),
        },
      ],
      columns: [
        {
          title: '单据号',
          dataIndex: 'briefNo',
          width: 300,
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/user/project/projectReportDetail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '状态',
          dataIndex: 'briefStatusDesc',
          width: 150,
        },
        {
          title: '项目',
          dataIndex: 'projName',
          width: 300,
        },
        {
          title: '参考合同号',
          dataIndex: 'userdefinedNo',
          width: 300,
        },
        {
          title: '财务期间',
          dataIndex: 'finPeriodName',
          width: 150,
        },
        {
          title: '项目进度状态',
          dataIndex: 'projProcessStatusDesc',
          width: 150,
        },
        {
          title: '子合同状态',
          dataIndex: 'contractStatusDesc',
          width: 100,
        },
        {
          title: '汇报完工百分比',
          dataIndex: 'reprotCompPercent',
          width: 150,
          render: (value, row, index) => (value ? value + '%' : ''),
        },
        {
          title: '财务调整百分比',
          dataIndex: 'confirmCompPercent',
          width: 150,
          render: (value, row, index) => (value ? value + '%' : ''),
        },
        {
          title: '当期确认收入',
          dataIndex: 'confirmAmt',
          width: 150,
        },
        {
          title: '汇报人',
          dataIndex: 'applyResName',
          width: 150,
        },
        {
          title: '汇报日期',
          dataIndex: 'applyDate',
          width: 150,
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuName',
          width: 200,
        },
        {
          title: '签单BU',
          dataIndex: 'signBuName',
          width: 200,
        },
        {
          title: '已分配金额',
          dataIndex: 'distedAmt',
          width: 150,
        },
        {
          title: '可分配金额',
          dataIndex: 'distAmt',
          width: 150,
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          hidden: true,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id, briefStatus } = selectedRows[0];
            if (briefStatus === 'CREATE') {
              router.push('/user/project/projectReport?id=' + id);
            } else {
              createMessage({ type: 'warn', description: '只有新建状态的可以修改！' });
            }
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const flag = selectedRows.filter(item => item.briefStatus !== 'CREATE').length;
            if (flag) {
              createMessage({ type: 'warn', description: '只有新建状态的可以删除！' });
              return;
            }
            const ids = selectedRows.map(selected => selected.id);
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { keys: ids.join(',') },
            });
          },
        },
        {
          key: 'distInfo',
          title: '收益分配',
          className: 'tw-btn-info',
          icon: 'money-collect',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 审批状态为已通过的可以发起收益分配 apprStatus -> APPROVED
            if (!user.user.admin) {
              createMessage({ type: 'warn', description: '只有管理员可以操作' });
              return;
            }
            const unStatisfiedApprStatus = selectedRows.filter(
              ({ apprStatus }) => apprStatus !== 'APPROVED'
            );
            if (!isEmpty(unStatisfiedApprStatus)) {
              createMessage({
                type: 'warn',
                description: '只能勾选审批状态为已通过的',
              });
              return;
            }

            // 只有子合同状态为激活的合同可以进行利益分配
            const unStatisfiedContractStatus = selectedRows.filter(({ contractStatus }) => {
              const toStr = `${contractStatus}`;
              return toStr !== 'ACTIVE';
            });
            if (!isEmpty(unStatisfiedContractStatus)) {
              createMessage({
                type: 'warn',
                description: '只能勾选子合同状态为“激活”',
              });
              return;
            }

            router.push(
              `/user/project/projectDistInfo?ids=${selectedRowKeys.join(',')}&finPeriodId=${
                selectedRows[0].finPeriodId
              }`
            );
          },
        },
        {
          key: 'defaultRule',
          title: '按默认规则分配',
          className: 'tw-btn-info',
          icon: 'money-collect',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 审批状态为已通过的可以发起收益分配 apprStatus -> APPROVED
            if (!user.user.admin) {
              createMessage({ type: 'warn', description: '只有管理员可以操作' });
              return;
            }
            const unStatisfiedApprStatus = selectedRows.filter(
              ({ apprStatus }) => apprStatus !== 'APPROVED'
            );
            if (!isEmpty(unStatisfiedApprStatus)) {
              createMessage({
                type: 'warn',
                description: '只能勾选审批状态为已通过的',
              });
              return;
            }

            // 只有子合同状态为激活的合同可以进行利益分配
            const unStatisfiedContractStatus = selectedRows.filter(({ contractStatus }) => {
              const toStr = `${contractStatus}`;
              return toStr !== 'ACTIVE';
            });
            if (!isEmpty(unStatisfiedContractStatus)) {
              createMessage({
                type: 'warn',
                description: '只能勾选子合同状态为“激活”',
              });
              return;
            }

            const ids = selectedRowKeys.join(',');
            dispatch({
              type: `contractRecv/defaultRule`,
              payload: {
                ids,
                triggerType: 'CONFIREM',
              },
            }).then(res => {
              this.fetchData(searchForm);
            });
          },
        },
        {
          key: 'importProjectLabor',
          title: '导入项目劳务成本',
          className: 'tw-btn-info',
          loading: false,
          hidden: true,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.showImportModal();
          },
        },
      ],
    };

    return tableProps;
  };

  render() {
    const { templateUrl, showImportModalFlag, draggerProps } = this.state;
    const { loading } = this.props;
    return (
      <PageHeaderWrapper title="项目情况汇报">
        <DataTable {...this.tablePropsConfig()} />
        <Modal
          title="选择文件"
          visible={showImportModalFlag}
          // onOk={this.handleOk}
          onCancel={this.importModaCancel}
          okText="确认"
          cancelText="取消"
          destroyOnClose
          footer={
            templateUrl
              ? [
                  // eslint-disable-next-line
                  <Button icon="download" key="downloadTemplate" onClick={this.downloadTemplate}>
                    下载模板
                  </Button>,
                  // eslint-disable-next-line
                  <Button
                    type="primary"
                    key="upload"
                    className="tw-btn-warning"
                    onClick={this.handleUpload}
                    loading={loading}
                    style={{ marginTop: 16 }}
                  >
                    确认上传
                  </Button>,
                ]
              : null
          }
        >
          <Dragger {...draggerProps}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-hint">点击或拖曳上传</p>
          </Dragger>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default ProjectReportList;
