import React, { PureComponent } from 'react';
import {
  Button,
  Card,
  Input,
  Select,
  Form,
  Divider,
  Row,
  Col,
  InputNumber,
  Tooltip,
  Icon,
  Checkbox,
  DatePicker,
  Switch,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import { UdcSelect, MonthRangePicker } from '@/pages/gen/field';
import moment from 'moment';
import { genFakeId } from '@/utils/mathUtils';
import update from 'immutability-helper';
import { formatDT } from '@/utils/tempUtils/DateTime';

import {
  ChartCard,
  MiniArea,
  MiniBar,
  MiniProgress,
  Bar,
  Pie,
  TimelineChart,
} from '@/components/common/Charts';
import EditableDataTable from '@/components/common/EditableDataTable';
import { findAccTmplSelect } from '@/services/sys/baseinfo/butemplate';

import { selectFinperiod } from '@/services/user/Contract/sales';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const DOMAIN = 'projectTemplateCreate';

@connect(({ loading, projectTemplateCreate, dispatch, user }) => ({
  loading,
  ...projectTemplateCreate,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;

    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: changedValues,
    });
  },
})
@mountToTab()
class ProjectTemplateCreate extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    const { id, projId } = param;
    if (id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      });
    }
  }

  handleSave = () => {
    const { form, dispatch, formData, activityDeleteList, activityList } = this.props;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          tmpl: { ...formData, ...values },
          deletetmplActs: activityDeleteList,
          tmplActs: activityList,
        },
      });
    });
  };

  // checkbox????????????
  onCellCheckBoxChanged = (rowIndex, rowField) => rowFieldValue => {
    const { activityList, dispatch } = this.props;
    const val = rowFieldValue.target.checked ? 1 : 0;

    const newDataSource = update(activityList, {
      [rowIndex]: {
        [rowField]: {
          $set: val,
        },
      },
    });

    dispatch({ type: `${DOMAIN}/updateState`, payload: { activityList: newDataSource } });
  };

  // ?????????????????????
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { activityList, dispatch } = this.props;

    let value = rowFieldValue;
    if (rowField === 'endDate') {
      const { startDate } = activityList[rowIndex];
      if (startDate && moment(value).isBefore(startDate)) {
        createMessage({ type: 'error', description: '?????????????????????`?????????`' });
        value = null;
      } else {
        // ????????????????????????
        value = formatDT(value);
      }
    } else if (rowField === 'startDate') {
      const { endDate } = activityList[rowIndex];
      if (endDate && moment(endDate).isBefore(value)) {
        createMessage({ type: 'error', description: '?????????????????????`?????????`' });
        value = null;
      } else {
        // ????????????????????????
        value = formatDT(value);
      }
    } else if (rowField === 'workbenchFlag') {
      value = value === true ? 1 : 0;
    } else {
      // input???????????????
      value = value && value.target ? value.target.value : value;
    }

    const newDataSource = update(activityList, {
      [rowIndex]: {
        [rowField]: {
          $set: value && value.target ? value.target.value : value,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { activityList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      formData,
      activityList,
      activityDeleteList,
      user: {
        user: { extInfo = {} }, // ?????????????????????resId
      },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      dispatch,
    } = this.props;
    // const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const disabledBtn = undefined;

    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: 0,
      scroll: {
        x: 1340,
      },
      dataSource: activityList,
      showCopy: false,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            activityList: update(activityList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  milestoneFlag: 0,
                  phaseFlag: 0,
                  fromtmplFlag: 0,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (_selectedRowKeys, selectedRows) => {
        const filterIsPhaseFlagRowKeys = selectedRows.map(row => row.id);
        const newDataSource = activityList.filter(
          row => !filterIsPhaseFlagRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            activityList: newDataSource.map((item, index) => ({ ...item })),
            activityDeleteList: [...activityDeleteList, ...filterIsPhaseFlagRowKeys], // ???????????????????????????????????????????????????
          },
        });
      },
      columns: [
        {
          title: '????????????',
          dataIndex: 'actNo',
          required: true,
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <Input value={value} size="small" onChange={this.onCellChanged(index, 'actNo')} />
          ),
        },
        {
          title: '????????????',
          dataIndex: 'actName',
          required: true,
          width: 300,
          render: (value, row, index) => (
            <Input value={value} size="small" onChange={this.onCellChanged(index, 'actName')} />
          ),
        },
        {
          title: '????????????',
          dataIndex: 'days',
          // required: true,
          align: 'right',
          width: 50,
          render: (value, row, index) => (
            <Input value={value} size="small" onChange={this.onCellChanged(index, 'days')} />
          ),
        },
        // {
        //   title: '????????????',
        //   dataIndex: 'eqvaRate',
        //   // required: true,
        //   align: 'right',
        //   width: 50,
        //   render: (value, row, index) => (
        //     <Input
        //       value={value}
        //       size="small"
        //       onChange={this.onCellChanged(index, 'eqvaRate')}
        //     />
        //   ),
        // },
        {
          title: '????????????',
          dataIndex: 'eqva',
          align: 'right',
          width: 50,
          render: (value, row, index) => (
            <Input value={value} size="small" onChange={this.onCellChanged(index, 'eqva')} />
          ),
        },
        {
          title: '?????????',
          dataIndex: 'milestoneFlag',
          required: true,
          align: 'center',
          width: 50,
          render: (value, row, index) => (
            <Checkbox
              checked={value === 1}
              onChange={this.onCellCheckBoxChanged(index, 'milestoneFlag')}
            />
          ),
        },
        {
          title: '??????',
          dataIndex: 'phaseFlag',
          required: false,
          align: 'center',
          width: 50,
          render: (value, row, index) => (
            <Checkbox
              checked={value === 1}
              onChange={this.onCellCheckBoxChanged(index, 'phaseFlag')}
            />
          ),
        },
        {
          title: '??????',
          dataIndex: 'remark',
          width: 200,
          render: (value, row, index) => (
            <Input value={value} size="small" onChange={this.onCellChanged(index, 'remark')} />
          ),
        },
      ],
      buttons: [
        {
          key: 'upper',
          title: '??????',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (_selectedRowKeys, selectedRows) => {
            let targetIndex = 0;

            activityList.forEach((data, index) => {
              if (data.id === _selectedRowKeys[0]) {
                targetIndex = index;
              }
            });

            if (targetIndex > 0) {
              const obj = activityList.splice(targetIndex, 1);
              activityList.splice(targetIndex - 1, 0, obj[0]);

              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  activityList: activityList.slice(),
                },
              });
            }
          },
        },
        {
          key: 'lower',
          title: '??????',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (_selectedRowKeys, selectedRows) => {
            let targetIndex = 0;

            activityList.forEach((data, index) => {
              if (data.id === _selectedRowKeys[0]) {
                targetIndex = index;
              }
            });

            if (targetIndex !== activityList.length - 1) {
              const obj = activityList.splice(targetIndex, 1);
              activityList.splice(targetIndex + 1, 0, obj[0]);
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  activityList: activityList.slice(),
                },
              });
            }
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="????????????">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '??????' })}
          </Button>
        </Card>

        <Card bordered={false} className="tw-card-adjust">
          <FieldList legend="????????????" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="tmplName"
              label="????????????"
              decorator={{
                initialValue: formData.tmplName,
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>
            <Field
              name="workType"
              label="????????????"
              decorator={{
                initialValue: formData.workType,
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <UdcSelect allowClear={false} code="TSK:WORK_TYPE" style={{ width: '100%' }} />
            </Field>
            <Field
              name="accTmplId"
              label="????????????"
              decorator={{
                initialValue: formData.accTmplId,
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <AsyncSelect
                source={() =>
                  findAccTmplSelect({ tmplClass: 'PROJ_ACC' }).then(resp =>
                    resp.response.map(item => ({ code: item.id, name: item.name }))
                  )
                }
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="?????????????????????"
              />
            </Field>

            <Field
              name="enabledFlag"
              label="????????????"
              decorator={{
                initialValue: formData.enabledFlag + '' || '1',
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <Select placeholder="?????????????????????" allowClear>
                <Select.Option value="1">???</Select.Option>
                <Select.Option value="0">???</Select.Option>
              </Select>
            </Field>

            <Field
              name="remark"
              label="??????"
              decorator={{
                initialValue: formData.remark,
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>
          </FieldList>

          <DescriptionList title="??????????????????" />
          <EditableDataTable loading={disabledBtn} {...editTableProps} scroll={{ x: 1600 }} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ProjectTemplateCreate;
