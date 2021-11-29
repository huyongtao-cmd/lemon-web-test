import React from 'react';
import { connect } from 'dva';

import Loading from '@/components/production/basic/Loading';
import BusinessForm from '@/components/production/business/BusinessForm';
import SearchForm from '@/components/production/business/SearchForm';
import { Form, Row, Col, } from 'antd';
import { WrappedFormUtils } from "antd/lib/form/Form";
import SearchFormItem from "@/components/production/business/SearchFormItem";
import Link from "@/components/production/basic/Link";
import confirm from '@/components/production/layout/Confirm';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import message from "@/components/production/layout/Message";
import {outputHandle} from "@/utils/production/outputUtil";

// @ts-ignore
import { systemSettingListPagingRq, systemSettingLogicalDeleteRq,systemSettingClearCache,systemSettingDetailByKey } from '@/services/production/system/systemSetting';
import router from "umi/router";
import {ColumnProps} from "antd/es/table";


interface Props {
    form: WrappedFormUtils;

    [propName: string]: any, // 额外属性,不添加这个, jsonObj 添加extra属性会报错

}


const DOMAIN = "systemSettingIndex";

@connect(({ loading, dispatch, systemSettingIndex }: any) => ({
    // treeLoading: loading.effects[`${DOMAIN}/init`],
    dispatch,
    ...systemSettingIndex,
}))
// @ts-ignore
@Form.create({
    mapPropsToFields(props: any) {
        const { formData } = props;
        const fields: any = {};
        Object.keys(formData).forEach(key => {
            fields[key] = Form.createFormField({ value: formData[key] });
        });
        return fields;
    },
})
class LocaleList extends React.PureComponent<Props, any> {


    componentDidMount() {

    }

    fetchData = async (params: object): Promise<DataOutput> => {
        const { response } = await systemSettingListPagingRq(params);
        return response.data;
    };

    deleteData = async (keys: any[]) => await systemSettingLogicalDeleteRq({ keys: keys.join(",") });


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




    renderSearchForm = () => {
        return (
            [<SearchFormItem
                key="systemModule"
                fieldType="BaseSelect"
                label="模块"
                fieldKey="systemModule"
                parentKey="BUSINESS_MODULE"
                defaultShow={true}
                advanced={false}
            />,
            <SearchFormItem
                key="settingName"
                fieldType="BaseInput"
                label="设置项"
                fieldKey="settingName"
                defaultShow={true}
                advanced={true}
            />,
            <SearchFormItem
                key="settingName"
                fieldType="BaseInput"
                label="设置KEY"
                fieldKey="settingKey"
                defaultShow={true}
                advanced={false}
            />,
            <SearchFormItem
                key="remark"
                fieldType="BaseInput"
                label="备注"
                fieldKey="remark"
                defaultShow={true}
                advanced={true}
            />,
                // <SearchFormItem
                //     key="tenantEditableFlag"
                //     fieldType="BaseSelect"
                //     label="允许租户修改"
                //     fieldKey="tenantEditableFlag"
                //     parentKey="COMMON:YES-OR-NO"
                //     defaultShow={true}
                // />,
                // <SearchFormItem
                //     key="containsTenantFlag"
                //     fieldType="BaseSelect"
                //     label="包含租户设置"
                //     fieldKey="containsTenantFlag"
                //     defaultShow={true}
                //     parentKey="COMMON:YES-OR-NO"
                // />
            ]
        );
    };

  /**
   * 清空后端缓存
   * @returns {Promise<any>}
   */
  clearCache = async () => {
    const { data } = await outputHandle(systemSettingClearCache);
    message({ type: 'success' });
  };

  /**
   * 清空后端缓存
   * @returns {Promise<any>}
   */
  getSystemSetting = async () => {
    const { data } = await outputHandle(systemSettingDetailByKey,{key:"systemSetting1"});
    message({ type: 'success',content:JSON.stringify(data) });
    console.log(data)
  };

    render() {
        const { form, treeLoading, formData, formMode, selectionList, ...rest } = this.props;

        const columns:ColumnProps<any>[] = [
            {
                title: '设置项',
                dataIndex: 'settingName',
                align: 'center',
                sorter: true,
                render: (value: any, row: any, index: number) => {
                    return <Link onClick={() => router.push(`/back/production/systemSettingEdit?id=${row.id}&mode=DESCRIPTION`)}>{value}</Link>
                }
            },
            {
                title: '模块',
                dataIndex: 'systemModuleDesc',
                align: 'center',
            },
            // {
            //     title: '租户',
            //     dataIndex: 'tenantName',
            //     align: 'center',
            //     ellipsis: true,
            // },
            {
                title: '设置KEY',
                dataIndex: 'settingKey',
                align: 'center',
            },
            {
                title: '设置值',
                dataIndex: 'settingValue',
                align: 'center',
            },
            // {
            //     title: '允许租户修改',
            //     align: 'center',
            //     dataIndex: 'tenantEditableFlag',
            //     ellipsis: true,
            //     render: (text: any, record: any) => (text == true ? '是' : '否'),
            // },
            {
                title: '备注',
                align: 'center',
                dataIndex: 'remark',
            },
        ];


        return (
            <PageWrapper>
              <ButtonCard>
                <Button onClick={this.clearCache}>清空缓存</Button>
                <Button onClick={this.getSystemSetting}>获取系统设置项</Button>
              </ButtonCard>
              <SearchTable
                  searchForm={this.renderSearchForm()}
                  defaultSearchForm={{}}
                  fetchData={this.fetchData}
                  columns={columns}
                  onAddClick={() => router.push("/back/production/systemSettingEdit?mode=EDIT")}
                  onEditClick={(data: any) => router.push(`/back/production/systemSettingEdit?id=${data.id}&mode=EDIT`)}
                  // onCopyClick={(data: any) => router.push(`/back/production/systemLocaleEdit?id=${data.id}&copy=true&mode=EDIT`)}
                  deleteData={this.deleteData}
                  defaultAdvancedSearch
              />
            </PageWrapper>
        );
    }
}

export default LocaleList;
