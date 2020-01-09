//console.clear();

/*$(document).ready(function(){
 $("#app").hide();
 });
 $('.autocomplete-results')
 .on('click', '.autocomplete-result', function(e) {
 $("#app").show();
 });
 $('.autocomplete-results')
 .on('keypress', ,(function(e){
 if (e.which == 13){ 
 $("#app").show();
 }
 });
 */

map = new Vue({
    el: '#app',
    data: () => ({
            distance: null,
            emission: null,
            airports: [],
            currentAirport: null,
            lastAirport: null,
            markers: [
//                {
//                    airport: null,
//                    x: 200,
//                    y: 300,
//                    startX: 0,
//                    startY: 0,
//                    fill: '#f47825',
//                    current: false},
//
//                {
//                    airport: null,
//                    x: 500,
//                    y: 100,
//                    startX: 0,
//                    startY: 0,
//                    fill: '#00b26b',
//                    current: false
//                }
            ]
        }),
    filters: {
        numberWithCommas(val) {
            return val && val.toString ? val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : val;
        }
    },
    mounted() {
        // D3 Projection
        var projection = d3.geoAlbers().parallels([50, 70]).rotate([90, 0, 0]).scale([1500]); // scale things down so see entire US
        this.projection = projection;

        // D3 US States map
        fetch('data/canada.json').then(response => response.json()).then(provinces => {
            // Define path generator
            // path generator that will convert GeoJSON to SVG paths
            var path = d3.geoPath().projection(projection); // tell path generator to use albersUsa projection

            // Bind the data to the SVG and create one path per GeoJSON feature
            d3.select(this.$refs.provinces).
                    selectAll("path").
                    data(provinces.features).
                    enter().
                    append("path").
                    attr("d", path);
        });

        // Airports
        fetch('data/canadianairport.json').then(response => response.json()).then(airports => {
            // Let's only focus on the top 100
            airports = airports.slice(0, 100);
            var i = airports.length, d, proj;

            while (i--) {
                d = airports[i];
                proj = projection([d.Lng, d.Lat]);

                if (proj) {
                    d.x = proj[0];
                    d.y = proj[1];
                } else {
                    airports.splice(i, 1);
                }
            }

            this.airports = airports.reverse();

            var la = null;

            this.markers.forEach(marker => {
                var ra = this.randomAirport();
                if (ra == la) {
                    ra = this.randomAirport();
                }
                la = ra;
                marker.airport = ra;
                marker.x = ra.x;
                marker.y = ra.y;
            });
            this.markerDistance();
        });
    },
    methods: {
        randomAirport() {
            return this.airports[Math.floor(Math.random() * this.airports.length)];
        },
        markerSet(e, marker) {
            if (e) {
                e.preventDefault();
            }
            marker = marker || this.markers[0];
            marker.airport = null;
            marker.current = true;
            marker.startX = marker.x;
            marker.startY = marker.y;

            this.currentAirport = null;
            this.currentMarker = marker;

            if (this.airplaneTween) {
                var oldTween = this.airplaneTween;
                var tl = new TimelineLite();
                tl.to(this.$refs.airplane, 0.2, {
                    opacity: 0,
                    ease: "Linear.easeNone",
                    onComplete: function () {
                        if (oldTween) {
                            oldTween.kill();
                        }
                    }});


                this.airplaneFade = tl;
            }
            this.markerDrag(e);
            document.addEventListener('mousemove', this.markerDrag);
            document.addEventListener('mouseup', this.markerStop);
            this.$refs.map.addEventListener('mouseleave', this.markerLeave);
        },
        markerDrag(e) {
            this.currentMarker.airport = this.currentAirport;

            if (this.currentAirport) {
                this.currentMarker.x = this.currentAirport.x;
                this.currentMarker.y = this.currentAirport.y;
            } else {
                d3.event = e;
                var mouse = d3.mouse(this.$refs.map);
                this.currentMarker.x = mouse[0];
                this.currentMarker.y = mouse[1];
            }
            this.markerDistance();
        },
        markerLeave() {
            this.currentMarker.x = this.currentMarker.startX;
            this.currentMarker.y = this.currentMarker.startY;

            this.markerStop();
        },
        markerStop() {
            console.log('stop!');
            document.removeEventListener('mousemove', this.markerDrag);
            document.removeEventListener('mouseup', this.markerStop);
            this.$refs.map.removeEventListener('mouseleave', this.markerLeave);

            this.currentMarker.current = false;
            this.currentMarker = null;

            this.markerDistance();
        },
        markerConnect() {
            if (this.markers.length < 2) {
                return;
            }
            var pathList = [];
            for (var i = 0; i < this.markers.length - 1; i++) {
                var m1 = this.markers[i],
                        m2 = this.markers[(i + 1)];

                if (m1.x < m2.x) {
                    m1 = this.markers[i];
                    m2 = this.markers[(i + 1)];
                }

                var dx = m2.x - m1.x,
                        dy = m2.y - m1.y,
                        dr = Math.sqrt(dx * dx + dy * dy);

                pathList.push("M" + m2.x + "," + m2.y + "A" + dr + "," + dr + " 0 0,1 " + m1.x + "," + m1.y);
            }
            return pathList;
        },
        calcDistance(lat1, lon1, lat2, lon2, unit) {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit == "K") {
                dist = dist * 1.609344;
            }
            if (unit == "N") {
                dist = dist * 0.8684;
            }
            dist = dist * 1.60934;
            return dist;

        },
        markerDistance() {
            if (this.airplaneTween) {
                this.airplaneTween.kill();
                $(".airplane").css("opacity", 0);
            }
            this.distance = 0;
            if (this.markers.length < 2) {
                return;
            }
            for (var i = 0; i < this.markers.length - 1; i++) {

                var marker1 = this.markers[i];
                var latLng1 = this.projection.invert([marker1.x, marker1.y]).reverse();

                var marker2 = this.markers[(i + 1)];
                var latLng2 = this.projection.invert([marker2.x, marker2.y]).reverse();

                this.distance += Math.round(this.calcDistance(latLng1[0], latLng1[1], latLng2[0], latLng2[1]));
            }

            this.airplaneAnimate();
        },
        airportSnap(e, airport) {
            if (airport !== this.currentAirport) {
                airport.current = true;
                this.currentAirport = airport;
                if (this.currentMarker) {
                    this.currentMarker.airport = airport;
                }
            }
        },
        airportClick(e, airport) {
            if (!this.currentMarker) {
                this.markerSet(e);
            }
            this.currentAirport = airport;
            this.currentMarker.x = this.currentAirport.x;
            this.currentMarker.y = this.currentAirport.y;
            if (this.currentMarker) {
                this.currentMarker.airport = airport;
            }
            this.markerDistance();
        },
        airportLeave(e, airport) {
            airport.current = false;
            this.currentAirport = null;
            this.lastAirport = airport;
        },
        airplaneAnimate() {
            var pathList = this.markerConnect();
            var newTween = new TimelineMax({repeat: -1, delay: -0.2});
            var duration = Math.min(this.distance / 80, 15);
            var opacityDuration = Math.min(duration * 0.2, 0.3);

            if (this.airplaneFade && this.airplaneFade.isActive()) {
                newTween.pause();

                this.airplaneFade.eventCallback('onComplete', function () {
                    newTween.play();
                });
            } else if (this.airplaneTween) {
                this.airplaneTween.kill();
            }

            var bez = MorphSVGPlugin.pathDataToBezier(pathList.join(" "));

            newTween.to(this.$refs.airplane, duration, {
                bezier: {
                    values: bez,
                    curviness: 1,
                    autoRotate: -90,
                    type: "cubic"
                },
                reversed: true,
                ease: Linear.easeNone
            }, 0);

            newTween.fromTo(this.$refs.airplane, opacityDuration, {
                opacity: 0
            }, {
                opacity: 1,
                delay: opacityDuration / 2,
                ease: "Linear.easeNone"
            }, 0);
//
            newTween.to(this.$refs.airplane, opacityDuration, {
                opacity: 0,
                ease: 'Linear.easeNone'
            }, '-=' + opacityDuration);

            this.airplaneTween = newTween;
        },
        calculateEmission() {
            this.emission = 0;
            var emission = 0;
            var totalEmission = 0;
            var distance;
            var marker1 = null, latLng1 = null, marker2 = null, latLng2 = null;
            for (var i = 0; i < this.markers.length; i++) {
                if (this.markers[i].flying) {
                    if (!marker1) {
                        marker1 = this.markers[i];
                        latLng1 = this.projection.invert([marker1.x, marker1.y]).reverse();
                    } else {
                        marker2 = this.markers[i];
                        latLng2 = this.projection.invert([marker2.x, marker2.y]).reverse();
                    }
                }
                if (marker1 && marker2) {
                    distance = Math.round(this.calcDistance(latLng1[0], latLng1[1], latLng2[0], latLng2[1]));

                    emission = distance * 1.08;
                    if (emission < 463) {
                        emission = emission * 0.27867;
                    } else if (emission > 463 && emission < 3700) {
                        emission = emission * 0.16508;
                    } else {
                        emission = emission * 0.14678;
                    }
                    totalEmission += emission;

                    marker1 = marker2, latLng1 = latLng2, marker2 = null, latLng2 = null;
                }
            }
            this.emission = Math.round(totalEmission).toFixed();
        }
    }
});