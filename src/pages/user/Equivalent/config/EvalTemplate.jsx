import React, { Component } from 'react';
import { Form, Rate, Input, Divider } from 'antd';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';

const { TextArea } = Input;
const { Field } = FieldList;
const { Description } = DescriptionList;

// const EVAL_ENUM = {
//   attitude: 1, // 态度
//   timeliness: 2, // 及时性
//   professional: 3, // 专业度
//   satisfied: 4, // 客户满意度
//   teamwork: 5, // 团队协作
//   recommend: 6, // 资源推荐度
//   continued: 7, // 是否愿意继续合作
//   assignedDefiniton: 8, // 发包任务明确度
//   timelinessSettlement: 9, // 结算及时性
// };

const EVAL_TRANS = {
  1: 'attitude',
  2: 'timeliness',
  3: 'professional',
  4: 'satisfied',
  5: 'teamwork',
  6: 'recommend',
  7: 'continued',
  8: 'assignedDefiniton',
  9: 'timelinessSettlement',
};

const rateConfig = {
  allowClear: true,
  allowHalf: false,
  count: 5,
};
const defaultRating = 5;

const textAreaConfig = {
  rows: 3,
  placeholder: '不能超过500字',
};

const fieldLayout = {
  labelCol: { span: 6, xxl: 4 },
  wrapperCol: { span: 16, xxl: 18 },
};

