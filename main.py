"""Webdriver tests for DUAL"""
import os
import json
import dip

def get_config():
    ''' Get the config for the phantom wallet'''
    with open("config.json", 'r', encoding="utf-8") as config_file:
        return list(json.load(config_file).values())

if __name__ == '__main__':
    config = get_config()
    is_windows = os.name == 'nt'
    dip.deposit(config, is_windows)
