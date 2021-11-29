import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Row, Col, Icon, Spin } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { isEmpty, isNil } from 'ramda';
import Title from '@/components/layout/Title';
import { randomString } from '@/utils/stringUtils';
import TopList from './components/TopList';

const { Meta } = Card;

const DOMAIN = 'listTopMgmt';

@connect(({ loading, listTopMgmt, user, dispatch }) => ({
  listTopMgmt,
  dispatch,
  user,
  loading,
}))
@mountToTab()
class TopListView extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/topListdate`,
    });
  }

  render() {
    const {
      loading,
      listTopMgmt: { topList },
      user: {
        user: { extInfo },
      },
    } = this.props;

    const spinLoading = loading.effects[`${DOMAIN}/topListdate`];

    return (
      <PageHeaderWrapper>
        <Spin style={{ width: '100%' }} spinning={spinLoading}>
          <Card
            className="tw-card-adjust"
            style={{ marginTop: '6px' }}
            title={<Title icon="profile" text="琅琊榜" />}
            bordered={false}
          >
            <Row gutter={26}>
              {!isEmpty(topList) &&
                topList.map(
                  item =>
                    item.showFlag === 'YES' ? (
                      <Col key={item.key} span={12} style={{ marginBottom: '26px' }}>
                        <Card
                          title={
                            <span>
                              <span
                                style={{ fontSize: '18px', color: '#000', fontWeight: 'bolder' }}
                              >
                                {item.topListName}
                              </span>
                              <br />
                              <span style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.65)' }}>
                                <span>
                                  统计期间：
                                  <span>
                                    {`${item.startDate || ''} ${
                                      item.startDate ? ' ~ ' : ''
                                    } ${item.endDate || ''}`}
                                  </span>
                                </span>
                                &nbsp; &nbsp;
                                <span>
                                  更新时间：
                                  <span>{item.dataUpdTime || ''}</span>
                                </span>
                              </span>
                              {Array.isArray(item.mySort) &&
                              !isEmpty(item.mySort) &&
                              Number(
                                item.mySort.sort((a, b) => Number(a) - Number(b))[
                                  item.mySort.length - 1
                                ]
                              ) > item.defaultRank ? (
                                <>
                                  <br />
                                  <span
                                    style={{
                                      fontSize: '18px',
                                      color: '#EF6D2D',
                                      fontWeight: 'bolder',
                                    }}
                                  >
                                    我的排名：
                                    <span>{item.mySort.join(',') || ''}</span>
                                  </span>
                                </>
                              ) : null}
                            </span>
                          }
                          headStyle={{ border: 'none', color: '#5D73A6' }}
                          bordered={false}
                          style={{
                            border: '1px solid #BEC6DB',
                            borderRadius: '6px',
                            paddingBottom: '30px',
                          }}
                          bodyStyle={{
                            height: '455px',
                            overflowY: item.layoutType !== 'VERTICAL_CHART' ? 'auto' : 'hidden', // BAR_CHART纵向布局样式
                            overflowX: item.layoutType === 'VERTICAL_CHART' ? 'auto' : 'hidden', // VERTICAL_CHART横向布局样式
                          }}
                        >
                          {item.list.length ? (
                            <TopList
                              item={{
                                ...item,
                                list: item.list.map(v => ({ ...v, onlyKey: randomString(16) })),
                                resId: !isNil(extInfo) ? extInfo.resId : null,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                height: '100%',
                                width: '100%',
                                textAlign: 'center',
                                fontSize: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <span>暂无数据</span>
                            </div>
                          )}

                          {item.defaultRank < item.topDateCount && (
                            <Meta
                              description={
                                <a
                                  // eslint-disable-next-line
                                  href="javascript:void(0);"
                                  style={{ position: 'absolute', bottom: '10px', right: '15px' }}
                                  onClick={e => {
                                    // 点击获取更多
                                    const urls = getUrl();
                                    const from = stringify({ from: urls });
                                    router.push(`/user/prefMgmt/topListView?id=${item.id}&${from}`);
                                  }}
                                >
                                  更多
                                  <Icon type="double-right" />
                                </a>
                              }
                            />
                          )}
                        </Card>
                      </Col>
                    ) : null
                )}
            </Row>
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default TopListView;
