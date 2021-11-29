import React, { Component } from 'react';
import { Modal, Button, Divider, Input } from 'antd';
import { request } from '@/utils/networkUtils';
import { toQs } from '@/utils/stringUtils';
import api from '@/api';
import EvalTemplate from './EvalTemplate';

const { evald, settleEval } = api.eval;

const EVAL_ENUM = {
  attitude: 1, // 态度
  timeliness: 2, // 及时性
  professional: 3, // 专业度
  satisfied: 4, // 客户满意度
  teamwork: 5, // 团队协作
  recommend: 6, // 资源推荐度
  continued: 7, // 是否愿意继续合作
  assignedDefiniton: 8, // 发包任务明确度
  timelinessSettlement: 9, // 结算及时性
};

class EvalModal extends Component {
  state = {
    list: [],
  };

  componentDidMount() {
    const { sourceId, options } = this.props;
    if (sourceId) {
      this.fetchTemplate(options);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      this.fetchTemplate(snapshot);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // 异步的，最开始没有拉到单据业务，不知道是否要显示评价
    const { sourceId, options } = this.props;
    if (prevProps.sourceId !== sourceId && !!sourceId) {
      return options;
    }
    return null;
  }

  fetchTemplate = options => {
    const { evalClass, evalType } = options;
    request.get(toQs(settleEval, { evalClass, evalType })).then(({ status, response }) => {
      if (status === 200 && response.ok) {
        const { evalItemEntities: list, id, evalDesc } = response.datum || {};
        // fieldList 应该根据这个 list 动态配置，这里的 EvalTemplate 先写死了，之后会有公共弹窗搞评价
        const desc = evalDesc.split(',');
        this.setState({
          list: Array.isArray(list) ? list : [],
          evalMasId: id,
          evalClass: desc[0],
          evalType: desc[1],
        });
      }
    });
  };

  handleOk = () => {
    this.formRef.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      const { sourceId } = this.props;
      const { evalMasId } = this.state;
      const payload = Object.keys(EVAL_ENUM)
        .map(key => {
          const evalItemId = EVAL_ENUM[key];
          const evalScore = values[key];
          const evalComment = values[`${key}_comment`];
          return evalScore ? { evalItemId, evalScore, evalComment } : undefined;
        })
        .filter(Boolean)
        // eslint-disable-next-line
        .reduce((prev, curr) => {
          return [...prev, curr];
        }, []);
      request.post(evald, {
        body: {
          sourceId,
          evalMasId,
          evalDEntities: payload,
        },
      });
    });
  };

  handleCancel = () => {
    const { onCancel, showButton } = this.props;
    if (showButton) {
      this.setState({ visible: false });
    } else {
      onCancel && onCancel();
    }
  };

  handleClick = () => {
    this.setState({ visible: true });
  };

  render() {
    const {
      showButton = false,
      showModal = false,
      banner = '评价条目',
      evalerResName,
      evaledResName,
    } = this.props;
    const { list, visible, evalClass, evalType } = this.state;

    return (
      <>
        {showButton && (
          <Button
            className="tw-btn-primary stand"
            icon="highlight"
            size="large"
            onClick={this.handleClick}
          >
            评价
          </Button>
        )}
        <Modal
          title="评价信息"
          width={900}
          visible={showButton ? visible : showModal}
          okText="确认"
          onOk={this.handleOk}
          cancelText="取消"
          onCancel={this.handleCancel}
          okButtonProps={{ size: 'large', className: 'tw-btn-primary' }}
          cancelButtonProps={{ size: 'large', className: 'tw-btn-default' }}
        >
          <EvalTemplate
            list={list}
            banner={banner}
            forms={{
              evalClass,
              evalType,
              evalerResName,
              evaledResName,
            }}
            noReactive
            preview
            wrappedComponentRef={form => {
              this.formRef = form;
            }}
          />
        </Modal>
      </>
    );
  }
}

export default EvalModal;
