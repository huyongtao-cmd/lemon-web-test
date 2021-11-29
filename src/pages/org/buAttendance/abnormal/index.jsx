import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Modal, Input } from 'antd';
import { formatMessage } from 'umi/locale';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import { selectBuMember } from '@/services/gen/list';

const DOMAIN = 'orgAttendanceRecordAbnormal';

@connect(({ loading, dispatch, orgAttendanceRecordAbnormal }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  orgAttendanceRecordAbnormal,
}))
@mountToTab()
class AttendanceRecordAbnormal extends PureComponent {
  state = {
    modelValue: '',
    remarkModelShow: false,
    remarkParams: {
      id: '',
      status: '',
    },
  };

  componentDidMount() {
    const params = {
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'DESC',
      status: 'APPROVAL_PENDING',
      frozen: 0,
      time: [],
    };
    this.fetchData(params);
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  approvalAbnormalAttendance = (id, status) => {
    const { dispatch } = this.props;
    const { modelValue } = this.state;
    dispatch({
      type: `${DOMAIN}/updateRemarkStatusHandleFn`,
      payload: {
        idStr: id,
        status,
        remake: modelValue,
      },
    });
    this.setState({
      modelValue: '',
      remarkParams: {
        id: '',
        status: '',
      },
      remarkModelShow: false,
    });
  };

  showRemarkModle = (id, status) => {
    const remarkParams = {
      id,
      status,
    };
    this.setState({
      remarkParams,
      remarkModelShow: true,
    });
  };

  modelHandleOk = () => {
    const { remarkParams } = this.state;
    const { id, status } = remarkParams;
    this.approvalAbnormalAttendance(id, status);
  };

  modelHandleCancel = () => {
    this.setState({
      modelValue: '',
      remarkParams: {
        id: '',
        status: '',
      },
      remarkModelShow: false,
    });
  };

  getModelInputValue = e => {
    const val = e.target.value;
    this.setState({
      modelValue: val,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      orgAttendanceRecordAbnormal: { dataSource, searchForm, total },
    } = this.props;

    const { remarkModelShow } = this.state;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource,
      showColumn: false,
      showExport: false,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '时间',
          dataIndex: 'time',
          options: {
            initialValue: searchForm.time || [],
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '姓名',
          dataIndex: 'attResId',
          options: {
            initialValue: searchForm.attResId,
          },
          tag: (
            <Selection.Columns
              source={selectBuMember}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择姓名"
              showSearch
            />
          ),
        },
        {
          title: '审批状态',
          dataIndex: 'status',
          options: {
            initialValue: searchForm.status,
          },
          tag: <Selection.UDC code="COM:ATTENDANCE_APPROVAL_RESULT" placeholder="请选择状态" />,
        },
        {
          title: '冻结状态',
          dataIndex: 'frozen',
          options: {
            initialValue: searchForm.frozen,
          },
          tag: (
            <Selection.Columns
              source={[
                {
                  code: 0,
                  id: 0,
                  name: '未冻结',
                },
                {
                  code: 0,
                  id: 1,
                  name: '已冻结',
                },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择冻结状态"
              showSearch
            />
          ),
        },
      ],
      columns: [
        {
          title: '时间',
          dataIndex: 'attendanceDate',
          sorter: true,
        },
        {
          title: '补卡人',
          dataIndex: 'attendanceResIdName',
          align: 'center',
        },
        {
          title: '最早打卡',
          dataIndex: 'attendanceTimeStart',
          align: 'center',
        },
        {
          title: '最晚打卡',
          dataIndex: 'attendanceTimeEnd',
          align: 'center',
        },
        {
          title: '考勤状态',
          dataIndex: 'attendanceResultDetailName',
          align: 'center',
        },
        {
          title: '补卡原因',
          dataIndex: 'attendanceAbnormalDesc',
        },
        {
          title: '审批状态',
          dataIndex: 'approvalResultName',
          align: 'center',
        },
        {
          title: '冻结状态',
          dataIndex: 'frozen',
          align: 'center',
          render: val => {
            let valname = '';
            if (val === 0) {
              valname = '未冻结';
            }
            if (val === 1) {
              valname = '已冻结';
            }
            return valname;
          },
        },
      ],
      leftButtons: [
        {
          key: 'pass',
          icon: '',
          className: 'tw-btn-primary',
          title: '通过',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => {
            const havaPassOrJeject = selectedRowKeys.find(
              value => value.approvalResult !== 'APPROVAL_PENDING'
            );
            const haveFrozen = selectedRowKeys.find(value => value.frozen === 1);
            return selectedRowKeys.length === 0 || havaPassOrJeject || haveFrozen;
          },

          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.approvalAbnormalAttendance(selectedRowKeys.join(','), 'PASSED');
            // router.push('/user/center/myTeam/resPlanDetail');
          },
        },
        {
          key: 'reject',
          icon: '',
          className: 'tw-btn-error',
          title: '拒绝',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => {
            const havaPassOrJeject = selectedRowKeys.find(
              value => value.approvalResult !== 'APPROVAL_PENDING'
            );
            const haveFrozen = selectedRowKeys.find(value => value.frozen === 1);
            return selectedRowKeys.length !== 1 || havaPassOrJeject || haveFrozen;
          },
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.showRemarkModle(selectedRowKeys.join(','), 'REJECTED');
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="补卡申请">
        {/* <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/hr/attendanceMgmt/attendance')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card> */}

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="补卡申请" />}
        >
          <DataTable {...tableProps} />
        </Card>
        <Modal
          title="拒绝原因"
          centered
          visible={remarkModelShow}
          onOk={this.modelHandleOk}
          onCancel={this.modelHandleCancel}
        >
          <Input placeholder="输入拒绝原因" onChange={e => this.getModelInputValue(e)} />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default AttendanceRecordAbnormal;
