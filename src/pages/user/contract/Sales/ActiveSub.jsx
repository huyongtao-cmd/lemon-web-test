import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Button, Form, Card, Input, DatePicker, InputNumber, Table } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import moment from 'moment';
import { selectContract, selectFinperiod, selectBuProduct } from '@/services/user/Contract/sales';
import { FileManagerEnhance, Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { div, mul } from '@/utils/mathUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { selectUsersWithBu } from '@/services/gen/list';

const DOMAIN = 'activeSubContract';
const { Field, FieldLine } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@connect(({ loading, activeSubContract, dispatch }) => ({
  loading,
  activeSubContract,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      if (value instanceof Object && name !== 'signDate') {
        const key = name.split('Id')[0];
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [key + 'Id']: value.id, [key + 'Name']: value.name },
        });
      } else if (name === 'signDate') {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [name]: formatDT(value) },
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
class ActiveSub extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();

    if (id) {
      dispatch({
        type: `${DOMAIN}/querySubContractDetail`,
        payload: { id },
      });
    }
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      activeSubContract: { formData },
      dispatch,
    } = this.props;
    // 前端校验非空字段
    validateFieldsAndScroll((error, values) => {
      if (
        formData.endDate === null ||
        formData.startDate === null ||
        formData.signBuName === null ||
        formData.salesmanResName === null ||
        formData.deliResName === null ||
        formData.deliBuName === null ||
        formData.regionBuName === null ||
        formData.signDate === null ||
        formData.amt === null
      ) {
        createMessage({ type: 'warn', description: '带"*"号的不能为空，请返回子合同完善信息！' });
      } else {
        dispatch({
          type: `${DOMAIN}/saveSubContractDetail`,
          payload: { ...formData, remark: values.remark },
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      activeSubContract: { formData, ruleList = [], salesRegionBuDataSource = [] },
      form: { getFieldDecorator },
    } = this.props;
    const readOnly = true;

    const disabledBtn =
      loading.effects[`${DOMAIN}/querySubContractDetail`] ||
      loading.effects[`${DOMAIN}/saveSubContractDetail`];

    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      dataSource: ruleList,
      loading: loading.effects[`${DOMAIN}/query`],
      size: 'small',
      // scroll: {
      //   x: '120%',
      // },

      columns: [
        {
          title: '分配规则码',
          dataIndex: 'ruleNo',
          align: 'center',
        },
        {
          title: '利益分配角色',
          dataIndex: 'groupRoleDesc',
          align: 'center',
        },
        {
          title: '利益分配比例',
          dataIndex: 'groupPercent',
          align: 'center',
          render: value => `${value || 0}%`,
        },
        {
          title: '基于',
          dataIndex: 'groupBaseTypeDesc',
          align: 'center',
        },
        {
          title: '行来源类型',
          dataIndex: 'lineSourceDesc',
          align: 'center',
        },
        {
          title: '收益 BU/资源',
          dataIndex: 'gainerBuName',
          align: 'center',
        },
        {
          title: '收益占比',
          dataIndex: 'gainerIngroupPercent',
          align: 'center',
          width: 80,
          // required: true,
          render: value => `${value || 0}%`,
        },
        {
          title: '实际利益分配比例',
          dataIndex: 'allocationProportion',
          align: 'center',
          render: (value, allValues) =>
            `${value ||
              div(mul(allValues.groupPercent, allValues.gainerIngroupPercent || 0), 100)}%`,
        },
        {
          title: '预计分配额',
          dataIndex: 'expectDistAmt',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'agreeStatusDesc',
          align: 'center',
        },
        {
          title: '利益来源方',
          dataIndex: 'busifieldTypeDesc',
          align: 'center',
          render: value => value,
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'left',
          render: (value, row, index) => <Input disabled className="x-fill-100" value={value} />,
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSubmit}
          >
            提交
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/sale/contract/salesList')}
            //
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card className="tw-card-adjust" bordered={false}>
          <FieldList
            layout="horizontal"
            // legend={formatMessage({ id: `sys.system.basicInfo`, desc: '合同激活申请信息' })}
            legend="子合同激活申请信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            <Field
              name="contractNo"
              label="子合同编号"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.contractNo,
              }}
            >
              <Input disabled={readOnly} />
            </Field>
            <Field
              name="cname"
              label="子合同名称"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.cname,
              }}
            >
              <Input disabled={readOnly} />
            </Field>
            <Field
              name="signBuName"
              label="签单BU"
              required
              {...FieldListLayout}
              decorator={{
                initialValue: formData.signBuName,
              }}
            >
              <Selection.Columns
                disabled
                source={salesRegionBuDataSource}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                showSearch
              />
            </Field>

            <Field
              name="salesmanResName"
              label="销售负责人"
              required
              {...FieldListLayout}
              decorator={{
                initialValue: formData.salesmanResName,
              }}
            >
              <Selection.Columns
                disabled={readOnly}
                source={selectUsersWithBu}
                columns={[
                  { dataIndex: 'code', title: '编号', span: 10 },
                  { dataIndex: 'name', title: '名称', span: 14 },
                ]}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                showSearch
              />
            </Field>

            <Field
              name="deliBuName"
              label="交付BU"
              required
              decorator={{
                initialValue: formData.deliBuName,
              }}
              {...FieldListLayout}
            >
              <Selection.Columns
                disabled
                source={salesRegionBuDataSource}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                showSearch
              />
            </Field>

            <Field
              name="deliResName"
              label="交付负责人"
              required
              {...FieldListLayout}
              decorator={{
                initialValue: formData.deliResName,
              }}
            >
              <Selection.Columns
                disabled={readOnly}
                source={selectUsersWithBu}
                columns={[
                  { dataIndex: 'code', title: '编号', span: 10 },
                  { dataIndex: 'name', title: '名称', span: 14 },
                ]}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                showSearch
              />
            </Field>

            <Field
              name="regionBuName"
              label="销售区域BU"
              required
              decorator={{
                initialValue: formData.regionBuName,
              }}
              {...FieldListLayout}
            >
              <Selection.Columns
                disabled
                source={salesRegionBuDataSource}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                showSearch
              />
            </Field>

            <Field
              name="signDate"
              label="签订日期"
              required
              decorator={{
                initialValue: formData.signDate ? moment(formData.signDate) : null,
              }}
              {...FieldListLayout}
            >
              <DatePicker disabled format="YYYY-MM-DD" className="x-fill-100" placeholder=" " />
            </Field>

            <Field
              name="startDate"
              label="合同开始日期"
              decorator={{
                initialValue: formData.startDate ? moment(formData.startDate) : null,
              }}
              {...FieldListLayout}
              required
            >
              <DatePicker disabled format="YYYY-MM-DD" className="x-fill-100" placeholder=" " />
            </Field>

            <Field
              name="endDate"
              label="合同结束日期"
              required
              decorator={{
                initialValue: formData.endDate ? moment(formData.endDate) : null,
              }}
              {...FieldListLayout}
            >
              <DatePicker disabled format="YYYY-MM-DD" className="x-fill-100" placeholder=" " />
            </Field>

            <FieldLine label="含税总金额/税率" required {...FieldListLayout}>
              <Field
                name="amt"
                required
                decorator={{
                  initialValue: formData.amt,
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <InputNumber disabled={readOnly} className="x-fill-100" />
              </Field>
              <Field
                name="taxRate"
                decorator={{
                  initialValue: formData.taxRate,
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input disabled={readOnly} type="number" addonAfter="%" />
              </Field>
            </FieldLine>

            <Field
              name="notRateAmt"
              label="不含税金额"
              required
              {...FieldListLayout}
              decorator={{
                initialValue: formData.notRateAmt,
              }}
            >
              <Input disabled={readOnly} />
            </Field>

            <Field
              name="purchasingSum"
              label="相关项目采购"
              decorator={{
                initialValue: formData.purchasingSum,
              }}
              {...FieldListLayout}
            >
              <Input disabled={readOnly} />
            </Field>

            <Field
              name="extraAmt"
              label="其它应减费用"
              decorator={{
                initialValue: formData.extraAmt,
              }}
              {...FieldListLayout}
            >
              <Input disabled={readOnly} />
            </Field>

            <Field
              name="effectiveAmt"
              required
              label="有效合同额"
              decorator={{
                initialValue: formData.effectiveAmt,
              }}
              {...FieldListLayout}
            >
              <Input disabled={readOnly} />
            </Field>

            <Field
              name="grossProfit"
              label="可分配毛利"
              decorator={{
                initialValue: formData.grossProfit,
              }}
              {...FieldListLayout}
            >
              <Input disabled={readOnly} />
            </Field>

            <Field
              key="productId"
              name="productId"
              label="产品"
              decorator={{
                initialValue: formData.productId || undefined,
              }}
              {...FieldListLayout}
            >
              <Selection
                disabled
                source={() => selectBuProduct()}
                placeholder="请选择产品"
                showSearch
              />
            </Field>
            <Field
              key="attache"
              name="attache"
              label="附件"
              decorator={{
                initialValue: formData.attache,
                // rules: [
                //   {
                //     required:attache.requiredFlag,
                //     message:`请输入${attache.displayName}`,
                //   },
                // ],
              }}
              {...FieldListLayout}
            >
              <FileManagerEnhance
                api="/api/op/v1/contract/sub/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
              />
            </Field>
            <Field
              name="remark"
              label={formatMessage({ id: `sys.baseinfo.subjTemplate.remark`, desc: '备注' })}
              decorator={{
                initialValue: formData.remark,
              }}
              fieldCol={1}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
            >
              <Input.TextArea placeholder="请输入备注" rows={3} />
            </Field>
          </FieldList>

          <FieldList
            layout="horizontal"
            legend="子合同收益分配规则"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
            noReactive
          >
            <Table
              bordered
              rowKey="id"
              sortBy="id"
              dataSource={ruleList}
              loading={loading.effects[`${DOMAIN}/query`]}
              pagination={false}
              scroll={{ x: 1370 }}
              {...tableProps}
            />
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ActiveSub;
