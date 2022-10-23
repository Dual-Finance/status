"""API testing """
import json
import time
import hmac
import hashlib
import logging
import requests
import dip
from main import get_config

# API_KEY for the test account used on devnet. Does not work on mainnet
# There is nothing special about this api key except it is loaded with tokens on
# devnet.
API_KEY = '9493a07981ebbdf97ebdaf5266024090d8e8e2b8a445dedee7900c28e3bbcbaf'
API_SECRET = '1d6ca965c1493d80ef253264fe2273a7be4fb64145c52a4a74563f787d66bafe'

headers = {
    'X-MBX-APIKEY': API_KEY,
}
BASE_URL = "https://dev.api.dual.finance"
PRICE = 10

def get_symbols():
    '''Gets all symbols in the symbols table'''
    logging.info("Getting symbols")
    url = f"{BASE_URL}/symbols/getsymbols"
    response = requests.get(url, headers=headers)
    assert response.ok
    logging.info("Symbols: %s", str(response.json()))
    return json.loads(response.text)


def create_order(symbol):
    '''Creates an order'''
    logging.info("Creating order for %s", symbol)
    url = f"{BASE_URL}/orders/createorder"
    client_order_id = 'clientOrderId' + str(int(time.time()))
    side = 'BUY'
    price = PRICE
    quantity = 10

    request = f"clientOrderId={client_order_id}&symbol={symbol}&price={price}&quantity={quantity}&side={side}"

    signature = hmac.new(
        bytes(API_SECRET, 'utf-8'),
        msg=bytes(request, 'utf-8'),
        digestmod=hashlib.sha256).hexdigest().upper()

    data = {'symbol': symbol, 'price': price, 'quantity': quantity,
            'side': side, 'clientOrderId': client_order_id, 'signature': signature}
    response = requests.post(url, json=data, headers=headers)
    assert response.ok
    logging.info("Create order: %s", str(response.text))
    return json.loads(response.text)


def dead_man_switch(timeout = 600):
    '''Dead man switch'''
    logging.info("Setting deadman switch %d", timeout)
    url = f"{BASE_URL}/orders/deadmanswitch"

    request = f"timeout={timeout}"

    signature = hmac.new(
        bytes(API_SECRET, 'utf-8'),
        msg=bytes(request, 'utf-8'),
        digestmod=hashlib.sha256).hexdigest().upper()
    data = {'timeout': timeout, 'signature': signature}

    response = requests.post(url, json=data, headers=headers)
    logging.info("Deadman switch response %s", str(response.text))
    assert response.ok


def cancel_order(client_order_id):
    '''Cancel an order'''
    logging.info("Cancelling order %s", str(client_order_id))
    url = f"{BASE_URL}/orders/cancelorder"

    request = f"clientOrderId={client_order_id}"

    signature = hmac.new(
        bytes(API_SECRET, 'utf-8'),
        msg=bytes(request, 'utf-8'),
        digestmod=hashlib.sha256).hexdigest().upper()
    data = {'clientOrderId': client_order_id, 'signature': signature}

    response = requests.post(url, json=data, headers=headers)
    logging.info("Cancelled order %s", response.text)
    assert response.ok


def my_orders():
    '''All my orders'''
    logging.info("Getting my orders")
    url = f"{BASE_URL}/orders/myorders"
    nonce = "123456"
    request = f"nonce={nonce}"

    signature = hmac.new(
        bytes(API_SECRET, 'utf-8'),
        msg=bytes(request, 'utf-8'),
        digestmod=hashlib.sha256).hexdigest().upper()
    url = url + f"?nonce={nonce}&signature={signature}"

    response = requests.get(url, headers=headers)
    assert response.ok
    logging.info("My orders: %s", response.text)
    return json.loads(response.text)


def my_executions(symbol):
    '''All my executions'''
    logging.info("Getting my executions for symbol: %s", symbol)
    url = f"{BASE_URL}/executions/myexecutions"
    nonce = "123456"
    # Last 5 minutes
    start_time = int(time.time() * 1_000) - 300_000
    limit = 100

    request = f"nonce={nonce}&limit={limit}&start_time={start_time}&symbol={symbol}"

    signature = hmac.new(
        bytes(API_SECRET, 'utf-8'),
        msg=bytes(request, 'utf-8'),
        digestmod=hashlib.sha256).hexdigest().upper()
    url = url + f"?nonce={nonce}&signature={signature}&limit={limit}&symbol={symbol}&start_time={start_time}&x-mbx-apikey={API_KEY}"

    response = requests.get(url, headers=headers)
    assert response.ok
    logging.info("My executions %s", response.text)
    return json.loads(response.text)


def my_positions():
    '''All my positions'''
    logging.info("Getting my positions")
    url = f"{BASE_URL}/executions/mypositions"
    nonce = "123456"

    request = f"nonce={nonce}"

    signature = hmac.new(
        bytes(API_SECRET, 'utf-8'),
        msg=bytes(request, 'utf-8'),
        digestmod=hashlib.sha256).hexdigest().upper()
    url = url + f"?nonce={nonce}&signature={signature}&x-mbx-apikey={API_KEY}"

    response = requests.get(url, headers=headers)
    assert response.ok
    logging.info("My positions %s", str(response.text))
    return json.loads(response.text)


def run_test():
    '''Test creating orders and other API functions'''
    # Reset state for testing
    dead_man_switch(timeout=0)
    my_active_orders = my_orders()
    assert len(my_active_orders) == 0

    dead_man_switch()
    symbols = get_symbols()
    for symbol in symbols:
        order = create_order(symbol['symbol'])

    my_active_orders = my_orders()
    logging.info("There are %d active orders and expected %d", len(my_active_orders), len(symbols))

    assert len(my_active_orders) == len(symbols)

    previous_positions = my_positions()

    logging.info("Doing a deposit into DIP")
    config = get_config()
    logging.info("Got config")

    dip.deposit(config)

    # Sleep so the risk manager has time to route
    logging.info("Waiting for router")
    time.sleep(30)

    for order in my_active_orders:
        cancel_order(order['clientOrderId'])

    my_active_orders = my_orders()
    assert len(my_active_orders) == 0

    executions = {}
    for symbol in symbols:
        execution_for_symbol = my_executions(symbol['symbol'])
        executions[symbol['symbol']] = execution_for_symbol

    execution_symbol = None
    num_executions = 0
    for execution in executions.values():
        if execution:
            execution_symbol = execution[0]['symbol']
            num_executions += 1
            logging.info("Execution symbol was %s", symbol['symbol'])

    assert num_executions == 1

    assert execution_symbol is not None

    current_positions = my_positions()

    logging.info("Previous USDC position %f, trade: %f, price: %d", previous_positions["USDC"], dip.SOL_TRADE_SIZE, PRICE)
    assert current_positions["USDC"] == previous_positions["USDC"] - dip.SOL_TRADE_SIZE * PRICE
    if execution_symbol not in previous_positions.keys():
        previous_positions[execution_symbol] = 0.0
    assert current_positions[execution_symbol] == previous_positions[execution_symbol] + dip.SOL_TRADE_SIZE


if __name__ == "__main__":
    logging.basicConfig(
        format='%(asctime)s.%(msecs)03d  %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s',
        datefmt='%m/%d/%Y %I:%M:%S',
        level=logging.INFO)
    run_test()
