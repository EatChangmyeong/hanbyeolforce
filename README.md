# 한별포스 기댓값 계산기

[solved.ac](https://solved.ac/)의 만우절 이벤트였던 한별포스의 기댓값 계산기입니다. 실행하면 특정 단계까지 올리는 데 드는 강화 횟수와 별조각 개수의 기댓값을 표로 출력합니다.

자세한 설명은 개발 블로그의 [한별포스 25성을 찍으려면 별조각을 얼마나 써야 할까?](https://eatchangmyeong.github.io/2022/04/05/how-many-stardusts-for-25-stars.html)를 참조해 주세요.

# 결과 보는 법

실행 결과는 [`results.txt`](https://github.com/EatChangmyeong/hanbyeolforce/blob/main/results.txt)에 미리 저장해 두었습니다.

* `destroy protection off:`부터는 일반 강화만 할 때의 값, `destroy protection on:`부터는 가능하다면 항상 파괴 방지 강화를 할 때의 값입니다.
* 표 부분은 왼쪽부터 현재의 강화 단계, 강화 횟수의 기댓값, 별조각 개수의 기댓값(한별캐치 미적용), 강화 횟수의 기댓값, 별조각 개수의 기댓값(한별캐치 적용)입니다. 강화 단계 `3`은 3성에서 4성으로 강화한다는 의미, `3 -> 5`는 3성에서 5성으로 강화한다는 의미입니다.

내부적으로는 모두 정확한 값을 가지는 분수로 계산하지만, 분수의 분자와 분모가 너무 크기 때문에 소수점 아래 3자리에서 반올림해서 출력합니다. 정확한 값이 궁금하다면 마지막 두 줄의 2번째 인자를 `false`에서 `true`로 바꿔서 실행해 주세요.

# 실행

```
npm i
node hanbyeolforce.js
```