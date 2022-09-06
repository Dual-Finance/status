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


def deposit(values):
    ''' Deposit into a DIP '''

    def init_wallet():
        ''' Init wallet'''

        # add wallet to chrome
        time.sleep(1)
        driver.switch_to.window(driver.window_handles[1])
        try:
            WebDriverWait(driver, 60).until(EC.presence_of_element_located(
                (By.XPATH, "//button[contains(text(),'Use Secret Recovery Phrase')]")))
        except TimeoutException:
            driver.switch_to.window(driver.window_handles[0])
            WebDriverWait(driver, 60).until(EC.presence_of_element_located(
                (By.XPATH, "//button[contains(text(),'Use Secret Recovery Phrase')]")))

        time.sleep(1)
        driver.find_element(
            By.XPATH, "//button[contains(text(),'Use Secret Recovery Phrase')]").click()
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//textarea[@placeholder='Secret phrase']")))
        driver.find_element(
            By.XPATH, "//textarea[@placeholder='Secret phrase']").send_keys(values[1])
        driver.find_element(
            By.XPATH, "//button[@class='sc-bdfBQB bzlPNH']").click()
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//input[@placeholder='Password']")))
        driver.find_element(
            By.XPATH, "//input[@placeholder='Password']").send_keys(values[2])
        driver.find_element(
            By.XPATH, "//input[@placeholder='Confirm Password']").send_keys(values[2])
        driver.find_element(
            By.XPATH, "//input[@type='checkbox']").click()
        driver.find_element(
            By.XPATH, "//button[@type='submit']").click()
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Continue')]")))
        continue_ = driver.find_element(
            By.XPATH, "//button[contains(text(),'Continue')]")
        driver.execute_script("arguments[0].click();", continue_)
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Finish')]")))
        finish = driver.find_element(
            By.XPATH, "//button[contains(text(),'Finish')]")
        driver.execute_script("arguments[0].click();", finish)
        main_window = driver.window_handles[0]
        driver.switch_to.window(main_window)

        return main_window

    def select_wallet():
        ''' Init wallet'''

        # Sleep for the modal transitions so the elements are clickable
        time.sleep(2)

        # Accept the disclaimer
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(), 'Accept')]")))
        accept_disclaimer = driver.find_element(
            By.XPATH, "//button[contains(text(), 'Accept')]")
        accept_disclaimer.click()

        time.sleep(2)

        # Skip the tutorial
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(), 'Skip')]")))
        skip = driver.find_element(
            By.XPATH, "//button[contains(text(), 'Skip')]")
        skip.click()

        # Select Wallet
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[span[contains(text(), 'Select Wallet')]]")))
        select_wallet_button = driver.find_element(
            By.XPATH, "//button[span[contains(text(), 'Select Wallet')]]")
        select_wallet_button.click()

        # Choose Phantom
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[span[contains(text(), 'Phantom')]]")))
        phantom = driver.find_element(
            By.XPATH, "//button[span[contains(text(), 'Phantom')]]")
        phantom.click()

        original_window = driver.current_window_handle
        WebDriverWait(driver, 60).until(EC.number_of_windows_to_be(2))
        for window_handle in driver.window_handles:
            if window_handle != original_window:
                driver.switch_to.window(window_handle)
                break

        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Connect')]")))
        popup_connect = driver.find_element(
            By.XPATH, "//button[contains(text(),'Connect')]")
        popup_connect.click()
        driver.switch_to.window(main_window)

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
        stake = driver.find_element(
            By.XPATH, "//button[div[contains(text(), 'Stake')]]")
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
        num_tokens.send_keys('.000001')

        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//span[@class=\"ant-checkbox\"]")))
        disclaimer = driver.find_element(
            By.XPATH, "//span[@class=\"ant-checkbox\"]")
        logging.info("Clicking checkbox")
        disclaimer.click()

        WebDriverWait(driver, 60).until(EC.presence_of_element_located((
            By.XPATH, "//div/button/div[contains(text(), 'Stake')]"
        )))
        stake = driver.find_element(
            By.XPATH, "//div/button/div[contains(text(), 'Stake')]"
        )
        logging.info("Clicking stake")
        stake.click()

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

        # Sleep to see the result
        time.sleep(100)

    options = Options()

    options.add_extension("Phantom.crx")
    options.add_argument("--disable-gpu")
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
        main_window = init_wallet()
        logging.info('Selecting wallet')
        select_wallet()

        logging.info('Selecting DIP')
        token = values[3] if len(values) >= 4 else None
        select_dip(token)
    except TimeoutException as error:
        logging.info('Error. Saving screenshot')
        # TODO: also save the html
        driver.save_screenshot('screenshot.png')
        print(error)
        # raise error
    except ElementClickInterceptedException as error:
        logging.info('Error. Saving screenshot')
        # TODO: also save the html
        driver.save_screenshot('screenshot.png')
        print(error)
        # raise error
