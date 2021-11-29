import React from 'react';
import { connect } from 'dva';

import { Form, } from 'antd';
import {WrappedFormUtils} from "antd/lib/form/Form";
import SearchFormItem from "@/components/production/business/SearchFormItem";
import Link from "@/components/production/basic/Link";
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import SearchTable,{DataOutput} from '@/components/production/business/SearchTable';

// @ts-ignore
import LocaleModal from './LocaleModal'

// @ts-ignore
import {systemLocaleListPaging,systemLocaleLogicalDelete} from '@/services/production/system';
import router from "umi/router";
import {ColumnProps} from "antd/es/table";


interface Props {
  form: WrappedFormUtils;

  [propName: string]: any, // 额外属性,不添加这个, jsonObj 添加extra属性会报错

}


const DOMAIN = "systemLocaleList";

@connect(({ loading, dispatch, systemSelectionIndex }:any) => ({
  treeLoading:loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...systemSelectionIndex,
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
})
class LocaleList extends React.PureComponent<Props, any> {

  state = {
    formMode:'EDIT',
    visible:false,
    formData:{
      parentId:3,
      parentIdDescList:[{id:3,title:"系统安全"}],
      selectionValue:"selectionValue",
      sortNo:1,
      remark:"这是备注",
    },
  };

  componentDidMount() {
    // this.callModelEffects("init")
  }

  fetchData = async (params:object):Promise<DataOutput> => {
    const {response} = await systemLocaleListPaging(params);
    return response.data;
  };

  deleteData = async (keys:any[]) => systemLocaleLogicalDelete({keys:keys.join(",")});


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
    this.setState({
      visible:true
    })
  };

  renderSearchForm = ()=>{
    return (

        [<SearchFormItem
          key="localeKey"
          fieldType="BaseInput"
          label="编码"
          fieldKey="localeKey"
          defaultShow={true}
          advanced={true}
        />,
        <SearchFormItem
          key="defaultName"
          fieldType="BaseInput"
          label="默认名称"
          fieldKey="defaultName"
          defaultShow={false}
          advanced={true}
        />]

    );
  };

  handleCencel = () => {
    this.setState({
      visible: false
    })
  };

  render() {
    const { form, treeLoading,formData,formMode,selectionList, ...rest } = this.props;

    const columns:ColumnProps<any>[] = [
      {
        title: '编码',
        dataIndex: 'localeKey',
        sorter: true,
        render:(value:any, row:any, index:number) => {
          return <Link onClick={() => router.push(`/back/production/systemLocaleEdit?id=${row.id}&mode=DESCRIPTION`)}>{value}</Link>
        }
      },
      {
        title: '默认名称',
        dataIndex: 'defaultName',
        sorter: true,
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];


    return (
      <PageWrapper>
        <ButtonCard>
          <Button type="primary" size="large" onClick={this.onCheck}>按语言完善</Button>
        </ButtonCard>
        <LocaleModal visible={this.state.visible} handleCencel={this.handleCencel}/>
        <SearchTable
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={columns}
          onAddClick={() => router.push("/back/production/systemLocaleEdit?mode=EDIT")}
          onEditClick={(data:any) => router.push(`/back/production/systemLocaleEdit?id=${data.id}&mode=EDIT`)}
          onCopyClick={(data:any) => router.push(`/back/production/systemLocaleEdit?id=${data.id}&copy=true&mode=EDIT`)}
          deleteData={this.deleteData}
          defaultAdvancedSearch
        />
      </PageWrapper>
    );
  }
}

export default LocaleList;
