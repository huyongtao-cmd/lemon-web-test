import React from 'react';
import { connect } from 'dva';
import { isEmpty, omit } from 'ramda';
import update from "immutability-helper";
import Loading from '@/components/production/basic/Loading';
import BusinessForm from '@/components/production/business/BusinessForm';
import { Form, Row, Col, } from 'antd';
import { WrappedFormUtils } from "antd/lib/form/Form";
import FormItem from "@/components/production/business/FormItem";
import Link from "@/components/production/basic/Link";
import confirm from '@/components/production/layout/Confirm';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import EditTable from '@/components/production/business/EditTable';
import Button from '@/components/production/basic/Button';
import { ColumnProps } from "antd/es/table";

import { genFakeId } from '@/utils/production/mathUtils';
import { fromQs } from '@/utils/production/stringUtil';
import DataTable from "@/components/production/business/DataTable";


interface Props {
    form: WrappedFormUtils;

    [propName: string]: any, // 额外属性,不添加这个, jsonObj 添加extra属性会报错

}

interface EditColumnProps<T> extends ColumnProps<T> {
    required?: boolean;

}

interface LocaleEditObject {
    id?: number;
    language?: string;
    message?: string;
}


const DOMAIN = "customSetting";

@connect(({ loading, dispatch, customSetting }: any) => ({
    loading: loading.effects[`${DOMAIN}/init`],
    dispatch,
    ...customSetting,
}))
// @ts-ignore
@Form.create({
    mapPropsToFields(props: any) {
        const { formData } = props;
        const fields: any = {};
        Object.keys(formData).forEach(key => {
            const tempValue = formData[key];
            if (Array.isArray(tempValue)) {
                tempValue.forEach((temp, index) => {
                    Object.keys(temp).forEach(detailKey => {
                        fields[`${key}[${index}].${detailKey}`] = Form.createFormField({ value: temp[detailKey] });
                    });

                })
            } else {
                fields[key] = Form.createFormField({ value: tempValue });
            }

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
            type: `${DOMAIN}/updateFormForEditTable`,
            payload: newFieldData,
        });
    },
})
class LocaleEdit extends React.PureComponent<Props, any> {

    state = {
        formMode: fromQs().mode,
    };

    constructor(props: Props) {
        super(props);
        // this.updateModelState({formMode:fromQs().mode});
    }

    componentDidMount() {

        this.callModelEffects("init");
        const { mode } = fromQs();
        this.updateModelState({ formMode: mode, })
    }

    componentWillMount(): void {
        this.callModelEffects("cleanState")
    }


    // 修改model层state
    updateModelState = (params: any) => {
        const { dispatch } = this.props;
        dispatch({
            type: `${DOMAIN}/updateState`,
            payload: params,
        });
    };

    // 调用model层异步方法
    callModelEffects = (method: string, params?: any) => {
        const { dispatch } = this.props;
        dispatch({
            type: `${DOMAIN}/${method}`,
            payload: params,
        });
    };

    onSelect = (selectedKeys: string[]) => {
        this.callModelEffects('handleSelectChange', { id: selectedKeys[0] });
    };

    onCheck = () => {

    };

    /**
     * 保存
     */
    handleSave = () => {
        const { form, formData, deleteKeys } = this.props;
        form.validateFieldsAndScroll((error, values) => {
            if (!error) {
                this.callModelEffects("save", { formData, deleteKeys })
            }
        }
        );
    };

    /**
     * 切换编辑模式
     */
    switchEdit = () => {
        this.callModelEffects("updateState", { formMode: "EDIT" })
        // this.setState({formMode:"EDIT"});
    };

    render() {
        const { form, formData, deleteKeys, formMode, dispatch, loading } = this.props;
        const details: LocaleEditObject[] = formData.details;

        return (
            <PageWrapper loading={loading}>
                <ButtonCard>
                    {formMode === 'EDIT' && <Button size="large" type="primary" onClick={this.handleSave}>保存</Button>}
                    {formMode === 'DESCRIPTION' && <Button size="large" type="primary" onClick={this.switchEdit}>编辑</Button>}

                </ButtonCard>
                <BusinessForm
                    title='用户自定义设置维护'
                    formData={formData}
                    formMode={formMode}
                >
                    <FormItem
                        fieldType="BaseInput"
                        label="设置项"
                        fieldKey="settingName"
                        required
                        form={form}
                    />

                    <FormItem
                        fieldType="BaseInput"
                        label="设置KEY"
                        fieldKey="settingKey"
                        required
                        form={form}
                    />

                    <FormItem
                        fieldType="BaseInput"
                        label="设置值"
                        fieldKey="settingValue"
                        required
                        form={form}
                    />

                    {/* <FormItem
                        fieldType="BaseInput"
                        label="当前租户"
                        fieldKey="tenantName"
                        required
                        form={form}
                        disabled
                    /> */}

                    <FormItem
                        fieldType="BaseSelect"
                        label="模块"
                        fieldKey="systemModule"
                        required
                        form={form}
                        parentKey="BUSINESS_MODULE"
                    />

                    <FormItem
                        fieldType="TenantSimpleSelect"
                        label="租户"
                        fieldKey="tenantId"
                        required
                        form={form}
                        descriptionField="tenantName"
                    />
                    {/* <FormItem
                        fieldType="BaseRadioSelect"
                        label="允许租户修改"
                        fieldKey="tenantEditableFlag"
                        required
                        form={form}
                        options={[{ value: true, label: "是" }, { value: false, label: "否" },]}
                    /> */}

                    <FormItem
                        fieldType="BaseInputTextArea"
                        label="备注"
                        fieldKey="remark"
                        form={form}
                    />

                </BusinessForm>
            </PageWrapper>
        );
    }
}

export default LocaleEdit;
