"""Webdriver tests for DUAL DIP deposit"""
import logging
import time
from selenium import webdriver
from selenium.common.exceptions import TimeoutException, ElementClickInterceptedException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

SOL_TRADE_SIZE = .1
HEADLESS = True

def init_wallet(driver, phrase, password):
    ''' Init wallet'''

    # add wallet to chrome
    logging.info("Initializing wallet")
    time.sleep(1)
    logging.info("Switching to window")
    driver.switch_to.window(driver.window_handles[1])
    try:
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Use Secret Recovery Phrase')]")))
    except TimeoutException:
        driver.switch_to.window(driver.window_handles[0])
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Use Secret Recovery Phrase')]")))

    time.sleep(1)
    logging.info("Clicking on secret recovery phrase")
    driver.find_element(
        By.XPATH, "//button[contains(text(),'Use Secret Recovery Phrase')]").click()
    WebDriverWait(driver, 60).until(EC.presence_of_element_located(
        (By.XPATH, "//textarea[@placeholder='Secret phrase']")))
    logging.info("Typing secret recovery phrase")
    driver.find_element(
        By.XPATH, "//textarea[@placeholder='Secret phrase']").send_keys(phrase)
    logging.info("Clicking submit")
    driver.find_element(
        By.XPATH, "//button[@class='sc-bdfBQB bzlPNH']").click()
    WebDriverWait(driver, 60).until(EC.presence_of_element_located(
        (By.XPATH, "//input[@placeholder='Password']")))
    logging.info("Typing password")
    driver.find_element(
        By.XPATH, "//input[@placeholder='Password']").send_keys(password)
    logging.info("Confirming password")
    driver.find_element(
        By.XPATH, "//input[@placeholder='Confirm Password']").send_keys(password)
    logging.info("Clicking checkbox")
    driver.find_element(
        By.XPATH, "//input[@type='checkbox']").click()
    logging.info("Clicking submit")
    driver.find_element(
        By.XPATH, "//button[@type='submit']").click()
    WebDriverWait(driver, 60).until(EC.presence_of_element_located(
        (By.XPATH, "//button[contains(text(),'Continue')]")))
    continue_ = driver.find_element(
        By.XPATH, "//button[contains(text(),'Continue')]")
    logging.info("Clicking continue")
    driver.execute_script("arguments[0].click();", continue_)
    WebDriverWait(driver, 60).until(EC.presence_of_element_located(
        (By.XPATH, "//button[contains(text(),'Finish')]")))
    logging.info("Clicking finish")
    finish = driver.find_element(
        By.XPATH, "//button[contains(text(),'Finish')]")
    driver.execute_script("arguments[0].click();", finish)
    main_window = driver.window_handles[0]
    logging.info("Switching back to main window")
    driver.switch_to.window(main_window)

    return main_window


def select_wallet(driver, main_window):
    ''' Init wallet'''

    # Sleep for the modal transitions so the elements are clickable
    time.sleep(2)
    logging.info("Selecting wallet")

    # Accept the disclaimer
    WebDriverWait(driver, 60).until(EC.presence_of_element_located(
        (By.XPATH, "//button[contains(text(), 'Accept')]")))
    accept_disclaimer = driver.find_element(
        By.XPATH, "//button[contains(text(), 'Accept')]")
    logging.info("Clicking disclaimer")
    accept_disclaimer.click()

    time.sleep(5)

    # Skip the tutorial
    WebDriverWait(driver, 60).until(EC.presence_of_element_located(
        (By.XPATH, "//button[contains(text(), 'Skip')]")))
    skip = driver.find_element(
        By.XPATH, "//button[contains(text(), 'Skip')]")
    logging.info("Clicking skip tutorial")
    skip.click()

    time.sleep(2)

    # Select Wallet
    WebDriverWait(driver, 60).until(EC.presence_of_element_located(
        (By.XPATH, "//button[span[contains(text(), 'Select Wallet')]]")))
    select_wallet_button = driver.find_element(
        By.XPATH, "//button[span[contains(text(), 'Select Wallet')]]")
    logging.info("Selecting wallet")
    select_wallet_button.click()

    # Choose Phantom
    WebDriverWait(driver, 60).until(EC.presence_of_element_located(
        (By.XPATH, "//button[span[contains(text(), 'Phantom')]]")))
    phantom = driver.find_element(
        By.XPATH, "//button[span[contains(text(), 'Phantom')]]")
    logging.info("Clicking phantom")
    time.sleep(2)
    phantom.click()

    original_window = driver.current_window_handle
    WebDriverWait(driver, 60).until(EC.number_of_windows_to_be(2))
    for window_handle in driver.window_handles:
        if window_handle != original_window:
            logging.info("Switching to window")
            driver.switch_to.window(window_handle)
            break

    WebDriverWait(driver, 60).until(EC.presence_of_element_located(
        (By.XPATH, "//button[contains(text(),'Connect')]")))
    popup_connect = driver.find_element(
        By.XPATH, "//button[contains(text(),'Connect')]")
    logging.info("Clicking connect")
    popup_connect.click()

    time.sleep(1)
    logging.info("Switching back to main window")
    driver.switch_to.window(main_window)


