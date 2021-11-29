import React from 'react';
import { Modal } from 'antd';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import createMessage from '@/components/core/AlertMessage';
import { projectPlanListRq, projectPlanDeleteRq } from '@/services/workbench/project';
import { isEmpty, equals } from 'ramda';

class PlanModal extends React.Component {
  state = {
    selectedRadio: [],
  };

  componentDidMount() {
    const { alearySelected } = this.props;
    this.setState({
      selectedRadio: alearySelected.map(v => ({ ...v, id: v.projectPlanId })),
    });
  }

  componentWillReceiveProps(nextProps) {
    const { alearySelected } = nextProps;
    const { selectedRadio } = this.state;
    const tt = alearySelected.map(v => ({ ...v, id: v.projectPlanId }));
    if (!equals(selectedRadio, tt)) {
      this.setState({
        selectedRadio: tt,
      });
    }
  }

  // 点击确定按钮保存项目
  handleSave = e => {
    const { onOk } = this.props;
    const { selectedRadio } = this.state;
    // if (!selectedRadio.length) {
    //   createMessage({ type: 'warn', description: '请选择一个或多个场次' });
    //   return;
    // }
    onOk.apply(this.state, [e, selectedRadio]);
  };

  fetchData = async params => {
    const { projectId, phaseId, alearySelected } = this.props;

    const { response } = await projectPlanListRq({
      ...params,
      projectId,
      phaseId,
      excuteFlag: true,
      limit: 0,
    });

    const tt = response.data.rows.map(v => ({ ...v, children: null }));

    this.setState({
      selectedRadio: tt.filter(v => alearySelected.map(v2 => v2.projectPlanId).includes(v.id)),
    });

    return { ...response.data, rows: tt };
  };

  // 点击取消按钮
  onToggle = e => {
    const { onCancel } = this.props;
    onCancel.apply(this.state, [e]);
  };

  renderColumns = () => {
    const fields = [
      {
        title: '编号',
        key: 'planNo',
        dataIndex: 'planNo',
        align: 'center',
        width: 100,
      },
      {
        title: '场次',
        key: 'planName',
        dataIndex: 'planName',
        align: 'center',
        width: 100,
      },
      {
        title: '集数',
        key: 'configurableField1',
        dataIndex: 'configurableField1',
        align: 'center',
        width: 100,
      },
      {
        title: '气氛',
        key: 'configurableField2',
        dataIndex: 'configurableField2',
        align: 'center',
        width: 100,
      },
      {
        title: '页数',
        key: 'configurableField3',
        dataIndex: 'configurableField3',
        align: 'center',
        width: 100,
      },
      {
        title: '主场景',
        key: 'configurableField4',
        dataIndex: 'configurableField4',
        align: 'center',
        width: 100,
      },
      {
        title: '次场景',
        key: 'configurableField5',
        dataIndex: 'configurableField5',
        align: 'center',
        width: 100,
      },
      {
        title: '主要内容',
        key: 'configurableField6',
        dataIndex: 'configurableField6',
        align: 'left',
        width: 200,
      },
      {
        title: '角色/名称',
        key: 'memberRoleAndName',
        dataIndex: 'memberRoleAndName',
        align: 'left',
        width: 200,
      },
      {
        title: '服化道提示',
        key: 'configurableField7',
        dataIndex: 'configurableField7',
        align: 'center',
        width: 100,
      },
      {
        title: '状态',
        key: 'executeStatus',
        dataIndex: 'executeStatusDesc',
        align: 'center',
        width: 100,
      },
      {
        title: '日期起',
        key: 'planStartDate',
        dataIndex: 'planStartDate',
        align: 'center',
        width: 100,
      },
      {
        title: '日期止',
        key: 'planEndDate',
        dataIndex: 'planEndDate',
        align: 'center',
        width: 100,
      },
      {
        title: '负责人',
        key: 'inchargeResId',
        dataIndex: 'inchargeResIdDesc',
        align: 'center',
        width: 100,
      },
      {
        title: '所属阶段',
        key: 'phaseNo',
        dataIndex: 'phaseIdDesc',
        align: 'center',
        width: 100,
      },
      {
        title: '备注',
        key: 'remark',
        dataIndex: 'remark',
        align: 'left',
        width: 200,
      },
    ];

    // const fieldsConfig = ProductTableColumnsBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_TABLE_COLUMNS',
    //   fields
    // );

    return fields;
  };

  renderSearchForm = () => {
    // const { pageConfig } = this.props;

    const fields = [
      <SearchFormItem
        label="场次"
        key="planName"
        fieldKey="planName"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="集数"
        key="configurableField1"
        fieldKey="configurableField1"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="主场景"
        key="configurableField4"
        fieldKey="configurableField4"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="角色/演员"
        key="roleName"
        fieldKey="roleName"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="状态"
        key="executeStatus"
        fieldKey="executeStatus"
        fieldType="BaseSelect"
        defaultShow
        parentKey="PRO:EXECUTE_STATUS"
      />,
      <SearchFormItem
        label="气氛"
        key="configurableField2"
        fieldKey="configurableField2"
        fieldType="BaseInput"
        defaultShow
      />,
    ];

    // const fieldsConfig = ProductSearchFormItemBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_TABLE_SAERCHFORM',
    //   fields
    // );

    return fields;
  };

  render() {
    const { visible, title, disabled } = this.props;
    const { selectedRadio = [] } = this.state;

    return (
      <Modal
        destroyOnClose
        title={title}
        visible={visible}
        onOk={this.handleSave}
        onCancel={this.onToggle}
        width="65%"
        bodyStyle={{ backgroundColor: 'rgb(240, 242, 245)' }}
      >
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
          extraButtons={[]}
          tableExtraProps={{
            pagination: false,
            rowSelection: {
              // 提交报告时，日计划带过来的数据不能取消和修改
              getCheckboxProps: record => ({
                disabled:
                  disabled &&
                  selectedRadio.filter(v => v.id === record.id)[0]?.sourceType === 'SCHEDULE',
              }),
              selectedRowKeys: selectedRadio.map(v => v.id),
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                  selectedRadio: selectedRows.map(v => {
                    const tt = selectedRadio.filter(item => v.id === item.id);
                    const flag = isEmpty(tt);
                    if (flag) {
                      return v;
                    }
                    return { ...tt[0], ...v };
                  }),
                });
              },
            },
            scroll: { y: 500, x: 1950 },
          }}
        />
      </Modal>
    );
  }
}

export default PlanModal;
