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
          title: '??????',
          dataIndex: 'time',
          options: {
            initialValue: searchForm.time || [],
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '??????',
          dataIndex: 'attResId',
          options: {
            initialValue: searchForm.attResId,
          },
          tag: (
            <Selection.Columns
              source={selectBuMember}
              columns={[
                { dataIndex: 'code', title: '??????', span: 10 },
                { dataIndex: 'name', title: '??????', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="???????????????"
              showSearch
            />
          ),
        },
        {
          title: '????????????',
          dataIndex: 'status',
          options: {
            initialValue: searchForm.status,
          },
          tag: <Selection.UDC code="COM:ATTENDANCE_APPROVAL_RESULT" placeholder="???????????????" />,
        },
        {
          title: '????????????',
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
                  name: '?????????',
                },
                {
                  code: 0,
                  id: 1,
                  name: '?????????',
                },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="?????????????????????"
              showSearch
            />
          ),
        },
      ],
      columns: [
        {
          title: '??????',
          dataIndex: 'attendanceDate',
          sorter: true,
        },
        {
          title: '?????????',
          dataIndex: 'attendanceResIdName',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'attendanceTimeStart',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'attendanceTimeEnd',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'attendanceResultDetailName',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'attendanceAbnormalDesc',
        },
        {
          title: '????????????',
          dataIndex: 'approvalResultName',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'frozen',
          align: 'center',
          render: val => {
            let valname = '';
            if (val === 0) {
              valname = '?????????';
            }
            if (val === 1) {
              valname = '?????????';
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
          title: '??????',
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
          title: '??????',
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
      <PageHeaderWrapper title="????????????">
        {/* <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/hr/attendanceMgmt/attendance')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card> */}

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="????????????" />}
        >
          <DataTable {...tableProps} />
        </Card>
        <Modal
          title="????????????"
          centered
          visible={remarkModelShow}
          onOk={this.modelHandleOk}
          onCancel={this.modelHandleCancel}
        >
          <Input placeholder="??????????????????" onChange={e => this.getModelInputValue(e)} />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default AttendanceRecordAbnormal;
