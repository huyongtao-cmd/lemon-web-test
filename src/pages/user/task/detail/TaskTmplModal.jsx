import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Modal, Row, Col, Input, Button, Card, Divider, Tag } from 'antd';
import { Selection, DatePicker } from '@/pages/gen/field';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import DescriptionList from '@/components/layout/DescriptionList';

import { taskTmplListPaging, taskTmplDetail } from '@/services/user/task/task';
import { clone } from 'ramda';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const { Description } = DescriptionList;

// 处理空属性,可以处理list,{},字符串
const handleEmptyProps = param => {
  if (param === undefined || param === null) {
    return undefined;
  }
  if (typeof param === 'object') {
    let newObject;
    if (Array.isArray(param)) {
      newObject = Object.assign([], param);
      for (let index = 0; index < newObject.length; index += 1) {
        const val = param[index];
        if (val === undefined || val === null) {
          newObject.splice(index, 1);
        }
        if (typeof val === 'string') {
          if (val.trim().length > 0) {
            newObject[index] = val.trim();
          } else {
            newObject.splice(index, 1);
          }
        }
      }
    } else {
      // 是一个对象
      newObject = Object.assign({}, param);
      Object.keys(newObject).forEach(key => {
        const val = param[key];
        if (val === undefined || val === null) {
          delete newObject[key];
          return;
        }
        if (typeof val === 'string') {
          if (val.trim().length > 0) {
            newObject[key] = val.trim();
          } else {
            delete newObject[key];
          }
        }
      });
    }
    return newObject;
  }
  if (typeof param === 'string') {
    return param.trim();
  }
  return param;
};

@connect(({ dispatch, loading }) => ({
  dispatch,
  loading,
}))
class TaskTmplModal extends Component {
  state = {
    // searchForm: {},
    taskTmplList: [],
    total: 0,
    selectedKey: undefined,
    taskTmplDetail: {},
  };

  componentDidMount() {
    this.fetchData({});
  }

  fetchData = params => {
    const that = this;
    taskTmplListPaging({ ...handleEmptyProps(params), personalFlag: true }).then(data => {
      const { response } = data;
      that.setState({
        taskTmplList: clone(Array.isArray(response.rows) ? response.rows : []),
        total: response.total,
        selectedKey: undefined,
      });
    });
  };

  fetchTaskTmplDetail = () => {
    const { selectedKey } = this.state;
    taskTmplDetail({ id: selectedKey }).then(data => {
      this.setState({ taskTmplDetail: data.response });
    });
  };

  onRowChange = (selectedRowKeys, selectedRows) => {
    const id = selectedRowKeys[0];
    this.setState({ selectedKey: id }, () => {
      this.fetchTaskTmplDetail();
    });
  };

  handleOnRow = record => {
    // eslint-disable-next-line no-shadow
    const { taskTmplDetail } = this.state;
    const { id } = record;
    return {
      // 点击行
      onClick: event => {
        this.onRowChange([id]);
      },
      onDoubleClick: event => {
        const { onCheck } = this.props;
        onCheck(taskTmplDetail);
      },
    };
  };

  tableCfg = () => {
    const { taskTmplList, total, selectedKey } = this.state;
    const tableProps = {
      rowKey: 'id',
      bordered: true,
      sortDirection: 'DESC',
      dataSource: taskTmplList,
      total,
      showColumn: false,
      showExport: false,
      showSearch: true,
      // onSearchBarChange: (changedValues, allValues) => {
      //   this.setState({searchForm:allValues});
      // },
      onChange: filters => this.fetchData(filters),
      onRow: this.handleOnRow,
      rowSelection: {
        type: 'radio',
        selectedRowKeys: [selectedKey],
        onChange: this.onRowChange,
      },
      searchBarForm: [
        {
          title: '名称',
          dataIndex: 'tmplName',
          colProps: { xs: 24, sm: 12, md: 12, lg: 12, xl: 12 },
          tag: <Input placeholder="请输入名称" />,
        },
        {
          title: '权限类型',
          dataIndex: 'permissionType',
          colProps: { xs: 24, sm: 12, md: 12, lg: 12, xl: 12 },
          tag: <Selection.UDC code="TSK:TASK_TMPL_PERMISSION_TYPE" placeholder="请选择权限类型" />,
        },
      ],
      columns: [
        {
          title: '名称',
          dataIndex: 'tmplName',
        },
        {
          title: '创建人',
          dataIndex: 'resName',
        },
        {
          title: '权限类型',
          dataIndex: 'permissionTypeDesc',
        },
        {
          title: '适用事由类型',
          dataIndex: 'reasonTypeDesc',
        },
      ],
    };
    return tableProps;
  };

  actTableCfg = () => {
    // eslint-disable-next-line no-shadow
    const { taskTmplDetail } = this.state;
    const dataSource = taskTmplDetail.dtlViews || [];
    return {
      rowKey: 'id',
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      columns: [
        {
          title: '活动编码',
          dataIndex: 'actNo',
          align: 'center',
        },
        {
          title: '活动名称',
          dataIndex: 'actName',
          align: 'center',
        },
        {
          title: '活动当量',
          dataIndex: 'eqvaQty',
          align: 'center',
        },
        {
          title: '里程碑',
          dataIndex: 'milestoneFlag',
          align: 'center',
          render: (value, row, index) => (value === 1 ? '是' : '否'),
        },
        {
          title: '要求文档清单',
          dataIndex: 'requiredDocList',
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'center',
        },
      ],
    };
  };

  render() {
    const { visible, toggleModal } = this.props;

    // eslint-disable-next-line no-shadow
    const { taskTmplDetail } = this.state;
    const tableProps = this.tableCfg();
    const actTableProps = this.actTableCfg();

    return (
      <Modal
        title="选择模版"
        visible={visible}
        onOk={this.onSelectTmp}
        onCancel={toggleModal}
        width="80%"
        footer={null}
      >
        <Row>
          <Col span={8}>
            <DataTable {...tableProps} />
          </Col>
          <Col offset={1} span={15}>
            <Card
              title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
              bordered={false}
              className="tw-card-adjust"
            >
              <DescriptionList size="large" col={2} hasSeparator>
                <Description term="名称">{taskTmplDetail.tmplName}</Description>
                <Description term="申请人">{taskTmplDetail.resName}</Description>
                <Description term="权限类型 ">{taskTmplDetail.permissionTypeDesc}</Description>
                <Description term="事由类型">{taskTmplDetail.reasonTypeDesc}</Description>
                <Description term="完工附件上传方法">
                  {taskTmplDetail.attachuploadMethod}
                </Description>
                <Description term="备注">{taskTmplDetail.remark}</Description>
              </DescriptionList>
            </Card>
            <br />
            <Card title="任务活动" bordered={false} className="tw-card-adjust">
              <DataTable {...actTableProps} />
            </Card>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default TaskTmplModal;
