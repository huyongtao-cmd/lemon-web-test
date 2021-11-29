import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import moment from 'moment';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';
import { Col, Row, DatePicker, Divider, Form, Input, InputNumber, Modal, Tooltip } from 'antd';
import { genFakeId } from '@/utils/mathUtils';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import TreeSearch from '@/components/common/TreeSearch';
import Loading from '@/components/core/DataLoading';
import { mountToTab } from '@/layouts/routerControl';
import { UdcSelect, Selection } from '@/pages/gen/field';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import { findBuResRoleSelect, findBuResSelect } from '@/services/org/bu/component/buResInfo';
import { selectUserMultiCol } from '@/services/user/Contract/sales';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'orgBuResInfoLinmon';

@connect(({ dispatch, loading, orgbuLinmon, orgBuResInfoLinmon }) => ({
  dispatch,
  orgbuLinmon,
  loading,
  orgBuResInfoLinmon,
}))
@mountToTab()
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
class OrgBu extends PureComponent {
  state = {
    buId: undefined,
    // isFound: false,
    modalVisible: false, // 弹窗控制
    mode: '', // 弹窗模式：新增、编辑
    roleTableShow: false,
  };

  componentDidMount() {
    const {
      dispatch,
      orgBuResInfoLinmon: { formData },
    } = this.props;
    const { buId } = this.state;
    dispatch({ type: `${DOMAIN}/findbuMainTree` });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {
          ...formData,
          buId,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/getPageConfigs`,
      payload: { pageNos: 'BU_RES_MANAGEMENT_LIST,BU_RES_MANAGEMENT_SAVE,BU_RES_MANAGEMENT_EDIT' },
    });
  }

  onSelect = selectedKeys => {
    const {
      dispatch,
      orgBuResInfoLinmon: { formData },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {
          ...formData,
          buId: selectedKeys[0],
        },
      },
    });
    this.setState(
      {
        buId: selectedKeys[0],
      },
      () => {
        this.fetchData();
      }
    );
  };

  fetchData = async params => {
    const {
      dispatch,
      orgBuResInfoLinmon: { searchForm },
    } = this.props;
    const { buId } = this.state;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...searchForm, ...params, buId } });
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      orgBuResInfoLinmon: { roleTableData },
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
      orgBuResInfoLinmon: { formData },
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
    const { buId } = this.state;
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
    const { buId } = this.state;
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
        // console.warn(err);
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

  renderPage = () => {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator },
      orgBuResInfoLinmon: {
        formData,
        listTableData,
        roleTableData = [],
        delroleTableData,
        searchForm,
        tree,
        pageConfig,
        listPageConfig,
        editPageConfig,
      },
    } = this.props;
    const { mode, modalVisible, roleTableShow } = this.state;
    const { buId } = this.state;

    if (!editPageConfig.pageBlockViews || editPageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = editPageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const {
      resId = {},
      resStatus = {},
      dateFrom = {},
      dateTo = {},
      pResId = {},
      coopType = {},
      eqvaRatio = {},
      remark = {},
      salaryPeriod = {},
      salaryMethod = {},
      buRoleName = {},
    } = pageFieldJson;
    const fields = [
      mode === 'create' ? (
        <Field
          name="resId"
          key="resId"
          label={pageFieldJson.resId.displayName}
          sortNo={pageFieldJson.resId.sortNo}
          decorator={{
            initialValue: formData.resId ? formData.resId + '' : null,
            rules: [
              {
                required: !!pageFieldJson.resId.requiredFlag,
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
          key="resId"
          label={pageFieldJson.resId.displayName}
          sortNo={pageFieldJson.resId.sortNo}
          decorator={{
            initialValue: formData.resName,
          }}
        >
          <Input disabled />
        </Field>
      ),
      <Field
        name="resStatus"
        key="resStatus"
        label={pageFieldJson.resStatus.displayName}
        sortNo={pageFieldJson.resStatus.sortNo}
        decorator={{
          initialValue: formData.resStatus,
          rules: [
            {
              required: !!pageFieldJson.resStatus.requiredFlag,
              message: '必填',
            },
          ],
        }}
      >
        <UdcSelect
          code="COM.STATUS1"
          placeholder={`请选择${pageFieldJson.resStatus.displayName}`}
        />
      </Field>,

      <Field
        name="dateFrom"
        key="dateFrom"
        label={pageFieldJson.dateFrom.displayName}
        sortNo={pageFieldJson.dateFrom.sortNo}
        decorator={{
          initialValue: formData.dateFrom ? moment(formData.dateFrom) : undefined,
        }}
      >
        <DatePicker
          placeholder={`请选择${pageFieldJson.dateFrom.displayName}`}
          className="x-fill-100"
        />
      </Field>,

      <Field
        name="dateTo"
        key="dateTo"
        label={pageFieldJson.dateTo.displayName}
        sortNo={pageFieldJson.dateTo.sortNo}
        decorator={{
          initialValue: formData.dateTo ? moment(formData.dateTo) : undefined,
        }}
      >
        <DatePicker
          placeholder={`请选择${pageFieldJson.dateTo.displayName}`}
          className="x-fill-100"
        />
      </Field>,

      <Field
        name="presId"
        key="pResId"
        label={pageFieldJson.pResId.displayName}
        sortNo={pageFieldJson.pResId.sortNo}
        decorator={{
          initialValue: formData.presId || undefined,
          rules: [
            {
              required: !!pageFieldJson.pResId.requiredFlag,
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
          placeholder={`请选择${pageFieldJson.pResId.displayName}`}
          limit={20}
        />
      </Field>,

      <Field
        name="remark"
        key="remark"
        label={pageFieldJson.remark.displayName}
        sortNo={pageFieldJson.remark.sortNo}
        decorator={{
          initialValue: formData.remark,
          rules: [
            {
              required: !!pageFieldJson.remark.requiredFlag,
              message: `请输入${pageFieldJson.remark.displayName}`,
            },
            { max: 400, message: '不超过400个字' },
          ],
        }}
        fieldCol={1}
        labelCol={{ span: 4, xxl: 3 }}
        wrapperCol={{ span: 19, xxl: 20 }}
      >
        <Input.TextArea placeholder={`请输入${pageFieldJson.remark.displayName}`} rows={3} />
      </Field>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <Modal
        destroyOnClose
        title={
          pageFieldJson.resId && pageFieldJson.buId
            ? `编辑${pageFieldJson.buId.displayName}`
            : '编辑资源BU'
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
          {filterList}
        </FieldList>
      </Modal>
    );
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator },
      orgBuResInfoLinmon: {
        formData,
        listTableData,
        roleTableData = [],
        delroleTableData,
        searchForm,
        tree,
        pageConfig,
        listPageConfig,
      },
    } = this.props;
    const { mode, modalVisible, roleTableShow } = this.state;
    const { buId } = this.state;
    if (!listPageConfig.pageBlockViews || listPageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = listPageConfig.pageBlockViews[0];
    const currentBlockConfig1 = listPageConfig.pageBlockViews[1];
    const { pageFieldViews } = currentBlockConfig;
    const { pageFieldViews: pageFieldViews1 } = currentBlockConfig1;
    const pageFieldJson = {};
    const pageFieldJson1 = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    pageFieldViews1.forEach(field => {
      pageFieldJson1[field.fieldKey] = field;
    });
    const {
      resId = {},
      resStatus = {},
      dateFrom = {},
      dateTo = {},
      pResId = {},
      coopType = {},
      eqvaRatio = {},
      remark = {},
      salaryPeriod = {},
      salaryMethod = {},
      buRoleName = {},
      eqvaRatioDetail = {},
    } = pageFieldJson;
    const { resNo = {} } = pageFieldJson1;
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
        resId.visibleFlag && {
          title: `${resId.displayName}`,
          dataIndex: 'resId',
          sortNo: `${resId.sortNo}`,
          options: {
            initialValue: searchForm.resId,
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
              placeholder={`请选择${resId.displayName}`}
              limit={20}
            />
            // <AsyncSelect
            //   source={() => selectUsers().then(resp => resp.response)}
            //   placeholder="请选择资源"
            // />
          ),
        },
        pResId.visibleFlag && {
          title: `${pResId.displayName}`,
          sortNo: `${pResId.sortNo}`,
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
              placeholder={`请选择${pResId.displayName}`}
              limit={20}
            />
          ),
        },
        resStatus.visibleFlag && {
          title: `${resStatus.displayName}`,
          sortNo: `${resStatus.sortNo}`,
          dataIndex: 'resStatus',
          options: {
            initialValue: searchForm.resStatus,
          },
          tag: <UdcSelect code="COM.STATUS1" placeholder={`请选择${resStatus.displayName}`} />,
        },
      ].filter(Boolean),
      columns: [
        resNo.visibleFlag && {
          title: `${resNo.displayName}`,
          sortNo: `${resNo.sortNo}`,
          dataIndex: 'resNo',
          width: 180,
          align: 'center',
          // render: (value, row, index) => {
          //   const urls = getUrl();
          //   const from = stringify({ from: urls });
          //   const url = `/hr/res/profile/list/resQuery?id=${row.resId}&${from}`;
          //   return (
          //     <Link className="tw-link" to={url}>
          //       {value}
          //     </Link>
          //   );
          // },
        },
        resId.visibleFlag && {
          title: `${resId.displayName}`,
          sortNo: `${resId.sortNo}`,
          dataIndex: 'resName',
          width: 80,
          align: 'center',
        },
        resStatus.visibleFlag && {
          title: `${resStatus.displayName}`,
          sortNo: `${resStatus.sortNo}`,
          dataIndex: 'resStatusDesc',
          width: 50,
          align: 'center',
        },
        dateFrom.visibleFlag && {
          title: `${dateFrom.displayName}`,
          sortNo: `${dateFrom.sortNo}`,
          dataIndex: 'dateFrom',
          width: 100,
          align: 'center',
        },
        dateTo.visibleFlag && {
          title: `${dateTo.displayName}`,
          sortNo: `${dateTo.sortNo}`,
          dataIndex: 'dateTo',
          width: 100,
          align: 'center',
        },
        pResId.visibleFlag && {
          title: `${pResId.displayName}`,
          sortNo: `${pResId.sortNo}`,
          dataIndex: 'presName',
          width: 80,
          align: 'center',
        },
        remark.visibleFlag && {
          title: `${remark.displayName}`,
          sortNo: `${remark.sortNo}`,
          dataIndex: 'remark',
          width: 100,
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
          disabled: !buId,
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
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
            }).then(() => {
              this.handleEditRole();
              this.fetchData();
            });
          },
        },
      ],
    };

    const mergeDeep = child =>
      Array.isArray(child)
        ? child.map(item => ({
            ...item,
            buName: item.className,
            child: item.child ? mergeDeep(item.child) : null,
          }))
        : [];

    const treeData = mergeDeep(tree);

    return (
      <>
        <PageHeaderWrapper title="BU主数据">
          <Row gutter={5}>
            {/*  paddingTop 是为了跟右边顶部对齐 */}
            <Col span={6}>
              {!loading.effects[`${DOMAIN}/findbuMainTree`] ? (
                <TreeSearch
                  showSearch
                  placeholder="请输入关键字"
                  treeData={treeData}
                  onSelect={this.onSelect}
                  defaultExpandedKeys={treeData.map(item => `${item.id}`)}
                />
              ) : (
                <Loading />
              )}
            </Col>

            <Col span={18} style={{ backgroundColor: '#fff' }}>
              <DataTable {...listTableProps} />

              {roleTableShow && (
                <>
                  <Divider dashed />
                  <DescriptionList
                    size="large"
                    title={
                      pageFieldJson.resId ? `${pageFieldJson.resId.displayName}角色` : '资源角色'
                    }
                    style={{ margin: '0 0 32px 20px' }}
                  >
                    <EditableDataTable {...roleTableProps} />
                  </DescriptionList>
                </>
              )}
            </Col>
          </Row>
        </PageHeaderWrapper>

        {modalVisible ? this.renderPage() : null}
      </>
    );
  }
}

export default OrgBu;
