let map;

document.addEventListener("DOMContentLoaded", function () {
    initializeMap();
    fetchInstagramPosts('parkour');

    document.getElementById('refreshButton').addEventListener('click', function() {
        clearMarkers();
        fetchInstagramPosts('parkour');
    });
});

function initializeMap() {
    map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
}

function addVideoMarker(lat, lng, videoUrl) {
    var marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup('<a href="' + videoUrl + '" target="_blank">Watch Parkour Video</a>');
}

function clearMarkers() {
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
}


async function fetchInstagramPosts(tag) {
    showLoading();
    try {
        const userId = '17841464174991863'; // Replace with your Instagram user ID
        const accessToken = 'IGQWROSlFENlh4VVp1dGVaVWtTX3kwZA0ZADN2M3UGRVNGFFeGRGeGFpUGQyZAC1raGRlaXd3OFBobkI0WlZATWkxTdGgxOXpIT1dTN0JudkVWMDNUSG9RVTZAPTU14aUxMMERmMW9kTTJZAV3FyQ0ZAnc0gzYlVWM1ltZADAZD'; // Replace with your valid access token

        // Hashtag search
        const hashtagUrl = `https://graph.instagram.com/ig_hashtag_search?user_id=${userId}&q=${tag}&access_token=${accessToken}`;
        const hashtagResponse = await fetch(hashtagUrl);
        
        if (!hashtagResponse.ok) {
            const errorData = await hashtagResponse.json();
            throw new Error(`Hashtag API error: ${JSON.stringify(errorData.error)}`);
        }

        const hashtagData = await hashtagResponse.json();

        if (!hashtagData.data || hashtagData.data.length === 0) {
            throw new Error('No hashtag found');
        }

        const hashtagId = hashtagData.data[0].id;

        // Recent media for the hashtag
        const mediaUrl = `https://graph.instagram.com/${hashtagId}/recent_media?user_id=${userId}&fields=id,media_type,media_url,permalink,caption&access_token=${accessToken}`;
        const mediaResponse = await fetch(mediaUrl);

        if (!mediaResponse.ok) {
            const errorData = await mediaResponse.json();
            throw new Error(`Media API error: ${JSON.stringify(errorData.error)}`);
        }

        const mediaData = await mediaResponse.json();

        if (!mediaData.data || mediaData.data.length === 0) {
            throw new Error('No media found for this hashtag');
        }

        mediaData.data.forEach(media => {
            if (media.media_type === 'VIDEO') {
                const latLng = extractLocationFromCaption(media.caption);
                if (latLng) {
                    addVideoMarker(latLng.lat, latLng.lng, media.permalink);
                }
            }
        });

    } catch (error) {
        console.error('Error fetching Instagram posts:', error);
        showError(`Failed to load Instagram posts: ${error.message}`);
    } finally {
        hideLoading();
    }
}



function extractLocationFromCaption(caption) {
    const cities = {
        'Paris': { lat: 48.8566, lng: 2.3522 },
        'London': { lat: 51.5074, lng: -0.1278 },
        'New York': { lat: 40.7128, lng: -74.0060 },
        // Add more cities...
    };
    
    for (let city in cities) {
        if (caption && caption.toLowerCase().includes(city.toLowerCase())) {
            return cities[city];
        }
    }
    return null;
}

function showLoading() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 5000);
}

// Mock data function for testing
function getMockData() {
    return [
        { caption: 'Amazing parkour in Paris!', permalink: 'https://www.instagram.com/p/mock1/' },
        { caption: 'Jumping through London', permalink: 'https://www.instagram.com/p/mock2/' },
        { caption: 'New York parkour scene', permalink: 'https://www.instagram.com/p/mock3/' },
    ];
}

// Uncomment this function and comment out the original fetchInstagramPosts to use mock data
/*
function fetchInstagramPosts() {
    showLoading();
    setTimeout(() => {
        const mockData = getMockData();
        mockData.forEach(post => {
            const latLng = extractLocationFromCaption(post.caption);
            if (latLng) {
                addVideoMarker(latLng.lat, latLng.lng, post.permalink);
            }
        });
        hideLoading();
    }, 1000);
}
*/
