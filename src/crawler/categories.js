/**
 * OliveYoung Category Configuration
 * 올리브영 카테고리별 크롤링 설정
 */

export const CATEGORIES = {
  '전체': {
    name: '전체',
    url: 'https://www.oliveyoung.co.kr/store/main/getBestList.do?t_page=%ED%99%88&t_click=GNB&t_gnb_type=%EB%9E%AD%ED%82%B9&t_swiping_type=N'
  },
  '스킨케어': {
    name: '스킨케어',
    url: 'https://www.oliveyoung.co.kr/store/main/getBestList.do?dispCatNo=900000100100001&fltDispCatNo=10000010001&t_page=%EB%9E%AD%ED%82%B9&t_click=%ED%8C%90%EB%A7%A4%EB%9E%AD%ED%82%B9_%EC%8A%A4%ED%82%A8%EC%BC%80%EC%96%B4'
  },
  '마스크팩': {
    name: '마스크팩',
    url: 'https://www.oliveyoung.co.kr/store/main/getBestList.do?dispCatNo=900000100100001&fltDispCatNo=10000010009&t_page=%EB%9E%AD%ED%82%B9&t_click=%ED%8C%90%EB%A7%A4%EB%9E%AD%ED%82%B9_%EB%A7%88%EC%8A%A4%ED%81%AC%ED%8C%A9'
  },
  '클렌징': {
    name: '클렌징',
    url: 'https://www.oliveyoung.co.kr/store/main/getBestList.do?dispCatNo=900000100100001&fltDispCatNo=10000010010&t_page=%EB%9E%AD%ED%82%B9&t_click=%ED%8C%90%EB%A7%A4%EB%9E%AD%ED%82%B9_%ED%81%B4%EB%A0%8C%EC%A7%95'
  },
  '선케어': {
    name: '선케어',
    url: 'https://www.oliveyoung.co.kr/store/main/getBestList.do?dispCatNo=900000100100001&fltDispCatNo=10000010011&t_page=%EB%9E%AD%ED%82%B9&t_click=%ED%8C%90%EB%A7%A4%EB%9E%AD%ED%82%B9_%EC%84%A0%EC%BC%80%EC%96%B4'
  },
  '헤어케어': {
    name: '헤어케어',
    url: 'https://www.oliveyoung.co.kr/store/main/getBestList.do?dispCatNo=900000100100001&fltDispCatNo=10000010004&t_page=%EB%9E%AD%ED%82%B9&t_click=%ED%8C%90%EB%A7%A4%EB%9E%AD%ED%82%B9_%ED%97%A4%EC%96%B4%EC%BC%80%EC%96%B4'
  }
};

/**
 * Get category list
 */
export function getCategoryList() {
  return Object.keys(CATEGORIES);
}

/**
 * Get category URL
 */
export function getCategoryUrl(category) {
  return CATEGORIES[category]?.url || CATEGORIES['전체'].url;
}

/**
 * Get category name
 */
export function getCategoryName(category) {
  return CATEGORIES[category]?.name || '전체';
}
