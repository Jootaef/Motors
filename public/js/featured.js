'use strict'

fetch('/inv/getFeatured/')
    .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        throw Error("Network response was not OK")
    })
    .then(function (data) {
        console.log(data);
        buildFeaturedVehicles(data);
    })
    .catch(function (error) {
        console.log('There was a problem: ', error.message)
    })


function buildFeaturedVehicles(data) {
    const featuredWrapper = document.querySelector("#featured")

    if (data.length === 0) {
        featuredWrapper.innerHTML = '<p class="feature-available">Contact support to feature your vehicle</p>'
        return
    }

    let vehicles = data
    if (data.length > 3) {
        vehicles = []
        let usedIndexes = new Set()
        while (vehicles.length < 3) {
            const i = Math.floor(Math.random() * data.length);
            if (!usedIndexes.has(i)) {
                usedIndexes.add(i)
                vehicles.push(data[i])
            }
        }
    }

    let html = ''
    vehicles.forEach(function (vehicle) {
        html += `
        <div class="featured-vehicle">
          <h4>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h4>
          <img src="${vehicle.inv_thumbnail}" alt="${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}" >
          <a class="a-button" href="/inv/detail/${vehicle.inv_id}">View Vehicle</a>
        </div>
        `
    })

    featuredWrapper.innerHTML = html
}