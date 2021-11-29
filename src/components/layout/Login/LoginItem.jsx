import React, { Component } from 'react';
import { Form, Input, Button, Row, Col, Tooltip } from 'antd';
import { omit } from 'ramda';
import styles from './index.less';
import ItemMap from './login.map';
import LoginContext from './loginContext';

class WarpFormItem extends Component {
  static defaultProps = {
    buttonText: '获取验证码',
  };

  constructor(props) {
    super(props);
    this.state = {
      count: 0,
    };
  }

  componentDidMount() {
    const { updateActive, name } = this.props;
    if (updateActive) {
      updateActive(name);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onGetSmsCode = () => {
    const { onGetSmsCode } = this.props;
    const result = onGetSmsCode ? onGetSmsCode() : null;
    if (result === false) {
      return;
    }
    if (result instanceof Promise) {
      result.then(this.runGetCaptchaCountDown);
    } else {
      this.runGetCaptchaCountDown();
    }
  };

  getFormItemOptions = ({ onChange, defaultValue, customprops, rules }) => {
    const options = {
      rules: rules || customprops.rules,
    };
    if (onChange) {
      options.onChange = onChange;
    }
    if (defaultValue) {
      options.initialValue = defaultValue;
    }
    return options;
  };

  runGetCaptchaCountDown = () => {
    const { countDown } = this.props;
    let count = countDown || 59;
    this.setState({ count });
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({ count });
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  };

  render() {
    const { count } = this.state;

    const {
      form: { getFieldDecorator },
    } = this.props;

    // 这么写是为了防止restProps中 带入 onChange, defaultValue, rules props
    // 注: 额。。这里搞得好复杂，感觉像老杨的风格。 - Richard
    const {
      onChange,
      customprops,
      defaultValue,
      rules,
      name,
      buttonText,
      updateActive,
      type,
      ...restProps
    } = this.props;

    // get getFieldDecorator props
    const options = this.getFormItemOptions(this.props);

    const otherProps = restProps || {};
    if (type === 'SMSCode') {
      // 省略属性
      const inputProps = omit(['onGetSmsCode', 'countDown'], otherProps);
      return (
        <Form.Item>
          <Row gutter={8}>
            <Col span={16}>
              {getFieldDecorator(name, options)(<Input {...customprops} {...inputProps} />)}
            </Col>
            <Col span={8}>
              <Button
                disabled={count}
                className={styles.getCaptcha}
                size="large"
                onClick={this.onGetSmsCode}
              >
                {count ? `${count} s` : buttonText}
              </Button>
            </Col>
          </Row>
        </Form.Item>
      );
    }
    if (type === 'Captcha') {
      // 省略属性
      const inputProps = omit(['onGetCaptcha', 'countDown'], otherProps);
      return (
        <Form.Item>
          <Row gutter={8}>
            <Col span={16}>
              {getFieldDecorator(name, options)(<Input {...customprops} {...inputProps} />)}
            </Col>
            <Col span={8}>
              <Tooltip title="点击刷新验证码">
                <img
                  className={styles.getCaptcha}
                  src={`data:image/jpeg;base64,${otherProps.src}`}
                  alt={otherProps.alt}
                  onClick={otherProps.onGetCaptcha}
                />
              </Tooltip>
            </Col>
          </Row>
        </Form.Item>
      );
    }
    return (
      <Form.Item>
        {getFieldDecorator(name, options)(<Input {...customprops} {...otherProps} />)}
      </Form.Item>
    );
  }
}

const LoginItem = {};
Object.keys(ItemMap).forEach(key => {
  const item = ItemMap[key];
  LoginItem[key] = props => (
    <LoginContext.Consumer>
      {context => (
        <WarpFormItem
          customprops={item.props}
          {...props}
          rules={item.rules}
          type={key}
          updateActive={context.updateActive}
          form={context.form}
        />
      )}
    </LoginContext.Consumer>
  );
});

export default LoginItem;
