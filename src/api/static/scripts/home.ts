const mainBlock = <HTMLElement>document.getElementById('body');

const refreshTokens = () => {
  fetch('/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: localStorage.refreshToken }),
  })
    .then((res) => res.json())
    .then((res) => {
      const { accessToken, refreshToken } = res;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      getContent();
    })
    .catch((error) => {
      console.error('something went wrong');
    });
};

const getContent = () => {
  fetch('/', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${localStorage.accessToken}`,
    },
  })
    .then((res) => {
      if (res.status === 401) {
        window.location.replace('/auth/login');
        throw 401;
      } else if (res.status === 403) {
        refreshTokens();
        throw 403;
      }
      return res;
    })
    .then((res) => res.text())
    .then((res) => {
      mainBlock.innerHTML = res;
    })
    .catch((e) => {
      console.error({ e });
    });
};

getContent();
