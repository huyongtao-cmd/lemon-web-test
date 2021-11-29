import React from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import Link from 'umi/link';
import { Card, Col, Row, Button, Tag, Popover } from 'antd';
import classnames from 'classnames';
import { closeThenGoto, markAsTab } from '@/layouts/routerControl';
import { formatMessage } from 'umi/locale';
import VideoFlv from '@/components/common/VideoFlv';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import HoverModal from './component/HoverModal';
import styles from './style.less';

const { Description } = DescriptionList;

const DOMAIN = 'showHomePage';

@connect(({ loading, showHomePage }) => ({
  loading,
  showHomePage,
}))
class ShowHomePageDetail extends React.PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();

    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'VIDEO' },
    });
    dispatch({ type: `${DOMAIN}/cleanDetailForm` }).then(res => {
      dispatch({ type: `${DOMAIN}/videoDetailView`, payload: { dataKey: id } });
      dispatch({
        type: `${DOMAIN}/fetchVideoUrl`,
        payload: id,
      });
    });
  }

  // 配置所需要的内容1
  renderPage1 = () => {
    const {
      showHomePage: {
        detailFormData,
        pageConfig: { pageBlockViews = [] },
      },
    } = this.props;

    const urls = getUrl();
    const fromUrl = stringify({ from: urls });

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
        inchargeResId = {},
        buId = {},
        supplierId = {},
        prodId = {},
        coopId = {},
        custId = {},
        viewCnt = {},
      } = pageFieldJson;
      const fields = [
        <Description key="vNo" term={vNo.displayName}>
          {detailFormData.vno || ''}
        </Description>,
        <Description key="vName" term={vName.displayName}>
          {detailFormData.vname || ''}
        </Description>,
        <Description key="inchargeResId" term={inchargeResId.displayName}>
          {detailFormData.inchargeResName || ''}
        </Description>,
        <Description key="buId" term={buId.displayName}>
          {detailFormData.buName || ''}
        </Description>,
        <Description key="prodId" term={prodId.displayName}>
          <Link
            className="tw-link"
            to={`/sale/productHouse/findProduct/detail?id=${detailFormData.prodId}&${fromUrl}`}
          >
            {detailFormData.prodName || ''}
          </Link>
        </Description>,
        <Description key="supplierId" term={supplierId.displayName}>
          <Popover content={<HoverModal formData={detailFormData.twVideoCoopSustSupp} />}>
            <span style={{ color: '#008FDB', cursor: 'pointer' }}>
              {detailFormData.supplierName || ''}
            </span>
          </Popover>
        </Description>,
        <Description key="coopId" term={coopId.displayName}>
          <Popover content={<HoverModal formData={detailFormData.twVideoCoopSustCoop} />}>
            <span style={{ color: '#008FDB', cursor: 'pointer' }}>
              {detailFormData.coopName || ''}
            </span>
          </Popover>
        </Description>,
        <Description key="custId" term={custId.displayName}>
          <Popover content={<HoverModal formData={detailFormData.twVideoCoopSustCust} />}>
            <span style={{ color: '#008FDB', cursor: 'pointer' }}>
              {detailFormData.custName || ''}
            </span>
          </Popover>
        </Description>,
        <Description key="viewCnt" term={viewCnt.displayName}>
          {detailFormData.viewCnt}
        </Description>,
      ];

      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <DescriptionList layout="horizontal" size="large" col={1} title="基本信息">
          {filterList}
        </DescriptionList>
      );
    }

    return '';
  };

  render() {
    const {
      showHomePage: { videoUrl, detailFormData = {} },
    } = this.props;

    return (
      <div className={styles.viewBox}>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              router.push(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Row gutter={6}>
          <Col lg={16} md={24}>
            <div
              ref={e => {
                this.leftCard = e;
              }}
            >
              <Card
                title={
                  <>
                    <span style={{ color: '#284488' }}>{detailFormData.vno}</span>
                    <span>&nbsp;&nbsp;</span>
                    <span style={{ color: '#284488' }}>{detailFormData.vname}</span>
                  </>
                }
                style={{ minHeight: this.rightCard && this.rightCard.clientHeight }}
                extra={
                  <>
                    {Array.isArray(detailFormData.twVideoShowLabelView)
                      ? detailFormData.twVideoShowLabelView.map(v => (
                          // eslint-disable-next-line react/jsx-indent
                          <Tag color="#F1F4FF">
                            <span style={{ color: '#000' }}>{v.vlabelName || ''}</span>
                          </Tag>
                        ))
                      : null}
                  </>
                }
                bordered={false}
              >
                <VideoFlv
                  width="100%"
                  height="470"
                  controlslist="nodownload"
                  controls
                  preload="auto"
                  oncontextmenu="return false"
                  type="mp4"
                  url={videoUrl}
                  poster={
                    detailFormData && detailFormData.logoFile
                      ? `data:image/jpeg;base64,${detailFormData.logoFile}`
                      : ''
                  }
                />
                <span style={{ marginTop: '6px' }}>
                  <span style={{ color: '#999' }}>简介：</span>
                  <pre>{`${detailFormData.vdesc || '-暂无视频简介-'}`}</pre>
                </span>
              </Card>
            </div>
          </Col>
          <Col lg={8} md={24}>
            <div
              ref={e => {
                this.rightCard = e;
              }}
              style={{
                minHeight: this.leftCard && this.leftCard.clientHeight,
                backgroundColor: '#fff',
              }}
            >
              <Card bordered={false}>{this.renderPage1()}</Card>
              <div style={{ borderBottom: '6px solid #f0f2f5' }} />
              <Card bordered={false}>
                <DescriptionList title="类别" size="large" col={1}>
                  {Array.isArray(detailFormData.twVCatDValView) &&
                    detailFormData.twVCatDValView.map(v => (
                      <Description key={v.tabField} term={v.showName}>
                        {v.multFlagName || ''}
                      </Description>
                    ))}
                </DescriptionList>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ShowHomePageDetail;
