import React from 'react';
import classNames from 'classnames';
import styles from './index.less';

const GlobalFooter = ({ links, copyright, notGlobal }) => {
  const clsString = notGlobal ? styles.notGlobal : styles.globalFooter;
  return (
    <div className={clsString}>
      {links && (
        <div className={styles.links}>
          {links.map(link => (
            <a
              key={link.key}
              title={link.key}
              target={link.blankTarget ? '_blank' : '_self'}
              href={link.href}
            >
              {link.title}
            </a>
          ))}
        </div>
      )}
      {copyright && <div className={styles.copyright}>{copyright}</div>}
    </div>
  );
};

export default GlobalFooter;
