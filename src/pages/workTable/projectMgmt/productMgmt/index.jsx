import React from 'react';
import { connect } from 'dva';
import { Form, Modal } from 'antd';
import router from 'umi/router';
import { isEmpty } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import FormItem from '@/components/production/business/FormItem';
import EditTable from '@/components/production/business/EditTable';
import Link from '@/components/production/basic/Link';
import PageWrapper from '@/components/production/layout/PageWrapper';
import { createConfirm } from '@/components/core/Confirm';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import createMessage from '@/components/core/AlertMessage';
import { genFakeId } from '@/utils/production/mathUtils';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';
import update from 'immutability-helper';
import { remindString } from '@/components/production/basic/Remind';

// @ts-ignore
import {
  productManagementaPgingRq,
  productManagementDeleteRq,
  productManagementPartialRq,
} from '@/services/workbench/project';
import { buSelectPaging } from '@/services/production/common/select';

const DOMAIN = 'productMgmtList';

@connect(({ loading, dispatch, productMgmtList }) => ({
  loading,
  dispatch,
  ...productMgmtList,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      if (Array.isArray(tempValue)) {
        tempValue.forEach((temp, index) => {
          Object.keys(temp).forEach(detailKey => {
            fields[`${key}[${index}].${detailKey}`] = Form.createFormField({
              value: temp[detailKey],
            });
          });
        });
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
class ProductMgmtList extends React.PureComponent {
  state = {
    visible: false,
    departmentList: [],
  };

  componentDidMount() {
    // this.callModelEffects("init")
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PRODUCT_TABLE' },
    });
  }

  fetchData = async params => {
    const { response } = await productManagementaPgingRq(params);
    return response.data;
  };

  //请求部门
  department = async queryParam => {
    const output = await outputHandle(buSelectPaging, { ...queryParam, limit: 0 });
    this.setState({
      departmentList: output.data.rows.map(item => ({
        ...item,
        id: item.id,
        value: item.id,
        title: `${item.buName}`,
      })),
    });
  };

  deleteData = async keys =>
    outputHandle(productManagementDeleteRq, { ids: keys.join(',') }, undefined, false);

  changeStatus = async parmars => {
    const { response } = await productManagementPartialRq(parmars);
    return response.data;
  };

  handleOk = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      formData: { dataList },
    } = this.props;
    if (isEmpty(dataList)) {
      createMessage({
        type: 'warn',
        description: `相关部门项目明细不能为空！`,
      });
      return;
    }

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { relatedProductId, productName, inchargeCompany } = this.state;
        const tt = dataList.map(v => ({
          ...v,
          submit: true,
          relatedProductId,
          productName,
          inchargeCompany,
          projectName: `${productName || ''}-${v.buName || ''}项目`,
        }));

        dispatch({
          type: `${DOMAIN}/projectManagementAllApprove`,
          payload: tt,
        }).then(res => {
          this.setState({
            visible: false,
          });
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: { dataList: [] },
          });
        });
      }
    });
  };

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      formData: { dataList },
      dispatch,
    } = this.props;

    const newDataSource = dataList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { dataList: newDataSource },
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  renderColumns = () => {
    const { pageConfig } = this.props;

    const fields = [
      {
        title: '产品编号',
        key: 'productNo',
        dataIndex: 'productNo',
        align: 'center',
        sorter: true,
        render: (value, row) => (
          <Link
            onClick={() =>
              router.push(`/workTable/projectMgmt/productMgmt/detail?id=${row.id}&mode=DESCRIPTION`)
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '产品名称',
        key: 'productName',
        dataIndex: 'productName',
        align: 'center',
      },
      {
        title: '产品大类',
        key: 'productClass1',
        dataIndex: 'productClass1Desc',
        align: 'center',
      },
      {
        title: '产品小类',
        key: 'productClass2',
        dataIndex: 'productClass2Desc',
        align: 'center',
      },
      {
        title: '所属公司',
        key: 'inchargeCompany',
        dataIndex: 'inchargeCompanyDesc',
        align: 'center',
      },
      {
        title: '所属部门',
        key: 'inchargeBuId',
        dataIndex: 'inchargeBuIdDesc',
        align: 'center',
      },
      {
        title: '标签',
        key: 'productTag',
        dataIndex: 'productTag',
        align: 'center',
      },
      {
        title: '状态',
        key: 'productStatus',
        dataIndex: 'productStatusDesc',
        align: 'center',
      },
      {
        title: '创建人',
        key: 'createUserId',
        dataIndex: 'createUserIdDesc',
        align: 'center',
      },
      {
        title: '可配置字段1',
        key: 'configurableField1',
        dataIndex: 'configurableField1',
        align: 'center',
      },
      {
        title: '可配置字段2',
        key: 'configurableField2',
        dataIndex: 'configurableField2',
        align: 'center',
      },
      {
        title: '可配置字段3',
        key: 'configurableField3',
        dataIndex: 'configurableField3',
        align: 'center',
      },
    ];

    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'PRODUCT_TABLE_COLUMNS',
      fields
    );

    return fieldsConfig;
  };

  renderSearchForm = () => {
    const { pageConfig } = this.props;

    const fields = [
      <SearchFormItem
        key="productNameOrNo"
        fieldKey="productNameOrNo"
        label="产品名称/编号"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        key="productTag"
        label="标签"
        fieldType="BaseInput"
        fieldKey="productTag"
        defaultShow
      />,
      <SearchFormItem
        key="inchargeBuId"
        label="所属部门"
        fieldType="BuSimpleSelect"
        fieldKey="inchargeBuId"
        defaultShow
      />,
      <SearchFormItem
        label="产品分类1"
        fieldKey="productClass1"
        key="productClass1"
        fieldType="BaseCustomSelect"
        parentKey="CUS:PRODUCT_CLASS1"
        defaultShow
      />,
      <SearchFormItem
        label="产品分类2"
        fieldKey="productClass2"
        key="productClass2"
        fieldType="BaseCustomSelect"
        parentKey="CUS:PRODUCT_CLASS2"
        defaultShow
      />,
      <SearchFormItem
        label="状态"
        fieldKey="productStatus"
        key="productStatus"
        fieldType="BaseSelect"
        parentKey="PRO:PRODUCT_STATUS"
        defaultShow
      />,
      <SearchFormItem
        key="createUserId"
        label="创建人"
        fieldType="UserSimpleSelect"
        fieldKey="createUserId"
        defaultShow
      />,
      <SearchFormItem
        key="configurableField1"
        label="可配置字段1"
        fieldType="BaseInput"
        fieldKey="configurableField1"
        defaultShow
      />,
      <SearchFormItem
        key="configurableField2"
        label="可配置字段2"
        fieldType="BaseInput"
        fieldKey="configurableField2"
        defaultShow
      />,
      <SearchFormItem
        key="configurableField3"
        label="可配置字段3"
        fieldType="BaseInput"
        fieldKey="configurableField3"
        defaultShow
      />,
    ];

    const fieldsConfig = ProductSearchFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'PRODUCT_TABLE_SAERCHFORM',
      fields
    );

    return fieldsConfig;
  };

  render() {
    const {
      loading,
      dispatch,
      formData: { dataList },
      form,
      deleteKeys,
    } = this.props;
    const { visible, getInternalState, departmentList } = this.state;
    const editColumns = [
      {
        title: '序号',
        key: 'sortNo',
        dataIndex: 'sortNo',
        width: 50,
        align: 'center',
      },
      {
        title: '部门',
        dataIndex: 'inchargeBuId',
        align: 'center',
        width: '60%',
        required: true,
        render: (val, row, i) => (
          <FormItem
            form={form}
            required
            fieldType="BaseSelect"
            fieldKey={`dataList[${i}].inchargeBuId`}
            descList={departmentList.filter(
              v => dataList.map(item => Number(item.inchargeBuId)).indexOf(v.id) === -1
            )}
            onChange={(value, option, allOptions) => {
              const selectValue = option[0] || {};
              // dataList更新方式
              const arr = [];
              arr[i] = { pmResId: selectValue.inchargeResId, buName: selectValue.buName };
              dispatch({
                type: `${DOMAIN}/updateFormForEditTable`,
                payload: {
                  dataList: arr,
                },
              });
            }}
          />
        ),
      },
      {
        title: '项目负责人',
        dataIndex: 'pmResId',
        width: '40%',
        required: true,
        render: (val, row, i) => (
          <FormItem
            required
            form={form}
            fieldType="ResSimpleSelect"
            fieldKey={`dataList[${i}].pmResId`}
          />
        ),
      },
    ];

    return (
      <PageWrapper>
        <Modal
          title="创建相关部门项目"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="50%"
          afterClose={() => {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                dataList: [],
              },
            });
          }}
          confirmLoading={loading.effects[`${DOMAIN}/projectManagementAllApprove`]}
        >
          <EditTable
            title=""
            rowKey="id"
            // pagination={false}
            columns={editColumns}
            dataSource={dataList}
            onAddClick={() => {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  dataList: update(dataList, {
                    $push: [
                      {
                        id: genFakeId(-1),
                        sortNo: dataList.length + 1,
                      },
                    ],
                  }),
                },
              });
            }}
            onDeleteConfirm={keys => {
              const newDataSource = dataList.filter(row => keys.indexOf(row.id) < 0);
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  dataList: newDataSource.map((v, i) => ({ ...v, sortNo: i + 1 })),
                },
              });
              this.updateModelState({ deleteKeys: [...deleteKeys, ...keys] });
            }}
          />
        </Modal>
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          onAddClick={() => router.push('/workTable/projectMgmt/productMgmt/create')}
          onEditClick={data => {
            const { selectedRows } = getInternalState();
            const tt = selectedRows.filter(v => v.productStatus !== 'CREATE');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: remindString({
                  remindCode: 'COM:E:ALLOW_MODIFY_CHECK',
                  defaultMessage: `仅“新建”状态允许修改！`,
                }),
              });
              return;
            }
            router.push(`/workTable/projectMgmt/productMgmt/edit?id=${data.id}&mode=EDIT`);
          }}
          deleteData={data => {
            const { selectedRows } = getInternalState();
            const tt = selectedRows.filter(v => v.productStatus !== 'CREATE');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: remindString({
                  remindCode: 'COM:ALLOW_DELETE_CHECK',
                  defaultMessage: `仅“新建”状态的产品允许删除！`,
                }),
              });
              return Promise.resolve({ ok: false });
            }
            return this.deleteData(data);
          }}
          // tableExtraProps={{
          //   scroll: {
          //     x: 1500,
          //   },
          // }}
          extraButtons={[
            {
              key: 'adjust',
              title: '调整',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                // eslint-disable-next-line no-console
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.productStatus !== 'ACTIVE');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: remindString({
                      remindCode: 'COM:ALLOW_ADJUST_CHECK',
                      defaultMessage: `仅“激活”状态允许调整！`,
                    }),
                  });
                  return;
                }
                router.push(
                  `/workTable/projectMgmt/productMgmt/adjust?id=${
                    selectedRows[0].id
                  }&mode=EDIT&scene=adjust`
                );
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'active',
              title: '激活',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(
                  v => v.productStatus !== 'CREATE' && v.productStatus !== 'CLOSE'
                );
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: remindString({
                      remindCode: 'COM:ALLOW_ACTIVE_CHECK',
                      defaultMessage: `仅“新建、关闭”状态允许激活！`,
                    }),
                  });
                  return;
                }

                createConfirm({
                  content: remindString({
                    remindCode: 'COM:W:ACTIVE_WARN',
                    defaultMessage: '继续操作将激活选中的数据，请确认是否继续？',
                  }),
                  onOk: () => {
                    this.changeStatus({
                      id: selectedRowKeys.join(','),
                      productStatus: 'ACTIVE',
                    }).then(res => {
                      const { refreshData } = internalState;
                      refreshData();
                    });
                  },
                });
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'close',
              title: '关闭',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.productStatus !== 'ACTIVE');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: remindString({
                      remindCode: 'COM:ALLOW_CLOSE_CHECK',
                      defaultMessage: `仅激活状态允许关闭！`,
                    }),
                  });
                  return;
                }
                createConfirm({
                  content: remindString({
                    remindCode: 'COM:W:CLOSE_WARN',
                    defaultMessage: '继续操作将关闭选中的数据，请确认是否继续？',
                  }),
                  onOk: () => {
                    this.changeStatus({
                      id: selectedRowKeys.join(','),
                      productStatus: 'CLOSE',
                    }).then(res => {
                      const { refreshData } = internalState;
                      refreshData();
                    });
                  },
                });
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'createProject',
              title: '创建项目',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.productStatus !== 'ACTIVE');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: remindString({
                      remindCode: 'PRO:E:ALLOW_CREATE_PROJ_CHECK',
                      defaultMessage: `仅“激活”状态的产品允许创建项目！`,
                    }),
                  });
                  return;
                }
                this.setState({
                  visible: true,
                  relatedProductId: selectedRowKeys[0],
                  productName: selectedRows[0].productName,
                  inchargeCompany: selectedRows[0].inchargeCompany,
                });
                this.department();
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
          ]}
        />
      </PageWrapper>
    );
  }
}

export default ProductMgmtList;
