import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';
import { fetchImages } from './fetch';
import { createImagesMarkup } from './createmarkup';

const formEl = document.getElementById('search-form');
const galleryEl = document.querySelector('.gallery');
const spinnerEl = document.getElementById('loading');

let currentPage = 0;
let searchQuery = '';
const per_page = 40;
let markup = '';
let totalHits = 0;
let gallery;

const options = {
  q: searchQuery,
  page: currentPage,
  per_page: per_page,
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
};

formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  galleryEl.innerHTML = '';

  searchQuery = formEl.elements[0].value.trim();
  if (searchQuery) {
    spinnerEl.classList.add('visible');
    handleFetchRequest(searchQuery);
    addInfiniteScroll();
  } else {
    currentPage = 0;
    Notiflix.Notify.failure('Search query is empty');
    return;
  }
  formEl.reset();
}

function handleFetchRequest(searchQuery) {
  currentPage += 1;
  options.page = currentPage;
  options.q = searchQuery;

  fetchImages(options)
    .then(images => {
      if (images.hits.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        totalHits = images.totalHits;
        markup = createImagesMarkup(images);
        renderImages(markup);

        gallery = new SimpleLightbox('a', { showCounter: false }).refresh();
      }
    })
    .catch(error => Notiflix.Notify.failure(error));
}

function onLoadMoreClick() {
  if (Math.ceil(totalHits / per_page) > currentPage) {
    currentPage += 1;
    options.page = currentPage;
    options.q = searchQuery;
    fetchImages(options)
      .then(images => {
        createImagesMarkup(images);
        markup = createImagesMarkup(images);
        renderImages(markup);
        gallery.refresh();
        smoothScrolling();
      })
      .catch(error => {
        Notiflix.Notify.warning(error.response.data);
      });
  } else {
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    removeInfiniteScroll();
  }
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
