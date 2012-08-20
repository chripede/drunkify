function DrunkifyViewModel() {
    var self = this;

    self.currentSongName = ko.observable("Drunkify");
    self.currentSongArtist = ko.observable("Spotify jukebox");
    self.query = ko.observable();
    self.result = ko.observableArray([]);
    self.playlist = ko.observableArray([]);
    self.added = ko.observable();
    self.songProgress = ko.observable("0%");
    self.songProgressText = ko.observable();

    this.search = function() {
        $.get('/api/search', { q: self.query() })
            .then(function(data) {
                var tracks = $.map(data, function(item) {
                    console.log(item);
                    return new Track(item);
                })
                self.result(tracks);
            });
    };
    
    this.maybeSearch = function(data, event) {
        if(event.keyCode == 13) {
            self.search()
            return false;
        }
        return true;
    }

    this.clearSearch = function() {
        self.result([]);
        self.query("");
    };

    this.enqueue = function (track) {
        $.post('/api/playlist', track.id(), function (data) {
            self.added(track.songName());
            if(self.playlist().length > 0)
                self.playlist.push(new PlaylistTrack({ Artist: track.artist(), Name: track.songName() }));
            self.result([]);
            self.query("");
            $('#song-added').fadeIn(400).delay(2000).fadeOut(300);
        });
    };
}

function Track(data) {
    this.id = ko.observable(data.file);
    this.artist = ko.observable(data.artist);
    this.songName = ko.observable(data.title);
    this.album = ko.observable(data.album + " (" + data.date + ")");
}

function PlaylistTrack(data) {
    this.artist = ko.observable(data.artist);
    this.songName = ko.observable(data.title);
}

$(function() {
    var vm = new DrunkifyViewModel();
    ko.applyBindings(vm);

    setInterval(function() {
        $.get('/api/play', function (data) {
            if (!data) {
                vm.currentSongName("Empty playlist!");
                vm.currentSongArtist("Add more songs");
                vm.songProgress("0%");
                vm.songProgressText("");
                return;
            }
            
            vm.currentSongName(data.title);
            vm.currentSongArtist(data.artist);

            vm.songProgress((data.elapsed / (data.time)) * 100 + "%");

            var min = Math.floor((data.elapsed / 60) % 60);
            var sec = Math.floor((data.elapsed) % 60);
            if (sec < 10)
                sec = "0" + sec;

            var totalMin = Math.floor(((data.time) / 60) % 60);
            var totalSec = Math.floor((data.time) % 60);
            if (totalSec < 10)
                totalSec = "0" + totalSec;

            vm.songProgressText(min + ":" + sec + " (" + totalMin + ":" + totalSec + ")");
        });
    }, 1000);

    setInterval(function() {
        $.get('/api/playlist', function (data) {
            data.splice(0, 1); // Remove current track
            vm.playlist($.map(data, function (item) { return new PlaylistTrack(item); }));
        });
    }, 10000);
});