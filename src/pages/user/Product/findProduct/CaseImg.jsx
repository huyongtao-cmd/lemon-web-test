import React from 'react';
import { request } from '@/utils/networkUtils';

class CaseImg extends React.Component {
  state = {
    imageUrl: null,
  };

  componentDidMount() {
    const { dataKey } = this.props;
    if (dataKey && dataKey > 0) {
      request.get(`/api/base/v1/buProd/download/${dataKey}`).then(({ response }) => {
        if (response.datum) {
          this.setState({
            imageUrl: response.datum,
          });
        }
      });
    }
  }

  render() {
    const { dataKey } = this.props;
    const { imageUrl } = this.state;

    return (
      <>
        {dataKey && !!imageUrl ? (
          <img src={`data:image/jpeg;base64,${imageUrl}`} alt="案例图片" />
        ) : (
          <img src="http://localhost:3001/favicon.png" alt="案例图片" />
        )}
      </>
    );
  }
}

export default CaseImg;
