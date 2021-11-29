import React from 'react';
import { connect } from 'dva';
import { Card, Row, Popover } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import ReportIcon from '@/assets/img/reportNav_icon.svg';
import router from 'umi/router';

const DOMAIN = 'reportNav';

@connect(({ reportNav }) => ({ reportNav }))
class ReportNav extends React.PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query` });
  }

  handleClick = value => {
    console.warn(value);
    const { id, reportCode, reportUrl, reportTitle } = value;
    const { dispatch } = this.props;
    dispatch({
      type: `reportNavDetail/updateState`,
      payload: {
        parameter: {
          id,
          code: reportCode,
          url: reportUrl,
          title: reportTitle,
        },
        iframeSrc: '',
      },
    });
    router.push('/user/project/projectWaitAuth?type=NAV');
    // router.push('/plat/reportMgmt/navDetail');
  };

  render() {
    const {
      reportNav: { source },
    } = this.props;

    return (
      <PageHeaderWrapper title="报表展示厅">
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="报表展示厅" />}
        >
          <Row type="flex" align="middle" justify="start">
            {source &&
              source.map(item => (
                <div
                  style={{ position: 'relative', margin: 10, cursor: 'pointer' }}
                  onClick={() => this.handleClick(item)}
                  key={'item' + item.id}
                >
                  <img src={ReportIcon} alt="icon" />
                  <Popover content={item.reportTitle}>
                    <p
                      style={{
                        position: 'absolute',
                        bottom: 22,
                        left: 16,
                        width: 110,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 14,
                      }}
                    >
                      {item.reportTitle}
                    </p>
                  </Popover>
                </div>
              ))}
          </Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ReportNav;
