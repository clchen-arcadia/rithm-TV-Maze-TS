import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

const BASE_URL = 'http://api.tvmaze.com';
const PLACEHOLDER_IMG = 'https://tinyurl.com/tv-missing';


interface IShows {
  id: number;
  image: string;
  name: string;
  summary: string;
}
/**
 * x:IShows = {

}
 */

interface IEpisodes {
  id: number;
  name: string;
  season: number;
  number: number;
}

// NOTE: FINAL: this is NOT a minimum, this IS the hard-coded
// BUT in this specific case, because it is an external API, TS-transpiler will not
// crash.
interface IShowsAPI {
  id: number;
  image: {medium: string} | null;
  name: string;
  summary: string;
}
/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<IShows[]> {
  const resp = await axios({
    url: `${BASE_URL}/search/shows`,
    method: 'get',
    params: { q: term }
  });

  console.log("getShowsByTerm, resp is", resp);

  const output = resp.data.map(show => ({
    id: show.show.id,
    name: show.show.name,
    summary: show.show.summary,
    image: show.show.image ? show.show.image.medium : PLACEHOLDER_IMG,
  }));

  console.log("getShowsByTerm output", output);

  return output;
}
// show.show.image?.medium || PLACEHOLDER_IMG,

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: IShows[]): void {
  $showsList.empty();

  for (let show of shows) {

    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

// const p = searchForShowAndDisplay();

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<IEpisodes[]> {
  const resp = await axios({
    url: `${BASE_URL}/shows/${id}/episodes`,
    method: 'get',
  });
  console.log("getEpisodesOfShow resp is", resp);
  // return resp.data; // This actually works!
  // TODO: rename "output"
  const output = resp.data.map( e => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
  }));
  console.log("getEpisodesOfShow output is", output);

  return output;
}

/** When given a list of episode objects, function empties the episodeList
 *  and repopulates it will list items, then shows the episodesArea.
 */

function populateEpisodes(episodes: IEpisodes[]): void {
  $episodesList.empty();

  for (let episode of episodes) {
    $episodesList.append($(`
      <li>${episode.name} (season ${episode.season}, number ${episode.number})</li>
    `));
  }

  $episodesArea.show();
}

/** Listens for search form submit */
$searchForm.on("submit", async function (evt: JQuery.SubmitEvent): Promise<void> {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Event delegation for clicking a show episodes button */
$showsList.on("click", "button.Show-getEpisodes", async function (evt: JQuery.ClickEvent): Promise<void> {
  const showId = $(evt.target).closest('.Show').data('show-id');
  populateEpisodes(await getEpisodesOfShow(showId));
});
