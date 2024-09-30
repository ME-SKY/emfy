// const token = 'YOUR_ACCESS_TOKEN'; 
const apiUrl = 'https://yourdomain.amocrm.ru/api/v4/leads';
// const apiUrl = 'https://meskalitofly.amocrm.ru';
const delay = 1000; 
const maxCardsPerRequest = 3;

const integrationId = '177dfd78-f788-4561-8b2e-7bf306eb0c21';
const secretKey = '6gHSB9LoLEgSAXR2S2khEpv2aCmxjpHFx1RTJSXeCw98QNf8mD4pxDZkjpMhcr7x'
const longTermToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImZkZWFkODFkYzFmY2I4ZjEyYWEzMTI2ZTZkYjJmMThmOWFlYjE1ODBmNDBkMTkwZDZjMjc2NjU0YWYyMjQxNDhhYzdiMTQ0ODhkMjQwOTdiIn0.eyJhdWQiOiIxNzdkZmQ3OC1mNzg4LTQ1NjEtOGIyZS03YmYzMDZlYjBjMjEiLCJqdGkiOiJmZGVhZDgxZGMxZmNiOGYxMmFhMzEyNmU2ZGIyZjE4ZjlhZWIxNTgwZjQwZDE5MGQ2YzI3NjY1NGFmMjI0MTQ4YWM3YjE0NDg4ZDI0MDk3YiIsImlhdCI6MTcyNzUyMDI4NCwibmJmIjoxNzI3NTIwMjg0LCJleHAiOjE3NDM2Mzg0MDAsInN1YiI6IjExNTc5NzA2IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxOTc3ODYyLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiZTdjZjFkZTgtZTE0ZS00YmJjLWI1N2ItOTU4OTk5MTU3ZWRlIiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.M2YpZAmCeinEZ7NUMFw_h5qjV7tqtNUTWdFWNFNmoslNSyj09H5ChEzB0S-HGxRv52aSmZar34d0GQxomvBQNA547pmHqqXqu9Rm1p7o5Y8FOdZ5vs3YQUJp4tWrNFTpm7ZvuKvHZg4PtVNMAmX7kvk7ef2aIxzrtxiF_jeLgvmNBrvp9ylg3vZYfTuFzJaC42vNXdGsKAvqw_eQoXxDK4Zg3YCoHhyRMyryIE7CVOjHk5d2C_bVvJtLrmTKhfPgHNTZYQ0UqvF5axZzEinU9TgQdu32cIl2lur4cE5fC4vTJug1irpmN1r4myU0VqDqKE2eByChoaKUyG6rXnVviQ';


// https://meskalitofly.amocrm.ru/

async function getAccessToken(clientId, clientSecret, authorizationCode, redirectUri = '') {
  const url = 'https://meskalitofly.amocrm.ru/oauth2/access_token'; 

  const body = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: redirectUri
  };

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
      });

      if (response.ok) {
          const data = await response.json();
          console.log('Access token:', data.access_token);
          console.log('Refresh token:', data.refresh_token);
          return data;
      } else {
          const errorData = await response.json();
          console.error('Error getting access token:', errorData);
      }
  } catch (error) {
      console.error('Fetch error:', error);
  }
}

const fetchDeals = async () => {
    let page = 1;
    let hasMoreDeals = true;

    while (hasMoreDeals) {
        const response = await fetch(`${apiUrl}?limit=${maxCardsPerRequest}&page=${page}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            renderDeals(data._embedded.leads);

            if (data._embedded.leads.length < maxCardsPerRequest) {
                hasMoreDeals = false; // Прекращаем, если получили меньше чем макс. число сделок
            }
            page++;
            await new Promise(r => setTimeout(r, delay));
        } else {
            console.error('Ошибка загрузки сделок:', response.status);
            hasMoreDeals = false;
        }
    }
};

const renderDeals = (deals) => {
    const tableBody = document.getElementById('deals-body');
    deals.forEach(deal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${deal.id}</td>
            <td>${deal.name}</td>
            <td>${deal.price}</td>
            <td><button class="task-btn" data-id="${deal.id}">Открыть</button></td>
        `;
        tableBody.appendChild(row);
    });
};

const handleTaskButtonClick = async (event) => {
    const button = event.target;
    const dealId = button.dataset.id;

    button.innerHTML = '<div class="spinner"></div>';

    const response = await fetch(`${apiUrl}/${dealId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const deal = await response.json();
        const taskDate = deal.tasks ? deal.tasks[0].date : null; 
        const statusCircle = getStatusCircle(taskDate);

        button.innerHTML = `
            Название: ${deal.name}<br>
            ID: ${deal.id}<br>
            Дата задачи: ${formatDate(taskDate)}<br>
            <span class="status-circle ${statusCircle}"></span>
        `;
    } else {
        button.innerHTML = 'Ошибка загрузки';
    }
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

const getStatusCircle = (dateString) => {
    const taskDate = new Date(dateString);
    const today = new Date();
    const dayDifference = Math.ceil((taskDate - today) / (1000 * 3600 * 24));

    if (dayDifference < 0) return 'red';  // Просрочено
    if (dayDifference === 0) return 'green';  // Сегодня
    return 'yellow';  // В будущем
};

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('task-btn')) {
        handleTaskButtonClick(event);
    }
});

document.addEventListener('DOMContentLoaded', async function() {
  const data = await getAccessToken(integrationId, secretKey, authorizationCode);
  console.log('data', data);
  // fetchDeals
});
