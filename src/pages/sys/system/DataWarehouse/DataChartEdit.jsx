// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import {
  Button,
  Card,
  Input,
  Select,
  Form,
  InputNumber,
  Tooltip,
  Checkbox,
  TreeSelect,
  Switch,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { Selection, DatePicker } from '@/pages/gen/field';
import router from 'umi/router';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const DOMAIN = 'dataChartEdit';

@connect(({ loading, dataChartEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  ...dataChartEdit,
  dispatch,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField(formData[key]);
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };
    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class DataChartEdit extends PureComponent {
  componentDidMount() {
    const { dispatch, formData } = this.props;
    const param = fromQs();
    if (param.id) {
      // 编辑模式
      this.fetchData(param);
    } else {
      // 新增模式
      dispatch({
        type: `${DOMAIN}/clearForm`,
      });
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { editorContent: '' },
      });
    }
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id: params.id },
    });
  };

  handleSave = () => {
    const { form, dispatch, formData } = this.props;
    const copyObj = {};
    const param = fromQs();
    if (param.copy) {
      copyObj.id = undefined;
    }

    form.validateFields((error, values) => {
      if (error) {
        return;
      }

      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          ...formData,
          ...values,
          ...copyObj,
        },
      });
    });
  };

  render() {
    const {
      loading,
      formData,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;

    const param = fromQs();

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            loading={loading}
            onClick={this.handleSave}
          >
            保存
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="chartName"
              label="名称"
              decorator={{
                initialValue: formData.chartName,
                rules: [{ required: true, message: '请输入' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="chartNo"
              label="编号"
              decorator={{
                initialValue: formData.chartNo,
                rules: [{ required: true, message: '请输入' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="presentNo"
              label="数据展现编号"
              decorator={{
                initialValue: formData.presentNo,
                rules: [{ required: true, message: '请输入' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="chartTitle"
              label="图表标题"
              decorator={{
                initialValue: formData.chartTitle,
                rules: [{ required: true, message: '请输入' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="chartIcon"
              label="图表图标"
              decorator={{
                initialValue: formData.chartIcon,
                rules: [{ required: false, message: '请输入' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="chartType"
              label="图表类型"
              decorator={{
                initialValue: formData.chartType,
                rules: [{ required: true, message: '请输入' }],
              }}
            >
              <Selection.UDC code="COM:DATA_CHART_TYPE" placeholder="请选择" />
            </Field>

            <Field
              name="keyColumn"
              label="键字段"
              decorator={{
                initialValue: formData.keyColumn,
                rules: [{ required: false, message: '请输入' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="valueColumn"
              label="值字段"
              decorator={{
                initialValue: formData.valueColumn,
                rules: [{ required: false, message: '请输入' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="transposeFlag"
              label="坐标轴旋转"
              decorator={{
                valuePropName: 'checked',
                initialValue: formData.transposeFlag || false,
                rules: [{ required: false, message: '请输入' }],
              }}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" value={formData.transposeFlag} />
            </Field>

            <Field
              name="dimensionColumn"
              label="统计维度字段"
              decorator={{
                initialValue: formData.dimensionColumn,
                rules: [{ required: false, message: '请输入' }],
              }}
            >
              <Input className="x-fill-100" />
            </Field>

            <Field
              name="showFlag"
              label="是否展示"
              decorator={{
                valuePropName: 'checked',
                initialValue: formData.showFlag || true,
                rules: [{ required: false, message: '请输入' }],
              }}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
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

          <br />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DataChartEdit;
