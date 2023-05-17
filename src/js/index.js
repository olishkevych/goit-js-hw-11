import axios from 'axios';
const formEl = document.getElementById('search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const API_KEY = '36396693-28c70313af4bfc02da8bd4331';
const URL = 'https://pixabay.com/api/';
let currentPage = 0;
let searchQuery = '';
const per_page = 5;
let markup = '';

formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  galleryEl.innerHTML = '';
  loadMoreBtn.classList.add('hidden');

  searchQuery = formEl.elements[0].value.trim();
  if (searchQuery) {
    handleFetchRequest();
  } else {
    currentPage = 0;
    alert('empty field');
    return;
  }
  formEl.reset();
}

async function fetchImages(searchQuery) {
  currentPage += 1;
  const options = {
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: currentPage,
    per_page: per_page,
  };

  const parameters = new URLSearchParams(options);
  const images = await axios.get(`${URL}?key=${API_KEY}&${parameters}`);
  console.log(images);
  return images.data.hits;
}

function createImagesMarkup(images) {
  markup = images
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

function onLoadMoreClick() {
  fetchImages(searchQuery);
  renderImages(markup);
}

function handleFetchRequest() {
  currentPage = 0;
  fetchImages(searchQuery)
    .then(images => {
      if (images.totalHits === 0) {
        alert(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        createImagesMarkup(images);
        renderImages(markup);
        loadMoreBtn.classList.remove('hidden');
        loadMoreBtn.addEventListener('click', onLoadMoreClick);
      }
    })
    .catch(error => console.log(error));
}
