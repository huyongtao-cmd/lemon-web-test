import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, has } from 'ramda';
import { DatePicker, Modal, Form, Select } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { flowToRouter } from '@/utils/flowToRouter';
import { getType } from '@/services/user/equivalent/equivalent';
import { selectIamAllUsers, selectIamUsers, tenantProc } from '@/services/gen/list';
import { UdcSelect, Selection } from '@/pages/gen/field';

import { request } from '@/utils/networkUtils';
import { toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { Field } = FieldList;

const DOMAIN = 'flowProcsAll';
const { Option } = Select;
const { revoke } = api.bpm;

const hasStartTime = has('startTime');

const accColumns = [
  { title: '用户ID', dataIndex: 'code', span: 10 },
  { title: '姓名', dataIndex: 'name', span: 7 },
];

@connect(({ dispatch, loading, user, flowProcsAll }) => ({
  dispatch,
  user,
  flowProcsAll,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    // console.log(props, changedValues, allValues)
  },
})
@mountToTab()
class ProcsMgmt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      confirmLoading: false,
      lastApproverIsShow: false,
      parmas: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'no', sortDirection: 'DESC', done: false, limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  requestRealType = async rowData => {
    const { id, taskId, docId } = rowData;
    const { status, response } = await getType(docId);
    if (status === 200 && response.ok) {
      const defKey =
        // eslint-disable-next-line
        response.datum === 'TASK_BY_PACKAGE'
          ? 'ACC_A22.SUM'
          : response.datum === 'TASK_BY_MANDAY'
            ? 'ACC_A22.SINGLE'
            : 'ACC_A22.COM';
      const route = flowToRouter(defKey, { id, taskId, docId, mode: 'view' });
      router.push(route);
    }
  };

  renderLink = (value, rowData) => {
    const { defKey, id, taskId, docId, procIden } = rowData;
    if (defKey === 'ACC_A22') {
      return (
        <a className="tw-link" onClick={() => this.requestRealType(rowData)}>
          {value}
        </a>
      );
    }
    const route = flowToRouter(procIden, {
      id,
      taskId,
      docId,
      mode: 'view',
    });
    return (
      <Link className="tw-link" to={route}>
        {value}
      </Link>
    );
  };

  handleRevoked = prcId => {
    request.post(toUrl(revoke, { id: prcId })).then(({ response }) => {
      if (response.ok) {
        createMessage({ type: 'success', description: '撤销成功' });
        const { flowProcsAll, dispatch } = this.props;
        const { searchForm } = flowProcsAll;
        dispatch({ type: `${DOMAIN}/updateSearchForm`, payload: { selectedRowKeys: [] } });
        this.fetchData(searchForm);
      } else {
        createMessage({ type: 'error', description: `当前流程不可撤回` });
      }
    });
  };

  tableCfg = () => {
    const { loading, flowProcsAll, dispatch, user = {} } = this.props;
    const { searchForm, list, total } = flowProcsAll;
    const tableProps = {
      rowKey: 'no',
      sortBy: 'no',
      sortDirection: 'DESC',
      scroll: {
        // x: '120%',
        // y: 330,
      },
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      dataSource: list,
      searchForm,
      // enableSelection: false,
      onChange: filters => {
        if (hasStartTime(filters)) {
          const { startTime } = filters;
          const convertTime = startTime ? formatDT(startTime) : undefined;
          this.fetchData({ ...filters, startTime: convertTime });
        } else {
          this.fetchData(filters);
        }
      },
      onSearchBarChange: (_, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      leftButtons: [
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          icon: 'warning',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // Tag:: 需求描述，对于运维来说，都可以删，后端控制到底能不能删
            const { id, todoInfo = {} } = selectedRows[0];
            // const { workerNames } = todoInfo;
            // const { info = {}, roles = [] } = user.user || {};
            // const { name } = info;
            // if (name === workerNames || roles.includes('SYS_ADMIN'))
            dispatch({
              type: `${DOMAIN}/deleteProc`,
              payload: id,
            });
            // else createMessage({ type: 'warn', description: '当前流程不允许删除' });
          },
        },
        {
          key: 'rollback',
          title: '撤回',
          className: 'tw-btn-primary',
          icon: 'rollback',
          loading: false,
          hidden: false,
          // disabled: selectedRows => selectedRows[0] && !selectedRows[0].revokable,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            this.handleRevoked(id);
          },
        },
        {
          key: 'changeApprover',
          title: '变更审批人',
          className: 'tw-btn-primary',
          icon: 'mr',
          loading: false,
          hidden: false,
          // disabled: selectedRows => selectedRows[0] && !selectedRows[0].revokable,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const idList = selectedRows.map(({ id }) => id).join(',');
            this.setState({
              visible: true,
              lastApproverIsShow: false,
              parmas: {
                idList,
              },
            });
          },
        },
        {
          key: 'changeAllApprover',
          title: '批量变更审批人',
          className: 'tw-btn-primary',
          icon: 'mr',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({
              visible: true,
              lastApproverIsShow: true,
            });
          },
        },
      ],
      searchBarForm: [
        {
          title: '当前处理人',
          dataIndex: 'todoAssigneeNameLike',
          options: {
            initialValue: searchForm.todoAssigneeNameLike,
          },
        },
        {
          title: '当前节点名',
          dataIndex: 'taskName',
          options: {
            initialValue: searchForm.taskName,
          },
        },
        {
          title: '是否结束',
          dataIndex: 'done',
          options: {
            initialValue: searchForm.done || 'all',
          },
          tag: (
            <Select>
              <Option value="all">全部</Option>
              <Option value="true">是</Option>
              <Option value="false">否</Option>
            </Select>
          ),
        },
        {
          title: '流程类型',
          // dataIndex: 'defKey',
          dataIndex: 'procIden',
          options: {
            initialValue: searchForm.defKey,
          },
          tag: <Selection source={() => tenantProc()} placeholder="请选择流程类型" />,
        },
        {
          title: '流程编号',
          dataIndex: 'no',
          options: {
            initialValue: searchForm.no,
          },
        },
        {
          title: '流程名',
          dataIndex: 'nameLike',
          options: {
            initialValue: searchForm.nameLike,
          },
        },
        {
          title: '相关信息',
          dataIndex: 'infoLike',
          options: {
            initialValue: searchForm.infoLike,
          },
        },
        {
          title: '发起人',
          dataIndex: 'initiator',
          options: {
            initialValue: searchForm.initiator,
          },
          tag: (
            <UdcSelect
              source={() => selectIamAllUsers().then(resp => resp.response)}
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              placeholder="请选择发起人"
            />
          ),
        },
        {
          title: '创建日期(从)',
          dataIndex: 'sinceDate',
          options: {
            initialValue: searchForm.sinceDate,
          },
          tag: <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />,
        },
        {
          title: '创建日期(至)',
          dataIndex: 'untilDate',
          options: {
            initialValue: searchForm.untilDate,
          },
          tag: <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />,
        },
      ],
      columns: [
        {
          title: '流程编号',
          dataIndex: 'no',
          className: 'text-center',
          width: '13%',
          render: this.renderLink,
        },
        {
          title: '流程名称',
          dataIndex: 'docName',
          width: '15%',
          render: this.renderLink,
        },
        {
          title: '相关信息',
          dataIndex: 'docInfo',
          width: '15%',
        },
        {
          title: '创建时间',
          dataIndex: 'startTime',
          sorter: true,
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
          // render: value => formatDT(value),
          width: '12%',
        },
        {
          title: '发起人',
          dataIndex: 'initiatorName',
          width: '15%',
          className: 'text-center',
        },
        {
          title: '当前处理人',
          dataIndex: 'currentName',
          width: '15%',
          className: 'text-center',
          render: (_, record) => {
            const current = record.todoInfo || {};
            if (isEmpty(current)) return <span>空</span>;
            return <span>{current.workerNames}</span>;
          },
        },
        {
          title: '当前节点名',
          dataIndex: 'currentTask',
          width: '15%',
          className: 'text-center',
          render: (_, record) => {
            const current = record.todoInfo || {};
            if (isEmpty(current)) return <span>空</span>;
            return <span>{current.taskNames}</span>;
          },
        },
        // {
        //   title: '下一节点处理人',
        //   dataIndex: 'nextName',
        //   width: '15%',
        //   render: (_, record) => {
        //     const current = (record.taskInfo || []).filter(task => Number(task.taskSeq) === 1);
        //     if (isEmpty(current)) return <span>空</span>;
        //     return <span>{current[0].taskNames}</span>;
        //   },
        // },
        // {
        //   title: '下一节点名',
        //   dataIndex: 'nextTask',
        //   width: '15%',
        //   render: (_, record) => {
        //     const current = (record.taskInfo || []).filter(task => Number(task.taskSeq) === 1);
        //     if (isEmpty(current)) return <span>空</span>;
        //     return <span>{current[0].candidates}</span>;
        //   },
        // },
      ],
    };
    return tableProps;
  };

  closeModal = () => {
    const { form } = this.props;
    this.setState({ visible: false });
    form.resetFields();
  };

  handleOk = () => {
    this.setState({
      confirmLoading: true,
    });
    const { lastApproverIsShow } = this.state;
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (lastApproverIsShow && !values.lastApprover) {
        createMessage({ type: 'error', description: '请选择原申请人' });
        return null;
      }
      if (!values.changeApprover) {
        createMessage({ type: 'error', description: '请选择变更后审批人' });
        return null;
      }
      const { parmas } = this.state;
      this.setState(
        {
          parmas: {
            ...parmas,
            ...values,
          },
        },
        () => {
          const { dispatch } = this.props;
          const { parmas: newParams } = this.state;
          dispatch({
            type: `${DOMAIN}/changeApprover`,
            payload: {
              newParams,
            },
          });
          this.setState({
            visible: false,
            confirmLoading: false,
          });
        }
      );
      return null;
    });
    form.resetFields();
  };

  handleCancel = () => {
    const { form } = this.props;
    this.setState({
      visible: false,
    });
    form.resetFields();
  };

  render() {
    const {
      dispatch,
      loading,
      // prePayCreate: { formData, accList, contractList, reasonList },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;
    const { visible, confirmLoading, lastApproverIsShow } = this.state;
    return (
      <PageHeaderWrapper title="流程检索">
        <DataTable {...this.tableCfg()} />
        <Modal
          centered
          title={lastApproverIsShow ? '批量变更审批人' : '变更审批人'}
          visible={visible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
          width={800}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2} noReactive>
            {lastApproverIsShow ? (
              <Field
                name="lastApprover"
                label="原审批人"
                decorator={
                  {
                    // initialValue: '请选择原审批人',
                  }
                }
              >
                <Selection
                  transfer={{ code: 'id', name: 'name' }}
                  source={() => selectIamAllUsers()}
                  placeholder="请选择原审批人"
                />
              </Field>
            ) : null}
            <Field
              name="changeApprover"
              label="变更后审批人"
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
              decorator={
                {
                  // initialValue: '请选择变更后审批人',
                }
              }
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectIamUsers()}
                columns={accColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                mode={!lastApproverIsShow ? 'multiple' : ''}
                placeholder="请选择变更后审批人"
              />
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default ProcsMgmt;
