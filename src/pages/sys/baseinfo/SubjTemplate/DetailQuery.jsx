import React, { PureComponent } from 'react';
import moment from 'moment';
import router from 'umi/router';
import classnames from 'classnames';
import { Button, Card, Checkbox, Tag } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import DataTable from '@/components/common/DataTable';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab } from '@/layouts/routerControl';

const { Description } = DescriptionList;

const DOMAIN = 'sysSubjtempDetail';
@connect(({ loading, sysSubjtempDetail, dispatch }) => ({
  loading,
  sysSubjtempDetail,
  dispatch,
}))
@mountToTab()
class SubjTmplDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: param,
    }).then(() => dispatch({ type: `${DOMAIN}/queryDetails`, payload: { tmplId: param.id } }));
  }

  render() {
    const {
      loading,
      sysSubjtempDetail: { formData, dataSource },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const columns = [
      {
        title: '包含',
        dataIndex: 'includeFlag',
        align: 'center',
        render: (value, row, index) =>
          value ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>,
      },
      {
        title: '处理状态',
        dataIndex: 'procStatusName',
        align: 'center',
      },
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
        title: '是否预算科目',
        dataIndex: 'budgetFlag',
        align: 'center',
        render: (value, row, index) => (value === 1 ? '是' : '否'),
      },
      {
        title: '大类',
        dataIndex: 'accType1',
      },
      {
        title: '明细类1',
        dataIndex: 'accType2',
      },
      {
        title: '明细类2',
        dataIndex: 'accType3',
      },
      {
        title: '明细账',
        dataIndex: 'dtlAcc',
      },
      {
        title: '汇总',
        dataIndex: 'sumFlag',
        align: 'center',
        render: (value, row, index) =>
          value ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>,
      },
      {
        title: '子账类型',
        dataIndex: 'ledgertypeName',
        align: 'center',
      },
      {
        title: '处理时间',
        dataIndex: 'procTime',
        render: (value, row, index) => (value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null),
      },
      {
        title: '处理信息',
        dataIndex: 'procInfo',
      },
    ];
    return (
      <PageHeaderWrapper title="科目模板详情">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="form"
            size="large"
            disabled={disabledBtn}
            onClick={() =>
              router.push(`/plat/finAccout/subjtempedit?id=${formData.id}&mode=update`)
            }
          >
            {formatMessage({ id: `misc.update`, desc: '编辑' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={disabledBtn}
            onClick={() => router.push('/plat/finAccout/subjtemplate')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" id="app.settings.menuMap.basic" defaultMessage="基础设置" />}
          bordered={false}
        >
          {formData.id ? (
            <>
              <DescriptionList
                size="large"
                title={formatMessage({ id: `app.settings.menuMap.basic`, desc: '基本信息' })}
                col={2}
                hasSeparator
              >
                <Description
                  term={formatMessage({ id: `sys.baseinfo.subjTemplate.tmplNo`, desc: '模版编号' })}
                >
                  {formData.tmplNo}
                </Description>
                <Description
                  term={formatMessage({
                    id: `sys.baseinfo.subjTemplate.tmplName`,
                    desc: '模版名称',
                  })}
                >
                  {formData.tmplName}
                </Description>
                <Description
                  term={formatMessage({
                    id: `sys.baseinfo.subjTemplate.tmplIndustry`,
                    desc: '适用行业',
                  })}
                >
                  {formData.tmplIndustryName}
                </Description>
                <Description
                  term={formatMessage({
                    id: `sys.baseinfo.subjTemplate.tmplStatus`,
                    desc: '模版状态',
                  })}
                >
                  {formData.tmplStatusName}
                </Description>
                <Description
                  term={formatMessage({
                    id: `sys.baseinfo.subjTemplate.tmplClass`,
                    desc: '模板类别',
                  })}
                >
                  {formData.tmplClassName}
                </Description>
                <Description
                  term={formatMessage({
                    id: `sys.baseinfo.subjTemplate.tmplType`,
                    desc: '适用类型',
                  })}
                >
                  {formData.tmplType}
                </Description>
                <Description term="预算控制级别">{formData.budgetLevel}</Description>
                <Description
                  term={formatMessage({ id: `sys.baseinfo.subjTemplate.remark`, desc: '备注' })}
                >
                  {formData.remark}
                </Description>
              </DescriptionList>

              <div className="tw-card-title">
                {formatMessage({ id: `app.settings.menuMap.subjtemplate`, desc: '科目信息' })}
              </div>
              <div style={{ margin: 12 }}>
                <DataTable
                  enableSelection={false}
                  showSearch={false}
                  showColumn={false}
                  pagination={false}
                  domain={`${DOMAIN}`}
                  loading={disabledBtn}
                  dataSource={dataSource}
                  columns={columns}
                  rowKey="id"
                />
              </div>
            </>
          ) : (
            <Loading />
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SubjTmplDetail;
