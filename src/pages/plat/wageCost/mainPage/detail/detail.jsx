import React, { Component } from 'react';
import { Button, Card, Divider, Modal, Form, Select, Table, Upload, Spin } from 'antd';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { connect } from 'dva';
import conf from '../../common/detailTableConf';
import styles from './detail.less';
import DetailForm from './detailForm';
import api from '@/api';
import { serverUrl, getCsrfToken, request } from '@/utils/networkUtils';
import createMessage from '@/components/core/AlertMessage';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';

const defaultPagination = {
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
  showTotal: total => `共 ${total} 条`,
  defaultPageSize: 10,
  defaultCurrent: 1,
  size: 'default',
};

const DOMAIN = 'wageCostMainPage';
@connect(({ loading, wageCostMainPage }) => ({
  loading,
  ...wageCostMainPage,
}))
class WagePageMainDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadLoading: false,
      modalVisible: false,
      uploadprops: {
        name: 'file',
        onChange: this.onChange,
        data: this.getExtraData,
        beforeUpload: this.beforeUpload,
        method: 'post',
        action: `${serverUrl}${api.plat.wageCost.exportExecl}`,
        headers: {
          'el-xsrf': getCsrfToken(),
        },
        withCredentials: true,
        showUploadList: false,
      },
    };
  }

  componentDidMount() {
    // const { dispatch } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/updateState`,
    //   payload: {
    //     formRefs: this.formRefs,
    //   },
    // });
  }

  // beforeUpload
  beforeUpload = (file, fileList) => {};

  // onChange
  onChange = info => {
    const { dispatch } = this.props;
    this.setState({
      uploadLoading: true,
    });
    // 如果上传完成
    if (info.file.status === 'done') {
      if (info.file.response.ok) {
        createMessage({
          type: 'success',
          description: '操作成功',
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            detailList: info.file.response.datum,
            payObjList: [], // 付款对象列表
            payObjTotal: 0, // 付款对象列表总数
            BUList: [], // BU成本列表
            BUTotal: 0, // BU成本列表总数
            BUIsSave: false, // BU成本保存
            payObjIsSave: false, // 付款对象保存
          },
        });
      } else {
        createMessage({
          type: 'error',
          description: info.file.response.reason + info.file.response.datum,
        });
      }
      this.setState({
        uploadLoading: false,
      });
    }
  };

  // getExtraData
  getExtraData = file => {
    const { mainDataId } = this.props;
    return {
      id: mainDataId,
    };
  };

  handleCancel = () => {
    this.setState({
      modalVisible: false,
    });
  };

  render() {
    const { loading, detailList } = this.props;
    const { uploadprops, uploadLoading, modalVisible } = this.state;
    console.log('WagePageMainDetail', this.props);
    return (
      <PageHeaderWrapper title="新增成本管理">
        <Spin spinning={uploadLoading}>
          <Card
            className={['tw-card-adjust']}
            title={
              <Title
                icon="profile"
                id="ui.menu.plat.expense.wageCost.mainpage.detail.baseInfo"
                defaultMessage="基本信息"
              />
            }
            headStyle={{ background: '#fff' }}
            bordered={false}
          >
            <DetailForm id="wageCostDetailForm" />
          </Card>
          <Card
            className="tw-card-adjust"
            title={
              <Title
                icon="profile"
                id="ui.menu.plat.expense.wageCost.mainpage.detail.orderDetail"
                defaultMessage="单据明细"
              />
            }
            headStyle={{ background: '#fff' }}
            bodyStyle={{ padding: '0px' }}
            bordered={false}
          >
            <div className={styles.orderDetail}>
              <div className={styles.detailTable}>
                <Table
                  bordered
                  pagination={defaultPagination}
                  loading={loading.effects[`platResProfileCapa/query`]}
                  dataSource={detailList}
                  scroll={{ x: 5700 }}
                  columns={conf()}
                  rowKey={(record, index) => `${index}`}
                  // expandedRowRender={this.expandedRowRender}
                />
                <div className={styles.detailButton}>
                  <div style={{ display: 'inline-block' }}>
                    <Upload {...uploadprops}>
                      <Button size="large" type="default" className="tw-btn-primary">
                        <Title id="misc.export" defaultMessage="Execl导入" />
                      </Button>
                    </Upload>
                  </div>
                  <Button
                    className={['tw-btn-primary', `${styles.buttonLeft}`]}
                    size="large"
                    disabled={false}
                    onClick={() => this.setState({ modalVisible: true })}
                  >
                    <Title id="misc.check" defaultMessage="校验说明" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </Spin>
        <Modal
          title="校验说明"
          visible={modalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
        >
          <div>
            <div>1.公司名称和系统中公司名称匹配</div>
            <div>2.BU名称和系统中的BU要匹配</div>
            <div>
              3.应付工资=基本工资+岗位津贴+当月应发绩效工资+出差补贴+当量工资+加项-病假-减项
            </div>
            <div>4.实发工资=应付工资-个人社保-个人公积金-个调税</div>
            <div>5.公司福利保险合计=公司社保+公司公积金+残保金等+服务费</div>
            <div>6.公司成本合计=应付工资+公司福利保险合计+外包1+外包2+外包3+外包4+外包5</div>
            <div>7.社保个人小计=个人养保+个人医保+个人失保</div>
            <div>8.公司社保小计=公司养保+公司医保+公司失保+公司工伤+公司生育+异地大病医疗</div>
          </div>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default WagePageMainDetail;
