import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input } from 'antd';
import AsyncSelect from '@/components/common/AsyncSelect';
import { queryUdc } from '@/services/gen/app';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { UdcSelect } from '@/pages/gen/field';

const { Field } = FieldList;

const fieldLabels = {
  regionCode: '管理区域',
  buCat1: '类别1',
  buCat2: '类别2',
  buCat3: '类别3',
  buCat4: '类别4',
  buCat5: '类别5',
  buCat6: '类别6',
  buCat7: '类别7',
  buCat8: '类别8',
  buCat9: '类别9',
  buCat10: '类别10',
  buCat11: '类别11',
  buCat12: '类别12',
  buCat13: '类别13',
  buCat14: '类别14',
  buCat15: '类别15',
  buCat16: '类别16',
  buCat17: '类别17',
  buCat18: '类别18',
  buCat19: '类别19',
  buCat20: '类别20',
};

const DOMAIN = 'orgbu';

@connect(({ loading, orgbu }) => ({
  loading,
  orgbu,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateCats`,
      payload: { key, value },
    });
  },
})
class BuCatsInfo extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { buId } = fromQs();
    dispatch({
      type: `${DOMAIN}/findCats`,
      payload: buId,
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      orgbu: { catData },
    } = this.props;
    return (
      <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
        <Field
          name="regionCodeDesc"
          label={fieldLabels.regionCode}
          decorator={{
            initialValue: catData.regionCodeDesc,
          }}
        >
          <Input disabled />
        </Field>

        <Field
          name="settleTypeDesc"
          label="结算类型码"
          decorator={{
            initialValue: catData.settleTypeDesc,
            rules: [{ required: false, message: '请选择结算类型码' }],
          }}
        >
          <Input disabled />
        </Field>

        <Field
          name="buCat1"
          label={fieldLabels.buCat1}
          decorator={{
            initialValue: catData.buCat1,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT1').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat2"
          label={fieldLabels.buCat2}
          decorator={{
            initialValue: catData.buCat2,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT2').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat3"
          label={fieldLabels.buCat3}
          decorator={{
            initialValue: catData.buCat3,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT3').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat4"
          label={fieldLabels.buCat4}
          decorator={{
            initialValue: catData.buCat4,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT4').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat5"
          label={fieldLabels.buCat5}
          decorator={{
            initialValue: catData.buCat5,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT5').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat6"
          label={fieldLabels.buCat6}
          decorator={{
            initialValue: catData.buCat6,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT6').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat7"
          label={fieldLabels.buCat7}
          decorator={{
            initialValue: catData.buCat7,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT7').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat8"
          label={fieldLabels.buCat8}
          decorator={{
            initialValue: catData.buCat8,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT8').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat9"
          label={fieldLabels.buCat9}
          decorator={{
            initialValue: catData.buCat9,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT9').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat10"
          label={fieldLabels.buCat10}
          decorator={{
            initialValue: catData.buCat10,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT10').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat11"
          label={fieldLabels.buCat11}
          decorator={{
            initialValue: catData.buCat11,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT11').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat12"
          label={fieldLabels.buCat12}
          decorator={{
            initialValue: catData.buCat12,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT12').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat13"
          label={fieldLabels.buCat13}
          decorator={{
            initialValue: catData.buCat13,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT13').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat14"
          label={fieldLabels.buCat14}
          decorator={{
            initialValue: catData.buCat14,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT14').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat15"
          label={fieldLabels.buCat15}
          decorator={{
            initialValue: catData.buCat15,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT15').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat16"
          label={fieldLabels.buCat16}
          decorator={{
            initialValue: catData.buCat16,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT16').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat17"
          label={fieldLabels.buCat17}
          decorator={{
            initialValue: catData.buCat17,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT17').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat18"
          label={fieldLabels.buCat18}
          decorator={{
            initialValue: catData.buCat18,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT18').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat19"
          label={fieldLabels.buCat19}
          decorator={{
            initialValue: catData.buCat19,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT19').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>

        <Field
          name="buCat20"
          label={fieldLabels.buCat20}
          decorator={{
            initialValue: catData.buCat20,
          }}
        >
          <AsyncSelect
            source={() => queryUdc('ORG.BU_CAT20').then(resp => resp.response)}
            placeholder="请选择类别码"
          />
        </Field>
      </FieldList>
    );
  }
}

export default BuCatsInfo;
