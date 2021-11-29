import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import FieldList from '@/components/layout/FieldList';
import SelectWithCols from '@/components/common/SelectWithCols';
import { commonCol } from '../config/index';
import { UdcSelect, Selection } from '@/pages/gen/field';
import { selectUsersWithBu } from '@/services/gen/list';

const { Field } = FieldList;
const DOMAIN = 'userOppsDetail';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

class OppoCreateInner extends PureComponent {
  state = {
    // userSource1: [],
    // userSource2: [],
    // userSource3: [],
    // userSource4: [],
    // userSource5: [],
    buSource1: [],
    buSource2: [],
    buSource3: [],
    buSource4: [],
    buSource5: [],
  };

  componentDidMount() {
    const {
      dispatch,
      domain,
      userOppsDetail: { userList, buList },
    } = this.props;

    // userList && userList.length
    //   ? this.fetchUserDate()
    //   : dispatch({ type: `${domain}/selectUsers` }).then(() => this.fetchUserDate());
    buList && buList.length
      ? this.fetchBuDate()
      : dispatch({ type: `${domain}/selectBus` }).then(() => this.fetchBuDate());
  }

  fetchBuDate = () => {
    const {
      userOppsDetail: { buList },
    } = this.props;
    this.setState({
      buSource1: buList,
      buSource2: buList,
      buSource3: buList,
      buSource4: buList,
      buSource5: buList,
    });
  };

  // fetchUserDate = () => {
  //   const {
  //     userOppsDetail: { userList },
  //   } = this.props;
  //   this.setState({
  //     // userSource1: userList,
  //     // userSource2: userList,
  //     // userSource3: userList,
  //     // userSource4: userList,
  //     // userSource5: userList,
  //   });
  // };

