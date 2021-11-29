import React, { PureComponent } from 'react';
import { Button, Icon, Input, Modal, Switch, Upload } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, DatePicker } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { toQs, toUrl } from '@/utils/stringUtils';
import { selectUsersWithBu } from '@/services/gen/list';
import { selectProjectConditional } from '@/services/user/project/project';
import { saveAs } from 'file-saver';

const { Dragger } = Upload;

const DOMAIN = 'projectLaborList';
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, projectLaborList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...projectLaborList,
  dispatch,
  user,
}))
@mountToTab()
class ProjectLaborList extends PureComponent {
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

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
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
    dispatch({ type: `${DOMAIN}/uploadLabor`, payload: fileData }).then(data => {
      if (data.length) {
        createMessage({ type: 'warn', description: <pre>{data}</pre> });
      }
    });
  };

  tablePropsConfig = () => {
    const { loading, dataSource, total, searchForm, dispatch, user } = this.props;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      onChange: filters => this.fetchData(filters),
      searchForm, // 把这个注入，可以切 tab 保留table状态
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '批次号',
          dataIndex: 'laborNo',
          options: {
            // initialValue: searchForm.tmplName,
          },
          tag: <Input placeholder="请输入名称" />,
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
        {
          title: '期间',
          dataIndex: 'periodDate',
          tag: <DatePicker.MonthPicker placeholder="期间" />,
        },
      ],
      columns: [
        {
          title: '批次号',
          dataIndex: 'laborNo',
        },
        {
          title: '项目',
          dataIndex: 'projName',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/user/project/projectDetail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '期间',
          dataIndex: 'periodDate',
          render: (value, rowData) => (value ? value.substring(0, 7) : ''),
        },
        {
          title: '金额',
          dataIndex: 'amt',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: true,
          disabled: false,
          minSelections: 0,
          cb: () => router.push('/user/task/tmplEdit'),
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: true,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length !== 1) {
              createMessage({ type: 'warn', description: '请选择一条记录删除！' });
              return;
            }
            const { id } = selectedRows[0];
            router.push('/user/task/tmplEdit?id=' + id);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading,
          hidden: true,
          disabled: selectedRows => selectedRows.length < 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length < 1) {
              createMessage({ type: 'warn', description: '请至少选择一条记录删除！' });
              return;
            }
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: { keys: selectedRowKeys.join(',') },
                }),
            });
          },
        },
        {
          key: 'importProjectLabor',
          title: '导入项目劳务成本',
          className: 'tw-btn-info',
          loading: false,
          hidden: false,
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
    return (
      <PageHeaderWrapper title="项目劳务成本列表">
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

export default ProjectLaborList;
