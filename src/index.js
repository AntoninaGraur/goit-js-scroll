
import './css/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';

const API_KEY = '36223855-9729aa23392660264fa235b58';
const BASE_URL = 'https://pixabay.com/api/';
const PER_PAGE = 40;

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let searchQuery = '';
let page = 1;
let currentTotalHits = 0;

form.addEventListener('submit', handleFormSubmit);


async function handleFormSubmit(event) {
  event.preventDefault();

  searchQuery = event.currentTarget.elements.searchQuery.value;

  if (searchQuery.trim() === '') {
   Notiflix.Report.info('Hi!', 'Please enter a search query.','Ok');
    return;
  }

  try {
    page = 1;
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: PER_PAGE,
        page: page,
      },
    });

    const hits = response.data.hits;
    const totalHits = response.data.totalHits;

    if (hits.length === 0) {
     Notiflix.Report.warning('Sorry', 'There are no images matching your search query. Please =>', ' Try again');
      resetPage();
      return;
    }

    currentTotalHits = totalHits;

    gallery.innerHTML = '';
    createGalleryMarkup(hits);

    if (hits.length < PER_PAGE) {
      loadMoreBtn.classList.add('is-hidden');
      Notiflix.Report.warning('We are sorry', 'But you have reached the end of search results.', 'Fine');
    } else {
      loadMoreBtn.classList.remove('is-hidden');
    }

  } catch (error) {
    Notiflix.Notify.failure('Oops, something went wrong. Please try again later.');
  }
};


async function handleLoadMoreBtnClick() {
  page +=1;

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: PER_PAGE,
        page: page,
      },
    });

    const hits = response.data.hits;

    createGalleryMarkup(hits);

    if (gallery.children.length >= currentTotalHits) {
      loadMoreBtn.classList.add('is-hidden');
      Notiflix.Report.warning('We are sorry', 'But you have reached the end of search results.', 'Fine');
    }

  } catch (error) {
    Notiflix.Notify.failure('Oops, something went wrong. Please try again later.');
  }
}
loadMoreBtn.addEventListener('click', handleLoadMoreBtnClick);

function createGalleryMarkup(hits) {
  const markup = hits
    .map(({ webformatURL, likes, views, comments, downloads }) => {
      return `<div class="photo-card">
                <img class="photo-img " width="250" height="225" src="${webformatURL}" alt="" loading="lazy" />
                <div class="info">
                  <p class="info-item"><b>Likes:</b> ${likes}</p>
                  <p class="info-item"><b>Views:</b> ${views}</p>
                  <p class="info-item"><b>Comments:</b> ${comments}</p>
                  <p class="info-item"><b>Downloads:</b> ${downloads}</p>
                </div>
              </div>`;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

function resetPage() {
  page =1;
currentTotalHits = 0;
loadMoreBtn.classList.add('is-hidden');
gallery.innerHTML = '';
};
// per page мало бути 40)
// Коли погортаю пару сторінок і після цього зроблю новий запит, то сторінка не обнулиться, тобто може початись наприклад із 3 сторінки
// Тут теж можна собі було трохи рознести усе по файликах, фетч окремо, функції для створення розмітки окремо