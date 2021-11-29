import React from 'react';
import Block from './Block';
import Button from './Button';
import AuthorizedContext from './util';

class Authorized {}

Authorized.Ctx = AuthorizedContext;
Authorized.Button = Button;
Authorized.Block = Block;

export default Authorized;
