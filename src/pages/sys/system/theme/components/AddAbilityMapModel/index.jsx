/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unused-state */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import FieldList from '@/components/layout/FieldList';
import { Button, Card, Form, Input, Modal, Row, Col } from 'antd';
import classnames from 'classnames';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import styles from './styles.less';

const { Field, FieldLine } = FieldList;
@Form.create()
class AddAbilityMapModel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  // 新增
  handleCreate = () => {
    const {
      DOMAIN,
      dispatch,
      id,
      form: { validateFieldsAndScroll },
      ...rest
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({ type: `${DOMAIN}/abilityCreate`, payload: { ...values, themeId: id } });
      }
    });
  };

  // 删除
  handleDelete = () => {
    const { dispatch, systemProductDetail, DOMAIN } = this.props;
    const { selectedAbilityItem } = systemProductDetail;
    dispatch({ type: `${DOMAIN}/deleteAbility`, payload: { id: selectedAbilityItem } });
  };

  // 取消
  handleCancel = () => {
    const { dispatch, DOMAIN } = this.props;
    dispatch({ type: `${DOMAIN}/selectedAbilityItem`, payload: '' });
  };

  render() {
    const {
      title,
      onCancel,
      onOk,
      dispatch,
      dataSource,
      DOMAIN,
      systemProductDetail,
      form: { getFieldDecorator, setFieldsValue, getFieldValue, validateFieldsAndScroll },
      ...rest
    } = this.props;
    const { abilityMapList, selectedAbilityItem } = systemProductDetail;
    const modalOpts = {
      ...rest,
      title,
      maskClosable: false,
      centered: false,
      onCancel,
      onOk,
    };
    return (
      <PageHeaderWrapper title={title}>
        <Modal {...modalOpts}>
          <Card bordered={false}>
            <Row>
              <Col span={6}>
                <Button className="tw-btn-primary" size="large" onClick={this.handleCreate}>
                  新增
                </Button>
                {selectedAbilityItem && (
                  <>
                    <Button
                      className="tw-btn-error"
                      style={{ marginLeft: '5px' }}
                      size="large"
                      onClick={this.handleDelete}
                    >
                      删除
                    </Button>
                    <Button
                      className="tw-btn-primary"
                      style={{ marginLeft: '5px' }}
                      size="large"
                      onClick={this.handleCancel}
                    >
                      取消
                    </Button>
                  </>
                )}
              </Col>
              <Col span={18}>
                <FieldList getFieldDecorator={getFieldDecorator} col={1}>
                  <FieldLine label="能力" required>
                    <Field
                      name="abilityName"
                      decorator={{
                        rules: [{ required: true, message: '请输入能力名称' }],
                      }}
                      wrapperCol={{ span: 24, xxl: 24 }}
                    >
                      <Input placeholder="请输入能力名称" />
                    </Field>
                    <Field
                      name="abilityUrl"
                      decorator={{
                        rules: [{ required: true, message: '请输入能力链接' }],
                      }}
                      wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
                    >
                      <Input placeholder="请输入能力链接" />
                    </Field>
                  </FieldLine>
                </FieldList>
              </Col>
            </Row>
          </Card>
          <Card>
            <div className={styles.container}>
              {abilityMapList.map(item => (
                <div
                  className={`${styles.btnWrap} ${
                    item.id === selectedAbilityItem ? styles.deletesBorder : ''
                  }`}
                  key={item.id}
                  onClick={() => {
                    dispatch({ type: `${DOMAIN}/selectedAbilityItem`, payload: item.id });
                  }}
                >
                  {item.abilityName}
                </div>
              ))}
            </div>
          </Card>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default AddAbilityMapModel;
