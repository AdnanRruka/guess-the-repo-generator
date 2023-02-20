import fetch from 'node-fetch';
import fs from 'fs';
import sleep from 'sleep-promise';

const repos = [];

function saveJson() {
  fs.writeFile(
    'output.json',
    JSON.stringify(repos, null, 2),
    'utf8',
    function (err) {
      if (err) {
        console.log('An error occured while writing JSON Object to File.');
        return console.log(err);
      }
      console.log('JSON file has been saved.');
    }
  );
}

function getRepos(page) {
  console.log(
    `fetch https://api.github.com/search/repositories?q=stars:%3E1&sort=stars&per_page=100&page=${page}`
  );
  fetch(
    `https://api.github.com/search/repositories?q=stars:%3E1&sort=stars&per_page=100&page=${page}`
  )
    .then((res) => {
      console.log(
        `x-ratelimit-remaining: ${res.headers.get('x-ratelimit-remaining')}`
      );
      return res.json();
    })
    .then((json) => {
      if (json && json.items) {
        json.items
          .filter((i) => !i.fork)
          .map((i) => ({
            full_name: i.full_name,
            description: i.description,
            stargazers_count: i.stargazers_count,
            watchers_count: i.watchers_count,
            language: i.language,
            created_at: i.created_at,
            owner: i.owner
          }))
          .forEach((repo) => repos.push(repo));
      }
      if (page < 10) {
        getRepos(page + 1);
      } else {
        saveJson();
      }
    });
}

getRepos(1);
