import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Modal, Row, Col, Input, Button, Card, Divider, Tag } from 'antd';

import DataTable from '@/components/common/DataTable';
import DescriptionList from '@/components/layout/DescriptionList';

import {
  operationTabList,
  roleColumns,
  incomeColumns,
  operateColumns,
  examPeriodColumns,
} from '@/pages/sys/baseinfo/BuTemplate/config';

const { Description } = DescriptionList;

const financeColumns = [
  {
    title: '科目编号',
    dataIndex: 'accCode',
    align: 'center',
  },
  {
    title: '科目名称',
    dataIndex: 'accName',
  },
  {
    title: '状态',
    dataIndex: 'accStatusName',
    align: 'center',
  },
  {
    title: '汇总',
    dataIndex: 'sumFlag',
    align: 'center',
    render: (value, row, index) =>
      value ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>,
  },
];

@connect(
  ({
    dispatch,
    loading,
    orgbuCreate,
    sysButempDetail,
    sysButemprole,
    sysButempincome,
    sysButempoperation,
  }) => ({
    dispatch,
    loading,
    orgbuCreate,
    sysButempDetail,
    sysButemprole,
    sysButempincome,
    sysButempoperation,
  })
)
class CreateModal extends Component {
  state = {
    searchInputValue: '',
    activeTabKey: 'basic',
    selectedRowKeys: [],
  };

