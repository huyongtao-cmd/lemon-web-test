import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Divider, Row, Col, Modal } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { isEmpty, clone } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import createMessage from '@/components/core/AlertMessage';
import Title from '@/components/layout/Title';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import { fromQs } from '@/utils/stringUtils';
import Link from 'umi/link';
import styles from './buDetail.less';
import { stringify } from 'qs';
import { getUrl } from '@/utils/flowToRouter';

@connect(({ loading, userTaskSubpackDetail, dispatch }) => ({
  dispatch,
  loading,
  userTaskSubpackDetail,
}))
@mountToTab()
class SubContractModal extends React.Component {
  render() {
    const {
      visible,
      closeModal,
      userTaskSubpackDetail: { taskOtherChangeViews },
    } = this.props;
    const urls = getUrl();
    const from = stringify({ from: urls });
    return (
      <Modal
        centered
        width="24%"
        destroyOnClose
        visible={visible}
        bodyStyle={{ height: '260px', overflowY: 'scroll' }}
        onCancel={closeModal}
        title="其它转包详情"
        wrapClassName={styles.subContractModal}
        footer={[
          <Button type="primary" onClick={closeModal} key="close">
            关闭
          </Button>,
        ]}
      >
        <PageHeaderWrapper>
          {taskOtherChangeViews
            ? taskOtherChangeViews.map(
                item =>
                  item.no && (
                    <Row
                      type="flex"
                      justify="space-around"
                      align="middle"
                      span={24}
                      style={{ marginTop: '8px' }}
                      key={item.id}
                    >
                      <Col>流程编号</Col>
                      <Col>
                        <Link
                          className="tw-link"
                          to={`/user/task/taskDetail?id=${item.id}&checkBuFlag=${
                            item.checkBuFlag ? 1 : 0
                          }&${from}`}
                        >
                          {item.no}
                        </Link>
                      </Col>
                    </Row>
                  )
              )
            : null}
        </PageHeaderWrapper>
      </Modal>
    );
  }
}

export default SubContractModal;