@Form.create()
class EvalTemplate extends Component {
  renderField = () => {
    const {
      noReactive = false,
      form: { getFieldDecorator },
      formData = {
        attitude: undefined,
        timeliness: undefined,
        professional: undefined,
        satisfied: undefined,
        teamwork: undefined,
        recommend: undefined,
        continued: undefined,
        assignedDefiniton: undefined,
        timelinessSettlement: undefined,
      },
      banner,
      forms,
    } = this.props;

    return (
      <>
        <FieldList
          legend={banner}
          col={2}
          getFieldDecorator={getFieldDecorator}
          noReactive={noReactive}
        >
          <Field name="evalClass" label="评价类别" presentational {...fieldLayout}>
            {forms.evalClass}
          </Field>
          <Field name="evalClass" label="评价类型" presentational {...fieldLayout}>
            {forms.evalClass}
          </Field>
          <Field name="evalerResId" label="评价人" presentational {...fieldLayout}>
            {forms.evalerResName}
          </Field>
          <Field name="evaledResId" label="被评价人" presentational {...fieldLayout}>
            {forms.evaledResName}
          </Field>
          <Field
            name="evalComment"
            label="评语"
            decorator={{
              initialValue: forms.evalComment,
              rules: [{ max: 100, message: '不能超过100字' }],
            }}
            fieldCol={1}
            labelCol={{ span: 3, xxl: 2 }}
            wrapperCol={{ span: 20, xxl: 21 }}
          >
            <TextArea {...textAreaConfig} />
          </Field>
        </FieldList>
        <Divider dashed />
        <FieldList
          legend="评价明细"
          col={1}
          getFieldDecorator={getFieldDecorator}
          noReactive={noReactive}
        >
          <Field
            name="attitude"
            label="态度"
            decorator={{
              initialValue: formData.attitude || defaultRating,
              normalize: (value, prevValue, allValues) => {
                if (!value) return 1;
                return value;
              },
              rules: [],
            }}
            {...fieldLayout}
          >
            <Rate {...rateConfig} />
          </Field>
          <Field
            name="attitude_comment"
            label="简评"
            decorator={{
              initialValue: formData.attitude_comment,
              rules: [{ max: 100, message: '不能超过100字' }],
            }}
            {...fieldLayout}
          >
            <TextArea {...textAreaConfig} />
          </Field>
          <Field
            name="timeliness"
            label="及时性"
            decorator={{
              initialValue: formData.timeliness || defaultRating,
              normalize: (value, prevValue, allValues) => {
                if (!value) return 1;
                return value;
              },
              rules: [],
            }}
            {...fieldLayout}
          >
            <Rate {...rateConfig} />
          </Field>
          <Field
            name="timeliness_comment"
            label="简评"
            decorator={{
              initialValue: formData.timeliness_comment,
              rules: [{ max: 100, message: '不能超过100字' }],
            }}
            {...fieldLayout}
          >
            <TextArea {...textAreaConfig} />
          </Field>
          <Field
            name="professional"
            label="专业度"
            decorator={{
              initialValue: formData.professional || defaultRating,
              normalize: (value, prevValue, allValues) => {
                if (!value) return 1;
                return value;
              },
              rules: [],
            }}
            {...fieldLayout}
          >
            <Rate {...rateConfig} />
          </Field>
          <Field
            name="professional_comment"
            label="简评"
            decorator={{
              initialValue: formData.professional_comment,
              rules: [{ max: 100, message: '不能超过100字' }],
            }}
            {...fieldLayout}
          >
            <TextArea {...textAreaConfig} />
          </Field>
          <Field
            name="satisfied"
            label="客户满意度"
            decorator={{
              initialValue: formData.satisfied || defaultRating,
              normalize: (value, prevValue, allValues) => {
                if (!value) return 1;
                return value;
              },
              rules: [],
            }}
            {...fieldLayout}
          >
            <Rate {...rateConfig} />
          </Field>
          <Field
            name="satisfied_comment"
            label="简评"
            decorator={{
              initialValue: formData.satisfied_comment,
              rules: [{ max: 100, message: '不能超过100字' }],
            }}
            {...fieldLayout}
          >
            <TextArea {...textAreaConfig} />
          </Field>
          {/* <Field
            name="teamwork"
            label="团队协作"
            decorator={{
              initialValue: formData.teamwork || defaultRating,
              normalize: (value, prevValue, allValues) => {
                if (!value) return 1;
                return value;
              },
              rules: [],
            }}
            {...fieldLayout}
          >
            <Rate {...rateConfig} />
          </Field>
          <Field
            name="teamwork_comment"
            label="简评"
            decorator={{
              initialValue: formData.teamwork_comment,
              rules: [{ max: 100, message: '不能超过100字' }],
            }}
            {...fieldLayout}
          >
            <TextArea {...textAreaConfig} />
          </Field> */}
          <Field
            name="recommend"
            label="资源推荐度"
            decorator={{
              initialValue: formData.recommend || defaultRating,
              normalize: (value, prevValue, allValues) => {
                if (!value) return 1;
                return value;
              },
              rules: [],
            }}
            {...fieldLayout}
          >
            <Rate {...rateConfig} />
          </Field>
          <Field
            name="recommend_comment"
            label="简评"
            decorator={{
              initialValue: formData.recommend_comment,
              rules: [{ max: 100, message: '不能超过100字' }],
            }}
            {...fieldLayout}
          >
            <TextArea {...textAreaConfig} />
          </Field>
          <Field
            name="continued"
            label="是否愿意继续合作"
            decorator={{
              initialValue: formData.continued || defaultRating,
              normalize: (value, prevValue, allValues) => {
                if (!value) return 1;
                return value;
              },
              rules: [],
            }}
            {...fieldLayout}
          >
            <Rate {...rateConfig} />
          </Field>
          <Field
            name="continued_comment"
            label="简评"
            decorator={{
              initialValue: formData.continued_comment,
              rules: [{ max: 100, message: '不能超过100字' }],
            }}
            {...fieldLayout}
          >
            <TextArea {...textAreaConfig} />
          </Field>
          {/* <Field
            name="assignedDefiniton"
            label="发包任务明确度"
            decorator={{
              initialValue: formData.assignedDefiniton || defaultRating,
              normalize: (value, prevValue, allValues) => {
                if (!value) return 1;
                return value;
              },
              rules: [],
            }}
            {...fieldLayout}
          >
            <Rate {...rateConfig} />
          </Field>
          <Field
            name="assignedDefiniton_comment"
            label="简评"
            decorator={{
              initialValue: formData.assignedDefiniton_comment,
              rules: [{ max: 100, message: '不能超过100字' }],
            }}
            {...fieldLayout}
          >
            <TextArea {...textAreaConfig} />
          </Field>
          <Field
            name="timelinessSettlement"
            label="结算及时性"
            decorator={{
              initialValue: formData.timelinessSettlement || defaultRating,
              normalize: (value, prevValue, allValues) => {
                if (!value) return 1;
                return value;
              },
              rules: [],
            }}
            {...fieldLayout}
          >
            <Rate {...rateConfig} />
          </Field>
          <Field
            name="timelinessSettlement_comment"
            label="简评"
            decorator={{
              initialValue: formData.timelinessSettlement_comment,
              rules: [{ max: 100, message: '不能超过100字' }],
            }}
            {...fieldLayout}
          >
            <TextArea {...textAreaConfig} />
          </Field> */}
        </FieldList>
      </>
    );
  };

  renderDescription = () => {
    const { noReactive = false, list = [], forms } = this.props;
    return (
      <>
        <DescriptionList title="评价条目" col={2} noReactive>
          <Description term="评价类别">{forms.evalClass}</Description>
          <Description term="评价类型">{forms.evalType}</Description>
          <Description term="评价人">{forms.evalerResName}</Description>
          <Description term="被评价人">{forms.evaledResName}</Description>
          <Description term="评语">{forms.evalComment}</Description>
        </DescriptionList>
        <DescriptionList title="评价明细" col={1} noReactive={noReactive}>
          {list.map(item => {
            const { evalItemId, evalScore, evalComment } = item;
            return (
              <>
                <Description term={EVAL_TRANS[evalItemId]}>
                  <Rate {...rateConfig} value={evalScore} disabled />
                </Description>
                <Description term="简评">{evalComment}</Description>
              </>
            );
          })}
        </DescriptionList>
      </>
    );
  };

  render() {
    const { preview = false } = this.props;
    return <>{preview ? this.renderField() : this.renderDescription()}</>;
  }
}

export default EvalTemplate;
