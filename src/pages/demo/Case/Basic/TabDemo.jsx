import { Button, Card, Modal } from 'antd';
import React, { PureComponent } from 'react';

class TabDemo extends PureComponent {
  state = {};

  // constructor(props) {
  //   super(props);
  // }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'geographic/fetchProvince',
    }).then(data => console.log('province data ->', data));
  }

  componentDidMount() {}

  render() {
    const { onChangeBtnClick } = this.props;

    return (
      <Card className="tw-card-adjust" title="联系信息" bordered={false}>
        <Button type="primary" onClick={onChangeBtnClick}>
          修改父组件的CarMap
        </Button>
      </Card>
    );
  }
}

export default TabDemo;
