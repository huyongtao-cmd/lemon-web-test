/* eslint-disable no-nested-ternary */
import React from 'react';
import { connect } from 'dva';
import { Card, Col, Row, Tooltip } from 'antd';
import Link from 'umi/link';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { markAsTab, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
// import DescriptionList from '@/components/layout/DescriptionList';
import Title from '@/components/layout/Title';
import { genFakeId } from '@/utils/mathUtils';
import { createAlert } from '@/components/core/Confirm';
import flowData from './panel.config';
import { getCurTenProc } from '@/services/sys/system/tenantProc';
import { outputHandle } from '@/utils/production/outputUtil';

const DOMAIN = 'flowPanel'; // 自己替换

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

/**
 * 公共空白模版页面
 */
@connect(({ loading, dispatch, flowPanel }) => ({
  // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  // ...fiddle, // 代表与该组件相关redux的model
  loading,
  dispatch,
  ...flowPanel,
}))
@mountToTab()
class FlowPanel extends React.PureComponent {
  /**
   * 页面内容加载之前要做的事情放在这里
   */
  // eslint-disable-next-line
  constructor(props) {
    super(props);
    this.state = { flowDatas: [] };
    // this.setState({});
  }

  componentDidMount(props) {
    this.getCurTenProcUri();
    const { dispatch } = this.props;
    dispatch({
      type: `flowPanelcf/getFlowData`,
    }).then(resp => {
      // 未注册流程 不允许跳转，并修改点击提示信息
      !!resp &&
      Array.isArray(resp) && //当请求错误时 resp为错误的http返回消息体，不是后端返回数据，不是null
        resp.map(g =>
          g?.children.map(c =>
            c?.children.map(f => {
              const t = f;
              if (
                !!this.state.tenantProc && // eslint-disable-line
                !this.state.tenantProc.find(tp => tp.procIden === f.procIden) // eslint-disable-line
              ) {
                t.jumpFlag = false;
                t.clickMsg = '未注册流程!请联系管理员注册并启用该流程!';
              }
              return t;
            })
          )
        );
      !!resp && Array.isArray(resp) && this.setState({ flowDatas: resp });
    });
  }

  getCurTenProcUri = async () => {
    const { data } = await outputHandle(getCurTenProc);
    this.setState(prve => ({ ...prve.state, tenantProc: data })); // eslint-disable-line
    return data;
  };

  render() {
    const { flowDatas } = this.state;
    const renderFlowItem = data =>
      data &&
      data.map(
        (item, index) =>
          ({
            group: (
              <Col key={genFakeId()} span={12} style={{ marginBottom: 8 }}>
                {renderFlowItem(item.children)}
              </Col>
            ),
            card: (
              <Card key={genFakeId()} className="m-b-1" type="inner" title={item.text}>
                {item.children ? (
                  <ul className="tw-styled-list">{renderFlowItem(item.children)}</ul>
                ) : (
                  '- 暂无流程 -'
                )}
              </Card>
            ),
            link: item.displayFlag && ( //是否显示
              <li key={genFakeId()}>
                <Tooltip title={item.toolTip}>
                  {item.clickFlag ? ( //是否可点击
                    item.jumpFlag ? ( // 点击是否跳转
                      <Link className="tw-link" to={item.link ? item.link : '/user/flow/panel'}>
                        {item.text}
                      </Link>
                    ) : (
                      <a
                        className="tw-link"
                        onClick={() =>
                          createAlert.info({
                            className: 'attention',
                            content: (
                              <div>
                                <p>{item.clickMsg ? item.clickMsg : '功能未启用!'}</p>
                              </div>
                            ),
                          })
                        }
                      >
                        {item.text}
                      </a>
                    )
                  ) : (
                    <span className="text-disable">{item.text}</span>
                  ) // 不可点击时 仅显示流程名称文本
                  }
                </Tooltip>
              </li>
            ),
          }[item.type])
      );

    const FlowItem = () =>
      flowDatas && flowDatas.length > 0 ? renderFlowItem(flowDatas) : renderFlowItem(flowData);

    return (
      <PageHeaderWrapper title="流程面板">
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="新建流程" />}
        >
          <Row type="flex" justify="start" align="flex-start" gutter={8}>
            <FlowItem />
          </Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default FlowPanel;
