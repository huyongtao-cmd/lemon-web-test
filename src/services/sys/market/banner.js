import { request } from '@/utils/networkUtils';
import { toQs, toUrl } from '@/utils/stringUtils';
import api from '@/api';

const { banner } = api.sys;
const { getBannerList, addBanner, getBannerDetails, BannerDelete } = banner;

export async function getBannerListRq(params) {
  return request.get(toQs(getBannerList, params));
}

export async function addBannerRq(payload) {
  return request.post(addBanner, {
    body: payload,
  });
}

export async function getBannerDetailsRq(payload) {
  return request.get(toUrl(getBannerDetails, { id: payload }));
}

export async function BannerDeleteRq(payload) {
  return request.delete(toUrl(BannerDelete, { ids: payload.join(',') }));
}
