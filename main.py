"""Webdriver tests for DUAL"""
import argparse
import os
import json
import dip

def get_config():
    ''' Get the config for the phantom wallet'''
    parser = argparse.ArgumentParser()

    parser.add_argument('--url', help='Url')
    parser.add_argument('--seed', help='Seed phrase')
    parser.add_argument('--password', help='Password')

    args = parser.parse_args()
    if args.url and args.seed and args.password:
        return [args.url, args.seed, args.password]

    with open("config.json", 'r', encoding="utf-8") as config_file:
        return list(json.load(config_file).values())

if __name__ == '__main__':
    config = get_config()

    # TODO: Make it configurable for token and for dev vs mainnet
    is_windows = os.name == 'nt'
    dip.deposit(config, is_windows)
