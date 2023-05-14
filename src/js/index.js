const formEl = document.getElementById('search-form');
const galleryEl = document.querySelector('.gallery');

const API_KEY = '36396693-28c70313af4bfc02da8bd4331';
const URL = 'https://pixabay.com/api/';

formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  galleryEl.innerHTML = '';
  let searchQuery = formEl.elements[0].value.trim();
  if (searchQuery) {
    fetchImages(searchQuery)
      .then(images => {
        if (images.total === 0) {
          alert(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        } else {
          renderImages(createImagesMarkup(images));
        }
      })
      .catch(error => console.log(error));
  } else {
    alert('empty field');
    return;
  }

  formEl.reset();
}

async function fetchImages(searchQuery) {
  const options = {
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  };

  const parameters = new URLSearchParams(options);

  const response = await fetch(`${URL}?key=${API_KEY}&${parameters}`);
  const images = await response.json();
  console.log(parameters.q);
  return images;
}

function createImagesMarkup(images) {
  const markup = images.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
      <div class="info">
        <p class="info-item">
          <b>Likes</b> ${likes}
        </p>
        <p class="info-item">
          <b>Views</b> ${views}
        </p>
        <p class="info-item">
          <b>Comments</b> ${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b> ${downloads}
        </p>
      </div>
    </div>
  `;
      }
    )
    .join('');
  return markup;
}

function renderImages(markup) {
  galleryEl.insertAdjacentHTML('beforeend', markup);
}
