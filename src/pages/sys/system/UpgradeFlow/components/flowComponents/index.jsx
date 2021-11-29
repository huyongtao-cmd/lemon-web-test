import React, { Component } from 'react';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import { connect } from 'dva';
import { Button, Card, Input, Tag } from 'antd';
import $ from 'jquery';
import Modeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import camundaModdleDescriptor from './resources/camunda.json';
import propertiesProviderModule from './provider/magic';
import providerObj from './provider/magic/MagicPropertiesProvider';
import createMessage from '@/components/core/AlertMessage';
import MultiSourceSelect from '@/pages/gen/modal/MultiSourceSelect/MultiSourceSelect';
import { fromQs, getGuid } from '@/utils/stringUtils';
import styles from './bpmn-styles.less';

const { getDispath, setValueToXml, flowIsCreateFn, nameChange } = providerObj;
let modeler = '';
const sourceConfig = [
  {
    name: 'tw:flow:role',
    columns: [
      {
        title: '编码',
        dataIndex: 'code',
      },
      {
        title: '名称',
        dataIndex: 'name',
      },
      {
        title: '审批人',
        dataIndex: 'approver',
        render: (value, record) => {
          if (record && record.entity) {
            return record.entity.approver;
          }
          return '';
        },
      },
    ],
  },
];
const TAB_CONTENT_HEIGHT = 400;
const FLOW_ROLE_SOURCE_NAME = 'tw:flow:role';
const defaultBpmnInfo = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_08kjbbf" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="3.3.2">
  <bpmn:process id="Process_1mz8axj" isExecutable="true" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1mz8axj" />
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const transferArray = value =>
  // eslint-disable-next-line
  Object.values(value).reduce((prev, curr) => {
    return [...prev, ...curr];
  }, []);
@connect(({ dispatch, flowUpgrade }) => ({
  dispatch,
  flowUpgrade,
  // loading: loading.effects[`${DOMAIN}/query`],
}))
class Flow extends Component {
  state = {
    filesList: [],
    inputName: '',
    stores: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id = '', _refresh = '' } = fromQs();
    // 获取到id时是修改流程 flowIsCreateFn 传 false，但是在修改时如果切换了tab那么需要拉取在组件销毁时存的xml，不需要获取接口的xml
    if (id) {
      if (_refresh !== '0') {
        this.getFlow();
      } else {
        this.initPage();
      }
      flowIsCreateFn(false);
    } else {
      this.initPage();
      flowIsCreateFn(true);
    }

