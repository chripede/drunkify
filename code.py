import web
import mpd
import json

import config

render = web.template.render('templates/')

urls = (
    '/', 'index',
    '/api/playlist', 'playlist',
    '/api/play', 'play',
    '/api/search', 'search',
)

class Client:
    client = None
    
    @staticmethod
    def getClient():
        if(Client.client is None):
            Client._connect()
        
        try:        
            Client.client.ping()
        except Exception:
            Client._connect()
        
        return Client.client
        
    @staticmethod
    def _connect():
        Client.client = mpd.MPDClient()
        Client.client.connect(config.MPD_HOST, config.MPD_PORT)

class index:
    def GET(self):
        return render.index()
        
class playlist:
    def GET(self):
        list = Client.getClient().playlistinfo()
        web.header('Content-Type', 'application/json')
        return json.dumps(list)
    
    def POST(self):
        Client.getClient().add(web.data())
        if(not Client.getClient().currentsong()):
            Client.getClient().consume(1)
            Client.getClient().play()
        return ""
        
class play:
    def GET(self):
        currentsong = Client.getClient().currentsong()
        status = Client.getClient().status()
        if(not currentsong or not status):
            return ""
        response = {'artist': currentsong['artist'], 'title': currentsong['title'], 'time': currentsong['time'], 'elapsed': status['elapsed']}
        web.header('Content-Type', 'application/json')
        return json.dumps(response)
        
class search:
    def GET(self):
        i = web.input(q=None)
        result = Client.getClient().search("any", i.q)
        web.header('Content-Type', 'application/json')
        return json.dumps(result)
        
if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()