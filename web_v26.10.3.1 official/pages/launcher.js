"use strict";

const cdnBase = "https://cdn.jsdelivr.net/gh/bubbls/ugs-singlefile/UGS-Files/";
const gamesPerPage = 48;
const knownTitles = {
  clbitlife: "BitLife",
  clbloonsTD4: "Bloons TD 4",
  clcookieclicker: "Cookie Clicker",
  cldoomdos: "Doom",
  clescaperoad: "Escape Road",
  clfallout: "Fallout",
  clocarinaoftime: "The Legend of Zelda: Ocarina of Time",
  clragdollarchers: "Ragdoll Archers",
  clretrobowl: "Retro Bowl",
  clrun3: "Run 3",
  clsupermario64: "Super Mario 64"
};
const localGames = {
  clbitlife: "../coming soon!/clbitlife.html",
  clbloonsTD4: "../coming soon!/clbloonsTD4.html",
  clcookieclicker: "../coming soon!/clcookieclicker.html",
  cldoomdos: "../coming soon!/cldoomdos.html",
  clescaperoad: "../coming soon!/clescaperoad.html",
  clfallout: "../coming soon!/clfallout.html",
  clocarinaoftime: "../coming soon!/clocarinaoftime.html",
  clragdollarchers: "../coming soon!/clragdollarchers.html",
  clretrobowl: "../coming soon!/clretrobowl.html",
  clrun3: "../coming soon!/clrun3.html",
  clsupermario64: "../coming soon!/clsupermario64.html"
};
const knownFavicons = {
  clcookieclicker: "https://cdn.jsdelivr.net/gh/bubbls/UGS-Assets@main/cookieclicker/img/favicon.ico",
  clretrobowl: "https://cdn.jsdelivr.net/gh/selenite-cc/selenite-old@9c743188888af0986c8c7b293dbac8f9e421a4ee/retrobowl/retrobowl.ico",
  clrun3: "https://cdn.jsdelivr.net/gh/VinMannie/Run_3@gh-pages/favicon.png"
};

const grid = document.getElementById("game-grid");
const search = document.getElementById("search");
const count = document.getElementById("result-count");
const previous = document.getElementById("previous");
const next = document.getElementById("next");
const pageStatus = document.getElementById("page-status");
const player = document.getElementById("player");
const playerTitle = document.getElementById("player-title");
const playerFrame = document.getElementById("player-frame");
const openNewTab = document.getElementById("open-new-tab");
const closePlayerButton = document.getElementById("close-player");

const games = Array.isArray(window.GAME_IDS)
  ? window.GAME_IDS.map((id) => ({ id, title: titleFor(id) }))
  : [];
let currentPage = 0;
let focusedGame = null;

function titleFor(id) {
  if (knownTitles[id]) return knownTitles[id];
  return id
    .replace(/^cl/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function hueFor(id) {
  return [...id].reduce((hue, character) => (hue * 31 + character.charCodeAt(0)) % 360, 211);
}

function filenameFor(id) {
  return id.includes(".") && id.lastIndexOf(".") > 0 ? id : `${id}.html`;
}

function urlFor(game) {
  if (localGames[game.id]) return new URL(localGames[game.id], location.href).href;
  return cdnBase + encodeURIComponent(filenameFor(game.id));
}

function iconUrlFor(game) {
  return knownFavicons[game.id] || null;
}

function createCard(game, index) {
  const button = document.createElement("button");
  button.className = "game-card";
  button.type = "button";
  button.style.setProperty("--tile-hue", String(hueFor(game.id)));
  button.style.setProperty("--item-index", String(index % 12));
  button.title = `Play ${game.title}`;

  const icon = document.createElement("span");
  icon.className = "game-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = game.title.trim().charAt(0).toUpperCase() || "★";

  const iconUrl = iconUrlFor(game);
  if (iconUrl) {
    const image = document.createElement("img");
    image.src = iconUrl;
    image.alt = "";
    image.loading = "lazy";
    image.onerror = () => image.remove();
    icon.replaceChildren(image);
  }

  const label = document.createElement("span");
  label.className = "game-name";
  label.textContent = game.title;
  button.append(icon, label);
  button.addEventListener("click", () => openGame(game, button));
  return button;
}

function filteredGames() {
  const query = search.value.trim().toLocaleLowerCase();
  return query ? games.filter((game) => game.title.toLocaleLowerCase().includes(query)) : games;
}

function render() {
  const results = filteredGames();
  const pageCount = Math.max(1, Math.ceil(results.length / gamesPerPage));
  currentPage = Math.min(currentPage, pageCount - 1);
  const first = currentPage * gamesPerPage;
  const visible = results.slice(first, first + gamesPerPage);

  grid.replaceChildren();
  if (!games.length) {
    const message = document.createElement("p");
    message.className = "empty-state";
    message.textContent = "The game list could not be loaded.";
    grid.appendChild(message);
  } else if (!visible.length) {
    const message = document.createElement("p");
    message.className = "empty-state";
    message.textContent = "No games match that search. Try another title.";
    grid.appendChild(message);
  } else {
    visible.forEach((game, index) => grid.appendChild(createCard(game, index)));
  }

  count.textContent = `${results.length.toLocaleString()} games`;
  pageStatus.textContent = `${currentPage + 1} / ${pageCount}`;
  previous.disabled = currentPage === 0;
  next.disabled = currentPage >= pageCount - 1;
}

function openGame(game, button) {
  focusedGame = button;
  playerTitle.textContent = game.title;
  playerFrame.title = game.title;
  const url = urlFor(game);
  playerFrame.src = url;
  openNewTab.href = url;
  player.hidden = false;
  closePlayerButton.focus();
}

function closeGame() {
  playerFrame.removeAttribute("src");
  player.hidden = true;
  if (focusedGame?.isConnected) focusedGame.focus();
  focusedGame = null;
}

search.addEventListener("input", () => {
  currentPage = 0;
  render();
});
previous.addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    render();
    grid.querySelector(".game-card")?.focus();
  }
});
next.addEventListener("click", () => {
  const pageCount = Math.ceil(filteredGames().length / gamesPerPage);
  if (currentPage + 1 < pageCount) {
    currentPage++;
    render();
    grid.querySelector(".game-card")?.focus();
  }
});
closePlayerButton.addEventListener("click", closeGame);
player.addEventListener("click", (event) => {
  if (event.target === player) closeGame();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !player.hidden) closeGame();
});

render();
