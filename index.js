const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')

let filteredMovies = []
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')

// 從 API 拿到的資料逐步放入 HTML 中
function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src= '${POSTER_URL + item.image}'
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector('#movie-modal-description')
  const modalImage = document.querySelector('#movie-modal-image')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release Date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src= '${POSTER_URL + data.image}' alt="Movie Poster" class="img-fluid">`
    })
    .catch((err) => console.log(err))
}

// 函式:加入收藏清單,將使用者點擊到的那一部電影送進 local storage 儲存起來
function addToFavorite(id){
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))  
}


dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


// Search Bar 監聽表單提交事件
searchForm.addEventListener('click', function onSearchFormSubmitted(event) {
  event.preventDefault() //取消預設事件

  const keyword = searchInput.value.trim().toLowerCase() //取得搜尋關鍵字

  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }

  // 使用filter作movies陣列的條件篩選
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword)) 

  // 使用for迴圈做條件篩選
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  // 錯誤處理,沒有符合條件的結果: 回傳警告
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字: ${keyword}沒有符合條件的電影`)
  }
  
  renderPaginator(filteredMovies.length) //重製分頁器
  renderMovieList(getMoviesByPage(1)) // 重新輸出經過篩選的movie list ==> 預設顯示第 1 頁的搜尋結果
})

// 製作分頁器
function getMoviesByPage(page) {
  // 如果搜尋結果有東西，條件判斷為 true ，會回傳 filteredMovies，然後用 data 保存回傳值
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 生成分頁器的頁碼 (li標籤)
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount/MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++){
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`
  }
  
  paginator.innerHTML = rawHTML
}

// 生成分頁器的事件監聽器,如果點擊到 a 標籤，就需要呼叫 renderMovieList 根據指定的頁數重新渲染頁面
paginator.addEventListener('click', function onPaginatorClicked(event){
  if (event.target.tagName !=='A') return 
  // 如果點擊到的不是a標籤就結束函式 

  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})


axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))