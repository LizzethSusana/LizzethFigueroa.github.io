const API_BASE = 'https://pokeapi.co/api/v2';
const PAGE_SIZE = 20;
let offset = 0;

const grid = document.getElementById('grid');
const state = document.getElementById('state');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

function setLoading(isLoading) {
  state.classList.toggle('d-none', !isLoading);
}

function artworkUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function renderPokemons(pokemons) {
  grid.innerHTML = '';
  pokemons.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-6 col-sm-4 col-md-3';
    col.innerHTML = `
      <div class="card p-2 h-100 text-center cursor-pointer">
        <img class="pokemon-img" src="${artworkUrl(p.id)}" alt="${p.name}">
        <div class="fw-semibold text-capitalize">${p.name}</div>
        <small class="text-muted">#${p.id}</small>
      </div>`;
    grid.appendChild(col);
  });
}

function fetchPokemons() {
  setLoading(true);
  fetch(`${API_BASE}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`)
    .then(res => res.json())
    .then(data => {
      const promises = data.results.map(p => fetch(p.url).then(r => r.json()));
      return Promise.all(promises);
    })
    .then(pokemons => {
      renderPokemons(pokemons);
      prevBtn.disabled = offset === 0;
      setLoading(false);
    })
    .catch(() => setLoading(false));
}

function fetchPokemonByNameOrId(query) {
  setLoading(true);
  fetch(`${API_BASE}/pokemon/${query.toLowerCase()}`)
    .then(res => {
      if (!res.ok) throw new Error('No encontrado');
      return res.json();
    })
    .then(p => {
      renderPokemons([p]); // mostramos solo 1 resultado
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      setLoading(false);
    })
    .catch(() => {
      grid.innerHTML = `<div class="col-12 text-center text-muted">No encontrado</div>`;
      setLoading(false);
    });
}

prevBtn.addEventListener('click', () => {
  if (offset >= PAGE_SIZE) {
    offset -= PAGE_SIZE;
    fetchPokemons();
  }
});

nextBtn.addEventListener('click', () => {
  offset += PAGE_SIZE;
  fetchPokemons();
});

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    fetchPokemonByNameOrId(query);
  } else {
    offset = 0;
    fetchPokemons();
    nextBtn.disabled = false;
  }
});

// inicial
fetchPokemons();
