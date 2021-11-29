import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Col, Form, Input, Row, Button, Avatar, Tag, Tooltip } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';

import { mountToTab, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { ProductTree } from '@/pages/gen/list';
import { Selection } from '@/pages/gen/field';
import { selectBus } from '@/services/org/bu/bu';
import { selectCoop } from '@/services/gen/list';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import styles from '../index.less';

// --------------- 需要的数据写在这里,或者由数据文件import进来 -----------------

const DOMAIN = 'userProduct';

const { Field } = FieldList;

const searchModel = {
  prodName: null,
  buId: null,
  keyword: null,
  classId: null,
};

/**
 * 公共空白模版页面
 */
@connect(({ loading, userProduct }) => ({
  loading: loading.effects[`${DOMAIN}/fetch`],
  userProduct,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];

    searchModel[key] = value;
  },
})
@mountToTab()
class Product extends React.PureComponent {
  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    this.fetchPageData();
  }

  // --------------- 剩下的私有函数写在这里 -----------------

  fetchPageData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/fetch`,
      payload: searchModel,
    });
  };

  onSelect = expandedKeys => {
    const { dispatch } = this.props;
    if (expandedKeys[0]) {
      searchModel.classId = parseInt(expandedKeys[0], 0);
    } else {
      searchModel.classId = null;
    }
    dispatch({
      type: `${DOMAIN}/fetch`,
      payload: searchModel,
    });
  };

  // --------------- 私有函数区域结束 -----------------

  /**
   * 交给React渲染页面的函数
   * @return {React.ReactElement}
   */
  render() {
    const {
      form: { getFieldDecorator },
      userProduct: { list, total },
      dispatch,
    } = this.props;
    // console.log('asdasfagagafsadasdasdads-------------------->>', total);
    // 每一个页面组件都是由一个PageHeaderWrapper来控制全局样式的。
    // 里面可能是很多的card，或者是自定义内容。如果很复杂，可以把复杂内容做成子组件放在同级目录下import进来
    return (
      <PageHeaderWrapper
        title={
          /* 页面标题: 把注释写在后面 */
          <FormattedMessage id="ui.menu.demo.case" defaultMessage="页面标题 - 使用国际化标签" />
        }
      >
        <Row gutter={12}>
          <Col lg={6} md={24}>
            <ProductTree className="bg-white p-b-5" onSelect={this.onSelect} />
          </Col>
          <Col lg={18} md={24}>
            <Card className="tw-card-adjust" bordered={false}>
              {/* 循环一下，可能有多个，或者写死 */}
              <Row>
                <Col span={20}>
                  <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                    <Field name="prodName" label="产品名称">
                      <Input placeholder="请输入产品名称" />
                    </Field>
                    <Field name="buId" label="所属BU">
                      <Selection source={() => selectBus()} placeholder="请选择所属组织" />
                    </Field>
                    <Field name="keyword" label="关键字">
                      <Input placeholder="请输入关键字" />
                    </Field>
                    <Field name="coopId" label="所属合作伙伴">
                      <Selection source={() => selectCoop()} placeholder="请选择所属合作伙伴" />
                    </Field>
                  </FieldList>
                </Col>
                <Col offset={1} span={3}>
                  <Button className="tw-btn-primary" onClick={this.fetchPageData}>
                    查询
                  </Button>
                </Col>
              </Row>
            </Card>
            <br />

            <Card className={['tw-card-adjust', styles.productList].join(' ')} bordered={false}>
              {list.map(item => (
                <Card.Grid
                  className={styles.productGrid}
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
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}

export default Product;
