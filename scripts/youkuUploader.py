# -*- coding: utf-8 -*-

import sys
import json

from youku import YoukuUpload

def main():
    args = sys.argv
    file_info = {
        'title': args[1],
        'tags': '体育',
        'description': ''
    }
    uploadFile = args[2]

    with open('../config.json') as config_file:
        configData = json.load(config_file)

    clientId = configData['youku']['client_id']
    accessToken = configData['youku']['accessToken']

    youku = YoukuUpload(clientId, accessToken, uploadFile)

    youku.upload(file_info)

main()
