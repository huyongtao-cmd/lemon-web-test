import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Radio, Divider, Icon } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';
import { FileManagerEnhance } from '@/pages/gen/field';

const { Description } = DescriptionList;

const DOMAIN = 'videoMgmt';

@connect(({ loading, videoMgmt, dispatch }) => ({
  loading,
  videoMgmt,
  dispatch,
}))
@mountToTab()
class VideoMgmtDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'VIDEO' },
    });
    dispatch({ type: `${DOMAIN}/cleanDetailForm` }).then(() => {
      // 有id编辑页，查详情
      if (id) {
        dispatch({
          type: `${DOMAIN}/videoDetailView`,
          payload: { id, catNo: 'VIDEO_CAT' },
        });
      }
    });
  }

  // 配置所需要的内容1
  renderPage = () => {
    const {
      dispatch,
      videoMgmt: {
        detailFormData,
        pageConfig: { pageBlockViews = [] },
        type2,
      },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '视频信息表单');
    // 修改之前的可配置化
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const {
        vNo = {},
        vName = {},
        accessFlag = {},
        accessResType1 = {},
        accessResType2 = {},
        inchargeResId = {},
        buId = {},
        supplierId = {},
        prodId = {},
        coopId = {},
        custId = {},
        showFlag = {},
        vDesc = {},
        uploadResId = {},
        uploadDate = {},
      } = pageFieldJson;
      const fields = [
        <Description key="vNo" term={vNo.displayName}>
          {detailFormData.vno || ''}
        </Description>,
        <Description key="vName" term={vName.displayName}>
          {detailFormData.vname || ''}
        </Description>,
        <Description term="视频附件">
          <FileManagerEnhance
            api="/api/base/v1/catVideo/video/sfs/token"
            listType="text"
            disabled={false}
            multiple={false}
            dataKey={detailFormData.id}
            preview
          />
        </Description>,
        <Description term="LOGO">
          <FileManagerEnhance
            api="/api/base/v1/catVideo/logo/sfs/token"
            listType="text"
            disabled={false}
            multiple={false}
            dataKey={detailFormData.id}
            preview
          />
        </Description>,
        <Description key="accessFlag" term={accessFlag.displayName}>
          {detailFormData.accessFlag === 'ALL' ? '所有资源' : ''}
          {detailFormData.accessFlag === 'BY_RES_TYPE' ? '按资源类型' : ''}
        </Description>,
        <Description term="有查看权限资源类型">
          {`${detailFormData.accessResType1Name || ''} - ${detailFormData.accessResType2Name ||
            ''}`}
        </Description>,
        <Description key="inchargeResId" term={inchargeResId.displayName}>
          {detailFormData.inchargeResName || ''}
        </Description>,
        <Description key="buId" term={buId.displayName}>
          {detailFormData.buName || ''}
        </Description>,
        <Description key="supplierId" term={supplierId.displayName}>
          {detailFormData.supplierName || ''}
        </Description>,
        <Description key="prodId" term={prodId.displayName}>
          {detailFormData.prodName || ''}
        </Description>,
        <Description key="coopId" term={coopId.displayName}>
          {detailFormData.coopName || ''}
        </Description>,
        <Description key="custId" term={custId.displayName}>
          {detailFormData.custName || ''}
        </Description>,
        <Description key="showFlag" term={showFlag.displayName}>
          {detailFormData.showFlag === 'SHOW' ? '展示' : ''}
          {detailFormData.showFlag === 'HIDE' ? '隐藏' : ''}
        </Description>,
        <Description term="占位" style={{ visibility: 'hidden' }}>
          占位
        </Description>,
        <DescriptionList key="vDesc" size="large" col={1} noTop>
          <Description key="vDesc" term={vDesc.displayName}>
            <pre>{detailFormData.vdesc || ''}</pre>
          </Description>
        </DescriptionList>,
        <Description key="uploadResId" term={uploadResId.displayName}>
          {detailFormData.uploadResName || ''}
        </Description>,
        <Description key="uploadDate" term={uploadDate.displayName}>
          {detailFormData.uploadDate || ''}
        </Description>,
      ];

      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <DescriptionList layout="horizontal" size="large" col={2}>
          {filterList}
        </DescriptionList>
      );
    }

    return '';
  };

  render() {
    const {
      videoMgmt: { detailFormData },
    } = this.props;

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="视频详情" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            {this.renderPage()}
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="类别" size="large" col={2}>
            {Array.isArray(detailFormData.twVCatDValView) &&
              detailFormData.twVCatDValView.map(v => (
                <Description key={v.tabField} term={v.showName}>
                  {v.multFlagName || ''}
                </Description>
              ))}
          </DescriptionList>
          <DescriptionList title="展示栏目标签" size="large" col={1}>
            {Array.isArray(detailFormData.twVideoShowLabelView) &&
              detailFormData.twVideoShowLabelView.map((v, index) => (
                <Description key={v.code} term={v.vlabelName}>
                  <span>
                    <Icon type="check" />
                  </span>
                  {!v.startDate && !v.endDate ? (
                    ''
                  ) : (
                    <span>
                      {!v.startDate && !v.endDate ? null : (
                        <>
                          &nbsp; &nbsp; &nbsp; &nbsp;
                          <span style={{ textAlign: 'right', color: '#999' }}>期间：</span>
                          <span>
                            {v.startDate || ''} ~ {v.endDate || ''}
                          </span>
                        </>
                      )}
                    </span>
                  )}
                </Description>
              ))}
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default VideoMgmtDetail;
