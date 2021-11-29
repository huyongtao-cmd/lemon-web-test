import React, { PureComponent } from 'react';
import { isNil, isEmpty } from 'ramda';
import flvJs from 'flv.js';

/**
 * @author Evan.Xiong
 */
class VideoFlv extends PureComponent {
  constructor(props) {
    super(props);
    this.videoNode = null;
    this.flvPlayer;
  }

  componentDidMount() {
    const { url, type } = this.props;
    this.loadVideo(url, type);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      const { type } = this.props;
      this.loadVideo(snapshot, type);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { url } = this.props;
    if (prevProps.url !== url && !isNil(url) && !isEmpty(url)) {
      return url;
    }
    return null;
  }

  loadVideo = (url, type) => {
    if (isNil(url)) return;
    if (flvJs.isSupported()) {
      if (!isNil(this.flvPlayer)) {
        this.flvPlayer.unload();
        this.flvPlayer.detachMediaElement();
        this.flvPlayer.destroy();
        this.flvPlayer = undefined;
      }
      this.flvPlayer = flvJs.createPlayer({ type, url });
      this.flvPlayer.attachMediaElement(this.videoNode);
      this.flvPlayer.load();
      // this.flvPlayer.play();
    }
  };

  render() {
    const { width, height, poster } = this.props;

    const setting = {
      width,
      height,
      poster,
    };

    return (
      <video
        ref={ref => {
          this.videoNode = ref;
        }}
        controls
        {...setting}
      >
        您的浏览器太旧了,不支持HTML5视频。
        <track kind="captions" />
      </video>
    );
  }
}

export default VideoFlv;
