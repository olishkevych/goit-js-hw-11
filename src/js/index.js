import debounce from 'lodash.debounce';
import { fetchCountries } from './fetchCountries';
import Notiflix from 'notiflix';

const inputEl = document.getElementById('search-box');
const countryInfoEl = document.querySelector('.country-info');
const countryListEl = document.querySelector('.country-list');

const DEBOUNCE_DELAY = 300;

inputEl.addEventListener('input', debounce(onInputChange, DEBOUNCE_DELAY, []));

function onInputChange(event) {
  countryListEl.innerHTML = '';
  countryInfoEl.innerHTML = '';

  let countryName = event.target.value.trim();
  if (countryName === '') return;
  else
    fetchCountries(countryName)
      .then(countries => {
        if (countries.length > 10) {
          Notiflix.Notify.info(
            'Too many matches found. Please enter a more specific name'
          );
          return;
        } else if (countries.length === 1) {
          return renderOneCountry(countries);
        } else {
          return renderCountriesList(countries);
        }
      })
      .catch(error => {
        if (error.status === '404') {
          Notiflix.Notify.warning('Oops, there is no country with that name');
        }
      });
}

function renderOneCountry(countries) {
  let markup = createCountryCarddMarkup(countries[0]);
  countryInfoEl.innerHTML = markup;
}
function renderCountriesList(countries) {
  let markup = countries.reduce(
    (markup, country) => markup + createListMarkup(country),
    ''
  );
  countryListEl.innerHTML = markup;
}

function createListMarkup({ flags, name }) {
  return `<li class="country-list-el"> <img src=${flags.svg} width = 20px> ${name.official}</li>`;
}

function createCountryCarddMarkup({
  name,
  languages,
  population,
  flags,
  capital,
}) {
  return `<div class="country-card"><img src=${flags.svg} width=40px>
  <h2 class="country-card-title">${name.official}</h2>
  <ul class="country-card-info">
  <li><b>Capital:</b> ${capital}</li>
  <li><b>Population:</b> ${population}</li>
  <li><b>Languages:</b> ${Object.values([...languages].join(' '))}</li>
  </ul></div>`;
}
