import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import update from 'immutability-helper';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import createMessage from '@/components/core/AlertMessage';
import { Button, Card, DatePicker, Divider, Form, Input, InputNumber, Modal, Tooltip } from 'antd';
import { genFakeId } from '@/utils/mathUtils';
import AsyncSelect from '@/components/common/AsyncSelect';
import { UdcSelect, Selection } from '@/pages/gen/field';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import {
  findBuPUserSelect,
  findBuResRoleSelect,
  findBuResSelect,
} from '@/services/org/bu/component/buResInfo';
import { fromQs } from '@/utils/stringUtils';
import { selectUsers } from '@/services/sys/user';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import router from 'umi/router';
import Link from 'umi/link';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'buResInfoLinmon';

@connect(({ dispatch, loading, buResInfoLinmon }) => ({
  dispatch,
  buResInfoLinmon,
  loading,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateBasic`,
      payload: { key, value },
    });
  },
})
class BuResInfo extends PureComponent {
  state = {
    // isFound: false,
    modalVisible: false, // 弹窗控制
    mode: '', // 弹窗模式：新增、编辑
    roleTableShow: false,
  };

  componentDidMount() {
    const {
      dispatch,
      buResInfoLinmon: { formData },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {
          ...formData,
          buId: fromQs().buId,
        },
      },
    });
    this.fetchData();
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BU_MASTER_DATA_RESOURCE_INFORMATION_LIST' },
    });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    const { buId } = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params, buId } });
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      buResInfoLinmon: { roleTableData },
    } = this.props;
    const newDataList = update(roleTableData, {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { roleTableData: newDataList } });
  };

  handleEditRole = () => {
    const {
      dispatch,
      buResInfoLinmon: { formData },
    } = this.props;
    this.setState({
      roleTableShow: true,
    });
    dispatch({
      type: `${DOMAIN}/queryBuResRoleInfo`,
      payload: {
        buresId: formData.id,
      },
    });
  };

  modalCancel = () => {
    const { dispatch } = this.props;
    const { buId } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: { buId },
      },
    });
    this.setState({
      modalVisible: false,
    });
  };

  modalOpen = mode => () => {
    const { dispatch } = this.props;
    const { buId } = fromQs();
    this.setState({
      modalVisible: true,
      mode,
    });
    if (mode === 'create') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          formData: { buId },
        },
      });
    }
  };

  modalOk = () => {
    const { dispatch, form } = this.props;
    const { mode } = this.state;
    form.validateFields({ force: true }, (err, fieldsValue) => {
      if (err) {
        return;
      }
      if (mode === 'edit') {
        // 编辑保存
        dispatch({
          type: `${DOMAIN}/editBuResInfo`,
        });
        this.setState({
          modalVisible: false,
          roleTableShow: false,
        });
      } else if (mode === 'create') {
        // 新增保存
        dispatch({
          type: `${DOMAIN}/createResInfo`,
        });
        this.setState({
          modalVisible: false,
        });
      }
    });
  };

  render() {
    const {
      dispatch,
      form: { getFieldDecorator },
      loading,
      buResInfoLinmon: {
        formData,
        listTableData,
        roleTableData = [],
        delroleTableData,
        searchForm,
        pageConfig,
      },
    } = this.props;
    const { mode, modalVisible, roleTableShow } = this.state;
    const { buId } = fromQs();
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const listTableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/query`],
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource: listTableData,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        pageFieldJson.resId.visibleFlag && {
          title: `${pageFieldJson.resId.displayName}`,
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId,
          },
          sortNo: `${pageFieldJson.resId.sortNo}`,
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUserMultiCol()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${pageFieldJson.resId.displayName}`}
            />
          ),
        },
        {
          title: '上级领导',
          dataIndex: 'presId',
          options: {
            initialValue: searchForm.presId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUserMultiCol()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择上级领导"
            />
          ),
        },
        {
          title: '状态',
          dataIndex: 'resStatus',
          options: {
            initialValue: searchForm.resStatus,
          },
          tag: <UdcSelect code="COM.STATUS1" placeholder="请选择状态" />,
        },
      ].filter(Boolean),
      columns: [
        pageFieldJson.resId.visibleFlag && {
          title: `${pageFieldJson.resId.displayName}`,
          sortNo: `${pageFieldJson.resId.sortNo}`,
          dataIndex: 'resName',
        },
        pageFieldJson.resStatus.visibleFlag && {
          title: `${pageFieldJson.resStatus.displayName}`,
          sortNo: `${pageFieldJson.resStatus.sortNo}`,
          dataIndex: 'resStatusDesc',
        },
        pageFieldJson.dateFrom.visibleFlag && {
          title: `${pageFieldJson.dateFrom.displayName}`,
          sortNo: `${pageFieldJson.dateFrom.sortNo}`,
          dataIndex: 'dateFrom',
        },
        pageFieldJson.dateTo.visibleFlag && {
          title: `${pageFieldJson.dateTo.displayName}`,
          sortNo: `${pageFieldJson.dateTo.sortNo}`,
          dataIndex: 'dateTo',
        },
        pageFieldJson.pResId.visibleFlag && {
          title: `${pageFieldJson.pResId.displayName}`,
          sortNo: `${pageFieldJson.pResId.sortNo}`,
          dataIndex: 'presName',
        },
        pageFieldJson.remark.visibleFlag && {
          title: `${pageFieldJson.remark.displayName}`,
          dataIndex: 'remark',
          sortNo: `${pageFieldJson.remark.sortNo}`,
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        {
          key: 'add',
          title: '新增',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({
              modalVisible: true,
              mode: 'create',
            });
            if (mode === 'create') {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  formData: { buId },
                },
              });
            }
          },
        },
        {
          key: 'edit',
          title: '编辑',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({
              modalVisible: true,
              mode: 'edit',
            });
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                formData: {
                  ...selectedRows[0],
                  buId,
                },
              },
            });
          },
        },
      ],
    };

    const roleTableProps = {
      domain: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/queryBuResRoleInfo`],
      expirys: 0,
      showCopy: false,
      rowKey: 'id',
      dataSource: roleTableData,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            roleTableData: update(roleTableData, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  buId: null,
                  resId: null,
                  roleCode: null,
                  roleName: null,
                  jobGrade: null,
                  jobGradeDesc: null,
                  buresId: null,
                  remark: null,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const delArr = [];
        selectedRowKeys.map(v => v > 0 && delArr.push(v));
        const newDataList = roleTableData.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            roleTableData: newDataList,
            delroleTableData: delArr,
          },
        });
      },
      columns: [
        {
          title: '角色',
          dataIndex: 'roleCode',
          required: true,
          width: '30%',
          align: 'left',
          render: (value, row, index) => (
            <AsyncSelect
              value={value}
              source={() => findBuResRoleSelect().then(resp => resp.response)}
              placeholder="请选择角色"
              showSearch
              filterOption={(input, option) =>
                option.props.children
                  ? option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  : false
              }
              onChange={this.onCellChanged(index, 'roleCode')}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'left',
          render: (value, row, index) => (
            <Input defaultValue={value} size="small" onBlur={this.onCellChanged(index, 'remark')} />
          ),
        },
      ],
      buttons: [
        {
          key: 'save',
          title: '保存',
          // loading: false,
          hidden: false,
          // disabled: false,
          minSelections: 0,
          className: 'tw-btn-primary',
          cb: () => {
            let flag = true;
            roleTableData.forEach(v => {
              if (!v.roleCode) {
                flag = false;
              }
            });
            if (!flag) {
              createMessage({
                type: 'error',
                description: pageFieldJson.resId
                  ? `请选择${pageFieldJson.resId.displayName}角色`
                  : '请选择资源角色',
              });
              return;
            }
            dispatch({
              type: `${DOMAIN}/saveResRole`,
              payload: {
                buId,
                buResId: formData.id,
                roleTableData,
                delroleTableData,
              },
            }).then(this.handleEditRole);
          },
        },
      ],
    };

    return (
      <>
        <DescriptionList
          size="large"
          title={pageFieldJson.resId ? `${pageFieldJson.resId.displayName}列表` : '资源列表'}
        />
        <DataTable {...listTableProps} />

        {roleTableShow && (
          <>
            <Divider dashed />
            <DescriptionList
              size="large"
              title={pageFieldJson.resId ? `${pageFieldJson.resId.displayName}角色` : '资源角色'}
              style={{ marginBottom: 32 }}
            >
              <EditableDataTable {...roleTableProps} />
            </DescriptionList>
          </>
        )}

        {/* 新建编辑modal */}
        <Modal
          destroyOnClose
          title={
            (mode === 'edit' ? '编辑' : '新增') + pageFieldJson.resId
              ? `${pageFieldJson.resId.displayName}${pageFieldJson.buId.displayName}`
              : 'BU资源'
          }
          visible={modalVisible}
          onOk={this.modalOk}
          onCancel={this.modalCancel}
          width="80%"
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            style={{ overflow: 'hidden' }}
            col={2}
          >
            {mode === 'create' ? (
              <Field
                name="resId"
                label={`${pageFieldJson.resId.displayName}`}
                decorator={{
                  initialValue: formData.resId ? formData.resId + '' : null,
                  rules: [
                    {
                      required: true,
                      message: '必填',
                    },
                  ],
                }}
              >
                <AsyncSelect
                  source={() => findBuResSelect({ buId }).then(resp => resp.response)}
                  placeholder={`请选择${pageFieldJson.resId.displayName}`}
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children
                      ? option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      : false
                  }
                />
              </Field>
            ) : (
              <Field
                name="resName"
                label={`${pageFieldJson.resId.displayName}`}
                decorator={{
                  initialValue: formData.resName,
                }}
              >
                <Input disabled />
              </Field>
            )}
            <Field
              name="resStatus"
              label="状态"
              decorator={{
                initialValue: formData.resStatus,
                rules: [
                  {
                    required: true,
                    message: '必填',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.STATUS1" placeholder="请选择状态" />
            </Field>

            <Field
              name="dateFrom"
              label="加入时间"
              decorator={{
                initialValue: formData.dateFrom ? moment(formData.dateFrom) : undefined,
              }}
            >
              <DatePicker placeholder="请选择加入时间" className="x-fill-100" />
            </Field>

            <Field
              name="dateTo"
              label="退出时间"
              decorator={{
                initialValue: formData.dateTo ? moment(formData.dateTo) : undefined,
              }}
            >
              <DatePicker placeholder="请选择退出时间" className="x-fill-100" />
            </Field>

            <Field
              name="coopType"
              label="合作方式"
              decorator={{
                initialValue: formData.coopType,
                rules: [
                  {
                    required: true,
                    message: '必填',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.COOPERATION_MODE" placeholder="请选择合作方式" />
            </Field>

            {mode === 'create' ? (
              <Field
                name="eqvaRatio"
                label="当量系数"
                decorator={{
                  initialValue: formData.eqvaRatio,
                  rules: [
                    {
                      required: false,
                      message: '必填',
                    },
                  ],
                }}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="请输入当量系数"
                  disabled
                />
              </Field>
            ) : (
              <Field
                name="eqvaRatio"
                label="当量系数"
                decorator={{
                  initialValue: formData.eqvaRatio,
                  rules: [
                    {
                      required: false,
                    },
                  ],
                }}
              >
                <Input disabled />
              </Field>
            )}

            <Field
              name="presId"
              label="上级领导"
              decorator={{
                initialValue: formData.presId || undefined,
                rules: [
                  {
                    required: false,
                    message: '必填',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectUserMultiCol()}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择上级领导"
              />
              {/* <AsyncSelect
                source={() =>
                  findBuPUserSelect().then(resp =>
                    (Array.isArray(resp.response) ? resp.response : []).map(item => ({
                      id: item.id,
                      code: item.valCode,
                      name: item.valDesc,
                    }))
                  )
                }
                placeholder="请选择上级领导"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              /> */}
            </Field>
            <Field
              name="salaryPeriod"
              label="发薪周期"
              decorator={{
                initialValue: formData.salaryPeriod,
                rules: [
                  {
                    required: false,
                    message: '必填',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.SALARY_CYCLE" placeholder="请选择发薪周期" />
            </Field>

            <Field
              name="salaryMethod"
              label="发薪方式"
              decorator={{
                initialValue: formData.salaryMethod,
                rules: [
                  {
                    required: true,
                    message: '必填',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.SALARY_METHOD" placeholder="请选择发薪方式" />
            </Field>
            <Field
              name="remark"
              label="备注1"
              decorator={{
                initialValue: formData.remark,
                rules: [
                  {
                    required: false,
                    message: '请输入备注',
                  },
                  { max: 400, message: '不超过400个字' },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="请输入备注" rows={3} />
            </Field>
          </FieldList>
        </Modal>
      </>
    );
  }
}

export default BuResInfo;
