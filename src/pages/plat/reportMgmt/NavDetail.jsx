import React from 'react';
import { connect } from 'dva';
import { Card, Col, Row, Button, Form, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import { getParam, addParam, editParam } from '@/utils/urlUtils';
import { Selection, DatePicker } from '@/pages/gen/field';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';

import indicatorClosed from './indicator_closed.svg';
import indicatorOpen from './indicator_open.svg';
import styles from './styles.less';

const DOMAIN = 'reportNavDetail';

// 动态设置iframe高度
const h = document.documentElement.clientHeight || document.body.clientHeight;
const height = h - 50 - 35;

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
  colon: false,
};

const ColProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 8,
  xl: 8,
};

@connect(({ reportNavDetail }) => ({ reportNavDetail }))
@mountToTab()
class NavDetail extends React.PureComponent {
  state = {
    collapsed: true,
  };

  componentDidMount() {
    const {
      dispatch,
      reportNavDetail: { parameter },
    } = this.props;
    const { id, code, url } = parameter;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {},
      },
    });
    id &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: id,
      });
    code &&
      dispatch({
        type: `${DOMAIN}/queryParam`,
        payload: code,
      }).then(res => {
        if (!res.length) {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              iframeSrc: url,
            },
          });
        }
      });
  }

  handleBtnClick = value => {
    const { id, reportCode, reportUrl, reportTitle } = value;
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {},
        parameter: {
          id,
          code: reportCode,
          url: reportUrl,
          title: reportTitle,
        },
        iframeSrc: reportUrl,
      },
    });
    id &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: id,
      });
    reportCode &&
      dispatch({
        type: `${DOMAIN}/queryParam`,
        payload: reportCode,
      }).then(res => {
        if (!res.length) {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              iframeSrc: reportUrl,
            },
          });
        }
      });
  };

  handleChange = (key, value) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        [key]: value,
      },
    });
  };

  handleRun = () => {
    const {
      dispatch,
      reportNavDetail: { formData, parameter },
    } = this.props;
    const { url } = parameter;
    // let iframeSrc = url.indexOf('?') > 0 ? url + '&' : url + '?';
    // Object.keys(formData).forEach(key => {
    //   iframeSrc += `${key}=${formData[key]}&`;
    // });
    let iframeSrc = url;
    Object.keys(formData).forEach(key => {
      if (getParam(iframeSrc, key)) {
        iframeSrc = editParam(iframeSrc, key, formData[key]);
      } else {
        iframeSrc = addParam(iframeSrc, key, formData[key]);
      }
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        iframeSrc,
      },
    });
  };

  toggleCollapsed() {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
    });
  }

  render() {
    const {
      reportNavDetail: { btnSource, paramData, formData, parameter, iframeSrc },
    } = this.props;
    const { collapsed } = this.state;

    // console.warn(iframeSrc);
    // console.warn(paramData);

    return (
      <PageHeaderWrapper title="报表详情">
        <Card
          className="tw-card-rightLine-more"
          title={btnSource.map(value => (
            <Button
              className="tw-btn-primary"
              size="large"
              key={value.id}
              onClick={() => this.handleBtnClick(value)}
            >
              {value.reportTitle}
            </Button>
          ))}
          extra={
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => closeThenGoto('/plat/reportMgmt/reportNav')}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          }
          style={{ marginBottom: 10 }}
        />

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text={parameter.title || '报表详情'} />}
        >
          {!!paramData.length && (
            <div
              className={styles.searchBar}
              style={{
                height: collapsed ? 60 : '100%',
              }}
            >
              <Form className={styles.formFlex}>
                <Row className={styles.formFlexContent} gutter={6}>
                  <Col span={22}>
                    {paramData.map(item => {
                      if (item.parameType === 'UDC') {
                        return (
                          <Col span={8} {...ColProps} key={item.parameVar}>
                            <Form.Item label={item.parameName} {...formItemLayout}>
                              <Selection
                                source={item.selectList}
                                value={formData[item.parameVar]}
                                transfer={{ key: 'id', code: 'id', name: 'name' }}
                                onChange={v => this.handleChange(item.parameVar, v)}
                              />
                            </Form.Item>
                          </Col>
                        );
                      }
                      if (item.parameType === 'SELECTOR') {
                        return (
                          <Col span={8} {...ColProps} key={item.parameVar}>
                            <Form.Item label={item.parameName} {...formItemLayout}>
                              <Selection
                                source={item.selectList}
                                value={formData[item.parameVar]}
                                transfer={{ key: 'id', code: 'id', name: 'name' }}
                                onChange={v => this.handleChange(item.parameVar, v)}
                              />
                            </Form.Item>
                          </Col>
                        );
                      }
                      if (item.parameType === 'DATE') {
                        return (
                          <Col span={8} {...ColProps} key={item.parameVar}>
                            <Form.Item label={item.parameName} {...formItemLayout}>
                              <DatePicker
                                value={formData[item.parameVar]}
                                onChange={v => this.handleChange(item.parameVar, v)}
                              />
                            </Form.Item>
                          </Col>
                        );
                      }
                      if (item.parameType === 'TEXT') {
                        return (
                          <Col span={8} {...ColProps} key={item.parameVar}>
                            <Form.Item label={item.parameName} {...formItemLayout}>
                              <Input
                                value={formData[item.parameVar]}
                                onChange={v => this.handleChange(item.parameVar, v.target.value)}
                              />
                            </Form.Item>
                          </Col>
                        );
                      }
                      return null;
                    })}
                  </Col>
                  <Col span={2}>
                    <Button className="tw-btn-primary" size="large" onClick={this.handleRun}>
                      查询
                    </Button>
                  </Col>
                </Row>
              </Form>

              {paramData.length > 3 && (
                <div className={styles.indicator}>
                  <img
                    src={collapsed ? indicatorOpen : indicatorClosed}
                    onClick={this.toggleCollapsed.bind(this)}
                    alt="icon"
                  />
                </div>
              )}
            </div>
          )}

          <div
            style={{
              background: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 10,
            }}
          >
            <iframe
              src={iframeSrc}
              style={{ width: '100%', height }}
              title="报表"
              frameBorder="0"
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default NavDetail;
