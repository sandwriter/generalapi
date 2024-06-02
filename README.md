# General API Chrome Extension and Server
🚧 **This project is under construction and contributions are welcomed!** 🚧

**The long-term vision is to interact with any HTML form, and make HTML an API, thus the name, generalapi.**

This project consists of a Chrome extension and a Node.js server to automate form filling on job application pages, including interacting with reCAPTCHA.

## Chrome Extension

### Features

- Parses job application forms
- Fills out text inputs, checkboxes, and uploads resumes
- Scrolls to reCAPTCHA for manual interaction
- Adds a visual indicator to the reCAPTCHA element

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/sandwriter/generalapi.git
    cd generalapi
    ```

2. Navigate to the `extension` directory:

    ```sh
    cd extension
    ```

3. Load the extension in Chrome:

    1. Open Chrome and navigate to `chrome://extensions/`.
    2. Enable "Developer mode" using the toggle in the top-right corner.
    3. Click the "Load unpacked" button and select the `extension` directory.

### Usage

1. Click the extension icon in the Chrome toolbar.
2. Click the "Fill Form" button to automatically fill out the form on the current tab.

## Server

### Features

- Parses HTML forms using GPT-3.5
- Provides an endpoint to handle form parsing and filling requests

### Prerequisites

- Node.js
- npm (Node Package Manager)

### Installation

1. Navigate to the `server` directory:

    ```sh
    cd server
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file in the `server` directory and add your environment variables:

    ```sh
    touch .env
    ```

    Example `.env` file:

    ```env
    OPENAI_API_KEY=your_openai_api_key
    LOGGLY_TOKEN=your_loggly_token
    LOGGLY_SUBDOMAIN=your_loggly_subdomain
    ```

### Usage

1. Start the server:

    ```sh
    npm start
    ```

2. The server will run on `http://localhost:3000`.

### Endpoints

- `POST /parse-form`: Parses an HTML form and returns the filled form data.

    **Request Body**:

    ```json
    {
      "formHtml": "<form>...</form>"
    }
    ```

    **Response**:

    ```json
    {
      "filledFormData": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "phone_number": "123-456-7890"
      }
    }
    ```

### Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



