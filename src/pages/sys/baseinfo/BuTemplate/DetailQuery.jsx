import React, { PureComponent } from 'react';
import router from 'umi/router';
import classnames from 'classnames';
import { Button, Card, Divider, Table } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import Loading from '@/components/core/DataLoading';
import { mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

import {
  operationTabList,
  financeColumns,
  roleColumns,
  incomeColumns,
  operateColumns,
  examPeriodColumns,
} from './config';

const { Description } = DescriptionList;

const DOMAIN = 'sysButempDetail';
@connect(
  ({ loading, sysButempDetail, sysButemprole, sysButempincome, sysButempoperation, dispatch }) => ({
    loading,
    sysButempDetail,
    sysButemprole,
    sysButempincome,
    sysButempoperation,
    dispatch,
  })
)
@mountToTab()
class BuTmplDetailQuery extends PureComponent {
  state = {
    operationkey: 'basic',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/query`,
      payload: param,
    }).then(() => {
      // dispatch({ type: `sysButemprole/queryRoleList`, payload: { tmplId: param.id } });
      dispatch({ type: `sysButempincome/queryIncomeList`, payload: { tmplId: param.id } });
      dispatch({ type: `${DOMAIN}/queryEqvaList`, payload: { tmplId: param.id } });
      dispatch({ type: `sysButempoperation/queryOperateList`, payload: { tmplId: param.id } });
      dispatch({ type: `sysButempoperation/queryExamPeriodList`, payload: { tmplId: param.id } });

      this.fetchData();
    });
  }

  fetchData = () => {
    const {
      dispatch,
      sysButempDetail: { formData },
    } = this.props;

    dispatch({
      type: `${DOMAIN}/queryFinanceList`,
      payload: { accTmplId: formData.accTmplId },
    });
  };

  onOperationTabChange = key => {
    this.setState({ operationkey: key });
  };

  render() {
    const {
      loading,
      sysButempDetail: { formData, financeList, eqvaList },
      sysButemprole: { roleList },
      sysButempincome: { incomeList },
      sysButempoperation: { operateList, examPeriodList },
    } = this.props;
    const { operationkey } = this.state;

    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

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
            <Description
              term={formatMessage({ id: `sys.baseinfo.buTemplate.tmplType`, desc: '类别' })}
            >
              {formData.tmplTypeName}
            </Description>
            <Description style={{ visibility: 'hidden' }} term="占位">
              占位
            </Description>
            <Description
              term={formatMessage({ id: `sys.baseinfo.buTemplate.remark`, desc: '备注' })}
            >
              {formData.remark}
            </Description>
          </DescriptionList>
        </>
      ),
      finance: (
        <div>
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
          <div className="tw-card-title">
            {formatMessage({ id: `app.settings.menuMap.financeSubj`, desc: '财务科目' })}
          </div>
          <div style={{ margin: 12 }}>
            <Table
              domain={`${DOMAIN}`}
              loading={loading.effects[`${DOMAIN}/queryFinanceList`]}
              dataSource={financeList}
              columns={financeColumns}
              rowKey="id"
              bordered
            />
          </div>
        </div>
      ),
      role: (
        <div>
          <div className="tw-card-title">
            {formatMessage({ id: `app.settings.menuMap.role`, desc: '角色信息' })}
          </div>
          <div style={{ margin: 12 }}>
            <Table
              // style={{ marginBottom: 24 }}
              domain={`${DOMAIN}`}
              loading={loading.effects[`sysButemprole/queryRoleList`]}
              dataSource={roleList}
              columns={roleColumns.concat()}
              rowKey="id"
              bordered
            />
          </div>
        </div>
      ),
      income: (
        <div>
          <div className="tw-card-title">
            {formatMessage({ id: `app.settings.menuMap.income`, desc: '资源收入当量' })}
          </div>
          <div style={{ margin: 12 }}>
            <Table
              domain={`${DOMAIN}`}
              loading={loading.effects[`sysButempincome/queryIncomeList`]}
              dataSource={incomeList}
              columns={incomeColumns.concat()}
              rowKey="id"
              bordered
            />
          </div>
        </div>
      ),
      eqva: (
        <div>
          <div className="tw-card-title">
            {formatMessage({ id: `app.settings.menuMap.eqva`, desc: '结算当量' })}
          </div>
          <div style={{ margin: 12 }} className="text-center">
            敬请期待。。。
          </div>
        </div>
      ),
      operation: (
        <div>
          <div className="tw-card-title">
            {formatMessage({ id: `app.settings.menuMap.operationRange`, desc: '经营范围' })}
          </div>
          <div style={{ margin: 12 }}>
            <Table
              domain={`${DOMAIN}`}
              loading={loading.effects[`sysButempoperation/queryOperateList`]}
              dataSource={operateList}
              columns={operateColumns.concat()}
              rowKey="id"
              bordered
            />
          </div>
          <Divider dashed />
          <div className="tw-card-title">
            {formatMessage({ id: `app.settings.menuMap.examPeriod`, desc: '考核期间' })}
          </div>
          <div style={{ margin: 12 }}>
            <Table
              domain={`${DOMAIN}`}
              loading={loading.effects[`sysButempoperation/queryExamPeriodList`]}
              dataSource={examPeriodList}
              columns={examPeriodColumns.concat()}
              rowKey="id"
              bordered
            />
          </div>
        </div>
      ),
    };

    return (
      <PageHeaderWrapper title="BU模板详情">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="form"
            size="large"
            disabled={disabledBtn}
            onClick={() =>
              router.push(
                `/plat/buMgmt/butempedit?id=${formData.id}&mode=update&tab=${operationkey}`
              )
            }
          >
            <Title id="misc.update" defaultMessage="编辑" />
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => router.push('/plat/buMgmt/butemplate')}
          >
            <Title id="misc.rtn" defaultMessage="返回" />
          </Button>
        </Card>
        <Card
          className="tw-card-multiTab"
          bordered={false}
          tabList={operationTabList}
          onTabChange={this.onOperationTabChange}
        >
          {formData.id ? contentList[operationkey] : <Loading />}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BuTmplDetailQuery;
