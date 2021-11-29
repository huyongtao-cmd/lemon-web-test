import React from 'react';
import { Avatar, Button, Card, Checkbox, Col, Form, Input, Row, Upload, Icon, Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { DOMAIN, SysProdContext } from './sysProductDetail';
import styles from './index.less';
import UploadPic from './UploadPic';

const ProdDetT2 = Form.create({
  onFieldsChange(props, changedFields) {
    const name = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];
    // 在name属性上做手脚区分修改的字段。
    const key = name.split('_')[0];
    const index = name.split('_')[1];

    // 理论上是要更新一下表单数据，暂时先空着。
    const { caseList } = props;
    caseList[index][key] = value;

    props.dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { caseList },
    });
  },
})(
  ({
    form: { getFieldDecorator },
    id,
    caseList,
    formData,
    treeData,
    canEdit,
    handleUploadPic,
    handleAddCards,
    handleDelCards,
    handleCardCheck,
  }) => (
    <>
      {canEdit ? (
        <div className="tw-btn-list m-b-4">
          <Button className="tw-btn-primary" icon="plus-circle" onClick={handleAddCards}>
            <FormattedMessage id="misc.insert" desc="新增" />
          </Button>
          <Button type="danger" icon="delete" onClick={handleDelCards}>
            <FormattedMessage id="misc.delete" desc="删除" />
          </Button>
        </div>
      ) : null}
      <div>
        {caseList.map(
          (item, k) =>
            canEdit ? (
              <Card.Grid
                className={styles.productGrid}
                key={item.id || '_grid_' + k}
                data={item.id}
              >
                {canEdit ? (
                  <div data-id={item.id} className={styles['card-item-left']}>
                    <Checkbox className="m-r-1" onChange={e => handleCardCheck(e, item)} />
                  </div>
                ) : null}
                <div data-id={item.id} className={styles['card-item-right']}>
                  <Card.Meta
                    className={styles.meta}
                    avatar={
                      <UploadPic
                        dataKey={item.id}
                        disabled={item.id <= 0}
                        handleUploadPic={handleUploadPic}
                      />
                    }
                    title={
                      <Row className={styles.gridLine}>
                        <Col xs={12}>
                          <Form.Item
                            style={{ margin: 0 }}
                            label="案例名称"
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                          >
                            {getFieldDecorator('caseName_' + k, {
                              initialValue: item.caseName,
                              rules: [{ required: true }],
                            })(<Input placeholder="请输入案例名称" />)}
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item
                            style={{ margin: 0 }}
                            label="联系信息"
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                          >
                            {getFieldDecorator('contactDesc_' + k, {
                              initialValue: item.contactDesc,
                              rules: [{ required: false }],
                            })(<Input placeholder="请输入联系信息名" />)}
                          </Form.Item>
                        </Col>
                      </Row>
                    }
                    description={
                      <Form.Item
                        style={{ margin: 0 }}
                        label="案例描述"
                        labelCol={{ span: 3 }}
                        wrapperCol={{ span: 21 }}
                      >
                        {getFieldDecorator('caseDesc_' + k, {
                          initialValue: item.caseDesc,
                          rules: [{ required: false }],
                        })(
                          <Input.TextArea
                            placeholder="案例描述"
                            autosize={{ minRows: 3, maxRows: 6 }}
                          />
                        )}
                      </Form.Item>
                    }
                  />
                </div>
              </Card.Grid>
            ) : (
              <Card.Grid className={styles.productGrid} key={item.id}>
                <Card.Meta
                  className={styles.meta}
                  avatar={
                    <UploadPic
                      dataKey={item.id}
                      disabled={canEdit ? item.id <= 0 : true}
                      handleUploadPic={handleUploadPic}
                    />
                  }
                  title={
                    <Row
                      className={styles.gridLine}
                      style={{ minWidth: 1000, color: 'black', fontSize: 16, fontWeight: 400 }}
                    >
                      <Col span={12}>
                        <span style={{ color: '#999' }}>案例名称：</span>
                        {item.caseName}
                      </Col>
                      <Col span={12}>
                        <span style={{ color: '#999' }}>联系信息：</span>
                        {item.contactDesc}
                      </Col>
                    </Row>
                  }
                  description={
                    <Row
                      className={styles.gridLine}
                      style={{ minWidth: 1000, color: 'black', fontSize: 16, fontWeight: 400 }}
                    >
                      <Col span={23}>
                        <span style={{ color: '#999' }}>案例描述：</span>
                        {item.caseDesc}
                      </Col>
                    </Row>
                  }
                />
              </Card.Grid>
            )
        )}
      </div>
    </>
  )
);

export default () => (
  <SysProdContext.Consumer>{allProps => <ProdDetT2 {...allProps} />}</SysProdContext.Consumer>
);
