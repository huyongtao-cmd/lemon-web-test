import React from 'react';
import { connect } from 'dva';
import { Button, Card, DatePicker, Form, Input, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import update from 'immutability-helper';
import moment from 'moment';
import { isNil, isEmpty } from 'ramda';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { UdcSelect, UdcCheck } from '@/pages/gen/field';
import { closeThenGoto, markAsTab, mountToTab, injectUdc } from '@/layouts/routerControl';
// import { selectBusWithOus } from '@/services/gen/list';
import { selectUsers } from '@/services/sys/user';
import EditableDataTable from '@/components/common/EditableDataTable';
import SelectWithCols from '@/components/common/SelectWithCols';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { genFakeId, checkIfNumber } from '@/utils/mathUtils';
import router from 'umi/router';
import createMessage from '@/components/core/AlertMessage';
// import { queryCapasetLeveldList } from '@/services/user/task/task';

const DOMAIN = 'userTravelEdit';
const { Field } = FieldList;

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 5 },
  { dataIndex: 'name', title: '名称', span: 15 },
];

/**
 * 出差申请新增/编辑
 */
@connect(({ loading, userTravelEdit, user }) => ({
  loading,
  user: user.user,
  ...userTravelEdit,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      const newFieldData = { [name]: value };

      switch (name) {
        default:
          break;
        case 'applyDate': // 区间
          Object.assign(newFieldData, {
            applyDate: value ? formatDT(value) : null,
          });
          break;
        case 'period': // 区间
          Object.assign(newFieldData, {
            beginDate: value[0] ? formatDT(value[0]) : null,
            endDate: value[1] ? formatDT(value[1]) : null,
            days: value && value[0] && value[1] && value[1].diff(value[0], 'days') + 1,
          });
          break;
        // 任务包 - 项目 - BU
        case 'taskId': {
          const { projSource } = props;
          let extraControl = {};
          if (value && value.reasonType === '01') {
            const { buId, buName } = projSource.find(x => x.id === value.reasonId) || {};
            extraControl = { expenseBuId: buId, buName };
          } else if (value && value.reasonType !== '01') {
            extraControl = {
              expenseBuId: value ? value.buId : null,
              buName: value ? value.buName : null,
            };
          }
          Object.assign(
            newFieldData,
            {
              expenseBuIdFlag: value && value.code !== 'TK000',
              isProj: !!value, // 造字段-是否项目，作用是控制相关项目是够禁用 true禁用
              taskId: value ? value.id + '' : null,
              taskName: value ? value.name : null,
              taskCode: value ? value.code : null,
              ouId: value ? value.ouId : null,
              ouName: value ? value.ouName : null,
              projId: value && value.reasonType === '01' ? value.reasonId : null,
              projName: value && value.reasonType === '01' ? value.reasonName : null,
            },
            extraControl
          );
          break;
        }
        // 项目 - BU
        case 'projId':
          Object.assign(newFieldData, {
            chooseProj: !!value,
            projId: value ? value.id : null,
            projName: value ? value.name : null,
            expenseBuId: value ? value.buId : null,
            buName: value ? value.buName : null,
            custName: value ? value.custName : null,
            ouId: value ? value.ouId : null,
            ouName: value ? value.ouName : null,
          });
          break;
        // 承担费用BU
        case 'expenseBuId':
          Object.assign(newFieldData, {
            expenseBuId: value ? value.id : null,
            // expenseBuCode: value ? value.code : null,
            buName: value ? value.name : '',
            ouId: value ? value.ouId : null,
            ouName: value ? value.ouName : null,
          });
          break;
        // 是否行政订票
        case 'bookTicketFlag':
          Object.assign(newFieldData, {
            [name]: value === 'YES' ? 1 : 0,
          });
          break;
      }
      // 更新表单
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: newFieldData,
      });
    }
  },
})
@injectUdc(
  {
    vehicleList: 'ACC.TICKET_VEHICLE',
    placeList: 'COM:CITY',
  },
  DOMAIN
)
@mountToTab()
class TaskEdit extends React.PureComponent {
  state = {
    submitFlag: false, // 判断明细表是否有增删操作
  };

  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const { dispatch, user } = this.props;
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/clean`,
    });

    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });

      dispatch({
        type: `${DOMAIN}/queryTravelDels`,
        payload: { id: param.id },
      });
    }

    // 资源列表
    dispatch({
      type: `${DOMAIN}/queryTaskList`,
    });
    // 项目列表
    dispatch({
      type: `${DOMAIN}/queryProjList`,
    });
    // BU列表
    dispatch({
      type: `${DOMAIN}/queryBuList`,
    });
  }

  // 更新applyResId
  static getDerivedStateFromProps(nextProps, prevState) {
    const { user, dispatch, formData } = nextProps;
    if (user.extInfo && user.extInfo.resId && !formData.applyResId) {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          formData: {
            ...formData,
            applyResId: user.extInfo.resId,
            applyResName: user.extInfo.resName,
          },
        },
      });
      return user.extInfo.resId;
    }
    return null;
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dispatch, dataList } = this.props;
    let updateObject = {
      [rowField]: {
        $set: rowFieldValue,
      },
    };

    if (rowField === 'beginDate') {
      const beginDateValue = rowFieldValue ? rowFieldValue.format('YYYY-MM-DD') : undefined;
      const { endDate } = dataList[rowIndex];
      const endDateValue = moment(beginDateValue).isAfter(moment(endDate))
        ? beginDateValue
        : endDate;
      updateObject = {
        beginDate: {
          $set: beginDateValue,
        },
        endDate: {
          $set: endDateValue,
        },
      };
    } else if (rowField === 'endDate') {
      const endDateValue = rowFieldValue ? rowFieldValue.format('YYYY-MM-DD') : undefined;
      const { beginDate } = dataList[rowIndex];
      const beginDateValue = moment(endDateValue).isBefore(moment(beginDate))
        ? endDateValue
        : beginDate;
      updateObject = {
        beginDate: {
          $set: beginDateValue,
        },
        endDate: {
          $set: endDateValue,
        },
      };
    } else if (
      rowField === 'remark' ||
      rowField === 'endTimespan' ||
      rowField === 'beginTimespan'
    ) {
      const { value } = rowFieldValue.target;
      updateObject = {
        [rowField]: {
          $set: value,
        },
      };
    }

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList: update(dataList, {
          [rowIndex]: updateObject,
        }),
      },
    });
  };

  // 返回true则校验停住
  checkDataList = dataList => {
    if (dataList && !dataList.length) {
      createMessage({ type: 'warn', description: '请填写至少一条出差人明细信息' });
      return true;
    }

    // 校验明细项
    const tripResIdError = !!dataList.filter(v => !v.tripResId).length; // 出差人
    const fromPlaceError = !!dataList.filter(v => !v.fromPlace).length; // 出发地
    const toPlaceError = !!dataList.filter(v => !v.toPlace).length; // 目的地
    const vehicleError = !!dataList.filter(v => !v.vehicle).length; // 交通工具
    const beginDateError = !!dataList.filter(v => !v.beginDate).length; // 出发日期
    const beginTimespanError = !!dataList.filter(v => !v.beginTimespan).length; // 出发时间段
    const endDateError = !!dataList.filter(v => !v.endDate).length; // 结束日期
    const endTimespanError = !!dataList.filter(v => !v.endTimespan).length; // 结束时间段
    if (
      tripResIdError ||
      fromPlaceError ||
      toPlaceError ||
      vehicleError ||
      beginDateError ||
      beginTimespanError
      // endDateError ||
      // endTimespanError
    ) {
      let tipsMsg = '';
      switch (true) {
        case tripResIdError:
          tipsMsg = '请填写出差人明细信息的 [出差人]';
          break;
        case fromPlaceError:
          tipsMsg = '请填写出差人明细信息的 [出发地]';
          break;
        case toPlaceError:
          tipsMsg = '请填写出差人明细信息的 [目的地]';
          break;
        case vehicleError:
          tipsMsg = '请填写出差人明细信息的 [交通工具]';
          break;
        case beginDateError:
          tipsMsg = '请填写出差人明细信息的 [出发日期]';
          break;
        case beginTimespanError:
          tipsMsg = '请填写出差人明细信息的 [出发时间段]';
          break;
        // case endDateError:
        //   tipsMsg = '请填写出差人明细信息的 [结束日期]';
        //   break;
        // case endTimespanError:
        //   tipsMsg = '请填写出差人明细信息的 [结束时间段]';
        //   break;
        default:
          tipsMsg = '请联系管理员';
          break;
      }
      createMessage({ type: 'warn', description: tipsMsg });
      return true;
    }
    return false;
  };

  // 任务包或者相关项目至少填写一项
  checkProjOrTask = formData => {
    if (!isNil(formData.taskId) || !isNil(formData.projId)) {
      return false;
    }
    createMessage({ type: 'warn', description: '任务包或者相关项目至少填写一项' });
    return true;
  };

  // 保存
  // handleSave = () => {
  //   const {
  //     form: { validateFieldsAndScroll },
  //     dispatch,
  //     formData,
  //     dataList,
  //   } = this.props;
  //   const { sourceUrl } = fromQs();

  //   validateFieldsAndScroll((error, values) => {
  //     if (!error) {
  //       if (this.checkProjOrTask(formData)) {
  //         return;
  //       }
  //       if (this.checkDataList(dataList)) {
  //         return;
  //       }
  //       dispatch({
  //         type: `${DOMAIN}/save`,
  //       }).then(({ status, success }) => {
  //         if (status === 100) return;
  //         success &&
  //           (sourceUrl ? closeThenGoto(sourceUrl) : closeThenGoto(`/user/center/myTravel`));
  //       });
  //     }
  //   });
  // };

  handleSubmit = submitType => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      formData,
      dataList,
    } = this.props;
    const { apprId, remark, sourceUrl } = fromQs();

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (this.checkProjOrTask(formData)) {
          return;
        }
        if (this.checkDataList(dataList)) {
          return;
        }
        if (
          !formData.apprStatus ||
          formData.apprStatus === 'NOTSUBMIT' ||
          formData.apprStatus === 'APPROVED'
        ) {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: {
              submitType,
            },
          })
            .then(({ success, status, id }) => {
              if (status === 100) {
                // 主动取消请求
                return false;
              }
              success && createMessage({ type: 'success', description: '流程提交成功' });
              return success;
            })
            .then(
              success =>
                success &&
                (sourceUrl ? closeThenGoto(sourceUrl) : closeThenGoto(`/user/center/myTravel`))
            );
        }
        if (formData.apprStatus === 'REJECTED' || formData.apprStatus === 'WITHDRAW') {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: {
              submitType,
            },
          })
            .then(({ success, status }) => {
              if (status === 100) {
                // 主动取消请求
                return false;
              }
              return (
                success &&
                dispatch({
                  type: `${DOMAIN}/reSubmit`,
                  payload: {
                    taskId: apprId,
                    remark,
                  },
                })
              );
            })
            .then(
              success =>
                success &&
                (sourceUrl ? closeThenGoto(sourceUrl) : closeThenGoto(`/user/center/myTravel`))
            );
        }
        if (formData.apprStatus === 'APPROVING') {
          createMessage({
            type: 'info',
            description: '错误的审批状态' + formData.apprStatus + '。请先联系管理员解决',
          });
        }
      }
    });
  };

  setApplyResName = (value, option) => {
    const { formData, dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/queryTaskList`,
      payload: { resId: value },
    });
    dispatch({
      type: `${DOMAIN}/queryProjList`,
      payload: { resId: value },
    });
    form.setFieldsValue({
      expenseBuId: null,
      taskId: null,
      projId: null,
      applyResId: value,
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {
          ...formData,
          taskId: null,
          taskName: null, // taskName任务选项值的判断条件，所以必须一起赋值
          projId: null,
          applyResId: value,
          expenseBuId: null,
          buName: null,
          applyResName: option ? option.props.title : null,
        },
      },
    });
  };

  getTableProps = () => {
    const {
      loading,
      dispatch,
      formData,
      dataList,
      // 权限
      user,
    } = this.props;
    // console.warn(this.props);
    const { _udcMap = {} } = this.state;
    const { vehicleList = [], placeList = [] } = _udcMap;

    return {
      rowKey: 'id',
      scroll: { x: 1240 },
      loading: loading.effects[`${DOMAIN}/queryTravelDels`],
      pagination: false,
      dataSource: dataList,
      total: dataList.length || 0,
      showCopy: false,
      onAdd: newRow => {
        const genId = genFakeId(-1);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: update(dataList, {
              $push: [
                {
                  ...newRow,
                  id: genId,
                  tripResId: formData.applyResId,
                  beginDate: moment(),
                  endDate: moment(),
                  deleteable: true,
                },
              ],
            }),
          },
        });

        this.setState({
          submitFlag: true,
        });

        return genId;
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        // 当且仅当出差申请明细表发生增删操作时

        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: dataList.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            ),
          },
        });
        const flag = dataList
          .filter(row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length)
          .some(item => item.id < 0);

        const rowkeyFlag = selectedRowKeys.some(item => item > 0);

        if ((!isEmpty(selectedRowKeys) && flag) || rowkeyFlag) {
          this.setState({
            submitFlag: true,
          });
        } else {
          this.setState({
            submitFlag: false,
          });
        }
      },
      rowSelection: {
        getCheckboxProps: record => ({
          disabled: !record.deleteable,
        }),
      },
      columns: [
        {
          width: 100,
          title: '出差人',
          dataIndex: 'tripResId',
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请选择出差人',
              },
            ],
          },
          render: (value, row, index) => (
            <AsyncSelect
              value={value ? value + '' : null}
              source={() => selectUsers().then(resp => resp.response)}
              placeholder="出差人"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              // disabled={!row.deleteable}
              onChange={this.onCellChanged(index, 'tripResId')}
            />
          ),
        },
        {
          title: '出发地',
          dataIndex: 'fromPlace',
          key: 'fromPlace',
          className: 'text-center',
          width: 120,
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请选择出发地',
              },
            ],
          },
          render: (value, row, index) => (
            <AsyncSelect
              value={value}
              source={placeList}
              placeholder="请选择出发地"
              showSearch
              filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              onChange={this.onCellChanged(index, 'fromPlace')}
            />
          ),
        },
        {
          title: '目的地',
          dataIndex: 'toPlace',
          key: 'toPlace',
          className: 'text-center',
          width: 120,
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请选择目的地',
              },
            ],
          },
          render: (value, row, index) => (
            <AsyncSelect
              value={value}
              source={placeList}
              placeholder="请选择目的地"
              showSearch
              filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              onChange={this.onCellChanged(index, 'toPlace')}
            />
          ),
        },
        {
          title: '交通工具',
          dataIndex: 'vehicle',
          key: 'vehicle',
          className: 'text-center',
          width: 100,
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请输入交通工具',
              },
            ],
          },
          render: (value, row, index) => (
            <AsyncSelect
              value={value}
              source={vehicleList}
              placeholder="请选择交通工具"
              onChange={this.onCellChanged(index, 'vehicle')}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          key: 'remark',
          className: 'text-center',
          width: 200,
          render: (value, row, index) => (
            <Input.TextArea
              value={value}
              placeholder="备注"
              rows={1}
              onChange={this.onCellChanged(index, 'remark')}
            />
          ),
        },
        {
          title: '出发日期',
          dataIndex: 'beginDate',
          key: 'beginDate',
          className: 'text-center',
          width: 180,
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请输入出发日期',
              },
            ],
          },
          render: (value, row, index) => (
            <DatePicker
              placeholder="请输入出发日期"
              format="YYYY-MM-DD"
              value={value ? moment(value) : null}
              onChange={this.onCellChanged(index, 'beginDate')}
            />
          ),
        },
        {
          title: '出发时间段',
          dataIndex: 'beginTimespan',
          key: 'beginTimespan',
          className: 'text-center',
          width: 120,
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '出发时间段',
              },
            ],
          },
          render: (value, row, index) => (
            <Input
              value={value}
              placeholder="输入时间段"
              onChange={this.onCellChanged(index, 'beginTimespan')}
            />
          ),
        },
        // {
        //   title: '结束日期',
        //   dataIndex: 'endDate',
        //   key: 'endDate',
        //   className: 'text-center',
        //   width: 180,
        //   required: true,
        //   options: {
        //     rules: [
        //       {
        //         required: true,
        //         message: '请输入结束日期',
        //       },
        //     ],
        //   },
        //   render: (value, row, index) => (
        //     <DatePicker
        //       placeholder="请输入结束日期"
        //       format="YYYY-MM-DD"
        //       value={value ? moment(value) : null}
        //       onChange={this.onCellChanged(index, 'endDate')}
        //     />
        //   ),
        // },
        // {
        //   title: '结束时间段',
        //   dataIndex: 'endTimespan',
        //   key: 'endTimespan',
        //   className: 'text-center',
        //   required: true,
        //   width: 120,
        //   options: {
        //     rules: [
        //       {
        //         required: true,
        //         message: '结束时间段',
        //       },
        //     ],
        //   },
        //   render: (value, row, index) => (
        //     <Input
        //       defaultValue={value}
        //       placeholder="输入时间段"
        //       onChange={this.onCellChanged(index, 'endTimespan')}
        //     />
        //   ),
        // },
      ],
      buttons: [],
    };
  };

  // 跳转到行政订票
  jumpToBooking = () => {
    const {
      form: { validateFieldsAndScroll },
      formData,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        router.push(
          markAsTab(
            `/user/center/travel/ticket?resId=${formData.applyResId}&applyId=${formData.id}`
          )
        );
      }
    });
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      formData,
      // 查询
      taskSource,
      taskList, // 任务
      projSource,
      projList, // 项目
      buSource,
      buList, // BU
      feeCodeList, // 费用码
    } = this.props;

    const { submitFlag } = this.state;

    // 从我的待办跳入时，会带入该参数; 我的申请跳入时，会带入sourceUrl
    const { apprId, sourceUrl, canEdit } = fromQs();

    const { _udcMap = {} } = this.state;
    const { vehicleList = [] } = _udcMap;
    const disabledBtn =
      !!loading.effects[`${DOMAIN}/query`] ||
      !!loading.effects[`${DOMAIN}/queryTravelDels`] ||
      !!loading.effects[`${DOMAIN}/save`] ||
      !!loading.effects[`${DOMAIN}/reSubmit`];

    const disableStatus = canEdit === 'part';

    // console.warn(this.props);

    return (
      <PageHeaderWrapper title="任务包信息">
        <Card className="tw-card-rightLine">
          {// 空或者三种状态
          ['NOTSUBMIT', ''].some(stat => stat === formData.apprStatus || !formData.apprStatus) ||
          apprId ||
          (formData.applyStatus === 'APPROVED' && submitFlag) ? (
            <Button
              className="tw-btn-primary"
              icon="upload"
              size="large"
              disabled={disabledBtn}
              onClick={() => this.handleSubmit('submit')}
            >
              提交
            </Button>
          ) : null}

          {// 空或者三种状态

          formData.applyStatus === 'APPROVED' &&
            !submitFlag && (
              <Button
                className="tw-btn-primary"
                icon="upload"
                size="large"
                disabled={disabledBtn}
                onClick={() => this.handleSubmit('save')}
              >
                保存
              </Button>
            )}

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={disabledBtn}
            onClick={() =>
              sourceUrl ? closeThenGoto(sourceUrl) : closeThenGoto(`/user/center/myTravel`)
            }
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card className="tw-card-adjust" bordered={false} title="出差申请">
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="applyNo"
              label="出差单号"
              decorator={{
                initialValue: formData.applyNo,
              }}
            >
              <Input disabled placeholder="[系统生成]" />
            </Field>
            <Field
              name="applyName"
              label="出差名称"
              decorator={{
                initialValue: formData.applyName,
              }}
            >
              <Input disabled placeholder="[系统生成]" />
            </Field>
            <Field
              name="applyResId"
              label="出差申请人"
              decorator={{
                initialValue: formData.applyResId,
                // formData.id ? id : formData
                rules: [
                  {
                    required: true,
                    message: '请选择出差申请人',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={() => selectUsers().then(resp => resp.response)}
                placeholder="请选择出差申请人"
                showSearch
                onChange={this.setApplyResName}
                disabled={disableStatus}
              />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate ? moment(formData.applyDate) : moment(Date.now()),
                rules: [
                  {
                    required: true,
                    message: '请选择申请日期',
                  },
                ],
              }}
            >
              <DatePicker
                placeholder="请输入申请日期"
                format="YYYY-MM-DD"
                className="x-fill-100"
                disabled={disableStatus}
              />
            </Field>

            <Field
              name="projId"
              label="相关项目"
              decorator={{
                // trigger: 'onBlur',
                initialValue: formData.projId
                  ? // warn: 后端其实没有存code，并不需要, 但是这里必须要一个值，所以只要name匹配就可以了。
                    { code: '' + formData.projId, name: formData.projName }
                  : void 0,
              }}
            >
              <SelectWithCols
                labelKey="name"
                className="x-fill-100"
                columns={SEL_COL}
                dataSource={projSource}
                onChange={value => {
                  const extraControl = {
                    expenseBuId: value ? value.buId : null,
                    buName: value ? value.buName : null,
                  };
                  extraControl.expenseBuId
                    ? setFieldsValue({
                        expenseBuId: {
                          code: extraControl.expenseBuId,
                          name: extraControl.buName,
                        },
                        feeCode: undefined,
                      })
                    : setFieldsValue({
                        expenseBuId: null,
                        feeCode: undefined,
                      });
                  // get feeCode
                  if (!isNil(value)) {
                    dispatch({
                      type: `${DOMAIN}/queryFeeCode`,
                      payload: {
                        projId: value.id,
                      },
                    });
                  } else {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        feeCodeList: [],
                        formData: {
                          ...formData,
                          feeCode: undefined,
                        },
                      },
                    });
                  }
                }}
                // disabled={!!formData.taskId}
                // disabled={disableStatus}
                selectProps={{
                  showSearch: true,
                  disabled: !!formData.isProj || disableStatus,
                  onSearch: value => {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        projSource: projList.filter(
                          d =>
                            d.code.indexOf(value) > -1 ||
                            d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                        ),
                      },
                    });
                  },
                  allowClear: true,
                }}
              />
            </Field>

            <Field
              name="taskId"
              label="任务包"
              decorator={{
                initialValue: formData.taskName
                  ? // 这里初始值给name是因为taskId为0时判断结果不满足条件
                    { code: formData.taskId + '', name: formData.taskName }
                  : void 0,
              }}
            >
              <SelectWithCols
                labelKey="name"
                className="x-fill-100"
                columns={SEL_COL}
                dataSource={taskSource}
                onChange={value => {
                  let extraControl = {};
                  if (value && value.reasonType === '01') {
                    const { buId, buName } = projSource.find(x => x.id === value.reasonId) || {};
                    extraControl = { expenseBuId: buId, buName };
                  } else if (value && value.reasonType !== '01') {
                    extraControl = {
                      expenseBuId: value ? value.buId : null,
                      buName: value ? value.buName : null,
                    };
                  }
                  extraControl.expenseBuId
                    ? setFieldsValue({
                        expenseBuId: {
                          code: extraControl.expenseBuId,
                          name: extraControl.buName,
                        },
                        feeCode: undefined,
                      })
                    : setFieldsValue({
                        expenseBuId: null,
                        feeCode: undefined,
                      });
                  // get feeCode
                  if (!isNil(value) && value.code !== 'TK000') {
                    dispatch({
                      type: `${DOMAIN}/queryFeeCode`,
                      payload: {
                        taskId: value.id,
                      },
                    });
                  } else {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        feeCodeList: [],
                        formData: {
                          ...formData,
                          feeCode: undefined,
                        },
                      },
                    });
                  }
                }}
                selectProps={{
                  disabled:
                    !!formData.chooseProj ||
                    (isNil(formData.taskId) && !isNil(formData.projId)) ||
                    disableStatus,
                  showSearch: true,
                  onSearch: value => {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        taskSource: taskList.filter(
                          d =>
                            d.code.indexOf(value) > -1 ||
                            d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                        ),
                      },
                    });
                  },
                  allowClear: true,
                }}
              />
            </Field>

            <Field
              name="expenseBuId"
              label="承担费用BU"
              decorator={{
                // trigger: 'onBlur',
                initialValue: formData.expenseBuId
                  ? // warn: 后端其实没有存code，并不需要, 但是这里必须要一个值，所以只要name匹配就可以了。
                    { code: '' + formData.expenseBuId, name: formData.buName }
                  : void 0,
                rules: [
                  {
                    required: true,
                    message: '请选择承担费用BU',
                  },
                ],
              }}
            >
              <SelectWithCols
                labelKey="name"
                className="x-fill-100"
                columns={SEL_COL}
                dataSource={buSource}
                onChange={value => {
                  if (!isNil(value) && `${formData.taskCode}` === 'TK000') {
                    dispatch({
                      type: `${DOMAIN}/queryFeeCode`,
                      payload: {
                        buId: value.id,
                      },
                    });
                  }
                }}
                selectProps={{
                  // disabled: !!formData.chooseProj || !!formData.expenseBuIdFlag || disableStatus,
                  disabled: disableStatus, // vincent要求费用承担bu可以修改
                  showSearch: true,
                  onSearch: value => {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        buSource: buList.filter(
                          d =>
                            d.code.indexOf(value) > -1 ||
                            d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                        ),
                      },
                    });
                  },
                  allowClear: true,
                }}
              />
            </Field>
            <Field
              name="ouName"
              label="费用所属公司"
              decorator={{
                initialValue: formData.ouName,
              }}
              popover={{
                placement: 'topLeft',
                trigger: 'hover',
                content: '根据承担费用BU所属公司司或项目签约公司',
              }}
            >
              <Input placeholder="[承担费用BU带出]" disabled />
            </Field>

            <Field
              name="period"
              label="出发-结束日期"
              decorator={{
                initialValue:
                  formData.beginDate && formData.endDate
                    ? [moment(formData.beginDate), moment(formData.endDate)]
                    : undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择开始-结束日期',
                  },
                  {
                    validator: (rule, value, callback) => {
                      const days =
                        value && value[0] && value[1] && value[1].diff(value[0], 'days') + 1;
                      setFieldsValue({ days });
                      callback();
                    },
                  },
                ],
              }}
            >
              <DatePicker.RangePicker
                placeholder={['开始日期', '结束日期']}
                className="x-fill-100"
              />
            </Field>
            <Field
              name="days"
              label="天数"
              decorator={{
                initialValue: formData.days,
                rules: [
                  {
                    required: true,
                    message: '请输入天数',
                  },
                  {
                    validator: (rule, value, callback) => {
                      // 修改 bug， 不应该取 formData.days
                      // 这里变化的时候，区间肯定已经选择了，直接通过moment取天数即可
                      const days =
                        moment(formData.endDate).diff(moment(formData.beginDate), 'days') + 1;
                      if (!value) callback();
                      else if (!checkIfNumber(value)) callback(['请输入数字类型']);
                      else if (parseInt(value, 10) !== value) callback(['请输入整数']);
                      // else if (value > formData.days) callback(['不能大于出差日期区间']);
                      else if (value > days) callback(['不能大于出差日期区间']);
                      else callback();
                    },
                  },
                ],
              }}
              popover={{
                placement: 'topLeft',
                trigger: 'hover',
                content: '如不输入，则由"开始-结束日期"自动计算得出',
              }}
            >
              <InputNumber
                disabled={!formData.period || disableStatus}
                className="x-fill-100"
                placeholder="请输入天数"
              />
            </Field>
            <Field
              name="expenseByType"
              label="费用承担方"
              decorator={{
                initialValue: formData.expenseByType,
                rules: [
                  {
                    required: true,
                    message: '请选择费用承担方',
                  },
                ],
              }}
            >
              <UdcSelect
                code="ACC.REIM_EXP_BY"
                placeholder="请选择费用承担方"
                disabled={disableStatus}
              />
            </Field>
            <Field
              name="custName"
              label="客户名称"
              decorator={{
                initialValue: formData.custName,
              }}
              popover={{
                placement: 'topLeft',
                trigger: 'hover',
                content: '选择相关项目自动带出。',
              }}
            >
              <Input placeholder="[选择相关项目自动带出]" disabled />
            </Field>
            <Field
              name="bookTicketFlag"
              label="是否行政订票"
              decorator={{
                initialValue: formData.bookTicketFlag ? 'YES' : 'NO',
                rules: [
                  {
                    required: true,
                    message: '请选择是否行政订票',
                  },
                ],
              }}
            >
              <UdcCheck
                multiple={false}
                code="COM.YESNO"
                placeholder="是否行政订票"
                disabled={disableStatus}
              />
            </Field>
            <Field
              name="feeCode"
              label="费用码"
              decorator={{
                initialValue: formData.feeCode,
                rules: [
                  {
                    required: true,
                    message: '请选择费用码',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={feeCodeList.map(({ feeCode, feeCodeDesc }) => ({
                  code: feeCode,
                  name: feeCodeDesc,
                }))}
                disabled={disableStatus}
              />
            </Field>
            <Field
              name="applyStatus"
              label="申请状态"
              decorator={{
                initialValue: formData.applyStatus,
              }}
              popover={{
                placement: 'topLeft',
                trigger: 'hover',
                content: '该状态由系统更新，不可修改。',
              }}
            >
              <UdcSelect disabled code="ACC.BUSITRIP_APPLY_STATUS" placeholder="申请状态" />
            </Field>
            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark,
                rules: [
                  {
                    required: true,
                    message: '请输入备注',
                  },
                  { max: 500, message: '不能超过500字' },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="不能超过500字" rows={3} />
            </Field>
          </FieldList>
        </Card>
        <br />
        <Card className="tw-card-adjust" bordered={false} title="出差人明细信息">
          <EditableDataTable {...this.getTableProps()} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TaskEdit;
