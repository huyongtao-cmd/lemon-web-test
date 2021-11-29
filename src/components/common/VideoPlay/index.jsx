import React, { Component } from 'react';
// eslint-disable-next-line import/no-unresolved
import { Player, BigPlayButton } from 'video-react';
// eslint-disable-next-line import/no-unresolved
import 'video-react/dist/video-react.css';

export default class VideoPlayer extends Component {
  componentDidMount() {}

  render() {
    /*
    eg: <VideoPlay
          width="100%"
          height={470}
          url={videoUrl}
          poster={
            detailFormData && detailFormData.logoFile
              ? `data:image/jpeg;base64,${detailFormData.logoFile}`
              : ''
          }
        />
    */

    const {
      poster,
      url,
      // url = 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
      height = 470,
    } = this.props;
    return (
      <Player fluid={false} height={height} poster={poster} width="100%">
        <source src={url} type="video/mp4" />
        <BigPlayButton position="center" />
      </Player>
    );
  }
}
