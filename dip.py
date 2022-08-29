"""Webdriver tests for DUAL DIP deposit"""
import time
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager


def deposit(values, is_windows):
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

    def select_dip():
        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[div[contains(text(), 'Stake')]]")))
        stake = driver.find_element(
            By.XPATH, "//button[div[contains(text(), 'Stake')]]")
        stake.click()

        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//div[@class=\"DualfiInput_input__zgM-S\"]/input")))
        num_tokens = driver.find_element(
            By.XPATH, "//div[@class=\"DualfiInput_input__zgM-S\"]/input")
        time.sleep(.1)
        num_tokens.click()
        num_tokens.send_keys('.000001')

        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//span[@class=\"ant-checkbox\"]")))
        disclaimer = driver.find_element(
            By.XPATH, "//span[@class=\"ant-checkbox\"]")
        disclaimer.click()

        WebDriverWait(driver, 60).until(EC.presence_of_element_located((
            By.XPATH,
            "//div[@class=\"StakingModalStake_stakingForm__WI-Nd\"]/" \
            "button[div[@class=\"DualfiButton_dualfiButtonInner__42gm-\" " \
            "and contains(text(), 'Stake')]]"
        )))
        stake = driver.find_element(
            By.XPATH,
            "//div[@class=\"StakingModalStake_stakingForm__WI-Nd\"]/" \
            "button[div[@class=\"DualfiButton_dualfiButtonInner__42gm-\" " \
            "and contains(text(), 'Stake')]]"
        )
        stake.click()

        original_window = driver.current_window_handle
        WebDriverWait(driver, 60).until(EC.number_of_windows_to_be(2))
        for window_handle in driver.window_handles:
            if window_handle != original_window:
                print('Switching to approval window')
                driver.switch_to.window(window_handle)
                break

        WebDriverWait(driver, 60).until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(),'Approve')]")))
        approve = driver.find_element(
            By.XPATH, "//button[contains(text(),'Approve')]")
        approve.click()
        driver.switch_to.window(main_window)

        # Sleep to see the result
        time.sleep(100)

    print("Bot started")
    if is_windows:
        print("OS : Windows")
    else:
        print("OS : Mac")

    options = Options()

    options.add_extension("Phantom.crx")
    options.add_argument("--disable-gpu")
    options.add_argument("--headless=chrome")

    prefs = {"profile.managed_default_content_settings.images": 2}
    options.add_experimental_option("prefs", prefs)

    driver = webdriver.Chrome(
        executable_path=ChromeDriverManager().install(), options=options)
    print("Assertion - successfully found chrome driver")

    # Go to the web page
    driver.get(values[0])
    driver.maximize_window()

    try:
        # Actions - Initialize wallet
        main_window = init_wallet()
        select_wallet()
        select_dip()
    except TimeoutException as error:
        # TODO: Send an error
        driver.save_screenshot('screenshot.png')
        print(error)
