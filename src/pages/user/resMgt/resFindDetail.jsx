import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Card, Table, Divider } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import Loading from '@/components/core/DataLoading';
import {
  resFindTabList,
  examineColumns,
  edubgColumns,
  workbgColumns,
  proExpColumns,
  capaColumns,
  capasetColumns,
  resProjlogColumns,
  certColumns,
  getrpColumns,
} from '@/pages/plat/res/profile/config';

const { Description } = DescriptionList;

const DOMAIN = 'resFindDetail';
@connect(({ loading, resFindDetail, dispatch }) => ({
  loading,
  resFindDetail,
  dispatch,
}))
@mountToTab()
class ResFindDetail extends Component {
  state = {
    operationkey: 'basic',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id: resId } = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { id: resId } });
    dispatch({ type: `${DOMAIN}/background`, payload: { resId } });
    dispatch({ type: `${DOMAIN}/projectExperience`, payload: { resId } });
    dispatch({ type: `${DOMAIN}/capa`, payload: { resId } });
    dispatch({ type: `${DOMAIN}/getrp`, payload: { resId } });
    dispatch({ type: `${DOMAIN}/queryBU`, payload: { resId } });
    dispatch({ type: `${DOMAIN}/queryBuResRole`, payload: { resId } });
    dispatch({ type: `${DOMAIN}/queryBuResExam`, payload: { resId } });
    dispatch({ type: `${DOMAIN}/queryResProjlog`, payload: { resId } });
  }

  onOperationTabChange = key => {
    this.setState({ operationkey: key });
  };

  render() {
    const {
      loading,
      resFindDetail: {
        formData,
        edubgDataSource,
        workbgDataSource,
        certDataSource,
        proExpDataSource,
        capaDataSource,
        capasetDataSource,
        dataSource,
        buResFormData,
        buResRoleDataSource,
        buResExamDataSource,
        resProjlogDataSource,
      },
    } = this.props;
    const { operationkey } = this.state;

    const contentList = {
      // 基本信息（HR、本人）
      basic: (
        <div>
          <DescriptionList size="large" col={2}>
            <Description
              term="姓名" // TODO: 国际化
            >
              {formData.resName}
            </Description>
            <Description
              term="英文名" // TODO: 国际化
            >
              {formData.englishName}
            </Description>
            <Description
              term="性别" // TODO: 国际化
            >
              {formData.resGenderName}
            </Description>
            <Description
              term="出生日期" // TODO: 国际化
            >
              {formData.birthday}
            </Description>
            <Description
              term="移动电话" // TODO: 国际化
            >
              {formData.mobile}
            </Description>
            <Description
              term="固定电话" // TODO: 国际化
            >
              {formData.telNo}
            </Description>
            <Description
              term="平台邮箱" // TODO: 国际化
            >
              {formData.emailAddr}
            </Description>
            <Description
              term="个人邮箱" // TODO: 国际化
            >
              {formData.personalEmail}
            </Description>
            <Description
              term="社交号码" // TODO: 国际化
            >
              {formData.snsType} - {formData.snsNo}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description
              term="通讯地址" // TODO: 国际化
            >
              {(formData.contactCountryName || '') +
                (formData.contactProvinceName || '') +
                (formData.contactCityName || '') +
                (formData.contactAddress || '')}
            </Description>
          </DescriptionList>
        </div>
      ),
      // 组织信息
      organizeInfo: (
        <div>
          <div className="tw-card-title">
            {formatMessage({ id: `plat.res.menuMap.organizeInfo`, desc: '组织信息' })}
          </div>
          <div>
            <DescriptionList size="large" col={2}>
              <Description
                term="所属组织" // TODO: 国际化
              >
                {formData.baseBuName}
              </Description>
              <Description
                term="主服务地" // TODO: 国际化
              >
                {formData.baseCityName}
              </Description>
              <Description
                term="职级" // TODO: 国际化
              >
                {formData.jobGrade}
              </Description>
              <Description
                term="上级资源" // TODO: 国际化
              >
                {buResFormData && buResFormData.presName}
              </Description>
              <Description
                term="合作方式" // TODO: 国际化
              >
                {buResFormData && buResFormData.coopTypeDesc}
              </Description>
              <Description
                term="当量系数" // TODO: 国际化
              >
                {buResFormData && buResFormData.eqvaRatio}
              </Description>
              <Description
                term="BU角色" // TODO: 国际化
              >
                {buResRoleDataSource}
                {/* {buResFormData && buResFormData.roleName} */}
              </Description>
              <Description
                term="期间" // TODO: 国际化
              >
                {buResFormData && buResFormData.dateFrom}~{buResFormData && buResFormData.dateTo}
              </Description>
              <Description
                term="发薪方式" // TODO: 国际化
              >
                {buResFormData && buResFormData.salaryMethodDesc}
              </Description>
              <Description
                term="发薪周期" // TODO: 国际化
              >
                {buResFormData && buResFormData.salaryPeriodDesc}
              </Description>
            </DescriptionList>
          </div>

          <Divider dashed />
          <div className="tw-card-title">
            {formatMessage({ id: `plat.res.menuMap.examine`, desc: '考核' })}
          </div>
          <div>
            <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={false}
              loading={loading.effects[`platResProfileOrg/queryBuResExam`]}
              dataSource={buResExamDataSource}
              columns={examineColumns}
              rowKey="id"
              bordered
            />
          </div>
        </div>
      ),
      // 教育经历
      edubg: (
        <div>
          <Table
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            loading={loading.effects[`platResProfileBackground/query`]}
            dataSource={edubgDataSource}
            columns={edubgColumns}
            rowKey="id"
            bordered
          />
        </div>
      ),
      // 工作经历
      workbg: (
        <div>
          <Table
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            loading={loading.effects[`platResProfileBackground/query`]}
            dataSource={workbgDataSource}
            columns={workbgColumns}
            rowKey="id"
            bordered
          />
        </div>
      ),
      // 项目履历
      proExp: (
        <div>
          <Table
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            loading={loading.effects[`platResProfileProjectExperience/query`]}
            dataSource={proExpDataSource}
            columns={proExpColumns}
            rowKey="id"
            bordered
          />
        </div>
      ),
      // 能力档案
      capa: (
        <div>
          <div className="tw-card-title">
            {formatMessage({ id: `plat.res.menuMap.capaList`, desc: '能力' })}
          </div>
          <div>
            <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={false}
              loading={loading.effects[`platResProfileCapa/query`]}
              dataSource={capaDataSource}
              columns={capaColumns}
              rowKey="id"
              bordered
            />
          </div>
          <Divider dashed />
          <div className="tw-card-title">
            {formatMessage({ id: `plat.res.menuMap.capasetList`, desc: '复合能力' })}
          </div>
          <div>
            <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={false}
              loading={loading.effects[`platResProfileCapa/query`]}
              dataSource={capasetDataSource}
              columns={capasetColumns}
              rowKey="id"
              bordered
            />
          </div>
        </div>
      ),
      // 任务履历
      project: (
        <div>
          <Table
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            loading={loading.effects[`platResProfileOrg/queryResProjlog`]}
            dataSource={resProjlogDataSource}
            columns={resProjlogColumns}
            rowKey="id"
            bordered
          />
        </div>
      ),
      // 奖惩信息
      getrp: (
        <div>
          <Table
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            loading={loading.effects[`platResProfileGetrp/query`]}
            dataSource={dataSource}
            columns={getrpColumns}
            rowKey="id"
            bordered
          />
        </div>
      ),
      // 资质证书
      cert: (
        <div>
          <Table
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            loading={loading.effects[`platResProfileBackground/query`]}
            dataSource={certDataSource}
            columns={certColumns}
            rowKey="id"
            bordered
            scroll={{ x: 1700 }}
          />
        </div>
      ),
    };
    // console.warn(formData);
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="separate"
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => closeThenGoto('/hr/res/resFind')}
          >
            <Title id="misc.rtn" defaultMessage="返回" />
          </Button>
        </Card>
        <Card
          className="tw-card-multiTab"
          bordered={false}
          tabList={resFindTabList}
          onTabChange={this.onOperationTabChange}
        >
          {!formData.id ? <Loading /> : contentList[operationkey]}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ResFindDetail;
