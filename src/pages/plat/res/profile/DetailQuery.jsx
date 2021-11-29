import React, { Component } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import router from 'umi/router';
import VideoFlv from '@/components/common/VideoFlv';
import { Button, Card, Table, Divider, Row, Col, Tag, Modal } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import noVideoBig from '@/assets/img/noVideoBig.svg';
import Loading from '@/components/core/DataLoading';
import { FileManagerEnhance } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import MyVacation from './MyVacation';

import {
  operationTabList,
  examineColumns,
  edubgColumns,
  workbgColumns,
  proExpColumns,
  capaColumns,
  capasetColumns,
  resProjlogColumns,
  evalColumns,
  certColumns,
  financeInfoColumns,
  entryExitColumns,
  getrpColumns,
} from './config';

import styles from './component/selfEvaluation.less';

const { Description } = DescriptionList;

const defaultPagination = {
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
  showTotal: total => `共 ${total} 条`,
  defaultPageSize: 10,
  defaultCurrent: 1,
  size: 'default',
};

const DOMAIN = 'platResQuery';
@connect(
  ({
    loading,
    platResQuery,
    platResProfileBackground,
    platResProfileProjectExperience,
    platResProfileFinance,
    platResProfileCapa,
    platResProfileGetrp,
    platResProfileOrg,
    platResProfilePersonel,
    platResEntryExitDetail,
    // user,
    dispatch,
  }) => ({
    loading,
    platResQuery,
    platResProfileBackground,
    platResProfileProjectExperience,
    platResProfileFinance,
    platResProfileCapa,
    platResProfileGetrp,
    platResProfileOrg,
    // user,
    dispatch,
    platResProfilePersonel,
    platResEntryExitDetail,
  })
)
@mountToTab()
class ResDetailQuery extends Component {
  state = {
    operationkey: 'basic',
    resListModalVisible: false,
    resListModalTitle: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: param,
    }).then(() => {
      const resId = param.id;
      dispatch({ type: `${DOMAIN}/query`, payload: { id: resId } });
      dispatch({ type: `${DOMAIN}/fetchVideoUrl`, payload: resId });
      dispatch({ type: `${DOMAIN}/queryList`, payload: { id: resId } });
      dispatch({ type: `platResProfileBackground/query`, payload: { resId } });
      dispatch({ type: `platResProfileProjectExperience/query`, payload: { resId } });
      dispatch({ type: `platResProfileFinance/query`, payload: { resId } });
      dispatch({ type: `platResProfileCapa/query`, payload: { resId, limit: 0 } });
      dispatch({ type: `platResProfileGetrp/query`, payload: { resId } });
      dispatch({ type: `platResProfileOrg/query`, payload: { resId } });
      dispatch({ type: `platResProfileOrg/queryBuResRole`, payload: { resId } });
      dispatch({ type: `platResProfileOrg/queryBuResExam`, payload: { resId } });
      dispatch({ type: `platResProfileOrg/queryResProjlog`, payload: { resId } });
      dispatch({ type: `platResProfileOrg/queryEval`, payload: { resId } });
      dispatch({ type: `platResProfilePersonel/query`, payload: { resId } });
      dispatch({ type: `platResEntryExitDetail/query`, payload: { resId } });
      this.fetchData();
    });
  }

  fetchData = () => {
    const {
      dispatch,
      platResQuery: { formData },
    } = this.props;
  };

  onOperationTabChange = key => {
    const { dispatch } = this.props;
    this.setState({ operationkey: key });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        pageConfig: {},
      },
    });
    if (key === 'platInfo') {
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'RES_ARCHIVES_MANAGEMENT_INFORMATION_PLATFORM' },
      });
    } else if (key === 'organizeInfo') {
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'RES_ARCHIVES_MANAGEMENT_ORGANIZE_NFORMATION' },
      });
    }
  };

  expandedRowRender = (record, index, indent, expanded) => {
    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      dataSource: record.twResCapaListView,
      pagination: false,
      columns: [
        {
          title: '能力',
          dataIndex: 'entryName',
          width: '20%',
        },
        {
          title: '状态',
          dataIndex: 'obtainStatusName',
          align: 'center',
          width: '20%',
        },
        {
          title: '获得日期',
          dataIndex: 'obtainDate',
          align: 'center',
          width: '20%',
        },
        {
          title: '上次认证日期',
          dataIndex: 'lastRenewDate',
          align: 'center',
          width: '20%',
        },
        {
          title: '到期日期',
          dataIndex: 'dueDate',
          align: 'center',
          width: '20%',
        },
      ],
    };

    return <Table style={{ marginLeft: '-8px', marginRight: '-8px' }} {...tableProps} />;
  };

  renderPage = key => {
    const {
      platResQuery: { formData, pageConfig },
    } = this.props;
    if (pageConfig) {
      if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
        return <div />;
      }
      const currentBlockConfig = pageConfig.pageBlockViews[0];
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      let fields = [];
      if (key === 'platInfo') {
        fields = [
          <Description term={pageFieldJson.resNo.displayName} key="resNo">
            {formData.resNo}
          </Description>,
          <Description term={pageFieldJson.resStatus.displayName} key="resStatus">
            {formData.resStatusName}
          </Description>,
          <Description term={pageFieldJson.startDate.displayName} key="startDate">
            {formData.startDate}
          </Description>,
          <Description term={pageFieldJson.lasttaskdate.displayName} key="lasttaskdate">
            {formData.lastTaskDate}
          </Description>,
          <Description term={pageFieldJson.resType1.displayName} key="resType1">
            {formData.resType1Name}
          </Description>,
          <Description term={pageFieldJson.resType2.displayName} key="resType2">
            {formData.resType2Name}
          </Description>,

          <Description term={pageFieldJson.needUseraccFlag.displayName} key="needUseraccFlag">
            {formData.needUseraccFlag === 0 ? '否' : '是'}
          </Description>,
          <Description term={pageFieldJson.busitripFlag.displayName} key="busitripFlag">
            {formData.busitripFlagName}
          </Description>,
          <Description term={pageFieldJson.serviceType.displayName} key="serviceType">
            {formData.serviceTypeName}
          </Description>,
          <Description term={pageFieldJson.serviceClockFrom.displayName} key="serviceClockFrom">
            {formData.serviceClock}
          </Description>,
          <Description term={pageFieldJson.ouId.displayName} key="ouId">
            {formData.ouName}
          </Description>,
          <Description term={pageFieldJson.jobGrade.displayName} key="jobGrade">
            {formData.jobGrade}
          </Description>,
          <Description term={pageFieldJson.empNo.displayName} key="empNo">
            {formData.empNo}
          </Description>,
          <Description term={pageFieldJson.internDate.displayName} key="internDate">
            {formData.internDate}
          </Description>,
          <Description term={pageFieldJson.enrollDate.displayName} key="enrollDate">
            {formData.enrollDate}
          </Description>,
          <Description term={pageFieldJson.regularDate.displayName} key="regularDate">
            {formData.regularDate}
          </Description>,
          <Description term={pageFieldJson.contractSignDate.displayName} key="contractSignDate">
            {formData.contractSignDate}
          </Description>,
          <Description term={pageFieldJson.contractExpireDate.displayName} key="contractExpireDate">
            {formData.contractExpireDate}
          </Description>,
          <Description term={pageFieldJson.probationBeginDate.displayName} key="probationBeginDate">
            {formData.probationBeginDate}
          </Description>,
          <Description term={pageFieldJson.probationEndDate.displayName} key="probationEndDate">
            {formData.probationEndDate}
          </Description>,
          <Description term={pageFieldJson.telfeeQuota.displayName} key="telfeeQuota">
            {formData.telfeeQuota}
          </Description>,
          <Description term={pageFieldJson.compfeeQuota.displayName} key="compfeeQuota">
            {formData.compfeeQuota}
          </Description>,
          <Description term={pageFieldJson.accessLevel.displayName} key="accessLevel">
            {formData.accessLevel}
          </Description>,
          <Description term={pageFieldJson.hrStatus.displayName} key="hrStatus">
            {formData.hrStatusName}
          </Description>,
          <Description term="主服务地">{formData.baseCityName}</Description>,
          <Description term="无加班人员">
            {formData.inLieuFlag && formData.inLieuFlag === 'NO' && <pre>是</pre>}
            {formData.inLieuFlag && formData.inLieuFlag === 'YES' && <pre>否</pre>}
          </Description>,
          <Description term="参加商务基本资质培训">
            {formData.busiTrainFlag && formData.busiTrainFlag === 'YES' && <pre>是</pre>}
            {formData.busiTrainFlag && formData.busiTrainFlag === 'NO' && <pre>否</pre>}
          </Description>,
        ];
      }
      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <div>
          <DescriptionList size="large" col={2}>
            {filterList}
          </DescriptionList>
        </div>
      );
    }
    return null;
  };

  renderPage1 = key => {
    const {
      platResQuery: { formData, pageConfig, resList, adjustList },
      platResProfileOrg: { buResFormData, buResRoleDataSource },
      dispatch,
      loading,
    } = this.props;
    const { resListModalVisible, resListModalTitle } = this.state;
    const param = fromQs();
    const resId = param.id;
    if (pageConfig) {
      if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
        return <div />;
      }
      const currentBlockConfig = pageConfig.pageBlockViews[0];
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      // let fields = [];
      let BuInfoColumns = [];
      let AdjustColumns = [];
      if (key === 'organizeInfo') {
        // fields = [
        //   <Description
        //     term="所属组织" // TODO: 国际化
        //   >
        //     {formData.baseBuName}
        //   </Description>,
        //   <Description
        //     term="主服务地" // TODO: 国际化
        //   >
        //     {formData.baseCityName}
        //   </Description>,

        //   <Description
        //     term={pageFieldJson.pResId.displayName} // TODO: 国际化
        //     key="pResId"
        //   >
        //     {buResFormData && buResFormData.presName}
        //   </Description>,
        //   <Description
        //     term={pageFieldJson.coopType.displayName} // TODO: 国际化
        //     key="coopType"
        //   >
        //     {buResFormData && buResFormData.coopTypeDesc}
        //   </Description>,
        //   <Description
        //     term={pageFieldJson.eqvaRatio.displayName} // TODO: 国际化
        //     key="eqvaRatio"
        //   >
        //     {buResFormData && buResFormData.eqvaRatio}
        //   </Description>,
        //   <Description
        //     term={pageFieldJson.buRoleName.displayName} // TODO: 国际化
        //     key="buRoleName"
        //   >
        //     {buResRoleDataSource}
        //   </Description>,
        //   <Description
        //     term={pageFieldJson.dateFrom.displayName} // TODO: 国际化
        //   >
        //     {buResFormData && buResFormData.dateFrom}~{buResFormData && buResFormData.dateTo}
        //   </Description>,
        //   <Description
        //     term={pageFieldJson.salaryMethod.displayName} // TODO: 国际化
        //     key="salaryMethod"
        //   >
        //     {buResFormData && buResFormData.salaryMethodDesc}
        //   </Description>,
        //   <Description
        //     term={pageFieldJson.salaryPeriod.displayName} // TODO: 国际化
        //     key="salaryPeriod"
        //   >
        //     {buResFormData && buResFormData.salaryPeriodDesc}
        //   </Description>,
        // ];
        const openResListModal = row => {
          dispatch({
            type: `${DOMAIN}/queryAdjustList`,
            payload: { resId, buId: row.buId },
          });
          this.setState({
            resListModalVisible: true,
            resListModalTitle: row.buName,
          });
        };
        BuInfoColumns = [
          {
            title: 'BU',
            dataIndex: 'buName',
            align: 'center',
          },
          {
            title: 'BaseBU',
            dataIndex: 'isBaseBu',
            align: 'center',
            render: (value, row, index) => <span>{value === '1' ? '是' : '否'}</span>,
          },
          {
            title: '加入时间',
            dataIndex: 'dateFrom',
            align: 'center',
          },
          {
            title: '退出时间',
            dataIndex: 'dateTo',
            align: 'center',
            render: value => (value === null ? '至今' : value),
          },
          {
            title: '状态',
            dataIndex: 'resStatusDesc',
            align: 'center',
          },
          {
            title: '上级',
            dataIndex: 'presName',
            align: 'center',
          },
          {
            title: '合作方式',
            dataIndex: 'coopTypeDesc',
            align: 'center',
          },
          {
            title: '当量系数',
            dataIndex: 'eqvaRatio',
            align: 'center',
            render: (value, row, index) => (
              <span>
                {value || '-'} <a onClick={() => openResListModal(row)}>调整记录</a>
              </span>
            ),
          },
          {
            title: '发薪方式',
            dataIndex: 'salaryMethodDesc',
            align: 'center',
          },
          {
            title: '发薪周期',
            dataIndex: 'salaryPeriodDesc',
            align: 'center',
          },
          {
            title: 'BU角色',
            dataIndex: 'buRoleName',
            align: 'center',
          },
          {
            title: '备注',
            dataIndex: 'remark',
            align: 'left',
            width: 300,
            render: (value, row, index) => {
              if (value) {
                return <pre>{value}</pre>;
              }
              return <pre>{value}</pre>;
            },
          },
        ];
        AdjustColumns = [
          {
            title: '期间',
            align: 'center',
            width: 260,
            // dataIndex: 'startDate',
            render: (value, row, index) => (
              <span>{row.startDate + ' ~ ' + (row.endDate === null ? '至今' : row.endDate)}</span>
            ),
          },
          {
            title: '当量系数',
            dataIndex: 'eqvaRatio',
            align: 'center',
          },
          {
            title: '备注',
            dataIndex: 'remark',
            align: 'left',
            width: 300,
            render: (value, row, index) => {
              if (value) {
                return <pre>{value}</pre>;
              }
              return <pre>{value}</pre>;
            },
          },
        ];
      }
      // const filterList = fields
      //   .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      //   .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      const handleCancel = () => {
        this.setState({
          resListModalVisible: false,
          resListModalTitle: '',
        });
      };
      return (
        <div>
          {/* <DescriptionList size="large" col={2}>
            {filterList}
          </DescriptionList> */}
          <Table
            enableSelection={false}
            pagination={defaultPagination}
            rowKey={(record, index) => `${index}`}
            showSearch={false}
            showColumn={false}
            loading={loading.effects[`${DOMAIN}/queryList`]}
            dataSource={resList}
            columns={BuInfoColumns}
            scroll={{ x: 2000 }}
            bordered
          />
          <Modal
            title="当量系数调整记录"
            visible={resListModalVisible}
            onCancel={handleCancel}
            footer={null}
            width={800}
          >
            <div style={{ color: '#284488' }}>{resListModalTitle}</div>
            <Table
              enableSelection={false}
              rowKey={(record, index) => `${index}`}
              showSearch={false}
              showColumn={false}
              loading={loading.effects[`${DOMAIN}/queryAdjustList`]}
              dataSource={adjustList}
              columns={AdjustColumns}
              bordered
              pagination={false}
            />
          </Modal>
        </div>
      );
    }
    return null;
  };

  render() {
    const {
      loading,
      platResQuery: { formData, videoUrl, pageConfig },
      platResProfileBackground: { edubgDataSource, workbgDataSource, certDataSource },
      platResProfileProjectExperience: { dataSource: proExpDataSource },
      platResProfileFinance: { abAccDataSource },
      platResProfileCapa: { capaDataSource, capasetDataSource },
      platResProfileGetrp: { dataSource },
      platResProfileOrg: {
        buResFormData,
        buResRoleDataSource,
        buResExamDataSource,
        resProjlogDataSource,
        resEvalAvgDataSource,
      },
      platResProfilePersonel: { personelFormData },
      platResEntryExitDetail: { entryExitList },
      // user: { user },
    } = this.props;
    const { selfEvaluation = '', selfTagging = '' } = formData;
    const selfTag = selfTagging && selfTagging.length > 0 ? selfTagging.split(',') : [];
    const { operationkey } = this.state;
    const param = fromQs();
    const element =
      operationkey === 'organizeInfo' && !loading.effects[`${DOMAIN}/getPageConfig`]
        ? this.renderPage1('organizeInfo')
        : null;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    const contentList = {
      // 基本信息（HR、本人）
      basic: (
        <div>
          <DescriptionList
            size="large"
            title="个人信息" // TODO: 国际化
            col={2}
          >
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
              term="证件类型" // TODO: 国际化
            >
              {formData.idTypeName}
            </Description>
            <Description
              term="证件号码" // TODO: 国际化
            >
              {formData.idNo}
            </Description>
            <Description
              term="证件有效期" // TODO: 国际化
            >
              {formData.idValidFrom}~{formData.idValidTo}
            </Description>
            <Description
              term="证件照片" // TODO: 国际化
            >
              <FileManagerEnhance
                api="/api/person/v1/res/idphoto/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Description>
            <Description
              term="国籍" // TODO: 国际化
            >
              {formData.nationalityName}
            </Description>
            <Description
              term="籍贯" // TODO: 国际化
            >
              {formData.birthplace}
            </Description>
            <Description
              term="民族" // TODO: 国际化
            >
              {formData.nation}
            </Description>
            <Description
              term="婚姻状况" // TODO: 国际化
            >
              {formData.maritalName}
            </Description>
            <Description
              term="护照号码" // TODO: 国际化
            >
              {formData.passportNo}
            </Description>
            <Description
              term="护照有效期" // TODO: 国际化
            >
              {formData.passportValidFrom}~{formData.passportValidTo}
            </Description>
            <Description
              term="护照照片" // TODO: 国际化
            >
              <FileManagerEnhance
                api="/api/person/v1/res/passportphoto/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Description>
            <Description
              style={{ paddingBottom: '14px' }}
              term="护照发放地" // TODO: 国际化
            >
              {formData.passportIssueplace}
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList
            size="large"
            title="联系方式" // TODO: 国际化
            col={2}
          >
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
            <Description
              term="通讯地址" // TODO: 国际化
            >
              {(formData.contactCountryName || '') +
                (formData.contactProvinceName || '') +
                (formData.contactCityName || '') +
                (formData.contactAddress || '')}
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList
            size="large"
            title="紧急联系人" // TODO: 国际化
            col={2}
          >
            <Description
              term="姓名" // TODO: 国际化
            >
              {formData.emContactName}
            </Description>
            <Description
              term="移动电话" // TODO: 国际化
            >
              {formData.emContactMobile}
            </Description>
            <Description
              term="固定电话" // TODO: 国际化
            >
              {formData.emContactTel}
            </Description>
            <Description
              term="关系" // TODO: 国际化
            >
              {formData.emContactRelation}
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList
            size="large"
            title="备注信息" // TODO: 国际化
            col={1}
          >
            <DescriptionList size="large" col={1}>
              <Description term="能力备注">
                <pre style={{ width: 798 }}>{formData.remark}</pre>
              </Description>
            </DescriptionList>
            <DescriptionList size="large" col={1}>
              <Description term="其它备注">
                <pre style={{ width: 798 }}>{formData.remark1}</pre>
              </Description>
            </DescriptionList>
          </DescriptionList>
        </div>
      ),
      // 基本信息（负责人） // 暂时先放这，可能会根据登录人不同显示不同
      // basicBy: (
      //   <div>
      //     <DescriptionList
      //       size="large"
      //       title="个人信息" // TODO: 国际化
      //       col={2}
      //     >
      //       <Description
      //         term="姓名" // TODO: 国际化
      //       >
      //         {formData.resName}
      //       </Description>
      //       <Description
      //         term="英文名" // TODO: 国际化
      //       >
      //         {formData.englishName}
      //       </Description>
      //       <Description
      //         term="性别" // TODO: 国际化
      //       >
      //         {formData.resGenderName}
      //       </Description>
      //       <Description
      //         term="出生日期" // TODO: 国际化
      //       >
      //         {formData.birthday}
      //       </Description>
      //       <Description
      //         term="国籍" // TODO: 国际化
      //       >
      //         {formData.nationalityName}
      //       </Description>
      //       <Description
      //         term="籍贯" // TODO: 国际化
      //       >
      //         {formData.birthplace}
      //       </Description>
      //       <Description
      //         term="民族" // TODO: 国际化
      //       >
      //         {formData.nation}
      //       </Description>
      //     </DescriptionList>
      //     <Divider dashed />
      //     <DescriptionList
      //       size="large"
      //       title="联系方式" // TODO: 国际化
      //       col={2}
      //     >
      //       <Description
      //         term="移动电话" // TODO: 国际化
      //       >
      //         {formData.mobile}
      //       </Description>
      //       <Description
      //         term="固定电话" // TODO: 国际化
      //       >
      //         {formData.telNo}
      //       </Description>
      //       <Description
      //         term="平台邮箱" // TODO: 国际化
      //       >
      //         {formData.emailAddr}
      //       </Description>
      //       <Description
      //         term="个人邮箱" // TODO: 国际化
      //       >
      //         {formData.personalEmail}
      //       </Description>
      //       <Description
      //         term="社交号码" // TODO: 国际化
      //       >
      //         {formData.snsType} - {formData.snsNo}
      //       </Description>
      //       <Description
      //         term="通讯地址" // TODO: 国际化
      //       >
      //         {formData.contactAddress}
      //       </Description>
      //     </DescriptionList>
      //     <Divider dashed />
      //     <DescriptionList
      //       size="large"
      //       title="紧急联系人" // TODO: 国际化
      //       col={2}
      //     >
      //       <Description
      //         term="姓名" // TODO: 国际化
      //       >
      //         {formData.emContactName}
      //       </Description>
      //       <Description
      //         term="移动电话" // TODO: 国际化
      //       >
      //         {formData.emContactMobile}
      //       </Description>
      //       <Description
      //         term="固定电话" // TODO: 国际化
      //       >
      //         {formData.emContactTel}
      //       </Description>
      //       <Description
      //         term="关系" // TODO: 国际化
      //       >
      //         {formData.emContactRelation}
      //       </Description>
      //     </DescriptionList>
      //   </div>
      // ),
      // 平台信息
      platInfo:
        operationkey === 'platInfo' && !loading.effects[`${DOMAIN}/getPageConfig`]
          ? this.renderPage('platInfo')
          : null,
      // <div>
      //   <DescriptionList size="large" col={2}>
      //     <Description
      //       term="资源编号" // TODO: 国际化
      //     >
      //       {formData.resNo}
      //     </Description>
      //     <Description
      //       term="资源状态" // TODO: 国际化
      //     >
      //       {formData.resStatusName}
      //     </Description>
      //     <Description
      //       term="进入平台时间" // TODO: 国际化
      //     >
      //       {formData.startDate}
      //     </Description>
      //     <Description
      //       term="最近一次任务时间" // TODO: 国际化
      //     >
      //       {formData.lastTaskDate}
      //     </Description>
      //     <Description
      //       term="资源类型一" // TODO: 国际化
      //     >
      //       {formData.resType1Name}
      //     </Description>
      //     <Description
      //       term="资源类型二" // TODO: 国际化
      //     >
      //       {formData.resType2Name}
      //     </Description>

      //     <Description
      //       term="是否需要用户账号" // TODO: 国际化
      //     >
      //       {formData.needUseraccFlag === 0 ? '否' : '是'}
      //     </Description>
      //     <Description
      //       term="是否出差" // TODO: 国际化
      //     >
      //       {formData.busitripFlagName}
      //     </Description>
      //     <Description
      //       term="服务方式" // TODO: 国际化
      //     >
      //       {formData.serviceTypeName}
      //     </Description>
      //     <Description
      //       term="服务时间段" // TODO: 国际化
      //     >
      //       {formData.serviceClock}
      //     </Description>
      //     <Description
      //       term="所属公司" // TODO: 国际化
      //     >
      //       {formData.ouName}
      //     </Description>
      //     <Description
      //       term="工号" // TODO: 国际化
      //     >
      //       {formData.empNo}
      //     </Description>
      //     <Description
      //       term="入职日期" // TODO: 国际化
      //     >
      //       {formData.enrollDate}
      //     </Description>
      //     <Description
      //       term="转正日期" // TODO: 国际化
      //     >
      //       {formData.regularDate}
      //     </Description>
      //     <Description
      //       term="合同签订日期" // TODO: 国际化
      //     >
      //       {formData.contractSignDate}
      //     </Description>
      //     <Description
      //       term="合同到期日期" // TODO: 国际化
      //     >
      //       {formData.contractExpireDate}
      //     </Description>
      //     <Description
      //       term="试用期开始日期" // TODO: 国际化
      //     >
      //       {formData.probationBeginDate}
      //     </Description>
      //     <Description
      //       term="试用期结束日期" // TODO: 国际化
      //     >
      //       {formData.probationEndDate}
      //     </Description>
      //     <Description
      //       term="话费额度" // TODO: 国际化
      //     >
      //       {formData.telfeeQuota}
      //     </Description>
      //     <Description
      //       term="电脑额度" // TODO: 国际化
      //     >
      //       {formData.compfeeQuota}
      //     </Description>
      //     <Description
      //       term="安全级别" // TODO: 国际化
      //     >
      //       {formData.accessLevel}
      //     </Description>
      //     <Description
      //       term="人事状态" // TODO: 国际化
      //     >
      //       {formData.hrStatusName}
      //     </Description>
      //     <Description
      //       term="职级" // TODO: 国际化
      //     >
      //       {formData.jobGrade}
      //     </Description>
      //   </DescriptionList>
      // </div>
      // 组织信息
      organizeInfo: (
        <div>
          <div className="tw-card-title">
            {formatMessage({ id: `plat.res.menuMap.organizeInfo`, desc: '组织信息' })}
          </div>
          <div>{element}</div>

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
      // 个人假期
      vacation: <MyVacation />,
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
            {formatMessage({ id: `plat.res.menuMap.capasetList`, desc: '复合能力' })}
          </div>
          <div>
            <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={defaultPagination}
              loading={loading.effects[`platResProfileCapa/query`]}
              dataSource={capasetDataSource}
              columns={capasetColumns}
              rowKey="id"
              bordered
            />
          </div>
          <Divider dashed />
          <div className="tw-card-title">
            {/* {formatMessage({ id: `plat.res.menuMap.capaList`, desc: '能力' })} */}
            单项能力
          </div>
          <div>
            {/* <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={defaultPagination}
              loading={loading.effects[`platResProfileCapa/query`]}
              dataSource={capaDataSource}
              columns={capaColumns}
              rowKey="id"
              bordered
            /> */}
            <DataTable
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              showExport={false}
              pagination={defaultPagination}
              loading={loading.effects[`platResProfileCapa/query`]}
              dataSource={capaDataSource}
              columns={[
                {
                  title: '分类',
                  dataIndex: 'name',
                  render: (value, row) => `${row.capaType1Name}-${row.capaType2Name}`,
                },
              ]}
              rowKey="cid"
              expandedRowRender={this.expandedRowRender}
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
      // 评价信息
      eval: (
        <>
          <Button
            className="tw-btn-primary"
            type="primary"
            size="large"
            // disabled
            onClick={() => router.push(`/hr/eval/list?evaledResId=${param.id}`)}
          >
            评价明细
          </Button>
          <span style={{ display: 'block', padding: 20 }}>
            综合评分:{' '}
            {resEvalAvgDataSource && resEvalAvgDataSource.avg
              ? (+resEvalAvgDataSource.avg).toFixed(1)
              : '-'}
          </span>
          <div style={{ width: '50%' }}>
            <Table
              enableSelection={false}
              showSearch={false}
              showColumn={false}
              pagination={false}
              loading={loading.effects[`platResProfileOrg/queryEval`]}
              dataSource={
                resEvalAvgDataSource && resEvalAvgDataSource.dataList
                  ? resEvalAvgDataSource.dataList
                  : []
              }
              columns={evalColumns}
              rowKey="id"
              bordered
            />
          </div>
        </>
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
      // 财务信息
      financeInfo: (
        <div>
          <Table
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            loading={loading.effects[`platResProfileFinance/query`]}
            dataSource={abAccDataSource}
            columns={financeInfoColumns}
            rowKey="id"
            bordered
          />
        </div>
      ),
      // 人事卡片
      // personnel: (
      //   <div>
      //     <Table
      //       enableSelection={false}
      //       showSearch={false}
      //       showColumn={false}
      //       pagination={false}
      //       loading={loading.effects[`platResProfilePersonnel/query`]}
      //       dataSource={personelFormData}
      //       columns={financeInfoColumns}
      //       rowKey="id"
      //       bordered
      //     />
      //   </div>
      // ),

      personnel: (
        <div>
          <DescriptionList size="large" col={2}>
            <Description
              term="HR统计部门" // TODO: 国际化
            >
              {personelFormData.buName}
            </Description>
            <Description
              term="工作类别" // TODO: 国际化
            >
              {personelFormData.label2Name}
            </Description>
            <Description
              term="人才类型" // TODO: 国际化
            >
              {personelFormData.label3Name}
            </Description>
            <Description
              term="主工作产品" // TODO: 国际化
            >
              {personelFormData.label4Name}
            </Description>
            <Description
              term="涉及模块" // TODO: 国际化
            >
              {personelFormData.label5}
            </Description>
            <Description
              term="辅工作产品" // TODO: 国际化
            >
              {personelFormData.label6Name}
            </Description>

            <Description
              term="辅产品涉及模块" // TODO: 国际化
            >
              {personelFormData.label7}
            </Description>
            <Description
              term="标签8" // TODO: 国际化
            >
              {personelFormData.label8}
            </Description>
            <Description
              term="标签9" // TODO: 国际化
            >
              {personelFormData.label9}
            </Description>
            <Description
              term="标签10" // TODO: 国际化
            >
              {personelFormData.label10}
            </Description>
          </DescriptionList>
        </div>
      ),
      selfEvaluation: (
        <div>
          <Row className={styles['my-evaluation']}>
            <Col span={3} className={styles['evaluation-label']}>
              自我评价:
            </Col>
            <Col span={10}>
              <div>
                <pre>{selfEvaluation}</pre>
              </div>
            </Col>
          </Row>
          <Row className={styles['my-tag']}>
            <Col span={3} className={styles['evaluation-label']}>
              标签:
            </Col>

            <Col span={10}>
              {selfTag.map((item, index) => (
                <Tag key={item} className={styles['tag-text']}>
                  {item}
                </Tag>
              ))}
            </Col>
          </Row>
          <Row className={styles['my-video']}>
            <Col span={3} className={styles['evaluation-label']}>
              自我介绍视频:
            </Col>
            <Col lg={12} md={24}>
              <VideoFlv
                width="100%"
                height="400"
                controlslist="nodownload"
                controls
                preload="auto"
                oncontextmenu="return false"
                type="mp4"
                url={videoUrl}
                poster={videoUrl ? '' : `${noVideoBig}`}
              />
            </Col>
          </Row>
          <Row className={styles['my-resume']}>
            <Col span={3} className={styles['evaluation-label']}>
              个人简介:
            </Col>
            <Col lg={12} md={24}>
              <FileManagerEnhance
                api="/api/person/v1/res/personResume/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Col>
          </Row>
          <Row className={styles['my-resume']}>
            <Col span={3} className={styles['evaluation-label']}>
              对外简介:
            </Col>
            <Col lg={12} md={24}>
              <FileManagerEnhance
                api="/api/person/v1/res/pathToOut/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Col>
          </Row>
        </div>
      ),
      // 入离职人员记录
      entryExitRecord: (
        <div>
          <Table
            enableSelection={false}
            showSearch={false}
            showColumn={false}
            pagination={false}
            loading={loading.effects[`platResEntryExitDetail/query`]}
            dataSource={entryExitList}
            columns={entryExitColumns}
            rowKey="id"
            bordered
          />
        </div>
      ),
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="separate"
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => {
              const { offerFrom, from } = fromQs();
              if (offerFrom) {
                closeThenGoto(`${offerFrom}`);
              } else if (from) {
                closeThenGoto(from);
              } else {
                closeThenGoto('/hr/res/profile/list');
              }
              // const { from } = fromQs();
              // from ? closeThenGoto(from) : closeThenGoto('/hr/res/profile/list');
            }}
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
          {!formData.id ? <Loading /> : contentList[operationkey]}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ResDetailQuery;
