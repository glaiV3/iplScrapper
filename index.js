const cheerio = require("cheerio")
const request = require("request")
const fs = require("fs")
const path = require("path")
const iplPath = path.join(__dirname, "Ipl")
dirCreator(iplPath)
const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595"
const allMatchLink = require("./allMatchLink")
request(url, function (err, response, html) {
    if (err) {
        console.log("err " + error);
    } else {
        extractLink(html)
    }
});
function extractLink(html) {
    let $ = cheerio.load(html);
    let linkarray = $(".ds-block .ds-py-3.ds-px-4 a")
    let href = $(linkarray[linkarray.length - 1]).attr("href")
    let fulllink = "https://www.espncricinfo.com" + href;
    //request sent to  extracte link of  60 matches of Ipl [view all results]
    request(fulllink, function (err, res, html) {
        if (err) {
            console.log(err);
        } else {
            allMatchLink.getMatchLink(html);
        }
    })
}

function dirCreator(filePath) {
    if (fs.existsSync(filePath) == false) {
        fs.mkdirSync(filePath)
    }
}
