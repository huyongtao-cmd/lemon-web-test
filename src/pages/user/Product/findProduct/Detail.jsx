import React from 'react';
import { connect } from 'dva';
import { Card, Col, Row, Button, Divider, Modal } from 'antd';
import classnames from 'classnames';
import { closeThenGoto, markAsTab } from '@/layouts/routerControl';
// import Link from 'umi/link';
import { formatMessage, FormattedMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import VideoFlv from '@/components/common/VideoFlv';
import DescriptionList from '@/components/layout/DescriptionList';
import Loading from '@/components/core/DataLoading';
import CaseImg from './CaseImg';
import styles from '../index.less';
import router from 'umi/router';
import { fromQs } from '@/utils/stringUtils';
import { OverPopper } from '@/pages/gen/hint';

// --------------- 需要的数据写在这里,或者由数据文件import进来 -----------------
const { Description } = DescriptionList;

const DOMAIN = 'userProduct';

/**
 * 公共空白模版页面
 */
@connect(({ loading, userProduct }) => ({
  loading, // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  userProduct, // 代表与该组件相关redux的model
}))
class ProductDetail extends React.PureComponent {
  state = {
    modalVisible: false,
    detailViewData: {
      caseName: '',
      caseDesc: '',
      contactDesc: '',
    },
  };

  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/fetchDetail`,
      payload: param,
    });
    dispatch({
      type: `${DOMAIN}/fetchCase`,
      payload: param,
    });
    dispatch({
      type: `${DOMAIN}/fetchVideoUrl`,
      payload: param.id,
    });
  }

  // --------------- 剩下的私有函数写在这里 -----------------
  showCase = item => {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
      detailViewData: {
        caseName: item.caseName,
        caseDesc: item.caseDesc,
        contactDesc: item.contactDesc,
      },
    });
  };

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数
   * @return {React.ReactElement}
   */
  render() {
    const {
      userProduct: { list, total, detail, caseList = [], videoUrl },
    } = this.props;

    const { modalVisible, detailViewData } = this.state;

    return (
      <PageHeaderWrapper
        title={
          /* 页面标题: 把注释写在后面 */
          <FormattedMessage id="ui.menu.demo.case" defaultMessage="页面标题 - 使用国际化标签" />
        }
      >
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
        <Card className={styles.productList} bordered={false} bodyStyle={{ padding: 0 }}>
          <Row gutter={4}>
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
                poster={
                  detail && detail.logoFile ? `data:image/jpeg;base64,${detail.logoFile}` : ''
                }
              />
            </Col>
            <Col lg={12} md={24}>
              {detail ? (
                <DescriptionList
                  className="p-a-2"
                  size="large"
                  col={1}
                  // style={{ borderLeft: '1px solid #e8e8e8' }}
                >
                  <Description term="产品名称">{detail.prodName}</Description>
                  <Description term="产品分类">{detail.className}</Description>
                  <Description term="产品负责人">{detail.picUserName}</Description>
                  <Description term="手机">{detail.picMobile}</Description>
                  <Description term="邮箱">{detail.picEmail}</Description>
                  <Description term="所属BU">{detail.buName}</Description>
                  <Description term="所属合作伙伴">{detail.coopName}</Description>
                  <Description term="适用行业">{detail.industry}</Description>
                  <Description term="浏览次数">{detail.viewCnt} 次</Description>
                  <Description term="产品简介">
                    <OverPopper popover>{detail.prodDesc}</OverPopper>
                  </Description>
                  <Description term="功能模块">
                    <OverPopper popover>{detail.functionDesc}</OverPopper>
                  </Description>
                  <Description term="目标用户">
                    <OverPopper popover>{detail.customerDesc}</OverPopper>
                  </Description>
                </DescriptionList>
              ) : (
                <Loading />
              )}
            </Col>
          </Row>
          <Divider>成功案例</Divider>
          {caseList.length > 0 ? (
            <Card className={styles.caseList}>
              {caseList.map(item => (
                <Card.Grid
                  key={item.id}
                  className={styles.grid}
                  onClick={() => this.showCase(item)}
                >
                  <Card
                    hoverable
                    cover={<CaseImg dataKey={item.id} alt="placehoder" />}
                    bordered={false}
                  >
                    <Card.Meta
                      title={<div className={styles.center}>{item.caseName}</div>}
                      description=" "
                    />
                  </Card>
                </Card.Grid>
              ))}
            </Card>
          ) : (
            <div className={styles.center}>暂无数据</div>
          )}
        </Card>

        <Modal
          visible={modalVisible}
          title="案例详情"
          onCancel={() => this.setState({ modalVisible: !modalVisible })}
          footer={null}
        >
          <DescriptionList size="large" col={1} noReactive>
            <Description term="案例名称">{detailViewData.caseName}</Description>
            <Description term="联系信息">{detailViewData.contactDesc}</Description>
            <Description term="案例描述">{detailViewData.caseDesc}</Description>
          </DescriptionList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default ProductDetail;
