import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
import { Button, Card, DatePicker, Input, Divider } from 'antd';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { Selection } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import { selectBus } from '@/services/org/bu/bu';

const { Field, FieldLine } = FieldList;

// const DOMAIN = 'platResProfilePersonel';

@connect(({ loading, platResDetail, dispatch }) => ({
  loading,
  platResDetail,
  dispatch,
}))
@mountToTab()
class Personnel extends PureComponent {
  componentDidMount() {}

  render() {
    const {
      loading,
      personnelData,
      domain,
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${domain}/query`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList
            layout="horizontal"
            legend="人事标签"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="label1"
              label="HR统计部门"
              decorator={{
                initialValue: personnelData.label1,
              }}
            >
              <Selection source={() => selectBus()} placeholder="请选择HR统计部门" />
            </Field>
            <Field
              name="label2"
              label="工作类别"
              decorator={{
                initialValue: personnelData.label2,
              }}
            >
              <Selection.UDC code="RES:WORK_TYPE" placeholder="请选择工作类别" />
            </Field>
            <Field
              name="label3"
              label="人才类型"
              decorator={{
                initialValue: personnelData.label3,
              }}
            >
              <Selection.UDC code="RES:RES_TYPE3" placeholder="请选择人才类型" />
            </Field>
            <Field
              name="label4"
              label="主工作产品"
              decorator={{
                initialValue: personnelData.label4,
              }}
            >
              <Selection.UDC code="RES:MAIN_WORK_PROD" placeholder="请选择主工作产品" />
            </Field>
            <Field
              name="label5"
              label="涉及模块"
              decorator={{
                initialValue: personnelData.label5,
              }}
            >
              <Input placeholder="涉及模块" />
            </Field>
            <Field
              name="label6"
              label="辅工作产品"
              decorator={{
                initialValue: personnelData.label6,
              }}
            >
              <Selection.UDC code="RES:MAIN_WORK_PROD" placeholder="请选择辅工作产品" />
            </Field>
            <Field
              name="label7"
              label="辅产品涉及模块"
              decorator={{
                initialValue: personnelData.label7,
              }}
            >
              <Input placeholder="辅产品涉及模块" />
            </Field>
            <Field
              name="label8"
              label="标签8"
              decorator={{
                initialValue: personnelData.label8,
              }}
            >
              <Input placeholder="标签8" />
            </Field>
            <Field
              name="label9"
              label="标签9"
              decorator={{
                initialValue: personnelData.label9,
              }}
            >
              <Input placeholder="标签9" />
            </Field>
            <Field
              name="label10"
              label="标签10"
              decorator={{
                initialValue: personnelData.label10,
              }}
            >
              <Input placeholder="标签10" />
            </Field>
          </FieldList>

          <Divider dashed />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Personnel;