  componentDidMount() {
    const { dispatch, domain } = this.props;
    dispatch({
      type: `${domain}/querySubjtemplates`,
      payload: { offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' },
    }).then(() => {
      const { orgbuCreate } = this.props;
      const { buTemplates } = orgbuCreate;
      if (buTemplates && buTemplates[0]) {
        const { id } = buTemplates[0];
        this.setState({ selectedRowKeys: [id] }, () => {
          this.fetchList(id);
        });
      }
    });
  }

  onTabChange = key => {
    this.setState({ activeTabKey: key });
  };

  onRowChange = (selectedRowKeys, selectedRows) => {
    const id = selectedRowKeys[0];
    this.setState({ selectedRowKeys: [id] }, () => {
      this.fetchList(id);
    });
  };

  searchInput = e => {
    this.setState({
      searchInputValue: e.target.value,
    });
  };

  queryBuTmp = () => {
    const { dispatch, domain } = this.props;
    const { searchInputValue } = this.state;
    dispatch({
      type: `${domain}/querySubjtemplates`,
      payload: { searchInputValue, offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' },
    });
  };

  onSelectTmp = () => {
    const { selectedRowKeys } = this.state;
    const { domain, dispatch, orgbuCreate, toggleModal } = this.props;
    const { buTemplates } = orgbuCreate;

    const buId = selectedRowKeys[0];
    const { tmplName, tmplNo } = buTemplates.find(bu => bu.id === buId);
    dispatch({
      type: `${domain}/updateForm`,
      payload: {
        buTmplId: buId,
        tmplNo,
        tmplName,
      },
    });

    toggleModal();
  };

  fetchList = buId => {
    const { dispatch } = this.props;
    dispatch({
      type: `sysButempDetail/query`,
      payload: {
        id: buId,
      },
    }).then(() => {
      const {
        sysButempDetail: { formData },
      } = this.props;
      dispatch({
        type: `sysButemprole/queryRoleList`,
        payload: { tmplId: buId },
      });
      dispatch({
        type: `sysButempDetail/queryFinanceList`,
        payload: { accTmplId: formData.accTmplId },
      });
      dispatch({
        type: `sysButempincome/queryIncomeList`,
        payload: { tmplId: buId },
      });
      dispatch({
        type: `sysButempDetail/queryEqvaList`,
        payload: { tmplId: buId },
      });
      dispatch({
        type: `sysButempoperation/queryOperateList`,
        payload: { tmplId: buId },
      });
      dispatch({
        type: `sysButempoperation/queryExamPeriodList`,
        payload: { tmplId: buId },
      });
    });
  };

  handleOnRow = record => {
    const { id } = record;
    return {
      onClick: () => this.onRowChange([id]),
    };
  };

  tableCfg = () => {
    const { orgbuCreate } = this.props;
    const { buTemplates, total } = orgbuCreate;
    const { selectedRowKeys } = this.state;

    const tableProps = {
      rowKey: 'id',
      bordered: true,
      sortDirection: 'DESC',
      scroll: { y: '40vh' },
      dataSource: buTemplates,
      total,
      showColumn: false,
      showSearch: false,
      onChange: filters => {
        const { dispatch, domain } = this.props;
        const { searchInputValue } = this.state;
        dispatch({
          type: `${domain}/querySubjtemplates`,
          payload: { searchInputValue, ...filters },
        });
      },
      onRow: this.handleOnRow,
      rowSelection: {
        type: 'radio',
        selectedRowKeys,
        onChange: this.onRowChange,
      },
      columns: [
        {
          title: '模版编号',
          dataIndex: 'tmplNo',
          key: 'id',
          width: '30%',
          sorter: true,
          defaultSortOrder: 'descend',
        },
        {
          title: '名称',
          dataIndex: 'tmplName',
          key: 'name',
          width: '40%',
        },
        {
          title: '模版类型',
          dataIndex: 'tmplTypeName',
          key: 'type',
          width: '30%',
        },
      ],
    };
    return tableProps;
  };

  multiTabCfg = () => {
    const {
      loading,
      domain,
      sysButempDetail: { formData, financeList, eqvaList },
      sysButemprole: { roleList },
      sysButempincome: { incomeList },
      sysButempoperation: { operateList, examPeriodList },
    } = this.props;
    const contentList = {
      basic: (
        <>
          <DescriptionList
            size="large"
            title={formatMessage({ id: `app.settings.menuMap.basic`, desc: '基本信息' })}
            col={2}
          >
            <Description
              term={formatMessage({ id: `sys.baseinfo.buTemplate.tmplNo`, desc: '模板编号' })}
            >
              {formData.tmplNo}
            </Description>
            <Description
              term={formatMessage({ id: `sys.baseinfo.buTemplate.tmplName`, desc: '模板名称' })}
            >
              {formData.tmplName}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description
              term={formatMessage({ id: `sys.baseinfo.buTemplate.tmplType`, desc: '类别' })}
            >
              {formData.tmplTypeName}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description
              term={formatMessage({ id: `sys.baseinfo.buTemplate.remark`, desc: '备注' })}
            >
              {formData.remark}
            </Description>
          </DescriptionList>
        </>
      ),
      finance: (
        <>
          <DescriptionList
            size="large"
            title={formatMessage({ id: `app.settings.menuMap.basic`, desc: '基本信息' })}
            col={2}
            hasSeparator
          >
            <Description
              term={formatMessage({ id: `sys.baseinfo.buTemplate.accTmpl`, desc: '科目模板' })}
            >
              {formData.accTmplName}
            </Description>
            <Description
              term={formatMessage({
                id: `sys.baseinfo.buTemplate.finCalendar`,
                desc: '财务日历格式',
              })}
            >
              {formData.finCalendarName}
            </Description>
            <Description
              term={formatMessage({ id: `sys.baseinfo.buTemplate.currCode`, desc: '币种' })}
            >
              {formData.currCodeName}
            </Description>
          </DescriptionList>
          <div>
            <div className="tw-card-title">
              {formatMessage({ id: `app.settings.menuMap.financeSubj`, desc: '财务科目' })}
            </div>
            <DataTable
              rowKey="id"
              scroll={{ x: 1100 }}
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={false}
              domain={domain}
              loading={loading.effects['sysButempDetail/queryFinanceList']}
              dataSource={financeList}
              columns={financeColumns}
            />
          </div>
        </>
      ),
      role: (
        <div>
          <div className="tw-card-title">
            {formatMessage({ id: `app.settings.menuMap.role`, desc: '角色信息' })}
          </div>
          <DataTable
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            domain={domain}
            loading={loading.effects['sysButemprole/queryRoleList']}
            dataSource={roleList}
            columns={roleColumns}
            rowKey="id"
          />
        </div>
      ),
      income: (
        <div>
          <div className="tw-card-title">
            {formatMessage({ id: `app.settings.menuMap.income`, desc: '资源收入当量' })}
          </div>
          <DataTable
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            domain={domain}
            loading={loading.effects['sysButempincome/queryIncomeList']}
            dataSource={incomeList}
            columns={incomeColumns}
            rowKey="id"
          />
        </div>
      ),
      eqva: (
        <DescriptionList
          title={formatMessage({ id: `app.settings.menuMap.eqva`, desc: '结算当量' })}
        >
          <div>敬请期待</div>
        </DescriptionList>
      ),
      operation: (
        <>
          <div className="tw-card-title">
            {formatMessage({ id: `app.settings.menuMap.operationRange`, desc: '经营范围' })}
          </div>
          <DataTable
            rowKey="id"
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            domain={domain}
            loading={loading.effects['sysButempoperation/queryOperateList']}
            dataSource={operateList}
            columns={operateColumns}
          />
          <Divider dashed />
          <div className="tw-card-title">
            {formatMessage({ id: `app.settings.menuMap.examPeriod`, desc: '考核期间' })}
          </div>
          <DataTable
            rowKey="id"
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            domain={domain}
            loading={loading.effects['sysButempoperation/queryExamPeriodList']}
            dataSource={examPeriodList}
            columns={examPeriodColumns}
          />
        </>
      ),
    };
    return contentList;
  };

  render() {
    const { visible, toggleModal } = this.props;

    const { activeTabKey } = this.state;
    const tableProps = this.tableCfg();
    const multiTab = this.multiTabCfg();

    return (
      <Modal
        title="选择模版"
        visible={visible}
        onOk={this.onSelectTmp}
        onCancel={toggleModal}
        width="80%"
        footer={null}
      >
        <Row>
          <Col span={8}>
            <Row type="flex" align="middle" style={{ marginBottom: 10, flexWrap: 'nowrap' }}>
              <Input size="large" placeholder="请输入模板编号或名称" onChange={this.searchInput} />
              <Button
                className="tw-btn-primary"
                type="primary"
                size="large"
                icon="search"
                style={{ marginLeft: 16 }}
                onClick={this.queryBuTmp}
              >
                查询
              </Button>
            </Row>
            <Row type="flex" align="middle" style={{ marginBottom: 10, flexWrap: 'nowrap' }}>
              <Button
                className="tw-btn-primary"
                type="primary"
                size="large"
                // icon="search"
                onClick={this.onSelectTmp}
              >
                选择模版
              </Button>
            </Row>
            <DataTable {...tableProps} />
          </Col>
          <Col offset={1} span={15}>
            <Card
              className="tw-card-multiTab"
              activeTabKey={activeTabKey}
              tabList={operationTabList}
              onTabChange={this.onTabChange}
            >
              {multiTab[activeTabKey]}
            </Card>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default CreateModal;
