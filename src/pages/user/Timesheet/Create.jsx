// 工时填报
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Card, Row, Col, DatePicker, Icon, InputNumber, Button } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import update from 'immutability-helper';
import { formatMessage } from 'umi/locale';
import EditableDataTable from '@/components/common/EditableDataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { injectUdc, mountToTab } from '@/layouts/routerControl';
import { genFakeId, checkIfNumber, add } from '@/utils/mathUtils';
import { ProjectModal } from '@/pages/gen/modal';
import { eqBy, uniqWith } from 'ramda';
import { fromQs } from '@/utils/stringUtils';
import extrworkIcon from '@/assets/img/extrwork.svg';

const strEq = eqBy(Object);

const DOMAIN = 'userTimesheetDetail';

@connect(({ loading, dispatch, userTimesheetDetail }) => ({
  loading,
  dispatch,
  userTimesheetDetail,
}))
@injectUdc(
  {
    taskUdc: 'TSK:TIMESHEET_TASK', // 任务包
    vacationUdc: 'TSK:TIMESHEET_VACATION', // 休假的活动
    notaskUdc: 'TSK:TIMESHEET_NOTASK', // 无任务的活动
  },
  DOMAIN
)
@mountToTab()
class TimesheetDetail extends PureComponent {
  state = {
    visible: false,
    rowIndex: null,
    _selectedRowKeys: [],
  };

  componentDidMount() {
    const { weekStartDate } = fromQs();
    weekStartDate
      ? this.fetchDate(weekStartDate)
      : this.fetchDate(
          moment()
            .startOf('week')
            .format('YYYY-MM-DD')
        );
  }

