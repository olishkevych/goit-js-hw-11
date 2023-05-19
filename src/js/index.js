import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';

const formEl = document.getElementById('search-form');
const galleryEl = document.querySelector('.gallery');
const spinnerEl = document.getElementById('loading');

const API_KEY = '36396693-28c70313af4bfc02da8bd4331';
const URL = 'https://pixabay.com/api/';
let currentPage = 0;
let searchQuery = '';
const per_page = 40;
let markup = '';
let totalHits = 0;
let gallery;

formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  galleryEl.innerHTML = '';

  searchQuery = formEl.elements[0].value.trim();
  if (searchQuery) {
    spinnerEl.classList.add('visible');
    handleFetchRequest();
    addInfiniteScroll();
  } else {
    currentPage = 0;
    Notiflix.Notify.failure('Search query is empty');
    return;
  }
  formEl.reset();
}

function handleFetchRequest() {
  currentPage = 0;
  fetchImages(searchQuery)
    .then(images => {
      if (images.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        createImagesMarkup(images);
        renderImages(markup);

        gallery = new SimpleLightbox('a', { showCounter: false }).refresh();
      }
    })
    .catch(error => console.log(error));
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
      gallery.refresh();
      smoothScrolling();
    })
    .catch(error => {
      if (error.response.data === '[ERROR 400] "page" is out of valid range.') {
        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
        removeInfiniteScroll(); // Call the function to remove the event listener
      } else {
        Notiflix.Notify.warning(error.response.data);
      }
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
        return ` <div class="photo-card"> <a href = ${largeImageURL}>
       <img src="${webformatURL}" alt="${tags}" loading="lazy" /> </a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b><br> ${likes}
        </p>
        <p class="info-item">
          <b>Views</b><br> ${views}
        </p>
        <p class="info-item">
          <b>Comments</b><br> ${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b> <br>${downloads}
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
  spinnerEl.classList.remove('visible');
}

function smoothScrolling() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({ top: cardHeight * 3, behavior: 'smooth' });
}

// INFINITE SCROLL
let throttledHandleInfiniteScroll;
function addInfiniteScroll() {
  throttledHandleInfiniteScroll = throttle(handleInfiniteScroll, 500);
  window.addEventListener('scroll', throttledHandleInfiniteScroll);
}

function removeInfiniteScroll() {
  window.removeEventListener('scroll', throttledHandleInfiniteScroll);
}

function handleInfiniteScroll() {
  const endOfPage =
    window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

  if (endOfPage) {
    onLoadMoreClick();
  }
}

//GO TO TOP BUTTON
let mybutton = document.getElementById('myBtn');
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = 'block';
    mybutton.addEventListener('click', topFunction);
  } else {
    mybutton.style.display = 'none';
    mybutton.removeEventListener('click', topFunction);
  }
}

function topFunction() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
