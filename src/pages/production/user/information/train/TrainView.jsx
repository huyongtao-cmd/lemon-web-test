// 框架类
import React, { Component } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';

// 产品化组件
import PageWrapper from '@/components/production/layout/PageWrapper';
import Button from '@/components/production/basic/Button';
import ButtonCard from '@/components/production/layout/ButtonCard';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import { fromQs } from '@/utils/production/stringUtil';
import { closeThenGoto } from '@/layouts/routerControl';
import { outputHandle } from '@/utils/production/outputUtil';

// 接口
import {
  informationDetail,
  trainInsert,
  trainOverAll,
  trainFindOne,
} from '@/services/production/user';

/***
 * 培训新增、详情、编辑
 */
@connect(({ user: { user } }) => ({
  user,
}))
@Form.create()
class TrainView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      loading: false,
      userId: '',
    };
  }

  componentDidMount() {
    const { id } = fromQs();
    id && this.loadData(id);
  }

  // 根据userId查询详情，选择姓名后自动带出已知信息
  infoDetail = userId => outputHandle(informationDetail, { id: userId });

  // 保存
  handleSave = async (id, cb) => {
    const { form } = this.props;
    const basic = await form.validateFields();
    const data = {
      ...basic,
    };
    // 有id为修改，没有id为新增
    let res;
    if (id) {
      res = await outputHandle(trainOverAll, { ...data, id });
    } else {
      res = await outputHandle(trainInsert, data);
    }
    cb(res);
  };

  // 详情
  loadData = async id => {
    const { formData } = this.state;
    this.setState({ loading: true });
    const res = await outputHandle(trainFindOne, { id });
    this.setState({
      formData: res.data,
      loading: false,
    });
  };

  render() {
    const { form } = this.props;
    const { mode } = fromQs();
    const { loading, formData, userId } = this.state;
    return (
      <PageWrapper loading={loading}>
        <ButtonCard>
          {mode === 'EDIT' && [
            <Button
              size="large"
              type="primary"
              onClick={async () => {
                const { id } = await fromQs();
                this.handleSave(id, () => {
                  closeThenGoto(`/hr/train/trainRecords?refresh=` + new Date().valueOf());
                });
              }}
            >
              保存
            </Button>,
          ]}
        </ButtonCard>

        <BusinessForm
          title="基本信息"
          form={form}
          formData={formData}
          formMode={mode}
          defaultColumnStyle={12}
        >
          <FormItem fieldType="BaseInput" label="课程名称" fieldKey="className" />

          <FormItem
            required
            fieldType="UserSimpleSelect"
            label="姓名"
            fieldKey="userId"
            descriptionRender={formData.userName}
            onChange={async value => {
              if (value) {
                const res = await this.infoDetail(value);
                form.setFieldsValue({
                  resNo: res.data.resNo,
                  ouId: res.data.ouId,
                  buId: res.data.buId,
                  baseCity: res.data.baseCity,
                  parentResId: res.data.parentResId,
                });
              } else {
                form.setFieldsValue({
                  resNo: '',
                  ouId: '',
                  buId: '',
                  baseCity: '',
                  parentResId: '',
                });
              }
            }}
          />

          <FormItem fieldType="BaseInput" label="员工编号" fieldKey="resNo" disabled />

          <FormItem
            fieldType="BaseAllOuSimpleSelect"
            label="所属公司"
            fieldKey="ouId"
            descriptionRender={formData.ouName}
            disabled
          />
          <FormItem
            fieldType="BuSimpleSelect"
            label="所属BU"
            fieldKey="buId"
            descriptionRender={formData.buName}
            disabled
          />
          <FormItem
            fieldType="BaseCustomSelect"
            label="Base地"
            fieldKey="baseCity"
            parentKey="CUS:CITY"
            disabled
          />
          <FormItem
            fieldType="ResSimpleSelect"
            label="直接主管"
            fieldKey="parentResId"
            descriptionRender={formData.parentName}
            disabled
          />
          <FormItem fieldType="BaseInput" label="课程类型" fieldKey="classType" />
          <FormItem fieldType="BaseDatePicker" label="课程日期" fieldKey="classDate" defaultShow />
          <FormItem fieldType="BaseInput" label="课程时长（分钟）" fieldKey="classTime" />
          <FormItem fieldType="BaseInput" label="费用（元）" fieldKey="classExpenses" />
          <FormItem
            fieldType="SupplierSimpleSelect"
            label="供应商"
            fieldKey="supplierId"
            descriptionRender={formData.supplierName}
          />
          <FormItem fieldType="BaseInputTextArea" label="备注" fieldKey="remark" />
        </BusinessForm>
      </PageWrapper>
    );
  }
}

export default TrainView;