  fetchDate = value => {
    const { dispatch } = this.props;

    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        weekStartDate: value,
      },
    });
  };

  disabledDate = current => {
    const {
      userTimesheetDetail: { weekStartDate },
    } = this.props;
    return !(
      moment(weekStartDate).isSame(current) ||
      moment(current).isBetween(
        moment(weekStartDate).startOf('week'),
        moment(weekStartDate).endOf('week')
      )
    );
  };

  handleInitWeeks = () => {
    const {
      dispatch,
      userTimesheetDetail: { dataSource },
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

  importWorkLog = () => {
    const {
      dispatch,
      userTimesheetDetail: { weekStartDate, dataSource },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/importWorkLog`,
      payload: {
        dataSource,
        weekStartDate,
      },
    });
    this.setState({ _selectedRowKeys: [] });
  };

  // 选择任务和活动下拉组件赋值
  onSelectChanged = (rowIndex, rowField) => value => {
    const {
      dispatch,
      userTimesheetDetail: { dataSource },
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
      userTimesheetDetail: { dataSource },
    } = this.props;

    let newValue =
      rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    newValue =
      rowField === 'workDate' && newValue ? moment(newValue).format('YYYY-MM-DD') : newValue;

    if (rowField === 'workDate' && row.projId && newValue) {
      dispatch({
        type: `${DOMAIN}/flag`,
        payload: { workDate: newValue, projId: row.projId, rowIndex },
      });
    }

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: newValue,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  saveTimesheet = submitted => {
    const {
      dispatch,
      userTimesheetDetail: { dataSource, weekStartDate },
    } = this.props;
    const { _selectedRowKeys } = this.state;
    const newDataSource = submitted
      ? dataSource.filter(item => _selectedRowKeys.includes(item.id))
      : dataSource;

    if (submitted && !newDataSource.length) {
      createMessage({
        type: 'warn',
        description: `请勾选需要提交的工时。`,
      });
      return;
    }
    // 校验明细项 && 提交时校验
    const workDateError = newDataSource.filter(v => !v.workDate);
    const projError = newDataSource.filter(v => !('' + v.projId));
    const actError = newDataSource.filter(v => !v.actId && !v.tsActIden);
    const taskError = newDataSource.filter(v => !v.taskId && !v.tsTaskIden);
    const workHourError = newDataSource.filter(v => !+v.workHour);
    const workDescError = newDataSource.filter(v => !v.workDesc);
    if (workDateError.length) {
      createMessage({
        type: 'warn',
        description: `请填写工作日期。`,
      });
      return;
    }
    if (submitted && projError.length) {
      createMessage({
        type: 'warn',
        description: `请填写[${projError
          .map(i => moment(i.workDate).format('YYYY-MM-DD'))
          .join('],[')}]]的项目`,
      });
      return;
    }
    if (submitted && actError.length) {
      createMessage({
        type: 'warn',
        description: `请填写[${actError
          .map(i => moment(i.workDate).format('YYYY-MM-DD'))
          .join('],[')}]的活动`,
      });
      return;
    }
    if (submitted && taskError.length) {
      createMessage({
        type: 'warn',
        description: `请填写[${taskError
          .map(i => moment(i.workDate).format('YYYY-MM-DD'))
          .join('],[')}]的任务`,
      });
      return;
    }
    if (submitted && workHourError.length) {
      createMessage({
        type: 'warn',
        description: `请填写[${workHourError
          .map(i => moment(i.workDate).format('YYYY-MM-DD'))
          .join('],[')}]的工时`,
      });
      return;
    }
    if (submitted && workDescError.length) {
      createMessage({
        type: 'warn',
        description: `请填写[${workDescError
          .map(i => moment(i.workDate).format('YYYY-MM-DD'))
          .join('],[')}]的工作说明`,
      });
      return;
    }
    const workHourSum = newDataSource
      .map(item => item.workHour)
      .reduce((prev, curr) => add(prev || 0, curr || 0), 0);
    if (submitted && workHourSum < 56) {
      createConfirm({
        content: `勾选工时不满56小时,确认提交吗?`,
        onOk: () => {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: { submitted, dataSource: newDataSource, weekStartDate },
          });
          this.setState({ _selectedRowKeys: [] });
        },
      });
      return;
    }
    dispatch({
      type: `${DOMAIN}/save`,
      payload: { submitted, dataSource: newDataSource, weekStartDate },
    });
    this.setState({ _selectedRowKeys: [] });
  };

  // 选中项目
  handleModelOk = (e, checkedKeys, checkRows) => {
    const { rowIndex } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/checkedProject`,
      payload: { rowIndex, checkedKeys, checkRows },
    }).then(res => {
      // eslint-disable-next-line no-shadow
      const { workDate, projId, rowIndex } = res;
      if (workDate && projId) {
        dispatch({
          type: `${DOMAIN}/flag`,
          payload: { workDate, projId, rowIndex },
        });
      }
    });
    this.toggleVisible();
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  render() {
    const { dispatch, loading, userTimesheetDetail } = this.props;
    const { dataSource, total, weekStartDate, projList, projTotal, userList } = userTimesheetDetail;
    const { visible, _selectedRowKeys, _udcMap = {} } = this.state;
    const { taskUdc, vacationUdc, notaskUdc } = _udcMap;
    const disabledBtn =
      !!loading.effects[`${DOMAIN}/save`] ||
      !!loading.effects[`${DOMAIN}/query`] ||
      !!loading.effects[`${DOMAIN}/revokedTimesheets`] ||
      !!loading.effects[`${DOMAIN}/initWeek`] ||
      !!loading.effects[`${DOMAIN}/delete`] ||
      !!loading.effects[`${DOMAIN}/copyLastWeek`];

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'ASC',
      loading: disabledBtn,
      total,
      dataSource,
      // scroll: { x: 1190 },
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
                  tsStatusDesc: '填写',
                  weekStartDate,
                  tsActIden: null,
                  tsTaskIden: null,
                  timesheetViews: [],
                  workHour: 8,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const ids = selectedRowKeys.filter(v => v > 0);
        const newDataSource = dataSource.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        this.setState({
          _selectedRowKeys: [],
        });
        if (ids && ids.length) {
          // TODO: 当工时数超过100时，此处没有把剩下的工时拉取出来
          dispatch({
            type: `${DOMAIN}/delete`,
            payload: { ids, weekStartDate, newDataSource },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: { dataSource: newDataSource },
          });
          createMessage({ type: 'success', description: '操作成功' });
        }
      },
      onCopyItem: copied => {
        const newDataSource = copied.map(item => ({
          ...item,
          id: genFakeId(-1),
          tsStatus: 'CREATE',
          tsStatusDesc: '填写',
        }));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { dataSource: update(dataSource, { $push: newDataSource }) },
        });
      },
      columns: [
        {
          title: '工作日期',
          dataIndex: 'workDate',
          required: true,
          width: 160,
          render: (value, row, index) => (
            <div style={{ display: 'flex' }}>
              <DatePicker
                defaultPickerValue={weekStartDate ? moment(weekStartDate) : null}
                disabled={row.tsStatus !== 'CREATE' && row.tsStatus !== 'REJECTED'}
                value={value ? moment(value) : null}
                onChange={this.onCellChanged(index, 'workDate', row)}
                format="YYYY-MM-DD"
                disabledDate={this.disabledDate}
                className="x-fill-100"
              />
              <img
                style={{
                  width: 28,
                  height: 28,
                  marginLeft: 5,
                  display: row.workFlag === 'YES' ? 'inline-block' : 'none',
                  cursor: 'pointer',
                }}
                src={extrworkIcon}
                title="有加班安排"
                alt="有加班安排"
                onClick={() => {
                  router.push(`/user/center/extrWork`);
                }}
              />
            </div>
          ),
        },
        {
          title: '状态', // 初始化 填写
          dataIndex: 'tsStatusDesc',
          align: 'center',
          width: 90,
        },
        {
          title: '项目',
          dataIndex: 'projId',
          required: true,
          width: 180,
          render: (value, row, index) => (
            <Input
              value={row.projName}
              disabled
              addonAfter={
                <a
                  className="tw-link-primary"
                  onClick={() => {
                    if (row.tsStatus !== 'CREATE' && row.tsStatus !== 'REJECTED') return;
                    this.toggleVisible();
                    this.setState({ rowIndex: index });
                  }}
                >
                  <Icon type="search" />
                </a>
              }
            />
          ),
        },
        {
          title: '任务',
          dataIndex: 'taskId',
          required: true,
          width: 180,
          render: (value, row, index) => {
            // 从行row上取得数据{timesheetViews:[]}拼接成udc的数值
            // 原因：该udc需根据项目id获得任务和活动的相关信息
            // udc另有无任务和休假选项
            const timesheetTask =
              row.timesheetViews && row.timesheetViews.length
                ? row.timesheetViews.map(item => ({ code: item.id, name: item.taskName }))
                : [];
            const newUdc = uniqWith(strEq)(timesheetTask.concat(taskUdc)).filter(Boolean);
            return (
              <AsyncSelect
                disabled={row.tsStatus !== 'CREATE' && row.tsStatus !== 'REJECTED'}
                value={value ? '' + value : row.tsTaskIden}
                source={newUdc && newUdc.length ? newUdc : []}
                placeholder="请选择任务"
                onChange={this.onSelectChanged(index, 'taskId')}
                dropdownMatchSelectWidth={false}
                maxTagTextLength={20}
              />
            );
          },
        },
        {
          title: '活动',
          dataIndex: 'actId',
          required: true,
          width: 200,
          render: (value, row, index) => {
            // 根据任务判断活动下拉的值
            let newUdc = [];
            if (row.taskId) {
              // 若有taskId，则取出该列对应任务包的活动的值做UDC
              const timesheetViews = row.timesheetViews
                ? row.timesheetViews.filter(item => item.id === +row.taskId)
                : [];
              const { resActivities = [] } = timesheetViews[0] || {};
              const timesheetTask = resActivities.map(v => ({ code: v.id, name: v.actName }));
              newUdc = timesheetTask;
            } else if (row.tsTaskIden === 'VACATION') {
              // 若没有taskId，则分别取UDC
              newUdc = vacationUdc;
            } else if (row.tsTaskIden === 'NOTASK') {
              newUdc = notaskUdc;
            }
            return (
              <AsyncSelect
                disabled={row.tsStatus !== 'CREATE' && row.tsStatus !== 'REJECTED'}
                value={value ? '' + value : row.tsActIden}
                source={newUdc && newUdc.length ? newUdc.filter(Boolean) : []}
                placeholder="请选择活动"
                onChange={this.onSelectChanged(index, 'actId')}
                dropdownMatchSelectWidth={false}
                maxTagTextLength={20}
              />
            );
          },
        },
        {
          title: '工时(8小时)',
          dataIndex: 'workHour',
          required: true,
          width: 120,
          render: (value, row, index) => (
            <InputNumber
              className="x-fill-100"
              defaultValue={value}
              min={0}
              max={8}
              precision={1} // 小数点一位
              disabled={row.tsStatus !== 'CREATE' && row.tsStatus !== 'REJECTED'}
              onBlur={this.onCellChanged(index, 'workHour')}
            />
          ),
        },
        {
          title: '工作说明',
          dataIndex: 'workDesc',
          required: true,
          // width: 200,
          render: (value, row, index) => (
            <Input.TextArea
              disabled={row.tsStatus !== 'CREATE' && row.tsStatus !== 'REJECTED'}
              defaultValue={value}
              onBlur={this.onCellChanged(index, 'workDesc')}
              rows={1}
              maxLength={200}
            />
          ),
        },
      ],
      buttons: [
        {
          key: 'copylast',
          title: '复制上周',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            if (
              dataSource.filter(item => item.tsStatus !== 'CREATE' && item.tsStatus !== 'REJECTED')
                .length
            ) {
              createConfirm({ content: '本周存在在流程中或已结算的工时，不可以复制上周！' });
              return;
            }
            createConfirm({
              content: '复制后将清空本周已填工时，确认复制吗?',
              onOk: () => {
                dispatch({
                  type: `${DOMAIN}/copyLastWeek`,
                  payload: {
                    weekStartDate,
                    ids: dataSource.map(i => i.id).filter(item => item > 0),
                  },
                });
                this.setState({ _selectedRowKeys: [] });
              },
            });
          },
        },
        {
          key: 'initweek',
          title: '初始化',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            // 'CREATE', 'APPROVING', 'APPROVED', 'SETTLED'
            if (
              dataSource.filter(item => item.tsStatus !== 'CREATE' && item.tsStatus !== 'REJECTED')
                .length
            ) {
              createConfirm({ content: '本周存在在流程中或已结算的工时，不可以初始化！' });
              return;
            }
            createConfirm({
              content: '初始化后将清空本周已填工时，确认初始化吗?',
              onOk: () => this.handleInitWeeks(),
            });
          },
        },
        {
          key: 'importWorkLog',
          title: '导入日志',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            createConfirm({
              content: '确定导入日志吗?',
              onOk: () => this.importWorkLog(),
            });
          },
        },
        {
          key: 'cancel',
          title: '撤回',
          className: 'tw-btn-error',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows) => {
            if (selectedRows.filter(item => item.tsStatus !== 'APPROVING').length) {
              createConfirm({ content: '只有审批中的工时可以撤回！' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/revokedTimesheets`,
              payload: { ids: selectedRowKeys.join(','), weekStartDate },
            });
          },
        },
      ],
    };
    return (
      <PageHeaderWrapper title="工时填报">
        <Card
          className="tw-card-adjust"
          title={
            <Title icon="profile" id="app.settings.menuMap.timesheet" defaultMessage="我的工时" />
          }
          bordered={false}
        >
          <Row type="flex" justify="start" align="middle">
            <Col span={3}>开始日期(周一):</Col>
            <Col span={4}>
              <DatePicker
                value={weekStartDate ? moment(weekStartDate) : null}
                // 只能选周一
                disabledDate={current =>
                  moment(current).format('YYYY-MM-DD') !==
                  moment(current)
                    .startOf('week')
                    .format('YYYY-MM-DD')
                }
                onChange={value => value && this.fetchDate(value)}
                allowClear={false}
              />
            </Col>
          </Row>
        </Card>

        <Card className="tw-card-adjust" bordered={false}>
          <Card className="tw-card-rightLine" bordered={false}>
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={() => {
                this.saveTimesheet(false);
              }}
            >
              {formatMessage({ id: `misc.save`, desc: '保存' })}
            </Button>
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={() => {
                this.saveTimesheet(true);
              }}
            >
              {formatMessage({ id: `misc.submit`, desc: '提交' })}
            </Button>
          </Card>
          <EditableDataTable {...tableProps} />
          <ProjectModal
            title="选择项目"
            domain={DOMAIN}
            visible={visible}
            dispatch={dispatch}
            dataSource={projList}
            loading={loading.effects[`${DOMAIN}/queryProjList`]}
            total={projTotal}
            userList={userList}
            onOk={this.handleModelOk}
            onCancel={this.toggleVisible}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TimesheetDetail;
