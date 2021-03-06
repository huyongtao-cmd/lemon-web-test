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
      // ???????????????HR????????????
      basic: (
        <div>
          <DescriptionList size="large" col={2}>
            <Description
              term="??????" // TODO: ?????????
            >
              {formData.resName}
            </Description>
            <Description
              term="?????????" // TODO: ?????????
            >
              {formData.englishName}
            </Description>
            <Description
              term="??????" // TODO: ?????????
            >
              {formData.resGenderName}
            </Description>
            <Description
              term="????????????" // TODO: ?????????
            >
              {formData.birthday}
            </Description>
            <Description
              term="????????????" // TODO: ?????????
            >
              {formData.mobile}
            </Description>
            <Description
              term="????????????" // TODO: ?????????
            >
              {formData.telNo}
            </Description>
            <Description
              term="????????????" // TODO: ?????????
            >
              {formData.emailAddr}
            </Description>
            <Description
              term="????????????" // TODO: ?????????
            >
              {formData.personalEmail}
            </Description>
            <Description
              term="????????????" // TODO: ?????????
            >
              {formData.snsType} - {formData.snsNo}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description
              term="????????????" // TODO: ?????????
            >
              {(formData.contactCountryName || '') +
                (formData.contactProvinceName || '') +
                (formData.contactCityName || '') +
                (formData.contactAddress || '')}
            </Description>
          </DescriptionList>
        </div>
      ),
      // ????????????
      organizeInfo: (
        <div>
          <div className="tw-card-title">
            {formatMessage({ id: `plat.res.menuMap.organizeInfo`, desc: '????????????' })}
          </div>
          <div>
            <DescriptionList size="large" col={2}>
              <Description
                term="????????????" // TODO: ?????????
              >
                {formData.baseBuName}
              </Description>
              <Description
                term="????????????" // TODO: ?????????
              >
                {formData.baseCityName}
              </Description>
              <Description
                term="??????" // TODO: ?????????
              >
                {formData.jobGrade}
              </Description>
              <Description
                term="????????????" // TODO: ?????????
              >
                {buResFormData && buResFormData.presName}
              </Description>
              <Description
                term="????????????" // TODO: ?????????
              >
                {buResFormData && buResFormData.coopTypeDesc}
              </Description>
              <Description
                term="????????????" // TODO: ?????????
              >
                {buResFormData && buResFormData.eqvaRatio}
              </Description>
              <Description
                term="BU??????" // TODO: ?????????
              >
                {buResRoleDataSource}
                {/* {buResFormData && buResFormData.roleName} */}
              </Description>
              <Description
                term="??????" // TODO: ?????????
              >
                {buResFormData && buResFormData.dateFrom}~{buResFormData && buResFormData.dateTo}
              </Description>
              <Description
                term="????????????" // TODO: ?????????
              >
                {buResFormData && buResFormData.salaryMethodDesc}
              </Description>
              <Description
                term="????????????" // TODO: ?????????
              >
                {buResFormData && buResFormData.salaryPeriodDesc}
              </Description>
            </DescriptionList>
          </div>

          <Divider dashed />
          <div className="tw-card-title">
            {formatMessage({ id: `plat.res.menuMap.examine`, desc: '??????' })}
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
      // ????????????
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
      // ????????????
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
      // ????????????
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
      // ????????????
      capa: (
        <div>
          <div className="tw-card-title">
            {formatMessage({ id: `plat.res.menuMap.capaList`, desc: '??????' })}
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
            {formatMessage({ id: `plat.res.menuMap.capasetList`, desc: '????????????' })}
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
      // ????????????
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
      // ????????????
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
      // ????????????
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
            <Title id="misc.rtn" defaultMessage="??????" />
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
