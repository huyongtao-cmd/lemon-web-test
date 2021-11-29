import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Button, Card, Form, Input, Radio, Divider, Table, InputNumber, Popconfirm } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import DataTable from '@/components/production/business/DataTable.tsx';
import { FileManagerEnhance, Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';
import { formatMessage } from 'umi/locale';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import { sub, genFakeId } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';

const { Field } = FieldList;

const VACATION_TYPE = ['ANNUAL', 'IN_LIEU', 'ANNUAL_W'];

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'vacationFlowNew';

@connect(({ loading, vacationFlowNew, dispatch, user: { user } }) => ({
  loading,
  vacationFlowNew,
  dispatch,
  user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class TaskOne extends Component {
  state = {
    expendKeys: [],
  };

  componentDidMount() {
    const {
      dispatch,
      vacationFlowNew: {
        fieldsConfig: { taskKey },
      },
      id,
      taskId,
    } = this.props;
    taskId && this.callModelEffects('fetchConfig', taskId);
    id && this.callModelEffects('queryDetail', id);
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
  }

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  /**
   * 调用model层异步方法
   * 这个方法是仅是封装一个小方法,后续修改调异步方法时不需要每次都解构dispatch
   * @param method 异步方法名称
   * @param params 调用方法参数
   */
  callModelEffects = async (method, params) => {
    const { dispatch } = this.props;
    return dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  // 行编辑触发事件
  onCellChanged = (value, row, keys) => rowFieldValue => {
    if (rowFieldValue > 0.5 && rowFieldValue < 1.0) {
      // eslint-disable-next-line
      rowFieldValue = 1.0;
    }
    if (!rowFieldValue) {
      // eslint-disable-next-line
      rowFieldValue = 0.5;
    }

    const {
      vacationFlowNew: { detailEntityList },
      dispatch,
    } = this.props;
    const fatherKeyId = row.keyId.split('-')[0];

    const newDataSource = detailEntityList;

    newDataSource.forEach(item => {
      if (item.keyId === +fatherKeyId) {
        item.children1.forEach(v => {
          if (v.keyId === row.keyId) {
            // eslint-disable-next-line no-param-reassign
            v.vdays = rowFieldValue;
            // eslint-disable-next-line no-param-reassign
            item.Edays = item.children1.reduce((x, y) => x + Number(y.vdays), 0).toFixed(1);
          }
        });
      }
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { detailEntityList: newDataSource },
    });
    // 更新请假天数
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        vacationDays: newDataSource.reduce((x, y) => x + Number(y.Edays), 0).toFixed(1),
      },
    });
  };

  detailEntityTable = (record, index, indent, expanded) => {
    const columns = [
      {
        title: '日期',
        dataIndex: 'vdate',
        align: 'center',
      },
      {
        title: '请假天数(精确到0.5天)',
        dataIndex: 'vdays',
        align: 'center',
        render: (value, row, indexs) => (
          <InputNumber
            defaultValue={value}
            value={value}
            max={1}
            min={0.5}
            step={0.5}
            precision={1}
            onChange={this.onCellChanged(value, row, 'vdays')}
          />
        ),
      },
    ];
    const {
      vacationFlowNew: {
        formData: { selectedRowKeys },
      },
    } = this.props;
    const rowSelection = {
      onChange: (key, selectedRows) => {
        const { dispatch } = this.props;
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { selectedRowKeys: key },
        });
      },
      selectedRowKeys,
      getCheckboxProps: records => ({
        disabled: records.name === 'Disabled User', // Column configuration not to be checked
        name: records.name,
      }),
    };

    return (
      <Table
        rowKey="vdate"
        style={{ marginLeft: '-8px', marginRight: '-8px' }}
        columns={columns}
        dataSource={record.children1}
        pagination={false}
        rowSelection={rowSelection}
      />
    );
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        vacationId: selectedRowKeys[0],
        maxDays: sub(
          sub(selectedRows[0].totalDays, selectedRows[0].usedDays),
          selectedRows[0].frozenDay
        ).toFixed(1),
        selectedVacationType: selectedRows[0].vacationType,
        vacationDeadLine: selectedRows[0].expirationDate,
      },
    });
  };

  onDeleteItems = () => {
    const {
      dispatch,
      form: { setFields },
      vacationFlowNew: { formData, detailEntityList, delList },
    } = this.props;
    const keys = formData.selectedRowKeys;
    // 将请假明细转为一维数组
    let detailArr = [];
    detailEntityList.forEach(item => {
      detailArr = detailArr.concat(item.children1);
    });

    // 记录删除的id
    const delIdList = detailArr
      .filter(v => keys.includes(v.vdate))
      .map(v => v.id)
      .filter(v => v);
    if (!isEmpty(delIdList)) {
      const tt = delList.concat(delIdList);
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { delList: tt },
      });
    }

    const newdetailArr = detailArr.filter(v => !keys.includes(v.vdate));
    // 将一维数组请假明细转为嵌套表格所需要的格式
    const daysArr = newdetailArr;
    if (!isEmpty(daysArr)) {
      const endDate = daysArr[daysArr.length - 1].vdate;
      const startDate = daysArr[0].vdate;
      const monthsArr = [];
      const monthDiff = sub(moment(endDate).month(), moment(startDate).month());
      for (let i = 0; i <= monthDiff; i += 1) {
        const Emonth = moment(moment(startDate).format('YYYY-MM'))
          .add(i, 'month')
          .format('YYYY-MM');
        const tt = genFakeId();
        const arr1 = daysArr.filter(v => v.vmonth === Emonth);
        arr1.forEach(v => {
          // eslint-disable-next-line no-param-reassign
          v.keyId = `${tt}-${genFakeId()}`;
        });

        monthsArr.push({
          keyId: tt,
          Emonth,
          Edays: daysArr
            .filter(v => v.vmonth === Emonth)
            .reduce((x, y) => x + Number(y.vdays), 0)
            .toFixed(1),
          children1: arr1,
        });
      }
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { detailEntityList: monthsArr },
      });
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          vacationDays: monthsArr.reduce((x, y) => x + Number(y.Edays), 0).toFixed(1),
          date: [newdetailArr[0].vdate, newdetailArr[newdetailArr.length - 1].vdate],
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { detailEntityList: [] },
      });
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          vacationDays: null,
        },
      });
    }
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        selectedRowKeys: null,
        date: [],
      },
    });
    setFields({
      date: {
        value: undefined,
      },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form,
      vacationFlowNew: {
        formData,
        formMode,
        resVacationList,
        detailEntityList,
        currentNode,
        attachments,
      },
      user: {
        extInfo: { resId },
      },
    } = this.props;

    const resVacationTableProps = {
      title: '可用假期',
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/resVacation`],
      showColumn: false,
      // 根据选择的假期类型，筛选剩余假期
      dataSource: formData.vacationType
        ? resVacationList.filter(v => v.vacationType === formData.vacationType)
        : resVacationList,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      // pagination: false,
      // enableSelection: false,
      rowSelection: {
        type: 'radio',
        selectedRowKeys: [formData.vacationId] || [],
        onChange: this.onSelectChange,
        // 根据选择的假期类型，释放可选择的假期
        getCheckboxProps: record => ({
          disabled:
            !VACATION_TYPE.includes(formData.vacationType) ||
            formData.vacationType !== record.vacationType,
        }),
      },
      enableDoubleClick: false,
      columns: [
        {
          title: '年度',
          dataIndex: 'vacationYear',
          align: 'center',
        },
        {
          title: '假期类型',
          dataIndex: 'vacationTypeName',
          align: 'center',
        },
        {
          title: '起始日期',
          dataIndex: 'startDate',
          align: 'center',
        },
        {
          title: '截止日期',
          dataIndex: 'endDate',
          align: 'center',
        },
        {
          title: '有效期',
          dataIndex: 'expirationDate',
          align: 'center',
        },
        {
          title: '总天数',
          dataIndex: 'totalDays',
          align: 'center',
        },
        {
          title: '已用天数',
          dataIndex: 'usedDays',
          width: 100,
          align: 'center',
        },
        {
          title: '可用天数',
          dataIndex: 'canUsedDays',
          align: 'center',
          render: (value, row, index) =>
            sub(sub(row.totalDays, row.usedDays), row.frozenDay).toFixed(1),
        },
        {
          title: '未开放天数',
          dataIndex: 'frozenDay',
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          render: (value, row, index) => <pre>{value}</pre>,
        },
      ],
    };

    const { expendKeys } = this.state;

    const detailEntityTableProps = {
      title: '休假明细',
      sortBy: 'id',
      rowKey: 'Emonth',
      columnsCache: DOMAIN,
      sortDirection: 'DESC',
      showColumn: false,
      dataSource: detailEntityList,
      expandedRowRender: this.detailEntityTable,
      expandRowByClick: true,
      expandedRowKeys: expendKeys,
      onExpand: (expanded, record) => {
        const tt = expendKeys;
        if (expanded) {
          tt.push(record.Emonth);
        } else {
          tt.splice(tt.indexOf(record.Emonth), 1);
        }
        this.setState({
          expendKeys: tt,
        });
      },
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      columns: [
        {
          title: '月份',
          dataIndex: 'Emonth',
          align: 'center',
        },
        {
          title: '请假天数',
          dataIndex: 'Edays',
          align: 'center',
          render: (value, row, index) =>
            row.children1.reduce((x, y) => x + Number(y.vdays), 0).toFixed(1),
        },
      ],
      footer: () => {
        const deleteBtn =
          Array.isArray(formData.selectedRowKeys) && !isEmpty(formData.selectedRowKeys)
            ? !formData.selectedRowKeys.length
            : true;
        return deleteBtn ? (
          <Button disabled className="tw-btn-error" style={{ marginLeft: 8 }}>
            删除
          </Button>
        ) : (
          <Popconfirm
            key="delete"
            title="确定要删除这些记录么?"
            placement="top"
            onConfirm={this.onDeleteItems}
          >
            <Button disabled={deleteBtn} className="tw-btn-error" style={{ marginLeft: 8 }}>
              删除
            </Button>
          </Popconfirm>
        );
      },
    };

    return (
      <div>
        <BusinessForm
          title="休假申请"
          form={form}
          formData={formData}
          formMode={formMode}
          defaultColumnStyle={8}
        >
          <FormItem
            label="申请人"
            fieldKey="resId"
            fieldType="ResSimpleSelect"
            initialValue={resId}
            descriptionField="applyResName"
            disabled
          />
          <FormItem
            label="公司"
            key="company"
            fieldKey="company"
            fieldType="BaseCustomSelect"
            parentKey="CUS:INTERNAL_COMPANY"
            placeholder="请选择公司"
          />
          <FormItem
            label="申请日期"
            fieldKey="apprDate"
            initialValue={new Date()}
            fieldType="BaseDatePicker"
            disabled
          />
          <FormItem
            fieldKey="applyNo"
            fieldType="BaseInput"
            label="申请单号"
            placeholder="系统自动生成"
            disabled
          />
          <FormItem
            label="假期类型"
            fieldKey="vacationType"
            fieldType="BaseCustomSelect"
            parentKey="RES:VAC_TYPE"
            placeholder="请选择假期类型"
            required
          />
          <FormItem
            label="休假开始/结束日"
            key="date"
            fieldKey="date"
            fieldType="BaseDateRangePicker"
            initialValue={formData.date}
            onChange={(dates, dateStrings) => {
              const daysDiff = moment(dates[1]).diff(moment(dates[0]), 'days');
              const monthDiff = sub(moment(dates[1]).month(), moment(dates[0]).month());
              const daysArr = [];

              // 将二维数组转换为一位数组
              let detailArr = [];
              if (!isNil(detailEntityList)) {
                detailEntityList.forEach(item => {
                  detailArr = detailArr.concat(item.children1);
                });
              }

              // 当日期范围改变时，保留之前已经输入的数据
              for (let i = 0; i <= daysDiff; i += 1) {
                const vdate = moment(dates[0])
                  .add(i, 'days')
                  .format('YYYY-MM-DD');
                const vmonth = moment(dates[0])
                  .add(i, 'days')
                  .format('YYYY-MM');
                const tt = detailArr.filter(v => v.vdate === vdate);
                if (tt.length) {
                  daysArr.push(tt[0]);
                } else {
                  daysArr.push({
                    // id: i,
                    keyId: i,
                    vdate,
                    vdays: 1.0,
                    vmonth,
                  });
                }
              }

              const monthsArr = [];
              for (let i = 0; i <= monthDiff; i += 1) {
                const Emonth = moment(moment(dates[0]).format('YYYY-MM'))
                  .add(i, 'month')
                  .format('YYYY-MM');
                monthsArr.push({
                  // id: i,
                  keyId: i,
                  Emonth,
                  Edays: daysArr
                    .filter(v => v.vmonth === Emonth)
                    .reduce((x, y) => x + Number(y.vdays), 0)
                    .toFixed(1),
                  children: daysArr.filter(v => v.vmonth === Emonth),
                });
              }

              const arr = monthsArr.map(item => {
                // 解决 children 的 id 跟父级重复的问题
                const children = item.children
                  ? item.children.map(value => ({
                      ...value,
                      keyId: item.keyId + '-' + value.keyId,
                    }))
                  : [];
                return { ...item, children1: children, children: undefined };
              });

              // 更新redux存储数组
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  detailEntityList: arr,
                },
              });

              // 若日期为空，清除选中项
              if (isEmpty(arr)) {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    selectedRowKeys: null,
                  },
                });
              }

              // 更新请假天数
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  vacationDays: arr.reduce((x, y) => x + Number(y.Edays), 0).toFixed(1),
                },
              });

              const tt = [];
              arr.forEach(v => {
                tt.push(v.Emonth);
              });
              this.setState({
                expendKeys: tt,
              });
            }}
            required
          />
          <FormItem
            fieldKey="vacationDays"
            fieldType="BaseInput"
            label="休假天数"
            initialValue={formData.vacationDays}
            placeholder="系统自动生成"
            disabled
          />
          {/* <FormItem
            fieldType="BaseFileManagerEnhance"
            label="申请人提交附件"
            fieldKey="attachment"
            api="/api/production/vac/sfs/token"
            dataKey={formData.id}
          /> */}
          <FormItem
            fieldType="FileUpload"
            label="申请人提交附件"
            fieldKey="attachment"
            fileList={attachments}
            multiple
          />
          <FormItem
            label="事由"
            key="reason"
            fieldKey="reason"
            fieldType="BaseInputTextArea"
            placeholder="请输入休假事由"
          />
          <FormItem
            label="工作安排"
            key="workPlan"
            fieldKey="workPlan"
            fieldType="BaseInputTextArea"
            placeholder="请输入备注"
          />
        </BusinessForm>
        <DataTable {...resVacationTableProps} />
        <DataTable {...detailEntityTableProps} />
      </div>
    );
  }
}

export default TaskOne;
