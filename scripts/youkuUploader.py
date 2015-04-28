# -*- coding: utf-8 -*-

import sys
import json

from youku import YoukuUpload

def main():
    args = sys.argv
    file_info = {
        'title': unicode(args[1], 'utf-8'),
        'category': '体育',
        'description': unicode(args[3], 'utf-8')
    }
    uploadFile = unicode(args[2], 'utf-8')

    with open('config.json') as config_file:
        configData = json.load(config_file)

    clientId = configData['youku']['client_id']
    accessToken = configData['youku']['access_token']

    youku = YoukuUpload(clientId, accessToken, uploadFile)

    return youku.upload(file_info)

main()
