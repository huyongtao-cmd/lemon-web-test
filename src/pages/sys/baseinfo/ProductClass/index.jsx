import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Search, Modal, List } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { ProductTree } from '@/pages/gen/list';
import { createAlert } from '@/components/core/Confirm';
import TreeSearch from '@/components/common/TreeSearch';
import Loading from '@/components/core/DataLoading';

import CreateModal from './createModal';
import DeleteModal from './deleteFailModal';
import TreeModal from './treeModal';

const DOMAIN = 'sysProductClass';
const formDataModel = {
  id: null,
  classCode: null,
  className: null,
  pclassName: null,
  pid: -1,
  sortNo: null,
  remark: null,
};

const searchModel = {
  classCode: null,
  className: null,
  pid: -1,
};

const formItemLayout = {
  labelCol: { span: 10, lg: 10, xl: 8 },
  wrapperCol: { span: 14, lg: 14, xl: 16 },
};

@connect(({ loading, sysProductClass }) => ({
  loading,
  sysProductClass,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
class BaseinfoProductClass extends PureComponent {
  state = {
    deleteModalVisible: false,
    modalVisible: false,
    treeModalVisible: false,
    temPid: -1,
    temPclassName: null,
    pid: -1,
    formData: {
      ...formDataModel,
    },
    confirmLoading: false,
  };

  componentWillMount() {}

  componentDidMount() {
    this.fetchPageData();
  }

  fetchPageData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/tree`,
    });
    dispatch({
      type: `${DOMAIN}/fetch`,
    });
  };

  // 提交弹出窗。
  submitModal = () => {
    const { confirmLoading } = this.state;
    this.setState({
      confirmLoading: true,
    });
    const { modalVisible, formData } = this.state;
    const { dispatch } = this.props;
    if (formData.id != null) {
      dispatch({
        type: `${DOMAIN}/update`,
        payload: formData,
      }).then(({ status, reason }) => {
        this.setState({
          modalVisible: !modalVisible,
          confirmLoading: false,
          formData: {
            id: null,
            classCode: null,
            className: null,
            pclassName: null,
            pid: -1,
            sortNo: null,
            remark: null,
          },
        });
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (reason === 'OK') {
          createAlert.success({
            content: '更新分类成功。',
            onOk: () => this.fetchPageData(),
          });
        } else {
          createAlert.error({
            content: '更新分类失败。',
          });
        }
      });
    } else {
      dispatch({
        type: `${DOMAIN}/add`,
        payload: formData,
      }).then(({ status, reason }) => {
        this.setState({
          modalVisible: !modalVisible,
          confirmLoading: false,
          formData: {
            id: null,
            classCode: null,
            className: null,
            pclassName: null,
            pid: -1,
            sortNo: null,
            remark: null,
          },
        });
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (reason === 'OK') {
          createAlert.success({
            content: '创建分类成功。',
            onOk: () => this.fetchPageData(),
          });
        } else {
          createAlert.error({
            content: '创建分类失败。',
          });
        }
      });
    }
  };

  // 新增弹出窗。
  addModal = selectedRows => {
    const { modalVisible } = this.state;
    if (selectedRows && selectedRows[0]) {
      // 选中行新增
      this.setState({
        modalVisible: !modalVisible,
        formData: {
          ...formDataModel,
          pid: parseInt(selectedRows[0].id, 0),
          pclassName: selectedRows[0].className,
        },
      });
    } else {
      // 直接点新增
      this.setState({
        modalVisible: !modalVisible,
        formData: {
          ...formDataModel,
        },
      });
    }
  };

  // 修改弹出窗。
  editModal = param => {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
      formData: {
        id: param.id,
        classCode: param.classCode,
        className: param.className,
        pclassName: param.pclassName,
        pid: param.pid,
        sortNo: param.sortNo,
        remark: param.remark,
      },
    });
  };

  // 切换弹出窗。
  deleteToggleModal = () => {
    const { deleteModalVisible } = this.state;
    this.setState({
      deleteModalVisible: !deleteModalVisible,
    });
  };

  treeModal = () => {
    const { treeModalVisible, formData } = this.state;
    this.setState({
      treeModalVisible: !treeModalVisible,
      temPid: formData.pid,
      temPclassName: formData.pclassName,
    });
  };

  treeModalOk = () => {
    const { treeModalVisible } = this.state;
    this.setState({
      treeModalVisible: !treeModalVisible,
    });
  };

  treeModalCancel = () => {
    const { formData, treeModalVisible, temPid, temPclassName } = this.state;
    this.setState({
      treeModalVisible: !treeModalVisible,
      formData: {
        ...formData,
        pid: temPid,
        pclassName: temPclassName,
      },
    });
  };

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/fetch`,
      payload: {
        ...params,
      },
    });
  };

  selectClass = (expandedKeys, e) => {
    const { formData } = this.state;
    if (expandedKeys[0]) {
      this.setState({
        formData: {
          ...formData,
          pid: parseInt(expandedKeys[0], 0),
          pclassName: e.node.props.title,
        },
      });
    } else {
      this.setState({
        formData: {
          ...formData,
          pid: -1,
          pclassName: null,
        },
      });
    }
  };

  render() {
    const {
      formData,
      deleteModalVisible,
      modalVisible,
      treeModalVisible,
      pid,
      confirmLoading,
    } = this.state;
    const {
      loading,
      sysProductClass: { list, total, tree },
      dispatch,
    } = this.props;
    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      // limit: stringUtils.queryURL('limit'),
      // offset: stringUtils.queryURL('offset'),
      sortDirection: 'DESC',
      scroll: {
        x: '40%',
        y: 900,
      },
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/fetch`],
      expirys: 0,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        if (allValues.classCode) {
          searchModel.classCode = allValues.classCode;
        } else {
          searchModel.classCode = '';
        }
        if (allValues.className) {
          searchModel.className = allValues.className;
        } else {
          searchModel.className = '';
        }
      },
      enableDoubleClick: false,
      total,
      dataSource: list,
      searchBarForm: [
        {
          title: formatMessage({
            id: 'sys.baseinfo.productClass.classCode',
            defaultMessage: '分类编号',
          }),
          dataIndex: 'classCode',
          formItemLayout,
        },
        {
          /* title: interpolate(
                  formatMessage({id: 'sys.baseinfo.productClass.classCode', defaultMessage: '分类编号' }),
                  5, 10
          ), */
          title: '分类名称', // TODO: 国际化！！！
          dataIndex: 'className',
          formItemLayout,
        },
      ],
      columns: [
        {
          title: '分类编号', // TODO: 国际化！！！
          dataIndex: 'classCode',
          width: '15%',
          sorter: true,
          align: 'center',
        },
        {
          title: '分类名称', // TODO: 国际化！！！
          dataIndex: 'className',
          width: '35%',
          sorter: true,
        },
        {
          title: '上级分类', // TODO: 国际化！！！
          dataIndex: 'pclassName',
          width: '35%',
          sorter: true,
        },
        {
          title: '排序号', // TODO: 国际化！！！
          dataIndex: 'sortNo',
          width: '15%',
          sorter: true,
          align: 'right',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          title: '新增', // TODO: 国际化！！！
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          icon: 'plus-circle',
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.addModal(selectedRows);
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '编辑',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          icon: 'form',
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.editModal(selectedRows[0]);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: '删除',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          icon: 'delete',
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys, queryParams },
            }).then(({ status, response }) => {
              if (status === 100) {
                // 主动取消请求
                return;
              }
              if (response.errCode === 'NG_CHECK_CHILD_CLASS') {
                createAlert.warning({
                  content: response.datum,
                });
              } else if (response.errCode === 'NG_CHECK_VALID_PROD') {
                Modal.warning({
                  title: '系统提示',
                  content: (
                    <List
                      size="small"
                      bordered
                      dataSource={response.datum}
                      renderItem={item => <List.Item>{item}</List.Item>}
                    />
                  ),
                  width: 620,
                });
              } else {
                createAlert.warning({
                  content: response.reason,
                });
              }
            });
          },
        },
      ],
    };

    const onSelect = expandedKeys => {
      if (expandedKeys[0]) {
        searchModel.pid = parseInt(expandedKeys[0], 0);
        searchModel.id = parseInt(expandedKeys[0], 0);
      } else {
        searchModel.pid = -1;
      }
      dispatch({
        type: `${DOMAIN}/fetch`,
        payload: searchModel,
      });
    };

    const mergeDeep = child =>
      Array.isArray(child)
        ? child.map(item => ({
            ...item,
            text: item.className,
            child: item.child ? mergeDeep(item.child) : null,
          }))
        : [];

    return (
      <PageHeaderWrapper title="基础组件参考">
        <Row gutter={8}>
          <Col span={8}>
            {!loading.effects[`${DOMAIN}/tree`] ? (
              <TreeSearch
                treeData={mergeDeep(tree)}
                placeholder={formatMessage({ id: 'sys.baseinfo.productClass.search' })}
                showSearch
                onSelect={onSelect}
                defaultExpandedKeys={tree.map(item => `${item.id}`)}
              />
            ) : (
              <Loading />
            )}
          </Col>
          <Col span={16}>
            <DataTable {...tableProps} />
          </Col>
        </Row>

        <CreateModal
          formData={formData}
          visible={modalVisible}
          onToggle={this.addModal}
          onSubmit={this.submitModal}
          popTree={this.treeModal}
          confirmLoading={confirmLoading}
        />
        <DeleteModal visible={deleteModalVisible} onToggle={this.deleteToggleModal} />
        <TreeModal
          tree={tree}
          formData={formData}
          visible={treeModalVisible}
          treeModalCancel={this.treeModalCancel}
          selectedOk={this.treeModalOk}
          selectClass={this.selectClass}
        />
      </PageHeaderWrapper>
    );
  }
}

export default BaseinfoProductClass;
