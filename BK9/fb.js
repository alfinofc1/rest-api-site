const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));
const cheerio = require("cheerio");

async function fbdown(url) {
      try {
          const postOptions = {
              method: 'POST',
              body: new URLSearchParams({
                  URLz: url
              }),
          };
  
          const response = await fetch('https://fdown.net/download.php', postOptions);
          const html = await response.text();
  
          const $ = cheerio.load(html);
  
          return {
              title: $('.lib-row.lib-header').text().trim(),
              description: $('.lib-row.lib-desc').text().trim(),
              sdLink: $('#sdlink').attr('href'),
              hdLink: $('#hdlink').attr('href'),
          };
      } catch (error) {
          console.error('Error:', error.message);
          return null;
      }
  };


function fbreg(url) {
  const fbRegex = /(?:https?:\/\/)?(?:www\.)?(m\.facebook|facebook|fb)\.(com|me|watch)\/(?:(?:\w\.)*#!\/)?(?:groups\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/
  return fbRegex.test(url);
}

module.exports = { fbdown, fbreg }