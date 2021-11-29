import React from 'react';
import { connect } from 'dva';

import Loading from '@/components/production/basic/Loading';
import BusinessForm from '@/components/production/business/BusinessForm';
import TreeSearch from '@/components/production/business/TreeSearch';
import { Form, Row, Col, Button } from 'antd';
import { isEmpty } from 'ramda';
import {WrappedFormUtils} from "antd/lib/form/Form";
import FormItem from "@/components/production/business/FormItem";
import Link from "@/components/production/basic/Link";
import confirm from '@/components/production/layout/Confirm';
import PageWrapper from "@/components/production/layout/PageWrapper";
import Card from "@/components/production/layout/Card";
import BasicSelect, {BaseSelectProps} from "@/components/production/basic/BaseSelect";
import {outputHandle, OutputProps} from "@/utils/production/outputUtil";

// @ts-ignore
import {tenantSelectPaging} from '@/services/production/common/select';
import BaseSelect from "@/components/production/basic/BaseSelect";
import ButtonCard from "@/components/production/layout/ButtonCard";
import message from "@/components/production/layout/Message";
// @ts-ignore
import {customSelectionClearCache,} from '@/services/production/system';


interface Props {
  form: WrappedFormUtils;
  [propName: string]: any,
}

const DOMAIN = "customSelectionIndex";

