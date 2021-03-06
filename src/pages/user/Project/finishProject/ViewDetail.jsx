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
          title: '????????????',
          align: 'center',
          dataIndex: '',
          width: '15%',
          render: (value, row, index) => {
            if (row.checkMethod === 'AUTO') {
              return '??????????????????';
            }
            return '????????????';
          },
        },
        {
          title: '????????????',
          align: 'center',
          width: '15%',
          dataIndex: 'chkItemName',
        },
        {
          title: '????????????',
          width: '30%',
          dataIndex: 'chkDesc',
        },
        {
          title: '????????????',
          dataIndex: 'finishStatus',
          align: 'center',
          width: '15%',
        },
        {
          title: '??????',
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
          title={<Title icon="profile" text="??????????????????" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="????????????">{formData.applyNo || ''}</Description>
            <Description term="??????">{formData.projName || ''}</Description>
            <Description term="????????????">{formData.projStatusDesc || ''}</Description>
            <Description term="????????????">{formData.workTypeDesc || ''}</Description>
            <Description term="????????????">{formData.pmResName || ''}</Description>
            <Description term="??????BU">{formData.deliBuName || ''}</Description>
            <Description term="???????????????">{formData.deliResName || ''}</Description>
            <Description term="???????????????">{formData.salesmanResName || ''}</Description>
            <Description term="?????????">{formData.applyResName || ''}</Description>
            <Description term="????????????">{formData.applyDate || ''}</Description>
            <Description term="??????????????????">
              {formData.caseShowFlag === 1 && <pre>???</pre>}
              {formData.caseShowFlag === 0 && <pre>???</pre>}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="??????">
              <pre>{formData.remark}</pre>
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="??????????????????(????????????)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_SELF_CHK')}
            />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="??????????????????(??????????????????)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_BUS_EXP_CHK')}
            />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="??????????????????(????????????)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_FIN_CHK')}
            />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="??????????????????(??????????????????)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_DOC_ELEC_CHK')}
            />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="??????????????????(??????????????????)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_DOC_PAPER_CHK')}
            />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="??????????????????(??????????????????)" size="large" col={1}>
            <DataTable
              {...tableProps}
              dataSource={resultChkList.filter(v => v.chkCalss === 'PROJ_CLOSURE_CASE_CHK')}
            />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="??????????????????(????????????)" size="large" col={1}>
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
