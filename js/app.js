var map;
var infoWindow;

initialLocations = [
        {
            name: 'Gran Arena del Cibao',
            position: {
                lat: 19.4653224,
                lng: -70.7095788
            },
            info: ''
        },
        {
            name: 'Fortaleza San Luis',
            position: {
                lat: 19.4480365,
                lng: -70.7029076
            },
            info: ''
        },
        {
            name: 'Monumento de Santiago',
            position: {
                lat: 19.4509573,
                lng: -70.694637
            },
            info: ''
        },
        {
            name: 'Pontificia Universidad Católica Madre y Maestra',
            position: {
                lat: 19.4445363,
                lng: -70.683252
            },
            info: ''
        },
        {
            name: 'Universidad Tecnológica de Santiago',
            position: {
                lat: 19.432889,
                lng: -70.692654
            },
            info: ''
        }
];

var Location = function(data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.lng = data.lng;
    this.info = data.info;
    this.active = ko.observable(true);

    // load wikipedia data
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='
        + this.name + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function(){
        alert("failed to get wikipedia resources as it took too long");
    }, 8000);
    var contentString = '';

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function( response ) {
            self.info = response[2][0];
            self.url = response[3][0];

            contentString = '<div id="content">'+
                '<div id="siteNotice">'+
                '</div>'+
                '<h1 id="firstHeading" class="firstHeading">'+ self.name +'</h1>'+
                '<div id="bodyContent">'+
                '<p>'+ self.info +'</p>'+
                '</div>'+
                '<a href="'+ self.url +'">'+ self.url +'</a>'
                '</div>';

            self.createMarker();

            clearTimeout(wikiRequestTimeout);
        },
    }).fail(function(e) {
        alert("failed to get wikipedia resources");
    });

    this.createMarker = function() {
        self.marker = new google.maps.Marker({
            position: data.position,
            map: map,
            title: data.name
        });

        self.marker.addListener('click', function() {
            self.setMarker();
        });

        self.visible = ko.computed(function() {
            if (this.active() == true) {
                this.marker.setMap(map);
            } else {
                this.marker.setMap(null)
            }
        }, self);
    }

    this.setMarker = function() {
        infoWindow.setContent(contentString);
        infoWindow.open(map, self.marker);
        self.toogleBounce();
    }

    this.activeMarker = function() {
        self.setMarker();
    }

    this.toogleBounce = function() {
        if (self.marker.getAnimation() == 1) {
            self.marker.setAnimation(null);
        } else {
            self.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                self.marker.setAnimation(null);
            }, 3000);
        }
    }
}

var ViewModel = function() {
    var self = this;

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 19.4509573, lng: -70.694637}
    });

    infoWindow = new google.maps.InfoWindow;

    this.markerSearch = ko.observable("");

    this.markersList = ko.observableArray([]);

    this.activeClass = ko.observable(false);

    this.currentMarker = ko.observable();

    initialLocations.forEach(function(locationItem){
        self.markersList.push(new Location(locationItem))
    });

    this.setCurrentMarker = function(marker) {
        marker.activeMarker();
    }

    this.activeSidepanel = function() {
        if ( this.activeClass() == true ) {
            this.activeClass(false);
        } else {
            this.activeClass(true);
        }
    };

    this.filteredMarkers = ko.computed(function() {
        var search = self.markerSearch().toLowerCase();
        if (!search) {
            self.markersList().forEach(function(markerItem) {
                markerItem.active(true);
            });
            return self.markersList();
        } else {
            return ko.utils.arrayFilter(self.markersList(), function(markerItem) {
                var found = markerItem.name.toLowerCase().indexOf(search) >= 0;
                markerItem.active(found)
                return found;
            });
        }
    }, this);

    $('#map').css('height', window.innerHeight - 35);
};

function initMap() {
    ko.applyBindings(new ViewModel());
}

function errorHandler() {
    alert("Failed to load resources. Please check your internet connection and try again.");
}
