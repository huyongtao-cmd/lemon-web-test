import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card } from 'antd';
import Link from 'umi/link';

import { fromQs } from '@/utils/stringUtils';
import { mountToTab } from '@/layouts/routerControl';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

const DOMAIN = 'custExpDetail';
const { Description } = DescriptionList;

@connect(({ loading, custExpDetail, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  custExpDetail,
}))
@mountToTab()
class CustExpDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();

    dispatch({ type: `${DOMAIN}/clean` });

    id &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: id,
      });

    taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
  }

  render() {
    const {
      dispatch,
      loading,
      custExpDetail: { formData, dataList, fieldsConfig, flowForm },
    } = this.props;
    const { id, taskId, prcId, from } = fromQs();

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      filterMultiple: false,
      enableSelection: false,
      pagination: false,
      dataSource: dataList,
      scroll: {
        x: 1500,
      },
      columns: [
        {
          title: '报销人',
          dataIndex: 'reimResName',
        },
        {
          title: '费用发生日期',
          dataIndex: 'feeDate',
        },
        {
          title: '科目',
          dataIndex: 'accName',
        },
        // {
        //   title: '收款状态',
        //   dataIndex: 'recvStatusName',
        // },
        // {
        //   title: '请款状态',
        //   dataIndex: 'expapplyStatusName',
        // },
        {
          title: '报销说明',
          dataIndex: 'reimDesc',
        },
        {
          title: '请款金额(不含税)',
          dataIndex: 'applyAmt',
          align: 'right',
        },
        {
          title: '货币码',
          dataIndex: 'currCodeDesc',
          align: 'center',
        },
        {
          title: '员工报销金额(含税)',
          dataIndex: 'taxedReimAmt',
          align: 'right',
        },
        {
          title: '员工报销金额(不含税)',
          dataIndex: 'reimAmt',
          align: 'right',
        },
        {
          title: '增值税税率',
          dataIndex: 'taxRate',
          align: 'right',
        },
        {
          title: '税额',
          dataIndex: 'taxAmt',
          align: 'right',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="销售合同详情">
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { taskKey } = fieldsConfig;
            const { remark } = bpmForm;
            const { key } = operation;

            return Promise.resolve(true);
          }}
        >
          <Card
            className="tw-card-adjust"
            bordered={false}
            title={<Title icon="profile" text="报表信息" />}
          >
            <DescriptionList size="large" col={2}>
              <Description term="请款单号">{formData.custexpApplyNo}</Description>
              <Description term="申请日期">{formData.custexpApplyDate}</Description>
              <Description term="请款单状态">{formData.custexpApplyStatusName}</Description>
              <Description term="审批状态">{formData.apprStatusName}</Description>
              {/* <Description term="核销状态">{formData.clearStatusName}</Description> */}
              <Description term="客户">{formData.custName}</Description>
              <Description term="申请人">{formData.resName}</Description>
              <Description term="事由类型/事由号">
                {`${formData.reasonTypeName}  ${formData.reasonName}`}
              </Description>
              <Description term="费用承担BU">{formData.expenseBuName}</Description>
              <Description term="费用承担公司">{formData.expenseOuName}</Description>
              <Description term="请款总金额(不含税)">{formData.applyAmt}</Description>
              <Description term="币种">{formData.currCodeDesc}</Description>
              <Description term="请款总金额(含税)">{formData.taxedApplyAmt}</Description>
              <Description term="税率">{formData.taxRate + '%'}</Description>
            </DescriptionList>

            <DescriptionList size="large" col={2}>
              <Description term="相关报销单">
                {dataList &&
                  dataList.map(v => {
                    let type;
                    switch (v.reimType2) {
                      // 差旅报销
                      case 'TRIP': {
                        type = 'trip';
                        break;
                      }
                      // 行政订票报销
                      case 'TICKET': {
                        type = 'trip';
                        break;
                      }
                      // 专项费用报销
                      case 'SPEC': {
                        type = 'spec';
                        break;
                      }
                      // 特殊费用报销 -因公报销
                      case 'BSPECIAL': {
                        type = 'particular';
                        break;
                      }
                      // 特殊费用报销 -个人报销
                      case 'PSPECIAL': {
                        type = 'particular';
                        break;
                      }
                      // 非差旅报销
                      default: {
                        type = 'normal';
                        break;
                      }
                    }
                    return (
                      <div>
                        <Link
                          className="tw-link"
                          to={`/plat/expense/${type}/view?id=${v.reimId}`}
                          key={v.id}
                        >
                          {v.reimNo}
                        </Link>
                      </div>
                    );
                  })}
              </Description>
            </DescriptionList>
          </Card>

          <Card
            className="tw-card-adjust"
            bordered={false}
            title={<Title icon="profile" text="请款单明细" />}
            style={{ marginTop: 6 }}
          >
            <DataTable {...tableProps} />
          </Card>

          <Card
            className="tw-card-adjust"
            bordered={false}
            title={<Title icon="profile" text="请款账户信息" />}
            style={{ marginTop: 6 }}
          >
            <DescriptionList size="large" col={2}>
              <Description term="收款账户">{formData.accountNo}</Description>
              <Description term="收款银行">{formData.bankName}</Description>
              <Description term="户名">{formData.accName}</Description>
              <Description term="收款银行网点名称">{formData.bankBranch}</Description>
            </DescriptionList>
          </Card>

          {!taskId && <BpmConnection source={[{ docId: id, procDefKey: 'ACC_A37' }]} />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default CustExpDetail;
