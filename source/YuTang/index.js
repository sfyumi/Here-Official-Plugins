const _ = require("underscore")
const http = require("http")
const net = require("net")
const pref = require("pref")

// const jsonPref = pref.all()

function getData(api) {

    const LIMIT = 30

    let entryList = []
    return http.get(api)
    .then(function(response) {
        var json = []

        if (response.data.Data.data == undefined) {
            json = response.data.Data
        }else{
            json = response.data.Data.data
        }
        if (json == undefined) {
            return here.miniWindow.set({ title: "Invalid data." })
        }
    
        let entryList = json

        if (entryList.length <= 1) {
            return here.miniWindow.set({ title: "Entrylist is empty." })
        }
    
        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }
            return entryList
        })
}

function updateData() {

    here.miniWindow.set({ title: "Updating…" })

    Promise.all([
        getData("https://www.tophub.fun:8888/v2/GetAllInfoGzip?id=1006"),
        getData("https://www.tophub.fun:8888/v2/GetAllInfoGzip?id=1065"),
        getData("https://www.tophub.fun:8888/GetRandomInfo?time=0&is_follow=0")
    ]).then(function (values) {

        // console.log(values[1])

        const topFeed = values[0][0]
        
        // Mini Window
        here.miniWindow.set({
            onClick: () => { here.openURL(topFeed.Url) },
            title: topFeed.Title,
            detail: "鱼塘热榜"
        })

        here.menuBar.set({
            title: ""
        })

        let popovers = []


        values.forEach(function(element, index){
            // console.log(index)
            // console.log(values[index])

            popovers[index] = _.map(values[index], (feed, index) => {
                return {
                    title: feed.Title,
                    accessory: {
                        title: feed.type
                    },
                    // detail: feed.description,
                    onClick: () => { here.openURL(feed.Url) }
                }
            })

        });

        let tabs = [
            {
                title: "鱼塘TOP榜",
                data: popovers[0]
            },
            {
                title: "鱼塘推荐榜",
                data: popovers[1]
            },
            {
                title: "鱼塘最新榜",
                data: popovers[2]
            }
        ]

        here.popover.set(tabs)

    });
}

here.on('load', () => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 12 * 3600 * 1000)
})

net.on('change', (type) => {
    console.log("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})