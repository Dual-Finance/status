"""Webdriver tests for DUAL"""
import argparse
import logging
import json
import dip

def get_config():
    ''' Get the config for the phantom wallet'''
    parser = argparse.ArgumentParser()

    parser.add_argument('--url', help='Url')
    parser.add_argument('--seed', help='Seed phrase')
    parser.add_argument('--password', help='Password')
    parser.add_argument('--token', help='Token')

    args = parser.parse_args()
    if args.url and args.seed and args.password:
        return [args.url, args.seed, args.password, args.token]

    with open("config.json", 'r', encoding="utf-8") as config_file:
        return list(json.load(config_file).values())

if __name__ == '__main__':
    logging.basicConfig(
        format='%(asctime)s.%(msecs)03d  %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s',
        datefmt='%m/%d/%Y %I:%M:%S',
        level=logging.INFO)
    config = get_config()
    logging.info("Got config")

    #dip.deposit(config)

    # Also try to do a withdraw
    dip.withdraw(config)
