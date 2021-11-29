import React from 'react';
import { yuan } from '@/components/common/Charts';
/**
 * 减少使用 dangerouslySetInnerHTML
 * TIPS: 这个套路看上去和以前的不太一样，大力mark一下。
 */
export default class Yuan extends React.PureComponent {
  componentDidMount() {
    this.rendertoHtml();
  }

  componentDidUpdate() {
    this.rendertoHtml();
  }

  rendertoHtml = () => {
    const { children } = this.props;
    if (this.main) {
      this.main.innerHTML = yuan(children);
    }
  };

  render() {
    return (
      <span
        ref={ref => {
          this.main = ref;
        }}
      />
    );
  }
}
