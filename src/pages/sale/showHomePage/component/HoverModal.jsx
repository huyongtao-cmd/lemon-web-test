import React, { PureComponent } from 'react';
import { equals, type } from 'ramda';

class HoverModal extends PureComponent {
  constructor(props) {
    super(props);
    const { formData } = props;
    this.state = {
      formData,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ formData: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { formData } = this.props;
    if (!equals(prevState.formData, formData)) {
      return formData;
    }
    return null;
  }

  render() {
    const { formData } = this.state;

    return (
      <div>
        <div style={{ padding: '5px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '100px',
              textAlign: 'right',
              color: '#999',
            }}
          >
            内部/外部：
          </span>
          <span>{formData.innerTypeName || '-'}</span>
        </div>
        <div style={{ padding: '5px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '100px',
              textAlign: 'right',
              color: '#999',
            }}
          >
            公司类型：
          </span>
          <span>{formData.ouTypeName || '-'}</span>
        </div>
        <div style={{ padding: '5px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '100px',
              textAlign: 'right',
              color: '#999',
            }}
          >
            公司性质：
          </span>
          <span>{formData.ouPropName || '-'}</span>
        </div>
        <div style={{ padding: '5px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '100px',
              textAlign: 'right',
              color: '#999',
            }}
          >
            公司区域：
          </span>
          <span>{formData.regionCodeName || '-'}</span>
        </div>
        <div style={{ padding: '5px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '100px',
              textAlign: 'right',
              color: '#999',
            }}
          >
            母公司：
          </span>
          <span>{formData.pname || '-'}</span>
        </div>
        <div style={{ padding: '5px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '100px',
              textAlign: 'right',
              color: '#999',
            }}
          >
            主页：
          </span>
          <span>{formData.website || '-'}</span>
        </div>
        <div style={{ padding: '5px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '100px',
              textAlign: 'right',
              color: '#999',
            }}
          >
            所属行业：
          </span>
          <span>{formData.industryName || '-'}</span>
        </div>
        <div style={{ padding: '5px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '100px',
              textAlign: 'right',
              color: '#999',
            }}
          >
            规模：
          </span>
          <span>{formData.scaleTypeName || '-'}</span>
        </div>
      </div>
    );
  }
}

export default HoverModal;
