# Omnid Proxy RPC

## Local Setup

1. Make sure you have [Node.js](https://nodejs.org/en/download/) and [Python](https://www.python.org/downloads/) installed. (Optional) Setup [Tor](https://www.torproject.org/) and Rust.

2. Clone the repo,
    ```
    git clone https://github.com/anudit/omnid-rpc-proxy
    ```

3. Install Dependencies,
    ```
    pip install -r requirements.txt
    npm i
    solc-select install all
    ```

4. Setup `.env` file (just like `.env.sample`) with the RPCs in the root of the cloned dir.

5. Compile and run.

    ```
    pnpm build
    pnpm start
    ```

### Using Docker

1. Clone the repo,
    ```
    git clone https://github.com/anudit/omnid-rpc-proxy
    ```

2. Setup `.env` file (just like `.env.sample`) in the root of the cloned dir.

3. Build the image
    ```
    docker build .
    ```
