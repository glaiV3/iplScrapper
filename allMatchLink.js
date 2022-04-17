const cheerio = require("cheerio")
const request = require("request")
const playerDetails = require("./playerDetails")
function getAllMatchesLink(html) {
    let $ = cheerio.load(html);
    //selector for 60 matches link
    let allMatchLink = $(".ds-p-0 .ds-border-b.ds-border-line .ds-px-4.ds-py-3>a")
    let firstLink = $(allMatchLink[0]).attr("href");
    for (let i = 0; i < allMatchLink.length; i++) {
        fullLink = "https://www.espncricinfo.com" + $(allMatchLink[i]).attr("href");
        request(fullLink, function (err, res, html) {
            if (err) {
                console.log(err);
            } else {
                playerDetails.matchDetails(html)
            }
        })
        // console.log(fullLink);
    }

}
module.exports = {
    getMatchLink: getAllMatchesLink
}