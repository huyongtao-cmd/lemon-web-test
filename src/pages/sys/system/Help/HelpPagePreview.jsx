import React, { PureComponent } from 'react';
import { Card, Col, Icon, Input, Row, Switch, Divider } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import Loading from '@/components/core/DataLoading';
import TreeSearch from '@/components/common/TreeSearch';
import createMessage from '@/components/core/AlertMessage';
import styles from './help.less';

const DOMAIN = 'helpPagePreview';

@connect(({ loading, helpPagePreview, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/getTree`] || loading.effects[`${DOMAIN}/previewByUrl`],
  ...helpPagePreview,
  dispatch,
  user,
}))
@mountToTab()
class HelpPagePreview extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const params = fromQs();
    if (params.url) {
      let pageUrl = params.url;
      pageUrl = pageUrl.indexOf('?') > 0 ? pageUrl.substr(0, pageUrl.indexOf('?')) : pageUrl;
      dispatch({
        type: `${DOMAIN}/previewByUrl`,
        payload: { url: pageUrl },
      });
    }
    if (params.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id: params.id },
      });
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { defaultSelectedKeys: [params.id + ''] },
      });
    }
    dispatch({
      type: `${DOMAIN}/getTree`,
      payload: { directoryVisibleFlag: true },
    });
  }

  // componentWillUnmount() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: `${DOMAIN}/clearForm`,
  //   });
  // }

  onSelect = selectedKeys => {
    const { dispatch } = this.props;
    const id = selectedKeys[0];
    document.getElementById('helpPreviewPage').scrollTop = 0;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id },
    });
  };

  mergeDeep = child =>
    Array.isArray(child)
      ? child
          .map(item => ({
            ...item,
            icon: <Icon type="file-text" />,
            value: item.id,
            text: item.helpTitle,
            child: item.children,
          }))
          .map(temp => ({
            ...temp,
            child: temp.child ? this.mergeDeep(temp.child) : null,
          }))
      : [];

  render() {
    const { loading, tree, formData, defaultSelectedKeys } = this.props;
    const treeData = this.mergeDeep(tree);

    return (
      <PageHeaderWrapper>
        <Row gutter={5} className={styles['help-wrap']}>
          {/*  paddingTop 是为了跟右边顶部对齐 */}
          <Col span={6} className={styles['help-menu-wrap']}>
            {!loading ? (
              <TreeSearch
                showSearch
                placeholder="请输入关键字"
                treeData={treeData}
                onSelect={this.onSelect}
                defaultExpandedKeys={treeData.map(item => `${item.id}`)}
                defaultSelectedKeys={defaultSelectedKeys}
              />
            ) : (
              <Loading />
            )}
          </Col>

          <Col id="helpPreviewPage" span={18} className={styles['help-content-wrap']}>
            <Card bordered={false}>
              <h3>{formData.helpTitle}</h3>
              <Divider />
              {/* eslint-disable-next-line react/no-danger */}
              <div dangerouslySetInnerHTML={{ __html: formData.helpContent }} />
            </Card>
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}

export default HelpPagePreview;
