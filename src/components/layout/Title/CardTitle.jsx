import React from 'react';
import { Icon } from 'antd';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'umi/locale';

const Title = ({
  icon,
  iconColor = '#f5222d',
  dir = 'left',
  id = 'dev.demo.card.detail.title',
  defaultMessage = 'Title',
  text,
}) => (
  <>
    {icon && dir === 'left' ? (
      <Icon type={icon} style={{ marginRight: 4, color: iconColor }} />
    ) : null}
    {text ? <span>{text}</span> : <FormattedMessage id={id} defaultMessage={defaultMessage} />}
    {icon && dir === 'right' ? (
      <Icon type={icon} style={{ marginLeft: 4, color: iconColor }} />
    ) : null}
  </>
);

Title.propTypes = {
  id: PropTypes.string,
};

export default Title;
