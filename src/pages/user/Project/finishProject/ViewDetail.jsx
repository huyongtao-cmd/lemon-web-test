import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Tooltip } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';

const { Description } = DescriptionList;

const DOMAIN = 'finishProjectFlow';

@connect(({ loading, finishProjectFlow, dispatch }) => ({
  dispatch,
  loading,
  finishProjectFlow,
}))
@mountToTab()
class ViewDetail extends Component {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({ type: `${DOMAIN}/clean` });

    const { id } = fromQs();
    id &&
      dispatch({
        type: `${DOMAIN}/projClosureApplyDetails`,
        payload: { id },
      });
    const chkClassArr = [
      'PROJ_CLOSURE_SELF_CHK',
      'PROJ_CLOSURE_BUS_EXP_CHK',
      'PROJ_CLOSURE_FIN_CHK',
      'PROJ_CLOSURE_DOC_ELEC_CHK',
      'PROJ_CLOSURE_DOC_PAPER_CHK',
      'PROJ_CLOSURE_CASE_CHK',
      'PROJ_CLOSURE_CASE_SHOW_CHK',
    ];
    id &&
      dispatch({
        type: `${DOMAIN}/checkresult`,
        payload: { id, chkClass: chkClassArr.join(',') },
      });
  }

  render() {
    const {
      loading,
      dispatch,
      finishProjectFlow: { formData, resultChkList },
    } = this.props;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/checkresult`],
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      // pagination: false,
      enableSelection: false,
      rowSelection: {
        getCheckboxProps: (rowKey, rows) => {
          if (rowKey.checkNethod === 'AUTO') {
            return false;
          }
          return true;
        },
      },
      enableDoubleClick: false,
      columns: [
        {
          title: '检查方式',
          align: 'center',
          dataIndex: '',
          width: '15%',
          render: (value, row, index) => {
            if (row.checkMethod === 'AUTO') {
              return '系统自动检查';
            }
            return '人工检查';
          },
        },
        {
          title: '检查事项',
          align: 'center',
          width: '15%',
          dataIndex: 'chkItemName',
        },
        {
          title: '检查说明',
          width: '30%',
          dataIndex: 'chkDesc',
        },
        {
          title: '完成状态',
          dataIndex: 'finishStatus',
          align: 'center',
          width: '15%',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '25%',
          render: (value, row, key) =>
            value && value.length > 10 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <span>{`${value.substr(0, 10)}...`}</span>
              </Tooltip>
            ) : (
              <span>{value}</span>
            ),
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="项目结项详情" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="结项编号">{formData.applyNo || ''}</Description>
            <Description term="项目">{formData.projName || ''}</Description>
            <Description term="项目状态">{formData.projStatusDesc || ''}</Description>
            <Description term="工作类型">{formData.workTypeDesc || ''}</Description>
            <Description term="项目经理">{formData.pmResName || ''}</Description>
            <Description term="交付BU">{formData.deliBuName || ''}</Description>
            <Description term="交付负责人">{formData.deliResName || ''}</Description>
            <Description term="销售负责人">{formData.salesmanResName || ''}</Description>
            <Description term="申请人">{formData.applyResName || ''}</Description>
            <Description term="申请日期">{formData.applyDate || ''}</Description>
            <Description term="项目案例宣传">
              {formData.caseShowFlag === 1 && <pre>是</pre>}
              {formData.caseShowFlag === 0 && <pre>否</pre>}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="备注">
              <pre>{formData.remark}</pre>
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="结项检查事项(申请检查)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_SELF_CHK')}
            />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="结项检查事项(商务费用确认)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_BUS_EXP_CHK')}
            />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="结项检查事项(财务核查)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_FIN_CHK')}
            />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="结项检查事项(电子文档核查)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_DOC_ELEC_CHK')}
            />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="结项检查事项(纸质文档核查)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_DOC_PAPER_CHK')}
            />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="结项检查事项(案例制作核查)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_CASE_CHK')}
            />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="结项检查事项(案例宣传)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_CASE_SHOW_CHK')}
            />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ViewDetail;
