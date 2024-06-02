const fillFormWithGPT = async () => {
    const form = document.querySelector('form');
    if (!form) {
        console.log('No form found on this page.');
        return;
    }

    const formHtml = form.outerHTML;

    try {
        const response = await fetch('http://localhost:3000/parse-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ formHtml })
        });

        const filledFormData = await response.json();
        console.log(filledFormData);
        console.log('Type of filledFormData:', typeof filledFormData);


        if (typeof filledFormData === 'object') {
            // Apply the filled data to the form
            // Assuming filledFormData is a JSON object mapping input names/ids to values
            for (const [name, value] of Object.entries(filledFormData)) {
                const input = document.querySelector(`[name="${name}"], [id="${name}"]`);
                if (input) {
                    if (input.type === 'file') {
                        console.log(`Uploading file for ${name}`);
                        uploadFile(input, value);
                    } else {
                        console.log(`${name} => ${value}`);
                        input.value = value;
                    }
                } else {
                    console.log(`${name} was not found`);
                }
            }
        } else {
            console.error('Filled form data is not an object:', filledFormData);
        }

        // Scroll to captcha if exists
        const captchaTextarea = document.getElementById('g-recaptcha-response');
        if (captchaTextarea) {
            console.log('Captcha textarea found, scrolling to nearest visible ancestor...');
            const visibleParent = getNearestVisibleAncestor(captchaTextarea);
            if (visibleParent) {
                scrollToElement(visibleParent);
                addArrowToElement(visibleParent);
            }
        } else {
            console.log('Captcha textarea not found');
        }

        // Add event listener to scroll to submit button after captcha click
        captcha.addEventListener('click', () => {
            setTimeout(() => {
                const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
                if (submitButton) {
                    scrollToElement(submitButton);
                }
            }, 2000);
        });
    } catch (error) {
        console.error('Error filling out the form:', error);
    }
};

const uploadFile = (input, fileUrl) => {
    // Fetch the file from the given URL
    fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
            const file = new File([blob], 'resume.pdf', { type: 'application/pdf' });

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;

            console.log(`File ${file.name} uploaded for ${input.name || input.id}`);
        })
        .catch(error => console.error('Error uploading file:', error));
};

const getNearestVisibleAncestor = (element) => {
    let parent = element.parentElement;
    while (parent) {
        const display = window.getComputedStyle(parent).display;
        const width = parent.style.width;
        if (display !== 'none' && !width) {
            return parent;
        }
        parent = parent.parentElement;
    }
    return null;
};

const scrollToElement = (element) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const addArrowToElement = (element) => {
    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.backgroundColor = 'yellow';
    arrow.style.padding = '10px';
    arrow.style.border = '2px solid black';
    arrow.style.borderRadius = '5px';
    arrow.style.fontSize = '16px';
    arrow.style.fontWeight = 'bold';
    arrow.style.cursor = 'pointer';
    arrow.style.top = '0px';
    arrow.style.right = '0px';
    arrow.style.zIndex = '9999'; // Ensure the arrow is on top of other elements
    arrow.innerText = 'Click here';

    // Create arrow pointing to the left
    const arrowShape = document.createElement('div');
    arrowShape.style.width = '0';
    arrowShape.style.height = '0';
    arrowShape.style.borderTop = '10px solid transparent';
    arrowShape.style.borderBottom = '10px solid transparent';
    arrowShape.style.borderRight = '10px solid black';
    arrowShape.style.marginLeft = '10px';

    arrow.appendChild(arrowShape);
    element.style.position = 'relative';
    element.appendChild(arrow);
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request);
    if (request.action === "fillForm") {
        fillFormWithGPT();
    }
});