def deposit(values):
    ''' Deposit into a DIP '''
    def select_dip(token="BTC"):
        if token:
            logging.info("Selecting DIP for %s", token)
            WebDriverWait(driver, 60).until(EC.presence_of_element_located(
                (By.XPATH, f"//div[contains(text(), '{token}')]")))
            stake = driver.find_element(
                By.XPATH, f"//div[contains(text(), '{token}')]")
            stake.click()
        logging.info("Clicking Stake")
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[div[contains(text(), 'Stake')]]")))
        # Wait for the wallet to connect
        time.sleep(20)
        stake = driver.find_elements(
            By.XPATH, "//button[div[contains(text(), 'Stake')]]")[-1]
        stake.click()

        logging.info("Waiting for modal load")
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//div/input")))
        num_tokens = driver.find_element(
            By.XPATH, "//div/input")
        logging.info("Waiting")
        time.sleep(1)
        logging.info("Clicking on num tokens")
        num_tokens.click()
        logging.info("Typing num tokens")
        if token == 'BTC':
            num_tokens.send_keys('.000005')
        else:
            num_tokens.send_keys(str(SOL_TRADE_SIZE))

        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//span[@class=\"ant-checkbox\"]")))
        disclaimer = driver.find_element(
            By.XPATH, "//span[@class=\"ant-checkbox\"]")
        logging.info("Clicking checkbox")
        time.sleep(1)
        disclaimer.click()

        WebDriverWait(driver, 60).until(EC.presence_of_element_located((
            By.XPATH, "//div/button/div[contains(text(), 'Stake')]"
        )))
        stake = driver.find_element(
            By.XPATH, "//div/button/div[contains(text(), 'Stake')]"
        )
        logging.info("Clicking stake")
        time.sleep(1)
        stake.click()
        logging.info("Done clicking stake")

        time.sleep(1)
        original_window = driver.current_window_handle
        WebDriverWait(driver, 60).until(EC.number_of_windows_to_be(2))
        for window_handle in driver.window_handles:
            if window_handle != original_window:
                logging.info('Switching to approval window')
                driver.switch_to.window(window_handle)
                break

        time.sleep(1)
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Approve')]")))
        approve = driver.find_element(
            By.XPATH, "//button[contains(text(),'Approve')]")
        logging.info("Clicking approve")
        approve.click()
        time.sleep(1)
        driver.switch_to.window(main_window)
        time.sleep(1)

        # Wait for the success toast
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//span[contains(text(),'Success')]")))
        logging.info("Got the success toast")


    options = Options()
    options.add_extension("Phantom.crx")
    options.add_argument("--disable-gpu")
    if HEADLESS:
        options.add_argument("--headless=chrome")

    prefs = {"profile.managed_default_content_settings.images": 2}
    options.add_experimental_option("prefs", prefs)

    driver = webdriver.Chrome(
        executable_path=ChromeDriverManager().install(), options=options)
    logging.info("Successfully found chrome driver")

    driver.get(values[0])
    driver.maximize_window()

    try:
        logging.info('Initializing wallet')
        main_window = init_wallet(driver, values[1], values[2])
        logging.info('Selecting wallet')
        select_wallet(driver, main_window)

        logging.info('Selecting DIP')
        token = values[3] if len(values) >= 4 else None
        select_dip(token)
        time.sleep(100)
        driver.close()
    except (TimeoutException, ElementClickInterceptedException) as error:
        logging.info('Error. Saving screenshot')

        driver.save_screenshot('screenshot.png')
        with open("failure.html", "w", encoding="utf-8") as source_file:
            source_file.write(driver.page_source)
        print(repr(error))
        # raise error


def withdraw(values):
    ''' Withdraw from the first vault '''
    def do_withdraw():
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[div[contains(text(), 'WITHDRAW')]]")))
        withdraw_button = driver.find_element(
            By.XPATH, "//button[div[contains(text(), 'WITHDRAW')]]")
        logging.info("Clicking Withdraw")
        withdraw_button.click()

        time.sleep(1)
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[div[contains(text(), 'Withdraw')]]")))
        withdraw_modal_button = driver.find_element(
            By.XPATH, "//button[div[contains(text(), 'Withdraw')]]")
        logging.info("Clicking Withdraw modal")
        withdraw_modal_button.click()

        original_window = driver.current_window_handle
        WebDriverWait(driver, 60).until(EC.number_of_windows_to_be(2))
        for window_handle in driver.window_handles:
            if window_handle != original_window:
                logging.info('Switching to approval window')
                driver.switch_to.window(window_handle)
                break

        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Approve')]")))
        approve = driver.find_element(
            By.XPATH, "//button[contains(text(),'Approve')]")
        logging.info("Clicking approve")
        approve.click()

        driver.switch_to.window(main_window)

        # Wait for the success toast
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//span[contains(text(),'Success')]")))
        logging.info("Got the success toast")

    options = Options()
    options.add_extension("Phantom.crx")
    options.add_argument("--disable-gpu")
    if HEADLESS:
        options.add_argument("--headless=chrome")

    prefs = {"profile.managed_default_content_settings.images": 2}
    options.add_experimental_option("prefs", prefs)

    driver = webdriver.Chrome(
        executable_path=ChromeDriverManager().install(), options=options)
    logging.info("Successfully found chrome driver")

    driver.get(values[0])
    driver.maximize_window()

    try:
        logging.info('Initializing wallet')
        main_window = init_wallet(driver, values[1], values[2])
        logging.info('Selecting wallet')
        select_wallet(driver, main_window)

        driver.get(values[0] + '/balance')
        logging.info('Doing withdraw')
        do_withdraw()

        driver.close()
    except (TimeoutException, ElementClickInterceptedException) as error:
        logging.info('Error. Saving screenshot')
        driver.save_screenshot('screenshot.png')

        with open("failure.html", "w", encoding="utf-8") as source_file:
            source_file.write(driver.page_source)

        print(repr(error))
        # raise error
