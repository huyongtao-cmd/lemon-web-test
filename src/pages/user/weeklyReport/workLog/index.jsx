// 工作日志
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Card, Row, Col, Modal, Button } from 'antd';
import moment from 'moment';
import update from 'immutability-helper';
import { formatMessage } from 'umi/locale';
import EditableDataTable from '@/components/common/EditableDataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
// import AsyncSelect from '@/components/common/AsyncSelect';
import createMessage from '@/components/core/AlertMessage';
import { mountToTab } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';
import { genFakeId, checkIfNumber } from '@/utils/mathUtils';
// import { ProjectModal } from '@/pages/gen/modal';
import { eqBy } from 'ramda';
import { fromQs } from '@/utils/stringUtils';
import ReportModal from './ReportModal';
// import { Modal } from 'antd-mobile';

const strEq = eqBy(Object);

const DOMAIN = 'workLog';
let isMessage = true;

// eslint-disable-next-line consistent-return
const getDateStart = (workDate, workDateType) => {
  if (workDateType === 'DAY') {
    return workDate;
  }
  if (workDateType === 'WEEK') {
    return moment(workDate)
      .startOf('week')
      .format('YYYY-MM-DD');
  }
  if (workDateType === 'MONTH') {
    return moment(workDate)
      .startOf('month')
      .format('YYYY-MM-DD');
  }
};

@connect(({ loading, dispatch, workLog }) => ({
  loading,
  dispatch,
  workLog,
}))
@mountToTab()
class WorkLog extends PureComponent {
  state = {
    visible: false,
    _selectedRowKeys: [],
  };

