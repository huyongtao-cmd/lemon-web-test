import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Modal, Button, Card, Input, Row, Col } from 'antd';
import classnames from 'classnames';
import { isNil } from 'ramda';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import DataTable from '@/components/common/DataTable';
import RichText from '@/components/common/RichText';
import { fromQs } from '@/utils/stringUtils';
import { FileManagerEnhance } from '@/pages/gen/field';

// const param = fromQs();
const DOMAIN = 'flowVersion';
@connect(({ dispatch, loading, flowVersion }) => ({
  dispatch,
  flowVersion,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class VersionList extends Component {
  state = { visible: {}, textValue: '', inputValue: '' };

  componentDidMount() {
    const param = fromQs();

    const { key } = param;
    this.setState(
      {
        inputValue: param.name,
      },
      () => {
        this.forceUpdate();
        this.fetchData({ key });
      }
    );
  }

  fetchData = params => {
    const param = fromQs();

    const { key } = param;
    const { dispatch } = this.props;
    Object.assign(params, { key });
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  tableCfg = () => {
    const { loading, flowVersion, dispatch } = this.props;
    const { visible, textValue } = this.state;
    const { list, total } = flowVersion;
    const tableProps = {
      rowKey: 'rowKey',
      scroll: {
        // y: 330,
      },
      columnsCache: DOMAIN,
      dispatch,
      enableSelection: false,
      showSearch: false,
      showExport: false,
      showColumn: false,
      sortBy: 'versionTag',
      loading,
      expirys: 0,
      total,
      dataSource: list,
      onChange: filters => {
        const { offset } = filters;
        this.fetchData(filters);
      },
      columns: [
        {
          title: '流程名称',
          dataIndex: 'name',
          key: 'name',
          width: '40%',
        },
        {
          title: '版本',
          dataIndex: 'versionTag',
          key: 'versionTag',
          className: 'text-center',
          width: '10%',
          sorter: true,
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          className: 'text-center',
          width: '25%',
          render: (keys, record, index) => {
            const $key = index;
            const { key } = record;
            return (
              <div>
                <span
                  style={{ cursor: 'pointer', color: '#284488' }}
                  onClick={() => {
                    const { versionTag } = record;
                    dispatch({
                      type: `${DOMAIN}/queryVersionItemByVersionTag`,
                      payload: {
                        versionTag,
                        procKey: key,
                      },
                    }).then(res => {
                      if (res.ok) {
                        this.setState(
                          {
                            textValue: {
                              [$key]: isNil(res.datum) ? '' : res.datum.procExplain,
                            },
                          },
                          () => {
                            this.showModal(record, $key);
                          }
                        );
                      } else {
                        this.setState(
                          {
                            textValue: {
                              [$key]: '',
                            },
                          },
                          () => {
                            this.showModal(record, $key);
                          }
                        );
                      }
                    });
                  }}
                >
                  修改流程规则
                </span>
                {visible[$key] && (
                  <Modal
                    title="修改流程规则说明"
                    width={800}
                    visible={visible[$key]}
                    onOk={() => this.handleOk(record, $key)}
                    onCancel={this.handleCancel}
                  >
                    {visible[$key] && (
                      <RichText
                        style={{ marginBottom: 20 }}
                        value={textValue[$key]}
                        onChange={value => {
                          this.setState({
                            textValue: {
                              [$key]: value,
                            },
                          });
                        }}
                      />
                    )}

                    {/* <Row style={{ marginTop: 20 }}>
                      <FileManagerEnhance
                        api="/api/base/v1/procExplain/sfs/token"
                        dataKey={undefined}
                        listType="text"
                      />
                    </Row> */}
                  </Modal>
                )}
              </div>
            );
          },
        },
      ],
    };
    return tableProps;
  };

  showModal = ({ key }, $key) => {
    this.setState({
      // key: $key,
      visible: {
        [$key]: true,
      },
    });
  };

  handleCancel = ({ key }, $key) => {
    this.setState({
      visible: {
        [$key]: false,
      },
    });
  };

  handleOk = ({ key, id, versionTag }, $key) => {
    const { dispatch } = this.props;

    this.setState(
      {
        // $key,
        visible: {
          [$key]: false,
        },
      },
      () => {
        const { textValue } = this.state;
        dispatch({
          type: `${DOMAIN}/savePutSaveExplain`,
          payload: {
            id,
            versionTag,
            procKey: key,
            procExplain: textValue[$key],
          },
        });
      }
    );
  };

  render() {
    const { inputValue } = this.state;
    return (
      <PageHeaderWrapper title="流程管理">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              closeThenGoto(`/sys/flowMen/flow`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card>
          <Row align="middle">
            <Col span={3} push={1} style={{ height: '32px', lineHeight: '32px' }}>
              流程名称
            </Col>
            <Col span={12}>
              <Input disabled value={inputValue} />
            </Col>
          </Row>

          <DataTable {...this.tableCfg()} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default VersionList;
