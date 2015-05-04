# youtuboad
youtube download service

## prerequisite

### Node.js
```git clone git@github.com:joyent/node.git```
```./configure```
```make```
```make install```

### Python environment
```sudo apt-get install python```

### pip
```sudo apt-get install python-pip```

### youtube-dl
```sudo pip install --upgrade youtube_dl```

### youku-sdk
```sudo pip install youku```

### bypy
```git clone https://github.com/houtianze/bypy```
```sudo cp bypy.py /usr/local/bin/bypy```

####
must exec bypy upload before your start the project
follow the instruction and finish baidu pce authentication


## Prepare node environment
```npm install```


## Knock out
```node index.js```

### or with pm2
```sudo npm install pm2```
```pm2 start index.js```
