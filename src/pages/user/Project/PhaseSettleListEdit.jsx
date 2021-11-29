import React, { PureComponent } from 'react';
import { Button, Card, Input, Select, Form, InputNumber } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { Selection, DatePicker } from '@/pages/gen/field';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';

import { selectProjectConditional } from '@/services/user/project/project';

const { Option } = Select;
const { Field, FieldLine } = FieldList;
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'phaseSettleListEdit';

@connect(({ loading, phaseSettleListEdit, dispatch, user }) => ({
  loading,
  ...phaseSettleListEdit,
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
class PhaseSettleListEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    const { id } = param;
    if (id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      });
    }
  }

  handleSave = () => {
    const { form, dispatch, formData, dataSource } = this.props;
    if (!dataSource || dataSource.length === 0) {
      createMessage({
        type: 'warn',
        description: '必须工时记录才可保存,请修改项目和工时日期后点击查询获取工时记录',
      });
    }
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          entity: {
            ...formData,
            ...values,
            startDate: formData.tsDate[0],
            endDate: formData.tsDate[1],
          },
          dtlEntities: dataSource,
        },
      });
    });
  };

  queryTimeSheet = () => {
    const { dispatch, formData } = this.props;

    if (!formData.projId) {
      createMessage({ type: 'warn', description: '请选择项目' });
      return;
    }
    if (!formData.tsDate) {
      createMessage({ type: 'warn', description: '请输入工时日期范围' });
      return;
    }

    dispatch({
      type: `${DOMAIN}/queryTimeSheet`,
      payload: {
        startDate: formData.tsDate[0],
        endDate: formData.tsDate[1],
        projId: formData.projId,
      },
    });
  };

  render() {
    const {
      loading,
      formData,
      mode,
      dataSource,
      total,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      dispatch,
    } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    const keyColumn = mode === 'add' ? 'tsId' : 'id';

    const tableProps = {
      sortBy: keyColumn,
      rowKey: keyColumn,
      loading: disabledBtn,
      total,
      dataSource: dataSource || [],
      showSearch: false,
      showColumn: true,
      showExport: true,
      pagination: false,
      enableSelection: false,

      columns: [
        {
          title: '资源',
          dataIndex: 'resName',
        },
        {
          title: '天数',
          dataIndex: 'days',
        },
        {
          title: '工时日期',
          dataIndex: 'tsDate',
        },
        {
          title: '客户结算价',
          dataIndex: 'price',
        },
        {
          title: '总额',
          dataIndex: 'amt',
          render: (value, row, index) => (row.days * row.price).toFixed(2),
        },
      ],
      leftButtons: [
        {
          key: 'query',
          className: 'tw-btn-primary',
          title: '查询',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          icon: 'search',
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.queryTimeSheet();
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="阶段结算单编辑">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
        </Card>

        <Card bordered={false} className="tw-card-adjust">
          <FieldList legend="基本信息" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="listName"
              label="结算单名称"
              decorator={{
                initialValue: formData.listName,
                rules: [{ required: false, message: '结算单名称' }],
              }}
            >
              <Input disabled style={{ width: '100%' }} />
            </Field>

            <Field
              name="resId"
              label="提交人"
              decorator={{
                initialValue: formData.resId || (extInfo && extInfo.resId),
              }}
            >
              <Select disabled>
                <Option value={extInfo.resId}>{extInfo.resName}</Option>
                <Option value={formData.resId}>{formData.resName}</Option>
              </Select>
            </Field>

            <Field
              name="projId"
              label="项目"
              decorator={{
                initialValue: formData.projId,
                rules: [{ required: true, message: '请选择项目' }],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectProjectConditional({})}
                columns={SEL_COL}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
              />
            </Field>

            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || formatDT(moment()),
                rules: [{ required: false, message: '请输入申请日期' }],
              }}
            >
              <DatePicker disabled format="YYYY-MM-DD" />
            </Field>

            <Field
              name="phaseName"
              label="收款阶段名称"
              decorator={{
                initialValue: formData.phaseName,
                rules: [{ required: true, message: '请输入收款阶段名称' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="tsDate"
              label="工时日期范围"
              decorator={{
                initialValue: formData.tsDate,
                rules: [{ required: true, message: '请输入申请日期' }],
              }}
            >
              <DatePicker.RangePicker format="YYYY-MM-DD" />
            </Field>

            <Field
              name="days"
              label="总人天"
              decorator={{
                initialValue: formData.days,
                rules: [{ required: false, message: '请输入总人天' }],
              }}
            >
              <InputNumber
                disabled
                className="x-fill-100"
                precision={2}
                min={0}
                max={999999999999}
              />
            </Field>

            <Field
              name="amt"
              label="总金额"
              decorator={{
                initialValue: formData.amt,
                rules: [{ required: false, message: '请输入总金额' }],
              }}
            >
              <InputNumber
                disabled
                className="x-fill-100"
                precision={2}
                min={0}
                max={999999999999}
              />
            </Field>

            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark,
                rules: [{ max: 400, message: '不超过400个字' }],
              }}
            >
              <Input.TextArea rows={1} placeholder="备注" />
            </Field>
          </FieldList>

          <DescriptionList title="工时列表" />
          <DataTable loading={disabledBtn} {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PhaseSettleListEdit;
