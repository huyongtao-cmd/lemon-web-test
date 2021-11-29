import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Button, Card, Form, Input, Radio, Divider, Table, InputNumber, Popconfirm } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { FileManagerEnhance, Selection, DatePicker } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';
import { formatMessage } from 'umi/locale';
import { sub, genFakeId } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';

const { Field } = FieldList;

const VACATION_TYPE = ['ANNUAL', 'IN_LIEU', 'ANNUAL_W'];

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'vacationFlow';

@connect(({ loading, vacationFlow, dispatch }) => ({
  loading,
  vacationFlow,
  dispatch,
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
      vacationFlow: {
        fieldsConfig: { taskKey },
      },
    } = this.props;
    const { id, taskId } = fromQs();

    id &&
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: { id },
      });
    taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {
              buttons: [],
              panels: {
                disabledOrHidden: {},
              },
            },
          },
        });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
  }

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
      vacationFlow: { detailEntityList },
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
      vacationFlow: {
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
      vacationFlow: { formData, detailEntityList, delList },
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
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      vacationFlow: { formData, resData, baseBuData, resVacationList, detailEntityList, delList },
    } = this.props;

    const resVacationTableProps = {
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
      <Card
        className="tw-card-adjust"
        style={{ marginTop: '6px' }}
        title={<Title icon="profile" text="请假申请" />}
        bordered={false}
      >
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          <Field
            name="resId"
            label="请假人"
            decorator={{
              initialValue: formData.resId || undefined,
            }}
          >
            <Selection.Columns
              className="x-fill-100"
              source={resData}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {
                if (value && value.id) {
                  const { id } = value;
                  dispatch({
                    type: `${DOMAIN}/queryResDetail`,
                    payload: id,
                  });
                }
              }}
              placeholder="请选择请假人"
              disabled
            />
          </Field>
          <Field
            name="buId"
            label="BaseBU"
            decorator={{
              initialValue: formData.buId || '',
            }}
          >
            <Selection.Columns
              className="x-fill-100"
              source={baseBuData}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              disabled
            />
          </Field>
          <Field
            name="presId"
            label="直属领导"
            decorator={{
              initialValue: formData.presId || '',
            }}
          >
            <Selection.Columns
              className="x-fill-100"
              source={resData}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              disabled
            />
          </Field>
          <Field
            name="ouId"
            label="所属公司"
            decorator={{
              initialValue: formData.ouId || '',
            }}
          >
            <Selection source={() => selectInternalOus()} placeholder="请选择所属公司" disabled />
          </Field>
          <Field
            name="vacationType"
            label="假期类型"
            decorator={{
              initialValue: formData.vacationType || undefined,
              rules: [
                {
                  required: true,
                  message: '请选择假期类型',
                },
              ],
            }}
          >
            <Selection.UDC
              code="COM:VACATION_TYPE"
              placeholder="请选择假期类型"
              onChange={e => {
                if (e !== formData.selectedVacationType) {
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      vacationId: '',
                    },
                  });
                }
              }}
            />
          </Field>
          <Field
            name="applyNo"
            label="请假单号"
            decorator={{
              initialValue: formData.applyNo || '',
            }}
          >
            <Input disabled placeholder="系统自动生成" />
          </Field>
        </FieldList>
        <Divider dashed />
        <FieldList
          legend="剩余假期"
          layout="horizontal"
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          <DataTable {...resVacationTableProps} />
        </FieldList>
        <Divider dashed />
        <FieldList
          legend="请假明细"
          layout="horizontal"
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          <Field
            name="date"
            label="请假开始/结束日期"
            decorator={{
              initialValue: formData.date || '',
              rules: [
                {
                  required: true,
                  message: '请假开始/结束日期',
                },
              ],
            }}
          >
            <DatePicker.RangePicker
              key={formData.date}
              onChange={(dates, dateStrings) => {
                const daysDiff = moment(dates[1]).diff(moment(dates[0]), 'days');
                const monthDiff = moment(moment(dates[1]).format('YYYY-MM')).diff(
                  moment(moment(dates[0]).format('YYYY-MM')),
                  'months'
                );
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
                    daysArr.push({ ...tt[0], id: null, keyId: i });
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

                // 更新redux存储数组
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    delList: delList.concat(detailArr.map(v => v.id).filter(v => v)),
                  },
                });

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
              format="YYYY-MM-DD"
            />
          </Field>
          <Field
            name="vacationDays"
            label="请假天数"
            decorator={{
              initialValue: formData.vacationDays || '',
            }}
          >
            <Input disabled placeholder="系统自动生成" />
          </Field>
          <br />
          <br />
          <span style={{ color: 'red', fontSize: '14px', position: 'absolute', left: '25px' }}>
            ※ 请按实际休假情况调整请假天数，如当天不请假，则删除该行
          </span>
          <DataTable {...detailEntityTableProps} />
        </FieldList>
        <Divider dashed />
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          <Field
            name="attache"
            label="附件"
            decorator={{
              initialValue: formData.attache || '',
            }}
          >
            <FileManagerEnhance
              api="/api/person/v1/vacationApply/sfs/token"
              listType="text"
              dataKey={formData.id}
            />
          </Field>
          <Field
            presentational
            label="附件说明"
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
            style={{ color: 'red' }}
          >
            婚假，请上传结婚证；陪产假，请上传出生证明；病假，请上传医院盖章的病假单和就诊记录两者。
          </Field>
          <Field
            name="reason"
            label="请假事由"
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
            decorator={{
              initialValue: formData.reason || '',
              rules: [
                {
                  required: true,
                  message: '请输入请假事由',
                },
              ],
            }}
          >
            <Input.TextArea rows={3} placeholder="请输入请假事由" />
          </Field>
          <Field
            name="workPlan"
            label="工作安排"
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
            decorator={{
              initialValue: formData.workPlan || '',
              rules: [
                {
                  required: true,
                  message: '请输入工作安排',
                },
              ],
            }}
          >
            <Input.TextArea rows={3} placeholder="请输入工作安排" />
          </Field>
        </FieldList>
        <Divider dashed />
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          <Field
            name="apprResName"
            label="申请人"
            decorator={{
              initialValue: formData.apprResName || '',
            }}
          >
            <Input disabled />
          </Field>
          <Field
            name="apprDate"
            label="申请日期"
            decorator={{
              initialValue: formData.apprDate || '',
            }}
          >
            <Input disabled />
          </Field>
        </FieldList>
      </Card>
    );
  }
}

export default TaskOne;
