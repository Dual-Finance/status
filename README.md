# Status
Testing and monitoring for DUAL.

# App
The app directory contains what is pushed to [status.dual.finance](http://status.dual.finance).
The purpose of this app is to be a UI for monitoring positions and services when there are outages or for general monitoring.

# Testing
There are automated webdriver based tests which test both the DIP deposit flow as well as a more end-to-end test with the
API verifying all aspects of the system. These tests currently run once a day via github action against devnet.
