import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { Button, Card, Form, Input, Divider, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker, FileManagerEnhance } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { selectProjectTmpl, selectProject } from '@/services/user/project/project';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUsersWithBu } from '@/services/gen/list';
import { mul } from '@/utils/mathUtils';

const { Field, FieldLine } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'noContractProjCreate';

@connect(({ loading, noContractProjCreate, dispatch }) => ({
  loading,
  noContractProjCreate,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class NoContractProjFlowCreate extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      dispatch({ type: `${DOMAIN}/queryUserPrincipal` });
    });
  }

  handleSubmit = submit => {
    const {
      form: { validateFieldsAndScroll, setFields },
      noContractProjCreate: { formData },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      // 当量预估单价/总价 必填
      const { eqvaPrice } = formData;
      if (!eqvaPrice) {
        setFields({
          eqvaPrice: {
            value: undefined,
            errors: [new Error('必填')],
          },
        });
      }

      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            submit: 'true',
          },
        }).then(res => {
          if (res.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/user/flow/process?type=procs`);
          } else {
            createMessage({ type: 'error', description: res.reason || '操作失败' });
          }
        });
      }
    });
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator },
      noContractProjCreate: { formData },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/submit`];
    const queryBtn = loading.effects[`${DOMAIN}/flowDetail`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={e => this.handleSubmit(true)}
            disabled={submitBtn || queryBtn}
          >
            提交
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="无合同项目申请" />}
          bordered={false}
        >
          <FieldList
            legend="项目简况"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="projName"
              label="项目名称"
              decorator={{
                initialValue: formData.projName || undefined,
                rules: [
                  {
                    required: true,
                    message: '请输入项目名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入项目名称" />
            </Field>
            <Field
              name="workType"
              label="工作类型"
              decorator={{
                initialValue: formData.workType || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择工作类型',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="TSK:WORK_TYPE"
                filters={[{ sphd3: 'NO_CONTRACT' }]}
                placeholder="请选择工作类型"
              />
            </Field>
            <Field
              name="projTempId"
              label="项目模板"
              decorator={{
                initialValue: formData.projTempId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择项目模板',
                  },
                ],
              }}
            >
              <Selection
                className="x-fill-100"
                source={() => selectProjectTmpl()}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                onChange={value => {}}
                placeholder="请选择项目模板"
              />
            </Field>
            <Field
              name="currCode"
              label="币种"
              decorator={{
                initialValue: formData.currCode || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择币种',
                  },
                ],
              }}
            >
              <Selection.UDC code="COM:CURRENCY_KIND" placeholder="请选择币种" />
            </Field>
            <Field
              name="startDate"
              label="预计开始日期"
              decorator={{
                initialValue: formData.startDate || undefined,
              }}
            >
              <DatePicker format="YYYY-MM-DD" />
            </Field>
            <Field
              name="endDate"
              label="预计结束日期"
              decorator={{
                initialValue: formData.endDate || undefined,
              }}
            >
              <DatePicker format="YYYY-MM-DD" />
            </Field>
            <Field
              name="SOWAdjunct"
              label="SOW节选"
              decorator={{
                initialValue: formData.id || undefined,
              }}
            >
              <FileManagerEnhance
                api="/api/op/v1/noContract/project/sow/sfs/token"
                dataKey={formData.id}
                listType="text"
              />
            </Field>
            <Field
              name="remark"
              label="备注"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.remark || undefined,
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>

            <Field
              name="applyResName"
              label="申请人"
              decorator={{
                initialValue: formData.applyResName || undefined,
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || undefined,
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>
          </FieldList>
          <Divider dashed />
          <FieldList
            legend="相关人员"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="expenseBuId"
              label="费用承担BU"
              decorator={{
                initialValue: formData.expenseBuId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择费用承担BU',
                  },
                ],
              }}
            >
              <Selection.ColumnsForBu />
            </Field>
            <Field
              name="deliBuId"
              label="交付BU"
              decorator={{
                initialValue: formData.deliBuId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择交付BU',
                  },
                ],
              }}
            >
              <Selection.ColumnsForBu />
            </Field>
            <Field
              name="deliResId"
              label="交付负责人"
              decorator={{
                initialValue: formData.deliResId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择交付负责人',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectUsersWithBu()}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择交付负责人"
              />
            </Field>
            <Field
              name="pmResId"
              label="项目经理"
              decorator={{
                initialValue: formData.pmResId || undefined,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectUsersWithBu()}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择项目经理"
              />
            </Field>
          </FieldList>
          <Divider dashed />
          <FieldList
            legend="总预算信息"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="totalDays"
              label="预计总人天"
              decorator={{
                initialValue: formData.totalDays || undefined,
                rules: [
                  {
                    required: true,
                    message: '请输入预计总人天',
                  },
                ],
              }}
            >
              <InputNumber className="x-fill-100" placeholder="请输入预计总人天" />
            </Field>
            <Field
              name="totalEqva"
              label="预计总当量"
              decorator={{
                initialValue: formData.totalEqva || undefined,
                rules: [
                  {
                    required: true,
                    message: '请输入预计总当量',
                  },
                ],
              }}
            >
              <InputNumber className="x-fill-100" placeholder="请输入预计总当量" />
            </Field>
            <FieldLine label="当量预估单价/总价" required>
              <Field
                name="eqvaPrice"
                decorator={{
                  initialValue: formData.eqvaPrice || '',
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <InputNumber className="x-fill-100" placeholder="当量预估单价" />
              </Field>
              <Field
                name="eqvaPriceTotal"
                decorator={{
                  initialValue: mul(Number(formData.eqvaPrice), Number(formData.totalEqva)) || '',
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <InputNumber className="x-fill-100" placeholder="当量总价" disabled />
              </Field>
            </FieldLine>
            <Field
              name="totalReimbursement"
              label="费用总预算"
              decorator={{
                initialValue: formData.totalReimbursement || undefined,
                rules: [
                  {
                    required: true,
                    message: '请输入费用总预算',
                  },
                ],
              }}
            >
              <InputNumber className="x-fill-100" placeholder="请输入费用总预算" />
            </Field>
            <Field
              name="totalCost"
              label="预算总成本"
              decorator={{
                initialValue: formData.totalCost || undefined,
                rules: [
                  {
                    required: true,
                    message: '请输入预算总成本',
                  },
                ],
              }}
            >
              <InputNumber className="x-fill-100" placeholder="请输入预算总成本" />
            </Field>
            <Field
              name="budgetAdjunct"
              label="预算附件"
              decorator={{
                initialValue: formData.id || undefined,
              }}
            >
              <FileManagerEnhance
                api="/api/op/v1/noContract/project/budget/sfs/token"
                dataKey={formData.id}
                listType="text"
              />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default NoContractProjFlowCreate;