  renderPage = () => {
    const {
      userOppsDetail: { formData, userList, buList, pageConfig },
      form: { getFieldDecorator },
    } = this.props;
    const {
      // userSource1,
      // userSource2,
      // userSource3,
      // userSource4,
      // userSource5,
      buSource1,
      buSource2,
      buSource3,
      buSource4,
      buSource5,
    } = this.state;
    // console.log(pageConfig);
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const fields = [
      <Field
        name="signBuId"
        key="signBuId"
        label={pageFieldJson.signBuId.displayName}
        sortNo={pageFieldJson.signBuId.sortNo}
        decorator={{
          initialValue: formData.signBuId,
          rules: [
            {
              required: !!pageFieldJson.signBuId.requiredFlag,
              message: `请输入${pageFieldJson.signBuId.displayName}`,
            },
          ],
        }}
      >
        <Selection.ColumnsForBu />
      </Field>,

      <Field
        name="salesmanResId"
        key="salesmanResId"
        sortNo={pageFieldJson.salesmanResId.sortNo}
        label={pageFieldJson.salesmanResId.displayName}
        decorator={{
          // trigger: 'onBlur',
          initialValue: formData.salesmanResId || undefined,
          rules: [
            {
              required: !!pageFieldJson.salesmanResId.requiredFlag,
              message: `请输入${pageFieldJson.salesmanResId.displayName}`,
            },
          ],
        }}
      >
        <Selection.Columns
          key="salesmanResId"
          className="x-fill-100"
          source={() => selectUsersWithBu()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder={`请选择${pageFieldJson.salesmanResId.displayName}`}
          disabled={pageFieldJson.salesmanResId.fieldMode === 'UNEDITABLE'}
        />
        {/* <SelectWithCols
          labelKey="name"
          valueKey="code"
          columns={commonCol}
          dataSource={userSource1}
          onChange={() => {}}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              console.warn(userList);
              this.setState({
                userSource1: userList.filter(
                  d =>
                    d.code.indexOf(value) > -1 ||
                    d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                ),
              });
            },
            allowClear: true,
            style: { width: '100%' },
          }}
        /> */}
      </Field>,

      <Field
        name="preSaleBuId"
        key="preSaleBuId"
        sortNo={pageFieldJson.preSaleBuId.sortNo}
        label={pageFieldJson.preSaleBuId.displayName}
        decorator={{
          initialValue: formData.preSaleBuId,
          rules: [
            {
              required: !!pageFieldJson.preSaleBuId.requiredFlag,
              message: `请输入${pageFieldJson.preSaleBuId.displayName}`,
            },
          ],
        }}
      >
        <Selection.ColumnsForBu />
      </Field>,

      <Field
        name="preSaleResId"
        key="preSaleResId"
        sortNo={pageFieldJson.preSaleResId.sortNo}
        label={pageFieldJson.preSaleResId.displayName}
        decorator={{
          // trigger: 'onBlur',
          initialValue: formData.preSaleResId || undefined,
          rules: [
            {
              required: !!pageFieldJson.preSaleBuId.requiredFlag,
              message: `请输入${pageFieldJson.preSaleResId.displayName}`,
            },
          ],
        }}
      >
        <Selection.Columns
          key="preSaleResId"
          className="x-fill-100"
          source={() => selectUsersWithBu()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder={`请选择${pageFieldJson.preSaleResId.displayName}`}
          disabled={pageFieldJson.preSaleResId.fieldMode === 'UNEDITABLE'}
        />
        {/*
        <SelectWithCols
          labelKey="name"
          valueKey="code"
          columns={commonCol}
          dataSource={userSource2}
          onChange={() => {}}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              this.setState({
                userSource2: userList.filter(
                  d =>
                    d.code.indexOf(value) > -1 ||
                    d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                ),
              });
            },
            allowClear: true,
            style: { width: '100%' },
          }}
        /> */}
      </Field>,
      <Field
        name="solutionDifficulty"
        key="solutionDifficulty"
        label={pageFieldJson.solutionDifficulty.displayName}
        sortNo={pageFieldJson.solutionDifficulty.sortNo}
        decorator={{
          initialValue: formData.solutionDifficulty,
          rules: [
            {
              required: !!pageFieldJson.solutionDifficulty.requiredFlag,
              message: `请选择${pageFieldJson.solutionDifficulty.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="ACC:SOLUTION_DIFFICULTY" />
      </Field>,
      <Field
        name="solutionImportance"
        key="solutionImportance"
        label={pageFieldJson.solutionImportance.displayName}
        sortNo={pageFieldJson.solutionImportance.sortNo}
        decorator={{
          initialValue: formData.solutionImportance,
          rules: [
            {
              required: !!pageFieldJson.solutionImportance.requiredFlag,
              message: `请选择${pageFieldJson.solutionImportance.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="ACC:SOLUTION_IMPORTANCE" />
      </Field>,
      <Field
        name="deliBuId"
        key="deliBuId"
        label={pageFieldJson.deliBuId.displayName}
        sortNo={pageFieldJson.deliBuId.sortNo}
        decorator={{
          initialValue: formData.deliBuId,
          rules: [
            {
              required: !!pageFieldJson.deliBuId.requiredFlag,
              message: `请输入${pageFieldJson.deliBuId.displayName}`,
            },
          ],
        }}
      >
        <Selection.ColumnsForBu />
      </Field>,

      <Field
        name="deliResId"
        key="deliResId"
        sortNo={pageFieldJson.deliResId.sortNo}
        label={pageFieldJson.deliResId.displayName}
        decorator={{
          // trigger: 'onBlur',
          initialValue: formData.deliResId || undefined,
          rules: [
            {
              required: !!pageFieldJson.deliResId.requiredFlag,
              message: `请输入${pageFieldJson.deliResId.displayName}`,
            },
          ],
        }}
      >
        <Selection.Columns
          key="deliResId"
          className="x-fill-100"
          source={() => selectUsersWithBu()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder={`请选择${pageFieldJson.deliResId.displayName}`}
          disabled={pageFieldJson.deliResId.fieldMode === 'UNEDITABLE'}
        />
        {/*
        <SelectWithCols
          labelKey="name"
          valueKey="code"
          columns={commonCol}
          dataSource={userSource3}
          onChange={() => {}}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              this.setState({
                userSource3: userList.filter(
                  d =>
                    d.code.indexOf(value) > -1 ||
                    d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                ),
              });
            },
            allowClear: true,
            style: { width: '100%' },
          }}
        /> */}
      </Field>,
      <Field
        name="projectDifficult"
        key="projectDifficult"
        sortNo={pageFieldJson.projectDifficult.sortNo}
        label={pageFieldJson.projectDifficult.displayName}
        decorator={{
          initialValue: formData.projectDifficult,
          rules: [
            {
              required: !!pageFieldJson.projectDifficult.requiredFlag,
              message: `${pageFieldJson.projectDifficult.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="ACC:PROJECT_DIFFICULTY" />
      </Field>,
      <Field
        name="projectImportance"
        label={pageFieldJson.projectImportance.displayName}
        key="projectImportance"
        sortNo={pageFieldJson.projectImportance.sortNo}
        decorator={{
          initialValue: formData.projectImportance,
          rules: [
            {
              required: !!pageFieldJson.projectImportance.requiredFlag,
              message: `${pageFieldJson.projectImportance.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="ACC:PROJECT_IMPORTANCE" />
      </Field>,

      <Field
        name="coBuId"
        key="coBuId"
        sortNo={pageFieldJson.coBuId.sortNo}
        label={pageFieldJson.coBuId.displayName}
        decorator={{
          initialValue: formData.coBuId,
          rules: [
            {
              required: !!pageFieldJson.coBuId.requiredFlag,
              message: `请输入${pageFieldJson.coBuId.displayName}`,
            },
          ],
        }}
      >
        <Selection.ColumnsForBu />
      </Field>,
      <Field
        name="coResId"
        key="coResId"
        sortNo={pageFieldJson.coResId.sortNo}
        label={pageFieldJson.coResId.displayName}
        decorator={{
          // trigger: 'onBlur',
          initialValue: formData.coResId || undefined,
          rules: [
            {
              required: !!pageFieldJson.coResId.requiredFlag,
              message: `请输入${pageFieldJson.coResId.displayName}`,
            },
          ],
        }}
      >
        <Selection.Columns
          key="coResId"
          className="x-fill-100"
          source={() => selectUsersWithBu()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder={`请选择${pageFieldJson.coResId.displayName}`}
          disabled={pageFieldJson.coResId.fieldMode === 'UNEDITABLE'}
        />
        {/*
        <SelectWithCols
          labelKey="name"
          valueKey="code"
          columns={commonCol}
          dataSource={userSource4}
          onChange={() => {}}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              this.setState({
                userSource4: userList.filter(
                  d =>
                    d.code.indexOf(value) > -1 ||
                    d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                ),
              });
            },
            allowClear: true,
            style: { width: '100%' },
          }}
        /> */}
      </Field>,
      <Field
        name="codeliBuId"
        key="codeliBuId"
        sortNo={pageFieldJson.codeliBuId.sortNo}
        label={pageFieldJson.codeliBuId.displayName}
        decorator={{
          initialValue: formData.codeliBuId,
          rules: [
            {
              required: !!pageFieldJson.codeliBuId.requiredFlag,
              message: `请输入${pageFieldJson.codeliBuId.displayName}`,
            },
          ],
        }}
      >
        <Selection.ColumnsForBu />
      </Field>,
      <Field
        name="codeliResId"
        key="codeliResId"
        sortNo={pageFieldJson.codeliResId.displayName}
        label={pageFieldJson.codeliResId.displayName}
        decorator={{
          // trigger: 'onBlur',
          initialValue: formData.codeliResId || undefined,
          rules: [
            {
              required: !!pageFieldJson.codeliResId.requiredFlag,
              message: `请输入${pageFieldJson.codeliResId.displayName}`,
            },
          ],
        }}
      >
        <Selection.Columns
          key="codeliResId"
          className="x-fill-100"
          source={() => selectUsersWithBu()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder={`请选择${pageFieldJson.codeliResId.displayName}`}
          disabled={pageFieldJson.codeliResId.fieldMode === 'UNEDITABLE'}
        />
        {/* <SelectWithCols
          labelKey="name"
          valueKey="code"
          columns={commonCol}
          dataSource={userSource5}
          onChange={() => {}}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              this.setState({
                userSource5: userList.filter(
                  d =>
                    d.code.indexOf(value) > -1 ||
                    d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                ),
              });
            },
            allowClear: true,
            style: { width: '100%' },
          }}
        /> */}
      </Field>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <FieldList
        layout="horizontal"
        legend="内部信息"
        getFieldDecorator={getFieldDecorator}
        col={2}
      >
        {filterList}
      </FieldList>
    );
  };

  render() {
    const {
      userOppsDetail: { formData, userList, buList },
      form: { getFieldDecorator },
    } = this.props;
    const { userSource, buSource } = this.state;

    return this.renderPage();
  }
}

export default OppoCreateInner;