@connect(({ loading, dispatch, customSelectionIndex }:any) => ({
  treeLoading:loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...customSelectionIndex,
}))
// @ts-ignore
@Form.create({
  mapPropsToFields(props:any) {
    const { formData } = props;
    const fields:any = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField({ value: formData[key] });
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
class CustomSelectionIndex extends React.PureComponent<Props, any> {

  componentDidMount() {
    this.callModelEffects("init");
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
  callModelEffects = (method:string, params?:any) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  onSelect = (selectedKeys: string[])=>{
    this.callModelEffects('handleSelectChange',{id:selectedKeys[0]});
  };

  onCheck = ()=>{

  };

  fetchTenantData = async ():Promise<Array<BaseSelectProps>> => {
    const output: OutputProps = await outputHandle(tenantSelectPaging, {limit:0});
    return output.data.rows.map((item: any) => ({id:item.id,value: item.id, title: `${item.tenantName}(${item.tenantCode})`}));
  };

  /**
   * 清空后端缓存
   * @returns {Promise<any>}
   */
  clearCache = async () => {
    const { data } = await outputHandle(customSelectionClearCache);
    message({ type: 'success' });
  };

  render() {
    const { form, treeLoading,formData,formMode,selectionList, currentTenantId, } = this.props;

    let extra:Array<object> = [];
    if (formMode === "EDIT") {
      extra = extra.concat([
        <Link
          key="SAVE"
          onClick={()=>{
            form.validateFieldsAndScroll((error, values) => {
              if (!error) {
                this.callModelEffects("updateForm",values);
                this.callModelEffects("save",{})
              }
            });
          }}
        >
          保存
        </Link>,
      ]);
    } else {
      extra = extra.concat([
        <Link
          key="EDIT"
          disabled={!formData.id}
          onClick={()=>{
            this.updateModelState({formMode:"EDIT"})
          }}
        >
          编辑
        </Link>,
        ' | ',
        <Link
          key="DELETE"
          disabled={!formData.id}
          onClick={()=>{
            confirm({
              onOk: ()=> {
                this.callModelEffects("delete",{keys:[formData.id].join(",")})
              }
            });
          }}
        >
          删除
        </Link>,
        ' | ',
        <Link
          key="NEW"
          onClick={() => {
            this.updateModelState({formMode:"EDIT",formData:{}})
          }}
        >
          新增
        </Link>,
      ]);
    }

    return (
      <PageWrapper>
        <ButtonCard>
          <Button onClick={this.clearCache}>清空缓存</Button>
        </ButtonCard>
        <Card>
          <Row gutter={5}>
            <Col span={2} style={{textAlign:"right",lineHeight:"32px"}}>租户:</Col>
            <Col span={10}>
              <BaseSelect
                value={currentTenantId}
                onChange={value => {
                  this.updateModelState({currentTenantId:value});
                  this.callModelEffects("init",{currentTenantId:value});
                }}
                allowClear={false}
                fetchData={this.fetchTenantData}
                descList={[{value:"0",title:"系统基础"}]}
              />
            </Col>
            <Col span={12} />
          </Row>
        </Card>

        <Row>
          <Col span={6}>
            {!treeLoading ? (
              <TreeSearch
                checkable={false}
                showSearch
                options={selectionList}
                parentId={null}
                onSelect={this.onSelect}
                onCheck={this.onCheck}
              />
            ) : (
              <Loading />
            )}
          </Col>
          <Col span={18}>
            <BusinessForm
              form={form}
              title='选择项'
              formData={formData}
              formMode={formMode}
              extra={extra}
              // defaultColumnStyle={24}
            >
              <FormItem
                fieldType="BaseInput"
                label="名称"
                fieldKey="selectionName"
                required
                form={form}
              />

              <FormItem
                fieldType="BaseInput"
                label="KEY"
                fieldKey="selectionKey"
                required
                form={form}
              />


              <FormItem
                fieldType="BaseInput"
                label="选择项值"
                fieldKey="selectionValue"
                required
                form={form}
              />

              <FormItem
                fieldType="BaseInput"
                label="名称国际化"
                question="输入国际化码,国际化内容请到国际化功能维护"
                fieldKey="selectionNameLocale"
                form={form}
              />

              <FormItem
                fieldType="BaseTreeSelect"
                label="上级"
                fieldKey="parentId"
                required
                form={form}
                showSearch
                options={selectionList}
                parentId={1}
                // parentKey="ROOT"
                multiple={false}
              />

              <FormItem
                fieldType="BaseInputNumber"
                label="排序"
                fieldKey="sortNo"
                form={form}
              />

              <FormItem
                fieldType="TenantSimpleSelect"
                // fieldType="BaseInputHidden"
                // visible={false}
                label="租户"
                fieldKey="tenantId"
                required
                descriptionField='tenantName'
                descList={[{value:formData.tenantId,title:formData.tenantName}]}
              />

              {/* <FormItem
                // fieldType="BaseSwitch"
                fieldType="BaseInputHidden"
                // visible={false}
                label="允许租户编辑"
                fieldKey="tenantEditableFlag"
                initialValue={false}
              /> */}

              <FormItem
                fieldType="BaseInputTextArea"
                // initialValue={this.state.formData.remark}
                label="备注"
                fieldKey="remark"
                form={form}
              />
               
               <FormItem
                fieldType="BaseInput"
                label="拓展字段1"
                fieldKey="extVarchar1"
                form={form}
              />

               <FormItem
                fieldType="BaseInput"
                label="拓展字段2"
                fieldKey="extVarchar2"
                form={form}
              />

              <FormItem
                fieldType="BaseInput"
                label="拓展字段3"
                fieldKey="extVarchar3"
                form={form}
              />

               <FormItem
                fieldType="BaseInput"
                label="拓展字段4"
                fieldKey="extVarchar4"
                form={form}
              />

               <FormItem
                fieldType="BaseInput"
                label="拓展字段5"
                fieldKey="extVarchar5"
                form={form}
              />

               <FormItem
                fieldType="BaseInput"
                label="拓展字段6"
                fieldKey="extVarchar6"
                form={form}
              />

              <FormItem
                fieldType="BaseInput"
                label="拓展字段7"
                fieldKey="extVarchar7"
                form={form}
              />

               <FormItem
                fieldType="BaseInput"
                label="拓展字段8"
                fieldKey="extVarchar8"
                form={form}
              />
              
              <FormItem
                fieldType="BaseInput"
                label="拓展字段9"
                fieldKey="extVarchar9"
                form={form}
              />
            </BusinessForm>
          </Col>
        </Row>
      </PageWrapper>
    );
  }
}

export default CustomSelectionIndex;
