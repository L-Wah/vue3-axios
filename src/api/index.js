import http from './request';

//周排行榜
export function rankInfo() {
  return http('/lucky_king/index');
}

//日排行榜
export function dayRankInfo() {
  return http('/lucky_king/dayList');
}

//光荣榜
export function pagingHonor(params) {
  return http('/lucky_king/pagingHonor', {
    method: 'post',
    params,
  });
}
