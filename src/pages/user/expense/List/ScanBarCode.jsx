import React from 'react';
import { connect } from 'dva';
import { Input, Modal, Form } from 'antd';
import { equals, type } from 'ramda';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { flowToRouter, getUrl } from '@/utils/flowToRouter';

import FieldList from '@/components/layout/FieldList';

const { Field } = FieldList;

const DOMAIN = 'userExpenseList';
@connect(({ dispatch }) => ({ dispatch }))
@Form.create({})
class ScanBarCodeModal extends React.PureComponent {
  constructor(props) {
    super(props);
    const { visible } = this.props;
    this.state = {
      visible,
    };
  }

  componentDidMount() {
    window.addEventListener('keypress', this.scanWrapper, false);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ visible: snapshot });
      }, 0);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keypress', this.scanWrapper, false);
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { visible } = this.props;
    if (!equals(prevState.visible, visible)) {
      return visible;
    }
    return null;
  }

  scanWrapper = e => {
    // code = 13 表示按下了enter键，也就是扫码枪扫码结束
    if (e.which === 13) {
      this.goDetail();
    }
  };

  goDetail = () => {
    const {
      dispatch,
      form: { setFields, setFieldsValue, getFieldValue },
    } = this.props;
    const reimNo = getFieldValue('reimNo');
    if (!reimNo) {
      setFields({
        reimNo: {
          value: undefined,
          errors: [new Error('请先输入或者扫描报销单号')],
        },
      });
      return;
    }
    dispatch({
      type: `${DOMAIN}/getExpenseDetail`,
      payload: {
        reimNo,
      },
    }).then(res => {
      if (res.ok) {
        const { datum } = res;
        const { id, prcId, taskId, defKey } = datum;
        this.jumpLink(defKey, id, taskId, prcId);
        setFieldsValue({
          reimNo: undefined,
        });
      }
    });
  };

  jumpLink = (defKey, id, taskId, prcId) => {
    const route = flowToRouter(defKey, {
      id: prcId, // prcId
      taskId,
      docId: id, // id
      mode: 'edit',
    });
    // this.toggleVisible();
    router.push(route);
  };

  toggleVisible = () => {
    const { scanVisible } = this.props;
    type(scanVisible) === 'Function' && scanVisible();
  };

  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { visible } = this.state;

    return (
      <PageHeaderWrapper title="费用报销">
        <Modal
          destroyOnClose
          title="扫描报销单"
          visible={visible && getUrl().includes('/plat/expense/list')}
          onOk={() => {
            this.goDetail();
          }}
          onCancel={() => this.toggleVisible()}
          width="50%"
        >
          <FieldList getFieldDecorator={getFieldDecorator} layout="horizontal" col={1}>
            <Field name="reimNo" label="报销单号">
              <Input placeholder="扫描或输入报销单号" autoFocus="autoFocus" />
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default ScanBarCodeModal;
