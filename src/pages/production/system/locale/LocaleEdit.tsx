import React from 'react';
import {connect} from 'dva';
import {isEmpty, omit} from 'ramda';
import update from "immutability-helper";
import BusinessForm from '@/components/production/business/BusinessForm';
import {Form,} from 'antd';
import {WrappedFormUtils} from "antd/lib/form/Form";
import FormItem from "@/components/production/business/FormItem";
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import EditTable from '@/components/production/business/EditTable';
import Button from '@/components/production/basic/Button';
import {ColumnProps} from "antd/es/table";

import {genFakeId} from '@/utils/production/mathUtils';
import {fromQs} from '@/utils/production/stringUtil';
import DataTable from "@/components/production/business/DataTable";


interface Props {
  form: WrappedFormUtils;

  [propName: string]: any, // 其它属性
}

interface EditColumnProps<T> extends ColumnProps<T> {
  required?: boolean;

}

interface LocaleEditObject {
  id?: number;
  language?: string;
  message?: string;
}


const DOMAIN = "systemLocaleEdit";

@connect(({loading, dispatch, systemLocaleEdit}: any) => ({
  loading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...systemLocaleEdit,
}))
// @ts-ignore
@Form.create({
  mapPropsToFields(props: any) {
    const {formData} = props;
    const fields: any = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      if (Array.isArray(tempValue)) {
        tempValue.forEach((temp, index) => {
          Object.keys(temp).forEach(detailKey => {
            fields[`${key}[${index}].${detailKey}`] = Form.createFormField({value: temp[detailKey]});
          });

        })
      } else {
        fields[key] = Form.createFormField({value: tempValue});
      }

    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    console.log(changedValues)
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = {[name]: value};

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class LocaleEdit extends React.PureComponent<Props, any> {

  state = {
    formMode: fromQs().mode,
  };

  constructor(props:Props){
    super(props);
    // this.updateModelState({formMode:fromQs().mode});
  }

  componentDidMount() {
    this.callModelEffects("init");
    const { mode } = fromQs();
    this.updateModelState({formMode: mode,})
  }

  componentWillUnmount(): void {
    this.callModelEffects("cleanState")
  }

  // 修改model层state
  updateModelState = (params: any) => {
    const {dispatch} = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  // 调用model层异步方法
  callModelEffects = (method: string, params?: any) => {
    const {dispatch} = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  onSelect = (selectedKeys: string[]) => {
    this.callModelEffects('handleSelectChange', {id: selectedKeys[0]});
  };

  onCheck = () => {

  };

  /**
   * 保存
   */
  handleSave = () => {
    const {form, formData,deleteKeys} = this.props;
    form.validateFieldsAndScroll((error, values) => {
        if (!error) {
          this.callModelEffects("save", {formData,deleteKeys})
        }
      }
    );
  };

  /**
   * 切换编辑模式
   */
  switchEdit = () => {
    this.callModelEffects("updateState", {formMode: "EDIT"})
    // this.setState({formMode:"EDIT"});
  };

  render() {
    const {form, formData, deleteKeys,formMode, dispatch,loading } = this.props;
    // const {formMode, } = this.state;


    const editColumns: EditColumnProps<LocaleEditObject>[] = [
      {
        title: '语言',
        dataIndex: 'language',
        required: true,
        render: (text: any, record: LocaleEditObject, index: number) => {
          return (
            <FormItem
              form={form}
              fieldType="BaseSelect"
              fieldKey={`details[${index}].language`}
              parentKey="SYSTEM_LANGUAGE"
              required
            />
          );
        }
      },
      {
        title: '名称',
        dataIndex: 'message',
        required: true,
        render: (text: any, record: LocaleEditObject, index: number) => {
          return (
            <FormItem
              form={form}
              fieldType="BaseInputTextArea"
              fieldKey={`details[${index}].message`}
              required
            />
          );
        }
      },
    ];


    // const descColumns = editColumns.map((column:object)=>omit(['required','render'],column))
    const descriptionColumns: ColumnProps<LocaleEditObject>[] = [
      {
        title: '语言',
        dataIndex: 'language',
      },
      {
        title: '名称',
        dataIndex: 'message',
      },
    ];

    const details: LocaleEditObject[] = formData.details;

    return (
      <PageWrapper loading={loading}>
        <ButtonCard>
          {formMode === 'EDIT' && <Button size="large" type="primary" onClick={this.handleSave}>保存</Button>}
          {formMode === 'DESCRIPTION' && <Button size="large" type="primary" onClick={this.switchEdit}>编辑</Button>}
        </ButtonCard>
        <BusinessForm
          title='国际化'
          formData={formData}
          formMode={formMode}
        >
          <FormItem
            fieldType="BaseInput"
            label="编码"
            fieldKey="localeKey"
            required
            form={form}
          />

          <FormItem
            fieldType="BaseInput"
            label="默认名称"
            fieldKey="defaultName"
            required
            form={form}
          />

          <FormItem
            fieldType="BaseInputTextArea"
            label="备注"
            fieldKey="remark"
            form={form}
          />

        </BusinessForm>

        {formMode === 'EDIT' &&
        <EditTable<LocaleEditObject>
          form={form}
          columns={editColumns}
          dataSource={details}
          onAddClick={
            () => {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  details: update(details, {
                    $push: [
                      {
                        id: genFakeId(-1),
                      },
                    ],
                  })
                },
              });
            }
          }
          onCopyClick={
            (copied) => {
              const newDataSource = update(details, {
                $push: copied.map(item => ({
                  ...item,
                  id: genFakeId(-1),
                })),
              });
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  details: newDataSource,
                },
              });
            }
          }
          onDeleteConfirm={
            (keys) => {
              const newDataSource = details.filter(row => keys.indexOf(row.id) < 0);
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  details: newDataSource,
                },
              });
              this.updateModelState({deleteKeys:[...deleteKeys, ...keys]})
            }
          }
        />
        }

        {formMode === 'DESCRIPTION' &&
        <DataTable<LocaleEditObject>
          columns={descriptionColumns}
          dataSource={details}
          prodSelection={false}

        />
        }

      </PageWrapper>
    );
  }
}

export default LocaleEdit;