  componentDidMount() {
    const {
      dispatch,
      // workLog: { workDate },
    } = this.props;
    const workDate = moment()
      .startOf('week')
      .format('YYYY-MM-DD');

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        workDate,
      },
    });

    this.fetchDate(workDate);
    dispatch({
      type: `${DOMAIN}/workPlan`,
    });
  }

  fetchDate = value => {
    const { dispatch, workLog } = this.props;
    const { workLogPeriodType, unsavedFlag } = workLog;
    if (unsavedFlag) {
      createConfirm({
        content: '本页面有数据未保存,确定将忽略已修改数据!',
        onOk: () => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              workDate: value,
              // workLogPeriodType,
            },
          });
          dispatch({
            type: `${DOMAIN}/query`,
          });
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          workDate: value,
          // workLogPeriodType,
        },
      });
      dispatch({
        type: `${DOMAIN}/query`,
      });
    }
  };

  closeModal = () => {
    this.setState({
      visible: false,
    });
  };

  // 周期类型切换
  handleChangeBuType = value => {
    const {
      dispatch,
      workLog: { workDate, workLogPeriodType, unsavedFlag },
    } = this.props;
    if (unsavedFlag) {
      createConfirm({
        content: '本页面有数据未保存,确定将忽略已修改数据!',
        onOk: () => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              workLogPeriodType: value,
              workDate: getDateStart(workDate, value),
            },
          });
          dispatch({
            type: `${DOMAIN}/query`,
          });
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          workLogPeriodType: value,
          workDate: getDateStart(workDate, value),
        },
      });
      dispatch({
        type: `${DOMAIN}/query`,
      });
    }
  };

  // eslint-disable-next-line consistent-return
  disabledDate = current => {
    const {
      workLog: { workDate, workLogPeriodType },
    } = this.props;
    if (workLogPeriodType === 'WEEK') {
      return !(
        moment(workDate).isSame(current) ||
        moment(current).isBetween(moment(workDate).startOf('week'), moment(workDate).endOf('week'))
      );
    }
    if (workLogPeriodType === 'MONTH') {
      return !(
        moment(workDate).isSame(current) ||
        moment(current).isBetween(
          moment(workDate).startOf('month'),
          moment(workDate).endOf('month')
        )
      );
    }
    if (workLogPeriodType === 'DAY') {
      return !(
        moment(workDate).isSame(current) ||
        moment(current).isBetween(moment(workDate).startOf('day'), moment(workDate).endOf('day'))
      );
    }
  };

  handleInitWeeks = () => {
    const {
      dispatch,
      workLog: { dataSource },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/initWeek`,
      payload: {
        dataSource: Array(7)
          .fill(0)
          .map(item => ({ id: genFakeId(-1) })),
        ids: dataSource.map(i => i.id).filter(item => item > 0),
      },
    });
    this.setState({ _selectedRowKeys: [] });
    createMessage({ type: 'success', description: '操作成功' });
  };

  // 选择任务和活动下拉组件赋值
  onSelectChanged = (rowIndex, rowField) => value => {
    const {
      dispatch,
      workLog: { dataSource },
    } = this.props;
    let newDataSource = dataSource;
    let taskId = null;
    let tsTaskIden = null;
    let actId = null;
    let tsActIden = null;

    if (rowField === 'taskId') {
      checkIfNumber(value) ? (taskId = value) : (tsTaskIden = value);
      newDataSource = update(dataSource, {
        [rowIndex]: {
          taskId: { $set: taskId },
          tsTaskIden: { $set: tsTaskIden },
          actId: { $set: null },
          tsActIden: { $set: null },
        },
      });
    }
    if (rowField === 'actId') {
      checkIfNumber(value) ? (actId = value) : (tsActIden = value);
      newDataSource = update(dataSource, {
        [rowIndex]: {
          actId: { $set: actId },
          tsActIden: { $set: tsActIden },
        },
      });
    }
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  // 一般行编辑赋值
  onCellChanged = (rowIndex, rowField, row) => rowFieldValue => {
    const {
      dispatch,
      workLog: { dataSource },
    } = this.props;

    const newValue =
      rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: newValue,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource, unsavedFlag: true },
    });
  };

  saveTimesheet = cb => {
    const {
      dispatch,
      workLog: { dataSource, workDate },
    } = this.props;

    const { _selectedRowKeys } = this.state;

    // 校验明细项 && 保存时校验
    const workDateError = dataSource.filter(v => !v.workDate);
    const workDescError = dataSource.filter(v => !v.workDesc);
    const remarkError = dataSource.filter(v => !v.remark);
    if (workDateError.length) {
      createMessage({
        type: 'warn',
        description: `请填写日期。`,
      });
      return;
    }
    if (workDescError.length) {
      createMessage({
        type: 'warn',
        description: `请填写[${workDescError
          .map(i => moment(i.workDate).format('YYYY-MM-DD'))
          .join('],[')}]的工作总结`,
      });
      return;
    }

    dispatch({
      type: `${DOMAIN}/save`,
      payload: { dataSource, workDate },
    }).then(res => {
      // createMessage({ type: 'success', description: '操作成功' });
      this.setState({ _selectedRowKeys: [] });
      if (isMessage) {
        createMessage({ type: 'success', description: '保存成功' });
      }
      isMessage = true;
      typeof cb === 'function' && cb();
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    const that = this;
    isMessage = false;
    this.saveTimesheet(() => {
      that.setState({ visible: !visible });
    });

    const {
      dispatch,
      workLog: { workDate, workLogPeriodType, dataSource, taskAllListJson },
    } = this.props;
    // const workPlan = taskAllList.map(item => {
    //   return item.valDesc;
    // })
    const newDataSource = dataSource.map(data => ({
      ...data,
      timesheetId: data.id,
      workSummary: data.workDesc,
      workPlan: taskAllListJson[data.workPlanId],
      helpWork: data.remark,
    }));
    dispatch({
      type: `${DOMAIN}/updateReportModal`,
      payload: { workDate, workLogPeriodType, workReportLogList: newDataSource },
    });
  };

  // eslint-disable-next-line consistent-return
  renderDate = current => {
    const {
      workLog: { workLogPeriodType },
    } = this.props;
    if (workLogPeriodType === 'WEEK') {
      return (
        moment(current).format('YYYY-MM-DD') !==
        moment(current)
          .startOf('week')
          .format('YYYY-MM-DD')
      );
    }
    if (workLogPeriodType === 'MONTH') {
      return (
        moment(current).format('YYYY-MM-DD') !==
        moment(current)
          .startOf('month')
          .format('YYYY-MM-DD')
      );
    }
    if (workLogPeriodType === 'DAY') {
      return (
        moment(current).format('YYYY-MM-DD') !==
        moment(current)
          .startOf('day')
          .format('YYYY-MM-DD')
      );
    }
  };

  render() {
    const { dispatch, loading, workLog } = this.props;
    const { dataSource, total, workDate, workLogPeriodType, taskAllList, delIds } = workLog;
    const { visible, _selectedRowKeys, _udcMap = {} } = this.state;
    const disabledBtn = !!loading.effects[`${DOMAIN}/save`] || !!loading.effects[`${DOMAIN}/query`];

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'ASC',
      loading: disabledBtn,
      total,
      dataSource,
      rowSelection: {
        selectedRowKeys: _selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.setState({
            _selectedRowKeys: selectedRowKeys,
          });
        },
      },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: update(dataSource, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  tsStatus: 'CREATE',
                  workDate,
                  timesheetViews: [],
                },
              ],
            }),
            unsavedFlag: true,
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = dataSource.filter(row => selectedRowKeys.indexOf(row.id) < 0);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: newDataSource,
            delIds: [...delIds, ...selectedRowKeys],
            unsavedFlag: true,
          },
        });
      },
      onCopyItem: copied => {
        const newDataSource = copied.map(item => ({
          ...item,
          id: genFakeId(-1),
          tsStatus: 'CREATE',
        }));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { dataSource: update(dataSource, { $push: newDataSource }), unsavedFlag: true },
        });
      },
      columns: [
        {
          title: '日期',
          dataIndex: 'workDate',
          required: true,
          width: '20%',
          render: (value, row, index) => (
            <div style={{ display: 'flex' }}>
              <DatePicker
                defaultPickerValue={workDate ? moment(workDate) : undefined}
                // disabled={row.tsStatus !== 'CREATE' && row.tsStatus !== 'REJECTED'}
                value={value}
                onChange={this.onCellChanged(index, 'workDate', row)}
                format="YYYY-MM-DD"
                disabledDate={this.disabledDate}
                className="x-fill-100"
              />
            </div>
          ),
        },
        {
          title: '工作总结',
          dataIndex: 'workDesc',
          required: true,
          width: '30%',
          render: (value, row, index) => (
            <Input.TextArea
              // disabled={row.tsStatus !== 'CREATE' && row.tsStatus !== 'REJECTED'}
              defaultValue={value}
              onBlur={this.onCellChanged(index, 'workDesc')}
              rows={1}
              maxLength={200}
            />
          ),
        },
        {
          title: '工作计划',
          dataIndex: 'workPlanId',
          width: '20%',
          render: (value, row, index) => (
            <Selection
              className="x-fill-100"
              value={value}
              source={taskAllList}
              dropdownMatchSelectWidth={false}
              showSearch
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择工作计划"
              onChange={this.onCellChanged(index, 'workPlanId')}
              // disabled={!isNil(row.planId) && !isEmpty(row.planId)}
            />
          ),
        },
        {
          title: '需协调工作',
          dataIndex: 'remark',
          width: '30%',
          render: (value, row, index) => (
            <Input.TextArea
              // disabled={row.tsStatus !== 'CREATE' && row.tsStatus !== 'REJECTED'}
              defaultValue={value}
              onBlur={this.onCellChanged(index, 'remark')}
              rows={1}
              maxLength={200}
            />
          ),
        },
      ],
    };
    //
    return (
      <PageHeaderWrapper title="工作日志">
        <Card className="tw-card-rightLine" bordered={false}>
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={() => {
              this.saveTimesheet();
            }}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
        </Card>
        <Card>
          <Row type="flex" justify="start" align="middle">
            <Col span={2}>填报周期:</Col>
            <Col span={4}>
              <DatePicker
                value={workDate}
                // 只能选周一
                disabledDate={current => this.renderDate(current)}
                onChange={value => value && this.fetchDate(value)}
                allowClear={false}
              />
            </Col>
            <Col span={2} style={{ marginLeft: '30px' }}>
              周期类型：
            </Col>
            <Col span={4}>
              <UdcSelect
                value={workLogPeriodType}
                code="TSK:WORK_LOG_PERIOD_TYPE"
                onChange={value => value && this.handleChangeBuType(value)}
              />
            </Col>
            <Col span={2} style={{ marginLeft: '30px' }}>
              <Button
                className="tw-btn-primary"
                icon="upload"
                size="large"
                disabled={disabledBtn}
                onClick={e => {
                  this.toggleVisible();
                }}
              >
                汇报
              </Button>
            </Col>
          </Row>
        </Card>

        <Card className="tw-card-adjust" bordered={false}>
          <EditableDataTable {...tableProps} />
        </Card>
        <ReportModal visible={visible} closeModal={this.closeModal} />
      </PageHeaderWrapper>
    );
  }
}

export default WorkLog;
