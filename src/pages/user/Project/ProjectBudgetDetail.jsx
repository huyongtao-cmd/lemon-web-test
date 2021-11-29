import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Button, Card, Divider, Form, Input, Select, Checkbox, DatePicker } from 'antd';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import router from 'umi/router';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { formatMessage } from 'umi/locale';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import Loading from '@/components/core/DataLoading';
import { closeThenGoto } from '@/layouts/routerControl';
import DescriptionList from '@/components/layout/DescriptionList';
import { UdcSelect, FileManagerEnhance } from '@/pages/gen/field';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const { Description } = DescriptionList;
const { Field, FieldLine } = FieldList;

const DOMAIN = 'userProjectBudgetDetail';

@connect(({ loading, userProjectBudgetDetail, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  userProjectBudgetDetail,
  dispatch,
}))
class ProjectBudgetDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { projId: param.projId },
    });
  }

  render() {
    const {
      dispatch,
      loading,
      userProjectBudgetDetail: { feeDataSource, feeFormData, projectshDataSource },
    } = this.props;

    // 获取url上的参数
    const param = fromQs();

    // 费用预算表格
    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: feeDataSource.length,
      dataSource: feeDataSource,
      defaultExpandAllRows: true,
      showCopy: false,
      showAdd: false,
      showDelete: false,
      showSearch: false,
      pagination: false,
      enableSelection: false,
      columns: [
        {
          title: '科目',
          dataIndex: 'accName',
          align: 'left',
        },
        // {
        //   title: '二级预算目录',
        //   dataIndex: 'secondLevelName',
        // },
        // {
        //   title: '三级预算目录',
        //   dataIndex: 'thirdLevelName',
        //   align: 'right',
        // },
        {
          title: '预算控制',
          dataIndex: 'budgetControlFlag',
          // required: true,
          align: 'center',
          render: (value, row, index) => (value === 1 ? '是' : '否'),
        },
        {
          title: '预算总金额',
          dataIndex: 'budgetAmt',
          // required: true,
          align: 'right',
        },
        // {
        //   title: '已使用预算金额',
        //   dataIndex: 'usedAmt',
        //   align: 'right',
        // },

        {
          title: '备注',
          align: 'center',
          dataIndex: 'remark',
        },
      ],
      buttons: [],
    };

    // 项目成员管理表格
    const projectshTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      pagination: false,
      enableSelection: false,
      total: 0,
      dataSource: projectshDataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      showSearch: false,
      columns: [
        {
          title: '项目角色',
          dataIndex: 'role',
        },
        {
          title: '复合能力',
          dataIndex: 'capasetLevelName',
        },
        {
          title: '资源',
          dataIndex: 'resName',
        },
        {
          title: '预计开始日期',
          dataIndex: 'planStartDate',
        },
        {
          title: '预计结束日期',
          dataIndex: 'planEndDate',
        },
        {
          title: '工作台显示',
          dataIndex: 'workbenchFlag',
          align: 'center',
          render: (value, row, index) => {
            if (value === 1) {
              return <div>是</div>;
            }
            if (value === 0) {
              return <div>否</div>;
            }
            return <div>{value}</div>;
          },
        },
        {
          title: '规划当量',
          dataIndex: 'planEqva',
          align: 'right',
        },
        {
          title: '项目号',
          dataIndex: 'projNo',
          align: 'center',
        },
        {
          title: '任务包号',
          dataIndex: 'taskNo',
          align: 'center',
        },
        {
          title: '派发当量系数',
          dataIndex: 'eqvaRatio',
          align: 'right',
        },
        {
          title: 'FromBU',
          dataIndex: 'expenseBuName',
        },
        {
          title: 'ToBU',
          dataIndex: 'receiverBuName',
        },
        {
          title: '合作类型',
          dataIndex: 'cooperationTypeDesc',
          align: 'center',
        },
        {
          title: '验收方式',
          dataIndex: 'acceptMethodName',
          align: 'center',
        },
        {
          title: '总当量',
          dataIndex: 'eqvaQty',
          align: 'right',
        },
        {
          title: '当量工资',
          dataIndex: 'eqvaSalary',
          align: 'right',
        },
        {
          title: 'BU结算价',
          dataIndex: 'buSettlePrice',
          align: 'right',
        },
        {
          title: '管理费',
          dataIndex: 'ohfeePrice',
          align: 'right',
        },
        {
          title: '税点',
          dataIndex: 'taxRate',
          align: 'right',
        },
        {
          title: '当量结算单价',
          dataIndex: 'settlePrice',
          align: 'right',
        },
        {
          title: '参考人天单价',
          dataIndex: 'mandayPrice',
          align: 'right',
        },
        {
          title: '派发金额',
          dataIndex: 'distributedAmt',
          align: 'right',
        },
        {
          title: '已结算当量数',
          dataIndex: 'settledEqva',
          align: 'right',
        },
        {
          title: '已结算金额',
          dataIndex: 'settledAmt',
          align: 'right',
        },
      ],
      leftButtons: [],
    };

    return (
      <PageHeaderWrapper>
        {loading ? (
          <Loading />
        ) : (
          <>
            <Card className="tw-card-rightLine">
              {/* eslint-disable-next-line no-nested-ternary */}
              {!feeFormData.id ? (
                <Button
                  className="tw-btn-primary"
                  size="large"
                  disabled={loading}
                  onClick={() => router.push(`/user/project/projectBudget?projId=${param.projId}`)}
                >
                  新建预算
                </Button>
              ) : feeFormData.budgetStatus === 'CREATE' ? (
                <Button
                  className="tw-btn-primary"
                  size="large"
                  disabled={loading}
                  onClick={() => router.push(`/user/project/projectBudget?projId=${param.projId}`)}
                >
                  修改预算
                </Button>
              ) : (
                ''
              )}

              <Button
                className="tw-btn-primary"
                // icon="save"
                size="large"
                hidden
                disabled={loading}
                onClick={() =>
                  router.push(`/user/project/budgetCompareList?projId=${param.projId}`)
                }
              >
                变更记录
              </Button>

              <Button
                className="tw-btn-primary"
                // icon="save"
                size="large"
                disabled={loading}
                onClick={() => {
                  router.push(`/user/project/budgetAppropriationList?budgetId=${feeFormData.id}`);
                }}
              >
                拨付记录
              </Button>

              <Button
                className="tw-btn-primary"
                size="large"
                disabled={loading}
                onClick={() =>
                  router.push(`/user/project/budgetCompareList?projId=${param.projId}`)
                }
              >
                预实对比
              </Button>

              {feeFormData.budgetStatus === 'ACTIVE' ? (
                <>
                  <Button
                    className="tw-btn-primary"
                    size="large"
                    disabled={loading}
                    onClick={() =>
                      router.push(
                        `/user/project/changeProjectBudget/projectBudgetCreate?projId=${
                          param.projId
                        }`
                      )
                    }
                  >
                    变更预算
                  </Button>
                  <Button
                    className="tw-btn-primary"
                    // icon="save"
                    size="large"
                    disabled={loading}
                    onClick={() => {
                      router.push(
                        '/user/project/budgetAppropriationEdit?budgetId=' + feeFormData.id
                      );
                    }}
                  >
                    拨付申请
                  </Button>
                </>
              ) : (
                ''
              )}
              <Button
                className="tw-btn-primary"
                size="large"
                disabled={loading}
                onClick={() => {
                  const urls = getUrl();
                  const from = stringify({ from: urls });
                  router.push(`/user/project/changeBudgetHistory?projId=${param.projId}&${from}`);
                }}
              >
                变更历史
              </Button>
            </Card>
            <Card
              className="tw-card-adjust"
              title={
                <Title
                  icon="profile"
                  id="ui.menu.user.project.projectBudget"
                  defaultMessage="项目整体费用预算"
                />
              }
            >
              <DescriptionList layout="horizontal" legend="项目费用预算" col={2}>
                <Description term="预算编号">{feeFormData.budgetNo}</Description>
                <Description term="预算名称">{feeFormData.budgetName}</Description>
                <Description term="费用预算总金额">{feeFormData.feeBudgetAmt}</Description>
                <Description term="已拨付费用预算金额">{feeFormData.feeReleasedAmt}</Description>
                <Description term="预算控制">
                  {feeFormData.totalsControlFlag === 1 ? '是' : '否'}
                </Description>
                <Description term="相关项目名称">{feeFormData.projName}</Description>
                <Description term="预算状态">{feeFormData.budgetStatusDesc}</Description>
                <Description term="附件">
                  <FileManagerEnhance
                    api="/api/op/v1/project/projectBudget/sfs/token"
                    dataKey={feeFormData.id}
                    listType="text"
                    disabled
                    preview
                  />
                </Description>
                <Description term="预算创建人">{feeFormData.createUserName}</Description>
                <Description term="预算创建时间">{feeFormData.createTime}</Description>
              </DescriptionList>
              <Divider dashed />
              <DataTable {...editTableProps} />

              <Divider dashed />
              <DescriptionList layout="horizontal" legend="项目当量预算" col={2}>
                <Description term="当量预算总数/金额">
                  {`${feeFormData.eqvaBudgetCnt || '无'}/${feeFormData.eqvaBudgetAmt || '无'}`}
                </Description>
                <Description term="已派发当量总数/金额">
                  {`${feeFormData.distributedEqva || '无'}/${feeFormData.distributedAmt || '无'}`}
                </Description>
                <Description term="已拨付当量数/金额">
                  {`${feeFormData.eqvaReleasedQty || '无'}/${feeFormData.eqvaReleasedAmt || '无'}`}
                </Description>
                <Description term="已结算当量数/金额">
                  {`${feeFormData.settledEqva || '无'}/${feeFormData.settledAmt || '无'}`}
                </Description>
              </DescriptionList>
              <Divider dashed />
              <DataTable {...projectshTableProps} scroll={{ x: 3000 }} />
            </Card>
          </>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default ProjectBudgetDetail;
