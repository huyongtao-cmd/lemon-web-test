/* eslint-disable array-callback-return */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable-next-line array-callback-return */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { flatten } from 'lodash';
import createMessage from '@/components/core/AlertMessage';

import { fromQs } from '@/utils/stringUtils';
import { Button, Row, Col, Card, Form } from 'antd';

import styles from './styles.less';
import {
  SetThemeFlowModel,
  AddAbilityMapModel,
  SetReportLogModel1,
  SetReportLogModel2,
  ProcessShow,
  AbilityMapShow,
  ColumnarBizChart,
  UpLoadModel,
} from '../components';

const flatArry = arry => {
  // 重组数据
  const newArry = [];
  arry.map(item => {
    const obj1 = [];
    const item1 = item;
    for (const k in item1) {
      const obj2 = {};
      if (k !== 'id') {
        obj2.value = item1[k];
        obj2.yaxisLabel = item.id;
        obj2.xaxisLabel = k;
        obj1.push(obj2);
      }
    }
    newArry.push(obj1);
  });
  return flatten(newArry);
};

class PanelThree extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      setThemeFlowModel: false,
      addAbilityMapModel: false,
      setReportLogModel1: false,
      setReportLogModel2: false,
      upLoadModel: false,
      editIndex: '',
    };
  }

  componentDidMount() {}

  // 选择那个模块

  handWhichBlock = index => {
    this.setState({
      editIndex: index,
    });
  };

  // 编辑
  handleEdit = () => {
    const { editIndex } = this.state;
    if (editIndex === '') {
      createMessage({ type: 'error', description: '请选中编辑模块' });
    } else {
      switch (editIndex) {
        case 1:
          this.handUpload();
          break;
        case 2:
          this.handUpload();
          break;
        case 3:
          this.handUpload();
          break;
        case 4:
          this.handSetFlowModel();
          break;
        case 5:
          this.handSetReportLogModel1();
          break;
        case 6:
          this.handAddAbilityMap();
          break;
        case 7:
          this.handSetReportLogModel2();
          break;
        default:
          break;
      }
    }
  };

  // 取消
  handleCancel = () => {
    this.setState({
      editIndex: '',
    });
  };

  // 上传图片
  upLoadModelProps = () => {
    const { options } = this.props;
    const { DOMAIN, dispatch } = options;
    const { upLoadModel } = this.state;
    const { id } = fromQs();
    return {
      title: '上传图片',
      ...options,
      visible: upLoadModel,
      width: '80%',
      onCancel: () => {
        this.setState({
          upLoadModel: false,
          editIndex: '',
        });
        dispatch({
          type: `${DOMAIN}/getThemeById`,
          payload: {
            id,
          },
        });
      },
      onOk: () => {
        this.setState({
          upLoadModel: false,
          editIndex: '',
        });
        dispatch({
          type: `${DOMAIN}/getThemeById`,
          payload: {
            id,
          },
        });
      },
    };
  };

  setThemeFlowModelProps = () => {
    const { options } = this.props;
    const { DOMAIN, dispatch } = options;
    const { setThemeFlowModel } = this.state;
    const { id } = fromQs();
    return {
      title: '设置流程',
      ...options,
      visible: setThemeFlowModel,
      width: '80%',
      onCancel: () => {
        this.setState({
          setThemeFlowModel: false,
          editIndex: '',
        });
        dispatch({
          type: `${DOMAIN}/processQuery`,
          payload: {
            id,
          },
        });
      },
      onOk: () => {
        this.setState({
          setThemeFlowModel: false,
          editIndex: '',
        });
        dispatch({ type: `${DOMAIN}/saveThemeFlow`, payload: { id } });
      },
    };
  };

  addAbilityMapModelProps = () => {
    const { options } = this.props;
    const { DOMAIN, dispatch } = options;
    const { addAbilityMapModel } = this.state;
    return {
      title: '能力地图',
      visible: addAbilityMapModel,
      width: '80%',
      ...options,
      onCancel: () => {
        this.setState({
          addAbilityMapModel: false,
          editIndex: '',
        });
        dispatch({ type: `${DOMAIN}/selectedAbilityItem`, payload: '' });
      },
      onOk: () => {
        this.setState({
          addAbilityMapModel: false,
          editIndex: '',
        });
        dispatch({ type: `${DOMAIN}/selectedAbilityItem`, payload: '' });
      },
    };
  };

  setReportLogModel1Props = () => {
    const { options } = this.props;
    const { DOMAIN, dispatch } = options;
    const { id } = fromQs();
    const { setReportLogModel1 } = this.state;
    const {
      systemProductDetail: { dataSource1, reportId1 },
    } = options;
    return {
      title: '设置报表',
      visible: setReportLogModel1,
      width: '60%',
      ...options,
      onCancel: () => {
        this.setState({
          setReportLogModel1: false,
          editIndex: '',
        });
        dispatch({ type: `${DOMAIN}/queryByReportById`, payload: { id } });
        dispatch({ type: `${DOMAIN}/queryReportDataById`, payload: { id } });
      },
      onOk: () => {
        this.setState({
          setReportLogModel1: false,
          editIndex: '',
        });
        const data1 = flatArry(dataSource1);
        dispatch({
          type: `${DOMAIN}/reportDataSave`,
          payload: { themeId: id, reportId: reportId1, location: 1, params: data1 },
        });
      },
    };
  };

  setReportLogModel2Props = () => {
    const { options } = this.props;
    const { DOMAIN, dispatch } = options;
    const { id } = fromQs();
    const { setReportLogModel2 } = this.state;
    const {
      systemProductDetail: { dataSource2, reportId2 },
    } = options;
    return {
      title: '设置报表',
      visible: setReportLogModel2,
      width: '60%',
      ...options,
      onCancel: () => {
        this.setState({
          setReportLogModel2: false,
          editIndex: '',
        });
        dispatch({ type: `${DOMAIN}/queryByReportById`, payload: { id } });
        dispatch({ type: `${DOMAIN}/queryReportDataById`, payload: { id } });
      },
      onOk: () => {
        this.setState({
          setReportLogModel2: false,
          editIndex: '',
        });
        const data2 = flatArry(dataSource2);
        dispatch({
          type: `${DOMAIN}/reportDataSave`,
          payload: { themeId: id, reportId: reportId2, location: 2, params: data2 },
        });
      },
    };
  };

  // 上传图片1
  handUpload = () => {
    const { options } = this.props;
    const { DOMAIN, dispatch } = options;
    this.setState({
      upLoadModel: true,
    });
  };

  handSetFlowModel = () => {
    this.setState({
      setThemeFlowModel: true,
    });
  };

  handAddAbilityMap = () => {
    this.setState({
      addAbilityMapModel: true,
    });
  };

  handSetReportLogModel1 = () => {
    const { options } = this.props;
    const { DOMAIN, dispatch } = options;
    this.setState({
      setReportLogModel1: true,
    });
  };

  handSetReportLogModel2 = () => {
    const { options } = this.props;
    const { DOMAIN, dispatch } = options;
    this.setState({
      setReportLogModel2: true,
    });
  };

  render() {
    const { options } = this.props;
    const {
      systemProductDetail: { processList, abilityMapList, dataSource1, dataSource2, themeItem },
    } = options;
    const {
      setThemeFlowModelProps,
      addAbilityMapModelProps,
      setReportLogModel1Props,
      setReportLogModel2Props,
      upLoadModelProps,
      handSetFlowModel,
      handAddAbilityMap,
      handSetReportLogModel1,
      handSetReportLogModel2,
      handWhichBlock,
      handUpload,
    } = this;
    const {
      setThemeFlowModel,
      addAbilityMapModel,
      setReportLogModel1,
      setReportLogModel2,
      upLoadModel,
      editIndex,
    } = this.state;
    return (
      <>
        <div style={{ padding: '0 10px' }}>
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              icon="form"
              size="large"
              onClick={() => this.handleEdit()}
            >
              编辑
            </Button>
            {/* <Button
                className="tw-btn-primary"
                icon="form"
                size="large"
                onClick={() => this.handleCancel()}
              >
                取消
              </Button> */}
          </Card>
        </div>

        <div className={styles.contain}>
          <div className="containRow" style={{ padding: '10px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Card
                  title={
                    themeItem.newPanelTitle && themeItem.newPanelTitle[0]
                      ? themeItem.newPanelTitle[0]
                      : '上传图片'
                  }
                  className={`${styles.uploadContain} ${editIndex === 1 ? styles.borderStyle : ''}`}
                  onClick={() => handWhichBlock(1)}
                >
                  {themeItem.imgs && themeItem.imgs.length > 0 ? (
                    <img
                      alt="example"
                      width="100%"
                      height="100%"
                      src={`data:image/jpeg;base64,${themeItem.imgs[0]}`}
                    />
                  ) : (
                    <Button
                      className={`${styles.btn_center} tw-btn-primary`}
                      icon="form"
                      size="large"
                      onClick={handUpload}
                    >
                      上传图片
                    </Button>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  title={
                    themeItem.newPanelTitle && themeItem.newPanelTitle[1]
                      ? themeItem.newPanelTitle[1]
                      : '上传图片'
                  }
                  className={`${styles.uploadContain} ${editIndex === 2 ? styles.borderStyle : ''}`}
                  onClick={() => handWhichBlock(2)}
                >
                  {themeItem.imgs && themeItem.imgs.length > 1 ? (
                    <img
                      alt="example"
                      width="100%"
                      height="100%"
                      src={`data:image/jpeg;base64,${themeItem.imgs[1]}`}
                    />
                  ) : (
                    <Button
                      className={`${styles.btn_center} tw-btn-primary`}
                      icon="form"
                      size="large"
                      onClick={handUpload}
                    >
                      上传图片
                    </Button>
                  )}
                </Card>
              </Col>
            </Row>
            <Row gutter={16} className={styles.distance_top}>
              <Col span={24}>
                <Card
                  title="主要流程"
                  className={`${styles.flowContain} ${editIndex === 4 ? styles.borderStyle : ''}`}
                  onClick={() => handWhichBlock(4)}
                >
                  {processList.length === 0 ? (
                    <Button
                      className={`${styles.btn_center} tw-btn-primary`}
                      icon="form"
                      size="large"
                      onClick={handSetFlowModel}
                    >
                      设置流程
                    </Button>
                  ) : (
                    <div className={styles.overContain}>
                      <ProcessShow data={processList} />
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
            <Row gutter={16} className={styles.distance_top}>
              <Col span={16}>
                <Card
                  title="能力地图"
                  className={`${styles.flowContain} ${editIndex === 6 ? styles.borderStyle : ''}`}
                  onClick={() => handWhichBlock(6)}
                >
                  {abilityMapList.length === 0 ? (
                    <Button
                      className={`${styles.btn_center} tw-btn-primary`}
                      icon="form"
                      size="large"
                      onClick={handAddAbilityMap}
                    >
                      设置能力地图
                    </Button>
                  ) : (
                    <AbilityMapShow data={abilityMapList} />
                  )}
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  title={
                    themeItem.newPanelTitle && themeItem.newPanelTitle[2]
                      ? themeItem.newPanelTitle[2]
                      : '报表'
                  }
                  className={`${styles.flowContain} ${editIndex === 5 ? styles.borderStyle : ''}`}
                  onClick={() => handWhichBlock(5)}
                >
                  {dataSource1.length === 0 ? (
                    <Button
                      className={`${styles.btn_center} tw-btn-primary`}
                      icon="form"
                      size="large"
                      onClick={() => handSetReportLogModel1()}
                    >
                      设置报表
                    </Button>
                  ) : (
                    <ColumnarBizChart dataSource={dataSource1} />
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        </div>
        {setThemeFlowModel && <SetThemeFlowModel {...setThemeFlowModelProps()} />}
        {addAbilityMapModel && <AddAbilityMapModel {...addAbilityMapModelProps()} />}
        {setReportLogModel1 && <SetReportLogModel1 {...setReportLogModel1Props()} />}
        {setReportLogModel2 && <SetReportLogModel2 {...setReportLogModel2Props()} />}
        {upLoadModel && <UpLoadModel {...upLoadModelProps()} />}
      </>
    );
  }
}

export default PanelThree;
