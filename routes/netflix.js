const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/upcoming', (req, res) => {
    let month
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    if(!req.params.month){
        const d = new Date();
        month = months[d.getMonth()];
    } else {
        month = req.params.month
        month = month.charAt(0).toUpperCase() + month.slice(1);
        let check = months.some(el => el === month);
        if(!check){
            res.json({"message": "You can't access that"})
        }
    }

    request(`https://www.whats-on-netflix.com/coming-soon/whats-coming-to-netflix-in-${month.toLowerCase()}-2023/`, (error, response, html) => {
        if (!error && response.statusCode === 200) {
            const $ = cheerio.load(html);
            let newReleases = [];
            $('.page-title group').find('h1').each(function(){
                console.log($(this).text)
            })

            $('.entry-inner').find('h4').each(function() {
                const dayTitle = $(this).text();
                const nextElements = $(this).nextUntil('h4').filter(':not(div)');
                const nextElementsText = nextElements.text();
                let arr = nextElementsText.split('\n');
                let newarr = []

                arr.forEach(element => {
                    const start = 0;
                    const end = element.lastIndexOf(")");
                    let title = element.substring(start, end+1);
                    element = element.replace(title, "");

                    if(!element.includes(" Netflix Original")){
                        element = element.replace(" – ", "")
                    } else {
                        element = element.replace(" Netflix Original", "Netflix Original")
                    }

                    let addMatch = title.match(/\((.*)\)/);
                    let additional
                    if(addMatch){
                        additional = addMatch[0]
                    }

                    title = title.replace(` ${additional}`, "")

                    newarr.push({"title": title, "info": additional, "text": element});
                });

                newarr = newarr.filter(element => {
                    if(element.title == ""){
                        return false;
                    }
                    else {
                        return true;
                    }
                });

                newReleases.push({ "day": dayTitle, "items": newarr });

                newReleases = newReleases.map(object => {
                    let numberofmonth = months.indexOf(month)+1;
                    let monthRegExp = new RegExp(`What’s Coming to Netflix on ${month} (\\d{1,2})`);
                    const match = object.day.match(monthRegExp);
                    if (match) {
                        let day = match[1];
                        if (day < 10) {
                            day = '0' + day;
                        }
                        object.day = `2022-${("0" + (numberofmonth)).slice(-2)}-${day}`;
                        object.day = object.day.replace(/(st|nd|th)/, '');
                    }
                    return object;
                });
            });
            res.json(newReleases);
        } else {
            res.json({"message": "You can't access this"});
        }
    });
});

module.exports = router