    nameChange(this.nameChangeHandle);
  }

  // 组件销毁时保存XML，再次进到页面时加载此时保存的XML
  componentWillUnmount() {
    const { filesList } = this.state;
    const { dispatch, flowUpgrade } = this.props;
    let bpmnInfo = flowUpgrade.bpmnInfo || defaultBpmnInfo;
    if (filesList.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      bpmnInfo = filesList[0];
    }

    dispatch({
      type: 'flowUpgrade/updateState',
      payload: { bpmnInfo },
    });
  }

  nameChangeHandle = val => {
    this.setState({
      inputName: val,
    });
  };

  seedDispath = () => {
    const { dispatch } = this.props;
    getDispath(dispatch);
  };

  getFlow = () => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: 'flowUpgrade/getFlow',
      payload: {
        deploymentId: id,
      },
    }).then(result => {
      if (result) {
        this.initPage();
      }
    });
  };

  initPage = () => {
    this.createBpmnModeler();
    this.seedDispath();
  };

  createBpmnModeler = () => {
    modeler = new Modeler({
      additionalModules: [propertiesPanelModule, propertiesProviderModule],
      moddleExtensions: {
        camunda: camundaModdleDescriptor,
      },
      container: '#canvas',
      propertiesPanel: {
        parent: '#properties',
      },
    });
    const {
      flowUpgrade: { bpmnInfo = defaultBpmnInfo },
    } = this.props;
    const diagramXML = bpmnInfo;
    modeler.importXML(diagramXML);

    $('#js-download-diagram').click(e => {
      if (!$(this).is('.active')) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    const setEncoded = (link, name, data) => {
      const encodedData = encodeURIComponent(data);
      if (data) {
        // window.open('data:application/bpmn20-xml;charset=UTF-8,' + encodedData);
        if (data) {
          const file = 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData;
          link.addClass('active').attr({
            href: file,
            download: name,
          });
          const filesList = [data];
          // console.error('filesList', filesList);
          this.setState({
            filesList,
          });
        } else {
          link.removeClass('active');
        }
      }
    };

    const saveDiagram = done => {
      modeler.saveXML({ format: true }, (err, xml) => {
        done(err, xml);
      });
    };
    const downloadLink = $('#js-download-diagram');
    const exportArtifacts = () => {
      saveDiagram((err, xml) => {
        setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
      });
    };
    modeler.on('commandStack.changed', exportArtifacts);
  };

  saveFlowHandle = () => {
    const { filesList, inputName } = this.state;
    const { dispatch } = this.props;
    if (filesList.length > 0) {
      dispatch({
        type: 'flowUpgrade/submit',
        payload: {
          name: inputName,
          source: filesList[0],
        },
      });
    } else {
      createMessage({ type: 'error', description: '文件无修改' });
    }
  };

  // nameChange = e => {
  //   this.setState({
  //     inputName: e.target.value,
  //   });
  // };

  onOk = stores => {
    const { dispatch, flowUpgrade } = this.props;
    const { eleId = '', callback = '' } = flowUpgrade;
    const { flowid } = fromQs();
    const defKey = flowid && flowid.split(':')[0];
    const params = this.transferStores(stores);
    dispatch({
      type: 'flowUpgrade/updateState',
      payload: { roleChoseModalShow: false },
    });
    let xmlVal = '';
    transferArray(stores).map(item => {
      xmlVal = xmlVal + item.code + item.name;
      return item;
    });
    // setValueToXml({
    //   id: eleId,
    //   value: xmlVal,
    // });

    // callback(xmlVal);

    dispatch({
      type: 'flowUpgrade/flowTo',
      payload: {
        defKey,
        taskKey: eleId,
        id: params.members[0] || 0,
      },
    }).then(result => {
      // TODO
      if (typeof callback === 'function') {
        callback(xmlVal);
      }
    });
  };

  transferStores = stores => {
    // tag:: 这里是单数据源，所以 stores 的类型就是 { source: [{ code, name}] }
    // re-tag:: 应该写在model里面，写这里方便跟 then 之后的操作做对应
    const source = Object.keys(stores)[0] || FLOW_ROLE_SOURCE_NAME;
    const members = (stores[source] || []).map(({ id }) => id);
    return {
      source,
      members,
    };
  };

  hideModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'flowUpgrade/updateState',
      payload: { roleChoseModalShow: false },
    });
  };

  renderStores = () => {
    const { stores } = this.state;
    const empty = isEmpty(stores);
    if (empty) return <span>{formatMessage({ id: 'misc.void', desc: '空' })}</span>;
    return Object.keys(stores).map(key => {
      const list = stores[key];
      return (
        <React.Fragment key={key}>
          <div className="tw-card-title">{key === 'tw:flow:role' ? '流程角色' : key}</div>
          <div className={styles.selectedStores}>
            {list.map(({ name }) => (
              <Tag
                key={name}
                className={styles.store}
                color="blue"
                closable
                onClose={() => this.handleDelete(name, key)}
              >
                {name || ''}
              </Tag>
            ))}
          </div>
        </React.Fragment>
      );
    });
  };

  render() {
    const { inputName } = this.state;
    const { flowUpgrade } = this.props;
    const { roleChoseModalShow = false } = flowUpgrade;
    const { id = '' } = fromQs();
    return (
      <div>
        <Card className={styles.topButtonWrap} bordered={false}>
          <Button
            type="primary"
            size="large"
            className={styles.buttonSpace}
            onClick={() => {
              this.saveFlowHandle();
            }}
          >
            发布流程
          </Button>
          {id && (
            <Button
              type="primary"
              size="large"
              className="tw-btn-info"
              style={{ marginRight: 15 }}
              onClick={() => {
                const { flowid } = fromQs();
                const jumpUrl = `/sys/flowMen/UpgradeFlow/UpgradeFlowConfig/BusinessConfig?id=${flowid}&name=${encodeURI(
                  inputName
                )}`;
                router.push(jumpUrl);
              }}
            >
              业务配置
            </Button>
          )}
          {id && (
            <Button
              type="primary"
              size="large"
              className="tw-btn-info"
              onClick={() => {
                const { flowid, key } = fromQs();
                const jumpUrl = `/sys/flowMen/UpgradeFlow/UpgradeFlowConfig/FlowManager?id=${flowid}&key=${key}`;
                router.push(jumpUrl);
              }}
            >
              流程节点配置
            </Button>
          )}
        </Card>
        <Card
          className={styles.mainWrap}
          title={
            <div>{inputName}</div>
            // <Input
            //   value={inputName || name}
            //   placeholder="输入流程名称"
            //   onChange={this.nameChange}
            // />
          }
          bordered={false}
          style={{ marginTop: '5px' }}
        >
          <div className={styles.flowWrap}>
            <div id="canvas" className={styles.leftCanvas} />
            <div id="properties" className={styles.rightProperty} />
          </div>
        </Card>

        <MultiSourceSelect
          key={getGuid()}
          visible={roleChoseModalShow}
          value=""
          dataSource={sourceConfig}
          onCancel={this.hideModal}
          singleSource
          operate="checked"
          checkBox={false}
          onOk={this.onOk}
          multipleSelect={false}
        />
      </div>
    );
  }
}
export default Flow;
