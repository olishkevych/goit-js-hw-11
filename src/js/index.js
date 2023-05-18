import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.getElementById('search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const API_KEY = '36396693-28c70313af4bfc02da8bd4331';
const URL = 'https://pixabay.com/api/';
let currentPage = 0;
let searchQuery = '';
const per_page = 80;
let markup = '';
let totalHits = 0;

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
    Notiflix.Notify.failure('Search query is empty');
    return;
  }
  formEl.reset();
}

async function fetchImages(searchQuery) {
  currentPage += 1;
  const options = {
    q: searchQuery,
    page: currentPage,
    per_page: per_page,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  };

  const parameters = new URLSearchParams(options);

  const images = await axios.get(`${URL}?key=${API_KEY}&${parameters}`);
  totalHits = images.data.totalHits;

  if (currentPage === 1 && totalHits != 0) {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images!`);
  }
  return images.data.hits;
}

function onLoadMoreClick() {
  fetchImages(searchQuery)
    .then(images => {
      createImagesMarkup(images);
      renderImages(markup);
    })
    .catch(error => {
      if (error.response.data === '[ERROR 400] "page" is out of valid range.') {
        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
        loadMoreBtn.classList.add('hidden');
      } else Notiflix.Notify.warning(error.response.data);
    });
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
        return `<a href = ${largeImageURL}> <div class="photo-card">
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
    </a>
  `;
      }
    )
    .join('');
  return markup;
}

function renderImages(markup) {
  galleryEl.insertAdjacentHTML('beforeend', markup);
}

function handleFetchRequest() {
  currentPage = 0;
  fetchImages(searchQuery)
    .then(images => {
      if (images.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else if (images.length < per_page && currentPage === 1) {
        loadMoreBtn.classList.add('hidden');
        createImagesMarkup(images);
        renderImages(markup);
      } else {
        createImagesMarkup(images);
        renderImages(markup);
        loadMoreBtn.classList.remove('hidden');
        loadMoreBtn.addEventListener('click', onLoadMoreClick);
      }
    })
    .catch(error => console.log(error));
}

let gallery = new SimpleLightbox('a');

gallery.on('show.simplelightbox', function () {
  // do something…
});
