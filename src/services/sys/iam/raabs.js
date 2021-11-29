import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { iam } = api.sys;
const { raabs } = iam;

export async function getDomains(params) {
  return request.get(toQs(raabs.domains, params));
}

export async function getRaabsByDomain(id) {
  return request.get(toUrl(raabs.domainRaabs, { id }));
}

export async function getRaabs(params) {
  return request.get(toQs(raabs.raabs, params));
}

export async function getPermsByRaab(id) {
  return request.get(toUrl(raabs.raabPerms, { id }));
}
