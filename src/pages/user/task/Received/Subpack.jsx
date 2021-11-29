import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Card, Button, Input, DatePicker, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import classnames from 'classnames';
import { formatDT } from '@/utils/tempUtils/DateTime';
import moment from 'moment';
import { selectBus } from '@/services/org/bu/bu';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import { UdcSelect, Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { selectUsersWithBu } from '@/services/gen/list';

import { selectUsers } from '@/services/sys/user';

const DOMAIN = 'userTaskSubpack';
const { Field, FieldLine } = FieldList;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ dispath, loading, userTaskSubpack }) => ({
  dispath,
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/submit`],
  userTaskSubpack,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      if (name === 'planDate') {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            planStartDate: formatDT(value[0]),
            planEndDate: formatDT(value[1]),
          },
        });
      } else {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [name]: value },
        });
      }
    }
  },
})
@mountToTab()
class Subpack extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, tId } = fromQs();
    if (tId) {
      dispatch({
        type: `${DOMAIN}/edit`,
        payload: +tId,
      });
    } else {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      });
    }
  }

  handleSubmit = () => {
    const {
      dispatch,
      userTaskSubpack: { formData },
      form: { validateFieldsAndScroll },
    } = this.props;
    const { taskId, remark } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            ...formData,
            remark,
            apprId: taskId,
          },
        });
      }
    });
  };

  handleBack = () => {
    closeThenGoto('/user/task/received');
  };

  // 根据选择的接收资源获得接收资源bu
  fetchBU = value => {
    const { dispatch } = this.props;
    value &&
      dispatch({
        type: `${DOMAIN}/queryBu`,
        payload: {
          resId: value,
        },
      });
  };

  render() {
    const {
      loading,
      dispatch,
      userTaskSubpack: { formData },
      form: { getFieldDecorator },
    } = this.props;
    const readOnly = true;
    return (
      <PageHeaderWrapper title="任务转包">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            loading={loading}
          >
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleBack}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" id="user.task.subpack" defaultMessage="转包信息" />}
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            <Field
              name="disterResId"
              label="转包人"
              decorator={{
                initialValue: formData.disterResId,
              }}
              labelCol={{ span: 8, xxl: 8 }}
            >
              <AsyncSelect
                source={() => selectUsers().then(resp => resp.response)}
                placeholder="请输入转包人"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                disabled={readOnly}
              />
            </Field>

            <Field
              name="taskName"
              label="任务名称"
              decorator={{
                initialValue: formData.taskName,
                rules: [
                  {
                    required: true,
                    message: '请输入任务名称',
                  },
                ],
              }}
              labelCol={{ span: 8, xxl: 8 }}
            >
              <Input placeholder="请输入任务名称" />
            </Field>

            <Field
              name="receiverResId"
              label="接收资源"
              decorator={{
                initialValue: formData.receiverResId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择接收资源',
                  },
                ],
              }}
              labelCol={{ span: 8, xxl: 8 }}
            >
              <Selection.Columns
                key="receiverResId"
                className="x-fill-100"
                source={() => selectUsersWithBu()}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择接收资源"
                // filterOption={(input, option) =>
                //   option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                // }
                onChange={value => {
                  this.fetchBU(value);
                }}
              />
            </Field>
            <FieldLine label="复合能力" fieldCol={2} required labelCol={{ span: 8, xxl: 8 }}>
              <Field
                name="jobType1"
                decorator={{
                  initialValue: formData.jobType1Desc,
                  rules: [{ required: true, message: '请选择工种' }],
                }}
                wrapperCol={{ span: 23 }}
              >
                <Input disabled={readOnly} />
              </Field>
              <Field
                name="jobType2"
                decorator={{
                  initialValue: formData.jobType2Desc,
                  rules: [{ required: true, message: '请选择工种子类' }],
                }}
                wrapperCol={{ span: 23 }}
              >
                <Input disabled={readOnly} />
              </Field>
              <Field
                name="capabilitySet"
                decorator={{
                  initialValue: formData.leveldName,
                  rules: [{ required: true, message: '请选择级别' }],
                }}
                wrapperCol={{ span: 24 }}
              >
                <Input disabled={readOnly} />
              </Field>
            </FieldLine>
            <Field
              name="receiverBuId"
              label="接收资源BU"
              decorator={{
                initialValue: formData.receiverBuId || '根据接收资源自动带出',
              }}
              labelCol={{ span: 8, xxl: 8 }}
            >
              <AsyncSelect
                source={() => selectBus().then(resp => resp.response)}
                placeholder="根据接收资源自动带出"
                disabled
              />
            </Field>
            <Field label="" presentational>
              &nbsp;
            </Field>
            <Field
              name="pid"
              label="来源任务包"
              decorator={{
                initialValue: formData.pname,
              }}
              labelCol={{ span: 8, xxl: 8 }}
            >
              <Input disabled={readOnly} />
            </Field>

            <FieldLine label="来源任务包总当量/金额" fieldCol={2} labelCol={{ span: 8, xxl: 8 }}>
              <Field
                name="eqvaQty"
                decorator={{
                  initialValue: formData.eqvaQty,
                }}
                wrapperCol={{ span: 23, xxl: 24 }}
              >
                <Input disabled={readOnly} />
              </Field>
              <Field
                name="amt"
                decorator={{
                  initialValue: formData.amt,
                }}
                wrapperCol={{ span: 24, xxl: 24 }}
              >
                <Input disabled />
              </Field>
            </FieldLine>
            <Field
              name="subcontractEqva"
              label="转包当量数"
              decorator={{
                initialValue: formData.subcontractEqva,
                rules: [
                  {
                    required: true,
                    message: '请输入转包当量数',
                  },
                ],
              }}
              labelCol={{ span: 8, xxl: 8 }}
            >
              <InputNumber placeholder="请输入转包当量数" min={0} className="x-fill-100" />
            </Field>
            <Field
              name="planDate"
              label="计划时间"
              decorator={{
                initialValue: [
                  formData.planStartDate ? moment(formData.planStartDate) : null,
                  formData.planEndDate ? moment(formData.planEndDate) : null,
                ],
              }}
              labelCol={{ span: 8, xxl: 8 }}
            >
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                format="YYYY-MM-DD"
                className="x-fill-100"
              />
            </Field>

            <Field
              name="remark1"
              label="备注"
              decorator={{
                initialValue: formData.remark1,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 4 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input placeholder="请输入备注" rows={3} />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Subpack;
