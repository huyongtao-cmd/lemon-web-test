import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import classnames from 'classnames';
import { Button, Card, Radio, Divider, Avatar, Tag, Tooltip } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';
import { FileManagerEnhance } from '@/pages/gen/field';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import styles from '../index.less';

const { Description } = DescriptionList;

const DOMAIN = 'findCoop';

@connect(({ loading, findCoop, dispatch }) => ({
  loading,
  findCoop,
  dispatch,
}))
@mountToTab()
class FindCoopView extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {},
        twBuProdView: [],
      },
    });
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });
  }

  render() {
    const {
      findCoop: { formData, twBuProdView },
    } = this.props;
    const { id } = fromQs();

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
          title={<Title icon="profile" text="合作伙伴详情" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="合作伙伴名称">{formData.abName}</Description>
            <Description term="合作伙伴编号">{formData.abNo}</Description>
            <Description term="企业简介">{formData.coopInfo}</Description>
            <Description term="企业法人">{formData.coopLegalPresonName}</Description>
            <Description term="企业地址">{formData.coopAddress}</Description>
            <Description term="企业规模">{formData.coopSale}</Description>
            <Description term="合作等级">{formData.coopLevel}</Description>
            <Description term="典型客户">{formData.coopTypicalCustomer}</Description>
            <Description term="合作类别">{formData.coopServiceType}</Description>
            <Description term="产品/服务名称">{formData.coopServiceName}</Description>
            <Description term="合作伙伴角色">{formData.coopChargePersonRole}</Description>
            <Description term="合作伙伴姓名">{formData.coopPicName}</Description>
            <Description term="合作伙伴职位">{formData.coopChargePersonPosition}</Description>
            <Description term="合作伙伴电话">{formData.coopChargePersonPhone}</Description>
            <Description term="合作伙伴邮箱">{formData.coopChargePersonEmail}</Description>
            <Description term="合作伙伴等级">{formData.coopPartnerLevel}</Description>
            <Description term="合作类别">{formData.coopCategory}</Description>

            <Description term="合作伙伴类型">{formData.coopTypeDesc}</Description>
            <Description term="合作状态">{formData.coopStatusDesc}</Description>
            <Description term="合作区域">{formData.coopArea}</Description>
            <Description term="合作评估">{formData.coopEvaluationDesc}</Description>
            <Description term="对接人联系方式">{formData.coopPicContact}</Description>
            <Description term="对接人类型">{formData.counterpart}</Description>
            <Description term="合作伙伴发展经理">{formData.pdmName}</Description>
            <Description term="我司负责人BU">{formData.pdmBuId}</Description>
            <Description term="我司负责人电话">{formData.pdmTel}</Description>
            <Description term="我司负责人邮箱">{formData.pdmEmail}</Description>
            <Description term="合作期限">
              {formData.coopPeriodFrom &&
                formData.coopPeriodTo &&
                `${formData.coopPeriodFrom} ~ ${formData.coopPeriodTo}`}
            </Description>
            <Description term="公司介绍附件">
              <FileManagerEnhance
                api="/api/person/v1/coop/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Description>
            <Description term="产品介绍附件">
              <FileManagerEnhance
                api="/api/person/v1/coop/product/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Description>
          </DescriptionList>
          <DescriptionList col={1}>
            <Description term="合作期间说明">
              <pre>{formData.coopPeriodDesc}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList col={1}>
            <Description term="合作伙伴关键词">
              <pre>{formData.coopKey}</pre>
            </Description>
          </DescriptionList>
        </Card>
        <Card
          className={['tw-card-adjust', styles.productList].join(' ')}
          title={<Title icon="profile" text="相关产品" />}
          bordered={false}
        >
          {twBuProdView.map(item => (
            <Card.Grid
              className={styles.productGrid}
              style={{ margin: '20px' }}
              key={item.id}
              onClick={() => {
                const urls = getUrl();
                const from = stringify({ from: urls });
                router.push(`/sale/productHouse/findProduct/detail?id=${item.id}&${from}`);
              }}
            >
              <Card.Meta
                className={styles.meta}
                avatar={
                  <Avatar
                    shape="square"
                    size={64}
                    src={
                      item.logoFile
                        ? `data:image/jpeg;base64,${item.logoFile}`
                        : '/el-logo-product.png'
                    }
                  />
                }
                title={
                  <div className={styles.gridLine}>
                    <Tooltip placement="top" title={item.prodName || undefined}>
                      <div className={styles['gridLine-main']}>
                        {item.prodName || '- 暂无名称 -'}
                      </div>
                    </Tooltip>
                    {/* <Tag className={styles['gridLine-right']} color="red">
                          {item.tagDesc || '- 空 -'}
                        </Tag> */}
                  </div>
                }
                description={item.prodDesc || '- 暂无产品简介 -'}
              />
              <div className={styles.gridLine}>
                {item.className && <Tag color="gold">{item.className || ''}</Tag>}
                {item.buName && (
                  <Tag className={styles['gridLine-right']} color="Blue">
                    {item.buName || '- 无所属BU -'}
                  </Tag>
                )}
              </div>
            </Card.Grid>
          ))}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default FindCoopView;
