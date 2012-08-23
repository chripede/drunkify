function SoberViewModel() {
    
    clear = function() {
        $.get('/api/admin/command', { cmd: 'clear' });
    }
    
    next = function() {
        $.get('/api/admin/command', { cmd: 'next' });
    }
    
    pause = function() {
        $.get('/api/admin/command', { cmd: 'pause' });
    }
    
    play = function() {
        $.get('/api/admin/command', { cmd: 'play' });
    }
    
}

$(function() {
    var viewModel = new SoberViewModel();
    ko.applyBindings(viewModel);
});