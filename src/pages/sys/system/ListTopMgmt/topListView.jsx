import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Divider, Spin } from 'antd';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';
import { fromQs, randomString } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import TopList from './components/TopList';

const { Description } = DescriptionList;

const DOMAIN = 'listTopMgmt';

@connect(({ loading, listTopMgmt, user, dispatch }) => ({
  listTopMgmt,
  dispatch,
  loading,
  user,
}))
@mountToTab()
class ListTopMgmtView extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      listTopMgmt: { formData },
    } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      id &&
        dispatch({
          type: `${DOMAIN}/topListdateDetail`,
          payload: {
            id,
          },
        });
    });
  }

  render() {
    const {
      loading,
      listTopMgmt: { topListView },
      user: {
        user: { extInfo },
      },
    } = this.props;

    const spinLoading = loading.effects[`${DOMAIN}/topListdateDetail`];

    return (
      <PageHeaderWrapper>
        <Spin style={{ width: '100%' }} spinning={spinLoading}>
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
            title={
              <Title icon="profile" text={`${topListView.topListName || ''}` || '排行榜详情'} />
            }
            bordered={false}
            bodyStyle={{
              overflowY: topListView.layoutType !== 'VERTICAL_CHART' ? 'auto' : 'hidden', // BAR_CHART纵向布局样式
              overflowX: topListView.layoutType === 'VERTICAL_CHART' ? 'auto' : 'hidden', // VERTICAL_CHART横向布局样式
            }}
          >
            <DescriptionList size="large" col={2}>
              <Description term="统计期间">
                {`${topListView.startDate || ''} ${
                  topListView.startDate ? ' ~ ' : ''
                } ${topListView.endDate || ''}`}
              </Description>
              <Description term="更新时间">{topListView.dataUpdTime || ''}</Description>
            </DescriptionList>
            <Divider dashed />
            <TopList
              item={{
                ...topListView,
                list: topListView.list.map(v => ({ ...v, onlyKey: randomString(16) })),
                resId: !isNil(extInfo) ? extInfo.resId : null,
              }}
            />
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default ListTopMgmtView;
