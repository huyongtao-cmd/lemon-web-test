import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tooltip } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import WorkbgModal from '../modal/WorkbgModal';
import { genFakeId } from '@/utils/mathUtils';

const DOMAIN = 'userCenterInfoEdit';

// 工作经历明细初始化
const workbgFormDataModel = {
  id: null,
  resId: null, // 资源id
  dateFrom: null, // 时间
  dateTo: null, // 时间
  industry: null, // 行业
  companyName: null, // 公司
  deptName: null, // 部门
  jobtitle: null, // 职位
  dutyDesc: null, // 职责描述
};

@connect(({ loading, userCenterInfoEdit }) => ({
  userCenterInfoEdit,
  loading,
}))
class Workbg extends PureComponent {
  state = {
    workbgVisible: false, // 工作经历弹框显示
    workbgFormData: {
      ...workbgFormDataModel,
    },
  };

  fetchData = params => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/queryWorkbg`,
      payload: { resId: param.id },
    });
  };

  // 工作经历保存按钮事件
  workbgSubmitModal = () => {
    const { workbgVisible, workbgFormData } = this.state;
    const {
      userCenterInfoEdit: { twResWorkbgTemporaryEntity, workbgSofarFlag },
    } = this.props;

    if (workbgFormData.date && typeof workbgFormData.date[0] !== 'string') {
      workbgFormData.dateFrom = workbgFormData.date[0].format('YYYY-MM-DD');
    }
    if (workbgFormData.date && typeof workbgFormData.date[1] !== 'string') {
      workbgFormData.dateTo = workbgFormData.date[1].format('YYYY-MM-DD');
    }
    if (workbgSofarFlag) {
      workbgFormData.dateTo = null;
      workbgFormData.dateView = `${workbgFormData.dateFrom}至今`;
    } else {
      workbgFormData.dateView = `${workbgFormData.dateFrom}至${workbgFormData.dateTo}`;
    }

    const tt = twResWorkbgTemporaryEntity.filter(v => v.id === workbgFormData.id);
    if (!tt.length) {
      twResWorkbgTemporaryEntity.push({ ...workbgFormData, id: genFakeId(-1), update: 1 });
    } else {
      twResWorkbgTemporaryEntity.forEach((v, index) => {
        if (v.id === workbgFormData.id) {
          twResWorkbgTemporaryEntity[index] = { ...workbgFormData, update: 1 };
        }
      });
    }

    this.setState({
      workbgVisible: !workbgVisible,
      workbgFormData,
    });
  };

  // 工作经历新增弹出窗。
  workbgToggleModal = () => {
    const { workbgVisible } = this.state;
    this.setState({
      workbgVisible: !workbgVisible,
      workbgFormData: {
        ...workbgFormDataModel,
      },
    });
  };

  // 工作经历修改弹出窗。
  workbgEditModal = selectedRow => {
    const { workbgVisible } = this.state;
    this.setState({
      workbgVisible: !workbgVisible,
      workbgFormData: {
        ...selectedRow,
      },
    });
  };

  workbgRangeSofar = flag => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { workbgSofarFlag: flag },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      userCenterInfoEdit: { twResWorkbgTemporaryEntity, workbgdelId, workbgTotal },
    } = this.props;
    const { workbgVisible, workbgFormData } = this.state;

    // 工作经历表格
    const workbgTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/queryWorkbg`],
      pagination: false,
      total: workbgTotal,
      dataSource: twResWorkbgTemporaryEntity,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      showSearch: false,
      columns: [
        {
          title: '时间', // TODO: 国际化
          // dataIndex: 'dateView',
          render: (value, row, key) =>
            row.dateTo ? (
              <span>
                {moment(row.dateFrom).format('YYYY-MM') +
                  '~' +
                  moment(row.dateTo).format('YYYY-MM')}
              </span>
            ) : (
              <span>{moment(row.dateFrom).format('YYYY-MM') + '~至今'}</span>
            ),
        },
        {
          title: '行业', // TODO: 国际化
          dataIndex: 'industry',
        },
        {
          title: '公司', // TODO: 国际化
          dataIndex: 'companyName',
        },
        {
          title: '部门', // TODO: 国际化
          dataIndex: 'deptName',
        },
        {
          title: '职位', // TODO: 国际化
          dataIndex: 'jobtitle',
        },
        {
          title: '职责描述', // TODO: 国际化
          dataIndex: 'dutyDesc',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.workbgToggleModal(),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.workbgEditModal(selectedRows[0]),
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () => {
                const newDataSource = twResWorkbgTemporaryEntity.filter(
                  row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
                );
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    twResWorkbgTemporaryEntity: newDataSource,
                    workbgdelId: [...workbgdelId, ...selectedRowKeys],
                  },
                });
              },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...workbgTableProps} />
        <WorkbgModal
          workbgFormData={workbgFormData}
          visible={workbgVisible}
          handleCancel={this.workbgToggleModal}
          handleOk={this.workbgSubmitModal}
          handleSofar={this.workbgRangeSofar}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Workbg;
