// Function to update the input display and required attributes based on the selected source
function updateInputDisplay() {
    var source = document.getElementById('gagsSource').value;
    var tagInput = document.getElementById('tagInput');
    var tagName = document.getElementById('tagName');

    if (source === 'tag') {
        tagInput.style.display = 'block';
        tagName.setAttribute('required', ''); // Make the tag name input required
    } else {
        tagInput.style.display = 'none';
        tagName.removeAttribute('required'); // Remove the required attribute when tag is not selected
    }

    document.getElementById('groupInput').style.display = source === 'group' ? 'block' : 'none';
}

// Function to set the current year in the footer
function setCurrentYear() {
    document.getElementById('year').textContent = new Date().getFullYear();
}

// Function to switch between light and dark mode
function changeTheme() {
    if (document.body.classList.contains('light-mode')) {
        // Switch to dark mode
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        // Update the theme toggle button icon or text if needed
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i> Night';
        // Remember the theme preference in session storage
        sessionStorage.setItem('theme', 'dark-mode');
        // Load the dark mode stylesheet
        loadStylesheet('static/css/theme-dark.css');
        // Change the header image for dark mode
        headerImage.src = 'static/images/gagpasta-light.png';
    } else {
        // Switch to light mode
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        // Update the theme toggle button icon or text if needed
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i> Day';
        // Remember the theme preference in session storage
        sessionStorage.setItem('theme', 'light-mode');
        // Load the light mode stylesheet
        loadStylesheet('static/css/theme-light.css');
        // Change the header image for dark mode
        headerImage.src = 'static/images/gagpasta-dark.png';
    }
}


function goHome() {
        $('#results').fadeOut('fast', function() {
        $("#headerImage").fadeIn('fast');
        $("#mainForm").fadeIn('fast');
        $("#homeButton").fadeOut('fast');
    });

    // Scroll to the top of the page (optional)
    window.scrollTo(0, 0);
}


// Function to load a stylesheet dynamically
function loadStylesheet(filename) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = filename;
    document.getElementsByTagName('head')[0].appendChild(link);
}

// Function to initialize the page
function initialisePage() {
    const hour = new Date().getHours(); // Get the current hour
    const isNightTime = hour < 6 || hour >= 18; // Define night time (you can adjust the hours according to your preference)

    // Check if the user has a theme preference stored in sessionStorage
    const themePreference = sessionStorage.getItem('theme');

    // Set the initial theme based on time of day or user preference (if previously set)
    if (themePreference) {
        if (themePreference === 'dark-mode') {
            enableDarkMode();
        } else {
            enableLightMode();
        }
    } else if (isNightTime) {
        enableDarkMode();
    } else {
        enableLightMode();
    }

    // Set up the initial display state for inputs
    updateInputDisplay();

    // Set the current year in the footer
    setCurrentYear();

    // Attach event listeners
    document.getElementById('gagsSource').addEventListener('change', updateInputDisplay);
}

// Helper function to enable dark mode
function enableDarkMode() {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
    document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i> Night';
    sessionStorage.setItem('theme', 'dark-mode');
    loadStylesheet('static/css/theme-dark.css');
    headerImage.src = 'static/images/gagpasta-light.png'; // Assuming you want to switch the header image
}

// Helper function to enable light mode
function enableLightMode() {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i> Day';
    sessionStorage.setItem('theme', 'light-mode');
    loadStylesheet('static/css/theme-light.css');
    headerImage.src = 'static/images/gagpasta-dark.png'; // Assuming you want to switch the header image
}

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialisePage);

