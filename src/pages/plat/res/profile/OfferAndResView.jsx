import React, { PureComponent } from 'react';
import { isEmpty, isNil } from 'ramda';
import { Card } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import {} from 'umi/locale';
import { FileManagerEnhance } from '@/pages/gen/field';

const { Description } = DescriptionList;

@mountToTab()
class OfferAndResView extends PureComponent {
  render() {
    const { formData = {}, dataSource = [], entryResInfoChk = [], eqvaRatioList = [] } = this.props;
    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '检查事项',
          align: 'center',
          dataIndex: 'chkItemName',
          width: '15%',
        },
        {
          title: '检查说明',
          dataIndex: 'chkDesc',
          width: '35%',
          render: val => <pre>{val}</pre>,
        },
        {
          title: '完成状态',
          className: 'text-center',
          dataIndex: 'finishStatus',
          width: '15%',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '35%',
          render: (value, row, index) => <pre>{value}</pre>,
        },
      ],
    };

    const eqvaRatioTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '期间',
          align: 'center',
          dataIndex: 'period',
          width: '30%',
          render: (value, row, index) => {
            if (row.startDate || row.endDate) {
              return `${row.startDate ? row.startDate : ''} ~ ${row.endDate ? row.endDate : ''}`;
            }
            return '';
          },
        },
        {
          title: '当量系数',
          dataIndex: 'eqvaRatio',
          width: '35%',
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '35%',
          align: 'center',
          render: (value, row, index) => <pre>{value}</pre>,
        },
      ],
    };

    return (
      <>
        <Card
          className="tw-card-adjust"
          bordered={false}
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="Offer发放信息" />}
        >
          <DescriptionList size="large" col={2}>
            <Description term="资源">{formData.resName || ''}</Description>
            <Description term="性别">{formData.genderName || ''}</Description>
            {/* <Description term="资源类型一">{formData.resType1Name || ''}</Description>
            <Description term="资源类型二">{formData.resType2Name || ''}</Description> */}
            <Description term="资源类别">
              {formData.resType && formData.resType === 'GENERAL' && '一般资源'}
              {formData.resType && formData.resType === 'SALES_BU' && '销售BU'}
            </Description>
            <Description term="BaseBU">{formData.baseBuName || ''}</Description>
            <Description term="Base地">{formData.baseCityName || ''}</Description>
            <Description term="预定入职日期">{formData.preEnrollDate || ''}</Description>
            <Description term="岗位">{formData.job || ''}</Description>
            <Description term="资源类型">
              {formData.resType1Name || ''} / {formData.resType2Name || ''}
            </Description>
            <Description term="入职类型">{formData.entryTypeName || ''}</Description>
            <Description term="是否延用原销售BU">
              {formData.buFlag && formData.buFlag === 'YES' && <pre>是</pre>}
              {formData.buFlag && formData.buFlag === 'NO' && <pre>否</pre>}
              {!formData.buFlag && <pre />}
            </Description>
            <Description term="原销售BU">{formData.oldSaleBuName || ''}</Description>
            <Description term="职级">{formData.jobGrade || ''}</Description>
            {/* <Description term="当量系数">
              {!isNil(formData.eqvaRatio) ? formData.eqvaRatio : ''}
            </Description> */}
            <Description term="合作方式">{formData.coopTypeName || ''}</Description>
            <Description term="直属领导">{formData.presName || ''}</Description>
            <Description term="无加班人员">
              {formData.inLieuFlag && formData.inLieuFlag === 'YES' && <pre>否</pre>}
              {formData.inLieuFlag && formData.inLieuFlag === 'NO' && <pre>是</pre>}
              {!formData.inLieuFlag && <pre />}
            </Description>
            <Description term="参加商务基本资质培训">
              {formData.busiTrainFlag && formData.busiTrainFlag === 'YES' && <pre>是</pre>}
              {formData.busiTrainFlag && formData.busiTrainFlag === 'NO' && <pre>否</pre>}
              {!formData.busiTrainFlag && <pre />}
            </Description>
            <Description term="简历附件">
              <FileManagerEnhance
                api="/api/person/v1/offer/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="是否需要总裁审批">
              {formData.ceoApprFlag && formData.ceoApprFlag === 'YES' && <pre>是</pre>}
              {formData.ceoApprFlag && formData.ceoApprFlag === 'NO' && <pre>否</pre>}
              {!formData.ceoApprFlag && <pre />}
            </Description>
            <Description term="内部推荐">
              {formData.isJobInternalRecomm === 'YES' ? '是' : '否'}
              {formData.jobDesc && ' / '}
              {formData.jobDesc}
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="备注">
              <pre>{formData.remark}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="申请人">{formData.applyResName || ''}</Description>
            <Description term="申请时间">{formData.applyDate || ''}</Description>
          </DescriptionList>
        </Card>
        <Card
          className="tw-card-adjust"
          bordered={false}
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="入职信息" />}
        >
          <DescriptionList size="large" col={2}>
            <Description term="是否入职">
              {formData.deliverOffer === 'YES' && '是'}
              {formData.deliverOffer === 'NO' && '否'}
            </Description>
            <Description term="未入职原因">{formData.noneOfferReasonName}</Description>
            <DescriptionList size="large" col={1}>
              <Description term="未入职原因说明">
                <pre>{formData.offerReasonAccount}</pre>
              </Description>
            </DescriptionList>
            <Description term="英文名">{formData.foreignName || ''}</Description>
            <Description term="手机号">{formData.mobile || ''}</Description>
            <Description term="证件类型/号码">
              {formData.idTypeName}
              {formData.idTypeName && '/'}
              {formData.idNo}
            </Description>
            <Description term="出生日期">{formData.birthday || ''}</Description>
            <Description term="所属公司">{formData.ouName || ''}</Description>
            <Description term="工号">{formData.empNo || ''}</Description>
            {formData.resType2 !== '5' && (
              <Description term="入职日期">{formData.enrollDate || ''}</Description>
            )}
            {formData.resType2 !== '5' && (
              <Description term="转正日期">{formData.regularDate || ''}</Description>
            )}
            {formData.resType2 !== '5' && (
              <Description term="合同签订日期">{formData.contractSignDate || ''}</Description>
            )}
            {formData.resType2 !== '5' && (
              <Description term="合同到期日期">{formData.contractExpireDate || ''}</Description>
            )}
            {formData.resType2 !== '5' && (
              <Description term="试用期开始日期">{formData.probationBeginDate || ''}</Description>
            )}
            {formData.resType2 !== '5' && (
              <Description term="试用期结束日期">{formData.probationEndDate || ''}</Description>
            )}

            <Description term="话费额度">{formData.telfeeQuota || ''}</Description>
            <Description term="电脑额度">{formData.compfeeQuota || ''}</Description>
            <Description term="发薪方式">{formData.salaryMeyhodName || ''}</Description>
            <Description term="发薪周期">{formData.salaryPeriodName || ''}</Description>
            <Description term="安全级别">{formData.accessLevel || ''}</Description>
            <Description term="长期/短期">
              {formData.periodFlag === 'LONG' && '长期资源'}
              {formData.periodFlag === 'SHORT' && '短期资源'}
            </Description>
            <Description term="工种分类一">{formData.jobClass1Name || ''}</Description>
            <Description term="工种分类二">{formData.jobClass2Name || ''}</Description>
            <Description term="复合能力">{formData.jobCapaSetName || ''}</Description>
            <Description term="邮箱">{formData.emailAddr || ''}</Description>
            {formData.resType2 === '5' ? (
              <Description term="实习入职时间">{formData.internDate || ''}</Description>
            ) : null}
          </DescriptionList>
        </Card>
        <Card
          className="tw-card-adjust"
          title={<Title icon="folder" text="当量系数" />}
          bordered={false}
          style={{ marginTop: '6px' }}
        >
          <DataTable {...eqvaRatioTableProps} dataSource={eqvaRatioList} />
        </Card>
        <Card
          className="tw-card-adjust"
          title={<Title icon="folder" text="入职办理事项" />}
          bordered={false}
          style={{ marginTop: '6px' }}
        >
          <DataTable {...tableProps} dataSource={dataSource} scroll={{ y: 420, x: '100%' }} />
        </Card>
        <Card
          className="tw-card-adjust"
          title={<Title icon="folder" text="档案信息完善检查" />}
          bordered={false}
          style={{ marginTop: '6px' }}
        >
          <DataTable {...tableProps} dataSource={entryResInfoChk} scroll={{ y: 420, x: '100%' }} />
        </Card>
      </>
    );
  }
}

export default OfferAndResView;
